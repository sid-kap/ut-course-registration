
var $ = jQuery;
var concatRegistrarResults;
var doMakeInfoIcons;

$(function() {

	chrome.storage.sync.get(['concatRegistrarResults', 'showRegistrarInfoIcons'], function(items) {

		concatRegistrarResults = items.concatRegistrarResults;
		doMakeInfoIcons = items.showRegistrarInfoIcons;

		// Run the script only if the user has checked the box in the extension options
		if (items.concatRegistrarResults) {

			// Use setTimeout() instead of explicitly calling run() because
			// errors are formatted weirdly when errors 
			// happen inside of a chrome.storage.sync.get() callback

			// Concat the pages, and if user wants info icons to be made, make user icons.
			setTimeout(function() { run(items.showRegistrarInfoIcons); }, 0);

		} else if (items.showRegistrarInfoIcons) {
			// Only make info icons, do not concat pages.
			setTimeout(makeInfoIcons, 0);
		}

	});
});

/**
 * Concatenate the pages.
 * @param showInfoIcons whether to show the info icons after concatenating the pages.
 */
function run(showInfoIcons) {
	var $body = $('body');

	$body.append('<div id="hiddenPages" hidden></div>');

	loadMorePages($body);
}

function makeInfoIcons() {
	var $row,
		$a,
		$link,
		$rows = $('tr.tbon td span.em').parent().parent(),
		min,
		max;
	
	if (concatRegistrarResults) {
		min = 0;
		max = $rows.length - 1;
	} else {
		min = 1; 
		max = $rows.length - 2;
	}

	for (var i = min; i <= max; i++) {
		makeIcon($($rows[i]));
	}
}

function makeIcon($row) {
	$a = $row.parent().next().children(':first').children(':first').children(':first')
	$link = $('<a class="info"></a>');

	$row.prepend($link);
	$link.attr('data-href', $a.attr('href'));

	// Weird-looking way of making sure that $link's onclick method
	// calls showDescription with itself as the parameter.
	$link.click(
		function($$link) {  return function(){	showDescription($$link); }; }($link)
	);
}

function showDescription($link) {

	if ($link.attr('data-loaded')) {

		// Description has already been loaded.
		// Show/hide the description
		$link.next().toggle();

	} else {

		$.ajax({

			url: $link.attr('data-href'),

			success: function(data, textStatus, jqXHR) {
				var text = '',
					regex = /<p class="space">([\s\S]*?)<\/p>/g, 
					match;

				// Find all the matches in the received data
				while (match = regex.exec(data)) {
					text += match[1];
					text += '<br><br>';
				}

				$link.after('<div class="description">' + text + '</div>');
				$link.attr('data-loaded', true);
			},

			error: function(jqXHR, textStatus, errorThrown) { }

		});
	}
	
}

/**
 * Steps that must be taken after all the pages have been loaded.
 */
function finishUp() {

	// Get rid of the Previous Page/Next Page buttons
	$('div.otherClasses').parent().parent().parent().parent().parent().parent().remove();
	$('a.otherClasses').parent().parent().parent().remove();

	if (doMakeInfoIcons) {
		makeInfoIcons();
	}
}

function loadMorePages(body) {

	var form = body.find('#next_page');

	if (form.length === 0) {
		// This must be the last page.
		finishUp();
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
				
				// Do not load the scripts in the header
				// This reduces the number of web requests.
				data = data.replace(/<script([\s\S]*?)>[\s\S]*?<\/script>/g, '')
				
				console.log(data);

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
			error: function(jqXHR, textStatus, errorThrown) {	}
		});

		e.preventDefault(); //STOP default action
	}); 

	form.submit(); //Submit the form
	form.unbind();
}
