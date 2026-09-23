(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('samplecollecctreviewlistController', samplecollecctreviewlistController);

    function samplecollecctreviewlistController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            OrdDeptId: -1,
            ordernrbillnr: '',
            OrderReqDate: '',
            FrmOrderReqDate: '',
            ToOrderReqDate: '',
            orderstatusid: -1,
            patienttypeid: -1,
            samplestatusid: -1
        };

        var parentdeptid = $state.params.parentdeptid;
        $scope.currentfilter.OrdDeptId = parentdeptid;
        //console.log("parentdeptid" + parentdeptid);
        //console.log(" OrdDeptId "+$scope.currentfilter.OrdDeptId);
        $scope.currentfilter.OrderReqDate = new Date();


        $scope.searchdt = function () {
            if ($scope.currentfilter.OrderReqDate == null)
                $scope.currentfilter.OrderReqDate = new Date();
           

            $scope.getList();
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            $scope.currentfilter.FrmOrderReqDate = $filter('date')($scope.currentfilter.OrderReqDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentfilter.ToOrderReqDate = $filter('date')($scope.currentfilter.OrderReqDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    { Key: 1, Value: parentdeptid },
                    { Key: 2, Value: [$scope.currentfilter.FrmOrderReqDate, $scope.currentfilter.ToOrderReqDate] }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/patientorders/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: '',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'billing') {
                utl.Dialog.confirmDelete(null, 'billing ' + row.entity.Id);
            }
            else if (actionType == 'token') {
                utl.Dialog.confirmDelete(null, 'token ' + row.entity.Id);
            }
            else if (actionType == 'action') { // call the child operations.
                utl.Modal.open('app.orderdetaillist', {
                    params:
                   {
                        orddeptid: $scope.currentfilter.OrdDeptId,
                        encorderid: row.entity.Id,
                        patname: (row.entity.Patient.FirstName ? (row.entity.Patient.FirstName) : '') + (row.entity.Patient.LastName ? (row.entity.Patient.LastName) : ''),
                        patmrn: row.entity.Patient.MRN,
                        ordnr: row.entity.Ordernumber,
                        orddt: row.entity.Orderrequestdate
                    },
                    confirmCallback: $scope.getList
                });
            }
            else if (actionType == 'history') {
                utl.Dialog.confirmDelete(null, 'history ' + row.entity.Id);
            }
        }

         vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "Order#", width: "10%", displayName: $translate.instant('lis.samplecollection.ordernr.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{row.entity.Ordernumber}} </div>'
                },
                {
                    field: "OrderReq", width: "12%",displayName: $translate.instant('lis.samplecollection.orderreqdate.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{row.entity.Orderrequestdate ? (row.entity.Orderrequestdate | date : "dd/MM/yyyy HH:mm:ss") : "N/A"}} </div>'
                },
                {
                    field: "patientname", width: "12%", displayName: $translate.instant('lis.samplecollection.patientinfo.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > <a href="#"> {{row.entity.Patient.MRN}} </a> {{row.entity.Patient.Title.Description}} {{row.entity.Patient.FirstName}} {{row.entity.Patient.LastName}}  </div>'
                }, 
                {
                    field: "DoctorName", width: "12%", displayName: $translate.instant('lis.samplecollection.visitid.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " >  </div>'
                },
                {
                    field: "samplestatuse", width: "10%", displayName: $translate.instant('lis.samplecollection.samplestatuse.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " >   </div>'
                },
                {
                    field: "Ordered By", width: "12%", displayName: $translate.instant('lis.samplecollection.orderby.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.User.Title.Description}}  {{row.entity.User.FirstName}}  {{row.entity.User.LastName}} </div>'
                },
                {
                    field: "priority", width: "10%", displayName: $translate.instant('lis.samplecollection.priority.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.PriorityStatus.DisplayName}} </div>'
                },
                {
                    field: "priority", width: "10%", displayName: $translate.instant('lis.samplecollection.labtype.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " >   </div>'
                },
                {
                    field: "Orderstatus", width: "10%", displayName: $translate.instant('lis.samplecollection.orderstatuse.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.OrderStatus.DisplayName}} </div>'
                },                
                {
                    field: "Id", width: "10%", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<a class="lnk-action" ng-click="grid.appScope.handleEvents(\'action\',row)"><img src="app/ico/16-16/action.png" alt="Image" class="block-center img-rounded" /></a> &nbsp;&nbsp;| ' +
                    '<a class="lnk-action" ng-click="grid.appScope.handleEvents(\'billing\',row)">B</a> &nbsp;&nbsp;| ' +
                    '<a class="lnk-action" ng-click="grid.appScope.handleEvents(\'token\',row)">T</a> &nbsp;&nbsp;| ' +                    
                    '<a class="lnk-action" ng-click="grid.appScope.handleEvents(\'history\',row)">I</a>'
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

    samplecollecctreviewlistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();