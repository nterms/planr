if(typeof twine == 'undefined') { twine = {}; }

twine.appUrl = 'http://localhost/twine';

twine.oauth: {
	returnUrl: twine.appUrl + '/oauth.html',
	google: {
		clientId: '1065004426697.apps.googleusercontent.com'
	}
};

twine.oauth.google.signIn = function() {
	window.location = 	'https://accounts.google.com/o/oauth2/auth?' +
						'client_id=' + twine.oauth.google.clientId + '&' +
						'response_type=token' + '&' +
						'redirect_uri=' + twine.oauth.returnUrl + '&' +
						'scope=email profile';
};

twine.oauth.google.handleResponse = function() {
	
};

twine.oauth.google.setAccessToken = function(accessToken) {
	localStorage.setItem('twine_google_access_token', accessToken);
};

twine.oauth.google.getAccessToken = function() {
	return localStorage.getItem('twine_google_access_token');
};