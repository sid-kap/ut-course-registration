$(function() {
	chrome.storage.sync.get('courseData', function(items) {
		var i,
			j,
			k,
			$tbody = $('tbody#table'),
			courseData = items.courseData,
			listing;

		//$('body').append(JSON.stringify(courseData, null, '&nbsp;  ').replace(/\n/g, '<br>'));
		for (i in courseData) {
			listing = courseData[i];

			console.log(listing);

			$tbody.append('<tr><td colspan="6">'+ listing.name + '</td></tr>');
			

			for (j in listing.data) {

				$tr = $('<tr></tr>');
				for (k in listing.data[j]) {
					$tr.append('<td>' + listing.data[j][k] + '</td>');
				}
				$tbody.append($tr);
			}
			
		}
	});

	document.querySelector('a#clear').addEventListener('click', clear);
});



function clear() {
	chrome.storage.sync.remove('courseData');
}