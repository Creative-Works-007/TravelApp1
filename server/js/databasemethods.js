/**
 * Created by Creative Works on 2/3/2016.
 */

Meteor.methods({
    "insertUserData": function(email, gender, fullname){
        var currentUser = Meteor.userId();

        if(GUserData != "") {
            GUserData.insert({
                "userid": currentUser,
                "fullname": fullname,
                "gender": gender,
                "email": email
            });
        }
    },
    "createPublicEvent": function(publicObj){
        var currentUser = Meteor.userId();
        publicObj.booked = publicObj.booked || [];
        if(publicObj.participants.indexOf("self") >= 0){
            var fn = GPublicEvents.find({userid: Meteor.userId()});
            if(fn.count() > 0){
                fn = fn[0].fullname;
                publicObj.participants[publicObj.participants.indexOf("self")].replace("self", fn);
            }
            publicObj.booked.push(currentUser);
        }
        publicObj.createdBy = currentUser;
        var dString = publicObj.departureDate.split("/").join("");
        publicObj.eventID = "PUBLIC"+publicObj.createdBy+publicObj.destination+publicObj.source+dString;
        publicObj.eventID.split(" ").join("");
        publicObj.currentCombPrice = "";
        publicObj.currentIndPrice = "";
        publicObj.currency = "US";
        publicObj.itineraries = "";

        if(GPublicEvents != "") {
            if(GPublicEvents.find({"eventID": publicObj.eventID}).fetch().length > 0){
                return "A similar event already exists";
            }else {
                var writeOp = GPublicEvents.insert(publicObj);
                return "Event has been created successfully.";
            }
        }
    },

    'registerForPublicEvent': function(id){
        var currentUser = Meteor.userId();

        if(GPublicEvents != "") {
            if(GPublicEvents.find({"eventID": id}).fetch().length > 0){
                var event = GPublicEvents.find({"eventID": id}).fetch();
                if(event.length > 0){
                    event = event[0]; // -- Coz, ideally we should be having only one such doc + timei s short ..:)
                    event.booked.push(currentUser);

                    GPublicEvents.update({eventID: id}, {$set:{booked: event.booked}});
                }
            }
        }
    },

    'unregisterForPublicEvent': function(id){
        var currentUser = Meteor.userId();

        if(GPublicEvents != "") {
            if(GPublicEvents.find({"eventID": id}).fetch().length > 0){
                var event = GPublicEvents.find({"eventID": id}).fetch();
                if(event.length > 0){
                    event = event[0]; // -- Coz, ideally we should be having only one such doc + timei s short ..:)

                    if(event.booked.indexOf(currentUser) >= 0){
                        event.booked.splice(event.booked.indexOf(currentUser), 1);

                        GPublicEvents.update({eventID: id}, {$set:{booked: event.booked}});
                    }
                }
            }
        }
    },

    "getPublicEventsForUser": function(){
        var userid = Meteor.userId();

        var events = GPublicEvents.find().fetch();
        if(events.length > 0){
            var count = events.length;
            var list = [];
            for(var i = 0; i < count; i++){

                if(events[i]["rejected"].indexOf(userid) > 0){
                    // -- Do Not Give
                } else {
                    var obj = {};
                    obj.booked = (events[i].booked.indexOf(userid) >= 0)?(true):false;
                    obj.eventID = events[i].eventID;
                    obj.source = events[i].source;
                    obj.destination = events[i].destination;
                    obj.departureDate = events[i].departureDate;
                    obj.deadline = events[i].deadline;
                    obj.rcount = events[i].booked.length;
                    list.push(obj);
                }
            }

            return list;
        }else {
            var obj = [];
            return obj;
        }
    },

    "createPrivateEvent": function(privateObj){

    },

    "getAccessToken": function(){
        TravelApp.Sabre.GetAccessToken();
    },

    "getOriginCountriesList": function(){
        var list = TravelApp.Sabre.GetOriginCountriesList();
        return list;
    },

    "getDestinationCountriesList": function(){
        var list = TravelApp.Sabre.GetDestinationCountriesList();
        return list;
    },

    "getCitiesFromCountry": function(country){
        var list = TravelApp.Sabre.GetCitiesFromCountry(country);
        return list;
    },

    "getDestinationsForOriginCity": function(origin, type, destCountry){

        if(typeof type == "string" && type.toUpperCase() == "DOMESTIC"){
            destCountry = null;
        }

        var list = TravelApp.Sabre.GetTop50DestinationsSyncFuture(origin, destCountry, null, type, null);
        return list;
    }
});