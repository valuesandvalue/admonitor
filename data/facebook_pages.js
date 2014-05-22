// data/facebook_pages.js

var _on = false;
var tid = null;
var adids = [];
var spids = [];
var posts = {};
var prevposts = null;
var tagregex = /(<([^>]+)>)/ig;
var spcregex = /[ \t\r\n]+/g;

function extractText(htmlstr)   {
    return htmlstr.replace(tagregex, " ").replace(spcregex, " ").trim();
}

function scrapeEgoPane() {
    var data_ad;
    $(".ego_unit").each(function(index) {
        try {
            data_ad = JSON.parse($(this).children("div").attr("data-ad"));
        } catch(e)  {
            data_ad = null;
        }
        if (data_ad && data_ad.adid && adids.indexOf(data_ad.adid) == -1)  {
            adids.push(data_ad.adid);
            parseAdData(data_ad, $(this));
        }
    });
}

function scrapeUserContent() {
    var node;
    var postid;
    $(".userContentWrapper").each(function(index) {
        if ($(this).find(".uiStreamSponsoredLink").length) {
            postid = scrapeSponsored($(this));
            if(typeof(postid) !== 'undefined' && postid != null) {
                addPostListing(index, postid);
            }
        } else {
            postid = scrapeUserPost($(this));
            if(typeof(postid) !== 'undefined' && postid != null) {
                addPostListing(index, postid);
            }
        }
    
    });
}

function addPostListing(index, postid) {
    if (posts.list[index] && posts.list[index] !== postid)   {
        prevposts = posts;
        newPostListing();
        self.port.emit("new-postlist", prevposts);
    }
    posts.list[index] = postid;
}

function newPostListing()   {
    posts = {timestamp: Date.now(), list:[]};
}

function updatePostListing()   {
    if (!prevposts && posts.list.length) {
        prevposts = posts;
        newPostListing();
        self.port.emit("new-postlist", prevposts);
    }
}

function scrapeUserPost(panel) {
    var form;
    var params;
    form = panel.find("form").children("input[name='feedback_params']");
    try {
        params = JSON.parse(form.attr("value"));
    } catch (error) {
        return null;
    } 
    return params.target_fbid;
}

function scrapeSponsored(panel) {
    var form;
    var params;
    form = panel.find("form").children("input[name='feedback_params']");
    try {
        params = JSON.parse(form.attr("value"));
    } catch (error) {
        return null;
    }
    if (params.actor && spids.indexOf(params.actor) == -1)  {
        spids.push(params.actor);
        return parseSponsoredData(params, panel);
    } else {
        return params.target_fbid;
    }
}

function parseSponsoredData(params, panel)   {
    var fbSponsored;
    var images = new Set();
    var links = new Set();
    var url;
    panel.find("div").find("img[src]").each(function()    {
        url = filterImageURL($(this).attr("src"));
        if (url != null)    {
            images.add(url);
        }
    });
    images = images.toArray();
    panel.find("div").find("a[href]").each(function()    {
        url = filterLinkURL($(this).attr("href"));
        if (url != null)    {
            links.add(url);
        }
    });
    links = links.toArray();
    fbSponsored = [
                params.content_timestamp,
                params.actor,
                params.target_fbid,
                params.type_id,
                extractText(panel.find(".userContent").html()),
                panel.find("h5").find("a").eq(0).text().trim(),
                images,
                links
            ];
    printFBSponsored(fbSponsored);
    self.port.emit("new-fbsponsored", fbSponsored);
    return params.target_fbid;
}

function printFBSponsored(fbSponsored)  {
    console.log('FBSP date: ' + fbSponsored[0]);
    console.log('FBSP title: ' + fbSponsored[5]);
    console.log('FBSP target_fbid: ' + fbSponsored[2]);
}

function filterImageURL(url) {
    if (startsWith(url, "/"))   {
        return null;
    } else if (getURIHost(url) === "fbcdn-profile-a.akamaihd.net")   {
        return null;
    }       
    return url;                                    
}

function filterLinkURL(url) {
    if (startsWith(url, "#") || startsWith(url, "/ajax") || startsWith(url, "/browse"))   {
        return null;
    }       
    return url;                                    
}

function parseAdData(data_ad, panel)   {
    var adRecord;
    var images = new Set();
    var links = new Set();
    var url;
    panel.find("div").find("img[src]").each(function()    {
        url = filterImageURL($(this).attr("src"));
        if (url != null)    {
            images.add(url);
        }
    });
    images = images.toArray();
    panel.find("div").find("a[href]").each(function()    {
        url = filterLinkURL($(this).attr("href"));
        if (url != null)    {
            links.add(url);
        }
    });
    links = links.toArray();
    adRecord = [
            Date.now(),
            data_ad.adid,
            extractText(panel.html()),
            panel.find("div[title]").attr("title").trim(),
            images,
            links
        ];
    self.port.emit("new-fbad", adRecord);
}

function scrape()   {
    if (_on)    {
        scrapeEgoPane();
        scrapeUserContent();
        updatePostListing();
        tid = window.setTimeout(scrape, 10000);
    }
}

function start()    {
    _on = true;
    newPostListing();
    scrape();
}

function stop()    {
    _on = false;
    window.clearTimeout(tid);
}

self.port.on("start", function (msgPayload){
    start();
});

self.port.on("stop", function (msgPayload){
    stop();
});

start();
