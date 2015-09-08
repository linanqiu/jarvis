Template.Register.rendered = function () {

};

Template.Register.events({

});

Template.Register.helpers({

});

Template.RegisterRegisterJumbotron.rendered = function () {

};

Template.RegisterRegisterJumbotron.events({
	'submit .form-uni': function (event) {
		event.preventDefault();
		var uni = event.target.uniTextInput.value;
		Meteor.call('checkUniExists', uni, function (err, uniVerified) {
			if (err) {
				Session.set('registrationErrorReason', err.reason);
			} else {
				if (uniVerified) {
					Session.set('registrationErrorReason', null);
					Session.set('uniVerified', uniVerified);
					Session.setPersistent('uni', uni);

					Meteor.call('addState', Session.get('state'), uni);
				}
			}
		});
	},
	'change #scoreboard-optin': function (event) {
		Meteor.call('changeScoreboardOptIn', Session.get('state'), event.target.checked);
	}
});

Template.RegisterRegisterJumbotron.helpers({
	uniVerified: function () {
		return Session.get('uniVerified');
	},
	clientId: function () {
		return Session.get('clientId');
	},
	state: function () {
		return Session.get('state');
	},
	registrationErrorReason: function () {
		return Session.get('registrationErrorReason');
	}
});
