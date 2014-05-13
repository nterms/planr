/*!
 * Document.js
 *
 * KM NODE - Node Style Data Visualizing Platform
 * 
 * Copyright 2013, Kraken Media Pte. Ltd, http://www.kraken-media.com
 * Author: Saranga Abeykoon <saranga.abeykoon@kraken-media.com>
 *
 */
 
if(typeof kmnode == 'undefined') { kmnode = {}; }

(function($) {
	kmnode.Event = function() {
		this.name		= 'New Document';
		this.nodes 		= null;
		this.connectors = null;
		
		this.init(name);
	};
	
	/**
	 * Initialize the document
	 */
	kmnode.Document.prototype.init = function(name) {
		if(typeof name == 'undefined') {
			this.name = name;
		}
		
		this.nodes 		= new Array();
		this.connectors = new Array();
	};
	
	/**
	 * Add a node to the list of nodes
	 * 
	 * @param {kmnode.Node} Node to be added to the document
	 * @rerurn {Number} Number of nodes in the list
	 */
	kmnode.Document.prototype.addNode = function(node) {
		this.nodes.push(node);
		return this.nodes.length;
	};
	
	/**
	 * Add a connector between two nodes
	 * 
	 * @param {kmnode.Node} Starting node
	 * @param {kmnode.Node} Ending node
	 * @rerurn {Number} Number of connectors in the list
	 */
	kmnode.Document.prototype.addConnector = function(nodeFrom, nodeTo) {
		var connector = new kmnode.Connector(nodeFrom, nodeTo);
		this.connectors.push(connector);
		return connector;
	};
	
	/**
	 * Returns the list of nodes
	 * 
	 * @returns {Array} List of nodes in the document
	 */
	kmnode.Document.prototype.getNodes = function() {
		return this.nodes;
	};
	
	/**
	 * Returns the list of connectors
	 * 
	 * @returns {Array} List of connectors in the document
	 */
	kmnode.Document.prototype.getConnectors = function() {
		return this.connectors;
	};

}(jQuery));