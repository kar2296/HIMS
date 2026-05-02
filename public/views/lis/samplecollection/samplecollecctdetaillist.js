(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('samplecollectdetaillist', samplecollectdetaillist);

    function samplecollectdetaillist($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.currentfilter = {
            encordid: -1,
            code: '',
            type: '',
            mnemonics: '',
            status: -1,

            patname: '',
            patmrn: '',
            ordnr: '',
            orddt: '',
        };


        $scope.currentfilter.encordid = parseInt($stateParams.encorderid);
        $scope.currentfilter.patname = $stateParams.patname;
        $scope.currentfilter.patmrn = $stateParams.patmrn;
        $scope.currentfilter.ordnr = $stateParams.ordnr;
        $scope.currentfilter.orddt = $stateParams.orddt;


        $scope.getListCallback = function (scope, data, options, hasError) {
            var indx = 0;

            angular.forEach(data, function (value, key) {
                data[indx].IsTick = false;
                indx++;
            });

            vm.gridConfig.data = data;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentfilter.encordid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
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

        $scope.backToList = function () {
            $state.go('app.orderacknowledgelist');
        }

        $scope.cancelItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

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
                action: 'lis/encounterorderdetails/CancelEncounterorderdetails',
                data: { Data: Items },
                type: 'post',
                onComplete: $scope.cancelItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.onCancelConfirmed = function (Selecteddata) {
            if ($scope.isTicked()) {
                utl.Dialog.confirmDelete($scope.onCancelAction, null, $translate.instant('lis.orderdetaillist.cancelaction.lbl'));
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
                action: 'lis/encounterorderdetails/ApproveEncounterorderdetails',
                data: { Data: Items },
                type: 'post',
                onComplete: $scope.cancelItemCallback
            };
            utl.Http.doAction(options);
        }



        $scope.onApproveConfirmed = function (Selecteddata) {
            if ($scope.isTicked()) {
                utl.Dialog.confirmDelete($scope.onApproveAction, null, $translate.instant('lis.orderdetaillist.approveaction.lbl'));
            }
            else {
                alert($translate.instant('lis.orderdetaillist.statuschanged.lbl'));
            }
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'approve') {
                if (entity.Orderstatuse == 2) {
                    utl.Dialog.confirmDelete($scope.onApproveConfirmed, entity, $translate.instant('lis.orderdetaillist.approveaction.lbl'));
                } else {
                    alert($translate.instant('lis.orderdetaillist.statuschanged.lbl'));
                }
            }
            else if (actionType == 'history') {
                utl.Dialog.confirmDelete(null, 'History ' + entity.Id);
            }
            else if (actionType == 'cancel') {
                if (entity.Orderstatuse == 2) {
                    utl.Dialog.confirmDelete($scope.onCancelConfirmed, entity, $translate.instant('lis.orderdetaillist.cancelaction.lbl'));
                } else {
                    alert($translate.instant('lis.orderdetaillist.statuschanged.lbl'));
                }
            }
        }


        vm.gridConfig = {
            columnDefs: [

                {
                    field: "Id", width: '10%', displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<center> <span ng-switch="{{entity.Orderstatuse}}"><span ng-switch-when="2"><input type="checkbox" ng-model="entity.IsTick"  style="zoom:1.5" ></span><span ng-switch-default><input type="checkbox" ng-model="entity.IsTick"  style="zoom:1.5" disabled  ></span></center>'
                },
                {
                    field: "Testname", width: '30%', displayName: $translate.instant('lis.orderdetaillist.testname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Testname}} </div>'
                },
                {
                    field: "Priority", width: '20%', displayName: $translate.instant('lis.orderdetaillist.priority.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.PriorityStatus.DisplayName}} </div>'
                },
                {
                    field: "OrderedBy", width: '20%', displayName: $translate.instant('lis.orderdetaillist.orderedby.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.DoctorName}} </div>'
                },
                {
                    field: "Orderstatus", width: '20%', displayName: $translate.instant('lis.orderdetaillist.orderstatuse.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.OrderStatus.DisplayName}} </div>'
                },
                {
                    field: "Location", width: '20%', displayName: $translate.instant('lis.orderdetaillist.location.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.Department.DepartmentName}} </div>'
                },
                /*{ field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                           cellTemplate : '<a class="lnk-action" ng-click="grid.appScope.handleEvents(\'approve\',entity)">  <img src="app/ico/16-16/approve.png" alt="Image" class="block-center img-rounded" /></a> &nbsp;&nbsp;| '+
                           '<a class="lnk-action" ng-click="grid.appScope.handleEvents(\'history\',entity)"> <img src="app/ico/16-16/info.png" alt="Image" class="block-center img-rounded" /></a> &nbsp;&nbsp;| '+
                           '<a class="lnk-action" ng-click="grid.appScope.handleEvents(\'cancel\',entity)"> <img src="app/ico/16-16/delete.png" alt="Image" class="block-center img-rounded" /></a> '

                }*/

                // { field :"Id", name:'Order Details', cellTemplate : 'patientListTemplate.html'}

            ]
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

    samplecollectdetaillist.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();