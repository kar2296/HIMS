(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPBillingNewDrugsController', IPBillingNewDrugsController);

    function IPBillingNewDrugsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;

        $scope.DrugServiceCategoryId = 0;
        $scope.DrugServiceGroupId = 0;
        $scope.NonDrugServiceCategoryId = 0;
        $scope.NonDrugServiceGroupId = 0;

        $scope.tabindexmap = { detailtabindex: 0 };

        $scope.item = {
            BillDateTime: utl.Formatter.getCurrentDate(),
            BillPriorityId: 1
        };

        var guarantorId_ = 1000;
        var facilityId_ = utl.Session.getCurrentFacilityId();

        if (!facilityId_) facilityId_ = 1;
        guarantorId_ *= facilityId_;
        $scope.GuarantorMasterId = guarantorId_;
        $scope.PatientBillDetails = [];
        $scope.PatientPaymentDetails = [];

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.bid = parseInt(modalConfig.params.bid);
            $scope.currentcontext.mbid = parseInt(modalConfig.params.mbid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.selectedPatient.Id },
                confirmCallback: $scope.getItem
            });
        };

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        };

        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.item.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };

                utl.Http.doAction(options);
            }
        };

        $scope.calcAmt = function (index, item) {
            if (item.ServiceId > 0) {
                if (item.DiscountAmount > item.GrossAmount) {
                    item.DiscountAmount = $scope.ValidDiscount;
                }
                if (item.DoctorShare > item.GrossAmount) {
                    item.DoctorShare = $scope.ValidShareAmt;
                }
                item.NetAmount = item.Rate * item.Quantity;
                $scope.item.BillAmount = 0;
                $scope.item.BillDiscount = 0;
                $scope.TotalNet = 0;
                if (item.DiscountAmount == undefined || isNaN(item.DiscountAmount) || item.DiscountAmount == null) {
                    item.DiscountAmount = 0;
                }
                item.DoctorShare = parseFloat(item.DoctorShare);
                if (item.DoctorShare == undefined || isNaN(item.DoctorShare) || item.DoctorShare == null) {
                    item.DoctorShare = parseFloat(0).toFixed(2);
                }
                for (var idx in $scope.PatientBillDetails) {
                    if ($scope.PatientBillDetails[idx].Status == 1) {
                        $scope.item.BillAmount = $scope.item.BillAmount + $scope.PatientBillDetails[idx].NetAmount;
                        $scope.PatientBillDetails[idx].Amount = parseInt($scope.PatientBillDetails[idx].Quantity) *
                            parseInt($scope.PatientBillDetails[idx].Rate) -
                            parseInt($scope.PatientBillDetails[idx].DiscountAmount);
                        $scope.PatientBillDetails[idx].GrossAmount = parseInt($scope.PatientBillDetails[idx].Quantity) *
                            parseInt($scope.PatientBillDetails[idx].Rate);
                        $scope.TotalNet += parseFloat($scope.PatientBillDetails[idx].Amount);
                        $scope.item.BillDiscount += parseInt($scope.PatientBillDetails[idx].DiscountAmount);
                    }
                }
                $scope.ValidDiscount = item.DiscountAmount;
                $scope.ValidShareAmt = item.DoctorShare;
                if (item.GrossAmount < item.DoctorShare || item.GrossAmount < item.DiscountAmount) {
                    utl.Alert.showErrorMsg('Enter a Valid Item Amount');
                }
            }
        };

        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res;
            $scope.loadPatientGuarantors();
        };

        $scope.getEncounters = function () {
            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: { Id: $scope.currentcontext.eid },
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getDrugItem = function (idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.PatientBillDetails, { pivotkey: 'ItemMasterId', displaykey: 'ItemName' });
            if (isDuplicate) {
                item.ItemMasterId = '';
                item.selectedItem.ItemName = '';
                return;
            }
            var selectedItem = item.SelectedItem;

            item.PatientBillStatusId = 3;
            item.PatientBillDetailId = 0;
            item.PatientBillId = 0;
            item.ServiceId = selectedItem.Id;
            item.ServiceCode = selectedItem.ItemCode;
            item.ServiceName = selectedItem.ItemName;
            if (selectedItem.SubCategoryId == 1) {
                item.SubCategoryId = 1;
                item.ServiceTypeId = 0;
                item.ServiceGroupId = $scope.DrugServiceGroupId;
                item.ServiceCategoryId = $scope.DrugServiceCategoryId;
                item.MasterName = selectedItem.DrugName;
                item.MasterItemId = selectedItem.DrugId;
                item.DrugName = selectedItem.DrugName;
                item.DrugId = selectedItem.DrugId;
                item.MasterTypeId = selectedItem.SubCategoryId;
            } else if (selectedItem.SubCategoryId == 2) {
                item.SubCategoryId = 2;
                item.ServiceTypeId = 0;
                item.ServiceGroupId = $scope.NonDrugServiceGroupId;
                item.ServiceCategoryId = $scope.NonDrugServiceCategoryId;
                item.MasterName = selectedItem.DrugName;
                item.MasterItemId = selectedItem.DrugId;
                item.DrugName = selectedItem.DrugName;
                item.DrugId = selectedItem.DrugId;
                item.MasterTypeId = selectedItem.SubCategoryId;
            } else {
                item.SubCategoryId = 0;
                item.ServiceTypeId = 0;
                item.ServiceGroupId = 0;
                item.ServiceCategoryId = 0;
                item.MasterName = '';
                item.MasterItemId = 0;
                item.DrugName = 0;
                item.DrugId = 0;
                item.MasterTypeId = 0;
            }

            item.AliasId = 0;
            item.AliasName = '';
            item.EncounterId = $scope.Encounter.Id;
            item.Quantity = 1;
            item.ReturnedQuantity = 0;
            item.StockItemId = 0;
            item.StockSerialItemId = 0;
            item.BatchId = '';
            item.ExpiryDate = null;
            item.Rate = selectedItem.MrPrice;
            item.Amount = parseInt(item.Quantity) * parseFloat(selectedItem.MrPrice);
            item.GrossAmount = parseInt(item.Quantity) * parseFloat(selectedItem.MrPrice);
            item.GrossGstAmount = 0;
            item.DiscountPercentage = 0;
            item.UnitDiscountAmount = 0;
            item.DiscountAmount = 0;
            item.UnitProportionateDiscount = 0;
            item.ProportionateDiscount = 0;
            item.DoctorDiscountAmount = 0;
            item.EducationCess = 0;
            item.GstId = selectedItem.GstId;
            if (selectedItem.GstMaster) { item.GstPercentage = selectedItem.GstMaster.GstPercentage; } else { item.GstPercentage = 0; }
            item.UnitGstAmount = 0;
            item.GstAmount = 0;
            item.InGstId = selectedItem.InGstId;
            if (selectedItem.InGstMaster) { item.GstPercentage = selectedItem.InGstMaster.GstPercentage; } else { item.GstPercentage = 0; }
            item.UnitInGstAmount = 0;
            item.InGstAmount = 0;
            item.CGstId = selectedItem.CGstId;
            if (selectedItem.CGstMaster) { item.GstPercentage = selectedItem.CGstMaster.GstPercentage; } else { item.GstPercentage = 0; }
            item.UnitCGstAmount = 0;
            item.CGstAmount = 0;
            item.SGstId = selectedItem.SGstId;
            if (selectedItem.SGstMaster) { item.GstPercentage = selectedItem.SGstMaster.GstPercentage; } else { item.GstPercentage = 0; }
            item.UnitSGstAmount = 0;
            item.SGstAmount = 0;
            item.NetAmountBeforeGst = 0;
            item.NetAmount = parseInt(item.Quantity) * parseFloat(selectedItem.MrPrice);
            item.ReceivedAmount = 0;
            item.DoctorId = $scope.Encounter.DoctorId;
            item.DoctorName = '';
            item.IsPackageItem = 0;
            item.IsPackage = 0;
            item.PackageName = '';
            item.OrderId = 0;
            item.OrderDetailId = 0;
            item.OrderTypeId = 0;
            item.OrderStatusId = 0;
            item.OrderDateTime = null;
            item.OTRegisterId = 0;
            item.ProcedureId = 0;
            item.PrescriptionId = 0;
            item.PrescriptionDetailId = 0;
            item.PrescriptionTypeId = 0;
            item.PrescriptionStatusId = 0;
            item.PrescriptionDate = null;
            item.ServiceRateCategoryId = 0;
            item.ServiceRateCategoryName = '';
            item.IsModified = 0;
            item.IsSupplementary = true;
            item.IsBillable = 1;
            item.IsPharmacyCredit = 0;
            item.IsPharmacySale = 1;
            item.PharmacySaleTypeId = 6;
            item.IsPharmacyReturn = 0;
            item.PharmacyReturnTypeId = 0;
            item.IsDoctorDiscount = 0;
            item.IsGstDoctor = 0;
            item.StartDateTime = null;
            item.EndDateTime = null;
            item.DiscountTypeId = 0;
            item.DiscountModeId = 2;
            item.DiscountAuthorizedBy = 0;
            item.DoctorShare = 0;
            item.ReferalShare = 0;
            item.CNAmount = 0;
            item.CancelReason = 0;
            item.CancelledBy = 0;
            item.IsInvoicedDoctorShare = 0;
            item.ItemMasterId = selectedItem.Id;
            item.ItemCode = selectedItem.ItemCode;
            item.ItemName = selectedItem.ItemName;
            item.ScheduleTypeId = selectedItem.ScheduleTypeId;
            item.ScheduleTypeDescription = '';
            item.GenericId = selectedItem.GenericId;
            item.GenericName = selectedItem.GenericName;
            item.IsPrescribed = 0;
            item.ManufacturerId = selectedItem.ManufacturerId;
            item.ManufacturerName = selectedItem.ManufacturerName;
            item.StoreMasterId = 1;
            item.DepartmentId = 0;
            item.IsNightCharge = 0;
            item.Comments = '';
            item.Status = 1;


            $scope.calcAmt(idx, item);
            $scope.addNewLineItem();
        };

        var sort_by = function (field, reverse, primer) {
            var key = primer ?
                function (x) { return primer(x[field]) } :
                function (x) { return x[field] };

            reverse = !reverse ? 1 : -1;

            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }

        $scope.loadPatientGuarantorsCallback = function (scope, data, options, hasError) {
            if (data && data.PatientGuarantor) {
                $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;
                if (!$scope.Encounter.GuarantorId) {
                    $scope.Encounter.GuarantorId = utl.Lookup.getDefault($scope.lookup.PatientGuarantor, 'SELF');
                }
                forEach($scope.lookup.PatientGuarantor, function (v) {
                    if (v.Id === $scope.Encounter.GuarantorId)
                        $scope.GuarantorMasterId = v.GuarantorId;
                });
            }
        };

        $scope.loadPatientGuarantors = function () {
            if ($scope.Encounter.PatientId && $scope.Encounter.PatientId > 0) {
                var inputData = [
                    { Key: "PatientGuarantor", Request: { Params: [{ Key: 1, Value: 2 }, { Key: 2, Value: $scope.Encounter.PatientId }] } }
                ];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.loadPatientGuarantorsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.Bedoccupancy = function () {
            if ($scope.Encounter.PatientId > 0) {
                utl.Modal.open('app.bedoccupancyhistory', {
                    params: { pid: $scope.Encounter.PatientId },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('admission.previous-admi-nopatient-msg.lbl'));
            }
        };

        vm.wardbedmastercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Bed No', field: 'BedNo', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/WardRoomBedMaster/GetWardRoomBedMasters',
            formatdisplay: formatselectedward,
            presearch: presearchward,
            postsearch: postsearchward
        };

        function formatselectedward() {
            var selectedItem = vm.wardbedmastercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.WardMaster.WardName, selectedItem.WardRoomMaster.RoomNo, selectedItem.Code].join(' / ');
            } else if (vm.wardbedmastercontrolconfig.rowdata) {
                result = [vm.wardbedmastercontrolconfig.rowdata.WardMaster.WardName, vm.wardbedmastercontrolconfig.rowdata.WardRoomMaster.RoomNo, vm.wardbedmastercontrolconfig.rowdata.Code].join(' / ');
            }
            return result;
        }

        function presearchward() {
            var query = vm.wardbedmastercontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.wardbedmastercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.wardbedmastercontrolconfig.searchparams = inputData;
        }

        function postsearchward() {
            for (var idx in vm.wardbedmastercontrolconfig.result) {
                var item = vm.wardbedmastercontrolconfig.result[idx];
                item.Code = item.Code;
            }
        }

        $scope.doctorChange = function () {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            for (var idx in $scope.lookup.Department) {
                if ($scope.lookup.Department[idx].Id == doctorObj.DepartmentId) {
                    if ($scope.currentcontext.selecteddept.indexOf($scope.lookup.Department[idx]) == -1) {
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[idx]);
                    }
                }
            }
            if ($scope.currentcontext.selecteddept.length > 0) {
                $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
            }
        };

        $scope.onDoctorSelected = function (data) {
            $scope.currentcontext.selecteddept = [];
            $scope.getdepartment();
        };

        $scope.getdeptCallback = function (scope, data, options, hasError) {
            $scope.item.map = data;
            var dept = [];
            for (var idx in data) {
                dept.push(data[idx])
                for (var iddx in $scope.lookup.Department) {
                    if ($scope.lookup.Department[iddx].Id == dept[idx].DepartmentId)
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[iddx]);
                }
            }
            $scope.doctorChange();
        };

        $scope.getdepartment = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.item.DoctorId }
                ]
            };
            var options = {
                action: 'SystemSettings/User/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getdeptCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else { }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
            }
            $scope.confirmCallback({
                ModifiendPatientBillId: $scope.currentcontext.id
            });
        };

        var groupBy_ServiceCategory = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupBy_ServiceCategory(byFirst[prop], rest, context);
            }
            return byFirst;
        };

        $scope.saveAndApprove = function () {
            $scope.ModifiedPatientBillDetails = [];
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                if (item.Quantity > 0 && item.NetAmount > 0 && item.Status == 1) {
                    if (item.ServiceId > 0) {
                        $scope.ModifiedPatientBillDetails.push(item);
                    }
                }
            }

            $scope.ModifiedPatientBillCategorys = [];
            var Grouped_SC_Items = groupBy_ServiceCategory($scope.ModifiedPatientBillDetails, ['ServiceCategoryId']);
            var TotalAmount = 0;
            for (var gscidx in Grouped_SC_Items) {
                var each_gsc = Grouped_SC_Items[gscidx];
                var CategoryId = 0;
                var CategoryGrossAmount = 0;
                var CategoryDiscountAmount = 0;
                var CategoryGstAmount = 0;
                var CategoryNetAmount = 0;
                $scope.ModifiedPatientBillCategoryDetails = [];
                for (var sciidx in each_gsc) {
                    var each_sci = each_gsc[sciidx];
                    var ModifiedPatientBillCategoryDetail = {};

                    var itemgrossamount = 0;
                    var itemdiscountamount = 0;
                    var itemgstamount = 0;
                    var itemnetamount = 0;

                    itemgrossamount = each_sci.NetAmount;
                    itemdiscountamount = 0;
                    itemgstamount = 0;
                    itemnetamount = each_sci.NetAmount;

                    CategoryId = each_sci.ServiceCategoryId;
                    CategoryGrossAmount += itemnetamount;
                    CategoryDiscountAmount += 0;
                    CategoryGstAmount += 0;
                    CategoryNetAmount += itemnetamount;
                    TotalAmount += itemnetamount;

                    ModifiedPatientBillCategoryDetail.ModifiedPatientBillCategoryId = 0;
                    ModifiedPatientBillCategoryDetail.ModifiedPatientBillId = $scope.currentcontext.mbid || 0;
                    ModifiedPatientBillCategoryDetail.ModifiedBillDateTime = utl.Formatter.getCurrentDate();
                    ModifiedPatientBillCategoryDetail.PatientBillStatusId = 3;
                    ModifiedPatientBillCategoryDetail.PatientBillDetailId = 0;
                    ModifiedPatientBillCategoryDetail.PatientBillId = $scope.currentcontext.bid || 0;
                    ModifiedPatientBillCategoryDetail.ServiceId = each_sci.ServiceId || 0;
                    ModifiedPatientBillCategoryDetail.ServiceCode = each_sci.ServiceCode;
                    ModifiedPatientBillCategoryDetail.ServiceName = each_sci.ServiceName;
                    ModifiedPatientBillCategoryDetail.ServiceTypeId = 0;
                    ModifiedPatientBillCategoryDetail.ServiceGroupId = each_sci.ServiceGroupId || 0;
                    ModifiedPatientBillCategoryDetail.ServiceCategoryId = each_sci.ServiceCategoryId || 0;
                    ModifiedPatientBillCategoryDetail.MasterTypeId = each_sci.MasterTypeId || 0;
                    ModifiedPatientBillCategoryDetail.MasterItemId = each_sci.MasterItemId || 0;
                    ModifiedPatientBillCategoryDetail.MasterName = each_sci.MasterName;
                    ModifiedPatientBillCategoryDetail.AliasId = 0;
                    ModifiedPatientBillCategoryDetail.AliasName = '';
                    ModifiedPatientBillCategoryDetail.EncounterId = $scope.currentcontext.eid || 0;
                    ModifiedPatientBillCategoryDetail.Quantity = each_sci.Quantity || 0;
                    ModifiedPatientBillCategoryDetail.ReturnedQuantity = 0;
                    ModifiedPatientBillCategoryDetail.StockItemId = 0;
                    ModifiedPatientBillCategoryDetail.StockSerialItemId = 0;
                    ModifiedPatientBillCategoryDetail.BatchId = '';
                    ModifiedPatientBillCategoryDetail.ExpiryDate = null;
                    ModifiedPatientBillCategoryDetail.Rate = each_sci.Rate || 0;
                    ModifiedPatientBillCategoryDetail.Amount = each_sci.Amount || 0;
                    ModifiedPatientBillCategoryDetail.ItemAmount = each_sci.Amount || 0;
                    ModifiedPatientBillCategoryDetail.ItemDiscount = each_sci.DiscountAmount || 0;
                    ModifiedPatientBillCategoryDetail.IsSplit = 0;
                    ModifiedPatientBillCategoryDetail.SplitItemAmount = 0;
                    ModifiedPatientBillCategoryDetail.SplitItemDiscount = 0;
                    ModifiedPatientBillCategoryDetail.VisitGuarantorId = $scope.Encounter.GuarantorId;
                    ModifiedPatientBillCategoryDetail.GrossAmount = each_sci.Amount || 0;
                    ModifiedPatientBillCategoryDetail.GrossGstAmount = 0;
                    ModifiedPatientBillCategoryDetail.DiscountPercentage = 0;
                    ModifiedPatientBillCategoryDetail.UnitDiscountAmount = 0;
                    ModifiedPatientBillCategoryDetail.DiscountAmount = 0;
                    ModifiedPatientBillCategoryDetail.UnitProportionateDiscount = 0;
                    ModifiedPatientBillCategoryDetail.ProportionateDiscount = 0;
                    ModifiedPatientBillCategoryDetail.DoctorDiscountAmount = 0;
                    ModifiedPatientBillCategoryDetail.EducationCess = 0;
                    ModifiedPatientBillCategoryDetail.GstId = 0;
                    ModifiedPatientBillCategoryDetail.GstPercentage = 0;
                    ModifiedPatientBillCategoryDetail.UnitGstAmount = 0;
                    ModifiedPatientBillCategoryDetail.GstAmount = 0;
                    ModifiedPatientBillCategoryDetail.InGstId = 0;
                    ModifiedPatientBillCategoryDetail.InGstPercentage = 0;
                    ModifiedPatientBillCategoryDetail.UnitInGstAmount = 0;
                    ModifiedPatientBillCategoryDetail.InGstAmount = 0;
                    ModifiedPatientBillCategoryDetail.CGstId = 0;
                    ModifiedPatientBillCategoryDetail.CGstPercentage = 0;
                    ModifiedPatientBillCategoryDetail.UnitCGstAmount = 0;
                    ModifiedPatientBillCategoryDetail.CGstAmount = 0;
                    ModifiedPatientBillCategoryDetail.SGstId = 0;
                    ModifiedPatientBillCategoryDetail.SGstPercentage = 0;
                    ModifiedPatientBillCategoryDetail.UnitSGstAmount = 0;
                    ModifiedPatientBillCategoryDetail.SGstAmount = 0;
                    ModifiedPatientBillCategoryDetail.NetAmountBeforeGST = 0;
                    ModifiedPatientBillCategoryDetail.NetAmount = each_sci.Amount || 0;
                    ModifiedPatientBillCategoryDetail.ReceivedAmount = 0;
                    ModifiedPatientBillCategoryDetail.DoctorId = each_sci.DoctorId || 0;
                    ModifiedPatientBillCategoryDetail.DoctorName = '';
                    ModifiedPatientBillCategoryDetail.IsPackageItem = 0;
                    ModifiedPatientBillCategoryDetail.PackageId = 0;
                    ModifiedPatientBillCategoryDetail.PackageName = '';
                    ModifiedPatientBillCategoryDetail.OrderId = 0;
                    ModifiedPatientBillCategoryDetail.OrderDetailId = 0;
                    ModifiedPatientBillCategoryDetail.OrderTypeId = 0;
                    ModifiedPatientBillCategoryDetail.OrderStatusId = 0;
                    ModifiedPatientBillCategoryDetail.OrderDateTime = null;
                    ModifiedPatientBillCategoryDetail.OTRegisterId = 0;
                    ModifiedPatientBillCategoryDetail.ProcedureId = 0;
                    ModifiedPatientBillCategoryDetail.PrescriptionId = 0;
                    ModifiedPatientBillCategoryDetail.PrescriptionDetailId = 0;
                    ModifiedPatientBillCategoryDetail.PrescriptionTypeId = 0;
                    ModifiedPatientBillCategoryDetail.PrescriptionStatusId = 0;
                    ModifiedPatientBillCategoryDetail.PrescriptionDate = null;
                    ModifiedPatientBillCategoryDetail.ServiceRateCategoryId = $scope.Encounter.ServiceRateCategoryId || 0;
                    ModifiedPatientBillCategoryDetail.ServiceRateCategoryName = '';
                    ModifiedPatientBillCategoryDetail.IsModified = 0;
                    if ($scope.Encounter.GuarantorTypeId == 1) {
                        ModifiedPatientBillCategoryDetail.IsSupplementary = 1;
                    } else {
                        ModifiedPatientBillCategoryDetail.IsSupplementary = 0;
                    }
                    ModifiedPatientBillCategoryDetail.IsBillable = 1;
                    ModifiedPatientBillCategoryDetail.IsPharmacyCredit = 0;
                    ModifiedPatientBillCategoryDetail.IsPharmacySale = 1;
                    ModifiedPatientBillCategoryDetail.PharmacySaleTypeId = 6;
                    ModifiedPatientBillCategoryDetail.IsPharmacyReturn = 0;
                    ModifiedPatientBillCategoryDetail.PharmacyReturnTypeId = 0;
                    ModifiedPatientBillCategoryDetail.IsDoctorDiscount = 0;
                    ModifiedPatientBillCategoryDetail.IsGstDoctor = 0;
                    ModifiedPatientBillCategoryDetail.StartDateTime = null;
                    ModifiedPatientBillCategoryDetail.EndDateTime = null
                    ModifiedPatientBillCategoryDetail.DiscountTypeId = 0;
                    ModifiedPatientBillCategoryDetail.DiscountModeId = 2;
                    ModifiedPatientBillCategoryDetail.DiscountAuthorizedBy = 0;
                    ModifiedPatientBillCategoryDetail.DoctorShare = each_sci.DoctorShare || 0;
                    ModifiedPatientBillCategoryDetail.ReferalShare = 0;
                    ModifiedPatientBillCategoryDetail.CNAmount = 0;
                    ModifiedPatientBillCategoryDetail.CancelReason = '';
                    ModifiedPatientBillCategoryDetail.CancelledBy = 0;
                    ModifiedPatientBillCategoryDetail.IsInvoicedDoctorShare = 0;
                    ModifiedPatientBillCategoryDetail.ItemMasterId = each_sci.ItemMasterId;
                    ModifiedPatientBillCategoryDetail.ItemCode = each_sci.ItemCode;
                    ModifiedPatientBillCategoryDetail.ItemName = each_sci.ItemName;
                    ModifiedPatientBillCategoryDetail.ScheduleTypeId = each_sci.ScheduleTypeId;
                    ModifiedPatientBillCategoryDetail.ScheduleTypeDescription = '';
                    ModifiedPatientBillCategoryDetail.GenericId = each_sci.GenericId;
                    ModifiedPatientBillCategoryDetail.GenericName = '';
                    ModifiedPatientBillCategoryDetail.IsPrescribed = 0;
                    ModifiedPatientBillCategoryDetail.ManufacturerId = each_sci.ManufacturerId;
                    ModifiedPatientBillCategoryDetail.ManufacturerName = '';
                    ModifiedPatientBillCategoryDetail.StoreMasterId = 1;
                    ModifiedPatientBillCategoryDetail.DepartmentId = $scope.Encounter.DepartmentId || 0;
                    ModifiedPatientBillCategoryDetail.IsNightCharge = 0;
                    ModifiedPatientBillCategoryDetail.Comments = '';
                    ModifiedPatientBillCategoryDetail.Status = 1;

                    $scope.ModifiedPatientBillCategoryDetails.push(ModifiedPatientBillCategoryDetail);
                }

                var C_GuarantorGrossAmount = 0;
                var C_GuarantorDiscountAmount = 0;
                var C_GuarantorGstAmount = 0;
                var C_GuarantorNetAmount = 0;

                var C_SupplementaryGrossAmount = 0;
                var C_SupplementaryDiscountAmount = 0;
                var C_SupplementaryGstAmount = 0;
                var C_SupplementaryNetAmount = 0;

                if ($scope.Encounter.GuarantorTypeId == 1) {
                    C_SupplementaryGrossAmount = CategoryGrossAmount;
                    C_SupplementaryDiscountAmount = 0;
                    C_SupplementaryGstAmount = 0;
                    C_SupplementaryNetAmount = CategoryNetAmount;
                } else {
                    C_GuarantorGrossAmount = CategoryGrossAmount;
                    C_GuarantorDiscountAmount = 0;
                    C_GuarantorGstAmount = 0;
                    C_GuarantorNetAmount = CategoryNetAmount;
                }

                var ModifiedPatientBillCategory = {
                    ModifiedPatientBillId: $scope.currentcontext.mbid,
                    PatientBillId: $scope.currentcontext.bid,
                    EncounterId: $scope.currentcontext.eid,
                    ServiceCategoryId: CategoryId,
                    CategoryGrossAmount: CategoryGrossAmount,
                    CategoryDiscountAmount: CategoryDiscountAmount,
                    CategoryGstAmount: CategoryGstAmount,
                    CategoryNetAmount: CategoryNetAmount,
                    GuarantorGrossAmount: C_GuarantorGrossAmount,
                    GuarantorDiscountAmount: 0,
                    GuarantorGstAmount: 0,
                    GuarantorNetAmount: C_GuarantorNetAmount,
                    SupplementaryGrossAmount: C_SupplementaryGrossAmount,
                    SupplementaryDiscountAmount: 0,
                    SupplementaryGstAmount: 0,
                    SupplementaryNetAmount: C_SupplementaryNetAmount,
                    ModifiedPatientBillCategoryDetails: $scope.ModifiedPatientBillCategoryDetails,
                    Status: 1
                }

                $scope.ModifiedPatientBillCategorys.push(ModifiedPatientBillCategory);
            }

            $scope.ModifiedItem = {};
            $scope.ModifiedItem.Id = $scope.currentcontext.mbid;
            $scope.ModifiedItem.ModifiedBillAmount = TotalAmount;
            $scope.ModifiedItem.EncounterId = $scope.currentcontext.eid;

            $scope.saveItem();
        };

        $scope.completeBill = function () {
            if (!utl.Validator.validate($scope)) {
                $scope.isSaveandApprove = true;
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.billing-details.confirm.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveAndApprove,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function () {
            var actionName = 'BillModification/ModifiedPatientBills/ManageModifiedPatientBills';
            var inputData = { Header: $scope.ModifiedItem, Details: $scope.ModifiedPatientBillCategorys };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function getpaymentsLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientPaymentDetails) {
                var item = $scope.PatientPaymentDetails[idx];
                if (item.AmountPaid > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        function getLinesForSave() {
            var result = [];
            var isValid = true;
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                if (item.Quantity > 0 && item.NetAmount > 0 && item.Status == 1) {
                    if (item.ServiceId > 0) {
                        item.Amount = item.Amount;
                        item.GrossAmount = item.GrossAmount;
                        item.EncounterId = $scope.item.EncounterId;
                        item.DepartmentId = item.DepartmentId;
                        item.DoctorDiscountAmount = 0;
                        item.GSTId = item.GSTId;
                        item.TaxId = item.GSTId;
                        item.TaxCode = item.TaxCode;
                        item.TaxCost = item.GSTAmount;
                        item.IsPackageItem = item.IsPackageItem;
                        item.IsPackage = item.IsPackage;
                        item.PackageId = 0;
                        item.PackageName = '';
                        item.OrderId = 0;
                        item.OrderDetailId = 0;
                        item.OrderDateTime = utl.Formatter.getCurrentDate();
                        item.RequestDate = utl.Formatter.getCurrentDate();
                        item.IsModified = 0;
                        item.IsSupplementary = item.IsSupplementary;
                        item.IsBillable = 0;
                        item.IsDoctorDiscount = 0;
                        item.IsGstDoctor = 0;
                        item.StartDateTime = null;
                        item.EndDateTime = null;
                        item.DiscountTypeId = item.DiscountTypeId;
                        item.DiscountAuthorizedBy = 0;
                        item.DoctorId = item.DoctorId;
                        item.DoctorShare = item.DoctorShare;
                        item.Quantity = item.Quantity;
                        item.ServiceCategoryId = item.ServiceCategoryId;
                        item.ServiceGroupId = item.ServiceGroupId;
                        item.ServiceSubCategoryId = item.ServiceSubCategoryId;
                        item.ReferalShare = 0;
                        item.CancelReason = 0;
                        item.CancelledBy = 0;
                        item.Comments = '';
                        item.PatientBillStatusId = $scope.item.PatientBillStatusId;
                        item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
                        item.AliasId = item.AliasId || null;
                        item.AliasName = item.AliasName || null;
                        result.push(item);
                    }
                    else
                        isValid = false;
                }
            }
            return { Details: result, isValid: isValid };
        }

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.PatientBillDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.PatientBillDetails[lastIndex].ServiceId == -1)
                    return false;
            }
            var PatientBillDetails = {
                RdoDiscountMode: true,
                RdoDiscount: true,
                Id: 0,
                ServiceId: -1,
                ServiceCode: '',
                ServiceName: '',
                RequestDate: null,
                TestId: - 1,
                TestCode: '',
                TestName: '',
                TestDescription: '',
                DepartmentId: -1,
                SubDepartmentId: -1,
                BillDateTime: utl.Formatter.getCurrentDate(),
                IsPackage: false,
                ServiceTypeId: -1,
                Quantity: 1,
                Rate: 0,
                Amount: 0.00,
                DiscountAmount: 0,
                DiscountModeId: -1,
                GSTAmount: 0,
                TaxCode: 'ES',
                NetAmount: 0.00,
                DiscountTypeId: -1,
                IsOrderable: 0,
                ServiceCategoryId: 0,
                ServiceGroupId: 0,
                ServiceSubCategoryId: 0,
                MasterTypeId: -1,
                MasterItemId: -1,
                MasterName: '',
                Status: 1,
                tabindex: 1,
                AliasId: null,
                AliasName: null,
            };

            if ($scope.currentcontext.id > 0) {
                PatientBillDetails.PatientBillId = $scope.currentcontext.id;
            }

            $scope.PatientBillDetails.push(PatientBillDetails);

            $scope.SelectedIndex = $scope.PatientBillDetails.length;
        };

        $scope.addNewLineItem();

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.calcAmt(0, item);
        };

        $scope.deleteDetail = function (idx, item) {
            item.index = idx;
            var lastindex = $scope.PatientBillDetails.length - 1;
            if (item.ServiceId != -1 || null) {
                var name = item.ServiceId || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }
        };

        vm.itemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Item Rate', field: 'ItemRate', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasterForBillModifications',
            formatdisplay: formatselecteditem,
            presearch: presearchitem,
            postsearch: postsearchitem
        };

        function formatselecteditem() {
            var selectedItem = vm.itemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.itemcontrolconfig.rowdata) {
                result = [vm.itemcontrolconfig.rowdata.ItemCode, vm.itemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        };

        function presearchitem() {
            var query = vm.itemcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 },
                    { Key: 7, Value: 1 },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.itemcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.itemcontrolconfig.searchparams = inputData;
        };

        function postsearchitem() {
            for (var idx in vm.itemcontrolconfig.result) {
                var item = vm.itemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                item.ItemRate = item.MrPrice;
                item.DoctorShare = 0;
                item.AliasId = 0;
                item.AliasName = '';
            }
        };

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'ServiceCategory') {
                    for (var scidx in $scope.lookup.ServiceCategory) {
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'DRUG') {
                            $scope.DrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.DrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'NONDRUG') {
                            $scope.NonDrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.NonDrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                    }
                }
            });
            $scope.patientChange();
            $scope.getEncounters();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Department" },
                { "Key": "ServiceCategory" }
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

    IPBillingNewDrugsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();