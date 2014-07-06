
// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details) {
	var settings = ['concatRegistrarResults', 'showRegistrarInfoIcons', 'makeCisCharts'];

	chrome.storage.local.get(settings, function(items) {
		var setting;

		for (var i in settings) {
			setting = settings[i];
			if (!items.hasOwnProperty(setting)) {
				// Enable all settings that haven't been explicitly enabled or disabled before.
				chrome.storage.local.set({setting: true}, function() { });
			}
		}
	});

	chrome.tabs.create({
		url: chrome.extension.getURL('options.html')
	});

	// Stackoverflow copypasta: 

    // if(details.reason == "install"){
    //     console.log("This is a first install!");
    // } else if(details.reason == "update"){
    //     var thisVersion = chrome.runtime.getManifest().version;
    //     console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    // }
});