package main.java.es.lib.json;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;


public class VegetationJson {


	//protected BufferedReader buffer;
	protected char delimiterChar;
	protected InputStream file;
	
	public VegetationJson(char delimiterChar) throws Exception{
		this.delimiterChar=delimiterChar;
		
		this.file = new FileInputStream("../serviceUtils/vegetation");
		//this.buffer = new BufferedReader(new InputStreamReader(this.file, Charset.forName("UTF-8")));
		
		//URL oracle = new URL("http://neo.sci.gsfc.nasa.gov/servlet/RenderData?si=1581320&cs=rgb&format=CSV&width=360&height=180");

		//URLConnection yc = oracle.openConnection();
		//this.buffer = new BufferedReader(new InputStreamReader(yc.getInputStream(), Charset.forName("UTF-8")));
	}
	
	
	public float getVegetation(float lat, float lng) throws Exception{
		BufferedReader buffer = new BufferedReader(new InputStreamReader(this.file, Charset.forName("UTF-8")));
		String line;
		int fila = 10*(90-(int)(lat));
		for(int i=0 ; i<fila ; i++){
			buffer.readLine();
		}
		line=buffer.readLine();
		String[] lngs = line.split(Character.toString(delimiterChar));
		
		int columna = 10*((int)(lng)+180);

		buffer.close();
		return Float.parseFloat(lngs[columna]);
	}
}
