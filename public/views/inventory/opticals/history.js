(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('HistoryGRNController', HistoryGRNController);

    function HistoryGRNController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        $scope.historyprofile = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        // $scope.currentcontext.hid = parseInt(modalConfig.params.hid);

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
        // $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.item.HistoryId = $scope.currentcontext.hid;

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.historyprofile = res.Data;
        };
        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                   { Key: 0, Value: $scope.item.HistoryId },
                ],
                // PageContext: {
                //     PageSize: vm.gridConfig.pagerObj.pageSize,
                //     PageNumber: vm.gridConfig.pagerObj.currentPage
                // }
            };
            var options = {
                action: 'pharmacy/grn/GetGrns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        // $scope.getItemCallback = function (scope, data, options, hasError) {
        //     $scope.item = data;
        //     // if (data.GrnStatusId == 1) {
        //     //     $scope.item.isDisabled = false;
        //     //     $scope.item.DisplayGrnStatus = 'Draft';
        //     // }
        //     // if (data.GrnStatusId == 2) {
        //     //     $scope.item.isDisabled = true;
        //     //     $scope.item.DisplayGrnStatus = 'Approved';
        //     // }
        //     // if (data.GrnStatusId == 3) {
        //     //     $scope.item.isDisabled = true;
        //     //     $scope.item.DisplayGrnStatus = 'Authorized';
        //     // }
        //     // if (data.GrnStatusId == 4) {
        //     //     $scope.item.isDisabled = true;
        //     //     $scope.item.DisplayGrnStatus = 'Completed';
        //     // }
        //     // if (data.GrnStatusId == 5) {
        //     //     $scope.item.isDisabled = true;
        //     //     $scope.item.DisplayGrnStatus = 'Cancelled';
        //     // }
        //     // $scope.item.RecDisabled = true;
        //     // $scope.applyVisibilityRules();
        // };

        // $scope.getItem = function () {
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //         var options = {
        //             action: 'pharmacy/grn/GetGrnById',
        //             data: {
        //                 Id: $scope.currentcontext.id
        //             },
        //             type: 'post',
        //             onComplete: $scope.getItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        // function loadData() {
        //     $scope.getItem();
        // }
        // vm.gridConfig = {
        //     enableColumnResizing: true,
        //     columnDefs: [
        //         {
        //             field: "TestName", displayName: $translate.instant('ordermanagement.orderacknowledgement-form.testname.lbl'),
        //             cellTemplate: "<div class='ui-grid-cell-contents'>"
        //             + "<span class='pl-3'>{{row.entity.Name }}</span>"
        //             + "<span class='pl-3'>(</span>"
        //             + "<span class='pl-3'>{{row.entity.Code}}</span>" + "<span class='pl-3'>)</span>"
        //             + "</div>"
        //         },
        //         { field: "Sampletype.Name", displayName: $translate.instant('lis.testmasters.sampletypeId.lbl') },
        //         { field: "Containertype.Name", displayName: $translate.instant('lis.testmasters.sampletypeId.lbl') },
        //         { field: "Methodology", displayName: $translate.instant('lis.testmasters.methodology.lbl') },
        //         { field: "TESTMASTERTYP.Description", displayName: $translate.instant('lis.testmasters.type.lbl') },
        //         { field: "Department.DepartmentName", displayName: $translate.instant('lis.testmasters.departmentId.lbl') },
        //         { field: "SubDepartment.DepartmentName", displayName: $translate.instant('lis.testmasters.subDepartmentId.lbl') },
        //         { field: "ActiveStatus.Description", displayName: $translate.instant('lis.testmasters.status.lbl') },
        //     ],
        //     pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        // };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            // $scope.loadData();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OrderStatus" }
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
        // loadData();
    }

    HistoryGRNController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();