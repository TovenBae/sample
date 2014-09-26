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
package com.hifive.ledger.service.impl;

import java.util.List;


import org.springframework.stereotype.Repository;

import com.hifive.ledger.service.LedgerDefaultVO;
import com.hifive.ledger.service.LedgerVO;

import egovframework.rte.psl.dataaccess.EgovAbstractDAO;



/**  
 * @Class Name : LedgerDAO.java
 * @Description : LedgerDAO Class
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
 *  Copyright (C) by MOPAS All right reserved.
 */

@Repository("ledgerDAO")
public class LedgerDAO extends EgovAbstractDAO {
	
	/** start ledger start */

    /**
	 * 글 목록을 조회한다.
	 * @param searchMap - 조회할 정보가 담긴 Map
	 * @return 글 목록
	 * @exception Exception
	 */
    public List selectRecpList(LedgerDefaultVO searchVO) throws Exception {
        return list("ledgerDAO.selectRecpList", searchVO);
    }
    
    /**
	 * 글 총 갯수를 조회한다.
	 * @param searchMap - 조회할 정보가 담긴 Map
	 * @return 글 총 갯수
	 * @exception
	 */
    public int selectLedgerListTotCnt(LedgerDefaultVO searchVO) {
        return (Integer)getSqlMapClientTemplate().queryForObject("ledgerDAO.selectLedgerListTotCnt", searchVO);
       
    }
    
}
