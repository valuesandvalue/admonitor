// utils/urls.js

// SDK
const {Cc, Ci, Cr, components} = require("chrome");
const eTLDSvc = Cc["@mozilla.org/network/effective-tld-service;1"].
                getService(Ci.nsIEffectiveTLDService);
const ioService = Cc["@mozilla.org/network/io-service;1"]
                  .getService(Ci.nsIIOService);
               
function getDomainFromHost(host) {
    try {
        return eTLDSvc.getBaseDomainFromHost(host);
    } catch (e if e.result == Cr.NS_ERROR_INSUFFICIENT_DOMAIN_LEVELS) {
        return host;
    } catch (e if e.result == Cr.NS_ERROR_HOST_IS_IP_ADDRESS) {
        return host;
    }
}
exports.getDomainFromHost = getDomainFromHost;

function getDomainFromURI(uri) {
    try {
        return eTLDSvc.getBaseDomain(uri);
    } catch (e if e.result == Cr.NS_ERROR_INSUFFICIENT_DOMAIN_LEVELS) {
        return uri;
    } catch (e if e.result == Cr.NS_ERROR_HOST_IS_IP_ADDRESS) {
        return uri;
    }
}
exports.getDomainFromURI = getDomainFromURI; 

function getDomainFromString(uristr) {
    try {
        return eTLDSvc.getBaseDomain(ioService.newURI(uristr, null, null));
    } catch (e if e.result == Cr.NS_ERROR_INSUFFICIENT_DOMAIN_LEVELS) {
        return uristr;
    } catch (e if e.result == Cr.NS_ERROR_HOST_IS_IP_ADDRESS) {
        return uristr;
    } catch (e) {
        return '';
    }
}
exports.getDomainFromString = getDomainFromString;

function getRequestHeaderValue(httpChannel, headerName)    {
    try {
        return httpChannel.getResponseHeader(headerName);
    } catch (error) {
        return "";
    }
}
exports.getRequestHeaderValue = getRequestHeaderValue;

function getRequestDate(httpChannel)    {
    try {
        return httpChannel.getResponseHeader("Date");
    } catch (error) {
        return new Date();
    }
}
exports.getRequestDate = getRequestDate;

function countQueryParams(uri)  {
    var query = uri.split('?');
    if (query.length > 1)   {
        return query[1].split("&").length; 
    }
    return 0;
}
exports.countQueryParams = countQueryParams;

function getQueryParams(uri)  {
    var query = uri.split('?');
    if (query.length > 1)   {
        return query[1].split("&"); 
    }
    return null;
}
exports.getQueryParams = getQueryParams;

function getAjaxRequestHeader(channel){
    var header = false;
    try{
        header = channel.getRequestHeader('X-Requested-With').
                    toLowerCase() === 'xmlhttprequest';
    }catch(e){
        if (e.name === 'NS_ERROR_NOT_AVAILABLE'){
        /* header not found, do nothing */
        }else{
            console.error('what is this? ' + Object.keys(e).join(','));
            throw e;
        }
    }
    return header;
}
exports.getAjaxRequestHeader = getAjaxRequestHeader;

function getWindowForRequest(request){
    try{
      if (request.notificationCallbacks){
        return request.notificationCallbacks
                      .getInterface(components.interfaces.nsILoadContext)
                      .associatedWindow;
      }
    } catch(e) {}
    try{
      if (request.loadGroup && request.loadGroup.notificationCallbacks){
        return request.loadGroup.notificationCallbacks
                      .getInterface(components.interfaces.nsILoadContext)
                      .associatedWindow;
      }
    } catch(e) {}
  return null;
}
exports.getWindowForRequest = getWindowForRequest;
