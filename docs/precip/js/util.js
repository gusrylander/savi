var Util = function() {

	var formattedDate = function(d, separator) {
		var format = d3.timeFormat("%Y" + separator + "%m"+ separator + "%d");
		return format(d);
	}

	var formattedDate2 = function(d, separator) {
		var format = d3.timeFormat("%b" + separator + "%-d");
		return format(d);
	}

	return {
		formattedDate: formattedDate,
		formattedDate2: formattedDate2,
	}

}