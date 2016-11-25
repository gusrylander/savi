# OSAmap

This map shows water quality results for 2015 from two datasets. The first is the NYC Department of Environmental Protection (DEP) Harbor Survey which takes samples throughout the year. The second is from NYC Water Trail Association (NYCWTA), a group of citizen scientists that sample during the recreation season (May-October). DEP’s data is available on their website (http://www.nyc.gov/html/dep/html/harborwater/harbor_water_sampling_results.shtml). Each year’s water quality results are available as an excel sheet, and its coordinates are in a separate spreadsheet. The coordinates are not the most up to date. I emailed DEP to ask for the following coordinates, but have not yet heard back: 
AC2, EJ1, EJ2, EJ3, EJ4, EJ5, EJ6, EJ7, EJ8, EJ9, E12, E13, HR1, HR2, JA1, NR1, WC1, WC2, WC3

NYCWTA has their spreadsheets in Google Docs you can download (http://www.nyc.gov/html/dep/html/harborwater/harbor_water_sampling_results.shtml). The sampling sites are stored in a Google Map. I obtained the lat long by emailing NYCWTA and having them share the Google Map with me, which I downloaded as a KML and converted into a shapefile.
The data uses the columns to show water quality results over time, unlike DEP which uses rows. I rearranged the NYCWTA data to have a row for each recording to match DEP’s data, so that each site will have multiple rows. The names of the sites in the water quality results didn’t match the ones on the map, so I created a siteID for each site and manually assigned them so the sites would match. There is a column for date and for the Enterococcus results. DEP’s data has many other sampling results (Fecal Coliform, Dissolved Oxygen, etc.) but I kept just their Enterococcus results from the top of the water sample to match NYCWTA data. I combined both datasets into one spreadsheet using excel so I could visualize them together with a timeslider. I rearranged and renamed the columns to make it as simple as possible. The final dataset is available in a csv in the data folder.
The data is styled to show how poor the water quality is. I mimicked NYCWTA’s styling; they show how the Department of Health evaluates water quality for swimming based on the most probable number of Enterococcus colonies in a 100 milliliter water sample. This is described in the legend. 
Timeslider
I used the jQRangeSlider to visualize water quality results over time (http://ghusse.github.io/jQRangeSlider/) using their styling (iThing.css). To link the slider to my data, I used a “values changed” listener to update the map with data after the slider has been moved. I used the following SQL to update the map: 
var sql = "SELECT * FROM all_sites_2015 WHERE DATE > '" + data.values.min.toISOString() + "' AND DATE < '" + data.values.max.toISOString() + "'";
      var url = 'https://korin.cartodb.com/api/v2/sql?' + $.param({
        q: sql,
        format: 'GeoJSON'
      });
      $.getJSON(url)

I also used a clearLayers function to make sure data would be reloaded each time, and not continually written on top of itself.
     .done(function (data) {
        dataLayer.clearLayers();
        dataLayer.addData(data);
      });

Basemap – Mapbox Studio
I used Mapbox Studio to design the basemap. I made water the most prominent feature, and the rest of the features (streets, parks) muted. When you zoom in, it will fade into satellite so you can see better details about where the water quality testing is happening.  I did this by adding satellite basetiles to my Mapbox style, and having it at 0% opacity. At zoom 15 it fades in at 50% opacity, and 100% at zoom 16. Labels are on top of tileset layer so they can always be seen.

Precipitation chart – C3
I used c3 to make the chart, which relies on a d3 library. I downloaded daily historical rainfall from Weather Underground for JFK in 2015. The data comes in a CSV, then I converted the precipitation data into an array using concatenate tricks in excel.

Future iterations of the map will include water quality data from more years, an “about” section to describe what impacts our water quality and why precipitation affects it, and have precipitation more efficiently linked to the date.
