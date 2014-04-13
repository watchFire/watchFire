package main.java.es.lib.csv;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import main.java.es.lib.json.VegetationJson;
import main.java.es.lib.json.WeatherJson;


/**
 *	This class reads a CSV File 
 *
 */
public class CsvRead {


	protected String filePath;
	protected char delimiterChar;
	protected InputStream file;
	protected BufferedReader buffer;
	protected VegetationJson vegetationJson;

	/////////////////
	// CONSTRUCTOR //
	/////////////////
	public CsvRead(String filePath, char delimiterChar) throws Exception{
		this.filePath=filePath;
		this.delimiterChar=delimiterChar;
		URL oracle = new URL(filePath);
        URLConnection yc = oracle.openConnection();
		this.buffer = new BufferedReader(new InputStreamReader(yc.getInputStream(), Charset.forName("UTF-8")));

	}


	///////////////////
	//  CSV METHODS  //
	///////////////////
	/**
	 * This method returns the header of the CSV
	 * @return
	 * @throws IOException
	 */
	public String[] getHeader() throws IOException{
		String line;
		if((line = this.buffer.readLine()) != null){
			String[] header = line.split(Character.toString(delimiterChar));
			return header;
		}
		return null;
	}


	/**
	 * This method read a row of the CSV file and returns a map with the name
	 * of the column and its value. 
	 * @param header
	 * @return
	 * @throws IOException
	 */
	public Map<String, Object> read(String[] header, String[] columnsNames) throws Exception{
		String line;
		

		if ((line = this.buffer.readLine()) != null) {
			this.vegetationJson = new VegetationJson(',');
			String[] row = line.split(Character.toString(delimiterChar));
			Map<String, Object> rowMap = new HashMap<String, Object>();
			float lng = 0;
			float lat = 0;
			for(int i=0; i<header.length; i++){
				for(String columnName : columnsNames){
					if(header[i].equalsIgnoreCase("longitude"))
						lng=Float.parseFloat(row[i]);
					if(header[i].equalsIgnoreCase("latitude"))
						lat=Float.parseFloat(row[i]);
					if(columnName.equalsIgnoreCase(header[i])){
						if((header[i].equalsIgnoreCase("acq_time"))||(header[i].equalsIgnoreCase("acq_date")))
							rowMap.put(header[i], row[i]);
						else
							rowMap.put(header[i], Float.parseFloat(row[i]));
					}
				}
			}
			WeatherJson weatherJson = new WeatherJson(lat, lng);
			rowMap.put("temperature", weatherJson.getTemperature());
			rowMap.put("windSpeed", weatherJson.getWindSpeed());
			rowMap.put("humidity", weatherJson.getHumidity());
			rowMap.put("windDirection", weatherJson.getWindDirection());
			rowMap.put("vegetation", vegetationJson.getVegetation(lat, lng));
			return rowMap;
		}
		return null;
	}


	/**
	 * This method resets the file and lets start reading the file from the beginning,
	 * @throws IOException
	 */
	public void reset() throws IOException{
		// Close the file
		this.buffer.close();
		this.buffer = null;
		this.file = null;
		// Reopen the file
		this.file = new FileInputStream(this.filePath);
		this.buffer = new BufferedReader(new InputStreamReader(this.file, Charset.forName("UTF-8")));
	}
	
	
	
	public ArrayList<Map<String, Object>> search(String[] columnsNames) throws Exception{

		ArrayList<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
		//Check header
		String[] headerToCheck = this.getHeader();
		//Check body
		Map<String, Object> rowRead;
		//While there are rows to read
		while((rowRead = this.read(headerToCheck, columnsNames))!=null){
			resultList.add(rowRead);
		}
		return resultList;
	}
}
