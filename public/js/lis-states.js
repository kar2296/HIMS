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
        $stateProvider

            .state('app.containertypes', {
                url: '/containertypes',
                title: 'containertypes',
                templateUrl: helper.basepath('lis/containertypes/containertypes.html'),
                controller: 'containerTypesListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/containertypes/containertypes.js'));
                    }]
                }
            })
            .state('app.containertype', {
                url: '/containertype/:id',
                title: 'containertype',
                templateUrl: helper.basepath('lis/containertypes/containertype.html'),
                controller: 'containertypeFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/containertypes/containertype.js'));
                    }]
                }
            })
            .state('app.sampletypes', {
                url: '/sampletypes',
                title: 'sampletypes',
                templateUrl: helper.basepath('lis/sampletypes/sampletypes.html'),
                controller: 'sampleTypesListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/sampletypes/sampletypes.js'));
                    }]
                }
            })
            .state('app.sampletype', {
                url: '/sampletype/:id',
                title: 'sampletype',
                templateUrl: helper.basepath('lis/sampletypes/sampletype.html'),
                controller: 'sampleTypeFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/sampletypes/sampletype.js'));
                    }]
                }
            })
            .state('app.analytemasters', {
                url: '/analytemasters',
                title: 'analytemasters',
                templateUrl: helper.basepath('lis/analytemaster/analytemasters.html'),
                controller: 'analyteMasterListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/analytemaster/analytemasters.js'));
                    }]
                }
            })
            .state('app.analytetab', {
                url: '/analytetab/:id',
                params: { IsProfile: null, AnalyteId: -1, AnalyteName: null },
                title: '',
                templateUrl: helper.basepath('lis/analytemaster/analytetab.html'),
                controller: 'analyteTabController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/analytemaster/analytetab.js'));
                    }]
                }
            })
            .state('app.analytetab.analytemaster', {
                url: '/analytemaster/:id',
                params: { AnalyteName: null },
                title: 'analytemaster',
                templateUrl: helper.basepath('lis/analytemaster/analytemaster.html'),
                controller: 'analyteMasterFormController as vm',
                resolve: {
                    $uibModalInstance: function() { return null; },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/analytemaster/analytemaster.js'));
                    }]
                }
            })
            .state('app.analytetab.analytealiasesmasters', {
                url: '/analytealiasesmasters',
                title: 'analytealiasesmasters',
                templateUrl: helper.basepath('lis/analytemaster/analytealiasesmasters.html'),
                controller: 'analytealiasesmastersListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/analytemaster/Analytealiasesmasters.js'));
                    }]
                }
            })
            .state('app.analytetab.analytealiasesmaster', {
                url: '/analytealiasesmaster/:aliasid',
                title: 'analytealiasesmaster',
                templateUrl: helper.basepath('lis/analytemaster/analytealiasesmaster.html'),
                controller: 'analytealiasesMasterFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/analytemaster/analytealiasesmaster.js'));
                    }]
                }
            })
            .state('app.analytetab.analyterefmasters', {
                url: '/analyterefmasters',
                title: 'analyterefmasters',
                templateUrl: helper.basepath('lis/analytemaster/analyterefmasters.html'),
                controller: 'analyterefmastersListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/analytemaster/analyterefmasters.js'));
                    }]
                }
            })
            .state('app.analytetab.analysertestmapping', {
                url: '/analysertestmapping',
                title: 'analysertestmapping',
                templateUrl: helper.basepath('lis/analytemaster/analysertestmapping-list.html'),
                controller: 'AnalyserTestMappingListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/analytemaster/analysertestmapping-list.js'));
                    }]
                }
            })
            .state('app.analysertestmapping', {
                url: '/analysertestmapping',
                title: 'analysertestmapping',
                templateUrl: helper.basepath('lis/analytemaster/analysertestmapping-list.html'),
                controller: 'AnalyserTestMappingListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/analytemaster/analysertestmapping-list.js'));
                    }]
                }
            })
            // .state('app.analytetab.analyterefmaster', {
            //     url: '/analyterefmaster/:refid',
            //     title: 'analyterefmaster',
            //     templateUrl: helper.basepath('lis/analytemaster/analyterefmaster.html'),
            //     controller: 'analyterefMasterFormController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('lis/analytemaster/analyterefmaster.js'));
            //         }]
            //     }
            // })

        .state('app.testmasters', {
                url: '/testmasters',
                title: 'testmasters',
                templateUrl: helper.basepath('lis/testmaster/testmasters.html'),
                controller: 'testMastersListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/testmaster/testmasters.js'));
                    }]
                }
            })
            .state('app.testmastertab', {
                url: '/testmastertab/:id',
                params: { IsProfile: null, TestName: null, TestCode: null },
                title: '',
                templateUrl: helper.basepath('lis/testmaster/testmastertab.html'),
                controller: 'testmasterTabController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/testmaster/testmastertab.js'));
                    }]
                }
            })
            .state('app.testmastertab.testmaster', {
                url: '/testmaster',
                title: 'testmaster',
                templateUrl: helper.basepath('lis/testmaster/testmaster.html'),
                controller: 'testMasterFormController as vm',
                resolve: {
                    $uibModalInstance: function() { return null; },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/testmaster/testmaster.js'));
                    }]
                }
            })
            .state('app.testmastertab.testmasterfacilitymap', {
                url: '/testmasterfacilitymap',
                title: 'Testmaster Facility Map',
                templateUrl: helper.basepath('lis/testmaster/testmasterfacilitymap.html'),
                controller: 'testmasterFacilityMapController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/testmaster/testmasterfacilitymap.js'));
                    }]
                }
            })
            .state('app.testmastertab.testmasteranalytemaps', {
                url: '/testmasteranalytemaps',
                title: 'testmasteranalytemaps',
                templateUrl: helper.basepath('lis/testmaster/testmasteranalytemaps.html'),
                controller: 'testmasterAnalyteMapsListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/testmaster/testmasteranalytemaps.js'));
                    }]
                }
            })
            .state('app.testmastertab.testdiagnosismappings', {
                url: '/testdiagnosismappings',
                title: 'testdiagnosismappings',
                templateUrl: helper.basepath('lis/testmaster/testdiagnosismappings.html'),
                controller: 'testmasterDianosisMapsListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/testmaster/testdiagnosismappings.js'));
                    }]
                }
            })
            .state('app.testmastertab.testtemplatemasters', {
                url: '/testtemplatemasters',
                title: 'testtemplatemasters',
                templateUrl: helper.basepath('lis/testmaster/testtemplatemasters.html'),
                controller: 'testTemplateMastersFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/testmaster/testtemplatemasters.js'));
                    }]
                }
            })

        .state('app.testmastertab.testinstructionmasters', {
            url: '/testinstructionmasters/:tstinstcid',
            title: 'testinstructionmasters',
            templateUrl: helper.basepath('lis/testmaster/testinstructionmasters.html'),
            controller: 'testInstcMasterFormController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/testmaster/testinstructionmasters.js'));
                }]
            }
        })

        .state('app.testmastertab.testbommasters', {
            url: '/testbommasters/:tstbomid',
            title: 'testbommasters',
            templateUrl: helper.basepath('lis/testmaster/testbommasters.html'),
            controller: 'testBOMFormController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/testmaster/testbommasters.js'));
                }]
            }
        })




        .state('app.investigationsettings', {
                url: '/investigationsettings',
                title: 'investigationsettings',
                templateUrl: helper.basepath('lis/investigationsettings/investigationsettings.html'),
                controller: 'investigationSettingsController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/investigationsettings/investigationsettings.js'));
                    }]
                }
            })
            .state('app.externalproviderslist', {
                url: '/externalproviderslist',
                title: 'externalproviderslist',
                templateUrl: helper.basepath('lis/externalproviders/externalproviderslist.html'),
                controller: 'externalProviderslistController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/externalproviders/externalproviderslist.js'));
                    }]
                }
            })
            .state('app.externalprovidersform', {
                url: '/externalprovidersform/:id',
                title: 'externalprovidersform',
                templateUrl: helper.basepath('lis/externalproviders/externalprovidersform.html'),
                controller: 'externalprovidersformController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/externalproviders/externalprovidersform.js'));
                    }]
                }
            })

        // LAB //
        //external provider master//
        // .state('app.externalprovidertab', {
        //     url: '/externalprovidertab/:id',
        //     params: { IsProfile: null, ExternalProviderId: null, ProviderName: null },
        //     title: 'External Provider Master',
        //     templateUrl: helper.basepath('lis/externalprovidermaster/externalprovidertab.html'),
        //     controller: 'externalProviderTabController as vm',
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('lis/externalprovidermaster/externalprovidertab.js'));
        //         }]
        //     }
        // })
        // .state('app.externalprovider', {
        //     url: '/externalprovider',
        //     title: 'External Provider',
        //     templateUrl: helper.basepath('lis/externalprovidermaster/externalprovider-list.html'),
        //     controller: 'externalProviderListController as vm',
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('lis/externalprovidermaster/externalprovider-list.js'));
        //         }]
        //     }
        // })
        // .state('app.externalprovidertab.pricemapping', {
        //     url: '/pricemapping',
        //     title: 'Price Mapping',
        //     templateUrl: helper.basepath('lis/externalprovidermaster/pricemapping-list.html'),
        //     controller: 'priceMappingListController as vm',
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('lis/externalprovidermaster/pricemapping-list.js'));
        //         }]
        //     }
        // })
        .state('app.analyzertestmaster', {
                url: '/analyzertestmaster',
                title: 'Analyzer Test Master',
                templateUrl: helper.basepath('lis/analyzertestmaster/analyzer-list.html'),
                controller: 'analyzertestmasterListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/analyzertestmaster/analyzer-list.js'));
                    }]
                }
            })
            // .state('app.externalprovidertab.externalproviders', {
            //     url: '/externalproviders',
            //     title: 'External Provider',
            //     templateUrl: helper.basepath('lis/externalprovidermaster/externalprovider-form.html'),
            //     controller: 'externalProviderFormController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('lis/externalprovidermaster/externalprovider-form.js'));
            //         }]
            //     }
            // })


        .state('app.orderacknowledgelist', {
            url: '/orderacknowledgelist/',
            params: { parentdeptid: '1' },
            title: 'orderacknowledgelist',
            templateUrl: helper.basepath('lis/orderacknowledge/orderacknowledgelist.html'),
            controller: 'orderacknowledgelistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/orderacknowledge/orderacknowledgelist.js'));
                }]
            }
        })

        .state('app.samplecollectlist', {
            url: '/samplecollectlist/',
            params: { parentdeptid: '1' },
            title: 'samplecollectlist',
            templateUrl: helper.basepath('lis/samplecollection/samplecollectlist.html'),
            controller: 'samplecollectlistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/samplecollection/samplecollectlist.js'));
                }]
            }
        })

        // .state('app.samplereviewlist', {
        //     url: '/samplereviewlist/',
        //     params: { parentdeptid: '1' },
        //     title: 'samplereviewlist',
        //     templateUrl: helper.basepath('lis/samplereview/samplereviewlist.html'),
        //     controller: 'samplereviewlistController as vm',
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('lis/samplereview/samplereviewlist.js'));
        //         }]
        //     }
        // })

        .state('app.orderassignmentlist', {
            url: '/orderassignmentlist/',
            params: { parentdeptid: '1' },
            title: 'orderassignmentlist',
            templateUrl: helper.basepath('lis/orderassignment/orderassignmentlist.html'),
            controller: 'orderassignmentlistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/orderassignment/orderassignmentlist.js'));
                }]
            }
        })

        .state('app.orderprocesslist', {
            url: '/orderprocesslist/',
            params: { parentdeptid: '1' },
            title: 'orderprocesslist',
            templateUrl: helper.basepath('lis/orderprocess/orderprocesslist.html'),
            controller: 'orderprocesslistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/orderprocess/orderprocesslist.js'));
                }]
            }
        })

        .state('app.resultapprovallist', {
            url: '/resultapprovallist/',
            params: { parentdeptid: '1' },
            title: 'resultapprovallist',
            templateUrl: helper.basepath('lis/resultapproval/resultapprovallist.html'),
            controller: 'resultapprovallistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/resultapproval/resultapprovallist.js'));
                }]
            }
        })

        .state('app.resultdispatchlist', {
            url: '/resultdispatchlist/',
            params: { parentdeptid: '1' },
            title: 'resultdispatchlist',
            templateUrl: helper.basepath('lis/resultdispatch/resultdispatchlist.html'),
            controller: 'resultdispatchlistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/resultdispatch/resultdispatchlist.js'));
                }]
            }
        })

        // RADIOLOGY //

        .state('app.radioorderacknowledgelist', {
            url: '/radioorderacknowledgelist/',
            params: { parentdeptid: '2' },
            title: 'radioorderacknowledgelist',
            templateUrl: helper.basepath('lis/orderacknowledge/orderacknowledgelist.html'),
            controller: 'orderacknowledgelistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/orderacknowledge/orderacknowledgelist.js'));
                }]
            }
        })

        .state('app.radioorderassignmentlist', {
            url: '/radioorderassignmentlist/',
            params: { parentdeptid: '2' },
            title: 'radioorderassignmentlist',
            templateUrl: helper.basepath('lis/orderassignment/orderassignmentlist.html'),
            controller: 'orderassignmentlistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/orderassignment/orderassignmentlist.js'));
                }]
            }
        })

        .state('app.radioorderprocesslist', {
            url: '/radioorderprocesslist/',
            params: { parentdeptid: '2' },
            title: 'radioorderprocesslist',
            templateUrl: helper.basepath('lis/orderprocess/orderprocesslist.html'),
            controller: 'orderprocesslistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/orderprocess/orderprocesslist.js'));
                }]
            }
        })

        .state('app.radioresultapprovallist', {
                url: '/radioresultapprovallist/',
                params: { parentdeptid: '2' },
                title: 'radioresultapprovallist',
                templateUrl: helper.basepath('lis/resultapproval/resultapprovallist.html'),
                controller: 'resultapprovallistController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/resultapproval/resultapprovallist.js'));
                    }]
                }
            })
            .state('app.analytetab.analysertemplate', {
                url: '/analysertemplate',
                title: 'analysertemplate',
                templateUrl: helper.basepath('lis/analytemaster/analysertemplate-list.html'),
                controller: 'AnalyserNormalTemplateListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/analytemaster/analysertemplate-list.js'));
                    }]
                }
            })

        .state('app.radioresultdispatchlist', {
            url: '/radioresultdispatchlist/',
            params: { parentdeptid: '2' },
            title: 'radioresultdispatchlist',
            templateUrl: helper.basepath('lis/resultdispatch/resultdispatchlist.html'),
            controller: 'resultdispatchlistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/resultdispatch/resultdispatchlist.js'));
                }]
            }
        })

        // AMBULATORY //

        .state('app.otherorderacknowledgelist', {
            url: '/otherorderacknowledgelist/',
            params: { parentdeptid: '3' },
            title: 'otherorderacknowledgelist',
            templateUrl: helper.basepath('lis/orderacknowledge/orderacknowledgelist.html'),
            controller: 'orderacknowledgelistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/orderacknowledge/orderacknowledgelist.js'));
                }]
            }
        })

        .state('app.otherorderassignmentlist', {
            url: '/otherorderassignmentlist/',
            params: { parentdeptid: '3' },
            title: 'otherorderassignmentlist',
            templateUrl: helper.basepath('lis/orderassignment/orderassignmentlist.html'),
            controller: 'orderassignmentlistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/orderassignment/orderassignmentlist.js'));
                }]
            }
        })

        .state('app.otherorderprocesslist', {
            url: '/otherorderprocesslist/',
            params: { parentdeptid: '3' },
            title: 'otherorderprocesslist',
            templateUrl: helper.basepath('lis/orderprocess/orderprocesslist.html'),
            controller: 'orderprocesslistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/orderprocess/orderprocesslist.js'));
                }]
            }
        })

        .state('app.otherresultapprovallist', {
            url: '/otherresultapprovallist/',
            params: { parentdeptid: '3' },
            title: 'otherresultapprovallist',
            templateUrl: helper.basepath('lis/resultapproval/resultapprovallist.html'),
            controller: 'resultapprovallistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/resultapproval/resultapprovallist.js'));
                }]
            }
        })

        .state('app.otherresultdispatchlist', {
            url: '/otherresultdispatchlist/',
            params: { parentdeptid: '3' },
            title: 'otherresultdispatchlist',
            templateUrl: helper.basepath('lis/resultdispatch/resultdispatchlist.html'),
            controller: 'resultdispatchlistController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/resultdispatch/resultdispatchlist.js'));
                }]
            }
        })

        .state('app.lisinterface', {
            url: '/lisinterface/',
            params: { parentdeptid: '1' },
            title: 'lisinterface',
            templateUrl: helper.basepath('lis/lisinterfcaeresult/lisinterfaceresultlist.html'),
            controller: 'lisInterfaceListController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/lisinterfcaeresult/lisinterfaceresultlist.js'));
                }]
            }
        })

        .state('app.lisinterfaceresult', {
                url: '/lisinterfaceresult/:id',
                params: { pt: '', pid: 0, Sampleid: '' },
                title: 'LIS Interface Result Entry',
                templateUrl: helper.basepath('lis/lisinterfcaeresult/lisinterfaceresultform.html'),
                controller: 'lisInterfaceResultController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/lisinterfcaeresult/lisinterfaceresultform.js'));
                    }]
                }
            })
            .state('app.antibioticmasters', {
                url: '/antibioticmasters',
                title: 'Antibiotic Master',
                templateUrl: helper.basepath('lis/antibioticmaster/antibiotic-list.html'),
                controller: 'AntibioticListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/antibioticmaster/antibiotic-list.js'));
                    }]
                }
            })
            .state('app.organismsisolations', {
                url: '/organismisolations:/',
                title: 'Organism Isolation',
                templateUrl: helper.basepath('lis/organismisolation/organismisolated-list.html'),
                controller: 'OrganismIsolatedListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/organismisolation/organismisolated-list.js'));
                    }]
                }
            })
            .state('app.organismtab', {
                url: '/organismtab',
                title: 'Organism Isolation',
                templateUrl: helper.basepath('lis/organismisolation/organismtab.html'),
                controller: 'organismTabController as vm',
                params: { id: null },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/organismisolation/organismtab.js'));
                    }]
                }
            })
            .state('app.organismtab.orgisolted-form', {
                url: '/organismform',
                title: 'Organism Isolation',
                templateUrl: helper.basepath('lis/organismisolation/organismisolated-form.html'),
                controller: 'OrgIsolatedFormController as vm',
                params: { id: null },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/organismisolation/organismisolated-form.js'));
                    }]
                }
            })
            .state('app.organismtab.antibioticorganismmap', {
                url: '/antibioticorganismmap',
                title: 'Antibiotic Master',
                templateUrl: helper.basepath('lis/organismisolation/antibioticorganismmap.html'),
                controller: 'AntibioticOrganismMapController as vm',
                params: { id: null },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/organismisolation/antibioticorganismmap.js'));
                    }]
                }
            })
        
            //B2B Customer Master//
            .state('app.b2bcustomertab', {
                url: '/b2bcustomertab/:id',
                params: { IsProfile: null, ExternalProviderId: null, ProviderName: null },
                title: 'B2B Customer Master',
                templateUrl: helper.basepath('lis/b2bcustomermaster/b2bcustomermastertab.html'),
                controller: 'B2BCustomerTabController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/b2bcustomermaster/b2bcustomermastertab.js'));
                    }]
                }
            })
            .state('app.b2bcustomerlist', {
                url: '/b2bcustomerlist',
                title: 'B2B Customers',
                templateUrl: helper.basepath('lis/b2bcustomermaster/b2bcustomermaster-list.html'),
                controller: 'B2BCustomerListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/b2bcustomermaster/b2bcustomermaster-list.js'));
                    }]
                }
            })
            .state('app.b2bcustomertab.b2bcustomerform', {
                url: '/b2bcustomerform',
                title: 'Manage B2B Customers',
                templateUrl: helper.basepath('lis/b2bcustomermaster/b2bcustomermaster-form.html'),
                controller: 'B2BCustomerFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/b2bcustomermaster/b2bcustomermaster-form.js'));
                    }]
                }
            })

        modalStateProvider.state('app.testmastertab.testmasteranalytemap', {
            url: '/testmasteranalytemap/:tstanalyteid',
            title: 'Testmaster Analyte Map',
            templateUrl: helper.basepath('lis/testmaster/testmasteranalytemap.html'),
            controller: 'testmasterAnalyteMapFormController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/testmaster/testmasteranalytemap.js'));
                }]
            }
        });
        modalStateProvider.state('app.testmastertab.testdiagnosismapping', {
            url: '/testdiagnosismapping/:tstdiagnosisid',
            title: 'testdiagnosismapping',
            templateUrl: helper.basepath('lis/testmaster/testdiagnosismapping.html'),
            controller: 'testmasterDiagnosisMapFormController as vm',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load(helper.basepath('lis/testmaster/testdiagnosismapping.js'));
                }]
            }
        });



        /*
    
                modalStateProvider.state('app.orderdetaillist', {
                    url: '/orderdetaillist/:encorderid',
                    params: { patname: '',patmrn :'',ordnr:'',orddt:'',orddeptid: '',billingid:-1,billingdt:''},
                    title: 'LAB Order List',
                    templateUrl: helper.basepath('lis/orderacknowledge/orderdetaillist.html'),
                    controller: 'orderdetaillistController as vm',
                    resolve: {
                        loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                          return $ocLazyLoad.load(helper.basepath('lis/orderacknowledge/orderdetaillist.js'));
                        }]
                    }
                });
    
                 modalStateProvider.state('app.patientorderstatus', {
                          url: '/patientorderstatus/:encorderid',
                          params: { patname: '',patmrn :'',ordnr:'',orddt:'',orddeptid: '',billingid:-1,billingdt:''},
                          title: 'patientorderstatus',
                          templateUrl: helper.basepath('lis/patientorderstatus/patientorderstatus.html'),
                          controller: 'patientorderstatusController as vm',
                          resolve: {
                              loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                                  return $ocLazyLoad.load(helper.basepath('lis/patientorderstatus/patientorderstatus.js'));
                              }]
                          }
                  });
        */

        //Modal configs starts
        modalConfigProvider.add('app.orderdetaillist', {
            url: '/orderdetaillist/:id',
            params: { encorderid: -1, patname: '', patmrn: '', ordnr: '', orddt: '', orddeptid: '', billingid: -1, billingdt: '' },
            templateUrl: helper.basepath('lis/orderacknowledge/orderdetaillist.html'),
            controller: 'orderdetaillistController as vm',
            controllerUrl: helper.basepath('lis/orderacknowledge/orderdetaillist.js'),
            size: 'lg'
        });


        modalConfigProvider.add('app.patientorderstatus', {
            url: '/patientorderstatus/:id',
            params: { encorderid: -1, patname: '', patmrn: '', ordnr: '', orddt: '', orddeptid: '', billingid: -1, billingdt: '' },
            templateUrl: helper.basepath('lis/patientorderstatus/patientorderstatus.html'),
            controller: 'patientorderstatusController as vm',
            controllerUrl: helper.basepath('lis/patientorderstatus/patientorderstatus.js'),
            size: 'lg'
        });

        modalConfigProvider.add('app.testmastertab.testmaster', {
            templateUrl: helper.basepath('lis/testmaster/testmaster.html'),
            controller: 'testMasterFormController as vm',
            controllerUrl: helper.basepath('lis/testmaster/testmaster.js'),
            size: 'lg'
        });
        /*ANALYSER NORMAL TEMPLATE */
        modalConfigProvider.add('app.analytetab.analysertemplates', {
            templateUrl: helper.basepath('lis/analytemaster/analysertemplate-form.html'),
            controller: 'AnalyserNormalTemplateformController as vm',
            controllerUrl: helper.basepath('lis/analytemaster/analysertemplate-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.testprofile', {
            templateUrl: helper.basepath('lis/testprofile/testprofile.html'),
            controller: 'testProfileController',
            controllerUrl: helper.basepath('lis/testprofile/testprofile.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.analyteprofile', {
            templateUrl: helper.basepath('lis/analyteprofile/analyteprofile.html'),
            controller: 'analyteprofileController',
            controllerUrl: helper.basepath('lis/analyteprofile/analyteprofile.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.analytetab.analytemaster', {
            templateUrl: helper.basepath('lis/analytemaster/analytemaster.html'),
            controller: 'analyteMasterFormController',
            controllerUrl: helper.basepath('lis/analytemaster/analytemaster.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.analytetab.analyterefmasters', {
            templateUrl: helper.basepath('lis/analytemaster/analyterefmaster.html'),
            controller: 'analyterefMasterFormController as vm',
            controllerUrl: helper.basepath('lis/analytemaster/analyterefmaster.js'),
            size: 'lg'
        });
        // modalConfigProvider.add('app.externalprovidertab.pricemappings', {
        //     templateUrl: helper.basepath('lis/externalprovidermaster/pricemapping-form.html'),
        //     controller: 'pricemappingFormController as vm',
        //     controllerUrl: helper.basepath('lis/externalprovidermaster/pricemapping-form.js'),
        //     size: 'lg'
        // });
        modalConfigProvider.add('app.analyzertestmasters', {
            templateUrl: helper.basepath('lis/analyzertestmaster/analyzer-form.html'),
            controller: 'analyzertestmasterFormController as vm',
            controllerUrl: helper.basepath('lis/analyzertestmaster/analyzer-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.analysertestmappingform', {
            templateUrl: helper.basepath('lis/analytemaster/analysertestmapping-form.html'),
            controller: 'AnalyserTestMappingFormController as vm',
            controllerUrl: helper.basepath('lis/analytemaster/analysertestmapping-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.antibiotic-form', {
            templateUrl: helper.basepath('lis/antibioticmaster/antibiotic-form.html'),
            controller: 'AntibioticFormController as vm',
            controllerUrl: helper.basepath('lis/antibioticmaster/antibiotic-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.antibiotic-culture', {
            templateUrl: helper.basepath('lis/antibioticculture/antibiotic-culture.html'),
            controller: 'AntibioticCultureController as vm',
            controllerUrl: helper.basepath('lis/antibioticculture/antibiotic-culture.js'),
            size: 'lg'
        });

        modalConfigProvider.add('app.lisinterfaceresult', {
            templateUrl: helper.basepath('lis/lisinterfcaeresult/lisinterfaceresultform.html'),
            params: { id: 0, pt: '', pid: 0, Sampleid: '' },
            controller: 'lisInterfaceResultController as vm',
            controllerUrl: helper.basepath('lis/lisinterfcaeresult/lisinterfaceresultform.js'),
            size: 'lg'
        });
        // modalConfigProvider.add('app.orgisolted-form', {
        //     templateUrl: helper.basepath('lis/organismisolation/organismisolated-form.html'),
        //     controller: 'OrgIsolatedFormController as vm',
        //     controllerUrl: helper.basepath('lis/organismisolation/organismisolated-form.js'),
        //     size: 'lg'
        // });
        // modalStateProvider.state('app.externalprovidertab.pricemappings', {
        //     url: '/pricemappings/:externalproviderpriceid',
        //     title: 'Price Mapping',
        //     templateUrl: helper.basepath('lis/externalprovidermaster/pricemapping-form.html'),
        //     controller: 'pricemappingFormController as vm',
        //     resolve: {
        //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //             return $ocLazyLoad.load(helper.basepath('lis/externalprovidermaster/pricemapping-form.js'));
        //         }]
        //     }
        // });

    } // routesConfig

})();