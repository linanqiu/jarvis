Meteor.publish('states', function () {
  return States.find();
});

Meteor.publish('students', function () {
  return Students.find({}, {
    fields: {
      nickname: 1,
      homeworks: 1
    }
  });
});
