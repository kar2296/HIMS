(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacybillmodifyController', PharmacybillmodifyController);

    function PharmacybillmodifyController($scope, $timeout, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        var savehitcompleted = 0;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext.CanPharmacyBillcorrection_Update = utl.Privilege.hasAccess('CanPharmacyBillcorrection_Update');

        $scope.isCancelled = false;
        $scope.CanShowInsAmt = false;
        $scope.CanShowNetAmt = true;
        $scope.CanShowPackData = false;
        $scope.item = {
            BillDateTime: utl.Formatter.getCurrentDate(),
            BillPriorityId: 1,
            isEditable: true
        };
        $scope.PatientBillDetails = [];
        $scope.PatientPaymentDetails = [];
        $scope.zerostocksales = 0;
        $scope.currentfilter = {
            // FromDate:utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.currentfilter.ServiceCategoryId = -1;
        $scope.currentcontext = {};
        $scope.currentcontext.eid = parseFloat($stateParams.id);
        $scope.Islocked = $scope.$parent.Islocked;
        $scope.ReceivedAmt = $scope.$parent.ReceivedAmt;
        $scope.item.TotalRefundAmount = $scope.$parent.TotalRefundAmount;
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.selectedPatient.Id
                },
                confirmCallback: $scope.getItem
            });
        }
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }

        $scope.patientChange = function () {

            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };

                utl.Http.doAction(options);
            }
        };
        $scope.isdateChanged = function (index, item, ismodified) {
            var dateformat = "YYYY-MM-DD";
            var from = new moment(moment(item.BillDateTime).format(dateformat));
            var to = new moment(moment($scope.currentfilter.FromDate).format(dateformat));

            var timecheck = from < to;
            console.log(timecheck);
            if (timecheck) {
                utl.Alert.showErrorMsg('Date Should not be less than Admission Date');
                item.BillDateTime = item.OrigDate;
                // $scope.getDetails();
                // return false;
            }
            item.IsAutoBillModified = ismodified;
        }
        $scope.isnonmedical = function (index, item, ismodified) {
            item.OldNetPat = item.PatNetAmount;
            item.OldNetIns = item.InsNetAmount;
            if (item.IsSupplementary == true) {
                item.PatNetAmount = item.NetAmount;
                item.InsNetAmount = parseFloat(item.NetAmount || 0) - parseFloat(item.PatNetAmount || 0);
                if (item.IsPharmacySale) {
                    $scope.item.NetInsuranceAmount = $scope.item.NetInsuranceAmount - parseFloat(item.OldNetIns || 0);
                }
                if (item.IsPharmacyReturn) {
                    $scope.item.NetInsuranceAmount = $scope.item.NetInsuranceAmount;
                }
                $scope.item.NetPatientAmount += parseFloat(item.PatNetAmount || 0) - parseFloat(item.OldNetPat || 0);
                item.isSupplm = false;
            }
            if (item.IsSupplementary == false) {
                item.PatNetAmount = item.NetAmount * ($scope.item.CoPayPercent / 100);;
                item.InsNetAmount = parseFloat(item.NetAmount || 0) - parseFloat(item.PatNetAmount || 0);
                item.isSupplm = true;
                $scope.item.NetInsuranceAmount += parseFloat(item.OldNetIns || 0) + parseFloat(item.InsNetAmount || 0);
                $scope.item.NetPatientAmount = $scope.item.NetPatientAmount - (parseFloat(item.OldNetPat || 0) - parseFloat(item.PatNetAmount || 0));
            }

            item.IsAutoBillModified = ismodified;
            item.IsInclusionItem = false;
            item.IsExclusionItem = false;
        };

        // $scope.CalNamt = function (index, item) {
        //     if (!parseFloat(item.InsNetAmount)) {
        //         item.PatNetAmount = 0;
        //     }
        //     if (parseFloat(item.InsNetAmount) >= 0) {
        //         item.PatNetAmount = parseFloat(item.NetAmount || 0) - parseFloat(item.InsNetAmount || 0);
        //     }
        //     if (parseFloat(item.PatNetAmount) > 0) {
        //         item.IsPartialSupplemetary = true;
        //     }
        //     if (item.InsNetAmount > item.NetAmount) {
        //         utl.Alert.showErrorMsg('Amount Should not exceed NetAmount');
        //         return false;
        //     }
        //     // $scope.CalcInsAmt();
        // };
        $scope.calcFinaldue = function (item) {
            if (item.CreditNote > 0) {
                $scope.currentcontext.FinalDue = item.BillAmount - (item.BillDiscount + ($scope.ReceivedAmt || 0)) - parseFloat(item.CreditNote);
            }
        }
        // $scope.CalcInsAmt = function () {
        //     var iteminsamt = 0;
        //     var itempatamt = 0;
        //     for (var ndx in $scope.PatientBillDetails) {
        //         var detailData = $scope.PatientBillDetails[ndx];
        //         if (detailData.IsSupplementary) {
        //             iteminsamt = iteminsamt + parseFloat(detailData.InsNetAmount || 0);
        //         } else {
        //             iteminsamt = iteminsamt + parseFloat(detailData.NetAmount || 0);
        //         }
        //         itempatamt = itempatamt + parseFloat(detailData.PatNetAmount || 0);
        //     }
        //     $scope.item.TotalInsAmt = iteminsamt;
        //     $scope.item.TotalPatAmt = itempatamt;
        // }

        $scope.canEditable = function (index, item, ismodified) {
            if (item) {
                item.IsAutoBillModified = ismodified;
            }
            if (index == 'line') {
                $scope.item.isEditable = false;
                $scope.calcAmt();
            } else {
                $scope.PatientBillDetails.forEach((val, idx) => {
                    val.isEditable = $scope.item.isEditable;
                });
            }
        };

        $scope.IfNonmed = function () {
            for (var mdx in $scope.PatientBillDetails) {
                var Billdet = $scope.PatientBillDetails[mdx];
                if (Billdet.IsSupplementary) {
                    if (Billdet.InsNetAmount > 0) {
                        Billdet.InsNetAmount = Billdet.InsNetAmount;
                    }
                }
            }
        }
        $scope.calcItem = function (index, item, docsharechanges, IsAutoBillModified) {
            item.IsAutoBillModified = IsAutoBillModified;
            var NetAmount = item.Rate * item.Quantity;
            if (item.DiscountAmount > NetAmount) {
                utl.Alert.showErrorMsg('Amount Should Not Exceed Item Cost');
                return false;
            }
            item.isdoctorsharechanged = docsharechanges;
            if (docsharechanges != 1) {
                if (!item.EligiblePercentage) item.EligiblePercentage = 0;
                if (!item.SharePercentage) item.SharePercentage = 0;
                if (!item.DoctorShareActual) item.DoctorShareActual = 0;
                if (!item.DoctorShare) item.DoctorShare = 0;
                if (!item.DoctorShareDisc) item.DoctorShareDisc = 0;
                if (!item.DrTaxAmount) item.DrTaxAmount = 0;
                if (!item.DiscountAmount) item.DiscountAmount = 0;

                var amt = (parseFloat(item.Quantity) * parseFloat(item.Rate));
                var netamt = (parseFloat(item.Quantity) * parseFloat(item.Rate)) - parseFloat(item.DiscountAmount);

                if (!item.IsPackageItem && parseFloat(item.DiscountAmount) >= 0 && item.EligiblePercentage > 0) {
                    try {
                        var EligiblePerAmount = amt * (item.EligiblePercentage / 100);
                        var SharePerAmount = 0;
                        if (item.SharePercentage == 0) {
                            SharePerAmount = (EligiblePerAmount / 100) * item.ShareAmount;
                        } else {
                            SharePerAmount = EligiblePerAmount * (item.SharePercentage / 100);
                        }
                        item.DoctorShareActual = parseFloat(SharePerAmount).toFixed(2);
                    } catch (ex) { }
                    item.DoctorShareActual = parseFloat(item.DoctorShareActual) + parseFloat(item.DrTaxAmount);
                    try {
                        var EligiblePerAmount = netamt * (item.EligiblePercentage / 100);
                        var SharePerAmount = 0;
                        if (item.SharePercentage == 0) {
                            SharePerAmount = (EligiblePerAmount / 100) * item.ShareAmount;
                        } else {
                            SharePerAmount = EligiblePerAmount * (item.SharePercentage / 100);
                        }
                        item.DoctorShare = parseFloat(SharePerAmount).toFixed(2);
                    } catch (ex) { }
                    item.DoctorShare = parseFloat(item.DoctorShare) + parseFloat(item.DrTaxAmount);
                    item.DoctorShareDisc = item.DoctorShareActual - item.DoctorShare;
                    item.DoctorShareActual = parseFloat(item.DoctorShareActual).toFixed(2);
                    item.DoctorShare = parseFloat(item.DoctorShare).toFixed(2);
                    item.DoctorShareDisc = parseFloat(item.DoctorShareDisc).toFixed(2);
                }
            } else {
                item.isdoctorsharechanged = docsharechanges;
            }
            if (item.DoctorShare > NetAmount) {
                utl.Alert.showErrorMsg('Amount Should Not Exceed Item Cost');
                return false;
            }
            item.NetAmount = NetAmount;
            item.GrossAmount = NetAmount;
            if (item.DiscountAmount == undefined || isNaN(item.DiscountAmount) || item.DiscountAmount == null) {
                item.DiscountAmount = 0;
            }
            item.DoctorShare = parseFloat(item.DoctorShare);
            if (item.DoctorShare == undefined || isNaN(item.DoctorShare) || item.DoctorShare == null) {
                item.DoctorShare = parseFloat(0).toFixed(2);
            }

            $scope.calcAmt();
        }

        $scope.showHistory = function (bill) {
            // if ($scope.item.EncounterId) {
            utl.Modal.open('app.showHistory', {
                params: {
                    bill: bill
                },
                // confirmCallback: $scope.cancelCallback
            });
            // }
        };

        $scope.cancelbillCallback = function (item) {
            console.log(item.index);
            console.log(item.data);
            $scope.PatientBillDetails[item.index].PatientBillStatusId = item.data.PatientBillStatusId;
            $scope.PatientBillDetails[item.index].CancelReason = item.data.CancelReason;
            $scope.PatientBillDetails[item.index].isEditable = false;
            $scope.PatientBillDetails[item.index].CancelledBy = utl.Session.getCurrentUserId();

            $scope.calcAmt();
        };

        $scope.applyCancel = function (index, item) {
            // if ($scope.item.EncounterId) {
            utl.Modal.open('app.applycancel', {
                params: {
                    eid: $scope.item.EncounterId,
                    bill: item,
                    index: index
                },
                confirmCallback: $scope.cancelbillCallback
            });
            // }
        };

        $scope.enableDiscount = function () {
            // if ($scope.item.EncounterId) {
            utl.Modal.open('app.applydiscount', {
                params: {
                    eid: $scope.item.EncounterId
                },
                confirmCallback: $scope.applyDiscount
            });
            // }
        };

        $scope.applyDiscount = function (data) {

            var discountMode = data.DiscountModeId;
            var discountValue = data.BillDiscount;


            console.log(data.BillDiscount);
            $scope.PatientBillDetails.forEach((val, idx) => {
                if (val.isEditable) {
                    if (discountMode == 1) {
                        val.DiscountAmount = data.BillDiscount;
                    } else {
                        var amount = (parseFloat(val.Quantity) * parseFloat(val.Rate));

                        val.DiscountAmount = ((amount * discountValue) / (100));
                    }
                    val.Remarks = data.Remarks;
                } else {
                    // val.DiscountAmount = 0;
                }
            });
            $scope.calcAmt();
        };

        $scope.calcAmt = function () {
            $scope.item.BillAmount = 0;
            $scope.item.BillDiscount = 0;
            $scope.item.GSTAmount = 0;
            $scope.TotalNet = 0;
            $scope.item.NetInsuranceAmount = 0;
            $scope.item.NetPatientAmount = 0;
            $scope.item.AgreementDiscountAmt = 0;
            $scope.PatientBillDetails.forEach((val, idx) => {
                if (val.isEditable) {
                    val.Amount = parseFloat(val.Quantity) * parseFloat(val.Rate);
                    val.GrossAmount = parseFloat(val.Quantity) * parseFloat(val.Rate);
                    $scope.item.BillAmount = parseFloat($scope.item.BillAmount) + parseFloat(val.GrossAmount);
                    var drshramt = val.DoctorShare;
                    if (val.isdoctorsharechanged != 1) {
                        if (!val.EligiblePercentage) val.EligiblePercentage = 0;
                        if (!val.SharePercentage) val.SharePercentage = 0;
                        if (!val.DoctorShareActual) val.DoctorShareActual = 0;
                        if (!val.DoctorShare) val.DoctorShare = 0;
                        if (!val.DoctorShareDisc) val.DoctorShareDisc = 0;
                        if (!val.DrTaxAmount) val.DrTaxAmount = 0;
                        if (!val.DiscountAmount) val.DiscountAmount = 0;

                        var amt = (parseFloat(val.Quantity) * parseFloat(val.Rate));
                        var netamt = (parseFloat(val.Quantity) * parseFloat(val.Rate)) - parseFloat(val.DiscountAmount);

                        if (!val.IsPackageItem && parseFloat(val.DiscountAmount) >= 0 && val.EligiblePercentage > 0) {
                            try {
                                var EligiblePerAmount = amt * (val.EligiblePercentage / 100);
                                var SharePerAmount = 0;
                                if (val.SharePercentage == 0) {
                                    SharePerAmount = (EligiblePerAmount / 100) * val.ShareAmount;
                                } else {
                                    SharePerAmount = EligiblePerAmount * (val.SharePercentage / 100);
                                }
                                val.DoctorShareActual = parseFloat(SharePerAmount).toFixed(2);
                            } catch (ex) { }
                            val.DoctorShareActual = parseFloat(val.DoctorShareActual) + parseFloat(val.DrTaxAmount);
                            try {
                                var EligiblePerAmount = netamt * (val.EligiblePercentage / 100);
                                var SharePerAmount = 0;
                                if (val.SharePercentage == 0) {
                                    SharePerAmount = (EligiblePerAmount / 100) * val.ShareAmount;
                                } else {
                                    SharePerAmount = EligiblePerAmount * (val.SharePercentage / 100);
                                }
                                val.DoctorShare = parseFloat(SharePerAmount).toFixed(2);
                            } catch (ex) { }
                            val.DoctorShare = parseFloat(val.DoctorShare) + parseFloat(val.DrTaxAmount);
                            val.DoctorShareDisc = val.DoctorShareActual - val.DoctorShare;
                            val.DoctorShareActual = parseFloat(val.DoctorShareActual).toFixed(2);
                            val.DoctorShare = parseFloat(val.DoctorShare).toFixed(2);
                            val.DoctorShareDisc = parseFloat(val.DoctorShareDisc).toFixed(2);
                        }
                    }
                    if (drshramt != val.DoctorShare) {
                        val.DoctorShare = drshramt;
                    }
                    val.NetAmount = (parseFloat(val.Quantity) * parseFloat(val.Rate)) - parseFloat(val.DiscountAmount) - parseFloat(val.AgreementDiscountAmt || 0);
                    if (val.DiscountAmount > 0 || val.AgreementDiscountAmt > 0) {
                        if (val.IsAutoBillModified) {
                            if ($scope.CanShowInsAmt) {
                                // val.NetAmountBfreDisc = (parseFloat(val.Quantity) * parseFloat(val.Rate)) + parseFloat(val.GSTAmount || 0);//comment by jothi on 4/5/2024
                                val.NetAmountBfreDisc = (parseFloat(val.Quantity) * parseFloat(val.Rate));
                                if ($scope.item.CoPayPercent > 0) {
                                    val.PatNetAmountBfrDisc = val.NetAmountBfreDisc * ($scope.item.CoPayPercent / 100);
                                } else {
                                    val.PatNetAmountBfrDisc = val.NetAmountBfreDisc;
                                }

                                val.PatNetAmount = parseFloat(val.PatNetAmountBfrDisc) - parseFloat(val.DiscountAmount) - parseFloat(val.AgreementDiscountAmt || 0);
                                if ($scope.item.CoPayPercent > 0) {
                                    val.InsNetAmount = val.NetAmountBfreDisc - (val.NetAmountBfreDisc * ($scope.item.CoPayPercent / 100));
                                } else {
                                    if (val.IsSupplementary == false)
                                        val.InsNetAmount = val.NetAmountBfreDisc;
                                }

                            } else {
                                val.PatNetAmount = parseFloat(val.PatNetAmount).toFixed(2);
                                val.InsNetAmount = parseFloat(val.InsNetAmount).toFixed(2);
                            }
                        } else {
                            val.PatNetAmount = 0;
                            val.InsNetAmount = 0;
                        }
                    } else {
                        if ($scope.CanShowInsAmt) {
                            if (val.IsSupplementary) {
                                val.PatNetAmount = parseFloat(val.PatNetAmount).toFixed(2);
                                val.InsNetAmount = parseFloat(val.InsNetAmount).toFixed(2);
                            } else {
                                val.PatNetAmount = parseFloat(val.NetAmount * ($scope.item.CoPayPercent / 100)).toFixed(2);
                                val.InsNetAmount = parseFloat(val.NetAmount - val.PatNetAmount).toFixed(2);
                            }
                        } else {
                            val.PatNetAmount = 0;
                            val.InsNetAmount = 0;
                        }
                    }
                    // if (val.IsSupplementary == true && val.PatNetAmount > 0) {
                    //     val.PatNetAmount = parseFloat(val.Quantity) * parseFloat(val.Rate) - parseFloat(val.InsNetAmount) - parseFloat(val.DiscountAmount);
                    // } else if (val.IsSupplementary == true && (!val.PatNetAmount || val.PatNetAmount == 0)) {
                    //     val.InsNetAmount = parseFloat(val.Quantity) * parseFloat(val.Rate) - parseFloat(val.DiscountAmount);
                    // }
                    $scope.TotalNet += val.NetAmount;
                    $scope.item.AgreementDiscountAmt += parseFloat(val.AgreementDiscountAmt || 0);
                    $scope.item.BillDiscount += parseFloat(val.DiscountAmount);
                    $scope.item.GSTAmount += parseFloat(val.GSTAmount || 0);
                    $scope.item.NetInsuranceAmount += parseFloat(val.InsNetAmount || 0);
                    $scope.item.NetPatientAmount += parseFloat(val.PatNetAmount || 0);
                }

            });
            // $scope.CalcInsAmt();
        };

        $scope.ServiceCategoryChange = function (ServiceCategory) {
            if (ServiceCategory && ServiceCategory.Id > 0) {
                for (var i = 0; i < $scope.PatientBillDetails.length; i++) {
                    if ($scope.PatientBillDetails[i].ServiceCategoryId == ServiceCategory.Id) {
                        $scope.PatientBillDetails[i].CategoryShow = true;
                    } else {
                        $scope.PatientBillDetails[i].CategoryShow = false;
                    }
                }
            } else {
                for (var i = 0; i < $scope.PatientBillDetails.length; i++) {
                    $scope.PatientBillDetails[i].CategoryShow = true;
                }
            }
        }

        $scope.getEncounterCallback = function (scope, data, options, hasError) {
            $scope.Encounter = data;
            if (data.GuarantorTypeId > 1) {
                $scope.CanShowInsAmt = true;
                $scope.CanShowNetAmt = true;
            }
            if (data.IsPackageAssigned == true) {
                $scope.CanShowPackData = true;
            }
            $scope.item.PatientId = $scope.Encounter.PatientId;
            $scope.currentfilter.FromDate = $scope.Encounter.AdmissionDate;
            $scope.item.CoPayPercent = $scope.Encounter.Guarantor.CoPayPercent;
            $scope.getDetails();
        };

        $scope.getEncounters = function () {
            if ($scope.currentcontext.eid) {
                var options = {
                    action: 'Visit/Visit/GetEncounterById',
                    data: {
                        Id: $scope.currentcontext.eid
                    },
                    type: 'post',
                    onComplete: $scope.getEncounterCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.oppharmcy = function () {
            utl.Modal.open('app.oppharmacybills', {
                params: {
                    eid: $scope.currentcontext.eid,
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.otregister = function () {
            utl.Modal.open('patientemr.otregisters', {
                params: {
                    eid: $scope.currentcontext.eid,
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.PatientBillDetails = [];
            for (var idx in res.Data) {
                var billdetail = res.Data[idx];
                if (billdetail.IsPharmacySale || billdetail.IsPharmacyReturn) {
                    billdetail.IsAutoBillModified = true;
                    billdetail.Rate = billdetail.Rate.toFixed(2);
                    var orig_date = billdetail.BillDateTime;
                    billdetail.OrigDate = orig_date;
                    $scope.PatientBillDetails.push(billdetail);
                }
            };
            // $scope.PatientBillDetails = res.Data;
            $scope.item.isEditable = true;
            $scope.PatientBillDetails.forEach((v, i) => {
                v.isdoctorsharechanged = 0;
                if (!v.IsSupplementary) {
                    v.isSupplm = true;
                }
                if (v.IsSupplementary) {
                    v.isSupplm = false;
                    v.IsExclusionItem = false;
                    v.IsInclusionItem = false;
                    if (v.InsNetAmount > 0) {
                        v.NetAmount = v.InsNetAmount;
                    }
                }
                v.CategoryShow = true;
                if (v.PatientBillStatusId == 3) {
                    v.isEditable = true;
                } else {
                    v.isEditable = false;
                }
                if (v.Rate == 0 && v.IPBillDetailId) {
                    v.isEditable = false;
                    v.isCompleted = true;
                }
            });
            $scope.calcAmt();
            $scope.IfNonmed();
            // $scope.CalcInsAmt();
        };

        $scope.getDetails = function () {
            // var FromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    EncounterId: $scope.currentcontext.eid,
                    FromDate: $scope.currentfilter.FromDate,
                    ToDate: $scope.currentfilter.ToDate,
                    ServiceId: $scope.currentfilter.ServiceId
                }
                // Params: [{
                //         Key: 3,
                //         Value: $scope.currentcontext.eid
                //     },
                //     {
                //         Key: 6,
                //         Value: $scope.currentfilter.FromDate
                //     },
                //     {
                //         Key: 7,
                //         Value: $scope.currentfilter.ToDate
                //     },
                //     {
                //         Key: 28,
                //         Value: $scope.currentfilter.ServiceId
                //     },
                //     {
                //         Key: 12,
                //         Value: true
                //     },
                // ],
                // PageContext: {
                //     PageSize: 500000,
                //     PageNumber: 1
                // }
            };

            var options = {
                action: 'Billing/PatientBillDetails/GetPharmacyBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDetailsCallback
            };
            utl.Http.doAction(options);
        };


        $scope.selectAllIncItems = function () {
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                if ($scope.currentcontext.selectallinc == true) {
                    item.IsInclusionItem = true;
                    item.IsExclusionItem = false;
                    item.IsAutoBillModified = true;
                }
                if ($scope.currentcontext.selectallinc == false) {
                    item.IsInclusionItem = false;
                    item.IsExclusionItem = false;
                    item.IsAutoBillModified = true;
                }
            }
        }
        $scope.selectAllExcItems = function () {
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                if ($scope.currentcontext.selectallexc == true) {
                    item.IsInclusionItem = false;
                    item.IsExclusionItem = true;
                    item.IsAutoBillModified = true;
                }
                if ($scope.currentcontext.selectallexc == false) {
                    item.IsInclusionItem = false;
                    item.IsExclusionItem = false;
                    item.IsAutoBillModified = true;
                }
            }
        }

        $scope.disableExclusion = function (idx, bill) {
            if (bill.IsInclusionItem) {
                $scope.PatientBillDetails[idx].IsExclusionItem = false;
            } else {
                $scope.PatientBillDetails[idx].IsExclusionItem = true;
            }
        };
        $scope.disableInclusion = function (idx, bill) {
            if (bill.IsExclusionItem) {
                $scope.PatientBillDetails[idx].IsInclusionItem = false;
            } else {
                $scope.PatientBillDetails[idx].IsInclusionItem = true;
            }
        };
        if ($scope.zerostocksales == 1) {
            vm.pharmacyitemcontrolconfig = {
                query: '',
                searchbyid: false,
                options: [{
                    header: 'Item Code',
                    field: 'ItemCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Item Name',
                    field: 'ItemName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                /*
                {
                    header: 'Product Type Name',
                    field: 'ProductTypeName',
                    datatype: 'string',
                    headercls: 'td-producttypename',
                    fieldcls: 'td-producttypename'
                },
                */
                // {
                //     header: 'Generic Name',
                //     field: 'GenericName',
                //     datatype: 'string',
                //     headercls: 'td-genericname',
                //     fieldcls: 'td-genericname'
                // },
                /*
                {
                    header: 'Manufacturer Name',
                    field: 'ManufacturerName',
                    datatype: 'string',
                    headercls: 'td-manufacturername',
                    fieldcls: 'td-manufacturername'
                },
                */
                // {
                //     header: 'Claim',
                //     field: 'Claimable',
                //     datatype: 'string',
                //     headercls: 'td-claimable',
                //     fieldcls: 'td-claimable'
                // },
                // {
                //     header: 'Rack Name',
                //     field: 'RackName',
                //     datatype: 'string',
                //     headercls: 'td-rackname',
                //     fieldcls: 'td-rackname'
                // },
                {
                    header: 'Stock-In-Hand',
                    field: 'StockInHand',
                    datatype: 'string',
                    headercls: 'td-stockinhand',
                    fieldcls: 'td-stockinhand'
                },
                {
                    header: 'Sales Price',
                    field: 'MrPrice',
                    datatype: 'string',
                    headercls: 'td-mrprice',
                    fieldcls: 'td-mrprice'
                }
                ],
                searchparams: {},
                result: {},
                api: 'pharmacy/itemmaster/GetPharmacyStoreItemsForNonZero',
                formatdisplay: formatselectedpharmacyitem,
                presearch: presearchpharmacyitem,
                postsearch: postsearchpharmacyitem
            };
        } else if ($scope.zerostocksales == 0) {
            vm.pharmacyitemcontrolconfig = {
                query: '',
                searchbyid: false,
                options: [{
                    header: 'Item Code',
                    field: 'ItemCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Item Name',
                    field: 'ItemName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                /*
                {
                    header: 'Product Type Name',
                    field: 'ProductTypeName',
                    datatype: 'string',
                    headercls: 'td-producttypename',
                    fieldcls: 'td-producttypename'
                },
                */
                // {
                //     header: 'Generic Name',
                //     field: 'GenericName',
                //     datatype: 'string',
                //     headercls: 'td-genericname',
                //     fieldcls: 'td-genericname'
                // },
                /*
                {
                    header: 'Manufacturer Name',
                    field: 'ManufacturerName',
                    datatype: 'string',
                    headercls: 'td-manufacturername',
                    fieldcls: 'td-manufacturername'
                },
                */
                // {
                //     header: 'Claim',
                //     field: 'Claimable',
                //     datatype: 'string',
                //     headercls: 'td-claimable',
                //     fieldcls: 'td-claimable'
                // },
                // {
                //     header: 'Rack Name',
                //     field: 'RackName',
                //     datatype: 'string',
                //     headercls: 'td-rackname',
                //     fieldcls: 'td-rackname'
                // },
                {
                    header: 'Stock-In-Hand',
                    field: 'StockInHand',
                    datatype: 'string',
                    headercls: 'td-stockinhand',
                    fieldcls: 'td-stockinhand'
                },
                {
                    header: 'Sales Price',
                    field: 'MrPrice',
                    datatype: 'string',
                    headercls: 'td-mrprice',
                    fieldcls: 'td-mrprice'
                }
                ],
                searchparams: {},
                result: {},
                api: 'pharmacy/itemmaster/GetPharmacyStoreItems',
                formatdisplay: formatselectedpharmacyitem,
                presearch: presearchpharmacyitem,
                postsearch: postsearchpharmacyitem
            };
        }

        function formatselectedpharmacyitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.pharmacyitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName, selectedItem.ItemCode].join(' ');
            } else if (vm.pharmacyitemcontrolconfig.rowdata) {
                result = [vm.pharmacyitemcontrolconfig.rowdata.ItemName, vm.pharmacyitemcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchpharmacyitem() {
            var query = vm.pharmacyitemcontrolconfig.query;
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.StoreMasterId
                },
                // {
                //     Key: 8,
                //     Value: $scope.currentfilter.StoreTypeId
                // },
                {
                    Key: 12,
                    Value: TodayDate
                },
                {
                    Key: 13,
                    Value: 1
                },
                {
                    Key: 15,
                    Value: 1
                }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.pharmacyitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.pharmacyitemcontrolconfig.searchparams = inputData;
        }

        function postsearchpharmacyitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.pharmacyitemcontrolconfig.result) {
                var item = vm.pharmacyitemcontrolconfig.result[idx];
                var SerialItems = null;
                var SerialQuantity = 0;
                item.ItemCode = '(' + item.ItemCode + ')';
                item.ItemName = item.ItemName;
                /*
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                */
                if (item.ItemMaster) {
                    item.GenericName = item.ItemMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                /*
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                */
                /*
                item.ManufacturerName = item.ManufacturerName;
                */
                /*
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                */
                item.RackName = item.RackName;
                if (item.ItemMaster.StockItem !== null) {
                    if (item.ItemMaster.StockItem &&
                        item.ItemMaster.StockItem.StockSerialItems.length > 0) {
                        SerialItems = item.ItemMaster.StockItem.StockSerialItems;
                        for (var batid = 0; batid < SerialItems.length; batid++) {
                            SerialQuantity = SerialQuantity + SerialItems[batid].Quantity;
                        }
                    }
                    item.StockInHand = SerialQuantity;
                } else {
                    item.StockInHand = 0;
                }
                item.MrPrice = item.ItemMaster.MrPrice;
                item.IsNonClaimable = item.ItemMaster.IsNonClaimable;
                if (item.IsNonClaimable == false) {
                    item.Claimable = 'Y'
                } else {
                    item.Claimable = 'N'
                }
            }
        }

        $scope.completeBill = function () {
            /*
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.billing-details.confirmmodify.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
            */
            $scope.saveItem();
        };
        $scope.backToList = function () {
            if ($scope.item.AdmissionStatusId == 6) {
                $state.go('app.discharged-patients');
            } else {
                $state.go('app.ipbillingtab.summary');
            }
        };
        $scope.labresult = function () {
            utl.Modal.open('patientemr.labresults', {
                params: {
                    eid: $scope.currentcontext.eid,
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.radiologyresult = function () {
            utl.Modal.open('patientemr.radiologyresults', {
                params: {
                    eid: $scope.currentcontext.eid,
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            $scope.currentfilter.ToDate = new Date();
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getDetails();
        };

        /* Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function (SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.saveItem();
        };
        $scope.securitydialogopened = false;
        $scope.securitypindiagCallback = function () {
            $scope.securitydialogopened = false;
        };
        $scope.securitypincheck = function () {
            if ($scope.requiredsecuritypin) {
                if (!$scope.securitydialogopened) {
                    $scope.securitydialogopened = true;
                    utl.Modal.open('app.securitypincheck', {
                        params: {},
                        confirmCallback: $scope.SecurityPINChkCallback,
                        cancelCallback: $scope.securitypindiagCallback
                    });
                }
                return false;
            }
        };
        /* Security IsValid */

        $scope.saveItem = function () {

            if (savehitcompleted == 1) return;

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */

            $scope.PatientBillDetails.forEach((details, idx) => {
                if (!details.isEditable) {
                    details.PatientBillStatusId = 2;
                    details.CancelledBy = utl.Session.getCurrentUserId();
                } else
                    details.PatientBillStatusId = 3;
            });
            $scope.PatientBillDetailslines = [];
            for (var idx in $scope.PatientBillDetails) {
                var items = $scope.PatientBillDetails[idx];
                if (items.IsAutoBillModified) {
                    $scope.PatientBillDetailslines.push(items);
                }
            }

            savehitcompleted = 1;
            if ($scope.CanShowPackData == true) {
                var actionName = 'billing/PatientbillDetails/UpdateInsuranceBill';
                var options = {
                    action: actionName,
                    data: $scope.PatientBillDetailslines,
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            } else {
                var actionName = 'billing/PatientbillDetails/UpdateInsuranceBill';
                var options = {
                    action: actionName,
                    data: $scope.PatientBillDetailslines,
                    // data: $scope.PatientBillDetails,
                    type: 'post',
                    onComplete: $scope.updateBillSummary
                };
                utl.Http.doAction(options);
            }
        };

        $scope.updateBillSummary = function () {
            var options = {
                action: 'billing/PatientBillSummary/UpdateBillSummary',
                data: {
                    Data: {
                        lines: $scope.PatientBillDetails,
                        guarantortype: $scope.CanShowInsAmt
                    },
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Service Code',
                field: 'ServiceCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Service Name',
                field: 'ServiceName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'ServiceItem Rate',
                field: 'ServiceItemRate',
                datatype: 'string',
                headercls: 'td-rate',
                fieldcls: 'td-rate'
            }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceCode, selectedItem.ServiceName].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 2
                },],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
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

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                if (item.ServiceItemTariffDetails && item.ServiceItemTariffDetails.length > 0)
                    item.ServiceItemRate = item.ServiceItemTariffDetails[0].Rate;
            }
        }

        $scope.CheckFinalizeCallback = function (scope, res, options, hasError) {
            $scope.BillFinalized = false;
            if (res.Data.length > 0)
                $scope.BillFinalized = true;
            $scope.IsDisabled = $scope.Islocked || $scope.BillFinalized ? true : false;
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
                    Value: $scope.currentcontext.eid
                },
                {
                    Key: 21,
                    Value: true
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

        $scope.previousOrders = function () {
            utl.Modal.open('app.previousorders', {
                params: {
                    eid: $scope.currentcontext.eid,
                    pid: $scope.item.PatientId
                }
            });
        };

        $scope.ipbillingprofiles = function () {
            if (!$scope.IsDisabled) {
                utl.Modal.openFixedDialog('app.ipbillingprofiledetails', {
                    params: {
                        id: $scope.currentcontext.eid,
                        pid: $scope.item.PatientId,
                        bid: 0,
                        status: null,
                        billtotal: $scope.TotalNet
                    },
                    confirmCallback: $scope.getAddedDetails
                });
            } else {
                var msg = '';
                msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        };

        $scope.getAddedDetails = function () {
            $timeout(function () {
                $scope.currentfilter.FromDate = null;
                $scope.currentfilter.ToDate = null;
                $scope.getDetails();
            }, 1000);
        };

        $scope.print2 = function () {
            var inputData = {
                Id: $scope.currentcontext.eid,
                Data: {
                    isFinalized: $scope.BillFinalized
                }
            };
            var options = {
                action: 'billing/patientbills/PrintInpatientBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.eid,
                Data: {
                    isFinalized: $scope.BillFinalized
                }
            };
            var options = {
                action: 'billing/PatientBillSummary/PrintPatientBillSummary',
                data: inputData,

                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {

        };

        $scope.excelDownload = function () {
            var FromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    EncounterId: $scope.currentcontext.eid,
                    FromDate: FromDate,
                    ToDate: ToDate,
                    fileName: $scope.currentcontext.eid + '-IPPHARMACYBILLS' + '.xls',
                    IsPharmacyCredit: 1
                }
            };
            var options = {
                action: "Billing/PatientBillDetails/ExcelPatientBillDetails",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            // utl.Http.doAction(options);
            utl.Http.doDownloadXslFile(options);
        };
        $scope.getFacInfoCallbck = function (scope, data, options, hasError) {

            $scope.item.IsDoctorShare = data.IsDoctorShare;
            $scope.ShowDoctorShare = false;
            if (data.IsDoctorShare) {
                $scope.ShowDoctorShare = true;
            }
            $scope.item.IsVAT = data.IsVAT;
            $scope.ShowVAT = false;
            if (data.IsVAT) {
                $scope.ShowVAT = true;
            }
        };

        $scope.getFacInfo = function () {
            var options = {
                action: 'SystemSettings/facility/GetFacilityById',
                data: {
                    Id: utl.Session.getCurrentFacilityId()
                },
                type: 'post',
                onComplete: $scope.getFacInfoCallbck
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data
            $scope.getEncounters();

            $scope.CheckFinalize();
            $scope.getFacInfo();
        };

        $scope.initLookup = function () {
            var inputData = [
                // {
                //     "Key": "Doctor"
                // },
                // {
                //     "Key": "Guarantor",
                //     Request: {
                //         Params: [{
                //             Key: 7,
                //             Value: utl.Session.getCurrentFacilityId()
                //         }]
                //     }
                // },
                {
                    "Key": "ServiceRateCategory"
                },
                // {
                //     "Key": "ServiceCategory"
                // },
                // {
                //     "Key": "Department"
                // }
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

    PharmacybillmodifyController.$inject = ['$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();