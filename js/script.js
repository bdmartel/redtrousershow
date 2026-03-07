// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());



/*-----------------------------------------------------------------------------------*/
/* PRELOADER
/*-----------------------------------------------------------------------------------*/ 

(function($) {


    if (!Array.prototype.indexOf)
	   {
	   Array.prototype.indexOf = function(elt /*, from*/)
             {
             var len  = this.length >>> 0;
             var from = Number(arguments[1]) || 0;
                 from = (from < 0)
                      ? Math.ceil(from)
                      : Math.floor(from);
             if (from < 0)
                 from += len;
 
                 for (; from < len; from++)
                     {
                     if (from in this &&
                     this[from] === elt)
                     return from;
                     }
             return -1;
             };
       }


    var qLimages = new Array;
    var qLdone = 0;
    var qLdestroyed = false;

    var qLimageContainer = "";
    var qLoverlay = "";
    var qLbar = "";
    var qLpercentage = "";
    var qLimageCounter = 0;
    var qLstart = 0;

    var qLoptions = {
        onComplete: function () {},
        backgroundColor: "#000",
        barColor: "#fff",
        barHeight: 1,
        percentage: false,
        deepSearch: true,
        completeAnimation: "fade",
        minimumTime: 500,
        onLoadComplete: function () {
            if (qLoptions.completeAnimation == "grow") {
                var animationTime = 500;
                var currentTime = new Date();
                if ((currentTime.getTime() - qLstart) < qLoptions.minimumTime) {
                    animationTime = (qLoptions.minimumTime - (currentTime.getTime() - qLstart));
                }

                $(qLbar).stop().animate({
                    "width": "100%"
                }, animationTime, function () {
                    $(this).animate({
                        top: "0%",
                        width: "100%",
                        height: "100%"
                    }, 500, function () {
                        $(qLoverlay).fadeOut(500, function () {
                            $(this).remove();
                            qLoptions.onComplete();
                        })
                    });
                });
            } else {
                $(qLoverlay).fadeOut(500, function () {
                    $(qLoverlay).remove();
                    qLoptions.onComplete();
                });
            }
        }
    };

    var afterEach = function () {
        //start timer
        var currentTime = new Date();
        qLstart = currentTime.getTime();

        createPreloadContainer();
        createOverlayLoader();
    };

    var createPreloadContainer = function() {
        qLimageContainer = $("<div></div>").appendTo("body").css({
            display: "none",
            width: 0,
            height: 0,
            overflow: "hidden"
        });
        for (var i = 0; qLimages.length > i; i++) {
            $.ajax({
                url: qLimages[i],
                type: 'HEAD',
                complete: function(data) {
                    if(!qLdestroyed){
                        qLimageCounter++;
                        addImageForPreload(this['url']);
                    }
                }
            });
        }
    };

    var addImageForPreload = function(url) {
        var image = $("<img />").attr("src", url).bind("load error", function () {
            completeImageLoading();
        }).appendTo(qLimageContainer);
    };

    var completeImageLoading = function () {
        qLdone++;

        var percentage = (qLdone / qLimageCounter) * 100;
        $(qLbar).stop().animate({
            width: percentage + "%",
            minWidth: percentage + "%"
        }, 200);

        if (qLoptions.percentage == true) {
            $(qLpercentage).text(Math.ceil(percentage) + "%");
        }

        if (qLdone == qLimageCounter) {
            destroyQueryLoader();
        }
    };

    var destroyQueryLoader = function () {
        $(qLimageContainer).remove();
        qLoptions.onLoadComplete();
        qLdestroyed = true;
    };

    var createOverlayLoader = function () {
        qLoverlay = $("<div id='qLoverlay'></div>").css({
            width: "100%",
            height: "100%",
            backgroundColor: qLoptions.backgroundColor,
            backgroundPosition: "fixed",
            position: "fixed",
            zIndex: 666999,
            top: 0,
            left: 0
        }).appendTo("body");
        qLbar = $("<div id='qLbar'></div>").css({
            height: qLoptions.barHeight + "px",
            marginTop: "-" + (qLoptions.barHeight / 2) + "px",
            backgroundColor: qLoptions.barColor,
            width: "0%",
            position: "absolute",
            top: "50%"
        }).appendTo(qLoverlay);
        if (qLoptions.percentage == true) {
            qLpercentage = $("<div id='qLpercentage'></div>").text("0%").css({
                height: "40px",
                width: "100px",
                position: "absolute",
                fontSize: "3em",
                top: "50%",
                left: "50%",
                marginTop: "-" + (59 + qLoptions.barHeight) + "px",
                textAlign: "center",
                marginLeft: "-50px",
                color: qLoptions.barColor
            }).appendTo(qLoverlay);
        }
    };

    var findImageInElement = function (element) {
        var url = "";

        if ($(element).css("background-image") != "none") {
            var url = $(element).css("background-image");
        } else if (typeof($(element).attr("src")) != "undefined" && element.nodeName.toLowerCase() == "img") {
            var url = $(element).attr("src");
        }

        if (url.indexOf("gradient") == -1) {
            url = url.replace(/url\(\"/g, "");
            url = url.replace(/url\(/g, "");
            url = url.replace(/\"\)/g, "");
            url = url.replace(/\)/g, "");

            var urls = url.split(", ");

            for (var i = 0; i < urls.length; i++) {
                if (urls[i].length > 0 && qLimages.indexOf(urls[i]) == -1) {
                    var extra = "";
                    if ($.browser.msie && $.browser.version < 9) {
                        extra = "?" + Math.floor(Math.random() * 3000);
                    }
                    qLimages.push(urls[i] + extra);
                }
            }
        }
    }

    $.fn.queryLoader2 = function(options) {
        if(options) {
            $.extend(qLoptions, options );
        }

        this.each(function() {
            findImageInElement(this);
            if (qLoptions.deepSearch == true) {
                $(this).find("*:not(script)").each(function() {
                    findImageInElement(this);
                });
            }
        });

        afterEach();

        return this;
    };

})(jQuery);



/*-----------------------------------------------------------------------------------*/
/* TUMBLR 'PHOTOSET' STYLE PROTO GALLERY
/*-----------------------------------------------------------------------------------*/ 

if(!Util)
{
	var Util={}
}
Util.windowDimensions=function(){
	if( window.innerWidth!==undefined )
	{
		return { width:window.innerWidth,height:window.innerHeight }
	} else {
		if ( document.documentElement )
		{
			return { width:document.documentElement.clientWidth, height:document.documentElement.clientHeight }
		} else {
			return { width:document.body.clientWidth, height:document.body.clientHeight }
		}
	}
};
Util.Lightbox= (function(){
	var _initialized=false;
	var _original_onkeydown=false;
	var _original_onresize=false;
	var _image_urls=[];
	var _just_clicked_photo=false;
	var _position=false;
	var _cas=false;
	var _show_vignette_timeout=false;
	var _images={left:false,center:false,right:false};
	function init(image_urls,position){
		if (document.getElementById("Util_lightbox"))
		{
			return
		}
		if (!position)
		{
			position=1
		}
		_image_urls=image_urls;
		if(navigator&&navigator.userAgent.indexOf("Firefox")!=-1)
		{
			var focus_input=document.createElement("input");
			focus_input.setAttribute("id","Util_Lightbox_focus_input");
			focus_input.setAttribute("type","text");
			focus_input.style.position="fixed";
			focus_input.style.top=0;
			focus_input.style.left=0;
			document.body.appendChild(focus_input);
			focus_input.focus();
			document.body.removeChild(focus_input)
		} else {
			window.focus()
		} 
		if ( !_initialized )
		{
			if ( window.onkeydown )
			{
				_original_onkeydown=window.onkeydown
			}
			window.onkeydown = function(e){
				if ( document.getElementById("Util_lightbox") )
				{
					if ( !e )
					{
						e=window.event
					}
					var code=e.charCode?e.charCode:e.keyCode;
					if( !e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey )
					{
						if(code==37)
						{
							if(_position>1)
							{
								setPosition(_position-1)
							}
						}
						else {
							if( code==39 )
							{
								if(_position<_image_urls.length)
								{
									setPosition(_position+1)}
								}
								else {
									if(code==27||code==32||code==74||code==75)
									{
										close()
									}
							}
						}
					} else {
						if( (e.ctrlKey||e.metaKey)&&code==87 )
						{
							close();
							return false
						}
					}
				}
				if(_original_onkeydown){
					_original_onkeydown()
				}
			};
			if(window.onresize){
				_original_onresize=window.onresize
			}
			window.onresize=function(){
				if(document.getElementById("vignette"))
				{
					document.getElementById("vignette").style.display="none";
					if(_show_vignette_timeout)
					{
						clearTimeout(_show_vignette_timeout)
					}
					_show_vignette_timeout=setTimeout( 
						function()
						{
							document.getElementById("vignette").style.display="inline-block"
						},100)
				}
				draw();
				if(_original_onresize)
				{
					_original_onresize()
				}
			};
			if(navigator&&navigator.userAgent.search("iPad")!=-1 || navigator&&navigator.userAgent.search("iPhone")!=-1)
			{
				var initX;
				document.addEventListener("touchstart", function(e){
					var touch = e.changedTouches[0];
					initX = touch.pageX; 
				},false);
				document.addEventListener("touchmove",function(e){
					if ( document.getElementById("Util_lightbox") )
					{
						
						var touch = e.changedTouches[0];
						var curX = touch.pageX;
						if ( curX - initX > 20 )
						{
							if(_position>1)
							{
								setPosition(_position-1);
								initX = 0;
							}
						}
						if ( curX - initX < -20 )
						{
							if(_position<_image_urls.length)
							{
								setPosition(_position+1);
								initX = 0;
							}
						
						}
					}
				},false);
				
				document.addEventListener("touchend", function(e){
					initX = 0;
				},false)

			}
			_initialized=true
		}
		document.body.style.overflow="hidden";
		var container=document.createElement("div");container.setAttribute("id","Util_lightbox");
		if(navigator&&navigator.userAgent.search("iPad")!=-1)
		{
			container.style.position="absolute";
			container.style.top=document.body.scrollTop+"px";container.style.height=window.innerHeight+"px"
		} else {
			container.style.position="fixed";
			container.style.top="0px";
			container.style.bottom="0px"
		}
		container.style.left="0px";
		container.style.right="0px";
		container.style.zIndex=4294967294;
		container.style.overflow="hidden";
		container.style.backgroundColor=( navigator&&navigator.userAgent.indexOf("MSIE")!=-1)?"#222":"rgba(15,15,15,0.95)";
		container.onclick=function(){
			if(_just_clicked_photo)
			{
				_just_clicked_photo=false
			} else {
				close()
			}
		};
		if(!(navigator&&navigator.userAgent.search("iPad")!=-1)&&!(navigator&&navigator.userAgent.search("MSIE")!=-1))
		{
			var vignette=document.createElement("img");
			vignette.setAttribute("id","vignette");
			vignette.setAttribute("src","img/fullPageBG.png");
			vignette.style.position="absolute";
			vignette.style.width="100%";
			vignette.style.height="100%";
			vignette.style.left="0px";
			vignette.style.top="0px";
			container.appendChild(vignette);
			var vignette_cover=document.createElement("div");
			vignette_cover.style.position="absolute";
			vignette_cover.style.width="100%";
			vignette_cover.style.height="100%";
			vignette_cover.style.left="0px";
			vignette_cover.style.top="0px";
			container.appendChild(vignette_cover)
		}
		var center_container=document.createElement("div");
		center_container.style.position="absolute";
		center_container.style.left="50%";
		center_container.style.top="50%";
		container.appendChild(center_container);
		var stages=["left","center","right"];
		while(stage_name=stages.pop())
		{
			var link=document.createElement("a");
			link.setAttribute("id","Util_lightbox_"+stage_name+"_link");
			link.setAttribute("href","#");
			if(_image_urls.length<2){
				link.style.cursor="default"
			}
			center_container.appendChild(link);
			var img=document.createElement("img");
			img.setAttribute("id","Util_lightbox_"+stage_name+"_image");
			img.setAttribute("src","http://assets.Util.com/images/x.gif");
			img.style.mozBorderRadius="3px";
			img.style.webkitBorderRadius="3px";
			img.style.borderRadius="3px";
			if(navigator&&navigator.userAgent.indexOf("Chrome")!=-1)
			{
				img.style.moxBoxShadow="0 4px 30px rgba(0,0,0,1)";
				img.style.webkitBoxShadow="0 4px 30px rgba(0,0,0,1)";
				img.style.boxShadow="0 4px 30px rgba(0,0,0,1)"
			}
			img.style.borderWidth="0px";
			img.style.position="absolute";
			if(stage_name=="center")
			{
				img.style.zIndex=4294967295
			}
			link.appendChild(img)
		}
		var caption=document.createElement("div");
		caption.setAttribute("id","Util_lightbox_caption");
		caption.style.position="absolute";
		caption.style.textAlign="center";
		caption.style.font="bold 17px 'HelveticaNeue','Helvetica','Arial',sans-serif";
		caption.style.color="#fff";
		caption.style.paddingTop="20px";
		caption.style.textShadow="0 4px 30px rgba(0,0,0,1)";
		caption.style.display="inline-block";
		caption.style.textRendering="optimizeLegibility";
		center_container.appendChild(caption);
		document.body.appendChild(container);
		setPosition(position);
		draw()
	} //End lightbox Init
	function close(){
		document.body.style.overflow="";
		document.getElementById("Util_lightbox").style.display="none";
		document.body.removeChild(document.getElementById("Util_lightbox"))
	}
	function setPosition(position){
		_position=position;
		_cas=Math.round(Math.random()*1000000000000);
		document.getElementById("Util_lightbox_left_link").onclick=function(){
			_just_clicked_photo=true;
			setPosition(position-1);
			return false
		};
		if( _image_urls.length==1 )
		{
			document.getElementById("Util_lightbox_center_link").onclick=function(){return false}
		}  else {
			if(position<_image_urls.length)
			{
				document.getElementById("Util_lightbox_center_link").onclick=function(){
					_just_clicked_photo=true;
					setPosition(position+1);
					return false
				}
			} else { 
				document.getElementById("Util_lightbox_center_link").onclick=function(){
					_just_clicked_photo=true;
					setPosition(1);
					return false
				}
			}
		}
		document.getElementById("Util_lightbox_right_link").onclick=document.getElementById("Util_lightbox_center_link").onclick;
		_images.left=false;
		_images.center=false;
		_images.right=false;
		loadImage("center",position-1);
		if( position>1 )
		{
			loadImage("left",position-2)
		}
		if ( position<_image_urls.length )
		{
			loadImage("right",position)
		}
		if ( position+1<_image_urls.length )
		{
			var preload_img=new Image();
			preload_img.src=_image_urls[position+1].low_res
		}
	}
	function loadImage(stage,image_offset)
	{
		var high_res_img=new Image();
		var low_res_img=false;
		high_res_img.className=_cas;
		high_res_img.onload=function(){
			if(this.className==_cas)
			{
				this.className="high-res";
				_images[stage]=this;draw()
			}
		};
		high_res_img.src=_image_urls[image_offset].high_res;
		if ( !high_res_img.complete )
		{
			low_res_img=new Image();
			low_res_img.className=_cas;
			low_res_img.onload=function(){
				if (this.className==_cas&&(!_images[stage]||_images[stage].className=="placeholder"))
				{
					this.className="low-res";
					_images[stage]=this;
					draw()
				}
			};
			low_res_img.src=_image_urls[image_offset].low_res;
			if(_image_urls[image_offset].width&&_image_urls[image_offset].height)
			{
				if(low_res_img)
				{
					low_res_img.style.maxWidth=_image_urls[image_offset].width+"px";
					low_res_img.style.maxHeight=_image_urls[image_offset].height+"px"
				}
				high_res_img.style.maxWidth=_image_urls[image_offset].width+"px";
				high_res_img.style.maxHeight=_image_urls[image_offset].height+"px"
			}
			if(!low_res_img.complete&&(_image_urls[image_offset].width&&_image_urls[image_offset].height))
			{
				_images[stage]=new Image(_image_urls[image_offset].width,_image_urls[image_offset].height);
				_images[stage].style.maxWidth=_image_urls[image_offset].width+"px";
				_images[stage].style.maxHeight=_image_urls[image_offset].height+"px";
				_images[stage].src="http://assets.Util.com/images/x.gif";
				_images[stage].className="placeholder"
			}
		}
	}
	function draw()
	{
		var stages=["right","left","center"];
		while(stage_name=stages.pop())
		{
			var stage=document.getElementById("Util_lightbox_"+stage_name+"_image");
			if(!stage)
			{
				continue
			}
			var image=_images[stage_name];
			if(!image){stage.style.display="none";
				continue
			} else {
				stage.style.display="inline-block"
			}
			var image_width=image.style.maxWidth?parseInt(image.style.maxWidth,10):image.width;
			var image_height=image.style.maxHeight?parseInt(image.style.maxHeight,10):image.height;
			if(Util.windowDimensions().width/Util.windowDimensions().height<image_width/image_height)
			{
				var scale=(_image_urls.length==1)?0.85:0.75;
				if(Util.windowDimensions().width*scale>image_width&&(image.className=="high-res"||image.style.maxWidth))
				{
					stage.style.width=image_width+"px";
					stage.style.height=image_height+"px"
				} else {
					stage.style.height=(image_height*((Util.windowDimensions().width*scale)/image_width))+"px";
					stage.style.width=(Util.windowDimensions().width*scale)+"px"
				}
			} else {
				if ( Util.windowDimensions().height*0.85>image_height&&(image.className=="high-res"||image.style.maxHeight) )
				{
					stage.style.width=image_width+"px";
					stage.style.height=image_height+"px" 
				} else { 
					stage.style.width=(image_width*((Util.windowDimensions().height*0.85)/image_height))+"px";
					stage.style.height=(Util.windowDimensions().height*0.85)+"px"
				}
			}
			if ( stage_name=="center" )
			{
				stage.style.left= (0-parseInt(stage.style.width,10)/2)+"px";
				stage.style.top=(0-parseInt(stage.style.height,10)/2)+"px"
			} else {
				stage.style[stage_name]=(0-(parseInt(stage.style.width,10)+Util.windowDimensions().width*0.42))+"px";
				stage.style.top=(0-parseInt(stage.style.height,10)/2)+"px"
			}
			stage.src=image.src;
			stage.style.backgroundColor=(image.className=="placeholder")?((navigator&&navigator.userAgent.indexOf("MSIE")!=-1)?"#444":"rgba(255,255,255,0.05)"):"transparent";
			if ( stage_name=="center"&&_image_urls[_position-1].caption )
			{
				document.getElementById("Util_lightbox_caption").innerHTML=_image_urls[_position-1].caption;
				document.getElementById("Util_lightbox_caption").style.width=(Util.windowDimensions().width*0.7)+"px";
				document.getElementById("Util_lightbox_caption").style.top=(parseInt(stage.style.height,10)*0.5)+"px";
				document.getElementById("Util_lightbox_caption").style.left=(0-Util.windowDimensions().width*0.35)+"px";
				document.getElementById("Util_lightbox_caption").style.display="block"
			} else {
				if (stage_name=="center")
				{
					document.getElementById("Util_lightbox_caption").style.display="none"
				}
			}
		}
	}
	return{init:init}
})();



/*-----------------------------------------------------------------------------------*/
/* MAKES NAV LINK SCROLLABEL
/*-----------------------------------------------------------------------------------*/ 
$(document).ready(function(){
$(function(){
var sections = {},
_height = $(window).height(),
i = 0;
// Grab positions of our sections
$('.section').each(function(){
sections[this.name] = $(this).offset().top;
});
$(document).scroll(function(){
var $this = $(this),
pos = $this.scrollTop();
for(i in sections){
if(sections[i] > pos && sections[i] < pos + _height){
$('#nav li a').removeClass('active');
$('#nav_' + i).addClass('active');
}
}
});
});
$(".scroll").click(function(event){
event.preventDefault();
var full_url = this.href;
var parts = full_url.split("#");
var trgt = parts[1];
var target_offset = $("#"+trgt).offset();
var target_top = target_offset.top;
$('html, body').animate({scrollTop:target_top}, 500);
}); 
}); 



/*-----------------------------------------------------------------------------------*/
/* LIGHTBOX FOR WEEKLY SCHEDULE
/*-----------------------------------------------------------------------------------*/ 





(function ($, document, window) {
var

defaults = {
transition: "elastic",
speed: 300,
width: false,
initialWidth: "600",
innerWidth: false,
maxWidth: false,
height: false,
initialHeight: "450",
innerHeight: false,
maxHeight: false,
scalePhotos: true,
scrolling: true,
inline: false,
html: false,
iframe: false,
fastIframe: true,
photo: false,
href: false,
title: false,
rel: false,
opacity: 0.9,
preloading: true,
current: "image {current} of {total}",
previous: "previous",
next: "next",
close: "close",
open: false,
returnFocus: true,
reposition: true,
loop: true,
slideshow: false,
slideshowAuto: true,
slideshowSpeed: 2500,
slideshowStart: "start slideshow",
slideshowStop: "stop slideshow",
onOpen: false,
onLoad: false,
onComplete: false,
onCleanup: false,
onClosed: false,
overlayClose: true,
escKey: true,
arrowKey: true,
top: false,
bottom: false,
left: false,
right: false,
fixed: false,
data: undefined
},
// Abstracting the HTML and event identifiers for easy rebranding
colorbox = 'colorbox',
prefix = 'cbox',
boxElement = prefix + 'Element',
// Events
event_open = prefix + '_open',
event_load = prefix + '_load',
event_complete = prefix + '_complete',
event_cleanup = prefix + '_cleanup',
event_closed = prefix + '_closed',
event_purge = prefix + '_purge',
// Special Handling for IE
isIE = !$.support.opacity && !$.support.style, // IE7 & IE8
isIE6 = isIE && !window.XMLHttpRequest, // IE6
event_ie6 = prefix + '_IE6',
// Cached jQuery Object Variables
$overlay,
$box,
$wrap,
$content,
$topBorder,
$leftBorder,
$rightBorder,
$bottomBorder,
$related,
$window,
$loaded,
$loadingBay,
$loadingOverlay,
$title,
$current,
$slideshow,
$next,
$prev,
$close,
$groupControls,
// Variables for cached values or use across multiple functions
settings,
interfaceHeight,
interfaceWidth,
loadedHeight,
loadedWidth,
element,
index,
photo,
open,
active,
closing,
loadingTimer,
publicMethod,
div = "div",
init;
// ****************
// HELPER FUNCTIONS
// ****************
// Convience function for creating new jQuery objects
function $tag(tag, id, css) {
var element = document.createElement(tag);
if (id) {
element.id = prefix + id;
}
if (css) {
element.style.cssText = css;
}
return $(element);
}
// Determine the next and previous members in a group.
function getIndex(increment) {
var
max = $related.length,
newIndex = (index + increment) % max;
return (newIndex < 0) ? max + newIndex : newIndex;
}
// Convert '%' and 'px' values to integers
function setSize(size, dimension) {
return Math.round((/%/.test(size) ? ((dimension === 'x' ? $window.width() : $window.height()) / 100) : 1) * parseInt(size, 10));
}
// Checks an href to see if it is a photo.
// There is a force photo option (photo: true) for hrefs that cannot be matched by this regex.
function isImage(url) {
return settings.photo || /\.(gif|png|jpe?g|bmp|ico)((#|\?).*)?$/i.test(url);
}
// Assigns function results to their respective properties
function makeSettings() {
var i;
settings = $.extend({}, $.data(element, colorbox));
for (i in settings) {
if ($.isFunction(settings[i]) && i.slice(0, 2) !== 'on') { // checks to make sure the function isn't one of the callbacks, they will be handled at the appropriate time.
settings[i] = settings[i].call(element);
}
}
settings.rel = settings.rel || element.rel || 'nofollow';
settings.href = settings.href || $(element).attr('href');
settings.title = settings.title || element.title;
if (typeof settings.href === "string") {
settings.href = $.trim(settings.href);
}
}
function trigger(event, callback) {
$.event.trigger(event);
if (callback) {
callback.call(element);
}
}
// Slideshow functionality
function slideshow() {
var
timeOut,
className = prefix + "Slideshow_",
click = "click." + prefix,
start,
stop,
clear;
if (settings.slideshow && $related[1]) {
start = function () {
$slideshow
.text(settings.slideshowStop)
.unbind(click)
.bind(event_complete, function () {
if (settings.loop || $related[index + 1]) {
timeOut = setTimeout(publicMethod.next, settings.slideshowSpeed);
}
})
.bind(event_load, function () {
clearTimeout(timeOut);
})
.one(click + ' ' + event_cleanup, stop);
$box.removeClass(className + "off").addClass(className + "on");
timeOut = setTimeout(publicMethod.next, settings.slideshowSpeed);
};
stop = function () {
clearTimeout(timeOut);
$slideshow
.text(settings.slideshowStart)
.unbind([event_complete, event_load, event_cleanup, click].join(' '))
.one(click, function () {
publicMethod.next();
start();
});
$box.removeClass(className + "on").addClass(className + "off");
};
if (settings.slideshowAuto) {
start();
} else {
stop();
}
} else {
$box.removeClass(className + "off " + className + "on");
}
}
function launch(target) {
if (!closing) {
element = target;
makeSettings();
$related = $(element);
index = 0;
if (settings.rel !== 'nofollow') {
$related = $('.' + boxElement).filter(function () {
var relRelated = $.data(this, colorbox).rel || this.rel;
return (relRelated === settings.rel);
});
index = $related.index(element);
// Check direct calls to ColorBox.
if (index === -1) {
$related = $related.add(element);
index = $related.length - 1;
}
}
if (!open) {
open = active = true; // Prevents the page-change action from queuing up if the visitor holds down the left or right keys.
$box.show();
if (settings.returnFocus) {
$(element).blur().one(event_closed, function () {
$(this).focus();
});
}
// +settings.opacity avoids a problem in IE when using non-zero-prefixed-string-values, like '.5'
$overlay.css({"opacity": +settings.opacity, "cursor": settings.overlayClose ? "pointer" : "auto"}).show();
// Opens inital empty ColorBox prior to content being loaded.
settings.w = setSize(settings.initialWidth, 'x');
settings.h = setSize(settings.initialHeight, 'y');
publicMethod.position();
if (isIE6) {
$window.bind('resize.' + event_ie6 + ' scroll.' + event_ie6, function () {
$overlay.css({width: $window.width(), height: $window.height(), top: $window.scrollTop(), left: $window.scrollLeft()});
}).trigger('resize.' + event_ie6);
}
trigger(event_open, settings.onOpen);
$groupControls.add($title).hide();
$close.html(settings.close).show();
}
publicMethod.load(true);
}
}
// ColorBox's markup needs to be added to the DOM prior to being called
// so that the browser will go ahead and load the CSS background images.
function appendHTML() {
if (!$box && document.body) {
init = false;
$window = $(window);
$box = $tag(div).attr({id: colorbox, 'class': isIE ? prefix + (isIE6 ? 'IE6' : 'IE') : ''}).hide();
$overlay = $tag(div, "Overlay", isIE6 ? 'position:absolute' : '').hide();
$wrap = $tag(div, "Wrapper");
$content = $tag(div, "Content").append(
$loaded = $tag(div, "LoadedContent", 'width:0; height:0; overflow:hidden'),
$loadingOverlay = $tag(div, "LoadingOverlay").add($tag(div, "LoadingGraphic")),
$title = $tag(div, "Title"),
$current = $tag(div, "Current"),
$next = $tag(div, "Next"),
$prev = $tag(div, "Previous"),
$slideshow = $tag(div, "Slideshow").bind(event_open, slideshow),
$close = $tag(div, "Close")
);
$wrap.append( // The 3x3 Grid that makes up ColorBox
$tag(div).append(
$tag(div, "TopLeft"),
$topBorder = $tag(div, "TopCenter"),
$tag(div, "TopRight")
),
$tag(div, false, 'clear:left').append(
$leftBorder = $tag(div, "MiddleLeft"),
$content,
$rightBorder = $tag(div, "MiddleRight")
),
$tag(div, false, 'clear:left').append(
$tag(div, "BottomLeft"),
$bottomBorder = $tag(div, "BottomCenter"),
$tag(div, "BottomRight")
)
).find('div div').css({'float': 'left'});
$loadingBay = $tag(div, false, 'position:absolute; width:9999px; visibility:hidden; display:none');
$groupControls = $next.add($prev).add($current).add($slideshow);
$(document.body).append($overlay, $box.append($wrap, $loadingBay));
}
}
// Add ColorBox's event bindings
function addBindings() {
if ($box) {
if (!init) {
init = true;
// Cache values needed for size calculations
interfaceHeight = $topBorder.height() + $bottomBorder.height() + $content.outerHeight(true) - $content.height();//Subtraction needed for IE6
interfaceWidth = $leftBorder.width() + $rightBorder.width() + $content.outerWidth(true) - $content.width();
loadedHeight = $loaded.outerHeight(true);
loadedWidth = $loaded.outerWidth(true);
// Setting padding to remove the need to do size conversions during the animation step.
$box.css({"padding-bottom": interfaceHeight, "padding-right": interfaceWidth});
// Anonymous functions here keep the public method from being cached, thereby allowing them to be redefined on the fly.
$next.click(function () {
publicMethod.next();
});
$prev.click(function () {
publicMethod.prev();
});
$close.click(function () {
publicMethod.close();
});
$overlay.click(function () {
if (settings.overlayClose) {
publicMethod.close();
}
});
// Key Bindings
$(document).bind('keydown.' + prefix, function (e) {
var key = e.keyCode;
if (open && settings.escKey && key === 27) {
e.preventDefault();
publicMethod.close();
}
if (open && settings.arrowKey && $related[1]) {
if (key === 37) {
e.preventDefault();
$prev.click();
} else if (key === 39) {
e.preventDefault();
$next.click();
}
}
});
$('.' + boxElement, document).live('click', function (e) {
// ignore non-left-mouse-clicks and clicks modified with ctrl / command, shift, or alt.
// See: http://jacklmoore.com/notes/click-events/
if (!(e.which > 1 || e.shiftKey || e.altKey || e.metaKey)) {
e.preventDefault();
launch(this);
}
});
}
return true;
}
return false;
}
// Don't do anything if ColorBox already exists.
if ($.colorbox) {
return;
}
// Append the HTML when the DOM loads
$(appendHTML);
// ****************
// PUBLIC FUNCTIONS
// Usage format: $.fn.colorbox.close();
// Usage from within an iframe: parent.$.fn.colorbox.close();
// ****************
publicMethod = $.fn[colorbox] = $[colorbox] = function (options, callback) {
var $this = this;
options = options || {};
appendHTML();
if (addBindings()) {
if (!$this[0]) {
if ($this.selector) { // if a selector was given and it didn't match any elements, go ahead and exit.
return $this;
}
// if no selector was given (ie. $.colorbox()), create a temporary element to work with
$this = $('<a/>');
options.open = true; // assume an immediate open
}
if (callback) {
options.onComplete = callback;
}
$this.each(function () {
$.data(this, colorbox, $.extend({}, $.data(this, colorbox) || defaults, options));
}).addClass(boxElement);
if (($.isFunction(options.open) && options.open.call($this)) || options.open) {
launch($this[0]);
}
}
return $this;
};
publicMethod.position = function (speed, loadedCallback) {
var
top = 0,
left = 0,
offset = $box.offset(),
scrollTop = $window.scrollTop(),
scrollLeft = $window.scrollLeft();
$window.unbind('resize.' + prefix);
// remove the modal so that it doesn't influence the document width/height
$box.css({top: -9e4, left: -9e4});
if (settings.fixed && !isIE6) {
offset.top -= scrollTop;
offset.left -= scrollLeft;
$box.css({position: 'fixed'});
} else {
top = scrollTop;
left = scrollLeft;
$box.css({position: 'absolute'});
}
// keeps the top and left positions within the browser's viewport.
if (settings.right !== false) {
left += Math.max($window.width() - settings.w - loadedWidth - interfaceWidth - setSize(settings.right, 'x'), 0);
} else if (settings.left !== false) {
left += setSize(settings.left, 'x');
} else {
left += Math.round(Math.max($window.width() - settings.w - loadedWidth - interfaceWidth, 0) / 2);
}
if (settings.bottom !== false) {
top += Math.max($window.height() - settings.h - loadedHeight - interfaceHeight - setSize(settings.bottom, 'y'), 0);
} else if (settings.top !== false) {
top += setSize(settings.top, 'y');
} else {
top += Math.round(Math.max($window.height() - settings.h - loadedHeight - interfaceHeight, 0) / 2);
}
$box.css({top: offset.top, left: offset.left});
// setting the speed to 0 to reduce the delay between same-sized content.
speed = ($box.width() === settings.w + loadedWidth && $box.height() === settings.h + loadedHeight) ? 0 : speed || 0;
// this gives the wrapper plenty of breathing room so it's floated contents can move around smoothly,
// but it has to be shrank down around the size of div#colorbox when it's done. If not,
// it can invoke an obscure IE bug when using iframes.
$wrap[0].style.width = $wrap[0].style.height = "9999px";
function modalDimensions(that) {
$topBorder[0].style.width = $bottomBorder[0].style.width = $content[0].style.width = that.style.width;
$content[0].style.height = $leftBorder[0].style.height = $rightBorder[0].style.height = that.style.height;
}
$box.dequeue().animate({width: settings.w + loadedWidth, height: settings.h + loadedHeight, top: top, left: left}, {
duration: speed,
complete: function () {
modalDimensions(this);
active = false;
// shrink the wrapper down to exactly the size of colorbox to avoid a bug in IE's iframe implementation.
$wrap[0].style.width = (settings.w + loadedWidth + interfaceWidth) + "px";
$wrap[0].style.height = (settings.h + loadedHeight + interfaceHeight) + "px";
if (settings.reposition) {
setTimeout(function () { // small delay before binding onresize due to an IE8 bug.
$window.bind('resize.' + prefix, publicMethod.position);
}, 1);
}
if (loadedCallback) {
loadedCallback();
}
},
step: function () {
modalDimensions(this);
}
});
};
publicMethod.resize = function (options) {
if (open) {
options = options || {};
if (options.width) {
settings.w = setSize(options.width, 'x') - loadedWidth - interfaceWidth;
}
if (options.innerWidth) {
settings.w = setSize(options.innerWidth, 'x');
}
$loaded.css({width: settings.w});
if (options.height) {
settings.h = setSize(options.height, 'y') - loadedHeight - interfaceHeight;
}
if (options.innerHeight) {
settings.h = setSize(options.innerHeight, 'y');
}
if (!options.innerHeight && !options.height) {
$loaded.css({height: "auto"});
settings.h = $loaded.height();
}
$loaded.css({height: settings.h});
publicMethod.position(settings.transition === "none" ? 0 : settings.speed);
}
};
publicMethod.prep = function (object) {
if (!open) {
return;
}
var callback, speed = settings.transition === "none" ? 0 : settings.speed;
$loaded.remove();
$loaded = $tag(div, 'LoadedContent').append(object);
function getWidth() {
settings.w = settings.w || $loaded.width();
settings.w = settings.mw && settings.mw < settings.w ? settings.mw : settings.w;
return settings.w;
}
function getHeight() {
settings.h = settings.h || $loaded.height();
settings.h = settings.mh && settings.mh < settings.h ? settings.mh : settings.h;
return settings.h;
}
$loaded.hide()
.appendTo($loadingBay.show())// content has to be appended to the DOM for accurate size calculations.
.css({width: getWidth(), overflow: settings.scrolling ? 'auto' : 'hidden'})
.css({height: getHeight()})// sets the height independently from the width in case the new width influences the value of height.
.prependTo($content);
$loadingBay.hide();
// floating the IMG removes the bottom line-height and fixed a problem where IE miscalculates the width of the parent element as 100% of the document width.
//$(photo).css({'float': 'none', marginLeft: 'auto', marginRight: 'auto'});
$(photo).css({'float': 'none'});
// Hides SELECT elements in IE6 because they would otherwise sit on top of the overlay.
if (isIE6) {
$('select').not($box.find('select')).filter(function () {
return this.style.visibility !== 'hidden';
}).css({'visibility': 'hidden'}).one(event_cleanup, function () {
this.style.visibility = 'inherit';
});
}
callback = function () {
var preload, i, total = $related.length, iframe, frameBorder = 'frameBorder', allowTransparency = 'allowTransparency', complete, src, img;
if (!open) {
return;
}
function removeFilter() {
if (isIE) {
$box[0].style.removeAttribute('filter');
}
}
complete = function () {
clearTimeout(loadingTimer);
$loadingOverlay.hide();
trigger(event_complete, settings.onComplete);
};
if (isIE) {
//This fadeIn helps the bicubic resampling to kick-in.
if (photo) {
$loaded.fadeIn(100);
}
}
$title.html(settings.title).add($loaded).show();
if (total > 1) { // handle grouping
if (typeof settings.current === "string") {
$current.html(settings.current.replace('{current}', index + 1).replace('{total}', total)).show();
}
$next[(settings.loop || index < total - 1) ? "show" : "hide"]().html(settings.next);
$prev[(settings.loop || index) ? "show" : "hide"]().html(settings.previous);
if (settings.slideshow) {
$slideshow.show();
}
// Preloads images within a rel group
if (settings.preloading) {
preload = [
getIndex(-1),
getIndex(1)
];
while (i = $related[preload.pop()]) {
src = $.data(i, colorbox).href || i.href;
if ($.isFunction(src)) {
src = src.call(i);
}
if (isImage(src)) {
img = new Image();
img.src = src;
}
}
}
} else {
$groupControls.hide();
}
if (settings.iframe) {
iframe = $tag('iframe')[0];
if (frameBorder in iframe) {
iframe[frameBorder] = 0;
}
if (allowTransparency in iframe) {
iframe[allowTransparency] = "true";
}
// give the iframe a unique name to prevent caching
iframe.name = prefix + (+new Date());
if (settings.fastIframe) {
complete();
} else {
$(iframe).one('load', complete);
}
iframe.src = settings.href;
if (!settings.scrolling) {
iframe.scrolling = "no";
}
$(iframe).addClass(prefix + 'Iframe').appendTo($loaded).one(event_purge, function () {
iframe.src = "//about:blank";
});
} else {
complete();
}
if (settings.transition === 'fade') {
$box.fadeTo(speed, 1, removeFilter);
} else {
removeFilter();
}
};
if (settings.transition === 'fade') {
$box.fadeTo(speed, 0, function () {
publicMethod.position(0, callback);
});
} else {
publicMethod.position(speed, callback);
}
};
publicMethod.load = function (launched) {
var href, setResize, prep = publicMethod.prep;
active = true;
photo = false;
element = $related[index];
if (!launched) {
makeSettings();
}
trigger(event_purge);
trigger(event_load, settings.onLoad);
settings.h = settings.height ?
setSize(settings.height, 'y') - loadedHeight - interfaceHeight :
settings.innerHeight && setSize(settings.innerHeight, 'y');
settings.w = settings.width ?
setSize(settings.width, 'x') - loadedWidth - interfaceWidth :
settings.innerWidth && setSize(settings.innerWidth, 'x');
// Sets the minimum dimensions for use in image scaling
settings.mw = settings.w;
settings.mh = settings.h;
// Re-evaluate the minimum width and height based on maxWidth and maxHeight values.
// If the width or height exceed the maxWidth or maxHeight, use the maximum values instead.
if (settings.maxWidth) {
settings.mw = setSize(settings.maxWidth, 'x') - loadedWidth - interfaceWidth;
settings.mw = settings.w && settings.w < settings.mw ? settings.w : settings.mw;
}
if (settings.maxHeight) {
settings.mh = setSize(settings.maxHeight, 'y') - loadedHeight - interfaceHeight;
settings.mh = settings.h && settings.h < settings.mh ? settings.h : settings.mh;
}
href = settings.href;
loadingTimer = setTimeout(function () {
$loadingOverlay.show();
}, 100);
if (settings.inline) {
// Inserts an empty placeholder where inline content is being pulled from.
// An event is bound to put inline content back when ColorBox closes or loads new content.
$tag(div).hide().insertBefore($(href)[0]).one(event_purge, function () {
$(this).replaceWith($loaded.children());
});
prep($(href));
} else if (settings.iframe) {
// IFrame element won't be added to the DOM until it is ready to be displayed,
// to avoid problems with DOM-ready JS that might be trying to run in that iframe.
prep(" ");
} else if (settings.html) {
prep(settings.html);
} else if (isImage(href)) {
$(photo = new Image())
.addClass(prefix + 'Photo')
.error(function () {
settings.title = false;
prep($tag(div, 'Error').text('This image could not be loaded'));
})
.load(function () {
var percent;
photo.onload = null; //stops animated gifs from firing the onload repeatedly.
if (settings.scalePhotos) {
setResize = function () {
photo.height -= photo.height * percent;
photo.width -= photo.width * percent;
};
if (settings.mw && photo.width > settings.mw) {
percent = (photo.width - settings.mw) / photo.width;
setResize();
}
if (settings.mh && photo.height > settings.mh) {
percent = (photo.height - settings.mh) / photo.height;
setResize();
}
}
if (settings.h) {
photo.style.marginTop = Math.max(settings.h - photo.height, 0) / 2 + 'px';
}
if ($related[1] && (settings.loop || $related[index + 1])) {
photo.style.cursor = 'pointer';
photo.onclick = function () {
publicMethod.next();
};
}
if (isIE) {
photo.style.msInterpolationMode = 'bicubic';
}
setTimeout(function () { // A pause because Chrome will sometimes report a 0 by 0 size otherwise.
prep(photo);
}, 1);
});
setTimeout(function () { // A pause because Opera 10.6+ will sometimes not run the onload function otherwise.
photo.src = href;
}, 1);
} else if (href) {
$loadingBay.load(href, settings.data, function (data, status, xhr) {
prep(status === 'error' ? $tag(div, 'Error').text('Request unsuccessful: ' + xhr.statusText) : $(this).contents());
});
}
};
// Navigates to the next page/image in a set.
publicMethod.next = function () {
if (!active && $related[1] && (settings.loop || $related[index + 1])) {
index = getIndex(1);
publicMethod.load();
}
};
publicMethod.prev = function () {
if (!active && $related[1] && (settings.loop || index)) {
index = getIndex(-1);
publicMethod.load();
}
};
// Note: to use this within an iframe use the following format: parent.$.fn.colorbox.close();
publicMethod.close = function () {
if (open && !closing) {
closing = true;
open = false;
trigger(event_cleanup, settings.onCleanup);
$window.unbind('.' + prefix + ' .' + event_ie6);
$overlay.fadeTo(200, 0);
$box.stop().fadeTo(300, 0, function () {
$box.add($overlay).css({'opacity': 1, cursor: 'auto'}).hide();
trigger(event_purge);
$loaded.remove();
setTimeout(function () {
closing = false;
trigger(event_closed, settings.onClosed);
}, 1);
});
}
};
// Removes changes ColorBox made to the document, but does not remove the plugin
// from jQuery.
publicMethod.remove = function () {
$([]).add($box).add($overlay).remove();
$box = null;
$('.' + boxElement)
.removeData(colorbox)
.removeClass(boxElement)
.die();
};
// A method for fetching the current element ColorBox is referencing.
// returns a jQuery object.
publicMethod.element = function () {
return $(element);
};
publicMethod.settings = defaults;
}(jQuery, document, this));



/*-----------------------------------------------------------------------------------*/
/* Slides, A Slideshow Plugin for jQuery By: Nathan Searles
/*-----------------------------------------------------------------------------------*/ 



(function(a){a.fn.slides=function(b){return b=a.extend({},a.fn.slides.option,b),this.each(function(){function w(g,h,i){if(!p&&o){p=!0,b.animationStart(n+1);switch(g){case"next":l=n,k=n+1,k=e===k?0:k,r=f*2,g=-f*2,n=k;break;case"prev":l=n,k=n-1,k=k===-1?e-1:k,r=0,g=0,n=k;break;case"pagination":k=parseInt(i,10),l=a("."+b.paginationClass+" li."+b.currentClass+" a",c).attr("href").match("[^#/]+$"),k>l?(r=f*2,g=-f*2):(r=0,g=0),n=k}h==="fade"?b.crossfade?d.children(":eq("+k+")",c).css({zIndex:10}).fadeIn(b.fadeSpeed,b.fadeEasing,function(){b.autoHeight?d.animate({height:d.children(":eq("+k+")",c).outerHeight()},b.autoHeightSpeed,function(){d.children(":eq("+l+")",c).css({display:"none",zIndex:0}),d.children(":eq("+k+")",c).css({zIndex:0}),b.animationComplete(k+1),p=!1}):(d.children(":eq("+l+")",c).css({display:"none",zIndex:0}),d.children(":eq("+k+")",c).css({zIndex:0}),b.animationComplete(k+1),p=!1)}):d.children(":eq("+l+")",c).fadeOut(b.fadeSpeed,b.fadeEasing,function(){b.autoHeight?d.animate({height:d.children(":eq("+k+")",c).outerHeight()},b.autoHeightSpeed,function(){d.children(":eq("+k+")",c).fadeIn(b.fadeSpeed,b.fadeEasing)}):d.children(":eq("+k+")",c).fadeIn(b.fadeSpeed,b.fadeEasing,function(){a.browser.msie&&a(this).get(0).style.removeAttribute("filter")}),b.animationComplete(k+1),p=!1}):(d.children(":eq("+k+")").css({left:r,display:"block"}),b.autoHeight?d.animate({left:g,height:d.children(":eq("+k+")").outerHeight()},b.slideSpeed,b.slideEasing,function(){d.css({left:-f}),d.children(":eq("+k+")").css({left:f,zIndex:5}),d.children(":eq("+l+")").css({left:f,display:"none",zIndex:0}),b.animationComplete(k+1),p=!1}):d.animate({left:g},b.slideSpeed,b.slideEasing,function(){d.css({left:-f}),d.children(":eq("+k+")").css({left:f,zIndex:5}),d.children(":eq("+l+")").css({left:f,display:"none",zIndex:0}),b.animationComplete(k+1),p=!1})),b.pagination&&(a("."+b.paginationClass+" li."+b.currentClass,c).removeClass(b.currentClass),a("."+b.paginationClass+" li:eq("+k+")",c).addClass(b.currentClass))}}function x(){clearInterval(c.data("interval"))}function y(){b.pause?(clearTimeout(c.data("pause")),clearInterval(c.data("interval")),u=setTimeout(function(){clearTimeout(c.data("pause")),v=setInterval(function(){w("next",i)},b.play),c.data("interval",v)},b.pause),c.data("pause",u)):x()}a("."+b.container,a(this)).children().wrapAll('<div class="slides_control"/>');var c=a(this),d=a(".slides_control",c),e=d.children().size(),f=d.children().outerWidth(),g=d.children().outerHeight(),h=b.start-1,i=b.effect.indexOf(",")<0?b.effect:b.effect.replace(" ","").split(",")[0],j=b.effect.indexOf(",")<0?i:b.effect.replace(" ","").split(",")[1],k=0,l=0,m=0,n=0,o,p,q,r,s,t,u,v;if(e<2)return a("."+b.container,a(this)).fadeIn(b.fadeSpeed,b.fadeEasing,function(){o=!0,b.slidesLoaded()}),a("."+b.next+", ."+b.prev).fadeOut(0),!1;if(e<2)return;h<0&&(h=0),h>e&&(h=e-1),b.start&&(n=h),b.randomize&&d.randomize(),a("."+b.container,c).css({overflow:"hidden",position:"relative"}),d.children().css({position:"absolute",top:0,left:d.children().outerWidth(),zIndex:0,display:"none"}),d.css({position:"relative",width:f*3,height:g,left:-f}),a("."+b.container,c).css({display:"block"}),b.autoHeight&&(d.children().css({height:"auto"}),d.animate({height:d.children(":eq("+h+")").outerHeight()},b.autoHeightSpeed));if(b.preload&&d.find("img:eq("+h+")").length){a("."+b.container,c).css({background:"url("+b.preloadImage+") no-repeat 50% 50%"});var z=d.find("img:eq("+h+")").attr("src")+"?"+(new Date).getTime();a("img",c).parent().attr("class")!="slides_control"?t=d.children(":eq(0)")[0].tagName.toLowerCase():t=d.find("img:eq("+h+")"),d.find("img:eq("+h+")").attr("src",z).load(function(){d.find(t+":eq("+h+")").fadeIn(b.fadeSpeed,b.fadeEasing,function(){a(this).css({zIndex:5}),a("."+b.container,c).css({background:""}),o=!0,b.slidesLoaded()})})}else d.children(":eq("+h+")").fadeIn(b.fadeSpeed,b.fadeEasing,function(){o=!0,b.slidesLoaded()});b.bigTarget&&(d.children().css({cursor:"pointer"}),d.children().click(function(){return w("next",i),!1})),b.hoverPause&&b.play&&(d.bind("mouseover",function(){x()}),d.bind("mouseleave",function(){y()})),b.generateNextPrev&&(a("."+b.container,c).after('<a href="#" class="'+b.prev+'">Prev</a>'),a("."+b.prev,c).after('<a href="#" class="'+b.next+'">Next</a>')),a("."+b.next,c).click(function(a){a.preventDefault(),b.play&&y(),w("next",i)}),a("."+b.prev,c).click(function(a){a.preventDefault(),b.play&&y(),w("prev",i)}),b.generatePagination?(b.prependPagination?c.prepend("<ul class="+b.paginationClass+"></ul>"):c.append("<ul class="+b.paginationClass+"></ul>"),d.children().each(function(){a("."+b.paginationClass,c).append('<li><a href="#'+m+'">'+(m+1)+"</a></li>"),m++})):a("."+b.paginationClass+" li a",c).each(function(){a(this).attr("href","#"+m),m++}),a("."+b.paginationClass+" li:eq("+h+")",c).addClass(b.currentClass),a("."+b.paginationClass+" li a",c).click(function(){return b.play&&y(),q=a(this).attr("href").match("[^#/]+$"),n!=q&&w("pagination",j,q),!1}),a("a.link",c).click(function(){return b.play&&y(),q=a(this).attr("href").match("[^#/]+$")-1,n!=q&&w("pagination",j,q),!1}),b.play&&(v=setInterval(function(){w("next",i)},b.play),c.data("interval",v))})},a.fn.slides.option={preload:!1,preloadImage:"/img/loading.gif",container:"slides_container",generateNextPrev:!1,next:"next",prev:"prev",pagination:!0,generatePagination:!0,prependPagination:!1,paginationClass:"pagination",currentClass:"current",fadeSpeed:350,fadeEasing:"",slideSpeed:350,slideEasing:"",start:1,effect:"slide",crossfade:!1,randomize:!1,play:0,pause:0,hoverPause:!1,autoHeight:!1,autoHeightSpeed:350,bigTarget:!1,animationStart:function(){},animationComplete:function(){},slidesLoaded:function(){}},a.fn.randomize=function(b){function c(){return Math.round(Math.random())-.5}return a(this).each(function(){var d=a(this),e=d.children(),f=e.length;if(f>1){e.hide();var g=[];for(i=0;i<f;i++)g[g.length]=i;g=g.sort(c),a.each(g,function(a,c){var f=e.eq(c),g=f.clone(!0);g.show().appendTo(d),b!==undefined&&b(f,g),f.remove()})}})}})(jQuery)