DATE_DELIMITER = "-";

date_expr = new RegExp(/[12][0-9]{3}\-[0-9]{2}\-[0-9]{2}$/);

popup_calendar.compareObj = "";
popup_calendar.compare = "";

popup_calendar.compareDate = function(compare_element) {
	popup_calendar.compareObj = compare_element;
}

popup_calendar.compareStatus = function(compare) {
	popup_calendar.compare	= compare;
}

popup_calendar.removePopupCalendar = function(obj) {
	$("body").unbind("click",popup_calendar.close);

	obj.parentNode.removeChild(obj);
	if (obj) {
		obj = null;
	}
	if (popup_calendar.clickObj) {
		popup_calendar.clickObj.focus;		
		popup_calendar.clickObj = null;
	}
}

popup_calendar.setDayToTextbox = function(year, month, date) {
	var setDate = year + DATE_DELIMITER + popup_calendar.getViewMonth(month) + DATE_DELIMITER + popup_calendar.getViewMonth(date);
	
	var fromDate, toDate; 
	var fromDateArr, toDateArr;
	
	if (this.compare == "to" && this.compareObj.value != '' && this.compareObj.value.length >= 8) {
		if (this.compareObj.value.indexOf(DATE_DELIMITER) != -1) {
			fromDateArr = (this.compareObj.value).split(DATE_DELIMITER);
			fromDate = new Date(fromDateArr[0], fromDateArr[1]-1, fromDateArr[2]) - 0;
			toDateArr = (setDate).split(DATE_DELIMITER);
			toDate = new Date(toDateArr[0], toDateArr[1]-1, toDateArr[2]) - 0;
		} else {
			fromDate = this.compareObj.value;
			toDate = year + '' + popup_calendar.getViewMonth(month) + '' + popup_calendar.getViewMonth(date);
		}
		
		if (fromDate > toDate) {
			//alert(enddate_input);			alert("fromDate > toDate !!! ");
			return;
		}
	} else if (this.compare == "from" && this.compareObj.value != '' && this.compareObj.value.length >= 8) {
		if (this.compareObj.value.indexOf(DATE_DELIMITER) != -1) {
			toDateArr = (this.compareObj.value).split(DATE_DELIMITER);
			toDate = new Date(toDateArr[0], toDateArr[1]-1, toDateArr[2]) - 0;
			fromDateArr = (setDate).split(DATE_DELIMITER);
			fromDate = new Date(fromDateArr[0], fromDateArr[1]-1, fromDateArr[2]) - 0;
		} else {
			toDate = this.compareObj.value;
			fromDate = year + '' + popup_calendar.getViewMonth(month) + '' + popup_calendar.getViewMonth(date);
		}
		
		if (fromDate > toDate) {			//modfiy by Kim Jin Il 
			//alert(startdate_input);			alert("fromDate > toDate");
			return;
		}
	}
	
	this.clickObj.value = setDate;
	popup_calendar.removePopupCalendar(document.getElementById('mcalendar_pop'));
}

popup_calendar.close = function (event) {
	if (event == null || event.target.name != "") {
		popup_calendar.removePopupCalendar(document.getElementById('mcalendar_pop'));
	}
}

function calendarDoubleIdOpen(setDateId, compareDateId, compareStatus) {
	var callObj = document.getElementById(setDateId);
	var compareObj = document.getElementById(compareDateId);

	popup_calendar.saveClickElement(callObj);
	popup_calendar.compareDate(compareObj);
	popup_calendar.compareStatus(compareStatus);
	
	$("body").bind("click",popup_calendar.close);
	popup_calendar.openCal();	
}

function calendarSingleIdOpen(setDateId) {
	var callObj = document.getElementById(setDateId);
	
	popup_calendar.saveClickElement(callObj);
	
	$("body").bind("click",popup_calendar.close);
	popup_calendar.openCal();	
}