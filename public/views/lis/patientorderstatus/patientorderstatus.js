(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientorderstatusController', patientorderstatusController);

 
    function patientorderstatusController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];

        $scope.currentcontext = {
            orderid: -1,
            encordid: -1, 
            OrderstatusId: -1, 
            parentdeptid: -1,
            subdeptid: -1,
            selectall: 0,
            deselectall: 0,
            billingId: -1,
            billingdt: ''
        };

        /*
        $scope.currentfilter = {
            orderid: -1,
            encordid: -1, 
            OrderstatusId: -1, 
            parentdeptid: -1,
            subdeptid: -1,
            selectall: 0,
            deselectall: 0,
            billingId: -1,
            billingdt: ''
        };

        $scope.currentfilter.orddeptid = $stateParams.orddeptid;
        $scope.currentfilter.encordid = parseInt($stateParams.encorderid);
        $scope.currentfilter.patname = $stateParams.patname;
        $scope.currentfilter.patmrn = $stateParams.patmrn;
        $scope.currentfilter.ordnr = $stateParams.ordnr;
        $scope.currentfilter.orddt = $stateParams.orddt; 
        $scope.currentfilter.billingdt = $stateParams.billingdt;
        $scope.currentfilter.billingid = $stateParams.billingid; 
        */

        if (modalConfig && modalConfig.params) {
           $scope.currentcontext.orddeptid = parseInt(modalConfig.params.orddeptid);
           $scope.currentcontext.encordid = parseInt(modalConfig.params.encorderid);
           $scope.currentcontext.patname = (modalConfig.params.patname);
           $scope.currentcontext.patmrn = (modalConfig.params.patmrn);
           $scope.currentcontext.ordnr = (modalConfig.params.ordnr);
           $scope.currentcontext.orddt = (modalConfig.params.orddt);
           $scope.currentcontext.billingdt = (modalConfig.params.billingdt);
           $scope.currentcontext.billingid = (modalConfig.params.billingid); 

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

       
         
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            //console.log(vm.gridConfig.data);
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
           
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.encordid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/patientorderstatus/GetPatientOrderStatus',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        }; 

        $scope.backToList = function () {
            $state.confirmCallback;
        }
 

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "Order#", displayName: $translate.instant('lis.orderprocess.ordernr.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{row.entity.Ordernumber}} </div>'
                },
                {
                    field: "OrderReq", displayName: $translate.instant('lis.orderprocess.orderreqdate.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{row.entity.Orderrequestdate ? (row.entity.Orderrequestdate | date : "dd/MM/yyyy HH:mm:ss") : "N/A"}} </div>'
                },
                {
                    field: "PatientInfo", displayName: $translate.instant('lis.orderprocess.patientinfo.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.Patient.Title.Description}} {{row.entity.Patient.FirstName}} {{row.entity.Patient.LastName}} | {{row.entity.Patient.Gender.Description}}  |  {{row.entity.Patient.DOB  ? (row.entity.Patient.DOB | date : "dd/MM/yyyy ") : "N/A" }} {{row.entity.DoctorName}} </div>'
                },
                {
                    field: "priority", displayName: $translate.instant('lis.orderprocess.priority.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.PriorityStatus.DisplayName}} </div>'
                },
                {
                    field: "Orderstatus", displayName: $translate.instant('lis.orderprocess.orderstatuse.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.OrderStatus.DisplayName}} </div>'
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data; 
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OrderStatus" }
            ]
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

    patientorderstatusController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();