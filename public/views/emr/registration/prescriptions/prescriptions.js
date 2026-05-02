(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('prescriptionsController', prescriptionsController);

    function prescriptionsController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.Items = [];
        $scope.currentfilter = {
            DoctorId: utl.Session.getCurrentUserId(),
            PrescriptionDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: -1,
            PharmacyId: -1,
            PrecriptionStatusId: 3,
            patient: ''
        };
        $scope.item = {}

        $scope.currentcontext = {};
        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId())
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.PrescriptionDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.PrescriptionDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 14, Value: $scope.currentfilter.patient },
                    { Key: 3, Value: $scope.currentfilter.DoctorId },
                    { Key: 6, Value: $scope.currentfilter.PrecriptionStatusId },
                    { Key: 17, Value: $scope.currentfilter.FacilityId },
                    { Key: 8, Value: From },
                    { Key: 9, Value: To }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'emr/prescription/GetPrescriptionsWithoutDetails',
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
        $scope.addNew = function () {
            $state.go('app.doctorsprescription-form', {
                    id: 0, pid: $scope.currentcontext.pid, context: $scope.currentcontext.context,
                    doctid: $scope.currentfilter.DoctorId, deptid: $scope.currentcontext.DepartmentId
            });
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.doctorsprescription-form', {
                    id: row.entity.Id, pid: row.entity.PatientId, context: $scope.currentcontext.context
                });
            }
        };
        vm.gridConfig = {
            columnDefs: [
                { field: "Id", name: 'Prescriptions', cellTemplate: 'prescriptionTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PrecriptionStatus" }
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
    prescriptionsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();