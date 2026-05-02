(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orderdetaillistController', orderdetaillistController);

    function orderdetaillistController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.currentcontext = {};
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
        if (modalConfig && modalConfig.params) {
            $scope.currentfilter.orddeptid = parseInt(modalConfig.params.orddeptid);
           $scope.currentfilter.encordid = parseInt(modalConfig.params.encorderid);
           $scope.currentfilter.patname = (modalConfig.params.patname);
           $scope.currentfilter.patmrn = (modalConfig.params.patmrn);
           $scope.currentfilter.ordnr = (modalConfig.params.ordnr);
           $scope.currentfilter.orddt = (modalConfig.params.orddt);
           $scope.currentfilter.billingdt = (modalConfig.params.billingdt);
           $scope.currentfilter.billingid = (modalConfig.params.billingid); 

           $scope.confirmCallback = $uibModalInstance.close;
           $scope.cancelCallback = $uibModalInstance.dismiss;
        }
       
        /*

        $scope.currentfilter.orddeptid = $stateParams.orddeptid;
        $scope.currentfilter.encordid = parseInt($stateParams.encorderid);
        $scope.currentfilter.patname = $stateParams.patname;
        $scope.currentfilter.patmrn = $stateParams.patmrn;
        $scope.currentfilter.ordnr = $stateParams.ordnr;
        $scope.currentfilter.orddt = $stateParams.orddt; 
        $scope.currentfilter.billingdt = $stateParams.billingdt;
        $scope.currentfilter.billingid = $stateParams.billingid; 

        console.log(
            $stateParams.orddeptid + "\n" + 
            $scope.currentfilter.encordid + "\n" +
            $scope.currentfilter.patname + "\n" +
            $scope.currentfilter.patmrn + "\n" +
            $scope.currentfilter.ordnr + "\n" +
            $scope.currentfilter.orddt + "\n"  
        );
        */

        $scope.getListCallback = function (scope, res, options, hasError) { 
            var indx = 0;

            angular.forEach(res.Data, function (value, key) {
                res.Data[indx].IsTick = false; 
                res.Data[indx].Orderstatuse == 1 ? res.Data[indx].IsDisabled = false :  res.Data[indx].IsDisabled = true;
                res.Data[indx].billingdt = $scope.currentfilter.billingdt;
                res.Data[indx].billingid = $scope.currentfilter.billingid;
                indx++;
            });

            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentfilter.encordid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/patientorderdetails/GetPatientOrderdetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.onSelectAll = function () {
            $scope.currentfilter.deselectall = 0;
            angular.forEach(vm.gridConfig.data, function (value, key) {
                if (!value.IsTick && !value.IsDisabled) {
                     value.IsTick = true;
                } 
            });
        }

        $scope.onDeselectAll = function () {
            $scope.currentfilter.selectall = 0;
            angular.forEach(vm.gridConfig.data, function (value, key) {
                if (value.IsTick && !value.IsDisabled) {
                     value.IsTick = false;
                } 
            });
        }

        $scope.backToList = function () {
            $state.confirmCallback;
        }

        $scope.onCancelAction = function (Selecteddata) {
            var Items = [];
            var indx = 0;
            angular.forEach(vm.gridConfig.data, function (value, key) {
                if (value.IsTick) {
                    Items[Items.length] = vm.gridConfig.data[indx];
                    //console.log(Items); 
                }
                indx++;
            });
            var options = {
                action: 'lis/patientorderdetails/CancelPatientorderdetails',
                data: { Data: Items },
                type: 'post',
                onComplete: $scope.cancelItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.onCancelConfirmed = function (Selecteddata) {
            if ($scope.isTicked()) {
                var confirmOptions = {
                headingKey : 'common.confirm-modal-header.lbl',
                messageKey : 'lis.orderdetaillist.cancelaction.lbl',
                yesKey : 'common.yeskey.lbl',
                noKey : 'common.nokey.lbl',
               onSuccessMethod : $scope.onCancelAction,
             };
            utl.Dialog.confirmMessage(confirmOptions);  
            }
            else {
                alert($translate.instant('lis.orderdetaillist.statuschanged.lbl'));
            }
        }

        $scope.approveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.isTicked = function () {
            var rst = false;
            angular.forEach(vm.gridConfig.data, function (value, key) {
                if (value.IsTick) {
                    rst = true;
                }
            });

            return rst;
        }

        $scope.onApproveAction = function (Selecteddata) {
            var Items = []; 
            var indx = 0;
            angular.forEach(vm.gridConfig.data, function (value, key) {
                if (value.IsTick) {
                    Items[Items.length] = vm.gridConfig.data[indx];                     
                    //console.log(Items); 
                }
                indx++;
            }); 
            var options = {
                action: 'lis/patientorderdetails/ApprovePatientorderdetails',
                data: { Data: Items },
                type: 'post',
                onComplete: $scope.cancelItemCallback
            };
            utl.Http.doAction(options);
        }



        $scope.onApproveConfirmed = function (Selecteddata) {
            if ($scope.isTicked()) { 
                var confirmOptions = {
                headingKey : 'common.confirm-modal-header.lbl',
                messageKey : 'lis.orderdetaillist.approveaction.lbl',
                yesKey : 'common.yeskey.lbl',
                noKey : 'common.nokey.lbl',
                onSuccessMethod : $scope.onApproveAction,
            };
            utl.Dialog.confirmMessage(confirmOptions);  
            }
            else {
                alert($translate.instant('lis.orderdetaillist.statuschanged.lbl'));
            }
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'approve') {
                if (row.entity.Orderstatuse == 2) {
                    utl.Dialog.confirmDelete($scope.onApproveConfirmed, row.entity, $translate.instant('lis.orderdetaillist.approveaction.lbl'));
                } else {
                    alert($translate.instant('lis.orderdetaillist.statuschanged.lbl'));
                }
            }
            else if (actionType == 'history') {
                utl.Dialog.confirmDelete(null, 'History ' + row.entity.Id);
            }
            else if (actionType == 'cancel') {
                if (row.entity.Orderstatuse == 2) {
                    utl.Dialog.confirmDelete($scope.onCancelConfirmed, row.entity, $translate.instant('lis.orderdetaillist.cancelaction.lbl'));
                } else {
                    alert($translate.instant('lis.orderdetaillist.statuschanged.lbl'));
                }
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "Id", width: '10%', displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<center> <span ng-switch="{{row.entity.Orderstatuse}}"><span ng-switch-when="1"> <input type="checkbox" ng-model="row.entity.IsTick"  style="zoom:1.5" ></span><span ng-switch-default><input type="checkbox" ng-model="row.entity.IsTick"  style="zoom:1.5" disabled  ></span></center>'
                },
                {
                    field: "Testname", width: '30%', displayName: $translate.instant('lis.orderdetaillist.testname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{row.entity.Testname}} </div>'
                },
                {
                    field: "Priority", width: '15%', displayName: $translate.instant('lis.orderdetaillist.priority.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.PriorityStatus.DisplayName}} </div>'
                },
                {
                    field: "OrderedBy", width: '15%', displayName: $translate.instant('lis.orderdetaillist.orderedby.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.DoctorName}} </div>'
                },
                {
                    field: "Orderstatus", width: '13%', displayName: $translate.instant('lis.orderdetaillist.orderstatuse.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.OrderStatus.DisplayName}} </div>'
                },
                {
                    field: "Location", width: '15%', displayName: $translate.instant('lis.orderdetaillist.location.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.DeptId.DepartmentName}} </div>'
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
                { "Key": "OrderStatus" },
                { "Key": "Department" },
                { "Key": "SubDepartment" }
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

    orderdetaillistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();