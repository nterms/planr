/*!
 * kmnode.js
 *
 * KM NODE - Node Style Data Visualizing Platform
 * 
 * Copyright 2013, Kraken Media Pte. Ltd, http://www.kraken-media.com
 * Author: Saranga Abeykoon <saranga.abeykoon@kraken-media.com>
 *
 */
 
if(typeof kmnode == 'undefined') { kmnode = {}; }

/**
 * @param {Number} Zoom factor
 */
kmnode.ZOOM_FACTOR = 1; // 100%

/**
 * @param {Number} Default canvas height
 */
kmnode.CANVAS_HEIGHT = 2000; // 500px

/**
 * @param {Number} Default canvas width
 */
kmnode.CANVAS_WIDTH = 4000; // 1000px

/**
 * @param {kmnode.Frame} Reference to the frame object
 */
kmnode.frame = null;

/**
 * @param {kmnode.Node} The selected node
 */
kmnode.selectedNode = null;

/**
 * @param {kmnode.Note} The selected note
 */
kmnode.selectedNote = null;

/**
 * @param {Object} Event object
 */
kmnode.event = {
	NODE_SELECTED: 			'nodeSelected',
	NODE_MOVED: 			'nodeMoved',
	NODE_REMOVE_CLICKED: 	'nodeRemoveClicked',
	NODE_UPDATED: 			'nodeUpdated',
	
	NOTE_SELECTED: 			'noteSelected',
	NOTE_OPENED: 			'noteOpened',
	NOTE_CLOSED: 			'noteClosed',
	
	CONNECTOR_SELECTED: 	'connectorSelected',
	BREAKER_CLICKED: 		'breakerClicked',
	CANVAS_SELECTED: 		'canvasSelected',
};

/**
 * @param {EventEmitter} Event emitter object
 */
kmnode.events = new EventEmitter();

// node selected
kmnode.events.addListener(kmnode.event.NODE_SELECTED, function(node) {
	kmnode.frame.canvas.element.find('.kmn-node').removeClass('selected');
	node.element.addClass('selected');
	kmnode.selectedNode = node;
	kmnode.frame.canvas.linker.attachTo(node);
	kmnode.frame.canvas.breaker.detach();
});

// node moved
kmnode.events.addListener(kmnode.event.NODE_MOVED, function(node) {
	
});

// node removed
kmnode.events.addListener(kmnode.event.NODE_REMOVE_CLICKED, function(node) {
	if(confirm('Are you sure you want to remove this node?')) {
		if(typeof kmnode.frame.canvas.document != 'undefined') {
			kmnode.frame.canvas.document.removeNode(node);
			kmnode.frame.canvas.linker.detach(); // detach the linker from the node
		}
	}
});

// node updated
kmnode.events.addListener(kmnode.event.NODE_UPDATED, function(node) {
	if(kmnode.selectedNode == node) {
		kmnode.frame.canvas.linker.attachTo(node);
	}
	kmnode.frame.canvas.breaker.detach();
});

// connector selected
kmnode.events.addListener(kmnode.event.CONNECTOR_SELECTED, function(connector) {
	kmnode.frame.canvas.element.find('.kmn-connector').removeClass('selected');
	connector.element.addClass('selected');
	kmnode.selectedConnector = connector;
	kmnode.frame.canvas.breaker.attachTo(connector);
});

// node removed
kmnode.events.addListener(kmnode.event.BREAKER_CLICKED, function(breaker) {
	if(typeof kmnode.frame.canvas.document != null && breaker.connector != null) {
		kmnode.frame.canvas.document.removeConnector(breaker.connector);
		// remove connector element from canvas
		breaker.connector.element.remove();
		kmnode.frame.canvas.breaker.detach(); // detach the linker from the node
	}
});

// note selected
kmnode.events.addListener(kmnode.event.NOTE_SELECTED, function(note) {
	kmnode.frame.canvas.element.find('.kmn-note').removeClass('selected');
	note.element.addClass('selected');
	kmnode.selectedNote = note;
});

// canvas selected
kmnode.events.addListener(kmnode.event.CANVAS_SELECTED, function(canvas) {
	// de-select the nodes
	canvas.element.find('.kmn-node').removeClass('selected');
	if(kmnode.selectedNode != null) {
		kmnode.selectedNode.disableEditing();
	}
	kmnode.selectedNode = null;
	
	// de-select the notes
	canvas.element.find('.kmn-note').removeClass('selected');
	if(kmnode.selectedNote != null) {
		kmnode.selectedNote.disableEditing();
	}
	kmnode.selectedNote = null;
	
	kmnode.frame.canvas.linker.detach();
	kmnode.frame.canvas.breaker.detach();
});

/**
 * @param {HTMLElement} The HTML element to run kmnode
 */
kmnode.run = function(container){
	kmnode.frame = frame = new kmnode.Frame(container);
	
	frame.setCanvas(new kmnode.Canvas());
	frame.enableDragscroll();
	
	// add a new document
	var document = new kmnode.Document();
	frame.canvas.setDocument(document);
	
	// add a ColorPicker
	var cp = new kmnode.ColorPicker(['#b3b3b3', '#e6e6e6', '#fff6d5', '#ffeeaa', '#ccffaa', '#ffccaa', '#ffaaaa', '#e9c6af', '#eeaaff', '#afc6e9', '#afdde9', '#aaeeff', '#ffffff'], function(color) { kmnode.selectedNode.setColor(color); }, 'background', {right: 140, top: 20});
	frame.addWidget(cp);
	
	var cpBor = new kmnode.ColorPicker(['#000000', '#808080', '#ffd42a', '#d4aa00', '#6ba50f', '#d45500', '#d40000', '#800000', '#8800aa', '#162d50', '#005580', '#0088cc', '#ffffff'], function(color) { kmnode.selectedNode.setBorderColor(color); }, 'border', {right: 100, top: 20});
	frame.addWidget(cpBor);
	
	var cpFon = new kmnode.ColorPicker(['#000000', '#808080', '#ffd42a', '#d4aa00', '#6ba50f', '#d45500', '#d40000', '#800000', '#8800aa', '#162d50', '#005580', '#0088cc', '#ffffff'], function(color) { kmnode.selectedNode.setTextColor(color); }, 'font', {right: 60, top: 20});
	frame.addWidget(cpFon);
	
	var zoom = new kmnode.Zoom(1, function() {}, 'h', {left: 20, bottom: 20});
	frame.addWidget(zoom);
	
	var cpCon = new kmnode.ColorPicker(['#000000', '#808080', '#ffd42a', '#d4aa00', '#6ba50f', '#d45500', '#d40000', '#800000', '#8800aa', '#162d50', '#005580', '#0088cc', '#ffffff'], function(color) { 
		if(kmnode.selectedNode != null) {
			$.each(kmnode.selectedNode.connectors, function(i, con) { 
				con.setColor(color); 
			});
		}
		
		if(kmnode.selectedConnector != null) {
			kmnode.selectedConnector.setColor(color); 
			kmnode.frame.canvas.breaker.setColor(color); 
		}
		
	}, 'connector', {right: 20, top: 20});
	
	frame.addWidget(cpCon);
	
	// render the canvas
	frame.canvas.render();
};

// utility functions
/**
 * Generates a UUID in compliance with RFC4122.
 * Source: https://github.com/drichard/mindmaps
 *
 * @static
 * @returns {String} A unique ID
 */
kmnode.createUUID = function() {
  // http://www.ietf.org/rfc/rfc4122.txt
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

kmnode.generateId = function() {
	return kmnode.createUUID();
};

kmnode.setCaretPosition = function(elem, caretPos) {
    if(elem != null) {
        if(elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        }
        else {
            if(elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            }
            else
                elem.focus();
        }
    }
};

/**
 * http://js-bits.blogspot.sg/2010/07/canvas-rounded-corner-rectangles.html
 * Draws a rounded rectangle using the current state of the canvas. 
 * If you omit the last three params, it will draw a rectangle 
 * outline with a 5 pixel border radius 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
kmnode.roundRect = function(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == "undefined" ) {
		stroke = true;
	}
	if (typeof radius === "undefined") {
		radius = 5;
	}
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	if (stroke) {
		ctx.stroke();
	}
	if (fill) {
		ctx.fill();
	}        
}

kmnode.wrapText = function(context, text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';

	for(var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + ' ';
		var metrics = context.measureText(testLine);
		var testWidth = metrics.width;
		if (testWidth > maxWidth && n > 0) {
			context.fillText(line, x, y);
			line = words[n] + ' ';
			y += lineHeight;
		} else {
			line = testLine;
		}
	}
	context.fillText(line, x, y);
}

// wrapper for the Array.indexOf
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
    'use strict';
    if (this == null) {
      throw new TypeError();
    }
    var n, k, t = Object(this),
        len = t.length >>> 0;

    if (len === 0) {
      return -1;
    }
    n = 0;
    if (arguments.length > 1) {
      n = Number(arguments[1]);
      if (n != n) { // shortcut for verifying if it's NaN
        n = 0;
      } else if (n != 0 && n != Infinity && n != -Infinity) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if (n >= len) {
      return -1;
    }
    for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}