Template.Scoreboard.rendered = function () {

};

Template.Scoreboard.events({

});

Template.Scoreboard.helpers({
  scores: function () {
    var students = Students.find({
      scoreboardOptIn: true
    }, {
      sort: {
        nickname: 1
      }
    }).fetch();
    return students;
  }
});
