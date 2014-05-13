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
	kmnode.ColorPicker = function(colors, handler, type, position) {
		this.element	= null;
		this.button		= null;
		this.palette	= null;
		//this.close		= null;
		this.color 		= '#aaaaaa';
		this.frame 		= null;
		this.x			= 0; 
		this.y			= 0;
		this.swatches	= null;
		this.handler	= null;
		this.buttonType	= 'background'; // background, border, font, connectors
		
		this.init(colors, handler, type, position);
	};
	
	/**
	 * Initialize the object
	 */
	kmnode.ColorPicker.prototype.init = function(colors, handler, type, position) {
		var cp 			= this;
		this.button 	= $('<div>').addClass('kmn-color-picker-button').html('<canvas height="24" width="24"></canvas>');
		//this.close	= $('<div>').addClass('kmn-color-picker-close');
		this.palette 	= $('<div>').addClass('kmn-color-picker-palette');
		this.element 	= $('<div>').addClass('kmn-color-picker');
		this.element.append(this.button, this.palette, this.close);
		
		if(typeof position == 'object') {
			position.position = 'absolute';
			this.element.css(position);
		}
		// add swatches
		this.swatches = new Array();
		$.each(colors, function(index, color) {
			cp.addSwatch(color);
		});
		
		this.button.click(function(evt) {
			evt.stopPropagation();
			cp.palette.animate({height: 'toggle'});
		});
		
		// set the button
		if(typeof type == 'string' && (type == 'background' || type == 'border' || type == 'font' || type == 'connector')) {
			this.buttonType = type;
		}
		
		this.close();
		this.updateButton();
		this.handler = handler;
	};
	
	/**
	 * Returns the HTML element of the ColorPicker
	 *
	 * @returns {jQuery} The HTML (jQuery enabled) element of the ColorPicker
	 */
	kmnode.ColorPicker.prototype.getElement = function() {
		return this.element;
	};
	
	/**
	 * Adds this widget to the frame
	 */
	kmnode.ColorPicker.prototype.setFrame = function(frame) {
		this.frame = frame;
		frame.element.append(this.element);
	};
	
	/**
	 * Add a color swatch to the list of swatches
	 * 
	 * @param {String} A color code to add to the list of swatches
	 * @rerurn {Number} Number of colors in the list
	 */
	kmnode.ColorPicker.prototype.addSwatch = function(color) {
		if(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color)) {
			var cp = this;
			var code = color.replace('#', '');
			var swatch = $('<div>').addClass('kmn-color-picker-swatch swatch-' + code).attr('data-color', color).css('backgroundColor', color);
			swatch.click(function(evt) {
				evt.stopPropagation();
				cp.palette.find('.kmn-color-picker-swatch').removeClass('selected');
				swatch.addClass('selected');
				cp.color = color;
				cp.handler(color);
				cp.updateButton();
			});
			this.palette.append(swatch);
			this.swatches.push(color);
		}
		return this.swatches.length;
	};
	
	/**
	 * Open the color palette
	 */
	kmnode.ColorPicker.prototype.open = function() {
		this.palette.animate({height: 'show'});
	};
	
	/**
	 * Close the color palette
	 */
	kmnode.ColorPicker.prototype.close = function() {
		this.palette.hide();
	};
	
	/**
	 * Returns the selected color
	 * 
	 * @returns {String} The selected color
	 */
	kmnode.ColorPicker.prototype.getColor = function() {
		return this.color;
	};
	
	/**
	 * Sets the selected color
	 * 
	 * @returns {String} The selected color
	 */
	kmnode.ColorPicker.prototype.setColor = function(color) {
		var code = color.replace('#', '');
		this.palette.find('swatch-' + color).click();
		return this.color;
	};
	
	/**
	 * Update the button icon
	 */
	kmnode.ColorPicker.prototype.updateButton = function() {
		var canvas 	= this.button.find('canvas').get(0);
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, 24, 24);
		context.fillStyle = this.color;
		context.strokeStyle = this.color;
		context.lineWidth = 2;
		context.beginPath();
		switch(this.buttonType) {
			case 'background':
				context.arc(12, 12, 9, 0, 2 * Math.PI, false);
				context.fill();
				break;
			case 'border':
				context.arc(12, 12, 8, 0, 2 * Math.PI, false);
				context.stroke();
				break;
			case 'font':
				context.font = '18px Arial';
				context.fillText('A', 6, 18);
				break;
			case 'connector':
				context.arc(12, 12, 4, 0, 2 * Math.PI, false);
				context.fill();
				context.moveTo(20, 4);
				context.lineTo(4, 20);
				context.stroke();
				break;
		}
	};

}(jQuery));