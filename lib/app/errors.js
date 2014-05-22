// errors

function showErrorMessage(message)    {
    var data = require("sdk/self").data;
    var error_panel = require("sdk/panel").Panel({
        width: 300,
        height: 300,
        contentURL: data.url("ui/error.html"),
        contentScriptFile: [data.url("jquery-2.0.3.min.js"),
                            data.url("error_panel.js")]
    });
    error_panel.port.emit("set-message", message);
    error_panel.show();
}
exports.showErrorMessage = showErrorMessage;
