Template.Scoreboard.rendered = function () {

};

Template.Scoreboard.events({

});

Template.Scoreboard.helpers({
  scores: function () {
    var students = Students.find({
      scoreboardOptIn: true
    }).fetch();
    return students;
  }
});
