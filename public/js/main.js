$(document).ready(function() {

	// Preloader
	$(window).load(function(){
		$('.preloader').fadeOut();
	});

	// Initiat WOW.js
	var wow = new WOW(
	  {
	  	mobile: false
	  }
	);
	wow.init();

	// .intro-section reduce opacity when scrolling down
	$(window).scroll(function(){
		if($(window).width() > 1260) {
			windowScroll = $(window).scrollTop();
			contentOpacity = 1 - (windowScroll / ($('#intro').offset().top+$('#intro').height()));
			$('.intro-section').css('transform','translateY('+Math.floor(windowScroll*0.16)+'px)');
			$('.intro-section').css('-webkit-transform','translateY('+Math.floor(windowScroll*0.16)+'px)');
			$('.intro-section').css('opacity',contentOpacity.toFixed(2));
		}
	});

	// Fixed navigation
	$(window).scroll(function() {
	    if ($(window).scrollTop() > 500) {
	        $('.navbar').addClass('fixednav');
	    } else {
	    	$('.navbar').removeClass('fixednav');
	    }
	});

	// Initiat onepageNav.js
	$('.nav').onePageNav({
		currentClass: 'current',
		'scrollOffset': 500
	});

	// Hide Mobile Nav when clicking item
	$(".nav a, .navbar-header a").click(function(event) {
		$(".navbar-collapse").removeClass("in").addClass("collapse");
	});

	/* Buttons Scroll to Div */
	$('.navbar-brand').click(function () {
		$.scrollTo('.intro', 1000);
	return false;
	});

	$('.btn-custom-border, a.mouse').click(function () {
		$.scrollTo('.features', 1000);
	return false;
	});

	// Screenshot carousel
	$(".screens").owlCarousel({
		items: 4,
		navigation:true,
		navigationText: [
			"<i class='fa fa-angle-left btn-slide'></i>",
			"<i class='fa fa-angle-right btn-slide'></i>"
			],
		pagination: false,
		itemsDesktop: [1000, 4],
        itemsDesktopSmall: [990, 3],
        itemsTablet: [600, 1],
        itemsMobile: false
	});

	// Screenshot lightbox
	$('.screens a').nivoLightbox({
	    effect: 'fadeScale'
	});

	// Brief carousel
	$(".small-slider").owlCarousel({
		items: 1,
		navigation: true,
		navigationText: [
			"<i class='fa fa-angle-left btn-slide'></i>",
			"<i class='fa fa-angle-right btn-slide'></i>"
			],
		pagination: false,
		itemsDesktop: [1000, 1],
        itemsDesktopSmall: [900, 1],
        itemsTablet: [600, 1],
        itemsMobile: false
	})

	// Testemonial carousel
	$(".testemonials").owlCarousel({
		autoPlay: 8000,
		autoHeight : true,
		singleItem: true,
		navigation: false,
		itemsDesktop: [1000, 1],
        itemsDesktopSmall: [900, 1],
        itemsTablet: [600, 1],
        itemsMobile: false
	});

	// Initiat fitVids.js
	$(".video-item").fitVids();

	// Bootstrap Tab navigation
	$('.tabs a').click(function (e) {
		e.preventDefault()
		$(this).tab('show')
	});

	// Testemonial carousel
	$(".customer-slider").owlCarousel({
		autoPlay: 8000,
		items: 5,
		pagination: false,
		itemsDesktop: [1000, 1],
        itemsDesktopSmall: [900, 1],
        itemsTablet: [600, 1],
        itemsMobile: false
	});

	// Custom
	// $('#valEmail').hide();
	// $('#valName').hide();
	// $('#valAddress').hide();

	$('#wannafun').click(function () {
		$.scrollTo('#drop', 1000);
		$.post('/api/log/drop', function () {});
	});

	$('#lnkServices').click(function () {
		$.scrollTo('#drop', 1000);
		$.post('/api/log/services', function () {});
	});

	$('#lnkFaq').click(function () {
		$.scrollTo('#drop', 1000);
		$.post('/api/log/faq', function () {});
	});

	$('#lnkDrop').click(function () {
		$.scrollTo('#drop', 1000);
		$.post('/api/log/drop', function () {});
	});


	$('#btnDrop').click(function () {
		$.post('/api/log/submit', function () {});
		// var isValid = true;
		
		// if ($('#email').val()) {
		// 	$('#valEmail').hide();
		// } else {
		// 	$('#valEmail').show();
		// 	isValid = false;
		// }

		// if ($('#name').val()) {
		// 	$('#valName').hide();
		// } else {
		// 	$('#valName').show();
		// 	isValid = false;
		// }

		// if ($('#address').val()) {
		// 	$('#valAddress').hide();			
		// } else {
		// 	$('#valAddress').show();
		// 	isValid = false;
		// }
		
		// if (!isValid)
		// 	return false;

		
		$('form').submit();
	})

 
});