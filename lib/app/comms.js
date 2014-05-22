// app/comms.js

// SDK
const xhr = require("sdk/net/xhr");
const errors = require("./errors");

// CONSTANTS
const API_URL = "https://values.doc.gold.ac.uk/api/v1/";

var _username = null;
var _userkey = null;

function getSetupURL() {
    return "https://values.doc.gold.ac.uk/admonitor/#register";
}
exports.getSetupURL = getSetupURL;

function makeAPIURL(endpoint)   {
    return API_URL + endpoint + "/";
}

function setupComms(username, apikey) {
    _username = username;
    _userkey = apikey;
}
exports.setupComms = setupComms;

function start() {
    require("./auth").getCurrentUserKey(setupComms);
}
exports.start = start;

function stop() {
    _username = null;
    _userkey = null;
}
exports.stop = stop;

function authHeader()    {
    return "ApiKey " + _username + ":" + _userkey;
}

function login(username, apikey, onSuccess, onError, worker) {
    var submitUrl = makeAPIURL("login");
    var request = new xhr.XMLHttpRequest();
    
    request.open('GET', submitUrl, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", 
                            "ApiKey " + username + ":" + apikey);
    request.onreadystatechange = function(e) {
        if (request.readyState == 4) {
            if (request.status == 200 || request.status == 201 || 
                        request.status == 202) {
                onSuccess(request, username, apikey, worker);
            } else {
                onError(request, username, apikey, worker);
            }
        }
    };
    request.send();
}
exports.login = login;

function submitData(action, endpoint, data) {
    var request = new xhr.XMLHttpRequest();
    request.open(action, makeAPIURL(endpoint), true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", authHeader());
    request.onreadystatechange = function(e) {
        if (request.readyState == 4) {
            if (request.status < 200 || request.status > 202) {
                errors.showErrorMessage("Error: " + request.status + " Unable to send data.");
            }
        }
    };
    request.send(JSON.stringify(data));
}

function submitURLData(data) {
    submitData("POST", "urlrecords", data);
}
exports.submitURLData = submitURLData;

function submitFBAdData(data) {
    submitData("POST", "fbad", data);
}
exports.submitFBAdData = submitFBAdData;

function submitFBSponsoredData(data) {
    submitData("POST", "fbsponsored", data);
}
exports.submitFBSponsoredData = submitFBSponsoredData;

function submitFBListingData(data) {
    submitData("POST", "fblisting", data);
}
exports.submitFBListingData = submitFBListingData;
