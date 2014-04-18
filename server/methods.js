Meteor.methods({
    get_places: function(location){
      //this.unblock();
      var result = Terrasses.find( { coords : { $near : location } }, {$limit : 20} ).fetch();
      var response = {results: result};
      return response;
    }
});
