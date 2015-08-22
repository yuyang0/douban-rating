String.format = function(src){
    if (arguments.length == 0) return null;
    var args = Array.prototype.slice.call(arguments, 1);
    return src.replace(/\{(\d+)\}/g, function(m, i){
        return args[i];
    });
};

/* 
 * test if the current url belongs to specified site.
 * you can specify multiple keywords, eg: is_site("sina", "jd", "taobao")
*/
var is_site = function() {
	var parts = window.location.hostname.split(".");
	for (var i=0; i<arguments.length; i++) {  
        if (parts.indexOf(arguments[i]) >= 0) {
		    return true;
	    }
    } 
	return false;
};

var get_douban_info = function(isbn, callback) {
	if (isbn == null) {
		return;
	}
	var https = (window.location.protocol == "https:");
	var api_url = null;
	if (https) {
		api_url = "https://api.douban.com/v2/book/isbn/" + isbn;
	} else {
		api_url = "http://api.douban.com/v2/book/isbn/" + isbn;
	}

	$.getJSON(api_url, function(data){
		var douban_url = data["alt"];
		var douban_rank_info = data["rating"];
		var average_rating = data["rating"]["average"];
		var main_score = parseInt(average_rating);
		var sub_score = average_rating.split(".")[1];
		
		var num_raters = data["rating"]["numRaters"];
		console.log(douban_url, average_rating, num_raters);
		//var popup_html = String.format("<div class=\"douban-popup\"> <span class=\"stars5 starstop\" title=\"力荐\"></span><div class=\"power\" style=\"width:59px\"></div> 86.8%<br>    <span class=\"stars5 starstop\" title=\"力荐\"></span><div class=\"power\" style=\"width:59px\"></div> 86.8%<br></div>");
		var html = String.format("<div id=\"douban-rating\"><b>豆瓣评分：</b><span class=\"douban-score\"><em>{1}</em>.{2}</span>分 (<a href=\"{0}\" target=\"_blank\">{3}人评价</a>)</div>", douban_url, main_score, sub_score, num_raters);
		callback(html);
	}).fail(function(jqxhr, textStatus, error){
		var html = null;
		if (jqxhr.status == 404) {
			html = "<span id=\"douban-rating\"><b>豆瓣评分：</b>豆瓣上没有这本书. </span>";
		} else {
			html = "<span id=\"douban-rating\"><b>豆瓣评分：</b>ajax错误. </span>";
		}
		callback(html);
	});
};

var insert_rating_to_jd = function(html) {
	var obj = $(html);
	$("#p-author").append(obj);
};

var insert_rating_to_amazon = function(html) {
	var obj = $(html);
	$("#productGuarantee_feature_div").after(obj);
};

var insert_rating_to_dangdang = function(html) {
	var obj = $(html);
	$("#comm_num_up").after(obj);
};

var insert_rating_to_tmall = function(html) {
	var obj = $(html);
	$("#J_PostageToggleCont").after(obj);
};

var get_jd_isbn = function(){
	var keywords = $('meta[name=keywords]').attr("content");
	var isbn_regex = /\d{10,13}/;
	var ret = keywords.match(isbn_regex);
	if (ret != null) {
		return ret[0];
	} else {
		var text = $("#parameter2").text();
		var ret = text.match(isbn_regex);
		if (ret == null) {
			return null;
		}
		return ret[0];
	}
};

var get_amazon_isbn = function(){
	var isbn = null;
	var text = $("#detail_bullets_id").text();
	var ret = text.match(/\d{10,13}/);
	if (ret != null) {
		isbn = ret[0];
	}
	return isbn;
};

var get_dangdang_isbn = function() {
	var keywords = $('meta[name=keywords]').attr("content");
	var isbn_regex = /\d{10,13}/;
	var ret = keywords.match(isbn_regex);
	if (ret != null) {
		return ret[0];
	} else {
		var text = $(".book_messbox").text();
		var ret = text.match(isbn_regex);
		if (ret == null) {
			return null;
		}
		return ret[0];
	}
};

var get_tmall_isbn = function() {
	var isbn = null;
	var text = $("#J_AttrUL").text();
	var ret = text.match(/\d{10,13}/);
	if (ret != null) {
		isbn = ret[0];
	}
	return isbn;
};

$(document).ready(function(){
	var isbn = null;
	if (is_site("jd", "360buy")) {
		isbn = get_jd_isbn();
		get_douban_info(isbn, insert_rating_to_jd);
	} else if (is_site("amazon", "z")) {
		isbn = get_amazon_isbn();
		get_douban_info(isbn, insert_rating_to_amazon);
	} else if (is_site("dangdang")) {
		isbn = get_dangdang_isbn();
		get_douban_info(isbn, insert_rating_to_dangdang);
	} else if (is_site("tmall")) {
		isbn = get_tmall_isbn();
		get_douban_info(isbn, insert_rating_to_tmall);
	}
});
