// app/workers.js

// ADMONITOR
const { getDomainFromString } = require("../utils/urls");
const { checkRegisteredUsers,
        getCurrentUser, 
        getCurrentUserKey,
        logout,
        login,
        storeUser} = require("./auth");

var uiWorkers = [];
var fbWorkers = [];

function attachUIWorker(worker) {
    uiWorkers.push(worker);
    var username = getCurrentUser();
    if (username)   {
        worker.port.emit("user-ok", username);
    } else {
        worker.port.emit("user-none");
    }
    // comms
    worker.on('detach', function() {
        detachWorker(this, uiWorkers);
    });
    worker.port.on('check-auth', function(message) {
        checkRegisteredUsers();
    });
    worker.port.on('store-auth', function(data) {
        storeUser(data.username, data.apikey, worker);
    });
    worker.port.on("check-key", function(data) {
        getCurrentUserKey();
    });
    worker.port.on("do-login", function(data) {
        login(data.username, data.apikey, worker);
    });
    worker.port.on("do-logout", function(data) {
        logout();
        worker.port.emit("user-none");
    });
    worker.port.on("request-key", function(data) {
        requestKey();
    });
}
exports.attachUIWorker = attachUIWorker;

function requestKey()  {
    require("sdk/tabs").open(require("./comms").getSetupURL());
}

function attachFBWorker(worker) {
    fbWorkers.push(worker);
    worker.on('detach', function () {
        detachWorker(this, fbWorkers);
    });
}
exports.attachFBWorker = attachFBWorker;

function attachWorker(worker) {
    var workerArray;
    if (getDomainFromString(worker.tab.url) === "facebook.com") {
        workerArray = fbWorkers;
    } else {
        worker.destroy();
    }
    if (workerArray)   {
        workerArray.push(worker);
        worker.on('detach', function () {
            detachWorker(this, workerArray);
        });
    }
}
exports.attachWorker = attachWorker;

function detachWorker(worker, workerArray) {
    var index = workerArray.indexOf(worker);
    if(index != -1) {
        workerArray.splice(index, 1);
    }
}

function updateFBWorkers(action, data)    {
    fbWorkers.forEach(function(worker) {
        worker.port.emit(action, data);
    });
}
exports.updateFBWorkers = updateFBWorkers;

function updateUIWorkers(action, data)    {
    uiWorkers.forEach(function(worker) {
        worker.port.emit(action, data);
    });
}
exports.updateUIWorkers = updateUIWorkers;

function resetFBWorkers()    {
    fbWorkers.forEach(function(worker) {
        worker.destroy();
    });
    fbWorkers = [];
}
exports.resetFBWorkers = resetFBWorkers;
