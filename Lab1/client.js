var welcomeView;
var profileView;
var token;

loginClicked = function(){
    var form = document.getElementById("loginForm");
    var username = form.elements["inputEmail"].value;
    var password = form.elements["inputPassword"].value;    
    
    var dataObj = {"username":username, "password":password};
    var returnMessage = serverstub.signIn(dataObj);
    token = returnMessage.data;

    console.log(returnMessage.message); //TODO: where to display?
    console.log("token is " + token);
}



displayView = function(){
 // the code required to display a view
    document.getElementById("body").innerHTML = welcomeView.innerHTML;
};

displayProfileView = function(){
    document.getElementById("body").innerHTML = profileView.innerHTML;
};

window.onload = function(){
 //code that is executed as the page is loaded.
 //You shall put your own custom code here.
 //window.alert() is not allowed to be used in your implementation.
 //window.alert("Hello TDDD97!");

    //Setup variables
    welcomeView = document.getElementById("welcomeview");
    profileView = document.getElementById("profileview");
    displayView();
};

signUpClicked = function () {
    var from = document.getElementById("signupForm");
    var name = from.elements["Name"];
    var familyname = from.elements["Family"];
    var gender = from.elements["Gender"];
    var city = from.elements["City"];
    var country = from.elements["Country"];
    var email = from.elements["Email"];
    var password = from.elements["Password"];
    var rptPassword = from.elements["RptPassword"];

    if(password.value != rptPassword.value)
    {
        document.getElementById("singUp-error").innerHTML = "Passwords not matching!";
    }
    else    //Signup
    {
        var newUser = {
                "email":email.value,
                "password":password.value,
                "firstname":name.value,
                "familyname":familyname.value,
                "gender":gender.value,
                "city":city.value,
                "country":country.value
        }

        var returnMessage = serverstub.signUp(newUser);
        document.getElementById("singUp-error").innerHTML = returnMessage.message;
    }
}