Meteor.startup(function () {
    geo = Geolocation.getInstance();
});

getPosition = function(cb){
    if (geo.error) {
      console.log('geoloc error');
      console.log(geo.error.message);
      cb(geo.error);

    } else if (!geo.lat){
      console.log('no lat/lng in geo object yet');
      Meteor.setTimeout(function(){
        getPosition(cb);
      }, 1000);

    } else {
      cb(null, [geo.lat, geo.lng]);
    }
}
