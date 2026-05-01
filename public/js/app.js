/*!
 *
 * Angle - Bootstrap Admin App + AngularJS
 *
 * Version: 3.4
 * Author: @themicon_co
 * Website: http://themicon.co
 * License: https://wrapbootstrap.com/help/licenses
 *
 */

// APP START
// -----------------------------------

(function() {
    'use strict';

    angular
        .module('angularApp', [
            'app.core',
            'app.routes',
            'app.sidebar',
            'app.navsearch',
            'app.preloader',
            'app.loadingbar',
            'app.translate',
            'app.settings',
            'app.utils',
            'app.pages',
            'toastr',
            'ngViewBuilder',
            'ngAnimate',
            'ngMessages',
            'ngFabForm',
            'jqwidgets',
            'ngIdle',
            'rzTable'
        ]).filter('dotParser', function() {
            return function(value, str) {
                var breaq = false
                str = str.split('.').reduce((o, i) => {
                    if (!breaq && o[i]) {
                        return o[i];
                    } else {
                        breaq = true;
                    }
                }, value);
                // var returnVal = '';
                // if (value[str[0]]) {
                //   returnVal = value[str[0]];
                // }
                // if (returnVal[str[1]]) {
                //   returnVal = returnVal[str[1]];
                // }
                // if (returnVal[str[2]]) {
                //   returnVal = returnVal[str[2]];
                // }
                // if (returnVal[str[3]]) {
                //   returnVal = returnVal[str[3]];
                // }
                return str;
            };
        })
        .directive('cellTemplate', cellTemplateFun)
        .component('customTable', {
            templateUrl: 'app/js/custom-table.html',
            controller: customTableController,
            bindings: {
                config: '<',
                onUpdate: '&'
            }
        });
    cellTemplateFun.$inject = ['$compile'];

    function cellTemplateFun($compile) {
        var linker = function(scope, element, attrs) {
            if (scope.event && typeof(scope.event) == 'function') {
                scope.handleEvents = scope.event;
            }
            element.html(scope.template);
            $compile(element.contents())(scope);
        };
        return {
            restrict: "E",
            replace: true,
            link: linker,
            scope: {
                entity: '=entity',
                index: '=index',
                template: '=template',
                event: '=event',
            }
        }
    }

    function customTableController() {
        var ctrl = this;
        ctrl.reOrder = function(ins) {
            if (!ins['order']) {
                ins['order'] = 1;
            } else {
                ins['order'] = -ins['order'];
            }
            var field = ins['field'];
            var order = ins['order'];
            ctrl.config.data = ctrl.config.data.sort(function(a, b) {
                var breaq = false;
                a = field.split('.').reduce((o, i) => {
                    if (!breaq && o[i]) {
                        return o[i];
                    } else {
                        breaq = true;
                    }
                }, a);
                breaq = false;
                b = field.split('.').reduce((o, i) => {
                    if (!breaq && o[i]) {
                        return o[i];
                    } else {
                        breaq = true;
                    }
                }, b);
                var x = a ? a.toLowerCase() : '';
                var y = b ? b.toLowerCase() : '';
                if (x < y) {
                    return -order;
                }
                if (x > y) {
                    return order;
                }
                return 0;
            })
            console.log("order", order);
            console.log(ctrl.config.data);
        }
    }

})();


//'ui.calendar',

(function() {
    'use strict';

    angular
        .module('app.colors', []);
})();
(function() {
    'use strict';

    angular
        .module('app.core', [
            'ngRoute',
            'ngAnimate',
            'ngMessages',
            'ngStorage',
            'ngCookies',
            'pascalprecht.translate',
            'ui.bootstrap',
            'ui.router',
            'oc.lazyLoad',
            'cfp.loadingBar',
            'ngSanitize',
            'ngResource',
            'ui.utils'
        ]);
})();
(function() {
    'use strict';

    angular
        .module('app.lazyload', []);
})();
(function() {
    'use strict';

    angular
        .module('app.loadingbar', []);
})();
(function() {
    'use strict';

    angular
        .module('app.navsearch', []);
})();
(function() {
    'use strict';

    angular
        .module('app.preloader', []);
})();


(function() {
    'use strict';

    angular
        .module('app.routes', [
            'app.lazyload'
        ]);
})();
(function() {
    'use strict';

    angular
        .module('app.settings', []);
})();
(function() {
    'use strict';

    angular
        .module('app.sidebar', []);
})();
(function() {
    'use strict';

    angular
        .module('app.translate', []);
})();
(function() {
    'use strict';

    angular
        .module('app.utils', [
            'app.colors'
        ]);
})();

(function() {
    'use strict';

    angular
        .module('app.pages', []);
})();

(function() {
    'use strict';

    angular
        .module('dialog.utils', ['ngDialog']);
})();

(function() {
    'use strict';

    angular
        .module('common.utils', ['angularMoment', 'ngDialog', 'ngFabForm', 'ngLodash']);
})();


(function() {
    'use strict';

    angular
        .module('app.colors')
        .constant('APP_COLORS', {
            'primary': '#5d9cec',
            'success': '#27c24c',
            'info': '#23b7e5',
            'warning': '#ff902b',
            'danger': '#f05050',
            'inverse': '#131e26',
            'green': '#37bc9b',
            'pink': '#f532e5',
            'purple': '#7266ba',
            'dark': '#3a3f51',
            'yellow': '#fad732',
            'gray-darker': '#232735',
            'gray-dark': '#3a3f51',
            'gray': '#dde6e9',
            'gray-light': '#e4eaec',
            'gray-lighter': '#edf1f2'
        });
})();
/**=========================================================
* Module: colors.js
* Services to retrieve global colors
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.colors')
        .service('Colors', Colors);

    Colors.$inject = ['APP_COLORS'];

    function Colors(APP_COLORS) {
        this.byName = byName;

        ////////////////

        function byName(name) {
            return (APP_COLORS[name] || '#fff');
        }
    }

})();

(function() {
    'use strict';

    angular
        .module('app.core')
        .config(coreConfig);

    coreConfig.$inject = ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$animateProvider'];

    function coreConfig($controllerProvider, $compileProvider, $filterProvider, $provide, $animateProvider) {

        var core = angular.module('app.core');
        // registering components after bootstrap
        core.controller = $controllerProvider.register;
        core.directive = $compileProvider.directive;
        core.filter = $filterProvider.register;
        core.factory = $provide.factory;
        core.service = $provide.service;
        core.constant = $provide.constant;
        core.value = $provide.value;

        // Disables animation on items with class .ng-no-animation
        $animateProvider.classNameFilter(/^((?!(ng-no-animation)).)*$/);

        // Improve performance disabling debugging features
        // $compileProvider.debugInfoEnabled(false);
    }
})();
/**=========================================================
* Module: constants.js
* Define constants to inject across the application
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.core')
        .constant('APP_MEDIAQUERY', {
            'desktopLG': 1200,
            'desktop': 992,
            'tablet': 768,
            'mobile': 480
        });

})();
(function() {
    'use strict';

    angular
        .module('app.core')
        .run(appRun);

    appRun.$inject = ['$rootScope', '$state', '$stateParams', '$window', '$templateCache', 'Colors'];

    function appRun($rootScope, $state, $stateParams, $window, $templateCache, Colors) {
        // Set reference to access them from any scope
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$storage = $window.localStorage;

        // Uncomment this to disable template cache
        /*$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if (typeof(toState) !== 'undefined'){
              $templateCache.remove(toState.templateUrl);
            }
        });*/

        // Allows to use branding color with interpolation
        // {{ colorByName('primary') }}
        $rootScope.colorByName = Colors.byName;

        // cancel click event easily
        $rootScope.cancel = function($event) {
            $event.stopPropagation();
        };

        // Hooks Example
        // -----------------------------------

        // Hook not found
        $rootScope.$on('$stateNotFound',
            function(event, unfoundState /*, fromState, fromParams*/ ) {
                console.log(unfoundState.to); // "lazy.state"
                console.log(unfoundState.toParams); // {a:1, b:2}
                console.log(unfoundState.options); // {inherit:false} + default options
            });
        // Hook error
        $rootScope.$on('$stateChangeError',
            function(event, toState, toParams, fromState, fromParams, error) {
                console.log(error);
            });
        // Hook success
        $rootScope.$on('$stateChangeSuccess',
            function( /*event, toState, toParams, fromState, fromParams*/ ) {
                // display new view from top
                $window.scrollTo(0, 0);
                // Save the route title
                $rootScope.currTitle = $state.current.title;
                $rootScope.pgTitle = $rootScope.app.name + ' - ' + ($rootScope.currTitle || $rootScope.app.description);
            });

        // Load a title dynamically
        $rootScope.currTitle = $state.current.title;
        $rootScope.pageTitle = function() {
            var title = $rootScope.app.name + ' - ' + ($rootScope.currTitle || $rootScope.app.description);
            document.title = title;
            return title;
        };

    }

})();


(function() {
    'use strict';

    angular
        .module('app.lazyload')
        .config(lazyloadConfig);

    lazyloadConfig.$inject = ['$ocLazyLoadProvider', 'APP_REQUIRES'];

    function lazyloadConfig($ocLazyLoadProvider, APP_REQUIRES) {

        // Lazy Load modules configuration
        $ocLazyLoadProvider.config({
            debug: false,
            events: true,
            modules: APP_REQUIRES.modules
        });

    }
})();
(function() {
    'use strict';

    angular
        .module('app.lazyload')
        .constant('APP_REQUIRES', {
            // jQuery based and standalone scripts
            scripts: {
                'modernizr': ['vendor/modernizr/modernizr.custom.js'],
                'icons': ['vendor/fontawesome/css/font-awesome.min.css',
                    'vendor/simple-line-icons/css/simple-line-icons.css'
                ]
            },
            // Angular based script (use the right module name)
            modules: [{
                    name: 'ui.grid',
                    files: ['vendor/angular-ui-grid/ui-grid.min.css', 'vendor/angular-ui-grid/ui-grid.min.js']
                },
                {
                    name: 'ui.select',
                    files: ['vendor/angular-ui-select/dist/select.js', 'vendor/angular-ui-select/dist/select.css']
                },
                {
                    name: 'colorpicker.module',
                    files: ['vendor/angular-bootstrap-colorpicker/css/colorpicker.css', 'vendor/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js']
                },
                {
                    name: 'ngDialog',
                    files: ['vendor/ngDialog/js/ngDialog.min.js',
                        'vendor/ngDialog/css/ngDialog.min.css',
                        'vendor/ngDialog/css/ngDialog-theme-default.min.css'
                    ]
                },
                {
                    name: 'angularMoment',
                    files: ['vendor/angular-moment/angular-moment.min.js']
                },
                {
                    name: 'ngFileUpload',
                    files: ['vendor/ng-file-upload/ng-file-upload.min.js']
                },
                {
                    name: 'ckeditor',
                    files: ['vendor/ckeditor/ckeditor.js', 'vendor/angular-ckeditor/angular-ckeditor.min.js']
                },
                {
                    name: 'dndLists',
                    files: ['vendor/angular-drag-drop/angular-drag-and-drop-lists.js']
                },
                {
                    name: 'webcam',
                    files: ['vendor/webcam/webcam.js']
                },
                {
                    name: 'signature',
                    files: ['vendor/signature/signature_pad.min.js', 'vendor/signature/signature.js']
                },
                {
                    name: 'ui.bootstrap.datetimepicker',
                    files: ['vendor/datetime-picker/datetime-picker.js']
                },
                {
                    name: 'angularjs-dropdown-multiselect',
                    files: ['vendor/angularjs-dropdown-multiselect/angularjs-dropdown-multiselect.js']
                },
                {
                    name: 'mathjs',
                    files: ['vendor/mathjs/math.min.js']
                },
                {
                    name: 'ivh.treeview',
                    files: ['vendor/ivh-treeview/ivh-treeview.js', 'vendor/ivh-treeview/ivh-treeview.css',
                        'vendor/ivh-treeview/ivh-treeview-theme-basic.css'
                    ]
                },
                {
                    name: 'cfp.hotkeys',
                    files: ['vendor/angular-hotkeys/hotkeys.js', 'vendor/angular-hotkeys/hotkeys.css']
                },
                {
                    name: 'ngJSONPath',
                    files: ['vendor/ng-jsonpath/ng-jsonpath.min.js']
                },
                {
                    name: 'focus-if',
                    files: ['vendor/focusif/focusIf.js']
                },
                {
                    name: 'angular-focus-first-field',
                    files: ['vendor/angular-focus-first-field/angular-focus-first-field.js']
                },
                {
                    name: 'chart.js',
                    files: ['vendor/chart.js/dist/chart.js',
                        'vendor/angular-chart.js/dist/angular-chart.js'
                    ],
                    serie: true
                },
                {
                    name: 'nvd3ChartDirectives',
                    files: ['vendor/nvd3/d3.min.js', 'vendor/nvd3/nv.d3.min.js',
                        'vendor/nvd3/angularjs-nvd3-directives.min.js', 'vendor/nvd3/nv.d3.css'
                    ],
                    serie: true
                },
                {
                    name: 'ui.bootstrap-slider',
                    files: ['vendor/seiyria-bootstrap-slider/bootstrap-slider.min.js',
                        'vendor/seiyria-bootstrap-slider/bootstrap-slider.min.css',
                        'vendor/seiyria-bootstrap-slider/slider.js'
                    ],
                    serie: true
                },
                {
                    name: 'annotorious',
                    files: ['vendor/angular-annotation/annotorious.min.js',
                        'vendor/angular-annotation/angular-colorbox.js',
                        'vendor/angular-annotation/angular-ezplus.js',
                        'vendor/angular-annotation/angular-annotorious.js',
                        'vendor/angular-annotation/annotorious.css', 'vendor/angular-annotation/colorbox-darktheme.css'
                    ]
                },
                {
                    name: 'gm',
                    files: ['vendor/angular-google-maps/angularjs-google-maps.js']
                },
                {
                    name: 'angularjs-crypto',
                    files: ['vendor/crypto/core-min.js', 'vendor/crypto/md5-min.js',
                        'vendor/crypto/enc-base64-min.js', 'vendor/crypto/evpkdf-min.js',
                        'vendor/crypto/cipher-core-min.js',
                        'vendor/crypto/aes-min.js', 'vendor/crypto/CryptoJSCipher.js',
                        'vendor/crypto/CryptoJSPassWordCipher.js', 'vendor/crypto/angularjs-crypto.js'
                    ],
                    serie: true
                },
                {
                    name: 'common.utils',
                    files: ['vendor/common/ngConfirmDialogHelper.js', 'vendor/common/ngCommonHelper.js',
                        'vendor/common/ngFacilitySettings.js',
                        'vendor/common/ngAPIHelper.js', 'vendor/common/ngAlertHelper.js',
                        'vendor/common/ngLookupHelper.js', 'vendor/common/ngCommonUtils.js',
                        'vendor/common/ngFormatHelper.js', 'vendor/common/ngValidatorHelper.js',
                        'vendor/common/ngSessionHelper.js', 'vendor/common/ngModalHelper.js',
                        'vendor/common/ngChartHelper.js', 'vendor/common/ngPrivilegeHelper.js',
                        'app/views/emr/patientemr/topbar/patientemr-topbar.js',
                        'app/views/patientportal/topbar/patientportal-topbar.js',
                        'vendor/common/ngCtrlHelper.js',
                        'app/views/common/basecontroller.js',
                        'app/views/common/cnsection-basecontroller.js',
                        'app/views/common/emrbasecontroller.js',
                        'app/views/common/userpreferencecontroller.js',
                        'app/views/common/privilegecontroller.js',
                        'app/views/common/validationcontroller.js',
                        'app/views/common/dotmatrixcontroller.js',
                        'app/views/common/dotmatrixprintcontroller.js',
                        'app/views/common/barcodeprintcontroller.js',
                        'vendor/common/ngUtils.js', 'vendor/common/ngWebCamHelper.js',
                        'vendor/components/address.js', 'vendor/components/pincodecontrol.js',
                        'vendor/components/countrycontrol.js', 'vendor/components/statecontrol.js',
                        'vendor/components/citycontrol.js', 'vendor/components/drugcontrol.js',
                        'vendor/components/genericcontrol.js', 'vendor/components/favoritedetailcontrol.js',
                        'vendor/components/radiogroupcontrol.js', 'vendor/components/commentscontrol.js',
                        'vendor/components/displaycreatedby.js', 'vendor/components/paneldetailcontrol.js',
                        'vendor/components/linkchecker.js', 'vendor/components/panelcontrol.js',
                        'vendor/components/testcontrol.js', 'vendor/components/patientbanner.js',
                        'vendor/components/testcontrol.js', 'vendor/components/regpatientbanner.js',
                        'vendor/components/emrpatientbanner.js', 'vendor/components/districtcontrol.js',
                        'vendor/components/vorderpatientbanner.js',
                        'vendor/components/portalpatientbanner.js',
                        'vendor/components/ippatientbanner.js',
                        'vendor/components/favoritecontrol.js', 'vendor/components/attachmentcontrol.js',
                        'vendor/components/ticksheetitemcontrol.js', 'vendor/components/ticksheetcontrol.js',
                        'vendor/components/vitalchart.js', 'vendor/components/immzchart.js',
                        'vendor/components/richtexteditor.js', 'vendor/components/dynamicform.js',
                        'vendor/components/webcamcontrol.js', 'vendor/components/areacontrol.js',
                        'vendor/components/doctorquicklinks.js', 'vendor/components/multiselectchk.js',
                        'vendor/components/patientsearchcontrol.js', 'vendor/components/patientsearchcontrolbymobile.js', 'vendor/components/ippatientsearchcontrol.js',
                        'vendor/components/autosearch.js',
                        'vendor/components/newpatientsearchcontrol.js',
                        'vendor/components/lispatientbanner.js', 'vendor/components/testresultcontrol.js',
                        'vendor/components/alertcontrol.js', 'vendor/components/printcontrol.js',
                        'vendor/components/woattachmentcontrol.js', 'vendor/components/woobservationcontrol.js',
                        'vendor/components/inventoryattachmentcontrol.js', 'vendor/components/inventoryattachmentcontrol.js',
                        'vendor/print/qz-tray.js', 'vendor/print/rsvp-3.1.0.min.js', 'vendor/print/sha-256.min.js',
                        'vendor/qz-depends/jsrsasign-all-min.js', 'vendor/qz/sign-message.js',
                        'vendor/components/agedisplay.js', 'vendor/components/emarcontrol.js',
                        'vendor/components/scheduleimmunization.js', 'vendor/components/growthchart.js',
                        'vendor/components/consultationcontrol.js', 'vendor/components/monthcalender.js',
                        'vendor/components/checkboxgroupcontrol.js',
                    ]
                }
            ]
        });

})();

(function() {
    'use strict';

    angular
        .module('app.loadingbar')
        .config(loadingbarConfig);
    loadingbarConfig.$inject = ['cfpLoadingBarProvider'];

    function loadingbarConfig(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeBar = true;
        cfpLoadingBarProvider.includeSpinner = true;
        cfpLoadingBarProvider.latencyThreshold = 500;
        //CAUTION : Line commented to append loading icon at body level, fix for loading circle hidding behind modal dialog
        //cfpLoadingBarProvider.parentSelector = '.wrapper > section';
    }
})();
(function() {
    'use strict';

    angular
        .module('app.loadingbar')
        .run(loadingbarRun);
    loadingbarRun.$inject = ['$rootScope', '$timeout', 'cfpLoadingBar'];

    function loadingbarRun($rootScope, $timeout, cfpLoadingBar) {

        // Loading bar transition
        // -----------------------------------
        var thBar;
        $rootScope.$on('$stateChangeStart', function() {
            if ($('.wrapper > section').length) // check if bar container exists
                thBar = $timeout(function() {
                cfpLoadingBar.start();
            }, 0); // sets a latency Threshold
        });
        $rootScope.$on('$stateChangeSuccess', function(event) {
            event.targetScope.$watch('$viewContentLoaded', function() {
                $timeout.cancel(thBar);
                cfpLoadingBar.complete();
            });
        });

    }

})();
/**=========================================================
* Module: navbar-search.js
* Navbar search toggler * Auto dismiss on ESC key
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.navsearch')
        .directive('searchOpen', searchOpen)
        .directive('searchDismiss', searchDismiss);

    //
    // directives definition
    //

    function searchOpen() {
        var directive = {
            controller: searchOpenController,
            restrict: 'A'
        };
        return directive;

    }

    function searchDismiss() {
        var directive = {
            controller: searchDismissController,
            restrict: 'A'
        };
        return directive;

    }

    //
    // Contrller definition
    //

    searchOpenController.$inject = ['$scope', '$element', 'NavSearch'];

    function searchOpenController($scope, $element, NavSearch) {
        $element
            .on('click', function(e) {
                e.stopPropagation();
            })
            .on('click', NavSearch.toggle);
    }

    searchDismissController.$inject = ['$scope', '$element', 'NavSearch'];

    function searchDismissController($scope, $element, NavSearch) {

        var inputSelector = '.navbar-form input[type="text"]';

        $(inputSelector)
            .on('click', function(e) {
                e.stopPropagation();
            })
            .on('keyup', function(e) {
                if (e.keyCode === 27) // ESC
                    NavSearch.dismiss();
            });

        // click anywhere closes the search
        $(document).on('click', NavSearch.dismiss);
        // dismissable options
        $element
            .on('click', function(e) {
                e.stopPropagation();
            })
            .on('click', NavSearch.dismiss);
    }

})();


/**=========================================================
* Module: nav-search.js
* Services to share navbar search functions
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.navsearch')
        .service('NavSearch', NavSearch);

    function NavSearch() {
        this.toggle = toggle;
        this.dismiss = dismiss;

        ////////////////

        var navbarFormSelector = 'form.navbar-form';

        function toggle() {
            var navbarForm = $(navbarFormSelector);

            navbarForm.toggleClass('open');

            var isOpen = navbarForm.hasClass('open');

            navbarForm.find('input')[isOpen ? 'focus' : 'blur']();
        }

        function dismiss() {
            $(navbarFormSelector)
                .removeClass('open') // Close control
                .find('input[type="text"]').blur() // remove focus
                // .val('') // Empty input
            ;
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('app.preloader')
        .directive('preloader', preloader);

    preloader.$inject = ['$animate', '$timeout', '$q'];

    function preloader($animate, $timeout, $q) {

        var directive = {
            restrict: 'EAC',
            template: '<div class="preloader-progress">' +
                '<div class="preloader-progress-bar" ' +
                'ng-style="{width: loadCounter + \'%\'}"></div>' +
                '</div>',
            link: link
        };
        return directive;

        ///////

        function link(scope, el) {

            scope.loadCounter = 0;

            var counter = 0,
                timeout;

            // disables scrollbar
            angular.element('body').css('overflow', 'hidden');
            // ensure class is present for styling
            el.addClass('preloader');

            appReady().then(endCounter);

            timeout = $timeout(startCounter);

            ///////

            function startCounter() {

                var remaining = 100 - counter;
                counter = counter + (0.015 * Math.pow(1 - Math.sqrt(remaining), 2));

                scope.loadCounter = parseInt(counter, 10);

                timeout = $timeout(startCounter, 20);
            }

            function endCounter() {

                $timeout.cancel(timeout);

                scope.loadCounter = 100;

                $timeout(function() {
                    // animate preloader hiding
                    $animate.addClass(el, 'preloader-hidden');
                    // retore scrollbar
                    angular.element('body').css('overflow', '');
                }, 300);
            }

            function appReady() {
                var deferred = $q.defer();
                var viewsLoaded = 0;
                // if this doesn't sync with the real app ready
                // a custom event must be used instead
                var off = scope.$on('$viewContentLoaded', function() {
                    viewsLoaded++;
                    // we know there are at least two views to be loaded
                    // before the app is ready (1-index.html 2-app*.html)
                    if (viewsLoaded === 2) {
                        // with resolve this fires only once
                        $timeout(function() {
                            deferred.resolve();
                        }, 3000);

                        off();
                    }

                });

                return deferred.promise;
            }

        } //link
    }

})();
/**=========================================================
* Module: helpers.js
* Provides helper functions for routes definition
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.routes')
        .provider('RouteHelpers', RouteHelpersProvider);

    RouteHelpersProvider.$inject = ['APP_REQUIRES'];

    function RouteHelpersProvider(APP_REQUIRES) {

        /* jshint validthis:true */
        return {
            // provider access level
            basepath: basepath,
            resolveFor: resolveFor,
            resolveCtrl: resolveCtrl,

            // controller access level
            $get: function() {
                return {
                    basepath: basepath,
                    resolveFor: resolveFor,
                    resolveCtrl: resolveCtrl
                };
            }
        };

        //Code to load controllers dynamically starts
        function resolveCtrl(_args) {
            return "";
        }

        //Code to load controllers dynamically ends


        // Set here the base of the relative path
        // for all app views
        function basepath(uri) {
            return 'app/views/' + uri;
        }

        // Generates a resolve object by passing script names
        // previously configured in constant.APP_REQUIRES
        function resolveFor() {
            var _args = arguments;
            return {
                deps: ['$ocLazyLoad', '$q', function($ocLL, $q) {
                    // Creates a promise chain for each argument
                    var promise = $q.when(1); // empty promise
                    for (var i = 0, len = _args.length; i < len; i++) {
                        promise = andThen(_args[i]);
                    }
                    return promise;

                    // creates promise to chain dynamically
                    function andThen(_arg) {
                        // also support a function that returns a promise
                        if (typeof _arg === 'function')
                            return promise.then(_arg);
                        else
                            return promise.then(function() {
                                // if is a module, pass the name. If not, pass the array
                                var whatToLoad = getRequired(_arg);
                                // simple error check
                                if (!whatToLoad) return $.error('Route resolve: Bad resource name [' + _arg + ']');
                                // finally, return a promise
                                return $ocLL.load(whatToLoad);
                            });
                    }
                    // check and returns required data
                    // analyze module items with the form [name: '', files: []]
                    // and also simple array of script files (for not angular js)
                    function getRequired(name) {
                        if (APP_REQUIRES.modules)
                            for (var m in APP_REQUIRES.modules)
                                if (APP_REQUIRES.modules[m].name && APP_REQUIRES.modules[m].name === name)
                                    return APP_REQUIRES.modules[m];
                        return APP_REQUIRES.scripts && APP_REQUIRES.scripts[name];
                    }

                }]
            };
        } // resolveFor

    }

})();

(function() {
    'use strict';

    angular
        .module('app.settings')
        .run(settingsRun);

    settingsRun.$inject = ['$rootScope', '$localStorage', 'uibTimepickerConfig'];

    function settingsRun($rootScope, $localStorage, uibTimepickerConfig) {

        //App Settings
        window.appPath = {
            apiroot: "http://192.168.1.17:3000/",
            lib: 'vendor/',
        };
        window.clientcode = 'general';
        window.appPath = window.appPath || {};
        window.appPath.lib = 'vendor/';
        $rootScope.datePickerOptions = {
            showWeeks: false,
            dateFormat: 'dd/MM/yyyy',
            dateTimeFormat: 'dd/MM/yyyy HH:mm',
            showButtonBar: false,
            placeholder: 'DD/MM/YYYY',
            expirydateformat: 'MM/yyyy',
            expiryplaceholder: 'MM/YYYY'
        };
        uibTimepickerConfig.templateUrl = window.appPath.lib + 'timepicker/timepicker.html';
        uibTimepickerConfig.showMeridian = false;


        // User Settings
        // -----------------------------------
        $rootScope.user = {
            name: 'Dev',
            job: 'developer',
            picture: 'app/img/user/02.jpg'
        };

        // Hides/show user avatar on sidebar from any element
        $rootScope.toggleUserBlock = function() {
            $rootScope.$broadcast('toggleUserBlock');
        };

        // Global Settings
        // -----------------------------------
        $rootScope.app = {
            name: 'DrHMS',
            description: 'DrHMS',
            year: ((new Date()).getFullYear()),
            layout: {
                isFixed: true,
                isCollapsed: false,
                isBoxed: false,
                isRTL: false,
                horizontal: false,
                isFloat: false,
                asideHover: false,
                theme: null,
                asideScrollbar: false,
                isCollapsedText: false
            },
            useFullLayout: false,
            hiddenFooter: false,
            offsidebarOpen: false,
            asideToggled: false,
            viewAnimation: 'ng-fadeInUp',
            sideMenuFileName: 'sidebar-menu-emr.json'
        };

        // Setup the layout mode
        $rootScope.app.layout.horizontal = ($rootScope.$stateParams.layout === 'app-h');

        // Restore layout settings [*** UNCOMMENT TO ENABLE ***]
        // if( angular.isDefined($localStorage.layout) )
        //   $rootScope.app.layout = $localStorage.layout;
        // else
        //   $localStorage.layout = $rootScope.app.layout;
        //
        // $rootScope.$watch('app.layout', function () {
        //   $localStorage.layout = $rootScope.app.layout;
        // }, true);

        // Close submenu when sidebar change from collapsed to normal
        $rootScope.$watch('app.layout.isCollapsed', function(newValue) {
            if (newValue === false)
                $rootScope.$broadcast('closeSidebarMenu');
        });

    }

})();

/**=========================================================
* Module: sidebar-menu.js
* Handle sidebar collapsible elements
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.sidebar')
        .controller('SidebarController', SidebarController);

    SidebarController.$inject = ['$rootScope', '$scope', '$state', 'SidebarLoader', 'Utils'];

    function SidebarController($rootScope, $scope, $state, SidebarLoader, Utils) {

        activate();

        ////////////////

        function activate() {
            var collapseList = [];

            // demo: when switch from collapse to hover, close all items
            var watchOff1 = $rootScope.$watch('app.layout.asideHover', function(oldVal, newVal) {
                if (newVal === false && oldVal === true) {
                    closeAllBut(-1);
                }
            });


            // Load menu from json file
            // -----------------------------------

            SidebarLoader.getMenu(sidebarReady);

            function sidebarReady(items) {
                $scope.menuItems = items;
            }

            // Handle sidebar and collapse items
            // ----------------------------------

            $scope.getMenuItemPropClasses = function(item) {
                return (item.heading ? 'nav-heading' : '') +
                    (isActive(item) ? ' active' : '');
            };

            $scope.addCollapse = function($index, item) {
                collapseList[$index] = $rootScope.app.layout.asideHover ? true : !isActive(item);
            };

            $scope.isCollapse = function($index) {
                return (collapseList[$index]);
            };

            $scope.toggleCollapse = function($index, isParentItem) {

                // collapsed sidebar doesn't toggle drodopwn
                if (Utils.isSidebarCollapsed() || $rootScope.app.layout.asideHover) return true;

                // make sure the item index exists
                if (angular.isDefined(collapseList[$index])) {
                    if (!$scope.lastEventFromChild) {
                        collapseList[$index] = !collapseList[$index];
                        closeAllBut($index);
                    }
                } else if (isParentItem) {
                    closeAllBut(-1);
                }

                $scope.lastEventFromChild = isChild($index);

                return true;

            };

            // Controller helpers
            // -----------------------------------

            // Check item and children active state
            function isActive(item) {

                if (!item) return;

                if (!item.sref || item.sref === '#') {
                    var foundActive = false;
                    angular.forEach(item.submenu, function(value) {
                        if (isActive(value)) foundActive = true;
                    });
                    return foundActive;
                } else
                    return $state.is(item.sref) || $state.includes(item.sref);
            }

            function closeAllBut(index) {
                index += '';
                for (var i in collapseList) {
                    if (index < 0 || index.indexOf(i) < 0)
                        collapseList[i] = true;
                }
            }

            function isChild($index) {
                /*jshint -W018*/
                return (typeof $index === 'string') && !($index.indexOf('-') < 0);
            }

            $scope.$on('$destroy', function() {
                watchOff1();
            });

        } // activate
    }

})();

(function() {
    'use strict';

    angular
        .module('app.sidebar')
        .controller('SurgeryEntrySidebarController', SurgeryEntrySidebarController);

    SurgeryEntrySidebarController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'SidebarLoader', 'Utils', 'utl', '$filter'];

    function SurgeryEntrySidebarController($rootScope, $scope, $state, $stateParams, SidebarLoader, Utils, utl, $filter) {

        activate();
        ////////////////

        function activate() {
            var collapseList = [];

            // demo: when switch from collapse to hover, close all items
            var watchOff1 = $rootScope.$watch('app.layout.asideHover', function(oldVal, newVal) {
                if (newVal === false && oldVal === true) {
                    closeAllBut(-1);
                }
            });
            $scope.currentcontext = {};
            console.log($stateParams);
            $scope.currentcontext.surgentryid = $stateParams.id;
            $scope.currentcontext.pid = $stateParams.pid;
            $scope.currentcontext.eid = $stateParams.eid;

            $scope.surgerypatientrecords = function() {
                $state.go('surgeryentry.sugerypatientrecords', {
                    pid: $scope.currentcontext.pid
                });
            };

            $scope.surgeryentryhistory = function() {
                $state.go('surgeryentry.pmhxdashboard', {
                    pid: $scope.currentcontext.pid,
                    context: 'surgery'
                });
            };

            $scope.surgerydiagnosis = function() {
                $state.go('surgeryentry.diagnosistab.patientdiagnosiscurrentlist', {
                    pid: $scope.currentcontext.pid,
                    context: 'surgery'
                });
            };

            $scope.surgeryvitals = function() {
                $state.go('surgeryentry.patientvitaltab.patientvital', {
                    pid: $scope.currentcontext.pid,
                    context: 'surgery'
                });
            };

            $scope.surgeryentrylist = function() {
                $state.go('surgeryentry.surgeryentryreports', {
                    pid: $scope.currentcontext.pid,
                    context: 'surgery'
                });
            };

            $scope.surgeryschecules = function() {
                $state.go('surgeryentry.otschedulereport', {
                    pid: $scope.currentcontext.pid,
                    context: 'surgery'
                });
            };

            $scope.surgeryprescribe = function() {
                $state.go('surgeryentry.prescribetab.rxprescriptions', {
                    pid: $scope.currentcontext.pid,
                    context: 'surgery'
                });
            };

            $scope.surgeryorderlist = function() {
                $state.go('surgeryentry.surgeryclinicalorders', {
                    id: $scope.currentcontext.surgentryid,
                    pid: $scope.currentcontext.pid
                });
            };

            $scope.surgerybillservices = function() {
                $state.go('surgeryentry.billservices', {
                    id: $scope.currentcontext.surgentryid,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                });
            };

            $scope.surgerynotes = function() {
                $state.go('surgeryentry.surgerynotes', {
                    id: $scope.currentcontext.surgentryid,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                });
            };

            $scope.anaesthesianotes = function() {
                $state.go('surgeryentry.anaesthesianotes', {
                    id: $scope.currentcontext.surgentryid,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                });
            };

            $scope.Surgery_equipment = function() {
                $state.go('surgeryentry.equipments', {
                    id: $scope.currentcontext.surgentryid,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid,
                    context: 'surgery'
                });
            };

            $scope.Surgery_dietorder = function() {
                $state.go('surgeryentry.patientdietorders', {
                    id: $scope.currentcontext.surgentryid,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid,
                    context: 'surgery'
                });
            };

            $scope.Surgery_patientindent = function() {
                $state.go('surgeryentry.patientindent', {
                    id: $scope.currentcontext.surgentryid,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid,
                    context: 'surgery'
                });
            };
            $scope.surgery_medicineissues = function() {
                $state.go('surgeryentry.materialissues', {
                    id: $scope.currentcontext.surgentryid,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid,
                    context: 'surgery'
                });
            };
            $scope.surgery_indentreturn = function() {
                $state.go('surgeryentry.materialreturns', {
                    id: $scope.currentcontext.surgentryid,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid,
                    context: 'surgery'
                });
            };

            $scope.clinicaldocuments = function() {
                $state.go('surgeryentry.clinicaldocumenttab.clinicaldocumentcurrentlist', {
                    pid: $scope.currentcontext.pid,
                    context: 'surgery'
                });
            };

            $scope.radiologyresults = function() {
                $state.go('surgeryentry.radiologyresults', {
                    pid: $scope.currentcontext.pid,
                    context: 'surgery'
                });
            };

            $scope.surgerylabresults = function() {
                $state.go('surgeryentry.labresults', {
                    pid: $scope.currentcontext.pid,
                    context: 'surgery'
                });
            };


            SidebarLoader.getMenu(sidebarReady, null);

            function sidebarReady(items) {
                $scope.menuItems = items;
            }

            $scope.$on('patientemr-context-switch', function(event, args) {
                //console.log('Context swith cached in sidebarmenu controller');
                // var strContext = args ? args.context : 'emr';
                SidebarLoader.getMenu(sidebarReady, null);
            });

            // Handle sidebar and collapse items
            // ----------------------------------

            $scope.getMenuItemPropClasses = function(item) {
                return (item.heading ? 'nav-heading' : '') +
                    (isActive(item) ? ' active' : '');
            };

            $scope.addCollapse = function($index, item) {
                collapseList[$index] = $rootScope.app.layout.asideHover ? true : !isActive(item);
            };

            $scope.isCollapse = function($index) {
                return (collapseList[$index]);
            };

            $scope.toggleCollapse = function($index, isParentItem) {

                // collapsed sidebar doesn't toggle drodopwn
                if (Utils.isSidebarCollapsed() || $rootScope.app.layout.asideHover) return true;

                // make sure the item index exists
                if (angular.isDefined(collapseList[$index])) {
                    if (!$scope.lastEventFromChild) {
                        collapseList[$index] = !collapseList[$index];
                        closeAllBut($index);
                    }
                } else if (isParentItem) {
                    closeAllBut(-1);
                }

                $scope.lastEventFromChild = isChild($index);

                return true;

            };

            // Controller helpers
            // -----------------------------------

            // Check item and children active state
            function isActive(item) {

                if (!item) return;

                if (!item.sref || item.sref === '#') {
                    var foundActive = false;
                    angular.forEach(item.submenu, function(value) {
                        if (isActive(value)) foundActive = true;
                    });
                    return foundActive;
                } else
                    return $state.is(item.sref) || $state.includes(item.sref);
            }

            function closeAllBut(index) {
                index += '';
                for (var i in collapseList) {
                    if (index < 0 || index.indexOf(i) < 0)
                        collapseList[i] = true;
                }
            }

            function isChild($index) {
                /*jshint -W018*/
                return (typeof $index === 'string') && !($index.indexOf('-') < 0);
            }

            $scope.$on('$destroy', function() {
                watchOff1();
            });

        } // activate
    }

})();

//Patient EMR Side bar starts

(function() {
    'use strict';

    angular
        .module('app.sidebar')
        .controller('PatientEMRSidebarController', PatientEMRSidebarController);

    PatientEMRSidebarController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'SidebarLoader', 'Utils', 'utl', '$filter'];

    function PatientEMRSidebarController($rootScope, $scope, $state, $stateParams, SidebarLoader, Utils, utl, $filter) {
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        activate();
        $scope.contextMenus = ['emr', 'ipemr', 'pastvisits', 'pmhx'];
        $scope.pagecontext = 'pastvisits';

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.oid = parseInt($stateParams.oid);
        $scope.currentcontext.from = $stateParams.from;
        if (parseInt($stateParams.doctor) > 0)
            $scope.currentcontext.doctor = parseInt($stateParams.doctor);
        console.log($stateParams);
        $scope.CanshowVideo = false;
        if ($scope.currentcontext.oid > 0) {
            // $scope.pagecontext = 'vorders';
            // getvorders();
            $scope.pagecontext = 'emr';
            getvorders();
        }

        function getvordersCallback(scope, data, options, hasError) {
            $scope.VOrders = data.Data[0];
            if ($scope.VOrders.OrderConsultTypeId == 2) {
                $scope.CanshowVideo = true;
            }
        };

        function getvorders() {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.oid
                }]
            };
            var options = {
                action: 'VirtualHealthcare/VirtualOrder/GetVirtualOrders',
                data: inputData,
                type: 'post',
                onComplete: getvordersCallback
            };

            utl.Http.doAction(options);
        };


        if (!$scope.currentcontext.oid && $scope.currentcontext.eid) {
            getEncounter();
        }

        function getencounterCallback(scope, data, options, hasError) {
            $scope.Encounter = data.Data;
            if (data.Data.length > 0) {
                var Encounter = $filter('filter')($scope.Encounter, {
                    EncounterTypeId: 1
                })[0];
                if (!Encounter) {
                    var Encounter = $filter('filter')($scope.Encounter, {
                        EncounterTypeId: 2
                    })[0];
                }
            }
            if (!$scope.Encounter[0].IsEmergencyVisit) {
                $scope.currentcontext.eid = $scope.Encounter[0].Id;
                $scope.pagecontext = $scope.Encounter[0].EncounterTypeId == 1 ? 'emr' : 'ipemr';
            }
            if ($scope.Encounter[0].IsEmergencyVisit) {
                $scope.currentcontext.eid = $scope.Encounter[0].Id;
                $scope.pagecontext = 'aeemr';
            }
            $scope.currentcontext.docId = $scope.Encounter[0].DoctorId;
        };

        function getEncounter() {
            var inputData = {
                Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.eid
                    },
                    // {
                    //   Key: 15,
                    //   Value: 2
                    // }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: getencounterCallback
            };

            utl.Http.doAction(options);
        };

        ////////////////
        //nurse dashboard
        $scope.currentcontext.CanWardManagement = utl.Privilege.hasAccess('CanWardManagement');
        $scope.currentcontext.CanNursingBedTransfer = utl.Privilege.hasAccess('CanNursingBedTransfer');
        $scope.currentcontext.CanNursingCurrentIpPatients = utl.Privilege.hasAccess('CanNursingCurrentIpPatients');
        $scope.currentcontext.CanNursingCurrentOpPatients = utl.Privilege.hasAccess('CanNursingCurrentOpPatients');
        $scope.currentcontext.CanNursingAppointments = utl.Privilege.hasAccess('CanNursingAppointments');
        $scope.currentcontext.CanNursingWardManagement = utl.Privilege.hasAccess('CanNursingWardManagement');
        $scope.currentcontext.CanNursing_StockIndents = utl.Privilege.hasAccess('CanNursing_StockIndents');
        $scope.currentcontext.CanNursing_StockReceives = utl.Privilege.hasAccess('CanNursing_StockReceives');
        $scope.currentcontext.CanNotifications = utl.Privilege.hasAccess('CanNotifications');
        $scope.currentcontext.CanMedicineAdministration = utl.Privilege.hasAccess('CanMedicineAdministration');
        $scope.currentcontext.CanPatientMedicineIndents = utl.Privilege.hasAccess('CanPatientMedicineIndents');
        $scope.currentcontext.CanNursingReports = utl.Privilege.hasAccess('CanNursingReports');
        $scope.currentcontext.CanNursingMytask = utl.Privilege.hasAccess('CanNursingMytask');
        $scope.currentcontext.CanNursingBedManagement = utl.Privilege.hasAccess('CanNursingBedManagement');
        $scope.currentcontext.CanNursingBedReceive = utl.Privilege.hasAccess('CanNursingBedReceive');


        $scope.currentcontext.CanPatientRecords = utl.Privilege.hasAccess('CanPatientRecords');
        $scope.currentcontext.CanMedicalHistory = utl.Privilege.hasAccess('CanMedicalHistory');
        $scope.currentcontext.CanSymptoms = utl.Privilege.hasAccess('CanSymptoms');
        $scope.currentcontext.CanDiagnosis = utl.Privilege.hasAccess('CanDiagnosis');
        $scope.currentcontext.CanVitals = utl.Privilege.hasAccess('CanVitals');
        $scope.currentcontext.CanClinicalDocuments = utl.Privilege.hasAccess('CanClinicalDocuments');
        $scope.currentcontext.CanClinicalOrders = utl.Privilege.hasAccess('CanClinicalOrders');
        $scope.currentcontext.CanProcedureOrders = utl.Privilege.hasAccess('CanProcedureOrders');
        $scope.currentcontext.CanNotes = utl.Privilege.hasAccess('CanNotes');
        $scope.currentcontext.CaneMAR = utl.Privilege.hasAccess('CaneMAR');
        $scope.currentcontext.CanLabResults = utl.Privilege.hasAccess('CanLabResults');
        $scope.currentcontext.CanRadiologyResults = utl.Privilege.hasAccess('CanRadiologyResults');
        $scope.currentcontext.CanDentalChart = utl.Privilege.hasAccess('CanDentalChart');
        $scope.currentcontext.CanNursingCharts = utl.Privilege.hasAccess('CanNursingCharts');
        $scope.currentcontext.CanNursingNotes = utl.Privilege.hasAccess('CanNursingNotes');
        $scope.currentcontext.CanDoctorNotes = utl.Privilege.hasAccess('CanDoctorNotes');
        $scope.currentcontext.CanAdmissionRequest = utl.Privilege.hasAccess('CanAdmissionRequest');

        $scope.currentcontext.CanPhysiotheraphyTreatment = utl.Privilege.hasAccess('CanPhysiotheraphyTreatment');
        $scope.currentcontext.CanBillDetails = utl.Privilege.hasAccess('CanBillDetails');
        $scope.currentcontext.CanSummary = utl.Privilege.hasAccess('CanSummary');
        $scope.currentcontext.CanPrescriptions = utl.Privilege.hasAccess('CanPrescriptions');
        $scope.currentcontext.CanBillService = utl.Privilege.hasAccess('CanBillService');
        $scope.currentcontext.CanDischargeSummary = utl.Privilege.hasAccess('CanDischargeSummary');
        $scope.currentcontext.CanDischargeNotes = utl.Privilege.hasAccess('CanDischargeNotes');
        $scope.currentcontext.CanEMRCharts = utl.Privilege.hasAccess('CanEMRCharts');
        $scope.currentcontext.CanDoctorTransfer = utl.Privilege.hasAccess('CanDoctorTransfer');
        $scope.currentcontext.CanPositionBPChart = utl.Privilege.hasAccess('CanPositionBPChart');
        $scope.currentcontext.CanDiabetes = utl.Privilege.hasAccess('CanDiabetes');
        $scope.currentcontext.CanCD4CD8Chart = utl.Privilege.hasAccess('CanCD4CD8Chart');
        $scope.currentcontext.CanMedicineIndent = utl.Privilege.hasAccess('CanMedicineIndent');
        $scope.currentcontext.CanLocalWellOrders = utl.Privilege.hasAccess('CanLocalWellOrders');
        $scope.currentcontext.CanMedicinReturn = utl.Privilege.hasAccess('CanMedicinReturn');
        $scope.currentcontext.CanSickLeave = utl.Privilege.hasAccess('CanSickLeave');
        $scope.currentcontext.Canprescriptionpad = utl.Privilege.hasAccess('Canprescriptionpad');
        $scope.currentcontext.CanClinicalImage = utl.Privilege.hasAccess('CanClinicalImage');
        $scope.currentcontext.CanIVFHistory = utl.Privilege.hasAccess('CanIVFHistory');
        $scope.currentcontext.CanIVFConsultationNotes = utl.Privilege.hasAccess('CanIVFConsultationNotes');
        $scope.currentcontext.CanIPCaseFileSummary = utl.Privilege.hasAccess('CanIPCaseFileSummary');
        $scope.currentcontext.CanEquipmentUsage = utl.Privilege.hasAccess('CanEquipmentUsage');
        $scope.currentcontext.Canbloodbank = utl.Privilege.hasAccess('Canbloodbank');
        $scope.currentcontext.Canipform = utl.Privilege.hasAccess('Canipform');
        $scope.currentcontext.Candietorders = utl.Privilege.hasAccess('Candietorders');
        $scope.currentcontext.CanNotifiableDiseases = utl.Privilege.hasAccess('CanNotifiableDiseases');
        $scope.currentcontext.CanReferrals = utl.Privilege.hasAccess('CanReferrals');
        $scope.currentcontext.CanTreatmentPlan = utl.Privilege.hasAccess('CanTreatmentPlan');
        $scope.currentcontext.CanPrescriptionP1 = utl.Privilege.hasAccess('CanPrescriptionP1');
        $scope.currentcontext.Cannew_born = utl.Privilege.hasAccess('Cannew_born');
        $scope.currentcontext.Canpatient_Labour = utl.Privilege.hasAccess('Canpatient_Labour');
        $scope.currentcontext.CantaskAssignment = utl.Privilege.hasAccess('CantaskAssignment');
        $scope.currentcontext.CanIncident = utl.Privilege.hasAccess('CanIncident');
        $scope.currentcontext.CanStaffCredits = utl.Privilege.hasAccess('CanStaffCredits');
        $scope.currentcontext.CanStaffCreditPayment = utl.Privilege.hasAccess('CanStaffCreditPayment');
        $scope.currentcontext.CanStaffCreditReturns = utl.Privilege.hasAccess('CanStaffCreditReturns');
        //Billing Repors
        $scope.currentcontext.CanOpbiillsReports = utl.Privilege.hasAccess('CanOpbiillsReports');
        $scope.currentcontext.Cancollectiondetailbycashierreport = utl.Privilege.hasAccess('Cancollectiondetailbycashierreport');
        $scope.currentcontext.Cancollectiondetailbyallcashierreport = utl.Privilege.hasAccess('Cancollectiondetailbyallcashierreport');
        $scope.currentcontext.Canopipcollectionsummarybycashier = utl.Privilege.hasAccess('Canopipcollectionsummarybycashier');
        $scope.currentcontext.Canopcollectionsummarybycashier = utl.Privilege.hasAccess('Canopcollectionsummarybycashier');
        $scope.currentcontext.Canoverallcollectionsummary = utl.Privilege.hasAccess('Canoverallcollectionsummary');
        $scope.currentcontext.Canoverallcollectioncashier = utl.Privilege.hasAccess('Canoverallcollectioncashier');
        $scope.currentcontext.Caninsurancecreditsummary = utl.Privilege.hasAccess('Caninsurancecreditsummary');
        $scope.currentcontext.Caninsuranceoutstandingsummary = utl.Privilege.hasAccess('Caninsuranceoutstandingsummary');
        $scope.currentcontext.Canoutstandingreports = utl.Privilege.hasAccess('Canoutstandingreports');
        $scope.currentcontext.Canopduecollectreport = utl.Privilege.hasAccess('Canopduecollectreport');
        $scope.currentcontext.Candiscount = utl.Privilege.hasAccess('Candiscount');
        $scope.currentcontext.Cancancelreport = utl.Privilege.hasAccess('Cancancelreport');
        $scope.currentcontext.Canrefundreport = utl.Privilege.hasAccess('Canrefundreport');
        $scope.currentcontext.Candirectbillreport = utl.Privilege.hasAccess('Candirectbillreport');
        $scope.currentcontext.Cancollectionsummaryopip = utl.Privilege.hasAccess('Cancollectionsummaryopip');
        $scope.currentcontext.Cangeneralexpensereport = utl.Privilege.hasAccess('Cangeneralexpensereport');
        $scope.currentcontext.Canadvancefunddetailsreport = utl.Privilege.hasAccess('Canadvancefunddetailsreport');
        $scope.currentcontext.Canpatientfundadjustmentreport = utl.Privilege.hasAccess('Canpatientfundadjustmentreport');
        //billing report tab 2
        $scope.currentcontext.Canipbillreport = utl.Privilege.hasAccess('Canipbillreport');
        $scope.currentcontext.Canipcollectiondetailbycashierreport = utl.Privilege.hasAccess('Canipcollectiondetailbycashierreport');
        $scope.currentcontext.Canipcollectionsummarybycashier = utl.Privilege.hasAccess('Canipcollectionsummarybycashier');
        $scope.currentcontext.Caniprefundreport = utl.Privilege.hasAccess('Caniprefundreport');
        $scope.currentcontext.Canipduecollectreport = utl.Privilege.hasAccess('Canipduecollectreport');
        $scope.currentcontext.Cancurrentoccupancyreport = utl.Privilege.hasAccess('Cancurrentoccupancyreport');
        $scope.currentcontext.Canipcancelreport = utl.Privilege.hasAccess('Canipcancelreport');
        $scope.currentcontext.Canipdiscountreport = utl.Privilege.hasAccess('Canipdiscountreport');
        $scope.currentcontext.Canipinsurancereport = utl.Privilege.hasAccess('Canipinsurancereport');
        $scope.currentcontext.Canipdue = utl.Privilege.hasAccess('Canipdue');
        $scope.currentcontext.Canipadmissionreport = utl.Privilege.hasAccess('Canipadmissionreport');
        $scope.currentcontext.Canipdischargereport = utl.Privilege.hasAccess('Canipdischargereport');
        $scope.currentcontext.Canipoccupancyreportwithadvance = utl.Privilege.hasAccess('Canipoccupancyreportwithadvance');
        //billing report tab 3
        $scope.currentcontext.Canbillingservice = utl.Privilege.hasAccess('Canbillingservice');
        $scope.currentcontext.CanbillingGroup = utl.Privilege.hasAccess('CanbillingGroup');
        $scope.currentcontext.Canbillingpackage = utl.Privilege.hasAccess('Canbillingpackage');
        //tab 4
        $scope.currentcontext.Canitemwisecollectionsummaryopreport = utl.Privilege.hasAccess('Canitemwisecollectionsummaryopreport');
        $scope.currentcontext.Canitemwisecollectionsummaryipreport = utl.Privilege.hasAccess('Canitemwisecollectionsummaryipreport');
        $scope.currentcontext.Canitemwisecollectionsummaryopandipreport = utl.Privilege.hasAccess('Canitemwisecollectionsummaryopandipreport');
        $scope.currentcontext.Canrevenuesummarybyserviceitem = utl.Privilege.hasAccess('Canrevenuesummarybyserviceitem');
        $scope.currentcontext.Canreferraldoctorrevenuedetailsreport = utl.Privilege.hasAccess('Canreferraldoctorrevenuedetailsreport');
        //tab5
        $scope.currentcontext.Canotschedulereport = utl.Privilege.hasAccess('Canotschedulereport');
        $scope.currentcontext.Cansurgeryentry = utl.Privilege.hasAccess('Cansurgeryentry');
        $scope.currentcontext.Cansurgerysummarybyprocedure = utl.Privilege.hasAccess('Cansurgerysummarybyprocedure');

         //Front Office Dashboard Report
        //tab1
        $scope.currentcontext.Canfrontofficeipadmissionreport = utl.Privilege.hasAccess('Canfrontofficeipadmissionreport');
        $scope.currentcontext.Canfrontofficeipdischargereport = utl.Privilege.hasAccess('Canfrontofficeipdischargereport');
        $scope.currentcontext.Canipadmissionsummarybydoctor = utl.Privilege.hasAccess('Canipadmissionsummarybydoctor');
        $scope.currentcontext.Canipoccupancyreport = utl.Privilege.hasAccess('Canipoccupancyreport');
        $scope.currentcontext.Canipoccupancybyward = utl.Privilege.hasAccess('Canipoccupancybyward');
        $scope.currentcontext.Canipadmissioninsurancereport = utl.Privilege.hasAccess('Canipadmissioninsurancereport');
        $scope.currentcontext.Canipadmissionsummarybyinsurance = utl.Privilege.hasAccess('Canipadmissionsummarybyinsurance');
        $scope.currentcontext.Canipreferraldoctorreport = utl.Privilege.hasAccess('Canipreferraldoctorreport');
        $scope.currentcontext.Candiagnosissummaryforippatient = utl.Privilege.hasAccess('Candiagnosissummaryforippatient');
        $scope.currentcontext.Canpatientlistbydiagnosis = utl.Privilege.hasAccess('Canpatientlistbydiagnosis');
        $scope.currentcontext.Cancovidstatisticsreport = utl.Privilege.hasAccess('Cancovidstatisticsreport');
        $scope.currentcontext.Canipstatisticsreport = utl.Privilege.hasAccess('Canipstatisticsreport');
        $scope.currentcontext.Candailywiseipstatisticsreport = utl.Privilege.hasAccess('Candailywiseipstatisticsreport');
        $scope.currentcontext.Canbedtransferreport = utl.Privilege.hasAccess('Canbedtransferreport');
        //tab2
        $scope.currentcontext.Canpatientlist = utl.Privilege.hasAccess('Canpatientlist');
        $scope.currentcontext.Canoutpatientreport = utl.Privilege.hasAccess('Canoutpatientreport');
        $scope.currentcontext.Canoutpatientsummaryreport = utl.Privilege.hasAccess('Canoutpatientsummaryreport');
        $scope.currentcontext.Caninactivepatientreport = utl.Privilege.hasAccess('Caninactivepatientreport');
        $scope.currentcontext.Candeseasedpatientreport = utl.Privilege.hasAccess('Candeseasedpatientreport');
        $scope.currentcontext.Canopreferraldoctorreport = utl.Privilege.hasAccess('Canopreferraldoctorreport');
        $scope.currentcontext.Canoutpatientsummarybydoctor = utl.Privilege.hasAccess('Canoutpatientsummarybydoctor');
        $scope.currentcontext.Canoutpatientsummarybyinsurance = utl.Privilege.hasAccess('Canoutpatientsummarybyinsurance');
        $scope.currentcontext.Canappointmentschedulereport = utl.Privilege.hasAccess('Canappointmentschedulereport');
        $scope.currentcontext.Canappointmentcancelledreport = utl.Privilege.hasAccess('Canappointmentcancelledreport');
        $scope.currentcontext.Canappointmentreschedulereport = utl.Privilege.hasAccess('Canappointmentreschedulereport');
        $scope.currentcontext.Canappointmentpatientfromappreport = utl.Privilege.hasAccess('Canappointmentpatientfromappreport');
        $scope.currentcontext.Canvideoconsultationpatientlist = utl.Privilege.hasAccess('Canvideoconsultationpatientlist');
        $scope.currentcontext.Candaycarereport = utl.Privilege.hasAccess('Candaycarereport');
        $scope.currentcontext.Canmlcreport = utl.Privilege.hasAccess('Canmlcreport');
        $scope.currentcontext.Canemergencypatientreport = utl.Privilege.hasAccess('Canemergencypatientreport');
        $scope.currentcontext.Candaycaretoadmissionpatient = utl.Privilege.hasAccess('Candaycaretoadmissionpatient');
        //tab3
        $scope.currentcontext.Canmrdotschedulereport = utl.Privilege.hasAccess('Canmrdotschedulereport');
        $scope.currentcontext.Canmrdsurgeryentryreports = utl.Privilege.hasAccess('Canmrdsurgeryentryreports');
        //tab4
        $scope.currentcontext.Candoctorlistreport = utl.Privilege.hasAccess('Candoctorlistreport');
        $scope.currentcontext.Candepartmentlistreport = utl.Privilege.hasAccess('Candepartmentlistreport');
        $scope.currentcontext.Canwardandbedlist = utl.Privilege.hasAccess('Canwardandbedlist');
        $scope.currentcontext.Canavailablebeds = utl.Privilege.hasAccess('Canavailablebeds');
        $scope.currentcontext.Caninsurancelistreport = utl.Privilege.hasAccess('Caninsurancelistreport');
        $scope.currentcontext.Canopserviceitemreport = utl.Privilege.hasAccess('Canopserviceitemreport');
        $scope.currentcontext.Canipserviceitemreport = utl.Privilege.hasAccess('Canipserviceitemreport');
        $scope.currentcontext.Canreferraldoctorlistreport = utl.Privilege.hasAccess('Canreferraldoctorlistreport');


        //pharmacy dashboard tab 1
        $scope.currentcontext.Canpharmacycollectionreport = utl.Privilege.hasAccess('Canpharmacycollectionreport');
        $scope.currentcontext.Canpharmacysalesreport = utl.Privilege.hasAccess('Canpharmacysalesreport');
        $scope.currentcontext.Canpharmacycollectionallcashier = utl.Privilege.hasAccess('Canpharmacycollectionallcashier');
        $scope.currentcontext.Canpharmacybilldetailreport = utl.Privilege.hasAccess('Canpharmacybilldetailreport');
        $scope.currentcontext.Canpharmacyreturnreportforotc = utl.Privilege.hasAccess('Canpharmacyreturnreportforotc');
        $scope.currentcontext.Canpharmacyduereport = utl.Privilege.hasAccess('Canpharmacyduereport');
        $scope.currentcontext.Canpharmacyduecollectreport = utl.Privilege.hasAccess('Canpharmacyduecollectreport');
        $scope.currentcontext.Canpharmacydiscountreport = utl.Privilege.hasAccess('Canpharmacydiscountreport');
        $scope.currentcontext.Canpharmacycollectionsummaryreport = utl.Privilege.hasAccess('Canpharmacycollectionsummaryreport');
        $scope.currentcontext.Canippharmacyissuevoucherreport = utl.Privilege.hasAccess('Canippharmacyissuevoucherreport');
        $scope.currentcontext.Canippharmacyreturnvoucherreport = utl.Privilege.hasAccess('Canippharmacyreturnvoucherreport');
        $scope.currentcontext.Canpharmacyschedulereport = utl.Privilege.hasAccess('Canpharmacyschedulereport');
        $scope.currentcontext.Canpharmacydmschedulereport = utl.Privilege.hasAccess('Canpharmacydmschedulereport');
        $scope.currentcontext.Canpendingprescriptionreport = utl.Privilege.hasAccess('Canpendingprescriptionreport');
        $scope.currentcontext.Canpharmacyschedulexreport = utl.Privilege.hasAccess('Canpharmacyschedulexreport');
        $scope.currentcontext.Canpharmacycollectionsummarycashier = utl.Privilege.hasAccess('Canpharmacycollectionsummarycashier');
        $scope.currentcontext.Canpharmacycardcollectionreport = utl.Privilege.hasAccess('Canpharmacycardcollectionreport');
        $scope.currentcontext.Canstaffcreditbillreport = utl.Privilege.hasAccess('Canstaffcreditbillreport');
        $scope.currentcontext.Canstaffpendingpaymentreport = utl.Privilege.hasAccess('Canstaffpendingpaymentreport');
        $scope.currentcontext.Canstaffcreditreturnreport = utl.Privilege.hasAccess('Canstaffcreditreturnreport');
        $scope.currentcontext.Canstaffcreditsummaryreport = utl.Privilege.hasAccess('Canstaffcreditsummaryreport');
        $scope.currentcontext.Candailystockmovementreport = utl.Privilege.hasAccess('Candailystockmovementreport');
        $scope.currentcontext.Candailysalessummarybyitem = utl.Privilege.hasAccess('Candailysalessummarybyitem');
        $scope.currentcontext.Canpatientmedicineindentreport = utl.Privilege.hasAccess('Canpatientmedicineindentreport');
        $scope.currentcontext.Canpatientindentpendingreport = utl.Privilege.hasAccess('Canpatientindentpendingreport');
        $scope.currentcontext.Canpatientipdispensedreport = utl.Privilege.hasAccess('Canpatientipdispensedreport');
        $scope.currentcontext.Canpatientipdispensedetailsreport = utl.Privilege.hasAccess('Canpatientipdispensedetailsreport');

        //tab 2
        $scope.currentcontext.Canpurchasesalesgstreport = utl.Privilege.hasAccess('Canpurchasesalesgstreport');
        $scope.currentcontext.Canpurchasereturngstreport = utl.Privilege.hasAccess('Canpurchasereturngstreport');
        $scope.currentcontext.Cansalesgstreport = utl.Privilege.hasAccess('Cansalesgstreport');
        $scope.currentcontext.Canreturngstreport = utl.Privilege.hasAccess('Canreturngstreport');
        $scope.currentcontext.Canconsolidatesalesgstreport = utl.Privilege.hasAccess('Canconsolidatesalesgstreport');
        $scope.currentcontext.Canconsolidatepurchasegstreport = utl.Privilege.hasAccess('Canconsolidatepurchasegstreport');
        $scope.currentcontext.Canconsolidateinputgstsummary = utl.Privilege.hasAccess('Canconsolidateinputgstsummary');
        $scope.currentcontext.Canconsolidateoutputgstsummary = utl.Privilege.hasAccess('Canconsolidateoutputgstsummary');
        $scope.currentcontext.Canstocksummaryproductgstreport = utl.Privilege.hasAccess('Canstocksummaryproductgstreport');
        $scope.currentcontext.Canconsolidategstreportfordeepam = utl.Privilege.hasAccess('Canconsolidategstreportfordeepam');

        //tab3
        $scope.currentcontext.Canitemmasterreport = utl.Privilege.hasAccess('Canitemmasterreport');
        $scope.currentcontext.Canmasterprice = utl.Privilege.hasAccess('Canmasterprice');
        $scope.currentcontext.Canrackdetailsbystorereport = utl.Privilege.hasAccess('Canrackdetailsbystorereport');
        $scope.currentcontext.Canitemrolsetupreport = utl.Privilege.hasAccess('Canitemrolsetupreport');
        //tab4
        $scope.currentcontext.Canstockstatusreport = utl.Privilege.hasAccess('Canstockstatusreport');
        $scope.currentcontext.Canstockindentreport = utl.Privilege.hasAccess('Canstockindentreport');
        $scope.currentcontext.Canstockmovementreport = utl.Privilege.hasAccess('Canstockmovementreport');
        $scope.currentcontext.Canstockstatusproductsummaryreport = utl.Privilege.hasAccess('Canstockstatusproductsummaryreport');
        $scope.currentcontext.Canmedicineexpiryreport = utl.Privilege.hasAccess('Canmedicineexpiryreport');
        $scope.currentcontext.Canmedicineexpiredreport = utl.Privilege.hasAccess('Canmedicineexpiredreport');
        $scope.currentcontext.Canstocknonmovementreport = utl.Privilege.hasAccess('Canstocknonmovementreport');
        $scope.currentcontext.Canstockissuevocherreport = utl.Privilege.hasAccess('Canstockissuevocherreport');
        $scope.currentcontext.Canstockstatusbatchreport = utl.Privilege.hasAccess('Canstockstatusbatchreport');
        $scope.currentcontext.Canitemwantedlist = utl.Privilege.hasAccess('Canitemwantedlist');
        $scope.currentcontext.Canopticalstockstatusreport = utl.Privilege.hasAccess('Canopticalstockstatusreport');
        // Store dashboard
        //tab 1
        $scope.currentcontext.Canstockstatusreportstore = utl.Privilege.hasAccess('Canstockstatusreportstore');
        $scope.currentcontext.Canstockadjustmentreport = utl.Privilege.hasAccess('Canstockadjustmentreport');
        $scope.currentcontext.Canstockindentreportstore = utl.Privilege.hasAccess('Canstockindentreportstore');
        $scope.currentcontext.Canstockmovementreportstore = utl.Privilege.hasAccess('Canstockmovementreportstore');
        $scope.currentcontext.Canstockstatusproductsummaryreportstore = utl.Privilege.hasAccess('Canstockstatusproductsummaryreportstore');
        $scope.currentcontext.Canmedicineexpiryreportstore = utl.Privilege.hasAccess('Canmedicineexpiryreportstore');
        $scope.currentcontext.Canmedicineexpiredreportstore = utl.Privilege.hasAccess('Canmedicineexpiredreportstore');
        $scope.currentcontext.Canstocknonmovementreportstore = utl.Privilege.hasAccess('Canstocknonmovementreportstore');
        $scope.currentcontext.Canstockissuevocherreportstore = utl.Privilege.hasAccess('Canstockissuevocherreportstore');
        $scope.currentcontext.Canstockstatusbatchreportstore = utl.Privilege.hasAccess('Canstockstatusbatchreportstore');
        $scope.currentcontext.Canopeningstockentryreportstore = utl.Privilege.hasAccess('Canopeningstockentryreportstore');
        //tab2
        $scope.currentcontext.Canpurchasesalesgstreportstore = utl.Privilege.hasAccess('Canpurchasesalesgstreportstore');
        $scope.currentcontext.Canpurchasereturngstreportstore = utl.Privilege.hasAccess('Canpurchasereturngstreportstore');
        $scope.currentcontext.Cansalesgstreportstore = utl.Privilege.hasAccess('Cansalesgstreportstore');
        $scope.currentcontext.Canreturngstreportstore = utl.Privilege.hasAccess('Canreturngstreportstore');
        $scope.currentcontext.Canconsolidatesalesgstreportstore = utl.Privilege.hasAccess('Canconsolidatesalesgstreportstore');
        $scope.currentcontext.Canconsolidatepurchasegstreportstore = utl.Privilege.hasAccess('Canconsolidatepurchasegstreportstore');
        $scope.currentcontext.Canconsolidateinputgstsummarystore = utl.Privilege.hasAccess('Canconsolidateinputgstsummarystore');
        $scope.currentcontext.Canconsolidateoutputgstsummarystore = utl.Privilege.hasAccess('Canconsolidateoutputgstsummarystore');
        $scope.currentcontext.Canstocksummaryproductgstreportstore = utl.Privilege.hasAccess('Canstocksummaryproductgstreportstore');
        //tab3
        $scope.currentcontext.Canpurchaseorderreport = utl.Privilege.hasAccess('Canpurchaseorderreport');
        $scope.currentcontext.Canpurchaseorderdetailreport = utl.Privilege.hasAccess('Canpurchaseorderdetailreport');
        $scope.currentcontext.Canpendingporeport = utl.Privilege.hasAccess('Canpendingporeport');
        $scope.currentcontext.Canstockissuevocherreportstores = utl.Privilege.hasAccess('Canstockissuevocherreportstores');
        $scope.currentcontext.Cangrnreport = utl.Privilege.hasAccess('Cangrnreport');
        $scope.currentcontext.Cangrnreportbyitem = utl.Privilege.hasAccess('Cangrnreportbyitem');
        $scope.currentcontext.Canpurchasereturnreport = utl.Privilege.hasAccess('Canpurchasereturnreport');
        $scope.currentcontext.Canpurchasevendorreport = utl.Privilege.hasAccess('Canpurchasevendorreport');
        $scope.currentcontext.Canpurchasevendorpendingreport = utl.Privilege.hasAccess('Canpurchasevendorpendingreport');
        $scope.currentcontext.Canvendordetailreport = utl.Privilege.hasAccess('Canvendordetailreport');
        $scope.currentcontext.Canvendoroutstandingreport = utl.Privilege.hasAccess('Canvendoroutstandingreport');
        //tab4
        $scope.currentcontext.Caninvoicesummarybysupplier = utl.Privilege.hasAccess('Caninvoicesummarybysupplier');
        $scope.currentcontext.Canpendingpaymentsummarybysupplier = utl.Privilege.hasAccess('Canpendingpaymentsummarybysupplier');
        $scope.currentcontext.Cansuppliermasterreport = utl.Privilege.hasAccess('Cansuppliermasterreport');
        $scope.currentcontext.Canitemmasterreportstore = utl.Privilege.hasAccess('Canitemmasterreportstore');
        $scope.currentcontext.Canmasterpricestore = utl.Privilege.hasAccess('Canmasterpricestore');
        $scope.currentcontext.Canstoremasterreport = utl.Privilege.hasAccess('Canstoremasterreport');
        $scope.currentcontext.Canusermasterreport = utl.Privilege.hasAccess('Canusermasterreport');
        $scope.currentcontext.Canrackdetailsbystorereportstore = utl.Privilege.hasAccess('Canrackdetailsbystorereportstore');
        $scope.currentcontext.Canitemreorderlistreport = utl.Privilege.hasAccess('Canitemreorderlistreport');
        $scope.currentcontext.Cangenericmasterreport = utl.Privilege.hasAccess('Cangenericmasterreport');
        $scope.currentcontext.Canmanufacturermasterreport = utl.Privilege.hasAccess('Canmanufacturermasterreport');
        $scope.currentcontext.Canproducttypereport = utl.Privilege.hasAccess('Canproducttypereport');
        //tab 5
        $scope.currentcontext.Canstockstatusgeneralreport = utl.Privilege.hasAccess('Canstockstatusgeneralreport');
        $scope.currentcontext.Canstockadjustmentgeneralreport = utl.Privilege.hasAccess('Canstockadjustmentgeneralreport');
        $scope.currentcontext.Canstockindentgeneralreport = utl.Privilege.hasAccess('Canstockindentgeneralreport');
        $scope.currentcontext.Canstockmovementgeneralreport = utl.Privilege.hasAccess('Canstockmovementgeneralreport');
        $scope.currentcontext.Canstockstatusproductsummarygeneralreport = utl.Privilege.hasAccess('Canstockstatusproductsummarygeneralreport');
        $scope.currentcontext.Canstockissuevochergeneralreport = utl.Privilege.hasAccess('Canstockissuevochergeneralreport');
        $scope.currentcontext.Canstockstatusbatchgeneralreport = utl.Privilege.hasAccess('Canstockstatusbatchgeneralreport');
        $scope.currentcontext.Canopeningstockentrygeneralreport = utl.Privilege.hasAccess('Canopeningstockentrygeneralreport');
        $scope.currentcontext.CanpackageeditButton = utl.Privilege.hasAccess('CanpackageeditButton');
        //end
        function activate() {
            var collapseList = [];

            // demo: when switch from collapse to hover, close all items
            var watchOff1 = $rootScope.$watch('app.layout.asideHover', function(oldVal, newVal) {
                if (newVal === false && oldVal === true) {
                    closeAllBut(-1);
                }
            });

            $scope.ProcedureOrderList = function() {
                $state.go('patientemr.procedureordertab.procedureorders', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.patientemr_pastvisit = function() {
                $state.go('patientemr.pmhxdashboard', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.diagnosis_list = function() {
                $state.go('patientemr.diagnosistab.patientdiagnosiscurrentlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.PrescribeList = function() {
                $state.go('patientemr.prescribetab.rxprescriptions', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.patientvitals = function() {
                $state.go('patientemr.patientvitaltab.patientvital', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.clinicaldocuments = function() {
                $state.go('patientemr.clinicaldocumenttab.clinicaldocumentcurrentlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.prescribepad = function() {
                $state.go('patientemr.prescriptionpadlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };
            $scope.prescribep1 = function() {
                $state.go('patientemr.prescriptionp1', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.OrderList = function() {
                $state.go('patientemr.clinicalordertab.clinicalorders', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.patientemr_consultation = function() {
                $state.go('patientemr.consultationtab.consultationcurrentlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from,
                    doctor: $scope.currentcontext.doctor
                });
            };

            // $scope.patientemr_consultation = function () {
            //     $state.go('patientemr.consultationtab.consultationcurrentlist', {
            //         pid: $scope.currentcontext.pid,
            //         context: $scope.pagecontext,
            //         from: $scope.currentcontext.from
            //     });
            // };

            $scope.patientemr_emar = function() {
                $state.go('patientemr.emartab.emar', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.radiologyresults = function() {
                $state.go('patientemr.radiologyresults', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.patientemr_labresults = function() {
                $state.go('patientemr.labresults', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.toothchart = function() {
                $state.go('patientemr.toothcharttab.toothchart', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.adm_request = function() {
                $state.go('patientemr.admissionrequests', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.sickLeaveForm = function() {
                $state.go('patientemr.sickleaveform', {
                    pid: $scope.currentcontext.pid
                });
            };
            $scope.patientemr_esummary = function() {
                // $state.go('patientemr.patientdashboard', {
                //     pid: $scope.currentcontext.pid,
                //     context: $scope.pagecontext,
                //     from: $scope.currentcontext.from
                // });
                $state.go('patientemr.summarynotetab.patientdashboard', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from,
                    profile: 1
                });
            };
            $scope.lensprescription = function() {
                $state.go('patientemr.lensprescription', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.treatmentplan = function() {
                $state.go('patientemr.treatmentplan', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };
            $scope.task = function() {
                $state.go('patientemr.emrtaskmanagementlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };
            $scope.incidentmanagement = function() {
                $state.go('patientemr.incidentmanagement', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };
            $scope.patientemr_videoconference = function() {
                $state.go('patientemr.videoconference', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.patientemr_billpayment = function() {
                $state.go('patientemr.virtualbillpayment', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };
            $scope.clinical_images = function() {
                $state.go('patientemr.clinicalimages', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };
            $scope.doc_transfer = function() {
                $state.go('patientemr.ipdoctortransfer', {
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid,
                    docId: $scope.currentcontext.docId,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.patientemr_emrcharts = function() {
                $state.go('patientemr.emrcharttab.emrcharts', {
                    from: $scope.currentcontext.from
                });
            };
            $scope.patientemr_positionbpchart = function() {
                $state.go('patientemr.positionbpcharttab.positionbpchart', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.patientemr_diabeteschart = function() {
                $state.go('patientemr.diabetescharttab.currentlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.patientemr_cdchart = function() {
                $state.go('patientemr.cdcharttab.cdchartcurrentlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.physiotheraphytreatementchart = function() {
                $state.go('patientemr.physiotheraphytab.physiotheraphycurrentlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.nursing_charts = function() {
                $state.go('patientemr.nursingcharts', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.nursing_notes = function() {
                $state.go('patientemr.nursingnotestab.nursingnotescurrentlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.doctor_notes = function() {
                $state.go('patientemr.doctornotestab.doctornotescurrentlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.patientemr_referal = function() {
                $state.go('patientemr.referralfollowuptab.referralfollowup', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.patientemr_patientrecords = function() {
                if ($scope.pagecontext == 'vorders') {
                    $state.go('patientemr.orderpatientrecords', {
                        pid: $scope.currentcontext.pid,
                        context: $scope.pagecontext,
                        oid: $scope.currentcontext.oid,
                        from: $scope.currentcontext.from
                    });
                }
                if ($scope.pagecontext == 'aeemr') {
                    $state.go('patientemr.patientrecords', {
                        pid: $scope.currentcontext.pid,
                        context: $scope.pagecontext,
                    });
                }else {
                    $state.go('patientemr.patientrecords', {
                        pid: $scope.currentcontext.pid,
                        context: $scope.pagecontext,
                        oid: $scope.currentcontext.oid,
                        from: $scope.currentcontext.from
                    });
                }
            };

            $scope.discharge_summary = function() {
                $state.go('patientemr.dischargesummarytab.dischargesummarycurrentvisit', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    tp: 'emr',
                    from: $scope.currentcontext.from
                });
            };

            $scope.Patient_indent = function() {
                $state.go('patientemr.patientindent', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    tp: 'emr',
                    from: $scope.currentcontext.from
                });
            };

            $scope.LocalWellMedicineOrders = function() {
                $state.go('patientemr.localwellmedicineorder', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    tp: 'emr',
                    from: $scope.currentcontext.from
                });
            };

            $scope.Patient_receive = function() {
                $state.go('patientemr.patientreceive', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    tp: 'emr',
                    from: $scope.currentcontext.from
                });
            };

            $scope.Patient_return = function() {
                $state.go('patientemr.medicinereturns', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    tp: 'emr',
                    from: $scope.currentcontext.from
                });
            };
            $scope.PatientNotifiable_disease = function() {
                $state.go('patientemr.patientnotifiablediseases', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    tp: 'emr',
                    from: $scope.currentcontext.from
                });
            };
            $scope.Patient_dietorder = function() {
                $state.go('patientemr.patientdietorders', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    tp: 'emr',
                    from: $scope.currentcontext.from
                });
            };
            $scope.Patient_dietplan = function () {
                $state.go('patientemr.dietplantab.dietplan', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    tp: 'emr',
                    from: $scope.currentcontext.from
                });
            };
            $scope.new_born = function() {
                $state.go('patientemr.newborn', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    tp: 'emr',
                    from: $scope.currentcontext.from
                });
            };
            $scope.patient_labourlist = function() {
                $state.go('patientemr.patientlabourlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    tp: 'emr',
                    from: $scope.currentcontext.from
                });
            };
            $scope.Patient_equipment = function() {
                $state.go('patientemr.equipments', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    tp: 'emr',
                    from: $scope.currentcontext.from
                });
            };
            $scope.bloodbank = function() {
                $state.go('patientemr.bloodbanktab.bloodrequest', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };
            $scope.casefilesummary = function() {
                $state.go('patientemr.ivfnotestab.ivfnotescurrentlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };
            $scope.ivftreatmentplan = function() {
                $state.go('patientemr.ivftreatmentplan', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };
            $scope.ivfnotes = function() {
                $state.go('patientemr.ivfconsultationnotescurrentlist', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };
            $scope.ivfhistory = function() {
                $state.go('patientemr.consultation', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from,
                    isivf: true
                });
            };

            $scope.consbill_details = function() {
                $state.go('patientemr.constab.opconsolidatedbills', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.clinical_symptoms = function() {
                $state.go('patientemr.symptomnotestab.symptomnotes', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.discharge_casesheets = function() {
                $state.go('patientemr.dischargecasesheets', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.ipcasesheet_summary = function() {
                $state.go('patientemr.ipcasesheetsummary', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            $scope.bill_services = function() {
                $state.go('patientemr.ipbilldetails', {
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
                // utl.Modal.open('app.ipbillingprofiledetails', {
                //   params: {
                //     id: $scope.Encounter.Id,
                //     pid: $scope.currentcontext.pid
                //   },
                // });
            }

            $scope.ipcasesheets = function() {
                $state.go('patientemr.ipcasesheetsummary', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            }
            $scope.ipform = function() {
                $state.go('patientemr.ipforms', {
                    pid: $scope.currentcontext.pid,
                    context: $scope.pagecontext,
                    from: $scope.currentcontext.from
                });
            };

            SidebarLoader.getMenu(sidebarReady, null, "emr");

            function sidebarReady(items) {
                $scope.menuItems = items;
            }

            $scope.$on('patientemr-context-switch', function(event, args) {
                //console.log('Context swith cached in sidebarmenu controller');
                var strContext = args ? args.context : 'emr';
                SidebarLoader.getMenu(sidebarReady, null, strContext);
            });

            // Handle sidebar and collapse items
            // ----------------------------------

            $scope.getMenuItemPropClasses = function(item) {
                return (item.heading ? 'nav-heading' : '') +
                    (isActive(item) ? ' active' : '');
            };

            $scope.addCollapse = function($index, item) {
                collapseList[$index] = $rootScope.app.layout.asideHover ? true : !isActive(item);
            };

            $scope.isCollapse = function($index) {
                return (collapseList[$index]);
            };

            $scope.toggleCollapse = function($index, isParentItem) {

                // collapsed sidebar doesn't toggle drodopwn
                if (Utils.isSidebarCollapsed() || $rootScope.app.layout.asideHover) return true;

                // make sure the item index exists
                if (angular.isDefined(collapseList[$index])) {
                    if (!$scope.lastEventFromChild) {
                        collapseList[$index] = !collapseList[$index];
                        closeAllBut($index);
                    }
                } else if (isParentItem) {
                    closeAllBut(-1);
                }

                $scope.lastEventFromChild = isChild($index);

                return true;

            };

            // Controller helpers
            // -----------------------------------

            // Check item and children active state
            function isActive(item) {

                if (!item) return;

                if (!item.sref || item.sref === '#') {
                    var foundActive = false;
                    angular.forEach(item.submenu, function(value) {
                        if (isActive(value)) foundActive = true;
                    });
                    return foundActive;
                } else
                    return $state.is(item.sref) || $state.includes(item.sref);
            }

            function closeAllBut(index) {
                index += '';
                for (var i in collapseList) {
                    if (index < 0 || index.indexOf(i) < 0)
                        collapseList[i] = true;
                }
            }

            function isChild($index) {
                /*jshint -W018*/
                return (typeof $index === 'string') && !($index.indexOf('-') < 0);
            }

            $scope.$on('$destroy', function() {
                watchOff1();
            });

        } // activate
    }

})();
//Patient EMR sidebar ends


//Patient portal sidebar starts

(function() {
    'use strict';

    angular
        .module('app.sidebar')
        .controller('PatientPortalSidebarController', PatientPortalSidebarController);

    PatientPortalSidebarController.$inject = ['$rootScope', '$scope', '$state', 'SidebarLoader', 'Utils'];

    function PatientPortalSidebarController($rootScope, $scope, $state, SidebarLoader, Utils) {

        activate();

        ////////////////

        function activate() {
            var collapseList = [];

            // demo: when switch from collapse to hover, close all items
            var watchOff1 = $rootScope.$watch('app.layout.asideHover', function(oldVal, newVal) {
                if (newVal === false && oldVal === true) {
                    closeAllBut(-1);
                }
            });


            // Load menu from json file
            // -----------------------------------

            SidebarLoader.getMenu(sidebarReady, null, "patientportal");

            function sidebarReady(items) {
                $scope.menuItems = items;
            }

            // Handle sidebar and collapse items
            // ----------------------------------

            $scope.getMenuItemPropClasses = function(item) {
                return (item.heading ? 'nav-heading' : '') +
                    (isActive(item) ? ' active' : '');
            };

            $scope.addCollapse = function($index, item) {
                collapseList[$index] = $rootScope.app.layout.asideHover ? true : !isActive(item);
            };

            $scope.isCollapse = function($index) {
                return (collapseList[$index]);
            };

            $scope.toggleCollapse = function($index, isParentItem) {

                // collapsed sidebar doesn't toggle drodopwn
                if (Utils.isSidebarCollapsed() || $rootScope.app.layout.asideHover) return true;

                // make sure the item index exists
                if (angular.isDefined(collapseList[$index])) {
                    if (!$scope.lastEventFromChild) {
                        collapseList[$index] = !collapseList[$index];
                        closeAllBut($index);
                    }
                } else if (isParentItem) {
                    closeAllBut(-1);
                }

                $scope.lastEventFromChild = isChild($index);

                return true;

            };

            // Controller helpers
            // -----------------------------------

            // Check item and children active state
            function isActive(item) {

                if (!item) return;

                if (!item.sref || item.sref === '#') {
                    var foundActive = false;
                    angular.forEach(item.submenu, function(value) {
                        if (isActive(value)) foundActive = true;
                    });
                    return foundActive;
                } else
                    return $state.is(item.sref) || $state.includes(item.sref);
            }

            function closeAllBut(index) {
                index += '';
                for (var i in collapseList) {
                    if (index < 0 || index.indexOf(i) < 0)
                        collapseList[i] = true;
                }
            }

            function isChild($index) {
                /*jshint -W018*/
                return (typeof $index === 'string') && !($index.indexOf('-') < 0);
            }

            $scope.$on('$destroy', function() {
                watchOff1();
            });

        } // activate
    }

})();

//Patient portal sidebar ends

//Top bar controller
(function() {
    'use strict';

    angular
        .module('app.sidebar')
        .controller('TopbarController', TopbarController);

    TopbarController.$inject = ['$rootScope', '$scope', '$state', 'SidebarLoader', 'Utils', '$http', 'utl', '$cookies', '$translate', '$timeout'];

    function TopbarController($rootScope, $scope, $state, SidebarLoader, Utils, $http, utl, $cookies, $translate, $timeout) {


        $scope.currentcontext = {
            canShowHelp: utl.Session.getCurrentUserName() == 'superadmin  ',
            currentlang: $translate.use(),
            licenseExpiryDays: ''
        };
        getMenu();
        var licenseInfo = utl.Session.getObject('LicenseInfo');
        if (licenseInfo) {
            var licenseExpiresOn = moment(Number(licenseInfo.ExpiresOn));
            $scope.currentcontext.licenseExpiryDays = licenseExpiresOn.diff(moment(), 'days');
        }

        function getMenu() {
            var menuFileName = 'main';
            var headers = {
                'Authorization': `bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            var onError = function() {
                alert('Failure loading menu');
            };
            var dataMenuURL = window.appPath.apiroot + 'SystemSettings/Control/GetControls';
            //TODO: cleanup
            var username = sessionStorage.getItem('Session-UserName');
            var hasAdminRights = sessionStorage.getItem('Session-UserName') == 'superadmin';
            var landingState = utl.Session.get('LandingState');
            var landingControlParentCode = "";
            $http
                .post(dataMenuURL, {
                    Params: [{
                            Key: 2,
                            Value: menuFileName
                        },
                        {
                            Key: 3,
                            Value: true
                        }
                    ]
                }, {
                    params: {},
                    headers: headers
                })
                .success(function(result) {
                    var parentMenuMap = {};
                    var menu = [];
                    var controls = result.Data;
                    if (controls) {
                        controls.forEach(function(control) {
                            var item = {
                                text: control.Display,
                                sref: control.SRef || "#",
                                icon: control.IconRef || "",
                                translate: control.TranslateRef || "",
                                displayorder: control.DisplayOrder || 0,
                                parentControlCode: control.ParentControlCode,
                                controlCode: control.ControlCode,
                                submenu: []
                            };
                            if (control.SRef == landingState) {
                                landingControlParentCode = control.ParentControlCode;
                            }

                            if (control.Params) {
                                var jsonParam = '' + control.Params.substring(0) + '';
                                item.params = JSON.parse(jsonParam);
                                //console.log(item);
                            }
                            if (control.ParentControlCode === null) {
                                menu.push(item);
                                parentMenuMap[control.ControlCode] = item;
                            } else if (parentMenuMap[control.ParentControlCode] && parentMenuMap[control.ParentControlCode].submenu) {
                                //console.log(control.ParentControlCode);
                                parentMenuMap[control.ParentControlCode].submenu.splice(item.displayorder - 1, 0, item);
                            }
                        });
                    }
                    console.log('all menus');
                    console.log(menu);

                    //group topbar and moremenus
                    var topBarMenus = [];
                    var moreMenus = [];
                    for (var idx = 0; idx < menu.length; idx++) {
                        var item = menu[idx];
                        if (idx < 11) {
                            topBarMenus.push(item);
                        } else {
                            moreMenus.push(item);
                        }
                    }
                    $scope.moreMenus = moreMenus;
                    console.log('moreMenus');
                    console.log(moreMenus);

                    //process top bar menus as row, col
                    for (var item of topBarMenus) {
                        item.subMenuRows = [];
                        var currentRow = null;
                        for (var jdx in item.submenu) {
                            var submenu = item.submenu[jdx];
                            if (jdx % 5 == 0) {
                                // var submenuLength = item.submenu.length;
                                //var cls = submenuLength/5;
                                currentRow = {
                                    cols: []
                                };
                                item.subMenuRows.push(currentRow);
                            }
                            currentRow.cols.push(submenu);
                        }
                    }
                    $scope.topBarMenus = topBarMenus;
                    console.log('top bar - rows based menus');
                    console.log(topBarMenus);

                    //load topbar by default
                    // if (landingControlParentCode) {
                    //     $scope.submenuClick(null, landingControlParentCode);
                    // }

                })
                .error(onError);
        }
        $scope.changepwd = function() {
            utl.Modal.open('app.changepassword', {
                params: {}
            });
        }
        $scope.myprofile = function() {
            utl.Modal.open('app.userinfo', {
                params: {}
            });
        }
        $scope.changepin = function() {
            utl.Modal.open('app.changesecuritypin', {
                params: {}
            });
        }

        $scope.messages = function() {
            $state.go('app.messages');
        }


        $scope.getMsgCountCallback = function(scope, res, options, hasError) {
            $scope.currentcontext.messagesCount = res.Data.length;
        };

        $scope.getMsgCount = function() {

            var inputData = {
                Params: [{
                    Key: 4,
                    Value: utl.Session.getCurrentUserId()
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/Message/GetMessages',
                data: inputData,
                type: 'post',
                onComplete: $scope.getMsgCountCallback
            };

            utl.Http.doAction(options);
        };


        $scope.getFacilityDynSettingCallback = function(scope, res, options, hasError) {
            console.log('Load Facility Settings');
            $rootScope.FacilitySettings = [];
            var item = new Array();
            for (var idxft in res.Data) {
                if (!(item[res.Data[idxft].Category]))
                    item[res.Data[idxft].Category] = new Array();

                if (!(item[res.Data[idxft].Category][res.Data[idxft].PreferenceKey]))
                    item[res.Data[idxft].Category][res.Data[idxft].PreferenceKey] = res.Data[idxft].PreferenceValue;

                if (res.Data[idxft].Category == 'billing' && res.Data[idxft].PreferenceKey == 'requiredsecuritypin') {
                    try {
                        $scope.requiredsecuritypin = parseInt(res.Data[idxft].PreferenceValue);
                    } catch (ex) {
                        $scope.requiredsecuritypin = 0;
                    }
                }

                if (!(item[res.Data[idxft].Category]['Type_' + res.Data[idxft].PreferenceType]))
                    item[res.Data[idxft].Category]['Type_' + res.Data[idxft].PreferenceKey] = res.Data[idxft].PreferenceType;

            }
            $rootScope.FacilitySettings = item;
            //console.log($rootScope.FacilitySettings);
        };

        $scope.getFacilityDynSetting = function() {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: utl.Session.getCurrentFacilityId()
                }],
                PageContext: {
                    PageSize: 5000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'SystemSettings/FacilityPreference/GetFacilityPreferences',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFacilityDynSettingCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getFacilityDynSetting();

        //logout
        $scope.logoutCallback = function(scope, res, options, hasError) {

            var cookies = $cookies.getAll();
            angular.forEach(cookies, function(v, k) {
                $cookies.remove(k, {
                    path: '/'
                });
            });

            $state.go('page.login');
        };

        $scope.logout = function() {
            var options = {
                action: 'auth/logout',
                data: null,
                type: 'post',
                onComplete: $scope.logoutCallback
            };

            utl.Http.doAction(options);
        };

        $scope.alerts = function() {
            utl.Modal.open('app.alertview', {
                params: {},
                cancelCallback: $scope.getGeneralAlerts
            });
        }

        $scope.getGeneralAlertsCallback = function(scope, res, options, hasError) {
            $scope.currentcontext.generalAlertsCount = res.Data.length;
        };

        $scope.getGeneralAlerts = function() {
            var inputData = {
                Params: [{
                        Key: 5,
                        Value: utl.Session.getUserDepartments()
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 7,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGeneralAlertsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.switchLang = function(lang) {
            $translate.use(lang);
            $scope.currentcontext.currentlang = $translate.use();
        };


        $scope.currentfilter = {
            mrnnricmobilenr: ''
        };

        $scope.getPatientList = function() {
            var mrndata = $scope.currentfilter.mrnnricmobilenr;
            $scope.currentfilter.mrnnricmobilenr = '';
            $state.go('app.patientsearch', {
                mrnnricmobilenr: mrndata
            });
        };


        function handleDynamicFormEvents(actionType, formData) {
            $state.go('app.patientsearch', {
                mainsearchdata: formData,
                mrnnricmobilenr: ''
            });
        };


        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                From: '',
                To: '',
                ReferralId: -1,
                PinCode: '',
                VisitDate: '',
                Country: '',
                VisitTypeId: -1,
                State: '',
                GuarantorId: -1,
                CityTown: '',
                IsAdmitted: false,
                Area: '',
                ShowTempPatient: false
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                        type: 'date',
                        translate: 'registration.patientsearch.filter_registerfromdate.lbl',
                        model: 'From',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'registration.patientsearch.filter_registertodate.lbl',
                        model: 'To',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'registration.patientsearch.filter_referredby.lbl',
                        model: 'ReferralId',
                        options: $scope.lookup.Referral,
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'registration.patientsearch.filter_pincode.lbl',
                        model: 'PinCode',
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'date',
                        translate: 'registration.patientsearch.filter_visitdate.lbl',
                        model: 'VisitDate',
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'registration.patientsearch.filter_country.lbl',
                        model: 'Country',
                        position: {
                            r: 2,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'registration.patientsearch.filter_visittype.lbl',
                        model: 'VisitTypeId',
                        options: $scope.lookup.VisitType,
                        position: {
                            r: 3,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'registration.patientsearch.filter_state.lbl',
                        model: 'State',
                        position: {
                            r: 3,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'registration.patientsearch.filter_guarantor.lbl',
                        model: 'GuarantorId',
                        options: $scope.lookup.Guarantor,
                        position: {
                            r: 4,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'registration.patientsearch.filter_citytown.lbl',
                        model: 'CityTown',
                        position: {
                            r: 4,
                            c: 1
                        }
                    },
                    {
                        type: 'checkbox',
                        translate: 'registration.patientsearch.filter_isadmitted.lbl',
                        model: 'ReferralId',
                        position: {
                            r: 5,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'registration.patientsearch.filter_area.lbl',
                        model: 'Area',
                        position: {
                            r: 5,
                            c: 1
                        }
                    },
                    {
                        type: 'checkbox',
                        translate: 'registration.patientsearch.filter_istemppatient.lbl',
                        model: 'ShowTempPatient',
                        position: {
                            r: 6,
                            c: 0
                        }
                    }
                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-primary'
                    },
                    {
                        type: 'reset',
                        translate: 'common.resetaction.lbl',
                        cls: 'btn-danger'
                    }
                ]
            };
        }

        $scope.openAdvancedFilter = function() {
            $scope.currentfilter.mrnnricmobilenr = '';
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };



        $scope.CurrentFacilityName = utl.Session.getCurrentFacilityName();

        $scope.setDefaultFacility = function() {
            $scope.CurrentFacilityName = utl.Session.getCurrentFacilityName();
            $state.go("app.frontdashboard", {}, {
                reload: true
            });
        }

        $scope.openUserFacilityInfo = function() {
            utl.Modal.open('app.userfacilityselection', {
                params: {},
                confirmCallback: $scope.setDefaultFacility
            });
        }

        $scope.openAppInfo = function() {
            utl.Modal.open('page.appinfo', {
                params: {}
            });
        }

        $scope.getGeneralAlerts();
        $scope.getMsgCount();


        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            activate();
        }



        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "PatientStatus"
                },
                // {
                //     "Key": "Referral"
                // },
                {
                    "Key": "VisitType"
                },
                // {
                //     "Key": "Guarantor",
                //     Request: {
                //         Params: [{
                //             Key: 7,
                //             Value: [-1, utl.Session.getCurrentFacilityId()]
                //         }]
                //     }
                // },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();

        function activate() {

            $scope.currentuser = {
                username: sessionStorage.getItem('Session-UserFullName'),
                departmentname: sessionStorage.getItem('Session-DepartmentName')
            };
        } // activate
    }

})();

/**=========================================================
* Module: sidebar.js
* Wraps the sidebar and handles collapsed state
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.sidebar')
        .directive('sidebar', sidebar);

    sidebar.$inject = ['$rootScope', '$timeout', '$window', 'Utils'];

    function sidebar($rootScope, $timeout, $window, Utils) {
        var $win = angular.element($window);
        var directive = {
            // bindToController: true,
            // controller: Controller,
            // controllerAs: 'vm',
            link: link,
            restrict: 'EA',
            template: '<nav class="sidebar" ng-transclude></nav>',
            transclude: true,
            replace: true
                // scope: {}
        };
        return directive;

        function link(scope, element, attrs) {

            var currentState = $rootScope.$state.current.name;
            var $sidebar = element;

            var eventName = Utils.isTouch() ? 'click' : 'mouseenter';
            var subNav = $();

            $sidebar.on(eventName, '.nav > li', function() {

                if (Utils.isSidebarCollapsed() || $rootScope.app.layout.asideHover) {

                    subNav.trigger('mouseleave');
                    subNav = toggleMenuItem($(this), $sidebar);

                    // Used to detect click and touch events outside the sidebar
                    sidebarAddBackdrop();

                }

            });

            var eventOff1 = scope.$on('closeSidebarMenu', function() {
                removeFloatingNav();
            });

            // Normalize state when resize to mobile
            $win.on('resize.sidebar', function() {
                if (!Utils.isMobile())
                    asideToggleOff();
            });

            // Adjustment on route changes
            var eventOff2 = $rootScope.$on('$stateChangeStart', function(event, toState) {
                currentState = toState.name;
                // Hide sidebar automatically on mobile
                asideToggleOff();

                $rootScope.$broadcast('closeSidebarMenu');
            });

            // Autoclose when click outside the sidebar
            if (angular.isDefined(attrs.sidebarAnyclickClose)) {

                var wrapper = $('.wrapper');
                var sbclickEvent = 'click.sidebar';

                var watchOff1 = $rootScope.$watch('app.asideToggled', watchExternalClicks);

            }

            //////

            function watchExternalClicks(newVal) {
                // if sidebar becomes visible
                if (newVal === true) {
                    $timeout(function() { // render after current digest cycle
                        wrapper.on(sbclickEvent, function(e) {
                            // if not child of sidebar
                            if (!$(e.target).parents('.aside').length) {
                                asideToggleOff();
                            }
                        });
                    });
                } else {
                    // dettach event
                    wrapper.off(sbclickEvent);
                }
            }

            function asideToggleOff() {
                $rootScope.app.asideToggled = false;
                if (!scope.$$phase) scope.$apply(); // anti-pattern but sometimes necessary
            }

            scope.$on('$destroy', function() {
                // detach scope events
                eventOff1();
                eventOff2();
                watchOff1();
                // detach dom events
                $sidebar.off(eventName);
                $win.off('resize.sidebar');
                wrapper.off(sbclickEvent);
            });

        }

        ///////

        function sidebarAddBackdrop() {
            var $backdrop = $('<div/>', {
                'class': 'dropdown-backdrop'
            });
            $backdrop.insertAfter('.aside-inner').on('click mouseenter', function() {
                removeFloatingNav();
            });
        }

        // Open the collapse sidebar submenu items when on touch devices
        // - desktop only opens on hover
        function toggleTouchItem($element) {
            $element
                .siblings('li')
                .removeClass('open')
                .end()
                .toggleClass('open');
        }

        // Handles hover to open items under collapsed menu
        // -----------------------------------
        function toggleMenuItem($listItem, $sidebar) {

            removeFloatingNav();

            var ul = $listItem.children('ul');

            if (!ul.length) return $();
            if ($listItem.hasClass('open')) {
                toggleTouchItem($listItem);
                return $();
            }

            var $aside = $('.aside');
            var $asideInner = $('.aside-inner'); // for top offset calculation
            // float aside uses extra padding on aside
            var mar = parseInt($asideInner.css('padding-top'), 0) + parseInt($aside.css('padding-top'), 0);
            var subNav = ul.clone().appendTo($aside);

            toggleTouchItem($listItem);

            var itemTop = ($listItem.position().top + mar) - $sidebar.scrollTop();
            var vwHeight = $win.height();

            subNav
                .addClass('nav-floating')
                .css({
                    position: $rootScope.app.layout.isFixed ? 'fixed' : 'absolute',
                    top: itemTop,
                    bottom: (subNav.outerHeight(true) + itemTop > vwHeight) ? 0 : 'auto'
                });

            subNav.on('mouseleave', function() {
                toggleTouchItem($listItem);
                subNav.remove();
            });

            return subNav;
        }

        function removeFloatingNav() {
            $('.dropdown-backdrop').remove();
            $('.sidebar-subnav.nav-floating').remove();
            $('.sidebar li.open').removeClass('open');
        }
    }


})();


(function() {
    'use strict';

    angular
        .module('app.sidebar')
        .service('SidebarLoader', SidebarLoader);

    SidebarLoader.$inject = ['$http', '$rootScope'];

    function SidebarLoader($http, $rootScope) {
        this.getMenu = getMenu;

        ////////////////

        function getMenu(onReady, onError, menuFileName) {
            if (!menuFileName) {
                menuFileName = 'main';
            }
            var menuJson = 'server/' + menuFileName,
                menuURL = menuJson + '?v=' + (new Date().getTime()); // jumps cache

            onError = onError || function() {
                alert('Failure loading menu');
            };

            // $http
            //   .get(menuURL)
            //   .success(onReady)
            //   .error(onError);

            var headers = {
                'Authorization': `bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            var dataMenuURL = window.appPath.apiroot + 'SystemSettings/Control/GetControls';
            //TODO: cleanup
            var hasAdminRights = sessionStorage.getItem('Session-UserName') == 'superadmin';
            $http
                .post(dataMenuURL, {
                    Params: [{
                            Key: 2,
                            Value: menuFileName
                        },
                        {
                            Key: 3,
                            Value: !hasAdminRights
                        } //ApplyRoles
                    ]
                }, {
                    params: {},
                    headers: headers
                })
                .success(function(result) {
                    var parentMenuMap = {};
                    var menu = [];
                    var controls = result.Data;
                    if (controls) {
                        controls.forEach(function(control) {
                            var item = {
                                text: control.Display,
                                sref: control.SRef || "#",
                                icon: control.IconRef || "",
                                translate: control.TranslateRef || "",
                                displayorder: control.DisplayOrder || 0,
                                submenu: []
                            };
                            if (control.Params) {
                                var jsonParam = '' + control.Params.substring(0) + '';
                                item.params = JSON.parse(jsonParam);
                                //console.log(item);
                            }
                            if (control.ParentControlCode === null) {
                                menu.push(item);
                                parentMenuMap[control.ControlCode] = item;
                            } else if (parentMenuMap[control.ParentControlCode] && parentMenuMap[control.ParentControlCode].submenu) {
                                //console.log(control.ParentControlCode);
                                parentMenuMap[control.ParentControlCode].submenu.splice(item.displayorder - 1, 0, item);
                            }
                        });
                    }
                    if (onReady) {
                        onReady(menu);
                    }
                    console.log(menu);
                })
                .error(onError);
        }
    }
})();
(function() {
    'use strict';

    angular
        .module('app.sidebar')
        .controller('UserBlockController', UserBlockController);

    UserBlockController.$inject = ['$scope'];

    function UserBlockController($scope) {

        activate();

        ////////////////

        function activate() {

            $scope.userBlockVisible = true;

            var detach = $scope.$on('toggleUserBlock', function( /*event, args*/ ) {

                $scope.userBlockVisible = !$scope.userBlockVisible;

            });

            $scope.$on('$destroy', detach);
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('app.translate')
        .config(translateConfig);
    translateConfig.$inject = ['$translateProvider', '$translatePartialLoaderProvider'];

    function translateConfig($translateProvider, $translatePartialLoaderProvider) {

        // $translateProvider.useStaticFilesLoader({
        //     prefix : 'app/i18n/',
        //     suffix : '.json'
        // });
        var localePaths = ['common',
            'common/errors',
            'emr/appmanager',
            'emr/clinicalmaster',
            'emr/appointment',
            'emr/registration',
            'emr/generalmaster',
            'emr/surgerymanagement',
            'emr/dashboard',
            'emr/accidentemergency',
            'emr/emar',
            'emr/doctorinvoice',
            'emr/patientemr',
            'emr/assetmanagement',
            'emr/costmanagement',
            'emr/medicalcertificate',
            'emr/ordermanagement',
            'emr/cssd',
            'emr/billingmaster',
            'emr/physiotheraphy',
            'virtualhealth',
            'patientportal',
            'lis',
            'inventory',
            'inpatient',
            'billing',
            'reports',
            'billmodifications',
            'bireport',
            'linenandlaundry',
            'taskmanagement'
        ];
        // });
        for (var idx in localePaths) {
            var locPath = localePaths[idx];
            $translatePartialLoaderProvider.addPart(locPath);
        }

        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: 'app/i18n/{part}/{lang}.json'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useLocalStorage();
        $translateProvider.usePostCompiling(true);
        $translateProvider.useSanitizeValueStrategy('sanitizeParameters');

    }
})();
(function() {
    'use strict';

    angular
        .module('app.translate')
        .run(translateRun);
    translateRun.$inject = ['$rootScope', '$translate'];

    function translateRun($rootScope, $translate) {

        // Internationalization
        // ----------------------

        $rootScope.language = {
            // Handles language dropdown
            listIsOpen: false,
            // list of available languages
            available: {
                'en': 'English',
                'es_AR': 'Español'
            },
            // display always the current ui language
            init: function() {
                var proposedLanguage = $translate.proposedLanguage() || $translate.use();
                var preferredLanguage = $translate.preferredLanguage(); // we know we have set a preferred one in app.config
                $rootScope.language.selected = $rootScope.language.available[(proposedLanguage || preferredLanguage)];
            },
            set: function(localeId) {
                // Set the new idiom
                $translate.use(localeId);
                // save a reference for the current language
                $rootScope.language.selected = $rootScope.language.available[localeId];
                // finally toggle dropdown
                $rootScope.language.listIsOpen = !$rootScope.language.listIsOpen;
            }
        };

        $rootScope.language.init();

    }
})();
/**=========================================================
* Module: animate-enabled.js
* Enable or disables ngAnimate for element with directive
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.utils')
        .directive('animateEnabled', animateEnabled);

    animateEnabled.$inject = ['$animate'];

    function animateEnabled($animate) {
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            scope.$watch(function() {
                return scope.$eval(attrs.animateEnabled, scope);
            }, function(newValue) {
                $animate.enabled(!!newValue, element);
            });
        }
    }

})();

/**=========================================================
* Module: browser.js
* Browser detection
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.utils')
        .service('Browser', Browser);

    Browser.$inject = ['$window'];

    function Browser($window) {
        return $window.jQBrowser;
    }

})();

/**=========================================================
* Module: clear-storage.js
* Removes a key from the browser storage via element click
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.utils')
        .directive('resetKey', resetKey);

    resetKey.$inject = ['$state', '$localStorage'];

    function resetKey($state, $localStorage) {
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                resetKey: '@'
            }
        };
        return directive;

        function link(scope, element) {
            element.on('click', function(e) {
                e.preventDefault();

                if (scope.resetKey) {
                    delete $localStorage[scope.resetKey];
                    $state.go($state.current, {}, {
                        reload: true
                    });
                } else {
                    $.error('No storage key specified for reset.');
                }
            });
        }
    }

})();

/**=========================================================
* Module: fullscreen.js
* Toggle the fullscreen mode on/off
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.utils')
        .directive('toggleFullscreen', toggleFullscreen);

    toggleFullscreen.$inject = ['Browser'];

    function toggleFullscreen(Browser) {
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element) {
            // Not supported under IE
            if (Browser.msie) {
                element.addClass('hide');
            } else {
                element.on('click', function(e) {
                    e.preventDefault();

                    if (screenfull.enabled) {

                        screenfull.toggle();

                        // Switch icon indicator
                        if (screenfull.isFullscreen)
                            $(this).children('em').removeClass('fa-expand').addClass('fa-compress');
                        else
                            $(this).children('em').removeClass('fa-compress').addClass('fa-expand');

                    } else {
                        $.error('Fullscreen not enabled');
                    }

                });
            }
        }
    }


})();

/**=========================================================
* Module: load-css.js
* Request and load into the current page a css file
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.utils')
        .directive('loadCss', loadCss);

    function loadCss() {
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            element.on('click', function(e) {
                if (element.is('a')) e.preventDefault();
                var uri = attrs.loadCss,
                    link;

                if (uri) {
                    link = createLink(uri);
                    if (!link) {
                        $.error('Error creating stylesheet link element.');
                    }
                } else {
                    $.error('No stylesheet location defined.');
                }

            });
        }

        function createLink(uri) {
            var linkId = 'autoloaded-stylesheet',
                oldLink = $('#' + linkId).attr('id', linkId + '-old');

            $('head').append($('<link/>').attr({
                'id': linkId,
                'rel': 'stylesheet',
                'href': uri
            }));

            if (oldLink.length) {
                oldLink.remove();
            }

            return $('#' + linkId);
        }
    }

})();

/**=========================================================
* Module: now.js
* Provides a simple way to display the current time formatted
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.utils')
        .directive('now', now);

    now.$inject = ['dateFilter', '$interval'];

    function now(dateFilter, $interval) {
        var directive = {
            link: link,
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {
            var format = attrs.format;

            function updateTime() {
                var dt = dateFilter(new Date(), format);
                element.text(dt);
            }

            updateTime();
            var intervalPromise = $interval(updateTime, 1000);

            scope.$on('$destroy', function() {
                $interval.cancel(intervalPromise);
            });

        }
    }

})();

/**=========================================================
* Module: table-checkall.js
* Tables check all checkbox
=========================================================*/
(function() {
    'use strict';

    angular
        .module('app.utils')
        .directive('checkAll', checkAll);

    function checkAll() {
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element) {
            element.on('change', function() {
                var $this = $(this),
                    index = $this.index() + 1,
                    checkbox = $this.find('input[type="checkbox"]'),
                    table = $this.parents('table');
                // Make sure to affect only the correct checkbox column
                table.find('tbody > tr > td:nth-child(' + index + ') input[type="checkbox"]')
                    .prop('checked', checkbox[0].checked);

            });
        }
    }

})();

/**=========================================================
* Module: trigger-resize.js
* Triggers a window resize event from any element
=========================================================*/
(function() {
    'use strict';

    angular
        .module('app.utils')
        .directive('triggerResize', triggerResize);

    triggerResize.$inject = ['$window', '$timeout'];

    function triggerResize($window, $timeout) {
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attributes) {
            element.on('click', function() {
                $timeout(function() {
                    // all IE friendly dispatchEvent
                    var evt = document.createEvent('UIEvents');
                    evt.initUIEvent('resize', true, false, $window, 0);
                    $window.dispatchEvent(evt);
                    // modern dispatchEvent way
                    // $window.dispatchEvent(new Event('resize'));
                }, attributes.triggerResize || 300);
            });
        }
    }

})();

/**=========================================================
* Module: utils.js
* Utility library to use across the theme
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.utils')
        .service('Utils', Utils);

    Utils.$inject = ['$window', 'APP_MEDIAQUERY'];

    function Utils($window, APP_MEDIAQUERY) {

        var $html = angular.element('html'),
            $win = angular.element($window),
            $body = angular.element('body');

        return {
            // DETECTION
            support: {
                transition: (function() {
                    var transitionEnd = (function() {

                        var element = document.body || document.documentElement,
                            transEndEventNames = {
                                WebkitTransition: 'webkitTransitionEnd',
                                MozTransition: 'transitionend',
                                OTransition: 'oTransitionEnd otransitionend',
                                transition: 'transitionend'
                            },
                            name;

                        for (name in transEndEventNames) {
                            if (element.style[name] !== undefined) return transEndEventNames[name];
                        }
                    }());

                    return transitionEnd && {
                        end: transitionEnd
                    };
                })(),
                animation: (function() {

                    var animationEnd = (function() {

                        var element = document.body || document.documentElement,
                            animEndEventNames = {
                                WebkitAnimation: 'webkitAnimationEnd',
                                MozAnimation: 'animationend',
                                OAnimation: 'oAnimationEnd oanimationend',
                                animation: 'animationend'
                            },
                            name;

                        for (name in animEndEventNames) {
                            if (element.style[name] !== undefined) return animEndEventNames[name];
                        }
                    }());

                    return animationEnd && {
                        end: animationEnd
                    };
                })(),
                requestAnimationFrame: window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    function(callback) {
                        window.setTimeout(callback, 1000 / 60);
                    },
                /*jshint -W069*/
                touch: (
                    ('ontouchstart' in window && navigator.userAgent.toLowerCase().match(/mobile|tablet/)) ||
                    (window.DocumentTouch && document instanceof window.DocumentTouch) ||
                    (window.navigator['msPointerEnabled'] && window.navigator['msMaxTouchPoints'] > 0) || //IE 10
                    (window.navigator['pointerEnabled'] && window.navigator['maxTouchPoints'] > 0) || //IE >=11
                    false
                ),
                mutationobserver: (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null)
            },
            // UTILITIES
            isInView: function(element, options) {
                /*jshint -W106*/
                var $element = $(element);

                if (!$element.is(':visible')) {
                    return false;
                }

                var window_left = $win.scrollLeft(),
                    window_top = $win.scrollTop(),
                    offset = $element.offset(),
                    left = offset.left,
                    top = offset.top;

                options = $.extend({
                    topoffset: 0,
                    leftoffset: 0
                }, options);

                if (top + $element.height() >= window_top && top - options.topoffset <= window_top + $win.height() &&
                    left + $element.width() >= window_left && left - options.leftoffset <= window_left + $win.width()) {
                    return true;
                } else {
                    return false;
                }
            },

            langdirection: $html.attr('dir') === 'rtl' ? 'right' : 'left',

            isTouch: function() {
                return $html.hasClass('touch');
            },

            isSidebarCollapsed: function() {
                return $body.hasClass('aside-collapsed') || $body.hasClass('aside-collapsed-text');
            },

            isSidebarToggled: function() {
                return $body.hasClass('aside-toggled');
            },

            isMobile: function() {
                return $win.width() < APP_MEDIAQUERY.tablet;
            }

        };
    }
})();


/**=========================================================
* Module panel-tools.js
* Directive tools to control panels.
* Allows collapse, refresh and dismiss (remove)
* Saves panel state in browser storage
=========================================================*/

(function() {
    'use strict';

    angular
        .module('app.utils')
        .directive('paneltool', paneltool);

    paneltool.$inject = ['$compile', '$timeout'];

    function paneltool($compile, $timeout) {
        var directive = {
            link: link,
            restrict: 'E',
            scope: false
        };
        return directive;

        function link(scope, element, attrs) {

            var templates = {
                /* jshint multistr: true */
                collapse: '<a href="#" panel-collapse="" uib-tooltip="Collapse Panel" ng-click="{{panelId}} = !{{panelId}}"> \
                      <em ng-show="{{panelId}}" class="fa fa-plus ng-no-animation"></em> \
                      <em ng-show="!{{panelId}}" class="fa fa-minus ng-no-animation"></em> \
                    </a>',
                dismiss: '<a href="#" panel-dismiss="" uib-tooltip="Close Panel">\
                     <em class="fa fa-times"></em>\
                   </a>',
                refresh: '<a href="#" panel-refresh="" data-spinner="{{spinner}}" uib-tooltip="Refresh Panel">\
                     <em class="fa fa-refresh"></em>\
                   </a>'
            };

            var tools = scope.panelTools || attrs;

            $timeout(function() {
                element.html(getTemplate(element, tools)).show();
                $compile(element.contents())(scope);

                element.addClass('pull-right');
            });

            function getTemplate(elem, attrs) {
                var temp = '';
                attrs = attrs || {};
                if (attrs.toolCollapse)
                    temp += templates.collapse.replace(/{{panelId}}/g, (elem.parent().parent().attr('id')));
                if (attrs.toolDismiss)
                    temp += templates.dismiss;
                if (attrs.toolRefresh)
                    temp += templates.refresh.replace(/{{spinner}}/g, attrs.toolRefresh);
                return temp;
            }
        } // link
    }

})();

(function() {
    'use strict';

    angular
        .module('custom', [
            // request the the entire framework
            'angularApp',
            // or just modules
            'app.core',
            'app.sidebar'
            /*...*/
        ]);
})();

// To run this code, edit file index.html or index.jade and change
// html data-ng-app attribute from angle to myAppName
// ----------------------------------------------------------------------

(function() {
    'use strict';

    angular
        .module('custom')
        .controller('Controller', Controller);

    Controller.$inject = ['$log'];

    function Controller($log) {
        // for controllerAs syntax
        // var vm = this;

        activate();

        ////////////////

        function activate() {
            $log.log('I\'m a line from custom.js');
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('app.routes')
        .provider('modalState', ['$stateProvider', function($stateProvider) {
            var provider = this;

            this.$get = function() {
                return provider;
            }

            this.state = function(stateName, options) {
                var modalInstance;

                $stateProvider.state(stateName, {
                    url: options.url,
                    resolve: options.resolve || {},
                    onEnter: onEnter,
                    onExit: onExit,
                    params: options.params
                });

                onEnter.$inject = ['$uibModal', '$state'].concat(Object.keys(options.resolve));

                function onEnter($modal, $state) {
                    for (var i = arguments.length - Object.keys(options.resolve).length; i < arguments.length; i++) {
                        var key = onEnter.$inject[i];
                        var val = arguments[i];
                        options.resolve[key] = function() {
                            return val
                        }
                    }

                    options.size = "lg";
                    options.keyboard = false;
                    options.backdrop = 'static';

                    modalInstance = $modal.open(options);
                    modalInstance.result.finally(function() {
                        if ($state.$current.name === stateName)
                            $state.go('^');
                    });
                }

                function onExit() {
                    if (modalInstance)
                        modalInstance.close();
                }
            }
        }])
})();

(function() {
    'use strict';

    angular
        .module('app.routes')
        .provider('modalConfig', function() {
            var provider = this;
            provider.configs = {};

            this.$get = function() {
                return provider;
            }

            this.get = function(key) {
                return provider.configs[key] || {};
            }

            this.add = function(key, options) {
                provider.configs[key] = options;
            }
        })
})();

(function() {
    'use strict';

    angular
        .module('common.utils')
        .config(customFabFormConfig);

    customFabFormConfig.$inject = ['ngFabFormProvider'];

    function customFabFormConfig(ngFabFormProvider) {

        var customValidatorFn = function(ngModelCtrl, attrs, el) {
            if (attrs.required && el && el[0].classList && el[0].classList.contains('ui-select-container')) {
                ngModelCtrl.$validators.required = function(value) {
                    var result = !ngModelCtrl.$isEmpty(value);
                    if (result) {
                        result = !(value == -1 || value == "-1");
                    }
                    return result;
                };
            }
            if (attrs.required && attrs.name && el && el[0].classList && el[0].classList.contains('zfautosearch')) {
                ngModelCtrl.$validators.required = function(value) {
                    var result = !ngModelCtrl.$isEmpty(value);
                    if (value) {
                        result = !(angular.isString(value));
                    }
                    return result;
                };
            }
        };
        ngFabFormProvider.setCustomValidatorsFn(customValidatorFn);
    }
})();