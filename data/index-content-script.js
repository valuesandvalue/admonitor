// data/index-content-script.js

document.defaultView.addEventListener('message', function(event) {
    if (event.data === "do-login") {
        doLogin();
    } else if (event.data === "do-logout") {
        self.port.emit("do-logout");
    } else if (event.data === "request-key") {
        self.port.emit("request-key");
    } 
}, false);

self.port.on("update", function(record) {
    console.log("Update UI:" + record);
    if (isImageContent(record.contentType))  {
        $("#ad-list").append("<tr><td>"+record.rating+
            "</td><td>"+record.ref+
            "</td><td><img src=\""+record.url+"\" width=\"40\" height=\"40\">"+
            "</td><td><a href=\""+record.url+"\">"+truncate(record.url)+
            "</a></td><td>"+record.contentType+"</td></tr>");
    } else {
        $("#ad-list").append("<tr><td>"+record.rating+
            "</td><td>"+record.ref+
            "</td><td>&nbsp;"+
            "</td><td><a href=\""+record.url+"\">"+truncate(record.url)+
            "</a></td><td>"+record.contentType+"</td></tr>");
    }
});

self.port.on("user-ok", function(username) {
    showUserPanel(username);
});

self.port.on("user-none", function() {
    showLoginPanel();
});

self.port.on("user-error", function(username, message) {
    showLoginPanelError("Unable to login, please try again.");
});

self.port.on("set-message", function(message) {
    showMessage(message);
});

self.port.on("clear-message", function() {
    clearMessage();
});

function truncate(text) {
    return $.trim(text).substring(0, 64).trim(this) + "...";
}

function isImageContent(ctype)  {
    return ctype.split('/')[0] == "image";
}

function doLogin() {
    var reg = /^[a-z0-9]+$/i;
    var username = $("#id_username").val().trim();
    var apikey = $("#id_apikey").val().trim();
    if(reg.test(username) && reg.test(apikey))  {
        showMessage("Registering with Values & Value ...");
        self.port.emit("do-login", {username: username, apikey: apikey});
    } else {
        if(!reg.test(username)) {
            $("#login-panel #id_username").val('');
        }
        showLoginPanelError("Unable to login, please try again.");
    }
}

function storeApiLogin(username, apikey) {
    self.port.emit("store-auth", {username: username, apikey: apikey});
}

function showLoginPanel()    {
    $("#login-panel").show();
    $("#login-panel #login-error").text('');
    $("#login-panel #login-error").hide();
    $("#user-panel").hide();
    clearMessage();
}

function showLoginPanelError(message)    {
    $("#login-panel #login-error").text(message);
    $("#login-panel #login-error").show();
    $("#login-panel #id_apikey").val('');
    $("#login-panel").show();
    $("#user-panel").hide();
    clearMessage();
}

function hideLoginPanel()    {
    $("#login-panel").hide();
    $("#login-panel #id_username").val('');
    $("#login-panel #id_apikey").val('');
    $("#login-panel #login-error").text('');
    $("#login-panel #login-error").hide();
}

function showUserPanel(username)    {
    hideLoginPanel();
    clearMessage();
    $("#user-panel #username").text(username);
    $("#user-panel").show();
}

function showMessage(message)  {
    $("#user-panel").hide();
    hideLoginPanel();
    $("#message-panel").text(message);
    $("#message-panel").show();
}

function clearMessage()  {
    $("#message-panel").hide();
    $("#message-panel").text('');
}
