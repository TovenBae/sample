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
package com.hifive.comm;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import egovframework.rte.fdl.cmmn.exception.handler.ExceptionHandler;

/**  
 * @Class Name : KrToolExcepHndlr.java
 * @Description : KrToolExcepHndlr Class
 * @Modification Information  
 * @
 * @  수정일      수정자              수정내용
 * @ ---------   ---------   -------------------------------
 * @ 2013.11.15           최초생성
 * 
 * @author Kim JinIl
 * @since 2013. 11.15
 * @version 1.0
 * @see
 * 
 */
public class KrToolExcepHndlr implements ExceptionHandler {

    protected Log log = LogFactory.getLog(this.getClass());
    
    /**
    * @param ex
    * @param packageName
    * @see 개발프레임웍크 실행환경 개발팀
    */
    public void occur(Exception ex, String packageName) {

		log.debug(" EgovServiceExceptionHandler run...............");

		try {
			log.debug(" EgovServiceExceptionHandler try ");
		} catch (Exception e) {
			e.printStackTrace();
		}
    }

}
