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
            .state('patientemr.consuldationnotestab', {
                url: '/consuldationnotestab/:id',
                title: 'Consuldation Notes tab',
                templateUrl: helper.basepath('emr/EMR/consultationnotes/consultationprofiletab.html'),
                controller: 'consultationtabController as tabvm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/consultationnotes/consultationprofiletab.js'));
                    }]
                }
            })
            .state('patientemr.consuldationnotestab.consultationnotes', {
                url: '/consultationnotes',
                title: 'Consultation Notes',
                templateUrl: helper.basepath('emr/EMR/consultationnotes/consultationnotes.html'),
                controller: 'consultationnotesController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/consultationnotes/consultationnotes.js'));
                    }]
                }
            })
            .state('patientemr.consuldationnotestab.vitals', {
                url: '/patientvitals/:pid',
                title: 'Patient Vitals',
                templateUrl: helper.basepath('emr/EMR/consultationnotes/patientvital-form.html'),
                controller: 'patientVitalsFormController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/consultationnotes/patientvital-form.js'));
                    }]
                }
            })
            .state('patientemr.consuldationnotestab.prescription', {
                url: '/patientprescription/:pid',
                title: 'Patient Prescription',
                templateUrl: helper.basepath('emr/EMR/consultationnotes/prescription-form.html'),
                controller: 'prescriptionFormmodalController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/consultationnotes/prescription-form.js'));
                    }]
                }
            })
            .state('patientemr.consuldationnotestab.patientorder', {
                url: '/patientorder/:pid',
                title: 'Patient Orders',
                templateUrl: helper.basepath('emr/EMR/consultationnotes/patientorder-form.html'),
                controller: 'patientOrderListsController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/consultationnotes/patientorder-form.js'));
                    }]
                }
            })
            .state('app.claimmanagement-listtab', {
                url: '/claimmanagement-listtab/:id',
                title: 'Claim Management',
                templateUrl: helper.basepath('billing/claimmanagement/claimmanagementtab.html'),
                controller: 'claimManagementTabController as tabvm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('billing/claimmanagement/claimmanagementtab.js'));
                    }]
                }
            })
            .state('app.claimmanagement-listtab.receivedreceipts', {
                url: '/receivedreceipts',
                title: 'receivedreceipts',
                templateUrl: helper.basepath('billing/claimmanagement/receivedreceipts.html'),
                controller: 'receivedreceiptsListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('billing/claimmanagement/receivedreceipts.js'));
                    }]
                }
            })
            .state('app.claimmanagement-listtab.newreceipts', {
                url: '/newreceipts',
                title: 'newreceipts',
                templateUrl: helper.basepath('billing/claimmanagement/newreceipt-form.html'),
                controller: 'newReceiptformListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('billing/claimmanagement/newreceipt-form.js'));
                    }]
                }
            })
            .state('app.dischargesummarys', {
                url: '/dischargesummarys',
                title: 'DischargeSummarys',
                templateUrl: helper.basepath('emr/medicalcertificate/dischargesummary/dischargesummary-list.html'),
                controller: 'dischargesummaryListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/dischargesummary/dischargesummary-list.js'));
                    }]
                }
            })
            .state('app.medicalfitness', {
                url: '/medicalfitness',
                title: 'Medical Fitness',
                templateUrl: helper.basepath('emr/medicalcertificate/medicalfitness/fitnesscertificate-list.html'),
                controller: 'FitnessCertificateListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/medicalfitness/fitnesscertificate-list.js'));
                    }]
                }
            })
            .state('app.fitnesscertificate', {
                url: '/fitnesscertificate/:id',
                title: 'Medical Fitness',
                templateUrl: helper.basepath('emr/medicalcertificate/medicalfitness/fitnesscertificate-form.html'),
                controller: 'FitnessFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/medicalfitness/fitnesscertificate-form.js'));
                    }]
                }
            })
            .state('app.checklist', {
                url: '/CheckList',
                title: 'Claim CheckList',
                templateUrl: helper.basepath('billing/claimmanagement/checklist.html'),
                controller: 'checklistController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('billing/claimmanagement/checklist.js'));
                    }]
                }
            })
            .state('app.checklist-form', {
                url: '/ClaimCheckList/:id',
                title: 'Claim CheckList',
                params: {
                    gmid: null,
                    billid: null
                },
                templateUrl: helper.basepath('billing/claimmanagement/checklist-form.html'),
                controller: 'checklistFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('billing/claimmanagement/checklist-form.js'));
                    }]
                }
            })
            .state('app.claimsubmission-list', {
                url: '/ClaimSubmissionlist',
                title: 'Claim Subbmission',
                templateUrl: helper.basepath('billing/claimmanagement/claimsubmission-list.html'),
                controller: 'claimsubmissionController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('billing/claimmanagement/claimsubmission-list.js'));
                    }]
                }
            })
            .state('app.claimsubmission-form', {
                url: '/ClaimSubmissionform/:id',
                title: 'Claim Subbmission',
                templateUrl: helper.basepath('billing/claimmanagement/claimsubmission-form.html'),
                controller: 'claimsubmissionFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('billing/claimmanagement/claimsubmission-form.js'));
                    }]
                }
            })
            .state('app.dischargesummary-form', {
                url: '/dischargesummary-form/:id',
                title: 'Dischargeform',
                templateUrl: helper.basepath('emr/medicalcertificate/dischargesummary/dischargesummary-form.html'),
                controller: 'dischargesummaryFormController as vm',
                params: {
                    eid: 0,
                    pid: 0,
                    context: 'summary'
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
            .state('app.deathcertificates', {
                url: '/deathcertificate:id',
                title: 'Deathcertificate',
                templateUrl: helper.basepath('emr/medicalcertificate/deathcertificate/deathcertificate-list.html'),
                controller: 'deathcertificateListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/deathcertificate/deathcertificate-list.js'));
                    }]
                }
            })
            .state('app.deathcertificate', {
                url: '/deathcertificate:id',
                title: 'Deathcertificate',
                templateUrl: helper.basepath('emr/medicalcertificate/deathcertificate/deathcertificate-form.html'),
                controller: 'deathcertificateFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/deathcertificate/deathcertificate-form.js'));
                    }]
                }
            })
            .state('app.birthcertificates', {
                url: '/birthcertificate:id',
                title: 'Birthcertificate',
                templateUrl: helper.basepath('emr/medicalcertificate/birthcertificate/birthcertificate-list.html'),
                controller: 'birthcertificateListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/birthcertificate/birthcertificate-list.js'));
                    }]
                }
            })
            .state('app.birthcertificate', {
                url: '/birthcertificate/:id',
                title: 'Birthcertificate',
                templateUrl: helper.basepath('emr/medicalcertificate/birthcertificate/birthcertificate-form.html'),
                controller: 'birthcertificateFormController as vm',
                params: {
                    eid: 0,
                    pid: 0
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/birthcertificate/birthcertificate-form.js'));
                    }]
                }
            })
            .state('app.otrequests', {
                url: '/otrequests',
                title: 'OT Request',
                templateUrl: helper.basepath('emr/surgerymanagement/otrequest/otrequest-list.html'),
                controller: 'otrequestListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otrequest/otrequest-list.js'));
                    }]
                }
            })
            .state('app.otrequest', {
                url: '/otrequest/:id',
                title: 'OT Request',
                templateUrl: helper.basepath('emr/surgerymanagement/otrequest/otrequest-form.html'),
                controller: 'otrequestFormController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otrequest/otrequest-form.js'));
                    }]
                }
            })
            .state('app.otconfirmationform', {
                url: '/otconfirmationform/:id',
                title: 'OT Confirmation',
                templateUrl: helper.basepath('emr/surgerymanagement/otconfirmation/otconfirmation-form.html'),
                controller: 'otconfirmFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otconfirmation/otconfirmation-form.js'));
                    }]
                }
            })
            // .state('app.currentinpatients', {
            //     url: '/currentinpatients',
            //     title: 'currentinpatients',
            //     params: {
            //         context: ''
            //     },
            //     templateUrl: helper.basepath('inpatient/currentinpatients/currentinpatientlist.html'),
            //     controller: 'currentinpatientsListController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('inpatient/currentinpatients/currentinpatientlist.js'));
            //         }]
            //     }
            // })
            // .state('app.sequencemasters', {
            //     url: '/sequencemasters',
            //     title: 'Sequence Masters',
            //     templateUrl: helper.basepath('emr/appmanager/sequencemasters/SequenceMasters-list.html'),
            //     controller: 'SequenceMastersListController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/appmanager/sequencemasters/SequenceMasters-list.js'));
            //         }]
            //     }
            // })
            .state('app.indications', {
                url: '/indications',
                title: 'Manage Indications',
                templateUrl: helper.basepath('inventory/manageindications/indication-list.html'),
                controller: 'indicationListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inventory/manageindications/indication-list.js'));
                    }]
                }
            })
            .state('app.displayboard', {
                url: '/displayboard',
                title: 'Display Board',
                templateUrl: helper.basepath('emr/general/displayboard/displayboards.html'),
                controller: 'displayboardsController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/general/displayboard/displayboards.js'));
                    }]
                }
            })
            .state('app.doctordisplay', {
                url: '/doctordisplay',
                title: 'Doctor Display',
                templateUrl: helper.basepath('emr/general/doctordisplay/doctordisplay-list.html'),
                controller: 'doctordisplayListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/general/doctordisplay/doctordisplay-list.js'));
                    }]
                }
            })
            .state('app.occupation', {
                url: '/occupationmasters',
                params: {
                    context: ''
                },
                title: 'Occupation Masters',
                templateUrl: helper.basepath('emr/generalmaster/occupationmaster/occupation-list.html'),
                controller: 'occupationListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/generalmaster/occupationmaster/occupation-list.js'));
                    }]
                }
            })
            .state('app.generaldisplay', {
                url: '/generaldisplay',
                title: 'General Display',
                templateUrl: helper.basepath('emr/general/generaldisplay/generaldisplay-list.html'),
                controller: 'generaldisplayListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/general/generaldisplay/generaldisplay-list.js'));
                    }]
                }
            })
            .state('app.generalboard', {
                url: '/generalboard',
                title: 'General Board',
                templateUrl: helper.basepath('emr/general/generalboard/generalboards.html'),
                controller: 'generalboardsController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/general/generalboard/generalboards.js'));
                    }]
                }
            })
            .state('app.warddisplay', {
                url: '/warddisplay',
                title: 'Ward Display',
                templateUrl: helper.basepath('emr/general/warddisplay/wardboards.html'),
                controller: 'wardboardController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/general/warddisplay/wardboards.js'));
                    }]
                }
            })
            .state('app.qmsdisplay', {
                url: '/qmsdisplay',
                title: 'QMS Display',
                templateUrl: helper.basepath('emr/general/qmsdisplay/tokendisplays.html'),
                controller: 'tokenController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/general/qmsdisplay/tokendisplays.js'));
                    }]
                }
            })
            .state('app.apptqmsdisplay', {
                url: '/apptqmsdisplay',
                title: 'Appointment QMS Display',
                templateUrl: helper.basepath('emr/general/appointmentqms/appttokendisplays.html'),
                controller: 'AppttokenController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/general/appointmentqms/appttokendisplays.js'));
                    }]
                }
            })
            .state('app.diagnosiscoding', {
                url: '/diagnosiscoding',
                title: 'Diagnosis Coding',
                templateUrl: helper.basepath('inpatient/mrd/diagnosiscoding/diagnosiscoding.html'),
                controller: 'diagnosiscodingsController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/diagnosiscoding/diagnosiscoding.js'));
                    }]
                }
            })
            .state('app.filerequest', {
                url: '/filerequest',
                title: 'File Requests',
                templateUrl: helper.basepath('inpatient/mrd/filerequests/filerequest-list.html'),
                controller: 'filerequestController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/filerequests/filerequest-list.js'));
                    }]
                }
            })
            .state('app.Worklists', {
                url: '/Worklists',
                title: 'MRD Worklists',
                templateUrl: helper.basepath('inpatient/mrd/fileworklists/fileworklists.html'),
                controller: 'fileworklistsController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/fileworklists/fileworklists.js'));
                    }]
                }
            })
            .state('app.fileissues', {
                url: '/fileissues',
                title: 'File Issues',
                templateUrl: helper.basepath('inpatient/mrd/filereceive/filereceive.html'),
                controller: 'FileReceiveController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/filereceive/filereceive.js'));
                    }]
                }
            })
            .state('app.filetransfer', {
                url: '/filetransfer',
                title: 'File Transfer',
                templateUrl: helper.basepath('inpatient/mrd/filetransfer/filetransfer.html'),
                controller: 'FileTransferController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/filetransfer/filetransfer.js'));
                    }]
                }
            })
            .state('app.mrdreceive', {
                url: '/mrdreceive',
                title: 'MRDReceive',
                templateUrl: helper.basepath('inpatient/mrd/receiveatmrd/receiveatmrd.html'),
                controller: 'ReceiveatMrdController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/receiveatmrd/receiveatmrd.js'));
                    }]
                }
            })
            .state('app.mrdfilestatus', {
                url: '/mrdfilestatus',
                title: 'MRD File Status',
                templateUrl: helper.basepath('inpatient/mrd/mrdfilestatus/mrdfilestatus.html'),
                controller: 'MrdFileStatusController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/mrdfilestatus/mrdfilestatus.js'));
                    }]
                }
            })
            .state('app.mrdfileassignment', {
                url: '/mrdfileassignment',
                title: 'MRD File Status',
                templateUrl: helper.basepath('inpatient/mrd/mrdfileassignment/mrdfileassignment.html'),
                controller: 'MrdFileAssignmentController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/mrdfileassignment/mrdfileassignment.js'));
                    }]
                }
            })
            .state('app.mrdfileupload', {
                url: '/mrdfileupload',
                title: 'MRD FileUpload',
                templateUrl: helper.basepath('inpatient/mrd/mrdfileupload/fileupload-list.html'),
                controller: 'MRDFileUploadListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/mrdfileupload/fileupload-list.js'));
                    }]
                }
            })
            .state('app.manageevent', {
                url: '/manageevent',
                title: 'Manage Events',
                templateUrl: helper.basepath('emr/appmanager/manageevent/manageeventlist.html'),
                controller: 'ManageeventListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/manageevent/manageeventlist.js'));
                    }]
                }
            })
            .state('app.manageevents', {
                url: '/manageevents/:id',
                title: 'Manage Events',
                templateUrl: helper.basepath('emr/appmanager/manageevent/manageeventform.html'),
                controller: 'ManageeventFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/manageevent/manageeventform.js'));
                    }]
                }
            })
            .state('app.costs', {
                url: '/costs',
                title: 'Costs',
                templateUrl: helper.basepath('emr/costmanagement/costs.html'),
                controller: 'costListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/costmanagement/costs.js'));
                    }]
                }
            })
            .state('app.costtab', {
                url: '/costtab/:id',
                title: 'Cost',
                templateUrl: helper.basepath('emr/costmanagement/costtab.html'),
                controller: 'costTabController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/costmanagement/costtab.js'));
                    }]
                }
            })
            .state('app.costtab.details', {
                url: '/details',
                title: 'details',
                templateUrl: helper.basepath('emr/costmanagement/cost.html'),
                controller: 'costFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/costmanagement/cost.js'));
                    }]
                }
            })
            .state('app.costtab.labourcosts', {
                url: '/labourcosts',
                title: 'Labour Costs',
                templateUrl: helper.basepath('emr/costmanagement/labourcost-list.html'),
                controller: 'labourCostListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/costmanagement/labourcost-list.js'));
                    }]
                }
            })
            .state('app.costtab.powercosts', {
                url: '/powercosts',
                title: 'Power Costs',
                templateUrl: helper.basepath('emr/costmanagement/powercost-list.html'),
                controller: 'powerCostListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/costmanagement/powercost-list.js'));
                    }]
                }
            })
            .state('app.costtab.notionalrents', {
                url: '/notionalrents',
                title: 'Notional Rent',
                templateUrl: helper.basepath('emr/costmanagement/notionalrents.html'),
                controller: 'notionalrentListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/costmanagement/notionalrents.js'));
                    }]
                }
            })
            .state('app.costtab.consumables', {
                url: '/consumables',
                title: 'Consumables',
                templateUrl: helper.basepath('emr/costmanagement/consumables.html'),
                controller: 'consumablesListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/costmanagement/consumables.js'));
                    }]
                }
            })
            .state('patientemr.pastlabresults', {
                url: '/pastlabresults',
                title: 'Past Lab Results',
                templateUrl: helper.basepath('emr/EMR/pastlabresult/pastlab-list.html'),
                controller: 'pastLabListController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/pastlabresult/pastlab-list.js'));
                    }]
                }
            })
            .state('patientemr.pastlabresult', {
                url: '/pastlabresult/:id',
                title: 'Past Lab Results',
                templateUrl: helper.basepath('emr/EMR/pastlabresult/pastlab-form.html'),
                controller: 'pastLabFormController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/pastlabresult/pastlab-form.js'));
                    }]
                }
            })
            .state('patientemr.pastradiologyresults', {
                url: '/pastradiologyresults',
                title: 'Past Radiology Results',
                templateUrl: helper.basepath('emr/EMR/pastlabresult/pastradiology-list.html'),
                controller: 'pastRadiologyListController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/pastlabresult/pastradiology-list.js'));
                    }]
                }
            })
            .state('patientemr.pastradiologyresult', {
                url: '/pastradiologyresult/:id',
                title: 'Past Radiology Results',
                templateUrl: helper.basepath('emr/EMR/pastlabresult/pastradiology-form.html'),
                controller: 'pastRadiologyFormController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/pastlabresult/pastradiology-form.js'));
                    }]
                }
            })
            .state('app.erptab', {
                url: '/erpintegration',
                title: 'ERP Integration',
                templateUrl: helper.basepath('emr/appmanager/erpintegration/erptab.html'),
                controller: 'erpTabController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/erpintegration/erptab.js'));
                    }]
                }
            })
            .state('app.erptab.outbound', {
                url: '/outbound',
                title: 'Outbound',
                templateUrl: helper.basepath('emr/appmanager/erpintegration/outbound-list.html'),
                controller: 'outboundListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/erpintegration/outbound-list.js'));
                    }]
                }
            })
            .state('app.erptab.inbound', {
                url: '/inbound',
                title: 'Inbound',
                templateUrl: helper.basepath('emr/appmanager/erpintegration/inbound-list.html'),
                controller: 'inboundListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/erpintegration/inbound-list.js'));
                    }]
                }
            })
            // /*physiotheraphy */
            // .state('app.physiotheraphy', {
            //     url: '/physiotheraphy',
            //     title: 'Physiotheraphy',
            //     templateUrl: helper.basepath('emr/physiotheraphy/physiotheraphy-list.html'),
            //     controller: 'physiotheraphyListController as vm',
            //     params: {
            //         context: 'main',
            //         tp: ''
            //     },
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/physiotheraphy/physiotheraphy-list.js'));
            //         }]
            //     }
            // })
            // .state('app.physiotheraphytab.details', {
            //     url: '/physiotheraphies',
            //     title: 'physiotheraphies',
            //     templateUrl: helper.basepath('emr/physiotheraphy/physiotheraphy-form.html'),
            //     controller: 'physiotheraphyFormController as vm',
            //     params: {
            //         context: 'main',
            //         tp: ''
            //     },
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/physiotheraphy/physiotheraphy-form.js'));
            //         }]
            //     }
            // })
            // .state('app.physiotheraphytab.assessment', {
            //     url: '/physiotheraphyassessment',
            //     title: 'physiotheraphyassessment',
            //     templateUrl: helper.basepath('emr/physiotheraphy/physioconsultations/consultation.html'),
            //     controller: 'physiconsultationController as vm',
            //     params: {
            //         context: 'main',
            //         tp: ''
            //     },
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(
            //                 [helper.basepath('emr/physiotheraphy/physioconsultations/consultation.js'),
            //                     helper.basepath('emr/physiotheraphy/physioconsultations/sections/question/cn-question-section.js'),
            //                     helper.basepath('emr/physiotheraphy/physioconsultations/sections/reviewnotes/reviewnotes.js')
            //                 ]);
            //         }]
            //     }
            // })
            // .state('app.physiotheraphytab', {
            //     url: '/physiotheraphytab/:id',
            //     title: 'Physiotheraphy',
            //     templateUrl: helper.basepath('emr/physiotheraphy/physiotheraphytab.html'),
            //     controller: 'physiotheraphytabController as vm',
            //     params: {
            //         context: 'main',
            //         tp: ''
            //     },
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/physiotheraphy/physiotheraphytab.js'));
            //         }]
            //     }
            // })
            // .state('patientemr.physiotheraphy', {
            //     url: '/physiotheraphy',
            //     title: 'Physiotheraphy',
            //     templateUrl: helper.basepath('emr/physiotheraphy/physiotheraphy-list.html'),
            //     controller: 'physiotheraphyListController as vm',
            //     params: {
            //         tp: 'emr'
            //     },
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/physiotheraphy/physiotheraphy-list.js'));
            //         }]
            //     }
            // })
            // .state('patientemr.physiotheraphytab', {
            //     url: '/physiotheraphytab/:id',
            //     title: 'Physiotheraphy',
            //     templateUrl: helper.basepath('emr/physiotheraphy/physiotheraphytab.html'),
            //     controller: 'physiotheraphytabController as vm',
            //     params: {
            //         tp: 'emr'
            //     },
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/physiotheraphy/physiotheraphytab.js'));
            //         }]
            //     }
            // })
            // .state('patientemr.physiotheraphytab.details', {
            //     url: '/physiotheraphies',
            //     title: 'physiotheraphies',
            //     templateUrl: helper.basepath('emr/physiotheraphy/physiotheraphy-form.html'),
            //     controller: 'physiotheraphyFormController as vm',
            //     params: {
            //         tp: 'emr'
            //     },
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/physiotheraphy/physiotheraphy-form.js'));
            //         }]
            //     }
            // })
            // /*physiotheraphy ends */

        .state('app.servicerequests', {
                url: '/servicerequests',
                title: 'Service Requests',
                templateUrl: helper.basepath('emr/assetmanagement/servicerequest/servicerequest-list.html'),
                controller: 'serviceRequestListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/assetmanagement/servicerequest/servicerequest-list.js'));
                    }]
                }
            })
            .state('app.servicerequest', {
                url: '/servicerequest/:id',
                title: 'Service Request',
                templateUrl: helper.basepath('emr/assetmanagement/servicerequest/servicerequest-form.html'),
                controller: 'serviceRequestFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/assetmanagement/servicerequest/servicerequest-form.js'));
                    }]
                }
            })
            .state('app.assignments', {
                url: '/assignments/:tp',
                title: 'Assignments',
                templateUrl: helper.basepath('emr/assetmanagement/assignment/assignment-list.html'),
                controller: 'AssignmentListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/assetmanagement/assignment/assignment-list.js'));
                    }]
                }
            })
            .state('app.workorderprocesstab', {
                url: '/workorderprocess/:tp',
                title: 'Work Order Process',
                templateUrl: helper.basepath('emr/assetmanagement/workorderprocess/workorderprocesstab.html'),
                controller: 'workorderProcessTabController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/assetmanagement/workorderprocess/workorderprocesstab.js'));
                    }]
                }
            })
            .state('app.workorderprocesstab.processallorders', {
                url: '/allorders/:tp',
                title: 'All Orders',
                templateUrl: helper.basepath('emr/assetmanagement/workorderprocess/allorderprocess-list.html'),
                controller: 'allOrderProcessListController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/assetmanagement/workorderprocess/allorderprocess-list.js'));
                    }]
                }
            })
            .state('app.workorderprocesstab.processmyorders', {
                url: '/myorders/:tp',
                title: 'My Orders',
                templateUrl: helper.basepath('emr/assetmanagement/workorderprocess/myorderprocess-list.html'),
                controller: 'myOrderProcessListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/assetmanagement/workorderprocess/myorderprocess-list.js'));
                    }]
                }
            })
            .state('app.serviceexecutions', {
                url: '/serviceexecutions/:id',
                title: 'Service Execution',
                templateUrl: helper.basepath('emr/assetmanagement/workorderprocess/serviceexecution-form.html'),
                controller: 'serviceExecutionFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/assetmanagement/workorderprocess/serviceexecution-form.js'));
                    }]
                }
            })
            .state('app.assetdashboard', {
                url: '/Assetdashboard',
                title: 'Asset Dashboard',
                templateUrl: helper.basepath('emr/assetmanagement/assetdashboard/assetdashboard.html'),
                controller: 'assetDashboardController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/assetmanagement/assetdashboard/assetdashboard.js'));
                    }]
                }
            })
            .state('app.countrymaster', {
                url: '/countrymasters',
                title: 'Country Master',
                templateUrl: helper.basepath('emr/generalmaster/countrymaster/countrymaster-list.html'),
                controller: 'countryMasterListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/generalmaster/countrymaster/countrymaster-list.js'));
                    }]
                }
            })
            .state('app.statemaster', {
                url: '/statemasters',
                params: {
                    context: ''
                },
                title: 'State Master',
                templateUrl: helper.basepath('emr/generalmaster/statemaster/statemaster-list.html'),
                controller: 'stateMasterListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/generalmaster/statemaster/statemaster-list.js'));
                    }]
                }
            })
            .state('app.districtmaster', {
                url: '/districtmasters',
                title: 'District Master',
                templateUrl: helper.basepath('emr/generalmaster/districtmaster/districtmaster-list.html'),
                controller: 'districtMasterListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/generalmaster/districtmaster/districtmaster-list.js'));
                    }]
                }
            })
            .state('app.citymaster', {
                url: '/citymasters',
                params: {
                    context: ''
                },
                title: 'City Master',
                templateUrl: helper.basepath('emr/generalmaster/citymaster/citymaster-list.html'),
                controller: 'cityMasterListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/generalmaster/citymaster/citymaster-list.js'));
                    }]
                }
            })
            .state('app.cardmaster', {
                url: '/cardmasters',
                title: 'Card Masters',
                templateUrl: helper.basepath('emr/generalmaster/cardmaster/cardmaster-list.html'),
                controller: 'cardMasterListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/generalmaster/cardmaster/cardmaster-list.js'));
                    }]
                }
            })
            .state('app.printlog', {
                url: '/printlogs',
                title: 'Print Logs',
                templateUrl: helper.basepath('emr/appmanager/printlogs/printlog-list.html'),
                controller: 'printListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/printlogs/printlog-list.js'));
                    }]
                }
            })
            .state('app.activeusers', {
                url: '/activeusers',
                title: 'Active Users',
                templateUrl: helper.basepath('emr/appmanager/activeusers/activeusers-list.html'),
                controller: 'activeUserListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/activeusers/activeusers-list.js'));
                    }]
                }
            })
            .state('app.eventdashboardtab', {
                url: '/eventdashboard',
                title: 'Event Dashboard',
                templateUrl: helper.basepath('emr/appmanager/eventdashboard/eventdashboardtab.html'),
                controller: 'eventdashboardTabController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/eventdashboard/eventdashboardtab.js'));
                    }]
                }
            })
            .state('app.eventdashboardtab.outboundall', {
                url: '/outboundall',
                title: 'Outbound All',
                templateUrl: helper.basepath('emr/appmanager/eventdashboard/outboundall-list.html'),
                controller: 'outboundAllListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/eventdashboard/outboundall-list.js'));
                    }]
                }
            })
            .state('app.eventdashboardtab.outbounderror', {
                url: '/outbounderror',
                title: 'Outbound Error',
                templateUrl: helper.basepath('emr/appmanager/eventdashboard/outbounderror-list.html'),
                controller: 'outboundErrorListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/eventdashboard/outbounderror-list.js'));
                    }]
                }
            })
            .state('app.eventdashboardtab.outboundignored', {
                url: '/outboundignored',
                title: 'Outbound Ignored',
                templateUrl: helper.basepath('emr/appmanager/eventdashboard/outboundignore-list.html'),
                controller: 'outboundIgnoreListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/eventdashboard/outboundignore-list.js'));
                    }]
                }
            })
            .state('app.eventdashboardtab.inboundall', {
                url: '/inboundall',
                title: 'Inbound All',
                templateUrl: helper.basepath('emr/appmanager/eventdashboard/inboundall-list.html'),
                controller: 'inboundAllListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/eventdashboard/inboundall-list.js'));
                    }]
                }
            })
            .state('app.eventdashboardtab.inbounderror', {
                url: '/inbounderror',
                title: 'Inbound Error',
                templateUrl: helper.basepath('emr/appmanager/eventdashboard/inbounderror-list.html'),
                controller: 'inboundErrorListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/eventdashboard/inbounderror-list.js'));
                    }]
                }
            })
            .state('app.eventdashboardtab.inboundignored', {
                url: '/inboundignored',
                title: 'Inbound Ignored',
                templateUrl: helper.basepath('emr/appmanager/eventdashboard/inboundignore-list.html'),
                controller: 'inboundIgnoreListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appmanager/eventdashboard/inboundignore-list.js'));
                    }]
                }
            })
            .state('app.surgeryregisters', {
                url: '/surgeryregisters',
                title: 'Surgery Register',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/otregister-list.html'),
                controller: 'otregisterListController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/otregister-list.js'));
                    }]
                }
            })
            .state('app.otworklists', {
                url: '/OTWorklists',
                title: 'MRD Worklists',
                templateUrl: helper.basepath('emr/surgerymanagement/otworklist/ot-worklist.html'),
                controller: 'otworkListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otworklist/ot-worklist.js'));
                    }]
                }
            })
            .state('app.otregistertab', {
                url: 'otregistertab/:id',
                params: {
                    eid: -1,
                    pid: -1,
                    otidentifier: null,
                    doctorid: -1,
                    doctorname: null,
                    wardid: -1,
                    roomid: -1,
                    bedid: -1,
                    otroomid: -1,
                    patientdispenseid: -1,
                    storeid: -1
                },
                title: 'OT Register',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/otregistertab.html'),
                controller: 'otregisterTabController as tabvm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/otregistertab.js'));
                    }]
                }
            })
            .state('app.otregistertab.otregister', {
                url: 'otregistertab/otdetails:id',
                params: {
                    id: '',
                    eid: null
                },
                title: 'OT Details',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/otregister-form.html'),
                controller: 'otregisterFormController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/otregister-form.js'));
                    }]
                }
            })
            .state('app.otregistertab.equipmentsused', {
                url: 'otregistertab/equipmentsused:id',
                title: 'Equipments Used',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/equipmentused.html'),
                controller: 'EquipmentUsedController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/equipmentused.js'));
                    }]
                }
            })
            .state('app.otregistertab.materialrequests', {
                url: 'otregistertab/materialrequests:id',
                title: 'Material Requests',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/materialrequests.html'),
                controller: 'materialRequestListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/materialrequests.js'));
                    }]
                }
            })
            .state('app.otregistertab.materialissues', {
                url: 'otregistertab/materialissues:id',
                title: 'Material Issues',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/materialissues.html'),
                controller: 'materialIssueListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/materialissues.js'));
                    }]
                }
            })
            .state('app.otregistertab.materialreturns', {
                url: 'otregistertab/materialreturns:id',
                title: 'Material Returns',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/materialreturns.html'),
                controller: 'materialReturnListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/materialreturns.js'));
                    }]
                }
            })
            .state('app.otregistertab.surgicalnote', {
                url: 'otregistertab/surgicalnote:id',
                title: 'Surgicalnote',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/surgicalnote.html'),
                controller: 'SurgicalNoteController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/surgicalnote.js'));
                    }]
                }
            })
            .state('app.otregistertab.anesthesiannote', {
                url: 'otregistertab/anesthesiannote:id',
                title: 'Anesthesiannote',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/anesthesiannote.html'),
                controller: 'AnesthesianNoteController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/anesthesiannote.js'));
                    }]
                }
            })
            .state('app.otregistertab.documents', {
                url: 'otregistertab/documents:id',
                title: 'Documents',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/otdocuments.html'),
                controller: 'otDocumentController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/otdocuments.js'));
                    }]
                }
            })
            .state('app.otregistertab.otnotes', {
                url: 'otregistertab/otnotes:id',
                title: 'OTNOTES',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/otconsultations/consultation.html'),
                controller: 'otconsultationController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(
                            [helper.basepath('emr/surgerymanagement/otregister/otconsultations/consultation.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/allergy/cn-allergy-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/chiefcomplaint/cn-chiefcomplaint-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/question/cn-question-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/condition/cn-condition-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/procedure/cn-procedure-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/document/cn-document-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/familycondition/cn-familycondition-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/socialhistory/cn-socialhistory-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/familysocialhistory/cn-familysocialhistory-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/immunization/cn-immunization-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/vital/cn-vital-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/prescription/cn-prescription-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/order/cn-order-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/labresults/cn-labresults-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/radiologyresults/cn-radiologyresults-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/dietplan/cn-dietplan-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/followup/cn-followup-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/diagnosis/cn-diagnosis-section.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/reviewnotes/reviewnotes.js'),
                                helper.basepath('emr/surgerymanagement/otregister/otconsultations/sections/annotations/cn-annotation-section.js')
                            ]);
                    }]
                }
            })
            .state('app.otregistertab.materialrequest', {
                url: '/materialrequest/:id',
                title: 'Material Request',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/materialrequest.html'),
                controller: 'materialRequestFormController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/materialrequest.js'));
                    }]
                }
            })
            .state('app.otregistertab.materialissue', {
                url: '/materialissue/:id',
                title: 'Material Issue',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/materialissue.html'),
                controller: 'materialIssueFormController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/materialissue.js'));
                    }]
                }
            })
            .state('app.otregistertab.materialreturn', {
                url: '/materialreturn/:id',
                title: 'Material Return',
                templateUrl: helper.basepath('emr/surgerymanagement/otregister/materialreturn.html'),
                controller: 'materialReturnFormController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/surgerymanagement/otregister/materialreturn.js'));
                    }]
                }
            })
            .state('app.threewaymatchings', {
                url: '/threewaymatching-list',
                title: 'Threeway Matching',
                templateUrl: helper.basepath('inventory/threewaymatching/threewaymatching-list.html'),
                controller: 'threewayMatchingListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inventory/threewaymatching/threewaymatching-list.js'));
                    }]
                }
            })
            .state('app.threewaymatching', {
                url: '/threewaymatching-form',
                title: 'Threeway Matching',
                templateUrl: helper.basepath('inventory/threewaymatching/threewaymatching-form.html'),
                controller: 'threewayMatchingFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inventory/threewaymatching/threewaymatching-form.js'));
                    }]
                }
            })
            .state('app.currentinpatient', {
                url: '/inpatient',
                title: 'In patients',
                templateUrl: helper.basepath('emr/registration/currentinpatients/currentinpatients.html'),
                controller: 'currentinpatientsController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/registration/currentinpatients/currentinpatients.js'));
                    }]
                }
            })
            .state('app.pendingdischarges', {
                url: '/pendingdischarges',
                title: 'Pending patients',
                templateUrl: helper.basepath('emr/registration/pendingdischarges/pendingdischarges.html'),
                controller: 'pendingdischargesController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/registration/pendingdischarges/pendingdischarges.js'));
                    }]
                }
            })
            .state('app.doctorprescription', {
                url: '/doctorprescription',
                title: 'Precriptions',
                templateUrl: helper.basepath('emr/registration/prescriptions/prescriptions.html'),
                controller: 'prescriptionsController as vm',
                params: {
                    context: 'main'
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/registration/prescriptions/prescriptions.js'));
                    }]
                }
            })
            .state('app.doctorsprescription-form', {
                url: '/doctorsprescription/',
                title: 'Patient Prescription',
                templateUrl: helper.basepath('emr/registration/prescriptions/doctorprescribe-form.html'),
                controller: 'DoctorprescriptionFormController as vm',
                params: {
                    pid: null,
                    eid: null,
                    id: null,
                    doctid: null,
                    deptid: null
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/registration/prescriptions/doctorprescribe-form.js'));
                    }]
                }
            })
            .state('app.labresultreviews', {
                url: '/labresults',
                title: 'Lab Reults',
                templateUrl: helper.basepath('emr/doctordashboardsections/results-section/lab-results.html'),
                controller: 'LabResultReviewController as vm',
                params: {
                    context: ''
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/doctordashboardsections/results-section/lab-results.js'));
                    }]
                }
            })
            .state('app.labresultreview-form', {
                url: '/labresults',
                title: 'Lab Reults',
                templateUrl: helper.basepath('emr/doctordashboardsections/results-section/labresultreview.html'),
                controller: 'LabResultReviewFormController as vm',
                params: {
                    id: null,
                    eid: null,
                    pid: null
                },
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/doctordashboardsections/results-section/labresultreview.js'));
                    }]
                }
            })
            .state('app.radiologyresults', {
                url: '/radiologyresults',
                title: 'Radiology Reults',
                templateUrl: helper.basepath('emr/doctordashboardsections/radiologyresults/radiology-results.html'),
                controller: 'RadiologyResultReviewController as vm',
                params: {
                    context: 'main'
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/doctordashboardsections/radiologyresults/radiology-results.js'));
                    }]
                }
            })
            .state('app.radiologyresultreview-form', {
                url: '/radiologyresults',
                title: 'Radiology Reults',
                templateUrl: helper.basepath('emr/doctordashboardsections/radiologyresults/radiologyresultreview.html'),
                controller: 'RadiologyResultReviewFormController as vm',
                params: {
                    id: null,
                    eid: null,
                    pid: null
                },
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/doctordashboardsections/radiologyresults/radiologyresultreview.js'));
                    }]
                }
            })
            .state('app.endoscopyresultreview', {
                url: '/endoscopyresults',
                title: 'Endoscopy Reults',
                templateUrl: helper.basepath('emr/doctordashboardsections/endoscopyresults/endoscopyresult.html'),
                controller: 'EndoscopyResultReviewController as vm',
                params: {
                    context: 'main'
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/doctordashboardsections/endoscopyresults/endoscopyresult.js'));
                    }]
                }
            })
            .state('app.endoscopyresultreview-form', {
                url: '/endoscopyresults',
                title: 'Endoscopy Reults',
                templateUrl: helper.basepath('emr/doctordashboardsections/endoscopyresults/endoscopyresultreview.html'),
                controller: 'EndoscopyResultreviewFormController as vm',
                params: {
                    id: null,
                    eid: null,
                    pid: null
                },
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/doctordashboardsections/endoscopyresults/endoscopyresultreview.js'));
                    }]
                }
            })
            .state('app.abnormallabresults', {
                url: '/abnormallabresults',
                title: 'Abnormal Lab Reults',
                templateUrl: helper.basepath('emr/doctordashboardsections/abnormalresults/abnormal-labresult.html'),
                controller: 'AbnormalResultController as vm',
                params: {
                    context: 'main'
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/doctordashboardsections/abnormalresults/abnormal-labresult.js'));
                    }]
                }
            })
            .state('app.abnormalresultreview', {
                url: '/abnormallabresults',
                title: 'Abnormal Lab Reults',
                templateUrl: helper.basepath('emr/doctordashboardsections/abnormalresults/abnormalresult-review.html'),
                controller: 'AbnormalReviewFormController as vm',
                params: {
                    id: null,
                    eid: null,
                    pid: null
                },
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/doctordashboardsections/abnormalresults/abnormalresult-review.js'));
                    }]
                }
            })
            .state('app.otdoctornotes', {
                url: '/otdoctornotes',
                title: 'otdoctornotes',
                templateUrl: helper.basepath('emr/doctordashboardsections/reviewotnotes/reviewotnotes.html'),
                controller: 'OtNoteReviewController as vm',
                params: {
                    context: ''
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/doctordashboardsections/reviewotnotes/reviewotnotes.js'));
                    }]
                }
            })
            .state('app.otdoctornotes-form', {
                url: '/otdoctornotesreview',
                title: 'otdoctornotesreview',
                templateUrl: helper.basepath('emr/doctordashboardsections/reviewotnotes/otdetail-review.html'),
                controller: 'OtDetailReviewController as vm',
                params: {
                    id: null,
                    eid: null,
                    pid: null
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/doctordashboardsections/reviewotnotes/otdetail-review.js'));
                    }]
                }
            })
            .state('patientemr.dietplantab', {
                url: '/dietplan/:id',
                params: {
                    id: '0'
                },
                title: 'Patient Diet Plan',
                templateUrl: helper.basepath('emr/EMR/patientdietplan/dietplan-tab.html'),
                controller: 'dietplanTabController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/patientdietplan/dietplan-tab.js'));
                    }]
                }
            })
            .state('patientemr.dietplantab.dietplan', {
                url: '/dietplan',
                title: 'Patient Dietplan',
                templateUrl: helper.basepath('emr/EMR/patientdietplan/dietplan-list.html'),
                controller: 'patientDietplanController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/patientdietplan/dietplan-list.js'));
                    }]
                }
            })
            .state('patientemr.patientdietnbm', {
                url: '/manageNBM',
                title: 'patient NBM',
                templateUrl: helper.basepath('emr/EMR/patientdietnbm/patientdietnbm-list.html'),
                controller: 'patientDietnbmListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/EMR/patientdietnbm/patientdietnbm-list.js'));
                    }]
                }
            })
            .state('app.dietmultipleorders', {
                url: '/dietmultipleorders',
                title: 'dietmultipleorders',
                templateUrl: helper.basepath('inpatient/dietmultipleorder/dietmultipleorders/dietmultipleorders.html'),
                controller: 'dietMultipleordersController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/dietmultipleorder/dietMultipleorders/dietmultipleorders.js'));
                    }]
                }
            })
            .state('app.feedbackmasters', {
                url: '/feedbackmasters',
                title: 'Feedback Masters',
                templateUrl: helper.basepath('emr/generalmaster/feedback/feedbackmasters.html'),
                controller: 'feedbackListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/generalmaster/feedback/feedbackmasters.js'));
                    }]
                }
            })
            .state('app.prechecklist', {
                url: '/checklist',
                title: 'Check List',
                templateUrl: helper.basepath('emr/generalmaster/checklist/prechecklist-list.html'),
                controller: 'checkListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/generalmaster/checklist/prechecklist-list.js'));
                    }]
                }
            })
            // .state('app.facilitytab.smssettings', {
            //     url: '/smssettings',
            //     title: 'smssettings',
            //     templateUrl: helper.basepath('emr/appmanager/facilitys/hospitalsmssetting.html'),
            //     controller: 'smssettingsFormController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/appmanager/facilitys/hospitalsmssetting.js'));
            //         }]
            //     }
            // })
            // .state('app.facilitytab.billsetting', {
            //     url: '/billsetting',
            //     title: 'billsetting',
            //     templateUrl: helper.basepath('emr/appmanager/facilitys/hospitalbillsetting.html'),
            //     controller: 'billsettingFormController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/appmanager/facilitys/hospitalbillsetting.js'));
            //         }]
            //     }
            // })
            // .state('app.facilitytab.printsetting', {
            //     url: '/printsetting',
            //     title: 'printsetting',
            //     templateUrl: helper.basepath('emr/appmanager/facilitys/hospitalprintsetting.html'),
            //     controller: 'printsettingFormController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/appmanager/facilitys/hospitalprintsetting.js'));
            //         }]
            //     }
            // })
            // .state('app.facilitytab.generalsetting', {
            //     url: '/generalsetting',
            //     title: 'generalsetting',
            //     templateUrl: helper.basepath('emr/appmanager/facilitys/hospitalgeneralsetting.html'),
            //     controller: 'generalsettingFormController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/appmanager/facilitys/hospitalgeneralsetting.js'));
            //         }]
            //     }
            // })
            // .state('app.facilitytab.holidaysetting', {
            //     url: '/holidaysetting',
            //     title: 'holidaysetting',
            //     templateUrl: helper.basepath('emr/appmanager/facilitys/holiday.html'),
            //     controller: 'facilityHolidayListController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/appmanager/facilitys/holiday.js'));
            //         }]
            //     }
            // })
            // .state('app.facilitytab.billingsetting', {
            //     url: '/billingsetting',
            //     title: 'billingsetting',
            //     templateUrl: helper.basepath('emr/appmanager/facilitys/billingsetting.html'),
            //     controller: 'billingSettingFormController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/appmanager/facilitys/billingsetting.js'));
            //         }]
            //     }
            // })
            // .state('app.facilitytab.smssetting', {
            //     url: '/ smssetting',
            //     title: 'smssetting',
            //     templateUrl: helper.basepath('emr/appmanager/facilitys/smssetting.html'),
            //     controller: 'smssettingFormController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/appmanager/facilitys/smssetting.js'));
            //         }]
            //     }
            // })
            // .state('app.dashboardtab', {
            //     url: '/dashboard',
            //     title: 'Dashboard',
            //     templateUrl: helper.basepath('emr/dashboard/dashboardtab.html'),
            //     controller: 'dashboardTabController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/dashboard/dashboardtab.js'));
            //         }]
            //     }
            // })
            // .state('app.dashboardtab.dashboard', {
            //     url: '/dashboard',
            //     title: '/Dashboard',
            //     templateUrl: helper.basepath('emr/dashboard/dashboard.html'),
            //     controller: 'dashboardFormController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/dashboard/dashboard.js'));
            //         }]
            //     }
            // })
            // .state('app.dashboardtab.inventorydashboard', {
            //     url: '/inventorydashboard',
            //     title: '/Inventory Dashboard',
            //     templateUrl: helper.basepath('emr/dashboard/inventorydashboard.html'),
            //     controller: 'inventorydashboardFormController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/dashboard/inventorydashboard.js'));
            //         }]
            //     }
            // })
            .state('app.aepatientlist', {
                url: '/AccidentEmergency',
                title: 'Accident & Emergency',
                templateUrl: helper.basepath('emr/accidentemergency/aepatientlist/aepatient-list.html'),
                controller: 'aepatientListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/accidentemergency/aepatientlist/aepatient-list.js'));
                    }]
                }
            })
            .state('app.aeregistrationtab', {
                url: '/A&ERegistration/:id',
                title: 'A & E Registration',
                templateUrl: helper.basepath('emr/accidentemergency/aepatientregistration/aepatientregistrationtab.html'),
                controller: 'aepatientTabController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/accidentemergency/aepatientregistration/aepatientregistrationtab.js'));
                    }]
                }
            })
            // .state('app.aeregistrationtab.aeregistration', {
            //     url: '/AccidentEmergency',
            //     title: 'Accident & Emergency',
            //     templateUrl: helper.basepath('emr/accidentemergency/aepatientregistration/aepatientregistration.html'),
            //     controller: 'aepatientRegistrationController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/accidentemergency/aepatientregistration/aepatientregistration.js'));
            //         }]
            //     }
            // })
            .state('app.aeregistrationtab.mlc', {
                url: '/AccidentEmergency',
                title: 'Accident & Emergency',
                templateUrl: helper.basepath('emr/accidentemergency/aepatientregistration/mlc-form.html'),
                controller: 'mlcFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/accidentemergency/aepatientregistration/mlc-form.js'));
                    }]
                }
            })
            .state('app.casualty', {
                url: '/masscasualty',
                title: 'Mass Casualty',
                templateUrl: helper.basepath('emr/accidentemergency/casualty/casualty.html'),
                controller: 'massCasualtyController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/accidentemergency/casualty/casualty.js'));
                    }]
                }
            })
            .state('app.triages', {
                url: '/triage',
                title: 'Triage',
                params: {
                    aeid: '',
                    eid: ''
                },
                templateUrl: helper.basepath('emr/accidentemergency/triage/triage-list.html'),
                controller: 'triageListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/accidentemergency/triage/triage-list.js'));
                    }]
                }
            })
            // .state('app.aebilling', {
            //     url: '/aebilling',
            //     title: 'A&E Billing',
            //     params: {
            //         aeid: '',
            //         eid: ''
            //     },
            //     templateUrl: helper.basepath('emr/accidentemergency/aebilling/aebilling-list.html'),
            //     controller: 'aebillingListController as vm',
            //     resolve: {
            //         loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            //             return $ocLazyLoad.load(helper.basepath('emr/accidentemergency/aebilling/aebilling-list.js'));
            //         }]
            //     }
            // })
            .state('app.dummyvisits', {
                url: '/additionalvisittab',
                title: 'Dummy Visits',
                templateUrl: helper.basepath('inpatient/mrd/dummyvisits/dummyvisittab.html'),
                controller: 'dummyVisittabController as tabvm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/dummyvisits/dummyvisittab.js'));
                    }]
                }
            })
            .state('app.dummyvisits.additionalopvisit', {
                url: '/additionalopvisit',
                title: 'Dummy OP Visits',
                templateUrl: helper.basepath('inpatient/mrd/dummyvisits/dummyopvisits.html'),
                controller: 'dummyOPVisitsController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/dummyvisits/dummyopvisits.js'));
                    }]
                }
            })
            .state('app.dummyvisits.additionalipvisit', {
                url: '/additionalipvisit',
                title: 'Dummy IP Visits',
                templateUrl: helper.basepath('inpatient/mrd/dummyvisits/dummyipvisits.html'),
                controller: 'dummyIPVisitsController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/dummyvisits/dummyipvisits.js'));
                    }]
                }
            })
            .state('app.dummyvisits.additionaliplaborder', {
                url: '/additionaliplaborder',
                title: 'Dummy IP LAB Order',
                templateUrl: helper.basepath('inpatient/mrd/dummyvisits/dummyiplaborder.html'),
                controller: 'dummyIPLabOrderController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/mrd/dummyvisits/dummyiplaborder.js'));
                    }]
                }
            })

        .state('app..doctorappointment', {
                url: '/doctorappointment',
                title: 'doctorappointment',
                templateUrl: helper.basepath('emr/appointment/doctordashboard/appointment.html'),
                controller: 'doctorAppointmentsController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/appointment/doctordashboard/appointment.js'));
                    }]
                }
            })
            .state('app.lisdashboard', {
                url: '/dashboard/:tp',
                title: 'dashboard',
                templateUrl: helper.basepath('lis/dashboard/dashboard.html'),
                controller: 'DashboardController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('lis/dashboard/dashboard.js'));
                    }]
                }
            })
            .state('app.risdashboard', {
                url: '/dashboard/:tp',
                title: 'dashboard',
                templateUrl: helper.basepath('emr/ordermanagement/dashboard/dashboard.html'),
                controller: 'DashboardController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/ordermanagement/dashboard/dashboard.js'));
                    }]
                }
            })
            .state('app.endodashboard', {
                url: '/dashboard/:tp',
                title: 'dashboard',
                templateUrl: helper.basepath('emr/ordermanagement/dashboard/dashboard.html'),
                controller: 'DashboardController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/ordermanagement/dashboard/dashboard.js'));
                    }]
                }
            })
            .state('patientportal.Healthsummary', {
                url: '/Healthsummary/:tp',
                title: 'Health Summary',
                templateUrl: helper.basepath('patientportal/ehealthsummary/healthsummary.html'),
                controller: 'ehealthSummaryController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('patientportal/ehealthsummary/healthsummary.js'));
                    }]
                }
            })
            .state('app.inventorydashboard', {
                url: '/inventorydashboard/:tp',
                title: 'Inventory dashboard',
                templateUrl: helper.basepath('inventory/dashboard/inventorydashboard.html'),
                controller: 'inventorydashboardController',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inventory/dashboard/inventorydashboard.js'));
                    }]
                }
            })
            .state('app.dietdashboard', {
                url: '/dietdashboard/:tp',
                title: 'Diet Dashboard',
                templateUrl: helper.basepath('inpatient/dietdashboard/dietdashboard.html'),
                controller: 'dietdashboardController',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('inpatient/dietdashboard/dietdashboard.js'));
                    }]
                }
            })
            .state('patientportal.newappointments', {
                url: '/newappointments',
                title: 'new appointments',
                templateUrl: helper.basepath('patientportal/appointments/newappointments/newappointments.html'),
                controller: 'newappointments',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('patientportal/appointments/newappointments/newappointments.js'));
                    }]
                }
            })
            .state('patientportal.specialities', {
                url: '/specialities',
                title: 'specialities',
                templateUrl: helper.basepath('patientportal/appointments/specialities/specialities.html'),
                controller: 'newappointments',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('patientportal/appointments/specialities/specialities.js'));
                    }]
                }
            })
            .state('patientportal.doctorslist', {
                url: '/doctorslist',
                title: 'doctorslist',
                templateUrl: helper.basepath('patientportal/appointments/doctorslist/doctorslist.html'),
                controller: 'doctorslist',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('patientportal/appointments/doctorslist/doctorslist.js'));
                    }]
                }
            })
            .state('patientportal.doctordetails', {
                url: '/doctordetails',
                title: 'doctordetails',
                templateUrl: helper.basepath('patientportal/appointments/doctordetails/doctordetails.html'),
                controller: 'doctorslist',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('patientportal/appointments/doctordetails/doctordetails.js'));
                    }]
                }
            })
            .state('app.clinicalmanagement', {
                url: '/clinicaldecisionmanagement',
                title: 'Clinical Decision Management',
                templateUrl: helper.basepath('emr/clinicaldecisionmanagement/cdm-list.html'),
                controller: 'ClinicalListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/clinicaldecisionmanagement/cdm-list.js'));
                    }]
                }
            })
            .state('app.clinicalmanagements', {
                url: '/clinicaldecisionmanagements/:id',
                title: 'Clinical Decision Management',
                templateUrl: helper.basepath('emr/clinicaldecisionmanagement/cdm-form.html'),
                controller: 'ClinicalFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/clinicaldecisionmanagement/cdm-form.js'));
                    }]
                }
            })
            .state('app.cashcounter', {
                url: '/cashcounter',
                title: 'cashcounter',
                templateUrl: helper.basepath('emr/clinicalmaster/cashcounter/cashcounter.html'),
                controller: 'CashCounterController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/clinicalmaster/cashcounter/cashcounter.js'));
                    }]
                }
            })
            .state('patientportal.contactdetails', {
                url: '/contactdetails',
                title: 'contactdetails',
                templateUrl: helper.basepath('patientportal/appointments/contactdetails/contactdetails.html'),
                controller: 'contactdetails',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('patientportal/appointments/contactdetails/contactdetails.js'));
                    }]
                }
            })
            .state('app.opddashboard', {
                url: '/opddashboard',
                title: 'opddashboard',
                templateUrl: helper.basepath('emr/dashboard/opddashboard.html'),
                controller: 'OpddashboardController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/dashboard/opddashboard.js'));
                    }]
                }
            })
            .state('app.clinicalfindings', {
                url: '/clinicalfindings',
                title: 'clinicalfindings',
                templateUrl: helper.basepath('emr/clinicalmaster/clinicalfindings/clinicalfindings-list.html'),
                controller: 'ClinicalFindingListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/clinicalmaster/clinicalfindings/clinicalfindings-list.js'));
                    }]
                }
            })
            .state('app.impressionmaster', {
                url: '/impressionmaster',
                title: 'impressionmaster',
                templateUrl: helper.basepath('emr/clinicalmaster/impressionmaster/impressionmaster-list.html'),
                controller: 'ImpressionMasterListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/clinicalmaster/impressionmaster/impressionmaster-list.js'));
                    }]
                }
            })
            .state('app.referralfeedbacktab', {
                url: '/referralfeedbacktab',
                title: 'Referral Feedback',
                templateUrl: helper.basepath('emr/medicalcertificate/referralfeedback/referralfeedbacktab.html'),
                controller: 'ReferralFeedbackTabController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/referralfeedback/referralfeedbacktab.js'));
                    }]
                }
            })
            .state('app.referralfeedbacktab.referrallist', {
                url: '/referrallist',
                title: 'Referral Feedback',
                templateUrl: helper.basepath('emr/medicalcertificate/referralfeedback/referrallist.html'),
                controller: 'ReferralListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/referralfeedback/referrallist.js'));
                    }]
                }
            })
            .state('app.referralfeedbacktab.referralfeedbacks', {
                url: '/referralfeedbacks',
                title: 'Referral Feedback',
                templateUrl: helper.basepath('emr/medicalcertificate/referralfeedback/referralfeedback-list.html'),
                controller: 'referralfeedbackListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/referralfeedback/referralfeedback-list.js'));
                    }]
                }
            })
            .state('app.referralfeedback', {
                url: '/referralfeedback/:id',
                title: 'Referral Feedback',
                templateUrl: helper.basepath('emr/medicalcertificate/referralfeedback/referralfeedback-form.html'),
                controller: 'referralfeedbackFormController as vm',
                params: {
                    id: null,
                    pid: null,
                    eid: null
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/medicalcertificate/referralfeedback/referralfeedback-form.js'));
                    }]
                }
            })
            .state('app.claimprocess', {
                url: '/claimprocess',
                title: 'Claim Process',
                templateUrl: helper.basepath('billing/claimmanagement/claimprocess.html'),
                controller: 'claimprocessController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('billing/claimmanagement/claimprocess.js'));
                    }]
                }
            })
            .state('app.claimprocessform', {
                url: '/claimprocessform',
                title: 'Claim ProcessForm',
                templateUrl: helper.basepath('billing/claimmanagement/claimprocessform.html'),
                controller: 'claimprocessFormController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('billing/claimmanagement/claimprocessform.js'));
                    }]
                }
            })
            .state('app.newticket', {
                url: '/newticket',
                title: 'newticket',
                templateUrl: helper.basepath('emr/assetmanagement/helpdesk/newticket/newticket.html'),
                controller: 'newticketController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/assetmanagement/helpdesk/newticket/newticket.js'));
                    }]
                }
            })
            .state('app.systemexamination', {
                url: '/systemexamination',
                title: 'systemexamination',
                templateUrl: helper.basepath('emr/clinicalmaster/systemexamination/systemexamination-list.html'),
                controller: 'SystemExaminationListController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/clinicalmaster/systemexamination/systemexamination-list.js'));
                    }]
                }
            })
            .state('app.reports', {
                url: '/reports',
                title: 'Reports',
                templateUrl: helper.basepath('reports/reports.html'),
                controller: 'ReportController as vm',
                params: {
                    context: ''
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/reports.js'));
                    }]
                }
            })
            .state('app.ipopreports', {
                url: '/ipopreports',
                title: 'IP&OPReports',
                templateUrl: helper.basepath('dashboard/frontoffice/ipopreports.html'),
                controller: 'ipopReportController as vm',
                params: {
                    context: ''
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('dashboard/frontoffice/ipopreports.js'));
                    }]
                }
            })
            .state('app.patientlistreports', {
                url: '/patientlistreports',
                title: 'Patients List Reports',
                templateUrl: helper.basepath('reports/patientlistreport.html'),
                controller: 'PatientListReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/patientlistreport.js'));
                    }]
                }
            })
            .state('app.collectionreports', {
                url: '/collectionreports',
                title: 'Collection Reports',
                templateUrl: helper.basepath('reports/collectionreport.html'),
                controller: 'CollectionReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/collectionreport.js'));
                    }]
                }
            })
            .state('app.dailybillreports', {
                url: '/dailybillreports',
                title: 'Daily Bill Reports',
                templateUrl: helper.basepath('reports/dailybillreport.html'),
                controller: 'DailybillReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/dailybillreport.js'));
                    }]
                }
            })
            .state('app.discountreports', {
                url: '/discountreports',
                title: 'Discount Reports',
                templateUrl: helper.basepath('reports/discountreport.html'),
                controller: 'DiscountReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/discountreport.js'));
                    }]
                }
            })
            .state('app.outstandingreports', {
                url: '/outstandingreports',
                title: 'Outstanding Reports',
                templateUrl: helper.basepath('reports/outstandingreport.html'),
                controller: 'OutstandingReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/outstandingreport.js'));
                    }]
                }
            })
            .state('app.labsummaryreports', {
                url: '/labsummaryreports',
                title: 'Labsummary Reports',
                templateUrl: helper.basepath('reports/labsummaryreport.html'),
                controller: 'LabsummaryReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/labsummaryreport.js'));
                    }]
                }
            })
            .state('app.collectionreportbyusers', {
                url: '/collectionreportbyusers',
                title: 'Collection Report By Users',
                templateUrl: helper.basepath('reports/collectionreportbyuser.html'),
                controller: 'CollectionReportByUsersController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/collectionreportbyuser.js'));
                    }]
                }
            })
            .state('app.cancelreport', {
                url: '/cancelreport',
                title: 'Cancel Report',
                templateUrl: helper.basepath('reports/cancelreport.html'),
                controller: 'CancelReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/cancelreport.js'));
                    }]
                }
            })
            .state('app.refundreport', {
                url: '/refundreport',
                title: 'Refund Report',
                templateUrl: helper.basepath('reports/refundreport.html'),
                controller: 'RefundReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/refundreport.js'));
                    }]
                }
            })
            .state('app.usermasterreport', {
                url: '/usermasterreport',
                title: 'Refund Report',
                templateUrl: helper.basepath('reports/usermasterreport.html'),
                controller: 'UserMasterReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/usermasterreport.js'));
                    }]
                }
            })
            .state('app.purchaseorderreport', {
                url: '/purchaseorderreport',
                title: 'PO Report',
                templateUrl: helper.basepath('reports/purchaseorderreport.html'),
                controller: 'PurchaseOrderReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/purchaseorderreport.js'));
                    }]
                }
            })
            .state('app.grnreport', {
                url: '/grnreport',
                title: 'GRN Report',
                templateUrl: helper.basepath('reports/grnreport.html'),
                controller: 'GRNReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/grnreport.js'));
                    }]
                }
            })
            .state('app.pendingporeport', {
                url: '/pendingporeport',
                title: 'Pending PO Report',
                templateUrl: helper.basepath('reports/pendingporeport.html'),
                controller: 'PendingPOReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pendingporeport.js'));
                    }]
                }
            })
            .state('app.stockissuevocherreport', {
                url: '/stockissuevocherreport',
                title: 'StockIssueVocher Report',
                params: {
                    context: ''
                },
                templateUrl: helper.basepath('reports/stockissuevocherreport.html'),
                controller: 'StockIssueVocherReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/stockissuevocherreport.js'));
                    }]
                }
            })
            .state('app.stockindentreport', {
                url: '/stockindentreport',
                title: 'StockIndent Report',
                params: { context: '' },
                templateUrl: helper.basepath('reports/stockindentreport.html'),
                controller: 'StockIndentReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/stockindentreport.js'));
                    }]
                }
            })
            .state('app.medicineexpiryreport', {
                url: '/medicineexpiryreport',
                title: 'Medicine Expiry Report',
                params: {
                    context: ''
                },
                templateUrl: helper.basepath('reports/medicineexpiryreport.html'),
                controller: 'MedicineExpiryReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/medicineexpiryreport.js'));
                    }]
                }
            })
            .state('app.medicineexpiredreport', {
                url: '/medicineexpiredreport',
                title: 'Medicine Expired Report',
                params: {
                    context: ''
                },
                templateUrl: helper.basepath('reports/medicineexpiredreport.html'),
                controller: 'MedicineExpiredReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/medicineexpiredreport.js'));
                    }]
                }
            })
            .state('app.pharmacystockreport', {
                url: '/pharmacystockreport',
                title: 'Pharmacy Stock Report',
                templateUrl: helper.basepath('reports/pharmacystockreport.html'),
                controller: 'PharmacyStockReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacystockreport.js'));
                    }]
                }
            })
            .state('app.pharmacybilldetailreport', {
                url: '/pharmacybilldetailreport',
                title: 'Pharmacy Bill Detail Report',
                templateUrl: helper.basepath('reports/pharmacybilldetailreport.html'),
                controller: 'PharmacyBillDetailReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacybilldetailreport.js'));
                    }]
                }
            })
            .state('app.pharmacydiscountreport', {
                url: '/pharmacydiscountreport',
                title: 'Pharmacy Discount Report',
                templateUrl: helper.basepath('reports/pharmacydiscountreport.html'),
                controller: 'PharmacyDiscountReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacydiscountreport.js'));
                    }]
                }
            })
            .state('app.pharmacyduereport', {
                url: '/pharmacyduereport',
                title: 'Pharmacy Due Report',
                templateUrl: helper.basepath('reports/pharmacyduereport.html'),
                controller: 'PharmacyDueReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacyduereport.js'));
                    }]
                }
            })
            .state('app.pharmacyreturnreport', {
                url: '/pharmacyreturnreport',
                title: 'Pharmacy Return Report',
                templateUrl: helper.basepath('reports/pharmacyreturnreport.html'),
                controller: 'PharmacyReturnReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacyreturnreport.js'));
                    }]
                }
            })
            .state('app.pharmacyschedulereport', {
                url: '/pharmacyschedulereport',
                title: 'Pharmacy Schedule Report',
                templateUrl: helper.basepath('reports/pharmacyschedulereport.html'),
                controller: 'PharmacyScheduleReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacyschedulereport.js'));
                    }]
                }
            })
            .state('app.pharmacyschedulexreport', {
                url: '/pharmacyschedulexreport',
                title: 'Pharmacy Schedule X Report',
                templateUrl: helper.basepath('reports/pharmacyschedulexreport.html'),
                controller: 'PharmacyScheduleXReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacyschedulexreport.js'));
                    }]
                }
            })
            .state('app.pharmacycardcollectionreport', {
                url: '/pharmacycardcollectionreport',
                title: 'Pharmacy Card Collection Report',
                templateUrl: helper.basepath('reports/pharmacycardcollectionreport.html'),
                controller: 'PharmacyCardCollectionReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacycardcollectionreport.js'));
                    }]
                }
            })
            .state('app.pharmacycollectionreport', {
                url: '/pharmacycollectionreport',
                title: 'Pharmacy Collection Report',
                templateUrl: helper.basepath('reports/pharmacycollectionreport.html'),
                controller: 'PharmacyCollectionReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacycollectionreport.js'));
                    }]
                }
            })
            .state('app.pharmacyrefundreport', {
                url: '/pharmacyrefundreport',
                title: 'Pharmacy Refund Report',
                templateUrl: helper.basepath('reports/pharmacyrefundreport.html'),
                controller: 'PharmacyRefundReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacyrefundreport.js'));
                    }]
                }
            })
            .state('app.pharmacycollectionsummaryreport', {
                url: '/pharmacycollectionsummaryreport',
                title: 'Pharmacy Collection Summary Report',
                templateUrl: helper.basepath('reports/pharmacycollectionsummaryreport.html'),
                controller: 'PharmacyCollectionSummaryReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacycollectionsummaryreport.js'));
                    }]
                }
            })
            .state('app.serviceitemreport', {
                url: '/serviceitemreport',
                title: 'Service Item Report',
                templateUrl: helper.basepath('reports/serviceitemreport.html'),
                controller: 'serviceItemReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/serviceitemreport.js'));
                    }]
                }
            })
            .state('app.opserviceitemreport', {
                url: '/opserviceitemreport',
                title: 'Op Service Item Report',
                templateUrl: helper.basepath('reports/opserviceitemreport.html'),
                controller: 'OPserviceItemReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/opserviceitemreport.js'));
                    }]
                }
            })
            .state('app.ipserviceitemreport', {
                url: '/ipserviceitemreport',
                title: 'ip Service Item Report',
                templateUrl: helper.basepath('reports/ipserviceitemreport.html'),
                controller: 'IPserviceItemReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/ipserviceitemreport.js'));
                    }]
                }
            })
            .state('app.purchasevendorreport', {
                url: '/purchasevendorreport',
                title: 'Purchase Vendor Report',
                templateUrl: helper.basepath('reports/purchasevendorreport.html'),
                controller: 'PurchaseVendorReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/purchasevendorreport.js'));
                    }]
                }
            })
            .state('app.purchasevendorpendingreport', {
                url: '/purchasevendorpendingreport',
                title: 'Purchase Vendor Pending Report',
                templateUrl: helper.basepath('reports/purchasevendorpendingreport.html'),
                controller: 'PurchaseVendorPendingReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/purchasevendorpendingreport.js'));
                    }]
                }
            })
            .state('app.vendordetailreport', {
                url: '/vendordetailreport',
                title: 'Vendor Detail Report',
                templateUrl: helper.basepath('reports/vendordetailreport.html'),
                controller: 'VendorDetailReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/vendordetailreport.js'));
                    }]
                }
            })
            .state('app.itemmasterreport', {
                url: '/itemmasterreport',
                title: 'Item Master Report',
                params: { context: '' },
                templateUrl: helper.basepath('reports/itemmasterreport.html'),
                controller: 'ItemMasterReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/itemmasterreport.js'));
                    }]
                }
            })
            .state('app.suppliermasterreport', {
                url: '/suppliermasterreport',
                title: 'Supplier Master Report',
                templateUrl: helper.basepath('reports/suppliermasterreport.html'),
                controller: 'SupplierMasterReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/suppliermasterreport.js'));
                    }]
                }
            })
            .state('app.storemasterreport', {
                url: '/storemasterreport',
                title: 'Store Master Report',
                templateUrl: helper.basepath('reports/storemasterreport.html'),
                controller: 'StoreMasterReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/storemasterreport.js'));
                    }]
                }
            })
            .state('app.stockmovementreport', {
                url: '/stockmovementreport',
                title: 'Stock Movement Report',
                templateUrl: helper.basepath('reports/stockmovementreport.html'),
                controller: 'StockMovementReportController as vm',
                params: {
                    context: ''
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/stockmovementreport.js'));
                    }]
                }
            })
            .state('app.purchasereturnreport', {
                url: '/purchasereturnreport',
                title: 'Purchase Return Report',
                templateUrl: helper.basepath('reports/purchasereturnreport.html'),
                controller: 'PurchaseReturnReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/purchasereturnreport.js'));
                    }]
                }
            })
            .state('app.ipadmissionreport', {
                url: '/ipadmissionreport',
                title: 'IP Admission Report',
                templateUrl: helper.basepath('reports/ipadmissionreport.html'),
                params: {
                    context: ''
                },
                controller: 'IPAdmissionReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/ipadmissionreport.js'));
                    }]
                }
            })
            .state('app.ipdischargereport', {
                url: '/ipdischargereport',
                title: 'IP Discharge Report',
                templateUrl: helper.basepath('reports/ipdischargereport.html'),
                params: {
                    context: ''
                },
                controller: 'IPDischargeReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/ipdischargereport.js'));
                    }]
                }
            })
            .state('app.bedtransferreport', {
                url: '/bedtransferreport',
                title: 'Bed Transfer Report',
                templateUrl: helper.basepath('reports/bedtransferreport.html'),
                controller: 'BedTransferReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/bedtransferreport.js'));
                    }]
                }
            })
            .state('app.outpatientreport', {
                url: '/outpatientreport',
                title: 'OutPatient Report',
                templateUrl: helper.basepath('reports/outpatientreport.html'),
                controller: 'OutPatientReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/outpatientreport.js'));
                    }]
                }
            })
            .state('app.inactivepatientreport', {
                url: '/inactivepatientreport',
                title: 'InActive Patient Report',
                templateUrl: helper.basepath('reports/inactivepatientreport.html'),
                controller: 'InActivePatientReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/inactivepatientreport.js'));
                    }]
                }
            })
            .state('app.ipadmissioninsurancereport', {
                url: '/ipadmissioninsurancereport',
                title: 'IP Admission Insurance Report',
                templateUrl: helper.basepath('reports/ipadmissioninsurancereport.html'),
                controller: 'IPAdmissionInsuranceReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/ipadmissioninsurancereport.js'));
                    }]
                }
            })
            .state('app.doctorlistreport', {
                url: '/doctorlistreport',
                title: 'Doctor List Report',
                templateUrl: helper.basepath('reports/doctorlistreport.html'),
                controller: 'DoctorListReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/doctorlistreport.js'));
                    }]
                }
            })
            .state('app.insurancelistreport', {
                url: '/insurancelistreport',
                title: 'Insurance List Report',
                templateUrl: helper.basepath('reports/insurancelistreport.html'),
                controller: 'InsuranceListReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/insurancelistreport.js'));
                    }]
                }
            })
            .state('app.ipreferraldoctorreport', {
                url: '/ipreferraldoctorreport',
                title: 'IP Referral Doctor Report',
                templateUrl: helper.basepath('reports/ipreferraldoctorreport.html'),
                controller: 'IPReferralDoctorReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/ipreferraldoctorreport.js'));
                    }]
                }
            })
            .state('app.opreferraldoctorreport', {
                url: '/opreferraldoctorreport',
                title: 'OP Referral Doctor Report',
                templateUrl: helper.basepath('reports/opreferraldoctorreport.html'),
                controller: 'OPReferralDoctorReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/opreferraldoctorreport.js'));
                    }]
                }
            })
            .state('app.ipoccupancyreport', {
                url: '/ipoccupancyreport',
                title: 'IP Occupancy Report Report',
                templateUrl: helper.basepath('reports/ipoccupancyreport.html'),
                controller: 'IPOccupancyReportController as vm',
                params: {
                    context: ''
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/ipoccupancyreport.js'));
                    }]
                }
            })
            .state('app.ipoccupancybyward', {
                url: '/ipoccupancybyward',
                title: 'IP Occupancy By Ward Report',
                templateUrl: helper.basepath('reports/ipoccupancybyward.html'),
                controller: 'IPOccupancyByWardController as vm',
                params: {
                    context: ''
                },
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/ipoccupancybyward.js'));
                    }]
                }
            })
            .state('app.ippharmacyissuevoucherreport', {
                url: '/ippharmacyissuevoucherreport',
                title: 'IP Pharmacy Issue Voucher Report',
                templateUrl: helper.basepath('reports/ippharmacyissuevoucherreport.html'),
                controller: 'IPPharmacyIssueVoucherReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/ippharmacyissuevoucherreport.js'));
                    }]
                }
            })
            .state('app.ippharmacyreturnvoucherreport', {
                url: '/ippharmacyreturnvoucherreport',
                title: 'IP Pharmacy Return Voucher Report',
                templateUrl: helper.basepath('reports/ippharmacyreturnvoucherreport.html'),
                controller: 'IPPharmacyReturnVoucherReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/ippharmacyreturnvoucherreport.js'));
                    }]
                }
            })
            .state('app.stockstatusreport', {
                url: '/stockstatusreport',
                title: 'Stock Status Report',
                templateUrl: helper.basepath('reports/stockstatusreport.html'),
                controller: 'StockStatusReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/stockstatusreport.js'));
                    }]
                }
            })
            .state('app.stockstatusbatchreport', {
                url: '/stockstatusbatchreport',
                title: 'Stock Status Batch Report',
                params: {
                    context: ''
                },
                templateUrl: helper.basepath('reports/stockstatusbatchreport.html'),
                controller: 'StockStatusBatchReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/stockstatusbatchreport.js'));
                    }]
                }
            })
            .state('app.stocknonmovementreport', {
                url: '/stocknonmovementreport',
                title: 'Stock Non Movement Report',
                templateUrl: helper.basepath('reports/stocknonmovementreport.html'),
                controller: 'StockNonMovementReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/stocknonmovementreport.js'));
                    }]
                }
            })
            .state('app.stockstatusproductsummaryreport', {
                url: '/stockstatusproductsummaryreport',
                title: 'Stock Status Product Summary Report',
                templateUrl: helper.basepath('reports/stockstatusproductsummaryreport.html'),
                controller: 'StockStatusProductSummaryReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/stockstatusproductsummaryreport.js'));
                    }]
                }
            })
            .state('app.outpatientsummaryreport', {
                url: '/outpatientsummaryreport',
                title: 'OutPatient Summary Report',
                templateUrl: helper.basepath('reports/outpatientsummaryreport.html'),
                controller: 'OutPatientSummaryReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/outpatientsummaryreport.js'));
                    }]
                }
            })
            .state('app.diagnosisform', {
                url: '/diagnosisform',
                title: 'Diagnosis',
                templateUrl: helper.basepath('emr/clinicalmaster/diagnosis/diagnosis-form.html'),
                controller: 'diagnosisFormController as vm',
                resolve: {
                    $uibModalInstance: function() {
                        return null;
                    },
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('emr/clinicalmaster/diagnosis/diagnosis-form.js'));
                    }]
                }
            })
            .state('app.pharmacycollectionsummarycashier', {
                url: '/pharmacycollectionsummarycashier',
                title: 'Pharmacy Collection Summary Cashier',
                templateUrl: helper.basepath('reports/pharmacycollectionsummarycashier.html'),
                controller: 'PharmacyCollectionSummaryCashierController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacycollectionsummarycashier.js'));
                    }]
                }
            })
            .state('app.pharmacyreturnreportforotc', {
                url: '/pharmacyreturnreportforotc',
                title: 'Pharmacy Return Report for OTC',
                templateUrl: helper.basepath('reports/pharmacyreturnreportforotc.html'),
                controller: 'PharmacyReturnReportforOTCController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/pharmacyreturnreportforotc.js'));
                    }]
                }
            })
            .state('app.rackdetailsbystorereport', {
                url: '/rackdetailsbystorereport',
                title: 'Rack Details By Store Report',
                params: { context: '' },
                templateUrl: helper.basepath('reports/rackdetailsbystorereport.html'),
                controller: 'RackDetailByStoreReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/rackdetailsbystorereport.js'));
                    }]
                }
            })
            .state('app.itemreorderlistreport', {
                url: '/itemreorderlistreport',
                title: 'Item Reorder List Report',
                templateUrl: helper.basepath('reports/itemreorderlistreport.html'),
                controller: 'ItemReorderListReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/itemreorderlistreport.js'));
                    }]
                }
            })
            .state('app.producttypereport', {
                url: '/producttypereport',
                title: 'Product Type Report',
                templateUrl: helper.basepath('reports/producttypereport.html'),
                controller: 'ProductTypeReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/producttypereport.js'));
                    }]
                }
            })
            .state('app.genericmasterreport', {
                url: '/genericmasterreport',
                title: 'Generic Master Report',
                templateUrl: helper.basepath('reports/genericmasterreport.html'),
                controller: 'GenericMasterReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/genericmasterreport.js'));
                    }]
                }
            })
            .state('app.manufacturermasterreport', {
                url: '/manufacturermasterreport',
                title: 'Manufacturer Master Report',
                templateUrl: helper.basepath('reports/manufacturermasterreport.html'),
                controller: 'ManufacturerMasterReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/manufacturermasterreport.js'));
                    }]
                }
            })
            .state('app.grnreportbyitem', {
                url: '/grnreportbyitem',
                title: 'Grn Report By Item',
                templateUrl: helper.basepath('reports/grnreportbyitem.html'),
                controller: 'GrnReportByItemController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/grnreportbyitem.js'));
                    }]
                }
            })
            .state('app.invoicesummarybysupplier', {
                url: '/invoicesummarybysupplier',
                title: 'Invoice Summary By Supplier',
                templateUrl: helper.basepath('reports/invoicesummarybysupplier.html'),
                controller: 'InvoiceSummaryBySupplierController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/invoicesummarybysupplier.js'));
                    }]
                }
            })
            .state('app.stockadjustmentreport', {
                url: '/stockadjustmentreport',
                title: 'Stock Adjustment Report',
                templateUrl: helper.basepath('reports/stockadjustmentreport.html'),
                controller: 'StockAdjustmentReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/stockadjustmentreport.js'));
                    }]
                }
            })
            .state('app.staffcreditbillreport', {
                url: '/staffcreditbillreport',
                title: 'Staff Credit Bill Report',
                templateUrl: helper.basepath('reports/staffcreditbillreport.html'),
                controller: 'StaffCreditBillReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/staffcreditbillreport.js'));
                    }]
                }
            })
            .state('app.staffpendingpaymentreport', {
                url: '/staffpendingpaymentreport',
                title: 'Staff Pending Payment Report',
                templateUrl: helper.basepath('reports/staffpendingpaymentreport.html'),
                controller: 'StaffPendingPaymentReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/staffpendingpaymentreport.js'));
                    }]
                }
            })
            .state('app.staffcreditreturnreport', {
                url: '/staffcreditreturnreport',
                title: 'Staff Credit Return Report',
                templateUrl: helper.basepath('reports/staffcreditreturnreport.html'),
                controller: 'StaffCreditReturnReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/staffcreditreturnreport.js'));
                    }]
                }
            })
            .state('app.staffcreditsummaryreport', {
                url: '/staffcreditsummaryreport',
                title: 'Staff Credit Summary Report',
                templateUrl: helper.basepath('reports/staffcreditsummaryreport.html'),
                controller: 'StaffCreditSummaryReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/staffcreditsummaryreport.js'));
                    }]
                }
            })
            .state('app.openingstockentryreport', {
                url: '/openingstockentryreport',
                title: 'Opening Stock Entry Report',
                templateUrl: helper.basepath('reports/openingstockentryreport.html'),
                controller: 'OpeningStockEntryReportController as vm',
                resolve: {
                    loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(helper.basepath('reports/openingstockentryreport.js'));
                    }]
                }
            })

        // modalConfigProvider.add('app.sequencemasters', {
        //     templateUrl: helper.basepath('emr/appmanager/sequencemasters/SequenceMasters-form.html'),
        //     controller: 'sequencemastersFormController',
        //     controllerUrl: helper.basepath('emr/appmanager/sequencemasters/SequenceMasters-form.js'),
        //     size: 'lg'
        // });
        modalConfigProvider.add('app.countrymasters', {
            templateUrl: helper.basepath('emr/generalmaster/countrymaster/countrymaster-form.html'),
            controller: 'countryMasterFormController',
            controllerUrl: helper.basepath('emr/generalmaster/countrymaster/countrymaster-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.statemasters', {
            templateUrl: helper.basepath('emr/generalmaster/statemaster/statemaster-form.html'),
            controller: 'stateMasterFormController',
            controllerUrl: helper.basepath('emr/generalmaster/statemaster/statemaster-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.districtmasters', {
            templateUrl: helper.basepath('emr/generalmaster/districtmaster/districtmaster-form.html'),
            controller: 'districtMasterFormController',
            controllerUrl: helper.basepath('emr/generalmaster/districtmaster/districtmaster-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.citymasters', {
            templateUrl: helper.basepath('emr/generalmaster/citymaster/citymaster-form.html'),
            controller: 'cityMasterFormController',
            controllerUrl: helper.basepath('emr/generalmaster/citymaster/citymaster-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.cardmasters', {
            templateUrl: helper.basepath('emr/generalmaster/cardmaster/cardmaster-form.html'),
            controller: 'cardMasterFormController',
            controllerUrl: helper.basepath('emr/generalmaster/cardmaster/cardmaster-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.claimsummary', {
            templateUrl: helper.basepath('billing/claimmanagement/claim-summary.html'),
            controller: 'claimsummaryController',
            controllerUrl: helper.basepath('billing/claimmanagement/claim-summary.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.diagnosisdetail', {
            templateUrl: helper.basepath('inpatient/mrd/diagnosiscoding/diagnosiscoding-form.html'),
            controller: 'diagnosisdetailController',
            controllerUrl: helper.basepath('inpatient/mrd/diagnosiscoding/diagnosiscoding-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.filedetail', {
            templateUrl: helper.basepath('inpatient/mrd/filerequests/filerequest-form.html'),
            controller: 'filerequestFormController',
            controllerUrl: helper.basepath('inpatient/mrd/filerequests/filerequest-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.diagnosisdetails', {
            templateUrl: helper.basepath('inpatient/mrd/diagnosiscoding/diagnosisdetail.html'),
            controller: 'diagnosisdetailsController',
            controllerUrl: helper.basepath('inpatient/mrd/diagnosiscoding/diagnosisdetail.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.pendingdispense', {
            templateUrl: helper.basepath('inpatient/currentinpatients/pendingdispense.html'),
            controller: 'pendingdispenseController',
            controllerUrl: helper.basepath('inpatient/currentinpatients/pendingdispense.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.dischargeadvicer', {
            templateUrl: helper.basepath('inpatient/currentinpatients/dischargeadvicer.html'),
            controller: 'dischargeadvicerController',
            controllerUrl: helper.basepath('inpatient/currentinpatients/dischargeadvicer.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.discharpatient', {
            templateUrl: helper.basepath('inpatient/currentinpatients/discharge.html'),
            controller: 'discharpatientController',
            controllerUrl: helper.basepath('inpatient/currentinpatients/discharge.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.clinicalpatient', {
            templateUrl: helper.basepath('inpatient/currentinpatients/clinicaldischarge.html'),
            controller: 'clinicalpatientController',
            controllerUrl: helper.basepath('inpatient/currentinpatients/clinicaldischarge.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.doctordisplayform', {
            templateUrl: helper.basepath('emr/general/doctordisplay/doctordisplay-form.html'),
            controller: 'doctordisplayFormController',
            controllerUrl: helper.basepath('emr/general/doctordisplay/doctordisplay-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.displayboards', {
            templateUrl: helper.basepath('emr/general/displayboard/displayboard.html'),
            controller: 'displayboardFormController',
            controllerUrl: helper.basepath('emr/general/displayboard/displayboard.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.displayboardfilter', {
            templateUrl: helper.basepath('emr/general/displayboard/displayboardfilter.html'),
            controller: 'displayboardListController',
            controllerUrl: helper.basepath('emr/general/displayboard/displayboardfilter.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.generaldisplay', {
            templateUrl: helper.basepath('emr/general/generaldisplay/generaldisplay-form.html'),
            controller: 'generaldisplayFormController',
            controllerUrl: helper.basepath('emr/general/generaldisplay/generaldisplay-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.generalboards', {
            templateUrl: helper.basepath('emr/general/generalboard/generalboard.html'),
            controller: 'generalboardFormController',
            controllerUrl: helper.basepath('emr/general/generalboard/generalboard.js'),
            size: 'display'
        });
        modalConfigProvider.add('app.generalboardfilter', {
            templateUrl: helper.basepath('emr/general/generalboard/generalboardfilter.html'),
            controller: 'generalboardListController',
            controllerUrl: helper.basepath('emr/general/generalboard/generalboardfilter.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.wardfilter', {
            templateUrl: helper.basepath('emr/general/warddisplay/wardfilter.html'),
            controller: 'wardfilterController',
            controllerUrl: helper.basepath('emr/general/warddisplay/wardfilter.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.warddisplay', {
            templateUrl: helper.basepath('emr/general/warddisplay/warddisplays.html'),
            controller: 'warddisplayController',
            controllerUrl: helper.basepath('emr/general/warddisplay/warddisplays.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.tokenfilter', {
            templateUrl: helper.basepath('emr/general/qmsdisplay/tokendisplayfilter.html'),
            controller: 'tokenfilterController',
            controllerUrl: helper.basepath('emr/general/qmsdisplay/tokendisplayfilter.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.tokendisplay', {
            templateUrl: helper.basepath('emr/general/qmsdisplay/tokendisplay.html'),
            controller: 'tokendisplayController',
            controllerUrl: helper.basepath('emr/general/qmsdisplay/tokendisplay.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.appttokenfilter', {
            templateUrl: helper.basepath('emr/general/appointmentqms/appttokendisplayfilter.html'),
            controller: 'AppnmttokenfilterController',
            controllerUrl: helper.basepath('emr/general/appointmentqms/appttokendisplayfilter.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.appnmttokendisplay', {
            templateUrl: helper.basepath('emr/general/appointmentqms/apnmttokendisplay.html'),
            controller: 'AppnttokendisplayController',
            controllerUrl: helper.basepath('emr/general/appointmentqms/apnmttokendisplay.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.costtab.labourcost', {
            templateUrl: helper.basepath('emr/costmanagement/labourcost-form.html'),
            controller: 'labourCostFormController',
            controllerUrl: helper.basepath('emr/costmanagement/labourcost-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.costtab.powercost', {
            templateUrl: helper.basepath('emr/costmanagement/powercost-form.html'),
            controller: 'powerCostFormController',
            controllerUrl: helper.basepath('emr/costmanagement/powercost-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.eventdashboardtab.outboundsall', {
            templateUrl: helper.basepath('emr/appmanager/eventdashboard/outboundall-form.html'),
            controller: 'outboundAllFormController',
            controllerUrl: helper.basepath('emr/appmanager/eventdashboard/outboundall-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.findasset-list', {
            url: '/app.findasset-list/:id',
            templateUrl: helper.basepath('emr/assetmanagement/findasset.html'),
            controller: 'findassetListController as vm',
            controllerUrl: helper.basepath('emr/assetmanagement/findasset.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.assignmentform', {
            templateUrl: helper.basepath('emr/assetmanagement/assignment/assignment-form.html'),
            controller: 'AssignmentFormController',
            controllerUrl: helper.basepath('emr/assetmanagement/assignment/assignment-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.moneysplit', {
            templateUrl: helper.basepath('billing/ipbilling/money-split.html'),
            controller: 'moneysplitController',
            controllerUrl: helper.basepath('billing/ipbilling/money-split.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.billock', {
            templateUrl: helper.basepath('billing/ipbilling/bill-lock.html'),
            controller: 'billlockingController',
            controllerUrl: helper.basepath('billing/ipbilling/bill-lock.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.patientpicker', {
            templateUrl: helper.basepath('emr/surgerymanagement/patientpicker/patientpicker.html'),
            controller: 'patientPickerController',
            controllerUrl: helper.basepath('emr/surgerymanagement/patientpicker/patientpicker.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.otregistertab.otregister', {
            templateUrl: helper.basepath('emr/surgerymanagement/otregister/otregister-form.html'),
            controller: 'otregisterFormController',
            controllerUrl: helper.basepath('emr/surgerymanagement/otregister/otregister-form.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.otregistertab.surgicalnote', {
            templateUrl: helper.basepath('emr/surgerymanagement/otregister/surgicalnote.html'),
            controller: 'SurgicalNoteController',
            controllerUrl: helper.basepath('emr/surgerymanagement/otregister/surgicalnote.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.otregistertab.anesthesiannote', {
            templateUrl: helper.basepath('emr/surgerymanagement/otregister/anesthesiannote.html'),
            controller: 'AnesthesianNoteController',
            controllerUrl: helper.basepath('emr/surgerymanagement/otregister/anesthesiannote.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.occupations', {
            templateUrl: helper.basepath('emr/generalmaster/occupationmaster/occupation-form.html'),
            controller: 'occupationFormController',
            controllerUrl: helper.basepath('emr/generalmaster/occupationmaster/occupation-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.otrequest', {
            templateUrl: helper.basepath('emr/surgerymanagement/otrequest/otrequest-form.html'),
            controller: 'otrequestFormController',
            controllerUrl: helper.basepath('emr/surgerymanagement/otrequest/otrequest-form.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.equipmentsused', {
            templateUrl: helper.basepath('emr/surgerymanagement/equipmentused/medicalequipment.html'),
            controller: 'MedicalEquipmentController',
            controllerUrl: helper.basepath('emr/surgerymanagement/equipmentused/medicalequipment.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.material', {
            templateUrl: helper.basepath('emr/surgerymanagement/materialused/materialissues.html'),
            controller: 'MaterialissueController',
            controllerUrl: helper.basepath('emr/surgerymanagement/materialused/materialissues.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.otschedule', {
            templateUrl: helper.basepath('emr/surgerymanagement/otschedule/otschedule-form.html'),
            controller: 'otscheduleFormController',
            controllerUrl: helper.basepath('emr/surgerymanagement/otschedule/otschedule-form.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.patientprofiledetails', {
            templateUrl: helper.basepath('billing/opbilling/profiles-details.html'),
            controller: 'patientprofiledetailsController',
            controllerUrl: helper.basepath('billing/opbilling/profiles-details.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.appointmentrequest', {
            templateUrl: helper.basepath('inpatient/mrd/filerequests/appointmentrequest-form.html'),
            controller: 'appointementrequestController',
            controllerUrl: helper.basepath('inpatient/mrd/filerequests/appointmentrequest-form.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.appointmentreqconfirm', {
            templateUrl: helper.basepath('inpatient/mrd/filerequests/appointmentrequestconfirm.html'),
            controller: 'appointementreqconfirmController',
            controllerUrl: helper.basepath('inpatient/mrd/filerequests/appointmentrequestconfirm.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.patientalert', {
            templateUrl: helper.basepath('emr/generalmaster/patientalerts/patientalert-form.html'),
            controller: 'patientAlertFormController',
            controllerUrl: helper.basepath('emr/generalmaster/patientalerts/patientalert-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.resource', {
            templateUrl: helper.basepath('emr/generalmaster/resources/resource-form.html'),
            controller: 'resourceFormController',
            controllerUrl: helper.basepath('emr/generalmaster/resources/resource-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.researchproject', {
            templateUrl: helper.basepath('emr/generalmaster/researchprojects/researchproject-form.html'),
            controller: 'researchProjectFormController',
            controllerUrl: helper.basepath('emr/generalmaster/researchprojects/researchproject-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.indication', {
            templateUrl: helper.basepath('inventory/manageindications/indication-form.html'),
            controller: 'indicationFormController',
            controllerUrl: helper.basepath('inventory/manageindications/indication-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.pincode', {
            templateUrl: helper.basepath('emr/generalmaster/pincodes/pincode-form.html'),
            controller: 'pincodeFormController',
            controllerUrl: helper.basepath('emr/generalmaster/pincodes/pincode-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.remark', {
            templateUrl: helper.basepath('emr/generalmaster/remarks/remark-form.html'),
            controller: 'remarkFormController',
            controllerUrl: helper.basepath('emr/generalmaster/remarks/remark-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.feedbackmaster', {
            templateUrl: helper.basepath('emr/generalmaster/feedback/feedbackmaster.html'),
            controller: 'feedbackFormController',
            controllerUrl: helper.basepath('emr/generalmaster/feedback/feedbackmaster.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.prechecklists', {
            templateUrl: helper.basepath('emr/generalmaster/checklist/prechecklist-form.html'),
            controller: 'checklistFormController',
            controllerUrl: helper.basepath('emr/generalmaster/checklist/prechecklist-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.diagnosisform', {
            templateUrl: helper.basepath('emr/clinicalmaster/diagnosis/diagnosis-form.html'),
            controller: 'diagnosisFormController',
            controllerUrl: helper.basepath('emr/clinicalmaster/diagnosis/diagnosis-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.guarantortab.general', {
            templateUrl: helper.basepath('emr/generalmaster/guarantor/guarantor-form.html'),
            controller: 'guarantorFormController',
            controllerUrl: helper.basepath('emr/generalmaster/guarantor/guarantor-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.opdbill', {
            templateUrl: helper.basepath('emr/registration/fullregistration/opdbill.html'),
            controller: 'opdFormController',
            controllerUrl: helper.basepath('emr/registration/fullregistration/opdbill.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.obillingmore', {
            templateUrl: helper.basepath('billing/opbilling/opbilling-more.html'),
            controller: 'opbillingMoreController',
            controllerUrl: helper.basepath('billing/opbilling/opbilling-more.js'),
            size: 'md'
        });
        modalConfigProvider.add('app.obillingpackage', {
            templateUrl: helper.basepath('billing/opbilling/opbillingpackitem.html'),
            controller: 'opbillingPackageController',
            controllerUrl: helper.basepath('billing/opbilling/opbillingpackitem.js'),
            size: 'lg'
        });
        modalConfigProvider.add('patientemr.patientconditions', {
            templateUrl: helper.basepath('emr/EMR/patientconditions/patientcondition-list.html'),
            controller: 'patientConditionListController',
            controllerUrl: helper.basepath('emr/EMR/patientconditions/patientcondition-list.js'),
            size: 'full'
        });
        modalConfigProvider.add('patientemr.dietplantab.dietplan', {
            templateUrl: helper.basepath('emr/EMR/patientdietplan/dietplan-list.html'),
            controller: 'patientDietplanController as vm',
            controllerUrl: helper.basepath('emr/EMR/patientdietplan/dietplan-list.js'),
            size: 'full'
        });
        modalConfigProvider.add('patientemr.familyconditions', {
            templateUrl: helper.basepath('emr/EMR/familyconditions/familycondition-list.html'),
            controller: 'familyConditionListController',
            controllerUrl: helper.basepath('emr/EMR/familyconditions/familycondition-list.js'),
            size: 'full'
        });
        modalConfigProvider.add('patientemr.patientimmunizations', {
            templateUrl: helper.basepath('emr/EMR/patientimmunizations/patientimmunization-list.html'),
            controller: 'patientImmunizationListController',
            controllerUrl: helper.basepath('emr/EMR/patientimmunizations/patientimmunization-list.js'),
            size: 'full'
        });
        modalConfigProvider.add('patientemr.patientprocedures', {
            templateUrl: helper.basepath('emr/EMR/patientprocedures/patientprocedure-list.html'),
            controller: 'patientProcedureListController',
            controllerUrl: helper.basepath('emr/EMR/patientprocedures/patientprocedure-list.js'),
            size: 'full'
        });
        modalConfigProvider.add('patientemr.dietplanform', {
            templateUrl: helper.basepath('emr/EMR/patientdietplan/dietplan-form.html'),
            controller: 'dietplanFormController',
            controllerUrl: helper.basepath('emr/EMR/patientdietplan/dietplan-form.js'),
            size: 'md'
        });
        modalConfigProvider.add('patientemr.patientdietorder', {
            templateUrl: helper.basepath('emr/EMR/patientdietplan/dietorder-form.html'),
            controller: 'dietorderFormController as vm',
            controllerUrl: helper.basepath('emr/EMR/patientdietplan/dietorder-form.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.dietmultipleorder', {
            templateUrl: helper.basepath('inpatient/dietmultipleorder/dietmultipleorders/dietmultipleorder.html'),
            controller: 'dietMultipleorderController as vm',
            controllerUrl: helper.basepath('inpatient/dietmultipleorder/dietmultipleorders/dietmultipleorder.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.dischargesummary-form', {
            templateUrl: helper.basepath('emr/medicalcertificate/dischargesummary/dischargesummary-form.html'),
            controller: 'dischargesummaryFormController as vm',
            controllerUrl: helper.basepath('emr/medicalcertificate/dischargesummary/dischargesummary-form.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.triage', {
            templateUrl: helper.basepath('emr/accidentemergency/triage/triage-form.html'),
            controller: 'triageFormController as vm',
            controllerUrl: helper.basepath('emr/accidentemergency/triage/triage-form.js'),
            size: 'md'
        });
        modalConfigProvider.add('app.findotrequest', {
            templateUrl: helper.basepath('emr/surgerymanagement/otregister/findotrequest.html'),
            controller: 'findotrequestController as vm',
            controllerUrl: helper.basepath('emr/surgerymanagement/otregister/findotrequest.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.findotschedule', {
            templateUrl: helper.basepath('emr/surgerymanagement/otregister/findotschedule.html'),
            controller: 'findotscheduleListController as vm',
            controllerUrl: helper.basepath('emr/surgerymanagement/otregister/findotschedule.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.claimdispatchdetail', {
            templateUrl: helper.basepath('billing/claimmanagement/dispatch-detail.html'),
            controller: 'claimdispatchController as vm',
            controllerUrl: helper.basepath('billing/claimmanagement/dispatch-detail.js'),
            size: 'md'
        });
        modalConfigProvider.add('app.claimhistory', {
            templateUrl: helper.basepath('billing/claimmanagement/claim-history.html'),
            controller: 'claimhistoryController as vm',
            controllerUrl: helper.basepath('billing/claimmanagement/claim-history.js'),
            size: 'md'
        });
        modalConfigProvider.add('app.incidentservicerequest', {
            templateUrl: helper.basepath('emr/EMR/incidentservicerequest/incidentservicerequest-form.html'),
            controller: 'serviceRequestFormController',
            controllerUrl: helper.basepath('emr/EMR/incidentservicerequest/incidentservicerequest-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.otregistertab.document', {
            templateUrl: helper.basepath('emr/surgerymanagement/otregister/otdocument.html'),
            controller: 'otDocumentFormController as vm',
            controllerUrl: helper.basepath('emr/surgerymanagement/otregister/otdocument.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.incidentservicerequests', {
            templateUrl: helper.basepath('emr/EMR/incidentservicerequest/incidentservicerequest-list.html'),
            controller: 'serviceRequestListController',
            controllerUrl: helper.basepath('emr/EMR/incidentservicerequest/incidentservicerequest-list.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.questioncomments', {
            templateUrl: helper.basepath('emr/EMR/consultationpopup/popup.html'),
            controller: 'questionCommentsController',
            controllerUrl: helper.basepath('emr/EMR/consultationpopup/popup.js'),
            size: 'sm'
        });
        modalConfigProvider.add('app.labresultreview-form', {
            templateUrl: helper.basepath('emr/doctordashboardsections/results-section/labresultreview.html'),
            controller: 'LabResultReviewFormController',
            controllerUrl: helper.basepath('emr/doctordashboardsections/results-section/labresultreview.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.endoscopyresultreview-form', {
            templateUrl: helper.basepath('emr/doctordashboardsections/endoscopyresults/endoscopyresultreview.html'),
            controller: 'EndoscopyResultreviewFormController',
            controllerUrl: helper.basepath('emr/doctordashboardsections/endoscopyresults/endoscopyresultreview.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.radiologyresultreview-formm', {
            templateUrl: helper.basepath('emr/doctordashboardsections/radiologyresults/radiologyresultreview.html'),
            controller: 'RadiologyResultReviewFormController',
            controllerUrl: helper.basepath('emr/doctordashboardsections/radiologyresults/radiologyresultreview.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.abnormalresultreview', {
            templateUrl: helper.basepath('emr/doctordashboardsections/abnormalresults/abnormalresult-review.html'),
            controller: 'AbnormalReviewFormController',
            controllerUrl: helper.basepath('emr/doctordashboardsections/abnormalresults/abnormalresult-review.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.pick-from-issuelist', {
            params: {
                otregisterid: -1,
                patientid: -1,
                encounterid: -1
            },
            templateUrl: helper.basepath('emr/surgerymanagement/otregister/pick-from-issuelist.html'),
            controller: 'pickfromissueListController as vm',
            controllerUrl: helper.basepath('emr/surgerymanagement/otregister/pick-from-issuelist.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.mrdmovement', {
            templateUrl: helper.basepath('inpatient/mrd/mrdmovement/mrdmovements.html'),
            controller: 'MRDMovementController',
            controllerUrl: helper.basepath('inpatient/mrd/mrdmovement/mrdmovements.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.physiotheraphybilldetail', {
            templateUrl: helper.basepath('emr/physiotheraphy/physiotheraphybilldetail.html'),
            controller: 'PhysiotherapthyBillController',
            controllerUrl: helper.basepath('emr/physiotheraphy/physiotheraphybilldetail.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.clinicalfindingform', {
            templateUrl: helper.basepath('emr/clinicalmaster/clinicalfindings/clinicalfinding-form.html'),
            controller: 'ClinicalFindingFormController',
            controllerUrl: helper.basepath('emr/clinicalmaster/clinicalfindings/clinicalfinding-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.impressionmasterform', {
            templateUrl: helper.basepath('emr/clinicalmaster/impressionmaster/impressionmaster-form.html'),
            controller: 'ImpressionMasterFormController',
            controllerUrl: helper.basepath('emr/clinicalmaster/impressionmaster/impressionmaster-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.transferdept', {
            templateUrl: helper.basepath('inpatient/mrd/filetransfer/transferdept.html'),
            controller: 'TransferDeptController',
            controllerUrl: helper.basepath('inpatient/mrd/filetransfer/transferdept.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.locationassignment', {
            templateUrl: helper.basepath('inpatient/mrd/filereceive/locationassignment.html'),
            controller: 'LocationAssignmentController',
            controllerUrl: helper.basepath('inpatient/mrd/filereceive/locationassignment.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.locationreassign', {
            templateUrl: helper.basepath('inpatient/mrd/mrdfileassignment/locationreassign.html'),
            controller: 'LocationReassignController',
            controllerUrl: helper.basepath('inpatient/mrd/mrdfileassignment/locationreassign.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.filestatusreason', {
            templateUrl: helper.basepath('inpatient/mrd/mrdfileassignment/filestatusreason.html'),
            controller: 'FileStatusReasonController',
            controllerUrl: helper.basepath('inpatient/mrd/mrdfileassignment/filestatusreason.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.diagnosiscodification', {
            templateUrl: helper.basepath('inpatient/mrd/diagnosiscoding/diagnosiscodification.html'),
            controller: 'DiagnosisCodificationController',
            controllerUrl: helper.basepath('inpatient/mrd/diagnosiscoding/diagnosiscodification.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.addnewticket', {
            templateUrl: helper.basepath('emr/assetmanagement/helpdesk/newticket/addnewticket.html'),
            controller: 'addnewticketController',
            controllerUrl: helper.basepath('emr/assetmanagement/helpdesk/newticket/addnewticket.js'),
            size: 'md'
        });
        modalConfigProvider.add('app.revenuedivisionform', {
            templateUrl: helper.basepath('emr/generalmaster/revenuedivisionmaster/revenuedivisionmaster-form.html'),
            controller: 'RevenueMasterFormController',
            controllerUrl: helper.basepath('emr/generalmaster/revenuedivisionmaster/revenuedivisionmaster-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.ticketassignment', {
            templateUrl: helper.basepath('emr/assetmanagement/helpdesk/ticketassign/ticketassignment.html'),
            controller: 'TicketAssignmentController',
            controllerUrl: helper.basepath('emr/assetmanagement/helpdesk/ticketassign/ticketassignment.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.ticketexecution', {
            templateUrl: helper.basepath('emr/assetmanagement/helpdesk/ticketexecution/ticketexecution.html'),
            controller: 'TicketExecutionController',
            controllerUrl: helper.basepath('emr/assetmanagement/helpdesk/ticketexecution/ticketexecution.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.resolvedform', {
            templateUrl: helper.basepath('emr/assetmanagement/helpdesk/ticketexecution/ticketresolvedform.html'),
            controller: 'TicketResolvedFormController',
            controllerUrl: helper.basepath('emr/assetmanagement/helpdesk/ticketexecution/ticketresolvedform.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.mrdfileuploadform', {
            templateUrl: helper.basepath('inpatient/mrd/mrdfileupload/fileupload-form.html'),
            controller: 'MRDFileUploadFormController',
            controllerUrl: helper.basepath('inpatient/mrd/mrdfileupload/fileupload-form.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.opmlcform', {
            templateUrl: helper.basepath('emr/registration/regcumvisitwithbill/opmlc.html'),
            controller: 'OPMlcFormController',
            controllerUrl: helper.basepath('emr/registration/regcumvisitwithbill/opmlc.js'),
            size: 'full'
        });
        modalConfigProvider.add('app.updateencounterdata', {
            templateUrl: helper.basepath('emr/EMR/ipdashboard/updateencounterdata/updateencounterdata.html'),
            controller: 'UpdateEncounterDataController',
            controllerUrl: helper.basepath('emr/EMR/ipdashboard/updateencounterdata/updateencounterdata.js'),
            size: 'lg'
        });
        modalConfigProvider.add('app.systemexaminationform', {
            templateUrl: helper.basepath('emr/clinicalmaster/systemexamination/systemexamination-form.html'),
            controller: 'SystemExaminationFormController',
            controllerUrl: helper.basepath('emr/clinicalmaster/systemexamination/systemexamination-form.js'),
            size: 'lg'
        });
    }

})();