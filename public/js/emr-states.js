(function() {
    'use strict';

    angular
        .module('app.routes')
        .config(routesConfig);

    routesConfig.$inject = ['$stateProvider', '$locationProvider', '$urlRouterProvider',
        'RouteHelpersProvider', 'modalStateProvider', 'modalConfigProvider'
    ];

    function routesConfig($stateProvider, $locationProvider, $urlRouterProvider,
        helper, modalStateProvider, modalConfigProvider) {

        $locationProvider.html5Mode(false);

        $urlRouterProvider.otherwise('/page/login');
        $stateProvider
        .state('patientemr', {
            url: '/patientemr',
            abstract: true,
            templateUrl: helper.basepath('patientemr.html'),
            params: {
                eid: '',
                pid: null,
                oid: null,
                type: ''
            },
            resolve: helper.resolveFor('modernizr', 'icons', 'ui.grid', 'ui.select',
                'colorpicker.module', 'ngFileUpload', 'common.utils', 'dndLists', 'ui.bootstrap.datetimepicker', 'mathjs', 'focus-if', 'chart.js',
                'nvd3ChartDirectives', 'ui.bootstrap-slider', 'annotorious'),
            controller: ['$scope', 'utl', '$state', '$rootScope', '$stateParams', '$timeout', 'Idle',
                function($scope, utl, $state, $rootScope, $stateParams, $timeout, Idle) {

                    Idle.watch();

                    $scope.$on('Keepalive', function() {
                        console.log('keep alive call');
                        var options = {
                            action: 'SystemSettings/LoginSession/KeepAlive',
                            data: null,
                            type: 'post',
                            onComplete: keepAliveCallback
                        };

                        utl.Http.doAction(options);
                    });

                    function keepAliveCallback(scope, data, options, hasError) {
                        console.log('keep alive callback');
                    }

                    $scope.currentcontext = {};
                    $scope.currentcontext.encounterid = $stateParams.eid ? parseInt($stateParams.eid) : 0;
                    $scope.currentcontext.patientId = utl.Session.getEMRPatientId();
                    $scope.getencountersCallback = function(scope, data, options, hasError) {
                        if (data.Data.length > 0) {
                            var encounterObj = data.Data[0];
                            utl.Session.setPatientEncounter(encounterObj);
                            $rootScope.$broadcast('patientemr-redraw-topbar', {
                                encounter: encounterObj
                            });
                        }
                    };

                    $scope.getEncounterById = function() {
                        if ($scope.currentcontext.encounterid > 0) {
                            var inputData = {
                                Params: [{
                                        Key: 0,
                                        Value: $scope.currentcontext.encounterid
                                    },
                                    {
                                        Key: 35,
                                        Value: true
                                    }
                                ]
                            };

                            var options = {
                                action: 'Visit/Visit/GetEncounters',
                                data: inputData,
                                type: 'post',
                                onComplete: $scope.getencountersCallback
                            };

                            utl.Http.doAction(options);
                        }
                    };

                    $scope.getPatientInfo = function(scope, data, options, hasError) {
                        if (data != null) {
                            var patientObj = data;
                            utl.Session.setObject('EMRPatientObject', patientObj);
                        }
                    };

                    $scope.getPatient = function() {
                        var options = {
                            action: 'registration/patient/GetPatientById',
                            data: {
                                Id: $scope.currentcontext.patientId
                            },
                            type: 'post',
                            onComplete: $scope.getPatientInfo
                        };
                        utl.Http.doAction(options);
                    };

                    if ($scope.currentcontext.patientId && $scope.currentcontext.patientId > 0) {
                        $scope.getPatient();
                    }

                    if ($scope.currentcontext.encounterid)
                        $scope.getEncounterById();
                    else {
                        $timeout(function() {
                            $rootScope.$broadcast('patientemr-redraw-topbar', {
                                encounter: null
                            });
                        }, 1500);
                    }
                }
            ]
        })

        .state('patientemr.equipments', {
            url: '/equipments',
            title: 'Medical Equipments',
            templateUrl: helper.basepath('emr/surgerymanagement/equipmentused/medicalequipment.html'),
            controller: 'MedicalEquipmentController as vm',
            params: {
                tp: 'emr',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/equipmentused/medicalequipment.js'));
                }]
            }
        })
        .state('patientemr.sickleaveform', {
            url: '/sickleaveform',
            title: 'sickleaveform',
            templateUrl: helper.basepath('emr/general/sickleaveform/sickleave-form.html'),
            controller: 'sickleaveformController as vm',
            params: {
                tp: 'emr'
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/general/sickleaveform/sickleave-form.js'));
                }]
            }
        })

        .state('patientemr.patientdietorders', {
            url: '/patientdietorders',
            title: 'Patient Diet Orders',
            templateUrl: helper.basepath('emr/patientemr/patientdietorders/patientdietorder-list.html'),
            controller: 'patientDietOrderListController as vm',
            params: {
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientdietorders/patientdietorder-list.js'));
                }]
            }
        })
        .state('patientemr.patientdietorderform', {
            url: '/patientdietorder/:pid/:id',
            title: 'Patient Diet Order',
            templateUrl: helper.basepath('emr/patientemr/patientdietorders/patientdietorder-form.html'),
            controller: 'patientDietOrderFormController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientdietorders/patientdietorder-form.js'));
                }]
            }
        })
        .state('patientemr.dietplantab', {
            url: '/dietplan/:id',
            params: {
                id: '0'
            },
            title: 'Patient Diet Plan',
            templateUrl: helper.basepath('emr/patientemr/patientdietplan/dietplan-tab.html'),
            controller: 'dietplanTabController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientdietplan/dietplan-tab.js'));
                }]
            }
        })
        .state('patientemr.dietplantab.dietplan', {
            url: '/dietplan',
            title: 'Patient Dietplan',
            templateUrl: helper.basepath('emr/patientemr/patientdietplan/dietplan-list.html'),
            controller: 'patientDietplanController as vm',
            resolve: {
                $uibModalInstance: function () {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientdietplan/dietplan-list.js'));
                }]
            }
        })
        .state('patientemr.dietplantab.dietplanlist', {
            url: '/dietplanlist',
            title: 'Patient Diet Plan List',
            templateUrl: helper.basepath('emr/patientemr/patientdietplan/dietplan-list-items.html'),
            controller: 'patientDietplanListController as vm',
            resolve: {
                $uibModalInstance: function () {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientdietplan/dietplan-list-items.js'));
                }]
            }
        })
        .state('patientemr.newborn', {
            url: '/newbornlist',
            title: 'New Born List',
            templateUrl: helper.basepath('emr/patientemr/newborndetails/newborndetail-list.html'),
            controller: 'newborndetailsListController as vm',
            params: {
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/newborndetails/newborndetail-list.js'));
                }]
            }
        })
        .state('patientemr.newbornform', {
            url: '/newbornform/:pid/:id',
            title: 'New Born Form',
            templateUrl: helper.basepath('emr/patientemr/newborndetails/newborndetail-form.html'),
            controller: 'newborndetailsFormController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/newborndetails/newborndetail-form.js'));
                }]
            }
        })
        .state('patientemr.patientlabourlist', {
            url: '/patientlabourlist',
            title: 'Patient labour List',
            templateUrl: helper.basepath('emr/patientemr/patientlabourdetails/patientlabourdetail-list.html'),
            controller: 'patientlabourListController as vm',
            params: {
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientlabourdetails/patientlabourdetail-list.js'));
                }]
            }
        })
        .state('patientemr.patientlabourform', {
            url: '/patientlabourform/:pid/:id',
            title: 'Patient labour Form',
            templateUrl: helper.basepath('emr/patientemr/patientlabourdetails/patientlabourdetail-form.html'),
            controller: 'patientlabourFormController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientlabourdetails/patientlabourdetail-form.js'));
                }]
            }
        })
        .state('patientemr.patientrecords', {
            url: '/patientrecords/',
            title: 'Patient Records',
            templateUrl: helper.basepath('emr/patientemr/patientrecords/patientrecords-list.html'),
            controller: 'patientrecordslistController as vm',
            params: {
                context: '',
                from: '',
                doctor: '',
                oid: null,
                aid: null
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientrecords/patientrecords-list.js'));
                }]
            }
        })
        .state('patientemr.constab', {
            url: '/emrconstab',
            title: 'Consolidate Bills',
            templateUrl: helper.basepath('emr/emrconsolidatedbills/emrconsolidatetab.html'),
            controller: 'EmrConsolidateTabController as tabvm',
            params: {
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/emrconsolidatedbills/emrconsolidatetab.js'));
                }]
            }
        })
        .state('patientemr.constab.opconsolidatedbills', {
            url: '/emropconsolidatedbills/',
            title: 'emropconsolidatedbills',
            templateUrl: helper.basepath('emr/emrconsolidatedbills/emropconsolidatedbills.html'),
            controller: 'EmropbilldetailsController as vm',
            params: {
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/emrconsolidatedbills/emropconsolidatedbills.js'));
                }]
            }
        })
        .state('patientemr.constab.pharmacyconsolidatedbills', {
            url: '/emrpharmacyconsolidatedbills/',
            title: 'emrpharmacyconsolidatedbills',
            templateUrl: helper.basepath('emr/emrconsolidatedbills/emrpharmacyconsolidatedbills.html'),
            controller: 'EmrpharmabilldetailsController as vm',
            params: {
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/emrconsolidatedbills/emrpharmacyconsolidatedbills.js'));
                }]
            }
        })
        .state('patientemr.orderpatientrecords', {
            url: '/orderpatientrecords/',
            title: 'Patient Records',
            templateUrl: helper.basepath('emr/patientemr/orderpatientrecords/orderpatientrecords.html'),
            controller: 'OrderPatientrecordsController as vm',
            params: {
                context: '',
                from: '',
                oid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/orderpatientrecords/orderpatientrecords.js'));
                }]
            }
        })
        .state('patientemr.symptomnotestab', {
            url: '/symptomnotestab/',
            title: 'symptomnotestab',
            templateUrl: helper.basepath('emr/patientemr/symptomnotes/symptomnotestab.html'),
            controller: 'SymptomNotesTabController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/symptomnotes/symptomnotestab.js'));
                }]
            }
        })
        .state('patientemr.symptomnotestab.symptomnotes', {
            url: '/symptomnotes/',
            title: 'symptomnotes',
            templateUrl: helper.basepath('emr/patientemr/symptomnotes/symptomnotes.html'),
            controller: 'SymptomNotesController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/symptomnotes/symptomnotes.js'));
                }]
            }
        })
        .state('patientemr.symptomnotestab.symptomnotehistory', {
            url: '/symptomnotehistory/',
            title: 'symptomnotehistory',
            templateUrl: helper.basepath('emr/patientemr/symptomnotes/symptomnotehistory.html'),
            controller: 'SymptomNotesHistoryController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/symptomnotes/symptomnotehistory.js'));
                }]
            }
        })
        .state('patientemr.symptomnotestab.symptomnoteslist', {
            url: '/symptomnoteslist/',
            title: 'symptomnoteslist',
            templateUrl: helper.basepath('emr/patientemr/symptomnotes/symptomnotes-list.html'),
            controller: 'SymptomNotesListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/symptomnotes/symptomnotes-list.js'));
                }]
            }
        })
        .state('patientemr.dischargesummarytab', {
            url: '/dischargesummarytab/',
            title: 'dischargesummarytab',
            templateUrl: helper.basepath('emr/patientemr/dischargesummary/dischargesummarytab.html'),
            controller: 'DischargeSummaryTabController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/dischargesummary/dischargesummarytab.js'));
                }]
            }
        })
        .state('patientemr.dischargesummarytab.dischargesummarycurrentvisit', {
            url: '/dischargesummary/:id',
            title: 'Dischargeform',
            templateUrl: helper.basepath('emr/patientemr/dischargesummary/dischargesummary-form.html'),
            controller: 'emrdischargesummaryFormController as vm',
            params: {
                id: '0',
                eid: 0,
                pid: 0,
                tp: 'emr',
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/dischargesummary/dischargesummary-form.js'));
                }]
            }
        })
        .state('patientemr.dischargesummarytab.dischargesummaryhistory', {
            url: '/dischargesummaryhistory/:id',
            title: 'Dischargehistory',
            templateUrl: helper.basepath('emr/patientemr/dischargesummary/dischargesummary-history.html'),
            controller: 'dischargesummaryListController as vm',
            params: {
                id: '0',
                eid: 0,
                pid: 0,
                tp: 'emr',
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/dischargesummary/dischargesummary-history.js'));
                }]
            }
        })
        .state('patientemr.dischargesummarytab.dischargesummaryview', {
            url: '/dischargesummaryview/:id',
            title: 'dischargesummaryview',
            templateUrl: helper.basepath('emr/patientemr/dischargesummary/dischargesummary-view.html'),
            controller: 'DischargeSummaryViewController as vm',
            params: {
                id: '0',
                eid: 0,
                pid: 0,
                tp: 'emr',
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/dischargesummary/dischargesummary-view.js'));
                }]
            }
        })
        .state('patientemr.dischargesummarytab.dischargesummarymodify', {
            url: '/dischargesummarymodify/:id',
            title: 'Dischargeform',
            templateUrl: helper.basepath('emr/patientemr/dischargesummary/dischargesummary-modify.html'),
            controller: 'dischargesummaryModifyController as vm',
            params: {
                eid: 0,
                pid: 0,
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/dischargesummary/dischargesummary-modify.js'));
                }]
            }
        })
        .state('patientemr.pmhxdashboard', {
            url: '/pmhxdashboard',
            title: 'PMHx Dashboard',
            templateUrl: helper.basepath('emr/patientemr/pmhxdashboard/pmhxdashboard.html'),
            controller: 'pmhxDashboardController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(
                        [helper.basepath('emr/patientemr/pmhxdashboard/pmhxdashboard.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/allergy-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/appointment-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/clinicalorders-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/condition-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/diet-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/document-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/familycondition-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/familysocialhistory-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/immunization-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/labresult-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/medication-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/prescription-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/procedure-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/radiology-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/socialhistory-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/surgical-section.js'),
                            helper.basepath('emr/patientemr/pmhxdashboard/sections/vital-section.js')
                        ]);
                }],
            }
        })
        .state('patientemr.clinicalimages', {
            url: '/ClinicalImages',
            title: 'Clinical Images',
            templateUrl: helper.basepath('emr/patientemr/clinical_images/clinical-images.html'),
            controller: 'ClinicalImagesListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/clinical_images/clinical-images.js'));
                }]
            }
        })
        .state('patientemr.ipcasesheetsummary', {
            url: '/ipcasesheetsummary',
            title: 'ipcasesheetsummary',
            templateUrl: helper.basepath('emr/patientemr/ipcasesheetsummary/ipcasesheetsummary.html'),
            controller: 'ipcasesheetsummaryController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(
                        [helper.basepath('emr/patientemr/ipcasesheetsummary/ipcasesheetsummary.js'),
                            helper.basepath('emr/patientemr/ipcasesheetsummary/sections/condition-section.js'),
                            helper.basepath('emr/patientemr/ipcasesheetsummary/sections/vital-section.js'),
                            helper.basepath('emr/patientemr/ipcasesheetsummary/sections/doctornotes-section.js'),
                            helper.basepath('emr/patientemr/ipcasesheetsummary/sections/nursenotes-section.js')
                        ]);
                }],
            }
        })
        .state('patientemr.diagnosistab', {
            url: '/diagnosistab/',
            title: 'diagnosistab',
            templateUrl: helper.basepath('emr/patientemr/patientdiagnosis/patientdiagnosistab.html'),
            controller: 'PatientDiagnosisTabController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientdiagnosis/patientdiagnosistab.js'));
                }]
            }
        })
        .state('patientemr.patientnotifiablediseases', {
            url: '/patientnotifiablediseases/',
            title: 'Patient Notifiable Diseases',
            templateUrl: helper.basepath('emr/patientemr/patientnotifiablediseases/patientnotifiablediseases.html'),
            controller: 'patientnotifiablediseasesListController as vm',
            params: {
                context: '',
                pid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientnotifiablediseases/patientnotifiablediseases.js'));
                }]
            }
        })
        .state('patientemr.diagnosistab.patientdiagnosiscurrentlist', {
            url: '/patientdiagnosiscurrentlist/',
            title: 'Patient Diagnosis',
            templateUrl: helper.basepath('emr/patientemr/patientdiagnosis/patientdiagnosis-currentlistlist.html'),
            controller: 'patientDiagnosisListController as vm',
            params: {
                context: '',
                pid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientdiagnosis/patientdiagnosis-currentlistlist.js'));
                }]
            }
        })
        .state('patientemr.diagnosistab.diagnosishistory', {
            url: '/diagnosishistory/',
            title: 'Patient Diagnosis',
            templateUrl: helper.basepath('emr/patientemr/patientdiagnosis/patientdiagnosis-history.html'),
            controller: 'PreDiagnosisHistoryController as vm',
            params: {
                context: '',
                pid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientdiagnosis/patientdiagnosis-history.js'));
                }]
            }
        })
        .state('patientemr.diagnosistab.favoritediagnosis', {
            url: '/favoritediagnosis/',
            title: 'Favorite Diagnosis',
            templateUrl: helper.basepath('emr/patientemr/patientdiagnosis/favoritediagnosis.html'),
            controller: 'FavoriteDiagnosisController as vm',
            params: {
                context: '',
                pid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientdiagnosis/favoritediagnosis.js'));
                }]
            }
        })
        .state('patientemr.prescribetab', {
            url: '/prescribetab/',
            title: 'prescribetab',
            params: {
                pid: null,
                eid: null,
                context: '',
                from: ''
            },
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/prescription/prescriptiontab.html'),
            controller: 'PrescribeTabController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/prescription/prescriptiontab.js'));
                }]
            }
        })
        .state('patientemr.prescribetab.rxprescriptions', {
            url: '/prescribetab/rxprescriptions/',
            title: 'rxprescriptions',
            params: {
                pid: null,
                eid: null,
                context: '',
                id: null,
                cid: null,
                details: 0,
                from: ''
            },
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/prescription/Rx-Prescription.html'),
            controller: 'PrescriptionRxController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/prescription/Rx-Prescription.js'));
                }]
            }
        })
        .state('patientemr.prescribetab.pastprescription', {
            url: '/prescribetab/pastprescription/',
            title: 'pastprescription',
            params: {
                pid: null,
                eid: null,
                context: '',
                from: ''
            },
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/prescription/PastPrescriptions.html'),
            controller: 'PastPrescriptionController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/prescription/PastPrescriptions.js'));
                }]
            }
        })
        .state('patientemr.prescribetab.currentprescription', {
            url: '/prescribetab/currentprescription/',
            title: 'currentprescription',
            params: {
                pid: null,
                eid: null,
                context: '',
                from: ''
            },
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/prescription/currentprescriptionlist.html'),
            controller: 'CurrentPrescriptionController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/prescription/currentprescriptionlist.js'));
                }]
            }
        })
        .state('patientemr.prescribetab.favprecriptions', {
            url: 'prescribetab/favprecriptions/',
            title: 'rxprescriptions',
            params: {
                pid: null,
                eid: null,
                context: '',
                id: null,
                from: ''
            },
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/prescription/favoriteprescriptions.html'),
            controller: 'PrescriptionFavController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/prescription/favoriteprescriptions.js'));
                }]
            }
        })
        .state('patientemr.consultationtab', {
            url: '/consultationtab',
            title: 'consultationtab',
            templateUrl: helper.basepath('emr/patientemr/consultations/consultationnotetab.html'),
            controller: 'ConsultationNoteTabController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: '',
                type: '',
                doctor: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/consultations/consultationnotetab.js'));
                }]
            }
        })
        .state('patientemr.consultationtab.consultationcurrentlist', {
            url: '/consultationcurrentlist',
            title: 'consultationcurrentlist',
            templateUrl: helper.basepath('emr/patientemr/consultations/consultation-currentvisit.html'),
            controller: 'consultationCurrentListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: '',
                type: '',
                doctor: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/consultations/consultation-currentvisit.js'));
                }]
            }
        })
        .state('patientemr.consultationtab.consultationpreviouslist', {
            url: '/consultationpreviouslist',
            title: 'consultationpreviouslist',
            templateUrl: helper.basepath('emr/patientemr/consultations/consultation-previousvisit.html'),
            controller: 'consultationPreviousListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: '',
                type: '',
                doctor: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/consultations/consultation-previousvisit.js'));
                }]
            }
        })
        .state('patientemr.consultation', {
            url: '/consultation/:id',
            title: 'Consultation',
            templateUrl: helper.basepath('emr/patientemr/consultations/consultation.html'),
            controller: 'consultationController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                details: 0,
                from: '',
                isivf: null
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(
                        [helper.basepath('emr/patientemr/consultations/consultation.js'),
                            helper.basepath('emr/patientemr/consultations/sections/allergy/cn-allergy-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/chiefcomplaint/cn-chiefcomplaint-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/question/cn-question-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/condition/cn-condition-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/procedure/cn-procedure-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/document/cn-document-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/familycondition/cn-familycondition-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/socialhistory/cn-socialhistory-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/familysocialhistory/cn-familysocialhistory-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/immunization/cn-immunization-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/vital/cn-vital-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/prescription/cn-prescription-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/order/cn-order-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/labresults/cn-labresults-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/previousnotes/previousnotes.js'),
                            helper.basepath('emr/patientemr/consultations/sections/radiologyresults/cn-radiologyresults-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/dietplan/cn-dietplan-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/followup/cn-followup-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/diagnosis/cn-diagnosis-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/reviewnotes/reviewnotes.js'),
                            helper.basepath('emr/patientemr/consultations/sections/annotations/cn-annotation-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/rheumatology/cn-rheumatology-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/admissionmlc/cn-mlc-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/historycomplaints/cn-historyandcomplaints-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/examinationsystem/cn-examinationsystem-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/lensprescribe/cn-lensprescribe-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/surgeryadvice/cn-surgeryadvice-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/injectionadvice/cn-injectionadvice-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/laseradvice/cn-laseradvice-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/clinicalnotes/cn-clinicalnotes-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/advicemedications/cn-advicemedications-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/treatmentplan/cn-treatmentplan-section.js'),
                            helper.basepath('emr/patientemr/consultations/sections/procedureorders/cn-procedureorders-section.js'),
                        ]);
                }]
            }
        })
        .state('patientemr.toothcharttab', {
            url: '/ToothCharttab/:id',
            title: 'Tooth Chart',
            templateUrl: helper.basepath('emr/toothchart/toothchart-tab.html'),
            controller: 'ToothChartTabController as vm',
            params: {
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/toothchart/toothchart-tab.js'));
                }]
            }
        })
        .state('patientemr.toothcharttab.toothchart', {
            url: '/ToothChart/:id',
            title: 'Tooth Chart',
            templateUrl: helper.basepath('emr/toothchart/toothchart.html'),
            controller: 'ToothChartController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/toothchart/toothchart.js'));
                }]
            }
        })
        .state('patientemr.patientvitaltab', {
            url: '/patientvitaltab',
            title: 'patientvitaltab',
            templateUrl: helper.basepath('emr/patientemr/patientvitals/patientvitaltab.html'),
            controller: 'PatientVitalTabController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientvitals/patientvitaltab.js'));
                }]
            }
        })
        .state('patientemr.patientvitaltab.patientvital', {
            url: '/patientvitaltab/patientvital/:pid/:id',
            title: 'Patient Vital',
            templateUrl: helper.basepath('emr/patientemr/patientvitals/patientvital-form.html'),
            controller: 'patientVitalFormController as vm',
            params: {
                context: '',
                gid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientvitals/patientvital-form.js'));
                }]
            }
        })
        .state('patientemr.patientvitaltab.previousvitals', {
            url: '/patientvitaltab/previousvitals/',
            title: 'Patient Vitals',
            templateUrl: helper.basepath('emr/patientemr/patientvitals/previousvisitvitals.html'),
            controller: 'PreviousVitalController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientvitals/previousvisitvitals.js'));
                }]
            }
        })
        .state('patientemr.patientvitaltab.patientvitals', {
            url: '/patientvitaltab/patientvitals/',
            title: 'Patient Vitals',
            templateUrl: helper.basepath('emr/patientemr/patientvitals/patientvital-list.html'),
            controller: 'patientVitalListController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientvitals/patientvital-list.js'));
                }]
            }
        })
        .state('patientemr.patientvitaltab.patientvitalchart', {
            url: '/patientvitaltab/patientvitalchart/',
            title: 'Patient Vitals',
            templateUrl: helper.basepath('emr/patientemr/patientvitals/patientvitalchartview.html'),
            controller: 'patientVitalChartviewController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientvitals/patientvitalchartview.js'));
                }]
            }
        })
        .state('patientemr.symptomnoteslist', {
            url: '/symptomnoteslist/',
            title: 'symptomnoteslist',
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/symptomnotes/symptomnotes-list.html'),
            controller: 'SymptomNotesListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/symptomnotes/symptomnotes-list.js'));
                }]
            }
        })
        .state('patientemr.nursingnotestab', {
            url: '/nursingnotestab',
            title: 'Daily Progress Notes',
            templateUrl: helper.basepath('emr/patientemr/dailynotes/nursingnotestab.html'),
            controller: 'NursingNotesTabController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/dailynotes/nursingnotestab.js'));
                }]
            }
        })
        .state('patientemr.nursingnotestab.nursingnotescurrentlist', {
            url: '/nursingnotescurrentlist/:id',
            title: 'Daily Progress Current Visit',
            templateUrl: helper.basepath('emr/patientemr/dailynotes/nursingnotes-currentvisit.html'),
            controller: 'NursingNotescurrentListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/dailynotes/nursingnotes-currentvisit.js'));
                }]
            }
        })
        .state('patientemr.nursingnotestab.nursingnotespreviouslist', {
            url: '/nursingnotespreviouslist/:id',
            title: 'Daily Progress Previous Visit',
            templateUrl: helper.basepath('emr/patientemr/dailynotes/nursingnotes-previousvisit.html'),
            controller: 'NursingNotesPreviousListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/dailynotes/nursingnotes-previousvisit.js'));
                }]
            }
        })
        .state('patientemr.doctornotestab', {
            url: '/doctornotestab',
            title: 'Daily Progress Notes',
            templateUrl: helper.basepath('emr/patientemr/dailynotes/doctornotestab.html'),
            controller: 'DoctorNotesTabController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/dailynotes/doctornotestab.js'));
                }]
            }
        })
        .state('patientemr.doctornotestab.doctornotescurrentlist', {
            url: '/doctornotescurrentlist/:id',
            title: 'Daily Progress Notes',
            templateUrl: helper.basepath('emr/patientemr/dailynotes/doctornotes-currentvisit.html'),
            controller: 'DoctorNotescurrentListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/dailynotes/doctornotes-currentvisit.js'));
                }]
            }
        })
        .state('patientemr.doctornotestab.doctornotespreviouslist', {
            url: '/doctornotespreviouslist/:id',
            title: 'Daily Progress Notes',
            templateUrl: helper.basepath('emr/patientemr/dailynotes/doctornotes-previousvisit.html'),
            controller: 'DoctorNotesPreviousListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/dailynotes/doctornotes-previousvisit.js'));
                }]
            }
        })
        .state('patientemr.ivfnotestab', {
            url: '/ivfnotestab',
            title: 'Daily Progress Notes',
            templateUrl: helper.basepath('emr/patientemr/ivfnotes/ivfnotestab.html'),
            controller: 'IVFNotesTabController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ivfnotes/ivfnotestab.js'));
                }]
            }
        })
        .state('patientemr.ivfnotestab.ivfnotescurrentlist', {
            url: '/ivfnotescurrentlist/:id',
            title: 'Daily Progress Notes',
            templateUrl: helper.basepath('emr/patientemr/ivfnotes/ivfnotes-currentvisit.html'),
            controller: 'IVFNotescurrentListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ivfnotes/ivfnotes-currentvisit.js'));
                }]
            }
        })
        .state('patientemr.ivfnotestab.ivfspousenotes', {
            url: '/ivfspousenotes/:id',
            title: 'Daily Progress Notes',
            templateUrl: helper.basepath('emr/patientemr/ivfnotes/ivfspousenotes.html'),
            controller: 'IVFConsultationNotesspouseListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ivfnotes/ivfspousenotes.js'));
                }]
            }
        })
        .state('patientemr.ivfnotestab.ivfnotespreviouslist', {
            url: '/ivfnotespreviouslist/:id',
            title: 'Daily Progress Notes',
            templateUrl: helper.basepath('emr/patientemr/ivfnotes/ivfnotes-previousvisit.html'),
            controller: 'DoctorNotesPreviousListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ivfnotes/ivfnotes-previousvisit.js'));
                }]
            }
        })
        .state('patientemr.ivfconsultationnotescurrentlist', {
            url: '/ivfconsultationnotescurrentlist/:id',
            title: 'Daily Progress Notes',
            templateUrl: helper.basepath('emr/patientemr/ivfnotes/ivfconsultationnotes-currentvisit.html'),
            controller: 'IVFConsultationNotescurrentListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ivfnotes/ivfconsultationnotes-currentvisit.js'));
                }]
            }
        })
        .state('patientemr.summarynotetab', {
            url: '/summarynotetab',
            title: 'summarynotetab',
            templateUrl: helper.basepath('emr/patientemr/patientdashboard/summarynotetab.html'),
            controller: 'SummaryNoteTabController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: '',
                type: '',
                doctor: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientdashboard/summarynotetab.js'));
                }]
            }
        })
        .state('patientemr.summarynotetab.patientdashboard', {
            url: '/patientdashboard',
            title: 'Patient Dashboard',
            templateUrl: helper.basepath('emr/patientemr/patientdashboard/patientdashboard.html'),
            controller: 'patientDashboardController as vm',
            params: {
                eid: null,
                pid: null,
                context: '',
                from: '',
                profile: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(
                        [helper.basepath('emr/patientemr/patientdashboard/patientdashboard.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/allergy-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/appointment-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/clinicalorders-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/condition-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/diet-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/document-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/familycondition-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/familysocialhistory-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/immunization-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/labresult-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/medication-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/prescription-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/procedure-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/radiology-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/socialhistory-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/surgical-section.js'),
                            helper.basepath('emr/patientemr/patientdashboard/sections/vital-section.js')
                        ]);
                }],
            }
        })
        .state('patientemr.dischargesummarys', {
            url: '/dischargesummarys',
            title: 'DischargeSummarys',
            templateUrl: helper.basepath('emr/medicalcertificate/dischargesummary/dischargesummary-list.html'),
            controller: 'dischargesummaryListController as vm',
            params: {
                id: '0',
                eid: 0,
                pid: 0,
                tp: 'emr',
                context: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/dischargesummary/dischargesummary-list.js'));
                }]
            }
        })
        .state('patientemr.dischargesummary', {
            url: '/dischargesummary/:id',
            title: 'Dischargeform',
            templateUrl: helper.basepath('emr/medicalcertificate/dischargesummary/dischargesummary-form.html'),
            controller: 'dischargesummaryFormController as vm',
            params: {
                id: '0',
                eid: 0,
                pid: 0,
                tp: 'emr',
                context: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/dischargesummary/dischargesummary-form.js'));
                }]
            }
        })
        .state('patientemr.dischargecasesheets', {
            url: '/dischargecasesheets',
            title: 'dischargecasesheets',
            templateUrl: helper.basepath('emr/medicalcertificate/dischargecasesheet/consultation-list.html'),
            controller: 'discasshtconsultationListController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/dischargecasesheet/consultation-list.js'));
                }]
            }
        })
        .state('patientemr.dischargecasesheet', {
            url: '/dischargecasesheet/:id',
            title: 'dischargecasesheet',
            templateUrl: helper.basepath('emr/medicalcertificate/dischargecasesheet/consultation.html'),
            controller: 'discasshtconsultationController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(
                        [helper.basepath('emr/medicalcertificate/dischargecasesheet/consultation.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/allergy/cn-allergy-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/chiefcomplaint/cn-chiefcomplaint-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/question/cn-question-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/condition/cn-condition-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/procedure/cn-procedure-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/document/cn-document-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/familycondition/cn-familycondition-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/socialhistory/cn-socialhistory-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/familysocialhistory/cn-familysocialhistory-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/immunization/cn-immunization-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/vital/cn-vital-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/prescription/cn-prescription-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/order/cn-order-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/labresults/cn-labresults-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/radiologyresults/cn-radiologyresults-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/dietplan/cn-dietplan-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/followup/cn-followup-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/diagnosis/cn-diagnosis-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/reviewnotes/reviewnotes.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/annotations/cn-annotation-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/rheumatology/cn-rheumatology-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/admissionmlc/cn-mlc-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/medications/cn-medications-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/otnotes/cn-otnotes-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/advicemedications/cn-advicemedications-section.js'),
                            helper.basepath('emr/medicalcertificate/dischargecasesheet/sections/advicemedications/cn-dischargeadvicemedications-section.js'),
                        ]);
                }]
            }
        })
        .state('patientemr.ipbilldetails', {
            url: '/ipbilldetails',
            title: 'Billing Services',
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/ipbillservices/ipbill-details.html'),
            controller: 'ipbillingdetailsController as vm',
            params: {
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/ipbillservices/ipbill-details.js'));
                }]
            }
        })
        .state('patientemr.nursingcharts', {
            url: '/nursingcharts/',
            title: 'nursingcharts',
            params: {
                pid: null,
                eid: null,
                context: null,
                from: ''
            },
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/nursingcharts/nursingcharts.html'),
            controller: 'nursingchartsController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/nursingcharts/nursingcharts.js'));
                }]
            }
        })
        .state('patientemr.videoconference', {
            url: '/videoconference',
            title: 'Video Conference',
            templateUrl: helper.basepath('emr/patientemr/videoconference/videoconference.html'),
            controller: 'VideoConferenceController as vm',
            params: {
                pid: null,
                eid: null,
                context: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/videoconference/videoconference.js'));
                }]
            }
        })
        .state('patientemr.virtualbillpayment', {
            url: '/virtualbillpayment',
            title: 'Video Conference',
            templateUrl: helper.basepath('emr/patientemr/virtualbillpayment/virtualbillpayment.html'),
            controller: 'VirtualBillPaymentController as vm',
            params: {
                pid: null,
                eid: null,
                context: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/virtualbillpayment/virtualbillpayment.js'));
                }]
            }
        })
        .state('patientemr.radiologyresults', {
            url: '/radiologyresults',
            title: 'Radiology Results',
            templateUrl: helper.basepath('emr/ordermanagement/results/radiologyresult-list.html'),
            controller: 'radiologyResultListController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/ordermanagement/results/radiologyresult-list.js'));
                }]
            }
        })
        .state('patientemr.prescriptionp1', {
            url: '/prescriptionp1',
            title: 'prescriptionp1',
            templateUrl: helper.basepath('emr/patientemr/prescriptionp1/prescriptionp1.html'),
            controller: 'PrescriptionP1Controller as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/prescriptionp1/prescriptionp1.js'));
                }]
            }
        })
        .state('patientemr.prescriptionpadlist', {
            url: '/prescriptionpadlist',
            title: 'prescriptionpadlist',
            templateUrl: helper.basepath('emr/patientemr/prescriptionpad/prescriptionpadlist.html'),
            controller: 'PrescriptionPadListController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/prescriptionpad/prescriptionpadlist.js'));
                }]
            }
        })
        .state('patientemr.prescriptionpadform', {
            url: '/prescriptionpadform',
            title: 'prescriptionpadform',
            templateUrl: helper.basepath('emr/patientemr/prescriptionpad/prescriptionpadform.html'),
            controller: 'PrescriptionPadFormController as vm',
            params: {
                id: null
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/prescriptionpad/prescriptionpadform.js'));
                }]
            }
        })
        .state('patientemr.clinicaldocumenttab', {
            url: '/clinicaldocumenttab',
            title: 'clinicaldocumenttab',
            templateUrl: helper.basepath('emr/patientemr/clinicaldocuments/clinicaldocumenttab.html'),
            controller: 'ClinicalDocumentTabController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/clinicaldocuments/clinicaldocumenttab.js'));
                }]
            }
        })
        .state('patientemr.clinicaldocumenttab.clinicaldocumentcurrentlist', {
            url: '/clinicaldocumenttab/clinicaldocumentcurrentlist/',
            title: 'Current Visit',
            templateUrl: helper.basepath('emr/patientemr/clinicaldocuments/clinicaldocuments-currentlist.html'),
            controller: 'ClinicalDocumentCurrentListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/clinicaldocuments/clinicaldocuments-currentlist.js'));
                }]
            }
        })
        .state('patientemr.clinicaldocumenttab.clinicaldocumentpreviouslist', {
            url: '/clinicaldocumenttab/clinicaldocumentpreviouslist',
            title: 'Previous Visit',
            templateUrl: helper.basepath('emr/patientemr/clinicaldocuments/clinicaldocuments-previouslist.html'),
            controller: 'ClinicalDocumentPreviousListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/clinicaldocuments/clinicaldocuments-previouslist.js'));
                }]
            }
        })
        .state('patientemr.physiotheraphytab', {
            url: '/physiotheraphytab',
            title: 'physiotheraphytab',
            templateUrl: helper.basepath('emr/patientemr/physiotheraphytreatement/physiotheraphytab.html'),
            controller: 'PhysiotheraphyTabController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/physiotheraphytreatement/physiotheraphytab.js'));
                }]
            }
        })
        .state('patientemr.physiotheraphytab.physiotheraphycurrentlist', {
            url: '/physiotheraphycurrentlist/',
            title: 'Physiotherapy Treatement',
            templateUrl: helper.basepath('emr/patientemr/physiotheraphytreatement/physiotheraphytreatement-currentlist.html'),
            controller: 'PhysiotheraphycurrentlistController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/physiotheraphytreatement/physiotheraphytreatement-currentlist.js'));
                }]
            }
        })
        .state('patientemr.physiotheraphytab.physiotheraphypreviouslist', {
            url: '/physiotheraphypreviouslist/',
            title: 'Physiotherapy Treatement',
            templateUrl: helper.basepath('emr/patientemr/physiotheraphytreatement/physiotheraphytreatement-previouslist.html'),
            controller: 'PhysiotheraphyprevioruslistController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/physiotheraphytreatement/physiotheraphytreatement-previouslist.js'));
                }]
            }
        })
        .state('patientemr.referralfollowuptab', {
            url: '/referralfollowuptab',
            title: 'referralfollowuptab',
            templateUrl: helper.basepath('emr/patientemr/referralfollowup/referralfollowuptab.html'),
            controller: 'ReferralFollowupTabController as vm',
            params: {
                context: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/referralfollowup/referralfollowuptab.js'));
                }]
            }
        })
        .state('patientemr.referralfollowuptab.referralfollowup', {
            url: '/referralfollowuptab/referralfollowup',
            title: 'referralfollowup',
            templateUrl: helper.basepath('emr/patientemr/referralfollowup/referralfollowup.html'),
            controller: 'ReferralFollowupController as vm',
            params: {
                context: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/referralfollowup/referralfollowup.js'));
                }]
            }
        })
        .state('patientemr.referralfollowuptab.currentreferrallist', {
            url: '/referralfollowuptab/currentreferrallist',
            title: 'currentreferrallist',
            templateUrl: helper.basepath('emr/patientemr/referralfollowup/currentreferrallist.html'),
            controller: 'ReferralFollowupcurrentreferrallistController as vm',
            params: {
                context: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/referralfollowup/currentreferrallist.js'));
                }]
            }
        })
        .state('patientemr.referralfollowuptab.prevreferrallist', {
            url: '/referralfollowuptab/prevreferrallist',
            title: 'prevreferrallist',
            templateUrl: helper.basepath('emr/patientemr/referralfollowup/prevreferrallist.html'),
            controller: 'ReferralFollowupprevreferrallistController as vm',
            params: {
                context: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/referralfollowup/prevreferrallist.js'));
                }]
            }
        })
        .state('patientemr.clinicalordertab', {
            url: '/clinicalordertab',
            title: 'clinicalordertab',
            templateUrl: helper.basepath('emr/patientemr/clinicalorders/clinicalordertab.html'),
            controller: 'ClinicalOrdeerTabController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/clinicalorders/clinicalordertab.js'));
                }]
            }
        })
        .state('patientemr.clinicalordertab.clinicalorders', {
            url: '/clinicalorders/addorders',
            title: 'Clinical New Order',
            templateUrl: helper.basepath('emr/patientemr/clinicalorders/clinicalorders.html'),
            controller: 'ClinicalOrdersController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                cid: null,
                orddetails: 0,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/clinicalorders/clinicalorders.js'));
                }]
            }
        })
        .state('patientemr.clinicalordertab.currentlist', {
            url: '/clinicalordertab/currentlist',
            title: 'Clinical Current List',
            templateUrl: helper.basepath('emr/patientemr/clinicalorders/currentorderlist.html'),
            controller: 'clinicalordersCurrentListController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/clinicalorders/currentorderlist.js'));
                }]
            }
        })
        .state('patientemr.clinicalordertab.favorders', {
            url: '/clinicalordertab/favorders',
            title: 'Favorite Orders',
            templateUrl: helper.basepath('emr/patientemr/clinicalorders/favoriteorders.html'),
            controller: 'FavoriteOrdersController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/clinicalorders/favoriteorders.js'));
                }]
            }
        })
        .state('patientemr.clinicalordertab.history', {
            url: '/clinicalordertab/history',
            title: 'Clinical History',
            templateUrl: helper.basepath('emr/patientemr/clinicalorders/previousorders.html'),
            controller: 'clinicalordersHistoryController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/clinicalorders/previousorders.js'));
                }]
            }
        })
        .state('patientemr.procedureordertab', {
            url: '/procedureordertab/',
            title: 'procedureordertab',
            templateUrl: helper.basepath('emr/patientemr/procedureorders/procedureordertab.html'),
            controller: 'ProcedureOrderTabController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/procedureorders/procedureordertab.js'));
                }]
            }
        })
        .state('patientemr.procedureordertab.procedureorders', {
            url: '/procedureordertab/procedureorders/',
            title: 'Procedure Order',
            templateUrl: helper.basepath('emr/patientemr/procedureorders/procedureorders.html'),
            controller: 'ProcedureOrdersController as vm',
            params: {
                context: '',
                orddetails: 0,
                cid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/procedureorders/procedureorders.js'));
                }]
            }
        })
        .state('patientemr.procedureordertab.favoriteorders', {
            url: '/procedureordertab/favoriteorders/',
            title: 'Procedure New Order',
            templateUrl: helper.basepath('emr/patientemr/procedureorders/favoriteorders.html'),
            controller: 'ProcedureFavoriteOrdersController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/procedureorders/favoriteorders.js'));
                }]
            }
        })
        .state('patientemr.procedureordertab.currentlist', {
            url: '/procedureordertab/currentlist',
            title: 'Procedureorder Current List',
            templateUrl: helper.basepath('emr/patientemr/procedureorders/currentprocedureorders.html'),
            controller: 'CurrentProcedureOrderController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/procedureorders/currentprocedureorders.js'));
                }]
            }
        })
        .state('patientemr.procedureordertab.history', {
            url: '/procedureordertab/history',
            title: 'Procedureorder History',
            templateUrl: helper.basepath('emr/patientemr/procedureorders/previousprocedureorders.html'),
            controller: 'ProcedureordersHistoryController as vm',
            params: {
                context: '',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/procedureorders/previousprocedureorders.js'));
                }]
            }
        })
        .state('patientemr.notefavorate', {
            url: '/notefavorate',
            title: 'Favorite Orders',
            templateUrl: helper.basepath('consultations/sections/cn-favoriteorders.html'),
            controller: 'CNFavoriteOrdersController as vm',
            params: {
                context: '',
                pid: null,
                eid: null
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('consultations/sections/cn-favoriteorders.js'));
                }]
            }
        })
        .state('patientemr.emartab', {
            url: '/emartab/',
            title: 'eMAR',
            templateUrl: helper.basepath('emr/patientemr/emar/emartab.html'),
            controller: 'emarTabController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/emar/emartab.js'));
                }]
            }
        })
        .state('patientemr.emartab.emar', {
            url: 'emartab/Prescribed eMAR/',
            title: 'Prescribed eMAR',
            templateUrl: helper.basepath('emr/patientemr/emar/emar.html'),
            controller: 'emarController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/emar/emar.js'));
                }]
            }
        })
        .state('patientemr.emartab.emarview', {
            url: 'emartab/Prescribed eMAR View/',
            title: 'Prescribed eMAR Administer',
            templateUrl: helper.basepath('emr/patientemr/emar/emar-view.html'),
            controller: 'emarviewController as vm',
            params: {
                context: '',
                pid: null,
                presid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/emar/emar-view.js'));
                }]
            }
        })

        .state('patientemr.labresultview', {
            url: '/labresultview',
            title: 'Lab Results',
            templateUrl: helper.basepath('emr/patientemr/labresults/labresult-list.html'),
            controller: 'labResultViewController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/labresults/labresult-list.js'));
                }]
            }
        })

        .state('patientemr.reviewnotes', {
            url: '/reviewnotes/',
            title: 'Review Notes',
            templateUrl: helper.basepath('emr/patientemr/consultations/sections/reviewnotes/reviewnotes.html'),
            controller: 'reviewNotesController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/consultations/sections/reviewnotes/reviewnotes.js'));
                }]
            }
        })
        .state('patientemr.emrdashboard', {
            url: '/emrdashboard/:pid/:id',
            title: 'Emr Dashboard',
            params: {
                pid: null,
                eid: null,
                context: null,
            },
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/emrdashboard.html'),
            controller: 'emrdashboardFormController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/emrdashboard.js'));
                }]
            }
        })


    .state('patientemr.pastvisits-list', {
            url: '/pastvisits/',
            title: 'pastvisits',
            params: {
                pid: null,
                eid: null,
                context: null,
            },
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/pastvisits/pastvisits.html'),
            controller: 'PastVisitsController as vm',
            params: {
                context: 'main'
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/pastvisits/pastvisits.js'));
                }]
            }
        })
        .state('patientemr.mrdfilesattachments', {
            url: '/mrdfilesattachments/',
            title: 'mrdfilesattachments',
            params: {
                pid: null,
                eid: null,
                context: null,
            },
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/mrdfiles/mrdfilesattachments.html'),
            controller: 'MRDfilesAttachmentlistController as vm',
            params: {
                context: 'main'
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/mrdfiles/mrdfilesattachments.js'));
                }]
            }
        })
        .state('patientemr.emrotregisters', {
            url: '/emrotregisters/',
            title: 'emrotregisters',
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/emrotregister/emrotregisters.html'),
            controller: 'OtRegisterNotesController as vm',
            params: {
                context: 'dashboard',
                pid: null,
                eid: null,
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/emrotregister/emrotregisters.js'));
                }]
            }
        })
        .state('patientemr.medicinerequest', {
            url: '/medicinerequest',
            title: 'Medicine Request',
            templateUrl: helper.basepath('inpatient/patientrequest/patientrequests-list.html'),
            controller: 'patientRequestListController as vm',
            params: {
                tp: 'emr'
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('inpatient/patientrequest/patientrequests-list.js'));
                }]
            }
        })
        .state('patientemr.medicinerequestform', {
            url: '/medicinerequest/:id',
            title: 'Medicine Request',
            templateUrl: helper.basepath('inpatient/patientrequest/patientrequest-form.html'),
            controller: 'patientRequestFormController as vm',
            params: {
                tp: 'emr'
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('inpatient/patientrequest/patientrequest-form.js'));
                }]
            }
        })
        .state('patientemr.patientindent', {
            url: '/patientindent',
            title: 'Patient Indent',
            templateUrl: helper.basepath('emr/patientemr/patientindent/patientindent-list.html'),
            controller: 'patientIndentListController as vm',
            params: {
                tp: 'emr',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientindent/patientindent-list.js'));
                }]
            }
        })
        .state('patientemr.patientindentform', {
            url: '/patientindentform/:id',
            title: 'Patient Indent',
            templateUrl: helper.basepath('emr/patientemr/patientindent/patientindent-form.html'),
            controller: 'patientIndentFormController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientindent/patientindent-form.js'));
                }]
            }
        })
        .state('patientemr.localwellmedicineorder', {
            url: '/localwellmedicineorder',
            title: 'Local Well Medicine Order',
            templateUrl: helper.basepath('emr/patientemr/localwellmedicineorder/localwellmedicineorder-list.html'),
            controller: 'localwellmedicineorderListController as vm',
            params: {
                tp: 'emr',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/localwellmedicineorder/localwellmedicineorder-list.js'));
                }]
            }
        })
        .state('patientemr.localwellmedicineorderform', {
            url: '/localwellmedicineorderform/:id',
            title: 'Local Well Medicine Order',
            templateUrl: helper.basepath('emr/patientemr/localwellmedicineorder/localwellmedicineorder-form.html'),
            controller: 'localwellmedicineorderFormController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/localwellmedicineorder/localwellmedicineorder-form.js'));
                }]
            }
        })
        .state('patientemr.patientreceive', {
            url: '/patientreceive',
            title: 'Patient Indent',
            templateUrl: helper.basepath('emr/patientemr/patientindent/patientreceive-list.html'),
            controller: 'patientReceiveListController as vm',
            params: {
                tp: 'emr',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientindent/patientreceive-list.js'));
                }]
            }
        })
        .state('patientemr.patientreceiveform', {
            url: '/patientreceiveform/:id',
            title: 'Patient Receive',
            templateUrl: helper.basepath('emr/patientemr/patientindent/patientreceive-form.html'),
            controller: 'patientReceiveFormController as vm',
            params: {
                id: null,
                eid: null,
                pid: null,
                PatientRequestStatusId: null
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientindent/patientreceive-form.js'));
                }]
            }
        })
        .state('patientemr.patientreturn', {
            url: '/patientreturn',
            title: 'Patient Return',
            templateUrl: helper.basepath('emr/patientemr/patientreturn/patientreturn-list.html'),
            controller: 'patientreturnListController as vm',
            params: {
                tp: 'emr'
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientreturn/patientreturn-list.js'));
                }]
            }
        })
        .state('patientemr.patientreturnform', {
            url: '/patientreturnform/:id',
            title: 'Patient Return',
            templateUrl: helper.basepath('emr/patientemr/patientreturn/patientreturn-form.html'),
            controller: 'patientreturnFormController as vm',
            params: {
                tp: 'emr'
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientreturn/patientreturn-form.js'));
                }]
            }
        })
        .state('patientemr.medicinereturns', {
            url: '/medicinereturn',
            title: 'Medicine Return',
            templateUrl: helper.basepath('inpatient/patientreturns/patientreturns-list.html'),
            controller: 'PatientReturnsListController as vm',
            params: {
                tp: 'emr',
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('inpatient/patientreturns/patientreturns-list.js'));
                }]
            }
        })
        .state('patientemr.medicinereturn', {
            url: '/medicinereturn',
            title: 'Medicine Return',
            templateUrl: helper.basepath('inpatient/patientreturns/patientreturns-form.html'),
            controller: 'PatientReturnFormController as vm',
            params: {
                tp: 'emr',
                id: null,
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('inpatient/patientreturns/patientreturns-form.js'));
                }]
            }
        })
        // .state('app.abgparameters', {
        //     url: '/abgparameters',
        //     title: 'abgparameters',
        //     templateUrl: helper.basepath('emr/clinicalmaster/abgparameters/abgparameters-list.html'),
        //     controller: 'ABGParameterListController as vm',
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('emr/clinicalmaster/abgparameters/abgparameters-list.js'));
        //         }]
        //     }
        // })
        // .state('app.appointmentrequest', {
        //     url: '/app/appointmentrequest',
        //     title: 'appointmentrequest',
        //     templateUrl: helper.basepath('emr/appointment/appointmentrequest/appointmentrequest-list.html'),
        //     controller: 'appointmentReqListController as vm',
        //     params: {
        //         id: 0
        //     },
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('emr/appointment/appointmentrequest/appointmentrequest-list.js'));
        //         }]
        //     }
        // })
        .state('patientemr.patientiddocuments', {
            url: '/patientiddocuments',
            title: 'patientiddocuments',
            templateUrl: helper.basepath('emr/patientemr/patientIddocuments/patientiddocuments.html'),
            controller: 'PatientIddocumentsController as vm',
            params: {
                id: 0
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientIddocuments/patientiddocuments.js'));
                }]
            }
        })
        .state('patientemr.treatmentplanupdate', {
            url: '/treatmentplanupdate',
            title: 'treatmentplanupdate',
            templateUrl: helper.basepath('emr/patientemr/treatmentplan/treatmentplanupdate.html'),
            controller: 'TreatmentPlanUpdateController as vm',
            params: {
                id: 0,
                pid: 0,
                eid: 0
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/treatmentplan/treatmentplanupdate.js'));
                }]
            }
        })
        .state('patientemr.treatmentplan', {
            url: '/treatmentplan',
            title: 'treatmentplan',
            templateUrl: helper.basepath('emr/patientemr/treatmentplan/treatmentplan.html'),
            controller: 'treatmentplanController as vm',
            params: {
                id: 0,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/treatmentplan/treatmentplan.js'));
                }]
            }
        })
        .state('patientemr.lensprescription', {
            url: '/lensprescription',
            title: 'lensprescription',
            templateUrl: helper.basepath('emr/patientemr/lensprescription/lensprescription.html'),
            controller: 'lensprescriptionController as vm',
            params: {
                id: 0,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/lensprescription/lensprescription.js'));
                }]
            }
        })
        .state('patientemr.lensprescriptionform', {
            url: '/lensprescription',
            title: 'lensprescription',
            templateUrl: helper.basepath('emr/patientemr/lensprescription/lensprescriptionform.html'),
            controller: 'lensprescriptionControllerform as vm',
            params: {
                id: 0
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/lensprescription/lensprescriptionform.js'));
                }]
            }
        })
        .state('patientemr.bloodbanks', {
            url: '/bloodbanks',
            title: 'Blood Banks',
            templateUrl: helper.basepath('emr/patientemr/bloodbank/bloodbanks.html'),
            controller: 'BloodBankListController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/bloodbank/bloodbanks.js'));
                }]
            }
        })
        .state('patientemr.bloodbanktab', {
            url: 'bloodbanktab/:id',
            title: 'Bloodbank',
            templateUrl: helper.basepath('emr/patientemr/bloodbank/bloodbanktab.html'),
            controller: 'BloodBankTabController as tabvm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/bloodbank/bloodbanktab.js'));
                }]
            }
        })
        .state('patientemr.bloodbanktab.bloodrequest', {
            url: 'bloodbanktab/bloodrequest:id',
            params: {
                id: null,
                eid: null
            },
            title: 'BloodRequest',
            templateUrl: helper.basepath('emr/patientemr/bloodbank/bloodbankrequest.html'),
            controller: 'BloodBankRequestController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/bloodbank/bloodbankrequest.js'));
                }]
            }
        })
        .state('patientemr.bloodbanktab.blooddonor', {
            url: 'bloodbanktab/blooddonor:id',
            params: {
                id: null,
                eid: null
            },
            title: 'DonorDetails',
            templateUrl: helper.basepath('emr/patientemr/bloodbank/blooddonordetails.html'),
            controller: 'BloodDonorDetailsController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/bloodbank/blooddonordetails.js'));
                }]
            }
        })
        .state('patientemr.bloodbanktab.bloodtransfusion', {
            url: 'bloodbanktab/bloodtransfusion:id',
            params: {
                id: null,
                eid: null
            },
            title: 'TransfusionDetails',
            templateUrl: helper.basepath('emr/patientemr/bloodbank/bloodtransfusiondetails.html'),
            controller: 'BloodTransfusionDetailsController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/bloodbank/bloodtransfusiondetails.js'));
                }]
            }
        })
        .state('patientemr.preoperativechecklists', {
            url: '/preoperativechecklist',
            title: 'Preoperative CheckList',
            templateUrl: helper.basepath('emr/patientemr/preoperativechecklist/preoperativechecklist-list.html'),
            controller: 'PreOperativeChecklistListController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/preoperativechecklist/preoperativechecklist-list.js'));
                }]
            }
        })
        .state('patientemr.preoperativechecklist', {
            url: '/preoperativechecklist/:id',
            params: {
                id: null,
                pid: null
            },
            title: 'Patient Feedback',
            templateUrl: helper.basepath('emr/patientemr/preoperativechecklist/preoperativechecklist-form.html'),
            controller: 'PreOperativeCheckListFormController as vm',
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/preoperativechecklist/preoperativechecklist-form.js'));
                }]
            }
        })
        // .state('app.patientfollowuptab', {
        //     url: '/patientfollowuptab/:id',
        //     title: '',
        //     templateUrl: helper.basepath('emr/registration/patientfollowup/patientfollowup-tab.html'),
        //     controller: 'PatientFollowupTabController as vm',
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('emr/registration/patientfollowup/patientfollowup-tab.js'));
        //         }]
        //     }
        // })
        // .state('app.patientfollowuptab.pending', {
        //     url: '/pending',
        //     title: 'pending',
        //     templateUrl: helper.basepath('emr/registration/patientfollowup/pending-list.html'),
        //     controller: 'PendingListController as vm',
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('emr/registration/patientfollowup/pending-list.js'));
        //         }]
        //     }
        // })
        // .state('app.patientfollowuptab.followup', {
        //     url: '/followup',
        //     title: 'followup',
        //     templateUrl: helper.basepath('emr/registration/patientfollowup/followup-list.html'),
        //     controller: 'FollowupListController as vm',
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('emr/registration/patientfollowup/followup-list.js'));
        //         }]
        //     }
        // })
        // .state('app.otconsumptions', {
        //     url: '/OTConsumption',
        //     title: 'OT Consumption',
        //     templateUrl: helper.basepath('emr/surgerymanagement/otconsumption/otconsumption-list.html'),
        //     controller: 'OTConsumptionListController as vm',
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otconsumption/otconsumption-list.js'));
        //         }]
        //     }
        // })
        // .state('app.otconsumption', {
        //     url: '/OTConsumption/:id',
        //     title: 'OT Consumption',
        //     templateUrl: helper.basepath('emr/surgerymanagement/otconsumption/otconsumption-form.html'),
        //     controller: 'OTConsumptionFormController as vm',
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otconsumption/otconsumption-form.js'));
        //         }]
        //     }
        // })

    .state('patientemr.orthoassesment', {
            url: 'OrthoAssesment',
            title: 'Ortho Assesment',
            templateUrl: helper.basepath('emr/patientemr/ipdashboard/orthoassesments/orthoassesment.html'),
            controller: 'orthoassesmentController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/orthoassesments/orthoassesment.js'));
                }]
            }
        })
        .state('patientemr.toothcharttab.childtoothchart', {
            url: '/ChildToothChart/:id',
            title: 'Child Tooth Chart',
            templateUrl: helper.basepath('emr/toothchart/childtooth.html'),
            controller: 'ChildToothChartController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/toothchart/childtooth.js'));
                }]
            }
        })

        .state('patientemr.emrcharttab', {
            url: '/emrcharttab',
            title: 'Emrcharttab',
            templateUrl: helper.basepath('emr/patientemr/emrcharts/emrcharttab.html'),
            controller: 'emrcharttabController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/emrcharts/emrcharttab.js'));
                }]
            }
        })
        .state('patientemr.emrcharttab.emrcharts', {
            url: '/emrcharts',
            title: 'Emr Charts',
            templateUrl: helper.basepath('emr/patientemr/emrcharts/emrcharts.html'),
            controller: 'emrchartsController as vm',
            params: {
                pid: null,
                eid: null,
                context: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/emrcharts/emrcharts.js'));
                }]
            }
        })
        .state('patientemr.positionbpcharttab', {
            url: '/positionbpcharttab',
            title: 'Position BP Chart',
            templateUrl: helper.basepath('emr/patientemr/positionbpchart/positionbpcharttab.html'),
            controller: 'PositionBpChartTabController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/positionbpchart/positionbpcharttab.js'));
                }]
            }
        })
        .state('patientemr.positionbpcharttab.positionbpchart', {
            url: '/positionbpchart',
            title: 'Position BP Chart',
            templateUrl: helper.basepath('emr/patientemr/positionbpchart/positionbpchart-list.html'),
            controller: 'PositionBpChartController as vm',
            params: {
                pid: null,
                eid: null,
                context: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/positionbpchart/positionbpchart-list.js'));
                }]
            }
        })
        .state('patientemr.positionbpcharttab.positionbpchartPrelist', {
            url: '/positionbpchart',
            title: 'Position BP Chart',
            templateUrl: helper.basepath('emr/patientemr/positionbpchart/positionbpchartPrelist.html'),
            controller: 'PositionBpChartPreListController as vm',
            params: {
                pid: null,
                eid: null,
                context: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/positionbpchart/positionbpchartPrelist.js'));
                }]
            }
        })
        .state('patientemr.cdcharttab', {
            url: '/cdcharttab',
            title: 'Cd Chart',
            templateUrl: helper.basepath('emr/patientemr/cdchart/cdcharttab.html'),
            controller: 'CdChartTabController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/cdchart/cdcharttab.js'));
                }]
            }
        })
        .state('patientemr.cdcharttab.cdchartcurrentlist', {
            url: '/cdchartcurrentlist',
            title: 'Cd Chart Chart',
            templateUrl: helper.basepath('emr/patientemr/cdchart/cdchart-currentlist.html'),
            controller: 'CdChartCurrentListController as vm',
            params: {
                pid: null,
                eid: null,
                context: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/cdchart/cdchart-currentlist.js'));
                }]
            }
        })
        .state('patientemr.cdcharttab.cdchartpreviouslist', {
            url: '/cdchartpreviouslist',
            title: 'Cd Chart Chart',
            templateUrl: helper.basepath('emr/patientemr/cdchart/cdchart-previouslist.html'),
            controller: 'CdChartProviousListController as vm',
            params: {
                pid: null,
                eid: null,
                context: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/cdchart/cdchart-previouslist.js'));
                }]
            }
        })
        .state('patientemr.diabetescharttab', {
            url: '/diabetescharttab',
            title: 'Diabetes Chart',
            templateUrl: helper.basepath('emr/patientemr/diabeteschart/diabetescharttab.html'),
            controller: 'DiabetesChartTabController as vm',
            params: {
                context: '',
                pid: null,
                eid: null,
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/diabeteschart/diabetescharttab.js'));
                }]
            }
        })
        .state('patientemr.diabetescharttab.currentlist', {
            url: '/currentlist',
            title: 'Diabetes Chart',
            templateUrl: helper.basepath('emr/patientemr/diabeteschart/currentlist.html'),
            controller: 'DiabetesChartCurrentListController as vm',
            params: {
                pid: null,
                eid: null,
                context: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/diabeteschart/currentlist.js'));
                }]
            }
        })
        .state('patientemr.diabetescharttab.previouslist', {
            url: '/previouslist',
            title: 'Diabetes Chart',
            templateUrl: helper.basepath('emr/patientemr/diabeteschart/previouslist.html'),
            controller: 'DiabetesChartPreviuosListController as vm',
            params: {
                pid: null,
                eid: null,
                context: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/diabeteschart/previouslist.js'));
                }]
            }
        })
        .state('patientemr.ipdoctortransfer', {
            url: '/ipdoctortransfer',
            title: 'Doc Transfer',
            templateUrl: helper.basepath('emr/patientemr/doctortransfer/ipdoctortransfer.html'),
            controller: 'DocTransferController as vm',
            params: {
                pid: null,
                eid: null,
                context: null,
                docId: null,
                from: ''
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/doctortransfer/ipdoctortransfer.js'));
                }]
            }
        })

        .state('patientemr.ivftreatmentplan', {
            url: '/ivftreatmentplan',
            title: 'IVF Treatement Plan',
            templateUrl: helper.basepath('emr/patientemr/ivf/ivftreatmentplan.html'),
            controller: 'ivftreatmentplanController as vm',
            params: {
                tp: 'emr',
                from: ''
            },
            resolve: {
                $uibModalInstance: function() {
                    return null;
                },
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('emr/patientemr/ivf/ivftreatmentplan.js'));
                }]
            }
        })

        .state('patientemr.ipforms', {
            url: '/ipforms',
            title: 'ipform',
            templateUrl: helper.basepath('patientportal/ipform/ipform.html'),
            controller: 'ipformController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('patientportal/ipform/ipform.js'));
                }]
            }
        })
        .state('patientemr.incidentmanagement', {
            url: '/incidentmanagement',
            title: 'incidentmanagement',
            templateUrl: helper.basepath('patientportal/incidentmanagement/incidentmanagement-list.html'),
            controller: 'emrincidentmanagementlistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('patientportal/incidentmanagement/incidentmanagement-list.js'));
                }]
            }
        })
        .state('patientemr.emrincidentmanagementlist', {
            url: '/emrincidentmanagementlist',
            title: 'emrincidentmanagementlist',
            templateUrl: helper.basepath('patientportal/incidentmanagement/incidentmanagement-list.html'),
            controller: 'emrincidentmanagementlistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('patientportal/incidentmanagement/incidentmanagement-list.js'));
                }]
            }
        })
        /*PatientEMR*/
       .state('patientemr.consultationcompare', {
        url: '/consultationcompare',
        title: 'Consultations Compare',
        params: {
            cids: null
        },
        templateUrl: helper.basepath('emr/patientemr/consultations/consultation-compare.html'),
        controller: 'consultationCompareController as vm',
        resolve: {
            $uibModalInstance: function() {
                return null;
            },
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/consultations/consultation-compare.js'));
            }]
        }
})
    .state('patientemr.labresults', {
        url: '/labresults',
        title: 'Lab Results',
        templateUrl: helper.basepath('emr/ordermanagement/results/labresult-list.html'),
        controller: 'labResultListController as vm',
        params: {
            context: '',
            from: ''
        },
        resolve: {
            $uibModalInstance: function() {
                return null;
            },
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/ordermanagement/results/labresult-list.js'));
            }]
        }
    })
    .state('patientemr.emrworkspace', {
        url: '/emrworkspace',
        title: 'Electronic Medical Records',
        templateUrl: helper.basepath('emr/patientemr/emrworkspace/emrworkspace.html'),
        controller: 'emrWorkspaceController',
        // pid / eid are inherited from the parent 'patientemr' state (do not redeclare them here).
        params: {
            cid: null,
            tab: '',
            context: ''
        },
        resolve: {
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/emrworkspace/emrworkspace.js'));
            }]
        }
    })
    .state('patientemr.patientallergy', {
        url: '/patientallergy/:pid/:id',
        title: 'Patient Allergy',
        templateUrl: helper.basepath('emr/patientemr/patientallergy/patientallergy-form.html'),
        controller: 'patientAllergyFormController as vm',
        resolve: {
            $uibModalInstance: function() {
                return null;
            },
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientallergy/patientallergy-form.js'));
            }]
        }
    })
    .state('patientemr.patientconditions', {
        url: '/patientconditions/',
        title: 'Patient Conditions',
        templateUrl: helper.basepath('emr/patientemr/patientconditions/patientcondition-list.html'),
        controller: 'patientConditionListController as vm',
        resolve: {
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientconditions/patientcondition-list.js'));
            }]
        }
    })
    .state('patientemr.patientcondition', {
        url: '/patientcondition/:pid/:id',
        title: 'Patient Condition',
        templateUrl: helper.basepath('emr/patientemr/patientconditions/patientcondition-form.html'),
        controller: 'patientConditionFormController as vm',
        resolve: {
            $uibModalInstance: function() {
                return null;
            },
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientconditions/patientcondition-form.js'));
            }]
        }
    })
    .state('patientemr.familyconditions', {
        url: '/familyconditions/',
        title: 'Family Conditions',
        templateUrl: helper.basepath('emr/patientemr/familyconditions/familycondition-list.html'),
        controller: 'familyConditionListController as vm',
        resolve: {
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/familyconditions/familycondition-list.js'));
            }]
        }
    })
    .state('patientemr.familycondition', {
        url: '/familycondition/:pid/:id',
        title: 'Family Condition',
        templateUrl: helper.basepath('emr/patientemr/familyconditions/familycondition-form.html'),
        controller: 'familyConditionFormController as vm',
        resolve: {
            $uibModalInstance: function() {
                return null;
            },
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/familyconditions/familycondition-form.js'));
            }]
        }
    })
    .state('patientemr.familysocialhistorys', {
        url: '/familysocialhistorys/',
        title: 'Family Social Historys',
        templateUrl: helper.basepath('emr/patientemr/familysocialhistorys/familysocialhistory-list.html'),
        controller: 'familySocialHistoryListController as vm',
        resolve: {
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/familysocialhistorys/familysocialhistory-list.js'));
            }]
        }
    })
    .state('patientemr.familysocialhistory', {
        url: '/familysocialhistory/:pid/:id',
        title: 'Family Social History',
        templateUrl: helper.basepath('emr/patientemr/familysocialhistorys/familysocialhistory-form.html'),
        controller: 'familySocialHistoryFormController as vm',
        resolve: {
            $uibModalInstance: function() {
                return null;
            },
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/familysocialhistorys/familysocialhistory-form.js'));
            }]
        }
    })
    .state('patientemr.patientimmunizations', {
        url: '/patientimmunizations/',
        title: 'Patient Immunizations',
        templateUrl: helper.basepath('emr/patientemr/patientimmunizations/patientimmunization-list.html'),
        controller: 'patientImmunizationListController as vm',
        resolve: {
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientimmunizations/patientimmunization-list.js'));
            }]
        }
    })
    .state('patientemr.patientimmunization', {
        url: '/patientimmunization/:pid/:id',
        title: 'Patient Immunization',
        templateUrl: helper.basepath('emr/patientemr/patientimmunizations/patientimmunization-form.html'),
        controller: 'patientImmunizationFormController as vm',
        resolve: {
            $uibModalInstance: function() {
                return null;
            },
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/patientimmunizations/patientimmunization-form.js'));
            }]
        }
    })
    .state('patientemr.patienttransfer', {
        url: '/patienttransferform/',
        title: 'patienttransferform',
        templateUrl: helper.basepath('emr/patientemr/ipdashboard/patienttransfer/patienttransferform.html'),
        controller: 'patientTransferController as vm',
        resolve: {
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('emr/patientemr/ipdashboard/patienttransfer/patienttransferform.js'));
            }]
        }
    })
    .state('patientemr.emrtaskmanagementlist', {
        url: '/emrtaskmanagementlist',
        title: 'emrtaskmanagementlist',
        templateUrl: helper.basepath('patientportal/taskmanagement/taskmanagement-list.html'),
        controller: 'emrtaskmanagementlistController as vm',
        resolve: {
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('patientportal/taskmanagement/taskmanagement-list.js'));
            }]
        }
    })
     //reports
     .state('patientemr.admissionrequests', {
        url: '/admissionrequests',
        title: 'Admission Requests',
        templateUrl: helper.basepath('inpatient/admissionrequest/admissionrequest-list.html'),
        controller: 'admissionRequestListController as vm',
        resolve: {
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('inpatient/admissionrequest/admissionrequest-list.js'));
            }]
        }
    })
    .state('patientemr.admissionrequest', {
        url: '/admissionrequest/:id',
        title: 'Admission Request',
        templateUrl: helper.basepath('inpatient/admissionrequest/admissionrequest-form.html'),
        controller: 'admissionRequestFormController as vm',
        resolve: {
            loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load(helper.basepath('inpatient/admissionrequest/admissionrequest-form.js'));
            }]
        }
    })
        //patientEMR

    //patientemr

    } // routesConfig

})();