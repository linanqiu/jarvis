composeWebhookGrades = function (data) {
  var text = "I just finished grading* your " + data.homeworkName + "\n\n";

  var grades = data.grades;

  text += "Report:\n"
  text += grades.homeworkName + "\n";
  text += "Score: " + grades.studentScore + "/" + grades.studentMax + "\n\n";
  text += "-----\n";
  text += "Sections:\n"
  for (var i = 0; i < grades.sections.length; i++) {
    text += "Section " + i + "\n";

    var section = grades.sections[i];

    text += "Description: " + section.sectionName + "\n";
    text += "Section Score: " + section.sectionScoreStudent + "/" + section.sectionScoreMax + "\n";
    text += "Section Error Message (if any): " + section.sectionErrorMessage + "\n\n";
  }

  text += "Sections that didn't complete running in time will not be displayed here. You probably didn't use the right algorithms for those.\n";

  text += "-----\n\n";

  if (grades.studentScore == grades.studentMax) {
    text += "Bravo!\n\n";
  } else {
    text += "Don't give up! Keep trying!\n\n";
  }

  text += "Always yours,\nJarvis\n\n";

  text += "*I only graded your program based on your outputs. The (human) TAs will also grade your code algorithm, style etc. and those are weighted pretty heavily, so do make sure you did those right! Accuracy of results only count for a portion of the final homework grade. Furthermore, this score may not be your final output score depending on your algorithm scores.\n\n";

  return text;
}

composeWebhookGradesFail = function (data) {
  var text = "I just finished grading your " + data.homeworkName + "\n\n";

  var grades = data.grades;

  text += "Report:\n"
  text += grades.homeworkName + "\n";
  text += "BUILD FAILED\n"
  text += "Error Message: " + grades.errorMessage + "\n\n";

  text += "Your program did not build correctly. Make sure your directory structure is correct and that your code actually compiles! Non-compiling code will get a huge discount on grades :(\n\n";

  text += "If you think this is an error with me, contact the Head TA Linan Qiu <lq2137@columbia.edu>\n\n";

  text += "Always yours,\nJarvis";

  return text;
}

composeRegisterSuccess = function (student) {
  var text = "Hello " + student.firstname + " a.k.a " + student.nickname + ",\n\nYou're successfully registered for Jarvis!\n\n";
  text += "You signed up using your github username: " + student.githubUsername + "\n";
  text += "If that is an error, please contact the Head TA Linan <lq2137@columbia.edu> immediately.\n\n";
  if (student.scoreboardOptIn) {
    text += "Thanks for opting in to scoreboard! We're sure it's gonna be fun for you.\n";
    text += "Your nickname is\n\n" + student.nickname + "\n\n";
    text += "You should see your entry appear on http://jarvis.xyz/scoreboard\n\n";
    text += "We love your current nickname. However, if you want to change your nickname, contact the Linan with your suggestion ;)\n\n";
  } else {
    text += "You didn't opt into scoreboard! :(\n";
    text += "However, if you want to opt in, just send the Linan an email! We'll add you in right away.\n";
    text += "Psst. We have a pretty cool nickname reserved for you: " + student.nickname + "\n";
    text += "We love your current nickname. However, if you want to change your nickname, contact the Linan with your suggestion ;)\n";
    text += "To show off that, however, you'd need to opt in to the scoreboard.\n\n";
  }

  text += "If any of this information is incorrect or you ran into some bumps during registration / setup, do contact Linan (not this email. :p Jarvis is a little dumb and can't read emails right now.)\n\n";
  text += "I do look forward to reading your homeworks though!\n\n";
  text += "Always yours,\nJarvis";

  return text;
}
