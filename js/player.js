

jQuery(function($) {
  if (!Modernizr.touch) { // if not a smartphone
    debiki.Utterscroll.enable({
      scrollstoppers: 'nav, #djBtn, #songsBtn, #playingBtn, #hip-box' });
  }
});

function resizeArtwork() {
	var containerWidth = $(".sc-player li.active").width();
	var containerHeight = $(".sc-player li.active").height();
	if (containerWidth > containerHeight) {
		$(".sc-player li.active img").addClass("bgheight");
		$(".sc-player li.active img").removeClass("bgwidth");
	} else {
		$(".sc-player li.active img").addClass("bgwidth");
		$(".sc-player li.active img").removeClass("bgheight");
	}
}

function getImgColor(callback) {
	$(".sc-player li.active img").attr("data-adaptive-bg", "1");
	$(".sc-player li.active img").attr("crossOrigin", "");
	callback();
}

function getColor() {
	var defaults = {
		selector: '[data-adaptive-bg="1"]',
		parent:   '#player-container',
	};
	$.adaptiveBackground.run(defaults);
	if ($('#player-container').css('background-color;') == 'rgb(0, 0, 0)') {
		$.adaptiveBackground.run(defaults);
	}
}

function centerNumbers() {
	var spacerSize = ($(window).width()/2) - ($("#hip-box-hidden").width()/2) - 15;
	$("#first-empty").css( 'width', spacerSize);
	$("#last-empty").css( 'width', spacerSize);
	$('#draggable').animate({
	   scrollLeft: 0
	}, 200, "easeOutCubic");
}

function checkNumbers() {
	$('#numbers li').each(function() {
        var centerDistance = $(this).offset().left - ($(window).width()/2) + ($(this).width()/2);
        var listWidth = $(this).width()/2 + 15;
     	if (centerDistance < listWidth && centerDistance > -listWidth) {
     		$(this).addClass('my-score');
     	} else {
     		$(this).removeClass('my-score');
     	}
	});
}

function animateNav() {
    var scrollPos = $("#scrollContainer").offset().left;
	var scrollPercent = -(scrollPos / $("#scrollContainer").width());
	var newMargin = $(window).width() * scrollPercent;
	$("#underline").css( 'left', newMargin);
	if (scrollPercent >= 0 && scrollPercent < 0.3) {
		$("#djBtn").addClass('selected');
		$("#songsBtn").removeClass('selected');
		$("#playingBtn").removeClass('selected');
	} 
	else if (scrollPercent >= 0.3 && scrollPercent < 0.6) {
		$("#djBtn").removeClass('selected');
		$("#songsBtn").addClass('selected');
		$("#playingBtn").removeClass('selected');
	} 
	else {
		$("#djBtn").removeClass('selected');
		$("#songsBtn").removeClass('selected');
		$("#playingBtn").addClass('selected');
	}
}

/* ---------------------------

		RUN

------------------------------ */

window.onload = function () {
	getImgColor(function() {
     	getColor();
    });
	centerNumbers();
	resizeArtwork();

	$('#draggable').scroll(function() {
		checkNumbers();
	});

	$('#djBtn').click(function() {
		$("#scroll-container").addClass("people");
		$("#scroll-container").removeClass("songs");
		$("nav").removeClass("player");
		$("nav").addClass("people");
		$("nav").removeClass("songs");
	});		

	$('#songsBtn').click(function() {
		$("#scroll-container").removeClass("people");
		$("#scroll-container").addClass("songs");
		$("nav").removeClass("player");
		$("nav").removeClass("people");
		$("nav").addClass("songs");
	});	

	$('#playingBtn').click(function() {
		$("#scroll-container").removeClass("people");
		$("#scroll-container").removeClass("songs");
		$("nav").removeClass("people");
		$("nav").removeClass("songs");
	});


	$('#player-container.minimized').mousedown(function() {
		$('#player-container').removeClass("minimized");
	});


	$('#minimize-icon').click(function() {
		$('#player-container').toggleClass('minimized');
	});	

}

$(window).resize(function() {
	resizeArtwork();
	centerNumbers();
	checkNumbers();
});

/* ---------------------------

		Click events

------------------------------ */