module.exports = function makeRequest() {
	return fetch ('/form').then(function(response) {
		return response.json();
	});
};
