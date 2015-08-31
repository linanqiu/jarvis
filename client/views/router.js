Router.configure({
	templateNameConverter: "upperCamelCase",
	routeControllerNameConverter: "upperCamelCase",
	layoutTemplate: "layout",
	notFoundTemplate: "notFound",
	loadingTemplate: "loading"
});

var freeRoutes = [
	"register",
	"scoreboard",
	"home"
];

Router.onBeforeAction(function () {
	// loading indicator here
	if (!this.ready()) {
		$("body").addClass("wait");
	} else {
		$("body").removeClass("wait");
		this.next();
	}
});

Router.map(function () {
	this.route("register", {
		path: "/register",
		controller: "RegisterController"
	});
	this.route("scoreboard", {
		path: "/scoreboard",
		controller: "ScoreboardController"
	});
	this.route("home", {
		path: "/",
		controller: "HomeController"
	});
});

Router.route('/github', function () {
	this.render('Github');
	var state = this.params.query.state;
	var code = this.params.query.code;

	var router = this;

	Meteor.call('requestAccessToken', state, code, function (err) {
		if (err) {
			router.render('GithubFail');
		} else {
			router.render('GithubSuccess');
		}
	});
});
