// filters.domains

// SDK
const {Cc, Ci, Cr } = require("chrome");
const ioService = Cc["@mozilla.org/network/io-service;1"]
                  .getService(Ci.nsIIOService);
                  
const AD_HIGH = 3;
const AD_MID = 2;
const AD_LOW = 1;

// domains
var adDomains = [
        "adadvisor.net",
        "addthis.com",
        "adsymptotic.com",
        "axf8.net",
        "bluekai.com",
        "doubleclick.net",
        "2mdn.net",
        "google-analytics.com",
        "googlesyndication.com",
        "googletagservices.com",
        "googleadservices.com",
        "fmpub.net",
        "mathtag.com",
        "moatads.com",
        "quantcast.com",
        "scorecardresearch.com",
        "rubiconproject.com"
    ];
var blockschemes = ["about", "resource"];
var blockdomains = [
        "akamaihd.net",
        "googleapis.com",
        "encrypted.google.com",
        "ytimg.com",
        "wsj.net",
        "images-amazon.com",
        "ssl-images-amazon.com",
        "fb.amulree.net",
        "values.doc.gold.ac.uk",
        "jquery.com",
        "typekit.net",
        "typekit.com"
    ];

// AD PROBABLITY
function rateIsAd(record)  {
    if(adDomains.indexOf(record.domain) != -1) {
        return AD_HIGH;
    } else if(record.queryDepth > 0) {
        return AD_MID;
    } else {
        return AD_LOW;
    }
}
exports.rateIsAd = rateIsAd;

function canUseDomain(uri)   {
    var scheme = null;
    try{
        scheme = ioService.extractScheme(uri);
    } catch (e) {
        return false;
    }
    if (ignoreScheme(scheme))   {
        return false;
    }
    return true;
}
exports.canUseDomain = canUseDomain;

function ignoreScheme(scheme)   {
    return blockschemes.indexOf(scheme) != -1;
}
exports.ignoreScheme = ignoreScheme;

function ignoreDomain(domain)   {
    return blockdomains.indexOf(domain) != -1;
}
exports.ignoreDomain = ignoreDomain;

function isAdDomain(domain)   {
    return adDomains.indexOf(domain) != -1;
}
exports.isAdDomain = isAdDomain;
