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


<html>

<BODY class="content_body" style="height:99.5%;">

<DIV class=content_box style="HEIGHT: 100%; OVERFLOW-X: hidden; OVERFLOW-Y: hidden">
	<form:form commandName="searchVO" name="listForm" method="post">
	
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
												당첨자 리스트
	                           </span> 
	                       </h2>
						   </td>
		                </tr>
		            </table>
		        </div>
		        <!--title_area End-->
		</DIV>
			<!--  버튼모음 끝 -->
			<TABLE width="100%" class="content_lst no_under" id=mtrl_list_headers border=0 cellSpacing=0 cellPadding=0 name="mtrl_list_headers">
			<TBODY>
			
			<TR>

				<TH class="lottery_bbs_h_no cen">상품 ID</TH>
				<TH class="lottery_bbs_h_draftdate cen">상품이름</TH>
				<TH class="lottery_bbs_h_draftdeptname cen">당첨자 ID</TH>
				<TH class="lottery_bbs_h_enforcedate cen">당첨자 이름</TH>
			</TR></TBODY></TABLE>
			
			<TABLE class=content_lst id=mtrl_list_items name="mtrl_list_items">
	
			<!--  글목록 시작  -->
			<TBODY>
 
	
			<!--  요기서 부터   -->
			<c:forEach var="result" items="${resultList}" varStatus="status">
				<TR>
					<TD class="lottery_bbs_i_no noWrap"></a><c:out value="${result.prize_id}"/></TD>
					<TD class="lottery_bbs_i_draftdate cen"><c:out value="${result.prize_name}"/></TD>
					<TD class="lottery_bbs_i_draftdeptname cen"><c:out value="${result.user_id}"/></TD> 
					<TD class="lottery_bbs_i_enforcedate cen"><c:out value="${result.user_name}"/></TD>
				<TR>
				
				<c:choose>
				<c:when test="${status.count} == 0 }">

					<TD class="lottery_bbs_i_draftdate cen"></TD>
					<TD class="lottery_bbs_i_draftdeptname cen"> 데이터가 없네요 ... </TD> 
					<TD class="lottery_bbs_i_enforcedate cen"></TD>
					
				</c:when>
				</c:choose>
			</c:forEach>
			<!-- 요기 까지 -->
			</TBODY>
			</TABLE>
			
			<!--  글 목록 끝  --> 
	</DIV>
	</form:form>
</DIV>

</BODY>
</html>