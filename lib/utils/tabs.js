// utils/tabs.js

// SDK
const tabs = require("sdk/tabs");

// ADMONITOR
const { canUseDomain } = require("../filters/domains");

var taburls = [];
var tabdomains = [];

exports.initTabs = function ()  {
    tabs.on('open', function(tab) {
        if (canUseDomain(tab.url)) {
            taburls.push(tab.url);
            tabdomains.push(getDomainFromString(tab.url));
        }
    });
}

function isTabURL(url)  {
    return taburls.indexOf(url) != -1;
}

function isTabDomain(domain)  {
    return tabdomains.indexOf(domain) != -1;
}
