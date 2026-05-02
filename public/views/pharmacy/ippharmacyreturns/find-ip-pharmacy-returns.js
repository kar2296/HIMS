(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findippharmacyreturnsListController', findippharmacyreturnsListController);

    function findippharmacyreturnsListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.currentcontext.id = modalConfig.params.id;

        function initDynamicForm() {
            $scope.defaultdata = {
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                MRN: null,
                DoctorId: -1,
                MobileNo: null,
                ReturnPriorityId: -1,
                ReturnStatusId: -1,
                ReturnTypeId: -1,
                PatientId: -1,
                PatientReturnStatusId: 3,
                ReturnNumber: null,
                FacilityId: -1,
                GuarantorTypeId: -1,
                StoreMasterId: 0,
                GuarantorId: -1
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [{
                        type: 'text',
                        translate: 'billing.findreturn-list.patientname.lbl',
                        model: 'PatientName',
                        position: {
                            r: 2,
                            c: 2
                        },
                        placeholder: 'Name / UHID'
                    },
                    {
                        type: 'date',
                        translate: 'billing.findreturn-list.date.lbl',
                        model: 'FromDate',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'billing.findreturn-list.todate.lbl',
                        model: 'ToDate',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    // { type: 'text', translate: 'billing.findreturn-list.mrn.lbl', model: 'MRN', position: { r: 0, c: 2 } },
                    // { type: 'select', translate: 'billing.findreturn-list.consdoctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 0 } },
                    // { type: 'text', translate: 'billing.findreturn-list.mobileno.lbl', model: 'MobileNo', position: { r: 1, c: 1 } },
                    // { type: 'select', translate: 'billing.findreturn-list.returnpriority.lbl', model: 'ReturnPriorityId', options: $scope.lookup.ReturnPriority, position: { r: 1, c: 2 } },
                    {
                        type: 'select',
                        translate: 'billing.findreturn-list.returnstatus.lbl',
                        model: 'PatientReturnStatusId',
                        options: $scope.lookup.PatientReturnStatus,
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    // { type: 'select', translate: 'billing.findreturn-list.guarantortype.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 2, c: 1 } },
                    {
                        type: 'text',
                        translate: 'billing.findreturn-list.returnnumber.lbl',
                        model: 'ReturnNumber',
                        position: {
                            r: 3,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'billing.findbill-list.storemaster1.lbl',
                        model: 'StoreMasterId',
                        options: $scope.lookup.UserStores,
                        position: {
                            r: 3,
                            c: 0
                        }
                    },
                    // { type: 'select', translate: 'billing.findreturn-list.facility.lbl', model: 'FacilityId', options: $scope.lookup.Facility, position: { r: 3, c: 1 } },
                    // { type: 'select', translate: 'billing.findreturn-list.guarantor.lbl', model: 'GuarantorTypeId', options: $scope.lookup.GuarantorType, position: { r: 3, c: 2 } }
                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'fetch'
                    },
                    // { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }

            $scope.getList();
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.ReturnDateTime).getTime() - new Date(a.ReturnDateTime).getTime();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $('#ReturnNumber').focus();
        };
        /* Ip Pharmacy Returns Find Bills - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 13) { // Enter Key
                $scope.actionClick('apply');
            }
        }
        angular.element(document).on('keydown', keyupHandler);
        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Ip Pharmacy Returns Find Bills - Shortcut Keys - End */
        $scope.getList = function (pageNo) {
            if ($scope.modeldata.ReturnNumber || $scope.modeldata.MRN ||
                $scope.modeldata.MobileNo || $scope.modeldata.PatientName) {
                $scope.modeldata.FromDate = null;
                $scope.modeldata.ToDate = null;
            }
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    // { Key: 1, Value: [FrmDate, ToDate] },
                    {
                        Key: 2,
                        Value: $scope.modeldata.ReturnNumber
                    },
                    {
                        Key: 4,
                        Value: $scope.modeldata.PatientReturnStatusId
                    },
                    {
                        Key: 5,
                        Value: $scope.modeldata.ReturnPriorityId
                    },
                    {
                        Key: 6,
                        Value: [6]
                    },
                    {
                        Key: 7,
                        Value: $scope.modeldata.DoctorId
                    },
                    {
                        Key: 8,
                        Value: $scope.modeldata.FacilityId
                    },
                    {
                        Key: 9,
                        Value: $scope.modeldata.GuarantorTypeId
                    },
                    {
                        Key: 10,
                        Value: $scope.modeldata.GuarantorId
                    },
                    {
                        Key: 12,
                        Value: $scope.modeldata.PatientId
                    },
                    // { Key: 13, Value: $scope.modeldata.MRN },
                    {
                        Key: 14,
                        Value: $scope.modeldata.MobileNo
                    },
                    {
                        Key: 13,
                        Value: $scope.modeldata.PatientName
                    },
                    {
                        Key: 12,
                        Value: $scope.currentcontext.id
                    },
                    {
                        Key: 20,
                        Value: $scope.modeldata.StoreMasterId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.modeldata.FromDate || $scope.modeldata.ToDate) {
                var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
                var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
                if (FrmDate && ToDate)
                    inputData.Params.push({
                        Key: 1,
                        Value: [FrmDate, ToDate]
                    });
            }
            var options = {
                action: 'billing/patientreturns/GetPatientReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'select') {
                $scope.confirmCallback({
                    ReturnId: entity.Id,
                    PatientId: entity.PatientId
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.Patient.Id);
            }
        };

        vm.gridConfig = {
            columnDefs: [{
                    field: "Id",
                    displayName: $translate.instant('Select'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                <span class="grid-action" ng-click="handleEvents(\'select\',entity)"><i class="fa fa-check" aria-hidden="true"></i></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('billing.findreturn-list.mrn.lbl')
                },
                {
                    field: "ReturnNumber",
                    displayName: $translate.instant('billing.findreturn-list.returnnumber.lbl')
                },
                {
                    field: "EncountertypeId",
                    displayName: $translate.instant('billing.findreturn-list.ipnumber.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{"IP"}}</div>'
                },
                {
                    field: "PatientName",
                    displayName: $translate.instant('billing.findreturn-list.patientname.lbl'),
                    //cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} {{entity.Patient.LastName}}</div>'
                    cellTemplate: '<div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId == 4"> {{entity.PatientName}} </div><div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId != 4"> {{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} {{entity.Patient.LastName}}</div>'
                },
                {
                    field: "Date",
                    displayName: $translate.instant('billing.findreturn-list.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.ReturnDateTime'></ngformatdate>"
                },
                // {
                //     field: "ConsDoctor",
                //     displayName: $translate.instant('billing.findreturn-list.consdoctor.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.User.Title.Description}} {{entity.User.FirstName}} {{entity.User.LastName}}</div>'
                //     cellTemplate: '<div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId == 4"> {{entity.DoctorName}} </div><div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId != 4"> {{entity.User.Title.Description}} {{entity.User.FirstName}} {{entity.User.LastName}}</div>'
                // },
                // { field: "PatientReturnStatus.Description", displayName: $translate.instant('billing.findreturn-list.status.lbl') },
                {
                    field: "RefundedAmount",
                    displayName: $translate.instant('Returned Amount'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.RefundedAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "ReturnAmount",
                    displayName: $translate.instant('Return Amount'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ReturnAmount | displaycurrency}}</span>" + "</div>"
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            enableFullRowSelection: true
        };

        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.confirmCallback({
                    ReturnId: entity.Id,
                    PatientId: entity.PatientId
                });
            });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.modeldata.StoreMasterId === 0) {
                    for (var usidx in $scope.lookup.UserStores) {
                        if ($scope.lookup.UserStores[usidx].IsDefault) {
                            $scope.modeldata.StoreMasterId = $scope.lookup.UserStores[usidx].Id;
                            $scope.modeldata.StoreTypeId = $scope.lookup.UserStores[usidx].StoreMaster.StoreTypeId;
                            $scope.modeldata.CanAllowIPDiscount = $scope.lookup.UserStores[usidx].StoreMaster.CanAllowIPDiscount;
                            $scope.modeldata.ExpiryWarningDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryWarningDays;
                            $scope.modeldata.ExpiryPriorStopDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryPriorStopDays;
                        }
                    }
                    if ($scope.modeldata.StoreMasterId === 0) {
                        $scope.modeldata.StoreMasterId = value[0].Id;
                        $scope.modeldata.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                        $scope.modeldata.CanAllowIPDiscount = value[0].StoreMaster.CanAllowIPDiscount;
                        $scope.modeldata.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                        $scope.modeldata.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                    }
                }
            });
            $scope.getList();
        };


        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "ReturnPriority"
                },
                {
                    "Key": "PharmacyReturnType"
                },
                // { "Key": "Patient" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "PatientReturnStatus"
                },
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
                {
                    "Key": "Facility"
                },
                // { "Key": "GuarantorType" },
                // { "Key": "Guarantor" }
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

    findippharmacyreturnsListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();