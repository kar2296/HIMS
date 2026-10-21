(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('samplereviewlistController', samplereviewlistController);

    function samplereviewlistController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $scope.refreshReactProps();
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
                    field: "Order#", width: "10%", displayName: $translate.instant('lis.samplereview.ordernr.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{row.entity.Ordernumber}} </div>'
                },
                {
                    field: "OrderReq", width: "12%",displayName: $translate.instant('lis.samplereview.orderreqdate.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{row.entity.Orderrequestdate ? (row.entity.Orderrequestdate | date : "dd/MM/yyyy HH:mm:ss") : "N/A"}} </div>'
                },
                {
                    field: "patientname", width: "12%", displayName: $translate.instant('lis.samplereview.patientinfo.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > <a href="#"> {{row.entity.Patient.MRN}} </a> {{row.entity.Patient.Title.Description}} {{row.entity.Patient.FirstName}} {{row.entity.Patient.LastName}}  </div>'
                }, 
                {
                    field: "DoctorName", width: "12%", displayName: $translate.instant('lis.samplereview.visitid.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " >  </div>'
                },
                {
                    field: "samplestatuse", width: "10%", displayName: $translate.instant('lis.samplereview.samplestatuse.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " >   </div>'
                },
                {
                    field: "Ordered By", width: "12%", displayName: $translate.instant('lis.samplereview.orderby.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.User.Title.Description}}  {{row.entity.User.FirstName}}  {{row.entity.User.LastName}} </div>'
                },
                {
                    field: "priority", width: "10%", displayName: $translate.instant('lis.samplereview.priority.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{row.entity.PriorityStatus.DisplayName}} </div>'
                },
                {
                    field: "priority", width: "10%", displayName: $translate.instant('lis.samplereview.labtype.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " >   </div>'
                },
                {
                    field: "Orderstatus", width: "10%", displayName: $translate.instant('lis.samplereview.orderstatuse.lbl'),
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

        $scope.refreshReactProps = function () {
            var dataList = (vm.gridConfig && vm.gridConfig.data) || [];
            var pager = (vm.gridConfig && vm.gridConfig.pagerObj) || { totalItems: 0, currentPage: 1, pageSize: 25 };
            $scope.reactProps = {
                rows: dataList,
                items: dataList,
                totalItems: (pager.totalItems !== undefined && pager.totalItems !== null) ? pager.totalItems : dataList.length,
                currentPage: pager.currentPage || 1,
                pageSize: pager.pageSize || 25,
                pagerObj: {
                    totalItems: (pager.totalItems !== undefined && pager.totalItems !== null) ? pager.totalItems : dataList.length,
                    currentPage: pager.currentPage || 1,
                    pageSize: pager.pageSize || 25,
                    startIndex: ((pager.currentPage || 1) - 1) * (pager.pageSize || 25)
                },
                currentfilter: angular.copy($scope.currentfilter),
                lookup: angular.copy($scope.lookup || {}),
                tp: $stateParams.parentdeptid || 1,
                facilityName: utl.Session.getCurrentFacilityName ? utl.Session.getCurrentFacilityName() : 'SHUVADARSINI HOSPITAL'
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'edit') {
                $scope.handleEvents('action', { entity: payload });
            } else if (actionName === 'patientinfo') {
                if (payload && payload.Patient && payload.Patient.Id) {
                    utl.Modal.open('registration.patientprofile', {
                        params: { pid: payload.Patient.Id },
                        confirmCallback: $scope.getList
                    });
                }
            } else if (actionName === 'search') {
                if (payload) {
                    if (payload.PatOrdNo !== undefined) $scope.currentfilter.ordernrbillnr = payload.PatOrdNo;
                    if (payload.samplestatusid !== undefined) $scope.currentfilter.samplestatusid = payload.samplestatusid;
                    if (payload.FromDate !== undefined) $scope.currentfilter.OrderReqDate = new Date(payload.FromDate);
                }
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'resetFilters') {
                $scope.currentfilter.ordernrbillnr = '';
                $scope.currentfilter.samplestatusid = -1;
                $scope.currentfilter.orderstatusid = -1;
                $scope.currentfilter.patienttypeid = -1;
                $scope.currentfilter.OrderReqDate = new Date();
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload && payload.page ? payload.page : 1;
                $scope.getList();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
        $scope.refreshReactProps();

    }

    samplereviewlistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();