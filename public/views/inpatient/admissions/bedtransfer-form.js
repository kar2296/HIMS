(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('bedtransferformController', bedtransferformController);

    function bedtransferformController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.item = {
            isCompleted: true,
            TransferDate: utl.Formatter.getCurrentDate(),
            DisplayCertificateStatus: null,
            NoteTypeId: 1
        };
        $scope.CanshowPatientSearch = true;
        $scope.feedbackData = {};
        $scope.lookup = {};

        $scope.EncounterData = {};

        $scope.item.FromFacilityId = utl.Session.getCurrentFacilityId();
        $scope.item.ToFacilityId = utl.Session.getCurrentFacilityId();
        $scope.WardRoomEditable = false;
        $scope.confirmCallback = $uibModalInstance.close;

        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.currentcontext = {};

        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.currentcontext.historyid = parseInt(modalConfig.params.historyid);
        $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        $scope.currentcontext.emr = modalConfig.params.emr;
        $scope.currentcontext.encounterid = parseInt(modalConfig.params.encounterid);
        if ($scope.currentcontext.emr == true) {
            $scope.CanshowPatientSearch = false;
        }
        // if ($scope.currentcontext.pid > 0 && $scope.currentcontext.historyid > 0) {
        //     $scope.CanshowPatientSearch = false;
        // }
        $scope.editratetype = 0;
        $scope.editratetype =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'editratetype');

        if ($scope.editratetype == 0 || !$scope.editratetype) {
            $scope.DisRateType = true;
        }
        if ($scope.editratetype == 1) {
            $scope.DisRateType = false;
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.pid = $scope.item.PatientId
            $scope.item.WardRoomDetail = '';
            if (data.Facility) {
                $scope.item.FacilityName = $scope.item.Facility.FacilityName;
            }
            if (data.FromWard)
                $scope.item.WardRoomDetail = data.FromWard.WardName;
            $scope.item.WardName = data.FromWard.WardName;
            if (data.FromRoom)
                $scope.item.WardRoomDetail += '/' + data.FromRoom.RoomNo;
            $scope.item.RoomNo = data.FromRoom.RoomNo;
            if (data.FromBed)
                $scope.item.WardRoomDetail += '/' + data.FromBed.BedNo;
            $scope.item.BedNo = data.FromBed.BedNo;
            $scope.item.TransferDate = data.TransferDate;
            $scope.item.isCompleted = $scope.item.RequestedStatusId == 2;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.getPatient();
            $scope.getCurrentEncounter();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'IPManagement/BedTransfer/GetBedTransferById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.historyid && $scope.currentcontext.historyid > 0) {
                $scope.getBedTransfer();
            }
        };
        $scope.getPatientCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.patientdata = res.Data[0];

                $scope.item.PatientId = $scope.patientdata.Id;
                $scope.item.PatientName = '';
                if ($scope.patientdata.Title)
                    $scope.item.PatientName += $scope.patientdata.Title.Description;

                if ($scope.patientdata.FirstName)
                    $scope.item.PatientName += ' ' + $scope.patientdata.FirstName;

                if ($scope.patientdata.LastName)
                    $scope.item.PatientName += ' ' + $scope.patientdata.LastName;
                if ($scope.patientdata.Facility) {
                    $scope.item.FacilityName = $scope.patientdata.Facility.FacilityName;
                }
                $scope.item.PatientMrn = $scope.patientdata.Mrn;
                $scope.item.Age = $scope.patientdata.Age;
                $scope.item.Gender = $scope.patientdata.Gender.Description;
                if ($scope.patientdata.Referral) {
                    $scope.item.ReferralName = $scope.patientdata.Referral.ReferralName;
                }
                if ($scope.patientdata.Guarantor) {
                    $scope.item.GuarantorName = $scope.patientdata.Guarantor.GuarantorName;
                }
                if ($scope.patientdata.Encounters) {
                    $scope.item.DoctorId = $scope.patientdata.Encounters[0].DoctorId;
                    $scope.item.DoctorName = $scope.patientdata.Encounters[0].Doctor.Title.Description + ' ' + $scope.patientdata.Encounters[0].Doctor.FirstName + ' ' + $scope.patientdata.Encounters[0].Doctor.LastName;
                    $scope.item.DepartmentId = $scope.patientdata.Encounters[0].DepartmentId;


                    if ($scope.patientdata.Encounters[0].EncounterTypeId == 2) {
                        $scope.item.EncounterTypeId = 2;
                        $scope.item.ServiceRateCategoryId = $scope.patientdata.Encounters[0].ServiceRateCategoryId;
                    } else {
                        $scope.item.ServiceRateCategoryId = 1;
                        $scope.item.EncounterTypeId = 1;
                    }
                    $scope.item.PatientMrn = $scope.patientdata.Encounters[0].PatientMrn;
                    $scope.item.VisitIdentifier = $scope.patientdata.Encounters[0].VisitIdentifier;
                    $scope.item.Age = $scope.patientdata.Age;
                    $scope.item.Gender = $scope.patientdata.Gender.Description;
                    $scope.item.ReferralName = $scope.patientdata.Encounters[0].ReferralName;
                    $scope.item.PatientLocation = $scope.patientdata.Encounters[0].PatientLocation;
                    $scope.item.EncounterId = $scope.patientdata.Encounters[0].Id;
                    $scope.item.FromFacilityId = $scope.patientdata.Encounters[0].FacilityId;
                    $scope.item.FromLocationId = $scope.patientdata.Encounters[0].LocationId;
                    $scope.item.GuarantorTypeId = $scope.patientdata.Encounters[0].GuarantorTypeId;
                    if ($scope.patientdata.Encounters[0].WardMaster)
                        $scope.item.WardName = $scope.patientdata.Encounters[0].WardMaster.WardName;
                    if ($scope.patientdata.Encounters[0].WardRoomBedMaster)
                        $scope.item.BedNo = $scope.patientdata.Encounters[0].WardRoomBedMaster.BedNo;
                    if ($scope.patientdata.Encounters[0].WardRoomMaster)
                        $scope.item.RoomNo = $scope.patientdata.Encounters[0].WardRoomMaster.RoomNo;
                    if ($scope.patientdata.Encounters[0].Facility)
                        $scope.item.FacilityName = $scope.patientdata.Encounters[0].Facility.FacilityName;
                    if ($scope.patientdata.Encounters[0].Guarantor)
                        $scope.item.GuarantorName = $scope.patientdata.Encounters[0].Guarantor.GuarantorName;
                    $scope.item.FromWardId = $scope.patientdata.Encounters[0].WardId;
                    $scope.item.FromRoomId = $scope.patientdata.Encounters[0].RoomId;
                    $scope.item.FromBedId = $scope.patientdata.Encounters[0].BedId;
                }
            }
        };

        $scope.getPatient = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.pid
                }, ]
            };
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientCallback
            };
            utl.Http.doAction(options);
        };

        $scope.save = function () {
            if ($scope.item.RequestedStatusId && $scope.item.RequestedStatusId > 1)
                $scope.saveItem($scope.item.RequestedStatusId);
            else
                $scope.saveItem(1);
        }

        $scope.onSaveandApproveConfirm = function () {
            if ($scope.item.RequestedStatusId && $scope.item.RequestedStatusId > 2)
                $scope.saveItem($scope.item.RequestedStatusId);
            else
                $scope.saveItem(2);
        }
        $scope.saveAndApprove = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'bedtransfer-list.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirm,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.onCompletedConfirm = function () {
            $scope.saveItem(3);
        }
        $scope.bedCharges = function () {
            utl.Modal.open('app.bedcharges', {
                params: {
                    id: $scope.item.ToBedId
                }
            });
        }

        $scope.Savecomplete = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'bedtransfer-list.completeconfirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCompletedConfirm,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.onCancelConfirmed = function () {
            $scope.saveItem(4);
        }



        $scope.getCurrentEncounterCallback = function (scope, res, options, hasError) {
            if (res && res.Data) {
                $scope.EncounterData = res.Data[0];
            }
            $scope.item.GuarantorTypeId = $scope.EncounterData.GuarantorTypeId;
        }

        $scope.getCurrentEncounter = function () {
            if (!$scope.EncounterData.Id && $scope.item.EncounterId && $scope.item.EncounterId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.item.EncounterId
                    }]
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getCurrentEncounterCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.checkBedTariff = function () {
            try {
                if ($scope.EncounterData.GuarantorId) {
                    var PatientGuarantorObj =
                        utl.Lookup.getObject($scope.lookup.PatientGuarantor, $scope.EncounterData.GuarantorId);
                    if (PatientGuarantorObj && PatientGuarantorObj.GuarantorId) {
                        var GuarantorMasterObj =
                            utl.Lookup.getObject($scope.lookup.Guarantor, PatientGuarantorObj.GuarantorId);
                        if (GuarantorMasterObj && PatientGuarantorObj.Guarantor.ServiceRateCategoryId && !GuarantorMasterObj.IsIPBedTariff) {
                            $scope.item.ToServiceRateCategoryId = GuarantorMasterObj.ServiceRateCategoryId;
                        }
                    }
                }
            } catch (ex) {
                console.log(ex);
            }
        }

        $scope.bedDetail = function (data) {
            $scope.item.ToWardId = data.WardId;
            $scope.item.ToRoomId = data.RoomId;
            $scope.item.ToBedId = data.BedId;
            $scope.item.ToLocationId = data.LocationId;
            $scope.item.ToServiceRateCategoryId = data.ServiceRateCategoryId;
            $scope.item.ToWardName = data.WardName;
            $scope.item.ToRoomName = data.RoomName;
            $scope.item.ToBedName = data.BedName;
            $scope.item.ToLocationName = data.LocationName;
            if ($scope.item.GuarantorTypeId && $scope.item.ToWardId) {
                $scope.getWardInsuranceTariffs($scope.item);
            }
            $scope.getRoomLookUp();
            $scope.getBedLookUp();
        }


        $scope.getWardInsuranceTariffCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item.ToServiceRateCategoryId = res.Data[0].RateTypeId;
            }
        };

        $scope.getWardInsuranceTariffs = function (wardInfo) {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: wardInfo.ToWardId
                    },
                    {
                        Key: 5,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },
                    {
                        Key: 6,
                        Value: wardInfo.GuarantorTypeId
                    },
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/WardInsuranceTariff/GetWardInsuranceTariffs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getWardInsuranceTariffCallback
            };

            utl.Http.doAction(options);
        }

        $scope.openWardBed = function () {
            utl.Modal.open('app.WardBedPicker', {
                params: {},
                confirmCallback: $scope.bedDetail
            });
        }

        $scope.getToBedInfo = function (scope, data, options, hasError) {
            $scope.item.ToServiceRateCategoryId = data.ServiceRateCategoryId;
            if ($scope.item.GuarantorTypeId && $scope.item.WardId) {
                $scope.getWardInsuranceTariffs($scope.item);
            }
        }

        $scope.tariffChange = function () {
            if ($scope.item.ToBedId > 0) {
                var options = {
                    action: 'generalmaster/WardRoomBedMaster/GetWardRoomBedMasterById',
                    data: {
                        Id: $scope.item.ToBedId
                    },
                    type: 'post',
                    onComplete: $scope.getToBedInfo
                };
                utl.Http.doAction(options);
            } else {
                $scope.item.ToServiceRateCategoryId = -1;
            }
        }

        $scope.occupancy = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.bedoccupancyhistory', {
                    params: {
                        pid: $scope.item.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('admission.previous-admi-nopatient-msg.lbl'));
            }
        }

        $scope.Cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'medicalcertificate.dischargesummary-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                placeholder: $scope.item.ReceiptNumber,
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions, $scope.item.ReceiptNumber);
        }

        $scope.saveDeleteRpt = function () {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, $scope.currentcontext.id);
            // Deleted
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (utl.Session.getMedblazePost() == 1) {
                var options = {
                    action: "Visit/Visit/postMedBlaze/",
                    data: {
                        Data: {
                            // encounterId: data,
                            feedbackData: $scope.feedbackData
                        }
                    },
                    type: 'post',
                    // onComplete: $scope.saveItemCallback,
                    // onError: $scope.errorItemCallback
                };
                utl.Http.doAction(options);
            }
            $scope.confirmCallback();
        };
        $scope.doctorChange = function () {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
        }
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        }
        $scope.Bedoccupancy = function () {
            utl.Modal.open('app.bedoccupancyhistory', {
                params: {},
                confirmCallback: $scope.bedDetail
            });
        }
        $scope.getBedOccupancyCallback = function (scope, data, options, hasError) {
            if (data) {
                $scope.BedOccupancyHistorys = data;
                $scope.item.BedOccupancyHistoryId = $scope.BedOccupancyHistorys.Id;
                $scope.item.EncounterId = $scope.BedOccupancyHistorys.EncounterId;
                $scope.item.DoctorId = $scope.BedOccupancyHistorys.DoctorId;
                $scope.item.PatientId = $scope.BedOccupancyHistorys.PatientId;
                $scope.item.FromWardId = $scope.BedOccupancyHistorys.WardId;
                $scope.item.WardName = $scope.BedOccupancyHistorys.WardMaster.WardName;
                $scope.item.FromRoomId = $scope.BedOccupancyHistorys.RoomId;
                $scope.item.RoomNo = $scope.BedOccupancyHistorys.WardRoomMaster.RoomNo;
                $scope.item.FromBedId = $scope.BedOccupancyHistorys.BedId;
                $scope.item.BedNo = $scope.BedOccupancyHistorys.WardRoomBedMaster.BedNo;
                $scope.item.FromLocationId = $scope.BedOccupancyHistorys.LocationId;
                $scope.item.ServiceRateCategoryId = $scope.BedOccupancyHistorys.ServiceRateCategoryId;
                $scope.item.DepartmentId = $scope.BedOccupancyHistorys.DepartmentId;
                $scope.item.IsDoubleOccupancy = $scope.BedOccupancyHistorys.IsDoubleOccupancy;
                $scope.item.DoubleOccupancy = $scope.item.IsDoubleOccupancy;
            }
            $scope.loadPatientGuarantors();
        };

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

        $scope.loadPatientGuarantorsCallback = function (scope, data, options, hasError) {
            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;
        }

        $scope.loadPatientGuarantors = function () {
            //Get only active guarantors - 2
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
                    onComplete: $scope.loadPatientGuarantorsCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getBedTransferCallback = function (scope, data, options, hasError) {
            if (data && data.Id != -1) {
                $scope.item = data;
                if (!$scope.item.TransferDate)
                    $scope.item.TransferDate = utl.Formatter.getCurrentDate();
                else
                    $scope.item.TransferDate = new Date(utl.Formatter.getDateTimeStringForAppointment($scope.item.TransferDate));
            } else {
                $scope.getBedOccupancy();
            }
            $scope.item.isFrom = true;
        }

        $scope.getBedTransfer = function () {
            if ($scope.currentcontext.encounterid && $scope.currentcontext.encounterid > 0) {
                var options = {
                    action: 'IPManagement/BedTransfer/GetBedTransferByEncounterId',
                    data: {
                        Data: {
                            EncounterId: $scope.currentcontext.encounterid
                        }
                    },
                    type: 'post',
                    onComplete: $scope.getBedTransferCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getBedOccupancy = function () {
            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistoryById',
                data: {
                    Id: $scope.currentcontext.historyid
                },
                type: 'post',
                onComplete: $scope.getBedOccupancyCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getDoubleOccupancyBedCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                var data = res.Data[0];
                $scope.item.ToWardId = data.WardId;
                $scope.item.ToRoomId = data.RoomId;
                $scope.item.ToBedId = data.BedId;
                $scope.item.ToLocationId = data.LocationId;
                $scope.item.ToServiceRateCategoryId = data.ServiceRateCategoryId;
                $scope.item.IsDoubleOccupancy = false;
            }
        }

        $scope.getDoubleOccupancyBed = function () {
            var inputParams = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.encounterid
                }, {
                    Key: 2,
                    Value: 1
                }, {
                    Key: 5,
                    Value: 'false'
                }],
                PageContext: {
                    PageSize: 10,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
                data: inputParams,
                type: 'post',
                onComplete: $scope.getDoubleOccupancyBedCallback
            };
            utl.Http.doAction(options);
        };
        // Patient AutoSearch
        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Title',
                    field: 'Title',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Name',
                    field: 'PatientName',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Age/Gender',
                    field: 'Age',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'DOB',
                    field: 'DOB',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'MRN',
                    field: 'MRN',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Visit#',
                    field: 'VisitIdentifier',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Ward/Room/Bed',
                    field: 'WardDetail',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
            ],
            searchparams: {},
            result: {},
            api: 'Visit/Visit/GetEncounters',
            presearch: presearchEncounter,
            formatdisplay: formatselectedEncounter,
            postsearch: postsearchEncounter
        };

        function formatselectedEncounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            if (selectedItem) {
                if (selectedItem.IsBillLock) {
                    var msg = 'Bill has been Locked';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                } else if (selectedItem.IsBillFinalized) {
                    var msg = 'Bill has been Finalized';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                }
            }
            var result = '';
            if (selectedItem) {
                result = '';
                if (selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
            }
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = '';
                if (selectedItem.Patient && selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient && selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient && selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
            }
            if (vm.patientcontrolconfig.selected)
                $scope.patientChanged();
            return result;
        }


        $scope.patientChanged = function () {
            $scope.Encounter = $scope.item.SelectedItem;
            var selectedItem = $scope.item.SelectedItem;
            if (selectedItem) {
                $scope.item.DoctorId = selectedItem.DoctorId;
                $scope.item.DoctorName = selectedItem.Doctor.Title.Description + ' ' + selectedItem.Doctor.FirstName + ' ' + selectedItem.Doctor.LastName;
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.PatientName = '';
                if (selectedItem.Patient.Title)
                    $scope.item.PatientName += selectedItem.Patient.Title.Description;

                if (selectedItem.Patient.FirstName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.FirstName;

                if (selectedItem.Patient.LastName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.LastName;

                if (selectedItem.EncounterTypeId == 2) {
                    $scope.item.EncounterTypeId = 2;
                    $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategoryId;
                } else {
                    $scope.item.ServiceRateCategoryId = 1;
                    $scope.item.EncounterTypeId = 1;
                }
                $scope.item.PatientMrn = selectedItem.PatientMrn;
                $scope.item.VisitIdentifier = selectedItem.VisitIdentifier;
                $scope.item.Age = selectedItem.Patient.Age;
                $scope.item.Gender = selectedItem.Patient.Gender.Description;
                $scope.item.ReferralName = selectedItem.ReferralName;
                $scope.item.PatientLocation = selectedItem.PatientLocation;
                $scope.item.EncounterId = selectedItem.Id;
                $scope.item.FromFacilityId = selectedItem.FacilityId;
                $scope.item.FromLocationId = selectedItem.LocationId;
                if (selectedItem.WardMaster)
                    $scope.item.WardName = selectedItem.WardMaster.WardName;
                if (selectedItem.WardRoomBedMaster)
                    $scope.item.BedNo = selectedItem.WardRoomBedMaster.BedNo;
                if (selectedItem.WardRoomMaster)
                    $scope.item.RoomNo = selectedItem.WardRoomMaster.RoomNo;
                if (selectedItem.Facility)
                    $scope.item.FacilityName = selectedItem.Facility.FacilityName;
                if (selectedItem.Guarantor)
                    $scope.item.GuarantorName = selectedItem.Guarantor.GuarantorName;
                if (selectedItem.GuarantorTypeId)
                    $scope.item.GuarantorTypeId = selectedItem.GuarantorTypeId;
                $scope.item.FromWardId = selectedItem.WardId;
                $scope.item.FromRoomId = selectedItem.RoomId;
                $scope.item.FromBedId = selectedItem.BedId;
                if (!$scope.currentcontext.id) {
                    $scope.item.WardRoomDetail = selectedItem.WardDetail;
                }
            }
        }

        function presearchEncounter() {
            var query = vm.patientcontrolconfig.query;

            //Only ip encounter
            var inputData = {
                Params: [{
                    Key: 38,
                    Value: "2,3,4,5"
                }, {
                    Key: 15,
                    Value: 2
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            // if ($scope.currentcontext.id == 0 && $scope.currentcontext.testtype > 0) {
            //     inputData.Params.push()
            // }

            if (vm.patientcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 11,
                    Value: query
                });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchEncounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Patient.Title ? item.Patient.Title.Description : '';
                if (item.Patient.LastName) item.PatientName = [item.Patient.FirstName, item.Patient.LastName].join(' ');
                else item.PatientName = item.Patient.FirstName;
                item.Age = item.Patient.Age + ' / ' + item.Patient.Gender.Description;
                item.DOB = $filter('date')(item.Patient.DOB, 'yyyy-MMM-dd');
                item.MRN = item.Patient.MRN;
                item.VisitIdentifier = item.VisitIdentifier;
                if (item.WardMaster) {
                    item.WardDetail = item.WardMaster.WardName;
                }
                if (item.WardRoomMaster) {
                    item.WardDetail += ' / ' + item.WardRoomMaster.RoomNo;
                }
                if (item.WardRoomBedMaster) {
                    item.WardDetail += ' / ' + item.WardRoomBedMaster.BedNo;
                }
            }
        }
        $scope.saveItem = function (statusId) {

            if ($scope.item.PatientId <= 0) {
                utl.Alert.showSuccessMsg($translate.instant('bedtransfertab.patient.lbl'));
                return;
            }

            if ($scope.item.PaymentTypeId <= 0) {
                utl.Alert.showSuccessMsg($translate.instant('bedtransfertab.payment.lbl'));
                return;
            }

            if (!utl.Validator.validate($scope)) {
                return;
            }
            console.log($scope.item);


            $scope.feedbackData = {
                processDefinitionKey: "botomate-process",
                variables: [{
                        name: "status",
                        type: "string",
                        value: "LOCATION_CHANGED",
                        scope: "global"
                    },
                    {
                        name: "admitType",
                        type: "string",
                        value: "IP",
                        scope: "global"
                    },
                    {
                        name: "unitId",
                        type: "integer",
                        value: 1,
                        scope: "global"
                    },
                    {
                        name: "uhid",
                        type: "string",
                        value: ($scope.item.PatientMrn) ? $scope.item.PatientMrn : "",
                        scope: "global"
                    },
                    {
                        name: "ipNumber",
                        type: "string",
                        value: $scope.item.VisitIdentifier,
                        scope: "global"
                    },
                    {
                        name: "doctor",
                        type: "json",
                        value: [
                            $scope.item.DoctorName
                        ],
                        scope: "global"
                    },
                    {
                        name: "patientName",
                        type: "string",
                        value: $scope.item.PatientName,
                        scope: "global"
                    },
                    {
                        name: "email",
                        type: "string",
                        value: ($scope.item.SelectedItem) ? $scope.item.SelectedItem.Patient.Email : "",
                        scope: "global"
                    },
                    {
                        name: "mobileNo",
                        type: "string",
                        value: ($scope.item.SelectedItem) ? $scope.item.SelectedItem.Patient.Mobile : "",
                        scope: "global"
                    },
                    {
                        name: "dateOfAdmission",
                        type: "date",
                        value: ($scope.item.SelectedItem) ? $scope.item.SelectedItem.AdmissionDate : "",
                        scope: "global"
                    },
                    {
                        name: "dateOfBirth",
                        type: "date",
                        value: ($scope.item.SelectedItem) ? new Date($scope.item.SelectedItem.DOB) : "",
                        scope: "global"
                    },
                    {
                        name: "age",
                        type: "integer",
                        value: ($scope.item.SelectedItem) ? $scope.item.SelectedItem.Patient.Age : "",
                        scope: "global"
                    },
                    {
                        name: "location",
                        type: "string",
                        value: ($scope.item.ToLocationName) ? $scope.item.ToLocationName : "",
                        scope: "global"
                    },
                    {
                        name: "floor",
                        type: "string",
                        value: $scope.item.ToWardName,
                        scope: "global"
                    },
                    {
                        name: "bedNo",
                        type: "string",
                        value: $scope.item.ToBedName,
                        scope: "global"
                    },
                    {
                        name: "gender",
                        type: "string",
                        value: ($scope.item.Gender) ? $scope.item.Gender : "",
                        scope: "global"
                    },
                    {
                        name: "attendantMobileNumber",
                        type: "string",
                        value: "",
                        scope: "global"
                    },
                    {
                        name: "departmentName",
                        type: "string",
                        value: ($scope.item.SelectedItem) ? $scope.item.SelectedItem.Department.DepartmentName : "",
                        scope: "global"
                    },
                    // {
                    //     name: "oneTimeFeedbackName",
                    //     type: "string",
                    //     value: "IP Post Discharge Feedback",
                    //     scope: "global"
                    // },
                    {
                        name: "credit",
                        type: "string",
                        value: "cash",
                        scope: "global"
                    }
                ],
                returnVariables: false
            };
            console.log($scope.feedbackData);
            // return;
            var actionName = 'ipmanagement/BedTransfer/AddBedTransfer';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'ipmanagement/BedTransfer/UpdateBedTransfer';
            }
            console.log($scope.item);
            $scope.item.RequestedStatusId = statusId;
            $scope.item.ReceivedStatusId = 1;
            $scope.item.RequestDate = !$scope.item.RequestDate ? new Date() : $scope.item.RequestDate;
            if (statusId == 3)
                $scope.item.ReqCompletedBy = utl.Session.getCurrentUserId();
            $scope.item.fromBedTransfer = 1;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getfacilityCallback = function (scope, data, options, hasError) {
            $scope.data = data;
            $scope.item.IsWardRoomEditable = $scope.data.IsWardRoomEditable;
            if ($scope.item.IsWardRoomEditable == true) {
                $scope.WardRoomEditable = true;
            }
            if ($scope.item.IsWardRoomEditable == false) {
                $scope.WardRoomEditable = false;
            }
        };
        $scope.getfacility = function () {
            var options = {
                action: 'SystemSettings/facility/GetFacilityById',
                data: {
                    Id: utl.Session.getCurrentFacilityId()
                },
                type: 'post',
                onComplete: $scope.getfacilityCallback
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            $scope.getfacility();
        }
        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.loadAdditionalLookup = function () {
            $scope.wardLookUp();
            $scope.getRoomLookUp();
            $scope.getBedLookUp();

        }
        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        //     $scope.getItem();
        // }

        $scope.initAllLookup = function () {
            var inputData = [{
                    "Key": "Facility"
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
                // {
                //     "Key": "Bed"
                // },
                {
                    "Key": "Block"
                },
                {
                    "Key": "Ward",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: 1
                        }]
                    }
                },
                {
                    "Key": "Room"
                },
                {
                    "Key": "BedCategory"
                },
                {
                    "Key": "Remark"
                },
                {
                    "Key": "Department"
                },
                {
                    Key: 'Doctor',
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: 2
                        }]

                    }
                },
                {
                    "Key": "ServiceRateCategory"
                },

                {
                    "Key": "Location"
                } // become slow put text box
            ]


            $scope.lookupCall(inputData);
            if ($scope.currentcontext.id > 0) {
                $scope.getItem();
            }
            if ($scope.currentcontext.pid > 0) {
                $scope.getPatient();
            }
            $scope.loadAdditionalLookup();
        }
        $scope.wardLookUp = function (selectedItem) {
            if (selectedItem) {
                $scope.item.LocationName = selectedItem.Text;
            }

            var inputData = [{
                "Key": "Ward",
                Request: {
                    Params: [{
                            Key: 2,
                            Value: $scope.item.FacilityId || null
                        },
                        {
                            Key: 5,
                            Value: $scope.item.ToLocationId || null
                        },
                        {
                            Key: 7,
                            Value: 1
                        }
                    ]
                }
            }, ];
            $scope.lookupCall(inputData);
            $scope.item.ToWardId = $scope.item.WardId || null;
            $scope.item.ToRoomId = $scope.item.RoomId || null;
            $scope.item.ToBedId = $scope.item.BedId || 0;
            $scope.item.ToServiceRateCategoryId = null;
        }

        $scope.getRoomLookUp = function (selectedItem) {
            if (selectedItem) {
                $scope.item.WardName = selectedItem.Text;
            }
            var inputData = [{
                "Key": "Room",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.ToWardId || null
                    }]
                }
            }];
            $scope.lookupCall(inputData);
            // $scope.item.ToRoomId = null;
            // $scope.item.ToBedId = null;
        }

        $scope.getBedLookUp = function (selectedItem) {
            if (selectedItem) {
                $scope.item.RoomName = selectedItem.Text;
            }
            // $scope.getCurrentEncounter();
            var inputData = [{
                "Key": "Bed",
                Request: {
                    Params: [{
                            Key: 1,
                            Value: $scope.item.ToWardId || null
                        },
                        {
                            Key: 2,
                            Value: $scope.item.ToRoomId || null
                        },
                        {
                            Key: 5,
                            Value: 1
                        }
                    ]
                }
            }];
            if ($scope.currentcontext.id > 0) {
                inputData = [{
                    "Key": "Bed",
                    Request: {
                        Params: [{
                                Key: 1,
                                Value: $scope.item.ToWardId || null
                            },
                            {
                                Key: 2,
                                Value: $scope.item.ToRoomId || null
                            }
                        ]
                    }
                }];
            }
            $scope.lookupCall(inputData);
            // $scope.item.BedId = null;
        }

        // Referaltype based Referral Lookup - Start
        $scope.getReferralLookUp = function () {
            var inputData = [{
                "Key": "Referral",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: $scope.item.ReferralTypeId || 0
                    }]
                }
            }];
            $scope.lookupCall(inputData);
        }
        $scope.initAllLookup();
    }

    bedtransferformController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();