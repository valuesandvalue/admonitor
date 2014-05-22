// error_panel.js

self.port.on("set-message", function(message) {
    $("#message").text(message);
});

