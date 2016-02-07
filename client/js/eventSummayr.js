/**
 * Created by Creative Works on 2/4/2016.
 */

TravelApp =(typeof TravelApp == "undefined")?({}):(TravelApp);

TravelApp.EventSummary = {

    PublicEvents: [],

    Init: function(){
        Debug.EnableSection("EventsSummary");
        TravelApp.EventSummary.FetchAndRenderPublicEvents();
    },

    FetchAndRenderPublicEvents: function(){
        Meteor.call("getPublicEventsForUser", function(error, result){
            if(error){
                Debug.Notice("Could not get any events", "EventsSummary");
            }else{
                if(result != null && typeof result == "object"){
                    Debug.Notice("Got Event count " + result + " from the DB", "EventsSummary");
                    TravelApp.EventSummary.PublicEvents = result;
                    TravelApp.EventSummary.RenderPublicEvents();
                }else{
                    Debug.Notice("Got some bullshit as a part of events from the DB", "EventsSummary");
                }
            }
        });
    },

    RenderPublicEvents: function(){
        for(var i = 0; i < TravelApp.EventSummary.PublicEvents.length; i++) {
            var bookedState = (TravelApp.EventSummary.PublicEvents[i].booked == true)?("esum-booked"):("esum-open");
            var buttonText = "";
            var buttonData = "";
            if(bookedState == "esum-booked"){
                buttonText = "Cancel";
                buttonData = "data-cancel-button";
            }else if(bookedState == "esum-closed"){
                buttonText = "Closed";
                buttonData = "data-closed-button";
            }else {
                buttonText = "Register";
                buttonData = "data-register-button";
            }

            if($(".homeSection").find("#"+ TravelApp.EventSummary.PublicEvents[i].eventID).length > 0){
                // -- Remove that --
                $(".homeSection").find("#"+ TravelApp.EventSummary.PublicEvents[i].eventID).remove();
            }

            Blaze.renderWithData(Template.eventSummary, {
                identifier: TravelApp.EventSummary.PublicEvents[i].eventID,
                pair: TravelApp.EventSummary.PublicEvents[i].source + "--" + TravelApp.EventSummary.PublicEvents[i].destination + " (Public)",
                date: TravelApp.EventSummary.PublicEvents[i].departureDate,
                bookedState: bookedState,
                cost: "999(DM)",
                savedCost: "Save Rs X",
                registercount: "" + TravelApp.EventSummary.PublicEvents[i].rcount,
                buttonText: buttonText,
                buttonData: buttonData
            }, $(".homeSection")[0]);
        }
    }

};

Template.homeTemplate.rendered = function(){
    Meteor.call("getAccessToken", function(error, result){
        if(error){

        }else{
            HideLoader();
            TravelApp.EventSummary.Init();
        }
    });

    GPublicEventsCursor.observe({
        added: TravelApp.EventSummary.FetchAndRenderPublicEvents,
        removed: TravelApp.EventSummary.FetchAndRenderPublicEvents,
        changed: TravelApp.EventSummary.FetchAndRenderPublicEvents
    });
};

Template.eventSummary.events = {
    "click [data-register-button]": function(event){
        var target = event.target;
        var id = $(target).closest('.esum-eventsummary').attr('id') || "";

        if(id != ""){
            Meteor.call("registerForPublicEvent", id, function(error, result){

            });
        }
    },

    "click [data-cancel-button]": function(event){
        var target = event.target;
        var id = $(target).closest('.esum-eventsummary').attr('id') || "";

        if(id != ""){
            Meteor.call("unregisterForPublicEvent", id, function(error, result){

            });
        }
    }
};