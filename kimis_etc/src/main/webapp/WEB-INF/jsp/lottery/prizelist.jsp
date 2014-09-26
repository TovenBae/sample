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
var searchCheck  = false;
/* pagination 페이지 링크 function */
function fn_egov_link_page(pageNo){
	document.listForm.pageIndex.value = pageNo;
	document.listForm.action = "<c:url value='/lottery/prizelist.do'/>";

	//페이징 때 form 에서 값들이 같이 넘어가서 
    //검색버튼 누르기 전까진 값 초기화 해서 넘어감..
   searchCheck = "${searchCheck}";
   
   
    if (searchCheck == false )
    {
    	document.listForm.searchCondition.value = "";
    	document.listForm.searchKeyword.value = "";
    	document.listForm.searchCheck.value = false;
    }
    else 
    {
    	document.listForm.searchCondition.value = "${searchCondition}";
    	document.listForm.searchKeyword.value = "${searchKeyword}";
    	
    }
    document.listForm.submit();
}

/** 검색 */
function search()
{
	
	if(document.listForm.searchKeyword.value == "" && document.listForm.searchCondition.value == "1")
	{
		alert('검색어를 입력해 주세요 !');
	}
	else
	{
		searchCheck = true;
		document.listForm.searchCheck.value = true;
	 	document.listForm.submit(); 		
	}
}

/** 엑셀다운로드 */ 
function excelDown()
{
	document.listForm.searchCondition.value = "${searchCondition}";
	document.listForm.searchKeyword.value = "${searchKeyword}";
	document.listForm.action = "<c:url value='/ledger/exceldown.do'/>";
	document.listForm.submit();
}

/* 새로고침 */
function reflesh()
{
	location.reload();

}

// 체크박스 처리
function checkHeadCheckBox(item){
	if(!item.checked)
		if($('#listcheck').is(':checked'))
			$('#listcheck').attr('checked','');
}
// 전체 체크박스 처리
function CheckItem(){

	if($('#listcheck').is(':checked')){ // 전체선택 체크박스 체크상태
      $(':input:checkbox[name=mtrlchk]').each(function(){
        $(this).prop('checked', 'checked');           // 가져온 체크박스를 checked
        });
     }else{  // 전체선택 체크박스 미체크상태
       $(':input:checkbox[name=mtrlchk]').each(function(){
       $(this).prop('checked','');                         // 가져온 체크박스를 미체크상태로
       });
     }
}


//삭제
function deletePrize()
{
	var chkCnt = 0;
	if(confirm('삭제 하시겠습니까? 삭제한데이터는 복구할수 없습니다.'))
	{
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
		 }
		 else
		 {
			$('#listform_prize_cud_tag').val('D');
			 document.listForm.action = '/lottery/udPrize.do';
			 document.listForm.submit();
		  	//$('#listForm').attr('action','/lottery/udPrize.do').submit();
		 }
	}

}


//상품수정 : 업데이트 할 데이터 셋팅
function updatePrize(id, name, sdate, ldate)
{
	$('#prize_cud_tag').val('U');
	$('#frm_prize_id').val(id);	
	$('#frm_prize_name').val(name);
	$('#frm_firstDate').val(sdate);
	$('#frm_secondDate').val(ldate);

	$('#prize_input_btn').attr('value','수정');
	
	
	 //document.frm.action = '/lottery/udPrize.do';

}

//입력
function inputPrizeItem()
{
	document.frm.action = '/lottery/udPrize.do';
	
	if($('#prize_cud_tag').val() == 'U')
	{
		if(confirm('수정하시겠습니까?'))
		{
			document.frm.submit();
		}
	}
	else
	{
		$('#prize_cud_tag').val('I');
		document.frm.submit();
	}
}

</script>

<html>

<BODY class="content_body" style="height:99.5%;">



<form name='frm' id='frm' method="post">
<input type='hidden' name='prize_cud_tag' id='prize_cud_tag' value='I'/>
<input type='hidden' name='prize_id' id='frm_prize_id' value=''/>
	<table> 
		<tr>	
			<td> 상품명 : <input type='text' id='frm_prize_name' name='prize_name' value=''/> 
			 시작날짜 : <input  id="frm_firstDate" name="psb_sdate" class="Ltext [{dateFrom:'secondDate'}]" title="날짜시작" type="text" value="" size="10" style="margin-bottom: 7px;"/>
			 <a href="#a" onclick="dui.Calendar.open('frm_firstDate','frm_secondDate','from')"><img src="<c:url value='/img/gw8/calendar.gif'/>" alt="달력" /></a> ~ 
			 종료날짜 : <input id="frm_secondDate" name="psb_ldate" class="Ltext [{dateTo:'firstDate'}]" title="날짜끝" type="text" value="" size="10"/>
			  <a href="#a" onclick="dui.Calendar.open('frm_secondDate','frm_firstDate','to')"><img src="<c:url value='/img/gw8/calendar.gif'/>" alt="달력" /></a>&nbsp;&nbsp;
			 <input type='button' id='prize_input_btn' value='입력' onClick='javascript:inputPrizeItem();'/>
			</td>
		</tr>
	</table>
</form>


<DIV class=content_box style="HEIGHT: 100%; OVERFLOW-X: hidden; OVERFLOW-Y: hidden">
	<form:form commandName="searchVO" name="listForm" method="post">
	<form:hidden path="searchCheck" value ="${searchCheck}" />
	<input type='hidden' name='prize_cud_tag' id='listform_prize_cud_tag' value='checky'/>
	<input type='hidden' name='prize_id'      id='prize_id'      value='checky'/>
	<input type='hidden' name='prize_name'    id='prize_name'    value='checky'/>
	<input type='hidden' name='psb_sdate'     id='psb_sdate'     value='checky'/>
	<input type='hidden' name='"psb_ldate'    id='psb_ldate'     value='checky'/>
		<DIV class=content>
				<!--title_area Start-->
				<div class="title_area">
		            <table width="100%" border="0" cellspacing="0" cellpadding="0">
		                <col></col>
		                <col width="230px"></col>
		                <tr>
		                    <td>
		                    <h2 class="title"> 
		                       <span title="">
												상품목록 리스트
	                           </span> 
	                       </h2>
						   </td>
		                </tr>
		            </table>
		        </div>
		        <!--title_area End-->
			<!--  버튼모음  -->
			<DIV class=btn_area>
					<div class="search">
				<a href="javascript:deletePrize();" name="LiteSearch" id="LiteSearch"  onfocus="blur();" class="srch_btn">삭제</a>&nbsp;&nbsp;
			</div>
			
			</DIV>
			
	
			<!--  버튼모음 끝 -->
			<TABLE width="100%" class="content_lst no_under" id=mtrl_list_headers border=0 cellSpacing=0 cellPadding=0 name="mtrl_list_headers">
			<TBODY>
			<TR>
				<th class="mtrl_header_check cen"><input name="listcheck" id="listcheck" onclick="JavaScript:CheckItem();" type="checkbox"></th>
				<TH class="lottery_bbs_h_no cen">콘도 이름 </TH>
				<TH class="lottery_bbs_h_draftdate cen">시작날짜</TH>
				<TH class="lottery_bbs_h_draftdeptname cen">종료날짜</TH>
				<TH class="lottery_bbs_h_enforcedate cen">등록날짜</TH>
			</TR></TBODY></TABLE>
	
			<TABLE class=content_lst id=mtrl_list_items name="mtrl_list_items">
	
			<!--  글목록 시작  -->
			<TBODY>
			<c:out value="${status.count}"/> 
			
			<!--  요기서 부터   -->
			<c:forEach var="result" items="${resultList}" varStatus="status">
				<TR>
					<td class="mtrl_item_check" nowrap=""><input name="mtrlchk" id="mtrlchk" onclick="javascript:checkHeadCheckBox(this);" type="checkbox" value='<c:out value="${result.prizeId}"/>' ></td>
					<TD class="lottery_bbs_i_no noWrap"><a href='javascript:updatePrize("<c:out value="${result.prizeId}"/>", "<c:out value="${result.prizeName}"/>", "<c:out value="${result.psbSdate}"/>", "<c:out value="${result.psbLdate}"/>");'><c:out value="${result.prizeName}"/></a></TD>
					<TD class="lottery_bbs_i_draftdate cen"><c:out value="${result.psbSdate}"/></TD>
					<TD class="lottery_bbs_i_draftdeptname cen"><c:out value="${result.psbLdate}"/></TD> 
					<TD class="lottery_bbs_i_enforcedate cen"><c:out value="${result.regdate}"/></TD>
				<TR>
				
				<c:choose>
				<c:when test="${status.count} == 0 }">
					<TD class="lottery_bbs_i_no noWrap"><c:out value="${result.prizeName}"/></TD>
					<TD class="lottery_bbs_i_draftdate cen"><c:out value="${result.psbSdate}"/></TD>
					<TD class="lottery_bbs_i_draftdeptname cen"> 데이터가 없네요 ... </TD> 
					<TD class="lottery_bbs_i_enforcedate cen"><c:out value="${result.regdate}"/></TD>
				</c:when>
				</c:choose>
			</c:forEach>
			<!-- 요기 까지 -->
			</TBODY>
			</TABLE>
			
			<!--  글 목록 끝  --> 
			<!--  페이징 시작  -->
			<DIV class=paginate_area>
				<DIV class=Paginate id=pagenation name="pagenation">
				
					<ui:pagination paginationInfo = "${paginationInfo}"
							   type="image"
							   jsFunction="fn_egov_link_page"
							   />
					<form:hidden path="pageIndex" />
				</DIV>
			</DIV>
			<!--  페이징 끝  -->
	</DIV>
	</form:form>
</DIV>

</BODY>
</html>