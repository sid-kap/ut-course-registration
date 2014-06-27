var $ = jQuery

var counter = 0;

$(function() {
	$('body').append($('<div id="hiddenPages" hidden></div>'))
	loadMorePages($('body'));
});

function loadMorePages (body) {
	counter++;
	console.log(counter);

	var form = body.find('#next_page');

	if (form.length === 0) {
		console.log("Form not found on this page.");
		$('div.otherClasses').parent().parent().parent().parent().parent().parent().remove();
		$('a.otherClasses').parent().parent().parent().remove();
		return;
	}

	//Callback handler for form submit event
	form.submit(function(e) {
	 
		var postData = $(this).serializeArray();
		var formURL = $(this).attr("action");

		var hiddenPages = $('#hiddenPages');
		hiddenPages.empty();

		$.ajax({
			url : formURL,
			type: "GET",
			data : postData,
			success: function(data, textStatus, jqXHR) {
				//data: return data from server
				
				hiddenPages.html(data);

				var table = hiddenPages.find('#classList tbody');

				var rows = table.children();
				var len = rows.length;

				var targetTable = $('body #classList');
				console.log(targetTable);

				$.each(rows, function(index, value) {
					if (index != 0 && index < len-2) {
						console.log(value.innerText.replace(/\s{2,}/g, ' '));
						targetTable.append(value);
					}
				});
				console.log('inserting into dom');
				//console.log(hiddenPages);
				setTimeout(function(){ loadMorePages(hiddenPages); }, 0);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				//if fails      
			}
		});

		e.preventDefault(); //STOP default action
		//e.unbind(); //unbind. to stop multiple form submit.
	}); 

	form.submit(); //Submit the form
	form.unbind();
}
