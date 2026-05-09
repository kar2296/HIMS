(function () {
    'use strict';

    angular
        .module('app.settings')
        .run(projSettings);

    projSettings.$inject = ['$rootScope'];

    function projSettings($rootScope) {
        window.clientcode = 'hosmat';
        window.printcode = 'hosmat';
        window.barcodeclientcode = 'equitas';
        window.appPath = window.appPath || {};
        window.appPath.apiroot = "/api/";
        sessionStorage.setItem('base-path', window.appPath.apiroot);
        window.QR_CODE_URL='https://iswaryauat.drhms.in/';
    }
})();

(function () {
    'use strict';

    angular
        .module('common.utils')
        .config(ngIdleConfig);

    ngIdleConfig.$inject = ['IdleProvider', 'KeepaliveProvider'];

    function ngIdleConfig(IdleProvider, KeepaliveProvider) {
        KeepaliveProvider.interval(20); // in seconds
        IdleProvider.idle(10 * 60); // 10 minutes idle user
        IdleProvider.timeout(5);
    }
})();

(function () {
    'use strict';

    angular
        .module('app.settings')
        .config(httpCacheConfig);

    httpCacheConfig.$inject = ['$httpProvider'];

    function httpCacheConfig($httpProvider) {
        $httpProvider.interceptors.push(function() {
            return {
                'request': function(config) {
                    if (config.url && config.url.indexOf('.html') !== -1) {
                        if (config.url.indexOf('public/views/') !== -1 || config.url.indexOf('public/pages/') !== -1) {
                            var separator = config.url.indexOf('?') === -1 ? '?' : '&';
                            config.url = config.url + separator + 'v=' + new Date().getTime();
                        }
                    }
                    return config;
                }
            };
        });
    }
})();