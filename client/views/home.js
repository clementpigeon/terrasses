Template.home.events({
  'click #search_now_nearby': function () {

    Results.remove();
    var location = [48.863528, 2.369465];

    // change isFake flag to true for offline dev
    Meteor.call('get_places', location, false, function(error, res){

      res.results.forEach(function(result){
        Results.insert(result);
      })

      Router.go('results');
    });

  }
});
