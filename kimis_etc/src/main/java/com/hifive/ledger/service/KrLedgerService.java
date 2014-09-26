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
package com.hifive.ledger.service;

import java.util.List;


/**  
 * @Class Name : KrLedgerService.java
 * @Description : KrLedgerService Class
 * @Modification Information  
 * @
 * @  수정일      수정자              수정내용
 * @ ---------   ---------   -------------------------------
 * @ 2013.11.15                   최초생성
 * 
 * @author Kim Jin Il
 * @since 2013.11.15
 * @version 1.0
 * @see
 * 
 *  
 */
public interface KrLedgerService {
	
	/** ledger start */
	
    /**
	 * 글을 조회한다.
	 * @param vo - 조회할 정보가 담긴 SampleVO
	 * @return 조회한 글
	 * @exception Exception
	 */
    LedgerVO selectLedgerList(LedgerVO vo) throws Exception;
    
	
	/**
	 * 글 목록을 조회한다.
	 * @param searchVO - 조회할 정보가 담긴 VO
	 * @return 글 목록
	 * @exception Exception
	 */
	List selectLedgerList(LedgerDefaultVO searchVO) throws Exception;
	
	
    /**
	 * 글 총 갯수를 조회한다.
	 * @param searchVO - 조회할 정보가 담긴 VO
	 * @return 글 총 갯수
	 * @exception
	 */
    int selectLedgerListTotCnt(LedgerDefaultVO searchVO);
	
	
	/** ledger end   */
	
}
