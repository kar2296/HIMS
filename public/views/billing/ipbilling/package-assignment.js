(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('packageAssignmentController', packageAssignmentController);

    function packageAssignmentController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.IsDisabled = false;
        $scope.canShowAssignBtn = false;
        $scope.currentcontext = {
            encounterippackageid: -1
        };
        $scope.searchbyguarantor = 0;
        $scope.searchbyguarantor = utl.FacilitySetting.getFacilitySettingValue('billing', 'allowsearchbyguarantor');
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.patientid = parseInt($stateParams.patientid);
        $scope.currentcontext.gtid = parseInt($stateParams.gtid);
        $scope.currentcontext.gid = parseInt($stateParams.gid);
        $scope.item = {
            EncounterId: 0,
            PatientId: 0,
            IPPackageId: 0,
            IPPackageCode: null,
            IPPackageShortCode: null,
            IPPackageName: null,
            IPPackageDescription: null,
            PackageAssignedDate: utl.Formatter.getCurrentDate(),
            IPPackageDays: 0,
            OrganizationId: 0,
            FacilityId: 0,
            CategoryId: 0,
            SubCategoryId: 0,
            DepartmentId: 0,
            SubDepartmentId: 0,
            GuarantorTypeId: -1,
            GuarantorId: 0,
            ServiceRateCategoryId: 0,
            IsRateEditable: 0,
            ActualAmount: 0,
            PackageAmount: 0,
            DiscountTypeId: 0,
            DiscountModeId: 0,
            DiscountValue: 0,
            DiscountAmount: 0,
            CreditAccount: 0,
            DebitAccount: 0,
            ActiveFrom: null,
            ActiveTo: null,
            ActiveStatusId: 2,
            IPPackageDetails: null
        };
        $scope.item.GuarantorTypeId = $scope.currentcontext.gtid;
        $scope.item.GuarantorId = $scope.currentcontext.gid;
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }

        $scope.patientChange = function () {
            if ($scope.currentcontext.patientid > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.currentcontext.patientid
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };

                utl.Http.doAction(options);
            }
        }

        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
            console.log($scope.Encounter);
            $scope.item.DOA = $scope.Encounter.AdmissionDate;
            $scope.item.ServiceRateCategoryId = $scope.Encounter.ServiceRateCategoryId;
            $scope.item.GuarantorId = $scope.Encounter.GuarantorId;
            $scope.item.GuarantorTypeId = $scope.Encounter.GuarantorTypeId;
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getEncounters = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.id
                }]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };
        $scope.GetPatientBillSummaryCallback = function (scope, res, options, hasError) {
            if (res.FinalBillInfo && res.FinalBillInfo.Id > 0) {
                $scope.FinalBillInfo = res.FinalBillInfo;
            }
        }

        $scope.GetPatientBillSummary = function () {
            var options = {
                action: 'billing/PatientBillSummary/GetPatientBillSummaryDetails',
                data: {
                    Data: {
                        EncounterId: $scope.Data.Id
                    }
                },
                type: 'post',
                onComplete: $scope.GetPatientBillSummaryCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getinfoCallback = function (scope, data, options, hasError) {
            $scope.Data = data.Data[0];
            $scope.item.DoctorName = '';
            $scope.item.WardDetails = '';
            if ($scope.Data.Doctor) {
                if ($scope.Data.Doctor.Title)
                    $scope.item.DoctorName = $scope.Data.Doctor.Title.Description;
                if ($scope.Data.Doctor.FirstName)
                    $scope.item.DoctorName += ' ' + $scope.Data.Doctor.FirstName;
                if ($scope.Data.Doctor.LastName)
                    $scope.item.DoctorName += ' ' + $scope.Data.Doctor.LastName;
            }
            if ($scope.Data.WardMaster)
                $scope.item.WardDetails = $scope.Data.WardMaster.WardName;
            if ($scope.Data.WardRoomMaster)
                $scope.item.WardDetails += ' / ' + $scope.Data.WardRoomMaster.RoomNo;
            if ($scope.Data.WardRoomBedMaster)
                $scope.item.WardDetails += ' / ' + $scope.Data.WardRoomBedMaster.BedNo;

            $scope.patientChange();
            // $scope.getEncounters();
            $scope.GetPatientBillSummary();
        };

        $scope.getinfo = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.id
                }]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getinfoCallback
            };

            utl.Http.doAction(options);
        };

        $scope.UpdateEnc = function () {
            $scope.encUpdate = {};
            $scope.encUpdate.EncounterId = $scope.currentcontext.id;
            $scope.encUpdate.Id = $scope.currentcontext.id;
            $scope.encUpdate.IsPackageAssigned = false;
            $scope.encUpdate.EncounterIPPackageId = 0;
            $scope.encUpdate.IPPackageId = 0;

            var options = {
                action: 'Visit/Visit/UpdateEncounter',
                data: { Data: $scope.encUpdate },
                type: 'post',
                onComplete: $scope.getinfo
            };

            utl.Http.doAction(options);
        }

        $scope.getPatientAssignedPackageCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            $scope.refreshReactProps();
            if (data.Data.length > 0) {
                $scope.canShowAssignBtn = false;
            } else {
                $scope.canShowAssignBtn = true;
            }
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            if (data.Data.length == 0) {
                $scope.UpdateEnc();
            }
        };

        $scope.GetPatientAssignedPackage = function () {
            var inputData = {
                Params: [{
                    Key: 6,
                    Value: $scope.currentcontext.id
                },
                {
                    Key: 5,
                    Value: 2
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Visit/EncounterIPPackage/GetEncounterIPPackages',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAssignedPackageCallback
            };

            utl.Http.doAction(options);
        };

        $scope.assignPackage = function () {
            if (!$scope.item.IPPackageId) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Any Packages'));
                return;
            } else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'billing.package-assignment.assignmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onPackageAssignConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        };

        $scope.onPackageAssignConfirmed = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.IPPackageId
                }]
            };
            var options = {
                action: 'clinicalmaster/IPPackage/GetTariffIPPackages',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPackageAssignCallback
            };

            utl.Http.doAction(options);
        };
        $scope.GetGuarantorCallback = function (scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            $scope.lookup["ServiceRateCategory"] = data["ServiceRateCategory"];
        };

        $scope.getGuarantor = function () {
            $scope.item.GuarantorId = -1;
            $scope.item.ServiceRateCategoryId = -1;
            var inputData = [{
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.GuarantorTypeId
                    },
                    {
                        Key: 7,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }
                    ]
                }
            },
            {
                "Key": "ServiceRateCategory",
                Request: {
                    Params: [{
                        Key: 6,
                        Value: $scope.item.GuarantorTypeId
                    },
                    {
                        Key: 5,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }
                    ]
                }
            }
            ];
            $scope.initLookupCall(inputData, $scope.GetGuarantorCallback);
        }

        $scope.initLookupCall = function (inputData, callback) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: callback
            };
            utl.Http.doAction(options);
        };

        $scope.onPackageSelected = function (selectedItem) {
            var packInfo = selectedItem.selecteditem;
            $scope.item.IPPackageCode = packInfo.IPPackageCode;
            $scope.item.IPPackageDescription = packInfo.IPPackageDescription;
            var TariffDetail = $filter('filter')(packInfo.IPPackageTariffDetails, {
                TariffTypeId: $scope.item.ServiceRateCategoryId,
                GuarantorTypeId: $scope.item.GuarantorTypeId,
            }, true);
            if (TariffDetail) {
                $scope.item.PackageAmount = TariffDetail[0].PackageAmount;
            }
        }

        $scope.getPackageAssignCallback = function (scope, res, options, hasError) {
            $scope.PackageInfo = res.Data || [];
            if ($scope.PackageInfo && $scope.PackageInfo.length > 0) {
                // $scope.PackageInfo.forEach(ippackage => {
                for (var idx in $scope.PackageInfo) {
                    var ippackage = $scope.PackageInfo[idx];
                    let actAmt = 0;
                    if (ippackage.IsUnlimitedServices && !ippackage.ActualAmount) {
                        actAmt = ippackage.PackageAmount;
                    } else {
                        actAmt = ippackage.ActualAmount
                    }
                    $scope.item.EncounterId = $scope.currentcontext.id;
                    $scope.item.PatientId = 0;
                    $scope.item.IPPackageId = ippackage.Id;
                    $scope.item.IPPackageCode = ippackage.IPPackageCode;
                    $scope.item.IPPackageShortCode = ippackage.IPPackageShortCode;
                    $scope.item.IPPackageName = ippackage.IPPackageName;
                    // $scope.item.IPPackageDescription = ippackage.IPPackageDescription;
                    $scope.item.PackageAssignedDate = utl.Formatter.getCurrentDate();
                    $scope.item.IPPackageDays = ippackage.IPPackageDays;
                    $scope.item.OrganizationId = ippackage.OrganizationId;
                    $scope.item.FacilityId = ippackage.FacilityId;
                    $scope.item.CategoryId = ippackage.CategoryId;
                    $scope.item.SubCategoryId = ippackage.SubCategoryId;
                    $scope.item.DepartmentId = ippackage.DepartmentId;
                    $scope.item.SubDepartmentId = ippackage.SubDepartmentId;
                    // $scope.item.GuarantorTypeId = ippackage.GuarantorTypeId;
                    // $scope.item.GuarantorId = ippackage.GuarantorId;
                    // $scope.item.ServiceRateCategoryId = ippackage.ServiceRateCategoryId;
                    $scope.item.IsRateEditable = ippackage.IsRateEditable;
                    // $scope.item.ActualAmount = actAmt;
                    // $scope.item.PackageAmount = ippackage.PackageAmount;
                    $scope.item.DiscountTypeId = ippackage.DiscountTypeId;
                    $scope.item.DiscountModeId = ippackage.DiscountModeId;
                    $scope.item.DiscountValue = ippackage.DiscountValue;
                    $scope.item.DiscountAmount = ippackage.DiscountAmount;
                    $scope.item.CreditAccount = ippackage.CreditAccount;
                    $scope.item.DebitAccount = ippackage.DebitAccount;
                    $scope.item.ActiveFrom = ippackage.ActiveFrom;
                    $scope.item.ActiveTo = ippackage.ActiveTo;
                    $scope.item.IsUnlimitedServices = ippackage.IsUnlimitedServices;
                    $scope.item.ActiveStatusId = 2;
                    $scope.item.PackageAmount = $scope.item.PackageAmount;
                    $scope.EncounterIPPackageDetails = [];
                    var EncounterIPPackageDetail = {};
                    var TariffDetail = $filter('filter')(ippackage.IPPackageTariffDetails, {
                        TariffTypeId: $scope.item.ServiceRateCategoryId,
                        GuarantorTypeId: $scope.item.GuarantorTypeId,
                        // GuarantorId: $scope.item.GuarantorId
                    }, true);
                    var tDetails = TariffDetail[0];
                    if (tDetails) {
                        $scope.item.ActualAmount = tDetails.ActualAmount || 0;
                        for (var pdidx in tDetails.IPPackageDetails) {
                            var EachEncounterPackageDetail = tDetails.IPPackageDetails[pdidx];
                            EncounterIPPackageDetail = {
                                IPPackageDetailId: EachEncounterPackageDetail.Id,
                                ServiceCategoryId: EachEncounterPackageDetail.ServiceCategoryId,
                                ServiceCategoryCode: EachEncounterPackageDetail.ServiceCategoryCode,
                                ServiceCategoryName: EachEncounterPackageDetail.ServiceCategoryName,
                                ActualAmount: EachEncounterPackageDetail.ActualAmount,
                                PackageAmount: EachEncounterPackageDetail.PackageAmount,
                                ActiveStatusId: 2
                            }
                            $scope.EncounterIPPackageServiceInclusions = [];
                            var EncounterIPPackageServiceInclusion = {};
                            for (var incidx in EachEncounterPackageDetail.IPPackageServiceInclusions) {
                                var EachEncounterPackageInclusion = EachEncounterPackageDetail.IPPackageServiceInclusions[incidx];
                                EncounterIPPackageServiceInclusion = {
                                    IPPackageServiceInclusionId: EachEncounterPackageInclusion.Id,
                                    ServiceCategoryId: EachEncounterPackageInclusion.ServiceCategoryId,
                                    ServiceItemId: EachEncounterPackageInclusion.ServiceItemId,
                                    ServiceItemName: EachEncounterPackageInclusion.ServiceItemName,
                                    Quantity: EachEncounterPackageInclusion.Quantity,
                                    Rate: EachEncounterPackageInclusion.Rate,
                                    Amount: EachEncounterPackageInclusion.Amount,
                                    TotalAmount: EachEncounterPackageInclusion.TotalAmount,
                                    ActiveStatusId: 2
                                }
                                $scope.EncounterIPPackageServiceInclusions.push(EncounterIPPackageServiceInclusion);
                            }
                            EncounterIPPackageDetail.EncounterIPPackageServiceInclusions = $scope.EncounterIPPackageServiceInclusions;
                            $scope.EncounterIPPackageServiceExclusions = [];
                            var EncounterIPPackageServiceExclusion = {};
                            for (var excidx in EachEncounterPackageDetail.IPPackageServiceExclusions) {
                                var EachEncounterPackageExclusion = EachEncounterPackageDetail.IPPackageServiceExclusions[excidx];
                                EncounterIPPackageServiceExclusion = {
                                    IPPackageServiceExclusionId: EachEncounterPackageExclusion.Id,
                                    ServiceCategoryId: EachEncounterPackageExclusion.ServiceCategoryId,
                                    ServiceItemId: EachEncounterPackageExclusion.ServiceItemId,
                                    ServiceItemName: EachEncounterPackageExclusion.ServiceItemName,
                                    Quantity: EachEncounterPackageExclusion.Quantity,
                                    Rate: EachEncounterPackageExclusion.Rate,
                                    Amount: EachEncounterPackageExclusion.Amount,
                                    TotalAmount: EachEncounterPackageExclusion.TotalAmount,
                                    ActiveStatusId: 2
                                }
                                $scope.EncounterIPPackageServiceExclusions.push(EncounterIPPackageServiceExclusion);
                            }
                            EncounterIPPackageDetail.EncounterIPPackageServiceExclusions = $scope.EncounterIPPackageServiceExclusions;
                            $scope.EncounterIPPackageDetails.push(EncounterIPPackageDetail);
                        }
                    }
                }
            }

            $scope.saveItem();
        };

        $scope.saveItem = function () {
            var actionName = 'Visit/EncounterIPPackage/AddEncounterIPPackage';
            var inputData = {
                Header: $scope.item,
                Details: $scope.EncounterIPPackageDetails
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.ClearData = function () {
            document.getElementById("packid").value = '';
            $scope.item.IPPackageId = 0;
            $scope.item.IPPackageDescription = '';
            $scope.item.PackageAmount = 0.00;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.encounterippackageid = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.encounterippackageid = data;
            }
            $scope.ClearData();
            $scope.GetPatientAssignedPackage();
        };

        $scope.CheckFinalizeCallback = function (scope, res, options, hasError) {
            $scope.BillFinalized = false;
            if (res.Data.length > 0) {
                $scope.BillInfo = res.Data[0];
                $scope.BillFinalized = true;
            }
        };

        $scope.CheckFinalize = function () {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 6,
                    Value: 2
                },
                {
                    Key: 16,
                    Value: $scope.currentcontext.id
                }
                ]
            };
            var options = {

                action: 'billing/PatientBills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.CheckFinalizeCallback
            };
            utl.Http.doAction(options);
        };

        $scope.onCancelConfirmed = function (CancelPackage) {
            $scope.itemCancel = {};
            $scope.itemCancel.Id = CancelPackage.Id;
            $scope.itemCancel.EncounterId = CancelPackage.EncounterId;
            $scope.itemCancel.PatientId = CancelPackage.PatientId;
            $scope.itemCancel.IPPackageId = CancelPackage.IPPackageId;
            $scope.itemCancel.IPPackageCode = CancelPackage.IPPackageCode;
            $scope.itemCancel.IPPackageShortCode = CancelPackage.IPPackageShortCode;
            $scope.itemCancel.IPPackageName = CancelPackage.IPPackageName;
            $scope.itemCancel.IPPackageDescription = CancelPackage.IPPackageDescription;
            $scope.itemCancel.PackageAssignedDate = CancelPackage.PackageAssignedDate;
            $scope.itemCancel.IPPackageDays = CancelPackage.IPPackageDays;
            $scope.itemCancel.OrganizationId = CancelPackage.OrganizationId;
            $scope.itemCancel.FacilityId = CancelPackage.FacilityId;
            $scope.itemCancel.CategoryId = CancelPackage.CategoryId;
            $scope.itemCancel.SubCategoryId = CancelPackage.SubCategoryId;
            $scope.itemCancel.DepartmentId = CancelPackage.DepartmentId;
            $scope.itemCancel.SubDepartmentId = CancelPackage.SubDepartmentId;
            $scope.itemCancel.GuarantorTypeId = CancelPackage.GuarantorTypeId;
            $scope.itemCancel.GuarantorId = CancelPackage.GuarantorId;
            $scope.itemCancel.ServiceRateCategoryId = CancelPackage.ServiceRateCategoryId;
            $scope.itemCancel.IsRateEditable = CancelPackage.IsRateEditable;
            $scope.itemCancel.ActualAmount = CancelPackage.ActualAmount;
            $scope.itemCancel.PackageAmount = CancelPackage.PackageAmount;
            $scope.itemCancel.DiscountTypeId = CancelPackage.DiscountTypeId;
            $scope.itemCancel.DiscountModeId = CancelPackage.DiscountModeId;
            $scope.itemCancel.DiscountValue = CancelPackage.DiscountValue;
            $scope.itemCancel.DiscountAmount = CancelPackage.DiscountAmount;
            $scope.itemCancel.CreditAccount = CancelPackage.CreditAccount;
            $scope.itemCancel.DebitAccount = CancelPackage.DebitAccount;
            $scope.itemCancel.ActiveFrom = CancelPackage.ActiveFrom;
            $scope.itemCancel.ActiveTo = CancelPackage.ActiveTo;
            $scope.itemCancel.ActiveStatusId = 3;
            var inputData = {
                Header: $scope.itemCancel
            };
            var options = {
                action: 'Visit/EncounterIPPackage/UpdateEncounterIPPackage',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.GetPatientAssignedPackage
            };
            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $state.go('app.inpatient-billing');
        };


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Visit/EncounterIPPackage/DeleteEncounterIPPackage',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'view') {
                utl.Modal.open('app.assignedpackageInfo', {
                    params: {
                        id: entity.IPPackageId,
                    },
                    confirmCallback: $scope.GetPatientAssignedPackage
                });
            } else if (actionType == 'cancel') {
                if (!$scope.IsDisabled) {
                    utl.Dialog.confirmCancel($scope.onCancelConfirmed, entity, entity.IPPackageName);
                } else {
                    var msg = '';
                    msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                }
            } else if (actionType == 'delete') {
                if (entity.PaymentStatusId == 3) {
                    utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.paymentconsumed.lbl'));
                } else {
                    utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.SpecialityName);
                }
            }
        };


        //React bridge: the three <ui-select>s (Guarantor Type, Service Rate
        //Category, Guarantor) render through the shared
        //BridgeLookupSelectScreen and <custom-table config="vm.gridConfig">
        //through the shared BridgeGridScreen. The Guarantor Type dispatch calls
        //the screen's own unchanged getGuarantor(), matching its original
        //ng-change. Rows dispatch into the existing unchanged handleEvents.
        $scope.handleGridAction = function (actionType, payload) {
            var items = vm.gridConfig.data || [];
            var entity = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].Id === payload.id) { entity = items[i]; break; }
            }
            if (actionType == 'rowAction') { $scope.handleEvents(payload.key, entity); }
        };
        $scope.handleGuarantorTypeAction = function (actionType, payload) {
            if (actionType == 'change') { $scope.item.GuarantorTypeId = payload.id; $scope.getGuarantor(); $scope.refreshReactProps(); }
        };
        $scope.handleServiceRateCategoryAction = function (actionType, payload) {
            if (actionType == 'change') { $scope.item.ServiceRateCategoryId = payload.id; $scope.refreshReactProps(); }
        };
        $scope.handleGuarantorAction = function (actionType, payload) {
            if (actionType == 'change') { $scope.item.GuarantorId = payload.id; $scope.refreshReactProps(); }
        };

        $scope.refreshReactProps = function () {
            var defs = vm.gridConfig.columnDefs || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            function dt(v, f) { return v ? $filter('date')(v, f) : ''; }
            var items = vm.gridConfig.data || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    columns: [
                        { key: 'assigneddate', header: hdr(0) },
                        { key: 'code', header: hdr(1), sortable: true },
                        { key: 'name', header: hdr(2), sortable: true },
                        { key: 'description', header: hdr(3), sortable: true },
                        { key: 'days', header: hdr(4) },
                        { key: 'ratecategory', header: hdr(5), sortable: true },
                        { key: 'guarantor', header: hdr(6), sortable: true },
                        { key: 'amount', header: hdr(7), align: 'right' }
                    ],
                    actionsHeader: hdr(8) || 'Actions',
                    hasActions: true,
                    rows: items.map(function (entity) {
                        var acts = [{ key: 'view', label: '', icon: 'fas fa-eye', variant: 'icon', title: 'View' }];
                        //ng-show="entity.ActiveStatusId == 2"
                        if (entity.ActiveStatusId == 2) {
                            acts.push({ key: 'cancel', label: '', icon: 'fas fa-trash', variant: 'icon', title: 'Cancel' });
                        }
                        return {
                            id: entity.Id,
                            actions: acts,
                            cells: {
                                assigneddate: dt(entity.PackageAssignedDate, 'dd-MMM-yyyy') + ' ' + dt(entity.PackageAssignedDate, 'HH:mm'),
                                code: entity.IPPackageCode,
                                name: entity.IPPackageName,
                                description: entity.IPPackageDescription,
                                days: entity.IPPackageDays,
                                ratecategory: entity.ServiceRateCategory && entity.ServiceRateCategory.Description,
                                guarantor: entity.Guarantor && entity.Guarantor.GuarantorName,
                                amount: $filter('displaycurrency')(entity.PackageAmount)
                            }
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
            var lk = $scope.lookup || {};
            var it = $scope.item || {};
            $scope.reactPropsGuarantorTypeContainer = { reactProps: { options: lk.GuarantorType || [], value: it.GuarantorTypeId }, onAction: $scope.handleGuarantorTypeAction };
            $scope.reactPropsServiceRateCategoryContainer = { reactProps: { options: lk.ServiceRateCategory || [], value: it.ServiceRateCategoryId }, onAction: $scope.handleServiceRateCategoryAction };
            $scope.reactPropsGuarantorContainer = { reactProps: { options: lk.Guarantor || [], value: it.GuarantorId }, onAction: $scope.handleGuarantorAction };
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "PackageAssignedDate",
                displayName: $translate.instant('billing.package-assignment.packageassigneddate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PackageAssignedDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.PackageAssignedDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "IPPackageCode",
                displayName: $translate.instant('billing.package-assignment.ippackagecode.lbl')
            },
            {
                field: "IPPackageName",
                displayName: $translate.instant('billing.package-assignment.ippackagename.lbl')
            },
            {
                field: "IPPackageDescription",
                displayName: $translate.instant('Description'),
            },
            {
                field: "IPPackageDays",
                displayName: $translate.instant('billing.package-assignment.ippackagedays.lbl')
            },
            {
                field: "ServiceRateCategory.Description",
                displayName: $translate.instant('billing.package-assignment.serviceratecategory.lbl')
            },
            {
                field: "Guarantor.GuarantorName",
                displayName: $translate.instant('billing.package-assignment.guarantorname.lbl')
            },
            {
                field: "PackageAmount",
                displayName: $translate.instant('billing.package-assignment.packageamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.PackageAmount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                width: '17%',
                cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'cancel\',entity)" ng-show="entity.ActiveStatusId == 2"><img src="assets/svg/delete.svg" alt=""></span>\
                        </div>',
                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.refreshReactProps();

        vm.ippackagecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'IP Package Code',
                field: 'IPPackageCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'IP Package Name',
                field: 'IPPackageName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            // {
            //     header: 'Service Rate Category',
            //     field: 'ServiceRateCategory',
            //     datatype: 'string',
            //     headercls: 'td-name',
            //     fieldcls: 'td-name'
            // },
            {
                header: 'IP Package Amount',
                field: 'IPPackageAmount',
                datatype: 'string',
                headercls: 'td-amount',
                fieldcls: 'td-amount'
            }
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/IPPackage/GetTariffIPPackages',
            formatdisplay: formatselectedippackage,
            presearch: presearchippackage,
            postsearch: postsearchippackage
        };

        function formatselectedippackage() {
            var selectedItem = vm.ippackagecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.IPPackageId = selectedItem.Id;
                result = [selectedItem.IPPackageName].join('  ');
            } else if (vm.ippackagecontrolconfig.rowdata) {
                result = [vm.ippackagecontrolconfig.rowdata.IPPackageName].join(' ');
            }
            $scope.canShowAssignBtn = true;
            return result;
        }

        function presearchippackage() {
            var To = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
            var query = vm.ippackagecontrolconfig.query;
            var inputData = {
                Params: [
                    // {
                    //     Key: 2,
                    //     Value: $scope.item.GuarantorTypeId
                    // },
                    // {
                    //     Key: 3,
                    //     Value: $scope.item.GuarantorId
                    // },
                    {
                        Key: 5,
                        Value: 2
                    },
                    {
                        Key: 7,
                        Value: To
                    },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.ippackagecontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            if($scope.searchbyguarantor == 1) {
                inputData.Params.push(
                    {
                        Key: 2,
                        Value: $scope.item.GuarantorTypeId
                    },
                    {
                        Key: 3,
                        Value: $scope.item.GuarantorId
                    },);
            }

            vm.ippackagecontrolconfig.searchparams = inputData;
        }

        function postsearchippackage() {
            for (var idx in vm.ippackagecontrolconfig.result) {
                var item = vm.ippackagecontrolconfig.result[idx];
                item.IPPackageCode = item.IPPackageCode;
                item.IPPackageName = item.IPPackageName;
                if (item.IPPackageTariffDetails) {
                    var TariffDetail = $filter('filter')(item.IPPackageTariffDetails, {
                        TariffTypeId: $scope.item.ServiceRateCategoryId,
                        GuarantorTypeId: $scope.item.GuarantorTypeId,
                    }, true);
                    if (TariffDetail && TariffDetail.length > 0) {
                        item.IPPackageAmount = TariffDetail[0].PackageAmount;
                    }
                }
                // item.IPPackageAmount = item.PackageAmount;
                // item.ServiceRateCategory = item.ServiceRateCategory.Description;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.CheckFinalize();
            $scope.GetPatientAssignedPackage();
            $scope.getinfo();
            $scope.getEncounters();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "GuarantorType"
            },
            {
                "Key": "ServiceRateCategory",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
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

            ]
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

    packageAssignmentController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();