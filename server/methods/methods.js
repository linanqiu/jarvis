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
      scoreboardOptIn: true,
      createdAt: new Date()
    });
  },
  'changeScoreboardOptIn': function (state, scoreboardOptIn) {
    States.update({
      state: state
    }, {
      $set: {
        scoreboardOptIn: scoreboardOptIn
      }
    });
  },
  'checkUniExists': function (uni) {
    console.log('Checking uni');
    var enrolledStudent = EnrolledStudents.findOne({
      uni: uni
    });

    var enrolled = typeof enrolledStudent !== 'undefined';

    var student = Students.findOne({
      uni: uni
    });

    var registered = typeof student !== 'undefined';

    if (enrolled) {
      if (registered) {
        throw new Meteor.Error(500, 'Already registered');
      } else {
        return true;
      }
    } else {
      throw new Meteor.Error(500, 'Not enrolled');
    }
  },
  'requestAccessToken': function (state, code) {
    this.unblock();
    return requestAccessToken(state, code);
  },
  'receiveWebhook': function (body) {
    console.log('Method called');
    this.unblock();
    extractGrades(body);
  },
  'signupProgress': function (state) {
    var student = Students.findOne({
      state: state
    });
    if (typeof student !== 'undefined') {
      return student.signupProgress;
    }
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
      nickname: randomName(),
      email: foundState.uni + '@columbia.edu',
      signupProgress: '1. Student created',
      scoreboardOptIn: States.findOne({
        state: state
      }).scoreboardOptIn,
      state: state
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

  console.log('Authenticating using admin token');
  // authenticate using the admin's own GitHub token
  github.authenticate({
    type: 'oauth',
    token: Meteor.settings.token
  });
  updateProgress(student, '2. Authenticated using admin token');

  console.log('Adding to students team');
  // add to all students team
  var addTeamMembership = Meteor.wrapAsync(github.orgs.addTeamMembership);

  addTeamMembership({
    id: '1704354',
    user: student.githubUsername
  });
  updateProgress(student, '3. Added to students team');

  console.log('Creating student own team');
  // create student's own team
  var createTeam = Meteor.wrapAsync(github.orgs.createTeam);

  var createTeamResp = createTeam({
    org: 'cs3134',
    name: 'student-' + student.uni,
    permission: 'push'
  });
  updateProgress(student, '4. Created student own team');

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
  updateProgress(student, '5. Recorded team id');

  console.log('Adding to student own team');
  // add student to his own team
  addTeamMembership({
    id: teamId,
    user: student.githubUsername
  });
  updateProgress(student, '6. Added to student own team');

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
  updateProgress(student, '7. Created homework repo');

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
  updateProgress(student, '8. Added build to CI');

  console.log('Enabling project');
  // enable project by making CircleCI add deploy key to repo
  var enableUrl = ciEndpoint + 'project/' + 'cs3134' + '/' + project + '/enable?circle-token=' + Meteor.settings.ciToken;

  var enableData = Meteor.http.post(enableUrl, {
    headers: {
      'Accept': 'application/json'
    }
  });
  updateProgress(student, '9. Enabled project');

  console.log('Following project');
  // makes the admin follow the project
  var followUrl = ciEndpoint + 'project/' + 'cs3134' + '/' + project + '/follow?circle-token=' + Meteor.settings.ciToken;

  var followData = Meteor.http.post(followUrl, {
    headers: {
      'Accept-Encoding': 'identity'
    }
  });
  updateProgress(student, '10. Followed project');

  console.log('Sending email');
  // sends success email
  sendEmail('registerSuccess', student.email, {
    student: student
  });
  updateProgress(student, '11. Sent email');

  return true;
}

function extractGrades(body) {
  console.log('Extracting grades');

  var steps = body.payload.steps;
  var reponame = body.payload.reponame;
  var repouni = reponame.replace('homework-', '');
  var uni = repouni;

  steps.forEach(function (step) {
    if (step.name === 'sh grade.sh') {
      console.log('Found grade.sh');
      var outputUrl = step.actions[0].output_url;

      var outputZip = Meteor.http.get(outputUrl, {
        responseType: 'buffer'
      });
      var zlib = Meteor.npmRequire('zlib');
      var buffer = new Buffer(outputZip.content, 'base64');

      console.log('Unzipping output');
      var zlibUnzip = Meteor.wrapAsync(zlib.unzip);
      var outputUnzip = zlibUnzip(buffer);

      var output = JSON.parse(outputUnzip.toString());

      if (step.actions[0].failed) {
        console.log('Build script failed');
        console.log(output);
        var errorMessage = output[0].message;
        // workaround for lack of homework grade information
        var homeworkName = CurrentHomework.findOne().currentHomework;

        var grades = {
          homeworkName: homeworkName,
          studentScore: 0,
          errorMessage: errorMessage,
          className: 'cs3134'
        }

        addHomeworkGrades(grades, uni, true);
      } else {
        var grades = JSON.parse(output[0].message);

        addHomeworkGrades(grades, uni);
      }
    }
  });
}

function addHomeworkGrades(grades, uni, errorMessage) {
  var homeworkName = grades.homeworkName;

  var student = Students.findOne({
    uni: uni
  });

  var currentHomeworks = student.homeworks;

  currentHomeworks[homeworkName] = grades;

  Students.update({
    uni: uni
  }, {
    $set: {
      homeworks: currentHomeworks
    }
  });

  if (errorMessage) {
    sendEmail('webhookGradesFail', student.email, {
      homeworkName: homeworkName,
      grades: grades
    });
  } else {
    sendEmail('webhookGrades', student.email, {
      homeworkName: homeworkName,
      grades: grades
    });
  }
}

function sendEmail(templateToUse, toEmail, data) {
  Meteor.defer(function () {
    if (templateToUse === 'registerSuccess') {
      console.log('Sending registerSuccess email');
      Email.send({
        from: 'Jarvis',
        to: toEmail,
        subject: 'Jarvis Registration Completed',
        text: composeRegisterSuccess(data.student)
      });
    }

    if (templateToUse === 'webhookGrades') {
      console.log('Sending webhookGrades email');
      Email.send({
        from: 'Jarvis',
        to: toEmail,
        subject: data.homeworkName + ' Preliminary Grades',
        text: composeWebhookGrades(data)
      });
    }

    if (templateToUse === 'webhookGradesFail') {
      console.log('Sending webhookGradesFail email');
      Email.send({
        from: 'Jarvis',
        to: toEmail,
        subject: data.homeworkName + ' Build Failed',
        text: composeWebhookGradesFail(data)
      });
    }
  });
}

function updateProgress(student, progressMessage) {
  Students.update({
    _id: student._id
  }, {
    $set: {
      signupProgress: progressMessage
    }
  });
}
