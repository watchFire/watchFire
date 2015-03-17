# watchFire
watchFire is a real time web application for fire detection using NASA data and feedback from people via social networks.

![watchFire](http://i.imgur.com/2T4nNWf.png)

## Why?
There are more than 100,000 fires each year in the U.S only, burning between 1.6 and 2 million hectares. They move at speeds up to 23 km an hour, destroying everything in their path and taking away human lives.

## Our goal
If a fire can be detected in time, people can prevent the damage it does to the environment and other people.

## How
Accessing near real-time data provided by NASA, we can get information about hot-spots all around the world. This data is then cross-checked with vegetation and actual weather information of the area (temperature, wind, and humidity) to assure the existence of fires and their danger.

We also use Twitter to measure the impact of these fires on populated areas.

The resultant data is displayed on a map, using different colors to show the fires based on their social impact and danger. This map can also be used to look for tweets about a fire and receive more information.

## Installation
For installation follow these steps:

1. Edit config.js with database params and server options
2. `node install.js`
3. `forever node interface.js &`
4. `forever node heartbeat.js &`

Now we have some cron jobs crawling and processing NASA's data and a REST API ready for requests. Our app displays this information in a friendly way allowing people to be watchful.

## What's next

* Enhance the intelligence that meassures the existence of fires and their danger to be more accurate.
* Take into account more factors such as terrain slope, roads or firewalls.
* Improve the semantic analyzer used with social networks data.
* Display more detailed information using a heat map.
* Use twitter and a mobile app to send fire alarms to the people using their GPS location so they will be well aware of fires in the nearest areas.

## Team
* Adam Barreiro
* Carlos Bello
* David de Juan
* Rubén Escartin
* Juan Gallego
* Cristian Garrido
* Cristofer Sanz
* Juan Téllez
* Pepe Vila

## See also
* [Our project in the NASA website](https://2014.spaceappschallenge.org/project/watchfire)

## Other stuff
### Data model
* coordinates: {type: "Point", coordinates: [longitude, latitude]},
* windSpeed: 5000,
* date: timestamp
* confidence: 0-100.0,
* temperature: 0.0-100.0,
* humidity: 0.0-100.0
* vegetation: (-0.1)-0.9
* frp: 0.0-300.0
* noise: 0.0-100.0
