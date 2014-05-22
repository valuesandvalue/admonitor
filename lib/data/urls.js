// data/urls.js

// SDK
const {Cc, Ci, Cr } = require("chrome");

// ADMONITOR
const { rateIsAd } = require("../filters/domains");
const { getCookieDomain } = require("../utils/cookies");
const { countQueryParams,
        getDomainFromHost,
        getAjaxRequestHeader,
        getRequestDate,
        getRequestHeaderValue } = require("../utils/urls");

// OBJECT
function URLRecord(httpChannel)   {
    this.timestamp = Date.now();
    this.ref = getDomainFromHost(httpChannel.referrer.host);
    this.refurl = httpChannel.referrer.spec;
    this.url = httpChannel.URI.spec;
    this.domain = getDomainFromHost(httpChannel.URI.host);
    this.contentType = getRequestHeaderValue(httpChannel, "Content-Type");
    this.date = getRequestDate(httpChannel);
    var cookie;
    try {
        cookie = httpChannel.getRequestHeader("Cookie");
    } catch (e if e.result == Cr.NS_ERROR_NOT_AVAILABLE) {}
    if (!cookie) {
        try {
            cookie = httpChannel.getResponseHeader("Set-Cookie");
        } catch (e if e.result == Cr.NS_ERROR_NOT_AVAILABLE) {}
    }
    if (cookie) {
        this.cookie = true;
        var cookiedomain = getCookieDomain(cookie);
        if (cookiedomain)    {
            this.cookieURL = cookiedomain;
        }
    }   
    this.isAjax = getAjaxRequestHeader(httpChannel);
    this.method = httpChannel.requestMethod;
    this.status = httpChannel.responseStatus;
    this.cacheable = !httpChannel.isNoCacheResponse();
    this.queryDepth = countQueryParams(this.url);
    this.rating = rateIsAd(this);
}
exports.URLRecord = URLRecord;

function exportRecord(record) {
    return [record.date, 
            record.ref, 
            record.url,
            record.method, 
            record.contentType,
            record.cookie ? record.cookieURL : "", 
            record.isAjax];
}
exports.exportRecord = exportRecord;

