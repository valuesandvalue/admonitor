// utils/structures.js

var Set = function(){}
Set.prototype.add = function(o) { this[o] = true; }
Set.prototype.remove = function(o) { delete this[o]; }
Set.prototype.size = function() {
    var i = 0, key;
    for (key in this) {
        if (this.hasOwnProperty(key)) i++;
    }
    return i;
}
Set.prototype.toArray = function() {
    var a = [], key;
    for (key in this) {
        if (this.hasOwnProperty(key))   {
            a.push(key);
        }
    }
    return a;
}
// NOTE: http://www.javascriptexamples.org/2011/01/17/how-to-implement-a-set-in-javascript/


function countKeys(obj) {
    var i = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) i++;
    }
    return i;
}
exports.countKeys = countKeys;
