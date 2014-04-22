Template.result_details.data = function(){
  return Session.get('details');
};

Template.result_details.events({
    'click #close_details_btn': function(e) {
        Session.set('details', null);
    }
});
