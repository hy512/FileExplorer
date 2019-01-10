(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth < docEl.clientHeight ? docEl.clientWidth : docEl.clientHeight;
            if (!clientWidth) return;
            else if (clientWidth > 1080) docEl.style.fontSize = '300px';
            else if (clientWidth < 360) docEl.style.fontSize = '100px';
            else docEl.style.fontSize = (clientWidth / 3.6) + 'px';

        };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);