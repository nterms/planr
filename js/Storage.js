/*!
 * Storage.js
 *
 * KM NODE - Node Style Data Visualizing Platform
 * 
 * Copyright 2013, Kraken Media Pte. Ltd, http://www.kraken-media.com
 * Author: Saranga Abeykoon <saranga.abeykoon@kraken-media.com>
 *
 */
 
if(typeof kmnode == 'undefined') { kmnode = {}; }

(function($) {
	kmnode.Storage = function() {
		this.init();
	};
	
	/**
	 * Initialize the storage
	 */
	kmnode.Storage.prototype.init = function() {
		
	};
	
	/**
	 * Save the current working document name in local storage
	 * 
	 * @param {kmnode.Document} The document object to be saved
	 */
	kmnode.Storage.prototype.setCurrentDocument = function(document) {
		localStorage.setItem('kmn-document', document.id);
	};
	
	/**
	 * Save the document locally
	 * 
	 * @param {kmnode.Document} The document object to be saved
	 */
	kmnode.Storage.prototype.saveLocal = function(document) {
		localStorage.setItem(document.id, document.toString());
	};
	
	/**
	 * Returns the the document saved in local storage
	 * 
	 * @param {kmnode.Document} The document object to be fetched
	 */
	kmnode.Storage.prototype.getDocumentLocal = function(id) {
		return localStorage.getItem(id);
	};
	
	/**
	 * Clears the local storage
	 */
	kmnode.Storage.prototype.clearLocal = function(document) {
		localStorage.clear();
		this.setCurrentDocument(document);
	};
	
	/**
	 * Save the document remotely on a database
	 * 
	 * @param {kmnode.Document} The document object to be saved
	 */
	kmnode.Storage.prototype.saveRemote = function(document) {
		// TODO: code for saving the document remotely
	};
	
	/**
	 * Returns the the document saved in remote storage
	 * 
	 * @param {kmnode.Document} The document object to be fetched
	 */
	kmnode.Storage.prototype.getDocumentLocal = function(id) {
		// TODO: code for fetching the document from the local storage
	};

}(jQuery));