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
        try {
            var data = JSON.parse(text);
        } catch(err) {
            console.log('Json patladı: ' + text);
        }
        //console.log(data);
        if (data && data['feed'] && data['feed']['entry']) {
            var entries = data['feed']['entry'];
            for (var i=0; i<entries.length; i++) {
                if (entries[i].content) {
                    var time = new Date(entries[i].published.$t).getTime();
                    watchedIds.push({id: youtube.getVideoId(entries[i].content.src), time: time});
                }
            }
        }
        return watchedIds;
    },
    getVideoId: function(src) {
        var str = src.replace('https://www.youtube.com/v/', ''),
            end = str.indexOf('?') === -1 ? 0 : str.indexOf('?');
        return str.substring(0, end);
    },
    decideWatched: function(id, callback) {
        var url = "https://gdata.youtube.com/feeds/api/users/default/watch_history",
            startIndex = 1,
            limit = 50,
            max = 1000;
        whileloop();
        function whileloop() {
            youtube.oauth.sendSignedRequest(url, function(text, xhr) {
                var watchedIds = youtube.getWatchedIds(text, xhr),
                    found = false,
                    lastWatchedTime = 0;
                for (var i=0; i<watchedIds.length; i++) {
                    var now = new Date().getTime();
                    if (now - watchedIds[i].time > 3000 && id == watchedIds[i].id) {
                        found = true;
                        if (!lastWatchedTime) {
                            lastWatchedTime = watchedIds[i].time;
                        }
                    }
                }
                if (found) {
                    callback({watched: true, lastWatchedTime: utils.getReadableTime(lastWatchedTime)});
                } else if (startIndex < max) {
                    setTimeout(whileloop, 0);
                } else {
                    callback({watched: false});
                }
            }, {
                'parameters' : {
                    'v': 2,
                    'alt': 'json',
                    'inline': true,
                    'max-results': limit,
                    'start-index': startIndex
                },
                'headers' : {
                    'X-GData-Key': 'key=' + youtube.settings.clientId
                }
            });
            startIndex += limit;
        }
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

var utils = {
    getReadableTime: function(time) {
        var t = new Date(time);
        return t.getMonth() + '.' + utils.getTwoDigitNumber(t.getDate()) + '.' + t.getFullYear() + ' ' + t.getHours() + ':' + t.getMinutes();
    },
    getTwoDigitNumber: function(num) {
        if (num > 10) return num;
        return '0' + num;
    }
}

chrome.extension.onMessage.addListener(function(vidId, _, sendResponse) {
    var result = youtube.decideWatched(vidId.videoId, sendResponse);
    return true;
});