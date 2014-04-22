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

Template.result_item.opening_hours_today = function(){
  if (!this.opening_hours || !this.opening_hours.periods){
    return "Horaires d'ouverture inconnus";
  }
  if ((this.opening_hours.periods[0].open.day === 0) && (!this.opening_hours.periods[0].close)){
    return "Ouvert 24h/24h";
  }
  var today = new Date();

  var periods = this.opening_hours.periods;
  var periods_today = _(periods).select(function(period){
    return period.open.day === today.getDay();
  });
  var periods_today_strings = _(periods_today).map(function(period){
    return "de " + format_hour(period.open.time) + " à " + format_hour(period.close.time);
  })
  if (periods_today[0]){
    return "Ouvert aujourd'hui " + periods_today_strings.join(' et ');
  } else {
    return "Fermé aujourd'hui";
  }
}

function format_hour(hour_string){
  if (hour_string === '0000') return "minuit"
  if (hour_string === '1200') return "midi"
  var hours = hour_string[0] === '0' ? hour_string[1] : hour_string.slice(0, 2);
  var minutes = hour_string.slice(2, 4) === '00' ? '' : hour_string.slice(2, 4);
  return hours + 'h' + minutes;
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
