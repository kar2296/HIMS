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
      .state('patientportal.ehealth', {
        url: '/ehealth',
        title: 'ehealth summary',
        templateUrl: helper.basepath('patientportal/ehealthsummary/ehealthsummary.html'),
        controller: 'ehealthSummaryController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(
              [helper.basepath('patientportal/ehealthsummary/ehealthsummary.js'),
              helper.basepath('patientportal/ehealthsummary/sections/allergy-section.js'),
              helper.basepath('patientportal/ehealthsummary/sections/condition-section.js'),
              helper.basepath('patientportal/ehealthsummary/sections/familycondition-section.js'),
              helper.basepath('patientportal/ehealthsummary/sections/familysocialhistory-section.js'),
              helper.basepath('patientportal/ehealthsummary/sections/immunization-section.js'),
              helper.basepath('patientportal/ehealthsummary/sections/medication-section.js'),
              helper.basepath('patientportal/ehealthsummary/sections/procedure-section.js'),
              helper.basepath('patientportal/ehealthsummary/sections/socialhistory-section.js'),
              helper.basepath('patientportal/ehealthsummary/sections/vital-section.js'),
              helper.basepath('patientportal/ehealthsummary/sections/surgical-section.js'),
              helper.basepath('patientportal/ehealthsummary/sections/appointment-section.js')
              ]);
          }],
        }
      })
      .state('patientportal.appointments', {
        url: '/appointments',
        title: 'Appointments',
        templateUrl: helper.basepath('patientportal/appointments/appointments.html'),
        controller: 'appointmentsController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/appointments/appointments.js'));
          }]
        }
      })
      .state('patientportal.clinicalresults', {
        url: '/clinicalresults',
        title: 'Clinical Results',
        templateUrl: helper.basepath('patientportal/clinicalresults/clinicalresults.html'),
        controller: 'clinicalresultsController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/clinicalresults/clinicalresults.js'));
          }]
        }
      })
      .state('patientportal.dashboard', {
        url: '/dashboard',
        title: 'Dashboard',
        templateUrl: helper.basepath('patientportal/dashboard/dashboard.html'),
        controller: 'dashboardController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/dashboard/dashboard.js'));
          }]
        }
      })
      .state('patientportal.billing', {
        url: '/billing',
        title: 'Billing',
        templateUrl: helper.basepath('patientportal/billing/billing.html'),
        controller: 'billingController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/billing/billing.js'));
          }]
        }
      })
      .state('patientportal.prescription', {
        url: '/prescription',
        title: 'Prescription(Rx)',
        templateUrl: helper.basepath('patientportal/prescription/prescription.html'),
        controller: 'prescriptionController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/prescription/prescription.js'));
          }]
        }
      })
      .state('patientportal.messages', {
        url: '/messages',
        title: 'Messages',
        templateUrl: helper.basepath('patientportal/messages/messages.html'),
        controller: 'messagesController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/messages/messages.js'));
          }]
        }
      })
      .state('patientportal.alerts', {
        url: '/alerts',
        title: 'Alerts',
        templateUrl: helper.basepath('patientportal/alerts/alerts.html'),
        controller: 'alertsController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/alerts/alerts.js'));
          }]
        }
      })
      .state('patientportal.payment', {
        url: '/payments',
        title: 'Payments',
        templateUrl: helper.basepath('patientportal/payment/payments.html'),
        controller: 'paymentsController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/payment/payments.js'));
          }]
        }
      })
      .state('patientportal.surgeryrequest', {
        url: '/surgeryrequest',
        title: 'Surgery Request',
        templateUrl: helper.basepath('patientportal/surgeryrequest/surgeryrequest.html'),
        controller: 'surgeryrequestController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/surgeryrequest/surgeryrequest.js'));
          }]
        }
      })
      .state('patientportal.document', {
        url: '/document',
        title: 'Document',
        templateUrl: helper.basepath('patientportal/document/documents.html'),
        controller: 'documentController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/document/documents.js'));
          }]
        }
      })
      .state('patientportal.dischargesummary', {
        url: '/dischargesummary',
        title: 'Discharge Summary',
        templateUrl: helper.basepath('patientportal/dischargesummary/dischargesummary.html'),
        controller: 'dischargesummaryController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/dischargesummary/dischargesummary.js'));
          }]
        }
      })
      .state('patientportal.dischargesummaryform', {
        url: '/dischargesummaryform/:id/:eid:/:pid',
        title: 'Discharge Summary',
        templateUrl: helper.basepath('patientportal/dischargesummary/dischargesummaryform.html'),
        controller: 'dischargesummaryFormController as vm',
        resolve: {
          $uibModalInstance: function () {
            return null;
          },
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/dischargesummary/dischargesummaryform.js'));
          }]
        }
      })
      .state('patientportal.labresults', {
        url: '/labresults',
        title: 'Lab Results',
        templateUrl: helper.basepath('patientportal/results/patient-lab-result.html'),
        controller: 'patientLabResultController as vm',
        resolve: {
          $uibModalInstance: function () {
            return null;
          },
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/results/patient-lab-result.js'));
          }]
        }
      })
      .state('patientportal.patientlabresultview', {
        url: '/labresultview',
        title: 'Lab Results',
        templateUrl: helper.basepath('patientportal/results/patient-labresult-view.html'),
        controller: 'patientlabResultViewController as vm',
        resolve: {
          $uibModalInstance: function () {
            return null;
          },
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/results/patient-labresult-view.js'));
          }]
        }
      })
      .state('patientportal.radiologyresults', {
        url: '/radiologyresults',
        title: 'Radiology Results',
        templateUrl: helper.basepath('patientportal/results/patient-radiology-result.html'),
        controller: 'patientRadiologyResultController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/results/patient-radiology-result.js'));
          }]
        }
      })
      .state('patientportal.otregister', {
        url: '/otregister',
        title: 'OT Register',
        templateUrl: helper.basepath('patientportal/otsurgerydetails/otregister.html'),
        controller: 'otregisterController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/otsurgerydetails/otregister.js'));
          }]
        }
      })
      .state('patientportal.otdetails', {
        url: '/otdetail/:id/:eid:/:pid',
        title: 'OT Register',
        templateUrl: helper.basepath('patientportal/otsurgerydetails/otdetail.html'),
        controller: 'otdetailsController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/otsurgerydetails/otdetail.js'));
          }]
        }
      })
      .state('patientportal.immunization', {
        url: '/immunization/:id/:eid:/:pid',
        title: 'Immunizaton Schedule',
        templateUrl: helper.basepath('patientportal/immunization/patientimmunizationschedule.html'),
        controller: 'patientImmunizationScheduleController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/immunization/patientimmunizationschedule.js'));
          }]
        }
      })
      .state('patientportal.growthchart', {
        url: '/growthchart',
        title: 'Growth Chart',
        templateUrl: helper.basepath('patientportal/growthchart/pp-growthchart.html'),
        controller: 'growthChartController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/growthchart/pp-growthchart.js'));
          }]
        }
      })
      .state('patientportal.patientportal', {
        url: '/patientportal/:tp',
        title: 'dashboard',
        templateUrl: helper.basepath('patientportal/dashboard/newdashboard/dashboard.html'),
        controller: 'patientPortalDashboardController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/dashboard/newdashboard/dashboard.js'));
          }]
        }
      })
      .state('patientportal.consultations', {
        url: '/consultations',
        title: 'Consultations',
        templateUrl: helper.basepath('patientportal/consultation/consultation-list.html'),
        controller: 'consultationsController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/consultation/consultation-list.js'));
          }]
        }
      })
      .state('patientportal.appointmentrequest-list', {
        url: '/appointmentrequests',
        title: 'Appointment Request',
        templateUrl: helper.basepath('patientportal/appointments/appointmentrequest/appointmentrequest-list.html'),
        controller: 'appointmentRequestListController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/appointments/appointmentrequest/appointmentrequest-list.js'));
          }]
        }
      })
      .state('patientportal.appointmentrequestform', {
        url: '/appointmentrequests/:id',
        title: 'Appointment Request',
        templateUrl: helper.basepath('patientportal/appointments/appointmentrequest/appointmentrequest-form.html'),
        controller: 'appointmentRequestFormController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/appointments/appointmentrequest/appointmentrequest-form.js'));
          }]
        }
      })
      .state('patientportal.portaldashboard', {
        url: '/portaldashboard/:tp',
        title: 'Portal dashboard',
        templateUrl: helper.basepath('patientportal/dashboard/portaldashboard.html'),
        controller: 'PortalDashboardController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/dashboard/portaldashboard.js'));
          }]
        }
      })

      .state('patientportal.docappointment', {
        url: '/appointment/:tp',
        title: 'appointment',
        templateUrl: helper.basepath('patientportal/dashboard/virtualdashboard/appointments.html'),
        controller: 'portalappointmentsController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/dashboard/virtualdashboard/appointments.js'));
          }]
        }
      })
      .state('patientportal.doctorappointment', {
        url: '/doctorappointment/:tp',
        title: 'doctorappointment',
        templateUrl: helper.basepath('patientportal/dashboard/virtualdashboard/doctorappointment.html'),
        controller: 'doctorappointmentController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/dashboard/virtualdashboard/doctorappointment.js'));
          }]
        }
      })
      .state('patientportal.videoconference', {
        url: '/videoconference/:tp',
        title: 'videoconference',
        templateUrl: helper.basepath('patientportal/dashboard/virtualdashboard/videoconference.html'),
        controller: 'portalvedioController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/dashboard/virtualdashboard/videoconference.js'));
          }]
        }
      })
      .state('patientportal.portalconfirmorder', {
        url: '/portalconfirmorder/:tp',
        title: 'portalconfirmorder',
        templateUrl: helper.basepath('patientportal/virtualservices/ordertracker/portalconfirmorder.html'),
        controller: 'portalconfirmorderController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/ordertracker/portalconfirmorder.js'));
          }]
        }
      })
      .state('patientportal.portalordertrackingtab', {
        url: '/portalordertrackingtab/:tp',
        title: 'portalordertrackingtab',
        templateUrl: helper.basepath('patientportal/virtualservices/ordertracker/portalordertrackingtab.html'),
        controller: 'portalordertrackingtabController as vm',
        params: {
          context: 'main'
        },
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/ordertracker/portalordertrackingtab.js'));
          }]
        }
      })
      .state('patientportal.portalordertrackingtab.portalcompleteorder', {
        url: '/portalcompleteorder/:tp',
        title: 'portalcompleteorder',
        templateUrl: helper.basepath('patientportal/virtualservices/ordertracker/portalcompleteorder.html'),
        controller: 'portalcompleteorderController as vm',
        params: {
          context: 'main'
        },
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/ordertracker/portalcompleteorder.js'));
          }]
        }
      })
      .state('patientportal.portalordertrackingtab.portalpendingorder', {
        url: '/portalpendingorder/:tp',
        title: 'portalpendingorder',
        templateUrl: helper.basepath('patientportal/virtualservices/ordertracker/portalpendingorder.html'),
        controller: 'portalpendingorderController as vm',
        params: {
          context: 'main'
        },
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/ordertracker/portalpendingorder.js'));
          }]
        }
      })
      .state('patientportal.portalmyhealthrecord', {
        url: '/myhealthrecord/:tp',
        title: 'myhealthrecord',
        templateUrl: helper.basepath('patientportal/healthrecord/myhealthrecord.html'),
        controller: 'portalmyhealthrecordController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/healthrecord/myhealthrecord.js'));
          }]
        }
      })
      .state('patientportal.medicalhistory', {
        url: '/medicalhistory/:tp',
        title: 'dashboard',
        templateUrl: helper.basepath('patientportal/dashboard/medicalhistory.html'),
        controller: 'healthhistorycordController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(
              [helper.basepath('patientportal/dashboard/medicalhistory.js'),
              helper.basepath('patientportal/dashboard/sections/allergy-section.js'),
              helper.basepath('patientportal/dashboard/sections/condition-section.js'),
              helper.basepath('patientportal/dashboard/sections/familycondition-section.js'),
              helper.basepath('patientportal/dashboard/sections/familysocialhistory-section.js'),
              helper.basepath('patientportal/dashboard/sections/immunization-section.js'),
              helper.basepath('patientportal/dashboard/sections/medication-section.js'),
              helper.basepath('patientportal/dashboard/sections/procedure-section.js'),
              helper.basepath('patientportal/dashboard/sections/socialhistory-section.js'),
              helper.basepath('patientportal/dashboard/sections/vital-section.js'),
              helper.basepath('patientportal/dashboard/sections/surgical-section.js'),
              helper.basepath('patientportal/dashboard/sections/appointment-section.js')
              ]);
          }],
        }
      })
      .state('patientportal.ipdashboard', {
        url: '/ipdashboard',
        title: 'IP Dashboard',
        templateUrl: helper.basepath('patientportal/ipdashboard/ipdashboard.html'),
        controller: 'portalipDashboardController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(
              [
                helper.basepath('patientportal/ipdashboard/ipdashboard.js'),
                helper.basepath('patientportal/ipdashboard/sections/vital-section.js'),
                helper.basepath('patientportal/ipdashboard/sections/prescription-section.js'),
                helper.basepath('patientportal/ipdashboard/sections/diagnosis-section.js'),
                helper.basepath('patientportal/ipdashboard/sections/clinicalorders-section.js'),
                helper.basepath('patientportal/ipdashboard/sections/intakeoutput-section.js'),
                helper.basepath('patientportal/ipdashboard/sections/diet-section.js'), helper.basepath('patientportal/ipdashboard/sections/labresult-section.js'),
                helper.basepath('patientportal/ipdashboard/sections/radiology-section.js'),
                helper.basepath('patientportal/ipdashboard/sections/progressnote-section.js'), helper.basepath('patientportal/ipdashboard/sections/document-section.js')
              ]);
          }],
        }
      })
      .state('patientportal.patientdashboard', {
        url: '/patientdashboard',
        title: 'dashboard',
        templateUrl: helper.basepath('patientportal/dashboard/portaldashboard/dashboard.html'),
        controller: 'patientdashboardController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/dashboard/portaldashboard/dashboard.js'));
          }]
        }
      })
      .state('patientportal.portalresultlistview', {
        url: '/portalresultlistview',
        title: 'portalresultlistview',
        templateUrl: helper.basepath('patientportal/results/portallab-listview.html'),
        controller: 'portalResultlistController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/results/portallab-listview.js'));
          }]
        }
      })
      .state('patientportal.portalradiologylistview', {
        url: '/portalradiologylistview',
        title: 'portalradiologylistview',
        templateUrl: helper.basepath('patientportal/results/portal-radiology-listview.html'),
        controller: 'patientRadiologyListController as vm',
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/results/portal-radiology-listview.js'));
          }]
        }
      })
      .state('patientportal.virtualhealthcare', {
        url: '/virtualhealthcare/:tp',
        title: 'Virtual dashboard',
        templateUrl: helper.basepath('patientportal/virtualservices/virtualhealthcare.html'),
        controller: 'virtualhealthcareDashboardController as vm',
        params: {
          id: null,
          categoryid: null
        },
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/virtualhealthcare.js'));
          }]
        }
      })
      .state('patientportal.virtualsubcategoryselection', {
        url: '/virtualsubcategoryselection',
        title: 'virtualsubcategoryselection',
        templateUrl: helper.basepath('patientportal/virtualservices/virtualsubcategoryselection.html'),
        controller: 'VirtualSubcategorySelectController as vm',
        params: {
          categoryid: null
        },
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/virtualsubcategoryselection.js'));
          }]
        }
      })
      .state('patientportal.virtualdoctorselection', {
        url: '/virtualdoctorselection',
        title: 'virtualdoctorselection',
        templateUrl: helper.basepath('patientportal/virtualservices/doctorconsult/virtualdoctorselection.html'),
        controller: 'VirtualDoctorSelectionController as vm',
        params: {
          id: null,
          ctgryInfo: null
        },
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/doctorconsult/virtualdoctorselection.js'));
          }]
        }
      })
      .state('patientportal.bookvirtualappointment', {
        url: '/bookvirtualappointment',
        title: 'bookvirtualappointment',
        templateUrl: helper.basepath('patientportal/virtualservices/doctorconsult/bookvirtualappointment.html'),
        controller: 'BookVirtualAppointmentController as vm',
        params: {
          docData: null,
          ctgryInfo: null,
          ctgryid: null,
          subctgryid: null,
          ctypeId: null
        },
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/doctorconsult/bookvirtualappointment.js'));
          }]
        }
      })
      .state('patientportal.doctorconfirmorder', {
        url: '/doctorconfirmorder',
        title: 'doctorconfirmorder',
        templateUrl: helper.basepath('patientportal/virtualservices/doctorconsult/doctorconfirmorder.html'),
        controller: 'doctorconfirmorderController as vm',
        params: {
          pid: null,
          eid: null,
          drData: null,
          slotinfo: null,
          ctgryid: null,
          subctgryid: null,
          orderid: null,
          ctypeId: null,
          ctgryInfo: null
        },
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/doctorconsult/doctorconfirmorder.js'));
          }]
        }
      })
      .state('patientportal.virtualserviceselection', {
        url: '/virtualserviceselection',
        title: 'virtualserviceselection',
        templateUrl: helper.basepath('patientportal/virtualservices/serviceconsult/virtualserviceselection.html'),
        controller: 'VirtualServiceSelectionController as vm',
        params: {
          id: null,
          ctgryInfo: null
        },
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/serviceconsult/virtualserviceselection.js'));
          }]
        }
      })
      .state('patientportal.virtualserviceschedule', {
        url: '/virtualserviceschedule',
        title: 'virtualserviceschedule',
        templateUrl: helper.basepath('patientportal/virtualservices/serviceconsult/virtualserviceschedule.html'),
        controller: 'VirtualServiceScheduleController as vm',
        params: {
          orderdata: null,
          slotinfo: null,
          ctgryid: null,
          subctgryid: null
        },
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/serviceconsult/virtualserviceschedule.js'));
          }]
        }
      })
      .state('patientportal.virtualserviceconfirmorder', {
        url: '/virtualserviceconfirmorder',
        title: 'virtualserviceconfirmorder',
        templateUrl: helper.basepath('patientportal/virtualservices/serviceconsult/virtualserviceconfirmorder.html'),
        controller: 'VirtualServiceConfirmOrderController as vm',
        params: {
          pid: null,
          eid: null,
          drData: null,
          slotinfo: null,
          ctgryid: null,
          subctgryid: null,
          orderid: null
        },
        resolve: {
          loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(helper.basepath('patientportal/virtualservices/serviceconsult/virtualserviceconfirmorder.js'));
          }]
        }
      })
      .state('patientemr_positionbpchart', {
      url: '/positionbpchart',
      title: 'Position BP Chart',
      templateUrl: helper.basepath('emr/patientemr/positionbpchart/positionbpchart-list.html'),
      controller: 'PositionBpChartController as vm',
      params: {
        pid: null,
        eid: null,
        context: null,
      },
      resolve: {
        loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load(helper.basepath('emr/patientemr/positionbpchart/positionbpchart-list.js'));
        }]
      }
    });
    modalConfigProvider.add('app.patientmessagesnew', {
      templateUrl: helper.basepath('patientportal/messages/messagesnew.html'),
      controller: 'messagesNewController',
      controllerUrl: helper.basepath('patientportal/messages/messagesnew.js'),
      size: 'md'
    });
    modalConfigProvider.add('patientportal.documents', {
      templateUrl: helper.basepath('patientportal/document/document.html'),
      controller: 'documentFormController',
      controllerUrl: helper.basepath('patientportal/document/document.js'),
      size: 'lg'
    });
    modalConfigProvider.add('patientportal.reviewnote', {
      templateUrl: helper.basepath('patientportal/consultation/reviewnotes.html'),
      controller: 'patientReviewNotesController',
      controllerUrl: helper.basepath('patientportal/consultation/reviewnotes.js'),
      size: 'lg'
    });
    modalConfigProvider.add('patientportal.cancelOrder', {
      templateUrl: helper.basepath('patientportal/virtualservices/ordertracker/virtualcancelordertracker.html'),
      controller: 'CancelOrderController',
      controllerUrl: helper.basepath('patientportal/virtualservices/ordertracker/virtualcancelordertracker.js'),
      size: 'full'
    });
    modalConfigProvider.add('patientportal.virtualorderinfo', {
      templateUrl: helper.basepath('patientportal/virtualservices/ordertracker/portalvirtualorderInfo.html'),
      controller: 'PortalVirtualOrderInfoController',
      controllerUrl: helper.basepath('patientportal/virtualservices/ordertracker/portalvirtualorderInfo.js'),
      size: 'full'
    });
    modalConfigProvider.add('patientemr.clinicalordercancel', {
      templateUrl: helper.basepath('emr/patientemr/clinicalorders/clinicalordercancel.html'),
      controller: 'clinicalordersCancelCurrentListController as vm',
      controllerUrl: helper.basepath('emr/patientemr/clinicalorders/clinicalordercancel.js'),
      size: 'lg'
  });
  } // routesConfig

})();