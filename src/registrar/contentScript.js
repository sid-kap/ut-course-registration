var $ = jQuery

$(function() {

	chrome.storage.sync.get('runScriptOnRegistrarPage', function(items) {
		var justEnabledSetting = false;

		if ($.isEmptyObject(items)) {
			// First time using the extension
			// Let's enable it by default.
			chrome.storage.sync.set({'runScriptOnRegistrarPage': true}, function() {
				console.log('Run script on Registrar Page enabled by default.');
			});

			justEnabledSetting = true;
		}

		var $body;

		// Run the script only if the user has checked the box in the extension options,
		// or if the script has been enabled by default the first time this page was opened.
		if (items.runScriptOnRegistrarPage || justEnabledSetting) {

			$body = $('body');

			$body.append($('<div id="hiddenPages" hidden></div>'))
			loadMorePages($body);

			injectFontAwesome();
			makeInfoIcons();

		}
	});
});

function makeInfoIcons() {
	$('span.title').append('<i class="fa fa-camera-retro fa-3x"></i>');
}

function loadMorePages (body) {

	var form = body.find('#next_page');

	if (form.length === 0) {
		// This must be the last page.
		//console.log("Form not found on this page.");

		// Get rid of the Previous Page/Next Page buttons
		$('div.otherClasses').parent().parent().parent().parent().parent().parent().remove();
		$('a.otherClasses').parent().parent().parent().remove();
		return;
	}

	//Callback handler for form submit event
	form.submit(function(e) {

		var postData = $(this).serializeArray();
		var formURL = $(this).attr("action");

		var hiddenPages = $('#hiddenPages');

		// Empty out the hidden page div so that we can add the 
		// load the next page into it.
		hiddenPages.empty();

		$.ajax({
			url : formURL,
			type: "GET",
			data : postData,
			success: function(data, textStatus, jqXHR) {
				var table, rows, len, targetTable;
				
				// Put the background-loaded page into the hidden div
				hiddenPages.html(data);

				table = hiddenPages.find('#classList tbody');

				rows = table.children();
				len = rows.length;

				targetTable = $('body #classList');

				// Copy over rows from the table of classes from the hidden div
				$.each(rows, function(index, row) {
					// Do not copy the first and last row of each table
					// (we don't want the Previous page/Next page links)
					if (index != 0 && index < len-2) {
						targetTable.append(row);
						//console.log(row.innerText.replace(/\s{2,}/g, ' '));
					}
				});

				// Load more pages!
				setTimeout(function(){ loadMorePages(hiddenPages); }, 0);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				//if fails      
			}
		});

		e.preventDefault(); //STOP default action
	}); 

	form.submit(); //Submit the form
	form.unbind();
}
