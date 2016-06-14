/**
 * Script: Gradients
 * Version: 1.6.1
 * Author: headzoo
 * Import: https://upnext.fm/js/rainbowvis.js
 *
 * Applies a color gradient to the messages you send.
 *
 * Gradient text is toggled on and off by typing the command /colors into
 * the chat text box. Type it once to turn on gradients, and again to turn
 * them off.
 *
 * Five color pictures are displayed below the chat area when colors are
 * turned on. Use the pickers to create your gradient colors from left to
 * right. http://i.imgur.com/v0JFjO8.png
 * 
 * To share your colors with the channel, type the command "/colors publish".
 */
(function() {
    var is_on   = false;
    var rainbow = new Rainbow();
    var gradients = {
        first:  $api.getStorage("chat_gradient_color_first", CHAT_LINE_COLOR),
        left:   $api.getStorage("chat_gradient_color_left", CHAT_LINE_COLOR),
        middle: $api.getStorage("chat_gradient_color_middle", CHAT_LINE_COLOR),
        right:  $api.getStorage("chat_gradient_color_right", CHAT_LINE_COLOR),
        last:   CHAT_LINE_COLOR
    };
    
    // Use the existing color picker as the "last" color in the gradient.
    // This already exists on the page, and has already been setup with
    // spectrum. We only need to register a callback to know when the color
    // has changed.
    var chatcolor = $("#chatcolor");
    chatcolor.on("change", function() {
        gradients.last = $(this).val();
        $api.trigger("gradient_change");
    });
    
    // Adds the color pickers to the page.
    var setUp = function() {
        $api.each(gradients, function(value, key) {
            if (key == "last") return;
    
            var picker = $('<input/>')
                .attr("id", "chat-color-" + key)
                .attr("type", "color");
            picker.insertBefore(chatcolor);
            picker.spectrum({
                color: value,
                preferredFormat: "hex",
                showInput: true,
                clickoutFiresChange: true
            }).on("change", function () {
                gradients[key] = $(this).val();
                $api.setStorage(
                    "chat_gradient_color_" + key,
                    gradients[key]
                );
                $api.trigger("gradient_change");
            });
        });
    };
    
    // Removes the color pickers from the page.
    var tearDown = function() {
        for(var k in gradients) {
            if (gradients.hasOwnProperty(k)) {
                $("#chat-color-" + k)
                    .spectrum("destroy")
                    .remove();
            }
        }
    };
    
    // Event where we add color codes the outgoing messages.
    $api.on("send", function(e, data) {
        if (data.msg.match(/^\/colou?rs/i)) {
            var args = data.msg.replace(/^\/colou?rs\s+/i, '');
            if (args.toLowerCase() == "publish") {
                $api.send(
                    "Gradients: " +
                    "[" + gradients.last + "]" + gradients.last + "[/#] " +
                    "[" + gradients.right + "]" + gradients.right + "[/#] " +
                    "[" + gradients.middle + "]" + gradients.middle + "[/#] " +
                    "[" + gradients.left + "]" + gradients.left + "[/#] " +
                    "[" + gradients.first + "]" + gradients.first + "[/#]"
                );
            } else {
                $api.trigger("gradient_on_toggle");
            }
            e.cancel();
            return;
        } else if (data.msg[0] == "/" || data.msg[0] == "$" || data.msg.match(/:([^:]+):/) || data.msg.match(/https?:\/\//)) {
            return;
        } else if (data.msg.indexOf("Gradients: ") === 0) {
            return;
        }
        
        if (!is_on) {
            return;
        }
        
        var msg   = "";
        var len   = data.msg.length;
        var chars = data.msg.split('');
        rainbow.setNumberRange(0, len);
        
        for (var i = 0; i < len; i++) {
            if (chars[i] != " ") {
                msg = msg + "[#" + rainbow.colourAt(i) + "]" + chars[i] + "[/#]";
            } else {
                msg = msg + " ";
            }
        }
        
        data.msg = msg;
    });
    
    // Event where gradients are toggled on and off.
    $api.on("gradient_on_toggle", function() {
        is_on = !is_on;
        if (is_on) {
            setUp();
        } else {
            tearDown();
        }
    });
    
    // Event called when one of the color pickers has changed colors.
    // We update Rainbow to use the now chosen colors.
    $api.on("gradient_change", function() {
        rainbow.setSpectrum(
            gradients.last,
            gradients.right,
            gradients.middle,
            gradients.left,
            gradients.first
        );
    });
    
    // Here we go! Remove any existing color pickers, and trigger a
    // gradient change to initialize Rainbow.
    tearDown();
    $api.trigger("gradient_change");
})();