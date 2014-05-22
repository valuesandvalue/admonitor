// observers/facebook

// ADMONITOR
const { attachFBWorker } = require("../app/workers");
const { submitFBListingData,
        submitFBSponsoredData } = require("../app/comms");
const { storeFBAd } = require("../data/storage");
const { getDomainFromString } =  require("../utils/urls");

function setupFacebookObserver()    {
    var data = require("sdk/self").data;
    require("sdk/tabs").on('pageshow', function(tab) {
        if (!require("sdk/private-browsing").isPrivate(tab)) {
            var tabdomain = getDomainFromString(tab.url);
            if (tabdomain === "facebook.com")   {
                var worker = tab.attach({
                    contentScriptWhen: "end",
                    contentScriptFile: [data.url("jquery-2.0.3.min.js"),
                                data.url("pageutils.js"),
                                data.url("structures.js"),
                                data.url("facebook_pages.js")],
                });
                worker.port.on("new-fbad", function(record) {
                    storeFBAd(record);
                });
                worker.port.on("new-fbsponsored", function(record) {
                    submitFBSponsoredData({data: JSON.stringify(record)});
                });
                worker.port.on("new-postlist", function(record) {
                    submitFBListingData({data: JSON.stringify(record)});
                });
                attachFBWorker(worker);
            }
        }
    });
}
exports.setupFacebookObserver = setupFacebookObserver;

function closeFacebookObserver()    {
    require("../app/workers").resetFBWorkers();
}
exports.closeFacebookObserver = closeFacebookObserver;
