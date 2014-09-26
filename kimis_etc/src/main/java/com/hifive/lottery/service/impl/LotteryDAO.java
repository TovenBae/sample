package com.hifive.lottery.service.impl;

import java.util.List;


import org.springframework.stereotype.Repository;

import com.hifive.lottery.service.LotteryDefaultVO;
import com.hifive.lottery.service.LotteryVO;

import egovframework.rte.psl.dataaccess.EgovAbstractDAO;

@Repository("lotteryDAO")
public class LotteryDAO extends EgovAbstractDAO {
	
	/**
	 * 상품리스트 - 리스트용
	 * @param searchVO
	 * @return
	 * @throws Exception
	 */
	public List selectLotteryPrizeList(LotteryDefaultVO searchVO) throws Exception
	{
		return list("lotteryDAO.selectPrizeList", searchVO);
	}

	/**
	 * 상품리스트 페이징용 숫자
	 * @param LotteryVO
	 * @return
	 * @throws Exception
	 */
	public int selectLotteryPrizeListCount(LotteryDefaultVO searchVO) throws Exception
	{
		return (Integer)getSqlMapClientTemplate().queryForObject("lotteryDAO.selectPrizeListCount", searchVO);
	}

	/**
	 * 상품등록
	 * @param LotteryVO
	 * @return
	 * @throws Exception
	 */
	public int insertLotteryPrize(LotteryVO lotteryVo) throws Exception
	{
		return (Integer)getSqlMapClientTemplate().update("lotteryDAO.insertPrize", lotteryVo);
		//return (Integer)insert("lotteryDAO.insertPrize", lotteryVo);
	}
	
	/**
	 * 상품삭제
	 * @param LotteryVO
	 * @return
	 * @throws Exception
	 */
	public int deleteLotteryPrize(LotteryVO lotteryVo) throws Exception
	{
		return (Integer)delete("lotteryDAO.deletetPrize", lotteryVo);
	}
	
	/**
	 * 상품수정
	 * @param LotteryVO
	 * @return
	 * @throws Exception
	 */
	public int updateLotteryPrize(LotteryVO lotteryVo) throws Exception
	{
		return (Integer)update("lotteryDAO.updatePrize", lotteryVo);
	}
	
	/**
	 * [ 사용자 콘도 신청 ] 유저별 콘도신청
	 * @param LotteryVO
	 * @return
	 * @throws Exception
	 */
	public int insertLotteryReqPrize(LotteryVO lotteryVo) throws Exception
	{
		return (Integer)update("lotteryDAO.insertReqPrize", lotteryVo);
	}
	

	/**
	 * [ 사용자 콘도 신청 ] 유저 콘도 신청 카운트
	 * @param LotteryVO
	 * @return
	 * @throws Exception
	 */
	public int selectLotteryReqPrizeUserCnt(LotteryVO lotteryVo) throws Exception
	{		
		return (Integer)getSqlMapClientTemplate().queryForObject("lotteryDAO.selectReqPrizeListCount", lotteryVo);
	}

	/**
	 * [ 사용자 콘도 추첨 ] 신청자 랜덤 추출 상품 ID 를 기준으로..
	 * @param LotteryVO
	 * @return
	 * @throws Exception
	 */
	public List selectLotteryRandPrizeUser(LotteryVO lotteryVo) throws Exception
	{		
		return getSqlMapClientTemplate().queryForList("lotteryDAO.selectReqPrizeRandList", lotteryVo);
	}
	
	/**
	 * 상품 전체 리스트 - 추첨용
	 * @param searchVO
	 * @return
	 * @throws Exception
	 */
	public List selectLotteryPrizeAllList() throws Exception
	{
		return getSqlMapClientTemplate().queryForList("lotteryDAO.selectPrizeALLList");
	}
	
	/**
	 * [ 당첨 ] 당첨자 입력
	 * @param LotteryVO
	 * @return
	 * @throws Exception
	 */
	public int insertCondoWinner(LotteryVO lotteryVo) throws Exception
	{		
		//return (Integer)getSqlMapClientTemplate().queryForObject("lotteryDAO.insertWinner", lotteryVo);
		return update("lotteryDAO.insertWinner", lotteryVo);
	}
	
	/**
	 * [ 당첨 ] 당첨자 리스트
	 * @param searchVO
	 * @return
	 * @throws Exception
	 */
	public List selectCondoWinnerResultList() throws Exception
	{
		return getSqlMapClientTemplate().queryForList("lotteryDAO.selectPrizeWinResultList");
	}
	
	
	/**
	 * [ 관리자 ] 상품초기화
	 * @param searchVO
	 * @return
	 * @throws Exception
	 */
	public int deletePrizeList() throws Exception
	{
		return delete("lotteryDAO.deletPrizeList", null);
	}
	
	/**
	 * [ 관리자 ] 응모자초기화
	 * @param searchVO
	 * @return
	 * @throws Exception
	 */
	public int deleteRequest() throws Exception
	{
		return delete("lotteryDAO.deletCondoRequest", null);
	}
	
	/**
	 * [ 관리자 ] 당첨자초기화
	 * @param searchVO
	 * @return
	 * @throws Exception
	 */
	public int deleteWinner() throws Exception
	{
		return delete("lotteryDAO.deleteWinnerList", null);
	}
	
	/**
	 * 상품리스트 - 관리자용
	 * 
	 */
	public List selectLotteryAdminPrizeList(LotteryDefaultVO searchVO) throws Exception
	{
		return list("lotteryDAO.selectPrizeAdminList", searchVO);
	}

	public int deleteUserCancelPrize(LotteryVO lvo) {
		// TODO Auto-generated method stub
		return (Integer)delete("lotteryDAO.deleteUserCancelPrize", lvo);
	}
}
