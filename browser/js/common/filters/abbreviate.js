app.filter('abbr', function() {
	return function (input) {
		var max = 13;
		if (input.length > max) {
			return input.slice(0, max) + '..'
		}
		return input;
	}
})