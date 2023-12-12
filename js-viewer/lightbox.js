jQuery(function($) {
	jQuery.fn.lightbox = function(config) {
		
		// PlugIn Variables
		var timeout = null;
		var hold_click = false;
		var offset = null;
		var width  = null;
		var height = null;
		
		// PlugIn Construction applied across each selected jQuery object
		this.each(function(i) {
			jQuery(this).bind('click', function(event) {
				open(this);
				return false;
			});
		});
		
		// Open the lightbox
		function open(link) {
			
			// do not run this method if either open or close are still in progress
			if (hold_click) {
				return false;
			}
			hold_click = true;
			
			var thumbnail = $(link).children('img');
			
			// set some standard variables for the object
			var fullsize_image = link.href;
			offset = $(thumbnail).offset();
			width  = $(thumbnail).width();
			height = $(thumbnail).height();
			
			// create the curtain
			$('body').append('<div id="lightbox-curtain" />');
			$('#lightbox-curtain').fadeTo(200, 0.6).bind('click', function(event) {
				close();
			});
			
			// create the lightbox viewer div element
			$('body').append('<div id="lightbox-viewer" />');
			var lightbox = $('#lightbox-viewer');
			lightbox.bind('click', function(event) {
				close();
			});
			
			// create the lightbox close button
			$('#lightbox-viewer').append('<a id="lightbox-close" href="#close" title="Close" style="display:none;">CLOSE</a>');
			var close_button = $('#lightbox-viewer a');
			close_button.css({right:-24, top:-22});
			close_button.bind('click', function(event) {
				close();
			});
			
			// set the lightbox viewer over the thumbnail element
			lightbox.css('left', offset.left + 'px');
			lightbox.css('top', offset.top + 'px');
			lightbox.width(width);
			lightbox.height(height);
			
			// load the larger image
			var image = new Image();
			image.onload = function() {
				
				// when done loading the larger image
				
				// create the <img /> tag in the lightbox viewer div
				lightbox.append('<img src="'+this.src+'" alt="" title="click to close" />')
				fullsize_image = $('#lightbox-viewer img');
				
				// get the browser's window size and scroll position
				var window_width  = $(window).width();
				var window_height = $(window).height();
				var scroll_offset = $(window).scrollTop();
				
				var fullsize_width  = this.width;
				var fullsize_height = this.height;
				
				// set all the animation parameters for enlarging the lightbox viewer
				var params = {};
				params.left    = (window_width - fullsize_width) / 2;
				params.top     = ((window_height - fullsize_height) / 2) + scroll_offset;
				params.width   = this.width;
				params.height  = this.height;
				
				// show the fullsize image and enlarge the lightbox viewer
				fullsize_image.show();
				lightbox.animate(params, 300, function() {
					
					// allow either open or close method to run now
					hold_click = false;
					
					// show the close button
					close_button.fadeIn(300);
					
					$(window).bind('resize', function(event) {
						var box = $('#lightbox-viewer');
						var win = $(window);
						var left = (win.width() - fullsize_width) / 2;
						var top  = ((win.height() - fullsize_height) / 2) + win.scrollTop();
						box.css('left', left + 'px');
						box.css('top', top + 'px');
					});
					
				});
			}
			image.src = fullsize_image;
		}
		
		// close the lightbox
		function close() {
			
			// do not run this method if either open or close are still in progress
			if (hold_click) {
				return false;
			}
			hold_click = true;
			
			// set all the animation parameters to shrink the lightbox viewer
			var params = {};
			params.left   = offset.left;
			params.top    = offset.top;
			params.width  = width;
			params.height = height;
			params.opacity = 0;
			
			// hide the close button
			$('#lightbox-viewer a').hide();
			
			// fade out the curtain and then remove it from the document
			$('#lightbox-curtain').fadeOut(500, function() {
				$(this).remove();
			});
			
			// shrink the lightbox viewer and then remove it
			$('#lightbox-viewer').animate(params, 600, function() {
				$(this).remove();
				hold_click = false;
			});
		}
	};
});


// load stylesheet and setup the lightbox viewers when document is done loading
jQuery(document).ready(function($) {
	var stylesheet_url = 'js-viewer/book-viewer-styles.css';
	if (document.createStyleSheet) {
	    document.createStyleSheet(stylesheet_url);
	}
	else {
		$('head').append('<link rel="StyleSheet" href="'+stylesheet_url+'" type="text/css" />');
	}
	
	$('a.lightbox').lightbox();
});