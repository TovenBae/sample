package com.hifive.lottery.service.impl;

import java.util.List;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;


import com.hifive.lottery.service.LotteryDefaultVO;
import com.hifive.lottery.service.LotteryService;
import com.hifive.lottery.service.LotteryVO;

import egovframework.rte.fdl.cmmn.AbstractServiceImpl;

@Service("lotteryService")
public class LotteryServiceImpl extends AbstractServiceImpl implements LotteryService{
	
	@Resource(name="lotteryDAO")
    private  LotteryDAO lotteryDao;

	@Override
	public List selectLotteryPrizeList(LotteryDefaultVO searchVO) throws Exception {
		return lotteryDao.selectLotteryPrizeList(searchVO);
	}
	
	@Override
	public int selectLotteryPrizeListCount(LotteryDefaultVO searchVO) throws Exception {
		return lotteryDao.selectLotteryPrizeListCount(searchVO);
	}

	@Override
	public int insertLotteryPrize(LotteryVO lotteryVO) throws Exception {
		return lotteryDao.insertLotteryPrize(lotteryVO);
	}

	@Override
	public int deleteLotteryPrize(LotteryVO lotteryVO) throws Exception {
		return lotteryDao.deleteLotteryPrize(lotteryVO);
	}

	@Override
	public int updateLotteryPrize(LotteryVO lotteryVO) throws Exception {
		return lotteryDao.updateLotteryPrize(lotteryVO);
	}

	@Override
	public int insertReqLotteryPrize(LotteryVO lotteryVO) throws Exception {
		return lotteryDao.insertLotteryReqPrize(lotteryVO);
	}

	@Override
	public int selectReqLotteryPrizeListCount(LotteryVO searchVO) throws Exception {

		return lotteryDao.selectLotteryReqPrizeUserCnt(searchVO);
	}

	@Override
	public List selectLotteryRandPrizeUser(LotteryVO searchVO) throws Exception {
		return lotteryDao.selectLotteryRandPrizeUser(searchVO);
	}

	@Override
	public List selectLotteryAllPrizeList(LotteryVO searchVO) throws Exception {
		return lotteryDao.selectLotteryPrizeAllList();
	}

	@Override
	public List selectCondoWinResultList(LotteryVO searchVO) throws Exception {
		return lotteryDao.selectCondoWinnerResultList();
	}

	@Override
	public int insertCondoWinResult(LotteryVO lotteryVO) throws Exception {
		return lotteryDao.insertCondoWinner(lotteryVO);
	}

	@Override
	public int deletePrizeList(LotteryVO lotteryVO) throws Exception {
		return lotteryDao.deletePrizeList();
	}

	@Override
	public int deleteRequestList(LotteryVO lotteryVO) throws Exception {
		return lotteryDao.deleteRequest();
	}

	@Override
	public int deleteWinnerList(LotteryVO lotteryVO) throws Exception {
		return lotteryDao.deleteWinner();
	}
	
	@Override
	public List selectLotteryAdminPrizeList(LotteryDefaultVO searchVO) throws Exception {
		return lotteryDao.selectLotteryAdminPrizeList(searchVO);
	}

	@Override
	public int deleterUserCancelPrize(LotteryVO lvo) throws Exception {
		// TODO Auto-generated method stub
		return lotteryDao.deleteUserCancelPrize(lvo);
	}
}
