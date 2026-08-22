(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmenthistoryController', appointmenthistoryController);

    function appointmenthistoryController($scope, $stateParams, $filter, $state, $translate, utl, $uibModalInstance, modalConfig) {
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
            updateReactProps();
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

        appointmenthistoryController.$inject = ['$scope', '$stateParams', '$filter', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to AppointmentHistoryModal.tsx,
        // shared verbatim with the byte-for-byte-identical view-history.js
        // -- see the .tsx header comment for the full disclosure of this
        // real, pre-existing duplication in the Angular source).
        // All API calls/business logic above are untouched.
        //
        // currentfilter.From/To are seeded as plain Date objects and read
        // directly by getList()'s $filter('date') calls -- normalize to/from
        // an ISO yyyy-MM-dd string only at this bridge boundary so the
        // native DatePicker gets the string shape it expects, matching the
        // established convention (see alloppatientlist.js).
        // ---------------------------------------------------------------
        function toIsoDateString(d) {
            if (!d) return '';
            var dt = new Date(d);
            if (isNaN(dt.getTime())) return '';
            var mm = ('0' + (dt.getMonth() + 1)).slice(-2);
            var dd = ('0' + dt.getDate()).slice(-2);
            return dt.getFullYear() + '-' + mm + '-' + dd;
        }
        function fromIsoDateString(s) {
            if (!s) return null;
            var parts = String(s).split('-');
            if (parts.length !== 3) return null;
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }

        function updateReactProps() {
            $scope.reactProps = {
                pid: $scope.currentcontext.pid,
                from: toIsoDateString($scope.currentfilter.From),
                to: toIsoDateString($scope.currentfilter.To),
                rows: vm.gridConfig.data || []
            };
        }

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'filterChangeAndSearch':
                    if (payload.field === 'From') {
                        $scope.currentfilter.From = fromIsoDateString(payload.value);
                    } else if (payload.field === 'To') {
                        $scope.currentfilter.To = fromIsoDateString(payload.value);
                    }
                    // Matches the real template: both From/To inputs have
                    // ng-change="getList()" and refetch immediately.
                    $scope.getList();
                    updateReactProps();
                    break;
                case 'cancel':
                    $scope.cancelCallback();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };

        updateReactProps();
    }
})();
