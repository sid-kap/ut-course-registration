
var $ = jQuery;
var concatRegistrarResults;
var doMakeInfoIcons;

$(function() {

	chrome.storage.local.get(['concatRegistrarResults', 'showRegistrarInfoIcons'], function(items) {

		concatRegistrarResults = items.concatRegistrarResults;
		doMakeInfoIcons = items.showRegistrarInfoIcons;

		// Run the script only if the user has checked the box in the extension options
		if (items.concatRegistrarResults) {

			// Use setTimeout() instead of explicitly calling run() because
			// errors are formatted weirdly when errors
			// happen inside of a chrome.storage.local.get() callback

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
    $('select#fos_fl').select2();

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
		$row = $($rows[i]);
		makeIcon($row);
		makeCheckIcon($row);
	}
}

function makeIcon($row) {
	var $a = $row.parent().next().children(':first').children(':first').children(':first'),
		$link = $('<a class="info"></a>');

	$row.prepend($link);
	$link.attr('data-href', $a.attr('href'));

	// Weird-looking way of making sure that $link's onclick method
	// calls showDescription with itself as the parameter.
	$link.click(
		function($$link) {  return function(){	showDescription($$link); }; }($link)
	);
}

function makeCheckIcon($row) {
	var $courseTimes = $row.parent().nextUntil('tr.tbon'),
		$a = $row.parent().next().children(':first').children(':first').children(':first'),
		$link = $('<a class="checkbox"></a>'),
		i,
		options = [],
		obj,
		name = $row.text().replace(/\s+/g, ' ').trim();


	$row.append($link);
	$link.data('href', $a.attr('href'));

	$.each($courseTimes, function(index, value) {
		$courseTime = $(value);
		$children = $courseTime.children();

		obj = {};
		$children.each(function(index, val) {
			var $this = $(this);

			switch (index) {
				case 0:
					obj.link = $this.children(':first').children(':first').attr('href');
					break;
				case 1:
					obj.days = splitAndTrimLines($this.children(':first').html());
					break;
				case 2:
					obj.times = splitAndTrimLines($this.children(':first').html());
					break;
				case 3:
					obj.rooms = splitAndTrimLines($this.children(':first').html());
					break;
				case 4:
					obj.teacher = $this.text().trim();
					break;
				case 5:
					obj.availability = $this.text().trim();
					break;
			}

		});

		options.push(obj);
	});

	$link.data('options', options);

	// Weird-looking way of making sure that $link's onclick method
	// calls showDescription with itself as the parameter.
	$link.click(
		function($$link) {
			return function(){
				$$link.toggleClass('checkbox-selected');
				toggleOptions($$link.data('options'), name);
			};
		}($link)
	);

	chrome.storage.local.get('courseData', function(items) {
		if (items.courseData && items.courseData[$link.data('href')]) {
			$link.addClass('checkbox-selected');
		}
	});
}

function splitAndTrimLines (str) {
	var arr = str.split('<br>');
	arr = arr.map(function(s){return s.replace(/(\s|&nbsp;)+/g, ' ').trim(); });
	return arr;
}

function toggleOptions(data, name) {
	//console.log(JSON.stringify(data));
	chrome.storage.local.get('courseData', function(items) {
		var key = data[0].link,
			courses = items.courseData,
			obj = {};

		console.log(courses);

		if (!courses) {
			courses = {};
		}
		if (courses[key]) {
			delete courses[key];

		} else {
			courses[key] = {name: name, data:data};
		}

		obj.courseData = courses;
		console.log(obj.courseData);

		chrome.storage.local.set(obj, function() {
			console.log('Changes stored!');
			if (chrome.extension.lastError) {
				console.log('An error occurred: ' + chrome.extension.lastError.message);
			}
			chrome.storage.local.get('courseData', function(result) {

			});
		});

		// console.log(JSON.stringify(courses));



	});
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

    $('a#next_nav_link').remove();

	if (doMakeInfoIcons) {
		makeInfoIcons();
	}

}

function loadMorePages(body) {

	var nextPageLink = body.find('a#next_nav_link');

	if (nextPageLink.length === 0) {
		// This must be the last page.
		finishUp();
		return;
	}

    var hiddenPages = $('#hiddenPages');
    var url = nextPageLink.first().attr('href');
    console.log(url);

    // Empty out the hidden page div so that we can add the
    // load the next page into it.
    hiddenPages.empty();

    $.ajax({
        url : url,
        type: "GET",
        success: function(data, textStatus, jqXHR) {
            var table, rows, len, targetTable;

            // Do not load the scripts in the header
            // This reduces the number of web requests.
            data = data.replace(/<script([\s\S]*?)>[\s\S]*?<\/script>/g, '')

            //console.log(data);

            // Put the background-loaded page into the hidden div
            hiddenPages.html(data);

            table = hiddenPages.find('table.rwd-table tbody');

            rows = table.children();
            len = rows.length;

            targetTable = $('body table.rwd-table');

            // Copy over rows from the table of classes from the hidden div
            $.each(rows, function(index, row) {
                // Do not copy the first and last row of each table
                // (we don't want the Previous page/Next page links)
                if (index >= 0 && index < len) {
                    targetTable.append(row);
                    //console.log(row.innerText.replace(/\s{2,}/g, ' '));
                }
            });

            // Load more pages!
            setTimeout(function(){ loadMorePages(hiddenPages); }, 0);
        },
        error: function(jqXHR, textStatus, errorThrown) {	}
    });
}
