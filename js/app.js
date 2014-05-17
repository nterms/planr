if(typeof planr == 'undefined') { planr = {}; }

planr.appUrl = 'http://localhost/planr';

planr.oauth: {
	returnUrl: planr.appUrl + '/oauth.html',
	google: {
		clientId: '1065004426697.apps.googleusercontent.com'
	}
};

planr.oauth.google.signIn = function() {
	window.location = 	'https://accounts.google.com/o/oauth2/auth?' +
						'client_id=' + planr.oauth.google.clientId + '&' +
						'response_type=token' + '&' +
						'redirect_uri=' + planr.oauth.returnUrl + '&' +
						'scope=email profile';
};

planr.oauth.google.handleResponse = function() {
	
};

planr.oauth.google.setAccessToken = function(accessToken) {
	localStorage.setItem('planr_google_access_token', accessToken);
};

planr.oauth.google.getAccessToken = function() {
	return localStorage.getItem('planr_google_access_token');
};
