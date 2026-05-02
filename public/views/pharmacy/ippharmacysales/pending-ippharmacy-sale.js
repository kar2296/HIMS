(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingippharmacySaleController', pendingippharmacySaleController);

    function pendingippharmacySaleController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
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
                BillPriorityId: -1,
                BillStatusId: -1,
                BillTypeId: -1,
                PatientId: -1,
                PatientBillStatusId: 1,
                BillNumber: null,
                FacilityId: -1,
                GuarantorTypeId: -1,
                GuarantorId: -1,
                IsOutStanding: false
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [{
                    type: 'text',
                    translate: 'billing.findbill-list.patientname.lbl',
                    model: 'PatientName',
                    position: {
                        r: 2,
                        c: 0
                    }
                },
                {
                    type: 'date',
                    translate: 'billing.findbill-list.date.lbl',
                    model: 'FromDate',
                    position: {
                        r: 0,
                        c: 0
                    }
                },
                {
                    type: 'date',
                    translate: 'billing.findbill-list.todate.lbl',
                    model: 'ToDate',
                    position: {
                        r: 0,
                        c: 1
                    }
                },

                // { type: 'select', translate: 'billing.findbill-list.guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 0, c: 2 } },
                {
                    type: 'text',
                    translate: 'billing.findbill-list.billnumber.lbl',
                    model: 'BillNumber',
                    position: {
                        r: 0,
                        c: 2
                    }
                },

                // { type: 'text', translate: 'billing.findbill-list.patientname.lbl', model: 'PatientName', position: { r: 1, c: 0 } },
                // { type: 'text', translate: 'billing.findbill-list.mobileno.lbl', model: 'MobileNo', position: { r: 1, c: 1 } },
                // { type: 'text', translate: 'billing.findbill-list.mrn.lbl', model: 'MRN', position: { r: 1, c: 2 } },

                // { type: 'select', translate: 'billing.findbill-list.consdoctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 0 } },
                // { type: 'select', translate: 'billing.findbill-list.billpriority.lbl', model: 'BillPriorityId', options: $scope.lookup.BillPriority, position: { r: 1, c: 1 } },
                // { type: 'select', translate: 'billing.findbill-list.guarantortype.lbl', model: 'GuarantorTypeId', options: $scope.lookup.GuarantorType, position: { r: 1, c: 2 } },

                // { type: 'text', translate: 'billing.findbill-list.mobileno.lbl', model: 'MobileNo', position: { r: 2, c: 1 } },
                // { type: 'text', translate: 'billing.findbill-list.mrn.lbl', model: 'MRN', position: { r: 2, c: 2 } },

                // { type: 'select', translate: 'billing.findbill-list.billstatus.lbl', model: 'PatientBillStatusId', options: $scope.lookup.PatientBillStatus, position: { r: 3, c: 0 } },
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
                {
                    position: {
                        r: 3,
                        c: 1
                    }
                },
                    // { type: 'select', translate: 'billing.findbill-list.facility.lbl', model: 'FacilityId', options: $scope.lookup.Facility, position: { r: 3, c: 2 } },
                    // { type: 'text', translate: 'billing.findbill-list.billnumber.lbl', model: 'BillNumber', position: { r: 4, c: 0 } },

                    //{ type: 'select', translate: 'billing.findbill-list.guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 4, c: 0 } },
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
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $('#BillNumber').focus();
        };
        /* Ip Pharmacy Sales Find Bills - Shortcut Keys - Start */
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
        /* Ip Pharmacy Sales Find Bills - Shortcut Keys - End */
        $scope.getList = function (pageNo) {
            var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
            var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: [FrmDate, ToDate]
                },
                {
                    Key: 2,
                    Value: $scope.modeldata.BillNumber
                },
                {
                    Key: 4,
                    Value: $scope.modeldata.PatientBillStatusId
                },
                {
                    Key: 5,
                    Value: $scope.modeldata.BillPriorityId
                },
                {
                    Key: 6,
                    Value: 3
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
                    Key: 11,
                    Value: OutStandingcond
                },
                {
                    Key: 12,
                    Value: $scope.modeldata.PatientId
                },
                {
                    Key: 13,
                    Value: $scope.modeldata.MRN
                },
                {
                    Key: 14,
                    Value: $scope.modeldata.MobileNo
                },
                {
                    Key: 15,
                    Value: $scope.modeldata.PatientName
                },
                {
                    Key: 16,
                    Value: $scope.currentcontext.id
                }, // encounterid
                {
                    Key: 21,
                    Value: true
                },
                {
                    Key: 22,
                    Value: 6
                },
                {
                    Key: 29,
                    Value: $scope.modeldata.StoreMasterId
                },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'billing/PatientBills/GetFindPatientPharmacyBills',
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
                var returnobj = {};
                returnobj.BillId = entity.Id;
                returnobj.IsCashToCreditBill = entity.IsCashToCreditBill;
                returnobj.EncounterId = entity.EncounterId;
                returnobj.BillStatusId = entity.PatientBillStatusId;
                // returnobj.PatientName = entity.PatientName;
                returnobj.WardId = entity.WardId;
                returnobj.RoomId = entity.RoomId;
                returnobj.StoreId = entity.StoreMasterId;
                $scope.confirmCallback(returnobj);
            }
        };

        vm.gridConfig = {
            columnDefs: [{
                field: "Id",
                displayName: $translate.instant('Select'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                <span class="grid-action" ng-click="handleEvents(\'select\',entity)"><i class=" fa fa-check" aria-hidden="true"></i></span>\
                                </div>',
                handleEvent: $scope.handleEvents,
            },
            {
                field: "Patient.MRN",
                displayName: $translate.instant('billing.findbill-list.mrn1.lbl')
            },
            {
                field: "BillNumber",
                displayName: $translate.instant('billing.findbill-list.billnumber.lbl')
            },
            {
                field: "Encounter.VisitIdentifier",
                displayName: $translate.instant('billing.findbill-list.ipnumber1.lbl')
            },
            {
                field: "PatientName",
                displayName: $translate.instant('billing.findbill-list.patientname.lbl'),
                //cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} {{entity.Patient.LastName}}</div>'
                cellTemplate: '<div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId == 4"> <strong>{{entity.PatientName}} </strong></div><div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId != 4"><strong> {{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} {{entity.Patient.LastName}}</strong</div>'
            },
            {
                field: "Date",
                displayName: $translate.instant('billing.findbill-list.date.lbl'),
                cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime'></ngformatdate>"
            },
            // {
            //     field: "Encounter.AdmissionStatus.Description",
            //     displayName: $translate.instant('Admission Status'),
            //     // cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime'></ngformatdate>"
            // },
            // {
            //     field: "ConsDoctor",
            //     displayName: $translate.instant('billing.findbill-list.consdoctor.lbl'),
            //     cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.User.Title.Description}} {{entity.User.FirstName}} {{entity.User.LastName}}</div>'
            //     cellTemplate: '<div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId == 4"> {{entity.DoctorName}} </div><div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId != 4"> {{entity.User.Title.Description}} {{entity.User.FirstName}} {{entity.User.LastName}}</div>'
            // },
            {
                field: "PatientBillStatus.Description",
                displayName: $translate.instant('billing.findbill-list.status.lbl')
            },
            {
                field: "WardMaster.WardName",
                displayName: $translate.instant('admissions.ward.lbl')
            },
            // {
            //     field: "WardRoomMaster",
            //     displayName: $translate.instant('admissions.roomdetails.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'>" +
            //         "<span class='pl-3' ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo }}</span>" +
            //         "<span class='pl-3' ng-if='entity.WardRoomMaster'>/</span>" +
            //         "<span class='pl-3' ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
            //         "</div>"
            // },

            // {
            //     field: "WardRoomMaster",
            //     displayName: $translate.instant('admissions.roomdetails.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'>" +
            //         "<span class='pl-3' ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo }}</span>" +
            //         "<span class='pl-3' ng-if='entity.WardRoomMaster'>/</span>" +
            //         "<span class='pl-3' ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
            //         "</div>"
            // },
            {
                field: "BillAmount",
                displayName: $translate.instant('billing.findbill-list.billamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"
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

        // vm.gridConfig.enableRowSelection = true;
        // vm.gridConfig.multiSelect = false;
        // vm.gridConfig.onRegisterApi = function (gridApi) {
        //     $scope.gridApi = gridApi;
        //     gridApi.selection.on.rowSelectionChanged($scope, function (row) {
        //         var returnobj = {};
        //         returnobj.BillId = entity.Id;
        //         returnobj.IsCashToCreditBill = entity.IsCashToCreditBill;
        //         returnobj.EncounterId = entity.EncounterId;
        //         // returnobj.PatientName = entity.PatientName;
        //         returnobj.WardId = entity.WardId;
        //         returnobj.RoomId = entity.RoomId;

        //         $scope.confirmCallback(returnobj);
        //     });
        // };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "BillPriority"
            },
            {
                "Key": "BillType"
            },
            //{ "Key": "UserStores" },
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
                "Key": "PatientBillStatus"
            },
            //{ "Key": "Facility" },
            {
                "Key": "GuarantorType"
            },
            {
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 7,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
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

    pendingippharmacySaleController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();