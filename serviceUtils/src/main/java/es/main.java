package main.java.es;

import main.java.es.lib.csv.CsvRead;
import main.java.es.lib.json.FireJson;

public class main {


	public static void main(String[] args) {


		//fichero config info URLs

		//Llamada URL para descargar fichero csv
		if (args.length <1)
		{
			System.out.println("Faltan argumentos");
			System.exit(1);
		}
		try {
			CsvRead csvRead = new CsvRead("https://firms.modaps.eosdis.nasa.gov/active_fire/text/Europe_24h.csv", ',');
			String properties[] = {"latitude","longitude","acq_date","acq_time","confidence","frp"};

			FireJson FireJson = new FireJson(csvRead.search(properties), args[0]);

			//FireJson FireJson = new FireJson(csvRead.search(properties), "C://Users//David//Desktop//repoServerCSV//prueba.json");
			System.out.println("END");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
