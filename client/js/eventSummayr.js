/**
 * Created by Creative Works on 2/4/2016.
 */

TravelApp =(typeof TravelApp == "undefined")?({}):(TravelApp);

TravelApp.EventSummary = {

    PublicEvents: [],

    Init: function(){
        TravelApp.EventSummary.GetEvents();
        TravelApp.EventSummary.Render();
    },

    GetEvents: function(){
        Meteor.call("getPublicEventsForUser", function(error, result){
            if(error){

            }else{
                if(result != null && typeof result == "object"){
                    TravelApp.EventSummary.PublicEvents = result;
                    TravelApp.EventSummary.Render();
                }
            }
        });
    },

    Render: function(){
        for(var i = 0; i < TravelApp.EventSummary.PublicEvents.length; i++) {
            var bookedState = (TravelApp.EventSummary.PublicEvents[i].booked == true)?("esum-booked"):("esum-open");
            var buttonText = "";
            if(bookedState == "esum-booked"){
                buttonText = "Cancel";
            }else{
                buttonText = "Book";
            }
            Blaze.renderWithData(Template.eventSummary, {
                pair: TravelApp.EventSummary.PublicEvents[i].source + "--" + TravelApp.EventSummary.PublicEvents[i].destination,
                date: TravelApp.EventSummary.PublicEvents[i].departureDate,
                bookedState: bookedState,
                cost: "999(DM)",
                savedCost: "Save Rs X",
                registercount: "" + TravelApp.EventSummary.PublicEvents[i].rcount,
                buttonText: buttonText
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
};