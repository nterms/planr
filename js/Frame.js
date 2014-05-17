/*!
 * Frame.js
 *
 * planr - HTML5 + JavaScript based mind and process planning software.
 * 
 * Copyright (c) 2014 Saranga Abeykoon (http://blog.nterms.com)
 *
 * Licensed under the MIT License (LICENSE.md).
 * 
 */
 
if(typeof planr == 'undefined') { planr = {}; }

(function($) {
	planr.Frame = function(container) {
		this.container 	= null;
		this.canvas 	= null;
		this.fs 		= null;
		this.height 	= 600;
		this.width 		= 800;
		this.storage 	= null;
		this.autoResize	= false;
		
		this.init(container);
	};
	
	/**
	 * Initialize the frame
	 */
	planr.Frame.prototype.init = function(container) {
		var frame 		= this;
		this.container 	= $("#" + container);
		this.height 	= this.container.height();
		this.width 		= this.container.width();
		// create frame element
		this.element = $('<div>').addClass('planr-frame').css({width: this.width, height: this.height});
		this.container.addClass('planr').html(this.element);
		
		// full screen button
		this.fs = $('<div>').addClass('planr-fullscreen').css({position: 'absolute', bottom: 20, right: 20});
		this.element.append(this.fs);
		
		this.fs.click(function(evt) {
			if(screenfull.enabled) {
				screenfull.toggle(frame.element.get(0));
				if(screenfull.isFullscreen) {
					frame.element.css({width: $(window).width(), height: $(window).height()});
				} else {
					frame.element.css({width: frame.width, height: frame.height});
				}
				$(this).toggleClass('active');
			}
		});
		
		// storage
		this.storage = new planr.Storage();
	};
	
	/**
	 * Returns the HTML element of the frame
	 *
	 * @returns {jQuery} The HTML (jQuery enabled) element of the frame
	 */
	planr.Frame.prototype.getElement = function() {
		return this.element;
	};
	
	/**
	 * Set the canvas of the frame
	 *
	 * @param {planr.Canvas} The Canvas object
	 */
	planr.Frame.prototype.setCanvas = function(canvas) {
		this.canvas = canvas;
		this.canvas.frame = this;
		this.element.find('.planr-canvas').remove();
		this.element.prepend(this.canvas.getElement());
	};
	
	/**
	 * Adds a widget to the frame
	 * - widget could be one of - ColorPicker, ZoomController
	 *
	 * @param {Object} A widget object
	 */
	planr.Frame.prototype.addWidget = function(widget, position) {
		widget.setFrame(this);
	};
	
	/**
	 * Enable dragscroll inside the frame
	 * 
	 * @returns {Boolean} true if jquery.dragscroll plugin is available and dragsrolling enabled, false otherwise
	 */
	planr.Frame.prototype.enableDragscroll = function() {
		if(jQuery().dragscroll) {
			this.element.dragscroll({
				scrollBars: false,
				autoFadeBars: true,
				smoothness: 15
			});
			
			// fix the fullscreen button
			this.element.find('.planr-fullscreen').appendTo(this.element);
			
			// center the canvas
			var left = (planr.CANVAS_WIDTH - this.width) / 2;
			var top = (planr.CANVAS_HEIGHT - this.height) / 2;
			this.element.find('.dragscroll-scroller').scrollLeft(left).scrollTop(top);
			
			return true;
		}
		
		return false;
	};
	
}(jQuery));
