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


/**  
 * @Class Name : LedgerVO.java
 * @Description : LedgerVO Class
 * @Modification Information  
 * @
 * @  수정일      수정자              수정내용
 * @ ---------   ---------   -------------------------------
 * @ 2013.11.15                  최초생성
 * 
 * @author Kim Jin Il
 * @since 2013.11.15
 * @version 1.0
 * @see
 * 
 * 
 */
public class LedgerVO extends LedgerDefaultVO {
	
	/** 연번 */
	private long snum = 1L;

	private String draftdate;
	
	private String draftdeptname;
	
	private String enforcedate;
	
	private String docregno;
	
	private String title;
	
	private String drafterdeptid;
	
	private String grpno;
	private String recpman;
	

	private String orgdrafterid;
	private String orgdraftername;
	private String orgdraftdeptid;

	private String orgdraftdeptname;
	

	
	public String getOrgdraftdeptname() {
		return orgdraftdeptname;
	}
	public void setOrgdraftdeptname(String orgdraftdeptname) {
		this.orgdraftdeptname = orgdraftdeptname;
	}
	public String getRecpman() {
		return recpman;
	}
	public void setRecpman(String recpman) {
		this.recpman = recpman;
	}
	
	public long getSnum() {
		return snum;
	}
	public void setSnum(long snum) {
		this.snum = snum;
	}
	
	public String getDraftdate() {
		return draftdate;
	}
	public void setDraftdate(String draftdate) {
		this.draftdate = draftdate;
	}
	public String getDraftdeptname() {
		return draftdeptname;
	}
	public void setDraftdeptname(String draftdeptname) {
		this.draftdeptname = draftdeptname;
	}
	public String getEnforcedate() {
		return enforcedate;
	}
	public void setEnforcedate(String enforcedate) {
		this.enforcedate = enforcedate;
	}
	public String getDocregno() {
		return docregno;
	}
	public void setDocregno(String docregno) {
		this.docregno = docregno;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getDrafterdeptid() {
		return drafterdeptid;
	}
	public void setDrafterdeptid(String drafterdeptid) {
		this.drafterdeptid = drafterdeptid;
	}
	public String getGrpno() {
		return grpno;
	}
	public void setGrpno(String grpno) {
		this.grpno = grpno;
	}
	public String getOrgdrafterid() {
		return orgdrafterid;
	}
	public void setOrgdrafterid(String orgdrafterid) {
		this.orgdrafterid = orgdrafterid;
	}
	public String getOrgdraftername() {
		return orgdraftername;
	}
	public void setOrgdraftername(String orgdraftername) {
		this.orgdraftername = orgdraftername;
	}
	public String getOrgdraftdeptid() {
		return orgdraftdeptid;
	}
	public void setOrgdraftdeptid(String orgdraftdeptid) {
		this.orgdraftdeptid = orgdraftdeptid;
	}

}
