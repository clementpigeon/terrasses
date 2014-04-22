Template.home.events({
  'click #search_now_nearby': function () {
    Session.set('isReady', false);

    getLocation(function(err, res){
      if (err){
        console.log(location.message);
      } else {
        Session.set('requestLocation', res);
        Router.go('results');
      }
    })
  }
});
