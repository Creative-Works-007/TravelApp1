/**
 * Created by rlakkoju on 2/4/2016.
 */

TravelApp =(typeof TravelApp == "undefined")?({}):(TravelApp);

TravelApp.Common = {
    ShowLoader: function(){
        $('body').find('.loader').removeClass('hide');
    },

    HideLoader: function(){
        $('body').find('.loader').addClass('hide');
    }
};