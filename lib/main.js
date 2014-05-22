"use strict";
           
exports.main = function()   {
    var data = require("sdk/self").data;
    var system = require("sdk/system");
    var tabs = require("sdk/tabs");
    var mainPage = data.url("ui/index.html");
    
    console.log("version = " + system.version);
    
    if (system.version < 29.0)  {
        // status bar widget
        var widget = require("sdk/widget").Widget({
            id: "toggle-switch",
            label: "Values & Value",
            contentURL: data.url("ui/img/vavs-icon.png"),
            contentScriptWhen: "ready",
            contentScriptFile: data.url("click-listener.js")
        });
        widget.port.on("left-click", function(){
            tabs.open({url: mainPage});
        });    
    } else {
        var button = require('sdk/ui/button/action').ActionButton({
            id: "vavs-page",
            label: "Values & Value",
            icon: {
                "16": "./ui/img/vavs-icon-16.png",
                "32": "./ui/img/vavs-icon-32.png",
                "64": "./ui/img/vavs-icon-64.png"
            },
            onClick: function(state) {
                tabs.open({url: mainPage});
            }
        });
    }

    // menu item
    var menuitem = require("shared/menuitems").Menuitem({
        id: "ffvavs_page",
        menuid: "menu_ToolsPopup",
        label: "Values & Value",
        onCommand: function() {
            tabs.open({url: mainPage});
        },
        insertbefore: "sanitizeItem",
        image: data.url("ui/img/vavs-icon.png")
    });
    // ui page
    require("sdk/page-mod").PageMod({
        include: mainPage,
        contentScriptWhen: "end",
        contentScriptFile: [data.url("jquery-2.0.3.min.js"),
                            data.url("index-content-script.js")],
        onAttach: require("./app/workers").attachUIWorker
    });
    // init
    if (require("./app/auth").isRegistered()) {
        require("./app/app").initApp();
    } else {
        tabs.open({url: mainPage});
    }
}



