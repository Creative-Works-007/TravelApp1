TravelApp =(typeof TravelApp == "undefined")?({}):(TravelApp);

TravelApp.Index = {
    init: function() {
        // -- Setup all the required validations --
        TravelApp.ValidationSetup.SetupValidation("[data-lp-username]", TravelApp.ValidationSetup.validateUserName, "");
        TravelApp.ValidationSetup.SetupValidation("[data-lp-email]", TravelApp.ValidationSetup.validateEmail, "");
        TravelApp.ValidationSetup.SetupValidation("[data-lp-password]", TravelApp.ValidationSetup.validatePassword, "");
        TravelApp.ValidationSetup.SetupValidation("[data-lp-confirmpassword]", TravelApp.ValidationSetup.validatePassword, "");
        //TravelApp.ValidationSetup.SetupMatchingFieldValidation("[data-lp-password]", "[data-lp-confirmpassword]", TravelApp.ValidationSetup.matchPasswords, 2);
    },

    OCLoginForm: function() {
        if($('.login-form p.error-message').length > 0){
            $('.login-form button').prop("disabled", true);
        } else {
            $('.login-form button').prop("disabled", false);
        }
    },

    OCRegisterForm: function() {
        console.log("Are you being hit");
        if($('.register-form p.error-message').length > 0){
            $('.register-form button').prop("disabled", true);
        } else {
            $('.register-form button').prop("disabled", false);
        }
    },

    DisplayStatusSibling: function(selector, status) {
        $(selector).siblings('.form-error-message').remove();

        var errMsg = $(selector).siblings('.form-error-message');
        if(errMsg.length == 0){
            errMsg = $('<p class="form-error-message"></p>').appendTo($(selector).parent());
        }
        errMsg.html(status);
    }
};

// ----- The Login Template Even Handlers --------------

Template.register.events({
    "submit form": function(event){
        event.preventDefault();

        $('.register-form .error-message').remove();

        var username = $("[data-lp-username]").val();
        var email = $('[data-lp-email]').val();
        var password = $('[data-lp-password]').val();
        var fullname = $('[data-lp-fullname]').val();
        var gender = $('.register-form input[type = "radio"][name = "genderopt"]:checked');
        if(gender.length > 0) {
            gender = gender.val();
        }
        else {
            gender = 'M';
        }

        Accounts.createUser({
            email: email,
            password: password,
            username: username,
            profile: {
                gender: gender,
                fullname: fullname
            }
        }, function(error){
            if(error){
                TravelApp.Index.DisplayStatusSibling('.register-form button', error.reason);
            } else {
                Meteor.call("insertUserData", email, gender, fullname);
            }
        });
        Router.go('home');
        ShowLoader();
    },

    "keyup [data-lp-username]": function() {
        TravelApp.Index.OCRegisterForm();
    },
    "keyup [data-lp-email]": function() {
        TravelApp.Index.OCRegisterForm();
    },
    "keyup [data-lp-password]": function() {
        TravelApp.Index.OCRegisterForm();
    },
    "keyup [data-lp-confirmpassword]": function() {
        TravelApp.Index.OCRegisterForm();
    },
    "keyup .register-form button": function(){
        $(this).siblings(".form-error-message").remove();
    }
});

Template.navigation.events({
    "click .logout": function(event){
        event.preventDefault();
        Meteor.logout();
        Router.go('home');
    }
});

Template.login.events({
    "submit form": function(event) {
        event.preventDefault();

        $('.login-form .error-message').remove();

        var email = $('[data-lp-email]').val();
        var password = $('[data-lp-password]').val();

        Meteor.loginWithPassword(email, password, function(error){
            if(error) {
                TravelApp.Index.DisplayStatusSibling('.login-form button', error.reason);
            } else {
                //ShowLoader();
            }
        });
    },
    "keyup [data-lp-email]": function() {
        TravelApp.Index.OCLoginForm();
    },
    "keyup [data-lp-username]": function() {
        TravelApp.Index.OCLoginForm();
    },
    "keyup .login-form button": function(){
        $(this).siblings(".form-error-message").remove();
    }
});

Template.footer.events = {
    //"click [data-footer-addevent]": function(event){
    //    event.preventDefault();
    //}
}