var planrframe;
var conn1;
$(document).ready(function($) {
	planr.run('container');
	$('.planr-node, .planr-linker-handle').mousedown(function(evt) {
		evt.stopPropagation();
	});
	
	$('#container .dragscroll-scroller').scrollLeft(1400).scrollTop(700);
	
	// load the saved document IDs
	function loadKeys() {
		var keys = Object.keys(localStorage);
		for(var i = 0; i < keys.length; i++) {
			var option = $('<option>').attr('value', keys[i]);
			option.html(keys[i]);
			if(keys[i] != 'planr-document')
			$('#doclist').append(option);
		}
	}
	
	$('#savedoc').click(function(evt) {
		planr.frame.storage.saveLocal(planr.frame.canvas.document);
		loadKeys();
		console.log('document saved...');
	});
	
	$('#loaddoc').click(function(evt) {
		var docid = $('#doclist').val();
		var doc = localStorage.getItem(docid);
		console.log(doc);
		planr.frame.canvas.document.fromJSON(doc);
		planr.frame.canvas.render();
		console.log('document loaded...');
	});
	
	$('#cleardoc').click(function(evt) {
		planr.frame.canvas.element.click();
		planr.frame.canvas.clear();
		console.log('canvas cleared...');
	});
	
	$('#renderdoc').click(function(evt) {
		planr.frame.canvas.render();
		console.log('canvas re-rendered...');
	});
	
	$('#export').click(function(evt) {
		var url = planr.frame.canvas.toImage();
		
		window.open(url, 'PNG');
		
		console.log('graphics exported...');
	});
	
	$('#exportall').click(function(evt) {
		var url = planr.frame.canvas.toImage(true);
		
		window.open(url, 'PNG');
		
		console.log('canvas exported...');
	});
	
	loadKeys();
}(jQuery));
