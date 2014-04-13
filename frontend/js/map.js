      	var map;
      	var markers = [];
      	var fireArea = [];


	function initialize() {
	
	  // Create the map.
	  var mapOptions = {
	    zoom: 12,
	    center: new google.maps.LatLng(38.09024, -95.712891),
	    mapTypeId: google.maps.MapTypeId.TERRAIN
	  };

	  map = new google.maps.Map(document.getElementById('map-canvas'),
	      mapOptions);
	      
	  
	  // Create the search box and link it to the UI element.
	  var input = /** @type {HTMLInputElement} */(
	      document.getElementById('pac-input'));
	  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	  var searchBox = new google.maps.places.SearchBox(
	    /** @type {HTMLInputElement} */(input));

	  // Listen for the event fired when the user selects an item from the
	  // pick list. Retrieve the matching places for that item.
	  google.maps.event.addListener(searchBox, 'places_changed', function() {
	    var places = searchBox.getPlaces();

	    for (var i = 0, marker; marker = markers[i]; i++) {
	      marker.setMap(null);
	    }

	    // For each place, get the icon, place name, and location.
	    markers = [];
	    var bounds = new google.maps.LatLngBounds();
	    for (var i = 0, place; place = places[i]; i++) {
	      var image = {
		url: place.icon,
		size: new google.maps.Size(71, 71),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(17, 34),
		scaledSize: new google.maps.Size(25, 25)
	      };

	      // Create a marker for each place.
	      var marker = new google.maps.Marker({
		map: map,
		icon: image,
		title: place.name,
		position: place.geometry.location
	      });

	      markers.push(marker);

	      bounds.extend(place.geometry.location);
	    }

	    map.fitBounds(bounds);
	  });

	  // Bias the SearchBox results towards places that are within the bounds of the
	  // current map's viewport.
	  google.maps.event.addListener(map, 'bounds_changed', function() {
	    var bounds = map.getBounds();
	    searchBox.setBounds(bounds);
	  });
	      
	      
	  google.maps.event.addListener(map, 'zoom_changed', function() {
	    zoomChange();
	  });
	  
	  google.maps.event.addListener(map, 'click', function() {
	    hideTL();
	    emitClose();
	  });
	      
	  console.log(map.getCenter().A);
	  console.log(map.getCenter().k);
	  xhr = createCORSRequest("GET", "http://fire.vwzq.net/points/"+ map.getCenter().A +"/"+ map.getCenter().k + "/" + 5000000000/Math.pow(10,map.zoom/2), painter);
	  
	  setInterval(function() {
            queryChanges();
          }, 10000);
          
          $('#map-canvas').append('<div id="time_line" style="display: none;"></div>');
	}

	function painter(e) {


	  var fires;

	  if(e instanceof Array){
	    fires = e;
	  } else {
	    fires = JSON.parse(e.srcElement.responseText);
	  }
 
	  
	  
	  // Construct the circle for each value in fires.
	  for (var hotspot in fires) {
	    /*console.log(fires[hotspot].coordenadas.coordinates[1]);
	    console.log(fires[hotspot].coordenadas.coordinates[0]);*/
	    
	    var center = new google.maps.LatLng(fires[hotspot].coordenadas.coordinates[1],
	    				   fires[hotspot].coordenadas.coordinates[0]);
	    var radius = 8143197/20;
	    
	    var populationOptions = {
	      id: fires[hotspot]._id,
	      strokeColor: '#FF0000',
	      strokeOpacity: 0.8,
	      strokeWeight: 2,
	      fillColor: '#FF0000',
	      fillOpacity: 0.35,
	      clickable: true,
	      map: map,
	      center: center,
	      radius: radius,
	      timeStamp: fires[hotspot].time
	    };
	    // Add the circle for this city to the map.
    	    //console.log(fireArea[fires[hotspot]._id]);
	    if((fireArea[fires[hotspot]._id] == null) || (!(fireArea[fires[hotspot]._id] == null)  && (fireArea[fires[hotspot]._id].timeStamp != fires[hotspot].time))){
	    
	      if(!(fireArea[fires[hotspot]._id] == null)){
	        fireArea[fires[hotspot]._id].setMap(null);
	      }
	    
	      fireArea[fires[hotspot]._id] = new google.maps.Circle(populationOptions);
	      google.maps.event.addListener(fireArea[fires[hotspot]._id], 'click', function() {
   		  showInfo(this.id);
   		  showTL();
   		  emitGiveMeTweets(fires[hotspot]._id);
	      });
	    }	    
	  }
	}

	function createCORSRequest(method, url, callback) {
	  var oReq = new XMLHttpRequest();
	  oReq.onload = callback;
	  oReq.open(method, url, true);
	  oReq.send();
	}
	
	function showInfo(fid) {
	  $('#info').fadeOut('slow', function() {
    		$('#info').text("");
	  	$('#info').text(fid);
	  	$('#info').fadeIn();
	  });
	}
	
	function zoomChange() {
	  /*console.log(map.zoom);*/
	}
	
	function queryChanges() {
	  $.ajax({
            url:"http://fire.vwzq.net/points/"+ map.getCenter().A +"/"+ map.getCenter().k + "/" + 5000000000/Math.pow(10,map.zoom/2),
            type: 'GET',
            dataType: 'json',
            success: function(data, textstatus, xhr){
            		console.log(5000000000/Math.pow(10,map.zoom/2));
			painter(data);
            },
            error: function(error) {
        	//console.log("error");
            }
          });
	}
	
	function showTL(){
	  $('#time_line').fadeIn();
	}
	
	function hideTL(){
	  $('#time_line').fadeOut();
	}
	
	function printTweet(data){
	  //$('#time_line').prepend('<div class="tweet"><h3>'+ data.username +'</h3><p>'+ data.text +'</p></div>');
	  $('#time_line').prepend('<div class="tweet"><h3>Username</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras quis venenatis elit. Curabitur a justo nec justo lacinia tincidunt a et mi.</p></div>');
	}
