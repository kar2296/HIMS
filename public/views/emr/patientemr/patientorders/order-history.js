(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orderTATController', orderTATController);

    function orderTATController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.history = []
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.oid = parseInt(modalConfig.params.oid);
            $scope.currentcontext.odid = parseInt(modalConfig.params.odid);
            $scope.currentcontext.testtypeid = parseInt(modalConfig.params.testtypeid);
            // $scope.currentcontext.TestId = parseInt(modalConfig.params.tid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        // $scope.getListCallback = function (scope, res, options, hasError) {
        //     vm.gridConfig.data = res.Data;
        //     $scope.history = vm.gridConfig.data;
        // };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.PreviousOrderDetails = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                console.log(item, 'item');
                if ($scope.currentcontext.testtypeid === 1) {
                    if (item.PatientOrderDetail.DepartmentId === 8)
                        $scope.PreviousOrderDetails.push(item)
                } else if ($scope.currentcontext.testtypeid === 2) {
                    if (item.PatientOrderDetail.DepartmentId === 62)
                        $scope.PreviousOrderDetails.push(item)
                } else if ($scope.currentcontext.testtypeid === 3) {
                    if (item.PatientOrderDetail.DepartmentId === 60)
                        $scope.PreviousOrderDetails.push(item)
                }
            }

        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.currentcontext.pid
                    },
                    // { Key: 18, Value: $scope.currentcontext.dpt },
                    // { Key: 5, Value: $scope.currentcontext.oid },
                    // { Key: 6, Value: $scope.currentcontext.odid },
                    // { Key: 7, Value: $scope.currentfilter.TestId }
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'lis/ordertat/GetOrderTATs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();

        vm.gridConfig = {
            columnDefs: [{
                    field: "TestName",
                    displayName: $translate.instant('patientemr.patientorder-form.test.lbl')
                },
                {
                    field: "PatientOrder.OrderStatus.DisplayName",
                    displayName: $translate.instant('Order Status')
                },
                {
                    field: "OrderedOn",
                    displayName: $translate.instant('OrderedOn'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.OrderedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.OrderedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "AcceptedOn",
                    displayName: $translate.instant('AcceptedOn'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.AcceptedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.AcceptedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "SampleCollectedOn",
                    displayName: $translate.instant('SampleCollectedOn'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.SampleCollectedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.SampleCollectedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "SampleReceivedOn",
                    displayName: $translate.instant('SampleReceivedOn'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.SampleReceivedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.SampleReceivedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "AssignedOn",
                    displayName: $translate.instant('AssignedOn'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.AssignedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.AssignedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "TechValidationOn",
                    displayName: $translate.instant('TechValidationOn'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.TechValidationOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.TechValidationOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "MedValidationOn",
                    displayName: $translate.instant('MedValidationOn'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.MedValidationOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.MedValidationOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "ReleasedOn",
                    displayName: $translate.instant('ReleasedOn'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.ReleasedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.ReleasedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
            ]
        };
    }


    orderTATController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();