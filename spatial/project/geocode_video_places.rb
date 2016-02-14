#!/usr/bin/env ruby

#require "erb"           # for url-encoding the place name to use as api call param
require "httpclient"    # for making api call
require "json"          # for parsing json result of api call
require "csv"           # for storing parsed results to csv file

#include ERB::Util

API_KEY = "AIzaSyAYLLZ07K6DWNYS0T10LQ1TiUgfNAhbheA"
GOOGLE_GEOCODE_BASE_URI = "https://maps.googleapis.com/maps/api/geocode/json"
INFILE = "./SAVI_SPATIAL_pratt_savi_spatial_base_unique_geo_terms_1001-1077.csv"
OUTFILE_GEOCODES = "SAVI_SPATIAL_geocoded_video_places_unique_1-1000.csv"
OUTFILE_LOCATION_TYPES = "SAVI_SPATIAL_location_types.csv"
OUTFILE_ADDRESS_COMPONENTS = "SAVI_SPATIAL_address_components.csv"
OUTFILE_ADDRESS_COMPONENT_LOCATION_TYPES = "SAVI_SPATIAL_address_component_location_types.csv"
HEADER = [
  "nyt_geo_term",
  "google_geo_term",
  "google_place_id",
  "latitude",
  "longitude",
  "lat_ne_bound",
  "lng_ne_bound",
  "lat_sw_bound",
  "lng_sw_bound",
  "lat_ne_view",
  "lng_ne_view",
  "lat_sw_view",
  "lng_sw_view",
  "location_types"
]


def parse_address(line)
  place, n = line.split("\t")
  place.strip
end

def parse_address_components(address_components)
  components = address_components
  result = []
  components.each do |c|
    puts c
    result << c["short_name"]
    result << c["long_name"]
    result << parse_location_types(c["types"])
  end
  result
end

def parse_location_types(location_types)
  location_types
end

def parse_coords(point)
  [point["lat"], point["lng"]]
end

def parse_geometry(geometry)
  result = []
  if geometry["location"]
    result += parse_coords(geometry["location"])
  else
    2.times { result << nil }
    puts "ERROR: no geometry/location}"
  end
  #bounds = geometry["bounds"]
  #if bounds && bounds["northeast"] && bounds["southwest"]
  #  result += parse_coords(bounds["northeast"])
  #  result += parse_coords(bounds["southwest"])
  #else
  #  4.times { result << nil }
  #  puts "ERROR: no geometry/bounds}"
  #end
  viewport = geometry["viewport"]
  if viewport && viewport["northeast"] && viewport["southwest"]
     result += parse_coords(viewport["northeast"])
     result += parse_coords(viewport["southwest"])
  else
    4.times { result << nil }
    puts "ERROR: no geometry/viewport"
  end
  result
end

http = HTTPClient.new
query = { :key => API_KEY }

CSV.open(OUTFILE_GEOCODES, "w") do |csv|
    
  # write header
  puts HEADER.join("\t")
  csv << HEADER
  
  File.open(INFILE, "r") do |f|
  
    f.each_line do |line|
      
      address = parse_address(line)
      puts "Geocoding on #{address}"
      query[:address] = address
      
      response = http.get(GOOGLE_GEOCODE_BASE_URI, query)
    
      # parse results
      if response.status = 200
        content = JSON.parse(response.content)
        results = content["results"]
        status = content["status"]
        if results.size > 0
          result = results[0]
          geometry = [address, result["formatted_address"], result["place_id"]] + 
                     parse_geometry(result["geometry"]) + 
                     [result["types"].join(",")]
          puts "[Status: #{status}] #{geometry.join("\t")}"
          csv << geometry
        else
          puts "ERROR: no results for '#{address}'."
        end
      else
        puts "ERROR: can't geocode '#{address}'"
      end
              
    end
  
  end
  
end