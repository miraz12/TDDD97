var welcomeView;
var profileView;

function loginClicked(){
    console.log("Mordin");
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
    var name = from.elements["Name"].value;
    var familyname = from.elements["Family"].value;
    var gender = from.elements["Gender"].value;
    var city = from.elements["City"].value;
    var country = from.elements["Country"].value;
    var email = from.elements["Email"].value;
    var password = from.elements["Password"].value;
    var rptPassword = from.elements["RptPassword"].value;

    if(password != rptPassword)
    {
        //TODO: Display error in text instead of with alert.
        window.alert("Not same password!");
    }
    else    //Signup
    {
        var newUser = {
                "email":email,
                "password":password,
                "firstname":name,
                "familyname":familyname,
                "gender":gender,
                "city":city,
                "country":country
        }

        var returnMessage = serverstub.signUp(newUser);

    }






}