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
    
    /**
   * This Animated GIF code was borrowed from the beautiful x-gif Github repo
   * https://github.com/geelen/x-gif
   */
  var defaultFrameDelay = 10;
  
  class Gif {
    constructor(frames) {
      this.frames = frames;
      this.length = 0;
      this.offsets = []
  
      frames.forEach((frame) => {
        this.offsets.push(this.length);
        this.length += (frame.delay || defaultFrameDelay);
      });
    }
  
    frameAt(fraction) {
      var offset = fraction * this.length;
      for (var i = 1, l = this.offsets.length; i < l; i++) {
        if (this.offsets[i] > offset) break;
      }
      return i - 1;
    }
  };
  
  class StreamReader {
    constructor(arrayBuffer) {
      this.data = new Uint8Array(arrayBuffer);
      this.index = 0;
      this.log("TOTAL LENGTH: " + this.data.length);
    }
  
    finished() {
      return this.index >= this.data.length;
    }
  
    readByte() {
      return this.data[this.index++];
    }
  
    peekByte(n) {
        if (n) {
            return this.data[n];
        }
      return this.data[this.index];
    }
  
    skipBytes(n) {
      this.index += n;
    }
  
    peekBit(i) {
      return !!(this.peekByte() & (1 << 8 - i));
    }
  
    readAscii(n) {
      var s = '';
      for (var i = 0; i < n; i++) {
        s += String.fromCharCode(this.readByte());
      }
      return s;
    }
    
    peekAscii(n) {
      var s = '';
      for (var i = 0; i < n; i++) {
        s += String.fromCharCode(this.peekByte(i));
      }
      return s;
    }
  
    isNext(array) {
      for (var i = 0; i < array.length; i++) {
        if (array[i] !== this.data[this.index + i]) return false;
      }
      return true;
    }
  
    log(str) {
      console.log(this.index + ": " + str);
    }
  
    error(str) {
      console.error(this.index + ": " + str);
    }
  }
  
  function getUrlRef() {
    return (window["URL"] && window["URL"].createObjectURL) ? window["URL"] : window["webkitURL"];
  }
  var url = getUrlRef();
  var gifCache = new Map();
  
  class Exploder {
    constructor(file) {
      this.file = file;
    }
  
    load(dataAsArrayBuffer) {
      var cachedGifPromise = gifCache.get(this.file)
      if (cachedGifPromise) return cachedGifPromise;
  
      if (dataAsArrayBuffer) {
          // var enc = new TextEncoder("utf-8");
          // var gifPromise = this.explode(enc.encode(dataAsText));
          var gifPromise = this.explode(dataAsArrayBuffer);
      } else {
          var gifPromise = Promises.xhrGet(this.file, '*/*', 'arraybuffer')
            .then(buffer => this.explode(buffer));
      }
      
      gifCache.set(this.file, gifPromise);
      return gifPromise;
    }
  
    explode(buffer) {
      console.debug("EXPLODING " + this.file)
      return new Promise((resolve, reject) => {
        var frames = [],
          streamReader = new StreamReader(buffer);
  
        // Ensure this is an animated GIF
        console.log("First 6 bytes:", streamReader.peekAscii(6));
        console.log("First 6 bytes:", streamReader.peekAscii(6));
        
        if (streamReader.peekAscii(6) != "GIF89a") { // && streamReader.peekAscii(6) != "GIF87a") {
          if (streamReader.peekAscii(6) == "GIF87a") {
            $('.widget-xbm-errmsg').removeClass('hidden').text("Not GIF89a format! You dragged in GIF87a format, which is older and not supported. You should be able to convert with Adobe Photshop or other online tools. Then come back and retry.");
          } else {
            $('.widget-xbm-errmsg').removeClass('hidden').text("Not a GIF! We can only support drag/drop of GIF89a format including animated GIFs. You can cut/paste other image formats though like JPEG and PNG because the browser will convert for you.");
          }
          reject(Error("Not a GIF!"));
          return;
        }
        $('.widget-xbm-errmsg').addClass('hidden');
        console.log("Final read of 6 bytes:", streamReader.readAscii(6));
  
        streamReader.skipBytes(4); // Height & Width
        if (streamReader.peekBit(1)) {
          streamReader.log("GLOBAL COLOR TABLE")
          var colorTableSize = streamReader.readByte() & 0x07;
          streamReader.log("GLOBAL COLOR TABLE IS " + 3 * Math.pow(2, colorTableSize + 1) + " BYTES")
          streamReader.skipBytes(2);
          streamReader.skipBytes(3 * Math.pow(2, colorTableSize + 1));
        } else {
          streamReader.log("NO GLOBAL COLOR TABLE")
        }
        // WE HAVE ENOUGH FOR THE GIF HEADER!
        var gifHeader = buffer.slice(0, streamReader.index);
  
        var spinning = true, expectingImage = false;
        while (spinning) {
  
          if (streamReader.isNext([0x21, 0xFF])) {
            streamReader.log("APPLICATION EXTENSION")
            streamReader.skipBytes(2);
            var blockSize = streamReader.readByte();
            streamReader.log(streamReader.readAscii(blockSize));
  
            if (streamReader.isNext([0x03, 0x01])) {
              // we cool
              streamReader.skipBytes(5)
            } else {
              streamReader.log("A weird application extension. Skip until we have 2 NULL bytes");
              while (!(streamReader.readByte() === 0 && streamReader.peekByte() === 0));
              streamReader.log("OK moving on")
              streamReader.skipBytes(1);
            }
          } else if (streamReader.isNext([0x21, 0xFE])) {
            streamReader.log("COMMENT EXTENSION")
            streamReader.skipBytes(2);
  
            while (!streamReader.isNext([0x00])) {
              var blockSize = streamReader.readByte();
              streamReader.log(streamReader.readAscii(blockSize));
            }
            streamReader.skipBytes(1); //NULL terminator
  
          } else if (streamReader.isNext([0x2c])) {
            streamReader.log("IMAGE DESCRIPTOR!");
            if (!expectingImage) {
              // This is a bare image, not prefaced with a Graphics Control Extension
              // so we should treat it as a frame.
              frames.push({ index: streamReader.index, delay: 0 });
            }
            expectingImage = false;
  
            streamReader.skipBytes(9);
            if (streamReader.peekBit(1)) {
              streamReader.log("LOCAL COLOR TABLE");
              var colorTableSize = streamReader.readByte() & 0x07;
              streamReader.log("LOCAL COLOR TABLE IS " + 3 * Math.pow(2, colorTableSize + 1) + " BYTES")
              streamReader.skipBytes(3 * Math.pow(2, colorTableSize + 1));
            } else {
              streamReader.log("NO LOCAL TABLE PHEW");
              streamReader.skipBytes(1);
            }
  
            streamReader.log("MIN CODE SIZE " + streamReader.readByte());
            streamReader.log("DATA START");
  
            while (!streamReader.isNext([0x00])) {
              var blockSize = streamReader.readByte();
  //        streamReader.log("SKIPPING " + blockSize + " BYTES");
              streamReader.skipBytes(blockSize);
            }
            streamReader.log("DATA END");
            streamReader.skipBytes(1); //NULL terminator
          } else if (streamReader.isNext([0x21, 0xF9, 0x04])) {
            streamReader.log("GRAPHICS CONTROL EXTENSION!");
            // We _definitely_ have a frame. Now we're expecting an image
            var index = streamReader.index;
  
            streamReader.skipBytes(3);
            var disposalMethod = streamReader.readByte() >> 2;
            streamReader.log("DISPOSAL " + disposalMethod);
            var delay = streamReader.readByte() + streamReader.readByte() * 256;
            frames.push({ index: index, delay: delay, disposal: disposalMethod });
            streamReader.log("FRAME DELAY " + delay);
            streamReader.skipBytes(2);
            expectingImage = true;
          } else {
            var maybeTheEnd = streamReader.index;
            while (!streamReader.finished() && !streamReader.isNext([0x21, 0xF9, 0x04])) {
              streamReader.readByte();
            }
            if (streamReader.finished()) {
              streamReader.index = maybeTheEnd;
              streamReader.log("WE END");
              spinning = false;
            } else {
              streamReader.log("UNKNOWN DATA FROM " + maybeTheEnd);
            }
          }
        }
        var endOfFrames = streamReader.index;
  
        var gifFooter = buffer.slice(-1); //last bit is all we need
        for (var i = 0; i < frames.length; i++) {
          var frame = frames[i];
          var nextIndex = (i < frames.length - 1) ? frames[i + 1].index : endOfFrames;
          frame.blob = new Blob([ gifHeader, buffer.slice(frame.index, nextIndex), gifFooter ], {type: 'image/gif'});
          frame.url = url.createObjectURL(frame.blob);
        }
  
        resolve(new Gif(frames));
      })
    }
  }

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
        
        // allow drag/drop of files
        this.setupDragDrop();

        console.log("I am done being initted.");
    },
    showAnimationElements: function() {
      $('.widget-xbm-anim').removeClass("hidden");  
    },
    hideAnimationElements: function() {
      $('.widget-xbm-anim').addClass("hidden"); 
    },
    setupDragDrop: function() {
        this.bind("#" + this.id, null);
    },
    onGeneratedFilesDone: function(fileWriteStr, fileLibStr, filePlayStr, fileList) {
      // we get this callback from onFileDropped with 3 files and a fileList
      // do pubsub to send these to the Lua editor
      var obj = {
          name: fileList.write,
          content: fileWriteStr
      }
      chilipeppr.publish("/com-chilipeppr-widget-luaeditor/loadScript", obj);
      
      var obj = {
          name: fileList.lib,
          content: fileLibStr
      }
      chilipeppr.publish("/com-chilipeppr-widget-luaeditor/loadScript", obj);
      
      var obj = {
          name: fileList.play,
          content: filePlayStr
      }
      chilipeppr.publish("/com-chilipeppr-widget-luaeditor/loadScript", obj);
    },
    onFileDropped: function(dataAsArrayBuffer, info) {
        console.log("got file dropped. len:", dataAsArrayBuffer.length, "info:", info);
        
        // What we'll do here is create 3 files
        // 1. write_myimagename.lua -  Write the animated gif to sdcard
        // 2. lib_myimagename.lua - Library to read/play the animated gif
        // 3. play_myimagename.lua - Sample read/play file
        
        var that = this;
        
        var ex = new Exploder(info.name);
        var gifPromise = ex.load(dataAsArrayBuffer);
        // console.log("gifPromise:", gifPromise);
        
        gifPromise.then(
            // Log the fulfillment value
            function(animGif) {
                console.log("animGif:", animGif);
                var len = animGif.frames.length;
                var frames = animGif.frames;
                console.log("frame count:", len);
                // that.loadGifImage({filename:"asdf.gif", dataURL: frames[42].url});
                // var img = document.createElement('img');
                // $(img).on('load', function(imgRef) { console.log("image loaded correctly. imgRef:", imgRef); })
                // console.log("img:", img);
                
                // get width/height
                if (frames.length > 0) {
                  
                  // since we have frames, let's assume animation
                  that.showAnimationElements();
                  
                  // update amt of frames
                  $('.widget-xbm-anim-frameCnt').text(frames.length);
                  
                  // hide help text
                  $(".editor-box-note").addClass("hidden");
                  
                  // remove height from $("div#editor-box").height(h)
                  $("div#editor-box").css("height", "");
            
                  var fname = info.name; // + ".xbm";
                  
                  // We need 4 filenames
                  // write_myimagename.lua
                  // myimagename.xbm
                  // lib_myimagename.lua
                  // play_myimagename.lua
                  
                  // if filename can be max 31 chars, we need to reserve room for "write_" which is 6 chars
                  // and ".lua" which is 4 chars, so max filename for image is 21 chars
                  
                  // filenames can only be 31 chars long total on ESP32 spiffs sdcard
                  if (fname.length > 21) {
                    fname = fname.substr(0,21);
                    console.log("New shortened filename:", fname, "len:", fname.length)
                  }
                  
                  // need to swap . for _
                  fname = fname.replace(/\./g, "_");
                  
                  var fileList = {
                    base: fname,
                    write: fname + "_write" +  ".lua",
                    img: fname + ".xbm",
                    lib: fname + "_lib.lua",
                    play: fname + "_play.lua"
                  }
                  
                  // get textaarea
                  var tEl = $('.widget-xbm-arraydata');
                  tEl.removeClass("hidden");
                  tEl.val("-- " + fileList.write + `
-- Run this file first, not by uploading/compiling, but by running
-- with just the "Run" button to stream the contents to your ESP32.
-- If you try to compile it, and you have a lot of frames, you will run
-- out of memory.
-- After running this, you will have a new image file ` + fileList.img + `
-- Then you can use the library file and sample play file.
--
-- ChiliPeppr ESP32 for Lua Workspace
-- http://chilipeppr.com/esp32
-- Write an animated GIF to an XBM image array file
-- Each GIF frame is written as an XBM frame to the file
-- An index reader Lua file is also written so you can read
-- in the XBM image frames from the animated GIF

-- This method writes the xbmimg hex array to the file
function appendImg()

-- open file in append+ mode, preserve data, write to end  
local filename = "` + fileList.img + `"
if file.open(filename, "a+") then
local xbmimgstr = string.char(unpack(xbmimg))
file.write(xbmimgstr)
file.close()
print("Done appending binary XBM img to file:", filename)
else
print("Could not open file for binary write of XBM img. file:", filename)
end

end 

-- Store frames
frames = {}
startByteCnt = 0
endByteCnt = 0
lastEndByteCnt = 0
frameCnt = 1

function xbmConcat(t2)
for i=1, #t2 do
  xbmimg[#xbmimg+1] = t2[i]
end
end
`);

                  // let's also generate a library
                  // we need a duration array generated 
                  // var durationArr = [];
                  var durationArrStr = "";
                  for (var i = frames.length; i--; ) {
                    var delayVal = frames[i].delay;
                    console.log("delay:", delayVal);
                    // the delay comes in at 1/100th of a second rather than in ms, so multiply by 10
                    delayVal = delayVal * 10;
                    // do minimum 20ms delay because less seems to freeze esp32
                    if (delayVal < 20) delayVal = 20;
                    // durationArr.push(delayVal);
                    durationArrStr += delayVal + ",";
                    if (i % 10 == 0) { durationArrStr += "\n"; }
                    console.log("tweaked delay:", delayVal);
                  }
                  // var durationArrStr = durationArr.join(",");
                  var tLibEl = $('.widget-xbm-animplaylib');
                  tLibEl.val("-- " + fileList.lib + `
-- Library to read/play an animated GIF file that's in XBM format
-- ChiliPeppr ESP32 for Lua Workspace
-- http://chilipeppr.com/esp32

-- To use:
-- anim = require("` + fileList.base + `_lib")
-- anim.play()
-- anim.stop()
-- anim.showFrame(1)

local m = {}
-- m = {}

-- contains the xbm image
m.xbmimgstr = nil
m.width = ##width## 
m.height = ##height##
m.filename = "` + fileList.img + `"
m.frameCnt = ` + animGif.frames.length + `
m.frameSize = ##hexItemCnt##  -- size in bytes of each frame
m.frameDurationMs = {` + durationArrStr + `}

m.disp = nil -- holds display
m.isInitted = false 

function m.init()
  if m.isInitted then return end 
  m.setupDisplay()
  m.isInitted = true
end 

m.nextFrame = 1 -- Lua indexes start at 1 
function m.play()
  m.init()
  -- Play the animation
  m.tmr = tmr.create()
  if not m.tmr then
    print("Could not start timer for animation")
    return
  end
  
  print("Playing animated GIF. Width:", m.width, "Height:", m.height, "Frames:", m.frameCnt, "FrameSize (bytes):", m.frameSize)
  -- Start at beginning of animation
  m.nextFrame = 1 -- Lua indexes start at 1 
  m.playFrame()

end

-- Will show current frame and then set timer to callback for 
-- showing next frame 
function m.playFrame()
  -- show current frame 
  local currentFrame = m.nextFrame
  m.showFrame(currentFrame)
  
  -- make the nextFrame really be the next frame now
  m.nextFrame = m.nextFrame + 1 
  if m.nextFrame > m.frameCnt then m.nextFrame = 1 end 
  
  -- set timer for callback to this method on next frame 
  m.tmr:alarm(m.frameDurationMs[currentFrame], tmr.ALARM_SINGLE, function()
    m.playFrame()
  end)

end

function m.stop()
  m.tmr:unregister()
  print("Stopped playing Animated GIF. file:", m.filename)
end

function m.loadFrame(frameNum)
  if file.open(m.filename, "r") then
    -- skip the first N bytes of the file
    local bytesToSkip = (frameNum - 1) * m.frameSize
    -- print("Will skip bytes:", bytesToSkip)
    file.seek("set", bytesToSkip)
    m.xbmimgstr = file.read(m.frameSize)
    file.close()
    -- print("Done reading binary XBM img frame. file:", m.filename)
  else
    print("Could not open file for binary read of XBM img. file:", m.filename)
  end
end

function m.showFrame(frameNum)
  m.init()
  m.loadFrame(frameNum)
  m.sendImgToDisplay()
end

function m.setupDisplay()

  -- only setup display if disp not created yet
  if m.disp ~= nil then return end
  
  local id  = i2c.HW0
  local sda = 5 --16
  local scl = 4 --17
  i2c.setup(id, sda, scl, i2c.FAST)
  
  local sla = 0x3c
  m.disp = u8g2.ssd1306_i2c_128x64_noname(id, sla)
end

function m.sendImgToDisplay()
  m.disp:clearBuffer()
  -- disp:sendBuffer() 
  
  -- make sure to set your display width height below
  local x = (128 - m.width) / 2
  local y = (64 - m.height) / 2
  m.disp:drawXBM(x,y,m.width,m.height,m.xbmimgstr)
  m.disp:sendBuffer() 
end

return m

-- m.init()
-- m.showFrame(2)
-- m.play()
-- m.loadFrame(1)
-- m.sendImgToDisplay()
`);

                  // let's also generate a sample play of the library
                  var tPlayEl = $('.widget-xbm-animplaysample');
                  tPlayEl.val("-- " + fileList.play + `
-- Sample file to read/play an animated GIF library that's in XBM format
-- ChiliPeppr ESP32 for Lua Workspace
-- http://chilipeppr.com/esp32

anim = require("` + fileList.base + `_lib")
anim.play()
-- anim.stop()
-- anim.showFrame(1)
`);
                  
                  // good, we have frames. load one.
                  var firstFrame = frames[0];
                  var img = document.createElement('img');
                  
                  $(img).on('load', function(imgRef) { 
                    var w = imgRef.currentTarget.width;
                    var h = imgRef.currentTarget.height;
                    console.log("w:", w, "h:", h, "imgRef:", imgRef); 
                    
                    // update library code
                    var libStr = tLibEl.val();
                    libStr = libStr.replace(/##width##/, w);
                    libStr = libStr.replace(/##height##/, h);
                    tLibEl.val(libStr);
                    
                    // set the width/height in info boxes
                    $('.widget-xbm-img-w').text(w);
                    $('.widget-xbm-img-h').text(h);
                  
                    // create a canvas in the div#editor-box
                    var imgEl = $("div#editor-box");
                    imgEl.html("");
                    imgEl.css({
                      backgroundImage: ""
                      });
                    imgEl.append("<canvas />");
                    imgEl.append('<div style="padding:6px 0px;">Image fragment preview</div><img class="widget-xbm-img-preview" />');
                     
                    // var canvas = document.createElement('canvas');
                    var canvas = imgEl.find('canvas')[0];
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext('2d');
                    // ctx.fillStyle = "white";
                    // ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, img.width, img.height);
            
                    // this is the image below the canvas
                    var innerImg = imgEl.find('img')[0];
                    innerImg.width = img.width;
                    innerImg.height = img.height;
                    innerImg.src = firstFrame.url; //imgRef.currentTarget.src;
                    
                    // return;
            
                    // var imgEl = $("div#editor-box").height(h).text("").css({
                    //   backgroundImage: "url(" + frame.url + ")"
                    //   }).data({ 'width': w, 'height': h });
                    //   $(".editor-box-note").addClass("hidden");
                      
                    // now slowly loop thru each frame by setting a ton of delayed calls
                    var cnt = 0;
                    // for (var i = 0; i < frames.length; i++ ) {
                    var isWorking = false;
                    var myInterval = setInterval(function() {
                      
                      if (isWorking) {
                        console.log("Working on image:", cnt, "still so skipping");
                      } else {
                        console.log("going to work on image:", cnt);
                        isWorking = true;
                        let myFirstPromise = new Promise((resolve, reject) => {
                          
                          // setTimeout(function() {
                            console.log("Working on frame:", frames[cnt]);
                                              
                            // imgEl.css({
                            //   backgroundImage: "url(" + frames[cnt].url + ")"
                            //   });
                            var img2 = document.createElement('img');
                            $(img2).on('load', function(imgRef) {
                              console.log(imgRef.currentTarget);
                              var ctx = canvas.getContext('2d');
                              // ctx.fillStyle = "white";
                              // ctx.fillRect(0, 0, canvas.width, canvas.height);
                              ctx.drawImage(imgRef.currentTarget, 0, 0, img.width, img.height);
                              
                              // update img below canvas as well to show sub img
                              innerImg.src = imgRef.currentTarget.src;
                              
                              // generate some lua code
                              var ret = that.generateXbmImageHexArrayFromCanvas(canvas);
                              tEl.val(tEl.val() + "\n\n" + ret.script);
                              
                              // we now know the hexItemCnt so swap it in
                              tLibEl.val(tLibEl.val().replace(/##hexItemCnt##/, ret.hexItemCnt));
                              
                              cnt++;
                              resolve(cnt); // Yay! Everything went well!
                              // cnt++;
                              
                            });
                            img2.src = frames[cnt].url;
                            $('.widget-xbm-anim-frame').text(cnt+1);
                            // cnt++;

                            
                          // }, 100 * (i + 1));
                          
                        }); // ends promise
                        
                        // cnt++;
                        
                        myFirstPromise.then((successMessage) => {
                          // successMessage is whatever we passed in the resolve(...) function above.
                          // It doesn't have to be a string, but if it is only a succeed message, it probably will be.
                          console.log("Yay! " + successMessage);
                          
                          // see if we are at the end
                          if (successMessage == frames.length) {
                            console.log("Done writing out animated GIF frames.");
                            tEl.val(tEl.val() + `
print("Done creating XBM animated gif file ` + fileList.img + `")
for i,v in ipairs(frames) do 
  print("Frame:", i, "Start:", frames[i].s, "End:", frames[i].f)
end
`);
              
                            setTimeout(function() {
                              that.onGeneratedFilesDone(tEl.val(), tLibEl.val(), tPlayEl.val(), fileList);
                            }, 500);
                            
                            // cancel interval
                            clearInterval(myInterval);
                            console.log("cleared interval");
                          }
                          
                          
                          isWorking = false;
                          
                        }); // end promise.then()
                        
                      } // end if isWorking
                      
                    }, 20); // set interval  
                    // } // for loop
                    
                    
                    
                  });
                  img.src = firstFrame.url;
                }
                
            }
        );

    },
    /**
     * Generate xbmImage array of hex data in Lua code for a canvas
     */
    generateXbmImageHexArrayFromCanvas: function(canvas) {
      console.log("generateXbmImageHexArrayFromCanvas. canvas:", canvas);
      var hexStr = "";
      var hexArr = [];
      var pxWhtCnt = 0;
      var pxBlkCnt = 0;
      
      var w = canvas.width;
      var h = canvas.height;

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
              
              // if red, green, or blue is more than 128 assume 0xff, otherwise assume 0
              // this is essentially a 50% threshold
              if (pixelData[0] > 128 || pixelData[1] > 128 || pixelData[2] > 128 ) {
                  
                  // we are forcing this pixel to white
                  bit = "0" + bit; // set 0,0 to lowest bit
                  pxWhtCnt++;
                  
                  imgCtx.fillStyle = "white";    // this is default anyway
                  imgCtx.fillRect(x, y, 1, 1);
                  
              } else {
                  
                  // we are forcing this pixel to black
                  bit = "1" + bit;
                  pxBlkCnt++;
                  
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
      // $("div#editor-box").css({backgroundImage: "url(" + newDataURL + ")"});
      
      // imgData
      console.log("pxArr:", pxArr);
      
      // create hex arr
      for (var pxToHexCtr = 0; pxToHexCtr < pxArr.length; pxToHexCtr++) {
          var len = 2;
          var str = parseInt(pxArr[pxToHexCtr], 2).toString(16);
          var hexstr = "0".repeat(len - str.length) + str;
          hexArr.push( "0x" + hexstr.toUpperCase() );
      }
      
      var finalScript = ""; // tEl.val();
      
      
      // we need to wrap a new line at each 12th comma
      finalScript += 'xbmimg = {}\n'
      var itemCtrForNewline = 1;
      var hexItemCnt = 0;
      for (var itemCtr = 0; itemCtr < hexArr.length; itemCtr++) {
        
        if (itemCtrForNewline == 1) {
          finalScript += 'xbmConcat({'
        }
        
        finalScript += hexArr[itemCtr] + ", ";
        hexItemCnt++;
        
        if (itemCtrForNewline == 12) {
            finalScript += "})\n";
            itemCtrForNewline = 1;
        } else {
            itemCtrForNewline++;
        }
      }
      // finalScript += hexArr.join(", ") 
      if (itemCtrForNewline != 1) {
        finalScript += "})\n";
      }
      
      finalScript += "-- hexItemCnt: " + hexArr.length + "\n";
      
      if (hexItemCnt != hexArr.length) {
        console.error("hexItemCnt does not match. hexItemCnt:", hexItemCnt, "hexArr.length:", hexArr.length);
      }
      
      finalScript += `startByteCnt = lastEndByteCnt + 1
endByteCnt = lastEndByteCnt + #xbmimg
frames[frameCnt] = {["s"] = startByteCnt, ["f"] = endByteCnt}
frameCnt = frameCnt + 1
lastEndByteCnt = endByteCnt
appendImg()
`;
      return {script:finalScript, hexItemCnt:hexArr.length};
    },
    /**
     * Pass in {filename: "asdf.gif", dataURL: (url blob)}
     */
    loadGifImage: function(results) {
        
        console.log("loadGifImage:", results);
        var dataURL, filename;
        filename = results.filename, dataURL = results.dataURL;
        // $data.text(dataURL);
        // $size.val(results.file.size);
        // $type.val(results.file.type);
        // $test.attr('href', dataURL);
        var img = document.createElement('img');
        img.src = dataURL;
        
        var mythat = this;
        
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
            
            // $width.val(w); $height.val(h);
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
            
    },
    bind: function (dropDomElemSelector, txtDomElemSelector) {
        // Create drag and drop
        //dropArea = $('.dropArea');
        this.dropArea = $(dropDomElemSelector);
        this.txtDomElemSelector = $(txtDomElemSelector);
        
        var that = this;

        // Attach our drag and drop handlers.
        this.dropArea.bind({
            dragover: function () {
                $(this).addClass('hover');
                // $(".com-chilipeppr-elem-dragdrop").addClass('hover');
                //$(".com-chilipeppr-elem-dragdrop").popover('show');
                chilipeppr.publish("/com-chilipeppr-elem-dragdrop/ondragover", "");
                return false;
            },
            dragend: function () {
                $(this).removeClass('hover');
                // $(".com-chilipeppr-elem-dragdrop").removeClass('hover');
                //$(".com-chilipeppr-elem-dragdrop").popover('hide');
                chilipeppr.publish("/com-chilipeppr-elem-dragdrop/ondragleave", "");
                return false;
            },
            dragleave: function () {
                $(this).removeClass('hover');
                // $(".com-chilipeppr-elem-dragdrop").removeClass('hover');
                //$(".com-chilipeppr-elem-dragdrop").popover('hide');
                chilipeppr.publish("/com-chilipeppr-elem-dragdrop/ondragleave", "");

                return false;
            },
            drop: function (e) {
                $(this).removeClass('hover');
                // $(".com-chilipeppr-elem-dragdrop").removeClass('hover');
                //$(".com-chilipeppr-elem-dragdrop").popover('hide');
                chilipeppr.publish("/com-chilipeppr-elem-dragdrop/ondragleave", "");

                e = e || window.event;
                e.preventDefault();

                // jQuery wraps the originalEvent, so we try to detect that here...
                e = e.originalEvent || e;
                //console.log(e);

                // Using e.files with fallback because e.dataTransfer is immutable and can't be overridden in Polyfills (http://sandbox.knarly.com/js/dropfiles/).            
                var files = (e.files || e.dataTransfer.files);
                //console.log(files);
                for (var i = 0; i < files.length; i++) {
                    (function (i) {
                        // Loop through our files with a closure so each of our FileReader's are isolated.
                        var reader = new FileReader();
                        //console.log(reader);
                        //console.log("file");
                        //console.log(files[i]);
                        var thefile = files[i];
                        reader.onload = function (event) {
                            //console.log(event);
                            //console.log(event.target.result);
                            //console.log(event.target.result);
                            // $(this.txtDomElemSelector).html(event.target.result);

                            // publish event to pubsub
                            var info = {
                                name: thefile.name, 
                                lastModified: thefile.lastModifiedDate
                            };
                            console.log("the drag/drop widget is about to publish an onDropped event. file.length:", event.target.result.length, "info:", info);
                            // chilipeppr.publish("/com-chilipeppr-elem-dragdrop/ondropped", event.target.result, info);
                            /*
                            chilipeppr.publish(
                                "/com-chilipeppr-elem-flashmsg/flashmsg", "File Loaded", 
                                '<div class="row">' +
                                '<div class="col-xs-3">' + 
                                "Name: " + 
                                '</div><div class="col-xs-9">' + 
                                thefile.name +  
                                '</div>' + 
                                '</div><div class="row">' +
                                '<div class="col-xs-3">' + 
                                "Size: " + 
                                '</div><div class="col-xs-9">' + 
                                thefile.size + 
                                '</div>' + 
                                '</div><div class="row">' +
                                '<div class="col-xs-3">' + 
                                "Last Modified: " + 
                                '</div><div class="col-xs-9">' + 
                                thefile.lastModifiedDate +
                                '</div>' +
                                '</div>' +
                                "</div>", 1000 * 3, true);
                            */
                            that.onFileDropped(event.target.result, info);
                        };
                        //reader.readAsDataURL(files[i]);
                        // reader.readAsText(files[i]);
                        reader.readAsArrayBuffer(files[i]);
                    })(i);
                }

                return false;
            }
        });
        // end drop area code
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
                      
                      // clear any animation element items
                      $('.widget-xbm-anim').addClass("hidden");
                      
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
                      console.log("clipboardData:", clipboardData);
                      return Array.prototype.forEach.call(clipboardData.types, function (type, i) {
                          var file, reader;
                          if (found) {
                              return;
                          }
                          if (type.match(options.matchType) || clipboardData.items[i].type.match(options.matchType)) {
                              file = clipboardData.items[i].getAsFile();
                              console.log("file:", file);
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
            // debugger;
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
                
                // send to lua editor
                mythat.onCreateScript();
                
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