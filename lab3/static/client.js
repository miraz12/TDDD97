var welcomeView;
var profileView;
var userInfo;
var webSocket;

test = function(){
    //console.log("Test");
}

logout = function () {
    localStorage.removeItem("token");
    displayView();

}

testWS = function () {
    webSocket = new WebSocket("ws://localhost:5000/api");
    console.log("testWS");
    webSocket.onopen = function () {
        console.log("ws open");
    }
    webSocket.onmessage = function (event) {
        console.log("message received");
        console.log(event);
        console.log(event.data);
        //var fr = new FileReader();
        //var text = fr.readAsText(event.data);
        //console.log(text);
        var msg = JSON.parse(event.data);
        if(msg.type == "logout"){
            console.log("call log out");
            logout();
        }
        console.log(msg);
    }
    webSocket.onclose = function () {
        console.log("ws closed");
    }
}

loginClicked = function(emailIn = '', passwordIn = ''){
    //console.log("loginClicked");

    var password;
    var username;

    if(emailIn == '' && passwordIn == '')
    {
        var form = document.getElementById("loginForm");
        username = form.elements["inputEmail"].value;
        password = form.elements["inputPassword"].value;
    }
    else
    {
        username = emailIn;
        password = passwordIn;
    }


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
    formData.set("inputPassword", password);
    formData.set("inputEmail", username);
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
                var msg = {
                    type : "login",
                    id : token,
                    email : userInfo[0]

                }
                webSocket.send(JSON.stringify(msg));
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
    testWS();
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
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function (ev) {
            if (xmlhttp.readyState === 4 && this.status === 200) {
                var returnMessage = JSON.parse(xmlhttp.responseText);
                document.getElementById("singUp-error").innerHTML = returnMessage.message;
                if(returnMessage.success === true)
                {
                    loginClicked(email.value, password.value);
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

    var token = localStorage.getItem("token");

    var xmlhttp = new XMLHttpRequest();
     xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && this.status === 200) {

            var returnMessage = JSON.parse(xmlhttp.responseText);
            document.getElementById("changePW-error").innerHTML = returnMessage.message;
        }
     }

    var formD = new FormData(document.getElementById("changePasswordForm"));
    xmlhttp.open("POST", "/change-password/" + token);
    xmlhttp.send(formD);

}

refreshWallClicked = function(){
    //console.log("refresh wall clicked");
    //var posts = serverstub.getUserMessagesByToken(localStorage.getItem("token")).data;
    //console.log(posts);
    var token = localStorage.getItem("token");

    var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && this.status === 200) {
            var returnMessage = JSON.parse(xmlhttp.responseText);
            if(returnMessage.success)
            {
                var posts = returnMessage.data;
                var wallDiv = document.getElementById("postsDiv");
                wallDiv.innerHTML = "";
                for(var i = 0; i < posts.length; i++){
                    var tmpDiv = document.createElement("div");
                    tmpDiv.setAttribute("class", "wallPosts");
                    tmpDiv.innerText = posts[i][0] + ": " + posts[i][2];
                    wallDiv.appendChild(tmpDiv);
                }
            }

        }}
        xmlhttp.open("GET", "/fetch-messages-token/"+token);
        xmlhttp.send();
}

postClicked = function(){
    //console.log("post on wall clicked");
    var text = document.getElementById("postInput").value;
    document.getElementById("postInput").value = ""; //Clear textarea

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && this.status === 200) {
        var returnMessage = JSON.parse(xmlhttp.responseText);

    }}

    xmlhttp.open("POST", "/add-message");
    xmlhttp.setRequestHeader("Content-Type", "application/json;");
    xmlhttp.send(JSON.stringify({"token": localStorage.getItem("token"), "message": text, "email": userInfo[0]}));


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

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && this.status === 200) {
        var returnMessage = JSON.parse(xmlhttp.responseText);

    }}

    xmlhttp.open("POST", "/add-message");
    xmlhttp.setRequestHeader("Content-Type", "application/json;");
    xmlhttp.send(JSON.stringify({"token": localStorage.getItem("token"), "message": text, "email": userEmail}));


    refreshWallClicked();
    //console.log(retM.message);

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

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && this.status === 200) {
            var returnMessage = JSON.parse(xmlhttp.responseText);
            posts = returnMessage.data;
            var wallDiv = document.getElementById("userPostsDiv");
            wallDiv.innerHTML = "";
            for(var i = 0; i < posts.length; i++){
            var tmpDiv = document.createElement("div");
            tmpDiv.setAttribute("class", "wallPosts");
            tmpDiv.innerText = posts[i][0] + ": " + posts[i][2];
            wallDiv.appendChild(tmpDiv);
        }
        }}
        xmlhttp.open("GET", "/fetch-messages-email/"+userEmail);
        xmlhttp.send();
    }
}