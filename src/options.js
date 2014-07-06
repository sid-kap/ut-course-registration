
document.addEventListener('DOMContentLoaded', function() {
	chrome.storage.local.get(['concatRegistrarResults', 'showRegistrarInfoIcons', 'makeCisCharts'], function(items) {

		document.getElementById('concatCheckbox').checked = items['concatRegistrarResults'];
		document.getElementById('infoIconsCheckbox').checked = items['showRegistrarInfoIcons'];
		document.getElementById('cisCheckbox').checked = items['makeCisCharts'];

	});

	document.getElementById('concatCheckbox').addEventListener('change', updatePrefs);
	document.getElementById('infoIconsCheckbox').addEventListener('change', updatePrefs);
	document.getElementById('cisCheckbox').addEventListener('change', updatePrefs);
});

function updatePrefs() {
	var isConcatOptionChecked = document.getElementById('concatCheckbox').checked,
		isInfoIconsOptionChecked = document.getElementById('infoIconsCheckbox').checked,
		isCisChartsOptionChecked = document.getElementById('cisCheckbox').checked,
		settings = {
			'concatRegistrarResults': isConcatOptionChecked, 
			'showRegistrarInfoIcons': isInfoIconsOptionChecked,
			'makeCisCharts':         isCisChartsOptionChecked
		};

	chrome.storage.local.set(settings, function() {
		console.log('settings updated');
	});
}