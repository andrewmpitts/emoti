/**
 * Created by andrewpitts on 6/4/17.
 */

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var el = document.activeElement;
        el.focus();
        document.execCommand('paste');
    });