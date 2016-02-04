/**
 * Created by Creative Works on 2/2/2016.
 */

TravelApp =(typeof TravelApp == "undefined")?({}):(TravelApp);

TravelApp.EventCreation = {

    SourceCity: "",
    SourceCountry: "",
    DestinationCountry: "",
    DestinationCity: "",

    Init: function(){
        // -- First, close all things on startup --
        //$(".eventswindow").find(".panel-body").slideUp();
        //$(".eventswindow").find(".panel-heading").addClass("panel-collapsed");
        //$(".eventswindow").find(".panel").addClass("panel-collapsed");

        // -- Setup some validations --
    },

    PanelClick: function (event) {
        var selector = event.target;
        if ($(selector).hasClass('panel-collapsed')) {
            // expand the panel
            $(selector).parents('.panel').find('.panel-body').slideDown();
            $(selector).removeClass('panel-collapsed');
            $(selector).find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        }
        else {
            // collapse the panel
            $(selector).parents('.panel').find('.panel-body').slideUp();
            $(selector).addClass('panel-collapsed');
            $(selector).find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        }
    },

    PublicTravelTypeChanged: function(event) {
        var type = $(".publicevent input[type='radio'][name='public-travel-type']:checked").val();

        if(type.toUpperCase() == "DOMESTIC"){
            $(".publicevent select.publicevent-destination-country").prop("disabled", true);
        }else {
            $(".publicevent select.publicevent-destination-country").prop("disabled", false);
        }
    },

    PublicSourceCountrySelected: function(event) {
        var sourceCountry = $("select.publicevent-origin-country").val();

        if(sourceCountry == undefined){
            return;
        }else {
            Meteor.call("getCitiesFromCountry", sourceCountry, function(error, result){
                if(error){

                }else {
                    var list = result, listObj = [];
                    var obj = {};
                    var size = list.length;

                    for(var i = 0; i < size; i++){
                        obj = {};
                        obj.id = list[i];
                        obj.text = list[i];
                        listObj.push(obj);
                    }

                    if($("select.publicevent-source").hasClass('select2-hidden-accessible')) {
                        $("select.publicevent-source").html('').select2({data: [{id: '', text: ''}]});
                    }

                    $("select.publicevent-source").select2({
                        data: listObj
                    });

                    $("select.publicevent-source").select2().select2('val', $('.select2 option:eq(1)').val());
                }
            });
        }
    },

    PublicSourceCitySelected: function(event){
        var sourceCity = $("select.publicevent-source").val();

        ShowLoader();

        if(sourceCity == undefined || sourceCity == null){
            HideLoader();
            return;
        }else{
            var type = $(".publicevent input[type='radio'][name='public-travel-type']:checked").val();

            var destinationCountry = null;

            if(type.toUpperCase() != "DOMESTIC") {
                destinationCountry = $("select.publicevent-destination-country").val();
            }

            Meteor.call("getDestinationsForOriginCity", sourceCity, type, destinationCountry, function(error, result){
                if(error){
                    HideLoader();
                }else {
                    var list = result || [], listObj = [];
                    var obj = {};
                    var size = list.length;

                    for(var i = 0; i < size; i++){
                        obj = {};
                        obj.id = list[i];
                        obj.text = list[i];
                        listObj.push(obj);
                    }

                    if($("select.publicevent-destination").hasClass('select2-hidden-accessible')) {
                        $("select.publicevent-destination").html('').select2({data: [{id: '', text: ''}]});
                    }

                    $("select.publicevent-destination").select2({
                        data: listObj
                    });

                    $("select.publicevent-destination").select2().select2('val', $('.select2 option:eq(1)').val());

                    HideLoader();
                }
            });
        }
    },

    PublicEventCreate: function(event) {
        var newEvent = {};

        newEvent.destination = $(".publicevent-destination").val();
        newEvent.source = $(".publicevent-source").val();
        newEvent.departureDate = $(".public-departuredate input").val();
        newEvent.deadline = $(".public-deadline input").val();
        newEvent.mode = $(".public-mode input[type = 'radio'][name = 'public-travel-mode']:checked").val();
        newEvent.eventName = $(".public-eventname input").val();
        newEvent.mincost = $("[data-public-mincost]").val();
        newEvent.maxcost = $("[data-public-maxcost]").val();
        newEvent.booked = [];
        newEvent.cancelled = [];
        newEvent.rejected = [];
        newEvent.participants = [];
        var tempParticipants = $("[data-public-participants] input");
        for(var i = 0; i < tempParticipants.length; i++) {
            if($(tempParticipants[i]).prop("checked") == true){
                var uname = $(tempParticipants[i]).parent().text();
                if(uname.toUpperCase() == "SELF"){
                    // -- Get the user name for the specified Uesr ID --
                    newEvent.participants.push("self");
                }else {
                    newEvent.participants.push(uname);
                }
            }
        }

        Meteor.call("createPublicEvent", newEvent);
    }
};

Template.eventcreation.rendered = function(){
    TravelApp.EventCreation.Init();
};

Template.eventcreation.events = {
    "click .panel .clickable": function(event){
        TravelApp.EventCreation.PanelClick(event);
    }
};

Template.publicevent.events = {
    "change input[type='radio'][name = 'public-travel-type']": function(event){
        TravelApp.EventCreation.PublicTravelTypeChanged(event);
    },

    //"change select.publicevent-origin-country": function(event) {
    //    console.log("The Change Event Firing UP");
    //    TravelApp.EventCreation.PublicSourceCountrySelected(event);
    //},
    //
    //"change .publicevent-destination-country": function(event) {
    //
    //},
};

Template.publicevent.rendered = function(){
    //$(".publicevent select").select2();
    ShowLoader();
    Meteor.call("getOriginCountriesList", function(error, result){
        if(error){
            return [];
        }else {
            var oCountriesList = result, oCountriesObj = [];
            var size = oCountriesList.length;
            for(var i = 0; i < size; i++){
                var obj = {};
                obj.id = oCountriesList[i];
                obj.text = oCountriesList[i];
                oCountriesObj.push(obj);
            }
            $(".publicevent .publicevent-origin-country").select2({
                data: oCountriesObj
            });

            $("select.publicevent-origin-country").on("change", function(event){
                TravelApp.EventCreation.PublicSourceCountrySelected(event);
            });

            TravelApp.EventCreation.PublicTravelTypeChanged();
            TravelApp.EventCreation.PublicSourceCountrySelected();
            HideLoader();
        }
    });
    Meteor.call("getDestinationCountriesList", function(error, result){
        if(error){
            return [];
        }else {
            var dCountriesList = result, dCountriesObj = [];
            var size = dCountriesList.length;
            for(var i = 0; i < size; i++){
                var obj = {};
                obj.id = dCountriesList[i];
                obj.text = dCountriesList[i];
                dCountriesObj.push(obj);
            }
            $(".publicevent .publicevent-destination-country").select2({
                data: dCountriesObj
            });
        }
    });

    $("select.publicevent-source").on("change", function(event){
        if(typeof $("select.publicevent-source").val() == "string"){
            if(TravelApp.EventCreation.SourceCity.toUpperCase() != $("select.publicevent-source").val().toUpperCase()) {
                TravelApp.EventCreation.PublicSourceCitySelected(event);
            }
        }else{
            TravelApp.EventCreation.PublicSourceCitySelected(event);
        }
    });

    $("[data-publicevent-createbutton]").on("click", function(event){
        event.preventDefault();
        TravelApp.EventCreation.PublicEventCreate(event);
    });
};