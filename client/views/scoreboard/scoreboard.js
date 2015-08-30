Template.Scoreboard.rendered = function () {

};

Template.Scoreboard.events({

});

Template.Scoreboard.helpers({
  scores: function () {
    var students = Students.find({}).fetch();
    return students;
  }
});
