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
package com.hifive.ledger.web;

import java.util.List;

import javax.annotation.Resource;


import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.springmodules.validation.commons.DefaultBeanValidator;

import com.hifive.ledger.service.KrLedgerService;
import com.hifive.ledger.service.LedgerDefaultVO;
import com.hifive.ledger.service.LedgerVO;


import egovframework.rte.fdl.property.EgovPropertyService;
import egovframework.rte.ptl.mvc.tags.ui.pagination.PaginationInfo;


/**  
 * @Class Name : KrLedgerController.java
 * @Description : KrLedgerControllerClass
 * @Modification Information  
 * @
 * @  수정일         수정자              수정내용
 * @ ---------   ---------   -------------------------------
 * @ 2013.11.26                   최초생성
 * 
 * @author Kim Jin Il 
 * @since 2011. 11.26
 * @version 1.0
 * @see
 * 
 *  
 */

@Controller
@SessionAttributes(types=LedgerVO.class)
public class TestController {
	/** Service */
    @Resource(name = "ledgerService")
    private KrLedgerService ledgerService;
    
    /** EgovPropertyService */
    @Resource(name = "propertiesService")
    protected EgovPropertyService propertiesService;

    /** Validator */
    @Resource(name = "beanValidator")
	protected DefaultBeanValidator beanValidator;
    
    
    protected Log log = LogFactory.getLog(this.getClass());
    

    @RequestMapping(value="/ledger/tell.do")
    public String test(@ModelAttribute("searchVO") LedgerDefaultVO searchVO, 
    		ModelMap model)
            throws Exception {
    	return "www.naver.com";
    }
    
    
}
