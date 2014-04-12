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

	public WeatherJson(String lat, String lng) throws Exception{
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


	public String getTemperature(){
		try{
			return ((JSONObject)this.json.get("weatherObservation")).get("temperature").toString();	
		}catch(JSONException e){
			return "";
		}

	}


	public String getWindSpeed(){
		try{
			return ((JSONObject)this.json.get("weatherObservation")).get("windSpeed").toString();
		}catch(JSONException e){
			return "";
		}
	}


	public String getHumidity(){
		try{
			return ((JSONObject)this.json.get("weatherObservation")).get("humidity").toString();
		}catch(JSONException e){
			return "";
		}
	}
	
	
	public String getWindDirection(){
		try{
			return ((JSONObject)this.json.get("weatherObservation")).get("windDirection").toString();
		}catch(JSONException e){
			return "";
		}
	}	
	

}
