Meteor.methods({
  'getClientId': function () {
    return Meteor.settings.public.clientId;
  },
  'getState': function () {
    var crypto = Meteor.npmRequire('crypto');
    var buf = crypto.randomBytes(48);
    return buf.toString('hex');
  },
  'addState': function (state, uni) {
    States.insert({
      state: state,
      uni: uni,
      createdAt: new Date()
    });
  },
  'checkUniExists': function (uni) {
    console.log('Checking uni');
    var student = EnrolledStudents.findOne({
      uni: uni
    });
    return (typeof student !== 'undefined');
  },
  'requestAccessToken': function (state, code) {
    return requestAccessToken(state, code);
  },
  'receiveWebhook': function (body) {
    console.log('Method called');
    extractGrades(body);
  }
});

function requestAccessToken(state, code) {
  // get accessToken for student
  var secretData = {
    client_id: Meteor.settings.public.clientId,
    client_secret: Meteor.settings.clientSecret,
    code: code
  };

  console.log('Getting access token');

  var accessTokenResult = Meteor.http.post('https://github.com/login/oauth/access_token', {
    data: secretData,
    headers: {
      'Accept': 'application/json'
    }
  });

  console.log('Finding valid states');

  var foundState = States.findOne({
    state: state
  });

  if (foundState === 'undefined') {
    throw new Meteor.Error(500, 'Invalid state.');
  }

  var accessToken = accessTokenResult.data.access_token;

  console.log('Getting github data');

  var githubData = Meteor.http.get('https://api.github.com/user', {
    params: {
      access_token: accessToken
    },
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'cs3134 jarvis'
    }
  });

  var login = githubData.data.login;

  console.log('Getting our data');

  var ourData = EnrolledStudents.findOne({
    uni: foundState.uni
  });

  console.log('Creating student in db');

  // create student object in mongo
  var student = Students.upsert({
    uni: foundState.uni
  }, {
    $set: {
      firstname: ourData.firstname,
      lastname: ourData.lastname,
      githubUsername: login,
      accessToken: accessToken,
      homeworks: {},
      nickname: randomPokemon()
    }
  });

  return createTeams(Students.findOne({
    uni: foundState.uni
  }));
}

function createTeams(student) {
  var GitHub = new Meteor.npmRequire('github');
  var github = new GitHub({
    version: '3.0.0'
  });

  console.log('Authenticating using user token');
  // authenticate using the admin's own GitHub token
  github.authenticate({
    type: 'oauth',
    token: Meteor.settings.token
  });

  console.log('Adding to students team');
  // add to all students team
  var addTeamMembership = Meteor.wrapAsync(github.orgs.addTeamMembership);

  addTeamMembership({
    id: '1704354',
    user: student.githubUsername
  });

  console.log('Creating student own team');
  // create student's own team
  var createTeam = Meteor.wrapAsync(github.orgs.createTeam);

  var createTeamResp = createTeam({
    org: 'cs3134',
    name: 'student-' + student.uni,
    permission: 'push'
  });

  console.log('Recording team id');
  // record team id in db
  var teamId = createTeamResp.id;

  Students.update({
    uni: student.uni
  }, {
    $set: {
      teamId: teamId
    }
  });

  console.log('Adding to student own team');
  // add student to his own team
  addTeamMembership({
    id: teamId,
    user: student.githubUsername
  });

  console.log('Create homework repo');
  // create homework submission repo for student where only his team has access (plus admins)
  var createFromOrg = Meteor.wrapAsync(github.repos.createFromOrg);

  createFromOrg({
    org: 'cs3134',
    name: 'homework-' + student.uni,
    description: 'Homework solutions for ' + student.uni,
    private: true,
    has_issues: true,
    team_id: teamId,
    auto_init: true
  });

  return addCiBuild(student);
}

function addCiBuild(student) {
  var ciEndpoint = 'https://circleci.com/api/v1/';

  var project = 'homework-' + student.uni;

  console.log('Add build to CI');
  // add build to CircleCI
  var buildUrl = ciEndpoint + 'project/' + 'cs3134' + '/' + project + '/tree/master?circle-token=' + Meteor.settings.ciToken;

  var buildData = Meteor.http.post(buildUrl, {
    headers: {
      'Accept': 'application/json'
    }
  });

  console.log('Enabling project');
  // enable project by making CircleCI add deploy key to repo
  var enableUrl = ciEndpoint + 'project/' + 'cs3134' + '/' + project + '/enable?circle-token=' + Meteor.settings.ciToken;

  var enableData = Meteor.http.post(enableUrl, {
    headers: {
      'Accept': 'application/json'
    }
  });

  console.log('Following project');
  // makes the admin follow the project
  var followUrl = ciEndpoint + 'project/' + 'cs3134' + '/' + project + '/follow?circle-token=' + Meteor.settings.ciToken;

  var followData = Meteor.http.post(followUrl, {
    headers: {
      'Accept-Encoding': 'identity'
    }
  });

  console.log('Sending email');
  // sends success email
  sendEmail('registerSuccess', student.uni + '@columbia.edu');

  return true;
}

function extractGrades(body) {
  console.log('Extracting grades');

  console.log(JSON.stringify(body, null, 2));

  var steps = body.payload.steps;
  var githubUsername = body.payload.user.login;

  steps.forEach(function (step) {
    if (step.name === 'sh grade.sh') {
      console.log('Found grade.sh');
      var outputUrl = step.actions[0].output_url;

      console.log(outputUrl);

      var outputZip = Meteor.http.get(outputUrl, {
        responseType: 'buffer'
      });
      console.log(outputZip.content);

      var zlib = Meteor.npmRequire('zlib');
      var buffer = new Buffer(outputZip.content, 'base64');

      console.log('Unzipping output');

      var zlibUnzip = Meteor.wrapAsync(zlib.unzip);
      var outputUnzip = zlibUnzip(buffer);

      var output = JSON.parse(outputUnzip.toString());

      var grades = JSON.parse(output[0].message);

      console.log(grades);

      addHomeworkGrades(grades, githubUsername);
    }
  });
}

function addHomeworkGrades(grades, githubUsername) {
  var homeworkName = grades.homeworkName;

  var student = Students.findOne({
    githubUsername: githubUsername
  });

  var currentHomeworks = student.homeworks;

  currentHomeworks[homeworkName] = grades;

  Students.update({
    githubUsername: githubUsername
  }, {
    $set: {
      homeworks: currentHomeworks
    }
  });

  sendEmail('webhookGrades', student.uni + '@columbia.edu', {
    homeworkName: homeworkName,
    grades: grades
  });
}

function sendEmail(templateToUse, toEmail, data) {
  if (templateToUse === 'registerSuccess') {
    Email.send({
      from: 'Jarvis',
      to: toEmail,
      subject: 'Jarvis Registration Completed',
      text: 'You\'re successfully registered for the class!'
    });
  }

  if (templateToUse === 'webhookGrades') {
    Email.send({
      from: 'Jarvis',
      to: toEmail,
      subject: data.homeworkName + ' Preliminary Grades',
      text: JSON.stringify(data.grades, null, 2)
    });
  }
}
