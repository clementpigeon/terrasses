Template.home.events({
  'click #search_now_nearby': function () {
    Session.set('isReady', false);
    Results.remove();

    if (geo && geo.error){
      console.log(geo.error.message);
      return;
    } else if (geo && !geo.lat){
      alert('Vous devez autoriser la géolocalisation');
      return;
    } else{
      var location = [geo.lat, geo.lng];
      Session.set('location', location);
      callGetPlacesMethod(Session.get('location'));
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

Template.home.rendered = function(){
  geo = Geolocation.getInstance();
}
