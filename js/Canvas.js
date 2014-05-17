/*!
 * Canvas.js
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
	planr.Canvas = function() {
		this.element	= null;
		this.frame 		= null;
		this.linker		= null;
		this.breaker	= null;
		this.trash		= null;
		this.document 	= null;
		this.height 	= planr.CANVAS_HEIGHT;
		this.width 		= planr.CANVAS_WIDTH;
		
		this._exporter 	= null; // \	These are not properties of the Canvas
		this._helper 	= null; // /	these variables will be initialized when required. Use with care.
		
		this.init();
	};
	
	/**
	 * Initialize the canvas
	 */
	planr.Canvas.prototype.init = function() {
		var canvas = this;
		
		// create canvas element - not an instance of HTML <canvas/> element
		this.element = $('<div>').addClass('planr-canvas zoom-' + planr.ZOOM_FACTOR).css({width: this.width, height: this.height});
		this.trash = $('<div>').addClass('planr-canvas-trash').css('display', 'none');
		this.element.append(this.trash);
		
		// linker
		this.linker = new planr.Linker();
		this.linker.setCanvas(this);
		
		// breaker
		this.breaker = new planr.Breaker();
		this.breaker.setCanvas(this);
		
		this.element.click(function(evt) {
			evt.stopPropagation();
			planr.events.emitEvent(planr.event.CANVAS_SELECTED, [canvas]);
			
			// check whether user tries to select a connector
			var offset = canvas.element.offset();
			var x = (evt.pageX - offset.left);
			var y = (evt.pageY - offset.top);
			var connector = canvas.connectorAt(x, y);
			if(connector != null) {
				planr.events.emitEvent(planr.event.CONNECTOR_SELECTED, [connector]);
			}
		});
		
		// handle double click on canvas
		this.element.dblclick(function(evt) {
			if(typeof canvas.document != 'undefined') {
				var offset = canvas.element.offset();
				var x = evt.pageX - offset.left;
				var y = evt.pageY - offset.top;
				var node = new planr.Node(x, y);
				canvas.document.addNode(node);
				planr.events.emitEvent(planr.event.NODE_SELECTED, [node]);
				canvas.render();
			}
		});
	};
	
	/**
	 * Returns the HTML element of the canvas
	 *
	 * @returns {jQuery} The HTML (jQuery enabled) element of the canvas (not an HTML5 <canvas/> element)
	 */
	planr.Canvas.prototype.getElement = function() {
		return this.element;
	};
	
	/**
	 * Set the document of the canvas
	 *
	 * @param {planr.Document} The Document object
	 */
	planr.Canvas.prototype.setDocument = function(document) {
		this.document = document;
		// set document name in storage as current document
		this.frame.storage.setCurrentDocument(document);
	};
	
	/**
	 * Set the zooming level of the canvas
	 *
	 * @param {Number} The zooming level
	 */
	planr.Canvas.prototype.zoomTo = function(zoom) {
		var z = planr.ZOOM_FACTOR;
		planr.ZOOM_FACTOR = zoom;
		this.render();
		
		planr.events.emitEvent(planr.event.CANVAS_SELECTED, [this]);
		
		// scroll the canvas to preserve the center
		var scroller = this.frame.element.find('.dragscroll-scroller');
		var canvasWidth = this.width * zoom;
		var canvasHeight = this.height * zoom;
		
		// scroll only if the canvas is larger than the display area
		var sx = scroller.scrollLeft();
		var sy = scroller.scrollTop();
		var nsx = (canvasWidth/2) - (this.frame.width/2); //sx/z * zoom;
		var nsy = (canvasHeight/2) - (this.frame.height/2); //sy/z * zoom;
		scroller.scrollLeft(nsx).scrollTop(nsy);
		if(canvasHeight > this.frame.height && canvasWidth > this.frame.width) {
			
		}
	};
	
	/**
	 * Returns the node at a given point in cartesian plane
	 * This function returns the top most node on the canvas if multiple nodes found at a point
	 *
	 * @param {Number} The x coordinate of the point
	 * @param {Number} The y coordinate of the point
	 * @return {planr.Node} The node contains the point given
	 */
	planr.Canvas.prototype.nodeAt = function(x, y) {
		if(typeof this.document == 'undefined' || this.document.nodes.length == 0) {
			return null;
		}
		
		var zoom = planr.ZOOM_FACTOR;
		var nodeIn = null;
		$.each(this.document.nodes, function(i, node) {
			var height = node.height * zoom;
			var width = node.width * zoom;
			var left = node.x - width / 2;
			var top = node.y - height / 2;
			var xIn = (x > left && x < left + width);
			var yIn = (y > top && y < top + height);
			
			if(xIn && yIn) {
				nodeIn = node;
			}
		});
		
		return nodeIn;
	};
	
	/**
	 * Returns the connector at a given point in cartesian plane
	 * This function returns the top most connector on the canvas if multiple nodes found at a point
	 *
	 * @param {Number} The x coordinate of the point
	 * @param {Number} The y coordinate of the point
	 * @return {planr.Connector} The connector closest to the given point
	 */
	planr.Canvas.prototype.connectorAt = function(x, y) {
		if(typeof this.document == 'undefined' || this.document.connectors.length == 0) {
			return null;
		}
		
		var zoom = planr.ZOOM_FACTOR;
		var threshold = 10 * zoom;
		var connector = null;
		var distance = 900000000; // we get a large number as starting point
		var x1, y1, x2, y2, xIn, yIn, m, b, d;
		$.each(this.document.connectors, function(i, conn) {
			x1 = conn.nodeFrom.x * zoom;
			y1 = conn.nodeFrom.y * zoom;
			x2 = conn.nodeTo.x * zoom;
			y2 = conn.nodeTo.y * zoom;
			
			// check whether the point is in connector's bounding box
			xIn = (x1 <= x2) ? (x1 - threshold < x && x < x2 + threshold) : (x2 - threshold < x && x < x1 + threshold);
			yIn = (y1 <= y2) ? (y1 - threshold < y && y < y2 + threshold) : (y2 - threshold < y && y < y1 + threshold);
			
			if(xIn && yIn) { // we check for distance only when the x,y point is inside the bounding box
				// this needs finding the shortest distance between the given point and each connector line to 
				// find the shortest connector.
				// distance beween a point given by (p,t) and a line given by y = mx + b is
				// d = abs(t - m*p - b) / sqrt(m*m + 1)
				
				m = (y2 - y1) / (x2 - x1);
				b = y1 - m * x1;
				d = Math.abs(y - m*x - b) / Math.sqrt(m*m + 1);
				
				if(d < threshold && d < distance) {
					distance = d;
					connector = conn;
				}
			}
		});
		
		return connector;
	};/**
	 *
	 */
	planr.Canvas.prototype.clear = function() {
		this.element.find('.planr-node, .planr-connector, .planr-note').appendTo(this.trash);
	};
	
	/**
	 *
	 */
	planr.Canvas.prototype.render = function() {
		var canvas = this;
		
		this.element.css({
			height: this.height * planr.ZOOM_FACTOR,
			width: this.width * planr.ZOOM_FACTOR
		});
		
		// draw the connectors first
		$.each(this.document.connectors, function(index, connector) {
			canvas.element.append(connector.element);
			connector.update();
		});
		
		// draw the nodes
		$.each(this.document.nodes, function(index, node) {
			canvas.element.append(node.element);
			canvas.element.append(node.note.element);
			if(node.note.visible) {
				node.note.show();
			} else {
				node.note.hide();
			}
			
			if(node.note.collapsed) {
				node.note.collapse();
			} else {
				node.note.expand();
			}
			node.update();
			node.note.update();
		});
	};
	
	
	/**
	 * Converts the export canvas to an image
	 * 
	 * @returns {String} Image data
	 */
	planr.Canvas.prototype.toImage = function(all) {
		var canvas = this.toCanvas(all);
		
		return canvas.toDataURL();
	};
	
	/**
	 * Render the document on an HTML Canvas
	 * 
	 * @returns {HTMLCanvasElement} HTML canvas element
	 */
	planr.Canvas.prototype.toCanvas = function(all) {
		var zoom = planr.ZOOM_FACTOR;
		if(this._exporter == null) {
			this._exporter = $('<canvas>');
		}
		
		var height = this.height * zoom;
		var width = this.width * zoom;
		
		this._exporter.attr({height: height, width: width});
		var canvas = this._exporter.get(0);
		var ctx = canvas.getContext('2d');
		var minX = width;
		var minY = height;
		var maxX = 0;
		var maxY = 0;
		
		// convert the connectors
		$.each(this.document.connectors, function(i, con) {
			ctx.drawImage(con.element.get(0), con._left, con._top);
		});
		
		// convert the nodes
		$.each(this.document.nodes, function(i, node) {
			ctx.drawImage(node.toCanvas(), node._left, node._top);
			
			// calculate the boundary of the draw area
			minX = (minX > node._left) ? node._left : minX;
			minY = (minY > node._top) ? node._top : minY;
			var nodeHeight = node._top + node._height + node._borderWidth * 2;
			var nodeWidth = node._left + node._width + node._borderWidth * 2;
			maxX = (maxX < nodeWidth) ? nodeWidth : maxX;
			maxY = (maxY < nodeHeight) ? nodeHeight : maxY;
		});
		
		if(all) {
			return canvas;
		} else {
			// crop the image to fit the content
			if(this._helper == null) {
				this._helper = $('<canvas>');
			}
			
			// add margin
			var margin = 20 * zoom;
			//minX -= margin; minY -= margin;	maxX += margin;	maxY += margin;
			
			height 	= maxY - minY;
			width 	= maxX - minX;
			
			this._helper.attr({height: height +  margin * 2, width: width +  margin * 2});
			
			console.log('minX: ' + minX + ' minY: ' + minY + ' maxX: ' + maxX + ' maxY: ' + maxY);
			console.log('height: ' + height + ' width: ' + width);
			
			var cCanvas = this._helper.get(0);
			var cctx = cCanvas.getContext('2d');
			cctx.drawImage(canvas, minX, minY, width, height, margin, margin, width, height);
			
			return cCanvas;
		}
	};

}(jQuery));
