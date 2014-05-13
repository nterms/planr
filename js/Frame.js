/*!
 * Frame.js
 *
 * KM NODE - Node Style Data Visualizing Platform
 * 
 * Copyright 2013, Kraken Media Pte. Ltd, http://www.kraken-media.com
 * Author: Saranga Abeykoon <saranga.abeykoon@kraken-media.com>
 *
 */
 
if(typeof kmnode == 'undefined') { kmnode = {}; }

(function($) {
	kmnode.Frame = function(container) {
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
	kmnode.Frame.prototype.init = function(container) {
		var frame 		= this;
		this.container 	= $("#" + container);
		this.height 	= this.container.height();
		this.width 		= this.container.width();
		// create frame element
		this.element = $('<div>').addClass('kmn-frame').css({width: this.width, height: this.height});
		this.container.addClass('kmnode').html(this.element);
		
		// full screen button
		this.fs = $('<div>').addClass('kmn-fullscreen').css({position: 'absolute', bottom: 20, right: 20});
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
		this.storage = new kmnode.Storage();
	};
	
	/**
	 * Returns the HTML element of the frame
	 *
	 * @returns {jQuery} The HTML (jQuery enabled) element of the frame
	 */
	kmnode.Frame.prototype.getElement = function() {
		return this.element;
	};
	
	/**
	 * Set the canvas of the frame
	 *
	 * @param {kmnode.Canvas} The Canvas object
	 */
	kmnode.Frame.prototype.setCanvas = function(canvas) {
		this.canvas = canvas;
		this.canvas.frame = this;
		this.element.find('.kmn-canvas').remove();
		this.element.prepend(this.canvas.getElement());
	};
	
	/**
	 * Adds a widget to the frame
	 * - widget could be one of - ColorPicker, ZoomController
	 *
	 * @param {Object} A widget object
	 */
	kmnode.Frame.prototype.addWidget = function(widget, position) {
		widget.setFrame(this);
	};
	
	/**
	 * Enable dragscroll inside the frame
	 * 
	 * @returns {Boolean} true if jquery.dragscroll plugin is available and dragsrolling enabled, false otherwise
	 */
	kmnode.Frame.prototype.enableDragscroll = function() {
		if(jQuery().dragscroll) {
			this.element.dragscroll({
				scrollBars: false,
				autoFadeBars: true,
				smoothness: 15
			});
			
			// fix the fullscreen button
			this.element.find('.kmn-fullscreen').appendTo(this.element);
			
			// center the canvas
			var left = (kmnode.CANVAS_WIDTH - this.width) / 2;
			var top = (kmnode.CANVAS_HEIGHT - this.height) / 2;
			this.element.find('.dragscroll-scroller').scrollLeft(left).scrollTop(top);
			
			return true;
		}
		
		return false;
	};
	
}(jQuery));