(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PrescriptionRxController', PrescriptionRxController);

    function PrescriptionRxController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.prescriptionDetails = [];
        $scope.PrevprescriptionDetails = [];
        $scope.item = {
            SearchTypeId: 1,
            DurationPeriodId: 1,
            DrugInstructionId: 1,
            Morning: 0,
            Noon: 0,
            Night: 0,
            PharmacyId: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            PrecriptionStatusId: 3,
            PrescriptionDate: utl.Formatter.getCurrentDate(),
            PrescriptionPriorityId: 1,
            AdministerStatusId: 2,
            DrugInstructionId: 2,
            STAT: false,
            DrugFrequencyId: null,
            IsCash: true
        };

        $scope.IsEdit = false;
        $scope.lookup = {};
        $scope.itemDetail = {};
        var savecompleted = 0;
        $scope.currentcontext = {};
        var ItemMrPriceCount = 0;
        var ItemStockCount = 0;
        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;
        }
        $scope.currentcontext.context = $stateParams.context;
        $scope.IsSavePanels = false;
        $scope.CanshowPrint = false;
        $scope.IsDisabled = false;
        if ($stateParams.details) {
            $scope.prescriptionDetails = $stateParams.details;
        }
        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if ($stateParams.id) {
            $scope.currentcontext.prescribeid = $stateParams.id;
        } else {
            $scope.currentcontext.prescribeid = 0;
        }
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.cid) {
            $scope.currentcontext.copyid = $stateParams.cid;
            $scope.currentcontext.prescribeid = $scope.currentcontext.copyid;
        }
        $scope.generateemar = 0;
        $scope.isModified = false;
        $scope.radioinfo = {};
        vm.TypingMethod = [];
        vm.TypingMethod = [{
                Id: 1,
                Text: $translate.instant('patientemr.prescription-form.medicinename.lbl')
            },
            {
                Id: 2,
                Text: $translate.instant('patientemr.prescription-form.genericname.lbl')
            }
        ]

        $scope.generateemar =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'generateemar');

        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
            $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.AppointmentId;
            $scope.item.PatientGuarantorId = $scope.currentcontext.encounter.PatientGuarantorId;
            $scope.item.GuarantorId = $scope.currentcontext.encounter.GuarantorId;
        }

        $scope.item.IseMAR = $scope.generateemar;

        $scope.hideqtymrp = 0;
        $scope.hideqtymrp = utl.FacilitySetting.getFacilitySettingValue('billing', 'hideqtymrp');

        $scope.addprescription = function () {
            if ($scope.Context == 'surgery') {
                $state.go('surgeryentry.prescribetab.rxprescriptions');
            } else {
                $state.go('patientemr.prescribetab.rxprescriptions');
            }
        };
        $scope.addDrug = function () {
            utl.Modal.open('app.itemmastertab.itemmasterdrug', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.favprescribe = function () {
            if ($scope.Context == 'surgery') {
                $state.go('surgeryentry.prescribetab.favprecriptions', {
                    pid: $scope.currentcontext.pid
                });
            } else {
                $state.go('patientemr.prescribetab.favprecriptions', {
                    pid: $scope.currentcontext.pid
                });
            }
        };


        $scope.setMaster = function (dp) {
            $scope.selected = dp;
        }

        $scope.isSelected = function (dp) {
            return $scope.selected === dp;
        }
        $scope.editPrescribe = function () {
            $scope.currentcontext.prescribeid = $scope.currentcontext.id;
            $scope.IsEdit = true;
            $scope.getList();
        }

        $scope.selectedFrequency = function (selectedItem) {
            $scope.item.DrugFrequency = selectedItem.Text;
        }

        $scope.selectedRoute = function (selectedItem) {
            $scope.item.DrugRoute = selectedItem.Text;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            // $scope.currentcontext.option = 'addprescribe';PrecriptionStatusId
            if (res.Data.length > 0) {
                $scope.CanshowPrint = true;
                $scope.IsDisabled = true;
            }
            if ($scope.IsEdit == true && $scope.currentcontext.prescribeid > 0) {
                $scope.prescriptionDetails = [];
                for (var idx in res.Data) {
                    res.Data[idx].cid = res.Data[idx].Id;
                    // res.Data[idx].Id = 0;
                    // res.Data[idx].PrescriptionId = 0;
                    // res.Data[idx].stat = '';
                    if (res.Data[idx].STAT) {
                        res.Data[idx].stat = 'STAT';
                    }
                    $scope.itemDetail = res.Data[0].Prescription;
                    // $scope.item.PrescriptionIdentifier = '';
                    $scope.item.PrescriptionDate = utl.Formatter.getCurrentDate();
                    // $scope.item.Id = 0;
                    // $scope.item.Identifier = '';
                    if ($scope.currentcontext.encounter) {
                        $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
                        $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
                        $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
                        $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
                        $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
                        $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
                        $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.AppointmentId;
                        $scope.item.PatientGuarantorId = $scope.currentcontext.encounter.PatientGuarantorId;
                        $scope.item.GuarantorId = $scope.currentcontext.encounter.GuarantorId;
                    }
                    $scope.item.IseMAR = $scope.generateemar;
                    $scope.item.SearchTypeId = 1;
                    $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
                    $scope.item.PrescriptionDate = utl.Formatter.getCurrentDate();
                    $scope.item.AdministerStatusId = 2;
                    // $scope.item.Rev = 0;
                    $scope.item.PrescriptionId = 0;
                    $scope.item.PrescriptionPriorityId = 1;
                    $scope.currentcontext.id = $scope.itemDetail.Id;
                    $scope.prescriptionDetails.push(res.Data[idx]);
                    $scope.IsDisabled = false;
                    $scope.CanshowPrint = false;
                }
            }
            if (($scope.IsEdit == false || !$scope.IsEdit) && $scope.currentcontext.prescribeid > 0) {
                $scope.prescriptionDetails = [];
                for (var idx in res.Data) {
                    res.Data[idx].cid = res.Data[idx].Id;
                    res.Data[idx].Id = 0;
                    res.Data[idx].PrescriptionId = 0;
                    res.Data[idx].stat = '';
                    if (res.Data[idx].STAT) {
                        res.Data[idx].stat = 'STAT';
                    }
                    $scope.item = res.Data[0].Prescription;
                    $scope.item.PrescriptionIdentifier = '';
                    $scope.item.PrescriptionDate = utl.Formatter.getCurrentDate();
                    $scope.item.Id = 0;
                    $scope.item.Identifier = '';
                    if ($scope.currentcontext.encounter) {
                        $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
                        $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
                        $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
                        $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
                        $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
                        $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
                        $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.AppointmentId;
                        $scope.item.PatientGuarantorId = $scope.currentcontext.encounter.PatientGuarantorId;
                        $scope.item.GuarantorId = $scope.currentcontext.encounter.GuarantorId;
                    }
                    $scope.item.IseMAR = $scope.generateemar;
                    $scope.item.SearchTypeId = 1;
                    $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
                    $scope.item.PrescriptionDate = utl.Formatter.getCurrentDate();
                    $scope.item.AdministerStatusId = 2;
                    $scope.item.PrescriptionId = 0;
                    $scope.item.PrescriptionPriorityId = 1;
                    $scope.currentcontext.id = 0;
                    $scope.prescriptionDetails.push(res.Data[idx]);
                    $scope.IsDisabled = false;
                    $scope.CanshowPrint = false;
                }
            }
            if ($scope.currentcontext.prescribeid == 0) {
                if (res.Data.length > 0) {
                    var lastIndex = res.Data.length - 1;
                    $scope.LastPrescribe = res.Data[lastIndex];
                    $scope.currentcontext.id = $scope.LastPrescribe.PrescriptionId;
                    $scope.getLatestPrescribeDetails();
                }
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    },
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentcontext.eid
                    // },
                    {
                        Key: 5,
                        Value: 3
                    },
                ],
            };
            if ($scope.currentcontext.prescribeid) {
                inputData.Params.push({
                    Key: 2,
                    Value: $scope.currentcontext.prescribeid
                });
            }
            if (!$scope.currentcontext.prescribeid) {
                inputData.Params.push({
                    Key: 4,
                    Value: $scope.currentcontext.eid
                });
            }
            var options = {
                action: 'emr/prescriptiondetail/GetPrescriptionDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getLatestPrescribeDetailsCallback = function (scope, res, options, hasError) {
            $scope.prescriptionDetails = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.stat = '';
                if (item.STAT) {
                    item.stat = 'STAT';
                }
                $scope.prescriptionDetails.push(item);
            }
            // if (res.Data.length > 0) {
            //     $scope.item = res.Data[0].Prescription;
            // }
        };

        $scope.getLatestPrescribeDetails = function () {
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 5,
                        Value: 3
                    },
                ],
            };
            if ($scope.currentcontext.id) {
                inputData.Params.push({
                    Key: 2,
                    Value: $scope.currentcontext.id
                });
            }
            var options = {
                action: 'emr/prescriptiondetail/GetPrescriptionDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getLatestPrescribeDetailsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.print = function () {
            // var inputData = {
            //     Params: [{
            //         Key: 3,
            //         Value: $scope.currentcontext.pid
            //     }, ],
            // };
            // if ($scope.currentcontext.prescribeid) {
            //     inputData.Params.push({
            //         Key: 2,
            //         Value: $scope.currentcontext.prescribeid
            //     });
            // }
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/prescription/PrintPrescription',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.getprescribeDetailByIdCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            // $scope.item.Id = 0;
            // $scope.item.ischanged = true;
            $scope.isModified = true;
            console.log($scope.item);
            if ($scope.currentcontext.encounter) {
                $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
                $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
                $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
                $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
                $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
                $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
                $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.AppointmentId;
                $scope.item.PatientGuarantorId = $scope.currentcontext.encounter.PatientGuarantorId;
                $scope.item.GuarantorId = $scope.currentcontext.encounter.GuarantorId;
            }
            $scope.item.IseMAR = $scope.generateemar;
            $scope.item.SearchTypeId = 1;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.PrescriptionDate = utl.Formatter.getCurrentDate();
            $scope.item.AdministerStatusId = 2;
            $scope.item.PrescriptionId = 0;
            $scope.item.PrescriptionPriorityId = 1;
            // $scope.currentcontext.id = data.PrescriptionId;
        };

        $scope.loadprescribeDetail = function (item, idx) {

            // var newobj = item;
            // $scope.item = {};
            $scope.item = item;
            // console.log($scope.item);

            $scope.item.ischanged = true;
            $scope.item.Id = 0;
            $scope.isModified = true;
            if ($scope.currentcontext.encounter) {
                $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
                $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
                $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
                $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
                $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
                $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
                $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.AppointmentId;
                $scope.item.PatientGuarantorId = $scope.currentcontext.encounter.PatientGuarantorId;
                $scope.item.GuarantorId = $scope.currentcontext.encounter.GuarantorId;
            }
            $scope.item.IseMAR = $scope.generateemar;
            $scope.item.SearchTypeId = 1;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.PrescriptionDate = utl.Formatter.getCurrentDate();
            $scope.item.AdministerStatusId = 2;
            // $scope.item.PrescriptionId = 0;
            $scope.item.PrescriptionPriorityId = 1;
            $scope.item.SearchTypeId = 1;
            console.log($scope.item);
        }

        $scope.getprescribeDetailById = function (item, idx) {
            // if (item.rid && item.rid > 0) {
            var options = {
                action: 'emr/prescriptiondetail/GetPrescriptionDetailById',
                data: {
                    Id: item.id
                },
                type: 'post',
                onComplete: $scope.getprescribeDetailByIdCallback
            };
            utl.Http.doAction(options);
            // }
            // else if (item.Id == 0) {
            //     // var newobj = item;
            //     // $scope.item = {};
            //     $scope.item = item;
            //     // console.log($scope.item);

            //     $scope.item.ischanged = true;
            //     $scope.item.Id = 0;
            //     $scope.isModified = true;
            //     if ($scope.currentcontext.encounter) {
            //         $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            //         $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
            //         $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            //         $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            //         $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            //         $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
            //         $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.AppointmentId;
            //         $scope.item.PatientGuarantorId = $scope.currentcontext.encounter.PatientGuarantorId;
            //         $scope.item.GuarantorId = $scope.currentcontext.encounter.GuarantorId;
            //     }
            //     $scope.item.IseMAR = $scope.generateemar;
            //     $scope.item.SearchTypeId = 1;
            //     $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            //     $scope.item.PrescriptionDate = utl.Formatter.getCurrentDate();
            //     $scope.item.AdministerStatusId = 2;
            //     // $scope.item.PrescriptionId = 0;
            //     $scope.item.PrescriptionPriorityId = 1;
            //     $scope.item.SearchTypeId = 1;
            //     console.log($scope.item);
            // }
        };


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.deletePrescribeDetailbyId = function (item) {
            var options = {
                action: 'emr/prescriptiondetail/DeletePrescriptionDetail',
                data: {
                    Id: item.Id
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.deletePrescriptionDetail = function (idx, selectedItem) {
            var name = selectedItem.DrugName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.item.AvailQuantity = 0;
            item.Dosage = 0;
            item.DrugCode = 0;
            item.DrugName = 0;
            item.Duration = 0;
            item.Morning = 0;
            item.Noon = 0;
            item.Night = 0;
            item.DrugInstructionId = 0;
            item.DurationPeriodId = 0;
            item.DrugId = 0;
            item.DrugGenericId = 0;
            item.DrugGenericCode = '';
            item.DrugGenericName = '';
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        };

        $scope.currentpatient = function () {
            $state.go('app.bedmanagementtab.inpatient');
        };

        // $scope.addNew = function () {
        //     if ($scope.currentcontext.encounter.IsBillLock == false) {
        //         $state.go('patientemr.prescription', {
        //             id: 0,
        //             pid: $scope.currentcontext.pid,
        //             context: $scope.currentcontext.context
        //         });
        //     } else {
        //         utl.Alert.showErrorMsg(" Bill is Locked");
        //     }
        // };

        $scope.addNew = function () {
            if ($scope.currentcontext.encounter.IsBillLock == false) {
                $scope.prescriptionDetails = [];
                $scope.IsDisabled = false;
                $scope.currentcontext.id = 0;
                $scope.currentcontext.prescribeid = 0;
                $scope.item.PrecriptionStatusId = 3;
                $scope.item.DrugFrequencyId = null;
            } else {
                utl.Alert.showErrorMsg(" Bill is Locked");
            }
        };

        $('.panel-title > a').click(function () {
            $(this).find('i').toggleClass('fa-plus fa-minus')
                .closest('panel').siblings('panel')
                .find('i')
                .removeClass('fa-minus').addClass('fa-plus');
            $("#collapseOne").toggle();
        });

        $scope.drugChanged = function (idx, item) {
            var instId = 1;
            if (item.SelectedItem.IsBottleType) {
                instId = -1;
                $scope.item.Morning = 0;
                $scope.item.Noon = 0;
                $scope.item.Night = 0;
            } else {
                instId = 1;
            }
            $scope.item.DrugCode = item.SelectedItem.DrugCode;
            $scope.item.DrugName = item.SelectedItem.DrugName;
            $scope.item.Dosage = item.SelectedItem.MaxDosagePerDay || 1;
            $scope.item.Price = parseFloat(item.SelectedItem.MrPrice).toFixed(2) || 0;
            $scope.item.AvailQuantity = item.SelectedItem.Quantity || 0;
            $scope.item.DrugGenericId = item.SelectedItem.GenericId || -1;
            $scope.item.DrugGenericCode = item.SelectedItem.GenericCode;
            $scope.item.DrugGenericName = item.SelectedItem.GenericName;
            $scope.item.Duration = item.SelectedItem.Duration || 1;
            $scope.item.DurationPeriodId = 1;
            $scope.item.IsBottleType = item.SelectedItem.IsBottleType;
            $scope.item.PackageType = item.SelectedItem.PackageType || '';
            $scope.item.PackageSize = item.SelectedItem.PackageSize || 0;
            $scope.item.DrugInstructionId = 2;
            $scope.item.Morning = 0;
            $scope.item.Noon = 0;
            $scope.item.Night = 0;
            var drugdata = $scope.item;
            if ($scope.item.SearchTypeId == 2) {
                $scope.item.SearchTypeId = 1;
            }
            $scope.computeQuantity(drugdata);
        };

        $scope.setMaster = function (dp) {
            $scope.selected = dp;
        }

        $scope.isSelected = function (dp) {
            return $scope.selected === dp;
        }

        $scope.durPeriodChange = function (info, item) {
            item.DurationPeriodId = info.Id;
            $scope.computeQuantity(item);
        }
        $scope.updatemedicine = function () {
            // var index = $scope.prescriptionDetails.indexOf(item);
            var isold = 0;
            var instructionId = -1;
            if ($scope.item.IsBottleType && !$scope.item.DrugInstructionId) {
                instructionId = -1;
            } else {
                instructionId = $scope.item.DrugInstructionId;
            }
            var stat = '';
            if ($scope.item.STAT) {
                stat = 'STAT';
            }
            var editPresDetail = {
                Id: 0,
                DrugId: $scope.item.DrugId,
                DrugCode: $scope.item.DrugCode,
                DrugName: $scope.item.DrugName,
                IsGeneric: false,
                IsBottleType: $scope.item.IsBottleType,
                GenericId: $scope.item.DrugGenericId,
                Dosage: $scope.item.Dosage,
                DrugRouteId: $scope.item.DrugRouteId,
                DrugRoute: $scope.item.DrugRoute,
                DrugFrequencyId: $scope.item.DrugFrequencyId,
                DrugFrequency: $scope.item.DrugFrequency,
                Duration: $scope.item.Duration,
                DurationPeriodId: $scope.item.DurationPeriodId,
                Morning: $scope.item.Morning,
                Noon: $scope.item.Noon,
                Night: $scope.item.Night,
                STAT: $scope.item.STAT,
                stat: stat,
                PackageType: '',
                PackageSize: $scope.item.PackageSize,
                Quantity: $scope.item.Quantity,
                Price: $scope.item.Price,
                NetAmount: $scope.item.NetAmount,
                AvailQuantity: $scope.item.AvailQuantity,
                DrugInstructionId: instructionId,
                Notes: $scope.item.Notes,
                Status: 1,
                PrecriptionStatusId: 3,
                SearchTypeId: $scope.item.SearchTypeId,
                PrescriptionIdentifier: null,
                DisplayPrecriptionStatus: null,
                StartDate: utl.Formatter.getCurrentDate(),
                AdministerStatusId: $scope.item.AdministerStatusId,
                IseMAR: $scope.item.IseMAR,
                ischanged: true
            }
            for (var pdx in $scope.prescriptionDetails) {
                var prescribe = $scope.prescriptionDetails[pdx];
                if ((prescribe.DrugId == editPresDetail.DrugId && editPresDetail.ischanged)) {
                    isold++;
                    prescribe.Status = 2;
                }
            }
            if (isold == 0) {
                editPresDetail.Id = 0;
            }
            // $scope.prescriptionDetails.splice(index, 1);
            $scope.prescriptionDetails.push(editPresDetail);
            $scope.computeQuantity(editPresDetail);
            $scope.ClearData();
        }

        $scope.addmedicine = function () {
            // console.log($scope.item);
            if ($scope.item.DrugId > 0 || $scope.item.GenericId > 0) {
                var instructionId = -1;
                if ($scope.item.IsBottleType && !$scope.item.DrugInstructionId) {
                    instructionId = -1;
                } else {
                    instructionId = $scope.item.DrugInstructionId;
                }
                var stat = '';
                if ($scope.item.STAT) {
                    stat = 'STAT';
                }
                var prescriptionDetail = {
                    Id: 0,
                    DrugId: $scope.item.DrugId,
                    DrugCode: $scope.item.DrugCode,
                    DrugName: $scope.item.DrugName,
                    IsGeneric: false,
                    IsBottleType: $scope.item.IsBottleType,
                    GenericId: $scope.item.DrugGenericId,
                    Dosage: $scope.item.Dosage,
                    DrugRouteId: $scope.item.DrugRouteId,
                    DrugRoute: $scope.item.DrugRoute,
                    DrugFrequencyId: $scope.item.DrugFrequencyId,
                    DrugFrequency: $scope.item.DrugFrequency,
                    Duration: $scope.item.Duration,
                    DurationPeriodId: $scope.item.DurationPeriodId,
                    Morning: $scope.item.Morning,
                    Noon: $scope.item.Noon,
                    Night: $scope.item.Night,
                    STAT: $scope.item.STAT,
                    stat: stat,
                    PackageType: '',
                    PackageSize: $scope.item.PackageSize,
                    Quantity: $scope.item.Quantity,
                    Price: $scope.item.Price,
                    NetAmount: $scope.item.NetAmount,
                    AvailQuantity: $scope.item.AvailQuantity,
                    DrugInstructionId: instructionId,
                    Notes: $scope.item.Notes,
                    Status: 1,
                    PrecriptionStatusId: 3,
                    SearchTypeId: $scope.item.SearchTypeId,
                    PrescriptionIdentifier: null,
                    DisplayPrecriptionStatus: null,
                    StartDate: utl.Formatter.getCurrentDate(),
                    AdministerStatusId: $scope.item.AdministerStatusId,
                    IseMAR: $scope.item.IseMAR,
                    SelectedItem: $scope.item.SelectedItem
                };
                if ((prescriptionDetail.DrugId > 0) && (!prescriptionDetail.Dosage || prescriptionDetail.Dosage === 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    $('#dgdoesage' + idx).focus();
                    return false;
                } else if ((prescriptionDetail.DrugId > 0) && (!prescriptionDetail.Duration || prescriptionDetail.Duration === 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    $('#dgduration' + idx).focus();
                    return false;
                } else if ((prescriptionDetail.DrugId > 0) && (!prescriptionDetail.DurationPeriodId || prescriptionDetail.DurationPeriodId === 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    $('#dgduraperiod' + idx).focus();
                    return false;
                } else if ((prescriptionDetail.DrugId > 0) && (!prescriptionDetail.Quantity || prescriptionDetail.Quantity == 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    $('#Quantity' + idx).focus();
                    return false;
                }
                // if (!checkExist(prescriptionDetail)) {
                //     $scope.prescriptionDetails.push(prescriptionDetail);
                // }
                if ($scope.IsEdit == true) {
                    prescriptionDetail.PrescriptionId = $scope.currentcontext.id;
                }
                $scope.prescriptionDetails.push(prescriptionDetail);
                $scope.computeQuantity(prescriptionDetail);
                $scope.ClearData();
            } else {
                utl.Alert.showErrorMsg('Select any Medicine');
                return false;
            }
        }

        $scope.ClearData = function () {
            document.getElementById("drugid").value = '';
            // document.getElementById("item_form").reset();
            $scope.item.DrugId = 0;
            $scope.item.Dosage = 0;
            $scope.item.Duration = 0;
            $scope.item.DurationPeriodId = 1;
            $scope.item.Notes = '';
            $scope.item.AvailQuantity = 0;
            $scope.item.Quantity = 0;
            $scope.item.Morning = 0;
            $scope.item.Noon = 0;
            $scope.item.Night = 0;
            $scope.item.STAT = false;
            $scope.item.DrugInstructionId = 2;
            $scope.item.DrugRouteId = -1;
            $scope.item.DrugFrequencyId = null;
        }
        $scope.clearDetails = function () {
            $scope.prescriptionDetails = [];
        }
        $scope.computeQuantity = function (item) {
            var totalDays = 0;
            var noOfTimes = 0;
            if (item.IsBottleType || item.STAT) {
                item.Quantity = 1;
            } else {
                if (item.DurationPeriodId == 1) { //Days
                    totalDays = item.Duration * 1;
                } else if (item.DurationPeriodId == 2) { //Weeks
                    totalDays = item.Duration * 7;
                } else if (item.DurationPeriodId == 3) { //Months
                    totalDays = item.Duration * 30;
                }
                if (item.Morning == '') {
                    item.Morning = 0;
                }
                if (item.Noon == '') {
                    item.Noon = 0;
                }
                if (item.Night == '') {
                    item.Night = 0;
                }
                if (item.Morning > 0) {
                    noOfTimes = noOfTimes + item.Morning;
                }
                if (item.Noon > 0) {
                    noOfTimes = noOfTimes + item.Noon;
                }
                if (item.Night > 0) {
                    noOfTimes = noOfTimes + item.Night;
                }
                if (item.DrugFrequencyId > 0) {
                    var drugFrequencyObj = utl.Lookup.getObject($scope.lookup.DrugFrequency, item.DrugFrequencyId);
                    var noOfTimes = drugFrequencyObj.NoOfTimes;
                }
                item.Quantity = noOfTimes * totalDays;
                if (item.PackageSize == 0 || item.PackageSize == 1 || !item.PackageSize) {
                    item.Quantity = noOfTimes * totalDays;
                } else {
                    item.Quantity = Math.ceil((item.Quantity / item.PackageSize));
                }
            }

        };

        $scope.onenter = function (item) {
            if (item == undefined) {
                $scope.item.DrugType = item;
            }
        };

        $scope.prescribe_history = function () {
            utl.Modal.open('patientemr.previousmedications', {
                params: {
                    pid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getItem
            });
        };
        if ($scope.hideqtymrp == 1) {
            vm.drugcontrolconfig = {
                query: '',
                searchbyid: false,
                options: [{
                        header: 'Code',
                        field: 'DrugCode',
                        datatype: 'string',
                        headercls: 'td-code',
                        fieldcls: 'td-code'
                    },
                    {
                        header: 'Name',
                        field: 'DrugName',
                        datatype: 'string',
                        headercls: 'td-name',
                        fieldcls: 'td-name'
                    },
                    {
                        header: 'Generic',
                        field: 'GenericMaster',
                        datatype: 'string',
                        headercls: 'td-generic',
                        fieldcls: 'td-generic'
                    }
                ],
                searchparams: {},
                result: {},
                api: 'clinicalmaster/DrugMaster/GetDrugMasters',
                formatdisplay: formatselecteddrugs,
                presearch: presearchdrugs,
                postsearch: postsearchdrugs
            };
        } else {
            vm.drugcontrolconfig = {
                query: '',
                searchbyid: false,
                options: [{
                        header: 'Code',
                        field: 'DrugCode',
                        datatype: 'string',
                        headercls: 'td-code',
                        fieldcls: 'td-code'
                    },
                    {
                        header: 'Name',
                        field: 'DrugName',
                        datatype: 'string',
                        headercls: 'td-name',
                        fieldcls: 'td-name'
                    },
                    {
                        header: 'Qty',
                        field: 'Quantity',
                        datatype: 'string',
                        headercls: 'td-qty',
                        fieldcls: 'td-qty'
                    },
                    {
                        header: 'Mrp',
                        field: 'MrPrice',
                        datatype: 'string',
                        headercls: 'td-mrp',
                        fieldcls: 'td-mrp'
                    },
                    {
                        header: 'Generic',
                        field: 'GenericMaster',
                        datatype: 'string',
                        headercls: 'td-generic',
                        fieldcls: 'td-generic'
                    }
                ],
                searchparams: {},
                result: {},
                api: 'clinicalmaster/DrugMaster/GetDrugMasters',
                formatdisplay: formatselecteddrugs,
                presearch: presearchdrugs,
                postsearch: postsearchdrugs
            };
        }

        function formatselecteddrugs() {
            var selectedItem = vm.drugcontrolconfig.selected;
            // $scope.item.DrugId = vm.drugcontrolconfig.selected.DrugId;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DrugName + '(' + selectedItem.DrugCode + ')'].join('  ');
            } else if (vm.drugcontrolconfig.rowdata) {
                result = [vm.drugcontrolconfig.rowdata.DrugCode, vm.drugcontrolconfig.rowdata.DrugName].join(' ');
            }
            return result;
        }

        function presearchdrugs() {
            var query = vm.drugcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: $scope.item.PharmacyId
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            if (vm.drugcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2 && $scope.item.SearchTypeId == 1) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                }, {
                    Key: 6,
                    Value: true
                });
            } else if (query && query.length > 2 && $scope.item.SearchTypeId == 2) {
                inputData.Params.push({
                    Key: 8,
                    Value: query
                }, {
                    Key: 6,
                    Value: true
                });
            }
            vm.drugcontrolconfig.searchparams = inputData;
        }

        function postsearchdrugs() {
            for (var idx in vm.drugcontrolconfig.result) {
                var item = vm.drugcontrolconfig.result[idx];
                item.DrugCode = item.DrugCode;
                item.DrugName = item.DrugName;
                if (item.DrugType)
                    item.DrugType = item.DrugType.Description;
                if (item.ItemMaster) {
                    if (item.ItemMaster.StockItem) {
                        item.Quantity = item.ItemMaster.StockItem.Quantity;
                    }
                    item.MrPrice = parseFloat(item.ItemMaster.MrPrice).toFixed(2);
                } else {
                    item.MrPrice = 0;
                }
                if (item.GenericMaster)
                    item.GenericMaster = item.GenericMaster.GenericName;
                if (item.DrugForm)
                    item.DrugForm = item.DrugForm.Description;
                if (item.DrugFrequency)
                    item.DrugFrequency = item.DrugFrequency.Name;
            }
        }


        vm.genericcontrolconfig = {
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
                    header: 'Name',
                    field: 'GenericName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                }
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/GenericMaster/GetGenericMasters',
            formatdisplay: formatselectedgenerics,
            presearch: presearchgenerics,
            postsearch: postsearchgenerics
        };

        function formatselectedgenerics() {
            var selectedItem = vm.genericcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.GenericName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.genericcontrolconfig.rowdata) {
                result = [vm.genericcontrolconfig.rowdata.Code, vm.genericcontrolconfig.rowdata.GenericName].join(' ');
            }
            return result;
        }

        function presearchgenerics() {
            var query = vm.genericcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.genericcontrolconfig.searchbyid === true) {
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

            vm.genericcontrolconfig.searchparams = inputData;
        }

        function postsearchgenerics() {
            for (var idx in vm.genericcontrolconfig.result) {
                var item = vm.genericcontrolconfig.result[idx];
                item.GenericCode = item.Code;
                item.GenericName = item.GenericName;
                // item.AllergenType = item.AllergenType.Description;
            }
        }

        $scope.getItemMasterStockDeailsCallBack = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var ItemCurrentStock = '';
                for (var idx in data.Data) {
                    if (data.Data[idx].Quantity || data.Data[idx].Quantity != '' || data.Data[idx].Quantity != null) {
                        ItemCurrentStock = data.Data[idx].Quantity;
                    }
                }
                if (ItemCurrentStock || ItemCurrentStock != '' || ItemCurrentStock != null) {
                    $scope.prescriptionDetails[ItemStockCount].AvailQuantity = ItemCurrentStock;
                }
            }
            ItemStockCount++;
        };

        $scope.getItemMasterStockDeails = function (ItemMasterId, StoreMasterId) {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: StoreMasterId
                    },
                    {
                        Key: 2,
                        Value: ItemMasterId
                    }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/StockItem/GetStockItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemMasterStockDeailsCallBack
            };

            utl.Http.doAction(options);
        };
        $scope.stat = function () {
            if ($scope.item.STAT == true) {
                $scope.item.Morning = 0;
                $scope.item.Noon = 0;
                $scope.item.Night = 0;
                $scope.item.Quantity = 1;
                // $scope.item.DrugInstructionId = -1;
            }
        }
        $scope.getItemMasterDeailsCallBack = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var ItemMrPrice = '';
                for (var idx in data.Data) {
                    if (data.Data[idx].MrPrice || data.Data[idx].MrPrice != '' || data.Data[idx].MrPrice != null) {
                        ItemMrPrice = data.Data[idx].MrPrice;
                    }
                }
                if (ItemMrPrice || ItemMrPrice != '' || ItemMrPrice != null) {
                    $scope.prescriptionDetails[ItemMrPriceCount].Price = ItemMrPrice;
                }
            }
            ItemMrPriceCount++;
        };

        $scope.getItemMasterDeails = function (ItemMasterId) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: ItemMasterId
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/ItemMaster/GetItemMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemMasterDeailsCallBack
            };

            utl.Http.doAction(options);
        };

        $scope.panelconfig = {
            paneltypeid: 4,
            selectedlist: {}
        };

        function checkExist(item) {
            for (var idx in $scope.prescriptionDetails) {
                if ((item.DrugId == $scope.prescriptionDetails[idx].DrugId) && ($scope.prescriptionDetails[idx].Status == 1)) {
                    return true;
                }
            }
            return false;
        }

        $scope.savePanels = function () {
            $scope.prescriptionDetails = [];
            var panelitem = $scope.panelconfig.selectedlist;
            ItemMrPriceCount = 0;
            ItemStockCount = 0;
            for (var indx in panelitem.TemplateMasterDetails) {
                var item = {
                    DrugId: panelitem.TemplateMasterDetails[indx].ItemId,
                    DrugGenericId: panelitem.TemplateMasterDetails[indx].DrugGenericId,
                    DrugGenericName: panelitem.TemplateMasterDetails[indx].DrugGenericName,
                    IsGeneric: false,
                    SearchTypeId: $scope.item.SearchTypeId,
                    DrugCode: panelitem.TemplateMasterDetails[indx].DrugCode || '',
                    DrugName: panelitem.TemplateMasterDetails[indx].DrugName || '',
                    Dosage: panelitem.TemplateMasterDetails[indx].Dosage || '',
                    Duration: panelitem.TemplateMasterDetails[indx].Duration || 0,
                    DurationPeriodId: panelitem.TemplateMasterDetails[indx].DurationPeriodId || 1,
                    DrugInstructionId: panelitem.TemplateMasterDetails[indx].DrugInstructionId || 1,
                    Quantity: panelitem.TemplateMasterDetails[indx].Quantity || 0,
                    AvailQuantity: 0,
                    Morning: panelitem.TemplateMasterDetails[indx].Morning,
                    Noon: panelitem.TemplateMasterDetails[indx].Noon,
                    Night: panelitem.TemplateMasterDetails[indx].Night,
                    Notes: panelitem.TemplateMasterDetails[indx].Notes,
                    Status: 1,
                    PrecriptionStatusId: 3,
                    StartDate: utl.Formatter.getCurrentDate(),
                    RxName: panelitem.TemplateMasterDetails[indx].DisplayName
                };
                if (!checkExist(item)) {
                    $scope.prescriptionDetails.push(item);
                    $scope.IsSavePanels = true;
                }
                // $scope.item.AdviceInstructions = panelitem.DrugAdvice;
                // $scope.item.AdviceInstructions = panelitem.AdviceInstructions;
                $scope.getItemMasterDeails(panelitem.TemplateMasterDetails[indx].ItemId);
                $scope.getItemMasterStockDeails(panelitem.TemplateMasterDetails[indx].ItemId, $scope.item.PharmacyId);
            }
        };

        $scope.saveasRxPanel = function () {
            var userObj = utl.Lookup.getObject($scope.lookup.User, utl.Session.getCurrentUserId());
            if (userObj) {
                $scope.currentcontext.userDepartmentId = userObj.DepartmentId;
                $scope.currentcontext.userId = userObj.Id;
            }
            var drugs = [];
            for (var idx in $scope.prescriptionDetails) {
                var prescriptionDetail = $scope.prescriptionDetails[idx];
                var DurationPeriod = '';
                if (prescriptionDetail.DurationPeriodId == 1) {
                    DurationPeriod = 'Days'
                }
                if (prescriptionDetail.DurationPeriodId == 2) {
                    DurationPeriod = 'Weeks'
                }
                if (prescriptionDetail.DurationPeriodId == 3) {
                    DurationPeriod = 'Months'
                }
                if (!prescriptionDetail.IsGeneric && prescriptionDetail.Status == 1 && prescriptionDetail.DrugName) {
                    var item = {
                        PanelMasterId: 0,
                        TemplateTypeId: 4,
                        ItemId: prescriptionDetail.DrugId,
                        DrugGenericId: prescriptionDetail.DrugGenericId,
                        DrugGenericName: prescriptionDetail.DrugGenericName,
                        DisplayName: prescriptionDetail.DrugName,
                        DrugCode: prescriptionDetail.DrugCode,
                        DrugName: prescriptionDetail.DrugName,
                        Notes: '',
                        Diagnosis: '',
                        Physiotheraphy: '',
                        Status: 1,
                        Morning: 1,
                        Noon: 1,
                        Night: 1,
                        Dosage: prescriptionDetail.Dosage,
                        Duration: prescriptionDetail.Duration,
                        DurationPeriod: DurationPeriod,
                        DurationPeriodId: prescriptionDetail.DurationPeriodId,
                        DrugInstructionId: prescriptionDetail.DrugInstructionId,
                        Quantity: prescriptionDetail.Quantity,
                        Notes: prescriptionDetail.Notes,
                        ReviewDate: utl.Formatter.getCurrentDate(),
                    };
                    drugs.push(item);
                }
            }
            utl.Modal.open('app.templatemaster', {
                params: {
                    id: 0,
                    templatetypeid: 4,
                    deptid: $scope.currentcontext.userDepartmentId,
                    userid: $scope.currentcontext.userId,
                    items: drugs,
                    advice: $scope.item.AdviceInstructions
                }
            });
        };

        $scope.prescribe = function () {
            $scope.saveItem(3);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            savecompleted = 0;
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Header.Id;
                    $scope.IsDisabled = true;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                $scope.currentcontext.id = data;
                $scope.currentcontext.prescribeid = data;
                $scope.IsDisabled = true;
            }
            $scope.ClearData();
            $scope.print();
            // $scope.getLatestPrescribeDetail();
        };

        $scope.saveItem = function (StatusId) {
            if (savecompleted == 1) return;
            if ($scope.item.PrecriptionStatusId != 3 && !utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.currentcontext.copyid > 0) {
                $scope.currentcontext.id = 0;
            }
            if (checkMandatoryFields()) {
                $scope.item.PrecriptionStatusId = StatusId;
                var lines = getLinesForSave();
                var actionName = 'emr/prescription/AddPrescription';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/prescription/UpdatePrescription';
                }
                // if ($scope.item.DrugFrequencyId == -1) {
                //     $scope.item.DrugFrequencyId = null;
                // }
                if ($scope.IsEdit == true) {
                    $scope.item.Id = $scope.currentcontext.id;
                    $scope.item.Identifier = $scope.itemDetail.Identifier;
                }
                var inputData = {
                    Header: $scope.item,
                    Details: lines
                };
                savecompleted = 1;
                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.prescriptionDetails, [{
                search: 1,
                fields: ['Status']
            }]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if ((item.DrugId > 0) && (!item.Dosage || item.Dosage === 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    $('#dgdoesage' + idx).focus();
                    return false;
                } else if ((item.DrugId > 0) && (!item.Duration || item.Duration === 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    $('#dgduration' + idx).focus();
                    return false;
                } else if ((item.DrugId > 0) && (!item.DurationPeriodId || item.DurationPeriodId === 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    $('#dgduraperiod' + idx).focus();
                    return false;
                } else if ((item.DrugId > 0) && (!item.Quantity || item.Quantity == 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    $('#Quantity' + idx).focus();
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.prescriptionDetails) {
                var item = $scope.prescriptionDetails[idx];
                if (item.Status == 1) {
                    if (item.DrugId > 0 || item.GenericId > 0) {
                        item.PharmacyId = $scope.item.PharmacyId;
                        item.Id = item.Id || 0;
                        item.PrescriptionId = item.PrescriptionId || 0;
                        item.GuarantorId = $scope.item.GuarantorId;
                        item.SearchTypeId = $scope.item.SearchTypeId;
                        // item.NetAmount = item.Price * item.Quantity;
                        item.NetAmount = parseFloat(item.Price) * item.Quantity;
                        result.push(item);
                    }
                    for (var didx in $scope.prescriptionDetails) {
                        var ditem = $scope.prescriptionDetails[didx];
                        if (ditem.Status === 2 && ditem.Id > 0) {
                            result.push(ditem);
                        }
                    }
                }
            }
            return result;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'StoreMaster' && $scope.item.PharmacyId === 0) {
                    /* $scope.item.PharmacyId = value[0].Id; */
                    for (var idx in value) {
                        var store = value[idx];
                        if (store.IsDefaultPrescriptionStore) {
                            $scope.item.PharmacyId = store.Id;
                        }
                    }
                    if ($scope.item.PharmacyId === 0) {
                        $scope.item.PharmacyId = value[0].Id;
                    }
                }
            });
            if ($stateParams.details == 0) {
                $scope.getList();
            }
        };
        $scope.initLookup = function () {
            var inputData = [
                //     {
                //     "Key": "Doctor"
                // },
                {
                    "Key": "DrugRoute"
                },
                {
                    "Key": "Pharmacy"
                },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: utl.Session.getCurrentUserId()
                        }]
                    }
                },
                {
                    "Key": "PrecriptionStatus"
                },
                {
                    "Key": "PrescriptionApprovalStatus"
                },
                {
                    "Key": "DurationPeriod",
                    Default: false
                },
                {
                    "Key": "DrugInstruction",
                    Default: false
                },
                {
                    "Key": "DrugFrequency"
                },
                {
                    "Key": "PrescriptionPriority"
                },
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [{
                                Key: 2,
                                Value: 1
                            },
                            {
                                Key: 3,
                                Value: 2
                            },
                            {
                                Key: 7,
                                Value: 2
                            },
                            {
                                Key: 6,
                                Value: $scope.item.FacilityId
                            }
                        ]
                    },
                    Default: false
                }
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
    PrescriptionRxController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();