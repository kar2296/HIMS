(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnPrescriptionSectionController', cnPrescriptionSectionController);

    function cnPrescriptionSectionController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, lodash, $uibModalInstance, modalConfig) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            EncounterId: utl.Session.getEncounterId(),
            SearchTypeId: 1,
            DurationPeriodId: 1,
            DrugInstructionId: 1,
            Morning: 1,
            Noon: 1,
            Night: 1,
            PharmacyId: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            PrecriptionStatusId: 3,
            PrescriptionDate: utl.Formatter.getCurrentDate(),
            PrescriptionPriorityId: 1,
            AdministerStatusId: 2,
            STAT: false
        };
        $scope.prescriptionDetails = [];
        $scope.prescribeDetails = [];
        $scope.Prescriptions = [];
        $scope.lookup = {};
        $scope.currentcontext = {};
        var ItemMrPriceCount = 0;
        var ItemStockCount = 0;
        $scope.consult = {};

        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;
        $scope.currentcontext.context = $stateParams.context;
        $scope.IsSavePanels = false;
        $scope.CanshowPrint = false;
        $scope.IsDisabled = false;
        $scope.currentcontext.ConsultationId = $scope.$parent.cncontext.consultationid;
        $scope.item.ConsultationId = $scope.$parent.cncontext.consultationid;
        $scope.currentcontext.id = 0;
        $scope.currentcontext.option = 'detail';
        if ($stateParams.details) {
            $scope.prescriptionDetails = $stateParams.details;
        }
        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.currentcontext.prescribeid = 0;

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.cid) {
            $scope.currentcontext.copyid = $stateParams.cid;
            $scope.currentcontext.prescribeid = $scope.currentcontext.copyid;
        }

        $scope.options = [
            { key: 'detail', name: $translate.instant('patientemr.prescription-form.prescription.lbl') },
            { key: 'ticksheet', name: $translate.instant('Favorites') },
            { key: 'pastdetails', name: $translate.instant('Previous Prescriptions') },
        ];
        $scope.canShowPrescriptionArea = function() {
            return $scope.currentcontext.option == 'detail';
        };

        $scope.canShowTickSheetArea = function() {
            return $scope.currentcontext.option == 'ticksheet';
        };

        $scope.canShowPastPrescriptions = function() {
            // $scope.getprevPrescribe();
            return $scope.currentcontext.option == 'pastdetails';
        };

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
            $scope.item.ClaimProcessId = $scope.currentcontext.encounter.ClaimProcessId;
            $scope.item.ClaimNumber = $scope.currentcontext.encounter.ClaimNumber;
        }
        $scope.addDrug = function() {
            utl.Modal.open('app.itemmastertab.itemmasterdrug', {
                params: {
                    did: 0
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.toggleCanShowDetails = function(clickedItem) {
            for (var idx in $scope.Prescriptions) {
                var item = $scope.Prescriptions[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        //getList
        $scope.getprevPrescribeCallback = function(scope, res, options, hasError) {
            $scope.Prescriptions = res.Data;
        };

        $scope.getprevPrescribe = function() {
            // var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    }
                    // {
                    //     Key: 12,
                    //     Value: $scope.currentcontext.eid
                    // },
                    // {
                    //     Key: 8,
                    //     Value: FromDate
                    // },
                    // {
                    //     Key: 9,
                    //     Value: ToDate
                    // },

                ],
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getprevPrescribeCallback
            };

            utl.Http.doAction(options);
        };

        $scope.repeat = function(item) {
            $scope.currentcontext.prescribeid = item.Id;
            $scope.item.PrecriptionStatusId = 3;
            $scope.getList();
            $scope.currentcontext.option = 'detail';
        }

        $scope.getListCallback = function(scope, res, options, hasError) {
            // $scope.currentcontext.option = 'addprescribe';PrecriptionStatusId
            if (res.Data.length > 0) {
                $scope.CanshowPrint = true;
                $scope.IsDisabled = true;
            }
            if ($scope.currentcontext.prescribeid > 0) {
                $scope.prescriptionDetails = [];
                for (var idx in res.Data) {
                    res.Data[idx].cid = res.Data[idx].Id;
                    res.Data[idx].Id = 0;
                    res.Data[idx].PrescriptionId = 0;
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

        $scope.getList = function() {
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    },

                    // {
                    //     Key: 6,
                    //     Value: $scope.currentcontext.ConsultationId
                    // },
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
                    Key: 6,
                    Value: $scope.currentcontext.ConsultationId
                }, {
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

        $scope.getLatestPrescribeDetailsCallback = function(scope, res, options, hasError) {
            $scope.prescriptionDetails = [];
            $scope.prescriptionDetails = res.Data;
        };

        $scope.getLatestPrescribeDetails = function() {
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

        $scope.print = function() {
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

        $scope.setMaster = function(dp) {
            $scope.selected = dp;
        }

        $scope.isSelected = function(dp) {
            return $scope.selected === dp;
        }

        $scope.durPeriodChange = function(info, item) {
            item.DurationPeriodId = info.Id;
            $scope.computeQuantity(item);
        }
        $scope.getprescribeDetailByIdCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.isModified = true;
            $scope.item.Id = 0;
            $scope.item.ischanged = true;
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

        $scope.getprescribeDetailById = function(item) {
            if (item.cid && item.cid > 0) {
                var options = {
                    action: 'emr/prescriptiondetail/GetPrescriptionDetailById',
                    data: {
                        Id: item.cid
                    },
                    type: 'post',
                    onComplete: $scope.getprescribeDetailByIdCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.deletePrescribeDetailbyId = function(item) {
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

        $scope.deletePrescriptionDetail = function(idx, selectedItem) {
            var name = selectedItem.DrugName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
        };

        $scope.onDeleteConfirmed = function(item) {
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

        $scope.addNew = function() {
            if ($scope.currentcontext.encounter.IsBillLock == false) {
                $scope.prescriptionDetails = [];
                $scope.IsDisabled = false;
                $scope.currentcontext.id = 0;
                $scope.currentcontext.prescribeid = 0;
                $scope.item.PrecriptionStatusId = 3;
            } else {
                utl.Alert.showErrorMsg(" Bill is Locked");
            }
        };

        $('.panel-title > a').click(function() {
            $(this).find('i').toggleClass('fa-plus fa-minus')
                .closest('panel').siblings('panel')
                .find('i')
                .removeClass('fa-minus').addClass('fa-plus');
            $("#collapseOne").toggle();
        });

        $scope.drugChanged = function(idx, item) {
            $scope.item.DrugCode = item.SelectedItem.DrugCode;
            $scope.item.DrugName = item.SelectedItem.DrugName;
            $scope.item.Dosage = item.SelectedItem.MaxDosagePerDay || 1;
            $scope.item.Price = parseFloat(item.SelectedItem.MrPrice).toFixed(2) || 0;
            $scope.item.AvailQuantity = item.SelectedItem.Quantity || 0;
            $scope.item.DrugGenericId = item.SelectedItem.GenericId || -1;
            $scope.item.DrugGenericCode = item.SelectedItem.GenericCode;
            $scope.item.DrugGenericName = item.SelectedItem.GenericName;
            $scope.item.Duration = item.SelectedItem.Duration || 1;
            $scope.item.DurationPeriodId = item.SelectedItem.DurationPeriodId || 1;
            $scope.item.DrugInstructionId = item.SelectedItem.DrugInstructionId || 1;
            $scope.item.PackageType = item.SelectedItem.PackageType || '';
            $scope.item.PackageSize = item.SelectedItem.PackageSize || 0;
            var drugdata = $scope.item;
            $scope.computeQuantity(drugdata);
        };

        $scope.updatemedicine = function(item) {
            // var index = $scope.prescriptionDetails.indexOf(item);
            for (var pdx in $scope.prescriptionDetails) {
                var prescribe = $scope.prescriptionDetails[pdx];
                if ((prescribe.DrugId == item.DrugId && item.ischanged)) {
                    prescribe.Status = 2;
                }
            }
            // $scope.prescriptionDetails.splice(index, 1);
            $scope.prescriptionDetails.push(item);
        }

        $scope.addmedicine = function() {
            if ($scope.item.DrugId > 0 || $scope.item.GenericId > 0) {
                var prescriptionDetail = {
                    Id: 0,
                    DrugId: $scope.item.DrugId,
                    DrugCode: $scope.item.DrugCode,
                    DrugName: $scope.item.DrugName,
                    IsGeneric: false,
                    GenericId: $scope.item.GenericId,
                    Dosage: $scope.item.Dosage,
                    DrugRouteId: $scope.item.DrugRouteId,
                    DrugFrequencyId: $scope.item.DrugFrequencyId,
                    Duration: $scope.item.Duration,
                    DurationPeriodId: $scope.item.DurationPeriodId,
                    Morning: $scope.item.Morning,
                    Noon: $scope.item.Noon,
                    Night: $scope.item.Night,
                    PackageType: '',
                    PackageSize: $scope.item.PackageSize,
                    Quantity: $scope.item.Quantity,
                    Price: $scope.item.Price,
                    NetAmount: $scope.item.NetAmount,
                    AvailQuantity: $scope.item.AvailQuantity,
                    DrugInstructionId: $scope.item.DrugInstructionId,
                    Notes: $scope.item.Notes,
                    Status: 1,
                    PrecriptionStatusId: 3,
                    SearchTypeId: $scope.item.SearchTypeId,
                    PrescriptionIdentifier: null,
                    DisplayPrecriptionStatus: null,
                    StartDate: utl.Formatter.getCurrentDate(),
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
                $scope.prescriptionDetails.push(prescriptionDetail);
                $scope.computeQuantity(prescriptionDetail);
                $scope.ClearData();
            } else {
                utl.Alert.showErrorMsg('Select any Medicine');
                return false;
            }
        }

        $scope.ClearData = function() {
            document.getElementById("drugid").value = '';
            // document.getElementById("item_form").reset();
            $scope.item.DrugId = 0;
            $scope.item.Dosage = 0;
            $scope.item.Duration = 0;
            $scope.item.DurationPeriodId = 1;
            $scope.item.Notes = '';
            $scope.item.AvailQuantity = 0;
            $scope.item.Quantity = 0;
            $scope.item.Morning = 1;
            $scope.item.Noon = 1;
            $scope.item.Night = 1;
            $scope.item.DrugInstructionId = 1;
        }
        $scope.clearDetails = function() {
            $scope.prescriptionDetails = [];
        }
        $scope.computeQuantity = function(item) {
            var totalDays = 0;
            var noOfTimes = 0;
            if (item.DurationPeriodId == 1) { //Days
                totalDays = item.Duration * 1;
            } else if (item.DurationPeriodId == 2) { //Weeks
                totalDays = item.Duration * 7;
            } else if (item.DurationPeriodId == 3) { //Months
                totalDays = item.Duration * 30;
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
            item.Quantity = noOfTimes * totalDays;
            if (item.PackageSize == 0 || item.PackageSize == 1 || !item.PackageSize) {
                item.Quantity = noOfTimes * totalDays;
            } else {
                item.Quantity = Math.ceil((item.Quantity / item.PackageSize));
            }
        };


        $scope.onenter = function(item) {
            if (item == undefined) {
                $scope.item.DrugType = item;
            }
        };

        $scope.prescribe_history = function() {
            utl.Modal.open('patientemr.previousmedications', {
                params: {
                    pid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getItem
            });
        };

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
                },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/DrugMaster/GetDrugMasters',
            formatdisplay: formatselecteddrugs,
            presearch: presearchdrugs,
            postsearch: postsearchdrugs
        };

        function formatselecteddrugs() {
            var selectedItem = vm.drugcontrolconfig.selected;
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
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.drugcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
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
                // item.DrugType = item.DrugType.Description;
                if (item.ItemMaster) {
                    if (item.ItemMaster.StockItem) {
                        item.Quantity = item.ItemMaster.StockItem.Quantity;
                    }
                    item.MrPrice = parseFloat(item.ItemMaster.MrPrice).toFixed(2);
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
                    PageSize: 25,
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
        $scope.getItemMasterStockDeailsCallBack = function(scope, data, options, hasError) {
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

        $scope.getItemMasterStockDeails = function(ItemMasterId, StoreMasterId) {
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

        $scope.getItemMasterDeailsCallBack = function(scope, data, options, hasError) {
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

        $scope.getItemMasterDeails = function(ItemMasterId) {
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

        $scope.savePanels = function() {
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
                    Status: 1,
                    PrecriptionStatusId: 3,
                    StartDate: utl.Formatter.getCurrentDate(),
                    RxName: panelitem.TemplateMasterDetails[indx].DisplayName
                };
                if (!checkExist(item)) {
                    $scope.prescriptionDetails.push(item);
                    $scope.IsSavePanels = true;
                }
                $scope.getItemMasterDeails(panelitem.TemplateMasterDetails[indx].ItemId);
                $scope.getItemMasterStockDeails(panelitem.TemplateMasterDetails[indx].ItemId, $scope.item.PharmacyId);
            }
        };

        $scope.saveasRxPanel = function() {
            var userObj = utl.Lookup.getObject($scope.lookup.User, utl.Session.getCurrentUserId());
            if (userObj) {
                $scope.currentcontext.userDepartmentId = userObj.DepartmentId;
                $scope.currentcontext.userId = userObj.Id;
            }
            var drugs = [];
            for (var idx in $scope.prescriptionDetails) {
                var prescriptionDetail = $scope.prescriptionDetails[idx];
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
                        Comments: '',
                        Diagnosis: '',
                        Physiotheraphy: '',
                        Status: 1,
                        Morning: 1,
                        Noon: 1,
                        Night: 1,
                        Dosage: prescriptionDetail.Dosage,
                        Duration: prescriptionDetail.Duration,
                        DurationPeriodId: prescriptionDetail.DurationPeriodId,
                        DrugInstructionId: prescriptionDetail.DrugInstructionId,
                        Quantity: prescriptionDetail.Quantity,
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
                    items: drugs
                }
            });
        };

        $scope.ticksheetconfig = {
            ticksheetmastertypeid: 1,
            selectedlist: [],
            selecteddetail: {},
            departmentid: -1
        };

        $scope.addTickSheet = function() {
            var testmaster = $scope.ticksheetconfig.selecteddetail.DrugMaster;
            var currentItem = getNewItem();
            currentItem.DrugId = $scope.ticksheetconfig.selecteddetail.ItemId;
            currentItem.DrugName = testmaster.DrugName;
            currentItem.DrugCode = testmaster.DrugCode;
            utl.Modal.open('patientemr.prescriptiondetail', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.pid,
                    current_item: currentItem
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.saveTickSheets = function() {
            $scope.prescriptionDetails.splice(-1, 1);
            for (var idx in $scope.ticksheetconfig.selectedlist) {
                var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
                var vMrPrice = 0;
                var vAvailQuantity = 0;
                try {
                    vMrPrice = ticksheetitem.ItemMaster.MrPrice;
                } catch (ex) {}
                try {
                    vAvailQuantity = ticksheetitem.ItemMaster.StockItem.Quantity;
                } catch (ex) {}
                var item = {
                    DrugId: ticksheetitem.ItemId,
                    IsGeneric: false,
                    Duration: 0,
                    DurationPeriodId: 1,
                    Quantity: 0,
                    AvailQuantity: vAvailQuantity,
                    Status: 1,
                    Price: vMrPrice,
                    SearchTypeId: 1,
                    StartDate: utl.Formatter.getCurrentDate(),
                    DrugName: ticksheetitem.DrugName,
                    DrugCode: ticksheetitem.DrugCode,
                    DrugGenericId: ticksheetitem.DrugMaster.GenericId,
                    DrugGenericCode: ticksheetitem.DrugMaster.GenericCode,
                    DrugGenericName: ticksheetitem.DrugMaster.GenericName,
                    Morning: ticksheetitem.Morning,
                    Noon: ticksheetitem.Noon,
                    Night: ticksheetitem.Night,
                    PrecriptionStatusId: 3,
                    PharmacyId: $scope.item.PharmacyId,
                    Dosage: ticksheetitem.Dosage,
                    Duration: ticksheetitem.Duration,
                    DurationPeriodId: ticksheetitem.DurationPeriodId,
                    DrugInstructionId: ticksheetitem.DrugInstructionId,
                };
                $scope.computeQuantity(item);
                if (!checkExist(item)) {
                    $scope.prescriptionDetails.push(item);
                }
                $scope.currentcontext.id = 0;
                $scope.currentcontext.option = 'detail';
            }
        };

        $scope.prescribe = function() {
            $scope.saveItem(3);
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof(data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.currentcontext.prescribeid = options.data.Data.Id;
                    $scope.IsDisabled = true;
                    $scope.getItem();
                }
            } else if (typeof(data) == "number") {
                $scope.currentcontext.id = data;
                $scope.currentcontext.prescribeid = data;
                $scope.IsDisabled = true;
            }
            $scope.getprevPrescribe();
            $scope.ClearData();
            $scope.print();
        };

        $scope.saveItem = function(StatusId) {
            if ($scope.item.PrecriptionStatusId != 3 && !utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.item.GuarantorId === 1000) {
                $scope.item.IsSelf = true;
                // $scope.item.ClaimProcessId = 0;
                // $scope.item.ClaimNumber = '';
                // $scope.item.PrescriptionApprovedById = utl.Session.getCurrentUserId();
                // $scope.item.PrescriptionApprovedDate = utl.Formatter.getCurrentDate();
                // $scope.item.ApprovedAmount = $scope.item.PrescriptionTotal;
            }

            $scope.item.ConsultationId = $scope.currentcontext.ConsultationId;

            if (checkMandatoryFields()) {
                $scope.item.PrecriptionStatusId = StatusId;
                var lines = getLinesForSave();
                var actionName = 'emr/prescription/AddPrescription';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/prescription/UpdatePrescription';
                }
                var inputData = {
                    Header: $scope.item,
                    Details: lines
                };
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
            // if (activeRecords.length == 1) {
            //     utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
            //     return false;
            // }
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
                        item.Id = 0;
                        item.PrescriptionId = 0;
                        item.GuarantorId = $scope.item.GuarantorId;
                        item.SearchTypeId = $scope.item.SearchTypeId;
                        item.NetAmount = item.Price * item.Quantity;
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

        $scope.viewConsultation = function(item) {
            utl.Modal.open('patientemr.reviewnotes', {
                params: {
                    cid: item.Id,
                    pid: $scope.currentcontext.pid
                }
            });
        };

        $scope.getAllConsultationCallback = function(scope, res, options, hasError) {
            $scope.consultlist = res.Data;
        };

        $scope.getallConsultation = function(pageNo) {
            var inputData = {
                Params: [
                    // { Key: 2, Value: $scope.currentcontext.eid },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAllConsultationCallback
            };
            utl.Http.doAction(options);
        };

        $scope.prescribe_history = function() {
            utl.Modal.open('patientemr.cnprescribe', {
                params: {
                    pid: $scope.currentcontext.pid,
                    consid: $scope.currentcontext.ConsultationId
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.getPreviousprescribesCallback = function(scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                var consultlist = 0;
                for (var idx in res.Data) {
                    var prescribedata = res.Data[idx];
                    if (!prescribedata.ConsultationId) {
                        consultlist++;
                    }
                }
                if (consultlist > 0) {
                    $scope.prescribe_history();
                } else {
                    $scope.getList();
                }
            } else {
                $scope.getList();
            }
        };

        $scope.getPreviousprescribes = function() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 12,
                        Value: $scope.currentcontext.eid
                    },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPreviousprescribesCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getCurrentConsultationCallback = function(scope, data, options, hasError) {
            $scope.consult = data;
            $scope.currentcontext.eid = data.EncounterId;
            $scope.getallConsultation();
        };

        $scope.getCurrentConsultation = function(pageNo) {
            if ($scope.currentcontext.ConsultationId && $scope.currentcontext.ConsultationId > 0) {
                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: {
                        Id: $scope.currentcontext.ConsultationId
                    },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
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
                if (key == 'InjectionRoom' && $scope.currentcontext.InjectionRoomId === 0) {
                    if (value.length > 0) {
                        $scope.currentcontext.InjectionRoomId = value[0].Id;
                    } else {
                        $scope.currentcontext.InjectionRoomId = -1;
                    }
                }
            });
            if ($stateParams.details == 0) {
                $scope.getPreviousprescribes();
                $scope.getList();
            }
            $scope.getprevPrescribe();
        };

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
                {
                    "Key": "Department"
                },
                {
                    "Key": "Pharmacy"
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
                            }
                        ]
                    },
                    Default: false
                },
                {
                    "Key": "InjectionRoom",
                    Request: {
                        Params: [{
                                Key: 2,
                                Value: 1
                            },
                            {
                                Key: 3,
                                Value: 7
                            },
                            {
                                Key: 7,
                                Value: 2
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
        $scope.getCurrentConsultation();
    }

    cnPrescriptionSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', 'lodash', '$uibModalInstance', 'modalConfig'];

})();