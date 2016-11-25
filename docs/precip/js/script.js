$(document).ready(function() {
		
	var defaults,
		util,
		noaa,
		chart,
		map,
		yearRange;

	// default selected date for any user-selected year is Jun 1
	var defaultYearDate = function() {
		var year = $('.years').val();
		return new Date(year, 5, 1);
	}

	// Sun <-> Sun week that contains default selected date
	var selectedWeekRange = function() {
		var date = defaultYearDate();
		return [d3.timeWeek.floor(date), d3.timeWeek.ceil(date)];
	}

	// Jan 1 <-> Dec 31 year that contains default selected date
	var selectedYearRange = function() {
		var date = defaultYearDate();
		return [d3.timeYear.floor(date), d3.timeYear.ceil(date)];
	}
	
	// given min/max years pulled from carto, return array of all years (for dropdown)
	var getYearRange = function(dateRange) {
		var years = [], range;
		range = dateRange.map(function(d){
			return (d.getFullYear());
		});
		for (var i = range[0]; i <= range[1]; i++) {
			years.push(i).toString();
		}
		return years;
	}

	var getDayRangesFromYears = function(years) {
		var dayRanges = [];

		for (i = 0; i < years.length; i++) {
			var dummyDate = new Date(years[i], 1, 2);
			dayRanges.push([d3.timeYear.floor(dummyDate), d3.timeDay.offset(d3.timeYear.ceil(dummyDate), -1)]);
		}

		return dayRanges;
	}

	// insert years into dropdown
	var insertYears = function(years) {
		$('.years').html("");
		for (var i = 0; i < years.length; i++) {
			$('.years').append("<option value=" + years[i] + ">" + years[i] + "</option>");
		}
		$('.years').val("2016");
	}

	// get noaa data for selected year, render chart and map
	var render = function() {
		util = Util();
 		noaa = NOAA();
 		noaa.getPrecipData(selectedYearRange())
 		.then(function(data) {
			chart = Chart();
			chart.initialize(selectedYearRange());
			chart.render(data, function(dates) { map.render(dates) }, selectedWeekRange());
			map.render(selectedWeekRange());
		});
	}

	// initialize map
	map = Map();
	map.initialize();

	// get date range from carto
	map.getDateRange()
	.then(function(dateRange) {
		var years, ranges, promises = [];

		years = getYearRange(dateRange);

		// insert date range years into dropdown
		insertYears(years);

		// request all precip data, and compile promises to fulfill
		ranges = getDayRangesFromYears(years);
		noaa = NOAA();
		promises = [];
		ranges.forEach(function(r) {
			promises.push(noaa.getPrecipData(r));
		});

		// fulfill promises, cache precip data, then render chart and map
		Promise.all(promises).then(function(){
			render();
			$('.years').select2({ minimumResultsForSearch: -1})
			.on('change', function (evt) {
				$('#chart').html("");
				render();
			});
		});
	});
});

