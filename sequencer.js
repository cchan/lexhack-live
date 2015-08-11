(function(sequencer, $, undefined){
	$(".slider").css({transition: "left 0.7s, top 0.7s, right 0.7s, bottom 0.7s, opacity 0.7s"});
	
	var time = 0;
	sequencer.css = function(sel, msDelay, cssStyle, callback){
		msDelay = msDelay || 0;
		cssStyle = cssStyle || {};
		callback = callback || function(){};
		
		time += msDelay;
		setTimeout(function(){
			$(sel).css(cssStyle);
			callback();
		},time);
	};
	sequencer.slidein = function(sel, msDelay, callback){
		sequencer.css(sel, msDelay, {top:0,left:0,right:0,bottom:0,opacity:1}, callback);
	};
	sequencer.fadeout = function(sel, msDelay, callback){
		sequencer.css(sel, msDelay, {opacity:0}, callback)
	};
})(window.sequencer = window.sequencer || {}, jQuery);
