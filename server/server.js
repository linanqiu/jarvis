process.env.MAIL_URL = Meteor.settings.emailUrl;

Meteor.startup(function () {
  // read environment variables from Meteor.settings
  if (Meteor.settings && Meteor.settings.env && _.isObject(Meteor.settings.env)) {
    for (var variableName in Meteor.settings.env) {
      process.env[variableName] = Meteor.settings.env[variableName];
    }
  }

  if (CurrentHomework.find().count() === 0) {
    CurrentHomework.insert({
      currentHomework: "hw1"
    });
    Houston.add_collection(CurrentHomework);
  }

  if (EnrolledStudents.find().count() === 0) {
    EnrolledStudents.insert({
      uni: "lq2137",
      firstname: "Linan",
      lastname: "Qiu"
    });
    Houston.add_collection(EnrolledStudents);
  }

  if (Students.find().count() === 0) {
    Houston.add_collection(Students);
  }

  if (States.find().count() === 0) {
    Houston.add_collection(States);
  }

  Houston.add_collection(Meteor.users);
  Houston.add_collection(Houston._admins);
});
