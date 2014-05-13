/*!
 * Linker.js
 *
 * KM NODE - Node Style Data Visualizing Platform
 * 
 * Copyright 2013, Kraken Media Pte. Ltd, http://www.kraken-media.com
 * Author: Saranga Abeykoon <saranga.abeykoon@kraken-media.com>
 *
 */
 
if(typeof kmnode == 'undefined') { kmnode = {}; }

(function($) {
	kmnode.Breaker = function() {
		this.element	= null;
		this.icon		= null;
		this.canvas		= null;
		this.connector	= null;
		this.x			= 0; 
		this.y			= 0;
		this.height		= 20; 
		this.width		= 20;
		this.color		= '#aaaaaa';
		
		this.init();
	};
	
	/**
	 * Initialize the object
	 */
	kmnode.Breaker.prototype.init = function() {
		var breaker		= this;
		this.element 	= $('<div>').addClass('kmn-breaker');
		this.icon		= $('<canvas>').addClass('kmn-breaker-icon').attr({width: this.width, height: this.height});
		this.element.append(this.icon);
		
		this.element.click(function(evt) {
			evt.stopPropagation();
			kmnode.events.emitEvent(kmnode.event.BREAKER_CLICKED, [breaker]);
		});
	};
	
	/**
	 * Sets the canvas
	 */
	kmnode.Breaker.prototype.setCanvas = function(canvas) {
		this.canvas = canvas;
		canvas.element.append(this.element);
	};
	
	/**
	 * Attach the breaker to a connector
	 */
	kmnode.Breaker.prototype.attachTo = function(connector) {
		this.connector = connector;
		// get the center of the bounding box of the connector
		var center = connector.getCenter();
		this.x = center.x;
		this.y = center.y;
		this.color = connector.color;
		this.update();
	};
	
	/**
	 * Detach the breaker from a connector
	 */
	kmnode.Breaker.prototype.detach = function() {
		this.connector = null;
		this.update();
	};
	
	/**
	 * Returns the HTML element of the breaker
	 *
	 * @returns {jQuery} The HTML (jQuery enabled) element of the Breaker
	 */
	kmnode.Breaker.prototype.getElement = function() {
		return this.element;
	};
	
	/**
	 * Set color
	 */
	kmnode.Breaker.prototype.setColor = function(color) {
		this.color = color;
		this.update();
	};
	
	/**
	 * Update the breaker
	 */
	kmnode.Breaker.prototype.update = function() {
		var zoom = kmnode.ZOOM_FACTOR;
		
		// hide if connector is not set
		if(this.connector == null) {
			this.element.hide();
			return;
		} else {
			this.element.show();
		}
		
		// bring the breaker element to top
		this.canvas.element.append(this.element);
		
		var height 		= this.height * zoom;
		var width 		= this.width * zoom;
		var left 		= (this.x * zoom) - Math.floor(width/2);
		var top 		= (this.y * zoom) - Math.floor(height/2);
		this.element.css({
			left: left,
			top: top,
			height: height,
			width: width,
			position: 'absolute',
			backgroundColor: this.color,
			borderRadius: Math.floor(height/2)
		});
		
		this.icon.attr({
			width: width,
			height: height
		});
		
		var canvas 	= this.icon.get(0);
		var context = canvas.getContext('2d');
		var margin = 6 * zoom;
		context.clearRect(0, 0, width, height);
		context.strokeStyle = '#ffffff';
		context.lineWidth = 2 * zoom;
		context.beginPath();
		context.moveTo(margin, margin);
		context.lineTo(width - margin, height - margin);
		context.moveTo(width - margin, margin);
		context.lineTo(margin, height - margin);
		context.stroke();
	};

}(jQuery));