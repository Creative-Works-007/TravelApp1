/**
 * Created by Creative Works on 2/6/2016.
 */

TravelApp =(typeof TravelApp == "undefined")?({}):(TravelApp);

TravelApp.Debug = {
    Sections: [],
    Levels: {
        CRITICAL: 1,
        ERROR: 2,
        WARNING: 3,
        NOTICE: 4
    },
    ClearanceLevel: 4,

    SetLevel: function(level){
        TravelApp.Debug.ClearanceLevel = level;
    },

    DisableSection: function(section){
        if(TravelApp.Debug.Sections.indexOf(section) >= 0){
            TravelApp.Debug.Sections.splice(TravelApp.Debug.Sections.indexOf(section), 1);
        }
    },

    EnableSection: function(section){
        if(!TravelApp.Debug.Sections.indexOf(section) >= 0) {
            TravelApp.Debug.Sections.push(section);
        }
    },

    Log: function(msg, section, level){
        if(TravelApp.Debug.Sections.indexOf(section) >= 0) {
            if(level <= TravelApp.Debug.ClearanceLevel){
                switch(level){
                    case TravelApp.Debug.Levels.NOTICE:
                    {
                        console.log(section + " --- " + msg);
                        break;
                    }
                    case TravelApp.Debug.Levels.WARNING:
                    {
                        console.info(section + " --- " + msg);
                        break;
                    }
                    case TravelApp.Debug.Levels.CRITICAL:
                    case TravelApp.Debug.Levels.ERROR:
                    {
                        console.error(section + " --- " + msg);
                        break;
                    }
                    default:
                    {
                        console.log(msg);
                    }
                }
            }
        }
    },

    Notice: function(msg, section){
        TravelApp.Debug.Log(msg, section, TravelApp.Debug.Levels.NOTICE);
    },

    Error: function(msg, section){
        TravelApp.Debug.Log(msg, section, TravelApp.Debug.Levels.ERROR);
    },

    Warning: function(msg, section){
        TravelApp.Debug.Log(msg, section, TravelApp.Debug.Levels.WARNING);
    },

    Critical: function(msg, section){
        TravelApp.Debug.Log(msg, section, TravelApp.Debug.Levels.CRITICAL);
    }
};

Debug = TravelApp.Debug;