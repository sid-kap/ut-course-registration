var firstHour = 8*2;
var lastHour = 21*2 + 1;

var courseData;
var currentScheduleIndex;
var schedules;
var currentClasses = [];

$(function() {
	chrome.storage.local.get('courseData', function(items) {
		//print(items.courseData);

		courseData = parseDaysAndTimes(items.courseData);
		displayClassNames(courseData);

		schedules = makeSchedules(courseData);
		$('span#schedulesCount').text(schedules.length);
		showScheduleAtIndex(0);
		//displayAllListings(courseData);
		//$('body').append(JSON.stringify(courseData, null, '&nbsp;  ').replace(/\n/g, '<br>'));

	});

	document.querySelector('a#clear').addEventListener('click', clear);
	document.querySelector('button#go').addEventListener('click', recalculateSchedules);

	document.querySelector('a#prev').addEventListener('click', prev);
	document.querySelector('a#next').addEventListener('click', next);
});

function prev() {
	if (currentScheduleIndex === 0) {
		return;
	}
	showScheduleAtIndex(currentScheduleIndex - 1);
}

function next() {
	if (currentScheduleIndex === schedules.length - 1) {
		return;
	}

	showScheduleAtIndex(currentScheduleIndex + 1);
}

function showScheduleAtIndex(i) {
	var div = $('div#calendarPlaceholder');
	currentScheduleIndex = i;

	div.empty();
	div.append(drawSchedule(schedules[i]));
	$('span#currentScheduleIndex').text(currentScheduleIndex+1);
}

function displayClassNames (courseData) {
	var $table = $('table#chooseClasses').children(':first').children(':first');
	$.each(courseData, function(index, val) {
		currentClasses.push(index);

		var $td = $('<td class="course course-selected">' + val.name + '</td>');
		$td.click(function() {
			$(this).toggleClass('course-selected');

			if (_.contains(currentClasses, index)) {
				currentClasses = _.without(currentClasses, index);
			} else {
				currentClasses.push(index);
			}
		});

		var $a = $('<a class="remove"></a>');
		$a.click(function() {
			deleteClass(index);
			$(this).parent().remove();
		});

		$td.append($a);

		$table.append($td);
	});
}

function clear() {
	chrome.storage.local.remove('courseData');
}

function deleteClass(index) {
	var obj = {};

	delete courseData[index];
	obj.courseData = courseData;



	chrome.storage.local.set(obj, function() {
		console.log(index + 'class deleted');
	});

	currentClasses = _.without(currentClasses, index);
}

function recalculateSchedules() {

	var filteredCourseData = _.pick(courseData, currentClasses);
	
	schedules = makeSchedules(filteredCourseData);
	console.log(schedules.length);
	$('span#schedulesCount').text(schedules.length);
	showScheduleAtIndex(0);
}


function makeSchedules(courseData) {
	_.each(courseData, function(course, index) {
		course.data = _.filter(course.data, function(m) {
			switch (m.availability) {
				case 'cancelled': return false;
				case 'closed': 	  return false;
				default:          return true;
			}
		});
	});
	var makeMatches = function (acc, xs) {
		//console.log(acc.length);
		if (acc.length === 0) {
			return _.map(xs.data, function(x) {  return [x]; });
		} else {
			var branched = _.map(acc, function(match) {
				//console.log(JSON.stringify(match));
				return _.compact(_.map(xs.data, function(x) {
					var result;
					//console.log(x);

					if (!conflict(match, x)) {
						result = _.clone(match);
						result.push(x);
						return result;
					} else {
						return false;
					}

				}));
			});
			var result = _.flatten(branched, true);
			result = _.compact(result);
			//_.each(result, function(a){console.log(a)});
			return result;
		}
	};

	return _.foldl(courseData, makeMatches, []);
}

function conflict(xs, y) {
	return _.find(xs, function(x) {
		return _.find(x.daysAndTimes, function(xDayTime) {
			return _.find(y.daysAndTimes, function(yDayTime) {
				return (_.intersection(xDayTime.days, yDayTime.days).length && timesOverlap(xDayTime.times, yDayTime.times));
			});
		});
	});
}

function timesOverlap(x, y) {
	return (y[0] >= x[0] && y[0] < x[1]) || (x[0] >= y[0] && x[0] < y[1]);
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

	$calendar = newCalendar();

	_.each(schedule, function (courseTime) {
		//print(courseTime.daysAndTimes);
		_.each(courseTime.daysAndTimes, function(dayTime) {
			addTime(dayTime, $calendar, courseTime);
		})
	});

	return $calendar;
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


function addTime (obj, context, courseTime) {
	var rowspan;
	//print(obj);
	for (var i in obj.days) {
		var first = true;
		var hour = firstHour;
		var count = obj.times[1] - obj.times[0];

		$.each($('tbody', context).children(), function(index, val) {
			$td = $($(val).children()[obj.days[i] + 1]);

			if (hour >= obj.times[0] && hour < obj.times[1]) {
				$td.addClass('selected');
				if (first) {
					$td.html('<a target="_blank" href="https://utdirect.utexas.edu/registrar/nrclav/' + courseTime.link + '">' + courseTime.teacher + '</a>' + '<br>' + obj.time);
					first = false;
					$td.attr('rowspan', count);
				} else {
					$td.addClass('hide');
				}
			}

			hour++;
		});
	}
	
}

function parseDayTime (data) {
	var obj = {
		days: [], 
		times: [],
		day: data.day,
		time: data.time
	};
	
	// Parse the days
	obj.days = parseDays(data.day);

	// Parse the time
	obj.times = parseTimes(data.time);

	return obj;
}

function parseDays (str) {
	var days = [];

	// Parse the day of week
	while (str) {
		switch (str.substring(0,1)) {
			case 'M': 
				days.push(0); 
				str = str.substring(1);
				continue;
			case 'W': 
				days.push(2); 
				str = str.substring(1);
				continue;
			case 'F': 
				days.push(4); 
				str = str.substring(1);
				continue;
		}
		if (str.substring(0,2) === 'TH') {
			days.push(3);
			str = str.substring(2);
		} else if (str.substring(0,1) === 'T') {
			days.push(1);
			str = str.substring(1);
		} else {
			throw ('Day cannot be parsed: ' + str);
		}
	}

	return days;
}

function parseTimes (str) {
	var match = str.match(/(\d+) to (\d+)([ap])/),
		times = [];

	if (!match) {
		throw 'Time cannot be parsed: ' + time;
	}

	if (match[3] === 'a') {
		// Class must start and end in the morning
		times.push(toHundrethsTime(parseInt(match[1])) / 50);
		times.push(toHundrethsTime(parseInt(match[2])) / 50);
	} else {
		// match[2] must equal 'p'
		// Class ends in afternoon, but could start before or afternoon

		var first = toHundrethsTime(parseInt(match[1]));
		var last = toHundrethsTime(parseInt(match[2]));

		if (last >= 1200) {
			// ends at 1200p or 1230p
			times.push(first / 50);
			times.push(last  / 50);
		} else {
			// ends at 1pm or later
			first += 1200;
			last += 1200;
			if (first > last) {
				first -= 1200;
			}
			times.push(first / 50);
			times.push(last  / 50);
		}
	}

	return times;
}

function toHundrethsTime (time) {
	return Math.floor(time / 100) * 100 + ((time % 100) ? 50 : 0);
}



function print(obj) {
	console.log(JSON.stringify(obj));
}