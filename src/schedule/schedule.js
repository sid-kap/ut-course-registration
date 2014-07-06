var firstHour = 8*2;
var lastHour = 21*2 + 1;


$(function() {
	chrome.storage.sync.get('courseData', function(items) {
		print(items.courseData);

		var courseData = items.courseData;
		courseData = parseDaysAndTimes(courseData);
		displayClassNames(courseData);

		drawSchedules(makeSchedules(courseData));
		//displayAllListings(courseData);
		//$('body').append(JSON.stringify(courseData, null, '&nbsp;  ').replace(/\n/g, '<br>'));

	});

	document.querySelector('a#clear').addEventListener('click', clear);
});

function displayClassNames (courseData) {
	var $table = $('table#chooseClasses').children(':first').children(':first');
	$.each(courseData, function(index, val) {

		$table.append('<td>' + val.name + '</td>');
	});
}

function displayAllListings (courseData) {
	var $tbody = $('tbody#table');
	$.each(courseData, function(index, val) {

		$tbody.append('<tr><td colspan="6">'+ val.name + '</td></tr>');

		for (j in val.data) {
			$tr = $('<tr></tr>');
			for (k in val.data[j]) {
				$tr.append('<td>' + val.data[j][k] + '</td>');
			}
			$tbody.append($tr);
		}
	});
}

function clear() {
	chrome.storage.sync.remove('courseData');
}






function makeSchedules(courseData) {
	var makeMatches = function (acc, xs) {
		//console.log(acc.length);
		if (acc.length === 0) {
			return _.map(xs.data, function(x) {  return [x]; });
		} else {
			var branched = _.map(acc, function(match) {
				//console.log(JSON.stringify(match));
				return _.map(xs.data, function(x) {
					var result;
					//console.log(x);

					if (compatible(match, x)) {
						result = _.clone(match);
						result.push(x);
						return result;
					} else {
						return false;
					}

				});
			});
			var result = _.flatten(branched, true);
			//_.each(result, function(a){console.log(a)});
			return result;
		}
	};

	return _.foldl(courseData, makeMatches, []);
}

function compatible(xs, y) {
	_.each(xs, function(x) {
		_.each(x.daysAndTimes, function(xDayTime) {
			_.each(y.daysAndTimes, function(yDayTime) {
				if (xDayTime === yDayTime) {
					if (_.intersection(xDayTime.days, yDayTime.days)) {
						if (timesOverlap(xDayTime.times, yDayTime.times)) {
							return false;
						}
					}
				}
			});
		});
	});

	return true;
}

function timesOverlap(x, y) {
	return (y[0] > x[0] && y[0] < x[1]) || (x[0] > y[0] && x[0] < y[1]);
}


function parseDaysAndTimes(courseData) {
	$.each(courseData, function(i, course) {
		$.each(course.data, function (j, courseOption) {

			parseDaysAndTimesOfCourseOption(courseOption);

		});
	});

	return courseData;
}

function parseDaysAndTimesOfCourseOption(courseOption) {
	var k,
		daysAndTimes = [];

	// Assumption: elements in courseOption.days and courseOption.times correspond 1-to-1
	// (same number of elements in each array)
	for (k in courseOption.days) {
		daysAndTimes.push({
			day: courseOption.days[k],
			time: courseOption.times[k]
		});
	}

	courseOption.daysAndTimes = daysAndTimes.map(parseDayTime);
}


function drawSchedules(schedules) {
	_.each(schedules, drawSchedule);
}

function drawSchedule(schedule) {
	//print(schedule);

	$calendar = newCalendar();
	//console.log($calendar);

	//console.log(schedule.length);

	_.each(schedule, function (courseTime) {
		//print(courseTime.daysAndTimes);
		_.each(courseTime.daysAndTimes, function(dayTime) {
			addTime(dayTime, $calendar, courseTime.teacher);
		})
	});

	$('body').append($calendar);
}



function newCalendar() {

	var i,
		j,
		text,
		$row,
		hour12,
		hour24;

	var $calendar = $('<table class="calendar">' + 
		'<thead>' + 
			'<tr>' + 
				'<th></td>' + 
				'<th>Mon</th>' + 
				'<th>Tues</th>' + 
				'<th>Wed</th>' + 
				'<th>Thurs</th>' + 
				'<th>Fri</th>' + 
			'</tr>' + 
		'</thead>' + 
		'<tbody></tbody></table>');

	var $tbody = $calendar.find('tbody')[0];


	for (i = firstHour; i <= lastHour; i++) {

		text = '';
		$row = $('<tr></tr>');

		hour24 = Math.floor(i/2);

		hour12 = hour24 % 12;
		if (hour12 === 0) {
			hour12 = 12;
		}

		text += hour12 + ((i-2*hour24) ? ':30' : ':00') + ' ' +  (Math.floor(hour24 / 12) ? 'PM' : 'AM');
		$row.append('<td>' + text + '</td>');

		for (j = 0; j < 5; j++) {
			$row.append('<td></td>');
		}

		$calendar.append($row);
	}



	return $calendar;
}


function addTestTimes() {
	addTime(parseDayTime({day: 'TTH', time: '1100 to 1230p'}));
}


function addTime (obj, context, text) {
	//print(obj);
	for (var i in obj.days) {
		var first = true;
		var count = obj.times[1] - obj.times[0];
		for (var j = obj.times[0]; j < obj.times[1]; j++) {
			var row = $('tbody', context).children()[j - firstHour];
			var tds = $(row).children();
			var $td = $(tds[obj.days[i] + 1]);
			$td.addClass('selected');
			if (first) {
				$td.html(text + '<br>' + obj.time);
				first = false;
				$td.attr('rowspan', count);
			} else {
				$td.remove();
			}
		}
	}
	
}

function parseDayTime (data) {
	var obj = {
		days: [], 
		times: [],
		day: data.day,
		time: data.time
	};
	var day = data.day;

	// Parse the day of week
	while (day) {
		switch (day.substring(0,1)) {
			case 'M': 
				obj.days.push(0); 
				day = day.substring(1);
				continue;
			case 'W': 
				obj.days.push(2); 
				day = day.substring(1);
				continue;
			case 'F': 
				obj.days.push(4); 
				day = day.substring(1);
				continue;
		}
		if (day.substring(0,2) === 'TH') {
			obj.days.push(3);
			day = day.substring(2);
		} else if (day.substring(0,1) === 'T') {
			obj.days.push(1);
			day = day.substring(1);
		} else {
			throw ('Day cannot be parsed: ' + day);
		}
	}

	// Parse the time
	var time = data.time;
	var match = time.match(/(\d+) to (\d+)([ap])/);
	if (!match) {
		throw 'Time cannot be parsed: ' + time;
	}

	if (match[3] === 'a') {
		// Class must start and end in the morning
		obj.times.push(toHundrethsTime(parseInt(match[1])) / 50);
		obj.times.push(toHundrethsTime(parseInt(match[2])) / 50);
	} else {
		// match[2] must equal 'p'
		// Class ends in afternoon, but could start before or afternoon

		var first = toHundrethsTime(parseInt(match[1]));
		var last = toHundrethsTime(parseInt(match[2]));

		if (last >= 1200) {
			// ended before 1pm
			obj.times.push(first / 50);
			obj.times.push(last  / 50);
		} else {
			// ends at 1pm or later
			if (first < 1200) {
				first += 1200;
			}
			obj.times.push(first / 50);
			obj.times.push(last  / 50 + 24);
		}
	}

	return obj;
}

function toHundrethsTime (time) {
	return Math.floor(time / 100) * 100 + ((time % 100) ? 50 : 0);
}



function print(obj) {
	console.log(JSON.stringify(obj));
}