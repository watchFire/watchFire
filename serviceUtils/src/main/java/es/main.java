package main.java.es;

import main.java.es.lib.csv.CsvRead;
import main.java.es.lib.json.FireJson;

public class main {


	public static void main(String[] args) {

		
		//fichero config info URLs
		
		//Llamada URL para descargar fichero csv
		try {
			CsvRead csvRead = new CsvRead("https://firms.modaps.eosdis.nasa.gov/active_fire/text/Europe_24h.csv", ',');
			String properties[] = {"latitude","longitude","acq_date","acq_time","confidence"};

			FireJson FireJson = new FireJson(csvRead.search(properties), args[1]);
			
		} catch (Exception e) {
		}

	}

}
