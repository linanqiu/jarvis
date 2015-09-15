Router.route('/webhook/curl', {
  where: 'server'
})
  .post(function () {
    var router = this;

    console.log("Received webhook");

    console.log(this.request.body);

    Meteor.call('receiveWebhook', this.request.body, function (err, resp) {
      router.response.end();
    });
  });
