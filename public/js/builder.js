/* ============================================================
 * Builder Script
 =========================================================== */

/**** BUILDER FUNCTIONS ****/




function toggleBuilder(){
	$("").hide();
    $('.builder-toggle').on('click', function(){
        if($('#builder').hasClass('open')) $('#builder').removeClass('open');
        else $('#builder').addClass('open');
    });
}





$(document).ready(function() {
   "use strict";

    // $.removeCookie('main-color');
    // $.removeCookie('topbar-color');
    // $.removeCookie('topbar-color-custom');
    // $.removeCookie('sidebar-color');
    // $.removeCookie('sidebar-color-custom');
    // $.removeCookie('sidebar-hover');
    // $.removeCookie('submenu-hover');

    toggleBuilder();
   // builderScroll();
   // handleLayout();
   // handleTheme();
   // handleCookie();
   // mainColor();
   // backgroundColor();
    //resetStyle();

	
	
	 
    

});

