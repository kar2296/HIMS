(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orderprocesslistController', orderprocesslistController);

    function orderprocesslistController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            OrderReqDate: '',
            FrmOrderReqDate: '',
            ToOrderReqDate: '',
            code: '',
            type: '',
            mnemonics: '',
            status: -1
        };

        var parentdeptid = $state.params.parentdeptid;
        console.log("parentdeptid" + parentdeptid);
        $scope.currentfilter.OrderReqDate = new Date();


        $scope.searchdt = function () {
            if ($scope.currentfilter.OrderReqDate == null)
                $scope.currentfilter.OrderReqDate = new Date();
            // if (reqdt == null)
            //    reqdt = $filter('date')(reqdt, 'yyyy-MM-dd 00:00:00');

            $scope.getList();
        };


        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = (data && data.Data) || [];
            if (vm.gridConfig.pagerObj && data && data.PageContext) {
                vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            }
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
                    PageSize: 25,
                    PageNumber: 1
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
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate : '<a class="lnk-action" ng-click="grid.appScope.handleEvents(\'billing\',row)"></a> &nbsp;&nbsp;| '+
                    '<a class="lnk-action" ng-click="grid.appScope.handleEvents(\'token\',row)"></a> &nbsp;&nbsp;| '+
                    '<a class="lnk-action" ng-click="grid.appScope.handleEvents(\'action\',row)"><img src="app/ico/16-16/action.png" alt="Image" class="block-center img-rounded" /></a> &nbsp;&nbsp;| '+
                    '<a class="lnk-action" ng-click="grid.appScope.handleEvents(\'history\',row)"></a>' 
                }


                // { field: "Id", name: 'Order Details', cellTemplate: 'patientListTemplate.html' }

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
                    if (payload.OrderBillNo !== undefined) $scope.currentfilter.ordernr = payload.OrderBillNo;
                    if (payload.PatientNameMRN !== undefined) $scope.currentfilter.mrn = payload.PatientNameMRN;
                    if (payload.WorkOrderStatusId !== undefined) $scope.currentfilter.Orderstatuse = payload.WorkOrderStatusId;
                    if (payload.FromDate !== undefined) $scope.currentfilter.OrderReqDate = new Date(payload.FromDate);
                }
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'resetFilters') {
                $scope.currentfilter.ordernr = '';
                $scope.currentfilter.mrn = '';
                $scope.currentfilter.Orderstatuse = -1;
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

    orderprocesslistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();