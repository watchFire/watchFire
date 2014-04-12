window.onload = function() {
    $('input').bind('keyup',function(e) {
        if(e.which == 13) {
            alert("Viva el vino");
        }
    });
};

/**
 * Inicia Google Maps
 */
function initialize() {
    var myOptions = {
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"), myOptions);
    if(navigator.geolocation) {
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function(position) {
          initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
          map.setCenter(initialLocation);
        }, function() {
            handleNoGeolocation(browserSupportFlag);
        });
    } else {
        browserSupportFlag = false;
        handleNoGeolocation(browserSupportFlag);
    }
    google.maps.event.addDomListener(window, 'load', initialize);
}

function handleNoGeolocation(errorFlag) {
    if (errorFlag === true) {
        initialLocation = newyork;
    } else {
        initialLocation = siberia;
    }
    map.setCenter(initialLocation);
}