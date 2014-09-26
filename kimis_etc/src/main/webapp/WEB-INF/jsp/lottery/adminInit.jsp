<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="ui" uri="http://egovframework.gov/ctl/ui"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>

<meta http-equiv="X-UA-Compatible" content="IE=edge">


<link href="<c:url value='/css/basic80.css'/>" rel="stylesheet" type="text/css" />
<link href="<c:url value='/css/bbs.css'/>" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="<c:url value='/js/dui_calendar.js'/>"></script>
<script type="text/javascript" src="<c:url value='/js/dui_all.js'/>"></script>
<script type="text/javascript" src="<c:url value='/js/CALS.JS'/>"></script>
<script type="text/javascript" src="<c:url value='/js/calendar.js'/>"></script>
<script type="text/javascript" src="<c:url value='/js/jquery-1.7.2.js'/>"></script>

<script>
	var rtnSFlag = '<c:out value="${rtnSFlag}"/>';
	
	if(rtnSFlag == "OK")
	{
		alert(' 초기화 되었습니다  ! ');
		location.href = "/lottery/adminInit.do?admActTag=VIEW";
	}
	else if(rtnSFlag == "LOTTERYOK")
	{
		alert(' 추첨이 완료 되었습니다.  ! ');
		location.href = "/lottery/adminInit.do?admActTag=VIEW";
	}
	else
	{
		//
	}
	
	//당첨자 초기화
	function initResult()
	{
		if(confirm('당첨자를 초기화 하시겠습니까? \n 초기화 시킨 데이터는 복구할수 없습니다. '))
		{
			$('#admActTag').val('WIN');
			$('#admFrm').attr('action','/lottery/adminInit.do');
			$('#admFrm').submit();
			
		}
	}

	//콘도 리스트 초기화 
	function initPrizeList()
	{
		if(confirm('콘도 리스트를 초기화 하시겠습니까? \n 초기화 시킨 데이터는 복구할수 없습니다. '))
		{
			$('#admActTag').val('PRIZE');
			$('#admFrm').attr('action','/lottery/adminInit.do');
			$('#admFrm').submit();
		}
	}

	//응모 초기화
	function initRequestList()
	{
		if(confirm('응모자를 초기화 하시겠습니까? \n 초기화 시킨 데이터는 복구할수 없습니다. '))
		{
			$('#admActTag').val('REQUEST');
			$('#admFrm').attr('action','/lottery/adminInit.do');
			$('#admFrm').submit();
		}
	}
	
	function runLottery()
	{
		
		var msg = '추첨 하시겠습니까? \n'
				+ '\n'
				+ '중복해서 추첨을 하신 경우에는 당첨자 초기화 를 해주셔야 결과가 정상적으로 나옵니다.\n'
				+ '\n'
				+ '추첨 기능은, 되도록 업무시간대를 피해서 진행해주시기 바랍니다. ';
				
		if(confirm(msg))
		{
			$('#admFrm').attr('action','/lottery/getWinExt.do');
			$('#admFrm').submit();
		}
	}

 </script>

 <BODY>
 <form name='admFrm' id='admFrm' method='post'>
 <input type='hidden' name='admActTag' id='admActTag' value='VIEW' />
 <!--  contents start  -->
 <h1 style="font-size: 18px; font-family:gulim; font-weight:bold; color: #03438d; margin: 20px 0 0 10px;"> 관리자 </h1>
	<div class="snb_lst">
		<ul>
			<li><a id="mng_menu_form" href='../lottery/prizelist.do'    target='right' >콘도목록</a></li>
			<li><a id="mng_menu_form" href='../lottery/winnerResult.do' target='right'>당첨자목록</a></li>					
			<li><a id="mng_menu_form" onclick='javascript:runLottery();' target='right'>추첨돌리기</a></li>					

			<li><a id="mng_menu_form" onclick='javascript:initResult();'>당첨자 리스트 초기화</a></li>					
			<li><a id="mng_menu_form" onclick='javascript:initPrizeList();'>콘도 리스트 초기화</a></li>					
			<li><a id="mng_menu_form" onclick='javascript:initRequestList();' >응모 초기화</a></li>					
		</ul>
	</div>
 </form>
 <!--  contents end  -->
</BODY>
</HTML>

