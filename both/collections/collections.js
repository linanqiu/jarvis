Students = new Meteor.Collection('students');
EnrolledStudents = new Mongo.Collection('enrolledStudents');
States = new Mongo.Collection('states');
CurrentHomework = new Mongo.Collection('currentHomework');

// Schemas = {};

// Schemas.Section = new SimpleSchema({
//   sectionName: {
//     type: String
//   },
//   sectionScoreMax: {
//     type: Number
//   },
//   sectionScoreStudent: {
//     type: Number
//   },
//   sectionErrorMessage: {
//     type: String
//   }
// });

// Schemas.Homework = new SimpleSchema({
//   homeworkName: {
//     type: String
//   },
//   studentScore: {
//     type: Number
//   },
//   errorMessage: {
//     type: String
//   },
//   className: {
//     type: String
//   },
//   studentMax: {
//     type: Number
//   },
//   sections: {
//     type: [Schemas.Section]
//   }
// });

// Schemas.Homeworks = new SimpleSchema({
//   hw1: {
//     type: Schemas.Homework,
//     optional: true
//   },
//   hw2: {
//     type: Schemas.Homework,
//     optional: true
//   },
//   hw3: {
//     type: Schemas.Homework,
//     optional: true
//   },
//   hw4: {
//     type: Schemas.Homework,
//     optional: true
//   },
//   hw5: {
//     type: Schemas.Homework,
//     optional: true
//   },
//   hw6: {
//     type: Schemas.Homework,
//     optional: true
//   },
// })

// Schemas.Students = new SimpleSchema({
//   uni: {
//     type: String,
//     label: 'UNI'
//   },
//   firstname: {
//     type: String,
//     label: 'First Name'
//   },
//   lastname: {
//     type: String
//   },
//   githubUsername: {
//     type: String
//   },
//   accessToken: {
//     type: String,
//     optional: true
//   },
//   createdAt: {
//     type: Date,
//     label: 'Date',
//     autoValue: function () {
//       if (this.isInsert) {
//         return new Date();
//       }
//     }
//   },
//   nickname: {
//     type: String
//   },
//   email: {
//     type: String
//   },
//   teamId: {
//     type: Number
//   },
//   homeworks: {
//     type: Schemas.Homeworks,
//     optional: true
//   }
// });

// Students.attachSchema(Schemas.Students);

// Schemas.EnrolledStudents = new SimpleSchema({
//   uni: {
//     type: String
//   },
//   firstname: {
//     type: String
//   },
//   lastname: {
//     type: String
//   }
// });

// EnrolledStudents.attachSchema(Schemas.EnrolledStudents);

// Schemas.CurrentHomework = new SimpleSchema({
//   currentHomework: {
//     type: String
//   }
// });

// CurrentHomework.attachSchema(Schemas.CurrentHomework);
