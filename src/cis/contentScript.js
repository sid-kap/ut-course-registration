
var $ = jQuery;

$(function() {

	chrome.storage.sync.get('runScriptOnCisPage', function(items) {
		var justEnabledSetting = false;

		if ($.isEmptyObject(items)) {
			// First time using the extension
			// Let's enable it by default.
			chrome.storage.sync.set({'runScriptOnRegistrarPage': true}, function() {
				console.log('Run script on Registrar Page enabled by default.');
			});

			justEnabledSetting = true;
		}

		// Run the script only if the user has checked the box in the extension options,
		// or if the script has been enabled by default the first time this page was opened.
		if (items.runScriptOnCisPage || justEnabledSetting) {
			makeCharts();
		}
	});
});


function makeCharts () {
	$('tbody').each(function() {
		var rows,
		    tds,
		    $td, 
		    widths,
		    width,
		    labels = [],
		    floatWidth,
		    displayFloatWidth,
		    cssWidth,
		    text,
		    $tdChart,
		    i,
		    j,
		    cssIndex;

		rows = $(this).children();
		for (i = 0; i < rows.length; i++) {
			tds = $(rows[i]).children();
			widths = [];
			$tdChart = $(tds[1]);

			for (j = 1; j < 6; j++) {
				$td = $(tds[j]);

				if (i === 0) {
					labels.push($td.text());
				} else {
					widths.push($td.text());
				}

				if (j === 1) {
					$td.text('');
				} else {
					$td.remove();
				}
			}

			$tdChart.css('width', '20%');

			if (i != 0) {
				for (var j in widths) {

					// To display the correct background color of the bar
					// we must add one of these css classes: .chart-1, .chart-2, .chart-3, .chart-4 , .chart-5 
					cssIndex = parseInt(j)+1;
					width = widths[j];

					floatWidth = parseFloatFromPercentage(width);

					displayFloatWidth = 0.95 * floatWidth;

					// Shitty algorithm to make sure the table cell doesn't overflow
					// into two rows
					// if (displayFloatWidth > 30)
					// 	displayFloatWidth -= 2.5;

					cssWidth = displayFloatWidth.toFixed(2) + '%';

					text = '&nbsp';

					// Only display the number in the cell if it's big enough for 
					// the text to fit
					// (Arbitrarily chose 10% because it looks good in my browser)
					if (floatWidth > 10 /* percent */) {
						text = floatWidth.toFixed(0) + '%';
					}

					// Inner span for mouseover tooltip.
					$tdChart.append(
						'<span class="chart chart-' + cssIndex.toString() + 
						'" style="width: ' + cssWidth + ';">' + text + 
						'<span class="tooltip">' + floatWidth.toFixed(0) + '% ' + labels[j] + '</span></span>'
					);
				}
			}
			
		}

	});
}


/**
 * Parses a string in the format 'NUM (NUM%)' into 'NUM%'
 */
function parsePercentage (str) {
	//console.log(str);
	return str.match(/\d+ \((\d+\.\d+%)\)/)[1];
}

function parseFloatFromPercentage (str) {
	return parseFloat(parsePercentage(str));
}