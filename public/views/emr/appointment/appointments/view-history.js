(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('viewhistoryController', viewhistoryController);

    function viewhistoryController($scope, $stateParams, $filter, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: utl.Formatter.addWeeks(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        }
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.appointmentId = parseInt(modalConfig.params.appointmentId);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
        };

        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 16, Value: $scope.currentcontext.pid },
                    { Key: 17, Value: utl.Formatter.getFilterDate(FromDate) },
                    { Key: 18, Value: utl.Formatter.getFilterDate(ToDate) },
                    // { Key: 11, Value: [fromdate, todate] },
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();

        vm.gridConfig = {
            columnDefs: [
                { field: "DoctorName", displayName: $translate.instant('appointment.appointment-history.doctor.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('appointment.appointment-history.department.lbl') },
                {
                    field: "StartDate", displayName: $translate.instant('appointment.appointment-history.startdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.StartDate'></ngformatdate>"
                },
                { field: "ConsultationStatus.Description", displayName: $translate.instant('appointment.appointment-history.status.lbl') }

            ]
        };

        viewhistoryController.$inject = ['$scope', '$stateParams', '$filter', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

    }
})();