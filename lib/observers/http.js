// observers/http

// SDK
const {Cc, Ci, Cr, components} = require("chrome");
const { isPrivate } = require("sdk/private-browsing");

// ADMONITOR
const { URLRecord,
        exportRecord } = require("../data/urls");
const { storeURLRecord,
        storeRelation,
        isUniqueDomain } = require("../data/storage");
const { ignoreDomain,
        isAdDomain } = require("../filters/domains");
const { contentTypeIsImage,
        ignoreContentType,
        isTrackerImage } = require("../filters/media");
const { countQueryParams,
        getAjaxRequestHeader,
        getRequestDate,
        getRequestHeaderValue,
        getDomainFromString,
        getDomainFromURI,
        getDomainFromHost,
        getWindowForRequest } = require("../utils/urls");
const { updateUIWorkers,
        updateFBWorkers } = require("../app/workers");

// RESPONSE
exports.httpResponseObserver =
{
    observe: function(subject, topic, data)
    {
        var channel;
        var referrerDomain;
        var requestDomain;
        var contentType;
        var record;
        var domWin;
        if (topic == "http-on-examine-response") {
            channel = subject.QueryInterface(Ci.nsIHttpChannel);
            domWin = getWindowForRequest(channel);
            if (!(domWin !== null && isPrivate(domWin))) {
                if (channel.referrer !== null)    {
                    requestDomain = getDomainFromHost(channel.URI.host);
                    if (ignoreDomain(requestDomain))   {
                        return;
                    }
                    referrerDomain = getDomainFromHost(channel.referrer.host);
                    if (referrerDomain !== 'facebook.com' && referrerDomain !== requestDomain)  {
                        contentType = getRequestHeaderValue(channel,"Content-Type");
                        if (!ignoreContentType(contentType))   {
                            storeRelation(requestDomain, referrerDomain);
                            if (isAdDomain(requestDomain) || !isUniqueDomain(requestDomain))    {
                                record = new URLRecord(channel);
                                storeURLRecord(exportRecord(record));
                            }
                        }
                    }
                } 
            }
        }
    },

    get observerService() {
        return Cc["@mozilla.org/observer-service;1"].
                        getService(Ci.nsIObserverService);
    },

    register: function() {
        this.observerService.addObserver(
                        this, "http-on-examine-response", false);
    },

    unregister: function() {
        this.observerService.removeObserver(this, "http-on-examine-response");
    }
};
