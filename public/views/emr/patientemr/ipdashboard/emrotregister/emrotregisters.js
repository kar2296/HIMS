(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OtRegisterNotesController', OtRegisterNotesController);

    function OtRegisterNotesController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.Items = [];
        $scope.currentfilter = {
            TestTypeId: -1,
            patient: ''
        };
        $scope.item = {}
        $scope.currentcontext = {};
        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId()),
            $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        $scope.currentcontext.context = $stateParams.context;
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

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
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientorder/DeletePatientOrder',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                $state.go('patientemr.otregister', { id: row.entity.Id, pid: row.entity.PatientId, context: $scope.currentcontext.context });
            }
        };
        vm.gridConfig = {
            columnDefs: [
                { field: "Id", name: 'OT RegisterNotes Details', cellTemplate: 'otnotesTemplate.html' }
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
    OtRegisterNotesController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();