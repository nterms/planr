/*!
 * Event.js
 *
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
	planr.Event = function() {
		this.name		= 'New Document';
		this.nodes 		= null;
		this.connectors = null;
		
		this.init(name);
	};
	
	/**
	 * Initialize the document
	 */
	planr.Document.prototype.init = function(name) {
		if(typeof name == 'undefined') {
			this.name = name;
		}
		
		this.nodes 		= new Array();
		this.connectors = new Array();
	};
	
	/**
	 * Add a node to the list of nodes
	 * 
	 * @param {planr.Node} Node to be added to the document
	 * @rerurn {Number} Number of nodes in the list
	 */
	planr.Document.prototype.addNode = function(node) {
		this.nodes.push(node);
		return this.nodes.length;
	};
	
	/**
	 * Add a connector between two nodes
	 * 
	 * @param {planr.Node} Starting node
	 * @param {planr.Node} Ending node
	 * @rerurn {Number} Number of connectors in the list
	 */
	planr.Document.prototype.addConnector = function(nodeFrom, nodeTo) {
		var connector = new planr.Connector(nodeFrom, nodeTo);
		this.connectors.push(connector);
		return connector;
	};
	
	/**
	 * Returns the list of nodes
	 * 
	 * @returns {Array} List of nodes in the document
	 */
	planr.Document.prototype.getNodes = function() {
		return this.nodes;
	};
	
	/**
	 * Returns the list of connectors
	 * 
	 * @returns {Array} List of connectors in the document
	 */
	planr.Document.prototype.getConnectors = function() {
		return this.connectors;
	};

}(jQuery));
