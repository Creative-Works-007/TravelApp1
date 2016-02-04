/**
 * Created by Creative Works on 1/31/2016.
 */

TravelApp =(typeof TravelApp == "undefined")?({}):(TravelApp);

TravelApp.ValidationSetup = {
    /* --- Common Set of Validations ----*/
    validateEmail: function(email){
        var valid = TravelApp.DisplayStuff.InvalidMailAddress;
        var re = /([\w_.])+@\w+\.\w+/gi;
        var match = email.match(re);
        if(match != null && match[0] == email) {
            valid = TravelApp.DisplayStuff.SuccessfulTest;
        }

        return valid;
    },

    validateUserName: function(uname){
        var valid = TravelApp.DisplayStuff.ShortUserName;

        if(typeof uname == "string" && uname.length > 8) {
            valid = TravelApp.DisplayStuff.SuccessfulTest;
        }

        return valid;
    },

    validatePassword: function(password){
        var valid = TravelApp.DisplayStuff.ShortPassword;

        var re = /([\w_@])+/gi;
        var match = password.match(re);
        if(match != null && match[0] == password) {
            if(password.length >= 8) {
                valid = TravelApp.DisplayStuff.SuccessfulTest;
            }
        }

        return valid;
    },

    matchPasswords: function(pwd1, pwd2)
    {
        if(pwd1 == pwd2){
            return TravelApp.DisplayStuff.SuccessfulTest;
        }
        else {
            return TravelApp.DisplayStuff.PasswordsMismatch;
        }
    },

    SetupValidation: function(selectorStr, functionPtr, key){
        $(selectorStr).on("keyup", {
            validator: functionPtr,
            selectorStr: selectorStr,
            key: key
        }, TravelApp.ValidationSetup.ValidateHandle);

        $(selectorStr).on("input", {
            validator: functionPtr,
            selectorStr: selectorStr,
            key: key
        }, TravelApp.ValidationSetup.ValidateHandle);
    },

    SetupMatchingFieldValidation: function(selectorStr1, selectorStr2, functionPtr, key) {
        key = key || 1;
        var value = "", mValue = " ";
        var selector = "";
        if(key == 1) {
            value = $(selectorStr1).val();
            mValue = $(selectorStr2).val();
            selector = $(selectorStr1);
        } else {
            value = $(selectorStr2).val();
            mValue = $(selectorStr1).val();
            selector = $(selectorStr2);
        }

        selector.on("keyup", {
            value: value,
            mValue: mValue,
            validator: functionPtr
        }, TravelApp.ValidationSetup.MatchValidateHandle);
    },

    MatchValidateHandle: function(event) {
        var validator = event.data.validator;

        var result = validator(event.data.value, event.data.mValue);
        if(result == TravelApp.DisplayStuff.SuccessfulTest){
            $(this).siblings('.error-message').remove();
        } else {
            errMsg = $(this).siblings('.error-message');
            if(errMsg.length == 0){
                errMsg = $('<p class="error-message"></p>').appendTo($(this).parent());
            }
            errMsg.html(result);
        }
    },

    ValidateHandle: function(event) {
        var value = $(this).val();

        var validator = event.data.validator;
        var selectorStr = event.data.selectorStr;

        var validationResult = validator(value);

        // -- Instead of blindly adding a error-message class, we could aslo add a data attribute basedon teh selector so that
        // -- we can remove the errors more specifically --
        if(validationResult == TravelApp.DisplayStuff.SuccessfulTest){
            $(this).siblings('.error-message').remove();
        } else {
            errMsg = $(this).siblings('.error-message');
            if(errMsg.length == 0){
                errMsg = $('<p class="error-message"></p>').appendTo($(this).parent());
            }
            errMsg.html(validationResult);
        }
    }
};