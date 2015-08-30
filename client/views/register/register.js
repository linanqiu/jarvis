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
				console.error(err);
			}
			if (uniVerified) {
				Session.set('isNotRegistered', false);
				Session.set('uniVerified', uniVerified);
				Session.setPersistent('uni', uni);

				Meteor.call('addState', Session.get('state'), uni);
			} else {
				Session.set('isNotRegistered', true);
			}
		});
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
	isNotRegistered: function () {
		return Session.get('isNotRegistered');
	}
});
