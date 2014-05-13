/*!
 * Note.js
 *
 * KM NODE - Node Style Data Visualizing Platform
 * 
 * Copyright 2013, Kraken Media Pte. Ltd, http://www.kraken-media.com
 * Author: Saranga Abeykoon <saranga.abeykoon@kraken-media.com>
 *
 */
 
if(typeof kmnode == 'undefined') { kmnode = {}; }

(function($) {
	kmnode.Note = function(node) {
		this.id			= kmnode.generateId();
		this.element	= null;
		this.content	= null;
		this.editor		= null;
		this.remove		= null;
		this.close		= null;
		this.link		= null;
		this.node		= null;
		this.text 		= "";
		this.html 		= "";
		this.x			= 0;
		this.y			= 0;
		this.height		= 30;
		this.width		= 80;
		
		this.color			= '#ffffff';
		this.borderColor	= '#000000';
		this.borderWidth	= 1;
		this.textColor		= '#000000';
		this.textSize		= 12;
		this.padding		= 8;
		
		this.editing	= false;
		this.selected	= false;
		this.visible	= false;
		this.collapsed	= false;
		
		this.init(node);
	};
	
	/**
	 * Initialize the note
	 */
	kmnode.Note.prototype.init = function(node) {
		var note = this;
		this.x = node.x + node.width/2 + 40; this.y = node.y + node.height/2 + 40;
		this.node = node;
		
		// the note element
		this.content 	= $('<div class="kmn-note-content"></div>');
		this.editor 	= $('<textarea class="kmn-note-editor"></textarea>');
		this.remove		= $('<div class="kmn-note-remove"><span class="ui-icon ui-icon-trash"></span></div>');
		this.close		= $('<div class="kmn-note-close"><span class="ui-icon ui-icon-newwin"></span></div>');
		this.link		= $('<div class="kmn-note-link"></div>');
		this.element 	= $('<div>').addClass('kmn-note').append(this.content, this.editor, this.remove, this.close, this.link);
		
		this.element.hide();
		
		// hide editor
		this.editor.hide();
		
		// list of connectors joined to this note
		this.connectors = new Array();
		
		this.element.resizable({
			alsoRezise: this.content,
			resize: function(event, ui) {
				note.width = ui.size.width * (1/kmnode.ZOOM_FACTOR);
				note.height = ui.size.height * (1/kmnode.ZOOM_FACTOR);
				note.update();
			},
			stop: function(event, ui) {
				note.update();
			}
		});
		
		/*
		this.element.draggable({
			containment: 'parent',
			drag: function(event, ui) {
				note.x = ui.position.left * (1/kmnode.ZOOM_FACTOR) + Math.floor(note.width/2);
				note.y = ui.position.top * (1/kmnode.ZOOM_FACTOR) + Math.floor(note.height/2);
				
				note.update();
				kmnode.events.emitEvent(kmnode.event.NODE_MOVED, [note]);
			},
			stop: function(event, ui) {
				note.update();
				kmnode.events.emitEvent(kmnode.event.NODE_MOVED, [note]);
			}
		});
		*/
		
		// enable auto-resize on note editor
		if(jQuery().autosize) {
			this.editor.autosize({
				callback: function() {
					var text = note.editor.val();
					if(text != "") {
						note.text = text;
					}
					note.update();
				}
			});
		}
		
		this.element.click(function(evt) {
			evt.stopPropagation();
			note.element.appendTo(note.element.parent());
			if(note.collapsed) {
				note.expand();
			}
			if(note.editing) {
				note.editor.focus();
			}
			kmnode.events.emitEvent(kmnode.event.NOTE_SELECTED, [note]);
		});
		
		// handle double click on note
		this.element.dblclick(function(evt) {
			evt.stopPropagation();
			note.enableEditing();
		});
		
		// disable mouse down on nodes to make them movable aprt from the canvas
		this.element.mousedown(function(evt) {
			evt.stopPropagation();
		});
		
		// close note
		this.close.click(function(evt) {
			evt.stopPropagation();
			note.collapse();
		});
		
		// remove note
		this.remove.click(function(evt) {
			evt.stopPropagation();
			if(confirm('Are you sure you want to remove this note?')) {
				note.text = '';
				note.html = '';
				note.editor.val();
				note.update();
				note.hide();
			}
		});
		
		// editing
		this.editor.keyup(function(evt) {
			evt.stopPropagation();
			note.text = note.editor.val();
		});
		
		this.update();
	};
	
	/**
	 * Converts the note to a JSON string
	 * 
	 * @returns {String} JSON string of the note
	 */
	kmnode.Note.prototype.toString = function() {
		var connectors = new Array();
		
		/* convert the connectors
		$.each(this.connectors, function(i, connector) {
			connectors[i] = connector.toString();
		}); */
		
		var json = 	'{' +
					'"id": "'			+ this.id 			+ '",' +
					'"text": "'			+ this.text 		+ '",' +
					'"html": "' 		+ this.html 		+ '",' +
					'"height": "' 		+ this.height 		+ '",' +
					'"width": "' 		+ this.width 		+ '",' +
					'"visible": "' 		+ this.visible 		+ '",' +
					'"collapsed": "' 	+ this.collapsed 	+ '"}';
					//'"color": "' 			+ this.color 		+ '",' +
					//'"borderColor": "' 	+ this.borderColor 	+ '",' +
					//'"borderWidth": "' 	+ this.borderWidth 	+ '",' +
					//'"textColor": "' 		+ this.textColor 	+ '",' +
					//'"textSize": "' 		+ this.textSize 	+ '",' +
					//'"padding": "' 		+ this.padding 		+ '"}';
					//'"connectors":[' 		+ connectors.join() + ']}';
		
		return json;
	};
	
	/**
	 * Converts a note in JSON object/string fromat to note object
	 * 
	 * @param {String} JSON object/string of the note
	 */
	kmnode.Note.prototype.fromJSON = function(json) {
		var n = (typeof json == 'string') ? eval("(" + json + ")") : json;
		var note = this;
		
		this.id 			= n.id;
		this.text 			= n.text;
		this.html 			= n.html;
		this.height 		= parseInt(n.height);
		this.width 			= parseInt(n.width);
		this.visible 		= n.visible;
		this.collapsed 		= n.collapsed;
		//this.color 			= n.color;
		//this.borderColor 		= n.borderColor;
		//this.borderWidth 		= parseInt(n.borderWidth);
		//this.textColor 		= n.textColor;
		//this.textSize 		= parseInt(n.textSize);
		//this.padding 			= parseInt(n.padding);
	};
	
	/**
	 * Enables editing of note content
	 *
	 */
	kmnode.Note.prototype.enableEditing = function() {
		this.content.hide();
		this.editor.val(this.text).css('display', 'block');
		this.editor.show().focus().select();
		this.element.addClass('editing');
		this.editing = true;
	};
	
	/**
	 * Disables editing of note content
	 *
	 */
	kmnode.Note.prototype.disableEditing = function() {
		this.text = this.editor.val();
		this.html = this.text.replace(/\n/g, "<br/>");
		this.editor.hide();
		this.content.show();
		this.element.removeClass('editing');
		this.editing = false;
		this.update();
	};
	
	/**
	 * Show note
	 */
	kmnode.Note.prototype.show = function() {
		this.element.appendTo(this.element.parent());
		this.element.fadeIn('fast');
		this.visible = true;
	};
	
	/**
	 * Hide note
	 */
	kmnode.Note.prototype.hide = function() {
		this.element.fadeOut('fast');
		this.visible = false;
	};
	
	/**
	 * Expand note
	 */
	kmnode.Note.prototype.expand = function() {
		this.element.removeClass('collapsed');
		this.collapsed = false;
		this.update();
	};
	
	/**
	 * Collapse note
	 */
	kmnode.Note.prototype.collapse = function() {
		if(this.text == '') {
			this.hide();
		} else {
			this.element.addClass('collapsed');
			this.collapsed = true;
			this.update();
		}
	};
	
	/**
	 * Returns the HTML element of the note
	 *
	 * @returns {jQuery} The HTML (jQuery enabled) element of the note
	 */
	kmnode.Note.prototype.getElement = function() {
		return this.element;
	};
	
	/**
	 * Set node
	 */
	kmnode.Note.prototype.setNode = function(node) {
		this.node = node;
		this.update();
	};
	
	/**
	 * Set text
	 */
	kmnode.Note.prototype.setText = function(text) {
		this.text = text;
		this.update();
	};
	
	/**
	 * Set html
	 */
	kmnode.Note.prototype.setHtml = function(html) {
		this.html = html;
		this.update();
	};
	
	/**
	 * Set x
	 */
	kmnode.Note.prototype.setX = function(x) {
		this.x = x;
		this.update();
	};
	
	/**
	 * Set y
	 */
	kmnode.Note.prototype.setY = function(y) {
		this.y = y;
		this.update();
	};
	
	/**
	 * Set height
	 */
	kmnode.Note.prototype.setHeight = function(height) {
		this.height = height;
		this.update();
	};
	
	/**
	 * Set width
	 */
	kmnode.Note.prototype.setWidth = function(width) {
		this.width = width;
		this.update();
	};
	
	/**
	 * Set color
	 */
	kmnode.Note.prototype.setColor = function(color) {
		this.color = color;
		this.update();
	};
	
	/**
	 * Set border color
	 */
	kmnode.Note.prototype.setBorderColor = function(color) {
		this.borderColor = color;
		this.update();
	};
	
	/**
	 * Set border width
	 */
	kmnode.Note.prototype.setBorderWidth = function(width) {
		this.borderWidth = width;
		this.update();
	};
	
	/**
	 * Set tesxt color
	 */
	kmnode.Note.prototype.setTextColor = function(color) {
		this.textColor = color;
		this.update();
	};
	
	/**
	 * Set text zise
	 */
	kmnode.Note.prototype.setTextSize = function(size) {
		this.textSize = size;
		this.update();
	};
	
	/**
	 * Update the visual properties of the note
	 * 
	 */
	kmnode.Note.prototype.update = function() {
		var zoom = kmnode.ZOOM_FACTOR;
		var offset = 20 * zoom;
		
		var height 			= this.height * zoom;
		var width 			= this.width * zoom;
		var contentMargin 	= this.padding * zoom;
		var textSize 		= this.textSize * zoom;
		
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
		
		// fix the false note height determination issue
		var contentHeight 	= this.content.height();
		var editorHeight 	= this.editor.height();
		contentHeight = (this.editing && editorHeight > contentHeight) ? editorHeight : contentHeight;
		
		// rest the editor if not in editor mode
		if(!this.editing) {
			this.editor.val(this.text).css({height: contentHeight});
		}
		
		if(height <= contentHeight) { height = contentHeight + contentMargin * 2; }
		this.element.resizable('option', 'minHeight', contentHeight + contentMargin * 2);
		
		var nodeWidth = this.node.width * zoom;
		var nodeHeight = this.node.height * zoom;
		
		var left 			= (this.node.x * zoom + offset) + Math.floor(nodeWidth/2) + this.node.borderWidth * zoom;
		var top 			= this.node.y * zoom - (offset / 2); // - Math.floor(nodeHeight/2);
		var borderWidth 	= this.borderWidth * zoom;
		var borderRadius 	= 0;
		
		this.height = Math.floor(height * (1/zoom));
		this.width = Math.floor(width * (1/zoom));
		
		if(this.collapsed) {
			borderRadius = Math.ceil(offset/2);
			height = offset;
			width = offset;
			contentMargin = 0;
		}
		
		this.element.css({
			left: left,
			top: top,
			height: height,
			width: width,
			position: 'absolute',
			//backgroundColor: this.color,
			//borderColor: this.borderColor,
			borderWidth: borderWidth,
			borderRadius: borderRadius,
			//color: this.textColor,
			paddingTop: contentMargin
		});
		
		// note link
		this.link.css({
			left: -offset,
			top: offset / 2,
			height: 0,
			width: offset,
			position: 'absolute',
			borderTopWidth: borderWidth
		});
		
		kmnode.events.emitEvent(kmnode.event.NODE_UPDATED, [this]);
	};

}(jQuery));