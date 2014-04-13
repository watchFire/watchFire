package main.java.es.lib.json;

import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Map;

import main.java.es.lib.json.utils.JSONObject;



public class FireJson {


	public FireJson(ArrayList<Map<String, Object>> dataList, String output){

		Writer writer = null;
		try {
			writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(output), "utf-8"));

			writer.write("[\n");
			for(int i=0; i<dataList.size(); i++){
				JSONObject json = new JSONObject(dataList.get(i));
				writer.write(json.toString());
				if(i+1<dataList.size())
					writer.write(",\n");
			}
			writer.write("]");
		} catch (IOException ex) {
			// report
		} finally {
			try {writer.close();} catch (Exception ex) {}
		}
	}



}
