(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockConsumptionListController', StockConsumptionListController);

    function StockConsumptionListController($rootScope,$scope, $filter, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            ConsumptionNumber: '',
            ConsumptionTypeId: 1,
            ConsumptionStatusId: 2,
            ConsumptionDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),

            StoreMasterId: 0,
        };

        $scope.lookup = {};
        $scope.currentcontext = { id: -1 };

        /*
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                RemarkId: -1,
                LocationId: -1,
                AdmittingReasonId: -1,
                StockPriorityId: -1,
                StockConsumptionTypeId: -1,
                DiagnosisId: -1,
                DoctorId: -1,
                PatientId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'StockConsumptions.filter_fromdate.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'StockConsumptions.filter_todate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'StockConsumptions.filter_patient.lbl', model: 'PatientId', options: $scope.lookup.Patient, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'StockConsumptions.filter_doctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'StockConsumptions.filter_diagnosis.lbl', model: 'DiagnosisId', options: $scope.lookup.Diagnosis, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'StockConsumptions.filter_requesttype.lbl', model: 'StockConsumptionTypeId', options: $scope.lookup.StockConsumptionType, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'StockConsumptions.filter_priority.lbl', model: 'StockPriorityId', options: $scope.lookup.StockPriority, position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'StockConsumptions.filter_admittingreason.lbl', model: 'AdmittingReasonId', options: $scope.lookup.AdmittingReason, position: { r: 3, c: 1 } },
                    { type: 'select', translate: 'StockConsumptions.filter_location.lbl', model: 'LocationId', options: $scope.lookup.Location, position: { r: 4, c: 0 } },
                    { type: 'select', translate: 'StockConsumptions.filter_remark.lbl', model: 'RemarkId', options: $scope.lookup.Remark, position: { r: 4, c: 1 } }
                ],
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
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                // fromDate = $filter('date')($scope.currentfilter.ConsumptionDate, 'yyyy-MM-dd 00:00:00'); //"2017-04-27 00:00:00"
                // toDate = $filter('date')($scope.currentfilter.ConsumptionDate, 'yyyy-MM-dd 23:59:59'); //"2017-04-27 23:59:59"
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.StockConsumptionNumber },
                    { Key: 2, Value: 1 },
                    { Key: 3, Value: $scope.currentfilter.ConsumptionStatusId },
                    { Key: 5, Value: $scope.currentfilter.FacilityId },
                    { Key: 6, Value: $scope.currentfilter.StoreMasterId },
                    {
                        Key: 7,
                        Value: utl.Formatter.getFilterDate(From)
                    },
                    {
                        Key: 8,
                        Value: utl.Formatter.getFilterDate(To)
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            // if ($scope.currentfilter.ConsumptionDate) {
            //     fromDate = $filter('date')($scope.currentfilter.ConsumptionDate, 'yyyy-MM-dd 00:00:00'); //"2017-04-27 00:00:00"
            //     toDate = $filter('date')($scope.currentfilter.ConsumptionDate, 'yyyy-MM-dd 23:59:59'); //"2017-04-27 23:59:59"

            //     inputData.Params.push({ Key: 4, Value: [fromDate, toDate] });
            // }
            var options = {
                action: 'pharmacy/StockConsumption/GetStockConsumptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.stockconsumption', { id: 0 });
        };

        $scope.filter = function () {
            $state.go('app.stockconsumption.consumptionfilter', { consumptionfilterid: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/StockConsumption/DeleteStockConsumption',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.showPatientInfo = function (item) { };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.stockconsumption', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.StockConsumptionIdentifier);
            } else if (actionType == 'view') {
                $state.go('app.stockconsumption', { id: entity.Id });
            }
        };

        $scope.getPatientInfo = function (row) {
            console.log(row);
        };

        vm.gridConfig = {
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "StockConsumptionNumber",
                    displayName: $translate.instant('inventory.stockconsumption.ref#.lbl')
                },
                {
                    field: "ConsumptionDate",
                    displayName: $translate.instant('inventory.stockconsumption.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ConsumptionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.ConsumptionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                // { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.stockconsumption.store.lbl') },
                { field: "ConsumptionType.Description", displayName: $translate.instant('inventory.stockconsumption.consumptiontype.lbl') },
                {
                    field: "ConsumedUser",
                    displayName: $translate.instant('inventory.stockconsumption.createdby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ConsumedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.ConsumedUser.LastName}}</span>" + "</div>"
                },
                // {
                //     field: "ConsumedUser",
                //     displayName: $translate.instant('inventory.stockconsumption.approvedby.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ConsumedUser.FirstName}}&nbsp;</span>" + "<span class='pl-3'>{{entity.ConsumedUser.LastName}}</span>" + "</div>"
                // },
                {
                    field: "TotalNetAmount", displayName: $translate.instant('inventory.stockconsumption.amount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "ConsumedUser",
                    displayName: $translate.instant('inventory.stockconsumption.consumedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ConsumedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.ConsumedUser.LastName}}</span>" + "</div>"
                },

                { field: "ConsumptionStatus.Description", displayName: $translate.instant('inventory.stockconsumption.consumptionstatus.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ConsumptionStatusId==2||entity.ConsumptionStatusId==3||entity.ConsumptionStatusId==4||entity.ConsumptionStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ConsumptionStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ConsumptionStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        function setDefaults() {
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.ConsumptionStatus, 'Approved');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.ConsumptionStatus, 'Authorized');
            var CompletedId = utl.Lookup.getDefault($scope.lookup.ConsumptionStatus, 'Completed');
            $scope.currentfilter.ConsumptionStatusId = ApprovedId + "," + AuthorizedId + "," + CompletedId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                setDefaults();
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });

            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ConsumptionType" },
                { "Key": "ConsumptionStatus", Default: false },
                { "key": "Facility" },
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

    StockConsumptionListController.$inject = ['$rootScope','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();