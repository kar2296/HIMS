(function () {
    'use strict';

    angular
        .module('app.routes')
        .config(routesConfig);

    routesConfig.$inject = ['$stateProvider', '$locationProvider', '$urlRouterProvider',
        'RouteHelpersProvider', 'modalStateProvider', 'modalConfigProvider'
    ];

    function routesConfig($stateProvider, $locationProvider, $urlRouterProvider,
        helper, modalStateProvider, modalConfigProvider) {
        $stateProvider
            .state('app.linenitemmasterlist', {
                url: '/linenitemmaster',
                title: 'linenitemmaster',
                templateUrl: helper.basepath('linenandlaundry/linenitemmaster/linenitemmaster-list.html'),
                controller: 'LinenItemMasterListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('linenandlaundry/linenitemmaster/linenitemmaster-list.js'));
                    }]
                }
            })
            .state('app.dhobiissuebooklist', {
                url: '/dhobiissuebook',
                title: 'Dhobi Issue Book',
                templateUrl: helper.basepath('linenandlaundry/dhobiissuebook/dhobiissuebook-list.html'),
                controller: 'DhobiIssueBookListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('linenandlaundry/dhobiissuebook/dhobiissuebook-list.js'));
                    }]
                }
            })
            .state('app.dhobiissuebookform', {
                url: '/dhobiissuebookform',
                title: 'Dhobi Issue Book',
                templateUrl: helper.basepath('linenandlaundry/dhobiissuebook/dhobiissuebook-form.html'),
                controller: 'DhobiIssueBookFormController as vm',
                params: { id: null },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('linenandlaundry/dhobiissuebook/dhobiissuebook-form.js'));
                    }]
                }
            })
            .state('app.linenstockentry', {
                url: '/linenstockentry',
                title: 'Linen Stock Entry',
                templateUrl: helper.basepath('linenandlaundry/linenstockentry/linenstockentry-list.html'),
                controller: 'LinenStockEntryListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('linenandlaundry/linenstockentry/linenstockentry-list.js'));
                    }]
                }
            })
            .state('app.linenstockentryform', {
                url: '/linenstockentryform',
                title: 'Linen Stock Entry',
                templateUrl: helper.basepath('linenandlaundry/linenstockentry/linenstockentry-form.html'),
                controller: 'LinenStockEntryFormController as vm',
                params: { id: null },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('linenandlaundry/linenstockentry/linenstockentry-form.js'));
                    }]
                }
            })
            .state('app.dhobireceipt', {
                url: '/dhobireceipt',
                title: 'Dhobi Receipt',
                templateUrl: helper.basepath('linenandlaundry/dhobireceipt/dhobireceipt-list.html'),
                controller: 'DhobiReceiptListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('linenandlaundry/dhobireceipt/dhobireceipt-list.js'));
                    }]
                }
            })
            .state('app.dhobireceiptform', {
                url: '/dhobireceiptform',
                title: 'Dhobi Receipt',
                templateUrl: helper.basepath('linenandlaundry/dhobireceipt/dhobireceipt-form.html'),
                controller: 'DhobiReceiptFormController as vm',
                params: { id: null },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('linenandlaundry/dhobireceipt/dhobireceipt-form.js'));
                    }]
                }
            })
            .state('app.linenstockstatus', {
                url: '/linenstockstatus',
                title: 'Linen Stock Status',
                templateUrl: helper.basepath('linenandlaundry/linenstockstatus/linenstockstatus.html'),
                controller: 'LinenStockStatusController as vm',
                params: { id: null },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('linenandlaundry/linenstockstatus/linenstockstatus.js'));
                    }]
                }
            })
            .state('app.linendashboard', {
                url: '/linendashboard',
                title: 'Linen Stock Status',
                templateUrl: helper.basepath('linenandlaundry/linendashboard/linendashboard.html'),
                controller: 'LinenDashboardController as vm',
                params: { id: null },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('linenandlaundry/linendashboard/linendashboard.js'));
                    }]
                }
            })




        modalConfigProvider.add('app.linenitemmaster', {
            templateUrl: helper.basepath('linenandlaundry/linenitemmaster/linenitemmaster-form.html'),
            controller: 'LinenItemMasterFormController',
            controllerUrl: helper.basepath('linenandlaundry/linenitemmaster/linenitemmaster-form.js'),
            size: 'lg'
        });

    }
})();