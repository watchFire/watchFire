(function() {

   var API_HOST_URL = "http://localhost:9999/";
   var API_HOTSPOTS_PATH = function(lon, lat, rad) {
      var URL = "points/:lon/:lat/:rad";
      return URL.replace(/(:\w+)/g, function(param) {
         switch(param) {
            case ":lon": return lon;
            case ":lat": return lat;
            case ":rad": return rad;
         }
      });
   }
   
   var map;
   var fireArea = [];
   google.maps.event.addDomListener(window, 'load', initialize);

   function initialize() {
   
      var markers = [];
      // Create the map.
      var mapOptions = {
         zoom: 3,
	     center: new google.maps.LatLng(40, 1),
	     mapTypeId: google.maps.MapTypeId.TERRAIN
      };

      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	      
      // Create the search box and link it to the UI element.
      var input = document.getElementById('pac-input');
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      var searchBox = new google.maps.places.SearchBox(input);

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
      })

      // Bias the SearchBox results towards places that are within the bounds of the
      // current map's viewport.
      google.maps.event.addListener(map, 'bounds_changed', function() {
         var bounds = map.getBounds();
         searchBox.setBounds(bounds);
      });

      google.maps.event.addListener(map, 'zoom_changed', zoomChange);

      google.maps.event.addListener(map, 'click', hideInfo);
	  
      requestPoints();
      setInterval(function() {
         requestPoints();
      }, 10000);
          
      $('#map-canvas').append('<div id="time_line" style="display: none;"></div>');
   }

   // Pinta radios
   function painter(fires) {
   
      var radius;

      // Radio del circulo
      radius = 500000/Math.pow(1.75, map.zoom);
      if (radius < 1000) radius = 1000;
	
      //console.log(radius);
	  
	  // Construct the circle for each value in fires.
      for (var hotspot in fires) {

         var center, calorcito;
	    
         center = new google.maps.LatLng(fires[hotspot].coordinates.coordinates[1],
                        fires[hotspot].coordinates.coordinates[0]);

	 if (fires[hotspot].confidence > 0.3) colorcito = '#FF0000';
         else if (fires[hotspot].confidence > 0.25) colorcito = '#FF4500';
         else if (fires[hotspot].confidence > 0.2) colorcito = '#FF8C00';
         else if (fires[hotspot].confidence > 0.1) colorcito = '#FFA500';
         else colorcito = '#FFD700';
		
         radius = 500000/Math.pow(1.75, map.zoom);
         if (radius < 1000) radius = 1000;
         var factor = ((5-(Math.log(fires[hotspot].impact)/Math.LN10))/2); //Porque si
         if (factor < 1) factor = 1;
         
         radius = radius/factor;
		
         var populationOptions = {
               id: fires[hotspot]._id,
               strokeColor: colorcito,
               strokeOpacity: 0.8,
               strokeWeight: 0,
               fillColor: colorcito,
               fillOpacity: 0.55,
               clickable: true,
               map: map,
               center: center,
               radius: radius,
               confidence: fires[hotspot].confidence,
               impact: fires[hotspot].impact,
               windDirection: fires[hotspot].windDirection,
               timeStamp: fires[hotspot].date
         };
         
         
         // Add the circle for this city to the map.
         if ((fireArea[fires[hotspot]._id] == null) || (!(fireArea[fires[hotspot]._id] == null)  && (fireArea[fires[hotspot]._id].timeStamp != fires[hotspot].date))) {
	    
            if (fireArea[fires[hotspot]._id]) {
               console.log("Remove circle");
               fireArea[fires[hotspot]._id].setMap(null);
            }

            //console.log('Paint');
            fireArea[fires[hotspot]._id] = new google.maps.Circle(populationOptions);
            google.maps.event.addListener(fireArea[fires[hotspot]._id], 'click', showInfo);
         }	    
      }
   }
	
   function showInfo() {
      //emitGiveMeTweets(this.timeStamp.id); //Pedir tweet mediante WS del fuego con ese id
      console.log(this);
      var date = this.timeStamp;
      var conf = this.confidence;
      var imp = this.impact;
      var dir = this.windDirection;
      if(dir==-1) dir=-1;
      else if(dir>337 || dir<22) dir="E"
      else if(dir>=22 || dir<67) dir="NE"
      else if(dir>=67 || dir<112) dir="N"
      else if(dir>=112 || dir<157) dir="NW"
      else if(dir>=157 || dir<202) dir="W"
      else if(dir>=202 || dir<247) dir="SW"
      else if(dir>=247 || dir<292) dir="S"
      else if(dir>=292 || dir<=337) dir="SE"
      
      $('#time_line').fadeIn('slow');
      $('#info').fadeOut('slow', function() {
         $('#info').html("");
         $('#info').html("<b>Date:</b> " + date + ". <b>Confidence:</b> " + conf + ". <b>Impact:</b> " + imp + ". <b>Wind direction:</b> " + dir + ".");
         $('#info').fadeIn();
      });
   }

   function hideInfo(){
      $('#time_line').fadeOut();
      $('#info').fadeOut('slow', function() {
         $('#info').text("");
      });
   }

   function zoomChange() {
      var radius;

      // Reshape circulos
      for (var tam in fireArea) {
         // Radio del circulo
         radius = 500000/Math.pow(1.75, map.zoom);
         if (radius < 1000) radius = 1000;
         var factor = ((5-(Math.log(fireArea[tam].impact)/Math.LN10))/2); //Porque si
         if (factor < 1) factor = 1;
         
         radius = radius/factor;
         
         fireArea[tam].setRadius(radius);
      }
   }

   function requestPoints() {
      var radius = 5000000000/Math.pow(10,map.zoom/2);
      var lat = map.getCenter().lat();
      var lng = map.getCenter().lng();
      if(lng<-180) lng=lng+Math.round(Math.abs(lng)/360)*360;
      else if(lng>180) lng=lng-Math.round(Math.abs(lng)/360)*360;
      
      $.ajax({
         url: API_HOST_URL + API_HOTSPOTS_PATH(lng,lat,radius),
         type: 'GET',
         dataType: 'json',
         success: function(data, textstatus, xhr){
         	     //console.log(map.zoom);
                     painter(data);
                  },
         error: function(error) {
                     console.log("error");
               }
      });
   }




   function printTweet(data){
      //$('#time_line').prepend('<div class="tweet"><h3>'+ data.username +'</h3><p>'+ data.text +'</p></div>');
      $('#time_line').prepend('<div class="tweet"><h3>Username</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras quis venenatis elit. Curabitur a justo nec justo lacinia tincidunt a et mi.</p></div>');
   }

})()
