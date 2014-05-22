// users/auth.js

function userIsRegistered(username, apikey, worker) {
    require("./app").initApp();
    worker.port.emit("user-ok", username);
}
        
function checkRegisteredUsers() {
    require("sdk/passwords").search({
        url: require("sdk/self").uri,
        onComplete: function onComplete(credentials) {
            if (credentials.length == 0)    {
                return false;
            } else {
                return true;
            }
        }
    });
}
exports.checkRegisteredUsers = checkRegisteredUsers;

function loginOK(request, username, apikey, worker) {
    storeUser(username, apikey, worker)
}

function loginERROR(request, username, apikey, worker) {
    var allheaders = request.getAllResponseHeaders();
    worker.port.emit("user-error", username, request.responseText);
}

function login(username, apikey, worker) {
    require("./comms").login(
            username, apikey, loginOK, loginERROR, worker);
}
exports.login = login;

function storeUser(username, apikey, worker) {
    require("sdk/passwords").search({
        url: require("sdk/self").uri,
        username: username,
        onComplete: function onComplete(credentials) {
            if (credentials.length == 0)    {
                require("sdk/passwords").store({
                    realm: "User Registration",
                    username: username,
                    password: apikey,
                    onComplete: function() {
                        setCurrentUser(username);
                        userIsRegistered(username, apikey, worker);
                    }
                })
            } else {
                credentials.forEach(function(credential) {
                    resetUser(
                            credential.username,
                            credential.password,
                            apikey,
                            userIsRegistered,
                            worker)
                });
            }
        }
    });
}
exports.storeUser = storeUser;

function resetUser(username, oldkey, newkey, cb, worker) {
    require("sdk/passwords").remove({
        realm: "User Registration",
        username: username,
        password: oldkey,
        onComplete: function onComplete() {
            require("sdk/passwords").store({
                realm: "User Registration",
                username: username,
                password: newkey,
                onComplete: function() {
                    setCurrentUser(username);
                    cb(username, newkey, worker);
                }
            })
        }
    });
}

function setCurrentUser(username)   {
    require('sdk/simple-prefs').prefs['user'] = username;
}

function getCurrentUser()   {
    return require('sdk/simple-prefs').prefs['user'];
}
exports.getCurrentUser = getCurrentUser;

function isRegistered()   {
    return getCurrentUser() != "";
}
exports.isRegistered = isRegistered;

function logout()   {
    require("./app").endApp();
    require('sdk/simple-prefs').prefs['user'] = "";
}
exports.logout = logout;

var _user_key = null;
function resetUserKey()   {
    _user_key = null;
}
exports.resetUserKey = resetUserKey;

function getCurrentUserKey(cb)   {
    var username = getCurrentUser();
    if (_user_key != null)   {
        cb(username, _user_key);
    } else {
        require("sdk/passwords").search({
            url: require("sdk/self").uri,
            username: username,
            onComplete: function onComplete(credentials) {
                if (credentials.length > 0)    {
                    credentials.forEach(function(credential) {
                        _user_key = credential.password;
                        cb(username, _user_key);
                    });
                }
            }
        }); 
    }
}
exports.getCurrentUserKey = getCurrentUserKey;
