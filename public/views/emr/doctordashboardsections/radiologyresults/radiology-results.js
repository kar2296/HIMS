(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RadiologyResultReviewController', RadiologyResultReviewController);

    function RadiologyResultReviewController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.Items = [];
        $scope.currentfilter = {
            DoctorId: utl.Session.getCurrentUserId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            TestTypeId: 2,
            patient: '',
            OrderRequestDate: utl.Formatter.getCurrentDate()
        };
        $scope.item = {};
        $scope.currentcontext = {};
        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId())


        $scope.InfectionControl = function () {
            $state.go('app.infectioncontrols', { id: 0 });
        };
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var order = res.Data[idx];
                // var list = {};
                if (order.ReviewStatusId != 1) {
                    for (var jdx in order.PatientWorkorders) {
                        var workorder = order.PatientWorkorders[jdx];
                        if (workorder.WorkOrderStatusId >= 7) {
                            var list = res.Data[idx];
                    vm.gridConfig.data.push(list);
                }
            }
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
                    { Key: 22, Value: "7,8,9" }
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
                $state.go('app.radiologyresultreview-form', { id: row.entity.Id, pid: row.entity.PatientId, eid: row.entity.EncounterId });
            }
        };
        vm.gridConfig = {
            columnDefs: [
                { field: "Id", name: 'Radiology Result Details', cellTemplate: 'prescriptionTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 1000 }
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
    RadiologyResultReviewController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();