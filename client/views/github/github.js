Template.Github.rendered = function () {

};

Template.Github.events({

});

Template.Github.helpers({
  signupProgress: function () {
    var student = Students.findOne({
      state: Session.get('state')
    });
    if (typeof student !== 'undefined') {
      return student.signupProgress;
    }
  }
});
