/**
 * Created by Creative Works on 2/3/2016.
 */

TravelApp =(typeof TravelApp == "undefined")?({}):(TravelApp);

var Future = Npm.require( 'fibers/future' );

TravelApp.Sabre = {

    AccessToken: "",

    AccessTimeLeft: 0,

    AccessTokenType: "",

    OriginCountries: [],

    DestinationCountries: [],

    TokenObtained: false,

    MultiFuture: 1,

    DBTriggersInitialized: false,

    PassengerCodeChecks: ["ADT", "JCB", "AGT", "GRP", "VAG"],

    Cities: [],

    AdditionalCityCodes: [],

    FlightInfos: {},

    Init: function(){
        TravelApp.Sabre.GetAllCities();
        TravelApp.Sabre.GetAllCountries();
    },

    GetAccessToken: function(){
        HTTP.call("POST", "https://api.test.sabre.com/v2/auth/token", {
            headers: {
                accept: "*/*",
                "content-type": "application/x-www-form-urlencoded",
                authorization: "Basic VmpFNmR6WnVOWEY1Tm1zeU5UVmlhSFZuTmpwRVJWWkRSVTVVUlZJNlJWaFU6WVdOTE16VnlVMUk9"
            },
            params: {
                grant_type:"client_credentials"
            }
        }, function(error, data) {
            if(data != null && typeof data == "object"){
                data = data.data || {};
                if("error" in data){
                    // -- Do Nothing --
                } else if("access_token" in data) {
                    TravelApp.Sabre.AccessToken = data.access_token;
                    TravelApp.Sabre.AccessTimeLeft = data.expires_in;
                    TravelApp.Sabre.AccessTokenType = data.token_type;
                    TravelApp.Sabre.TokenObtained = true;
                    TravelApp.Sabre.Init();
                }
            }
        });
    },

    GetAllCities: function(){
        HTTP.call("GET", "https://api.test.sabre.com/v1/lists/supported/cities", {
                headers: {
                    authorization: TravelApp.Sabre.AccessTokenType + " " + TravelApp.Sabre.AccessToken
                }
            }, function(error, data) {
                if(data != null && typeof data == "object") {
                    data = data.data || {};
                    if("Cities" in data) {
                        TravelApp.Sabre.Cities = data.Cities;

                        if(!TravelApp.Sabre.DBTriggersInitialized){
                            GPublicEventsCursor.observe({
                                added: function(document){
                                    var eventID = TravelApp.Sabre.GetItenaryPrices(document.source, document.destination, document.booked.length, document.departureDate, document.eventID);
                                    TravelApp.Sabre.FlightInfos = TravelApp.Sabre.FlightInfos || {};
                                    if(TravelApp.Sabre.FlightInfos.eventID.Options.length > 0){
                                        if(GPublicEvents.find({eventID: eventID}).fetch().length > 0){
                                            var costall = 99999, costind = 99;
                                            if(TravelApp.Sabre.FlightInfos.eventID.Options.length > 0){
                                                var len = TravelApp.Sabre.FlightInfos.eventID.Options.length;
                                                for(var k = 0; k < len; k++){
                                                    if(TravelApp.Sabre.FlightInfos.eventID.Options[k].TotalFare < costall){
                                                        costall = TravelApp.Sabre.FlightInfos.eventID.Options[k].TotalFare;
                                                        costind = TravelApp.Sabre.FlightInfos.eventID.Options[k].TotalFare / TravelApp.Sabre.FlightInfos.eventID.Options[k].PassengerCount;
                                                    }
                                                }
                                            }
                                            GPublicEvents.update({eventID: eventID}, {
                                                $set: {
                                                    itineraries: TravelApp.Sabre.FlightInfos.eventID.Options,
                                                    currentCombPrice: costall,
                                                    currentIndPrice: costind,
                                                    currency: TravelApp.Sabre.FlightInfos.eventID.Options[0].CurrencyCode
                                                }
                                            });
                                        }
                                    }
                                },

                                changed: function(document){
                                    var eventID = TravelApp.Sabre.GetItenaryPrices(document.source, document.destination, document.booked.length, document.departureDate, document.eventID);
                                    TravelApp.Sabre.FlightInfos = TravelApp.Sabre.FlightInfos || {};
                                    if(TravelApp.Sabre.FlightInfos.eventID.Options.length > 0){
                                        if(GPublicEvents.find({eventID: eventID}).fetch().length > 0){
                                            var costall = 99999, costind = 99;
                                            if(TravelApp.Sabre.FlightInfos.eventID.Options.length > 0){
                                                var len = TravelApp.Sabre.FlightInfos.eventID.Options.length;
                                                for(var k = 0; k < len; k++){
                                                    if(TravelApp.Sabre.FlightInfos.eventID.Options[k].TotalFare < costall){
                                                        costall = TravelApp.Sabre.FlightInfos.eventID.Options[k].TotalFare;
                                                        costind = TravelApp.Sabre.FlightInfos.eventID.Options[k].TotalFare / TravelApp.Sabre.FlightInfos.eventID.Options[k].PassengerCount;
                                                    }
                                                }
                                            }
                                            GPublicEvents.update({eventID: eventID}, {
                                                $set: {
                                                    itineraries: TravelApp.Sabre.FlightInfos.eventID.Options,
                                                    currentCombPrice: costall,
                                                    currentIndPrice: costind,
                                                    currency: TravelApp.Sabre.FlightInfos.eventID.Options[0].CurrencyCode
                                                }
                                            });
                                        }
                                    }
                                }
                            });

                            TravelApp.Sabre.DBTriggersInitialized = true;
                        }
                    }
                }
            }
        );
    },

    GetAllCountries: function(){
        HTTP.call("GET", "https://api.test.sabre.com/v1/lists/supported/countries", {
                headers: {
                    authorization: TravelApp.Sabre.AccessTokenType + " " + TravelApp.Sabre.AccessToken
                }
            }, function(error, data) {
                if(data != null && typeof data == "object"){
                    data = data.data || {};
                    if(typeof data == "object" && "OriginCountries" in data) {
                        TravelApp.Sabre.OriginCountries = data.OriginCountries;
                    }
                    if(typeof data == "object" && "DestinationCountries" in data) {
                        TravelApp.Sabre.DestinationCountries = data.DestinationCountries;
                    }
                }
            }
        );
    },

    //GetAllCityPairs: function() {
    //    HTTP.call("GET", "https://api.test.sabre.com/v1/lists/supported/shop/flights/origins-destinations", {
    //            headers: {
    //                authorization: TravelApp.Sabre.AccessTokenType + " " + TravelApp.Sabre.AccessToken
    //            }
    //        }, function(error, data) {
    //            if (typeof data == "object") {
    //                console.log(data.data);
    //            }
    //        }
    //    );
    //},

    GetTop50Destinations: function(origin, destinationCountry, destinationRegion, destinationType, lookback) {
        origin = TravelApp.Sabre.GetCityCodeFromName(origin);

        destinationCountry = TravelApp.Sabre.GetCountryCode(destinationCountry);

        if(origin != "" || origin != undefined){
            var params = {
                origin: origin
            };

            if(destinationRegion){
                params.destinationregion = destinationRegion;
            }
            if(destinationType) {
                params.destinationtype = destinationType.toLowerCase();
                if(destinationType.toUpperCase() != "DOMESTIC") {
                    if(destinationCountry){
                        params.destinationcountry = destinationCountry;
                    }else{

                    }
                }
            }
            if(lookback){
                params.lookbackweeks = lookback;
            }else{
                params.lookbackweeks = '8';
            }

            HTTP.call("GET", "https://api.test.sabre.com/v1/lists/top/destinations", {
                    headers: {
                        authorization: TravelApp.Sabre.AccessTokenType + " " + TravelApp.Sabre.AccessToken
                    },
                    params: params
                }, function(error, data) {
                    if(data != null && typeof data == "object"){
                        data = data.data || {};
                        if("error" in data){
                            return [];
                        }else if("OriginLocation" in data){
                            var list = [];
                            data.Destinations = data.Destinations || [];
                            var size = data.Destinations.length;
                            for(var i = 0; i < size; i++) {
                                if(typeof data.Destinations[i] == "object" && "Destination" in data.Destinations[i]){
                                    if("MetropolitanAreaName" in data.Destinations[i]["Destination"]){
                                        list.push(data.Destinations[i]["Destination"]["MetropolitanAreaName"]);
                                    }else if("CityName" in data.Destinations[i]["Destination"]){
                                        list.push(data.Destinations[i]["Destination"]["CityName"]);
                                    }
                                }
                            }
                            return list;
                        }else{
                            return [];
                        }
                    }
                }
            );
        }
    },

    GetTop50DestinationsSyncFuture: function(origin, destinationCountry, destinationRegion, destinationType, lookback) {
        origin = TravelApp.Sabre.GetCityCodeFromName(origin);

        destinationCountry = TravelApp.Sabre.GetCountryCode(destinationCountry);

        var future = new Future();

        if(origin != "" || origin != undefined){
            var params = {
                origin: origin
            };

            if(destinationRegion){
                params.destinationregion = destinationRegion;
            }
            if(destinationType) {
                params.destinationtype = destinationType.toLowerCase();
                if(destinationType.toUpperCase() != "DOMESTIC") {
                    if(destinationCountry){
                        params.destinationcountry = destinationCountry;
                    }else{

                    }
                }
            }
            if(lookback){
                params.lookbackweeks = lookback;
            }else{
                params.lookbackweeks = '8';
            }

            HTTP.call("GET", "https://api.test.sabre.com/v1/lists/top/destinations", {
                headers: {
                    authorization: TravelApp.Sabre.AccessTokenType + " " + TravelApp.Sabre.AccessToken
                },
                params: params
            }, function(error, data) {
                if(data != null && typeof data == "object"){
                    data = data.data || {};
                    if("error" in data){
                        future.return([]);
                    }else if("OriginLocation" in data){
                        var list = [];
                        data.Destinations = data.Destinations || [];
                        var size = data.Destinations.length;
                        for(var i = 0; i < size; i++) {
                            if(typeof data.Destinations[i] == "object" && "Destination" in data.Destinations[i]){
                                var pushed = false;
                                if("MetropolitanAreaName" in data.Destinations[i]["Destination"]){
                                    pushed = true;
                                    list.push(data.Destinations[i]["Destination"]["MetropolitanAreaName"]);
                                }else if("CityName" in data.Destinations[i]["Destination"]){
                                    pushed = true;
                                    list.push(data.Destinations[i]["Destination"]["CityName"]);
                                }

                                if(pushed){
                                    var code = TravelApp.Sabre.GetCityCodeFromName(list[list.length - 1]);
                                    if(code == ""){
                                        var obj = {};
                                        obj.name = list[list.length - 1];
                                        obj.code = data.Destinations[i]["Destination"]["CityName"]["DestinationLocation"];
                                        TravelApp.Sabre.AdditionalCityCodes.push(obj);
                                    }
                                }
                            }
                        }
                        future.return(list);
                    }else{
                        future.return([]);
                    }
                }
            });

            return future.wait();
        }
    },

    GetCountryCode: function(country) {
        country = country || "";

        // -- First check in the origin countries --
        var size = TravelApp.Sabre.OriginCountries.length;
        for(var i = 0; i < size; i++){
            if(TravelApp.Sabre.OriginCountries[i]["CountryName"].toUpperCase() == country.toUpperCase()){
                return TravelApp.Sabre.OriginCountries[i]["CountryCode"];
            }
        }

        size = TravelApp.Sabre.DestinationCountries.length;
        for(var i = 0; i < size; i++){
            if(TravelApp.Sabre.DestinationCountries[i]["CountryName"].toUpperCase() == country.toUpperCase()){
                return TravelApp.Sabre.DestinationCountries[i]["CountryCode"];
            }
        }

        return "BLAHBLAH";
    },

    GetCitiesFromCountry: function(country) {
        var countryCode = TravelApp.Sabre.GetCountryCode(country);

        if(countryCode == "BLAHBLAH"){
            return [];
        }else {
            var cities = [];
            var size = TravelApp.Sabre.Cities.length;
            for(var i = 0; i < size; i++) {
                if(TravelApp.Sabre.Cities[i]["countryCode"].toUpperCase() == countryCode.toUpperCase()){
                    cities.push(TravelApp.Sabre.Cities[i].name);
                }
            }
            return cities;
        }
    },

    GetCityCodeFromName: function(city) {
        city = city || "";

        var size = TravelApp.Sabre.Cities.length;
        for(var i = 0; i < size; i++) {
            if(TravelApp.Sabre.Cities[i]["name"].toUpperCase() == city.toUpperCase()){
                return TravelApp.Sabre.Cities[i]["code"];
            }
        }

        size = TravelApp.Sabre.AdditionalCityCodes.length;
        for(var i = 0; i < size; i++) {
            if(TravelApp.Sabre.AdditionalCityCodes[i]["name"].toUpperCase() == city.toUpperCase()){
                return TravelApp.Sabre.AdditionalCityCodes[i]["code"];
            }
        }
        return "";
    },

    GetOriginCountriesList: function(){
        var list = [];
        var size = TravelApp.Sabre.OriginCountries.length;
        for(var i = 0; i < size; i++){
            list.push(TravelApp.Sabre.OriginCountries[i]["CountryName"]);
        }
        return list;
    },

    GetDestinationCountriesList: function(){
        var list = [];
        var size = TravelApp.Sabre.DestinationCountries.length;
        for(var i = 0; i < size; i++){
            list.push(TravelApp.Sabre.DestinationCountries[i]["CountryName"]);
        }
        return list;
    },

    GetItenaryPrices: function(origin, destination, passengercount, departureDate, eventID) {
        var postJSON = {};
        postJSON.OTA_AirLowFareSearchRQ = {};

        var tempObj = {};

        origin = TravelApp.Sabre.GetCityCodeFromName(origin);
        destination = TravelApp.Sabre.GetCityCodeFromName(destination);

        // -- Frame the origin dest obj --
        postJSON.OTA_AirLowFareSearchRQ.OriginDestinationInformation = [];
        tempObj = {};
        departureDate = departureDate || [0, 0, 0];
        departureDate = departureDate.split("/");
        departureDate = departureDate[2] + "-" + departureDate[0] + "-" + departureDate[1];
        tempObj.DepartureDateTime = departureDate + "T" + "00:00:00";
        tempObj.OriginLocation = {
            LocationCode: origin
        };
        tempObj.DestinationLocation = {
            LocationCode: destination
        };

        postJSON.OTA_AirLowFareSearchRQ.OriginDestinationInformation.push(tempObj);

        // -- The POS param --
        postJSON.OTA_AirLowFareSearchRQ.POS = {
            "Source": [
                {
                    "RequestorID": {
                        "CompanyName": {
                            "Code": "TN"
                        },
                        "ID": "REQ.ID",
                        "Type": "0.AAA.X"
                    }
                }
            ]
        };

        postJSON.OTA_AirLowFareSearchRQ.TPA_Extensions = {
            "IntelliSellTransaction": {
                "RequestType": {
                    "Name": "50ITINS"
                }
            }
        };

        postJSON.OTA_AirLowFareSearchRQ.TravelPreferences = {
            "TPA_Extensions": {
                "NumTrips": {
                    "Number": 5
                }
            }
        };

        var future = new Future();

        TravelApp.Sabre.FlightInfos = TravelApp.Sabre.FlightInfos || {};
        TravelApp.Sabre.FlightInfos.eventID = TravelApp.Sabre.FlightInfos.eventID || {};
        TravelApp.Sabre.FlightInfos.eventID.Options = [];

        TravelApp.Sabre.MultiFuture = TravelApp.Sabre.PassengerCodeChecks.length;

        for(var i = 0; i < TravelApp.Sabre.PassengerCodeChecks.length; i++){

            postJSON.OTA_AirLowFareSearchRQ.TravelerInfoSummary= {
                "AirTravelerAvail": [
                    {
                        "PassengerTypeQuantity": [
                            {
                                "Code": TravelApp.Sabre.PassengerCodeChecks[i],
                                "Quantity": passengercount
                            }
                        ]
                    }
                ]
            };

            // -- Now, send the Rest API --
            HTTP.call("POST", "https://api.test.sabre.com/v1.9.2/shop/flights?mode=live", {
                data: postJSON,
                headers: {
                    "content-type": "application/json",
                    authorization: TravelApp.Sabre.AccessTokenType + " " + TravelApp.Sabre.AccessToken
                }
            }, function(error, result){
                if(error){
                    console.log("POST ERROR\n" + error);
                }else{
                    result = result || {};
                    if("data" in result){
                        result = result.data;
                    }
                    if("OTA_AirLowFareSearchRS" in result){
                        if("PricedItineraries" in result.OTA_AirLowFareSearchRS){
                            if("PricedItinerary" in result.OTA_AirLowFareSearchRS.PricedItineraries){
                                var iLength = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.length;
                                for(var i = 0; i < iLength; i++){
                                    var obj = {};

                                    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary || [{}];
                                    if(Object.keys(result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary[i]).length > 0){
                                        var OriginDestOptions = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary[i].AirItinerary.OriginDestinationOptions || {};

                                        OriginDestOptions.OriginDestinationOption = OriginDestOptions.OriginDestinationOption || [];

                                        if(OriginDestOptions.OriginDestinationOption.length > 0){
                                            OriginDestOptions.OriginDestinationOption = OriginDestOptions.OriginDestinationOption[0];
                                            OriginDestOptions.OriginDestinationOption.FlightSegment = OriginDestOptions.OriginDestinationOption.FlightSegment || [];

                                            var segments = OriginDestOptions.OriginDestinationOption.FlightSegment.length;
                                            if(segments > 0){
                                                obj.stops = segments - 1;
                                                obj.segments = [];

                                                for(var j = 0; j < segments; j++){
                                                    var segmentObj = OriginDestOptions.OriginDestinationOption.FlightSegment[j];
                                                    var tObj = {};

                                                    tObj.DepartureDateTime = segmentObj.DepartureDateTime;
                                                    tObj.ArrivalDateTime = segmentObj.ArrivalDateTime;
                                                    tObj.FlightNumber = segmentObj.FlightNumber;
                                                    tObj.DepartureAirport = segmentObj.DepartureAirport;
                                                    tObj.ArrivalAirport = segmentObj.ArrivalAirport;
                                                    tObj.OperatingAirline = segmentObj.OperatingAirline;
                                                    tObj.Equipment = segmentObj.Equipment;

                                                    obj.segments.push(tObj);
                                                }
                                            }

                                            OriginDestOptions = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary[i].AirItineraryPricingInfo || [];

                                            if(OriginDestOptions.length > 0){
                                                OriginDestOptions = OriginDestOptions[0];

                                                obj.PassengerCount = OriginDestOptions.PTC_FareBreakdowns.PTC_FareBreakdown[0].PassengerTypeQuantity.Quantity;
                                                obj.TotalBaseFare = OriginDestOptions.ItinTotalFare.BaseFare.Amount;
                                                obj.CurrencyCode = OriginDestOptions.ItinTotalFare.BaseFare.CurrencyCode;
                                                obj.TotalFare = OriginDestOptions.ItinTotalFare.TotalFare.Amount;
                                                obj.FarePerHead = OriginDestOptions.ItinTotalFare.TotalFare.Amount / OriginDestOptions.PTC_FareBreakdowns.PTC_FareBreakdown[0].PassengerTypeQuantity.Quantity;
                                            }
                                        }
                                    }
                                    var exists = false;
                                    for(var m = 0; m < TravelApp.Sabre.FlightInfos.eventID.Options.length; m++){
                                        if(JSON.stringify(obj) == JSON.stringify(TravelApp.Sabre.FlightInfos.eventID.Options[m])){
                                            exists = true;
                                            break;
                                        }
                                    }
                                    if(!exists)
                                        TravelApp.Sabre.FlightInfos.eventID.Options.push(obj);
                                }
                            }
                        }
                    }
                }

                TravelApp.Sabre.MultiFuture--;
                if(TravelApp.Sabre.MultiFuture <= 0){
                    future.return(eventID);
                }
            });
        }

        return future.wait();
    }
};