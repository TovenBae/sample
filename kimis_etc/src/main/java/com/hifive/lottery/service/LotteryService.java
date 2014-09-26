package com.hifive.lottery.service;

import java.util.List;

public interface LotteryService {
	
	//상품리스트
	List selectLotteryPrizeList(LotteryDefaultVO searchVO) throws Exception;
	
	//상품카운트
	int selectLotteryPrizeListCount(LotteryDefaultVO searchVO) throws Exception;
	
	//상품등록
	int insertLotteryPrize(LotteryVO lotteryVO ) throws Exception;

	//상품삭제
	int deleteLotteryPrize(LotteryVO lotteryVO ) throws Exception;
	
	//상품수정
	int updateLotteryPrize(LotteryVO lotteryVO ) throws Exception;
	
	//콘도신청
	int insertReqLotteryPrize(LotteryVO lotteryVO ) throws Exception;
	
	//유저별 콘도신청 상품카운트
	int selectReqLotteryPrizeListCount(LotteryVO searchVO) throws Exception;

	//유저별 콘도신청 랜덤 유저 추출
	List selectLotteryRandPrizeUser(LotteryVO searchVO) throws Exception;
	
	//콘도 상품 전체 리스트
	List selectLotteryAllPrizeList(LotteryVO searchVO) throws Exception;

	//당첨 : 당첨자 리스트
	List selectCondoWinResultList(LotteryVO searchVO) throws Exception;
	
	//콘도신청
	int insertCondoWinResult(LotteryVO lotteryVO ) throws Exception;
	
	//상품초기화
	int deletePrizeList(LotteryVO lotteryVO ) throws Exception;
	
	//요청자초기화
	int deleteRequestList(LotteryVO lotteryVO ) throws Exception;
	
	//당첨자초기화
	int deleteWinnerList(LotteryVO lotteryVO ) throws Exception;

	//관리자화면 등록콘도 목록
	List selectLotteryAdminPrizeList(LotteryDefaultVO searchVO) throws Exception;

	int deleterUserCancelPrize(LotteryVO lvo) throws Exception;
	
}
