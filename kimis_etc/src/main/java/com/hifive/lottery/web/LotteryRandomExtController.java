package com.hifive.lottery.web;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import com.hifive.lottery.service.LotteryService;
import com.hifive.lottery.service.LotteryVO;

import egovframework.rte.fdl.property.EgovPropertyService;

@Controller
public class LotteryRandomExtController {
	/** Service */
    @Resource(name = "lotteryService")
    private LotteryService lotteryService;
    
    /** EgovPropertyService */
    @Resource(name = "propertiesService")
    protected EgovPropertyService propertiesService;

    protected Log log = LogFactory.getLog(this.getClass());
    
    
    @RequestMapping(value="/lottery/getWinExt.do")
    public String getRandomWinUserExt(
    		ModelMap model
    		, HttpServletRequest request
    		) throws Exception {
    	
    	LotteryVO lvo_prize;
    	LotteryVO searchVO  = new LotteryVO();
    	LotteryVO lvo_win;
    	
    	//1. 상품리스트를 받아옴 
    	List<LotteryVO> lstPrizeList = new ArrayList<LotteryVO>();
    	List<LotteryVO> lstWinnerList = new ArrayList<LotteryVO>();
    	
    	lstPrizeList =  lotteryService.selectLotteryAllPrizeList(searchVO);
   
    	//2. 해당 상품 번호를 기준으로 당첨자 구함
    	for(int i =0; i<lstPrizeList.size(); i++ )
    	{   
    		lvo_prize = new LotteryVO();
    		lvo_prize = lstPrizeList.get(i);
    		
    		searchVO.setPrize_id(lvo_prize.getPrize_id());
    		
    		System.out.println(" 추첨할 상품 번호 ::: "+lvo_prize.getPrize_id());
    		
        //3. 상품리스트의 prize_id 를 기준으로 해당 구한 랜덤 리스트중 첫번째 유저를 가져옴	
    		lstWinnerList = lotteryService.selectLotteryRandPrizeUser(searchVO);
    		
    		System.out.println(" 해당 상품을 요청 한 사람수 ::: "+lstWinnerList.size());
    		
    		if(lstWinnerList.size()> 0)
    		{
    			lvo_win = new LotteryVO();
    			lvo_win = lstWinnerList.get(0); // 첫번째 것만 가져옴
    			
    			searchVO.setUser_id(lvo_win.getUser_id());     //user_id
    			searchVO.setPrize_id(lvo_prize.getPrize_id()); //prize_id
    			
    	 //4. 2번에서 가져온 유저 와 내용을 result table 에 insert
    			lotteryService.insertCondoWinResult(searchVO);
    		}
    	}
    		model.addAttribute("rtnSFlag","LOTTERYOK");
    		
    		System.out.println("추첨끝. ");
    		
    		
        	String requestURL;
        	requestURL = "/lottery/adminInit";
			return requestURL;
    }
}
