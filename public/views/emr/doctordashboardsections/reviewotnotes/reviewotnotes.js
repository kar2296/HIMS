(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OtNoteReviewController', OtNoteReviewController);

    function OtNoteReviewController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.Items = [];
        $scope.currentfilter = {
            // ChiefSurgeonId: utl.Session.getCurrentUserId(),
            OTRegisteredOn: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            patient: ''
        };

        $scope.item = {}
        $scope.currentcontext = {};
        $scope.context = $stateParams.context;
        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId())
        if ($scope.context == 'doctor') // 2=> Physician
        { $scope.currentfilter.ChiefSurgeonId = utl.Session.getCurrentUserId() }

        $scope.InfectionControl = function () {
            $state.go('app.infectioncontrols', { id: 0 });
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var list = {};
                if (res.Data[idx].ReviewStatusId != 1) {
                    list = res.Data[idx];
                    vm.gridConfig.data.push(list);
                }
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };
        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.OTRegisteredOn, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OTRegisteredOn, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.PatientNameMRN },
                    { Key: 3, Value: "2,4" },
                    { Key: 9, Value: From },
                    { Key: 10, Value: To },
                    { Key: 4, Value: $scope.currentfilter.OTIdentifier },
                    // { Key: 5, Value: $scope.currentfilter.ChiefSurgeonId },
                    { Key: 14, Value: $scope.currentfilter.FacilityId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.context == 'doctor')
                inputData.Params.push({ Key: 5, Value: $scope.currentfilter.ChiefSurgeonId });
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        //Grid Actions
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //Grid Actions

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'review') {
                $state.go('app.otdoctornotes-form', { id: row.entity.Id, pid: row.entity.PatientId });
            }
        };
        vm.gridConfig = {
            columnDefs: [
                { field: "Id", name: 'OT Register Details', cellTemplate: 'prescriptionTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OTScheduleStatus" }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $scope.initLookup();
    }
    OtNoteReviewController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();