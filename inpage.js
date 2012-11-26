
function getParameterArray(str) {
    var paramsStr = str ? str : location.search.substring(1, location.search.length);
    paramsStr = paramsStr.split('&');
    var params = [];
    for (var i=0; i<paramsStr.length; i++) {
        var oneParam = paramsStr[i].split('=');
        params[oneParam[0]] = oneParam[1];
    }
    return params;
}

function getCurrentVideoId() {
        var params = getParameterArray();
        var id = params['v'] ? params['v'] : '';
        return id;
}

var currentVideoId = getCurrentVideoId();

chrome.extension.sendMessage({videoId: currentVideoId}, function(response) {
    console.log(response);
    if (response.watched) {
        $('#eow-title').html($('#eow-title').html() + '[watched]');
    }
});

chrome.extension.onMessage.addListener(function(msg, _, sendResponse) {
    console.log(99);
    alert("Got message from background page: " + msg);
});
