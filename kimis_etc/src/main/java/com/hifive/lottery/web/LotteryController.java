package com.hifive.lottery.web;

import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.tools.JavaFileManager.Location;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.SessionAttributes;

import com.hifive.lottery.service.LotteryDefaultVO;
import com.hifive.lottery.service.LotteryService;
import com.hifive.lottery.service.LotteryVO;

import egovframework.rte.fdl.property.EgovPropertyService;
import egovframework.rte.ptl.mvc.tags.ui.pagination.PaginationInfo;

@Controller
public class LotteryController 
{
	/** Service */
    @Resource(name = "lotteryService")
    private LotteryService lotteryService;
    
    /** EgovPropertyService */
    @Resource(name = "propertiesService")
    protected EgovPropertyService propertiesService;

    protected Log log = LogFactory.getLog(this.getClass());
    
    /**
     * 콘도추첨 관리자 frame 
     * 2014 04 29 이재성 PM 요청
     */
    @RequestMapping(value="/lottery/adminMain.do")
    public String condoLotteryFrameView(@ModelAttribute("searchVO") LotteryVO searchVO
    		, ModelMap model
    		, HttpServletRequest request
    		, HttpServletResponse response) throws Exception {
    	
    	String requestURL;
    	requestURL = "/lottery/adminframe";
    	return requestURL;
    }

    /**
     * 콘도 추첨 관리자 view
     * @param searchVO
     * @param model
     * @param request
     * @return
     * @throws Exception
     * 
     */
    @RequestMapping(value="/lottery/adminInit.do")
    public String condoLotteryAdmin(@ModelAttribute("searchVO") LotteryVO searchVO
    		, ModelMap model
    		, HttpServletRequest request
    		, HttpServletResponse response) throws Exception {
    	
    	LotteryVO lvo = new LotteryVO();
    	
    	String strAdminActionTag = request.getParameter("admActTag");
    	int iResultCnt = 0;
    	
    	if("PRIZE".equals(strAdminActionTag))
    	{
    		iResultCnt = lotteryService.deletePrizeList(lvo);
    	}
    	else if("REQUEST".equals(strAdminActionTag))
    	{
    		iResultCnt = lotteryService.deleteRequestList(lvo);
    	}
    	else if("WIN".equals(strAdminActionTag))
    	{
    		iResultCnt = lotteryService.deleteWinnerList(lvo);
    	}
    	
    	// 화면처리
    	if("VIEW".endsWith(strAdminActionTag))
    	{
    		model.addAttribute("rtnSFlag","VIEW");
    	}
    	else
    	{
    		if(iResultCnt > 0)
    		{
    	    	model.addAttribute("rtnSFlag","OK");
    		}
    	}
    	
    	String requestURL;
    	requestURL = "/lottery/adminInit";
    	return requestURL;
    }
    
    
    
    /**
     * 콘도 추첨 결과 리스트
     * @param searchVO
     * @param model
     * @param request
     * @return
     * @throws Exception
     */
    @RequestMapping(value="/lottery/winnerResult.do")
    public String condoLotteryWinnerResultList(@ModelAttribute("searchVO") LotteryVO searchVO
    		, ModelMap model
    		, HttpServletRequest request
    		, HttpServletResponse response) throws Exception {
    	
    	String requestURL;
    	
    	List prizeList = lotteryService.selectCondoWinResultList(searchVO);
    	model.addAttribute("resultList", prizeList);
    	
    	requestURL = "/lottery/winResult";
    	return requestURL;
    }

    
    /**
     * 콘도 추첨 신청
     * @param searchVO
     * @param model
     * @param request
     * @return
     * @throws Exception
     */
    @RequestMapping(value="/lottery/regprizelist.do")
    public String regLotteryPrizeList(@ModelAttribute("searchVO") LotteryDefaultVO searchVO, ModelMap model, HttpServletRequest request, HttpServletResponse response) throws Exception {
    	
    	String requestURL;
    	LotteryVO lvo = null;
    	String strUDTag       = request.getParameter("prize_cud_tag");
    	String strUserId      = request.getParameter("user_id");
    	String[] arrPrizeid   = request.getParameterValues("mtrlchk");
    	String strUcPrizeId	= request.getParameter("uc_prize_id");
    	lvo = new LotteryVO();
    	lvo.setUser_id(strUserId);
    	int rtnInsert = 0;
    	String SQLResult = "";
    	
    	if("I".equals(strUDTag))
    	{
    		lvo = new LotteryVO();
    		lvo.setUser_id(strUserId);
    		for(int i=0; i<arrPrizeid.length; i++)
    		{
    			lvo.setPrize_id(arrPrizeid[i]);
    			rtnInsert = lotteryService.insertReqLotteryPrize(lvo);
    		}
    		
    		if(rtnInsert > 0)
    		{
    			SQLResult = "OK";
    		}
    	} else if("UC".equals(strUDTag)) {
    		lvo = new LotteryVO();
    		lvo.setUser_id(strUserId);
    		lvo.setPrize_id(strUcPrizeId);
    		rtnInsert = lotteryService.deleterUserCancelPrize(lvo);
    		if(rtnInsert > 0)
    		{
    			SQLResult = "UCOK";
    		}
    	}
    	
    	int reqPrizeCnt = 0;
    	reqPrizeCnt = lotteryService.selectReqLotteryPrizeListCount(lvo);
    	
    	searchVO.setPageUnit(propertiesService.getInt("pageUnit"));
    	searchVO.setPageSize(propertiesService.getInt("pageSize"));
    	
    	/** pageing setting */
    	PaginationInfo paginationInfo = new PaginationInfo();
    	paginationInfo.setCurrentPageNo(searchVO.getPageIndex());
    	paginationInfo.setRecordCountPerPage(searchVO.getPageUnit());
    	paginationInfo.setPageSize(searchVO.getPageSize());
    	
    	searchVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
    	searchVO.setLastIndex(paginationInfo.getLastRecordIndex());
    	searchVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());
    	
    	searchVO.setUserId(strUserId);
    	
    	List prizeList = lotteryService.selectLotteryPrizeList(searchVO);
    	model.addAttribute("resultList", prizeList);
    	
    	int totCnt = lotteryService.selectLotteryPrizeListCount(searchVO);
    	paginationInfo.setTotalRecordCount(totCnt);
    	model.addAttribute("paginationInfo", paginationInfo);
    	
    	
    	/** search Condition 검색된 내용을 가지고 페이징을 계속 할수 있게..  */
    	model.addAttribute("searchKeyword", searchVO.getSearchKeyword());
    	model.addAttribute("searchCondition",searchVO.getSearchCondition());
    	model.addAttribute("searchCheck",searchVO.getSearchCheck());
    	
    	// 이 숫자로 콘도 신청 카운트를 제한한다 
    	model.addAttribute("reqPrizeCnt",reqPrizeCnt);
    	model.addAttribute("rtnSFlag",SQLResult);
    	model.addAttribute("strUserId",strUserId);
    	requestURL = "/lottery/reqprizelist";
    	
    	return requestURL;
    }
 
    @RequestMapping(value="/lottery/prizelist.do")
    public String viewLotteryPrizeList(@ModelAttribute("searchVO") LotteryDefaultVO searchVO, ModelMap model) throws Exception {
    	
    	String requestURL;
    	
    	searchVO.setPageUnit(propertiesService.getInt("pageUnit"));
    	searchVO.setPageSize(propertiesService.getInt("pageSize"));
    	
    	/** pageing setting */
    	PaginationInfo paginationInfo = new PaginationInfo();
    	paginationInfo.setCurrentPageNo(searchVO.getPageIndex());
    	paginationInfo.setRecordCountPerPage(searchVO.getPageUnit());
    	paginationInfo.setPageSize(searchVO.getPageSize());
    	
    	searchVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
    	searchVO.setLastIndex(paginationInfo.getLastRecordIndex());
    	searchVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());
    	
    	List prizeList = lotteryService.selectLotteryAdminPrizeList(searchVO);
    	model.addAttribute("resultList", prizeList);
    	
    	int totCnt = lotteryService.selectLotteryPrizeListCount(searchVO);
    	paginationInfo.setTotalRecordCount(totCnt);
    	model.addAttribute("paginationInfo", paginationInfo);
    	
    	
    	/** search Condition 검색된 내용을 가지고 페이징을 계속 할수 있게..  */
    	model.addAttribute("searchKeyword", searchVO.getSearchKeyword());
    	model.addAttribute("searchCondition",searchVO.getSearchCondition());
    	model.addAttribute("searchCheck",searchVO.getSearchCheck());
    	
    	
    	requestURL = "/lottery/prizelist";
    	
    	return requestURL;
    }

    @RequestMapping(value="/lottery/udPrize.do")
    public String  updateLotteryPrize(@ModelAttribute("searchVO") LotteryDefaultVO searchVO, HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
    	
    	LotteryVO lvo;
    	LotteryDefaultVO dlvo = new LotteryDefaultVO();
    	
    	String requestURL = "";

    	int iSQLResult   = 0;
    	int iPrizeMaxCnt = 0;
    	
    	String strUDTag      = request.getParameter("prize_cud_tag");
    	String strPrizeid    = request.getParameter("prize_id");
    	String strPrizeName  = request.getParameter("prize_name");
    	String strPsbSDate   = request.getParameter("psb_sdate");
    	String strPsbLDate   = request.getParameter("psb_ldate");

    	
    	
    	if("U".equals(strUDTag) || "I".equals(strUDTag)) 
    	{
	    	strPsbSDate = strPsbSDate.replaceAll("-", "");
	    	strPsbLDate = strPsbLDate.replaceAll("-", "");
    	}

    	String[] strKeyValue   = request.getParameterValues("mtrlchk");

    	if("U".equals(strUDTag)) //update : tag = "U"
    	{
    		lvo = new LotteryVO();
        	lvo.setPrize_id(strPrizeid);
        	lvo.setPrize_name(strPrizeName);
        	lvo.setPsb_sdate(strPsbSDate);
        	lvo.setPsb_ldate(strPsbLDate);
        	
    		iSQLResult   = lotteryService.updateLotteryPrize(lvo);
    	}
    	else if ("I".equals(strUDTag))
    	{
    		lvo = new LotteryVO();
        	lvo.setPrize_name(strPrizeName);
        	lvo.setPsb_sdate(strPsbSDate);
        	lvo.setPsb_ldate(strPsbLDate);
        	
        	lotteryService.insertLotteryPrize(lvo);
    	}
    	else if ("D".equals(strUDTag))
    	{
    		for(int i=0; i<strKeyValue.length; i++)
        	{
        		lvo = new LotteryVO();
        		lvo.setPrize_id(strKeyValue[i]);
            	iSQLResult   = lotteryService.deleteLotteryPrize(lvo);
        	}
    	}
    	else 
    	{
        	//lottery/udPrize.do  호출에도 리스트 뜸
    	}
    	
    	//리스트를 다시 보여주기 위해 세팅..
    	searchVO.setPageUnit(propertiesService.getInt("pageUnit"));
    	searchVO.setPageSize(propertiesService.getInt("pageSize"));
    	
    	/** pageing setting */
    	PaginationInfo paginationInfo = new PaginationInfo();
		paginationInfo.setCurrentPageNo(searchVO.getPageIndex());
		paginationInfo.setRecordCountPerPage(searchVO.getPageUnit());
		paginationInfo.setPageSize(searchVO.getPageSize());
		
		searchVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
		searchVO.setLastIndex(paginationInfo.getLastRecordIndex());
		searchVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());
		
		List prizeList = lotteryService.selectLotteryPrizeList(searchVO);
        model.addAttribute("resultList", prizeList);
        
        int totCnt = lotteryService.selectLotteryPrizeListCount(searchVO);
		paginationInfo.setTotalRecordCount(totCnt);
        model.addAttribute("paginationInfo", paginationInfo);
        
            
        /** search Condition 검색된 내용을 가지고 페이징을 계속 할수 있게..  */
        model.addAttribute("searchKeyword", searchVO.getSearchKeyword());
        model.addAttribute("searchCondition",searchVO.getSearchCondition());
        model.addAttribute("searchCheck",searchVO.getSearchCheck());
        
        
    	requestURL =  "/lottery/prizelist";
    	
    	return requestURL;
    }
}
