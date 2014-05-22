// filters.media

var imagectypes = ["image/gif", "image/jpeg", "image/png"];
var blockctypes = ["text/css", "font/woff"];

function contentTypeIsImage(ctype)   {
    return imagectypes.indexOf(ctype) != -1;
}
exports.contentTypeIsImage = contentTypeIsImage;

function ignoreContentType(ctype)   {
    return blockctypes.indexOf(ctype) != -1;
}
exports.ignoreContentType = ignoreContentType;
