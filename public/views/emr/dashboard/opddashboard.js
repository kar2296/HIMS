(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpddashboardController', OpddashboardController);

    function OpddashboardController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.items = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.Items = {};
        $scope.Items.AppointCount = '0';
        $scope.Items.PatientCount = '0';
        $scope.Items.OPBillCount = '0';
        $scope.Items.DGBillCount = '0';
        $scope.Items.CreditCount = '0';
        $scope.Items.DoctorDisplayCount = '0';
        $scope.Items.QMSCount = '0';
        $scope.Items.GeneralBoardCount = '0';
        $scope.Items.MRDRequestCount = '0';

        $scope.currentcontext.CanAppoinment = utl.Privilege.hasPrivilege('CanAppoinment');
        $scope.currentcontext.Canpatientsearch = utl.Privilege.hasPrivilege('Canpatientsearch');
        $scope.currentcontext.CanQuickregistration = utl.Privilege.hasPrivilege('CanQuickregistration');
        $scope.currentcontext.CanFullregistration = utl.Privilege.hasPrivilege('CanFullregistration');
        $scope.currentcontext.CanRegistrationcumbills = utl.Privilege.hasPrivilege('CanRegistrationcumbills');
        $scope.currentcontext.CanOpBilling = utl.Privilege.hasPrivilege('CanOpBilling');
        $scope.currentcontext.CanDgBilling = utl.Privilege.hasPrivilege('CanDgBilling');
        $scope.currentcontext.CanCreditnotes = utl.Privilege.hasPrivilege('CanCreditnotes');
        $scope.currentcontext.CanDoctorDisplay = utl.Privilege.hasPrivilege('CanDoctorDisplay');
        $scope.currentcontext.CanDoctorQMS = utl.Privilege.hasPrivilege('CanDoctorQMS');
        $scope.currentcontext.CanGeneralBoard = utl.Privilege.hasPrivilege('CanGeneralBoard');
        $scope.currentcontext.CanMRDFilerequest = utl.Privilege.hasPrivilege('CanMRDFilerequest');
        $scope.currentcontext.CanMRDFilestatus = utl.Privilege.hasPrivilege('CanMRDFilestatus');
        $scope.currentcontext.CanAnnouncements = utl.Privilege.hasPrivilege('CanAnnouncements');
        $scope.currentcontext.CanTraficPlans = utl.Privilege.hasPrivilege('CanTraficPlans');
        $scope.currentcontext.CanInstantMessages = utl.Privilege.hasPrivilege('CanInstantMessages');

        $scope.getOPDDashboardCountCallBack = function (scope, res, options, hasError) {
            $scope.Items.AppointCount = res.apnmntbo.AppointCount;
            $scope.Items.PatientCount = res.patientbo.PatientCount;
            $scope.Items.OPBillCount = res.opbillbo.OPBillCount;
            $scope.Items.DGBillCount = res.dgbillbo.DGBillCount;
            $scope.Items.CreditCount = res.creditnotebo.CreditCount;
            $scope.Items.DoctorDisplayCount = res.doctordisplaybo.DoctorDisplayCount;
            $scope.Items.QMSCount = res.qmstokenbo.QMSCount;
            $scope.Items.GeneralBoardCount = res.generalboardbo.GeneralBoardCount;
            $scope.Items.MRDRequestCount = res.mrdrequestbo.MRDRequestCount;
            if (!$scope.Items.AppointCount)
                $scope.Items.AppointCount = '0';
            if (!$scope.Items.PatientCount)
                $scope.Items.PatientCount = '0';
            if (!$scope.Items.OPBillCount)
                $scope.Items.OPBillCount = '0';
            if (!$scope.Items.DGBillCount)
                $scope.Items.DGBillCount = '0';
            if (!$scope.Items.CreditCount)
                $scope.Items.CreditCount = '0';
            if (!$scope.Items.DoctorDisplayCount)
                $scope.Items.DoctorDisplayCount = '0';
            if (!$scope.Items.QMSCount)
                $scope.Items.QMSCount = '0';
            if (!$scope.Items.GeneralBoardCount)
                $scope.Items.GeneralBoardCount = '0';
            if (!$scope.Items.MRDRequestCount)
                $scope.Items.MRDRequestCount = '0';
        };
        $scope.getopdCount = function () {
            var inputData = {
                Data: {
                    Keys: [
                        { Key: 'apnmntbo' },
                        { Key: 'patientbo' },
                        { Key: 'opbillbo' },
                        { Key: 'dgbillbo' },
                        { Key: 'creditnotebo' },
                        { Key: 'doctordisplaybo' },
                        { Key: 'qmstokenbo' },
                        { Key: 'generalboardbo' },
                        { Key: 'mrdrequestbo' },
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'registration/OPDDashboard/GetOPDDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPDDashboardCountCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.opd_appointments = function () {
            $state.go('app.appointments');
        }
        $scope.opd_patientsearch = function () {
            $state.go('app.patientsearch');
        }
        $scope.opd_quickregistration = function () {
            $state.go('app.quickregistration');
        }
        $scope.opd_fullregistration = function () {
            $state.go('app.fullregistrationtab.basic');
        }
        $scope.opd_regcumvisitwithbill = function () {
            $state.go('app.regcumvisitwithbill');
        }
        $scope.opd_opbilling = function () {
            $state.go('app.opbilling-list', { tp: 'OP' });
        }
        $scope.opd_dgbilling = function () {
            $state.go('app.opbilling-list', { tp: 'DG' });
        }
        $scope.opd_creditnotes = function () {
            $state.go('app.creditnotes');
        }
        $scope.opd_doctordisplay = function () {
            $state.go('app.displayboard');
        }
        $scope.opd_qmsdisplay = function () {
            $state.go('app.apptqmsdisplay');
        }
        $scope.opd_generalboard = function () {
            $state.go('app.generalboard');
        }
        $scope.opd_filerequest = function () {
            $state.go('app.filerequest');
        }
        $scope.opd_announcements = function () {
            $state.go('app.hrmannouncements');
        }
        $scope.getTotalOTRegisterCount = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 9, Value: FromDate },
                    { Key: 10, Value: ToDate }
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getTotalOTRegisterCountCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getTotalOTRegisterCountCallback = function (scope, res, options, hasError) {
            $scope.otregistercount = 0;
            if (res.Data)
                $scope.otregistercount = res.Data.length;
        };
        $scope.GetFacilityDashboardOptions = function () {
            var inputData = {
                Data: {
                    Keys: [
                        { Key: 'encounter' },
                        { Key: 'patient' },
                        { Key: 'appointment' },
                        { Key: 'newborn' }
                    ]
                },
                Attributes: $scope.currentcontext
            };
            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.FacilityInfo = res;
            $scope.TotalOPCount = 0;
            $scope.TotalOPCount = $scope.TotalOPCount + $scope.FacilityInfo.encounter.opFollowUpVisitCount + $scope.FacilityInfo.encounter.opNewVisitCount;
        }
        $scope.GetFacilityDashboardOptions();
        $scope.getTotalOTRegisterCount();
        $scope.getopdCount();
    }
    OpddashboardController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();