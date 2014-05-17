/*!
 * Document.js
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
	planr.Document = function(name) {
		this.id			= planr.generateId();
		this.name		= 'New Document';
		this.nodes 		= null;
		this.connectors = null;
		
		this.init(name);
	};
	
	/**
	 * Initialize the document
	 */
	planr.Document.prototype.init = function(name) {
		if(typeof name != 'undefined') {
			//this.name = name;
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
	 * Add an array of nodes to the list of nodes
	 * 
	 * @param {Array} Nodes to be added to the document
	 * @rerurn {Number} Number of nodes in the list
	 */
	planr.Document.prototype.addNodes = function(nodes) {
		var document = this;
		$.each(nodes, function(i, node){
			document.nodes.push(node);
		});
		return this.nodes.length;
	};
	
	/**
	 * Removes a node from the list of nodes
	 * 
	 * @param {planr.Node} Node to be removed from the document
	 * @rerurn {Number} Number of nodes in the list
	 */
	planr.Document.prototype.removeNode = function(node) {
		var document = this;
		var iNode = this.nodes.indexOf(node); // iNode = nodeIndex
		console.log(this.nodes);
		if(iNode > -1) {
		console.log(iNode);
			// remove all the connectors linked to this node
			$.each(node.connectors, function(i, conn) {
				var iConn = document.connectors.indexOf(conn);
				if(iConn > -1) {
					document.connectors.splice(iConn, 1);
				}
				conn.element.remove();
			});
			this.nodes.splice(iNode, 1);
		}
		
		// remove node element from canvas
		node.element.remove();
		
		// remove note element from canvas
		node.note.element.remove();

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
		// self connectors are not allowed
		if(nodeFrom == nodeTo) {
			return null;
		}
		
		// check if already connected
		var nfCons = nodeFrom.connectors; // list of connectors on first node
		var ntCons = nodeTo.connectors; // list of connectors on second node
		var connector = null;
		if(nfCons.length > 0 && ntCons.length > 0) {
			$.each(nfCons, function(i, conA) {
				$.each(ntCons, function(j, conB) {
					if(conA == conB) {
						connector = conA;
						return false; // if a connector is found, exit the each loop
					}
				});
				
				if(connector != null) {
					return false; // if a connector is found, exit the each loop
				}
			});
		}
		
		if(connector == null) {
			connector = new planr.Connector(nodeFrom, nodeTo);
			this.connectors.push(connector);
		}
		
		return connector;
	};
	
	/**
	 * Removes a connector from the list of connectors
	 * 
	 * @param {planr.Connector} Connector to be removed from the document
	 * @rerurn {Number} Number of connectors in the list
	 */
	planr.Document.prototype.removeConnector = function(connector) {
		// remove the connector from connected nodes
		var fConn = connector.nodeFrom.connectors.indexOf(connector);
		if(fConn > -1) {
			connector.nodeFrom.connectors.splice(fConn, 1);
		}
		
		var tConn = connector.nodeFrom.connectors.indexOf(connector);
		if(tConn > -1) {
			connector.nodeFrom.connectors.splice(tConn, 1);
		}
		
		var dConn = this.connectors.indexOf(connector);
		if(dConn > -1) {
			this.connectors.splice(dConn, 1);
		}
		
		return this.connectors.length;
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
	
	/**
	 * Converts the document to a JSON string
	 * 
	 * @returns {String} JSON string of the document
	 */
	planr.Document.prototype.toString = function() {
		var nodes = new Array();
		var connectors = new Array();
		// convert the nodes
		$.each(this.nodes, function(i, node) {
			nodes[i] = node.toString();
		});
		
		// convert the connectors
		$.each(this.connectors, function(i, connector) {
			connectors[i] = connector.toString();
		});
		
		var json = '{"id": "' + this.id + '","name": "' + this.name + '","nodes":[' + nodes.join() + '],"connectors":[' + connectors.join() + ']}';
		
		return json;
	};
	
	/**
	 * Converts a document in JSON object/string fromat to document object
	 * 
	 * @param {String} JSON object/string of the document
	 */
	planr.Document.prototype.fromJSON = function(json) {
		var doc = (typeof json == 'string') ? eval("(" + json + ")") : json;
		var document = this;
		
		// clear the nodes and connectors arrays
		this.nodes.length = 0;
		this.connectors.length = 0;
		
		this.id = doc.id;
		this.name = doc.name;
		
		$.each(doc.nodes, function(ni, n) {
			var node = new planr.Node();
			node.fromJSON(n);
			document.addNode(node);
		});
		
		$.each(doc.connectors, function(ci, c) {
			// find nodes of the connector
			var nf = null, nt = null;
			$.each(document.nodes, function(ni, n) {
				if(c.nodeFromId == n.id) {
					nf = n;
				}
				
				if(c.nodeToId == n.id) {
					nt = n;
				}
				
				if(nf != null && nt != null) { return false } // exit if both nodes are found
			});
			
			if(nf != null && nt != null) {
				var conn = new planr.Connector(nf, nt);
				conn.fromJSON(c);
				document.connectors.push(conn);
			}
		});
	};

}(jQuery));
