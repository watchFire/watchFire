watchFire
=========

NASA SpaceApps 2014 project 

watchFire is a real time web application for detection of fires using NASA data and people feedback. The app shows in a map the active fires in our planet, using Twitter relevance and the danger depending on different information: temperature, wind, humidity and vegetation.

The actual goal of this project is to detect fires in order to decrease the damages in the future.

Data model
---------

* coordinates: {type: "Point", coordinates: [longitude, latitude]},
* windSpeed: 5000,
* date: timestamp
* confidence: 0-100.0,
* temperature: 0.0-100.0,
* humidity: 0.0-100.0
* vegetation: (-0.1)-0.9
* frp: 0.0-300.0
* noise: 0.0-100.0

Members
---------

* Adam Barreiro
* David de Juan
* Juan Téllez
* Cristofer Sanz
* Cristian Garrido
* Juan Gallego
* Rubén Escartin
* Carlos Bello
* Pepe Vila

Installation
---------

For installation follow these steps:

0) (edit config.js with database params and server options)

1) $ node install.js

2) $ forever node interface.js &

3) $ forever node heartbeat.js &

Now we have some cron jobs crawling and processing NASA's data and a REST API ready for requests. Our App displays this information in a friendly way allowing people to be watchfull.
