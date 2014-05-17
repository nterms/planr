/*!
 * Connector.js
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
	planr.Connector = function(nodeFrom, nodeTo) {
		this.id			= planr.generateId();
		this.element	= null;
		this.nodeFromId	= null;
		this.nodeFrom 	= null;
		this.nodeToId 	= null;
		this.nodeTo 	= null;
		this.color		= '#aaaaaa';
		
		this._left		= 0; // \	These variables are not properties of the connector
		this._top		= 0; //  \	they are automatically calculated every time the connector is rendered
		this._height	= 0; //  /	they will be used specifically for generating the image version of the 
		this._width		= 0; // /	connector.
		
		this.init(nodeFrom, nodeTo);
	};
	
	/**
	 * Initialize the connector object
	 */
	planr.Connector.prototype.init = function(nodeFrom, nodeTo) {
		this.nodeFromId	= nodeFrom.id;
		this.nodeFrom 	= nodeFrom;
		this.nodeToId 	= nodeTo.id;
		this.nodeTo 	= nodeTo;
		
		this.element = $('<canvas>').addClass('planr-connector');
		
		this.nodeFrom.connectors.push(this);
		this.nodeTo.connectors.push(this);
	};
	
	/**
	 * Converts the node to a JSON string
	 * 
	 * @returns {String} JSON string of the node
	 */
	planr.Connector.prototype.toString = function() {
		
		var json = 	'{' +
					'"id": "'			+ this.id 			+ '",' +
					'"nodeFromId": "'	+ this.nodeFromId	+ '",' +
					'"nodeToId": "'		+ this.nodeToId		+ '",' +
					'"color": "' 		+ this.color 		+ '"}';
		
		return json;
	};
	
	/**
	 * Converts a connector in JSON object/string fromat to connector object
	 * 
	 * @param {String} JSON object/string of the connector
	 */
	planr.Connector.prototype.fromJSON = function(json) {
		var c = (typeof json == 'string') ? eval("(" + json + ")") : json;
		var connector = this;
		
		this.id 		= c.id;
		this.nodeFromId = c.nodeFromId;
		this.nodeToId 	= c.nodeToId;
		this.color 		= c.color;
	};
	/**
	 * Set color
	 */
	planr.Connector.prototype.setColor = function(color) {
		this.color = color;
		this.update();
	};
	
	/**
	 * Calculate and returns the coordinates of the center
	 */
	planr.Connector.prototype.getCenter = function() {
		var zoom = planr.ZOOM_FACTOR;
		var nf = this.nodeFrom;
		var nt = this.nodeTo;
		var left = ((nf.x < nt.x) ? nf.x : nt.x);
		var top = ((nf.y < nt.y) ? nf.y : nt.y);
		var height = Math.abs(nf.y - nt.y);
		var width = Math.abs(nf.x - nt.x);
		var x = left + Math.floor(width/2);
		var y = top + Math.floor(height/2);
		
		return {x: x, y: y};
	};
	
	/**
	 * Set color
	 */
	planr.Connector.prototype.setColor = function(color) {
		this.color = color;
		this.update();
	};
	
	/**
	 * Update the visual properties of the connector
	 * 
	 */
	planr.Connector.prototype.update = function() {
		var zoom = planr.ZOOM_FACTOR;
		var nf = this.nodeFrom;
		var nt = this.nodeTo;
		var left = ((nf.x < nt.x) ? nf.x : nt.x) * zoom;
		var top = ((nf.y < nt.y) ? nf.y : nt.y) * zoom;
		var height = Math.abs(nf.y * zoom - nt.y * zoom);
		var width = Math.abs(nf.x * zoom - nt.x * zoom);
		var lineWidth = Math.ceil(4 * zoom);
		
		this.element.css({
			left: left - lineWidth,
			top: top - lineWidth
		}).attr({
			height: height + (lineWidth * 2),
			width: width + (lineWidth * 2)
		});
		
		// calculate the drawing ends
		var c1 = lineWidth, c2 = lineWidth, c3 = width, c4 = height;
		if(nf.y == nt.y) { // both nodes reside at the same vertical level on canvas
			// we do not worry about the case, this.node.y == this.y AND this.node.x == this.x 
			// where both node and linker handle lie on the same point on the cartesian plane
			// for both cases this.node.x > this.x AND this.node.x < this.x 
			c1 = lineWidth; c2 = lineWidth;
			c3 = width; c4 = lineWidth;
		} else if(nf.y < nt.y) { // start node reside above the dest. node on canvas
			// we ignore the case nf.x < nt.x 
			// becuase its simply the default arrangement of coordinates
			if(nf.x == nt.x) {
				c1 = lineWidth; c2 = lineWidth;
				c3 = lineWidth; c4 = height;
			} else if(nf.x > nt.x) {
				c1 = width; c2 = lineWidth;
				c3 = lineWidth; c4 = height;
			}
		} else { // start node resides below the dest. node
			// we ignore the case nf.x > nt.x 
			// becuase its simply the default arrangement of coordinates
			if(nf.x == nt.x) {
				c1 = lineWidth; c2 = lineWidth;
				c3 = lineWidth; c4 = height;
			} else if(nf.x < nt.x) {
				c1 = width; c2 = lineWidth;
				c3 = lineWidth; c4 = height;
			}
		}
		
		// draw the connector line
		var context = this.element[0].getContext('2d');
		context.clearRect(0, 0, width + 20, height + 20);
		context.lineWidth = lineWidth;
		context.strokeStyle = this.color;
		context.beginPath();
		context.moveTo(c1, c2);
		context.lineTo(c3, c4);
		context.stroke();
		
		this._left 		= left;
		this._top 		= top;
		this._height 	= height;
		this._width 	= width;
	};

}(jQuery));
