/**
 * Mobile / WebView shell for the HIMS web app.
 *
 * The app also runs inside a native wrapper (Android / iOS WebView, e.g. Capacitor or Cordova).
 *  - Marks <html> with is-touch / is-webview so CSS can adapt (hims-modern-theme.css).
 *  - Back button (hardware back, swipe-back or browser back) closes the top popup first
 *    instead of navigating away from the page underneath it.
 *  - Capacitor / Cordova hardware back: close popup -> go back in history -> let the wrapper exit.
 */
(function () {
    'use strict';

    var html = document.documentElement;
    var ua = navigator.userAgent || '';
    var isWebView = !!(window.Capacitor || window.cordova || window.ReactNativeWebView ||
        /; wv\)/.test(ua) || /(iPhone|iPad|iPod).*AppleWebKit(?!.*Safari)/.test(ua));
    var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouch) { html.classList.add('is-touch'); }
    if (isWebView) { html.classList.add('is-webview'); }

    angular.module('angularApp').run(['$rootScope', '$injector', function ($rootScope, $injector) {
        var modalStack = $injector.has('$uibModalStack') ? $injector.get('$uibModalStack') : null;
        var backPressedAt = 0;

        function topModal() {
            return modalStack && modalStack.getTop ? modalStack.getTop() : null;
        }
        function closeTopModal() {
            var top = topModal();
            if (!top) { return false; }
            $rootScope.$applyAsync(function () { modalStack.dismiss(top.key, 'back'); });
            return true;
        }

        // History back (browser, swipe, or a wrapper that maps hardware back to history.back()).
        // Registered in the capture phase so it runs before Angular reacts to the URL change.
        var markBack = function () { backPressedAt = Date.now(); };
        window.addEventListener('popstate', markBack, true);
        window.addEventListener('hashchange', markBack, true);

        $rootScope.$on('$locationChangeStart', function (event) {
            // Only a back/forward gesture is intercepted; in-app navigation from a popup still works.
            if (Date.now() - backPressedAt < 400 && topModal()) {
                event.preventDefault();
                closeTopModal();
            }
        });

        // Native hardware back button.
        function onHardwareBack(canGoBack) {
            if (closeTopModal()) { return; }
            if (canGoBack !== false && window.history.length > 1) {
                window.history.back();
                return;
            }
            var app = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
            if (app && app.exitApp) { app.exitApp(); }
            else if (navigator.app && navigator.app.exitApp) { navigator.app.exitApp(); }
        }
        var capApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
        if (capApp && capApp.addListener) {
            capApp.addListener('backButton', function (e) { onHardwareBack(e && e.canGoBack); });
        }
        document.addEventListener('backbutton', function (e) {   // Cordova
            e.preventDefault();
            onHardwareBack();
        }, false);
    }]);
})();
