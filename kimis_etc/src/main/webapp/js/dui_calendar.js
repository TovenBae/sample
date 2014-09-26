var PROJECT_CODE = "../../..";

try { dui } catch(e) { dui = {}; }

dui.Calendar = function (pDate, pCtrl, pFormat, index, pPosition, pX, pY) {
	this.Date = pDate.getDate();
	this.Month = pDate.getMonth();
	this.Year = pDate.getFullYear();
	this.Format = dui.Calendar.DefaultFormat;
	if ( index == undefined ) {
		this.Ctrl = document.getElementById(pCtrl);
	} else {
		this.Ctrl = document.getElementsByName(pCtrl)[index];
	}
	this.inputDate = null;
	this.today = new Date();
	this.position = pPosition ? pPosition : dui.Calendar.Position.DOWN;
	this.x = pX;
	this.y = pY;
	if ( !this.Ctrl )
		this.Ctrl = {};
	if ( !this.Ctrl.id )
		this.Ctrl.id = {};
	this.Ctrl.id = pCtrl;
			
	if (pFormat != null)
		this.Format = pFormat;
	
	this.getCalendarStyles = [this.getCalendarStyle0, this.getCalendarStyle1, this.getCalendarStyle2, this.getCalendarStyle3];
}



/******************************************************************************
 * User Options
 ******************************************************************************/

// Change this image path into your calendar images path.
 dui.Calendar.imgPath = PROJECT_CODE+"/images/";

// Change this date format into your system standard format.
dui.Calendar.DefaultFormat = "YYYY-MM-DD";

// Change calendar style. select 0/1/2/3
dui.Calendar.CalendarStyle = 2;

// Change calendar title style. Each index of this array is mapped with "dui.Calendar.CalendarStyle" value.
dui.Calendar.CalendarTitleFormat = ["YYYY. mm", "YYYY년 mm월", "YYYY. mm", "YYYY"];

// Change calendar header names
dui.Calendar.weekDayNames = [PROJECT_CODE+"/images/common/cal_day_sun.gif"
                             ,PROJECT_CODE+"/images/common/cal_day_mon.gif"
                             ,PROJECT_CODE+"/images/common/cal_day_tue.gif"
                             ,PROJECT_CODE+"/images/common/cal_day_wed.gif"
                             ,PROJECT_CODE+"/images/common/cal_day_thu.gif"
                             ,PROJECT_CODE+"/images/common/cal_day_fri.gif"
                             ,PROJECT_CODE+"/images/common/cal_day_sat.gif"];
//dui.Calendar.weekDayNames = ["일","월","화","수","목","금","토"];
//dui.Calendar.weekDayNames = ["日","月","火","水","木","金","土"];

// Change 'title' attribute value in date link. 
dui.Calendar.titleOfToday = "Today";
dui.Calendar.titleOfSelectedDay = "Selected Day";

/******************************************************************************/

// 임의 지점 설정을 추가. 4 일때, open arguement에 x, y 전달값을 추가
dui.Calendar.Position = { DOWN:0, UP:1 , UP_LEFT_PR:2, UP_RIGHT_PR:3, USER_SELECT:4};

dui.Calendar.open = function (pCtrl, defCtrl, ftGbn, othFunc, pPosition, pFormat, pX, pY) {
	
	if (popup_calendar.clickObj) {
		var id = popup_calendar.clickObj.id;
		if (null != document.getElementById('mcalendar_pop')) {
			popup_calendar.removePopupCalendar(document.getElementById('mcalendar_pop'));
		}
		if (id == pCtrl) {
			return;
		}
	}
	
	if (defCtrl) {
		calendarDoubleIdOpen(pCtrl, defCtrl, ftGbn);
	} else {
		calendarSingleIdOpen(pCtrl);
	}
	
	/*try {

		if (dui.Calendar.Cal) {
			if( dui.Calendar.Cal.elem ) {

				var id = dui.Calendar.Cal.Ctrl.id;
				dui.Calendar.close();
				if( id == pCtrl ) // The user clicked the same control that opened us so and return.
					return;
			}
		}
		dui.Calendar.Cal = new dui.Calendar(new Date(), pCtrl, pFormat, null, pPosition, pX, pY);
		dui.Calendar.Cal.defCtrl = defCtrl;
		dui.Calendar.Cal.ftGbn = ftGbn;
		dui.Calendar.Cal.othFunc = othFunc;

		dui.Calendar.Cal.open();

		
	} catch (e) {
		if (e.name == "DevOnCalendarError") {
			alert(e.message);
		}
	}*/
}

dui.Calendar.ListOpen = function (pCtrl, index, pPosition, pFormat) {
	try {
		if (dui.Calendar.Cal) {
			if( dui.Calendar.Cal.elem ) {
				var id = dui.Calendar.Cal.Ctrl.id;
				dui.Calendar.close();
				if( id == pCtrl ) // The user clicked the same control that opened us so and return.
					return;
			}
		}
		dui.Calendar.Cal = new dui.Calendar(new Date(), pCtrl, pFormat, index, pPosition);
		dui.Calendar.Cal.index = index;
		dui.Calendar.Cal.open();
		
	} catch (e) {
		if (e.name == "DevOnCalendarError") {
			alert(e.message);
		}
	}
}

dui.Calendar.close = function () {
	dui.Calendar.Cal.close();
	delete dui.Calendar.Cal;
}

dui.Calendar.prototype = {
	MonthName : ["1","2","3","4","5","6","7","8","9","10","11","12"],
	WeekDayName : ["Sun","Mon","Tue","Web","Thu","Fri","Sat"],
	//dui.Calendar.BodyOverflow = "",
	selectControls : null,
	
	open : function() {
	
		this.parseDate(this.Ctrl.value);
	
		this.render();
	
		var oSelects = document.getElementsByTagName("select");
	
		this.selectControls = new Array(oSelects.length);
	
		this.hideSelects();
	
	},
	
	close : function() {
		this.elem.parentNode.removeChild(this.elem);
		//document.body.style.overflow = dui.Calendar.BodyOverflow;
		this.showSelects();
		delete this.selectControls;
	},
	
	showSelects : function () {
		if( !this.selectControls[0] ) return;
		for(var i=0; i < this.selectControls.length && this.selectControls[i]; i++ )
		this.selectControls[i].style.visibility = "visible";
	},
	
	hideSelects : function () {
		if(!document.all ){
			this.selectControls[0] = null;
			return;
		}
		var b_version = navigator.appVersion // start testing for IE version 7 or higher
		var verels = b_version.split(';');
		for( var i = 0; i < verels.length; i++ )
			if( verels[i].indexOf("MSIE") != -1 )
				break;
		if( i != verels.length ) {
			verels = verels[i].split(" ");
			if( parseFloat(verels[2]) >= 7.0 ) // select problem with rendering over top fix in IE 7 so return
				return;
		}
		var oSelects = document.getElementsByTagName("select");
		var count = 0;
		b1t = parseInt(this.elem.style.top);
		b1h = parseInt(this.elem.offsetHeight);
		b1l = parseInt(this.elem.style.left)
		b1w = parseInt(this.elem.offsetWidth);
		for(var i=0; i < oSelects.length; i++) {
			b2t = parseInt(this.fDomOffset(oSelects[i], 'offsetTop'));
			b2h = parseInt(oSelects[i].offsetHeight);
			b2l = parseInt(this.fDomOffset(oSelects[i], 'offsetLeft'));
			b2w = parseInt(oSelects[i].offsetWidth);
			if( b1t <= b2t && (b1t + b1h) >= b2t && b1l <= (b2l + b2w) && (b1l + b1w) >= b2l ) {
				oSelects[i].style.visibility="hidden";
				this.selectControls[count++] = oSelects[i];
			}
			else
				this.selectControls[count] = null;
		}
	},
	
	parseDate : function (date) {
		if (date == null || date == "" || date == "undefined") return;
		var format = this.Format;
		if(date.length==8) {
			format = 'YYYYMMDD';
		}
		this.inputDate = null;
		var year = parseInt(date.substr(this.Format.indexOf("YYYY"), 4),10);
		var index = format.indexOf("MM") == -1 ? format.indexOf("mm") : format.indexOf("MM");
		var month = parseInt(date.substr(index, 2),10) - 1;
		index = format.indexOf("DD") == -1 ? format.indexOf("dd") : format.indexOf("DD");
		var dateOfMonth = parseInt(date.substr(index, 2),10);

		var tmp_Year = this.Year;
		var tmp_Month = this.Month;
		var tmp_Date = this.Date;
		
		this.Year = year;
		this.Month = month;
		this.Date = dateOfMonth;
	
		if (isNaN(month)) { 
			this.Year = tmp_Year;
			this.Month = tmp_Month;
			this.Date = tmp_Date;
			throw this.getError("날짜가 정해진 형식과 일치하지 않습니다.("+format+")");
		}
		
		if ( (month < 0 || month >= 12) || (dateOfMonth > this.GetMonDays() || dateOfMonth < 1) ){
			this.Year = tmp_Year;
			this.Month = tmp_Month;
			this.Date = tmp_Date;
			throw new Error("날짜가 잘못되었습니다.");
		}

		this.inputDate = new Date(year, month, dateOfMonth);
		
	},
	
	render : function () {
		var vCalHeader;
		var vCalData;
		var i;
		var j;
		var SelectStr;
		var vDayCount=0;
		var vFirstDay;
		var setFocus = "";
		
		//vCalHeader = dui.Calendar.CalendarStyles[dui.Calendar.CalendarStyle];
		vCalHeader = this.getCalendarStyles[dui.Calendar.CalendarStyle].call(this);

		vCalHeader += 
		    "<div class='cal_popframe_b'>" +
			"    <table class='body'>" +
			"	     <thead>" +
			"		     <tr>";

		for (i=0; i<7; i++) {
			vCalHeader += "<th class='idx"+i+"'>"+"<img src='"+dui.Calendar.weekDayNames[i]+"' alt='일' />"+"</th>";
		}
		vCalHeader += "</tr></thead>";
		
		CalDate = new Date(this.Year,this.Month);
		CalDate.setDate(1);
		vFirstDay = CalDate.getDay();
		vCalData = "<tbody><tr>";
		
		for (i=0; i<vFirstDay; i++) {
			vCalData = vCalData + this.genCell();
			vDayCount = vDayCount + 1;
		}
		
		for (j=1; j<=this.GetMonDays(); j++) {
			var strCell;
			vDayCount = vDayCount+1;
			
			if ((j == this.today.getDate()) && (this.Month == this.today.getMonth()) && (this.Year == this.today.getFullYear())) {
				strCell = this.genCell(j, "today");
				setFocus = "cal_"+j;
			}
			else {
				if (this.inputDate && j == this.Date && this.Month == this.inputDate.getMonth() && this.Year == this.inputDate.getFullYear()) {
					strCell = this.genCell(j, "inputday");
					setFocus = "cal_"+j;
				} else {
					if (vDayCount%7 == 0)
						strCell = this.genCell(j, "saturday");
					else if ((vDayCount+6)%7 == 0)
						strCell = this.genCell(j, "sunday");
					else
						strCell = this.genCell(j, "weekday");
				}
			}
			
			vCalData = vCalData+strCell;
			if((vDayCount%7 == 0) && (j < this.GetMonDays())) {
				vCalData = vCalData + "</tr><tr>";
			}
		}
		
		var vDropCalander = vCalHeader + vCalData + "</td></tr></tbody></table></div>";
		
		if ( dui.Calendar.Cal.index == undefined || dui.Calendar.Cal.index == null ) {
			var obj = document.getElementById(this.Ctrl.id);
		} else {
			var obj = document.getElementsByName(this.Ctrl.id)[dui.Calendar.Cal.index];
		}
		
		var offsets = this.getCumulativeOffset(obj);
		var leftpos = offsets.left;
		//var objPosition = dui.Calendar.getPosition(obj);
		//var leftpos = objPosition.left;
		//var bottom = objPosition.top + obj.offsetHeight;
		var Width = this.getClientWidth();
		var Height = this.getClientHeight();
		var ScrollPos = this.getScrollTop();
		var ScrollHeight = document.body.scrollHeight;
		if( this.elem == null){
			this.elem = document.createElement('div');
			this.elem.id = "LduiCalendar";
			this.elem.className = "style"+dui.Calendar.CalendarStyle;
			this.elem.style.position = "absolute";
			this.elem.style.left = leftpos + "px";
			this.elem.style.zIndex = 9999;
		}
		this.elem.innerHTML = "<div>"+vDropCalander+"</div>";
		
		/*
		if( BodyOverflow == 'auto' && ScrollHeight <= Height ) // if height of page is close to browser client height
		  document.body.style.overflow = 'hidden';              // and overflow is auto, the addition of the div could
		 document.body.appendChild(Cal.elem);                   // make the scrollbar show so lets hide it while the
		 var elemHeight = Cal.elem.offsetHeight;                // calendar is up
		*/	
		
		document.body.appendChild(this.elem);

		switch (this.position) {
		
			case dui.Calendar.Position.DOWN:
				this.elem.style.top = offsets.top + obj.offsetHeight + "px";
				break;
			case dui.Calendar.Position.UP:
				this.elem.style.top = offsets.top - this.elem.offsetHeight + "px";
				break;
			case dui.Calendar.Position.UP_LEFT_PR:
				this.elem.style.top = offsets.top - this.elem.offsetHeight + 22 + "px";
				this.elem.style.left = offsets.left - 100 + "px";
				break;
			case dui.Calendar.Position.UP_RIGHT_PR:
				this.elem.style.top = offsets.top - this.elem.offsetHeight + 22 + "px";
				this.elem.style.left = offsets.left + 86 + "px";
				break;
			case dui.Calendar.Position.USER_SELECT:
				this.elem.style.top = this.y
				this.elem.style.left = this.x;
				break;		
		}
		// link to jump to calendar for web Accessbility.
		if ( document.getElementById(setFocus) != null ) {
			document.getElementById(setFocus).focus();
		} else {
			document.getElementById("cal_1").focus();
		}
	
		var elemHeight = this.elem.offsetHeight;
	
		//if ( !elemHeight )
		//	elemHeight = document.getElementById('calT1').offsetHeight;
		/*
		if ( Cal.elem.offsetTop + elemHeight > (Height + ScrollPos) ) {
			if( Cal.elem.style.top )
				Cal.elem.style.top = (objPosition.top - elemHeight) + "px";
			else
				Cal.elem.setAttribute("style.top",(objPosition.top - Cal.elem.offsetHeight) + "px");
		}
	
		while( Cal.elem.offsetLeft + Cal.elem.offsetWidth > (Width) )
			var position = dui.Calendar.getPosition(Cal.elem);
			if( Cal.elem.style.left )
				Cal.elem.style.left = (objPosition.left - 1) + "px";
			else
				Cal.elem.setAttribute("style.left", (objPosition.left - 1) + "px");
		*/		
	},
	
	getCalendarStyle0 : function()	 {
		var header = 
		"<div class='toolbar'>"+
		"	<img class='pre_month' src='"+dui.Calendar.imgPath+"calendar_pre_month.gif' onclick='dui.Calendar.Cal.decreaseMonth();dui.Calendar.Cal.render();' alt='이전달'>" +
		"	<span class='title'>"+this.FormatDate(null, dui.Calendar.CalendarTitleFormat[0])+"</span>"+
		"	<img class='next_month' src='"+dui.Calendar.imgPath+"calendar_next_month.gif' onclick='dui.Calendar.Cal.increaseMonth();dui.Calendar.Cal.render();' alt='다음달'>"+
		"</div>";
		return header;
	},
	
	getCalendarStyle1 : function() {
		var header = 
		"<div class='toolbar'>"+
		"	<img class='pre_month' src='"+dui.Calendar.imgPath+"calendar_pre_month.gif' onclick='dui.Calendar.Cal.decreaseMonth();dui.Calendar.Cal.render();' alt='이전달'>" +
		"	<span class='title'>"+this.FormatDate(null, dui.Calendar.CalendarTitleFormat[1])+"</span>"+
		"	<img class='next_month' src='"+dui.Calendar.imgPath+"calendar_next_month.gif' onclick='dui.Calendar.Cal.increaseMonth();dui.Calendar.Cal.render();' alt='다음달'>"+
		"</div>";
		return header;
	},
	
	getCalendarStyle2 : function() {
		return 	"<div class='cal_popframe_t'>"+
		"	<a href=\"#\" onclick='dui.Calendar.Cal.decreaseYear();dui.Calendar.Cal.render();' ><img src='"+dui.Calendar.imgPath+"icon/ic_y_before.gif' alt='이전년도'></a>" +
		"	<a href=\"#\" onclick='dui.Calendar.Cal.decreaseMonth();dui.Calendar.Cal.render();' ><img src='"+dui.Calendar.imgPath+"icon/ic_m_before.gif' alt='이전달'></a>" +
		"	<span>"+this.FormatDate(null, dui.Calendar.CalendarTitleFormat[2])+"</span>" +
		"	<a href=\"#\" onclick='dui.Calendar.Cal.increaseMonth(); dui.Calendar.Cal.render();' ><img src='"+dui.Calendar.imgPath+"icon/ic_m_after.gif' alt='다음달'></a>" +
		"	<a href=\"#\" onclick='dui.Calendar.Cal.increaseYear();dui.Calendar.Cal.render();' ><img src='"+dui.Calendar.imgPath+"icon/ic_y_after.gif' alt='다음년도'></a>"+
		"</div>";
	},
	
	getCalendarStyle3 : function()	 {
		var header = 
		"<div class='toolbar'>"+
		"	<img class='pre_year' src='"+dui.Calendar.imgPath+"calendar_pre_year.gif' onclick='dui.Calendar.Cal.decreaseYear();dui.Calendar.Cal.render();' alt='이전해'>" +
		"	<span class='title'>"+this.FormatDate(null, dui.Calendar.CalendarTitleFormat[3])+"</span>"+
		"	<img class='next_year' src='"+dui.Calendar.imgPath+"calendar_next_year.gif' onclick='dui.Calendar.Cal.increaseYear();dui.Calendar.Cal.render();' alt='다음해'>"+
		"	<table class='monthSelect'><tr>";
		for (var i = 0; i < 12; i++) {
			header += "<td class='";
			if (i>8) header += "digit2";
			if (this.Month == i) 	header += " current";
			header += "'><a href='#' onclick='dui.Calendar.Cal.Month="+i+"; dui.Calendar.Cal.render(); return false;'>" + (i + 1) + "</a></td>";
		}
		header += "</tr></table></div>";
		return header;
	},
	
	getError : function(message){
		var err = new Error(message);
		err.name = "DevOnCalendarError";
		return err;
	},
	
	GetMonthIndex : function (shortMonthName) {
		for (i=0;i<12;i++){
			if (this.MonthName[i].substring(0,3).toUpperCase()==shortMonthName.toUpperCase()) {
				return i;
			}
		}
	},
	
	increaseYear : function IncYear() {
		this.Year++;
	},
	
	decreaseYear : function () {
		this.Year--;
	},
	
	increaseMonth : function () {
		this.Month++;
		if( this.Month == 12 ){
			this.Month = 0;
			this.Year++;
		}
	},
	
	decreaseMonth : function () {
		this.Month--;
		if( this.Month < 0 ){
			this.Month = 11;
			this.Year--;
		}
	},
	
	SwitchMth : function (intMth) {
		this.Month=intMth;
	},
	
	GetMonthName : function (IsLong, nextPrev) {
		var Month = this.MonthName[this.Month];

		if( nextPrev < 0 ){
			if( this.Month == 0 )
			Month=this.MonthName[11];
			else
			Month=this.MonthName[this.Month-1];
		}
		if( nextPrev > 0 ){
			if( this.Month == 11 )
			Month=this.MonthName[0];
			else
			Month=this.MonthName[this.Month+1];
		}
		if (IsLong)
			return Month;
		else
			return Month.substr(0,3);
	},
	
	//Get number of days in a month
	GetMonDays : function () {
		var DaysInMonth=[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		if (this.IsLeapYear()){
			DaysInMonth[1]=29;
		}
		return DaysInMonth[this.Month];
	},
	
	IsLeapYear : function () {
		if ((this.Year%4)==0){
			if ((this.Year%100==0) && (this.Year%400)!=0){
				return false;
			}
			else{
				return true;
			}
		}
		else{
			return false;
		}
	},
	
	FormatDate : function (date, format) {
		var strDate = format ? format : this.Format;
		var month =  this.Month+1;
		var month2 =  month >= 10 ? month : "0"+month;
		var date2;
		if (date) date2 = date >= 10 ? date : "0"+date;
		
		var re = /YYYY/gi;
        strDate = strDate.replace(re, this.Year);
		re = /mm/g;
        strDate = strDate.replace(re, month);
		re = /MM/g;
        strDate = strDate.replace(re, month2);
		re = /dd/g;
        strDate = strDate.replace(re, date);
		re = /DD/g;
        strDate = strDate.replace(re, date2);
		return strDate;
	},
	
	getCumulativeOffset : function (elem) {
		var left = 0, top = 0;
		while (elem != null){
		//alert(elem.tagName+":"+elem.innerHTML);
			left += elem.offsetLeft;
			top += elem.offsetTop;
			elem = elem.offsetParent;
		}
		return {left:left, top:top};
	},

	/*
	dui.Calendar.getPosition = function (elem) {
		var stylePosition = D$(elem).getStyle("position");
		elem.style.position = "relative";
		var position = { left:elem.offsetLeft, top:elem.offsetTop };
		if (stylePosition) elem.style.position = stylePosition;
		return position;
	}
	*/
	
	clicked : function (value) {
		//dui.Calendar.Cal.Ctrl.value = dui.Calendar.Cal.FormatDate(PValue);
		this.Ctrl.value = this.FormatDate(value);
		var ctrlValue = this.FormatDate(value);

		// 형식이 틀렸다는 내용이 필요함.
		// 일단 YYYY-MM-DD 를 기본으로 한 내용만 셋팅하기로한다.
		/*
		if ( defCtrl.length != 10 ) {
			alert("비교할 날짜형식이 YYYY-MM-DD이 아닙니다.");
		}
		*/
		
		var defCtrl = document.getElementById(dui.Calendar.Cal.defCtrl);
		
		var fromDate, toDate; 
		var fromDateArr, toDateArr; 
		
		if ( defCtrl != null && defCtrl.value != "" ) {

			if ( dui.Calendar.Cal.ftGbn == "to" ) {
				fromDateArr = (defCtrl.value).split("-");
				toDateArr = (ctrlValue).split("-");
				fromDate = new Date(fromDateArr[0], fromDateArr[1]-1, fromDateArr[2]) - 0;
				toDate = new Date(toDateArr[0], toDateArr[1]-1, toDateArr[2]) - 0;
				if ( fromDate > toDate ) {
					// 메시지 수정 : "하십시오" -> "해 주십시오." by seoul bms
					alert("해 주십시오.");
					return;
				}
			} else if ( dui.Calendar.Cal.ftGbn == "from" ) {
				fromDateArr = (ctrlValue).split("-");
				toDateArr = (defCtrl.value).split("-");
				fromDate = new Date(fromDateArr[0], fromDateArr[1]-1, fromDateArr[2]) - 0;
				toDate = new Date(toDateArr[0], toDateArr[1]-1, toDateArr[2]) - 0;
				if ( fromDate > toDate ) {
					// 메시지 수정 : "하십시오" -> "해 주십시오." by seoul bms					//modify by Kim Jin Il
					//alert(startdate_input);					alert("해 주십시오.");
					return;
				}
			} else {
				//alert("비교할 구분자가 정의된 내용이 아님.");
			}
		}
		
		this.Ctrl.value = ctrlValue;
		
		// hidden 등 보이지 않는 개체에 세팅 시 포커스를 가질 수 없으므로. kdh
		try{
			this.Ctrl.focus();
		} catch(e){}
		
		if ( dui.Calendar.Cal.othFunc != undefined ) {
			// 후처리 function을 지정했으면 호출을 해야... kdh
			eval(dui.Calendar.Cal.othFunc).apply();
		}
		
		dui.Calendar.close();
	},
	genCell : function (pValue, pClass) {
		var PValue;
		var PCellStr;
		var vColor;
		var vHLstr1;
		var vHlstr2;
		
		pClass = pClass ? pClass : "empty";
		PValue = (pValue == null) ? "&nbsp;" : pValue;
	
		var dq = '"';
		PCellStr = "<td class='"+pClass+"'>"+
			"<a id='cal_"+pValue+"' href='#' onmouseover='this.className=\"Lhover\"' onmouseout='this.className=\"\"'";
		if (pClass != "empty") PCellStr += " onclick=\"dui.Calendar.Cal.clicked('"+PValue+"'); return false;\"";
		if (pClass == "today") PCellStr += " title='"+dui.Calendar.titleOfToday+"'";
		else if (pClass == "inputday") PCellStr += " title='"+dui.Calendar.titleOfSelectedDay+"'";
		PCellStr += "'>"+PValue+"</a></td>";
		return PCellStr;
	},
	getClientWidth : function () {
		return this.getResults (
			window.innerWidth ? window.innerWidth : 0,
			document.documentElement ? document.documentElement.clientWidth : 0,
			document.body ? document.body.clientWidth : 0
		);
	},
	getScrollTop : function () {
		return this.getResults (
			window.pageYOffset ? window.pageYOffset : 0,
			document.documentElement ? document.documentElement.scrollTop : 0,
			document.body ? document.body.scrollTop : 0
		);
	},
	getClientHeight : function () {
		return this.getResults (
			window.innerHeight ? window.innerHeight : 0,
			document.documentElement ? document.documentElement.clientHeight : 0,
			document.body ? document.body.clientHeight : 0
		);
	},
	getResults : function (n_win, n_docel, n_body) {
		var n_result = n_win ? n_win : 0;
		if (n_docel && (!n_result || (n_result > n_docel)))
			n_result = n_docel;
			
		return n_body && (!n_result || (n_result > n_body)) ? n_body : n_result;
	},
	fDomOffset : function( oObj, sProp ) {
		var iVal = 0;
		while (oObj && oObj.tagName != 'BODY'){
			eval('iVal += oObj.' + sProp + ';');
			oObj = oObj.offsetParent;
		}
		return iVal;
	}
}