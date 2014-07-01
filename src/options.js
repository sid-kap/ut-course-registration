
document.addEventListener('DOMContentLoaded', function() {
	chrome.storage.sync.get(['runScriptOnRegistrarPage', 'runScriptOnCisPage'], function(items) {

		if (items.hasOwnProperty('runScriptOnRegistrarPage')) {
			document.getElementById('registrarCheckbox').checked = items['runScriptOnRegistrarPage'];
		} else {
			// On first run of application, turn features on by default.
			document.getElementById('registrarCheckbox').checked = true;
		}

		if (items.hasOwnProperty('runScriptOnCisPage')) {
			document.getElementById('cisCheckbox').checked = items['runScriptOnCisPage'];
		} else {
			// On first run of application, turn features on by default.
			document.getElementById('cisCheckbox').checked = true;
		}
		
		// We may have just checked the checkboxes by default on the first run.
		// Update preferences here just to make sure that this change is saved.
		updatePrefs();
	});

	document.getElementById('registrarCheckbox').addEventListener('change', updatePrefs);
	document.getElementById('cisCheckbox').addEventListener('change', updatePrefs);
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