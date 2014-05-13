var kmnframe;
var conn1;
$(document).ready(function($) {
	kmnode.run('container');
	$('.kmn-node, .kmn-linker-handle').mousedown(function(evt) {
		evt.stopPropagation();
	});
	
	$('#container .dragscroll-scroller').scrollLeft(1400).scrollTop(700);
	
	// load the saved document IDs
	function loadKeys() {
		var keys = Object.keys(localStorage);
		for(var i = 0; i < keys.length; i++) {
			var option = $('<option>').attr('value', keys[i]);
			option.html(keys[i]);
			if(keys[i] != 'kmn-document')
			$('#doclist').append(option);
		}
	}
	
	$('#savedoc').click(function(evt) {
		kmnode.frame.storage.saveLocal(kmnode.frame.canvas.document);
		loadKeys();
		console.log('document saved...');
	});
	
	$('#loaddoc').click(function(evt) {
		var docid = $('#doclist').val();
		var doc = localStorage.getItem(docid);
		console.log(doc);
		kmnode.frame.canvas.document.fromJSON(doc);
		kmnode.frame.canvas.render();
		console.log('document loaded...');
	});
	
	$('#cleardoc').click(function(evt) {
		kmnode.frame.canvas.element.click();
		kmnode.frame.canvas.clear();
		console.log('canvas cleared...');
	});
	
	$('#renderdoc').click(function(evt) {
		kmnode.frame.canvas.render();
		console.log('canvas re-rendered...');
	});
	
	$('#export').click(function(evt) {
		var url = kmnode.frame.canvas.toImage();
		
		window.open(url, 'PNG');
		
		console.log('graphics exported...');
	});
	
	$('#exportall').click(function(evt) {
		var url = kmnode.frame.canvas.toImage(true);
		
		window.open(url, 'PNG');
		
		console.log('canvas exported...');
	});
	
	loadKeys();
}(jQuery));