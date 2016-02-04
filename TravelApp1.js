if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  var collections = Mongo.Collection.getAll();

    ShowLoader = function(){
        $('body').find('.loader').removeClass('hide show').addClass('show');
    };

    HideLoader = function(){
        $('body').find('.loader').removeClass('hide show').addClass('hide');
    };

  // -- Create the private events collection --
  if(Mongo.Collection.get("PrivateEvents") == null || Mongo.Collection.get("PrivateEvents") == undefined) {
      GPrivateEvents = new Mongo.Collection("PrivateEvents");
  } else {
      GPrivateEvents = Mongo.Collection.get("PrivateEvents");
  }
}

if (Meteor.isServer) {
    Meteor.users.deny({
        update: function() {
            return true;
        }
    });

    Accounts.onCreateUser(function(options, user) {
        user.profile = options.profile || {};
        user.username = options.username;
        return user;
    });
}

Meteor.startup(function () {

});

Router.configure({
   layoutTemplate: 'main'
});

Router.route("/register");
Router.route("/login");
Router.route("/eventcreation");
Router.route("/", {
    name: 'home',
    template: 'home'
});