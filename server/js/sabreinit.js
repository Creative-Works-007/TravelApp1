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

    Cities: [],

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
                        console.log("Setting DC" + data.DestinationCountries.length);
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

    GetTop50DestinationsSync: function(origin, destinationCountry, destinationRegion, destinationType, lookback) {
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

            var convertToSync = Meteor.wrapAsync(HTTP.get);

            var result = convertToSync("https://api.test.sabre.com/v1/lists/top/destinations", {
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
                        console.log("The List");
                        return list;
                    }else{
                        return [];
                    }
                }
            });

            console.log(result);
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
                                if("MetropolitanAreaName" in data.Destinations[i]["Destination"]){
                                    list.push(data.Destinations[i]["Destination"]["MetropolitanAreaName"]);
                                }else if("CityName" in data.Destinations[i]["Destination"]){
                                    list.push(data.Destinations[i]["Destination"]["CityName"]);
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

};