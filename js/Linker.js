/*!
 * Linker.js
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
	planr.Linker = function() {
		this.handle		= null;
		this.link		= null;
		this.canvas		= null;
		this.node 		= null;
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
	planr.Linker.prototype.init = function() {
		var linker		= this;
		this.handle 	= $('<div>').addClass('planr-linker-handle');
		this.link 		= $('<canvas>').addClass('planr-linker-link');
		
		this.handle.draggable({
			containment: 'parent',
			drag: function(event, ui) {
				linker.x = ui.position.left * (1/planr.ZOOM_FACTOR) + Math.floor(linker.width/2);
				linker.y = ui.position.top * (1/planr.ZOOM_FACTOR) + Math.floor(linker.height/2);
				linker.update();
			},
			stop: function(event, ui) {
				var x = ui.position.left * (1/planr.ZOOM_FACTOR) + linker.width/2; //((linker.width/2) * planr.ZOOM_FACTOR);
				var y = ui.position.top * (1/planr.ZOOM_FACTOR) + linker.height/2; //((linker.height/2) * planr.ZOOM_FACTOR);
				//linker.canvas.element.append('<div class="dot" style="border: 1px solid #f00; position: absolute; width: 1px; height: 1px; left: ' + x + 'px; top: ' + y + 'px;"></div>');
				// did we step on a node?
				var node = linker.canvas.nodeAt(x, y);
				if(node == null) {
					// no.. we didn't step on a node, just create a new node :)
					node = new planr.Node(x, y);
					linker.canvas.document.addNode(node);
				}
				
				if(typeof linker.canvas.document != 'undefined') {
					linker.canvas.document.addConnector(linker.node, node);
					planr.events.emitEvent(planr.event.NODE_SELECTED, [node]);
					linker.canvas.render(); // TODO Might not be the best way to update the canvas, need some optimizing
				}
				linker.reset();
			}
		});
		
		// disable mouse down on handle to make it movable aprt from the canvas
		this.handle.mousedown(function(evt) {
			evt.stopPropagation();
		});
	};
	
	/**
	 * Sets the canvas
	 */
	planr.Linker.prototype.setCanvas = function(canvas) {
		this.canvas = canvas;
		canvas.element.append(this.handle);
		canvas.element.append(this.link);
	};
	
	/**
	 * Attach the linker to a node
	 */
	planr.Linker.prototype.attachTo = function(node) {
		this.node = node;
		// calculate position related to the node
		this.x = node.x;
		this.y = node.y + (node.height/2) + 20;
		this.update();
	};
	
	/**
	 * Detach the linker from a node
	 */
	planr.Linker.prototype.detach = function() {
		this.node = null;
		this.update();
	};
	
	/**
	 * Detach the linker from a node
	 */
	planr.Linker.prototype.reset = function() {
		// calculate position related to the node
		if(this.node == null) {
			this.x = 0;
			this.y = 0;
		} else {
			this.x = this.node.x;
			this.y = this.node.y + (this.node.height/2) + 20;
		}
		this.update();
	};
	
	/**
	 * Returns the HTML handle element of the Linker
	 *
	 * @returns {jQuery} The HTML (jQuery enabled) handle element of the Linker
	 */
	planr.Linker.prototype.getHandle = function() {
		return this.handle;
	};
	
	/**
	 * Returns the HTML link element of the Linker
	 *
	 * @returns {jQuery} The HTML (jQuery enabled) link element of the Linker
	 */
	planr.Linker.prototype.getLink = function() {
		return this.link;
	};
	
	/**
	 * Update the linker
	 */
	planr.Linker.prototype.update = function() {
		var zoom = planr.ZOOM_FACTOR;
		
		// hide if node is not set
		if(this.node == null) {
			this.handle.hide();
			this.link.hide();
			return;
		} else {
			this.handle.show();
			this.link.show();
		}
		
		// bring the handle to top
		this.canvas.element.append(this.handle);
		
		// check if the linker handle mode over any node
		var nodeIn = this.canvas.nodeAt(this.x, this.y);
		var color = this.color;
		if(nodeIn != null) {
			color = '#00dd44';
		}
		
		var height 		= this.height * zoom;
		var width 		= this.width * zoom;
		var left 		= (this.x * zoom) - Math.floor(width/2);
		var top 		= (this.y * zoom) - Math.floor(height/2);
		this.handle.css({
			left: left,
			top: top,
			height: height,
			width: width,
			position: 'absolute',
			backgroundColor: color,
			borderRadius: Math.floor(height/2)
		});
		
		// redraw the link
		var canvas 	= this.link.get(0);
		var context = canvas.getContext('2d');
		
		var left = ((this.node.x < this.x) ? this.node.x : this.x) * zoom;
		var top = ((this.node.y < this.y) ? this.node.y : this.y) * zoom;
		var height = Math.abs(this.node.y * zoom - this.y * zoom);
		var width = Math.abs(this.node.x * zoom - this.x * zoom);
		var lineWidth = Math.ceil(4 * zoom);
		
		this.link.css({
			left: left - lineWidth,
			top: top - lineWidth
		}).attr({
			height: height + (lineWidth * 2),
			width: width + (lineWidth * 2)
		});
		
		// calculate the drawing ends
		var c1 = lineWidth, c2 = lineWidth, c3 = width, c4 = height;
		if(this.node.y == this.y) { // both node and linker handle reside at the same vertical level on the canvas
			// we do not worry about the case, this.node.y == this.y AND this.node.x == this.x 
			// where both node and linker handle lie on the same point on the cartesian plane
			// for both cases this.node.x > this.x AND this.node.x < this.x 
			c1 = lineWidth; c2 = lineWidth;
			c3 = width; c4 = lineWidth;
		} else if(this.node.y < this.y) { // node reside above the linker handle on canvas
			// we ignore the case this.node.x < this.x 
			// becuase its simply the default arrangement of coordinates
			if(this.node.x == this.x) {
				c1 = lineWidth; c2 = lineWidth;
				c3 = lineWidth; c4 = height;
			} else if(this.node.x > this.x) {
				c1 = width; c2 = lineWidth;
				c3 = lineWidth; c4 = height;
			}
		} else { // node resides below the linker handle
			// we ignore the case this.node.x > this.x 
			// becuase its simply the default arrangement of coordinates
			if(this.node.x == this.x) {
				c1 = lineWidth; c2 = lineWidth;
				c3 = lineWidth; c4 = height;
			} else if(this.node.x < this.x) {
				c1 = width; c2 = lineWidth;
				c3 = lineWidth; c4 = height;
			}
		}
		
		// draw the connector line
		context.clearRect(0, 0, width + 20, height + 20);
		context.lineWidth = lineWidth;
		context.strokeStyle = this.color;
		context.beginPath();
		context.moveTo(c1, c2);
		context.lineTo(c3, c4);
		context.stroke();
	};

}(jQuery));
