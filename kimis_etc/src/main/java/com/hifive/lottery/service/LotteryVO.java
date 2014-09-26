package com.hifive.lottery.service;
import com.hifive.lottery.service.LotteryDefaultVO;
public class LotteryVO extends LotteryDefaultVO {
	
	private String  prize_id;
	private String  prize_name;
	private String  regdate;
	private String  psb_sdate;
	private String  psb_ldate;
	
	private String  user_id;
	private String  reqdate;
	private String  moddate;
	private String  user_name;

	
	public String getUser_name() {
		return user_name;
	}
	public void setUser_name(String user_name) {
		this.user_name = user_name;
	}
	public String getUser_id() {
		return user_id;
	}
	public void setUser_id(String user_id) {
		this.user_id = user_id;
	}
	public String getReqdate() {
		return reqdate;
	}
	public void setReqdate(String reqdate) {
		this.reqdate = reqdate;
	}
	public String getModdate() {
		return moddate;
	}
	public void setModdate(String moddate) {
		this.moddate = moddate;
	}
	public String getPrize_id() {
		return prize_id;
	}
	public void setPrize_id(String prize_id) {
		this.prize_id = prize_id;
	}
	public String getPrize_name() {
		return prize_name;
	}
	public void setPrize_name(String prize_name) {
		this.prize_name = prize_name;
	}

	public String getRegdate() {
		return regdate;
	}
	public void setRegdate(String regdate) {
		this.regdate = regdate;
	}
	
	public String getPsb_sdate() {
		return psb_sdate;
	}
	public void setPsb_sdate(String psb_sdate) {
		this.psb_sdate = psb_sdate;
	}
	public String getPsb_ldate() {
		return psb_ldate;
	}
	public void setPsb_ldate(String psb_ldate) {
		this.psb_ldate = psb_ldate;
	}

}
