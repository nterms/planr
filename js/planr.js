/*!
 * planr.js
 *
 * planr - HTML5 + JavaScript based mind and process planning software.
 * 
 * Copyright (c) 2014 Saranga Abeykoon (http://blog.nterms.com)
 *
 * Licensed under the MIT License (LICENSE.md).
 * 
 */
 
if(typeof planr == 'undefined') { planr = {}; }

/**
 * @param {Number} Zoom factor
 */
planr.ZOOM_FACTOR = 1; // 100%

/**
 * @param {Number} Default canvas height
 */
planr.CANVAS_HEIGHT = 2000; // 500px

/**
 * @param {Number} Default canvas width
 */
planr.CANVAS_WIDTH = 4000; // 1000px

/**
 * @param {planr.Frame} Reference to the frame object
 */
planr.frame = null;

/**
 * @param {planr.Node} The selected node
 */
planr.selectedNode = null;

/**
 * @param {planr.Note} The selected note
 */
planr.selectedNote = null;

/**
 * @param {Object} Event object
 */
planr.event = {
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
planr.events = new EventEmitter();

// node selected
planr.events.addListener(planr.event.NODE_SELECTED, function(node) {
	planr.frame.canvas.element.find('.kmn-node').removeClass('selected');
	node.element.addClass('selected');
	planr.selectedNode = node;
	planr.frame.canvas.linker.attachTo(node);
	planr.frame.canvas.breaker.detach();
});

// node moved
planr.events.addListener(planr.event.NODE_MOVED, function(node) {
	
});

// node removed
planr.events.addListener(planr.event.NODE_REMOVE_CLICKED, function(node) {
	if(confirm('Are you sure you want to remove this node?')) {
		if(typeof planr.frame.canvas.document != 'undefined') {
			planr.frame.canvas.document.removeNode(node);
			planr.frame.canvas.linker.detach(); // detach the linker from the node
		}
	}
});

// node updated
planr.events.addListener(planr.event.NODE_UPDATED, function(node) {
	if(planr.selectedNode == node) {
		planr.frame.canvas.linker.attachTo(node);
	}
	planr.frame.canvas.breaker.detach();
});

// connector selected
planr.events.addListener(planr.event.CONNECTOR_SELECTED, function(connector) {
	planr.frame.canvas.element.find('.kmn-connector').removeClass('selected');
	connector.element.addClass('selected');
	planr.selectedConnector = connector;
	planr.frame.canvas.breaker.attachTo(connector);
});

// node removed
planr.events.addListener(planr.event.BREAKER_CLICKED, function(breaker) {
	if(typeof planr.frame.canvas.document != null && breaker.connector != null) {
		planr.frame.canvas.document.removeConnector(breaker.connector);
		// remove connector element from canvas
		breaker.connector.element.remove();
		planr.frame.canvas.breaker.detach(); // detach the linker from the node
	}
});

// note selected
planr.events.addListener(planr.event.NOTE_SELECTED, function(note) {
	planr.frame.canvas.element.find('.kmn-note').removeClass('selected');
	note.element.addClass('selected');
	planr.selectedNote = note;
});

// canvas selected
planr.events.addListener(planr.event.CANVAS_SELECTED, function(canvas) {
	// de-select the nodes
	canvas.element.find('.kmn-node').removeClass('selected');
	if(planr.selectedNode != null) {
		planr.selectedNode.disableEditing();
	}
	planr.selectedNode = null;
	
	// de-select the notes
	canvas.element.find('.kmn-note').removeClass('selected');
	if(planr.selectedNote != null) {
		planr.selectedNote.disableEditing();
	}
	planr.selectedNote = null;
	
	planr.frame.canvas.linker.detach();
	planr.frame.canvas.breaker.detach();
});

/**
 * @param {HTMLElement} The HTML element to run planr
 */
planr.run = function(container){
	planr.frame = frame = new planr.Frame(container);
	
	frame.setCanvas(new planr.Canvas());
	frame.enableDragscroll();
	
	// add a new document
	var document = new planr.Document();
	frame.canvas.setDocument(document);
	
	// add a ColorPicker
	var cp = new planr.ColorPicker(['#b3b3b3', '#e6e6e6', '#fff6d5', '#ffeeaa', '#ccffaa', '#ffccaa', '#ffaaaa', '#e9c6af', '#eeaaff', '#afc6e9', '#afdde9', '#aaeeff', '#ffffff'], function(color) { planr.selectedNode.setColor(color); }, 'background', {right: 140, top: 20});
	frame.addWidget(cp);
	
	var cpBor = new planr.ColorPicker(['#000000', '#808080', '#ffd42a', '#d4aa00', '#6ba50f', '#d45500', '#d40000', '#800000', '#8800aa', '#162d50', '#005580', '#0088cc', '#ffffff'], function(color) { planr.selectedNode.setBorderColor(color); }, 'border', {right: 100, top: 20});
	frame.addWidget(cpBor);
	
	var cpFon = new planr.ColorPicker(['#000000', '#808080', '#ffd42a', '#d4aa00', '#6ba50f', '#d45500', '#d40000', '#800000', '#8800aa', '#162d50', '#005580', '#0088cc', '#ffffff'], function(color) { planr.selectedNode.setTextColor(color); }, 'font', {right: 60, top: 20});
	frame.addWidget(cpFon);
	
	var zoom = new planr.Zoom(1, function() {}, 'h', {left: 20, bottom: 20});
	frame.addWidget(zoom);
	
	var cpCon = new planr.ColorPicker(['#000000', '#808080', '#ffd42a', '#d4aa00', '#6ba50f', '#d45500', '#d40000', '#800000', '#8800aa', '#162d50', '#005580', '#0088cc', '#ffffff'], function(color) { 
		if(planr.selectedNode != null) {
			$.each(planr.selectedNode.connectors, function(i, con) { 
				con.setColor(color); 
			});
		}
		
		if(planr.selectedConnector != null) {
			planr.selectedConnector.setColor(color); 
			planr.frame.canvas.breaker.setColor(color); 
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
planr.createUUID = function() {
  // http://www.ietf.org/rfc/rfc4122.txt
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

planr.generateId = function() {
	return planr.createUUID();
};

planr.setCaretPosition = function(elem, caretPos) {
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
planr.roundRect = function(ctx, x, y, width, height, radius, fill, stroke) {
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

planr.wrapText = function(context, text, x, y, maxWidth, lineHeight) {
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
