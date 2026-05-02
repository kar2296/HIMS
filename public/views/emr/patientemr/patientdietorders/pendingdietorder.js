(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingDietorderController', pendingDietorderController);

    function pendingDietorderController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            if (modalConfig.params.eid)
            $scope.currentcontext.EncounterId = modalConfig.params.eid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.id = modalConfig.params.id

        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {
                mrn: '',
                patientname: '',
                dateofbirth: '',
                orderpriorityid: 1,
                PatientId: -1,
                orderstatusid: 9,
                VisitTypeId: -1,
                IsAdmitted: false
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    { type: 'select', translate: 'patientemr.patientorder-list.filter_priority.lbl', model: 'orderpriorityid', options: $scope.lookup.OrderPriority, position: { r: 0, c: 0 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.filter_status.lbl', model: 'orderstatusid', options: $scope.lookup.OrderStatus, position: { r: 0, c: 1 } },
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));;
            }
            if ($scope.currentcontext.id >= 1) {
                $scope.getList()
            };
        }

        //Dynamic form  ends    

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {

            $scope.gridData = res.Data;
            var items = $scope.gridData;
            for (var idx in items) {
                var item = items[idx];
                item.LatestAppointment = (item.Appointments != null &&
                    item.Appointments.length > 0) ?
                    item.Appointments[0] : null;
            }
            vm.gridConfig.data = items;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.id },
                    { Key: 3, Value: $scope.modeldata.orderpriorityid },
                    { Key: 4, Value: $scope.modeldata.orderstatusid },
                    { Key: 14, Value: $scope.currentcontext.EncounterId }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientdietorder/GetPatientDietOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            columnDefs: [
                { field: "OrderNumber", displayName: $translate.instant('patientemr.patientorder-list.number.lbl') },
                {
                    field: "OrderedBy",
                    displayName: $translate.instant('patientemr.patientorder-list.orderedby.lbl'),
                    cellTemplate: "<displayuser user='row.entity.User'></displayuser>"
                },
                { field: "OrderPriority.Description", displayName: $translate.instant('patientemr.patientorder-list.priority.lbl') },
                {
                    field: "OrderRequestDate",
                    displayName: $translate.instant('patientemr.patientorder-list.ordereddateandtime.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.OrderRequestDate'></ngformatdate>"
                },
                // {
                //     field: "OrderScheduleDate",
                //     displayName: $translate.instant('patientemr.patientorder-list.scheduledateandtime.lbl'),
                //     cellTemplate: "<ngformatdate date-val='row.entity.OrderScheduleDate'></ngformatdate>"
                // },
                { field: "OrderFrom.DepartmentName", displayName: $translate.instant('patientemr.patientorder-list.orderfrom.lbl') },
                { field: "OrderTo.DepartmentName", displayName: $translate.instant('patientemr.patientorder-list.orderto.lbl') },
                { field: "OrderStatus.DisplayName", displayName: $translate.instant('patientemr.patientorder-list.status.lbl') },


            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableFullRowSelection: true


        };

        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                console.log(row.entity.Id);
                $scope.confirmCallback({ id: row.entity.Id });
            });
        };
        //Grid selection related code ends

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            if ($scope.currentcontext.id >= 1) {
                $scope.getList()
            };
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OrderStatus" },
                { "Key": "OrderPriority" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    pendingDietorderController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();