// utils/cookies.js

function parseCookieValue(s) {
    // based on: https://github.com/carhartl/jquery-cookie
    var cookie = {};
    var pluses = /\+/g;
    
    if (s.indexOf('"') === 0) {
        // This is a quoted cookie as according to RFC2068, unescape...
        s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    try {
        // Replace server-side written pluses with spaces.
        // If we can't decode the cookie, ignore it, it's unusable.
        s = decodeURIComponent(s.replace(pluses, ' '));
    } catch(e) {
        return;
    }
    
    var parts = s.split('; ');
    var i,l;
    for (i = 0, l = parts.length; i < l; i++) {
        var tokens = parts[i].split('=');
		var name = decodeURIComponent(tokens.shift());
		var value = tokens.join('=');
		cookie[name] = value;
    }
    return cookie;
}
exports.parseCookieValue = parseCookieValue;

function getCookieDomain(cookie)  {
    var cookievals = parseCookieValue(cookie);
    if (cookievals.domain)    {
        return cookievals.domain;
    }
    return null;
}
exports.getCookieDomain = getCookieDomain;
