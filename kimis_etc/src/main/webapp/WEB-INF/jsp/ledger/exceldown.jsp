<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="ui" uri="http://egovframework.gov/ctl/ui"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>

<meta http-equiv="X-UA-Compatible" content="IE=edge">
<link href="/css/ledger/basic80.css" rel="stylesheet" type="text/css" />
<link href="/css/ledger/bbs.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="/js/dui_calendar.js"></script>
<script type="text/javascript" src="/js/dui_all.js"></script>
<script type="text/javascript" src="/js/CALS.JS"></script>
<script type="text/javascript" src="/js/calendar.js"></script>
<script type="text/javascript" src="/js/jquery-1.7.2.js"></script>


<html>
<head>
<% 
        // EXCEL 파일 다운로드 처리 
        response.setHeader("Content-Disposition", "attachment; filename=myexcel.xls");  
        response.setHeader("Content-Description", "JSP Generated Data"); 
%> 
</head>
<BODY class="content_body" style="height:99.5%;">
<DIV class=content_box style="HEIGHT: 100%; OVERFLOW-X: hidden; OVERFLOW-Y: hidden">
<form:form commandName="searchVO" name="listForm" method="post">

	<DIV>
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
		<TABLE border=1>
		
		<!--  글목록 시작  -->
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
		</TR>
	
		<!--  요기서 부터   -->
		<c:forEach var="result" items="${resultList}" varStatus="status" >
		
			<TR>
			<TD class="ledger_bbs_i_no noWrap"><c:out value="${result.snum}"/></TD>
			<TD class="ledger_bbs_i_draftdate cen"><c:out value="${result.draftdate}"/></TD>
			<TD class="ledger_bbs_i_draftdeptname cen"><c:out value="${result.draftdeptname}"/></TD> 
			<TD class="ledger_bbs_i_enforcedate cen"><c:out value="${result.enforcedate}"/></TD>
			<TD class="ledger_bbs_i_docregno cen"><c:out value="${result.docregno}"/></TD>
			<TD class="ledger_bbs_i_title cen"><c:out value="${result.title}"/></TD>
			<TD class="ledger_bbs_i_orgdraftdeptname cen"><c:out value="${result.orgdraftdeptname}"/></TD>
			<TD class="ledger_bbs_i_orgdraftername cen"><c:out value="${result.orgdraftername}"/></TD>
			</TR>
		</c:forEach>

		<!-- 요기 까지 -->
		</TABLE>
		
		<!--  글 목록 끝  --> 
</DIV>
</form:form>
</DIV>
</BODY>
</html>