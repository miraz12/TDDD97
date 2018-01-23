var welcomeView;
var profileView;
var userInfo;

test = function(){
    //console.log("Test");
}

loginClicked = function(){
    //console.log("loginClicked");
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
    //console.log(userInfo);
    document.getElementById("nameLabel").innerHTML = userInfo.firstname;
    document.getElementById("familynameLabel").innerHTML = userInfo.familyname;
    document.getElementById("emailLabel").innerHTML = userInfo.email;
    document.getElementById("genderLabel").innerHTML = userInfo.gender;
    document.getElementById("cityLabel").innerHTML = userInfo.city;
    document.getElementById("countryLabel").innerHTML = userInfo.country;
}


displayView = function(){
 // the code required to display a view
    var token = localStorage.getItem("token");
    if(token !== null)
    {
        document.getElementById("body").innerHTML = profileView.innerHTML;
        userInfo = serverstub.getUserDataByToken(localStorage.getItem("token")).data;
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
    //console.log("signUpClicked");
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
    //Hide all tabs
    document.getElementById("homeTab").style.display = "none";
    document.getElementById("browseTab").style.display = "none";
    document.getElementById("accountTab").style.display = "none";

    //Set button color to be no active
    document.getElementById("homeTabButton").style.backgroundColor = "inherit";
    document.getElementById("browseTabButton").style.backgroundColor = "inherit";
    document.getElementById("accountTabButton").style.backgroundColor = "inherit";
    

    //Activate the right view aswell as the right button
    if(tab === "homeTab"){
        loadPersonalInfo();
        document.getElementById("homeTab").style.display = "block";
        document.getElementById("homeTabButton").style.backgroundColor = "#ccc";
    }
    else if(tab === "browseTab"){
        document.getElementById("browseEmailLabel").innerHTML = "null";
        document.getElementById("browseTab").style.display = "block";
        document.getElementById("browseTabButton").style.backgroundColor = "#ccc";
    }
    else if(tab === "accountTab"){
        document.getElementById("accountTab").style.display = "block";     
        document.getElementById("accountTabButton").style.backgroundColor = "#ccc";
    }
}

//Click functions for meny
homePressed = function(){
    //console.log("homePressed");
    openTab("homeTab");
    
}

browsePressed = function(){
    //console.log("browsePressed");
    openTab("browseTab");
    
}

accountPressed = function(){
    //console.log("accountPressed");    
    openTab("accountTab");
    
}

changePasswordClicked = function(){
    //console.log("changePWPressed");
    var form = document.getElementById("changePasswordForm");
    var password = form.elements["Password"];
    var rptPassword = form.elements["RptPassword"];
    var oldPassword = form.elements["oldPassword"];

    if(password.value !== rptPassword.value)
    {
        //console.log("Error, passwords doesn't match");
        document.getElementById("changePW-error").innerHTML = "Error, passwords doesn't match";
        
    }
    else{
        var returnMessage = serverstub.changePassword(localStorage.getItem("token"), oldPassword, password);
        //console.log(returnMessage);
        document.getElementById("changePW-error").innerHTML = returnMessage.message; //DETTA ÄR KNAS MEN DET FUNKAR (fel return message)
        
    }
}

refreshWallClicked = function(){
    //console.log("refresh wall clicked");
    var posts = serverstub.getUserMessagesByToken(localStorage.getItem("token")).data;
    //console.log(posts);
    
    var wallDiv = document.getElementById("postsDiv");
    wallDiv.innerHTML = "";
    for(var i = 0; i < posts.length; i++){
        wallDiv.innerHTML += "<div class=\"wallPosts\">" + posts[i].writer + ": " + posts[i].content + "</div>";
    }
}

postClicked = function(){
    //console.log("post on wall clicked");
    var text = document.getElementById("postInput").value;
    document.getElementById("postInput").value = ""; //Clear textarea
    //console.log(text);    
    var retM = serverstub.postMessage(localStorage.getItem("token"),text ,userInfo.email);
    //console.log(retM.message);

}

getUserPage = function(){
    var returnMessage = serverstub.getUserDataByEmail(localStorage.getItem("token"), document.getElementById("userSearch").value);
    document.getElementById("searchUser-error").innerHTML = "";
    //console.log("user search clicked");
    

    if(returnMessage.success === false){
        document.getElementById("searchUser-error").innerHTML = returnMessage.message;
        //console.log("error here");
    }
    else{
        //console.log(returnMessage.data);  
        var userData = returnMessage.data;
        document.getElementById("browseNameLabel").innerHTML = userData.firstname;
        document.getElementById("browseFamilynameLabel").innerHTML = userData.familyname;
        document.getElementById("browseEmailLabel").innerHTML = userData.email;
        document.getElementById("browseGenderLabel").innerHTML = userData.gender;
        document.getElementById("browseCityLabel").innerHTML = userData.city;
        document.getElementById("browseCountryLabel").innerHTML = userData.country;        
    }
}

postToUserClicked = function(){
    //console.log("post on users wall clicked");
    var text = document.getElementById("postUserInput").value;
    document.getElementById("postUserInput").value = ""; //Clear textarea
    //console.log(text);
    
    var userEmail = document.getElementById("browseEmailLabel").innerHTML;
    var retM = serverstub.postMessage(localStorage.getItem("token"),text ,userEmail);
    refreshUserWallClicked(); //Not clicked but still reused
    //console.log(retM.message);
}

refreshUserWallClicked = function(){
    //console.log("refresh user wall clicked");
    var userEmail = document.getElementById("browseEmailLabel").innerHTML;
    if(userEmail === "null"){ //Comparing against content of the div tag is maybe not that good (since we shouldn't display "null" in the first place)
        document.getElementById("searchUser-error").innerHTML = "No selected user"; //Maybe don't have any output 
    }
    else{
        var posts = serverstub.getUserMessagesByEmail(localStorage.getItem("token"),userEmail).data;
        //console.log(posts);
        
        var wallDiv = document.getElementById("userPostsDiv");
        wallDiv.innerHTML = "";
        for(var i = 0; i < posts.length; i++){
            wallDiv.innerHTML += "<div class=\"wallPosts\">" + posts[i].writer + ": " + posts[i].content + "</div>";
        }
    }    
}