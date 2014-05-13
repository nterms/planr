/*!
 * ColorPicker.js
 *
 * KM NODE - Node Style Data Visualizing Platform
 * 
 * Copyright 2013, Kraken Media Pte. Ltd, http://www.kraken-media.com
 * Author: Saranga Abeykoon <saranga.abeykoon@kraken-media.com>
 *
 */
 
if(typeof kmnode == 'undefined') { kmnode = {}; }

(function($) {
	kmnode.Zoom = function(zoom, handler, orientation, position) {
		this.element 		= null;
		this.slider 		= null;
		this.label 			= null;
		this.frame			= null;
		this.handler		= null;
		this.orientation	= 'h',
		this.length			= 200;
		this.zoom 			= 1;
		
		this.init(zoom, handler, orientation, position);
	};
	
	/**
	 * Initialize the document
	 */
	kmnode.Zoom.prototype.init = function(zoom, handler, orientation, position) {
		var zoomer = this;
		// zoom controller element
		this.element = $('<div>').addClass('kmn-zoom');
		this.slider = $('<div>').addClass('kmn-zoom-slider').css({width: this.length, height: 8});
		this.label = $('<div>').addClass('kmn-zoom-label').text('100%');
		this.element.append(this.slider, this.label);
		
		if(typeof position == 'object') {
			position.position = 'absolute';
			this.element.css(position);
		}
		
		this.slider.slider({
			value: 1,
			min: 0.25,
			max: 2,
			step: 0.25,
			slide: function(evt, ui) {
				zoomer.frame.canvas.zoomTo(ui.value);
				zoomer.label.text((ui.value * 100) + '%');
			}
		});
		
		this.handler = handler;
	};
	
	/**
	 * Returns the HTML element of the Zoom controller
	 *
	 * @returns {jQuery} The HTML (jQuery enabled) element of the Zoom controller
	 */
	kmnode.Zoom.prototype.getElement = function() {
		return this.element;
	};
	
	/**
	 * Adds this widget to the frame
	 */
	kmnode.Zoom.prototype.setFrame = function(frame) {
		this.frame = frame;
		frame.element.append(this.element);
	};

}(jQuery));