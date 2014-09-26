<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
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
var searchCheck	= false;
var user_id  		= '<c:out value="${strUserId}"/>';
var user_cnt 		= '<c:out value="${reqPrizeCnt}"/>';
var rtnSFlag 		= '<c:out value="${rtnSFlag}"/>';

var total_req_cnt 	= 6; // 전체 요청수 처리 (신청가능박수)
total_req_cnt 			= total_req_cnt -  user_cnt;

if(rtnSFlag == "OK")
{
	location.href = "/lottery/regprizelist.do?user_id="+user_id;
}

/* pagination 페이지 링크 function */
function fn_egov_link_page(pageNo) {
	
	document.listForm.pageIndex.value	= pageNo;
	document.listForm.action 				= "<c:url value='/lottery/regprizelist.do'/>";

	//페이징 때 form 에서 값들이 같이 넘어가서 
    //검색버튼 누르기 전까진 값 초기화 해서 넘어감..
    searchCheck = "${searchCheck}";
    
    if (searchCheck == false )
	{
		document.listForm.searchCondition.value 	= "";
		document.listForm.searchKeyword.value 	= "";
		document.listForm.searchCheck.value 		= false;
	}
	else
	{
		document.listForm.searchCondition.value 	= "${searchCondition}";
		document.listForm.searchKeyword.value 	= "${searchKeyword}";
	}
    
    document.listForm.submit();
}

/* 새로고침 */
function reflesh() {
	location.reload();
}

var user_req_cnt  = 0;
var chkFlagCnt	= 0;
//체크박스 처리
function checkHeadCheckBox(item, prizeDayCnt) {
	var prizedcnt	= prizeDayCnt;
	if(!item.checked)
	{
		user_req_cnt	= user_req_cnt-prizedcnt;
		chkFlagCnt--;
		if($('#listcheck').is(':checked'))
			$('#listcheck').attr('checked','');
	}
	else
	{
		user_req_cnt	= user_req_cnt+prizedcnt;
		chkFlagCnt++;
	}
}

//신청
function reqPrizeItem() {
	var chkCnt = 0;
	if( total_req_cnt < user_req_cnt )
	{
		alert('신청일 수를 초과했습니다.');	
	}
	else
	{	
		if(chkFlagCnt > 0) {			
			var list = $("input[name='mtrlchk']");
			for(var i = 0; i < list.length; i++)
			{
			     if(list[i].checked){ //선택되어 있으면 배열에 값을 저장함
			         chkCnt++;
			     }
			 }
			
			if(chkCnt == 0)
			{
				alert('한개이상 선택하세요');		    	
			} else {
				if(confirm('신청하시겠습니까?'))
				{
						$('#prize_cud_tag').val('I');
						$('#user_id').val(user_id);
						document.listForm.action = '/lottery/regprizelist.do';
						document.listForm.submit();	
				}
			}
		} else {
			alert('선택 후 신청하세요');
			return;
		}
	}
}

function reqPrizeCancel(strCancel) {
	if(confirm("취소하시겠습니까?")) {
		var strCncl		= strCancel;
		$('#prize_cud_tag').val('UC');
		$('#user_id').val(user_id);
		$('#uc_prize_id').val(strCncl);
		document.listForm.action = '/lottery/regprizelist.do';
		document.listForm.submit();	
	}
}
</script>
<html>
<BODY class="content_body" style="height:99.5%;">
<DIV class=content_box style="HEIGHT: 100%; OVERFLOW-X: hidden; OVERFLOW-Y: hidden">
<form:form commandName="searchVO" name="listForm" method="post">
	<form:hidden path="searchCheck" value ="${searchCheck}" />
	<input type='hidden' name='prize_cud_tag' id='prize_cud_tag' value='checky'/>
	<input type='hidden' name='user_id'       id='user_id'       value='checky'/>
	<input type='hidden' name='uc_prize_id' id='uc_prize_id' value='checky'/>
		<DIV class=content>
				<!--title_area Start-->
				<div class="title_area">
		            <table width="100%" border="0" cellspacing="0" cellpadding="0">
		                <col></col>
		                <col width="230px"></col>
		                <tr>
		                    <td>
		                    <h2 class="title"> 
		                       <span title="">콘도 신청하기</span> 
	                       </h2>
						   </td>
		                </tr>
		            </table>
		        </div>
		        <!--title_area End-->

			<!--  버튼모음  -->
			<DIV class=btn_area>
					<div class="search">
						<a href="javascript:reqPrizeItem();" name="LiteSearch" id="LiteSearch"  onfocus="blur();" class="srch_btn">신청</a>&nbsp;&nbsp;
						<div class='userReqCnt'></div>						
					</div>
			</DIV>
			<!--  버튼모음 끝 -->
			<TABLE width="100%" class="content_lst no_under" id=mtrl_list_headers border=0 cellSpacing=0 cellPadding=0 name="mtrl_list_headers">
				<TBODY>
				<TR>
					<TH class="mtrl_header_check cen">선택</TH>
					<TH class="lottery_bbs_h_no cen">콘도 이름 </TH>
					<TH class="lottery_bbs_h_draftdate cen">기간</TH>
					<TH class="mtrl_item_check cen" style="width:20px">일수</TH>
					<TH class="mtrl_item_check cen" style="width:15px">신청</TH>
					<TH class="lottery_bbs_h_enforcedate cen">신청자수</TH>
				</TR>
				</TBODY>
			
			<!--  요기서 부터   -->
			<c:forEach var="result" items="${resultList}" varStatus="status">
				<TR>
					<TD class="mtrl_item_check"><input name="mtrlchk" id="mtrlchk" onclick="javascript:checkHeadCheckBox(this, <c:out value="${result.daycnt}"/>);" type="checkbox" value='<c:out value="${result.prizeId}"/>' <c:if test="${result.userId == strUserId }">checked disabled</c:if>></TD>
					<TD class="lottery_bbs_i_no noWrap"><c:out value="${result.prizeName}"/></TD>
					<TD class="lottery_bbs_i_draftdate cen"><c:out value="${result.psbSdate}"/> ~ <c:out value="${result.psbLdate}"/></TD>
					<TD class="mtrl_item_check cen"><c:out value="${result.daycnt}"/></TD>
					<TD class="mtrl_item_check cen">
						<c:if test="${result.userId != '' && result.userId ne null}">
								<div class="search" style="float:"><a href="javascript:reqPrizeCancel('<c:out value="${result.prizeId}"/>');" name="LiteSearch" id="LiteSearch"  onfocus="blur();" class="srch_btn" style="float:">취소</a></div>
						</c:if>
					</TD>
					<TD class="lottery_bbs_i_enforcedate cen"><c:out value="${result.prizecnt}"></c:out></TD>
				</TR>
			</c:forEach>
			<!-- 요기 까지 -->
			</TABLE>
			<!--  글 목록 끝  --> 
			<!--  페이징 시작  -->
			<DIV class=paginate_area>
				<DIV class=Paginate id=pagenation>
					<ui:pagination paginationInfo = "${paginationInfo}" type="image" jsFunction="fn_egov_link_page"/>
					<form:hidden path="pageIndex" />
				</DIV>
			</DIV>
			<!--  페이징 끝  -->
	</DIV>
</form:form>
</DIV>
</BODY>
</html>
<script>
$('.userReqCnt').html('<b>응모 가능한 일수 :'+total_req_cnt+'</b>');
</script>