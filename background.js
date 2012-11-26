var youtube = {
    settings: {
        clientId: 'AI39si6YdU2n57ifw6ksfRIpxPnlMbR-GAMv-fcDsvqvofIWzOgwFn3HormM1Qps3_vKOhRUAomUlIDriczqNje_VCDUnmnJMw'
    },
    oauth: ChromeExOAuth.initBackgroundPage({
        'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
        'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
        'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
        'consumer_key': 'anonymous',
        'consumer_secret': 'anonymous',
        'scope': 'https://gdata.youtube.com',
        'app_name': 'Did I Watch It?'
    }),
    getWatchedIds: function(text, xhr) {
        var watchedIds = [];
        var data = JSON.parse(text);
        if (data && data['feed'] && data['feed']['entry']) {
            var entries = data['feed']['entry'];
            for (var i=0; i<entries.length; i++) {
                if (entries[i].content) {
                    watchedIds.push(youtube.getVideoId(entries[i].content.src));
                }
            }
        }
        return watchedIds;
    },
    getVideoId: function(src) {
        var str = src.replace('https://www.youtube.com/v/', '');
        var end = str.indexOf('?') === -1 ? 0 : str.indexOf('?');
        return str.substring(0, end);
    },
    decideWatched: function(id, callback) {
        var url = "https://gdata.youtube.com/feeds/api/users/default/watch_history";
        youtube.oauth.sendSignedRequest(url, function(text, xhr) {
            var watchedIds = youtube.getWatchedIds(text, xhr);
            console.log(watchedIds);
            console.log(id);
            console.log($.inArray(id, watchedIds));
            var watched = false;
            if ($.inArray(id, watchedIds) !== -1) {
                watched = true;
            }
            callback({watched: watched});
            //return watched;
        }, {
            'parameters' : {
                'v': 2,
                'alt': 'json',
                'inline': true
            },
            'headers' : {
                'X-GData-Key': 'key=' + youtube.settings.clientId
            }
        });
    },
    authorize: function() {
        youtube.oauth.authorize(function() {
            alert('Successfully authorized');    
        });
    },
    logout: function() {
        youtube.oauth.clearTokens();
        alert('You have logged out');
    }
};

chrome.extension.onMessage.addListener(function(vidId, _, sendResponse) {
    var result = youtube.decideWatched(vidId.videoId, sendResponse);
    console.log('result: ' + result);
    return true;
});