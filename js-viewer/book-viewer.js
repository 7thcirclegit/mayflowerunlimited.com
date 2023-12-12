jQuery(document).ready(function($) {
	// inside this function $ = jQuery
	
	// load the stylesheet for book viewer
	var stylesheet_url = 'js-viewer/book-viewer-styles.css';
	if (document.createStyleSheet) {
	    document.createStyleSheet(stylesheet_url);
	}
	else {
		$('head').append('<link rel="StyleSheet" href="'+stylesheet_url+'" type="text/css" />');
	}
	
	
	// change book viewer vertial alignment on window resize
	$(window).bind('resize', function(event) {
		centerLightBox();
	});
	
	var current_page = 0;
	var block_clicks = false;
	var timeout = null;
	
	// set view_book_link_id if it is not already set
	if (open_viewer_link_id == undefined) {
		var open_viewer_link_id = "view-book-link";
	}
	
	var links = $('#' + open_viewer_link_id);
	if (links.size() < 1) {
		links = $('.' + open_viewer_link_id);
	}
	// open the javascript book viewer when open_viewer_link_id is clicked
	$(links).bind('click', function(event) {
		openBookViewer();
		return false;
	});
	
	
	// create dom elements and fade in the book viewer
	function openBookViewer() {
		block_clicks = true;
		
		$('body').append('<div id="curtain" />');
		$('body').append('<div id="lightbox-wrapper" />');
		
		$('#lightbox-wrapper').append('<div id="lightbox" />');
		centerLightBox();
		$('#lightbox').append('<div id="lightbox-view" />');
		$('#lightbox').append('<a id="lightbox-next" class="book-nav" href="#next" title="View Next Page">NEXT PAGE</a>');
		$('#lightbox').append('<a id="lightbox-prev" class="book-nav" href="#prev" title="View Previous Page">PREV PAGE</a>');
		$('#lightbox').append('<a id="lightbox-close" href="#close" title="Close">CLOSE</a>');
		
		var page  = viewer_pages[current_page];
		var preload = new Image;
		preload.onload = function() {
			showNewImage(this, 1);
		}
		preload.src = page;
		
		$('#lightbox-view').bind('click', function(event) {
			event.stopPropagation();
			navigatePage(1);
			return false;
		});
		
		$('#lightbox-next').bind('click', function(event) {
			event.stopPropagation();
			navigatePage(1);
			return false;
		});
		
		$('#lightbox-prev').bind('click', function(event) {
			event.stopPropagation()
			navigatePage(-1);
			return false;
		});
		
		
		
		$('#lightbox-wrapper').bind('click', function(event) {
			event.stopPropagation();
			closeBookViewer();
			return false;
		});
		
		$('#lightbox-close').bind('click', function(event) {
			event.stopPropagation();
			closeBookViewer();
			return false;
		});
		
		
		
		$('#lightbox-close').bind('mouseenter', function(event) {
			$(this).addClass('do-not-fade');
			return false;
		});
		$('#lightbox-close').bind('mouseleave', function(event) {
			$(this).removeClass('do-not-fade');
			return false;
		});
		$(document).bind('mousemove', function(event) {
			var close_button = jQuery('#lightbox-close');
			
			if (close_button.is(':hidden')) {
				close_button.css('zIndex', 10800);
				close_button.fadeIn(50);
			}
			else {
				hideCloseButtonTimer(close_button);
			}
		});
		
		return false;
		
	}
	
	// close the lightbox
	function closeBookViewer() {
		if (block_clicks) {
			return false;
		}
		block_clicks = true;
		
		unbindNavigationControls();
		
		$('#curtain').fadeOut(1000, function() {
			block_clicks = false;
			$(this).remove();
		});
		
		if ($.browser.msie) {
			$('#lightbox-wrapper').remove();
		}
		else {
			$('#lightbox-wrapper').fadeOut(700, function() {
				$(this).remove();
			});			
		}
	}
	
	// navigate through the 
	function navigatePage(direction) {
		if (block_clicks) {
			return false;
		}
		block_clicks = true;
		
		current_page += direction;
		if (viewer_pages[current_page] == undefined) {
			if (direction > 0) {
				current_page = 0;
			}
			else {
				current_page = viewer_pages.length - 1;
			}
		}
		
		var enter_pos = direction * 620;
		var exit_pos  = direction * -1 * 620;
		
		$('#lightbox-view img').animate({left:exit_pos}, 400, function() {
			$('#lightbox-view img').remove();
			
			var page  = viewer_pages[current_page];
			var preload = new Image;
			preload.onload = function() {
				showNewImage(this, direction);
			}
			preload.src = page;
		});
	}
	

	
	
	

	
	
	
	// vertically center the lightbox
	function centerLightBox() {
		var window_height   = $(window).height();
		var lightbox_height = $('#lightbox').outerHeight();
		var top_position    = (window_height - lightbox_height) / 2;
		
		$('#lightbox').css('marginTop', top_position + 'px');
	}
	
	// resize and slide in the new image
	function showNewImage(image, direction) {
		var h = image.height;
		var h2 = h + 8;
		var w = image.width + 134;
		var d = direction * (image.width + 5);
		var t = (h / 2) - 150;
		
		var top_position    = ($(window).height() - h) / 2;
		
		$('#lightbox-close').hide();
		
		$('#lightbox-view').append('<img src="'+image.src+'" alt="" />');
		
		$('#lightbox').animate({height:h2, width:w, marginTop:top_position}, 800, function() {});
		$('#lightbox-view').animate({width:image.width, height:h}, 800, function() {});
		$('#lightbox .book-nav').animate({top:t}, 800, function() {});
		
		$('#lightbox-view img').css({height:image.height, width:image.width, left:d}).animate({left:0}, 800, function() {
			bindNavigationControls();
			$('#lightbox-close').show();
			block_clicks = false;
		});
	}
	
	// hide the close button if mouse hasn't moved in two seconds
	function hideCloseButtonTimer(obj) {
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			if (obj.hasClass('catablog-lightbox-close-hover')) {
				hideCloseButtonTimer(obj);
			}
			else {
				obj.fadeOut(400);							
			}
		}, 2000);
	}
	
	// bind keyboard shortcuts
	function bindNavigationControls() {
		$(document).bind('keyup', function(event) {
			var key_code = (event.keyCode ? event.keyCode : event.which);
		
			var forward_keycodes = [39, 78];
			var back_keycodes    = [37, 80];
			var escape_keycodes  = [27];
		
			if (in_array(key_code, forward_keycodes)) {
				$('#lightbox-next').click();
			}
			if (in_array(key_code, back_keycodes)) {
				$('#lightbox-prev').click();
			}
			if (in_array(key_code, escape_keycodes)) {
				$('#lightbox-close').click();
			}
		});
	}
	
	// remove all events bound to the document by lightbox
	function unbindNavigationControls() {
		jQuery(document).unbind('mousemove');
		jQuery(document).unbind('keyup');
	}
	
	
	function in_array (needle, haystack, argStrict) {
	    var key = '', strict = !!argStrict;

	    if (strict) {
	        for (key in haystack) {
	            if (haystack[key] === needle) {
	                return true;
	            }
	        }
	    } else {
	        for (key in haystack) {
	            if (haystack[key] == needle) {
	                return true;
	            }
	        }
	    }

	    return false;
	}
	
	
});