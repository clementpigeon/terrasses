Template.home.events({
  'click #search_now_nearby': function () {
    Session.set('isReady', false);
    Results.remove();

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

callGetPlacesMethod = function (){
  position = Session.get('requestLocation');
  Meteor.call('get_places', position, false, function(error, res){
    var i = 0;
    res.forEach(function(result){
      result.index = ++i;
      Results.insert(result);
    });
    Session.set('isReady', true);
  });
}
