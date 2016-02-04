/**
 * Created by Creative Works on 1/31/2016.
 */

TravelApp =(typeof TravelApp == "undefined")?({}):(TravelApp);

TravelApp.DisplayStuff = {
    // -- Yup.. the validation is successful --
    SuccessfulTest: "OK",

    // -- First, check off the registration errors --
    ShortUserName: "Username must be atleast 8 characters long.",
    ShortPassword: "Password must be atleast 8 characters long",
    PasswordsMismatch: "The passwords entered do not match",
    InvalidMailAddress: "Please enter a valid mail address",
    AdultDOB: "Must be atleast 18 or over to register",
    GenderCheck: "Please select a gender",

    // -- Now, the login errors --
    WrongUserName: "The username entered does not exist",
    WrongPassword: "The password and the username do not match",
};