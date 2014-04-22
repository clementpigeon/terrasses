Template.result_item.googleMarkerUrl = function(){
  return googleMarkerUrl(this.index);
}

Template.result_item.types = function(){
  // var types = this.types.split(',');
  var types = _(this.types).without('food', 'establishment');
  return types.join(', ');
}

Template.result_item.photo = function(){
  if (this.photos){
    return googlePhotoUrl(this.photos[0].photo_reference);
  } else {
    console.log('place ' + this.index + ': no photo');
  }
}

Template.result_item.events({
    'click #details_btn': function(e) {
        // "this" is the template data
        Session.set('details', this);
    }
});

function googlePhotoUrl(photoRef){
  var api_url = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=';
  var google_api_key = 'AIzaSyAt4AAA7Kmj8O7w33-I0_gORjZXEvEbD3E';
  return api_url + photoRef + '&sensor=true&key=' + google_api_key;
}
