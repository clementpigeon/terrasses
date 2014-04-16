Template.home.events({
  'click #search_now_nearby': function () {
    Session.set('isReady', false);
    Results.remove();

    if ("geolocation" in navigator) {

      navigator.geolocation.getCurrentPosition(function(position) {
        var location = [position.coords.latitude, position.coords.longitude];
        callGetPlacesMethod(location, false);
        Session.set('location', location);
      });

    } else {
      console.log('location not available');
      callGetPlacesMethod([48.863528, 2.369465], false);
    }
    Router.go('results');
  }
});

function callGetPlacesMethod(location, isFake){
  Meteor.call('get_places', location, isFake, function(error, res){
    var i = 0;
    res.results.forEach(function(result){
      result.index = ++i;
      Results.insert(result);
    });
    Session.set('isReady', true);
  });
}
