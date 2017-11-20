/* global requirejs cprequire cpdefine chilipeppr THREE */
// Defining the globals above helps Cloud9 not show warnings for those variables

// ChiliPeppr Widget/Element Javascript

requirejs.config({
    /*
    Dependencies can be defined here. ChiliPeppr uses require.js so
    please refer to http://requirejs.org/docs/api.html for info.
    
    Most widgets will not need to define Javascript dependencies.
    
    Make sure all URLs are https and http accessible. Try to use URLs
    that start with // rather than http:// or https:// so they simply
    use whatever method the main page uses.
    
    Also, please make sure you are not loading dependencies from different
    URLs that other widgets may already load like jquery, bootstrap,
    three.js, etc.
    
    You may slingshot content through ChiliPeppr's proxy URL if you desire
    to enable SSL for non-SSL URL's. ChiliPeppr's SSL URL is
    https://i2dcui.appspot.com which is the SSL equivalent for
    http://chilipeppr.com
    */
    paths: {
        // Example of how to define the key (you make up the key) and the URL
        // Make sure you DO NOT put the .js at the end of the URL
        // SmoothieCharts: '//smoothiecharts.org/smoothie',
    },
    shim: {
        // See require.js docs for how to define dependencies that
        // should be loaded before your script/widget.
    }
});

cprequire_test(["inline:com-chilipeppr-widget-xbm"], function(myWidget) {

    // Test this element. This code is auto-removed by the chilipeppr.load()
    // when using this widget in production. So use the cpquire_test to do things
    // you only want to have happen during testing, like loading other widgets or
    // doing unit tests. Don't remove end_test at the end or auto-remove will fail.

    // Please note that if you are working on multiple widgets at the same time
    // you may need to use the ?forcerefresh=true technique in the URL of
    // your test widget to force the underlying chilipeppr.load() statements
    // to referesh the cache. For example, if you are working on an Add-On
    // widget to the Eagle BRD widget, but also working on the Eagle BRD widget
    // at the same time you will have to make ample use of this technique to
    // get changes to load correctly. If you keep wondering why you're not seeing
    // your changes, try ?forcerefresh=true as a get parameter in your URL.

    console.log("test running of " + myWidget.id);

    $('body').prepend('<div id="testDivForFlashMessageWidget"></div>');

    chilipeppr.load(
        "#testDivForFlashMessageWidget",
        "http://raw.githubusercontent.com/chilipeppr/element-flash/master/auto-generated-widget.html",
        function() {
            console.log("mycallback got called after loading flash msg module");
            cprequire(["inline:com-chilipeppr-elem-flashmsg"], function(fm) {
                //console.log("inside require of " + fm.id);
                fm.init();
            });
        }
    );

    // init my widget
    myWidget.init();
    $('#' + myWidget.id).css('margin', '20px');
    $('title').html(myWidget.name);

} /*end_test*/ );

// This is the main definition of your widget. Give it a unique name.
cpdefine("inline:com-chilipeppr-widget-xbm", ["chilipeppr_ready", /* other dependencies here */ ], function() {
    return {
        /**
         * The ID of the widget. You must define this and make it unique.
         */
        id: "com-chilipeppr-widget-xbm", // Make the id the same as the cpdefine id
        name: "Widget / XBM", // The descriptive name of your widget.
        desc: "This widget helps you create and upload XBM image files to your ESP32, ESP8266, or other Lua devices.", // A description of what your widget does
        url: "(auto fill by runme.js)",       // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)",   // The standalone working widget so can view it working by itself
        /**
         * Define pubsub signals below. These are basically ChiliPeppr's event system.
         * ChiliPeppr uses amplify.js's pubsub system so please refer to docs at
         * http://amplifyjs.com/api/pubsub/
         */
        /**
         * Define the publish signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        publish: {
            // Define a key:value pair here as strings to document what signals you publish.
            // '/onExampleGenerate': 'Example: Publish this signal when we go to generate gcode.'
        },
        /**
         * Define the subscribe signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        subscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // so other widgets can publish to this widget to have it do something.
            // '/onExampleConsume': 'Example: This widget subscribe to this signal so other widgets can send to us and we'll do something with it.'
        },
        /**
         * Document the foreign publish signals, i.e. signals owned by other widgets
         * or elements, that this widget/element publishes to.
         */
        foreignPublish: {
            // Define a key:value pair here as strings to document what signals you publish to
            // that are owned by foreign/other widgets.
            // '/jsonSend': 'Example: We send Gcode to the serial port widget to do stuff with the CNC controller.'
        },
        /**
         * Document the foreign subscribe signals, i.e. signals owned by other widgets
         * or elements, that this widget/element subscribes to.
         */
        foreignSubscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // that are owned by foreign/other widgets.
            // '/com-chilipeppr-elem-dragdrop/ondropped': 'Example: We subscribe to this signal at a higher priority to intercept the signal. We do not let it propagate by returning false.'
        },
        /**
         * All widgets should have an init method. It should be run by the
         * instantiating code like a workspace or a different widget.
         */
        init: function() {
            console.log("I am being initted. Thanks.");
            
            this.pasteSetup();
            this.setupCreateScriptBtn();
            
            this.setupUiFromLocalStorage();
            this.btnSetup();
            this.forkSetup();

            console.log("I am done being initted.");
        },
        onClickCpLogoSample: function(evt) {
            console.log("got onClickCpLogoSample. evt:", evt);
            var script = `-- #define img_width 123
-- #define img_height 64
xbmimg = {
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x00, 0xFE, 0x01, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0xC0, 0xFF, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0xFF, 0xFF, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0xC0, 0xFF, 0x7F, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xE0, 0xFF, 0x7F, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0xE0, 0xFF, 0x7F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0xF0, 0xFF, 0x7F, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xFF, 0xFF, 0x01, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0xF8, 0xFF, 0xFF, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0xF8, 0xFF, 0xFF, 0x07, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF8, 0xFF, 0xFF, 0x0F, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0xFC, 0xFF, 0xFF, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0xFC, 0xFF, 0xFF, 0x0F, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFC, 0xFF, 0xFF, 0x07, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0xFC, 0xFF, 0xFF, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0xFE, 0xFF, 0xFF, 0x07, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0xFF, 0xFF, 0x03, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0xFE, 0xFF, 0xFF, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0xFE, 0xFF, 0xFF, 0x03, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0xFF, 0xFF, 0x01, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0xFE, 0xFF, 0xFF, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0xFE, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFC, 0xFF, 0xFF, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0xFC, 0xFF, 0x7F, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0xFC, 0xFF, 0x7F, 0x00, 0xFF, 0x30, 0x00, 0x33, 
0xF1, 0x7F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF8, 0xFF, 0x7F, 0xC0, 
0xC3, 0x31, 0x00, 0x30, 0x70, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0xF8, 0xFF, 0x3F, 0xC0, 0x80, 0x31, 0x00, 0x30, 0x30, 0xC0, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0xF0, 0xFF, 0x3F, 0x60, 0x00, 0x33, 0x00, 0x30, 
0x30, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xFF, 0x3F, 0x60, 
0x00, 0x30, 0x0F, 0x33, 0x31, 0xC0, 0xF0, 0x61, 0x1E, 0xF6, 0xA1, 0x07, 
0xF0, 0xFF, 0x1F, 0x60, 0x00, 0xF0, 0x1F, 0x33, 0x31, 0xC0, 0xFC, 0xE3, 
0x3F, 0xFE, 0xE3, 0x03, 0xF0, 0xFF, 0x1F, 0x30, 0x00, 0x70, 0x38, 0x33, 
0x31, 0xE0, 0x0C, 0xE6, 0x61, 0x0E, 0x63, 0x00, 0xE0, 0xFF, 0x1F, 0x30, 
0x00, 0x70, 0x30, 0x33, 0xF1, 0x7F, 0x06, 0xE4, 0x60, 0x06, 0x66, 0x00, 
0xE0, 0xFF, 0x1F, 0x30, 0x00, 0x30, 0x30, 0x33, 0xF1, 0x3F, 0x06, 0x6E, 
0xC0, 0x06, 0x26, 0x00, 0xE0, 0xFF, 0x0F, 0x60, 0x00, 0x30, 0x30, 0x33, 
0x31, 0x00, 0xFE, 0x6F, 0xC0, 0x06, 0x26, 0x00, 0xE0, 0xFF, 0x0F, 0x60, 
0x00, 0x32, 0x30, 0x33, 0x31, 0x00, 0x06, 0x60, 0xC0, 0x06, 0x26, 0x00, 
0xE0, 0xFF, 0x0F, 0x60, 0x00, 0x33, 0x30, 0x33, 0x31, 0x00, 0x06, 0x60, 
0xC0, 0x06, 0x26, 0x00, 0xE0, 0xFF, 0x0F, 0xC0, 0x00, 0x33, 0x30, 0x33, 
0x31, 0x00, 0x06, 0xE4, 0x60, 0x06, 0x26, 0x00, 0xE0, 0xFF, 0x0F, 0xC0, 
0x81, 0x31, 0x30, 0x33, 0x31, 0x00, 0x0C, 0xE6, 0x70, 0x0E, 0x23, 0x00, 
0xC0, 0xFF, 0x0F, 0x80, 0xFF, 0x31, 0x30, 0x33, 0x31, 0x00, 0xFC, 0xE7, 
0x3F, 0xFE, 0x23, 0x00, 0xC0, 0xFF, 0x0F, 0x00, 0x7F, 0x30, 0x30, 0x33, 
0x31, 0x00, 0xF0, 0x61, 0x1F, 0xF6, 0x20, 0x00, 0xC0, 0xFF, 0x0F, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x00, 0x06, 0x00, 0x00, 
0x80, 0xFF, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 
0x00, 0x06, 0x00, 0x00, 0x80, 0xFF, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x60, 0x00, 0x06, 0x00, 0x00, 0x80, 0xFF, 0x0F, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x00, 0x06, 0x00, 0x00, 
0x00, 0xFF, 0x0F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x1F, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0x1F, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0xFC, 0x3F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0xFC, 0x7F, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF8, 0x7F, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0xF0, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xE0, 0xFF, 0x01, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0xC0, 0xFF, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0xC0, 0xFF, 0x03, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0xFF, 0x03, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0xFF, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE, 0x0F, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF8, 0x0F, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0xF0, 0x1F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xE0, 0x1F, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
0x00, 0x00, 0x00, 0x00, 
 }

xbmimgstr = string.char(unpack(xbmimg))

function writeImg()
    if file.open("img.xbm", "w") then
      file.write(xbmimgstr)
      file.close()
      print("Done writing binary XBM img file")
    else
      print("Could not open file for binary write of XBM img")
    end
end 

function readImg()
    file.open("img.xbm", "r")
    xbmimgstr = file.read()
    file.close()
end 

function setupDisplay()

    -- only setup display if disp not created yet
    if disp ~= nil then return end

    id  = i2c.HW0
    sda = 5 --16
    scl = 4 --17
    i2c.setup(id, sda, scl, i2c.FAST)
    
    sla = 0x3c
    disp = u8g2.ssd1306_i2c_128x64_noname(id, sla)
end

function sendImgToDisplay()
    disp:clearBuffer()
    disp:sendBuffer() 
    
    w = 123
    h = 64
    x = (128 - w) / 2
    y = (64 - h) / 2
    disp:drawXBM(x,y,w,h,xbmimgstr)
    disp:sendBuffer() 
end

-- writeImg()
-- readImg()
setupDisplay()
sendImgToDisplay()

`;
            var obj = {
                name: "xbm_chilipepprlogo" + this.scriptCtr + ".lua",
                content: script
            }
            chilipeppr.publish("/com-chilipeppr-widget-luaeditor/loadScript", obj);
            this.scriptCtr++;
        },
        setupCreateScriptBtn: function() {
            $('#' + this.id + ' .btn-genscript').click(this.onCreateScript.bind(this));
            // btn-genscript-cplogo
            $('#' + this.id + ' .btn-genscript-cplogo').click(this.onClickCpLogoSample.bind(this));
        },
        scriptCtr: 1,
        onCreateScript: function() {
            console.log("onCreateScript. ");
            
            if (this.xbmScript.length == 0) {
                alert("You have not pasted in an image yet, thus no script exists to send to the Lua editor.");
                return;
            }
            // remove cr/lf if they exist
            // content = content.replace(/\r\n/g, "\n");
            
            var obj = {
                name: "xbmimage" + this.scriptCtr + ".lua",
                content: this.xbmScript
            }
            chilipeppr.publish("/com-chilipeppr-widget-luaeditor/loadScript", obj);
            this.scriptCtr++;
        },
        imgData: [],
        xbmScript: "",
        pasteSetup: function() {
            
            var mythat = this;
            
            // Created by STRd6
            // MIT License
            // jquery.paste_image_reader.js
            (function ($) {
              var defaults;
              $.event.fix = (function (originalFix) {
                  return function (event) {
                      event = originalFix.apply(this, arguments);
                      if (event.type.indexOf('copy') === 0 || event.type.indexOf('paste') === 0) {
                          event.clipboardData = event.originalEvent.clipboardData;
                      }
                      return event;
                  };
              })($.event.fix);
              defaults = {
                  callback: $.noop,
                  matchType: /image.*/
              };
              return $.fn.pasteImageReader = function (options) {
                  if (typeof options === "function") {
                      options = {
                          callback: options
                      };
                  }
                  options = $.extend({}, defaults, options);
                  return this.each(function () {
                      var $this, element;
                      element = this;
                      $this = $(this);
                      return $this.bind('paste', function (event) {
                          console.log("event:", event);
                          // Does the element have focus:
                          var hasFocus = $("div#editor-box").is(':focus');
                          console.log("is editor box active?", hasFocus);
                          if (!hasFocus) {
                              return;
                          }
                          $("div#editor-box")
                                    .html('<span style="color:blue">Creating image...</span>');
                          var clipboardData, found;
                          found = false;
                          clipboardData = event.clipboardData;
                          return Array.prototype.forEach.call(clipboardData.types, function (type, i) {
                              var file, reader;
                              if (found) {
                                  return;
                              }
                              if (type.match(options.matchType) || clipboardData.items[i].type.match(options.matchType)) {
                                  file = clipboardData.items[i].getAsFile();
                                  reader = new FileReader();
                                  reader.onload = function (evt) {
                                      return options.callback.call(element, {
                                          dataURL: evt.target.result,
                                          event: evt,
                                          file: file,
                                          name: file.name
                                      });
                                  };
                                  reader.readAsDataURL(file);
                                  //snapshoot();
                                  return found = true;
                              }
                              // if we get here, something wrong happened
                              setTimeout(function() {
                                  $("div#editor-box")
                                    .html('<span style="color:red">Error. You can only paste images.</span>');
                              }, 200);
                            //   backgroundImage
                          });
                      });
                  });
              };
            })(jQuery);
            
            
            $("html").pasteImageReader(function (results) {
                
                console.log("inside pasteImageReader. results:", results);

                  var dataURL, filename;
                  filename = results.filename, dataURL = results.dataURL;
                  $data.text(dataURL);
                  $size.val(results.file.size);
                  $type.val(results.file.type);
                  $test.attr('href', dataURL);
                  var img = document.createElement('img');
                  img.src = dataURL;
                  
                  // it seems that it takes a bit of time for the image to render
                  // so we don't get back a good width/height. so do this later to give time for image
                  // to load
                  setTimeout(function() {

                    var w = img.width;
                    var h = img.height;
                    console.log("width:", w, "height:", h);
                    if (w > 0 && h > 0) {
                        // good to go
                        
                        // but check for oversized images too cuz it kills this thing
                        if (w > 128 || h > 128) {
                            var r = confirm("Your image is overly large with width: " + w + 
                            "px and height: " + h + 
                            "px and will likely freeze up the XBM image creation. I suggest 128x128 max. I suggest you cancel. Do you really want to continue?");
                            if (r == true) {
                                // txt = "You pressed OK!";
                                
                            } else {
                                // txt = "You pressed Cancel!";
                                console.log("User cancelled");
                                $("div#editor-box")
                                    .html('Cancelled image paste.');
                                return;
                            }    
                        }
                        
                    } else {
                    alert("problem with width height. w:" + w + ", h:", h);
                    }
                    $width.val(w); $height.val(h);
                    $("div#editor-box").height(h).text("").css({
                    backgroundImage: "url(" + dataURL + ")"
                    }).data({ 'width': w, 'height': h });
                    $(".editor-box-note").addClass("hidden");
                    
                    // set the width/height in info boxes
                    $('.widget-xbm-img-w').text(w);
                    $('.widget-xbm-img-h').text(h);
                    
                    // get textaarea
                    var tEl = $('.widget-xbm-arraydata');
                    tEl.removeClass("hidden");
                    tEl.val(`-- #define img_width ` + w + `
-- #define img_height ` + h + '\n'
// -- static char img_bits[] = {
);
                    
                    // var img = document.getElementById('my-image');
                    var canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
                    
                    var hexStr = "";
                    var hexArr = [];
                    var pxWhtCnt = 0;
                    var pxBlkCnt = 0;
                    
                    // we can generate a bit for every pixel, but since xbm wants 0xff or 8bits
                    // per value, we need to iterate every 8th 0 or 1 to generate our 0xff val
                    /*
                    a single bit represents each pixel (0 for white or 1 for black), each byte in 
                    the array contains the information for eight pixels, with the upper left pixel 
                    in the bitmap represented by the low bit of the first byte in the array. If the 
                    image width does not match a multiple of 8, the extra bits in the last byte of 
                    each row are ignored.
                    
                    each row has to be a multiple of 8. if it's not, then add more bits to last byte
                    to pad
                    */
                    var pxArr = [];
                    var cnt = 1;
                    var bit = "";
                    for (var y = 0; y < h; y++) {
                        for (var x = 0; x < w; x++) {
                            
                            var imgCtx = canvas.getContext('2d');
                            var img2dData = canvas.getContext('2d').getImageData(x, y, 1, 1);
                            var pixelData = img2dData.data;
                            // console.log("pixelData:", pixelData, "img2dData:", img2dData);
                            
                            // create new array to store pixel info
                            // img2dData.data = [];
                            
                            // if red, green, or blue is more than 128 assume 0xff, otherwise assume 0
                            // this is essentially a 50% threshold
                            if (pixelData[0] > 128 || pixelData[1] > 128 || pixelData[2] > 128 ) {
                                
                                // we are forcing this pixel to white
                                // hexStr += ", 0xff";
                                bit = "0" + bit; // set 0,0 to lowest bit
                                // hexArr.push("0xff");
                                pxWhtCnt++;
                                
                                // now force pixelData into our 50% threshold choice of black or white
                                // img2dData.data[0] = 255;
                                // img2dData.data[1] = 255;
                                // img2dData.data[2] = 255;
                                // img2dData.data[3] = 255;
                                // canvas.getContext('2d').putImageData(img2dData, x, y);
                                
                                imgCtx.fillStyle = "white";    // this is default anyway
                                imgCtx.fillRect(x, y, 1, 1);
                                
                            } else {
                                
                                // we are forcing this pixel to black
                                bit = "1" + bit;
                                // hexStr += ", 0x00";
                                // hexArr.push("0x00");
                                pxBlkCnt++;
                                
                                // now force pixelData into our 50% threshold choice of black or white
                                // img2dData.data[0] = 0;
                                // img2dData.data[1] = 0;
                                // img2dData.data[2] = 0;
                                // img2dData.data[3] = 255;
                                // canvas.getContext('2d').putImageData(img2dData, x, y);
                                imgCtx.fillStyle = "black";    // this is default anyway
                                imgCtx.fillRect(x, y, 1, 1);
                            }
                            
                            // console.log("img2dData after:", img2dData);
                            
                            if (cnt == 8) {
                                // we have our first full byte
                                // push bit string onto array
                                pxArr.push(bit);
                                cnt = 1;
                                bit = ""; // reset bit array to empty
                            } else {
                                // increment counter
                                cnt++;
                            }
                        }
                        
                        // just push the bits onto array to be done with it
                        if (bit != "") {
                            // we have to some bits to deal with
                            // pad bits if length less than 8
                            if (bit.length < 8) {
                                // we need to pad start of string
                                for (var padCtr = bit.length; padCtr < 8; padCtr++) {
                                    bit = "0" + bit;
                                }
                                
                            }
                            pxArr.push(bit);
                            cnt = 1;
                            bit = ""; // reset bit array to empty
                        }
                    }
                    
                    // reset the background img of editor-box to the newly modified image
                    var newDataURL = canvas.toDataURL();
                    $("div#editor-box").css({backgroundImage: "url(" + newDataURL + ")"});
                    
                    // imgData
                    console.log("pxArr:", pxArr);
                    
                    // create hex arr
                    for (var pxToHexCtr = 0; pxToHexCtr < pxArr.length; pxToHexCtr++) {
                        var len = 2;
                        var str = parseInt(pxArr[pxToHexCtr], 2).toString(16);
                        var hexstr = "0".repeat(len - str.length) + str;
                        hexArr.push( "0x" + hexstr.toUpperCase() );
                    }
                    
                    var finalScript = tEl.val();
                    
                    
                    // we need to wrap a new line at each 12th comma
                    finalScript += 'xbmimg = {\n'
                    var itemCtrForNewline = 1;
                    for (var itemCtr = 0; itemCtr < hexArr.length; itemCtr++) {
                        finalScript += hexArr[itemCtr] + ", ";
                        if (itemCtrForNewline == 12) {
                            finalScript += "\n";
                            itemCtrForNewline = 1;
                        } else {
                            itemCtrForNewline++;
                        }
                    }
                    // finalScript += hexArr.join(", ") 
                    finalScript += "\n }"
                    
                    /*
                    // use approach more like lua
                    finalScript += 'xbmimg = {}    -- new array\n'
                    for (var i = 0; i < hexArr.length; i++) {
                        finalScript += 'xbmimg[' + i + '] = ' + hexArr[i] + '\n';
                    }
                    */
                    
                    finalScript += `

xbmimgstr = string.char(unpack(xbmimg))

function writeImg()
    if file.open("img.xbm", "w") then
      file.write(xbmimgstr)
      file.close()
      print("Done writing binary XBM img file")
    else
      print("Could not open file for binary write of XBM img")
    end
end 

function readImg()
    file.open("img.xbm", "r")
    xbmimgstr = file.read()
    file.close()
end 

function setupDisplay()

    -- only setup display if disp not created yet
    if disp ~= nil then return end

    id  = i2c.HW0
    sda = 5 --16
    scl = 4 --17
    i2c.setup(id, sda, scl, i2c.FAST)
    
    sla = 0x3c
    disp = u8g2.ssd1306_i2c_128x64_noname(id, sla)
end

function sendImgToDisplay()
    disp:clearBuffer()
    disp:sendBuffer() 
    
    w = ` + w + `
    h = ` + h + `
    x = (128 - w) / 2
    y = (64 - h) / 2
    disp:drawXBM(x,y,w,h,xbmimgstr)
    disp:sendBuffer() 
end

-- writeImg()
-- readImg()
setupDisplay()
sendImgToDisplay()

`;
                    
                    tEl.val(finalScript);
                    mythat.xbmScript = finalScript;
                    $('.widget-xbm-img-wht').text(pxWhtCnt);
                    $('.widget-xbm-img-blk').text(pxBlkCnt);
                    
                  }, 2000);
                  
                  // double the height
                //   $("div#editor-box").height($("div#editor-box").height() * 2);
                  
                //   console.log("about to return from pasteImageReader. img:", img);
                //   return $(".active").css({
                //       backgroundImage: "url(" + dataURL + ")"
                //   }).data({ 'width': w, 'height': h });
              });
            
              var $data, $size, $type, $test, $width, $height;
              $(function () {
                  $data = $('.data');
                  $size = $('.size');
                  $type = $('.type');
                  $test = $('#test');
                  $width = $('#width');
                  $height = $('#height');
                  
                  // disabling on click. not sure what value it adds.
                  $('.target').on('click2', function () {
                      console.log("on click evt for target");
                      
                      var $this = $(this);
                      var bi = $this.css('background-image');
                      if (bi != 'none') {
                          $data.text(bi.substr(4, bi.length - 6));
                      }
            
                      $('.active').removeClass('active');
                      $this.addClass('active');
            
                      $this.toggleClass('contain');
            
                      $width.val($this.data('width'));
                      $height.val($this.data('height'));
                      if ($this.hasClass('contain')) {
                          $this.css({ 'width': $this.data('width'), 'height': $this.data('height'), 'z-index': '10' });
                      } else {
                          $this.css({ 'width': '', 'height': '', 'z-index': '' });
                      }
                  });
              });    
        },
        /**
         * Call this method from init to setup all the buttons when this widget
         * is first loaded. This basically attaches click events to your 
         * buttons. It also turns on all the bootstrap popovers by scanning
         * the entire DOM of the widget.
         */
        btnSetup: function() {

            // Chevron hide/show body
            var that = this;
            $('#' + this.id + ' .hidebody').click(function(evt) {
                console.log("hide/unhide body");
                if ($('#' + that.id + ' .panel-body').hasClass('hidden')) {
                    // it's hidden, unhide
                    that.showBody(evt);
                }
                else {
                    // hide
                    that.hideBody(evt);
                }
            });

            // Ask bootstrap to scan all the buttons in the widget to turn
            // on popover menus
            $('#' + this.id + ' .btn').popover({
                delay: 1000,
                animation: true,
                placement: "auto",
                trigger: "hover",
                container: 'body'
            });

            // Init Say Hello Button on Main Toolbar
            // We are inlining an anonymous method as the callback here
            // as opposed to a full callback method in the Hello Word 2
            // example further below. Notice we have to use "that" so 
            // that the this is set correctly inside the anonymous method
            $('#' + this.id + ' .btn-sayhello').click(function() {
                console.log("saying hello");
                // Make sure popover is immediately hidden
                $('#' + that.id + ' .btn-sayhello').popover("hide");
                // Show a flash msg
                chilipeppr.publish(
                    "/com-chilipeppr-elem-flashmsg/flashmsg",
                    "Hello Title",
                    "Hello World from widget " + that.id,
                    1000
                );
            });

            // Init Hello World 2 button on Tab 1. Notice the use
            // of the slick .bind(this) technique to correctly set "this"
            // when the callback is called
            $('#' + this.id + ' .btn-helloworld2').click(this.onHelloBtnClick.bind(this));

        },
        /**
         * onHelloBtnClick is an example of a button click event callback
         */
        onHelloBtnClick: function(evt) {
            console.log("saying hello 2 from btn in tab 1");
            chilipeppr.publish(
                '/com-chilipeppr-elem-flashmsg/flashmsg',
                "Hello 2 Title",
                "Hello World 2 from Tab 1 from widget " + this.id,
                2000 /* show for 2 second */
            );
        },
        /**
         * User options are available in this property for reference by your
         * methods. If any change is made on these options, please call
         * saveOptionsLocalStorage()
         */
        options: null,
        /**
         * Call this method on init to setup the UI by reading the user's
         * stored settings from localStorage and then adjust the UI to reflect
         * what the user wants.
         */
        setupUiFromLocalStorage: function() {

            // Read vals from localStorage. Make sure to use a unique
            // key specific to this widget so as not to overwrite other
            // widgets' options. By using this.id as the prefix of the
            // key we're safe that this will be unique.

            // Feel free to add your own keys inside the options 
            // object for your own items

            var options = localStorage.getItem(this.id + '-options');

            if (options) {
                options = $.parseJSON(options);
                console.log("just evaled options: ", options);
            }
            else {
                options = {
                    showBody: true,
                    tabShowing: 1,
                    customParam1: null,
                    customParam2: 1.0
                };
            }

            this.options = options;
            console.log("options:", options);

            // show/hide body
            if (options.showBody) {
                this.showBody();
            }
            else {
                this.hideBody();
            }

        },
        /**
         * When a user changes a value that is stored as an option setting, you
         * should call this method immediately so that on next load the value
         * is correctly set.
         */
        saveOptionsLocalStorage: function() {
            // You can add your own values to this.options to store them
            // along with some of the normal stuff like showBody
            var options = this.options;

            var optionsStr = JSON.stringify(options);
            console.log("saving options:", options, "json.stringify:", optionsStr);
            // store settings to localStorage
            localStorage.setItem(this.id + '-options', optionsStr);
        },
        /**
         * Show the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        showBody: function(evt) {
            $('#' + this.id + ' .panel-body').removeClass('hidden');
            $('#' + this.id + ' .panel-footer').removeClass('hidden');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-down');
            if (!(evt == null)) {
                this.options.showBody = true;
                this.saveOptionsLocalStorage();
            }
            // this will send an artificial event letting other widgets know to resize
            // themselves since this widget is now taking up more room since it's showing
            $(window).trigger("resize");
        },
        /**
         * Hide the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        hideBody: function(evt) {
            $('#' + this.id + ' .panel-body').addClass('hidden');
            $('#' + this.id + ' .panel-footer').addClass('hidden');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-down');
            if (!(evt == null)) {
                this.options.showBody = false;
                this.saveOptionsLocalStorage();
            }
            // this will send an artificial event letting other widgets know to resize
            // themselves since this widget is now taking up less room since it's hiding
            $(window).trigger("resize");
        },
        /**
         * This method loads the pubsubviewer widget which attaches to our 
         * upper right corner triangle menu and generates 3 menu items like
         * Pubsub Viewer, View Standalone, and Fork Widget. It also enables
         * the modal dialog that shows the documentation for this widget.
         * 
         * By using chilipeppr.load() we can ensure that the pubsubviewer widget
         * is only loaded and inlined once into the final ChiliPeppr workspace.
         * We are given back a reference to the instantiated singleton so its
         * not instantiated more than once. Then we call it's attachTo method
         * which creates the full pulldown menu for us and attaches the click
         * events.
         */
        forkSetup: function() {
            var topCssSelector = '#' + this.id;

            $(topCssSelector + ' .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 1000,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });

            var that = this;
            chilipeppr.load("http://raw.githubusercontent.com/chilipeppr/widget-pubsubviewer/master/auto-generated-widget.html", function() {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {
                    pubsubviewer.attachTo($(topCssSelector + ' .panel-heading .dropdown-menu'), that);
                });
            });

        },

    }
});