var welcomeView;
var profileView;

loginClicked = function(){
    console.log("login clicked");
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
