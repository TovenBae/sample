/*
 * Copyright 2008-2009 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.hifive.cmmn.web;

import egovframework.rte.ptl.mvc.tags.ui.pagination.AbstractPaginationRenderer;

/**
 * @Class Name : KrImgPaginationRenderer.java
 * @Description : KrImgPaginationRenderer Class
 * @Modification Information @ @ 수정일 수정자 수정내용 @ --------- --------- ------------------------------- @ 2009.03.16 최초생성
 * 
 * @author Kim Jin Il
 * @since 2013. 11.15
 * @version 1.0
 * @see
 * 
 */
public class KrImgPaginationRenderer extends AbstractPaginationRenderer {

	/**
	 * PaginationRenderer
	 * 
	 * @see 개발프레임웍크 실행환경 개발팀
	 */
	public KrImgPaginationRenderer() {

		// String strWebDir = "/egovframework.guideprogram.basic/images/egovframework/cmmn/"; // localhost
		/*
		 * <SPAN class="num txt">처음</SPAN> firstPageLabel <SPAN class=css_arr id=prepage_icon name="prepage_icon"
		 * href="javascript:BBSMtrlList.gotoPage(-9);"> <SPAN class=arr_l></SPAN></SPAN>&nbsp; previousPageLabel
		 * 
		 * <SPAN class="num now">1</SPAN> currentPageLabel <span class="num"> <SPAN class=css_arr id=nextpage_icon
		 * name="nextpage_icon" href="javascript:BBSMtrlList.gotoPage(11);">
		 * 
		 * <SPAN class=arr_r></SPAN></SPAN> <SPAN class="num txt">마지막</SPAN>
		 */

		// String strWebDir = "/###ARTIFACT_ID###/images/egovframework/cmmn/";
		String strWebDir = "/###ARTIFACT_ID###/img/bbs/";

		firstPageLabel = "<span class=\"num txt\"><a href=\"#\" onclick=\"{0}({1}); return false;\">" + "처음</a></span>";
		previousPageLabel = "<SPAN class=css_arr id=prepage_icon name=\"prepage_icon\" href=\"#\" onclick=\"{0}({1}); return false;\"> <SPAN class=arr_l></SPAN></SPAN>&nbsp;";
		currentPageLabel = "<SPAN class=\"num now\">{0}</SPAN>";
		otherPageLabel = "<span class=\"num\"><a href=\"#\" onclick=\"{0}({1}); return false;\">{2}</a></span>";
		nextPageLabel = "<SPAN class=css_arr id=nextpage_icon name=\"nextpage_icon\" href=\"#\" onclick=\"{0}({1}); return false;\"><SPAN class=arr_r></SPAN></SPAN>";
		lastPageLabel = "<SPAN class=\"num txt\"><a href=\"#\" onclick=\"{0}({1}); return false;\">마지막</a></SPAN>";

		/*
		 * 
		 * firstPageLabel = "<a href=\"#\" onclick=\"{0}({1}); return false;\">" + "<image src='" + strWebDir +
		 * "btn_page_pre10.gif' border=0/></a>&#160;"; previousPageLabel =
		 * "<a href=\"#\" onclick=\"{0}({1}); return false;\">" +"<image src='" + strWebDir +
		 * "btn_page_pre1.gif' border=0/></a>&#160;"; currentPageLabel = "<strong>{0}</strong>&#160;"; otherPageLabel =
		 * "<a href=\"#\" onclick=\"{0}({1}); return false;\">{2}</a>&#160;"; nextPageLabel =
		 * "<a href=\"#\" onclick=\"{0}({1}); return false;\">" + "<image src='" + strWebDir +
		 * "btn_page_next10.gif' border=0/></a>&#160;"; lastPageLabel =
		 * "<a href=\"#\" onclick=\"{0}({1}); return false;\">" + "<image src='" + strWebDir +
		 * "btn_page_next1.gif' border=0/></a>&#160;";
		 */
	}
}
