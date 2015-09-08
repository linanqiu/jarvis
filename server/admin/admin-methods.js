Houston.methods('enrolledStudents', {
  'addEnrolledStudent': function () {
    var fileUrl = Meteor.settings.enrolledStudentsCsv;
    console.log(fileUrl);
    var file = Meteor.http.get(fileUrl);
    var csvParse = Meteor.wrapAsync(CSVParse);
    var output = csvParse(file.content, {
      columns: true
    });

    output.forEach(function (student) {
      EnrolledStudents.upsert({
        uni: student.uni
      }, {
        $set: {
          firstname: student.firstname,
          lastname: student.lastname
        }
      });
    });

    return output.length + ' students upserted';
  }
});
