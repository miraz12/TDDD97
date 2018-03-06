var welcomeView;
var profileView;
var userInfo;
var webSocket = null;
var intervalVar;
var chartConfig;

window.onunload = function(){
    document.cookie = "state=" + history.state.page + "; expires=86400000; path=/";
    console.log("cookie is: " + getCookie("state"));
    console.log(history.state.page);
};

window.onpopstate = function (event) {
    //console.log(JSON.stringify(event.state));
    //console.log(event.state.page);
    openTab(event.state.page, true);
};

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

connectWS = function () {
    if(webSocket === null){
        webSocket = new WebSocket("ws://localhost:5000/api");

        webSocket.onmessage = function (event) {

            var msg = JSON.parse(event.data);
            if(msg.type === "logout"){
                localStorage.removeItem("token");
                webSocket.close();
                displayView();
            }
            if(msg.type == "livedata"){
                //Uppdate view of liveData
                //console.log("livedatareceived");
                updateLiveData(msg.nronlineusers, msg.nrwallposts, msg.nrmyposts);
                //console.log(msg);
            }
        };
        webSocket.onclose = function () {
            webSocket = null;
            clearInterval(intervalVar);
        }
    }
    else if(webSocket.readyState === 3){ //shouldn't be used but you never know
        webSocket = new WebSocket("ws://localhost:5000/api");

        var msg = {
            type : "login",
            id : localStorage.getItem("token"),
            email : userInfo[0]
        };

        webSocket.onopen = function () {
            webSocket.send(JSON.stringify(msg));
        }
    }
};

getLiveData = function(){
    connectWS();
    var msg = JSON.stringify({type : "livedata",});
    waitForSocketConnection(function () {
       webSocket.send(msg);
    });
};

waitForSocketConnection = function(callback) {
    setTimeout(
        function () {
            if(webSocket.readyState === 1){
                //console.log("connection is made");
                if(callback != null){
                    callback();
                }
                return;
            }
            else{
                //console.log("waiting for connection...");
                waitForSocketConnection(callback);
            }
        }
        ,5);
};

setupChart = function () {
    ctx = document.getElementById("livedataChart").getContext('2d');
    chartConfig = {
        type: 'bar',
        data: {
            labels: ['Online users', 'Posts on my wall', 'My posts'],
            datasets: [{
                label: "live data",
                data: [0,0,0],
                backgroundColor: ['rgba(255,0,0,1)', 'rgba(0,255,0,1)', 'rgba(0,0,255,1)'],
                borderColor: ['rgba(10,10,10,1)', 'rgba(10,10,10,1)', 'rgba(10,10,10,1)']
            }
            ]
        },
        options: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                    title:{
                        display:false,
                        text:'Live data representation'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                            },
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Value'
                            },
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
        }
    window.myLine = new Chart(ctx, chartConfig);
    getLiveData();
};

updateLiveData = function (users, wallPosts, myPosts) {

    chartConfig.data.datasets[0].data[0] = users;
    chartConfig.data.datasets[0].data[1] = wallPosts;
    chartConfig.data.datasets[0].data[2] = myPosts;

    window.myLine.update();
};

//post request
xmlHttpPOST = function (address, data, xmlhttp, json = false) {

    var token = localStorage.getItem('token');
    xmlhttp.open("POST", address);
    if (json)
        xmlhttp.setRequestHeader("Content-Type", "application/json;");
    xmlhttp.send(data);
};

//get request
xmlHttpGET = function (address, xmlhttp) {
    xmlhttp.open("GET", address);
    xmlhttp.send();
};

loginClicked = function(emailIn='', passwordIn = ''){

    var password;
    var username;
    var tmpBool; //For activation of webSocket

    if(emailIn === '' && passwordIn === '')
    {
        var form = document.getElementById("loginForm");
        username = form.elements["inputEmail"].value;
        password = form.elements["inputPassword"].value;
        tmpBool = true;
    }
    else
    {
        username = emailIn;
        password = passwordIn;
        tmpBool = false;
    }


     var xmlhttp = new XMLHttpRequest();
     xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && this.status === 200) {

            var returnMessage = JSON.parse(xmlhttp.responseText);
            var token = returnMessage.data;

            if(returnMessage.success === true)
            {
                localStorage.setItem("token", token);

                if(tmpBool){
                    var msg = {
                    type : "login",
                    email : username
                    };

                    connectWS();
                    webSocket.onopen = function () {
                        //console.log("ws open");
                        webSocket.send(JSON.stringify(msg));
                    }
                }

                displayView();
            }
            else
            {
                document.getElementById("singIn-error").innerHTML = returnMessage.message;
            }
        }
    };

    var formData = new FormData( document.getElementById("loginForm"));
    formData.set("inputPassword", password);
    formData.set("inputEmail", username);
    xmlHttpPOST("sign-in", formData, xmlhttp)
};

logoutClicked = function() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && this.status === 200) {
        var returnMessage = JSON.parse(xmlhttp.responseText);
        if(returnMessage.success === true){
            localStorage.removeItem("token");

        }
    }};

    if(webSocket !== null){
        webSocket.close();
    }

    clearInterval(intervalVar);

    xmlHttpPOST("sign-out", JSON.stringify({"token": localStorage.getItem("token")}), xmlhttp, true);
    displayView();

};

loadPersonalInfo = function(){
    document.getElementById("emailLabel").innerText = userInfo[0];
    document.getElementById("nameLabel").innerText = userInfo[2];
    document.getElementById("familynameLabel").innerText = userInfo[3];
    document.getElementById("genderLabel").innerText = userInfo[4];
    document.getElementById("cityLabel").innerText = userInfo[5];
    document.getElementById("countryLabel").innerText = userInfo[6];
};


displayView = function(){
    //the code required to display a view
    var token = localStorage.getItem("token");
    //console.log("Token is" + token);
    //console.log(getCookie("state"));

    if(token !== null)
    {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && this.status === 200) {
            var returnMessage = JSON.parse(xmlhttp.responseText);
            if(returnMessage.success === true){

                document.getElementById("body").innerHTML = profileView.innerHTML;
                userInfo = returnMessage.data;

                if(getCookie("state") === ""){
                    openTab("homeTab");
                    refreshWallClicked();
                    setupChart();
                }
                else{
                    var msg = {
                    type : "login",
                    email : userInfo[0]
                    };

                    connectWS();
                    webSocket.onopen = function () {
                        //console.log("ws open");
                        webSocket.send(JSON.stringify(msg));
                    }
                    openTab(getCookie("state"));
                    refreshWallClicked();
                    setupChart();
                }
            }
            else{
                localStorage.removeItem("token");
                document.getElementById("body").innerHTML = welcomeView.innerHTML;
            }
        }};

        xmlHttpGET("/fetch-user-token/" + token, xmlhttp);
    }
    else
    {
        document.getElementById("body").innerHTML = welcomeView.innerHTML;
        document.cookie = "";
    }
};

displayProfileView = function(){
    document.getElementById("body").innerHTML = profileView.innerHTML;
};

window.onload = function(){
    //Setup variables
    welcomeView = document.getElementById("welcomeview");
    profileView = document.getElementById("profileview");
    displayView();
};

signUpClicked = function () {
    var from = document.getElementById("signupForm");
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
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && this.status === 200) {
                var returnMessage = JSON.parse(xmlhttp.responseText);
                document.getElementById("singUp-error").innerHTML = returnMessage.message;
                if(returnMessage.success === true)
                {
                    loginClicked(email.value, password.value);
                }
            }
        };

        var formData = new FormData( document.getElementById("signupForm"));
        xmlHttpPOST("/sign-up", formData, xmlhttp)
    }

};


openTab = function(tab, auto = false){
    //Hide all tabs
    //console.log(history.state);
    document.getElementById("homeTab").style.display = "none";
    document.getElementById("browseTab").style.display = "none";
    document.getElementById("accountTab").style.display = "none";

    //Set button color to be no active
    document.getElementById("homeTabButton").style.backgroundColor = "inherit";
    document.getElementById("browseTabButton").style.backgroundColor = "inherit";
    document.getElementById("accountTabButton").style.backgroundColor = "inherit";


    //Activate the right view aswell as the right button
    if(tab === "homeTab"){
        if(!auto){
            history.pushState({page: "homeTab"}, "", "home.html")
        }
        loadPersonalInfo();
        document.getElementById("homeTab").style.display = "block";
        document.getElementById("homeTabButton").style.backgroundColor = "#ccc";
        getLiveData();

    }
    else if(tab === "browseTab"){
        if(!auto) {
            history.pushState({page: "browseTab"}, "", "browse.html");
        }
        document.getElementById("browseEmailLabel").innerText = "null";
        document.getElementById("browseTab").style.display = "block";
        document.getElementById("browseTabButton").style.backgroundColor = "#ccc";
    }
    else if(tab === "accountTab"){
        if(!auto) {
            history.pushState({page: "accountTab"}, "", "account.html");
        }
        document.getElementById("accountTab").style.display = "block";
        document.getElementById("accountTabButton").style.backgroundColor = "#ccc";
    }
};

//Click functions for menu
homePressed = function(){
    openTab("homeTab");

};

browsePressed = function(){
    openTab("browseTab");

};

accountPressed = function(){
    openTab("accountTab");

};

//Changes password
changePasswordClicked = function(){
    var token = localStorage.getItem("token");

    var xmlhttp = new XMLHttpRequest();
     xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && this.status === 200) {

            var returnMessage = JSON.parse(xmlhttp.responseText);
            document.getElementById("changePW-error").innerHTML = returnMessage.message;
        }
     };

     var from = document.getElementById("changePasswordForm");
     var oldPass = from.elements['oldPassword'].value;
     var rptNewPass = from.elements['RptPassword'].value;
     var newPass = from.elements['Password'].value;
     if(newPass === rptNewPass)
     {
         var hased_token = CryptoJS.SHA256("/change-password/" + token);

         var data = JSON.stringify({"token": localStorage.getItem("token"), "oldPass": oldPass, "newPass": newPass, "email": userInfo[0]});
         xmlHttpPOST("/change-password/" + hased_token , data, xmlhttp, true)
     }
     else
     {
         document.getElementById("changePW-error").innerHTML = 'Passwords not matching'
     }

};

//Refreshes own wall
refreshWallClicked = function(){
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
                    tmpDiv.setAttribute("draggable", "true");
                    tmpDiv.setAttribute("ondragstart", "drag(event)");
                    tmpDiv.innerText = posts[i][0] + ": " + posts[i][2];
                    wallDiv.prepend(tmpDiv);
                }
            }

        }};

        var hased_token = CryptoJS.SHA256("/fetch-messages-token/" + token);
        xmlHttpGET("/fetch-messages-token/"+ hased_token + "/" + userInfo[0], xmlhttp)

};

//Posts message to selected users wall
postClicked = function(){
    var text = document.getElementById("postInput").value;
    document.getElementById("postInput").value = ""; //Clear textarea

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && this.status === 200) {
        //var returnMessage = JSON.parse(xmlhttp.responseText);

    }};

    var hashed_token = CryptoJS.SHA256("/add-message" + localStorage.getItem("token"));
    var data = JSON.stringify({"token": hashed_token, "message": text, "email": userInfo[0], "senderEmail": userInfo[0]})

    xmlHttpPOST("/add-message", data, xmlhttp, true);
    refreshWallClicked();

};

//Gets user data
getUserPage = function(){
    var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && this.status === 200) {
            var returnMessage = JSON.parse(xmlhttp.responseText);

            document.getElementById("searchUser-error").innerHTML = "";

            if(returnMessage.success === false){
                    document.getElementById("searchUser-error").innerHTML = returnMessage.message;
            }
            else{
                var userData = returnMessage.data;
                document.getElementById("browseEmailLabel").innerText = userData[0];
                document.getElementById("browseNameLabel").innerText = userData[2];
                document.getElementById("browseFamilynameLabel").innerText = userData[3];
                document.getElementById("browseGenderLabel").innerText = userData[4];
                document.getElementById("browseCityLabel").innerText = userData[5];
                document.getElementById("browseCountryLabel").innerText = userData[6];
                refreshUserWallClicked();
            }
        }};
        xmlHttpGET("/fetch-user-email/"+document.getElementById("userSearch").value, xmlhttp);
};

//Post to selected user
postToUserClicked = function(){
    var text = document.getElementById("postUserInput").value;
    document.getElementById("postUserInput").value = ""; //Clear textarea
    var userEmail = document.getElementById("browseEmailLabel").innerText;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && this.status === 200) {
        //var returnMessage = JSON.parse(xmlhttp.responseText);

    }};

    var hashed_token = CryptoJS.SHA256("/add-message" + localStorage.getItem("token"));
    var data = JSON.stringify({"token": hashed_token, "message": text, "email": userEmail, "senderEmail": userInfo[0]})

    xmlHttpPOST("/add-message", data, xmlhttp, true);
    refreshWallClicked();
    refreshUserWallClicked(); //Not clicked but still reused

};

//Refreshes the wall of selected user
refreshUserWallClicked = function(){
    var userEmail = document.getElementById("browseEmailLabel").innerText;
    //Comparing against content of the div tag is maybe not that good (since we shouldn't display "null" in the first place)
    if(userEmail === "null"){
        document.getElementById("searchUser-error").innerHTML = "No selected user";
    }
    else{

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && this.status === 200) {
            var returnMessage = JSON.parse(xmlhttp.responseText);
            var posts = returnMessage.data;
            var wallDiv = document.getElementById("userPostsDiv");
            wallDiv.innerHTML = "";
            for(var i = 0; i < posts.length; i++){
            var tmpDiv = document.createElement("div");
            tmpDiv.setAttribute("class", "wallPosts");
            tmpDiv.innerText = posts[i][0] + ": " + posts[i][2];
            wallDiv.prepend(tmpDiv);
        }
        }};

        xmlHttpGET("/fetch-messages-email/"+userEmail, xmlhttp)
    }
};

allowDrop = function(ev) {
    ev.preventDefault();
};

//Gets the innerHTML text of the div that is being dragd
drag = function (ev) {
    ev.dataTransfer.setData("text", ev.target.innerHTML);
};


//Takes the the text from the dragd object and copies it into the form
drop = function (ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    document.getElementById("postInput").value = data;

};