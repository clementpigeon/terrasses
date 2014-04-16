Template.results_view.results = function(){
  return Results.find();
};

Template.results_view.isReady = function(){
  return Session.get('isReady');
};

Template.results_view.details = function(){
  return Session.get('details');
};

Template.result_details.data = function(){
  return Session.get('details');
};

Template.result_item.events({
    'click #details_btn': function(e) {
        // e is the event, e.currentTarget is the button
        // this is the template data

        console.log(this);
        Session.set('details', this);

    }
});

Template.result_details.events({
    'click #close_details_btn': function(e) {
        Session.set('details', null);
    }
});


