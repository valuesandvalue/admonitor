// app

function initApp()    {
    require("./comms").start();
    require("../data/storage").initStorage();
    require("../data/storage").start();
    require("../observers/http").httpResponseObserver.register();
    require("../observers/facebook").setupFacebookObserver();
}
exports.initApp = initApp;

function endApp()    {
    require("./comms").stop();
    require("../data/storage").stop();
    require("../observers/http").httpResponseObserver.unregister();
    require("../observers/facebook").closeFacebookObserver();
}
exports.endApp = endApp;
