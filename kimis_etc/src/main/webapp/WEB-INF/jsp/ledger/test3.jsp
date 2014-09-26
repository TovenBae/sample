<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="ui" uri="http://egovframework.gov/ctl/ui"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>


<link href="/css/ledger/basic80.css" rel="stylesheet" type="text/css" />
<link href="/css/ledger/bbs.css" rel="stylesheet" type="text/css" />

<html>

<BODY class=content_body id=bbsbody name="bbsbody"><DIV class=content_box style="HEIGHT: 100%; OVERFLOW-X: hidden; OVERFLOW-Y: hidden">
<DIV class=content>
<DIV class=title_area>
<H2 class=title><SPAN title="문서접수대장" id=title_txt_left style="CURSOR: pointer" name="title_txt_left" jQuery1385690872591="39">문 서 접 수 대 장</SPAN></H2></DIV>
<DIV class=srch_area>
<FIELDSET class=search><SELECT name=SEARCHITEM id=SEARCHITEM jQuery1385690872591="32"> <OPTION value=0 selected>제목</OPTION> <OPTION value=1>게시자</OPTION> <OPTION value=2>게시부서</OPTION></SELECT> <INPUT name=SearchText class=serch_input id=SearchText type=text jQuery1385690872591="177"> <A name=LiteSearch title=검색 class=srch_btn id=LiteSearch style="CURSOR: pointer" onfocus=blur(); jQuery1385690872591="175">검색</A> 
</FIELDSET> </DIV>
<DIV class=btn_area>



<DIV class=section_r>
<UL class=lst_option>
<LI class=horizon><SELECT name=filter class=listmanu id=filter onchange=BBSMtrlList.filterSearch();> <OPTION value=all selected>전체</OPTION> <OPTION value=unread>읽지않은게시물</OPTION> <OPTION value=read>읽은게시물</OPTION> <OPTION value=urgency>긴급게시물</OPTION></SELECT> </LI></UL>
<UL class=btn_icons>
<LI class=btn_divider></LI></UL>
<UL class=lst_option>
<LI class=horizon><SELECT name=lstSize id=lstSize onchange=BBSMtrlList.setLppSize(); selected="selected"> <OPTION value=15 selected>15</OPTION> <OPTION value=20>20</OPTION> <OPTION value=30>30</OPTION> <OPTION value=40>40</OPTION> <OPTION value=50>50</OPTION></SELECT> </LI></UL>
<UL class=btn_icons>
<LI class=btn_divider></LI>
<LI><SPAN><IMG name=gotoPP title=이전페이지 align=absMiddle id=gotoPP src="/img/gw8/before_g.gif" border=0 jQuery1385690872591="35"></SPAN> </LI>
<LI><SPAN><IMG name=gotoNP title=다음페이지 align=absMiddle id=gotoNP src="/img/gw8/next_g.gif" border=0 jQuery1385690872591="36"></SPAN> </LI>
<LI class=btn_divider></LI>
<LI><SPAN><IMG name=printicon title=인쇄 align=absMiddle id=printicon style="CURSOR: pointer" src="/img/gw8/print.gif" border=0 jQuery1385690872591="47"></SPAN> </LI>
<LI><SPAN><IMG name=favoriteaddicon title=즐겨찾기추가 align=absMiddle id=favoriteaddicon style="CURSOR: pointer" src="/img/gw8/favor_add.gif" border=0 jQuery1385690872591="48"></SPAN> </LI>
<LI style="DISPLAY: none" jQuery1385690872591="27"><SPAN jQuery1385690872591="26"><IMG name=favoritedelicon title=즐겨찾기삭제 align=absMiddle id=favoritedelicon style="CURSOR: pointer" src="/img/gw8/favor_del.gif" border=0 jQuery1385690872591="49"></SPAN> </LI>
<LI><SPAN><IMG name=refleshicon title=새로고침 align=absMiddle id=refleshicon style="CURSOR: pointer" src="/img/gw8/btn_reload.gif" border=0 jQuery1385690872591="50"></SPAN> </LI></UL></DIV></DIV>
<TABLE width="100%" class="content_lst no_under" id=mtrl_list_headers border=0 cellSpacing=0 cellPadding=0 name="mtrl_list_headers">
<TBODY>
<TR>
<TH class="mtrl_header_check cen"><INPUT name=listcheck id=listcheck onclick=JavaScript:CheckItem(); type=checkbox value=""></TH>
<TH class="mtrl_header_status cen">상태 <IMG style="CURSOR: pointer" onclick=javascript:viewDescIcon(); src="/img/gw8/ic_que.gif"></TH>
<TH class="mtrl_header_id cen"><A name=sortbyid title="번호에 대한 정렬하기" id=sortbyid style="CURSOR: pointer" jQuery1385690872591="51">번호</A></TH>
<TH class="mtrl_header_brdname cen" style="DISPLAY: none" jQuery1385690872591="30"><A name=sortbybrd title="게시판명에 대한 정렬하기" id=sortbybrd style="CURSOR: pointer" jQuery1385690872591="52">게시판명</A></TH>
<TH class="mtrl_header_title cen" style="WIDTH: 100%"><A name=sortbytitle title="제목에 대한 정렬하기" id=sortbytitle style="CURSOR: pointer" jQuery1385690872591="53">제목</A></TH>
<TH class="mtrl_header_dept cen" style="DISPLAY: none" jQuery1385690872591="31"><A name=sortbydept title="부서에 대한 정렬하기" id=sortbydept style="CURSOR: pointer" jQuery1385690872591="54">부서</A></TH>
<TH class="mtrl_header_sender cen"><A name=sortbyposter title="게시자에 대한 정렬하기" id=sortbyposter style="CURSOR: pointer" jQuery1385690872591="55">게시자</A></TH>
<TH class="mtrl_header_count cen"><A name=sortbycount title="조회에 대한 정렬하기" id=sortbycount style="CURSOR: pointer" jQuery1385690872591="56">조회</A></TH>
<TH class="mtrl_header_pdate cen"><A name=sortbypdate title="게시일에 대한 정렬하기" class=descend id=sortbypdate style="CURSOR: pointer" jQuery1385690872591="57">게시일</A></TH>
<TH class="mtrl_header_edate cen"><A name=sortbyedate title="종료일에 대한 정렬하기" id=sortbyedate style="CURSOR: pointer" jQuery1385690872591="58">종료일</A></TH></TR></TBODY></TABLE>
<TABLE class=content_lst id=mtrl_list_items name="mtrl_list_items">

<!--  글목록 시작  -->
<TBODY>
<TR>
<TD class=mtrl_item_check noWrap><INPUT name=mtrlchk id=mtrlchk onclick=javascript:checkHeadCheckBox(this); type=checkbox value=0000000dx></TD>
<TD class=mtrl_item_status noWrap><IMG src="/img/bbs/BR1.GIF" border=0></TD>
<TD class=mtrl_item_id noWrap>7</TD>
<TD title="테스트 글" class=mtrl_item_title><A name=id0000000dx id=id0000000dx style="CURSOR: pointer" onclick="javascript:BBSMtrlList.openBMRead('0000000dx');">테스트 글</A></TD>
<TD class=mtrl_item_sender noWrap><A href="javascript:showUserProperty('501000724&amp;K=00i8x1ETB3 ');">최민경</A></TD>
<TD class=mtrl_item_count noWrap>0/0/0</TD>
<TD class=mtrl_item_pdate noWrap>2013.11.22</TD>
<TD class=mtrl_item_edate noWrap>영구</TD>
<TR>
<TD class=mtrl_item_check noWrap><INPUT name=mtrlchk id=mtrlchk onclick=javascript:checkHeadCheckBox(this); type=checkbox value=0000000bs></TD>
<TD class=mtrl_item_status noWrap><IMG src="/img/bbs/BR1.GIF" border=0></TD>
<TD class=mtrl_item_id noWrap>6</TD>
<TD title="[사내교육] KR 크레딧 세미나 관련 사내교육(10월 31일 15시)-자료첨부" class=mtrl_item_title><A name=id0000000bs id=id0000000bs style="CURSOR: pointer" onclick="javascript:BBSMtrlList.openBMRead('0000000bs');">[사내교육] KR 크레딧 세미나 관련 사내교육(10월 31일 15시)-자료첨부</A></TD>
<TD class=mtrl_item_sender noWrap><A href="javascript:showUserProperty('501000112&amp;K=00i8x1ETB3 ');">배성엽</A></TD>
<TD class=mtrl_item_count noWrap>0/0/0</TD>
<TD class=mtrl_item_pdate noWrap>2013.11.21</TD>
<TD class=mtrl_item_edate noWrap>영구</TD>
<TR>
<TD class=mtrl_item_check noWrap><INPUT name=mtrlchk id=mtrlchk onclick=javascript:checkHeadCheckBox(this); type=checkbox value=0000000br></TD>
<TD class=mtrl_item_status noWrap><IMG src="/img/bbs/BR2.GIF" border=0></TD>
<TD class=mtrl_item_id noWrap>5</TD>
<TD title="공기업 평가방법론 guide line" class=mtrl_item_title><A name=id0000000br id=id0000000br style="CURSOR: pointer" onclick="javascript:BBSMtrlList.openBMRead('0000000br');">공기업 평가방법론 guide line</A></TD>
<TD class=mtrl_item_sender noWrap><A href="javascript:showUserProperty('501000112&amp;K=00i8x1ETB3 ');">배성엽</A></TD>
<TD class=mtrl_item_count noWrap>1/0/0</TD>
<TD class=mtrl_item_pdate noWrap>2013.11.21</TD>
<TD class=mtrl_item_edate noWrap>영구</TD>
<TR>
<TD class=mtrl_item_check noWrap><INPUT name=mtrlchk id=mtrlchk onclick=javascript:checkHeadCheckBox(this); type=checkbox value=0000000bq></TD>
<TD class=mtrl_item_status noWrap><IMG src="/img/bbs/BR1.GIF" border=0></TD>
<TD class=mtrl_item_id noWrap>4</TD>
<TD title="제18회 SRE 결과분석" class=mtrl_item_title><A name=id0000000bq id=id0000000bq style="CURSOR: pointer" onclick="javascript:BBSMtrlList.openBMRead('0000000bq');">제18회 SRE 결과분석</A></TD>
<TD class=mtrl_item_sender noWrap><A href="javascript:showUserProperty('501000112&amp;K=00i8x1ETB3 ');">배성엽</A></TD>
<TD class=mtrl_item_count noWrap>0/0/0</TD>
<TD class=mtrl_item_pdate noWrap>2013.11.21</TD>
<TD class=mtrl_item_edate noWrap>영구</TD>
<TR>
<TD class=mtrl_item_check noWrap><INPUT name=mtrlchk id=mtrlchk onclick=javascript:checkHeadCheckBox(this); type=checkbox value=0000000b9></TD>
<TD class=mtrl_item_status noWrap><IMG src="/img/bbs/BR1.GIF" border=0></TD>
<TD class=mtrl_item_id noWrap>3</TD>
<TD title="[Rating Policy] 변제유예기간(grace period) 적용 채무에 대한 신용등급 부여 방식" class=mtrl_item_title><A name=id0000000b9 id=id0000000b9 style="CURSOR: pointer" onclick="javascript:BBSMtrlList.openBMRead('0000000b9');">[Rating Policy] 변제유예기간(grace period) 적용 채무에 대한 신용등급 부여 방식</A></TD>
<TD class=mtrl_item_sender noWrap><A href="javascript:showUserProperty('501000099&amp;K=00i8x1ETB3 ');">고광호</A></TD>
<TD class=mtrl_item_count noWrap>0/0/0</TD>
<TD class=mtrl_item_pdate noWrap>2013.11.21</TD>
<TD class=mtrl_item_edate noWrap>영구</TD>
<TR>
<TD class=mtrl_item_check noWrap><INPUT name=mtrlchk id=mtrlchk onclick=javascript:checkHeadCheckBox(this); type=checkbox value=0000000b8></TD>
<TD class=mtrl_item_status noWrap><IMG src="/img/bbs/BR1.GIF" border=0></TD>
<TD class=mtrl_item_id noWrap>2</TD>
<TD title="[Rating Policy] 보증채 신용평가시 보증의무 이행의 적시성 판단" class=mtrl_item_title><A name=id0000000b8 id=id0000000b8 style="CURSOR: pointer" onclick="javascript:BBSMtrlList.openBMRead('0000000b8');">[Rating Policy] 보증채 신용평가시 보증의무 이행의 적시성 판단</A></TD>
<TD class=mtrl_item_sender noWrap><A href="javascript:showUserProperty('501000099&amp;K=00i8x1ETB3 ');">고광호</A></TD>
<TD class=mtrl_item_count noWrap>0/0/0</TD>
<TD class=mtrl_item_pdate noWrap>2013.11.21</TD>
<TD class=mtrl_item_edate noWrap>영구</TD>
<TR>
<TD class=mtrl_item_check noWrap><INPUT name=mtrlchk id=mtrlchk onclick=javascript:checkHeadCheckBox(this); type=checkbox value=0000000b7></TD>
<TD class=mtrl_item_status noWrap><IMG src="/img/bbs/BR1.GIF" border=0></TD>
<TD class=mtrl_item_id noWrap>1</TD>
<TD title="[사내교육]“헬스케어, 새로운 미래를(Healthcare, Meet the Future)" class=mtrl_item_title><A name=id0000000b7 id=id0000000b7 style="CURSOR: pointer" onclick="javascript:BBSMtrlList.openBMRead('0000000b7');">[사내교육]“헬스케어, 새로운 미래를 만나다(Healthcare, Meet the Future)</A></TD>
<TD class=mtrl_item_sender noWrap><A href="javascript:showUserProperty('501000099&amp;K=00i8x1ETB3 ');">고광호</A></TD>
<TD class=mtrl_item_count noWrap>0/0/0</TD>
<TD class=mtrl_item_pdate noWrap>2013.11.21</TD>
<TD class=mtrl_item_edate noWrap>영구</TD>
</TBODY>
<!--  글 목록 끝  --> 
</TABLE>
<DIV class=paginate_area>
<DIV class=Paginate id=pagenation name="pagenation">
<SPAN class="num txt">처음</SPAN><SPAN class=css_arr id=prepage_icon name="prepage_icon" href="javascript:BBSMtrlList.gotoPage(-9);"><SPAN class=arr_l></SPAN></SPAN>&nbsp;<SPAN class="num now">1</SPAN><SPAN class=css_arr id=nextpage_icon name="nextpage_icon" href="javascript:BBSMtrlList.gotoPage(11);"><SPAN class=arr_r></SPAN></SPAN><SPAN class="num txt">마지막</SPAN>
<DIV id=totalPage style="DISPLAY: none" name="totalPage">0</DIV></DIV></DIV>

</DIV></DIV>
<DIV id=mtrl_write_panel style="HEIGHT: 100%; DISPLAY: none" name="mtrl_write_panel" jQuery1385690872591="38"><IFRAME name=bbs_rw_div width="100%" height="100%" id=bbs_rw_div src="" frameBorder=no scrolling=auto style="HEIGHT: 100%" cellpadding="0" cellspacing="0"></IFRAME></DIV></BODY>

</html>