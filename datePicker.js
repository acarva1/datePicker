var mockVenArray = [
	{
		"name": "Elephant Room",
		"shortname": "elephant",
		"address": "315 Congress Ave.",
		"citySt": "Austin, TX",
		"website": "http://www.elephantroom.com",
		"bg": "elephant.gif"
	},
	{
		"name": "III Forks",
		"shortname": "iiiforks",
		"address": "111 Lavaca St.",
		"citySt": "Austin, TX",
		"website": "https://www.3forks.com/austin",
		"bg": "iiiforks.jpg"
	},
	{
		"name": "ZACH Theatre",
		"shortname": "zach",
		"address": "202 S. Lamar Blvd.",
		"citySt": "Austin, TX",
		"website": "http://zachtheatre.org",
		"bg": "zach.jpg"
	}
];

var tables = {
	"year": document.getElementById("yearTable"),
	"month": document.getElementById("monthTable"),
	"day": document.getElementById("dayTable"),
	"startHour": document.getElementById("startHourTable"),
	"startMin": document.getElementById("startMinTable"),
	"startPeriod": document.getElementById("startPeriodTable"),
	"duration": document.getElementById("durationTable")
};

var display = {
	"date": document.getElementById("dateDisplay"),
	"time": document.getElementById("timeDisplay"),
	"duration": document.getElementById("durationDisplay")
};

var today = new Date();

var date = {
	"year": today.getFullYear(),
	"month": today.getMonth(),
	"day": today.getDate(),
	"startHour": today.getHours(),
	"startMin": today.getMinutes(),
	"startPeriod": today.getHours() < 12 ? "a.m." : "p.m.",
	"duration": 1,
	"unix": today.getTime(),
	"fullDate": today
};

var colors = {
	"background": "transparent",
	"selected": "#9ac",
	"borders": "thin solid rgba(200,200,200,0.5)"
};

var buttons = {
	"selectToday": document.getElementById("selectTodayButton")
}

buttons.selectToday.addEventListener("click", function(){
	selectToday(date, tables);
}, false);

selectToday(date, tables);

window.addEventListener("click", function(e){
	var oMonth = date.month;	// grab the initial month and year, before handling, to see if
	var oYear = date.year;		// it is necessary to reflow the day calendar

	var target;
	if (e.target.getAttribute("data-ignoreCell") === "true") { return false; }	// this accounts for the dummy cell in the first part of an adjusted calendar
	// select the correct target element; the one containing the data we need to store in the date object
	if (e.target.tagName === "TD") { target = e.target; }	// if the target is already an appropriate data cell, use it
	else if (e.target.parentNode.tagName === "TD") { target = e.target.parentNode; }	// if the target's parent is a data cell, select that (accounts for clicking/tapping text nodes)
	else if (e.target.tagName === "BUTTON") { // if the target is a button, check if it's a forward or back button
		if (e.target.className === "anchored forwardButton") {
			switchElements(e.target.parentNode.id, e.target.parentNode.nextSibling.nextSibling.id);
			return true;
		}
		else if (e.target.className === "anchored backButton") {
			switchElements(e.target.parentNode.id, e.target.parentNode.previousSibling.previousSibling.id);
			return true;
		}
	}
	else { return false; }
	var parent = target.parentNode.parentNode.parentNode;	// set the parent node; all the targets are tds, nested in tr's, nested in tbody's

	// check if the target's textContent is a number or a string; if it's a string, parseFloat will return NaN, so we can use the string (accounts for a.m./p.m.); otherwise, just use the element's text content
	var targetData = isNaN(parseFloat(target.textContent)) ? target.textContent : parseFloat(target.textContent);
	date[parent.id.slice(0, -5)] = targetData;	// automatically set the appropriate date object property to the targetData just obtained

	// only the month attribute neets special handling (adjusted for 0-based months)
	if (parent === tables.month) { date.month = targetData = parseInt(target.getAttribute("data-month")); }
	else if (!target) { return false; }

	// always check if the date should be using AM or PM based on the current hour in the date object
	if (date.startPeriod === "a.m." && date.startHour >= 12) { date.startHour = date.startHour - 12; }
	else if (date.startPeriod === "p.m." && date.startHour < 12) { date.startHour = date.startHour + 12; }

	// create a date string out of all the new date object information
	var dateString = new Date(date.year,
					 		  date.month,
					 		  date.day,
					 		  date.startHour,
					 		  date.startMin);
	date.fullDate = dateString;		// set the date object's complete date property to dateString
	date.unix = date.fullDate.getTime();
	
	// if the month or year changes, adjust the day table to match
	adjustCal(oMonth,oYear,date);
	setInfoDisplay(date);
	selectDate(date, tables);
}, false);

function adjustCal(oMonth,oYear,dateObj) {
	if (oMonth !== date.month || oYear !== date.year) {
		var dayOffset = new Date(date.year, date.month, 1).getDay();	// get the day of the week to start on
		var daysInMonth = new Date(date.year, date.month + 1, 0).getDate();		// calc the number of days in the month

		var dayCells = tables.day.querySelectorAll(".dayTableClass td");

		for (var i = 0; i < dayCells.length; i++) {
			if (i < dayOffset || i >= daysInMonth + dayOffset) {
				dayCells[i].className = "unavailable";
				dayCells[i].textContent = "";
				dayCells[i].setAttribute("data-ignoreCell", "true");
			}
			else {
				dayCells[i].className = "available";
				dayCells[i].textContent = i + 1 - dayOffset;
				dayCells[i].setAttribute("data-ignoreCell", "false");
			}
		}
	}

	return dateObj;
}

function checkSelectNext(parent, currentSelection) {	
	if (!currentSelection) { currentSelection = parent.parentNode.id; }
		var selection = document.getElementById(currentSelection);

	if (parent == selection.children[selection.children.length - 1]) { 
		switchElements(currentSelection, selection.nextSibling.nextSibling.id);
		currentSelection = selection.nextSibling.nextSibling.id;
	}
	return currentSelection;
}

function selectPrev(currentSelection) {
	console.log()
	if (!currentSelection) { currentSelection = parent.parentNode.id; }
	var selection = document.getElementById(currentSelection);

	switchElements(currentSelection, selection.previousSibling.previousSibling.id);
}

function switchElements(hideId, showId) {
	var hideEl = document.getElementById(hideId);
	var showEl = document.getElementById(showId);

	hideEl.style.display = "none";	// hide hideEl
	hideEl.className = "";			// change hideEl's back to the empty string
	showEl.style.display = "block";	// set showEl's display property back to block
	showEl.className = "fadeIn";	// change showEl's class to fadeIn, which features an animation that fades in
}

function reformatDate(type, str) {
	if (type === "month") {
		switch (str) {
			case 0: return "Jan.";
			case 1: return "Feb.";
			case 2: return "Mar.";
			case 3: return "Apr.";
			case 4: return "May";
			case 5: return "June";
			case 6: return "July";
			case 7: return "Aug.";
			case 8: return "Sept.";
			case 9: return "Oct.";
			case 10: return "Nov.";
			case 11: return "Dec.";
			default: return "Unable to return month";
		};
	}
	else if (type === "day") {
		switch (str) {
			case 0: return "Sun.";
			case 1: return "Mon.";
			case 2: return "Tues.";
			case 3: return "Wed.";
			case 4: return "Thurs.";
			case 5: return "Fri.";
			case 6: return "Sat.";
			default: return "Unable to return day";
		}
	}
	else if (type === "lz") {
		if (str.toString().length === 1) { return "0" + str; }
		else { return str; }
	}
	else if (type === "hr") {
		str = parseInt(str);
		if (str > 12) { return str - 12; }
		else if (str === 0) { return 12; }
		else { return str; }
	}
	else { return "Invalid type request (please use \"month\", \"day\", or \"lz\")"; }
}

function setInfoDisplay(dateObj) {
	// this function displays the user's currently selected date
	display.date.textContent = reformatDate("day", dateObj.fullDate.getDay()) + " " + 
							   reformatDate("month", dateObj.month) + " " + 
							   dateObj.day + ", " + 
							   dateObj.year;
	display.time.textContent = reformatDate("hr", dateObj.startHour) + ":" + reformatDate("lz", dateObj.startMin) + " " + dateObj.startPeriod
	display.duration.textContent = date.duration + " hrs.";
}

function selectDate(dateObj, tableObj) {
	var checkRowSet = undefined;
	var rowChildren = undefined;
	var currentChild = undefined;
	for (el in tableObj) {
		checkRowSet = tableObj[el].children[0].children;
		for (var i = 0; i < checkRowSet.length; i++) {
			rowChildren = checkRowSet[i].children;
			for (var j = 0; j < rowChildren.length; j++) {
				currentChild = rowChildren[j];
				if ((el === "month" && (currentChild.getAttribute("data-month") == date.month)) || 
					(el === "startHour" && (currentChild.textContent == date[el] || 
											parseInt(currentChild.textContent) == date[el] - 12 || 
											parseInt(currentChild.textContent) == 12 && date[el] === 0)) ||
					(currentChild.textContent == date[el])) { 
					currentChild.style.backgroundColor = colors.selected;
				}
				else {
					currentChild.style.backgroundColor = colors.background;	
				}
			}
		}
	}
}

function selectToday(dateObj, tableObj){
	date.year = today.getFullYear();
	date.month = today.getMonth();
	date.day = today.getDate();
	date.startHour = today.getHours();
	date.startMin = today.getMinutes();
	date.startPeriod = today.getHours() < 12 ? "a.m." : "p.m.";
	date.unix = today.getTime();
	date.fullDate = today;

	adjustCal(0,0,dateObj);
	setInfoDisplay(dateObj);
	selectDate(dateObj, tableObj);
}

function populateVenues() {

}