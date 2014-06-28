
document.addEventListener('DOMContentLoaded', function() {
	chrome.storage.sync.get(['runScriptOnRegistrarPage', 'runScriptOnCisPage'], function(items) {
		document.getElementById('registrarCheckbox').checked = items['runScriptOnRegistrarPage'];
		document.getElementById('cisCheckbox').checked = items['runScriptOnCisPage'];
	});

	document.getElementById('registrarCheckbox').addEventListener('click', updatePrefs);
	document.getElementById('cisCheckbox').addEventListener('click', updatePrefs);
});

function updatePrefs() {
	var isRegistrarOptionChecked, isCisOptionChecked, settings;

	isRegistrarOptionChecked = document.getElementById('registrarCheckbox').checked;
	isCisOptionChecked = document.getElementById('cisCheckbox').checked;

	settings = {
		'runScriptOnRegistrarPage': isRegistrarOptionChecked, 
		'runScriptOnCisPage':       isCisOptionChecked
	};
	chrome.storage.sync.set(settings, function() {
		console.log('settings updated');
	});
}