// -- Create the user data collection --
GUserData = "";
if(Mongo.Collection.get("UserData") == null || Mongo.Collection.get("UserData") == undefined) {
    GUserData = new Mongo.Collection("UserData");
} else {
    GUserData = Mongo.Collection.get("UserData");
}
GUserDataCursor = GUserData.find({});

// -- Create the public events collection --
GPublicEvents = "";
if(Mongo.Collection.get("PublicEvents") == null || Mongo.Collection.get("PublicEvents") == undefined) {
    GPublicEvents = new Mongo.Collection("PublicEvents");
} else {
    GPublicEvents = Mongo.Collection.get("PublicEvents");
}
GPublicEventsCursor = GPublicEvents.find({});

// -- Create the event details collection --
GEventDetails = "";
if(Mongo.Collection.get("EventDetails") == null || Mongo.Collection.get("EventDetails") == undefined) {
    GEventDetails = new Mongo.Collection("EventDetails");
} else {
    GEventDetails = Mongo.Collection.get("EventDetails");
}
GEventDetailsCursor = GEventDetails.find({});

// -- Create the private events collection --
GPrivateEvents = "";
if(Mongo.Collection.get("PrivateEvents") == null || Mongo.Collection.get("PrivateEvents") == undefined) {
    GPrivateEvents = new Mongo.Collection("PrivateEvents");
} else {
    GPrivateEvents = Mongo.Collection.get("PrivateEvents");
}
GPrivateEventsCursor = GPrivateEvents.find({});

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  var collections = Mongo.Collection.getAll();

    LoaderTimer = null;

    InitiateLoaderTimer = function(){
        LoaderTImer = setTimeout(function(){
            HideLoader();
        }, 10000);
    };

    ShowLoader = function(){
        $('body').find('.loader').removeClass('hide show').addClass('show');
        InitiateLoaderTimer();
    };

    HideLoader = function(){
        if(typeof LoaderTImer != "undefined" && LoaderTImer!= null) {
            clearTimeout(LoaderTImer);
            LoaderTImer = null;
        }
        $('body').find('.loader').removeClass('hide show').addClass('hide');
    };
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