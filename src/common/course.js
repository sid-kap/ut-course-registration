
function Course(name) {
	this.name = name;
	this.courseTimes = [];
}

Course.prototype.addCourseTime = function(courseTime) {
	this.courseTimes.push(courseTime);
}




function CourseTime(link, days, times, teacher, availability) {
	this.link = link;
	this.days = days;
	this.times = times;
	this.teacher = teacher;
	this.availability = availability;
}