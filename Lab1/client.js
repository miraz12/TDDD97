var welcomeView;
var profileView;

test = function(){
    console.log("Test");
}

loginClicked = function(){
    console.log("loginClicked");
    var form = document.getElementById("loginForm");
    var username = form.elements["inputEmail"].value;
    var password = form.elements["inputPassword"].value;
    
    var returnMessage = serverstub.signIn(username, password);
    var token = returnMessage.data;

    
    //console.log(returnMessage.message);
    //console.log("token is " + token);
    document.getElementById("singIn-error").innerHTML = returnMessage.message;
    if(returnMessage.success === true)
    {
        localStorage.setItem("token", token);
        displayView();
    }

}

logoutClicked = function() {
     localStorage.removeItem("token");
     displayView();
}

loadPersonalInfo = function(){
    var dataObj = serverstub.getUserDataByToken(localStorage.getItem("token")).data;
    console.log(dataObj);
    document.getElementById("nameLabel").innerHTML = dataObj.firstname;
    document.getElementById("familynameLabel").innerHTML = dataObj.familyname;
    document.getElementById("emailLabel").innerHTML = dataObj.email;
    document.getElementById("genderLabel").innerHTML = dataObj.gender;
    document.getElementById("cityLabel").innerHTML = dataObj.city;
    document.getElementById("countryLabel").innerHTML = dataObj.country;
}


displayView = function(){
 // the code required to display a view
    var token = localStorage.getItem("token");
    if(token !== null)
    {
        document.getElementById("body").innerHTML = profileView.innerHTML;
        openTab("homeTab"); //Hard code is best code
    }
    else
    {
        document.getElementById("body").innerHTML = welcomeView.innerHTML;
    }
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
    console.log("signUpClicked");
    var from = document.getElementById("signupForm");
    var name = from.elements["Name"];
    var familyname = from.elements["Family"];
    var gender = from.elements["Gender"];
    var city = from.elements["City"];
    var country = from.elements["Country"];
    var email = from.elements["Email"];
    var password = from.elements["Password"];
    var rptPassword = from.elements["RptPassword"];

    if(password.value !== rptPassword.value)
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

openTab = function(tab){

    document.getElementById("homeTab").style.display = "none";
    document.getElementById("browseTab").style.display = "none";
    document.getElementById("accountTab").style.display = "none";

    if(tab === "homeTab"){
        document.getElementById("homeTab").style.display = "block";    
    }
    else if(tab === "browseTab"){
        document.getElementById("browseTab").style.display = "block";
    }
    else if(tab === "accountTab"){
        document.getElementById("accountTab").style.display = "block";        
    }
}

//Click functions for meny
homePressed = function(){
    console.log("homePressed");
    loadPersonalInfo();
    openTab("homeTab");
    
}

browsePressed = function(){
    console.log("browsePressed");
    openTab("browseTab");
    
}

accountPressed = function(){
    console.log("accountPressed");    
    openTab("accountTab");
    
}

changePasswordClicked = function(){
    console.log("changePWPressed");
    var form = document.getElementById("changePasswordForm");
    var password = form.elements["Password"];
    var rptPassword = form.elements["RptPassword"];
    var oldPassword = form.elements["oldPassword"];

    if(password.value !== rptPassword.value)
    {
        console.log("Error, passords doesn't match");
    }
    else{
        var returnMessage = serverstub.changePassword(localStorage.getItem("token"), oldPassword, password);
        console.log(returnMessage);
        document.getElementById("changePW-error").innerHTML = returnMessage.message; //DETTA ÄR KNAS MEN DET FUNKAR (fel return message)
        
    }
}

refreshWallClicked = function(){
    console.log("refresh wall clicked");
}

postClicked = function(){
    console.log("post on wall clicked");
}