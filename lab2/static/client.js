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


     var xmlhttp = new XMLHttpRequest();
     xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && this.status === 200) {

            var returnMessage = JSON.parse(xmlhttp.responseText);
            var token = returnMessage.data;


            if(returnMessage.success === true)
            {
                localStorage.setItem("token", token);
                displayView();
            }
            else
            {
                document.getElementById("singIn-error").innerHTML = returnMessage.message;
            }
        }
     }
     var formData = new FormData( document.getElementById("loginForm"));
     xmlhttp.open("POST", "/sign-in");
     xmlhttp.send(formData);
}

logoutClicked = function() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && this.status === 200) {
        var returnMessage = JSON.parse(xmlhttp.responseText);
        if(returnMessage.success === true){
            localStorage.removeItem("token");
        }
    }}

    xmlhttp.open("POST", "/sign-out");
    xmlhttp.setRequestHeader("Content-Type", "application/json;");
    xmlhttp.send(JSON.stringify({"token": localStorage.getItem("token")}));
    displayView();

}

loadPersonalInfo = function(){
    //console.log(userInfo);
    document.getElementById("emailLabel").innerText = userInfo[0];
    document.getElementById("nameLabel").innerText = userInfo[2];
    document.getElementById("familynameLabel").innerText = userInfo[3];
    document.getElementById("genderLabel").innerText = userInfo[4];
    document.getElementById("cityLabel").innerText = userInfo[5];
    document.getElementById("countryLabel").innerText = userInfo[6];
}


displayView = function(){
 // the code required to display a view
    var token = localStorage.getItem("token");
    if(token !== null)
    {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && this.status === 200) {
            var returnMessage = JSON.parse(xmlhttp.responseText);
            if(returnMessage.success === true){

                document.getElementById("body").innerHTML = profileView.innerHTML;
                userInfo = returnMessage.data;
                openTab("homeTab"); //Hard code is best code
            }
            else{
                localStorage.removeItem("token");
                document.getElementById("body").innerHTML = welcomeView.innerHTML;
            }
        }}

        xmlhttp.open("GET", "/fetch-user-token/"+token);
        xmlhttp.send();

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
            "email": email.value,
            "password": password.value,
            "firstname": name.value,
            "familyname": familyname.value,
            "gender": gender.value,
            "city": city.value,
            "country": country.value
        }


        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function (ev) {
            if (xmlhttp.readyState === 4 && this.status === 200) {
                var returnMessage = JSON.parse(xmlhttp.responseText);
                document.getElementById("singUp-error").innerHTML = returnMessage.message;
                if(returnMessage.success === true)
                {
                    returnMessage = serverstub.signIn(email, password);
                    console.log(returnMessage);
                    if(returnMessage.success === true)
                    {
                       localStorage.setItem("token", returnMessage.data);
                       displayView();
                    }
                }
            }
        }
        var formData = new FormData( document.getElementById("signupForm"));
        xmlhttp.open("POST", "/sign-up");
        xmlhttp.send(formData);

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
        document.getElementById("browseEmailLabel").innerText = "null";
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
    var password = form.elements["Password"].value;
    var rptPassword = form.elements["RptPassword"].value;
    var oldPassword = form.elements["oldPassword"].value;

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
        var tmpDiv = document.createElement("div");
        tmpDiv.setAttribute("class", "wallPosts");
        tmpDiv.innerText = posts[i].writer + ": " + posts[i].content;            
        wallDiv.appendChild(tmpDiv);
    }
}

postClicked = function(){
    //console.log("post on wall clicked");
    var text = document.getElementById("postInput").value;
    document.getElementById("postInput").value = ""; //Clear textarea
    //console.log(text);    
    var retM = serverstub.postMessage(localStorage.getItem("token"),text ,userInfo[0]);
    refreshWallClicked();
    //console.log(retM.message);

}

getUserPage = function(){
    var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && this.status === 200) {
            var returnMessage = JSON.parse(xmlhttp.responseText);

            document.getElementById("searchUser-error").innerHTML = "";

            if(returnMessage.success === false){
                    document.getElementById("searchUser-error").innerHTML = returnMessage.message;
                    //console.log("error here");
            }
            else{
                //console.log(returnMessage.data);
                var userData = returnMessage.data;
                document.getElementById("browseEmailLabel").innerText = userData[0];
                document.getElementById("browseNameLabel").innerText = userData[2];
                document.getElementById("browseFamilynameLabel").innerText = userData[3];
                document.getElementById("browseGenderLabel").innerText = userData[4];
                document.getElementById("browseCityLabel").innerText = userData[5];
                document.getElementById("browseCountryLabel").innerText = userData[6];
            }
        }}
        xmlhttp.open("GET", "/fetch-user-email/"+document.getElementById("userSearch").value);
        xmlhttp.send();
}

postToUserClicked = function(){
    //console.log("post on users wall clicked");
    var text = document.getElementById("postUserInput").value;
    document.getElementById("postUserInput").value = ""; //Clear textarea
    //console.log(text);
    
    var userEmail = document.getElementById("browseEmailLabel").innerText;
    var retM = serverstub.postMessage(localStorage.getItem("token"),text ,userEmail);
    refreshUserWallClicked(); //Not clicked but still reused
    //console.log(retM.message);
}

refreshUserWallClicked = function(){
    //console.log("refresh user wall clicked");
    var userEmail = document.getElementById("browseEmailLabel").innerText;
    if(userEmail === "null"){ //Comparing against content of the div tag is maybe not that good (since we shouldn't display "null" in the first place)
        document.getElementById("searchUser-error").innerHTML = "No selected user"; //Maybe don't have any output 
    }
    else{
        var posts = serverstub.getUserMessagesByEmail(localStorage.getItem("token"),userEmail).data;
        //console.log(posts);

        var wallDiv = document.getElementById("userPostsDiv");
        wallDiv.innerHTML = "";
        for(var i = 0; i < posts.length; i++){
            var tmpDiv = document.createElement("div");
            tmpDiv.setAttribute("class", "wallPosts");    
            tmpDiv.innerText = posts[i].writer + ": " + posts[i].content;            
            wallDiv.appendChild(tmpDiv);
        }
    }    
}