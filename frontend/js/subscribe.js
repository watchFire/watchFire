$(document).ready(function(){
	$('#subscribe').bind( "click", function() {
		$('#subscribe').fadeOut('slow', function() {
			$('#subscribe-form').fadeIn();
		})
	});

	$('#sub').on("submit", function( event ) {
		if ("geolocation" in navigator) {
			/* geolocation is available */
			console.log('Si GEO');
			navigator.geolocation.getCurrentPosition(function(position) {
				console.log(position.coords.latitude);
				console.log(position.coords.longitude);
			}, function(err) {
				console.log(err)
			}, {
				enableHighAccuracy: false, maximumAge: 36000, timeout: 36000
			});
		} else {
			/* geolocaiton IS NOT available */
			console.log('No GEO');
		}
		event.preventDefault();
	});
});