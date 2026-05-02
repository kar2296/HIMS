(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('onlineConsentFormController', onlineConsentFormController);

    function onlineConsentFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));
        $scope.item = {};
        $scope.details = [];
        $scope.EncounterInfo = {};
        $scope.isRecording = false;
        $scope.recordedTime = 0;
        $scope.blobUrl = '';
        $scope.teste = '';
        $scope.IsMRDFileCreation = 0;
        $scope.PatientGuarantor = 0;
        $scope.canShowBarcodeButton = false;
        $scope.startinterval = null;
        $scope.currentcontext = {
            attachmentcount: 0
        };
        $scope.NoofPrintPatientLabel = 1;
        $scope.item.IsNewEncounter = false;
        $scope.item.GuarantorTypeId = 1;
        $scope.currentcontext.selecteddept = [];
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.isemergency = $stateParams.isemergency;
        $scope.currentcontext.isdaycare = $stateParams.isdaycare;
        $scope.currentcontext.admdate = $stateParams.admdate;
        $scope.isFinalized = false;
        $scope.patientfilterconfig = {
            isbilloutstanding: true
        };
        $scope.DisableReferral = false;
        $scope.currentcontext.CanAdmCancel = utl.Privilege.hasAccess('CanAdmCancel');
        $scope.currentcontext.retrycount = 0;
        $scope.currentcontext.retrycount =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'barcodecount');
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };
        $scope.fillDefaultValues = function () {
            $scope.item = {
                IsActive: true,
                PatientId: -1,
                OldAppointmentId: -1,
                AdmissionDate: utl.Formatter.getCurrentDate(),
                AdmissionTypeId: 1,
                AdmissionRequestTypeId: 1,
                GuarantorTypeId: 1,
                GuarantorId: 1,
                FacilityId: utl.Session.getCurrentFacilityId(),
                isAdmitted: false,
                isDatedisable: false,
                isl: false,
                ReferralTypeId: 9,
                AdmissionStatus: null,
                tabindex: $scope.tabindexmap.detailtabindex++
            };
        }
        $scope.addRemark = function () {
            utl.Modal.openFixedDialog('app.remark', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        };
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


        $scope.getItemCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item = res.Data[0];
                var data = $scope.item;
                $scope.$parent.populateData(data);
                if (data.ReferralTypeId) {
                    $scope.item.ReferralTypeId = data.ReferralTypeId;
                }
                if (data.ReferralId) {
                    $scope.item.ReferralId = data.ReferralId;
                }
                if ($scope.item.AdmissionStatusId == 1)
                    $scope.item.AdmissionDate = utl.Formatter.getCurrentDate();
                // $scope.item.DepartmentId = data.DepartmentId;
                $scope.patientChange();
                $scope.onDoctorSelected();
                //$scope.getCreatedUser();
                if ($scope.item.ReferralId > 0) {
                    $scope.DisableReferral = true;
                }

                if (data.AdmissionStatusId == 2) {
                    $scope.item.isAdmitted = true;
                    $scope.item.isDatedisable = true;
                    $scope.Data.AdmissionStatus = 'Admitted';
                }
                if (data.AdmissionStatusId == 3) {
                    $scope.item.isAdmitted = true;
                    $scope.item.isDatedisable = true;
                    $scope.Data.AdmissionStatus = 'Fit for Discharge';
                }
                if (data.AdmissionStatusId == 4) {
                    $scope.item.isAdmitted = true;
                    $scope.item.isDatedisable = true;
                    $scope.Data.AdmissionStatus = 'Clinically Discharged';
                }
                if (data.AdmissionStatusId == 5) {
                    $scope.item.isAdmitted = true;
                    $scope.item.isDatedisable = true;
                    $scope.Data.AdmissionStatus = 'Financially Discharged';
                }
                if (data.AdmissionStatusId == 6) {
                    $scope.item.isAdmitted = true;
                    $scope.item.isl = true;
                    $scope.item.isDatedisable = true;
                    $scope.Data.AdmissionStatus = 'Physically Discharged';
                }

                $scope.applyVisibilityRules();
                $scope.loadPatientGuarantors();
            }
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

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
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {
                $scope.item.PatientId = $scope.currentcontext.pid;
                $scope.patientChange();
            }
        };

        $scope.start_recording = function () {
            navigator.getUserMedia(session, function (mediaStream) {
                window.recordRTC = RecordRTC(mediaStream);
                recordRTC.startRecording();
            }, function (error) { console.log(error) });
        };

        $scope.stop_recording = function () {
            navigator.getUserMedia({ audio: true }, function (mediaStream) {
                window.recordRTC = RecordRTC(mediaStream);
                recordRTC.startRecording();
            });
        };
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.id = data;
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $state.go('app.admissiontab.admission', {
                id: $scope.currentcontext.id
            });
        };

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            // $scope.selectedPatient = data;
            if ($scope.selectedPatient.OutStandingAmount && $scope.selectedPatient.OutStandingAmount > 0)
                utl.Alert.showErrorMsg($translate.instant('admissions.dueamount.lbl') + $filter('displaycurrency')($scope.selectedPatient.OutStandingAmount));
            $scope.item.Patient = data; //$scope.selectedPatient;
            if ($scope.item.Patient.MRNTypeId == 1) {
                utl.Alert.showErrorMsg($translate.instant("admissions.temppatient.lbl"));
                $scope.fillDefaultValues();
                return false;
            }
            if ($scope.item.Patient.Encounters) {
                if ($scope.item.Patient.Encounters[0].ReferralId) {
                    $scope.item.ReferralId = $scope.item.Patient.Encounters[0].ReferralId;
                }
                if ($scope.item.Patient.Encounters[0].ReferralTypeId) {
                    $scope.item.ReferralTypeId = $scope.item.Patient.Encounters[0].ReferralTypeId;
                }
            } else {
                $scope.item.ReferralId = $scope.item.Patient.ReferrerId;
                $scope.item.ReferralTypeId = $scope.item.Patient.ReferTypeId;
            }
            $scope.$parent.selectedPatient = data;
            $scope.$parent.getPatientAlertsCount();
            if ($scope.currentcontext.id == 0)
                $scope.getEncounters()
            $scope.loadPatientGuarantors();
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
        }
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.PatientMrn = $scope.item.Patient.MRN;
            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.Status = 1;
            $scope.item.EncounterTypeId = 2;
            $scope.item.OrganizationId = utl.Session.getCurrentOrgId();
            $scope.item.AdmissionDate = $scope.item.AdmissionDate;

            if ($scope.item.AdmissionStatusId == 6) {
                $scope.item.DischargeDate = utl.Formatter.getCurrentDate();
            }

            var actionName = 'Visit/Visit/ManageAdmissionEncounter';
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


        $scope.clear = function () {
            $scope.item = {};
            $scope.currentcontext.pid = 0;
            $scope.$parent.selectedPatient = {};
            $scope.fillDefaultValues();
        }



        $scope.save = function () {
            if (!$scope.item.AdmissionStatusId) {
                $scope.item.AdmissionStatusId = 1;
                $scope.checkOPEncounter();
            } else {
                $scope.saveItem();
            }

        };

        $scope.saveAndApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AdmissionStatusId = 2;

            $scope.checkOPEncounter();
        };
        $scope.backToList = function () {
            $state.go('app.admissions');
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        }
        $scope.getReferral = function (selectedItem) {
            $scope.item.ReferralName = selectedItem.Text;
        }


        $scope.GetGuarantorCallback = function (scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            if ($scope.lookup.Guarantor && $scope.lookup.Guarantor.length > 1) {
                $scope.item.GuarantorId = $scope.lookup.Guarantor[1].Id;
                $scope.PatGuarantorNoofFreeVisit = 0;
                // $scope.setDefaultService();
            }
        };

        $scope.GetGuarantor = function () {
            $scope.item.GuarantorId = -1;
            if (!$scope.item.GuarantorTypeId) {
                $scope.item.GuarantorId = -1;
                // $scope.CalculateNetAmt();
            } else if ($scope.item.GuarantorTypeId <= 0) {
                $scope.item.GuarantorId = -1;
                // $scope.CalculateNetAmt();
            } else {
                $scope.item.GuarantorId = 1;
                if ($scope.PatientGuarantor == 0) {
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
                    }];
                    $scope.initLookupCall(inputData, $scope.GetGuarantorCallback);
                } else {
                    $scope.getPatientGuarantor();
                }
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



        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getencountersCallback = function (scope, data, options, hasError) {
            $scope.IsOpPatient = false;
            $scope.Encounters = data.Data[0];
            if ($scope.Encounters) {
                $scope.EncounterStatusId = $scope.Encounters.EncounterStatusId
                if (data.Data.length > 0 && $scope.EncounterStatusId == 1) {
                    $scope.IsOpPatient = true;
                    utl.Alert.showErrorMsg($translate.instant('admissions.opvisit.lbl'));
                    $scope.item.ReferralId = $scope.Encounters.ReferralId;
                    $scope.item.ReferralTypeId = $scope.Encounters.ReferralTypeId;
                    $scope.Encounters = data.Data[0];
                    $scope.item.EncounterId = $scope.Encounters.Id;
                    $scope.item.OldAppointmentId = $scope.Encounters.AppointmentId;
                }
            } else {
                $scope.item.IsNewEncounter = true;
            }
        };

        $scope.getEncounters = function () {
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
                    Key: 52,
                    Value: 1
                },
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
        };

        $scope.SelectedServiceRate = function (selectedItem) {
            $scope.item.ServiceRateCategoryId = selectedItem.Id;
        };

        $scope.departmentChange = function () {
            var inputData = [];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.departmentChangeCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getFacInfoCallbck = function (scope, data, options, hasError) {

            $scope.item.IsAdmissionDate = data.IsAdmissionDate;
            $scope.ShowAdmissionDate = false;
            if (data.IsAdmissionDate) {
                $scope.ShowAdmissionDate = true;
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


        $scope.initAllLookup = function () {
            var inputData = [{
                "Key": "Referral"
            },
            {
                "Key": "Department"
            },
            {
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }],
                }
            },
            {
                "Key": "AdmissionRequestType"
            },
            {
                "Key": "GuarantorType"
            },
            {
                "Key": "GuardianType"
            },
            {
                "Key": "ReferralType"
            },
            {
                "Key": "selecteddept"
            },
            {
                "Key": "PromotionalScheme",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: 2
                    }]
                }
            },
            {
                "Key": "Location",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    }],
                }
            },
            {
                "Key": "ServiceRateCategory",
                Request: {
                    Params: [{
                        Key: 5,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "Remark"
            },
            {
                "Key": "RELATIONSHIP"
            },
            {
                "Key": "Facility"
            },
            {
                "Key": "AdmittingReason"
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
                "Key": "Remark",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 5
                    }, {
                        Key: 5,
                        Value: 2
                    }],
                }
            },
            // {
            //     "Key": "Doctor"
            // },
            {
                "Key": "Team"
            },
            {
                "Key": "PatientGuarantor"
            },
            ]


            $scope.lookupCall(inputData);
            $scope.getItem();
            $scope.getFinalBill();

            $scope.loadAdditionalLookup();
            $scope.getFacInfo();
        }

        $scope.backToList = function () {
            $state.go('app.admissiontab.admission');
        }
    }

    onlineConsentFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();