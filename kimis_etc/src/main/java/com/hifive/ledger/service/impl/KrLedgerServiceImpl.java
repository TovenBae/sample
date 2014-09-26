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

import javax.annotation.Resource;


import org.springframework.stereotype.Service;

import com.hifive.ledger.service.KrLedgerService;
import com.hifive.ledger.service.LedgerDefaultVO;
import com.hifive.ledger.service.LedgerVO;


import egovframework.rte.fdl.cmmn.AbstractServiceImpl;


/**  
 * @Class Name : KrLedgerServiceImpl.java
 * @Description : Ledger Business Implement Class
 * @Modification Information  
 * @
 * @  수정일      수정자              수정내용
 * @ ---------   ---------   -------------------------------
 * @ 2013.11.15           최초생성
 * 
 * @author Kim Jin Il 
 * @since 2013. 11.15
 * @version 1.0
 * @see
 * 
 */

@Service("ledgerService")
public class KrLedgerServiceImpl extends AbstractServiceImpl implements
        KrLedgerService {

	@Resource(name="ledgerDAO")
    private LedgerDAO ledgerDAO;

	@Override
	public List selectLedgerList(LedgerDefaultVO searchVO) throws Exception {
		// TODO Auto-generated method stub
		return ledgerDAO.selectRecpList(searchVO);
	}

	@Override
	public int selectLedgerListTotCnt(LedgerDefaultVO searchVO) {
		// TODO Auto-generated method stub
		return ledgerDAO.selectLedgerListTotCnt(searchVO);
	}
	
	/**  아직 안씀. */
	@Override
	public LedgerVO selectLedgerList(LedgerVO vo) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}


    
}
