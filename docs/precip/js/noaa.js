var NOAA = function() {

     //TOKEN: "zuaINMzpFJTIwKVgRhCBNSUQggvWkpUX"  // gus's token
    var NOAA = {
        URL: "https://www.ncdc.noaa.gov/cdo-web/api/v2/data",
        TOKEN: "DKkaIwRgdAtlwYgARVlziBXyuPfhITqD"  // korin's token
    }

    var noaaPayload = function(dateRange) {

        util = Util();
        return {
            datasetid: "GHCND",
            stationid: "GHCND:USW00094789",
            startdate: util.formattedDate(dateRange[0], '-'),
            enddate: util.formattedDate(dateRange[1], '-'),
            datatypeid: "PRCP",
            limit: "1000",
            includemetadata: "false",
            units: "standard"
        }
    }

    // http://stackoverflow.com/questions/6754990/how-to-do-i-get-object-keys-by-a-pattern
    var filtered_keys = function(cache, filter) {

        var keys = [];

        for (var i = 0; i < cache.length; i++){
            var k = cache.key(i);
            if (filter.test(k)) {
                keys.push(k);
            }
        }

        return keys;
    }

    var getMaxPrecip = function(cache, key) {

        var matcher, noaaYears, max = 0;

        matcher = new RegExp("^" + key);
        noaaYears = filtered_keys(cache, matcher);

        for (i = 0; i < noaaYears.length; i++) {
            var days;
            days = JSON.parse(cache.getItem(noaaYears[i])).data;
            for (j = 0; j < days.length; j++) {
                if (days[j].value > max) {
                    max = days[j].value
                }
            }
        }

        return max;
    }

    var now = function() {
        return new Date(Date.now());
    }

    var  getPrecipData = function(dateRange) { 

        var util, noaa_payload, year, key, key_max, cache, precipData;

        return new Promise( function(resolve, reject) {

            year = dateRange[0].getFullYear();
            key = "noaa_precip_" + year;
            keyMax = "max_noaa_precip";
            cache = localStorage;

            // try to fetch data from localStorage, fail and fetch from NOAA if cache is empty or expired.
            try { 

                var isExpired;

                precipData = JSON.parse(cache.getItem(key));
                if (! precipData) throw now() + ": " + year + " data is not cached.  Fetching from NOAA";

                isExpired = d3.timeDay.offset(precipData.lastUpdate, 1) < now();
                if (isExpired) throw now() + ": " + year + " data is expired.  Re-fetching from NOAA";

                cache.setItem(keyMax, getMaxPrecip(cache, "noaa_precip_"));
                resolve(precipData.data);

            } catch (e) {

                /*
                // SUBSTITUTE CODE IN CASE NOAA IS UNREACHABLE AND YOU
                // WANT TO USE THE LOCALLY STORED DATA INSTEAD: 
                // data/noaa/noaaData.js
                var precipData = getNOAAData(year);
                precipData = {
                    lastUpdate: Date.now(), 
                    data: precipData.results
                }

                delete precipData.results;
                cache.setItem(key, JSON.stringify(precipData));
                cache.setItem(keyMax, getMaxPrecip(cache, "noaa_precip_"));
                $("#chart").html("");
                resolve(precipData.data);
                */

                $.ajax({
                    url: NOAA["URL"],
                    type: "GET",
                    headers: {
                        "token": NOAA["TOKEN"]
                    },
                    data: noaaPayload(dateRange),
                    beforeSend: function( xhr ) {
                        $("#chart").html("<i id='spinner' class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>");
                    }
                })
                .done(function(precipData, textStatus, jqXHR) {
                    precipData = {
                        lastUpdate: Date.now(), 
                        data: precipData.results
                    }
                    delete precipData.results;
                    cache.setItem(key, JSON.stringify(precipData));
                    resolve(precipData.data);
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR);
                    reject("errors:" + errorThrown);
                })
                .always(function() {
                    cache.setItem(keyMax, getMaxPrecip(cache, "noaa_precip_"));
                    $("#chart").html("");
                });

            }

        });
    }

    return {
        getPrecipData: getPrecipData
    }

};
