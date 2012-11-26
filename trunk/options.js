var youtube = chrome.extension.getBackgroundPage().youtube;
$(function() {
    if (youtube.oauth.hasToken()) {
        $('#btn-login').hide();
        var url = "https://gdata.youtube.com/feeds/api/users/default";
        youtube.oauth.sendSignedRequest(url, function(text, xhr) {
            var data = JSON.parse(text);
            if (data && data['entry'] && data['entry']['title']) {
                var title = data['entry']['title']['$t'];
                $('#title').text(title);
                $('#connected').show();
            }
        }, {
            'parameters' : {
                'v': 2,
                'alt': 'json'
            },
            'headers' : {
                'X-GData-Key': 'key=' + youtube.settings.clientId
            }
        });
    } else {
        $('#connected').hide();
        $('#btn-login').show();
    }

    $('#btn-login').click(youtube.authorize);
    $('#btn-logout').click(youtube.logout);
});
