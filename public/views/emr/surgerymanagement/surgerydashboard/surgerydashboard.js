(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SurgeryDashboardController', SurgeryDashboardController);

    function SurgeryDashboardController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.currentcontext = {};
        $scope.currentfilter = {
            OTScheduledOn: utl.Formatter.getCurrentDate(),
        };
        /*Privileges*/
        $scope.currentcontext.CanSurgerySchedule = utl.Privilege.hasAccess('CanSurgerySchedule');
        $scope.currentcontext.CanSurgeryConfirmation = utl.Privilege.hasAccess('CanSurgeryConfirmation');
        $scope.currentcontext.CanOT_Procedure_Entries = utl.Privilege.hasAccess('CanOT_Procedure_Entries');
        $scope.currentcontext.CanStockIndent = utl.Privilege.hasAccess('CanStockIndent');
        $scope.currentcontext.CanStockReceive = utl.Privilege.hasAccess('CanStockReceive');
        $scope.currentcontext.CanInPatients = utl.Privilege.hasAccess('CanInPatients');
        $scope.currentcontext.CanReport = utl.Privilege.hasAccess('CanReport');
        /*Privileges*/

        /* Side Menu close*/
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/

        $scope.surgeryschedule = function () {
            $state.go('app.surgeryschedules');
        }
        $scope.scheduleconfirmed = function () {
            $state.go('app.surgeryconfirmation');
        }
        $scope.procedure = function () {
            $state.go('app.surgeryentries');
        }
        $scope.stockreceives = function () {
            $state.go('app.stocktacceptencelist', { context: 'surgery' });
        }
        $scope.stockindents = function () {
            $state.go('app.stockrequests', { context: 'surgery' });
        }
        $scope.inpatientlist = function () {
            $state.go('app.currentinpatients', { context: 'surgery' });
        }
        $scope.report = function () {
            $state.go('app.surgeryreports');
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.item = [];
            $scope.todaysurgeryData = [];
            $scope.item = res.Data;
            for (var idx in $scope.item) {
                var surgeryInfo = $scope.item[idx];
                surgeryInfo.patientname = '';
                if (surgeryInfo.Patient.Title)
                    surgeryInfo.patientname = surgeryInfo.Patient.Title.Description + ' .';
                if (surgeryInfo.Patient.FirstName)
                    surgeryInfo.patientname += ' ' + surgeryInfo.Patient.FirstName;
                if (surgeryInfo.Patient.LastName)
                    surgeryInfo.patientname += ' ' + surgeryInfo.Patient.LastName;

                surgeryInfo.doctorname = '';
                if (surgeryInfo.Doctor.Title)
                    surgeryInfo.doctorname = surgeryInfo.Doctor.Title.Description + ' .';
                if (surgeryInfo.Doctor.FirstName)
                    surgeryInfo.doctorname += ' ' + surgeryInfo.Doctor.FirstName;
                if (surgeryInfo.Doctor.LastName)
                    surgeryInfo.doctorname += ' ' + surgeryInfo.Doctor.LastName;

                surgeryInfo.warddetails = '';
                if (surgeryInfo.WardMaster)
                    surgeryInfo.warddetails = surgeryInfo.WardMaster.WardName + ' - ';
                if (surgeryInfo.WardRoomMaster)
                    surgeryInfo.warddetails += surgeryInfo.WardRoomMaster.RoomNo + ' - ';
                if (surgeryInfo.WardRoomBedMaster)
                    surgeryInfo.warddetails += surgeryInfo.WardRoomBedMaster.BedNo;
                surgeryInfo.ProcedureName = '';
                if (surgeryInfo.Procedure)
                    surgeryInfo.ProcedureName = surgeryInfo.Procedure.ProcedureName;

                surgeryInfo.OTRoomName = '';
                if (surgeryInfo.OTRoom)
                    surgeryInfo.OTRoomName = surgeryInfo.OTRoom.Description;

                $scope.todaysurgeryData.push(surgeryInfo);
            }
        }

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.OTScheduledOn, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OTScheduledOn, 'y-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: 3 },
                    { Key: 10, Value: From },
                    { Key: 11, Value: To },
                    { Key: 18, Value: false },
                ],
                PageContext: {
                    PageSize: 6,
                    PageNumber: 1
                }
            };
           var options = {
                action: 'OtManagement/OtSchedule/GetOtSchedules',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getCompletedCallback = function (scope, res, options, hasError) {
            $scope.item = [];
            $scope.todaysurgerycompletedData = [];
            $scope.item = res.Data;
            for (var idx in $scope.item) {
                var surgerycompletedInfo = $scope.item[idx];
                surgerycompletedInfo.patientname = '';
                if (surgerycompletedInfo.Patient.Title)
                    surgerycompletedInfo.patientname = surgerycompletedInfo.Patient.Title.Description + ' .';
                if (surgerycompletedInfo.Patient.FirstName)
                    surgerycompletedInfo.patientname += ' ' + surgerycompletedInfo.Patient.FirstName;
                if (surgerycompletedInfo.Patient.LastName)
                    surgerycompletedInfo.patientname += ' ' + surgerycompletedInfo.Patient.LastName;

                surgerycompletedInfo.doctorname = '';
                if (surgerycompletedInfo.Doctor.Title)
                    surgerycompletedInfo.doctorname = surgerycompletedInfo.Doctor.Title.Description + ' .';
                if (surgerycompletedInfo.Doctor.FirstName)
                    surgerycompletedInfo.doctorname += ' ' + surgerycompletedInfo.Doctor.FirstName;
                if (surgerycompletedInfo.Doctor.LastName)
                    surgerycompletedInfo.doctorname += ' ' + surgerycompletedInfo.Doctor.LastName;

                surgerycompletedInfo.warddetails = '';
                if (surgerycompletedInfo.WardMaster)
                    surgerycompletedInfo.warddetails = surgerycompletedInfo.WardMaster.WardName + ' - ';
                if (surgerycompletedInfo.WardRoomMaster)
                    surgerycompletedInfo.warddetails += surgerycompletedInfo.WardRoomMaster.RoomNo + ' - ';
                if (surgerycompletedInfo.WardRoomBedMaster)
                    surgerycompletedInfo.warddetails += surgerycompletedInfo.WardRoomBedMaster.BedNo;
                surgerycompletedInfo.ProcedureName = '';
                if (surgerycompletedInfo.Procedure)
                    surgerycompletedInfo.ProcedureName = surgerycompletedInfo.Procedure.ProcedureName;

                surgerycompletedInfo.OTRoomName = '';
                if (surgerycompletedInfo.OTRoom)
                    surgerycompletedInfo.OTRoomName = surgerycompletedInfo.OTRoom.Description;

                $scope.todaysurgerycompletedData.push(surgerycompletedInfo);
            }
        }

        $scope.getCompleted = function () {
            var From = $filter('date')($scope.currentfilter.OTScheduledOn, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OTScheduledOn, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 20, Value: 3},
                    { Key: 16, Value: From },
                    { Key: 17, Value: To },
                    { Key: 19, Value: false },
                ],
                PageContext: {
                    PageSize: 6,
                    PageNumber: 1
                }
            };
           var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCompletedCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getList();
        $scope.getCompleted();
    }
    SurgeryDashboardController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();