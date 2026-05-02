(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findpharmacyreturnsListController', findpharmacyreturnsListController);

    function findpharmacyreturnsListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            TotalReturnAmount: 0,
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
                PharmacyReturnTypeId: 1,
                PatientId: -1,
                PatientReturnStatusId: 3,
                ReturnNumber: null,
                FacilityId: -1,
                GuarantorTypeId: -1,
                GuarantorId: -1
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    {
                        type: 'text',
                        translate: 'billing.findreturn-list.patientname.lbl',
                        model: 'PatientName',
                        position: {
                            r: 0,
                            c: 0
                        },placeholder: 'Name / UHID' 
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
                    // {
                    //     type: 'text',
                    //     translate: 'billing.findreturn-list.mrn.lbl',
                    //     model: 'MRN',
                    //     position: {
                    //         r: 0,
                    //         c: 2
                    //     }
                    // },
                    // {
                    //     type: 'select',
                    //     translate: 'billing.findreturn-list.consdoctor.lbl',
                    //     model: 'DoctorId',
                    //     options: $scope.lookup.Doctor,
                    //     position: {
                    //         r: 1,
                    //         c: 0
                    //     }
                    // },
                    // {
                    //     type: 'text',
                    //     translate: 'billing.findreturn-list.mobileno.lbl',
                    //     model: 'MobileNo',
                    //     position: {
                    //         r: 1,
                    //         c: 1
                    //     }
                    // },
                    // {
                    //     type: 'select',
                    //     translate: 'billing.findreturn-list.returnpriority.lbl',
                    //     model: 'ReturnPriorityId',
                    //     options: $scope.lookup.ReturnPriority,
                    //     position: {
                    //         r: 1,
                    //         c: 2
                    //     }
                    // },
                    {
                        type: 'text',
                        translate: 'billing.findreturn-list.returnnumber.lbl',
                        model: 'ReturnNumber',
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    // {
                    //     type: 'select',
                    //     translate: 'billing.findreturn-list.facility.lbl',
                    //     model: 'FacilityId',
                    //     options: $scope.lookup.Facility,
                    //     position: {
                    //         r: 2,
                    //         c: 1
                    //     }
                    // },
                    // {
                    //     type: 'select',
                    //     translate: 'billing.findreturn-list.guarantor.lbl',
                    //     model: 'GuarantorTypeId',
                    //     options: $scope.lookup.GuarantorType,
                    //     position: {
                    //         r: 2,
                    //         c: 2
                    //     }
                    // },
                    // {
                    //     type: 'select',
                    //     translate: 'billing.findreturn-list.returnstatus.lbl',
                    //     model: 'PatientReturnStatusId',
                    //     options: $scope.lookup.PatientReturnStatus,
                    //     position: {
                    //         r: 3,
                    //         c: 0
                    //     }
                    // },
                    // {
                    //     type: 'select',
                    //     translate: 'billing.findreturn-list.guarantortype.lbl',
                    //     model: 'GuarantorId',
                    //     options: $scope.lookup.Guarantor,
                    //     position: {
                    //         r: 3,
                    //         c: 1
                    //     }
                    // },

                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'fetch'
                    },
                    // {
                    //     type: 'reset',
                    //     translate: 'common.resetaction.lbl',
                    //     cls: 'btn-danger'
                    // }
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
            $scope.currentcontext.TotalReturnAmount = 0;
            for (var idx in $scope.gridData) {
                var billitem = $scope.gridData[idx];
                $scope.currentcontext.TotalReturnAmount = $scope.currentcontext.TotalReturnAmount + billitem.ReturnAmount;
            }
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $('#ReturnNumber').focus();
        };

        /* Pharmacy Sales Find Bills - Shortcut Keys - Start */
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
        /* Pharmacy Sales Find Bills - Shortcut Keys - End */

        $scope.getList = function (pageNo) {
            var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
            if ($scope.modeldata.PatientName) {
                $scope.modeldata.FromDate = '';
                $scope.modeldata.ToDate = '';
            }
            // if ($scope.modeldata.ReturnNumber || $scope.modeldata.MRN ||
            //     $scope.modeldata.MobileNo|| $scope.modeldata.PatientName) {
            //     $scope.modeldata.FromDate = null;
            //     $scope.modeldata.ToDate = null;
            // }
            // var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
            // var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    // {
                    //     Key: 1,
                    //     Value: [FrmDate, ToDate]
                    // },
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
                        Value: [1, 2, 3, 4]
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
                        Key: 12,
                        Value: $scope.currentcontext.id
                    },
                    {
                        Key: 19,
                        Value: $scope.modeldata.PharmacyReturnTypeId
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
                //    $state.go('app.ipbillingtab.summary');
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
                    field: "PatientMRN",
                    displayName: $translate.instant('billing.findreturn-list.mrn.lbl')
                },
                {
                    field: "ReturnNumber",
                    displayName: $translate.instant('billing.findreturn-list.returnnumber.lbl')
                },
                // {
                //     field: "EncountertypeId",
                //     displayName: $translate.instant('billing.findreturn-list.ipnumber.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">{{"OP"}}</div>'
                // },
                {
                    field: "PatientName",
                    displayName: $translate.instant('billing.findreturn-list.patientname.lbl')
                },
                // {
                //     field: "PatientName",
                //     displayName: $translate.instant('billing.findreturn-list.patientname.lbl'),
                //     //cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} {{entity.Patient.LastName}}</div>'
                //     cellTemplate: '<div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId == 4"> {{entity.PatientName}} </div><div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId != 4"> {{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} {{entity.Patient.LastName}}</div>'
                // },
                {
                    field: "Date",
                    displayName: $translate.instant('billing.findreturn-list.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.ReturnDateTime'></ngformatdate>"
                },
                // {
                //     field: "ConsDoctor",
                //     displayName: $translate.instant('billing.findreturn-list.consdoctor.lbl'),
                //     //cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.User.Title.Description}} {{entity.User.FirstName}} {{entity.User.LastName}}</div>'
                //     cellTemplate: '<div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId == 4"> {{entity.DoctorName}} </div><div class="ui-grid-cell-contents" ng-if="entity.PharmacySaleTypeId != 4"> {{entity.User.Title.Description}} {{entity.User.FirstName}} {{entity.User.LastName}}</div>'
                // },
                {
                    field: "PatientReturnStatus.Description",
                    displayName: $translate.instant('billing.findreturn-list.status.lbl')
                },
                {
                    field: "RefundedAmount",
                    displayName: $translate.instant('billing.findreturn-list.refundedamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.RefundedAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "ReturnAmount",
                    displayName: $translate.instant('billing.findreturn-list.refundamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ReturnAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "CreatedName",
                    displayName: $translate.instant('billing.findbill-list.createdname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.CreatedUser.Title.Description}} {{entity.CreatedUser.FirstName}} {{entity.CreatedUser.LastName}}</div>'
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
                    "Key": "Facility"
                },
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

    findpharmacyreturnsListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();