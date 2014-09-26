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
	document.listForm.action = "<c:url value='/ledger/test.do'/>";

	//페이징 때 form 에서 값들이 같이 넘어가서 
    //검색버튼 누르기 전까진 값 초기화 해서 넘어감..
   searchCheck = "${searchCheck}";
   
   /*
   alert("${searchCheck}");
   alert(${searchCheck});
   alert(searchCheck);
   */
   
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
	//alert('EDFASDFADF');
	
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
</script>

<html>

<BODY class="content_body" style="height:99.5%;">
<DIV class=content_box style="HEIGHT: 100%; OVERFLOW-X: hidden; OVERFLOW-Y: hidden">
<form:form commandName="searchVO" name="listForm" method="post">
<form:hidden path="searchCheck" value ="${searchCheck}" />

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
											문서접수대장
                           </span> 
                       </h2>
					   </td>
	                </tr>
	            </table>
	        </div>
	        <!--title_area End-->
	        

			<!--srch_area Start-->
			<div class="srch_area" >
				<!--  detailSearch1 Start -->
				<div id="detailSearch1">
					<table summary="문서등록대장조회">
						<tbody>
							<tr>
							<td>
									<th>
									<label for="basicReportDe"> 검색조건 </label>&nbsp;
									</th>
							</td>
							<td>
									<div id="search">
										<form:select path="searchCondition" cssClass="use">
											<form:option value="1" label="문서번호" />
											<form:option value="2" label="접수일자" />
											<form:option value="3" label="시행일자" />
										</form:select>
										&nbsp;&nbsp;&nbsp;
									</div>
									</li>
							</td>
								<!-- li><form:input path="searchKeyword" cssClass="txt"/></li -->
								<!-- li><span class="btn_blue_l"><a href="javascript:fn_egov_selectList();"><spring:message code="button.search" /></a><img src="<c:url value='/images/egovframework/rte/btn_bg_r.gif'/>" style="margin-left:6px;"></span></li></ul-->		
							
								<th><label for="basicSj">키워드</label>&nbsp;</th>
								<td>
									<input id="searchKeyword" name="searchKeyword" class="Ltext" type="text" value=""/>&nbsp;&nbsp;&nbsp;
								</td>
								<th>
									<label for="basicReportDe">
												기간검색
									</label>&nbsp;
								</th>
								<td>
									<input  id="firstDate" name="firstDate" class="Ltext [{dateFrom:'secondDate'}]" title="날짜시작" type="text" value="" size="10" style="margin-bottom: 7px;"/>
									
													 
									 <a href="#a" onclick="dui.Calendar.open('firstDate','secondDate','from')"><img src="<c:url value='/img/gw8/calendar.gif'/>" alt="달력" /></a> ~ 
									 <input id="secondDate" name="secondDate" class="Ltext [{dateTo:'firstDate'}]" title="날짜끝" type="text" value="" size="10"/>
									  <a href="#a" onclick="dui.Calendar.open('secondDate','firstDate','to')"><img src="<c:url value='/img/gw8/calendar.gif'/>" alt="달력" /></a>&nbsp;&nbsp;
								</td>
								
								<td>
									<div class="search">
										<a href="javascript:search();" name="LiteSearch" id="LiteSearch"  onfocus="blur();" class="srch_btn">검색</a>&nbsp;&nbsp;
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<!--  detailSearch1 End -->
			</div>
			<!-- //srch_area End -->


		<!--  버튼모음  -->
		<DIV class=btn_area>
			<DIV class=section_r>
			<!-- 
 				<UL class=lst_option>
				<LI class=horizon><SELECT name=filter class=listmanu id=filter onchange=BBSMtrlList.filterSearch();> <OPTION value=all selected>전체</OPTION> <OPTION value=unread>읽지않은게시물</OPTION> <OPTION value=read>읽은게시물</OPTION> <OPTION value=urgency>긴급게시물</OPTION></SELECT> </LI></UL> 
				<UL class=btn_icons>
				<LI class=btn_divider></LI></UL> 
				<UL class=lst_option>
				<LI class=horizon><SELECT name=lstSize id=lstSize onchange=BBSMtrlList.setLppSize(); selected="selected"> <OPTION value=15 selected>15</OPTION> <OPTION value=20>20</OPTION> <OPTION value=30>30</OPTION> <OPTION value=40>40</OPTION> <OPTION value=50>50</OPTION></SELECT> </LI></UL>
			 -->	
				
				<UL class=btn_icons>
				
				<!-- 
					<LI class=btn_divider></LI>
					<LI><SPAN><IMG name=gotoPP title=이전페이지 align=absMiddle id=gotoPP src="/img/gw8/before_g.gif" border=0 jQuery1385690872591="35"></SPAN> </LI>
					<LI><SPAN><IMG name=gotoNP title=다음페이지 align=absMiddle id=gotoNP src="/img/gw8/next_g.gif" border=0 jQuery1385690872591="36"></SPAN> </LI>
					<LI class=btn_divider></LI>
				 -->				
				<LI><SPAN><IMG name=printicon title=인쇄 align=absMiddle id=printicon style="CURSOR: pointer" src="<c:url value='/img/gw8/btn_excel.gif'/>" border=0 onClick="javascript:excelDown();"></SPAN> </LI>
				
				<!-- 
				<LI><SPAN><IMG name=favoriteaddicon title=즐겨찾기추가 align=absMiddle id=favoriteaddicon style="CURSOR: pointer" src="/img/gw8/favor_add.gif" border=0 jQuery1385690872591="48"></SPAN> </LI>
				<LI style="DISPLAY: none" jQuery1385690872591="27"><SPAN jQuery1385690872591="26"><IMG name=favoritedelicon title=즐겨찾기삭제 align=absMiddle id=favoritedelicon style="CURSOR: pointer" src="/img/gw8/favor_del.gif" border=0 jQuery1385690872591="49"></SPAN> </LI> -->
				<LI><SPAN><IMG name=refleshicon title=새로고침 align=absMiddle id=refleshicon style="CURSOR: pointer" src="<c:url value='/img/gw8/btn_reload.gif'/>" border=0 onClick="javascript:reflesh();"></SPAN> </LI></UL>
				
			</DIV>
		</DIV>
		<!--  버튼모음 끝 -->
		
		
			
		<TABLE width="100%" class="content_lst no_under" id=mtrl_list_headers border=0 cellSpacing=0 cellPadding=0 name="mtrl_list_headers">
		<TBODY>
		
		<TR>
		<TH class="ledger_bbs_h_no cen">번호</TH>
		<TH class="ledger_bbs_h_draftdate cen">접수일자</TH>
		<TH class="ledger_bbs_h_draftdeptname cen">발신</TH>
		<TH class="ledger_bbs_h_enforcedate cen">시행일자</TH>
		<TH class="ledger_bbs_h_docregno cen">분류기호<br>문서번호</TH>
		
		<TH class="ledger_bbs_h_title cen">제 목</A></TH>
		<TH class="ledger_bbs_h_orgdraftdeptname cen">주무부</TH>
		<TH class="ledger_bbs_h_orgdraftername cen">수령인</TH>
		</TR></TBODY></TABLE>

		<TABLE class=content_lst id=mtrl_list_items name="mtrl_list_items">
		
		<!--  글목록 시작  -->
		<TBODY>
	
		<!--  요기서 부터   -->
		<c:forEach var="result" items="${resultList}" varStatus="status">
			<TR>
			<TD class="ledger_bbs_i_no noWrap"><c:out value="${result.snum}"/></TD>
			<TD class="ledger_bbs_i_draftdate cen"><c:out value="${result.draftdate}"/></TD>
			<TD class="ledger_bbs_i_draftdeptname cen"><c:out value="${result.draftdeptname}"/></TD> 
			<TD class="ledger_bbs_i_enforcedate cen"><c:out value="${result.enforcedate}"/></TD>
			<TD class="ledger_bbs_i_docregno cen"><c:out value="${result.docregno}"/></TD>
			<TD class="ledger_bbs_i_title cen"><c:out value="${result.title}"/></TD>
			<TD class="ledger_bbs_i_orgdraftdeptname cen"><c:out value="${result.orgdraftdeptname}"/></TD>
			<TD class="ledger_bbs_i_orgdraftername cen"><c:out value="${result.orgdraftername}"/></TD>
			<TR>
			
				<c:choose>
				<c:when test="${status.count} == 0 }">
					<TD class="ledger_bbs_i_no noWrap"><c:out value="${result.snum}"/></TD>
					<TD class="ledger_bbs_i_draftdate cen"><c:out value="${result.draftdate}"/></TD>
					<TD class="ledger_bbs_i_draftdeptname cen"><c:out value="${result.draftdeptname}"/></TD>
					<TD class="ledger_bbs_i_enforcedate cen"><c:out value="${result.enforcedate}"/></TD>
					<TD class="ledger_bbs_i_docregno cen"><c:out value="${result.docregno}"/></TD>
					<TD class="ledger_bbs_i_title cen"> 데이터가 없습니다. </TD>
					<TD class="ledger_bbs_i_orgdraftdeptname cen"><c:out value="${result.orgdraftdeptname}"/></TD>
					<TD class="ledger_bbs_i_orgdraftername cen"><c:out value="${result.orgdraftername}"/></TD>
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