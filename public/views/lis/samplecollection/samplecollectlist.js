(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('samplecollectlistController', samplecollectlistController);

    function samplecollectlistController($scope, $filter, $stateParams, $state, $translate, utl) {
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

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'billing') {
                utl.Dialog.confirmDelete(null, 'billing ' + entity.Id);
            }
            else if (actionType == 'token') {
                utl.Dialog.confirmDelete(null, 'token ' + entity.Id);
            }
            else if (actionType == 'action' || actionType == 'view' || actionType == 'edit') { // call the child operations.
                utl.Modal.open('app.orderdetaillist', {
                    params:
                   {
                        orddeptid: $scope.currentfilter.OrdDeptId,
                        encorderid: entity.Id,
                        patname: (entity.Patient.FirstName ? (entity.Patient.FirstName) : '') + (entity.Patient.LastName ? (entity.Patient.LastName) : ''),
                        patmrn: entity.Patient.MRN,
                        ordnr: entity.Ordernumber,
                        orddt: entity.Orderrequestdate
                    },
                    confirmCallback: $scope.getList
                });
            }
            else if (actionType == 'history') {
                utl.Dialog.confirmDelete(null, 'history ' + entity.Id);
            }
        }

         vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "Order#", width: "10%", displayName: $translate.instant('lis.samplecollection.ordernr.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Ordernumber}} </div>'
                },
                {
                    field: "OrderReq", width: "12%",displayName: $translate.instant('lis.samplecollection.orderreqdate.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Orderrequestdate ? (entity.Orderrequestdate | date : "dd/MM/yyyy HH:mm:ss") : "N/A"}} </div>'
                },
                {
                    field: "patientname", width: "12%", displayName: $translate.instant('lis.samplecollection.patientinfo.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > <a href="#"> {{entity.Patient.MRN}} </a> {{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} {{entity.Patient.LastName}}  </div>'
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
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.User.Title.Description}}  {{entity.User.FirstName}}  {{entity.User.LastName}} </div>'
                },
                {
                    field: "priority", width: "10%", displayName: $translate.instant('lis.samplecollection.priority.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.PriorityStatus.DisplayName}} </div>'
                },
                {
                    field: "priority", width: "10%", displayName: $translate.instant('lis.samplecollection.labtype.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " >   </div>'
                },
                {
                    field: "Orderstatus", width: "10%", displayName: $translate.instant('lis.samplecollection.orderstatuse.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.OrderStatus.DisplayName}} </div>'
                },
                {
                    field: "Id", width: "10%", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
]
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

    samplecollectlistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();