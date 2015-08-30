process.env.MAIL_URL = Meteor.settings.emailUrl;

Meteor.startup(function () {
	// read environment variables from Meteor.settings
	if (Meteor.settings && Meteor.settings.env && _.isObject(Meteor.settings.env)) {
		for (var variableName in Meteor.settings.env) {
			process.env[variableName] = Meteor.settings.env[variableName];
		}
	}
});
