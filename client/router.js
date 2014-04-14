Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function () {

  this.route('home', {
    path: '/',
    template: 'home'
  });

  this.route('results', {
    path: '/results',
    template: 'results_view'
  });

});

Session.set("currentPage", '/');
