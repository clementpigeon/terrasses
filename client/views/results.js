Template.results_view.results = function(){
  return Results.find();
};

Template.results_view.isReady = function(){
  return Session.get('isReady');
};

Template.results_view.rendered = function(){
  setupGoogleMap(location);
};

Template.results_view.details = function(){
  return Session.get('details');
};

Template.result_item.googleMarkerUrl = function(){
  return googleMarkerUrl(this.index);
}

Template.result_item.photo = function(){
  if (this.photos){
    return googlePhotoUrl(this.photos[0].photo_reference);
  } else {
    console.log('place ' + this.index + ': no photo');
  }
}

Template.result_details.data = function(){
  return Session.get('details');
};

Template.result_item.events({
    'click #details_btn': function(e) {
        // "this" is the template data
        Session.set('details', this);
    }
});

Template.result_details.events({
    'click #close_details_btn': function(e) {
        Session.set('details', null);
    }
});

function setupGoogleMap(){
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
          var location = Session.get('location');
          map.setCenter(new google.maps.LatLng( location[0], location[1] ));

          var markers = [];
          Results.find().observe({
            added: function(result) {
              var location = result.geometry.location;
              var pos = new google.maps.LatLng( location.lat, location.lng )
              markers.push(new google.maps.Marker({
                position: pos,
                map: map,
                icon: googleMarkerUrl(result.index)
              }));
            },
            removed: function(post) {
              markers.length = 0;
            }
          })
      }
  );
}

function googleMarkerUrl(index){
  return 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + index + '|FF0000|000000';
}

function googlePhotoUrl(photoRef){
  var api_url = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=';
  var google_api_key = 'AIzaSyAt4AAA7Kmj8O7w33-I0_gORjZXEvEbD3E';
  return api_url + photoRef + '&sensor=true&key=' + google_api_key;
}
