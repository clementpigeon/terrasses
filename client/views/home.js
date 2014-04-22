Template.home.events({
  'click #search_now_nearby': function () {
    Session.set('isReady', false);

    getPosition(function(err, res){
      if (err){
        console.log(err.message);
      } else {
        Session.set('requestedPosition', res);
        Router.go('results');
      }
    })
  }
});
