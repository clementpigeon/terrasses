Template.results_view.results = function(){
  return Results.find();
};

Template.results_view.isReady = function(){
  return Session.get('isReady');
};

Template.results_view.rendered = function(){
  callGetPlacesMethod();
  setupGoogleMap(Session.get('requestedPosition'));
};

Template.results_view.details = function(){
  return Session.get('details');
};

Template.results_map.events({
    'click #refresh_results': function(e) {
        var center = map.getCenter();
        center = [center.k, center.A];
        Session.set('requestedPosition', center);
        callGetPlacesMethod();
    }
});

function callGetPlacesMethod (){
  position = Session.get('requestedPosition');
  Results.remove({});
  Meteor.call('get_places', position, false, function(error, res){
    var i = 0;
    res.forEach(function(result){
      result.index = ++i;
      Results.insert(result);
    });
    Session.set('isReady', true);
  });
}

function setupGoogleMap(position){
  GoogleMaps.init(
      {
          'sensor': true, //optional
          'key': 'AIzaSyAt4AAA7Kmj8O7w33-I0_gORjZXEvEbD3E', //optional
          'language': 'fr' //optional
      },
      function(){
          var mapOptions = {
              zoom: 15,
              mapTypeId: google.maps.MapTypeId.RoadMap
          };
          map = new google.maps.Map(document.getElementById("map"), mapOptions);

          map.setCenter(new google.maps.LatLng( position[0], position[1] ));

          var markers = [];
          Results.find().observe({
            added: function(result) {
              var pos = new google.maps.LatLng( result.coords[0], result.coords[1] )
              markers.push(new google.maps.Marker({
                position: pos,
                map: map,
                icon: googleMarkerUrl(result.index)
              }));
            },
            removed: function(result) {
              // for now, delete all markers when one result is removed from cursor
              for (var i = 0; i < markers.length; i++ ) {
                markers[i].setMap(null);
              }
              markers.length = 0;
            }
          })
      }
  );
}

googleMarkerUrl = function (index){
  return 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + index + '|FF0000|000000';
}
