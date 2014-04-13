package main.java.es.lib.json;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;


import main.java.es.lib.json.utils.JSONException;
import main.java.es.lib.json.utils.JSONObject;

public class WeatherJson {

	protected JSONObject json;

	public WeatherJson(float lat, float lng) throws Exception{
		URL oracle = new URL("http://api.geonames.org/findNearByWeatherJSON?lat="+lat+"&lng="+lng+"&username=cosa");

		URLConnection yc = oracle.openConnection();
		BufferedReader buffer = new BufferedReader(new InputStreamReader(yc.getInputStream(), Charset.forName("UTF-8")));

		String line;
		String answer ="";
		while ((line = buffer.readLine()) != null) {
			answer=answer+line;
		}
		this.json = new JSONObject(answer);
	}


	public float getTemperature(){
		try{
			return Float.parseFloat(((JSONObject)this.json.get("weatherObservation")).get("temperature").toString());	
		}catch(JSONException e){
			return -1;
		}

	}


	public float getWindSpeed(){
		try{
			return Float.parseFloat(((JSONObject)this.json.get("weatherObservation")).get("windSpeed").toString());
		}catch(JSONException e){
			return -1;
		}
	}


	public float getHumidity(){
		try{
			return Float.parseFloat(((JSONObject)this.json.get("weatherObservation")).get("humidity").toString());
		}catch(JSONException e){
			return -1;
		}
	}
	
	
	public float getWindDirection(){
		try{
			return Float.parseFloat(((JSONObject)this.json.get("weatherObservation")).get("windDirection").toString());
		}catch(JSONException e){
			return -1;
		}
	}	
	

}
