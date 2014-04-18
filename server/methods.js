Meteor.methods({
    get_places: function(location){
      return Terrasses.find( { coords : { $near : location } }, {limit: 25} ).fetch();;
    }
});
