var DATE_DELIMITER = ".";
var PIXEL_DELIMITER = "px";

var locale = getCookie("GWLANG");

if(locale == "ko_KR"){
	var top_sunday = "\uc77c";
	var top_monday = "\uc6d4";
	var top_tuesday = "\ud654";
	var top_wednesday = "\uc218";
	var top_thursday = "\ubaa9";
	var top_friday = "\uae08";
	var top_saturday = "\ud1a0";
} else if(locale == "ja_JP"){
	var top_sunday = "\u65e5";
	var top_monday = "\u6708";
	var top_tuesday = "\u706b";
	var top_wednesday = "\u6c34";
	var top_thursday = "\u6728";
	var top_friday = "\u91d1";
	var top_saturday = "\u571f";
} else{
	var top_sunday = "Sun";
	var top_monday = "Mon";
	var top_tuesday = "Tue";
	var top_wednesday = "Wed";
	var top_thursday = "Thu";
	var top_friday = "Fri";
	var top_saturday = "Sat";
}

var close_string = "\ub2eb\uae30";
var calendar_calendar = "\ub2ec\ub825";

var calendar_backward_month = "\uc774\uc804 \ub2ec";
var calendar_forward_month = "\ub2e4\uc74c \ub2ec";

var date_expr = new RegExp(/[12][0-9]{3}\.[0-9]{2}\.[0-9]{2}$/);

var dateutil = new Object();

dateutil.dayArray = new Array(top_sunday, top_monday, top_tuesday, top_wednesday, top_thursday, top_friday, top_saturday);

/* check weekend */
dateutil.checkSunSat = function(index) {
	if (index==0)
		return "sun";
	else if(index==6)
		return "sat";
	else
		return "";
}

var popup_calendar = new Object();

popup_calendar.POPUP_CALENDAR_TR = "popup_calendar_tr_";
popup_calendar.POPUP_CALENDAR_CELL = "popup_calendar_cell_";
popup_calendar.clickObj = "";
popup_calendar.startObj = "";
popup_calendar.endObj = "";
popup_calendar.selectDate = new Date(); 

popup_calendar.saveClickElement = function(click_element) {
	popup_calendar.clickObj	= click_element;
}

popup_calendar.setSelectDate = function(date_string) {
	
	var select_date = "";
	
	if(date_string == "") {
		var today = new Date();
		date_string = today.getFullYear() + DATE_DELIMITER + Number(today.getMonth()+1) + DATE_DELIMITER + today.getDate();
	}
	
	select_date = date_string.split(DATE_DELIMITER);
	
	var year = select_date[0];
	var month = select_date[1]-1;
	var date = select_date[2];
	popup_calendar.selectDate.setFullYear(year);
	popup_calendar.selectDate.setMonth(month);
	popup_calendar.selectDate.setDate(date);
}


/* open calendar */
popup_calendar.openCal = function(){
	//if(!e) var e = window.event;
    //var click_obj = e.target || e.srcElement;

	var click_obj = popup_calendar.clickObj;
    
    try
    {
        var s_width = parseInt(window.scrollMaxX) + parseInt(docElement.clientWidth);
    }
    catch(e)
    {
        var s_width = (document.body.scrollWidth > document.body.clientWidth)?  document.body.scrollWidth : document.body.clientWidth;
    }
    
    var pos_x = 0;
    var pos_y = 0;
    var obj = click_obj;

	while(obj.offsetParent)
    {
        pos_y += parseInt(obj.offsetTop);
        pos_x += parseInt(obj.offsetLeft);
        
        obj = obj.offsetParent;
    }
    pos_x += parseInt(obj.offsetLeft);
    pos_y += parseInt(obj.offsetTop);
    
    pos_y += click_obj.offsetHeight;
    
    if(s_width < pos_x + 160)
    {
        pos_x -= 160;
        pos_x += parseInt(click_obj.offsetWidth);
    }

    calendar_div = document.getElementById('mcalendar_pop');
    
    if(!calendar_div)
    {
        calendar_div = document.createElement("DIV");
    }

    calendar_div.id = "mcalendar_pop";
    calendar_div.style.position = "absolute";
    calendar_div.style.top = pos_y + 'px';
    calendar_div.style.left = pos_x + 'px';
    calendar_div.style.zIndex = 101;
    calendar_div.style.visibility = "visible";

	var nowWindowSize = document.documentElement.clientHeight;
	var maxCalDivSize = 175;
	
	if ( pos_y+maxCalDivSize > nowWindowSize ){
		pos_y -= (pos_y + maxCalDivSize) - nowWindowSize;
		calendar_div.style.top = pos_y + 'px';
	}

	var date_string = click_obj.value;
	if(typeof(date_string) != "undefined" && date_string != ""&& date_expr.test(date_string)){		
		popup_calendar.setSelectDate(date_string);
	}

	var year = popup_calendar.selectDate.getFullYear();
	var month = popup_calendar.selectDate.getMonth();
	var date = popup_calendar.selectDate.getDate();

	calendar_div.innerHTML = popup_calendar.createPopCalHeader(year, month, date);
	document.body.appendChild(calendar_div);
	document.getElementById('mcalendar').appendChild(popup_calendar.createPopCalBody());

	popup_calendar.setDayToPopupCal(year, month, date); 
}

popup_calendar.createPopCal = function(){
	var popCal = document.createElement("DIV");
	popCal.id = "mcalendar_pop";
	return popCal;
}

/* create the calendar's header of popup */
popup_calendar.createPopCalHeader = function(year, month, date){
	 
	var str = "<div class='pop_mm'>";
	str += "<span id='backCal'>" + this.getMonthBackNavigator(year, month, date) + "</span>";
	str += "<span id='stringCal'>" + this.getCurrentMonthString(month) + "</span>";
	str += "<span id='forwardCal'>" + this.getMonthForwardNavigator(year, month, date) + "</span>";
	str += "<span class='pop_mm_year' id='stringYear'>" + popup_calendar.getCurrentYearString(year, month, date) + "</span>";
	str += "<a href='#' onclick='popup_calendar.removePopupCalendar(document.getElementById(\"mcalendar_pop\"))' class='close'><img src='/img/gw8/c_close.gif' alt='" + close_string + "' /></a>";
	str += "</div>";
	
	str += "<table id='mcalendar' summary='" + calendar_calendar + "' cellspacing='0' cellpadding='0'>"
	str += "<thead>";
	str += "<tr>";
	
	var dayClassName = "";
	for(var i=0;i<dateutil.dayArray.length;i++) {
		dayClassName = dateutil.checkSunSat(i);
		
		if(dayClassName != null) 
			dayClassStr = "class='" + dayClassName +"'" ;
		else
			dayClassStr = "";
			
		str += "<th " + dayClassStr + ">" + dateutil.dayArray[i] + "</th>";
	}
	str += "</tr></thead></table>";
	
	return str;
}

/* create the calendar's Body of popup */
popup_calendar.createPopCalBody = function(){
	
	var body = document.createElement("tbody");
	var tr, td;
	var tdItemCount = 0;	
	for ( var i = 0; i < 6; ++i ){
		tr = document.createElement("tr");
		tr.id = this.POPUP_CALENDAR_TR + i;
		tr.name = this.POPUP_CALENDAR_TR + i;
		for ( var j = 0; j < 7; ++j ){
			td = document.createElement("td");
			td.id = this.POPUP_CALENDAR_CELL + tdItemCount;
			td.name = this.POPUP_CALENDAR_CELL + tdItemCount;
			
			if ( j == 0 )
				td.className = "sun";
			else if ( j == 6 )
				td.className = "sat";
				
			td.innerHTML = "&nbsp;";
			tr.appendChild(td);
			++tdItemCount;
		}
		body.appendChild(tr);
	}	
	return body;	
}

/* get the string of year and month */
popup_calendar.getCurrentMonthString = function(month) {
	
	return popup_calendar.getViewMonth(month+1);
}
popup_calendar.getCurrentYearString = function(year, month, date) {
	return "<a href='#' onclick='popup_calendar.updateCalendar(" + (year-1) + "," + month + "," + date + ")'><img src='/img/gw8/yleft.gif' /></a> "
		+  year
		+  " <a href='#' onclick='popup_calendar.updateCalendar(" + (year+1) + "," + month + "," + date + ")'><img src='/img/gw8/yright.gif' /></a>";
}

/* get the string of previous month */
popup_calendar.getMonthBackNavigator = function(year, month, date) {

	return "<a href='#' onclick='popup_calendar.updateCalendar(" + year + "," + (month-1) + "," + date + ")'><img src='/img/gw8/mm_pre.gif' alt='" + calendar_backward_month +"' /></a>"
}

/* get the string of next month */
popup_calendar.getMonthForwardNavigator = function(year, month, date) {

	return "<a href='#' onclick='popup_calendar.updateCalendar(" + year + "," + (month+1) + "," + date + ")'><img src='/img/gw8/mm_next.gif' alt='" + calendar_forward_month + "' /></a>";
}

popup_calendar.getViewMonth = function( month )
{
	var strMonth = "" + month;
	if ( strMonth.length < 2 )
		return "0" + month;
	else
		return month;
}

/* update calendar */
popup_calendar.updateCalendar = function( year, month, date ) {
	// valid check
	var validDate = this.getValidDate( year, month+1, date);

	// update header	
	this.updatecCalendarHeader( validDate.getFullYear(), validDate.getMonth(), validDate.getDate() );	

	// update body
	this.setDayToPopupCal(year, month, date);
}

/* update calendar's header */
popup_calendar.updatecCalendarHeader = function(year, month, date) {
	var stringCal = document.getElementById('stringCal');
	stringCal.innerHTML = this.getCurrentMonthString(month);
	
	var stringYear = document.getElementById('stringYear');
	stringYear.innerHTML = this.getCurrentYearString(year, month, date);
	
	var backCal = document.getElementById('backCal');
	backCal.innerHTML = this.getMonthBackNavigator(year, month, date);
		
	var forwardCal = document.getElementById('forwardCal');	
	forwardCal.innerHTML = this.getMonthForwardNavigator(year, month, date);
}

/* set date at the calendar of a form of popup */
popup_calendar.setDayToPopupCal = function(year, month, date) { //, obj) {
	
	var start = new Date(year, month, 1);   
	var startDay = start.getDay();			// the start day(1) of selected month
	var tempDate = null, dayObj = null, cellNum = 0;

	var today = new Date();
	var year = null;
	var month = null;
	var date = null;	
	for ( var week = 0; week < 6; week++ ){
		for(var day = 0; day<7; day++) {	
			cellNum = (week*7)+day;
			dayObj = document.getElementById(this.POPUP_CALENDAR_CELL + cellNum);
			if ( dayObj ){
				year = start.getFullYear();
				month = start.getMonth();
				tempDate = new Date( year, month, cellNum - startDay + 1 );
				
				if ( start.getMonth() != tempDate.getMonth() )
					dayObj.innerHTML = "&nbsp;";	
				else {
					date = tempDate.getDate();
					if((year == this.selectDate.getFullYear()) && (month == this.selectDate.getMonth()) && ( date == this.selectDate.getDate())) 
						today_class = dayObj.className + " today";
					else
						today_class = "";
						
					dayObj.innerHTML ="<div class = '" + today_class + "' style='height:100%;'><a href='#' class='" + today_class + "' style='display:block;padding-top:2px;height:16px;' onclick='popup_calendar.setDayToTextbox(" + year +"," + (month+1) +"," + date + ");'>" + date + " </a></div>";
				}
			}			
		}
	}
	
	// choose show extra line of calendar
	var tdObj = document.getElementById(this.POPUP_CALENDAR_CELL + 35);

	if ( tdObj ) {
		var trObj = document.getElementById(this.POPUP_CALENDAR_TR + 5);
		var content = tdObj.innerHTML;

		if ( content == "&nbsp;" && trObj )
			popup_calendar.setVisibility( trObj, 'off' );
		else
			popup_calendar.setVisibility( trObj, 'on' );
	}
}

popup_calendar.setVisibility = function( obj, state )
{
	if ( state == 'on' )
	{
		obj.style.visibility	= 'visible';
		obj.style.display 		= 'block';
	} 
	else if ( state == 'off' )
	{
		obj.style.visibility 	= 'hidden';
		obj.style.display 		= 'none';
		try
		{
			obj.hide();
		}
		catch ( exception )
		{
		}
	}
}

popup_calendar.removePopupCalendar = function(obj) {
	obj.parentNode.removeChild(obj);
	if(obj)
		obj = null;
}

/* set date and time from calendar at textbox */
popup_calendar.setDayToTextbox = function(year, month, date) {
	var result = year + DATE_DELIMITER + popup_calendar.getViewMonth(month) + DATE_DELIMITER + popup_calendar.getViewMonth(date);
	var start_date = "", end_date = "";

	this.clickObj.value = result;
	popup_calendar.removePopupCalendar(document.getElementById('mcalendar_pop'));
}

popup_calendar.getValidDate = function( year, month, day ) {
	if ( month == 0 ) {
		year = year - 1;
		month = 12
	}
	else if ( month == 13 ) {
		year++
		month = 1;
	}
	
	var tempDate = new Date( year, month - 1, day );
	if ( !popup_calendar.isValidDate( year, month, tempDate ) ) {
		for ( var i = 1; i < 32; ++i ){
			tempDate = new Date( year, month - 1, day - i );
			if (popup_calendar.isValidDate( year, month, tempDate ) ) break;
			}
	}
	return tempDate;	
}

popup_calendar.isValidDate = function( year, month, dateObj )
{
	if ( year == dateObj.getFullYear() && ( month - 1 ) == dateObj.getMonth() )
		return true;
	else
		return false;
}

popup_calendar.getDateFromString = function(date_string){
	var date_string_split = date_string.split(DATE_DELIMITER);	
	var temp_date = new Date(date_string_split[0], date_string_split[1]-1, date_string_split[2]);
	
	return temp_date;
}

//오제윤 : 이 영역 아래로 기존에 달력을 사용하시던 함수명을 만들어  calenda 함수와 같이 선언을 하시면 됩니다.

function calenda(name, startY) {
	var callObj = document.getElementById(name);
	popup_calendar.saveClickElement(callObj); 
	popup_calendar.openCal();	
}

function getCookie(cName) {
    cName = cName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cName);
    var cValue = '';
    if(start != -1){
        start += cName.length;
        var end = cookieData.indexOf(';', start);
        if(end == -1)end = cookieData.length;
		cValue = cookieData.substring(start, end);
	}
	return unescape(cValue);
}