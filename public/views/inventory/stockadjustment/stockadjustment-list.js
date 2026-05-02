(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockAdjustmentListController', StockAdjustmentListController);

    function StockAdjustmentListController($rootScope,$scope, $filter, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            AdjustmentNumber: '',
            AdjustmentStatusId: 0,
            AdjustedDate: utl.Formatter.getCurrentDate(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };

        /*
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                 RemarkId: -1,
                 LocationId: -1,
                 AdmittingReasonId: -1,
                 StockPriorityId: -1,
                 StockAdjustmentTypeId: -1,
                 DiagnosisId: -1,
                 DoctorId: -1,
                 PatientId: -1
            };

            $scope.advancedFilterSchema = {
                 layout: 'grid',
                 title: 'common.advancedfilter-title.lbl',
                 controls: [
                     { type: 'date', translate: 'stockadjustments.filter_fromdate.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                     { type: 'date', translate: 'stockadjustments.filter_todate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                     { type: 'select', translate: 'stockadjustments.filter_patient.lbl', model: 'PatientId', options: $scope.lookup.Patient, position: { r: 1, c: 0 } },
                     { type: 'select', translate: 'stockadjustments.filter_doctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 1 } },
                     { type: 'select', translate: 'stockadjustments.filter_diagnosis.lbl', model: 'DiagnosisId', options: $scope.lookup.Diagnosis, position: { r: 2, c: 0 } },
                     { type: 'select', translate: 'stockadjustments.filter_requesttype.lbl', model: 'StockAdjustmentTypeId', options: $scope.lookup.StockAdjustmentType, position: { r: 2, c: 1 } },
                     { type: 'select', translate: 'stockadjustments.filter_priority.lbl', model: 'StockPriorityId', options: $scope.lookup.StockPriority, position: { r: 3, c: 0 } },
                     { type: 'select', translate: 'stockadjustments.filter_admittingreason.lbl', model: 'AdmittingReasonId', options: $scope.lookup.AdmittingReason, position: { r: 3, c: 1 } },
                     { type: 'select', translate: 'stockadjustments.filter_location.lbl', model: 'LocationId', options: $scope.lookup.Location, position: { r: 4, c: 0 } },
                     { type: 'select', translate: 'stockadjustments.filter_remark.lbl', model: 'RemarkId', options: $scope.lookup.Remark, position: { r: 4, c: 1 } }],
                 actions: [
                     { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                     { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                 ]
            };
        }
        */

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            // var fromDate = $filter('date')($scope.currentfilter.AdjustedDate, 'yyyy-MM-dd 00:00:00');
            // var toDate = $filter('date')($scope.currentfilter.AdjustedDate, 'yyyy-MM-dd 23:59:59');
            // var fromDate = null;
            // var toDate = null;
            // if ($scope.currentfilter.StockAdjustmentNumber) {
            //     $scope.currentfilter.AdjustedDate = '';
            //     // fromDate = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00'); //"2017-04-01 00:00:00"
            //     // toDate = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59'); //"2017-04-26 23:59:59"
            // } else {
                // fromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00'); //"2017-04-27 00:00:00"
                // toDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59'); //"2017-04-27 23:59:59"
            // }
            var fromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var toDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.StockAdjustmentNumber },
                    { Key: 3, Value: $scope.currentfilter.AdjustmentStatusId },
                    { Key: 4, Value: [fromDate, toDate] },
                    { Key: 7, Value: $scope.currentfilter.FacilityId },
                    { Key: 6, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 4, Value: [fromDate, toDate] }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            // if ($scope.currentfilter.AdjustedDate) {
            //     fromDate = $filter('date')($scope.currentfilter.AdjustedDate, 'yyyy-MM-dd 00:00:00'); //"2017-04-27 00:00:00"
            //     toDate = $filter('date')($scope.currentfilter.AdjustedDate, 'yyyy-MM-dd 23:59:59'); //"2017-04-27 23:59:59"

            //     inputData.Params.push({ Key: 4, Value: [fromDate, toDate] });
            // }
            var options = {
                action: 'pharmacy/StockAdjustment/GetStockAdjustments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.stockadjustment', { id: 0 });
        };

        $scope.filter = function () {
            $state.go('app.stockadjustment.adjustmentfilter', { adjustmentfilterid: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/StockAdjustment/DeleteStockAdjustment',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.stockadjustment', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.StockAdjustmentIdentifier);
            } else if (actionType == 'view') {
                $state.go('app.stockadjustment', { id: entity.Id });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                { field: "StockAdjustmentNumber", displayName: $translate.instant('inventory.stockadjustments.ref#.lbl') },

                {
                    field: "AdjustedDate",
                    displayName: $translate.instant('inventory.stockadjustments.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdjustedDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.AdjustedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.stockadjustments.type.lbl') },
                {
                    field: "AdjustedUser",
                    displayName: $translate.instant('inventory.stockadjustments.createdby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdjustedUser.Title.Description}}&nbsp;{{entity.AdjustedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.AdjustedUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "AdjustedUser",
                    displayName: $translate.instant('inventory.stockadjustments.approvedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdjustedUser.Title.Description}}&nbsp;{{entity.AdjustedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.AdjustedUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "TotalNetAmount", displayName: $translate.instant('inventory.stockadjustments.adjustedvalue.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                // { field: "AdjustmentStatus.Description", displayName: $translate.instant('inventory.stockadjustments.adjustmentstatus.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.AdjustmentStatusId==2||entity.AdjustmentStatusId==3||entity.AdjustmentStatusId==4||entity.AdjustmentStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.AdjustmentStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.AdjustmentStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        function setDefaults() {
            //Setting default status filters starts
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.AdjustmentStatus, 'Approved');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.AdjustmentStatus, 'Authorized');
            $scope.currentfilter.AdjustmentStatusId = ApprovedId + "," + AuthorizedId;
            //Setting default status filters ends
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                    /*
                    if (key == 'UserStores' && $scope.advancedfilter.StoreId === 0) {
                        $scope.advancedfilter.StoreId = value[0].Id;
                        if (key == 'ApprovedUser' && $scope.advancedfilter.ApprovedBy === 0) {
                            $scope.advancedfilter.ApprovedBy = value[0].Id;
                        }
                    }
                    */
                }
            });
            setDefaults();
            //initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "AdjustmentStatus", Default: false },
                { "Key": "AdjustmentType" },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    StockAdjustmentListController.$inject = ['$rootScope','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();