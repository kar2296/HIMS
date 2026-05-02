//Initial load of page
$(document).ready(sizeContent);

//Every resize of window
$(window).resize(sizeContent);

function sizeContent() {
/*	var newHeight = $(window).height() - $(".navbar-pagetitle").height() - $(".navbar-subheader").height() + "px";
	$(".content-wrapper").css("height", newHeight);
	$(".navpanel").css("height", newHeight);*/
	
	//Main image auto adjust of height when greater than content wrapper height
	var mainImgHeight = $("img#body_hand_foot_image").height();
	var contentWrapperHeight = mainImgHeight;
	$(".navpanel").css("height", mainImgHeight);
}
