<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="ui" uri="http://egovframework.gov/ctl/ui"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>

<%

out.println("test page");
%>
<link href="/KIMIS/css/ledger/basic80.css" rel="stylesheet" type="text/css" />
<link href="/KIMIS/css/ledger/bbs.css" rel="stylesheet" type="text/css" />
<html>
<body>

<a>test page 2 </a>

		<table width="100%" border="0" cellpadding="0" cellspacing="0">
			<colgroup>
				<col width="40">				
				<col width="100">
				<col width="150">
				<col width="80">
				<col width="">
				<col width="60">
			</colgroup>		  
			<tr>
				<th align="center">No</th>
				<th align="center">카테고리ID</th>
				<th align="center">카테고리명</th>
				<th align="center">사용여부</th>
				<th align="center">Description</th>
				<th align="center">등록자</th>
				<th align="center">등록자</th>
				<th align="center">등록자</th>
				<th align="center">등록자</th>
				<th align="center">등록자</th>
			</tr>
			<c:forEach var="result" items="${resultList}" varStatus="status">
			<tr>
				<td align="center" class="listtd"><c:out value="${status.count}"/></td>
				<td align="center" class="listtd"><a href="javascript:fn_egov_select('<c:out value="${result.id}"/>')"><c:out value="${result.id}"/></a></td>
				<td align="left" class="listtd"><c:out value="${result.draftdate}"/>&nbsp;</td>
				<td align="center" class="listtd"><c:out value="${result.draftdeptname}"/>&nbsp;</td>
				<td align="center" class="listtd"><c:out value="${result.docregno}"/>&nbsp;</td>
				<td align="center" class="listtd"><c:out value="${result.title}"/>&nbsp;</td>
				<td align="center" class="listtd"><c:out value="${result.title}"/>&nbsp;</td>
				<td align="center" class="listtd"><c:out value="${result.drafterdeptid}"/>&nbsp;</td>
				<td align="center" class="listtd"><c:out value="${result.grpno}"/>&nbsp;</td>
				<td align="center" class="listtd"><c:out value="${result.recpman}"/>&nbsp;</td>
			</tr>
			</c:forEach>
		</table>


</body>
<body id="bbsbody" name="bbsbody" class="content_body">
<div class="content_box" style="height:100%;">
	<div class="content">
	<div class="title_area">
		<h2 class="title">
			<span id="title_txt_left" name="title_txt_left"></span>
		</h2>
	</div>
	<!-- 단순검색 영역 start -->
	<div class="srch_area">
		<fieldset class="search">
			<select name="SEARCHITEM" id="SEARCHITEM">
				<option value="0"><fmt:message bundle="${bbsBundle}" key="RC_SUBJECT"/></option>
				<option value="1"><fmt:message bundle="${bbsBundle}" key="RC_POSTER"/></option>
				<option value="2"><fmt:message bundle="${bbsBundle}" key="PUBLISH_DEPT"/></option>
			</select>
			<input class="serch_input" id="SearchText" name="SearchText" type="text">
			<a name="LiteSearch" id="LiteSearch" onfocus="blur();" title='<fmt:message bundle="${bbsBundle}" key="C129"/>' class="srch_btn"><fmt:message bundle="${bbsBundle}" key="C129"/></a>
			<a name="DetailSearch" id="DetailSearch" onfocus="blur();" title='<fmt:message bundle="${bbsBundle}" key="W1285"/>' class="srch_btn"><fmt:message bundle="${bbsBundle}" key="W1285"/></a>
		</fieldset>
	</div>
	<!-- 단순검색 영역 end -->

	<div class="btn_area">
		<ul class="btns">
			<li name="writeButtonDiv"  id="writeButtonDiv"><span title="<fmt:message bundle="${bbsBundle}" key="W1401"/>"><a name="writeButton" id="writeButton" href="#"><fmt:message bundle="${bbsBundle}" key="W1401"/></a></span></li>
			<li name="toreadButtonDiv"  id="toreadButtonDiv"><span title="<fmt:message bundle="${bbsBundle}" key="W1174"/>"><a name="toreadButton" id="toreadButton" href="#"><fmt:message bundle="${bbsBundle}" key="W1389"/></a></span></li>
			<li name="moveButtonDiv"  id="moveButtonDiv"><span title="<fmt:message bundle="${bbsBundle}" key="W1213"/>"><a name="moveButton" id="moveButton" href="#"><fmt:message bundle="${bbsBundle}" key="W1393"/></a></span></li>
			<!-- li name="saveButtonDiv"  id="saveButtonDiv"><span title="<fmt:message bundle="${bbsBundle}" key="W1263"/>"><a name="saveButton" id="saveButton" href="#"><fmt:message bundle="${bbsBundle}" key="W1263"/></a></span></li-->
			<li name="delButtonDiv"  id="delButtonDiv"><span title="<fmt:message bundle="${bbsBundle}" key="W1264"/>"><a name="delButton" id="delButton" href="#"><fmt:message bundle="${bbsBundle}" key="W1385"/></a></span></li>
			<li name="regClubButtonDiv"  id="regClubButtonDiv" style="display:none;"><span title="<fmt:message bundle="${bbsBundle}" key="C118"/>"><a name="regClubButton" id="regClubButton" href="#"><fmt:message bundle="${bbsBundle}" key="C118"/></a></span></li>
			<li name="unRegClubButtonDiv"  id="unRegClubButtonDiv" style="display:none;"><span title="<fmt:message bundle="${bbsBundle}" key="C119"/>"><a name="unRegClubButton" id="unRegClubButton" href="#"><fmt:message bundle="${bbsBundle}" key="C119"/></a></span></li>
			<li name="clubInfoButtonDiv"  id="clubInfoButtonDiv" style="display:none;"><span title="<fmt:message bundle="${bbsBundle}" key="C120"/>"><a name="clubInfoButton" id="clubInfoButton" href="#"><fmt:message bundle="${bbsBundle}" key="C120"/></a></span></li>
		</ul>

		<div class="section_r">
			<ul class="lst_option">
				<li class="horizon">
					<select class="listmanu" id="filter" name="filter" onchange="BBSMtrlList.filterSearch();">
						<option value="all"><fmt:message bundle="${bbsBundle}" key="W2087"/></option>
						<option value="unread"><fmt:message bundle="${bbsBundle}" key="W2088"/></option>
						<option value="read"><fmt:message bundle="${bbsBundle}" key="W2089"/></option>
						<option value="urgency"><fmt:message bundle="${bbsBundle}" key="W1222"/></option>
					</select>
				</li>
			</ul>

			<ul class="btn_icons">
				<li class="btn_divider"></li>
			</ul>
			
			<ul class="lst_option">
				<li class="horizon">
					<select id="lstSize" name="lstSize" onchange="BBSMtrlList.setLppSize();">
						<option value="15">15</option>
						<option value="20">20</option>
						<option value="30">30</option>
						<option value="40">40</option>
						<option value="50">50</option>
					</select>
				</li>
			</ul>
		
			<ul class="btn_icons">
				<li class="btn_divider"></li>
				<li>
					<span><img name="gotoPP" id="gotoPP" src="/img/gw8/before.gif" border="0" align="absmiddle" title="<fmt:message bundle="${bbsBundle}" key="BEFORE_PAGE"/>"></span>
				</li>				
				<li>
					<span><img name="gotoNP" id="gotoNP" border=0 src="/img/gw8/next.gif" align="absmiddle" title="<fmt:message bundle="${bbsBundle}" key="NEXT_PAGE"/>"></span>
				</li>
				<li class="btn_divider"></li>
				
				<li>
					<span><img name="printicon" id="printicon" src="/img/gw8/print.gif" border="0" align="absmiddle" title="<fmt:message bundle="${bbsBundle}" key="W093"/>"></span>
				</li>				
				
				<li>
					<span><img name="favoriteaddicon" id="favoriteaddicon" src="/img/gw8/favor_add.gif" border="0" align="absmiddle" title="<fmt:message bundle="${bbsBundle}" key="W1144"/>"></span>
				</li>				
				<li >
					<span><img name="favoritedelicon" id="favoritedelicon" src="/img/gw8/favor_del.gif" border=0 align="absmiddle" title="<fmt:message bundle="${bbsBundle}" key="W1142"/>" /></span>
				</li>				
				<li>
					<span><img name="refleshicon" id="refleshicon" src="/img/gw8/btn_reload.gif" border="0" align="absmiddle" title="<fmt:message bundle="${bbsBundle}" key="W1296"/>" /></span>
				</li>
			</ul>
		</div>
	</div>

	<table id="mtrl_list_headers" name="mtrl_list_headers" border="0" width="100%" cellspacing="0" cellpadding="0" class="content_lst no_under">
		<tr>
			<th class="mtrl_header_check cen"><input type='checkbox' name="listcheck" id='listcheck' onclick='JavaScript:CheckItem();'></th>
			<th class="mtrl_header_status cen"><fmt:message bundle="${bbsBundle}" key="W1357"/> <img style="cursor:pointer" onclick="javascript:viewDescIcon();" src="/img/gw8/ic_que.gif"></th>
			<th class="mtrl_header_id cen"><a name="sortbyid" id="sortbyid" title="<fmt:message bundle="${bbsBundle}" key="W1362"/><fmt:message bundle="${bbsBundle}" key="SORTBY_LABEL"/>"><fmt:message bundle="${bbsBundle}" key="W1362"/></a></th>
			<th class="mtrl_header_brdname cen"><a name="sortbybrd" id="sortbybrd" title="<fmt:message bundle="${bbsBundle}" key="W1300"/><fmt:message bundle="${bbsBundle}" key="SORTBY_LABEL"/>"><fmt:message bundle="${bbsBundle}" key="W1300"/></a></th>
			<th class="mtrl_header_title cen"><a name="sortbytitle" id="sortbytitle" title="<fmt:message bundle="${bbsBundle}" key="W1390"/><fmt:message bundle="${bbsBundle}" key="SORTBY_LABEL"/>"><fmt:message bundle="${bbsBundle}" key="W1390"/></a></th>
			<th class="mtrl_header_dept cen"><a name="sortbydept" id="sortbydept" title="<fmt:message bundle="${bbsBundle}" key="W1394"/><fmt:message bundle="${bbsBundle}" key="SORTBY_LABEL"/>"><fmt:message bundle="${bbsBundle}" key="W1394"/></a></th>
			<th class="mtrl_header_sender cen"><a name="sortbyposter" id="sortbyposter" title="<fmt:message bundle="${bbsBundle}" key="W1344"/><fmt:message bundle="${bbsBundle}" key="SORTBY_LABEL"/>"><fmt:message bundle="${bbsBundle}" key="W1344"/></a></th>
			<th class="mtrl_header_count cen"><a name="sortbycount" id="sortbycount" title="<fmt:message bundle="${bbsBundle}" key="C078"/><fmt:message bundle="${bbsBundle}" key="SORTBY_LABEL"/>"><fmt:message bundle="${bbsBundle}" key="C078"/></a></th>
			<th class="mtrl_header_pdate cen"><a name="sortbypdate" id="sortbypdate" title="<fmt:message bundle="${bbsBundle}" key="W1338"/><fmt:message bundle="${bbsBundle}" key="SORTBY_LABEL"/>"><fmt:message bundle="${bbsBundle}" key="W1338"/></a></th>
			<th class="mtrl_header_edate cen"><a name="sortbyedate" id="sortbyedate" title="<fmt:message bundle="${bbsBundle}" key="W1336"/><fmt:message bundle="${bbsBundle}" key="SORTBY_LABEL"/>"><fmt:message bundle="${bbsBundle}" key="W1336"/></a></th>
		</tr>
	</table>
	<table id="mtrl_list_items" name="mtrl_list_items" class="content_lst"><tbody></tbody></table>
	<!-- 페이지네이션 영역-->	
		<div class="paginate_area"> 
            <div class="Paginate" name="pagenation" id="pagenation"></div>
        </div>
	<!-- 페이지네이션 영역  end  -->	
</div>
</div>
<div id="mtrl_write_panel" name="mtrl_write_panel">
<iframe src="" id="bbs_rw_div" name="bbs_rw_div" frameborder="no" scrolling="auto" height="100%" width="100%" cellspacing="0" cellpadding="0"></iframe>
</div>
</body>

</html>