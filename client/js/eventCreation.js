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

    PublicEventFormReset: function(){

    },

    PublicEventFormValidation: function(){
        var listOfErrors = [], value = "";

        value = $(".publicevent-destination").val();
        if(value == "" || value == null){
            listOfErrors.push("Please select a destination city");
        }

        value = $(".publicevent-source").val();
        if(value == "" || value == null){
            listOfErrors.push("Please select a source city");
        }

        value = $(".public-departuredate input").val();
        if(value == "" || value == null){
            listOfErrors.push("Please select a departure date");
        }

        value = $(".public-deadline input").val();
        if(value == "" || value == null){
            listOfErrors.push("Please select a registration deadline");
        }else{
            var dep = $(".public-departuredate input").val();
            if(dep != "" || dep != ""){
                var depSplit = dep.split("/") || [];
                var dedSplit = value.split("/") || [];

                var valid = false;

                if(depSplit.length < 3){
                    var m = 3 - depSplit.length;
                    for(var i = 0; i < m; i++){
                        depSplit.push(0);
                    }
                }

                if(dedSplit.length < 3){
                    var m = 3 - dedSplit.length;
                    for(var i = 0; i < m; i++){
                        dedSplit.push(0);
                    }
                }

                for(var i = 0; i < 3; i++){
                    if(Number(depSplit[i]) == NaN){
                        depSplit[i] = 0;
                    }
                    if(Number(dedSplit[i]) == NaN){
                        dedSplit[i] = 0;
                    }
                }

                if(Number(depSplit[2]) >= Number(dedSplit[2])){
                    if(Number(depSplit[1] > Number(depSplit[1]))){
                        valid = true;
                    }else if(Number(depSplit[1] == Number(depSplit[1]))){
                        if(Number(depSplit[0]) >= Number(depSplit[0])){
                            valid = true;
                        }
                    }
                }
            }

            if(!valid){
                listOfErrors.push("The Registration Deadline cannot be beyond the departure date")
            }
        }

        value = $(".public-eventname input").val();
        if(value == "" || value == null){
            listOfErrors.push("The event name cannot be left blank");
        }

        value = $("[data-public-mincost]").val();
        if(value == "" || value == null){
            listOfErrors.push("The min cost cannot be left blank");
        }

        value = $("[data-public-maxcost]").val();
        if(value == "" || value == null){
            listOfErrors.push("The max cost cannot be left blank");
        }else{
            var numax = Number(value), numin = Number($(".public-eventname input").val());

            //numax = ($.isNaN(numax))?(9999):(numax);
            //numin = ($.isNaN(numin))?(0):(numin);

            if(numax < numin){
                listOfErrors.push("The max cost cannot be less than the min cost");
            }
        }

        return listOfErrors;
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
        var errors = TravelApp.EventCreation.PublicEventFormValidation();
        if(errors.length > 0){
            var listHTML = [];
            for(var i = 0; i < errors.length; i++){
                listHTML[i] = {};
                listHTML[i].error = errors[i];
            }

            Blaze.renderWithData(Template.formerrors, {
                listoferrors: listHTML
            }, $('.publicevent')[0]);

            $('.publicevent #formerrors').modal();
        }else{
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

            Meteor.call("createPublicEvent", newEvent, function(error, result){
                if(error){

                }else{
                    if(typeof result == "string"){

                    }else if(typeof  result == "boolean"){
                        if(result){
                            result = "Event has been created successfully."
                        }
                        else{
                            result = "OOPS!!.. SOmething has gone wrong. Please try again."
                        }
                    }

                    Blaze.renderWithData(Template.eventcrstatus, {
                        status: result
                    }, $('.publicevent')[0]);

                    $('.publicevent #eventcrstatus').modal();
                }
            });
        }
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

Template.formerrors.events = {
    "click [data-formerror-okay]": function(event){
        $('#formerrors').modal('hide');
    },

    "hidden.bs.modal #formerrors": function(event){
        $('#formerrors').remove();
    }
};

Template.eventcrstatus.events = {
    "click [data-eventcrstatus-okay]": function(event){
        $("#eventcrstatus").modal('hide');
    },

    "hidden.bs.modal #eventcrstatus": function(event){
        $('#eventcrstatus').remove();
    }
};