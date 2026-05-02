(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OTConsumptionListController', OTConsumptionListController);

    function OTConsumptionListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            ConsumptionNumber: '',
            ConsumptionTypeId: 2,
            ConsumptionStatusId: 2,
            ConsumptionDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
        };

        $scope.lookup = {};
        $scope.currentcontext = { id: -1 };
        $scope.currentcontext.CanAddNew = utl.Privilege.hasPrivilege('CanAddNew')

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
            var fromDate = null;
            var toDate = null;
            if ($scope.currentfilter.ConsumptionTypeId) {
                $scope.currentfilter.ConsumptionDate = '';
            } else {
                fromDate = $filter('date')($scope.currentfilter.ConsumptionDate, 'yyyy-MM-dd 00:00:00'); //"2017-04-27 00:00:00"
                toDate = $filter('date')($scope.currentfilter.ConsumptionDate, 'yyyy-MM-dd 23:59:59'); //"2017-04-27 23:59:59"
            }
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.StockConsumptionNumber },
                    { Key: 2, Value: 2 },
                    { Key: 3, Value: $scope.currentfilter.ConsumptionStatusId },
                    { Key: 5, Value: $scope.currentfilter.FacilityId },
                    { Key: 6, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 9, Value: $scope.currentfilter.EncounterId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.ConsumptionDate) {
                fromDate = $filter('date')($scope.currentfilter.ConsumptionDate, 'yyyy-MM-dd 00:00:00'); //"2017-04-27 00:00:00"
                toDate = $filter('date')($scope.currentfilter.ConsumptionDate, 'yyyy-MM-dd 23:59:59'); //"2017-04-27 23:59:59"

                inputData.Params.push({ Key: 4, Value: [fromDate, toDate] });
            }
            var options = {
                action: 'pharmacy/StockConsumption/GetStockConsumptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.otconsumption', { id: 0 });
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

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.otconsumption', { id: row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.StockConsumptionIdentifier);
            } else if (actionType == 'view') {
                $state.go('app.otconsumption', { id: row.entity.Id });
            }
        };

        $scope.getPatientInfo = function (row) {
            console.log(row);
        };

        vm.gridConfig = {
            columnDefs: [{
                field: "StockConsumptionNumber",
                displayName: $translate.instant('inventory.stockconsumption.consumptionnumber.lbl')
            },
            {
                field: "ConsumptionDate",
                displayName: $translate.instant('inventory.stockconsumption.consumptiondate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.ConsumptionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.ConsumptionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "Patient",
                displayName: $translate.instant('admissions.patientname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                    '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                    +
                    "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                    "{{row.entity.Patient.Title.Description}}</span>" +
                    "<span >{{row.entity.Patient.FirstName}}</span>" +
                    "<span >{{row.entity.Patient.LastName}}</span>" +
                    "<span >/</span>" +
                    "<span >{{row.entity.Patient.MRN}}</span>" +
                    "<span >/<span>" +
                    "<span >{{row.entity.Patient.Age}}</span>" +
                    "<span >/</span>" +
                    "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
            },
            { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.stockconsumption.store.lbl') },
            { field: "ConsumptionType.Description", displayName: $translate.instant('inventory.stockconsumption.consumptiontype.lbl') },
            {
                field: "TotalNetAmount", displayName: $translate.instant('inventory.stockconsumption.netamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "ConsumedUser",
                displayName: $translate.instant('inventory.stockconsumption.consumedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.ConsumedUser.FirstName}}&nbsp;</span>" + "<span >{{row.entity.ConsumedUser.LastName}}</span>" + "</div>"
            },

            { field: "ConsumptionStatus.Description", displayName: $translate.instant('inventory.stockconsumption.consumptionstatus.lbl') },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.ConsumptionStatusId==2||row.entity.ConsumptionStatusId==3||row.entity.ConsumptionStatusId==4||row.entity.ConsumptionStatusId==5"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.ConsumptionStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.ConsumptionStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
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

    OTConsumptionListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();