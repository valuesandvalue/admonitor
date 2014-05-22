// data/storage.js

// SDK
var storage = require("sdk/simple-storage").storage;

// ADMONITOR
const { submitURLData, 
        submitFBAdData,
        submitFBSponsoredData } = require("../app/comms");
const { countKeys } = require("../utils/structures");       
      
var tid = null;
  
// CONSTANTS
const AD_BUFFER_SIZE = 40;
const FB_BUFFER_SIZE = 4;

function initStorage()  {
    if (!storage.rels)  {
        storage.rels = {};
    }
    if (!storage.urls)  {
        storage.urls = [];
    }
    if (!storage._urls)  {
        storage._urls = [];
    }
    if (!storage.fbads)  {
        storage.fbads = [];
    }
    if (!storage._fbads)  {
        storage._fbads = [];
    }
    if (!storage.fbsp)  {
        storage.fbsp = [];
    }
    if (!storage._fbsp)  {
        storage._fbsp = [];
    }
}
exports.initStorage = initStorage;

function storeRelation(requestDomain, referrerDomain) {
    if (!storage.rels.hasOwnProperty(requestDomain))  {
        storage.rels[requestDomain] = {};
    }
    storage.rels[requestDomain][referrerDomain] = true;
}
exports.storeRelation = storeRelation;

function isUniqueDomain(requestDomain) {
    if (!storage.rels.hasOwnProperty(requestDomain))  {
        return false;
    } else {
        return countKeys(storage.rels[requestDomain]) === 1;
    }
}
exports.isUniqueDomain = isUniqueDomain;

function storeURLRecord(record) {
    if (storage._urls.length < AD_BUFFER_SIZE) {
        storage._urls.push(record);
    } else {
        sendURLRecords();
        storage._urls.splice(0, storage._urls.length, record);
    }
}
exports.storeURLRecord = storeURLRecord;

function sendURLRecords() {
    var i, m;
    var payload;
    if(storage._urls.length)    {
        payload = {data: JSON.stringify(storage._urls)};
        for(i = 0, m = storage._urls.length; i < m; i++)   {
            storage.urls.push(storage._urls[i]);
        }
        submitURLData(payload);
    }
}

function storeFBAd(record) {
    if (storage._fbads.length < FB_BUFFER_SIZE) {
        storage._fbads.push(record);
    } else {
        sendFBAds();
        storage._fbads.splice(0, storage._fbads.length, record);
    }
}
exports.storeFBAd = storeFBAd;

function sendFBAds() {
    var i, m;
    var payload;
    if(storage._fbads.length)    {
        payload = {data: JSON.stringify(storage._fbads)};
        for(i = 0, m = storage._fbads.length; i < m; i++)   {
            storage.fbads.push(storage._fbads[i]);
        }
        submitFBAdData(payload);
    }
}

function storeFBSponsored(record) {
    if (storage._fbsp.length < FB_BUFFER_SIZE) {
        storage._fbsp.push(record);
    } else {
        sendFBSponsored();
        storage._fbads.splice(0, storage._fbsp.length, record);
    }
}
exports.storeFBSponsored = storeFBSponsored;

function sendFBSponsored() {
    var i, m;
    var payload;
    if(storage._fbsp.length)    {
        payload = {data: JSON.stringify(storage._fbsp)};
        for(i = 0, m = storage._fbsp.length; i < m; i++)   {
            storage.fbsp.push(storage._fbsp[i]);
        }
        submitFBSponsoredData(payload);
    }
}

function updateStorage() {
    sendFBSponsored();
    sendFBAds();
    sendURLRecords();
    tid = require("sdk/timers").setTimeout(updateStorage, 1000 * 60 * 5);
}

function start()    {
    tid = require("sdk/timers").setTimeout(updateStorage, 1000 * 60 * 5);
}
exports.start = start;

function stop()    {
    require("sdk/timers").clearTimeout(tid);
}
exports.stop = stop;
