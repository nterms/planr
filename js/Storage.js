/*!
 * Storage.js
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
	planr.Storage = function() {
		this.init();
	};
	
	/**
	 * Initialize the storage
	 */
	planr.Storage.prototype.init = function() {
		
	};
	
	/**
	 * Save the current working document name in local storage
	 * 
	 * @param {planr.Document} The document object to be saved
	 */
	planr.Storage.prototype.setCurrentDocument = function(document) {
		localStorage.setItem('planr-document', document.id);
	};
	
	/**
	 * Save the document locally
	 * 
	 * @param {planr.Document} The document object to be saved
	 */
	planr.Storage.prototype.saveLocal = function(document) {
		localStorage.setItem(document.id, document.toString());
	};
	
	/**
	 * Returns the the document saved in local storage
	 * 
	 * @param {planr.Document} The document object to be fetched
	 */
	planr.Storage.prototype.getDocumentLocal = function(id) {
		return localStorage.getItem(id);
	};
	
	/**
	 * Clears the local storage
	 */
	planr.Storage.prototype.clearLocal = function(document) {
		localStorage.clear();
		this.setCurrentDocument(document);
	};
	
	/**
	 * Save the document remotely on a database
	 * 
	 * @param {planr.Document} The document object to be saved
	 */
	planr.Storage.prototype.saveRemote = function(document) {
		// TODO: code for saving the document remotely
	};
	
	/**
	 * Returns the the document saved in remote storage
	 * 
	 * @param {planr.Document} The document object to be fetched
	 */
	planr.Storage.prototype.getDocumentLocal = function(id) {
		// TODO: code for fetching the document from the local storage
	};

}(jQuery));
