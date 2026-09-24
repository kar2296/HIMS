(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('regcumvisitwithbillController', regcumvisitwithbillController);

    function regcumvisitwithbillController($rootScope, $scope, $timeout, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({
            $scope: $scope
        }));

        var savehitcompleted = 0;
        $scope.autopatientportal = 0;
        $scope.CanShow == 0;
        $scope.DoctorClassId = 0;
        $scope.DrIncludeTax = false;
        $scope.DrShareDetailInfo = {};
        $scope.SerItmCalculateTax = false;
        $scope.SerItmGSTInfo = {};
        $scope.Checkout = {};
        $scope.adrsmandatory = 0;
        $scope.adrsmandatory =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'adrsmandatory');

        $scope.autopatientportal =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'autopatientportal');

        $scope.ScheduledAppointment = {};
        $scope.IsMRDFileCreation = 0;
        $scope.IsMRDFileRequest = 0;
        $scope.NoofPrintPatientLabel = 1;
        $scope.NoofPrintMRDLabel = 1;
        $scope.EncounterStatus = '';
        $scope.BillInfo = [];
        $scope.DrTeam = [];
        $scope.LastVisitDate = null;
        $scope.IsLastSurgeryVisit = false;
        $scope.PatGuarantorNoofFreeVisit = 0;
        $scope.PatientGuarantor = 0;
        $scope.currentcontext = {};
        $scope.pastvisitinfo = [];
        $scope.DefaultServiceTotalAmt = 0;
        $scope.DefaultServiceInfo = [];
        $scope.DrDefaultServiceInfo = [];
        $scope.PatientPaymentDetails = [];
        $scope.lookup = {};
        $scope.currentcontext.PatientStatusId = 1;
        $scope.currentcontext.id = 0;
        $scope.currentcontext.RdoBillDiscount = true;
        $scope.currentcontext.RdoReceiptAmt = true;
        $scope.currentcontext.RdoBillDiscountMode = true;
        $scope.currentcontext.BillDiscount = 0;
        $scope.currentcontext.PaymentTypeId = 1;
        $scope.currentcontext.TotNetAmount = 0;
        $scope.currentcontext.DiscountApprovedBy = -1;
        $scope.currentcontext.TotDiscAmount = 0;
        $scope.currentcontext.PaidAmt = 0;
        $scope.currentcontext.ReceiptAmt = null;
        $scope.currentcontext.TotBalanceAmt = 0;
        $scope.currentcontext.TotDueAmt = 0;
        $scope.currentcontext.GuarantorTypeId = 1;
        $scope.currentcontext.GrossAmount = 0;
        $scope.currentcontext.file = null;
        $scope.currentcontext.Photo = null;
        $scope.requirefreevisitalert = 0;


        $scope.requirefreevisitalert = utl.FacilitySetting.getFacilitySettingValue('billing', 'freevisitalert');

        $scope.IsDiscountApproved = false;
        $scope.BillWithComeReceipt = true;
        $scope.NooFVisitFreeDisabled = false;

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.Patientdata = [];
        $scope.item = {};
        $scope.currentcontext.TokenNo = '';
        $scope.item.NoDraftBill = 1; // will not create draft bill
        $scope.item.NationalityId = 238; // India
        $scope.item.PreferredLanguageId = 4; //English
        $scope.item.MRNTypeId = 2; // Defaulted to MRN
        $scope.item.DoctorId = -1;
        $scope.item.DiagnosisId = -1;
        $scope.item.OtherDiagnosis = '';
        $scope.item.DepartmentId = -1;
        $scope.item.Id = 0;
        $scope.item.GuarantorId = -1;
        $scope.item.AppointmentCategoryId = 5;
        $scope.item.VisitTypeId = 1;
        $scope.item.GuarantorName = '';
        $scope.item.AcutalGuarantorId = 0;
        $scope.item.IsPaidVisit = 0;
        $scope.item.FreeVisit = 0;
        $scope.item.LastFreeVisit = 0;
        $scope.item.IsNoBill = false;
        $scope.item.IsEmergency = false;
        $scope.item.iswebcamphoto = false;
        $scope.item.PhotoPath = null;
        $scope.item.ScheduleApptId = null;
        $scope.item.ScheduleApptStartTime = null;
        $scope.selectedPatient = {};
        $scope.item.ScheduleApptEndTime = null;
        $scope.item.OverrideDuplicate = false;
        $scope.item.PatientTypeId = 1;


        $scope.currentcontext.CanReg_Billing = utl.Privilege.hasAccess('CanReg_Billing');
        $scope.currentcontext.CanReg_CheckOut = utl.Privilege.hasAccess('CanReg_CheckOut');
        $scope.currentcontext.CanReg_Deactivate = utl.Privilege.hasAccess('CanReg_Deactivate');
        $scope.currentcontext.CanReg_Attachment = utl.Privilege.hasAccess('CanReg_Attachment');
        $scope.currentcontext.CanReg_BarCode = utl.Privilege.hasAccess('CanReg_BarCode');

        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        };

        $scope.viewScheduleAppt = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.openFixedDialog('app.appointmentschedule', {
                    params: {
                        id: 0,
                        pid: $scope.item.PatientId || 0,
                        apptstatusid: 2,
                        doctorId: $scope.item.DoctorId,
                        deptId: $scope.item.DepartmentId,
                        appointmentDate: utl.Formatter.getCurrentDate()
                    },
                    confirmCallback: $scope.getScheduleApptData
                });
            }
        };
        $scope.backtoList = function () {
            if ($scope.Context == 'frontoffice') {
                $state.go('app.frontdashboard');
            } else if ($scope.Context == 'billing') {
                $state.go('app.billingsdashboard');
            }
        }
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };

        $scope.addOccupation = function () {
            utl.Modal.openFixedDialog('app.occupations', {
                params: {
                    id: 0
                }
            });
        };
        $scope.addRemark = function () {
            utl.Modal.openFixedDialog('app.remark', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        };
        $scope.getScheduleApptData = function (ScheduleData) {
            if (ScheduleData.ScheduleApptId) {
                $scope.item.DoctorId = ScheduleData.ScheduleApptDoctorId;
                $scope.item.DepartmentId = ScheduleData.ScheduleApptDepartmentId;
                try {
                    $timeout(function () {
                        $scope.item.ScheduleApptId = ScheduleData.ScheduleApptId;
                        $scope.item.ScheduleApptDispTime = ScheduleData.ScheduleApptDispTime;
                        $scope.item.ScheduleApptStartTime =
                            moment(ScheduleData.ScheduleApptStartTime).format('HH:mm');
                        $scope.item.ScheduleApptEndTime =
                            moment(ScheduleData.ScheduleApptEndTime).format('HH:mm');
                    }, 1000);
                } catch (ex) { }
            }
        };

        $scope.showAppointment = function () {
            if ($scope.item.DoctorId) {
                utl.Modal.openFixedDialog('app.appointmentsview', {
                    params: {
                        id: 0,
                        pid: $scope.item.PatientId || 0,
                        apptstatusid: 6,
                        doctorId: $scope.item.DoctorId,
                        deptId: $scope.item.DepartmentId,
                        EncounterStatus: $scope.EncounterStatus // = 'Checked-In'
                    },
                    confirmCallback: $scope.getNewAppointment
                });
            }
        };

        $scope.getNewAppointment = function (ScheduleData) {
            if (ScheduleData.IsCheckedInAppt) {
                $scope.item.DoctorId = ScheduleData.ScheduleApptDoctorId;
                $scope.item.DepartmentId = ScheduleData.ScheduleApptDepartmentId;
                try {
                    $timeout(function () {
                        $scope.item.IsCheckedInAppt = ScheduleData.IsCheckedInAppt;
                        $scope.item.ScheduleApptId = ScheduleData.ScheduleApptId;
                        $scope.item.ScheduleApptDispTime = ScheduleData.ScheduleApptDispTime;
                        $scope.item.ScheduleApptStartTime =
                            moment(ScheduleData.ScheduleApptStartTime).format('HH:mm');
                        $scope.item.ScheduleApptEndTime =
                            moment(ScheduleData.ScheduleApptEndTime).format('HH:mm');
                        $scope.setDoctorIdFocus();
                    }, 1000);
                } catch (ex) { }
            }
        };

        $scope.getPaidVisitInfoCallback = function (scope, res, options, hasError) {
            var PaidVisitInfo = []
            if (res.Data.length > 0) {
                PaidVisitInfo = res.Data;
            }
            try {
                if (PaidVisitInfo.length > 0) {
                    var vDischargeDate = PaidVisitInfo[0].DischargeDate;
                    $scope.LastVisitDate = utl.Formatter.getDate(vDischargeDate);
                }
            } catch (ex) {
                $scope.LastVisitDate = null;
            }
            if (!$scope.LastVisitDate) {
                try {
                    if (PaidVisitInfo.length > 0) {
                        var vAdmissionDate = PaidVisitInfo[0].AdmissionDate;
                        $scope.LastVisitDate = utl.Formatter.getDate(vAdmissionDate);
                    }
                } catch (ex) {
                    $scope.LastVisitDate = null;
                }
            }
            $scope.EligibleDaysforPaidVisit();
        };

        $scope.getPaidVisitInfo = function () {
            if ($scope.item && $scope.item.PatientId) {
                var inputData = {
                    Params: [{
                        Key: 4,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 15,
                        Value: 1
                    },
                    {
                        Key: 44,
                        Value: 1
                    },
                    ],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPaidVisitInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getSurgeryVisitInfoCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                $scope.IsLastSurgeryVisit = true;
            } else {
                $scope.IsLastSurgeryVisit = false;
            }
        };

        $scope.getSurgeryVisitInfo = function (EncounterId) {
            if (EncounterId > 0) {
                var inputData = {
                    Params: [{
                        Key: 13,
                        Value: EncounterId
                    },],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getSurgeryVisitInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPastVisitInfoCallback = function (scope, res, options, hasError) {
            $scope.item.LastFreeVisit = 0;
            if (res.Data.length > 0) {
                $scope.pastvisitinfo = res.Data;
            }
            $scope.pastvisitinfo = _.orderBy($scope.pastvisitinfo, 'CreatedAt', 'desc');
            for (var idx in $scope.pastvisitinfo) {
                $scope.pastvisitinfo[idx].visitno = $scope.pastvisitinfo.length - idx;
            }
            try {
                if ($scope.pastvisitinfo.length > 0) {
                    $scope.getSurgeryVisitInfo($scope.pastvisitinfo[0].Id);

                    if ($scope.pastvisitinfo.length > 0) {
                        $scope.item.LastFreeVisit = $scope.pastvisitinfo[0].FreeVisit;
                    }
                    $scope.item.LastFreeVisit++;
                    $scope.item.FreeVisit = $scope.item.LastFreeVisit;
                    if (!$scope.item.NooFVisitFree) {
                        $scope.item.NooFVisitFree = 0;
                        $scope.NooFVisitFreeDisabled = false;
                    } else $scope.NooFVisitFreeDisabled = true;
                }
            } catch (ex) {
                $scope.item.LastFreeVisit = 0;
            }

            $scope.item.VisitTypeId = 1;
            if ($scope.pastvisitinfo && $scope.pastvisitinfo.length > 0) {
                if ((!$scope.item.EncounterId && $scope.pastvisitinfo.length > 0) ||
                    ($scope.item.EncounterId && $scope.pastvisitinfo.length > 1) ||
                    ($scope.pastvisitinfo.length > 1)) {
                    $scope.item.VisitTypeId = 2;
                    $scope.getFollowupDeptwise();
                }
                $scope.MRDRequest = true;
            }
        };

        $scope.getPastVisitInfo = function () {
            if ($scope.item && $scope.item.PatientId) {
                var inputData = {
                    Params: [{
                        Key: 4,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 15,
                        Value: 1
                    },
                    ],
                    PageContext: {
                        PageSize: 3,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPastVisitInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        function onGuarantorSelected(dataFromModal) {
            if (dataFromModal && dataFromModal.GuarantorTypeId) {
                $scope.getPatientGuarantor();

                $timeout(function () {
                    $scope.currentcontext.GuarantorTypeId = dataFromModal.GuarantorTypeId;
                    $scope.item.GuarantorId = dataFromModal.gid;
                    if (dataFromModal && dataFromModal.NooFVisitFree)
                        $scope.PatGuarantorNoofFreeVisit = dataFromModal.NooFVisitFree;
                    $scope.setDefaultService();
                }, 900);

            }
        }

        $scope.addPatientGuarantor = function () {
            utl.Modal.openFixedDialog('app.patientguarantorlist', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    parent: 'txn'
                },
                confirmCallback: onGuarantorSelected
            });
        };

        $scope.GetGuarantorCallback = function (scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            if ($scope.lookup.Guarantor && $scope.lookup.Guarantor.length > 1) {
                $scope.item.GuarantorId = $scope.lookup.Guarantor[1].Id;
                $scope.PatGuarantorNoofFreeVisit = 0;
                $scope.setDefaultService();
            }
        };

        $scope.GetGuarantor = function () {
            $scope.DefaultServiceTotalAmt = 0;
            $scope.currentcontext.ReceiptAmt = 0;
            $scope.DefaultServiceInfo = [];
            $scope.item.GuarantorId = -1;
            if (!$scope.currentcontext.GuarantorTypeId) {
                $scope.item.GuarantorId = -1;
                $scope.CalculateNetAmt();
            } else if ($scope.currentcontext.GuarantorTypeId <= 0) {
                $scope.item.GuarantorId = -1;
                $scope.CalculateNetAmt();
            } else {
                $scope.item.GuarantorId = 1;
                // if ($scope.PatientGuarantor == 0) {
                var inputData = [{
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: $scope.currentcontext.GuarantorTypeId
                        },
                        {
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }
                        ]
                    }
                }];
                $scope.initLookupCall(inputData, $scope.GetGuarantorCallback);
                // } else {
                //     $scope.getPatientGuarantor();
                // }
            }

        };

        $scope.initLookupCall = function (inputData, callback) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: callback
            };
            utl.Http.doAction(options);
        };

        $scope.setDefaultServiceCallback = function (scope, data, options, hasError) {
            $scope.DefaultServiceTotalAmt = 0;
            if (data) {
                $scope.DefaultServiceInfo = data;
            }
            for (var idx in $scope.DefaultServiceInfo) {
                var item = $scope.DefaultServiceInfo[idx];

                if ($scope.item.IsEmergency)
                    $scope.DefaultServiceInfo[idx].Amount = item.EmergencyRate;

                $scope.DefaultServiceTotalAmt += item.NetAmount;
            }

            if (!$scope.SaveCompleted)
                $scope.currentcontext.ReceiptAmt = $scope.DefaultServiceTotalAmt;

            if ($scope.DefaultServiceTotalAmt > 0) {
                $scope.currentcontext.RdoBillDiscount = false;
                $scope.currentcontext.RdoReceiptAmt = false;
                $scope.currentcontext.RdoBillDiscountMode = false;
            } else {
                $scope.currentcontext.RdoBillDiscount = true;
                $scope.currentcontext.RdoReceiptAmt = true;
                $scope.currentcontext.RdoBillDiscountMode = true;
            }
            $scope.CalculateNetAmt();

            if ($scope.item.IsNoBill)
                $scope.NoBill();

            $scope.getDoctorDefaultService();

            $scope.getPaidVisitInfo();

        };

        $scope.calculatefreevisit = function () {
            if ($scope.pastvisitinfo.length > 0) {
                $scope.item.LastFreeVisit = $scope.pastvisitinfo[0].FreeVisit;
                $scope.item.LastFreeVisit++;
                $scope.item.FreeVisit = $scope.item.LastFreeVisit;
            } else {
                $scope.item.LastFreeVisit = 0;
                $scope.item.FreeVisit = 0;
            }
        }

        $scope.setDefaultService = function () {
            $scope.DefaultServiceInfo = [];
            var GuarantorId_ = 0;
            var ServiceRateCategoryId_ = 0;
            if ($scope.item.GuarantorId > 0) {
                var GuarantorId = $scope.item.GuarantorId;
                var SelectedGuarantor = utl.Lookup.getObject($scope.lookup.Guarantor, GuarantorId);
                if (SelectedGuarantor) {
                    if ($scope.PatientGuarantor == 0) {
                        GuarantorId_ = SelectedGuarantor.Id;
                        $scope.item.AcutalGuarantorId = GuarantorId_;
                        ServiceRateCategoryId_ = SelectedGuarantor.ServiceRateCategoryId;
                        $scope.item.ServiceRateCategoryId_ = ServiceRateCategoryId_;
                        $scope.item.GuarantorName = SelectedGuarantor.Text;
                    } else {
                        GuarantorId_ = SelectedGuarantor.Id;
                        $scope.item.AcutalGuarantorId = GuarantorId_;
                        $scope.currentcontext.GuarantorTypeId = SelectedGuarantor.GuarantorTypeId;
                        ServiceRateCategoryId_ = SelectedGuarantor.ServiceRateCategoryId;
                        $scope.item.ServiceRateCategoryId_ = ServiceRateCategoryId_;
                        $scope.item.GuarantorName = SelectedGuarantor.Text;
                    }
                    var NewVisit = 1;
                    if ($scope.pastvisitinfo.length > 0) NewVisit = 2;
                    var Data = {
                        'NewVisit': NewVisit,
                        'FacilityId': utl.Session.getCurrentFacilityId(),
                        'GuarantorTypeId': $scope.currentcontext.GuarantorTypeId,
                        'GuarantorId': GuarantorId_,
                        'GuarantorServiceRateCategoryId': ServiceRateCategoryId_,
                    };
                    var options = {
                        action: 'Visit/Visit/GetOPDefaultServices',
                        data: {
                            Data
                        },
                        type: 'post',
                        onComplete: $scope.setDefaultServiceCallback
                    };
                    utl.Http.doAction(options);
                }
            }

            $scope.calculatefreevisit();
            $scope.CalculateNetAmt();
        };

        $scope.setDispBillinfo = function () {
            if ($scope.BillInfo && $scope.BillInfo.length > 0) {
                $scope.DefaultServiceTotalAmt = $scope.BillInfo[0].BillAmt;
                $scope.currentcontext.TotDiscAmount = $scope.BillInfo[0].DiscAmt;
                $scope.currentcontext.Received = $scope.BillInfo[0].RecdAmt;
                $scope.currentcontext.TotBalanceAmt = $scope.BillInfo[0].BalaAmt;
                $scope.DefaultServiceInfo = [];
                $scope.DefaultServiceInfo = $scope.BillInfo[0].PatientBillDetails;
            }
        };

        $scope.EligibleDaysforPaidVisit = function () {
            var CurrentServerDate = null;

            if (!$scope.item.LastFreeVisit)
                $scope.item.LastFreeVisit = 0;

            if (!$scope.LastVisitDate && $scope.pastvisitinfo && $scope.pastvisitinfo.length > 0) {
                try {
                    $scope.LastVisitDate = utl.Formatter.getDate($scope.pastvisitinfo[0].DischargeDate);
                } catch (ex) {
                    $scope.LastVisitDate = null;
                }
            }
            if (!$scope.LastVisitDate && $scope.pastvisitinfo && $scope.pastvisitinfo.length > 0) {
                try {
                    $scope.LastVisitDate = utl.Formatter.getDate($scope.pastvisitinfo[0].AdmissionDate);
                } catch (ex) {
                    $scope.LastVisitDate = null;
                }
            }

            if ($scope.item.VisitTypeId > 1 && $scope.LastVisitDate) {
                var SelectedDefaultService = $scope.DefaultServiceInfo;
                $scope.DefaultServiceInfo = [];
                $scope.DefaultServiceTotalAmt = 0;
                for (var idx in SelectedDefaultService) {
                    var defaultserviceitem = SelectedDefaultService[idx];
                    try {
                        CurrentServerDate = utl.Formatter.getDate(defaultserviceitem.CurrentDate);
                    } catch (ex) {
                        CurrentServerDate = null;
                    }
                    var vEligibledaysfrom = defaultserviceitem.DefaultFacilityEligibleDaysFrom;
                    var vEligibledays = defaultserviceitem.DefaultFacilityEligibleDays;
                    var vSurgeryNoofVisitFree = defaultserviceitem.DefaultFacilityNoofVisitFree;
                    var date1 = $scope.LastVisitDate;
                    var date2 = CurrentServerDate;
                    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (vEligibledaysfrom <= diffDays && diffDays <= vEligibledays) {
                        $scope.DefaultServiceInfo.push(defaultserviceitem);
                        if ($scope.IsLastSurgeryVisit) {
                            if (vSurgeryNoofVisitFree) { // Last Surgery Visit Free
                                if (vEligibledays >= diffDays &&
                                    vSurgeryNoofVisitFree >= $scope.item.LastFreeVisit) {
                                    $scope.DefaultServiceInfo = [];
                                    $scope.DefaultServiceTotalAmt = 0;
                                    $scope.CalculateNetAmt();
                                }
                            }
                        } else { // Last Guarantor Visit Free
                            if ($scope.PatGuarantorNoofFreeVisit) {
                                if (vEligibledays >= diffDays &&
                                    $scope.PatGuarantorNoofFreeVisit >= $scope.item.LastFreeVisit) {
                                    $scope.DefaultServiceInfo = [];
                                    $scope.DefaultServiceTotalAmt = 0;
                                    $scope.CalculateNetAmt();
                                }
                            }
                        }
                    } else if (diffDays > vEligibledays) {
                        $scope.DefaultServiceInfo.push(defaultserviceitem);
                        $scope.item.NewVisitFree = 0;
                    }
                }
                $scope.currentcontext.ReceiptAmt = 0;
                for (var idx in $scope.DefaultServiceInfo) {
                    var item = $scope.DefaultServiceInfo[idx];
                    $scope.DefaultServiceTotalAmt += item.NetAmount;
                }
                if (!$scope.SaveCompleted) {
                    $scope.currentcontext.ReceiptAmt = $scope.DefaultServiceTotalAmt;
                    $scope.CalculateNetAmt();
                }
            }

            if ($scope.SaveCompleted) {
                $scope.DefaultServiceInfo = [];
                $scope.DefaultServiceTotalAmt = 0;
                $scope.CalculateNetAmt();
            }
        };

        $scope.HeaderDiscountValueChange = function () {
            if ($scope.currentcontext.DiscountModeId && $scope.currentcontext.DiscountModeId != -1) {
                $scope.CalculateNetAmt();
            } else {
                $scope.currentfilter.DiscountModeId = 0;
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discounttypemessage.lbl'));
            }
        };

        $scope.BillDiscountModechange = function (selecteditem) {
            if (selecteditem.Id > 0) {
                if ($scope.currentcontext.DiscountModeId > 0) {
                    $scope.currentcontext.RdoBillDiscount = false;
                    $scope.currentcontext.RdoBillDiscountMode = false;
                } else {
                    $scope.currentcontext.RdoBillDiscount = true;
                    $scope.currentcontext.RdoBillDiscountMode = true;
                }
            }
            $scope.CalculateNetAmt();
        };

        $scope.setDoctorIdFocus = function () {
            $('#DoctorId').focus();
        };

        //Reload banner code starts


        /* Google Address code starts */
        $scope.autocompleteModel = {};
        $scope.disablegoogleaddopt = true;
        $scope.chkgoogleaddopt = false;
        $scope.clearpreviousaddress = function () {
            $scope.item.AddressLine1 = '';
            $scope.item.AddressLine2 = '';
            $scope.item.PinCodeId = -1;
            $scope.item.WardId = -1;
            $scope.item.CityId = -1;
            $scope.item.StateId = -1;
            $scope.item.CountryId = -1;
            $scope.item.DistrictId = -1;
        };
        // Listen to change event
        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
            var geoComponents = $scope.autocompleteModel.getPlace();
            var latitude = geoComponents.geometry.location.lat();
            var longitude = geoComponents.geometry.location.lng();
            var addressComponents = geoComponents.address_components;
            var name = geoComponents.name;
            var address1 = '';
            var address2 = '';
            var city = '';
            var area = '';
            var state = '';
            var country = '';
            var pincode = '';
            for (var i = 0; i < addressComponents.length; i++) {
                if (i == 0)
                    $scope.clearpreviousaddress();

                var addressType = addressComponents[i].types[0];
                if (addressType) {
                    if ('premise' == addressType) { // Address 1
                        address1 = addressComponents[i].long_name;
                    } else if ('sublocality_level_1' == addressType) { // Address 2
                        address2 = addressComponents[i].long_name;
                    } else if ('route' == addressType) { // Area
                        city = addressComponents[i].long_name;
                    } else if ('locality' == addressType) { // city
                        area = addressComponents[i].long_name;
                    } else if ('administrative_area_level_1' == addressType) { // state
                        state = addressComponents[i].long_name;
                    } else if ('country' == addressType) { // country
                        country = addressComponents[i].long_name;
                    } else if ('postal_code' == addressType) { // pincode
                        pincode = addressComponents[i].long_name;
                    }
                }
            }
            $scope.item.AddressLine1 = name + ' ' + address1 + ' ' + address2 + ' ' + city;
            $scope.item.AddressLine2 = area + ' ' + state + ' ' + country + ' ' + pincode;
            $scope.$apply();
            if (pincode)
                $scope.getPincodeData(pincode);
        });

        // Get address from Pincode Master
        $scope.getPincodeDataCallback = function (scope, res, options, hasError) {
            if (res.Data) {
                if (res.Data.length > 0) {
                    // for (var idx in res.Data) {
                    //     $scope.item.PinCodeId = res.Data[idx].Id;
                    //     $scope.item.Ward = res.Data[idx].Area;
                    //     $scope.item.CityId = res.Data[idx].CityId;
                    //     $scope.item.StateId = res.Data[idx].StateId;
                    //     $scope.item.CountryId = res.Data[idx].CountryId;
                    //     $scope.item.DistrictId = res.Data[idx].DistrictId;
                    //     return true;
                    // }
                    $scope.item.PinCodeId = res.Data[0].Id;
                    $scope.item.Ward = res.Data[0].Area;
                    $scope.item.CityId = res.Data[0].CityId;
                    $scope.item.StateId = res.Data[0].StateId;
                    $scope.item.CountryId = res.Data[0].CountryId;
                    $scope.item.DistrictId = res.Data[0].DistrictId;
                }
            }
        };

        $scope.getPincodeData = function (pincode) {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: pincode
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/PincodeMaster/GetPincodeMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPincodeDataCallback
            };
            utl.Http.doAction(options);
        };

        $scope.enablegoogleaddopt = function () {
            $scope.disablegoogleaddopt = !$scope.chkgoogleaddopt;
            $timeout(function () {
                if (!$scope.chkgoogleaddopt) {
                    $scope.autocompleteModel = '';
                    $scope.clearpreviousaddress();
                }
                $('#googleaddopt').focus();
            }, 100);
        };
        /* Google Address code ends */

        $scope.SaveCompleted = false;
        $scope.IsOpenEncounter = false;
        $scope.clear = function () {
            $state.reload();
        };

        $('#myModal').hide();

        $scope.showprocessflow = function () {
            $('#myModal').show();
        };

        $scope.hideprocessflow = function () {
            $('#myModal').hide();
        };

        $scope.addNew = function () {
            $state.reload();
        };

        $scope.backToList = function () {
            $state.go('app.patientsearch');
        };

        $scope.admission = function () {
            $state.go('app.admissiontab.admission', {
                pid: $scope.item.PatientId,
                id: 0
            });
        };

        $scope.OPDBill = function () {
            $state.go('app.opbilling-list', {
                id: $scope.item.Id
            });
        };

        $scope.vitals = function () {
            utl.Modal.openFixedDialog('patientemr.patientvital', {
                params: {
                    pid: $scope.item.Id,
                    encounter: $scope.item.EncounterId
                },
                // confirmCallback: $scope.getList
            });
        };

        $scope.mrdrequest = function () {
            utl.Modal.openFixedDialog('app.filedetail', {
                params: {
                    patient: $scope.item,
                    encounter: $scope.item.Encounters[0]
                },
                // confirmCallback: $scope.getList
            });
        };
        //get patient profile
        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    Id: $scope.item.Id,
                    PhotoPath: $scope.item.PhotoPath
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveAndInactive = function (item) {
            utl.Modal.openFixedDialog('app.deactiveremarks', {
                params: {
                    item: $scope.item
                },
                confirmCallback: $scope.OnRemarkSave
            });
        };

        $scope.OnRemarkSave = function (itemFromModal) {
            $scope.item.DeactivateRemarks = itemFromModal.DeactivateRemarks;
            $scope.item.PatientStatus = 'Inactive';
            $scope.item.PatientStatusId = 3;
            $scope.item.DeactivatedDate = utl.Formatter.getCurrentDate();
            var message = "";
            message = $scope.item.Title ? $scope.item.Title.Description : "";
            message += message != "" ? ("." + $scope.item.FirstName) : $scope.item.FirstName;
            message += $scope.item.MRN ? (" / MRN-" + $scope.item.MRN) : "";
            utl.Dialog.confirmDeactivate($scope.saveItem, message);
        };

        $scope.checkout = function () {
            if ($scope.AppointmentId && $scope.item.PatientId) {
                var msg = 'Do You Want to Checkout for ' + $scope.item.FirstName;
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: msg,
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.confirmcheckout,
                };
                utl.Dialog.confirmMessage(confirmOptions);
                // utl.Modal.openFixedDialog('app.patienttracker', {
                //     params: {
                //         pid: $scope.item.PatientId,
                //         aid: $scope.AppointmentId,
                //         assignto: 3
                //     },
                //     confirmCallback: $scope.addNew
                // });
            }
        };
        $scope.confirmcheckout = function () {
            $scope.Checkout.AssignTo = 4;
            $scope.Checkout.AppointmentId = $scope.AppointmentId;
            $scope.Checkout.PatientId = $scope.item.PatientId;
            var options = {
                action: 'appointment/patienttracker/CheckoutPatient',
                data: {
                    Data: $scope.Checkout
                },
                type: 'post',
                onComplete: $scope.checkoutCallback
            };
            utl.Http.doAction(options);
        }
        $scope.checkoutCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // var data = options.data ? options.data : null;
            // // if (options.data && options.data.Data) {
            // //     if (options.data.Data.AssignTo && options.data.Data.AssignTo == 4 && options.data.Data.Duration) {
            // //         openAppointmentForm(options.data.Data.FollowupAppointmentOn);
            // //     }
            // //     if (options.data.Data.AssignTo && options.data.Data.AssignTo == 3) {
            // //         $scope.doctor_dashboard();
            // //     }
            // // }

            //  $scope.confirmCallback();
        };

        $scope.getPatientBillInfoCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                var billinfo = {
                    'BillId': res.Data[0].Id,
                    'BillAmt': res.Data[0].BillAmount,
                    'DiscAmt': res.Data[0].BillDiscount,
                    'RecdAmt': res.Data[0].PaidAmount,
                    'BalaAmt': res.Data[0].OutStandingAmount,
                    'PatientBillDetails': res.Data[0].PatientBillDetails,
                };
                // $scope.BillId = billinfo.Id;
                $scope.BillInfo.push(billinfo);
                if ($scope.SaveCompleted == true) {
                    if ($scope.OpBillPrint == true) {
                        $scope.printOPBill();
                    }
                }

            }
        };

        $scope.getPatientBillInfo = function () {
            if ($scope.item.PatientId && $scope.item.EncounterId) {
                var inputData = {
                    Params: [{
                        Key: 12,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 16,
                        Value: $scope.item.EncounterId
                    },
                    {
                        Key: 40,
                        Value: true
                    },
                    ],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPatientBillInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.setTempPatDefaultValue = function () {
            $scope.currentcontext.GuarantorTypeId = 1;
            $scope.item.NoDraftBill = 1; // will not create draft bill
            $scope.item.NationalityId = 238; // India
            $scope.item.PreferredLanguageId = 4; //English
            $scope.item.MRNTypeId = 2; // Defaulted to MRN
            $scope.item.DoctorId = -1;
            $scope.item.DiagnosisId = -1;
            $scope.item.OtherDiagnosis = '';
            $scope.item.DepartmentId = -1;
            $scope.item.AppointmentCategoryId = 5;
            $scope.item.VisitTypeId = 1;
            $scope.item.AcutalGuarantorId = 0;
            $scope.item.IsPaidVisit = 0;
            $scope.item.FreeVisit = 0;
            $scope.item.LastFreeVisit = 0;
            $scope.item.IsNoBill = false;
            $scope.item.IsEmergency = false;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
            $scope.item.ScheduleApptId = null;
            $scope.item.ScheduleApptStartTime = null;
            $scope.item.ScheduleApptEndTime = null;
        };

        $scope.setBannerDelegate = function (cmp) {
            $scope.bannercmp = cmp;
        };
        $scope.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        }

        $scope.getPatientCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.Patientdata = res.Data[0];
                $scope.item = res.Data[0];
                $scope.OpBillPrint = true;

                if (!$scope.item.NooFVisitFree) {
                    $scope.item.NooFVisitFree = 0;
                    $scope.NooFVisitFreeDisabled = false;
                } else $scope.NooFVisitFreeDisabled = true;

                $scope.item.PatientId = $scope.item.Id;
                $scope.item.BannerPatientId = 0;
                $timeout(function () {
                    $scope.item.BannerPatientId = $scope.item.Id;
                }, 100);
                if ($scope.item.MRNTypeId == 1) { // TEMP to Active Patient
                    $scope.item.IsTempPatient = true;
                    $scope.item.MRN = null;
                    $scope.item.OverrideDuplicate = true;
                }
                $scope.setTempPatDefaultValue();
                $scope.getPatientProfilePic();
                if ($scope.item.Encounters && $scope.item.Encounters.length > 0) {
                    var encounteritem = $scope.item.Encounters[0];
                    $scope.item.VisitTypeId = encounteritem.VisitTypeId;
                    $scope.item.IsNoBill = encounteritem.IsNoBill;
                    $scope.item.ReferredById = encounteritem.ReferralId;
                    $scope.item.ReferralId = encounteritem.ReferralId;
                    $scope.item.DepartmentId = encounteritem.DepartmentId;
                    $scope.item.DoctorId = encounteritem.DoctorId;
                    $scope.item.DiagnosisId = encounteritem.DiagnosisId;
                    $scope.item.OtherDiagnosis = encounteritem.OtherDiagnosis;
                    $scope.item.TeamId = encounteritem.TeamId;
                    $scope.item.Comments = encounteritem.Comments;
                    $scope.item.EncounterId = encounteritem.Id;
                    $scope.AppointmentId = encounteritem.AppointmentId;

                    if ($scope.AppointmentId)
                        $scope.getOldPatientAppt();

                    if (encounteritem.EncounterStatusId == 1) $scope.EncounterStatus = 'Checked-In';
                    else $scope.EncounterStatus = 'Checked-Out';

                    $scope.SaveCompleted = true;
                    $scope.IsOpenEncounter = true;
                } else $scope.EncounterStatus = 'Checked-Out';
                $scope.lookup["Referral"].filter(function (item) {
                    if (item.ReferralId == $scope.item.ReferralId)
                        $scope.item.ReferralTypeId = item.ReferralTypeId;
                });
                var ageObj = utl.Formatter.getDetailedAgeFromDOB($scope.item.DOB);
                $scope.item.ApproxAgeDays = ageObj.d;
                $scope.item.ApproxAgeMonths = ageObj.m;
                $scope.item.Age = ageObj.y;

                if (!$scope.currentcontext.TokenNo)
                    $scope.getTokenDisplay();

                $scope.getPatientBillInfo();
                if ($scope.currentcontext.file && $scope.item.PatientId) {
                    $scope.UploadPatientPhoto();
                }
                $scope.getPatientGuarantor();
            }
            $scope.getMRDFlowRequired();
            $scope.getPatientAttachments();
        };

        $scope.getPatient = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.Id
                },],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientCallback
            };
            utl.Http.doAction(options);
        };

        function webcamSuccess(base64String) {
            $scope.item.iswebcamphoto = true;
            $scope.item.webcamphoto = base64String;
            $scope.currentcontext.file = null;
        }

        $scope.openWebCam = function () {
            utl.Modal.openFixedDialog('webcam-modal', {
                params: {
                    pid: $scope.item.PatientId || 0
                },
                confirmCallback: webcamSuccess
            });
        };

        $scope.clearimage = function () {
            $scope.currentcontext.file = null;
            $scope.currentcontext.Photo = null;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
        };

        $scope.getOldPatientApptCallback = function (scope, data, options, hasError) {
            $scope.Appointment = data.Data[0];
            if ($scope.Appointment && $scope.Appointment.StartTime) {
                $scope.item.ScheduleApptDispTime =
                    $scope.Appointment.StartTime + ' - ' + $scope.Appointment.EndTime;
            }
        };

        $scope.getOldPatientAppt = function () {
            if ($scope.AppointmentId && $scope.AppointmentId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.AppointmentId
                    }]
                };
                var options = {
                    action: 'Appointment/Appointment/GetAppointments',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getOldPatientApptCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.getAppointmentCallback = function (scope, data, options, hasError) {
            $scope.Appointment = data.Data[0];
            $scope.item.PatientId = $scope.Appointment.PatientId;
            $scope.item.Id = $scope.Appointment.PatientId;
            $scope.item.EncounterId = $scope.Appointment.Encounters[0].EncounterId;
            $scope.getPatient();
            $scope.getPastVisitInfo();
        };

        $scope.getAppointment = function () {
            if ($scope.AppointmentId && $scope.AppointmentId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.AppointmentId
                    }]
                };
                var options = {
                    action: 'Appointment/Appointment/GetAppointments',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAppointmentCallback
                };

                utl.Http.doAction(options);
            }
        };

        /* Print Coding - Starting  */
        $scope.printOPBill = function () {
            // if ($scope.BillInfo && $scope.BillInfo.length > 0) {
            var inputData = {
                Id: $scope.BillInfo[0].BillId
            };
            var options = {
                action: 'billing/patientbills/PrintPatientBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
            // }
        };

        $scope.printMRDLabel = function () {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintMRDLabel && !isNaN($scope.NoofPrintMRDLabel))
                    noofprint = parseInt($scope.NoofPrintMRDLabel);
            } catch (ex) {
                noofprint = 1;
            }
            try {
                var vTitle = '';
                var vFirstName = '';
                var vLastName = '';
                var vMRN = '';
                var vEncoutnerType = '';
                try {
                    if ($scope.Patientdata && $scope.Patientdata.Title &&
                        $scope.Patientdata.Title.Description)
                        vTitle += $scope.Patientdata.Title.Description;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.FirstName)
                        vFirstName += ' ' + $scope.Patientdata.FirstName;


                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.MRN)
                        vMRN = $scope.Patientdata.MRN;

                } catch (ex) { }

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q406,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S3' + printCodes.new_line;
                code += 'D7' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R111,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                if (window.clientcode.toLowerCase() == 'lotus') {
                    code += 'A546,245,2,4,3,3,N,"' + vMRN + '"' + printCodes.new_line;
                    code += 'A586,164,2,4,2,2,N,"' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'B546,106,2,1,4,12,66,B,"' + vMRN + '"' + printCodes.new_line;
                } else {
                    code += 'A414,254,2,4,3,3,N,"' + vMRN + '"' + printCodes.new_line;
                    code += 'A507,174,2,4,2,2,N,"' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'B437,116,2,1,4,12,66,B,"' + vMRN + '"' + printCodes.new_line;
                }
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) {
                console.log(ex);
            }
        };
        $scope.patientidcard = function () {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintPatientLabel && !isNaN($scope.NoofPrintPatientLabel))
                    noofprint = parseInt($scope.NoofPrintPatientLabel);
            } catch (ex) {
                noofprint = 1;
            }
            try {
                var vTitle = '';
                var vFirstName = '';
                var vLastName = '';
                var vMRN = '';
                var vAppointmentDate = '';
                var vAppointmentTime = '';
                var vPhoneNumber = '';
                var vDOB = '';
                var vGender = '';
                var vDepartment = '';
                var vAssignedUserName = '';
                var vVisitType = '';
                var vAge = '';
                var vDefaultServiceTotalAmt = '';
                var vCity = '';
                var vTokenNo = '';
                try {
                    if ($scope.item && $scope.item.Title &&
                        $scope.item.Title.Description)
                        vTitle += $scope.item.Title.Description;

                    if ($scope.item && $scope.item &&
                        $scope.item.FirstName)
                        vFirstName += ' ' + $scope.item.FirstName;

                    if ($scope.item && $scope.item &&
                        $scope.item.LastName)
                        vLastName += ' ' + $scope.item.LastName;

                    if ($scope.item && $scope.item &&
                        $scope.item.MRN)
                        vMRN = $scope.item.MRN;

                    if ($scope.item && $scope.item &&
                        $scope.item.Age)
                        vAge = $scope.item.Age;
                    vAge = (vAge == "") ? vAge = ((typeof $scope.item.ApproxAgeMonths != "undefined") ? $scope.item.ApproxAgeMonths + "M " : "0M ") + $scope.item.ApproxAgeDays + "D" : vAge + "Y";
                    if ($scope.item && $scope.item &&
                        $scope.item.Gender.Description)
                        vGender += $scope.item.Gender.Description;

                    if ($scope.item && $scope.item &&
                        $scope.item.Mobile)
                        vPhoneNumber = $scope.item.Mobile;
                    if ($scope.item && $scope.item &&
                        $scope.item.Age)
                        vAge = $scope.item.Age;

                    if ($scope.item && $scope.item &&
                        $scope.item.City)
                        vCity = $scope.item.City;

                    if ($scope.item && $scope.item &&
                        $scope.item.DOB)
                        vDOB = $scope.item.DOB;
                    if ($scope.Appointment && $scope.Appointment &&
                        $scope.Appointment.AppointmentDate)
                        vAppointmentDate = $scope.Appointment.AppointmentDate;

                    if ($scope.Appointment && $scope.Appointment &&
                        $scope.Appointment.Department.DepartmentName)
                        vDepartment = $scope.Appointment.Department.DepartmentName;

                    if ($scope.Appointment && $scope.Appointment &&
                        $scope.Appointment.Department.DepartmentName)
                        vAssignedUserName = $scope.Appointment.AssignedUserName;

                    if ($scope.Appointment && $scope.Appointment &&
                        $scope.Appointment.VisitType.Description)
                        vVisitType = $scope.Appointment.VisitType.Description;

                    if ($scope.currentcontext && $scope.currentcontext &&
                        $scope.currentcontext.TokenNo)
                        vTokenNo = $scope.currentcontext.TokenNo;

                    if ($scope.DefaultServiceInfo && $scope.DefaultServiceInfo &&
                        $scope.DefaultServiceInfo[0].Amount)
                        vDefaultServiceTotalAmt = $scope.DefaultServiceInfo[0].Amount;

                    if ($scope.Appointment && $scope.Appointment &&
                        $scope.Appointment.AppointmentDate)
                        vAppointmentTime = $scope.Appointment.StartTime;
                    var dateString = vAppointmentTime.toString();
                    common.approveaction.lbl = dateString.substring(10, 0);
                } catch (ex) { }

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                if (window.clientcode.toLowerCase() == 'prakriya') {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q200,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S2' + printCodes.new_line;
                    code += 'D15' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R215,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' ' + ' ' + ' PHID :' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' ' + ' ' + ' Pat.Name :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A530,194,2,4,1,1,N,"' + ' ' + ' ' + ' Gender/ Age  :' + ' ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + ' Visit Date :' + ' ' + vAppointmentDate + ' /  ' + vAppointmentTime + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + ' ' + ' ' + ' ' + ' ' + vMRN + '"' + printCodes.new_line;
                    $scope.printRaw(printData);
                } else if (window.clientcode.toLowerCase() == 'eech') {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q200,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S2' + printCodes.new_line;
                    code += 'D15' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R215,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' ' + ' ' + ' PHID :' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' ' + ' ' + ' Pat.Name :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A530,194,2,4,1,1,N,"' + ' ' + ' ' + ' Gender/ Age  :' + ' ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + ' Visit Date :' + ' ' + vAppointmentDate + ' /  ' + vAppointmentTime + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + ' ' + ' ' + ' ' + ' ' + vMRN + '"' + printCodes.new_line;
                    $scope.printRaw(printData);
                } else if (window.clientcode.toLowerCase() == 'swostha') {
                    code += 'CT,CD,CC,CT' + printCodes.new_line;
                    // code += 'XA' + printCodes.new_line;
                    // code += 'TA000' + printCodes.new_line;
                    // code += 'JSN' + printCodes.new_line;
                    // code += 'LT0' + printCodes.new_line;
                    // code += 'MNW' + printCodes.new_line;
                    // code += 'MTT' + printCodes.new_line;
                    // code += 'PON' + printCodes.new_line;
                    // code += 'PMN' + printCodes.new_line;
                    // code += 'LH0,0' + printCodes.new_line;
                    // code += 'JMA' + printCodes.new_line;
                    // code += 'SD15' + printCodes.new_line;
                    // code += 'JUS' + printCodes.new_line;
                    // code += 'LRN' + printCodes.new_line;
                    // code += 'CI27' + printCodes.new_line;
                    // code += 'PA0,1,1,0' + printCodes.new_line;
                    // code += 'XZ' + printCodes.new_line;
                    code += 'XA' + printCodes.new_line;
                    code += 'MMT' + printCodes.new_line;
                    code += 'PW909' + printCodes.new_line;
                    code += 'LL609' + printCodes.new_line;
                    code += 'LS0' + printCodes.new_line;
                    code += 'FT30,56,A0N,33,41,"' + vDepartment + '"' + printCodes.new_line;
                    code += 'FT334,60,A0N,37,43,"' + ' ' + ' ' + ' Date/Time :' + ' ' + vAppointmentDate + '"' + printCodes.new_line;
                    code += 'FT30,114,A0N,33,33,"' + vAssignedUserName + '"' + printCodes.new_line;
                    code += 'FT30,168,A0N,33,33,"' + ' ' + ' ' + ' Hospital No :' + printCodes.new_line;
                    code += 'FT239,168,A0N,33,33,"' + ' ' + ' ' + '  :' + '"' + printCodes.new_line;
                    code += 'FT30,216,A0N,33,33,"' + ' ' + ' ' + ' Patient Name :' + '"' + printCodes.new_line;
                    code += 'FT239,216,A0N,33,33,"' + ' ' + ' ' + ' ' + ' "' + printCodes.new_line;
                    code += 'FT27,263,A0N,33,33,"' + ' ' + ' ' + ' Age/Sex :' + '"' + printCodes.new_line;
                    code += 'FT30,317,A0N,33,33,"' + ' ' + ' ' + ' Address :' + '"' + printCodes.new_line;
                    code += 'FT30,364,A0N,33,33,"' + ' ' + ' ' + ' Users :' + '"' + printCodes.new_line;
                    code += 'FT27,415,A0N,33,33,"' + ' ' + ' ' + ' Phone No :' + '"' + printCodes.new_line;
                    code += 'FT239,263,A0N,33,33,"' + ' ' + ' ' + ' :' + '"' + printCodes.new_line;
                    code += 'FT239,317,A0N,33,33,"' + ' ' + ' ' + ' :' + '"' + printCodes.new_line;
                    code += 'FT239,364,A0N,33,33,"' + ' ' + ' ' + ' :' + '"' + printCodes.new_line;
                    code += 'FT239,415,A0N,33,33,"' + ' ' + ' ' + ' :' + '"' + printCodes.new_line;
                    code += 'FT279,168,A0N,33,33,"' + ' ' + ' ' + '767676565' + '"' + printCodes.new_line;
                    code += 'FT275,216,A0N,33,33,"' + ' ' + ' ' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'FT271,268,A0N,33,33,"' + ' ' + ' ' + vAge + '"' + printCodes.new_line;
                    code += 'FT271,323,A0N,33,33,"' + ' ' + ' ' + vCity + '"' + printCodes.new_line;
                    code += 'FT271,374,A0N,33,33,"' + ' ' + ' ' + '' + '"' + printCodes.new_line;
                    code += 'FT264,415,A0N,33,33,"' + ' ' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                    code += 'FT620,168,A0N,33,33,"' + ' ' + ' ' + 'Queue No' + vTokenNo + '"' + printCodes.new_line;
                    code += 'FT620,272,A0N,33,33,"' + ' ' + ' ' + vVisitType + '"' + printCodes.new_line;
                    code += 'BY4,3,67,FT428,538,BCN,,Y,N,"' + ' ' + ' ' + '"' + printCodes.new_line;
                    code += 'FH,FD,;123456789012,FS,"' + ' ' + ' ' + '"' + printCodes.new_line;
                    code += 'FT512,456,A0N,33,33,"' + ' ' + ' ' + ' Charge Rs :' + ' ' + vDefaultServiceTotalAmt + '"' + printCodes.new_line;
                    code += 'PQ1,0,1,Y,"' + ' ' + ' ' + ' :' + '"' + printCodes.new_line;
                    code += 'XZ,"' + ' ' + ' ' + ' :' + '"' + printCodes.new_line;
                    $scope.printRaw(printData);

                } else {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q200,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S2' + printCodes.new_line;
                    code += 'D15' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R215,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' ' + ' ' + ' PHID :' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' ' + ' ' + ' Pat.Name :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A530,194,2,4,1,1,N,"' + ' ' + ' ' + ' Gender/ Age  :' + ' ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + ' Visit Date :' + ' ' + vAppointmentDate + ' /  ' + vAppointmentTime + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + ' ' + ' ' + ' ' + ' ' + vMRN + '"' + printCodes.new_line;
                    $scope.printRaw(printData);
                }
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                console.log('**********', code);

                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) {
                console.log(ex);
            }
        };

        $scope.printPatientLabel = function () {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintPatientLabel && !isNaN($scope.NoofPrintPatientLabel))
                    noofprint = parseInt($scope.NoofPrintPatientLabel);
            } catch (ex) {
                noofprint = 1;
            }
            try {
                var vTitle = '';
                var vFirstName = '';
                var vLastName = '';
                var vMRN = '';
                var vEncoutnerType = '';
                var vAddress = '';
                var vRegisteredDate = '';
                var vPhoneNumber = '';
                var vGender = '';
                var vDoctor = '';
                var vDOB = '';
                var vArea = '';
                var vCityTownName = '';
                var vGender = '';
                var vAddressLine1 = '';
                var vAddressLine2 = '';
                var vAge = '';
                var vPincode = '';
                try {
                    if ($scope.Patientdata && $scope.Patientdata.Title &&
                        $scope.Patientdata.Title.Description)
                        vTitle += $scope.Patientdata.Title.Description;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.FirstName)
                        vFirstName += ' ' + $scope.Patientdata.FirstName;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.LastName)
                        vLastName += ' ' + $scope.Patientdata.LastName;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.MRN)
                        vMRN = $scope.Patientdata.MRN;


                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.DOB)
                        vDOB = $scope.Patientdata.DOB;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.RegisteredDate)
                        vRegisteredDate = $scope.Patientdata.RegisteredDate;
                    var dateString = vRegisteredDate.toString();
                    vRegisteredDate = dateString.substring(10, 0);

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Age)
                        vAge = $scope.Patientdata.Age;
                    vAge = (vAge == "") ? vAge = ((typeof $scope.Patientdata.ApproxAgeMonths != "undefined") ? $scope.Patientdata.ApproxAgeMonths + "M " : "0M ") + $scope.Patientdata.ApproxAgeDays + "D" : vAge + "Y";


                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Mobile)
                        vPhoneNumber = $scope.Patientdata.Mobile;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Gender.Description)
                        vGender = $scope.Patientdata.Gender.Description;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Area)
                        vArea = $scope.Patientdata.Area;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.AddressLine1)
                        vAddressLine1 = $scope.Patientdata.AddressLine1;


                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.AddressLine2)
                        vAddressLine2 = $scope.Patientdata.AddressLine2;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.City)
                        vCityTownName = $scope.Patientdata.City;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Encounters[0].DoctorName)
                        vDoctor = $scope.Patientdata.Encounters[0].DoctorName;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Age)
                        vAge = $scope.Patientdata.Age;

                    if ($scope.Patientdata && $scope.Patientdata &&
                        $scope.Patientdata.Pincode)
                        vPincode = $scope.Patientdata.Pincode;


                } catch (ex) { }

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                if (window.clientcode.toLowerCase() == 'lotus') {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q406,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S3' + printCodes.new_line;
                    code += 'D7' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R111,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' :' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A305,256,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                    code += 'A186,256,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                    code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A620,193,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                    code += 'A530,193,2,4,1,1,N,"' + ' :' + ' ' + vAddressLine1 + ',' + vAddressLine2 + '"' + printCodes.new_line;
                    code += 'A620,163,2,4,1,1,N,"' + ' ' + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + '  ' + vArea + ',' + vCityTownName + '"' + printCodes.new_line;
                    code += 'A620,133,2,4,1,1,N,"' + 'Phone' + '"' + printCodes.new_line;
                    code += 'A530,133,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                    code += 'A305,133,2,4,1,1,N,"' + 'Gender' + '"' + printCodes.new_line;
                    code += 'A186,133,2,4,1,1,N,"' + ':' + ' ' + vGender + '"' + printCodes.new_line;
                    code += 'A90,133,2,4,1,1,N,"' + '/' + ' ' + vAge + '"' + printCodes.new_line;
                    code += 'A620,98,2,4,1,1,N,"' + 'Doctor' + '"' + printCodes.new_line;
                    code += 'A530,98,2,4,1,1,N,"' + ':' + ' ' + vDoctor + '"' + printCodes.new_line;
                    //code += 'A624,65,2,4,1,1,N,"' + 'DOB' + '"' + printCodes.new_line;
                    //code += 'A570,65,2,4,1,1,N,"' + ':' + ' ' + vDOB + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                } else if (window.clientcode.toLowerCase() == 'sundaram') {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q406,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S3' + printCodes.new_line;
                    code += 'D7' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R111,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A600,255,2,4,1,1,N,"' + 'MRN.NO' + '"' + printCodes.new_line;
                    code += 'A420,255,2,4,1,1,N,"' + ':' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A600,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A420,225,2,4,1,1,N,"' + ':' + ' ' + vTitle + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A600,197,2,4,1,1,N,"' + 'DOB / Gender' + '"' + printCodes.new_line;
                    code += 'A420,197,2,4,1,1,N,"' + ':' + ' ' + vDOB + ' / ' + vGender + '"' + printCodes.new_line;
                    code += 'A600,169,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                    code += 'A420,169,2,4,1,1,N,"' + ':' + ' ' + vArea + ',' + vPincode + '"' + printCodes.new_line;
                    code += 'A600,140,2,4,1,1,N,"' + 'Phone No' + '"' + printCodes.new_line;
                    code += 'A420,140,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                    //code += 'A600,140,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                    //code += 'A420,141,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                    code += 'A600,113,2,4,1,1,N,"' + 'Doctor' + '"' + printCodes.new_line;
                    code += 'A420,113,2,4,1,1,N,"' + ':' + ' ' + vDoctor + '"' + printCodes.new_line;
                    code += 'B570,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                } else {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q406,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S3' + printCodes.new_line;
                    code += 'D7' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R111,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A600,255,2,4,1,1,N,"' + 'MRN.NO' + '"' + printCodes.new_line;
                    code += 'A420,255,2,4,1,1,N,"' + ':' + ' ' + vMRN + '"' + printCodes.new_line;
                    code += 'A600,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A420,226,2,4,1,1,N,"' + ':' + ' ' + vTitle + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                    code += 'A600,197,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                    code += 'A420,198,2,4,1,1,N,"' + ':' + ' ' + vArea + ',' + vPincode + '"' + printCodes.new_line;
                    code += 'A600,169,2,4,1,1,N,"' + 'Phone No' + '"' + printCodes.new_line;
                    code += 'A420,169,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                    code += 'A600,140,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                    code += 'A420,141,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                    code += 'A600,113,2,4,1,1,N,"' + 'Gender/Age' + '"' + printCodes.new_line;
                    code += 'A420,113,2,4,1,1,N,"' + ':' + ' ' + vGender + ' /' + vAge + ' /' + vDOB + '"' + printCodes.new_line;
                    code += 'B570,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                }
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;


                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) {
                console.log(ex);
            }
        };

        // $scope.idcard = function (selectedPatient) {
        //             utl.Modal.open('registration.patientprofile', {
        //                 params: { pid: selectedPatient.Id },
        //                 confirmCallback: $scope.getList
        //             });
        //         };
        $scope.idcard = function () {
            $state.go('app.regpatientidcard', {
                id: $scope.item.PatientId,
                // confirmCallback: $scope.getList
            });
        }

        // $scope.PatInfoCallback = function (scope, data, options, hasError) {
        //     $scope.selectedPatient = data;
        // }

        $scope.printRegistration = function () {
            var inputData = {
                Id: $scope.item.PatientId,
                Data: {
                    EncounterId: $scope.item.EncounterId
                }
            };
            var options = {
                action: 'registration/Patient/PrintPatientWithEncounter',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printRegistrationIdlabel = function () {
            var inputData = {
                Id: $scope.item.PatientId,
                Data: true
            };
            var options = {
                action: 'registration/Patient/PrintPatientLabel',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('Successfully downloaded....');
        };

        $scope.printRegistrationIdCard = function () {
            var inputData = {
                Id: $scope.item.PatientId,
                Data: true
            };
            var options = {
                action: 'registration/Patient/PrintPatientLabel',
                data: inputData,
                type: 'post',
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        };

        $scope.printVisitSlip = function () {
            if ($scope.AppointmentId) {
                var inputData = {
                    Id: $scope.AppointmentId
                };
                var options = {
                    action: 'appointment/Appointment/PrintAppointment',
                    data: inputData,
                    type: 'post',
                    // onComplete:$scope.backToList
                };
                utl.Http.doDownload(options);
            }
        };
        /* Print Coding - End  */

        var sort_by = function (field, reverse, primer) {
            var key = primer ?
                function (x) {
                    return primer(x[field])
                } :
                function (x) {
                    return x[field]
                };

            reverse = !reverse ? 1 : -1;

            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }

        $scope.getPatientGuarantorCallback = function (scope, data, options, hasError) {
            if (data && data.PatientGuarantor) {
                data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
                if (!$scope.item.Encounters || $scope.item.Encounters.length <= 0) { // followup always Self
                    data.PatientGuarantor.sort(sort_by('GuarantorTypeId', false, parseInt));
                }
                $scope.PatientGuarantor = 1;
                $scope.lookup['Guarantor'] = data.PatientGuarantor;
                if ($scope.lookup.Guarantor && $scope.lookup.Guarantor.length > 1) {
                    $scope.item.GuarantorId = $scope.lookup.Guarantor[1].Id;
                    if ($scope.item && $scope.item.Encounters &&
                        $scope.item.Encounters.length > 0) {
                        $scope.item.GuarantorId = $scope.item.Encounters[0].GuarantorId;
                    }
                    $scope.currentcontext.GuarantorTypeId = $scope.lookup.Guarantor[1].GuarantorTypeId;
                    $scope.PatGuarantorNoofFreeVisit = $scope.lookup.Guarantor[1].NooFVisitFree;
                }
                $timeout(function () {
                    $scope.setDefaultService();
                }, 1500);
            }
        };

        $scope.getPatientGuarantor = function () {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var inputData = [{
                    Key: "PatientGuarantor",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: 2
                        }, {
                            Key: 2,
                            Value: $scope.item.PatientId
                        }]
                    }
                }];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPatientGuarantorCallback
                };
                utl.Http.doAction(options);
            }
        };

        function patientPickerCallback(patientdata) {
            $scope.item.PatientId = patientdata.pid;
            $scope.item.Id = patientdata.pid;
            $scope.getPastVisitInfo();
            $scope.getPatient();
            $scope.getPatientGuarantor();
        }

        $scope.pickPatient = function () {
            utl.Modal.openFixedDialog('app.patientpicker', {
                params: {},
                confirmCallback: patientPickerCallback
            });
        };

        function QMSPatientPickerCallback(patientdata) {
            $scope.item.PatientId = patientdata.pid;
            $scope.item.QMSId = patientdata.qmsid;

            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                $scope.item.Id = $scope.item.PatientId;
                $scope.getPastVisitInfo();
                $scope.getPatient();
                $scope.getPatientGuarantor();
                if (patientdata.patientdata.QMSStatusId == 2 && patientdata.patientdata.IsPatientCreated) {
                    utl.Alert.showErrorMsg($translate.instant('Regiatration Already Created For This Patient'));
                }
            } else {
                $scope.item.FirstName = patientdata.patientdata.FirstName;
                $scope.item.LastName = patientdata.patientdata.LastName;
                $scope.item.Age = patientdata.patientdata.Age;
                $scope.item.Mobile = patientdata.patientdata.Mobile;
                $scope.item.GenderId = patientdata.patientdata.GenderId;
                if ($scope.item.Age) {
                    $scope.calculateDOB($scope.item.Age, 'years');
                }
            }
        }

        $scope.pickQMSPatients = function () {
            utl.Modal.openFixedDialog('app.qmspatients', {
                params: {},
                confirmCallback: QMSPatientPickerCallback
            });
        };

        function OldPatientPickerCallback(patientdata) {
            // $scope.item.PatientId = patientdata.pid;
            $scope.item.PatArchId = patientdata.pid;
            $scope.getOldPatient();
        }
        $scope.pickOldPatient = function () {
            utl.Modal.openFixedDialog('app.patpickarchive', {
                params: {},
                confirmCallback: OldPatientPickerCallback
            });
        };
        $scope.getOldPatientCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                // $scope.fillDefaultValues();
                $scope.Patientdata = res.Data[0];
                $scope.item = res.Data[0];

                // if (!$scope.item.NooFVisitFree) {
                //     $scope.item.NooFVisitFree = 0;
                //     $scope.NooFVisitFreeDisabled = false;
                // } else $scope.NooFVisitFreeDisabled = true;

                $scope.item.PatArchId = $scope.item.Id;
                $scope.item.BannerPatientId = 0;
                $timeout(function () {
                    $scope.item.BannerPatientArchId = $scope.item.PatArchId;
                }, 100);
                $scope.setTempPatDefaultValue();
                $scope.getPatientProfilePic();
                $scope.GetGuarantor();
                // var ageObj = utl.Formatter.getDetailedAgeFromDOB($scope.item.DOB);
                // $scope.item.ApproxAgeDays = ageObj.d;
                // $scope.item.ApproxAgeMonths = ageObj.m;
                // $scope.item.Age = ageObj.y;

                // if (!$scope.currentcontext.TokenNo)
                //     $scope.getTokenDisplay();

                // $scope.getPatientBillInfo();
                // if ($scope.currentcontext.file && $scope.item.PatientId) {
                //     $scope.UploadPatientPhoto();
                // }

            }
            // $scope.getMRDFlowRequired();
            // $scope.getPatientAttachments();
        };

        $scope.getOldPatient = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.PatArchId
                },],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'registration/PatientArchive/GetPatientArchives',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOldPatientCallback
            };
            utl.Http.doAction(options);
        };

        $scope.PatInfoCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item != null) {
                $scope.CanShow = 1;
            }
            $scope.item.PatientId = $scope.item.Id;
            $scope.item.BannerPatientId = 0;
            $scope.OpBillPrint = false;
            $timeout(function () {
                $scope.item.BannerPatientId = $scope.item.Id;
            }, 100);
            if ($scope.item.MRNTypeId == 1) { // TEMP to Active Patient
                $scope.item.IsTempPatient = true;
                $scope.item.MRN = null;
                $scope.item.OverrideDuplicate = true;
            }
            // $scope.setTempPatDefaultValue();
            $scope.getPatientProfilePic();
            if ($scope.item.Encounters && $scope.item.Encounters.length > 0) {
                var encounteritem = $scope.item.Encounters[0];
                $scope.item.VisitTypeId = encounteritem.VisitTypeId;
                $scope.item.IsNoBill = encounteritem.IsNoBill;
                $scope.item.ReferredById = encounteritem.ReferralId;
                $scope.item.ReferralId = encounteritem.ReferralId;
                $scope.item.DepartmentId = encounteritem.DepartmentId;
                $scope.item.DoctorId = encounteritem.DoctorId;
                $scope.item.DiagnosisId = encounteritem.DiagnosisId;
                $scope.item.OtherDiagnosis = encounteritem.OtherDiagnosis;
                $scope.item.TeamId = encounteritem.TeamId;
                $scope.item.Comments = encounteritem.Comments;
                $scope.item.EncounterId = encounteritem.Id;
                $scope.item.IsMLC = encounteritem.IsMLC;
                $scope.item.PromotionalSchemeId = encounteritem.PromotionalSchemeId;
                $scope.AppointmentId = encounteritem.AppointmentId;

                if (encounteritem.EncounterTypeId == 2) {
                    utl.Alert.showErrorMsg($translate.instant('Already Admitted Patient !...'));
                    return false;
                }
                if ($scope.AppointmentId)
                    $scope.getOldPatientAppt();

                if (encounteritem.EncounterStatusId == 1) $scope.EncounterStatus = 'Checked-In';
                else $scope.EncounterStatus = 'Checked-Out';

                $scope.SaveCompleted = true;
                $scope.IsOpenEncounter = true;
                $scope.EnableSave = true;
            } else {
                $scope.EncounterStatus = 'Checked-Out';
                $scope.EnableSave = false;
            }
            $scope.lookup["Referral"].filter(function (item) {
                if (item.ReferralId == $scope.item.ReferralId)
                    $scope.item.ReferralTypeId = item.ReferralTypeId;
            });

            var ageObj = utl.Formatter.getDetailedAgeFromDOB($scope.item.DOB);
            $scope.item.ApproxAgeDays = ageObj.d;
            $scope.item.ApproxAgeMonths = ageObj.m;
            $scope.item.Age = ageObj.y;
            if ($scope.item.Age == null) {
                $scope.item.Age = 0;
            }

            if (!$scope.currentcontext.TokenNo)
                $scope.getTokenDisplay();

            $scope.getPatientBillInfo();
            if ($scope.currentcontext.file && $scope.item.PatientId) {
                $scope.UploadPatientPhoto();
            }
            $scope.getPatientGuarantor();
            if ($scope.item.PatientId > 0) {
                $scope.getPastVisitInfo();
                $scope.item.Id = $scope.item.PatientId;
            }
            $scope.getMRDFlowRequired();
            $scope.getPatientAttachments();
            $scope.getDefaultReferral();
        };

        $scope.patientChange = function (pageNo) {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.PatInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.patientChange = function () {
        //     $scope.item.ScheduleApptId = null;
        //     $scope.item.ScheduleApptTime = null;
        //     $scope.DefaultServiceInfo = [];
        //     $scope.pastvisitinfo = [];
        //     $scope.IsOpenEncounter = false;
        //     if ($scope.item.PatientId > 0) {
        //         $scope.getPastVisitInfo();
        //         $scope.item.Id = $scope.item.PatientId;
        //         $scope.getPatient();
        //     }
        //     if ($scope.item.MRNTypeId != 2) {
        //         $scope.item.MRNTypeId = 2;
        //         $scope.item.MRN = null;
        //     }
        // };

        $scope.canShowApproxAge = function (vTitleId) {
            if (vTitleId && $scope.lookup) {
                for (var idx in $scope.lookup.Title) {
                    if (vTitleId == $scope.lookup.Title[idx].Id)
                        if ($scope.lookup.Title[idx].Code.toLowerCase() == "babyof")
                            return true;
                }
            }
            return false;
        };

        $scope.fillGenderInfo = function () {
            $scope.item.title = $scope.item.TitleId.Text;
            if ($scope.item.TitleId == 10 || $scope.item.TitleId == 37) { // 10-MR 37-master
                $scope.item.GenderId = 1; // 1-Male
            } else if ($scope.item.TitleId == 11 || $scope.item.TitleId == 12 || $scope.item.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.item.GenderId = 2; // 2-FeMale
            }
        };

        $scope.SelectedTitle = function (selectedItem) {
            $scope.item.TitleId = selectedItem.Id;
            $scope.item.title = selectedItem.Text;
        };

        $scope.calculateAge = function () {
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
        };

        $scope.calculateDOB = function (age, substractPart) {
            var options = {
                d: $scope.item.ApproxAgeDays,
                m: $scope.item.ApproxAgeMonths,
                y: $scope.item.Age
            };
            $scope.item.DOB = utl.Formatter.getDOBFromAgeConfig(options);
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
            $scope.item.IsBirthDateApproximate = true;
        };

        $scope.saveAndApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.PatientStatus = 'Active';
            $scope.isSaveAndApprove = true;
            $scope.IsOpenEncounter = false;
            var msg = 'Are you Sure Do you Want Register and Create Visit For ' + $scope.item.title + ' ' + $scope.item.FirstName;
            if ($scope.item.PatientId > 0)
                var msg = 'Do You Want to Update for ' + $scope.item.Title.Description + ' ' + $scope.item.FirstName;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        function handlePatientExists(data) {
            var confirmOptions = {
                messageKey: 'registration.fullregistration.patient-exists-msg.lbl',
                placeholder: {
                    patientcount: (data * -1)
                },
                onSuccessMethod: function () {
                    $scope.item.OverrideDuplicate = true;
                    $scope.saveItem();
                }
            };

            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.fillDefaultValues = function () {
            var currentdate = utl.Formatter.getCurrentDate();
            $scope.pastvisitinfo = [];
            $scope.PatientGuarantor = 0;
            $scope.DefaultServiceTotalAmt = 0;
            $scope.PatientPaymentDetails = [];
            $scope.DefaultServiceInfo = [];
            $scope.lookup = {};
            $scope.currentcontext.PatientStatusId = 1;
            $scope.currentcontext.id = 0;
            $scope.currentcontext.RdoBillDiscount = true;
            $scope.currentcontext.RdoReceiptAmt = true;
            $scope.currentcontext.RdoBillDiscountMode = true;
            $scope.currentcontext.BillDiscount = 0;
            $scope.currentcontext.PaymentTypeId = 1;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.DiscountApprovedBy = -1;
            $scope.currentcontext.TotDiscAmount = 0;
            $scope.currentcontext.PaidAmt = 0;
            $scope.currentcontext.ReceiptAmt = null;
            $scope.currentcontext.TotBalanceAmt = 0;
            $scope.currentcontext.TotDueAmt = 0;
            $scope.currentcontext.GrossAmount = 0;
            $scope.IsDiscountApproved = false;
            $scope.BillWithComeReceipt = true;
            $scope.tabindexmap = {
                patienttabindex: 1,
                detailtabindex: 2
            };
            $scope.item.NoDraftBill = 1; // will not create draft bill
            $scope.item.NationalityId = 238 // India
            $scope.item.PreferredLanguageId = 4; //English
            $scope.item.MRNTypeId = 2; // Defaulted to MRN
            $scope.item.DoctorId = -1;
            $scope.item.DiagnosisId = -1;
            $scope.item.OtherDiagnosis = '';
            $scope.item.DepartmentId = -1;
            $scope.item.Id = 0;
            $scope.currentcontext.GuarantorTypeId = 1;
            $scope.item.GuarantorId = -1;
            $scope.item.AppointmentCategoryId = 5;
            $scope.item.AcutalGuarantorId = 0;
            $scope.item.VisitTypeId = 1;
            $scope.item.RegisteredDate = utl.Formatter.getDateStringForAppointment(currentdate);
            $scope.item.NationalityId = 238 // India
            $scope.item.PreferredLanguageId = 4; //English
            $scope.item.MRNTypeId = 2; // Defaulted to MRN
            $scope.item.IsPaidVisit = 0;
            $scope.item.FreeVisit = 0;
            $scope.item.LastFreeVisit = 0;
            $scope.item.IsNoBill = false;
            $scope.item.IsEmergency = false;
            $scope.GetGuarantor();
        };

        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        $scope.AddPaymentDetails = function () {
            $scope.PatientPaymentDetails = [];
            if (!$scope.PatientPaymentDetails || $scope.PatientPaymentDetails.length == 0) {
                if ($scope.currentcontext.ReceiptAmt > 0) {
                    $scope.currentcontext.PaymentTypeId = $scope.currentcontext.PaymentTypeId;
                    $scope.currentcontext.ReceiptTypeId = 2;
                    $scope.currentcontext.ReceiptStatusId = 1;
                }
            }
            var PatientPaymentDetail = {
                Id: 0,
                ReceiptDateTime: utl.Formatter.getCurrentDate(),
                FacilityId: utl.Session.getCurrentFacilityId(),
                OrganizationId: utl.Session.getCurrentOrgId(),
                PatientId: $scope.item.PatientId,
                ReceiptTypeId: $scope.currentcontext.ReceiptTypeId,
                EncounterId: null,
                EncounterTypeId: 1,
                PatientName: $scope.item.PatientName,
                AmountPaid: $scope.currentcontext.ReceiptAmt,
                DepartmentID: $scope.item.DepartmentId,
                PaymentcounterID: 0,
                GuarantorId: null, // Bo Need to Update PatientGuarantor Id
                GuarantorTypeId: $scope.currentcontext.GuarantorTypeId,
                ReceiptGeneratedById: utl.Session.getCurrentUserId(),
                ReceiptApprovedById: utl.Session.getCurrentUserId(),
                PaymentTypeId: $scope.currentcontext.PaymentTypeId,
                DoctorId: $scope.item.DoctorId,
                PatientBillId: null,
                CardHolderName: null,
                AuthorizedCode: $scope.item.AuthorizeNumber,
                GurantorName: null,
                Comments: $scope.item.Comments,
                CancelReason: null,
                ReceiptStatusId: $scope.currentcontext.ReceiptStatusId,
                TDSAmount: 0.00,
                Disallowance: 0.00,
                RoundOffValue: null,
                CreditNoteId: null,
                PaymentStatusId: 3,
                CollectedOn: utl.Formatter.getCurrentDate(),
                CardNumber: '',
                CardDateTime: null,
                CardExpiryDate: null,
                TerminalNoId: $scope.item.TerminalNoId,
                BankId: $scope.currentcontext.PaymentTypeId != 1 ? $scope.item.BankId : -1,
                PrivateDueId: $scope.currentcontext.PaymentTypeId != 1 ? $scope.item.PrivateDueId : -1,
                CardTypeId: $scope.currentcontext.PaymentTypeId == 5 ? $scope.item.CardTypeId : -1,
                ChequeNo: $scope.currentcontext.PaymentTypeId == 2 ? $scope.item.ChequeNo : '',
                UPIRefNumber: $scope.currentcontext.PaymentTypeId == 11 ? $scope.item.UPIRefNumber : '',
                ChequeDate: $scope.currentcontext.PaymentTypeId == 2 ? (!$scope.item.ChequeDate ? null : $scope.item.ChequeDate) : null,
                DDNumber: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDNumber) ? null : $scope.item.DDNumber : null,
                DDDate: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDDate) ? null : $scope.item.DDDate : null,
                WireTransferId: $scope.currentcontext.PaymentTypeId == 4 ? $scope.item.WireTransferId : null,
                WireTransferDate: $scope.currentcontext.PaymentTypeId == 4 ? (!$scope.item.WireTransferDate) ? null : $scope.item.WireTransferDate : null,
            }

            $scope.PatientPaymentDetails.push(PatientPaymentDetail);
        };

        $scope.CalProportinateDiscount = function () {
            if ($scope.currentcontext.BillDiscount > 0) {
                var billingitem = null;
                if ($scope.currentcontext.DiscountModeId > 0 && $scope.currentcontext.DiscountModeId == 2) {
                    for (var per = 0, perlen = $scope.DefaultServiceInfo.length; per < perlen; per++) {
                        billingitem = $scope.DefaultServiceInfo[per];
                        billingitem.DiscountModeId = $scope.currentcontext.DiscountModeId;
                        billingitem.DiscountPercentage = $scope.currentcontext.BillDiscount;
                        billingitem.ProportionateDiscount = $scope.currentcontext.BillDiscount / 100 * $scope.DefaultServiceInfo[per].Amount;
                    }
                } else if ($scope.currentcontext.DiscountModeId == 1) {
                    $scope.currentcontext.DiscountAmount = $scope.currentcontext.BillDiscount;
                    for (var inr = 0, inrlen = $scope.DefaultServiceInfo.length; inr < inrlen; inr++) {
                        billingitem = $scope.DefaultServiceInfo[inr];
                        var linepercentage = (100 / $scope.DefaultServiceTotalAmt) * $scope.DefaultServiceInfo[inr].NetAmount;
                        var netdiscountrupees = $scope.currentcontext.DiscountAmount / 100 * linepercentage;
                        billingitem.DiscountModeId = $scope.currentcontext.DiscountModeId;
                        billingitem.DiscountPercentage = 0;
                        billingitem.ProportionateDiscount = netdiscountrupees;
                    }
                }
            } else {
                for (var idx in $scope.DefaultServiceInfo) {
                    var item = $scope.DefaultServiceInfo[idx];
                    item.DiscountAmount = 0;
                    item.DiscountModeId = 0;
                    item.DiscountPercentage = 0;
                    item.ProportionateDiscount = 0;
                }
            }
        };

        $scope.getBillDataforSave = function () {
            var Data = {};
            for (var idx in $scope.DefaultServiceInfo) {
                var item = $scope.DefaultServiceInfo[idx];
                item.ReceivedAmount = item.NetAmount;
            }

            if ($scope.DefaultServiceInfo.length > 0) {
                $scope.CalProportinateDiscount();
                $scope.AddPaymentDetails();
                var totamt = $scope.DefaultServiceTotalAmt || 0;
                var receiptamt = $scope.currentcontext.ReceiptAmt || 0;
                var BillDiscount = $scope.currentcontext.TotDiscAmount || 0;
                var Outstandingamt = 0;
                if (!$scope.currentcontext.RoundOffValue) $scope.currentcontext.RoundOffValue = 0;
                var RoundOffValue = $scope.currentcontext.RoundOffValue;
                try {
                    if (BillDiscount > 0) {
                        BillDiscount = BillDiscount.toFixed(2);
                        BillDiscount = parseFloat(BillDiscount);
                    }
                } catch (ex) { }
                try {
                    Outstandingamt = ((parseFloat(totamt) + parseFloat(RoundOffValue)) - (parseFloat(receiptamt) + parseFloat(BillDiscount)));
                } catch (ex) { }

                Data = {
                    Header: {
                        Id: 0,
                        BillTypeId: 1, // OP
                        BillDateTime: new Date(),
                        BillDiscount: BillDiscount,
                        BillAmount: totamt || 0,
                        DiscountApprovedBy: $scope.currentcontext.DiscountApprovedBy,
                        BillDiscountModeId: $scope.currentcontext.DiscountModeId,
                        BillGeneratedBy: utl.Session.getCurrentUserId(),
                        PaidAmount: $scope.currentcontext.ReceiptAmt || 0,
                        OutStandingAmount: Outstandingamt,
                        CreditVocher: Outstandingamt,
                        PatientId: $scope.item.PatientId,
                        EncounterId: null, // Bo Need to Update
                        EncounterTypeId: 1, //OP Encounter
                        GuarantorId: null, // Bo Need to Update PatientGuarantor Id
                        GuarantorTypeId: $scope.currentcontext.GuarantorTypeId,
                        ServiceRateCategoryId: null,
                        DoctorId: $scope.item.DoctorId,
                        DoctorName: $scope.item.DoctorName,
                        PatientBillStatusId: 3,
                        FacilityId: utl.Session.getCurrentFacilityId(),
                        DepartmentId: $scope.item.DepartmentId,
                        OrganizationId: utl.Session.getCurrentOrgId(),
                        IsRegCumBill: 1,
                        RoundOffValue: $scope.currentcontext.RoundOffValue,
                        // LoadFrom : 'Bills',
                    },
                    paymentDetail: $scope.PatientPaymentDetails,
                    Details: $scope.DefaultServiceInfo,
                    adjustmentDetail: []
                };
            }

            return Data;
        };

        $scope.NoBill = function () {
            if ($scope.item.IsNoBill) {
                $scope.item.IsEmergency = false;
                $scope.DefaultServiceInfo = [];
                $scope.DefaultServiceTotalAmt = 0;
                $scope.CalculateNetAmt();
            } else {
                $scope.GetGuarantor();
            }
        };

        $scope.EmergencyCharge = function () {
            if ($scope.item.IsEmergency) {
                $scope.item.IsNoBill = false;
            }
            $scope.GetGuarantor();
        };

        $scope.getTokenDispCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.currentcontext.TokenNo = res.Data[0].TokenNo;
            }
        };

        $scope.getTokenDisplay = function () {
            if ($scope.AppointmentId) {
                var inputData = {
                    Params: [{
                        Key: 3,
                        Value: $scope.AppointmentId
                    }],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Appointment/AppointmentDisplay/GetAppointmentDisplays',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getTokenDispCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.afterSave = function (data, options) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == 'number') {
                $scope.AppointmentId = data;
                $scope.SaveCompleted = true;
                $scope.getTokenDisplay();
                $scope.getAppointment();
                $scope.EnableOPD = true;
                $scope.Vitals = true;
                $scope.PatientGuarantor = 1;
                // $scope.printOPBill();
                // $scope.getPatientBillInfo();
            }
            // if (window.clientcode.toLowerCase() == 'gloom') {
            //     $timeout(function () {
            //         //$scope.printOPBill();
            //         //$scope.printVisitSlip();
            //     }, 1000);
            // } else {
            //     $timeout(function () {
            //         $scope.printOPBill();
            //     }, 1000);
            // }
        };

        $scope.UploadPatientPhoto = function () {
            var actionName = 'registration/patient/UpdatePatient';
            if ($scope.currentcontext.file && $scope.item.PatientId) {
                $scope.data = {};
                $scope.data.PatientId = $scope.item.PatientId;
                $scope.data.Id = $scope.item.PatientId;
                $scope.data.MRNTypeId = 2;
                $scope.data.MRN = $scope.item.MRN;
                $scope.data.PatientStatus = 'Active';
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.data,
                    }
                }).then(function (resp) { //upload function returns a promise
                    if (resp.data < 0) {
                        handlePatientExists(resp.data);
                    } else {
                        console.log('Uploaded...');
                    }
                },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            if (data < 0) {
                handlePatientExists(data);
                $scope.EnableSave = true;
                $scope.currentcontext.canDisableApprove = false;
            } else {
                if (typeof (data) == 'number') {
                    $scope.EnableSave = true;
                    $scope.currentcontext.id = data;
                    $scope.afterSave(data, options);
                }
            }
        };

        $scope.errorItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
        };

        /* - Security IsValid */
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
                    utl.Modal.openFixedDialog('app.securitypincheck', {
                        params: {},
                        confirmCallback: $scope.SecurityPINChkCallback,
                        cancelCallback: $scope.securitypindiagCallback
                    });
                }
                return false;
            }
        };
        /* - Security IsValid */

        $scope.AlertForFreeVisit = function () {
            var msg = 'Now, Number of Free Visit is closed, can you continue Another guarantor';
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: null,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function () {

            if (savehitcompleted == 1) return;

            if ($scope.IsOpenEncounter) {
                utl.Alert.showErrorMsg($translate.instant('registration.registrationcumvisit.exapp.lbl'));
                return false;
            }

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (utl.Formatter.isFutureDate($scope.item.DOB)) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.dobdate-cant-future-msg.lbl'));
                return;
            }

            if (!$scope.item.LandLine && !$scope.item.Mobile) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.atleast-one-contactno-msg.lbl'));
                return;
            }

            if ($scope.currentcontext.GuarantorTypeId > 1 &&
                $scope.requirefreevisitalert) {
                try {
                    var noofvisitfree = 0;
                    noofvisitfree = parseInt($scope.item.NooFVisitFree);
                    $scope.item.NooFVisitFree = noofvisitfree;
                } catch (ex) { }

                if (!$scope.item.NooFVisitFree) {
                    $scope.AlertForFreeVisit();
                    return;
                } else if ($scope.item.NooFVisitFree == 0) {
                    $scope.AlertForFreeVisit();
                    return;
                }

            }

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */

            if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }
            if ($scope.item.PatArchId > 0) {
                $scope.item.Id = 0;
            }
            if ($scope.adrsmandatory == 1) {
                if (!$scope.item.StateId) {
                    utl.Alert.showErrorMsg($translate.instant('Please Select State!...'));
                    return;
                }
                if (!$scope.item.CityId) {
                    utl.Alert.showErrorMsg($translate.instant('Please Select City!...'));
                    return;
                }
                // if (!$scope.item.PinCodeId) {
                //     utl.Alert.showErrorMsg($translate.instant('Please Select PinCode!...'));
                //     return;
                // }
            }
            if (!$scope.EnableSave) {
                var actionName = 'registration/patient/RegCumVisitWithBill';
                if ($scope.isSaveAndApprove) {
                    $scope.currentcontext.canDisableApprove = true;
                }

                if ($scope.item.FirstName.indexOf(' ') >= 0) {
                    $scope.item.FirstName = $scope.item.FirstName.trim();
                }
                $scope.item.QMSId = $scope.item.QMSId;
                $scope.item.MRNTypeId = 2;
                if ($scope.AppointmentId > 0) {
                    $scope.item.AppointmentId = $scope.AppointmentId;
                }
                $scope.item.PatientStatus = 'Active';
                $scope.item.NoDraftBill = 1; // will not create draft bill
                $scope.item.IsRegCumBill = 1;
                $scope.item.GuarantorTypeId = $scope.currentcontext.GuarantorTypeId;
                $scope.item.IsPaidVisit = 0;
                if (!$scope.item.IsNoBill) {
                    if ($scope.DefaultServiceTotalAmt > 0) {
                        $scope.item.IsPaidVisit = 1;
                        $scope.item.FreeVisit = 0;
                    } else {
                        $scope.item.IsPaidVisit = 0;
                        $scope.item.FreeVisit = $scope.item.LastFreeVisit;
                    }
                }

                if ($scope.currentcontext.GuarantorTypeId > 1 &&
                    $scope.requirefreevisitalert) {
                    if ($scope.item.NooFVisitFree) {

                        $scope.item.NooFVisitFree--;

                        if (!$scope.item.FreeVisit) $scope.item.FreeVisit++;
                        else $scope.item.FreeVisit = $scope.item.LastFreeVisit;
                    }
                }

                if ($scope.item.VisitTypeId != 1 && $scope.item.NewVisitFree) {
                    $scope.item.NewVisitFree--;
                }

                savehitcompleted = 1;
                var options = {
                    action: actionName,
                    data: {
                        Data: {
                            Reg: {
                                Data: $scope.item,
                                file: null
                            },
                            Bill: {
                                Data: $scope.getBillDataforSave()
                            }
                        }
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback,
                    onError: $scope.errorItemCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.EnableSave) {
                var actionName = 'registration/patient/UpdatePatient';
                if ($scope.currentcontext.file) {
                    var actionUrl = utl.Http.getRootPath() + actionName;

                    Upload.upload({
                        url: actionUrl,
                        data: {
                            file: $scope.currentcontext.file,
                            Data: $scope.item
                        }
                    }).then(function (resp) { //upload function returns a promise
                        if (resp.data < 0) {
                            handlePatientExists(resp.data);
                        } else {
                            $scope.currentcontext.file = null;
                            var patientId = $scope.currentcontext.id > 0 ? $scope.currentcontext.id : resp.data;
                            $scope.afterSave(patientId);
                        }
                    },
                        function (resp) { //catch error
                            console.log('Error status: ' + resp.status);
                            utl.Alert.showErrorMsg('Error status: ' + resp.status);
                        },
                        function (evt) {
                            console.log(evt);
                        });
                    return false;
                } else {
                    var options = {
                        action: actionName,
                        data: {
                            Data: $scope.item,
                            file: $scope.currentcontext.file
                        },
                        type: 'post',
                        onComplete: $scope.saveItemCallback
                    };
                    utl.Http.doAction(options);
                }
            }
            $scope.CanShow = 1;
        };


        //autosearch related code starts for Occupation
        vm.occupationcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Occupation Id',
                field: 'OccupationId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Occupation Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Occupations',
                field: 'Occupations',
                datatype: 'string',
                headercls: 'td-Occupations',
                fieldcls: 'td-Occupations'
            },
            {
                header: 'Type',
                field: 'OccupationType',
                datatype: 'string',
                headercls: 'td-type',
                fieldcls: 'td-type'
            }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/Occupation/GetOccupations',
            formatdisplay: formatselectedoccupation,
            presearch: presearchoccupation,
            postsearch: postsearchoccupation
        };

        function formatselectedoccupation() {
            var selectedItem = vm.occupationcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Occupations + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.occupationcontrolconfig.rowdata) {
                result = [vm.occupationcontrolconfig.rowdata.OccupationId, vm.occupationcontrolconfig.rowdata.Code].join(' ');
            }
            // $scope.item.DoctorName = result;

            return result;
        }

        function presearchoccupation() {
            var query = vm.occupationcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.occupationcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }

            vm.occupationcontrolconfig.searchparams = inputData;
        }

        function postsearchoccupation() {
            for (var idx in vm.occupationcontrolconfig.result) {
                var item = vm.occupationcontrolconfig.result[idx];
                item.OccupationId = item.Id;
                item.Code = item.Code;
                item.Occupations = item.Occupations;
                item.OccupationType = item.OccupationType.Description;
            }
        }

        $scope.openattachments = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.openFixedDialog('app.patientattachments', {
                    params: {
                        pid: $scope.item.PatientId,
                        itemid: $scope.item.Id,
                        objecttypeid: 1
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.savepatient-msg.lbl'));
            }
        };

        $scope.showCrossConsultation = function () {
            utl.Modal.openFixedDialog('app.regcumbilldrtransfer', {
                params: {
                    eid: $scope.item.EncounterId,
                    pid: $scope.item.PatientId,
                    doctorid: $scope.item.DoctorId
                },
                confirmCallback: $scope.savecrossconsultation
            });
        };

        $scope.opmlc = function () {
            utl.Modal.openFixedDialog('app.opmlcform', {
                params: {
                    eid: $scope.item.EncounterId,
                    pid: $scope.item.PatientId,
                    selectedPatient: $scope.item
                },
                // confirmCallback: $scope.savecrossconsultation
            });
        };

        $scope.savecrossconsultation = function (DrTransfer) {
            var ccdrid = [];
            for (var idx in DrTransfer.data) {
                var data = DrTransfer.data;
                if (data[idx].DoctorId > 0) {
                    ccdrid.push(data[idx].SelectedDoctor);
                }
            }
            if (ccdrid.length > 0) {
                var actionName = 'registration/patient/ManageCrossConsultation';
                var options = {
                    action: actionName,
                    data: {
                        Data: {
                            Reg: $scope.item,
                            DrTrnsferIds: ccdrid
                        }
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        };

        $scope.getPatientAttachments = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.item.PatientId
                }, {
                    Key: 3,
                    Value: 1
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };
            utl.Http.doAction(options);
        };


        $scope.getFollowupDeptwiseCallback = function (scope, res, options, hasError) {
            $scope.item.VisitTypeId = 1;
            if (res && res.Data && res.Data.length > 0 && !$scope.item.EncounterId) $scope.item.VisitTypeId = 2;
            else if (res && res.Data && res.Data.length > 1 && $scope.item.EncounterId) $scope.item.VisitTypeId = 2;
        }

        $scope.getFollowupDeptwise = function () {
            $scope.followupdeptwise =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'followupdeptwise');
            if ($scope.followupdeptwise) {
                if ($scope.item && $scope.item.PatientId) {
                    var inputData = {
                        Params: [{
                            Key: 4,
                            Value: $scope.item.PatientId
                        },
                        {
                            Key: 6,
                            Value: $scope.item.DepartmentId
                        },
                        {
                            Key: 15,
                            Value: 1
                        },
                        ],
                        PageContext: {
                            PageSize: 3,
                            PageNumber: 1
                        }
                    };
                    var options = {
                        action: 'Visit/Visit/GetEncounters',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getFollowupDeptwiseCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        }

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                // {
                //     header: 'Doctor Id',
                //     field: 'DoctorId',
                //     datatype: 'string',
                //     headercls: 'td-code',
                //     fieldcls: 'td-code'
                // },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Qualification',
                    field: 'Qualification',
                    datatype: 'string',
                    headercls: 'td-Qualification',
                    fieldcls: 'td-Qualification'
                },
                // {
                //     header: 'Speciality',
                //     field: 'Speciality',
                //     datatype: 'string',
                //     headercls: 'td-dept',
                //     fieldcls: 'td-dept'
                // },
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
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                if (selectedItem.Department) {
                    if (selectedItem.Department.IsEmergency == true)
                        $scope.item.IsEmergencyPatient = selectedItem.Department.IsEmergency;
                }
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }

            /* Doctor Share */
            $scope.DoctorClassId = selectedItem.DoctorClassId;
            $scope.DrIncludeTax = selectedItem.IsIncludeTax;
            $scope.DrShareDetailInfo = {};
            $scope.SerItmCalculateTax = false;
            $scope.SerItmGSTInfo = {};
            /* Doctor Share */

            $scope.item.ScheduleApptId = null;
            $scope.item.ScheduleApptTime = null;
            $scope.item.IsCheckedInAppt = false;
            $scope.item.DoctorName = result;
            $scope.DrDefaultServiceInfo = [];
            $scope.getDoctorTeam();
            $scope.getFollowupDeptwise();
            $scope.calDoctorShareInfo();
            return result;
        }


        $scope.calDoctorShareInfo = function () {
            $scope.DrShareDetailInfo = {};
            $scope.SerItmCalculateTax = false;
            $scope.SerItmGSTInfo = {};
            if ($scope.DoctorClassId > 0) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.DoctorClassId
                    },
                    {
                        Key: 4,
                        Value: 1
                    }, // EncounterTypeId
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/doctorshare/GetDoctorShare',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDoctorShareinfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.GetGuarantor();
            }
        }

        $scope.getDoctorShareinfoCallback = function (scope, res, options, hasError) {
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    $scope.DrShareDetailInfo = item.DoctorShareDetails;
                }
            }
            $scope.GetGuarantor();
        };


        $scope.CalculateDoctorShare = function () {
            try {
                if ($scope.DoctorClassId > 0 && $scope.DefaultServiceInfo.length > 0) {
                    var itemwiseGrossAmt = 0;
                    for (var i = 0, len = $scope.DefaultServiceInfo.length; i < len; i++) {
                        if ($scope.item.IsEmergency)
                            $scope.DefaultServiceInfo[i].Rate = $scope.DefaultServiceInfo[i].EmergencyRate;
                        $scope.DefaultServiceInfo[i].Amount = $scope.DefaultServiceInfo[i].Rate * $scope.DefaultServiceInfo[i].Quantity;
                        var itemGrossAmount = 0;
                        itemGrossAmount = isNaN(parseFloat($scope.DefaultServiceInfo[i].Amount)) ? 0 : parseFloat($scope.DefaultServiceInfo[i].Amount);
                        itemwiseGrossAmt += itemGrossAmount;
                    }
                    for (var idx1 in $scope.DefaultServiceInfo) {
                        var item = $scope.DefaultServiceInfo[idx1];
                        var discamt = 0;
                        var netamt = 0;
                        var amt = item.Amount;

                        //Line Item Discount
                        if ($scope.currentcontext.DiscountModeId > 0 && $scope.currentcontext.DiscountModeId == 2) { // percentage
                            discamt = (item.DiscountAmount / 100) * item.Amount;
                        } else if ($scope.currentcontext.DiscountModeId > 0 && $scope.currentcontext.DiscountModeId == 1) {
                            discamt = item.DiscountAmount;
                        }
                        netamt = amt - discamt;
                        item.NetAmount = netamt;
                        // Bill Level - Proportionate Discount
                        if ($scope.currentcontext.BillDiscount > 0) {
                            if ($scope.currentcontext.DiscountModeId > 0 && $scope.currentcontext.DiscountModeId == 2) {
                                discamt = $scope.currentcontext.BillDiscount / 100 * item.Amount;
                            } else if ($scope.currentcontext.DiscountModeId == 1) {
                                var disc_ = $scope.currentcontext.BillDiscount;
                                var linepercentage = (100 / itemwiseGrossAmt) * item.Amount;
                                var netdiscountrupees = disc_ / 100 * linepercentage;
                                discamt = netdiscountrupees;
                            }
                            netamt = amt - discamt;
                        }

                        if ($scope.DoctorClassId) {
                            for (var idx in $scope.DrShareDetailInfo) {
                                var shareitem = $scope.DrShareDetailInfo[idx];
                                if (shareitem.SharingTypeId == 1) { // Category wise share
                                    if (item.ServiceCategoryId == shareitem.ServiceCategoryId) {
                                        var EligiblePerAmount = 0;
                                        var SharePerAmount = 0;
                                        var TaxPerAmount = 0;
                                        item.DoctorClassId = $scope.DoctorClassId;
                                        item.EligiblePercentage = shareitem.EligiblePercentage;
                                        item.SharePercentage = shareitem.SharePercentage;
                                        item.ShareAmount = shareitem.ShareAmount;
                                        try {
                                            EligiblePerAmount = netamt * (item.EligiblePercentage / 100);
                                            SharePerAmount = EligiblePerAmount * (item.SharePercentage / 100);
                                            item.DoctorShare = SharePerAmount;
                                        } catch (ex) { }
                                        try {
                                            if ($scope.DrIncludeTax && item.DrTaxPercentage > 0) {
                                                TaxPerAmount = SharePerAmount * (item.DrTaxPercentage / 100);
                                                item.GSTAmount = TaxPerAmount;
                                                item.DrTaxAmount = TaxPerAmount;
                                                item.DoctorShare += item.GSTAmount;
                                                item.NetAmount += item.GSTAmount;
                                            }
                                            item.DoctorShare = parseFloat(item.DoctorShare).toFixed(2);
                                            item.NetAmount = parseFloat(item.NetAmount).toFixed(2);
                                            item.DoctorShare = parseFloat(item.DoctorShare);
                                            item.NetAmount = parseFloat(item.NetAmount);
                                        } catch (ex) { }
                                        break;
                                    }

                                } else if (shareitem.SharingTypeId == 2) { // Doctor wise share
                                    if (item.ServiceId == shareitem.ServiceId) {
                                        var EligiblePerAmount = 0;
                                        var SharePerAmount = 0;
                                        var TaxPerAmount = 0;
                                        item.DoctorClassId = $scope.DoctorClassId;
                                        item.EligiblePercentage = shareitem.EligiblePercentage;
                                        item.SharePercentage = shareitem.SharePercentage;
                                        item.ShareAmount = shareitem.ShareAmount;
                                        try {
                                            EligiblePerAmount = netamt * (item.EligiblePercentage / 100);
                                            if (shareitem.SharePercentage == 0) {
                                                SharePerAmount = (EligiblePerAmount / 100) * shareitem.ShareAmount;
                                            } else {
                                                SharePerAmount = EligiblePerAmount * (item.SharePercentage / 100);
                                            }
                                            item.DoctorShare = SharePerAmount;
                                        } catch (ex) { }
                                        try {
                                            if ($scope.DrIncludeTax && item.DrTaxPercentage > 0) {
                                                TaxPerAmount = SharePerAmount * (item.DrTaxPercentage / 100);
                                                item.GSTAmount = TaxPerAmount;
                                                item.DrTaxAmount = TaxPerAmount;
                                                item.DoctorShare += item.GSTAmount;
                                                item.NetAmount += item.GSTAmount;
                                            }
                                            item.DoctorShare = parseFloat(item.DoctorShare).toFixed(2);
                                            item.NetAmount = parseFloat(item.NetAmount).toFixed(2);
                                            item.DoctorShare = parseFloat(item.DoctorShare);
                                            item.NetAmount = parseFloat(item.NetAmount);
                                        } catch (ex) { }
                                        break;
                                    }
                                }
                            }
                        }

                    }
                }

            } catch (ex) { }

            $scope.currentcontext.ReceiptAmt = 0;
            $scope.DefaultServiceTotalAmt = 0;
            if ($scope.item.NewVisitFree > 0 && $scope.item.VisitTypeId != 1) {
                $scope.DefaultServiceInfo = [];
            }
            for (var idx in $scope.DefaultServiceInfo) {
                var item = $scope.DefaultServiceInfo[idx];
                $scope.DefaultServiceTotalAmt += item.NetAmount;
            }
            if (!$scope.SaveCompleted) {
                $scope.currentcontext.ReceiptAmt = $scope.DefaultServiceTotalAmt;
            }

        };



        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                },
                {
                    Key: 5,
                    Value: 2
                },
                {
                    Key: 2,
                    Value: utl.Session.getCurrentFacilityId()
                }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
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

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.getDoctorTeamCallback = function (scope, res, options, hasError) {
            //console.log(res);
            $scope.lookup.Team = [];
            $scope.item.TeamId = -1;
            if (res && res.length > 0) {
                for (var idx in res) {
                    var SelectedTeamId = res[idx].TeamId;
                    $scope.lookup.Team.push(utl.Lookup.getObject($scope.DrTeam, SelectedTeamId));
                    if ($scope.lookup.Team.length > 0 && res[idx].IsDefault)
                        $scope.item.TeamId = SelectedTeamId;
                }
            }
        };

        $scope.getDoctorTeam = function () {
            if ($scope.item.DoctorId) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.DoctorId
                    },
                        // { Key: 3, Value: true },
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'SystemSettings/UserTeam/GetUserTeams',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDoctorTeamCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getDoctorDefaultServiceCallback = function (scope, data, options, hasError) {
            $scope.DrDefaultServiceInfo = [];
            var CurrentServerDate = null;

            // if (!$scope.LastVisitDate && $scope.pastvisitinfo && $scope.pastvisitinfo.length > 0) {
            //     try {
            //         $scope.LastVisitDate = utl.Formatter.getDate($scope.pastvisitinfo[0].DischargeDate);
            //     } catch (ex) { $scope.LastVisitDate = null; }
            // }

            if (!$scope.LastVisitDate && $scope.pastvisitinfo && $scope.pastvisitinfo.length > 0) {
                try {
                    $scope.LastVisitDate = utl.Formatter.getDate($scope.pastvisitinfo[0].AdmissionDate);
                } catch (ex) {
                    $scope.LastVisitDate = null;
                }
            }



            if (data) {
                $scope.DrDefaultServiceInfo = data;
            }
            if ($scope.item.VisitTypeId > 1 && $scope.LastVisitDate) {
                for (var idx in $scope.DrDefaultServiceInfo) {
                    var item = $scope.DrDefaultServiceInfo[idx];

                    if ($scope.item.IsEmergency)
                        $scope.DrDefaultServiceInfo[idx].Amount = item.EmergencyRate;
                }
                var drdeftserviceinfo = $scope.DrDefaultServiceInfo;
                // $scope.DrDefaultServiceInfo = [];
                for (var idx in drdeftserviceinfo) {
                    var defaultserviceitem = drdeftserviceinfo[idx];
                    try {
                        CurrentServerDate = utl.Formatter.getDate(defaultserviceitem.CurrentDate);
                    } catch (ex) {
                        CurrentServerDate = null;
                    }
                    var vEligibledaysfrom = defaultserviceitem.DefaultFacilityEligibleDaysFrom;
                    var vEligibledays = defaultserviceitem.DefaultFacilityEligibleDays;
                    var vNoOfConsultationFree = defaultserviceitem.DefaultFacilityNoofVisitFree;
                    var date1 = $scope.LastVisitDate;
                    var date2 = CurrentServerDate;
                    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (vEligibledaysfrom <= diffDays && diffDays <= vEligibledays) {
                        $scope.DrDefaultServiceInfo = [];
                        $scope.DrDefaultServiceInfo.push(defaultserviceitem);
                        if (vNoOfConsultationFree > 0 && // No of Consultation free
                            vNoOfConsultationFree > ($scope.item.FreeVisit - 1)) {
                            $scope.DrDefaultServiceInfo = [];
                        }
                    } else if (diffDays > vEligibledays) {
                        $scope.DrDefaultServiceInfo = [];
                        $scope.DrDefaultServiceInfo.push(defaultserviceitem);
                        $scope.item.NewVisitFree = 0;
                    }
                }
            }


            if (!$scope.SaveCompleted) {
                $scope.currentcontext.ReceiptAmt = 0;
                for (var idx in $scope.DrDefaultServiceInfo) {
                    var item = $scope.DrDefaultServiceInfo[idx];
                    item.DoctorShare = item.DoctorShareAmount;
                    if (item.DoctorShare > 0) {
                        item.IsInvoicedDoctorShare = true;
                    }
                    $scope.DefaultServiceInfo.push(item);
                    $scope.DefaultServiceTotalAmt += item.NetAmount;
                    if (!$scope.item.NewVisitFree && !$scope.LastVisitDate) {
                        var vNoOfConsultationFree = item.DefaultFacilityNoofVisitFree;
                        $scope.item.NewVisitFree = vNoOfConsultationFree;
                    }
                }
                $scope.currentcontext.ReceiptAmt = $scope.DefaultServiceTotalAmt;
                $scope.CalculateNetAmt();

            }

            if ($scope.SaveCompleted) {
                $scope.DefaultServiceInfo = [];
                $scope.DefaultServiceTotalAmt = 0;
                $scope.CalculateNetAmt();
            }


        };

        $scope.getDoctorDefaultService = function () {
            $scope.autochargebasedondoctor =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'autochargebasedondoctor');
            if ($scope.autochargebasedondoctor) {
                if ($scope.item.DoctorId && $scope.item.DoctorId > 0) {
                    var NewVisit = $scope.item.VisitTypeId;
                    if (!NewVisit) NewVisit = 1;
                    var Data = {
                        'NewVisit': NewVisit,
                        'DoctorId': $scope.item.DoctorId,
                        'FacilityId': utl.Session.getCurrentFacilityId(),
                        'GuarantorTypeId': $scope.currentcontext.GuarantorTypeId,
                        'GuarantorId': $scope.item.AcutalGuarantorId,
                        'GuarantorServiceRateCategoryId': $scope.item.ServiceRateCategoryId_,
                    };
                    var options = {
                        action: 'SystemSettings/userdefaultservice/GetDoctorDefaultServices',
                        data: {
                            Data
                        },
                        type: 'post',
                        onComplete: $scope.getDoctorDefaultServiceCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        /* set Focus 07-02-18 */

        $scope.moveHeaderFocus = function (nextId) {
            $scope.CanShow = 0;
            if (event.keyCode == 13) {
                if (nextId == "pid") {
                    if ($scope.item && $scope.item.PatientId) $('#DoctorId').focus();
                    else {
                        var titledom = document.getElementById('title');
                        $scope.setCmbFocus(titledom);
                    }
                }
            }
        };

        $scope.setCmbFocus = function (dom) {
            $timeout(function () {
                var uiSelect = angular.element(dom);
                var uichild = uiSelect.controller('uiSelect');
                uichild.activate();
            }, 100);
        };

        $scope.FooterFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "paymenttype") {
                    if ($scope.currentcontext.PaymentTypeId == 1) {
                        nextId = "receivedamt";
                        $('#' + nextId).focus();
                    } else {
                        var banknamedom = document.getElementById('BankName');
                        $scope.setCmbFocus(banknamedom);
                    }
                } else if (nextId == "BankName") {
                    $timeout(function () {
                        if ($scope.currentcontext.PaymentTypeId == 2) {
                            nextId = "chequeno";
                            $('#' + nextId).focus();
                        } else if ($scope.currentcontext.PaymentTypeId == 3) {
                            nextId = "ddno";
                            $('#' + nextId).focus();
                        } else if ($scope.currentcontext.PaymentTypeId == 4) {
                            nextId = "transationno";
                            $('#' + nextId).focus();
                        } else if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                            nextId = "cardno";
                            $('#' + nextId).focus();
                        }
                    }, 500);
                } else if (nextId == "cardno") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        var dom1 = document.getElementById('TerminalNoId');
                        $scope.setCmbFocus(dom1);
                    }
                } else if (nextId == "TerminalNoId") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        var dom2 = document.getElementById('CardType');
                        $scope.setCmbFocus(dom2);
                    }
                } else if (nextId == "chequeno") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "CollectedOn";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "transationno") {
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "CollectedOn";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "ddno") {
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "CollectedOn";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "CollectedOn") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "Chequedate";
                        $('#' + nextId).focus();
                    }
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "dddate";
                        $('#' + nextId).focus();
                    }
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "transferredon";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "Chequedate") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "dddate") {
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "transferredon") {
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "CardType") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "receivedamt") {
                    if ($('#' + nextId).val() <= 0) {
                        var creditapproverdom = document.getElementById('creditapprover');
                        $scope.setCmbFocus(creditapproverdom);
                    } else {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "creditapprover") {
                    nextId = "saveAndApproveid";
                    $('#' + nextId).focus();
                }
            }
            if (event.keyCode == 39) { //right
                if (nextId == "btnsubmit") {
                    nextId = "saveAndApproveid";
                    $('#' + nextId).focus();
                }
            }
            if (event.keyCode == 37) { //left
                if (nextId == "saveAndApproveid") {
                    nextId = "btnsubmit";
                    $('#' + nextId).focus();
                }
            }
        };

        /* set Focus 07-02-18 */

        $scope.addReferral = function () {
            utl.Modal.openFixedDialog('app.referraltab.details', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.referralChange = function () {
            var refObj = utl.Lookup.getObject($scope.lookup.Referral, $scope.item.ReferrerId);
            $scope.item.ReferTypeId = refObj.ReferralTypeId;
            $scope.item.ReferralName = refObj.Text;
        };


        $scope.getDefaultReferralCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                var refObj = res.Data[0];
                $scope.item.ReferrerId = refObj.Id;
                $scope.item.ReferTypeId = 9;
                $scope.item.ReferralName = refObj.Text;
                $scope.item.ReferrerNumber = refObj.PhoneNo;
                $scope.item.ReferrerEmail = refObj.Email;
            }
        };


        $scope.getDefaultReferral = function () {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 2
                },
                {
                    Key: 6,
                    Value: true
                },
                ],
                PageContext: {
                    PageSize: 1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/referral/GetReferrals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDefaultReferralCallback
            };

            utl.Http.doAction(options);
        };

        $scope.referralTypeChangeCallback = function (scope, data, options, hasError) {
            $scope.lookup.Referral = data.Referral;
        };

        $scope.referralTypeChange = function () {
            var inputData = [{
                Key: "Referral",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: $scope.item.ReferTypeId
                    }]
                }
            }];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.referralTypeChangeCallback
            };
            utl.Http.doAction(options);
        };

        vm.referralcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Referral Code',
                field: 'ReferralCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Referral Name',
                field: 'ReferralName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Referral Type',
                field: 'ReferralType',
                datatype: 'string',
                headercls: 'td-type',
                fieldcls: 'td-type'
            },
            {
                header: 'PhoneNo',
                field: 'PhoneNo',
                datatype: 'string',
                headercls: 'td-phone',
                fieldcls: 'td-phone'
            },
            {
                header: 'Area',
                field: 'Area',
                datatype: 'string',
                headercls: 'td-area',
                fieldcls: 'td-area'
            }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/referral/GetReferrals',
            formatdisplay: formatselectedreferral,
            presearch: presearchreferral,
            postsearch: postsearchreferral
        };

        function formatselectedreferral() {
            var selectedItem = vm.referralcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.ReferrerNumber = selectedItem.PhoneNo;
                $scope.item.ReferrerEmail = selectedItem.Email;
                result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
            } else if (vm.referralcontrolconfig.rowdata) {
                result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
            }
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.item.ReferTypeId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.referralcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.ReferralId
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.referralcontrolconfig.searchparams = inputData;
        }

        function postsearchreferral() {
            for (var idx in vm.referralcontrolconfig.result) {
                var item = vm.referralcontrolconfig.result[idx];
                item.ReferralCode = item.ReferralCode;
                if (item.ReferralType)
                    item.ReferralType = item.ReferralType.Description;
                item.PhoneNo = item.PhoneNo;
                if (item.AddressLine1)
                    item.Area = item.AddressLine1 + ',' + item.CityName;
            }
        }

        vm.remarkcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Remark Name',
                field: 'Remarks',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Remark Type',
                field: 'RemarkType',
                datatype: 'string',
                headercls: 'td-type',
                fieldcls: 'td-type'
            }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/remark/GetRemarks',
            formatdisplay: formatselectedremark,
            presearch: presearchremark,
            postsearch: postsearchremark
        };

        function formatselectedremark() {
            var selectedItem = vm.remarkcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.RemarkId = selectedItem.Id;
                result = [selectedItem.Remarks].join(' ');
            } else if (vm.remarkcontrolconfig.rowdata) {
                result = [vm.remarkcontrolconfig.rowdata.Remarks].join(' ');
            }
            return result;
        }

        function presearchremark() {
            var query = vm.remarkcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.remarkcontrolconfig.searchbyid === true) {
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

            vm.remarkcontrolconfig.searchparams = inputData;
        }

        function postsearchremark() {
            for (var idx in vm.remarkcontrolconfig.result) {
                var item = vm.remarkcontrolconfig.result[idx];
                item.Remarks = item.Remarks;
                if (item.RemarkType) {
                    item.RemarkType = item.RemarkType.Description;
                }
            }
        }



        //autosearch related code starts for Diagnosis
        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'DiagnosisName',
                field: 'DiagnosisName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Version',
                field: 'Version',
                datatype: 'string',
                headercls: 'td-Version',
                fieldcls: 'td-Version'
            },
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-Speciality',
                fieldcls: 'td-Speciality'
            },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/diagnosis/GetDiagnosiss',
            formatdisplay: formatselecteddiagnosis,
            presearch: presearchdiagnosis,
            postsearch: postsearchdiagnosis
        };

        function formatselecteddiagnosis() {

            var selectedItem = vm.diagnosiscontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DiagnosisName + '(' + selectedItem.Code + ')' + selectedItem.Version].join('  ');
            } else if (vm.diagnosiscontrolconfig.rowdata) {
                result = [vm.diagnosiscontrolconfig.rowdata.Code, vm.diagnosiscontrolconfig.rowdata.DiagnosisName,
                vm.diagnosiscontrolconfig.rowdata.DiagnosisVersionId, vm.diagnosiscontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdiagnosis() {
            var query = vm.diagnosiscontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.diagnosiscontrolconfig.searchbyid == true) {
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

            vm.diagnosiscontrolconfig.searchparams = inputData;
        }

        function postsearchdiagnosis() {
            for (var idx in vm.diagnosiscontrolconfig.result) {
                var item = vm.diagnosiscontrolconfig.result[idx];
                item.Code = item.Code;
                item.DiagnosisName = item.DiagnosisName;
                item.Version = item.DiagnosisVersion.Description;
                item.Speciality = item.Speciality;
            }
        }
        //autosearch related code ends for Diagnosis

        $scope.getDiagnosisCallback = function (scope, data, options, hasError) {
            $scope.Diagnosis = data;

            $scope.item.ALOS = $scope.Diagnosis.LengthOfStay;
        };

        $scope.getDiagnosis = function () {
            var options = {
                action: 'clinicalmaster/diagnosis/GetDiagnosisById',
                data: {
                    Id: $scope.item.DiagnosisId
                },
                type: 'post',
                onComplete: $scope.getDiagnosisCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.DrTeam = $scope.lookup.Team;
            $scope.lookup.Team = [];
            $scope.lookup.Guarantor = [];
            $scope.getPrintNoOfCopies();
            $scope.getMRDFlowRequired();
            var facilitydata = $scope.lookup.Facility;
            for (var idx in facilitydata) {
                if (facilitydata[idx].Id > 0) {
                    $scope.item.DistrictId = facilitydata[idx].DistrictId;
                    $scope.item.CityId = facilitydata[idx].CityId;
                    $scope.item.StateId = facilitydata[idx].StateId;
                    $scope.item.CountryId = facilitydata[idx].CountryId;
                }
            }
            $scope.getDefaultReferral();
        };

        $scope.getPrintNoOfCopies = function () {
            try {
                $scope.NoofPrintPatientLabel =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'patientlabel');
                $scope.NoofPrintMRDLabel =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'mrdlabel');
            } catch (ex) { }
        };

        $scope.getMRDFlowRequired = function () {
            try {
                $scope.IsMRDFileRequest = 0;
                $scope.IsMRDFileRequest =
                    utl.FacilitySetting.getFacilitySettingValue('general', 'mrdfilerequest');
            } catch (ex) { }

            if ($scope.IsMRDFileRequest) {
                $scope.item.IsMRDRequest = true;
            }

            try {
                $scope.IsMRDFileCreation = 0;
                $scope.IsMRDFileCreation =
                    utl.FacilitySetting.getFacilitySettingValue('general', 'mrdfilecreation');
            } catch (ex) { }

            if ($scope.IsMRDFileCreation) {
                $scope.item.IsMRDFileCreation = true;
            }
        };

        $scope.openPastVisit = function () {
            utl.Modal.openFixedDialog('app.previousappointment', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId || 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Title"
            },
            {
                "Key": "Gender"
            },
            {
                "Key": "VisitType"
            },
            {
                "Key": "VipType"
            },
            {
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    } // Clinical Dept Only
                    ]
                }
            },
            {
                "Key": "Nationality"
            },
            {
                "Key": "Referral"
            },
            {
                "Key": "PaymentType"
            },
            {
                "Key": "Bank"
            },
            {
                "Key": "Religion"
            },
            {
                "Key": "Terminal"
            },
            {
                "Key": "CardType"
            },
            {
                "Key": "GuardianType"
            },
            {
                "Key": "GuarantorType"
            },
            {
                "Key": "Team"
            },
            {
                "Key": "MaritalStatus"
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
                "Key": "ReferralType"
            },
            {
                "Key": "DiscountMode"
            },
            {
                "Key": "DiscountApprover"
            },
            {
                "Key": "PrivateDueApprover"
            },
            {
                "Key": "Remark",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    }]
                }
            },
            {
                "Key": "EncounterStatus"
            },
            {
                "Key": "BloodGroup"
            },
            {
                "Key": "PatientType"
            },
            {
                "Key": "CovidVaccineDose"
            },
            {
                "Key": "PromotionalScheme"
            },
            {
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 0,
                        Value: utl.Session.getCurrentFacilityId()
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

        $scope.portalaccess = function (item) {
            var user = {
                TitleId: $scope.item.TitleId,
                ActionFrom: utl.Formatter.getCurrentDate(),
                GenderId: $scope.item.GenderId,
                FirstName: $scope.item.FirstName,
                MiddleName: $scope.item.MiddleName,
                LastName: $scope.item.LastName,
                Age: $scope.item.Age,
                DOB: $scope.item.DOB,
                NationalityId: $scope.item.NationalityId,
                LandLine: $scope.item.LandLine,
                Email: $scope.item.Email,
                Mobile: $scope.item.Mobile,
                CityId: $scope.item.CityId,
                StateId: $scope.item.StateId,
                CountryId: $scope.item.CountryId,
                PinCodeId: $scope.item.PinCodeId,
                Area: $scope.item.Area,
                City: $scope.item.City,
                State: $scope.item.State,
                Country: $scope.item.Country,
                UserName: $scope.item.MRN,
                Password: 'password',
                IsActive: true,
                ActiveStatus: 'Active',
                FacilityId: utl.Session.getCurrentFacilityId(),
                DepartmentId: utl.Session.getCurrentDepartmentId(),
                OrgId: utl.Session.getCurrentOrgId(),
                UserTypeId: 8,
                PatientId: $scope.item.Id,
                LoginPermission: 1,
                GroupCode: 'PATIENTPORTAL'
            }; //UserType - Patient

            var options = {
                action: 'SystemSettings/User/AddUser',
                data: {
                    Data: user
                },
                type: 'post',
                onComplete: $scope.saveUserCallback
            };
            utl.Http.doAction(options);

        }

        $scope.CalculateNetAmt = function () {

            $scope.CalculateDoctorShare();

            if ($scope.currentcontext.PaymentTypeId == 6) {
                $scope.currentcontext.PaymentTypeId = 1;
            }
            var itemwiseGrossAmt = 0
            var itemwiseNetAmt = 0;
            var itemwiseDiscountAmt = 0;
            var itemnetAmount = 0;
            var itemGrossAmount = 0;
            var itemDiscountAmount = 0;
            for (var i = 0, len = $scope.DefaultServiceInfo.length; i < len; i++) {
                itemnetAmount = isNaN(parseFloat($scope.DefaultServiceInfo[i].Amount)) ? 0 : parseFloat($scope.DefaultServiceInfo[i].Amount);
                itemGrossAmount = isNaN(parseFloat($scope.DefaultServiceInfo[i].NetAmount)) ? 0 : parseFloat($scope.DefaultServiceInfo[i].NetAmount);
                itemDiscountAmount = 0;
                itemwiseGrossAmt += itemGrossAmount;
                itemwiseNetAmt += itemnetAmount;
                itemwiseDiscountAmt += itemDiscountAmount;
            }
            $scope.currentcontext.PaidAmt = (!$scope.currentcontext.PaidAmt) ? 0 : $scope.currentcontext.PaidAmt;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.TotBalanceAmt = 0;
            $scope.currentcontext.GrossAmount = itemwiseGrossAmt;
            $scope.currentcontext.TotDiscAmount = 0;

            $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? 0 : $scope.currentcontext.ReceiptAmt;

            if (parseFloat($scope.currentcontext.BillDiscount) > 0) {
                if ($scope.currentcontext.DiscountModeId > 0 && $scope.currentcontext.DiscountModeId == 2) {
                    $scope.currentcontext.TotDiscAmount = parseFloat($scope.currentcontext.BillDiscount) / 100 * $scope.currentcontext.GrossAmount;
                } else if ($scope.currentcontext.DiscountModeId == 1) {
                    $scope.currentcontext.TotDiscAmount = parseFloat($scope.currentcontext.BillDiscount);
                }
            }
            if ($scope.currentcontext.TotDiscAmount > 0) {
                $scope.DiscountAlert = '';
                $scope.IsDiscountApproved = true;
                if ($scope.currentcontext.DiscountApprovedBy > 0) {
                    if ($scope.DiscountLimit != null && $scope.currentcontext.TotDiscAmount > $scope.DiscountLimit) {
                        $scope.currentcontext.BillDiscount = 0;
                        $scope.DiscountAlert = 'Maximum Discount of Rs.' + $scope.DiscountLimit + ' Only Can be Given For the Selected Discount Approver';
                        utl.Alert.showErrorMsg($scope.DiscountAlert);
                        $scope.IsDiscountApproved = false;
                    }
                } else {
                    //                     $scope.currentcontext.BillDiscount = 0;
                    $scope.DiscountAlert = 'Please Select Due Approver';
                    utl.Alert.showErrorMsg($scope.DiscountAlert);
                    $scope.IsDiscountApproved = false;
                }
            }

            if (!$scope.currentcontext.ReceiptAmt) $scope.currentcontext.ReceiptAmt = 0;
            $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.TotDiscAmount);
            if ($scope.currentcontext.ReceiptAmt < 0) $scope.currentcontext.ReceiptAmt = 0;


            $scope.currentcontext.Received = $scope.currentcontext.ReceiptAmt != 0 ?
                $scope.currentcontext.ReceiptAmt : $scope.currentcontext.PaidAmt != 0 ? $scope.currentcontext.PaidAmt : 0;
            $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? null : $scope.currentcontext.ReceiptAmt;

            var NetNaturalValue = getNatural(Number($scope.currentcontext.Received).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.currentcontext.Received).toFixed(2));
            var NetRoundOffValue = 0;
            $scope.currentcontext.RoundOffValue = 0;
            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.currentcontext.ReceiptAmt = NetNaturalValue;
                $scope.currentcontext.Received = NetNaturalValue;
                NetRoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.currentcontext.ReceiptAmt = NetNaturalValue + 1;
                $scope.currentcontext.Received = NetNaturalValue + 1;
                NetRoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
            } else {
                NetRoundOffValue = 0;
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
            }

            $scope.currentcontext.TotNetAmount = parseFloat($scope.currentcontext.GrossAmount) - parseFloat($scope.currentcontext.TotDiscAmount);
            $scope.currentcontext.TotBalanceAmt = (parseFloat($scope.currentcontext.TotNetAmount) + $scope.currentcontext.RoundOffValue) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
            var billBalance = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.PaidAmt);
            if (!$scope.SaveCompleted) {
                try {
                    $scope.currentcontext.TotBalanceAmt = $scope.currentcontext.TotBalanceAmt.toFixed(2);
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotBalanceAmt);
                } catch (ex) { }
                if ($scope.currentcontext.ReceiptAmt > $scope.currentcontext.GrossAmount || $scope.currentcontext.TotBalanceAmt < 0) {
                    $scope.currentcontext.ReceiptAmt = null;
                    $scope.currentcontext.BillDiscount = 0;
                    $scope.currentcontext.TotBalanceAmt = billBalance;
                    utl.Alert.showErrorMsg($translate.instant('billing.ipbillingtab.billdiscount.lbl'));
                }
                if ($scope.currentcontext.TotDiscAmount > $scope.currentcontext.GrossAmount || $scope.currentcontext.TotBalanceAmt < 0) {
                    $scope.currentcontext.dBillDiscount = 0;
                    $scope.currentcontext.ReceiptAmt = null;
                    $scope.currentcontext.BillDiscount = 0;
                    $scope.currentcontext.TotBalanceAmt = 0;
                    utl.Alert.showErrorMsg($translate.instant('billing.ipbillingtab.billdiscount.lbl'));
                }
            }
            if ($scope.BillInfo && $scope.BillInfo.length > 0) {
                $scope.setDispBillinfo();
            }
        };

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        $scope.visitCancel = function () {
            utl.Modal.openFixedDialog('app.opvisitcancel', {
                params: {
                    pid: $scope.item.Id,
                    eid: $scope.item.EncounterId,
                    bill: $scope.BillInfo
                },
                confirmCallback: $scope.visitcancelcallback
            });
        }

        $scope.visitcancelcallback = function (data) {
            $state.reload();
        }


        $scope.initLookup();

    }

    regcumvisitwithbillController.$inject = ['$rootScope', '$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();