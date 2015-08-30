Router.route('/webhook/ci', {
  where: 'server'
})
  .post(function () {
    var router = this;

    console.log("Received webhook");

    Meteor.call('receiveWebhook', this.request.body, function (err, resp) {
      router.response.end();
    });
  });
