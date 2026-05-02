(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('EndoscopyResultReviewController', EndoscopyResultReviewController);

    function EndoscopyResultReviewController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.Items = [];
        $scope.currentfilter = {
            DoctorId: utl.Session.getCurrentUserId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            TestTypeId: 4,
            patient: ''
        };
        $scope.item = {};
        $scope.currentcontext = {};
        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId())
        //getList
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
            var From = $filter('date')($scope.currentfilter.OrderRequestDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OrderRequestDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 6, Value: $scope.currentfilter.OrderNumber },
                    { Key: 8, Value: $scope.currentfilter.PatientMRN },
                    { Key: 10, Value: $scope.currentfilter.DoctorId },
                    { Key: 15, Value: $scope.currentfilter.TestTypeId },
                    { Key: 27, Value: $scope.currentfilter.FacilityId },
                    { Key: 4, Value: '11' },
                    { Key: 12, Value: From },
                    { Key: 13, Value: To },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'emr/patientorder/GetPatientOrderWithoutDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.bed_management = function () {
            $state.go('app.bedmanagement');
        }
        //Grid Actions

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'review') {
                $state.go('app.endoscopyresultreview-form', { id: row.entity.Id, pid: row.entity.PatientId, eid: row.entity.EncounterId });
            }
        };
        vm.gridConfig = {
            columnDefs: [
                { field: "Id", name: 'Endoscopy Result Details', cellTemplate: 'prescriptionTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };
        $scope.initLookup = function () {
            var inputData = [];
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
    EndoscopyResultReviewController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();