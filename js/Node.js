/*!
 * Node.js
 *
 * KM NODE - Node Style Data Visualizing Platform
 * 
 * Copyright 2013, Kraken Media Pte. Ltd, http://www.kraken-media.com
 * Author: Saranga Abeykoon <saranga.abeykoon@kraken-media.com>
 *
 */
 
if(typeof kmnode == 'undefined') { kmnode = {}; }

(function($) {
	kmnode.Node = function(x, y) {
		this.id			= kmnode.generateId();
		this.element	= null;
		this.content	= null;
		this.editor		= null;
		this.remove		= null;
		this.note		= null;
		this.noteLink	= null;
		this.text 		= "New idea";
		this.html 		= "";
		this.x			= 0;
		this.y			= 0;
		this.height		= 30;
		this.width		= 80;
		
		this.color			= '#ffffff';
		this.borderColor	= '#000000';
		this.borderWidth	= 3;
		this.textColor		= '#000000';
		this.textSize		= 12;
		this.padding		= 8;
		this.connectors		= null;
		
		this._canvas		= null; // this is not a property of the Node
		this._left			= 0;
		this._top			= 0;
		this._height		= 0;
		this._width			= 0;
		this._borderWidth	= 0;
		this._textSize		= 0;
		this._padding		= 0;
		
		this.editing		= false;
		this.selected		= false;
		
		this.init(x, y);
	};
	
	/**
	 * Initialize the node
	 */
	kmnode.Node.prototype.init = function(x, y) {
		var node = this;
		this.x = x; this.y = y;
		
		// the node element
		this.content 	= $('<div class="kmn-node-content"></div>');
		this.editor 	= $('<textarea class="kmn-node-editor"></textarea>');
		this.remove		= $('<div class="kmn-node-remove" title="Remove"><span class="ui-icon ui-icon-close"></span></div>');
		this.noteLink	= $('<div class="kmn-node-note" title="Note"><span class="ui-icon ui-icon-document"></span></div>');
		this.element 	= $('<div>').addClass('kmn-node').append(this.content, this.editor, this.remove, this.noteLink);
		
		// note
		this.note 		= new kmnode.Note(this);
		
		// hide editor
		this.editor.hide();
		
		// list of connectors joined to this node
		this.connectors = new Array();
		
		this.element.resizable({
			alsoRezise: this.content,
			resize: function(event, ui) {
				node.width = ui.size.width * (1/kmnode.ZOOM_FACTOR);
				node.height = ui.size.height * (1/kmnode.ZOOM_FACTOR);
				node.update();
			},
			stop: function(event, ui) {
				node.update();
			}
		});
		
		this.element.draggable({
			containment: 'parent',
			drag: function(event, ui) {
				node.x = ui.position.left * (1/kmnode.ZOOM_FACTOR) + Math.floor(node.width/2);
				node.y = ui.position.top * (1/kmnode.ZOOM_FACTOR) + Math.floor(node.height/2);
				
				node.update();
				kmnode.events.emitEvent(kmnode.event.NODE_MOVED, [node]);
			},
			stop: function(event, ui) {
				node.update();
				kmnode.events.emitEvent(kmnode.event.NODE_MOVED, [node]);
			}
		});
		
		// enable auto-resize on node editor
		if(jQuery().autosize) {
			this.editor.autosize({
				callback: function() {
					var text = node.editor.val();
					if(text != "") {
						node.text = text;
					}
					node.update();
				}
			});
		}
		
		this.element.click(function(evt) {
			evt.stopPropagation();
			kmnode.events.emitEvent(kmnode.event.NODE_SELECTED, [node]);
		});
		
		// handle double click on node
		this.element.dblclick(function(evt) {
			evt.stopPropagation();
			node.enableEditing();
		});
		
		// disable mouse down on nodes to make them movable aprt from the canvas
		this.element.mousedown(function(evt) {
			evt.stopPropagation();
		});
		
		// remove node
		this.remove.click(function(evt) {
			evt.stopPropagation();
			kmnode.events.emitEvent(kmnode.event.NODE_REMOVE_CLICKED, [node]);
		});
		
		// note link
		this.noteLink.click(function(evt) {
			evt.stopPropagation();
			if(node.note.visible) {
				node.note.hide();
				kmnode.events.emitEvent(kmnode.event.NODE_NOTE_CLOSED, [node]);
			} else {
				node.note.show();
				if(node.note.collapsed) {
					node.note.expand();
				}
				if(node.note.text == '') {
					node.note.enableEditing();
					kmnode.events.emitEvent(kmnode.event.NOTE_SELECTED, [node.note]);
				}
				kmnode.events.emitEvent(kmnode.event.NODE_NOTE_OPENED, [node]);
			}
		});
		
		this.noteLink.dblclick(function(evt) {
			evt.stopPropagation();
		});
		
		// editing
		this.editor.keyup(function(evt) {
			evt.stopPropagation();
			node.text = node.editor.val();
		});
		
		this.update();
	};
	
	/**
	 * Converts the node to a JSON string
	 * 
	 * @returns {String} JSON string of the node
	 */
	kmnode.Node.prototype.toString = function() {
		var connectors = new Array();
		
		/* convert the connectors
		$.each(this.connectors, function(i, connector) {
			connectors[i] = connector.toString();
		}); */
		
		var json = 	'{' +
					'"id": "'			+ this.id 				+ '",' +
					'"text": "'			+ this.text 			+ '",' +
					'"html": "' 		+ this.html 			+ '",' +
					'"note": ' 			+ this.note.toString()	+ ',' +
					'"x": "' 			+ this.x 				+ '",' +
					'"y": "' 			+ this.y 				+ '",' +
					'"height": "' 		+ this.height 			+ '",' +
					'"width": "' 		+ this.width 			+ '",' +
					'"color": "' 		+ this.color 			+ '",' +
					'"borderColor": "' 	+ this.borderColor 		+ '",' +
					'"borderWidth": "' 	+ this.borderWidth 		+ '",' +
					'"textColor": "' 	+ this.textColor 		+ '",' +
					'"textSize": "' 	+ this.textSize 		+ '",' +
					'"padding": "' 		+ this.padding 			+ '"}';
		
		return json;
	};
	
	/**
	 * Converts the node to a canvas element
	 * 
	 * @returns {HTMLCanvasElement} HTML canvas element
	 */
	kmnode.Node.prototype.toCanvas = function() {
		if(this._canvas == null) {
			this._canvas = $('<canvas>');
		}
		this._canvas.attr({height: this._height + this._borderWidth * 2, width: this._width + this._borderWidth * 2});
		var canvas = this._canvas.get(0);
		var ctx = canvas.getContext('2d');
		
		ctx.fillStyle = this.color;
		ctx.strokeStyle = this.borderColor;
		ctx.lineWidth = this._borderWidth * 2;
		ctx.font = this._textSize + 'px Droid Sans Mono';
		
		kmnode.roundRect(ctx, this._borderWidth, this._borderWidth, this._width, this._height, this._borderRadius, true, true);
		
		ctx.fillStyle = this.textColor;
		kmnode.wrapText(ctx, this.text, (this._padding + this._borderWidth), (this._padding * 2 + this._borderWidth * 2), (this._width - this._padding), Math.floor(this._textSize * 1.33));
		
		return canvas;
	};
	
	/**
	 * Converts a node in JSON object/string fromat to node object
	 * 
	 * @param {String} JSON object/string of the node
	 */
	kmnode.Node.prototype.fromJSON = function(json) {
		var n = (typeof json == 'string') ? eval("(" + json + ")") : json;
		var node = this;
		
		this.id 			= n.id;
		this.text 			= n.text;
		this.html 			= n.html;
		this.x 				= parseInt(n.x);
		this.y 				= parseInt(n.y);
		this.height 		= parseInt(n.height);
		this.width 			= parseInt(n.width);
		this.color 			= n.color;
		this.borderColor 	= n.borderColor;
		this.borderWidth 	= parseInt(n.borderWidth);
		this.textColor 		= n.textColor;
		this.textSize 		= parseInt(n.textSize);
		this.padding 		= parseInt(n.padding);
		
		// add note
		if(typeof n.note == 'string' || typeof n.note == 'object') {
			this.note.fromJSON(n.note);
		}
	};
	
	/**
	 * Enables editing of node content
	 *
	 */
	kmnode.Node.prototype.enableEditing = function() {
		this.content.hide();
		this.editor.val(this.text).css('display', 'block');
		this.editor.show().focus().select();
		this.element.addClass('editing');
		this.editing = true;
	};
	
	/**
	 * Disables editing of node content
	 *
	 */
	kmnode.Node.prototype.disableEditing = function() {
		this.text = this.editor.val();
		this.html = this.text.replace(/\n/g, "<br/>");
		this.editor.hide();
		this.content.show();
		this.element.removeClass('editing');
		this.editing = false;
		this.update();
	};
	
	/**
	 * Returns the HTML element of the node
	 *
	 * @returns {jQuery} The HTML (jQuery enabled) element of the node
	 */
	kmnode.Node.prototype.getElement = function() {
		return this.element;
	};
	
	/**
	 * Set text
	 */
	kmnode.Node.prototype.setText = function(text) {
		this.text = text;
		this.html = text;
		this.update();
	};
	
	/**
	 * Set html
	 */
	kmnode.Node.prototype.setHtml = function(html) {
		this.html = html;
		this.update();
	};
	
	/**
	 * Set x
	 */
	kmnode.Node.prototype.setX = function(x) {
		this.x = x;
		this.update();
	};
	
	/**
	 * Set y
	 */
	kmnode.Node.prototype.setY = function(y) {
		this.y = y;
		this.update();
	};
	
	/**
	 * Set height
	 */
	kmnode.Node.prototype.setHeight = function(height) {
		this.height = height;
		this.update();
	};
	
	/**
	 * Set width
	 */
	kmnode.Node.prototype.setWidth = function(width) {
		this.width = width;
		this.update();
	};
	
	/**
	 * Set color
	 */
	kmnode.Node.prototype.setColor = function(color) {
		this.color = color;
		this.update();
	};
	
	/**
	 * Set border color
	 */
	kmnode.Node.prototype.setBorderColor = function(color) {
		this.borderColor = color;
		this.update();
	};
	
	/**
	 * Set border width
	 */
	kmnode.Node.prototype.setBorderWidth = function(width) {
		this.borderWidth = width;
		this.update();
	};
	
	/**
	 * Set tesxt color
	 */
	kmnode.Node.prototype.setTextColor = function(color) {
		this.textColor = color;
		this.update();
	};
	
	/**
	 * Set text zise
	 */
	kmnode.Node.prototype.setTextSize = function(size) {
		this.textSize = size;
		this.update();
	};
	
	/**
	 * Update the visual properties of the node
	 * 
	 */
	kmnode.Node.prototype.update = function() {
		var zoom = kmnode.ZOOM_FACTOR;
		
		var height 			= Math.ceil(this.height * zoom);
		var width 			= Math.ceil(this.width * zoom);
		var contentMargin 	= Math.ceil(this.padding * zoom);
		var textSize 		= Math.ceil(this.textSize * zoom);
		
		if(this.html == "") {
			this.html = this.text;
		}
		
		this.content.html(this.html).css({margin: contentMargin, fontSize: textSize, width: width - contentMargin * 2});
		
		// set up the editor
		this.editor.val(this.text).css({
			fontSize: textSize,
			margin: contentMargin,
			width: width - (contentMargin * 2),
			resize: 'none'
		});
		
		// fix the false node height determination issue
		var contentHeight 	= this.content.height();
		var editorHeight 	= this.editor.height();
		contentHeight = (this.editing && editorHeight > contentHeight) ? editorHeight : contentHeight;
		
		// rest the editor if not in editor mode
		if(!this.editing) {
			this.editor.val(this.text).css({height: contentHeight});
		}
		
		if(height <= contentHeight) { height = contentHeight + contentMargin * 2; }
		this.element.resizable('option', 'minHeight', contentHeight + contentMargin * 2);
		
		var left 			= Math.ceil((this.x * zoom) - Math.floor(width/2));
		var top 			= Math.ceil((this.y * zoom) - Math.floor(height/2));
		var borderWidth 	= Math.floor(this.borderWidth * zoom);
		var borderRadius 	= Math.floor(6 * zoom);
		this.element.css({
			left: left,
			top: top,
			height: height,
			width: width,
			position: 'absolute',
			backgroundColor: this.color,
			borderColor: this.borderColor,
			borderWidth: borderWidth,
			borderRadius: borderRadius,
			color: this.textColor
		});
		
		this.height = Math.floor(height * (1/zoom));
		this.width = Math.floor(width * (1/zoom));
		
		// update the node handles
		this.remove.css({backgroundColor: this.borderColor});
		this.noteLink.css({backgroundColor: this.borderColor});
		
		// update the connectors
		$.each(this.connectors, function(index, connector) {
			connector.update();
		});
		
		// update the note
		this.note.update();
		
		// trigger the event node updated
		kmnode.events.emitEvent(kmnode.event.NODE_UPDATED, [this]);
		
		this._left			= left - borderWidth;
		this._top			= top - borderWidth;
		this._height		= height;
		this._width			= width;
		this._borderWidth	= borderWidth;
		this._textSize		= textSize;
		this._padding		= contentMargin;
		this._borderRadius	= borderRadius - Math.ceil(2 * zoom);
	};

}(jQuery));