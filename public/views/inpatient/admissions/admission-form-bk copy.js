(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissionFormController', admissionFormController);

    function admissionFormController($scope, $stateParams, $state, $translate, utl, $filter) {
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
        $scope.isFinalized = false;
        $scope.patientfilterconfig = {
            isbilloutstanding: true
        };
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
                if ($scope.item.AdmissionStatusId == 1)
                    $scope.item.AdmissionDate = utl.Formatter.getCurrentDate();
                // $scope.item.DepartmentId = data.DepartmentId;
                $scope.patientChange();
                $scope.onDoctorSelected();
                //$scope.getCreatedUser();


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
        $scope.patcmnts = function () {
            utl.Modal.open('app.patcomments', {
                params: {
                    eid: $scope.currentcontext.id,
                    pid: $scope.item.PatientId,
                },
                confirmCallback: $scope.getItem
            });
        }

        $scope.enabledate = function () {
            $scope.item.isDatedisable = false;
        }
        $scope.addDoctor = function () {
            utl.Modal.open('app.doctortransfer', {
                params: {
                    eid: $scope.item.Id,
                    pid: $scope.item.PatientId,
                    doctorid: $scope.item.DoctorId
                },
                confirmCallback: $scope.getItem
            });
        }
        $scope.addNew = function () {
            $scope.selectedPatient = {};
            $scope.currentcontext.id = 0;
            document.getElementById("item_form").reset();
            $scope.fillDefaultValues();
        }
        // $scope.fitfordischarge = function () {
        //     $scope.item.AdmissionStatusId = 3;
        //     $scope.saveItem();
        // }
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.admissionlablescript = function () {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintPatientLabel && !isNaN($scope.NoofPrintPatientLabel))
                    noofprint = parseInt($scope.NoofPrintPatientLabel);
            } catch (ex) {
                noofprint = 1;
            }
            try {

                var vTitle = '';
                var vPatientName = '';
                var vGender = '';
                var vAge = '';
                var vOpno = '';
                var vWardName = '';
                var vRoomNo = '';
                var vMobile = '';
                var vAdmissionDate = '';
                var vDoctorName1 = '';
                var vDoctorName2 = '';
                //var vMRN = '';
                var vMRN = '';

                try {
                    if ($scope.item && $scope.item.Patient.Title &&
                        $scope.item.Patient.Title.Description)
                        vTitle += $scope.item.Patient.Title.Description;

                    if ($scope.item && $scope.item &&
                        $scope.item.Patient.FirstName)
                        vPatientName += ' ' + $scope.item.Patient.FirstName;

                    if ($scope.item && $scope.item &&
                        $scope.item.Patient.Gender.Description)
                        vGender = $scope.item.Patient.Gender.Description;

                    if ($scope.item && $scope.item &&
                        $scope.item.Patient.Age)
                        vAge = $scope.item.Patient.Age;

                    if ($scope.item && $scope.item &&
                        $scope.item.VisitIdentifier)
                        vOpno = $scope.item.VisitIdentifier;

                    if ($scope.item && $scope.item &&
                        $scope.item.WardMaster.WardName)
                        vWardName = $scope.item.WardMaster.WardName;

                    if ($scope.item && $scope.item &&
                        $scope.item.WardRoomMaster.RoomNo)
                        vRoomNo = $scope.item.WardRoomMaster.RoomNo;

                    if ($scope.item && $scope.item &&
                        $scope.item.Patient.Mobile)
                        vMobile = $scope.item.Patient.Mobile;

                    if ($scope.item && $scope.item &&
                        $scope.item.AdmissionDate)
                        vAdmissionDate = $scope.item.AdmissionDate;

                    if ($scope.item && $scope.item &&
                        $scope.item.PatientMrn)
                        vMRN = $scope.item.PatientMrn;
                    if ($scope.item && $scope.item &&
                        $scope.item.Doctor.FirstName)
                        vDoctorName1 = $scope.item.Doctor.FirstName;
                    if ($scope.item && $scope.item &&
                        $scope.item.Doctor.LastName)
                        vDoctorName2 = $scope.item.Doctor.LastName;

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
                    // code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' ' + ' ' + ' PHID :' + ' ' + vMRN + '"' + printCodes.new_line;
                    // code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' ' + ' ' + ' IP.NO: ' + ' ' + vOpno + '"' + printCodes.new_line;
                    code += 'A530,194,2,4,1,1,N,"' + ' ' + ' ' + '  Pat.Name : ' + ' ' + vTitle + ' ' + vPatientName + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + 'Gender/ Age :' + ' ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;

                    code += 'A530,133,2,4,1,1,N,"' + ' ' + ' ' + 'CONSULTANT :' + ' ' + vDoctorName1 + ' ' + vDoctorName2 + '"' + printCodes.new_line;
                    // code += 'A530,133,2,4,1,1,N,"' + ' ' + ' ' + ' Appointment Id :' + ' ' + vWardName + '"' + printCodes.new_line;
                    code += 'A530,102,2,4,1,1,N,"' + ' ' + ' ' + ' Adm.Date :' + ' ' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + ' ' + ' ' + ' ' + ' ' + vMRN + '"' + printCodes.new_line;

                    // code += 'A530,133,2,4,1,1,N,"' + ' ' + ' ' + ' Appointment Id :' + ' ' + vRoomNo + '"' + printCodes.new_line;
                    // $scope.printRaw(printData);
                } else if (window.clientcode.toLowerCase() == 'eechh') {
                    // code += 'I8,A,001' + printCodes.new_line;
                    // code += 'Q200,024' + printCodes.new_line;
                    // code += 'q831' + printCodes.new_line;
                    // code += 'rN' + printCodes.new_line;
                    // code += 'S2' + printCodes.new_line;
                    // code += 'D15' + printCodes.new_line;
                    // code += 'ZT' + printCodes.new_line;
                    // code += 'JF' + printCodes.new_line;
                    // code += 'O' + printCodes.new_line;
                    // code += 'R215,0' + printCodes.new_line;
                    // code += 'f100' + printCodes.new_line;
                    // code += 'N' + printCodes.new_line;
                    // code += 'A370,170,2,3,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    // code += 'A260,170,2,4,1,1,N,"' + ':' + ' ' + vPatientName + '"' + printCodes.new_line;
                    // code += 'A370,140,2,3,1,1,N,"' + 'Age/Sex' + '"' + printCodes.new_line;
                    // code += 'A260,140,2,4,1,1,N,"' + ':' + ' ' + vAge + '/' + vGender + '"' + printCodes.new_line;
                    // code += 'A370,110,2,3,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    // code += 'A260,110,2,4,1,1,N,"' + ':' + ' ' + vMRN + '"' + printCodes.new_line;
                    // code += 'P1,1' + printCodes.new_line;


                    code += 'CT,CD,CC,CT' + printCodes.new_line;
                    code += 'XA' + printCodes.new_line;
                    code += 'DFR:Label.ZPL^FS' + printCodes.new_line;
                    code += 'TA000' + printCodes.new_line;
                    code += 'JSN' + printCodes.new_line;
                    code += 'LT0' + printCodes.new_line;
                    code += 'MNW' + printCodes.new_line;
                    code += 'MTT' + printCodes.new_line;
                    code += 'PON' + printCodes.new_line;
                    code += 'PMN' + printCodes.new_line;
                    code += 'LH0,0' + printCodes.new_line;
                    code += 'JMA' + printCodes.new_line;
                    code += 'PR2,2' + printCodes.new_line;
                    code += 'SD15' + printCodes.new_line;
                    code += 'JUS' + printCodes.new_line;
                    code += 'LRN' + printCodes.new_line;
                    code += 'CI27' + printCodes.new_line;
                    code += 'PA0,1,1,0' + printCodes.new_line;
                    code += 'MMT' + printCodes.new_line;
                    code += 'PW1890' + printCodes.new_line;
                    code += 'LL921' + printCodes.new_line;
                    code += 'LS0' + printCodes.new_line;
                    code += 'FT17,147^A0N,83,84^FH\^CI28^FDMRD No: DHAN12354^FS^CI27' + printCodes.new_line;
                    code += 'FT17,264^A0N,83,84^FH\^CI28^FDPat.Name: Mr.Rajesh kumar^FS^CI27' + printCodes.new_line;
                    code += 'FT23,374^A0N,83,84^FH\^CI28^FDAge/Sex: 45/M^FS^CI27' + printCodes.new_line;
                    code += 'FT23,478^A0N,83,84^FH\^CI28^FDReg.Date : 25/12/2022^FS^CI27' + printCodes.new_line;
                    code += 'FT23,582^A0N,83,84^FH\^CI28^FDPhone : 9874563210^FS^CI27 ' + printCodes.new_line;
                    code += 'FT23,686^A0N,83,84^FH\^CI28^FDAddress : 12 cross ^FS^CI27' + printCodes.new_line;
                    code += 'FT23,790^A0N,83,84^FH\^CI28^FD                Anna nagar , chennai^FS^CI27' + printCodes.new_line;
                    code += 'BY6,3,165^FT1181,645^BCN,,Y,N' + printCodes.new_line;
                    code += 'FH\^FD>;123456789012^FS ' + printCodes.new_line;
                    code += 'XZ ' + printCodes.new_line;
                    $scope.printRaw(printData);
                } else if (window.clientcode.toLowerCase() == 'dhanvantri') {
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
                    code += 'B583,260,2,1,3,9,40,B,"' + vOpno + '"' + printCodes.new_line;
                    code += 'A582,184,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A382,187,2,4,1,1,N,"' + ':' + ' ' + vPatientName + '"' + printCodes.new_line;
                    code += 'A582,155,2,4,1,1,N,"' + 'Gender/Age' + '"' + printCodes.new_line;
                    code += 'A381,157,2,4,1,1,N,"' + ':' + ' ' + vGender + '/' + vAge + '"' + printCodes.new_line;
                    code += 'A581,126,2,4,1,1,N,"' + 'IP No.' + '"' + printCodes.new_line;
                    code += 'A381,129,2,4,1,1,N,"' + ':' + ' ' + vOpno + '"' + printCodes.new_line;
                    code += 'A240,129,2,4,1,1,N,"' + 'Room.' + '"' + printCodes.new_line;
                    code += 'A119,130,2,4,1,1,N,"' + ':' + ' ' + vRoomNo + '"' + printCodes.new_line;
                    code += 'A581,96,2,4,1,1,N,"' + 'Ward' + '"' + printCodes.new_line;
                    code += 'A440,95,2,4,1,1,N,"' + ':' + ' ' + vWardName + '"' + printCodes.new_line;
                    code += 'A582,67,2,4,1,1,N,"' + 'Phone' + '"' + printCodes.new_line;
                    code += 'A381,66,2,4,1,1,N,"' + ':' + ' ' + vMobile + '"' + printCodes.new_line;
                    code += 'A582,35,2,4,1,1,N,"' + 'DOA' + '"' + printCodes.new_line;
                    code += 'A400,34,2,4,1,1,N,"' + ':' + ' ' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'P1' + printCodes.new_line;
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
                    // code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' ' + ' ' + ' PHID :' + ' ' + vMRN + '"' + printCodes.new_line;
                    // code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' ' + ' ' + ' IP.NO: ' + ' ' + vOpno + '"' + printCodes.new_line;
                    code += 'A530,194,2,4,1,1,N,"' + ' ' + ' ' + '  Pat.Name : ' + ' ' + vTitle + ' ' + vPatientName + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + 'Gender/ Age :' + ' ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;

                    code += 'A530,133,2,4,1,1,N,"' + ' ' + ' ' + 'CONSULTANT :' + ' ' + vDoctorName1 + ' ' + vDoctorName2 + '"' + printCodes.new_line;
                    // code += 'A530,133,2,4,1,1,N,"' + ' ' + ' ' + ' Appointment Id :' + ' ' + vWardName + '"' + printCodes.new_line;
                    code += 'A530,102,2,4,1,1,N,"' + ' ' + ' ' + ' Adm.Date :' + ' ' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + ' ' + ' ' + ' ' + ' ' + vMRN + '"' + printCodes.new_line;

                    // code += 'A530,133,2,4,1,1,N,"' + ' ' + ' ' + ' Appointment Id :' + ' ' + vRoomNo + '"' + printCodes.new_line;
                    $scope.printRaw(printData);
                }
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) {
                console.log(ex);
            }
        };


        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.getItem
            });
        }
        $scope.Bedoccupancy = function () {
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

        $scope.getPatientDischargeCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.dischargeadvicer', {
                id: data,
                EncounterId: options.data.Id,
                Encounter: options.data.Encounter
            });
        }

        $scope.fitfordischarge = function () {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: {
                    Id: $scope.currentcontext.id,
                    Encounter: $scope.item
                },
                type: 'post',
                onComplete: $scope.getPatientDischargeCallback
            };
            utl.Http.doAction(options);
        }


        $scope.getPatientDischargeEventCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.discharpatient', {
                id: data,
                EncounterId: options.data.Id,
                Encounter: options.data.Encounter
            });
        }

        $scope.clinicalDischarge = function (Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: {
                    Id: $scope.currentcontext.id,
                    Encounter: $scope.item
                },
                type: 'post',
                onComplete: $scope.getPatientDischargeEventCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getPhysicalDischargeCallback = function (scope, data, options, hasError) {
            console.log(data);
            $scope.openModal('app.physicalpatient', {
                id: data,
                EncounterId: options.data.Id,
                Encounter: options.data.Encounter
            });
        }

        $scope.patientDischarge = function (Encounter) {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: {
                    Id: $scope.currentcontext.id,
                    Encounter: $scope.item
                },
                type: 'post',
                onComplete: $scope.getPhysicalDischargeCallback
            };
            utl.Http.doAction(options);
        }

        $scope.roomViewCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
            //window.open(data);
        };
        $scope.addpic = function (row) {
            var inputData = {
                PhotoPath: $scope.item.PhotoPath
            };
            var options = {
                action: 'generalmaster/wardroommaster/GetRoomFile',
                data: {
                    Data: inputData
                },
                onComplete: $scope.roomViewCallback
            };
            utl.Http.doDownload(options);


        }
        $scope.populateEstimateDisDate = function () {
            if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.AdmissionDate && $scope.item.AdmissionDate != '') {
                var AdmissionDate = new Date($scope.item.AdmissionDate);
                $scope.item.ExpectedDischargeDate = new Date(AdmissionDate.getFullYear(),
                    AdmissionDate.getMonth(),
                    AdmissionDate.getDate() + parseInt($scope.item.ALOS));
            }
        }
        $scope.referredBy = function () {
            $state.go('app.admissiontab.admissionreferral', {
                admissionreferralid: 0
            });
        }

        $scope.guarantor = function () {
            $state.go('app.admissiontab.admissionguarantor', {
                admissionguarantorid: 0
            });
        }

        $scope.diagnosis = function () {
            utl.Modal.openFixedDialog('app.admissiontab.admissiondiagnosis', {
                params: {
                    admissiondiagnosisid: 0
                },
                confirmCallback: $scope.initLookup
            });
            // $state.go('app.admissiontab.admissiondiagnosis', {
            //     admissiondiagnosisid: 0
            // });
        }

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
        // Auto Select Service Rate category-Start   
        $scope.getBedInfo = function (scope, data, options, hasError) {
            if (!$scope.item.ServiceRateCategoryId) {
                $scope.item.ServiceRateCategoryId = data.ServiceRateCategoryId;
            }
            $scope.checkBedTariff();
        }

        $scope.tariffChange = function () {
            if ($scope.item.BedId > 0) {
                var options = {
                    action: 'generalmaster/WardRoomBedMaster/GetWardRoomBedMasterById',
                    data: {
                        Id: $scope.item.BedId
                    },
                    type: 'post',
                    onComplete: $scope.getBedInfo
                };
                utl.Http.doAction(options);
            }
        }

        $scope.admsnCancel = function () {
            var msg = 'Do You Want Cancel all Bills?'
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.OnCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.OnCancelConfirmed = function () {
            var msg = 'Do You Want Cancel all Receipts?'
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.OnallCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.OnallCancelConfirmed = function () {

            var actionName = 'Visit/Visit/CancelAdmissionEncounter';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.cancelItemCallback
            };
            utl.Http.doAction(options);

        };

        $scope.cancelItemCallback = function (scope, data, options, hasError) {
            // $scope.currentcontext.id = data;
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $state.go('app.admissions');
        };

        // Auto Select Service Rate category-End   
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.PatientMrn = $scope.item.Patient.MRN;
            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.Status = 1;
            $scope.item.EncounterTypeId = 2;
            $scope.item.OrganizationId = utl.Session.getCurrentOrgId();

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

        $scope.applyVisibilityRules = function () {
            // Draft

            if ($scope.currentcontext.id <= 0) {
                $scope.canShowSaveBtn = false;
                $scope.canShowDeleteBtn = true;
                $scope.canShowBackBtn = true;
                $scope.canhistoryBtn = false;
                $scope.canShowCancelledBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowAddNewBtn = true;
                $scope.canprintBtn = false;
                $scope.CanMrdButton = false;
                $scope.CanShowMedico = false;

            } else {
                $scope.canShowSaveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelledBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowAddNewBtn = true;
                $scope.CanMrdButton = false;
                $scope.CanShowMedico = true;

                if ($scope.item.AdmissionStatusId == 1) {
                    $scope.canShowSaveBtn = false;
                    $scope.canShowPrescribeBtn = true;
                    $scope.canShowCancelledBtn = false;
                    $scope.canShowPrescribeOrderBtn = true;
                    $scope.canShowClearBtn = true;
                    $scope.canShowCancelBtn = false;
                    $scope.HidePrintBtn = true;
                    $scope.canShowSaveandApproveBtn = true;
                    $scope.canShowViewReceipt = false;
                    $scope.canprintBtn = false;
                    $scope.CanMrdButton = false;
                    $scope.CanShowMedico = false;

                }
                // Bill Completed
                if ($scope.item.AdmissionStatusId == 2) {
                    $scope.canShowSaveBtn = true;
                    $scope.canhistoryBtn = true;
                    $scope.canShowPrescribeOrderBtn = false;
                    $scope.canShowCancelledBtn = true;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandApproveBtn = false;
                    $scope.canShowCancelBtn = false;
                    $scope.canbedoccupancyBtn = true;
                    $scope.canfitfordischargeBtn = true;
                    $scope.canclinicaldischargeBtn = true;
                    $scope.canphysicaldischargeBtn = false;
                    $scope.canprintBtn = true;
                    $scope.CanMrdButton = false;
                    $scope.CanShowMedico = true;
                    // $scope.canShowViewReceipt = true;
                }
                // Bill Cancelled
                if ($scope.item.AdmissionStatusId == 3) {
                    $scope.canShowSaveBtn = true;
                    $scope.canhistoryBtn = true;
                    $scope.canShowCancelledBtn = false;
                    $scope.canShowPrescribeOrderBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandApproveBtn = false;
                    $scope.canShowCancelBtn = true;
                    $scope.canbedoccupancyBtn = true;
                    $scope.canprintBtn = true;
                    $scope.canclinicaldischargeBtn = true;
                    $scope.canphysicaldischargeBtn = false;
                    $scope.CanMrdButton = false;
                    $scope.CanShowMedico = true;
                }
                if ($scope.item.AdmissionStatusId == 4) {
                    $scope.canShowSaveBtn = true;
                    $scope.canhistoryBtn = true;
                    $scope.canShowCancelledBtn = false;
                    $scope.canShowPrescribeOrderBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandApproveBtn = false;
                    $scope.canbedoccupancyBtn = true;
                    $scope.canShowCancelBtn = true;
                    $scope.canprintBtn = true;
                    $scope.canphysicaldischargeBtn = false;
                    $scope.CanMrdButton = false;
                    $scope.CanShowMedico = true;
                }
                if ($scope.item.AdmissionStatusId == 5) {
                    $scope.canShowSaveBtn = true;
                    $scope.canhistoryBtn = true;
                    $scope.canShowCancelledBtn = false;
                    $scope.canShowPrescribeOrderBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandApproveBtn = false;
                    $scope.canShowCancelBtn = true;
                    $scope.canbedoccupancyBtn = false;
                    $scope.canprintBtn = true;
                    $scope.canphysicaldischargeBtn = true;
                    $scope.CanMrdButton = false;
                    $scope.CanShowMedico = true;
                }
                if ($scope.item.AdmissionStatusId == 6) {
                    $scope.canShowSaveBtn = false;
                    $scope.canhistoryBtn = true;
                    $scope.canShowCancelledBtn = false;
                    $scope.canShowPrescribeOrderBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandApproveBtn = false;
                    $scope.canShowCancelBtn = true;
                    $scope.canprintBtn = true;
                    $scope.canShowViewReceipt = true;
                    $scope.CanMrdButton = false;
                    $scope.CanShowMedico = true;
                }
            }
        }

        $scope.mrdrequest = function () {
            utl.Modal.open('app.filedetail', {
                params: {
                    patient: $scope.selectedPatient,
                    encounter: $scope.item,
                    mrdtype: 2
                },
                // confirmCallback: $scope.getList
            });
        }
        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();

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
        $scope.clear = function () {
            $scope.item = {};
            $scope.currentcontext.pid = 0;
            $scope.$parent.selectedPatient = {};
            $scope.fillDefaultValues();
        }
        $scope.preadmission = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.previousadmission', {
                    params: {
                        pid: $scope.item.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('admission.previous-admi-nopatient-msg.lbl'));
            }
        }
        $scope.admissionhistory = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.admissionhistory', {
                    params: {
                        pid: $scope.item.PatientId,
                        EncounterId: $scope.currentcontext.id
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('admission.previous-admi-nopatient-msg.lbl'));
            }
        }
        // $scope.openattachments = function () {
        //     if ($scope.item.PatientId > 0) {
        //         utl.Modal.open('app.patientattachments', {
        //             params: { pid: $scope.item.PatientId, itemid: $scope.item.Id, objecttypeid: 1},
        //             confirmCallback: $scope.getPatientAttachments,
        //             cancelCallback: $scope.getPatientAttachments
        //         });
        //     } else {
        //         utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
        //     }
        // }


        $scope.openattachments = function () {
            if ($scope.currentcontext.id > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: {
                        pid: $scope.currentcontext.id,
                        itemid: $scope.item.Id,
                        objecttypeid: 3
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('admissions.guarantoralert.lbl'));
            }
        }
        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        }

        $scope.getPatientAttachments = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.id
                }, {
                    Key: 3,
                    Value: 3
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
        }

        $scope.print = function () {
            var inputData = {
                Id: $scope.item.Id
            };
            var options = {
                action: 'Visit/Visit/PrintEncounter',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.print2 = function () {
            var inputData = {
                Id: $scope.item.Id,
                Data: true
            };
            var options = {
                action: 'Visit/Visit/PrintEncounter',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.print3 = function () {
            var inputData = {
                Id: $scope.item.Id,
                Data: true
            };
            var options = {
                action: 'Visit/Visit/PrintAdmissionLabel5',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.openPatientConsentPrint = function () {
            var inputData = {
                Id: $scope.item.Id
            };
            var options = {
                action: 'Visit/Visit/PatientConsentPrint',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        //patientworkorder Print
        // $scope.print3 = function() {
        //     var inputData = {
        //         Id: $scope.item.Id
        //     };
        //     var options = {
        //         action: 'emr/patientorder/PrintPatientOrders',
        //         data: inputData,
        //         type: 'post'
        //     };
        //     utl.Http.doDownload(options);
        // }

        $scope.checkOPEncounter = function () {
            var msg = 'admission.confirmmsg.lbl'
            if ($scope.IsOpPatient) {
                msg = 'admission.opconfirmmsg.lbl';
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: msg,
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.checkoutOldEncounter,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            } else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: msg,
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.saveItem,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        }

        $scope.save = function () {
            if (!$scope.item.AdmissionStatusId) {
                $scope.item.AdmissionStatusId = 1;
                $scope.checkOPEncounter();
            } else {
                $scope.saveItem();
            }

        };


        $scope.checkoutOldEncounter = function () {
            utl.Modal.open('app.patienttracker', {
                params: {
                    pid: $scope.item.PatientId,
                    aid: $scope.item.OldAppointmentId,
                    assignto: 4
                },
                confirmCallback: $scope.getEncounters
            });
        }

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
        $scope.getMRDFlowRequired = function () {
            try {
                $scope.IsMRDFileCreation = 0;
                $scope.IsMRDFileCreation =
                    utl.FacilitySetting.getFacilitySettingValue('general', 'mrdfilecreation');
            } catch (ex) { }

            if ($scope.IsMRDFileCreation) {
                $scope.item.IsMRDFileCreation = true;
            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        }
        $scope.getReferral = function (selectedItem) {
            $scope.item.ReferralName = selectedItem.Text;
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
                        GuarantorId_ = SelectedGuarantor.GuarantorId;
                        $scope.item.AcutalGuarantorId = GuarantorId_;
                        $scope.item.GuarantorTypeId = SelectedGuarantor.GuarantorTypeId;
                        ServiceRateCategoryId_ = SelectedGuarantor.Guarantor.ServiceRateCategoryId;
                        $scope.item.ServiceRateCategoryId_ = ServiceRateCategoryId_;
                        $scope.item.GuarantorName = SelectedGuarantor.Text;
                    }
                    var NewVisit = 1;
                    if ($scope.pastvisitinfo.length > 0) NewVisit = 2;
                    var Data = {
                        'NewVisit': NewVisit,
                        'FacilityId': utl.Session.getCurrentFacilityId(),
                        'GuarantorTypeId': $scope.item.GuarantorTypeId,
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
        };


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

        $scope.getMRDFlowRequired();
        // $scope.getGuarantor = function(selectedItem) {
        //     $scope.item.GuarantorName = selectedItem.Text;
        // }

        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.addReferral = function () {
            utl.Modal.open('app.referral', {
                params: {
                    id: 0
                },
                // confirmCallback: $scope.initAllLookup
            });
        }

        $scope.getencountersCallback = function (scope, data, options, hasError) {
            $scope.IsOpPatient = false;
            $scope.Encounters = data.Data[0];
            if ($scope.Encounters) {
                $scope.EncounterStatusId = $scope.Encounters.EncounterStatusId
                if (data.Data.length > 0 && $scope.EncounterStatusId == 1) {
                    $scope.IsOpPatient = true;
                    utl.Alert.showErrorMsg($translate.instant('admissions.opvisit.lbl'));

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

        $scope.bedDetail = function (data) {
            $scope.item.LocationId = data.LocationId;
            $scope.initAllLookup();
            $scope.item.WardId = data.WardId;
            $scope.item.RoomId = data.RoomId;
            $scope.item.BedId = data.BedId;
            $scope.item.ServiceRateCategoryId = data.ServiceRateCategoryId;
            $scope.item.PhotoPath = data.PhotoPath;
            $scope.checkBedTariff();
        }

        $scope.checkBedTariff = function () {
            try {
                if ($scope.item.GuarantorId) {
                    var GuarantorObj =
                        utl.Lookup.getObject($scope.lookup.Guarantor, $scope.item.GuarantorId);
                    if (GuarantorObj && GuarantorObj.Id) {
                        // var GuarantorMasterObj =
                        //     utl.Lookup.getObject($scope.lookup.Guarantor, GuarantorObj.Id);
                        if (GuarantorObj && GuarantorObj.ServiceRateCategoryId && !GuarantorObj.IsIPBedTariff) {
                            $scope.item.ServiceRateCategoryId = GuarantorObj.ServiceRateCategoryId;
                        }
                    }
                }
            } catch (ex) {
                console.log(ex);
            }
        }


        $scope.openWardBed = function () {
            utl.Modal.open('app.WardBedPicker', {
                params: {},
                confirmCallback: $scope.bedDetail
            });
        }
        $scope.departmentChangeCallback = function (scope, data, options, hasError) {

        }
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

        $scope.doctorChange = function () {
            //Set selected doctor department id to appointment department id
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            for (var idx in $scope.lookup.Department) {
                if ($scope.lookup.Department[idx].Id == doctorObj.DepartmentId) {
                    if ($scope.currentcontext.selecteddept.indexOf($scope.lookup.Department[idx]) == -1) {
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[idx]);
                    }
                }
            }
            if ($scope.currentcontext.selecteddept.length > 0)
                $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;

        }
        $scope.onDoctorSelected = function (data) {
            $scope.currentcontext.selecteddept = [];
            $scope.item.DoctorName = '';
            if (data.Title) {
                if (data.Title.Description) {
                    $scope.item.DoctorName = data.Title.Description;
                }
            }
            if (data.FirstName) {
                $scope.item.DoctorName += ' ' + data.FirstName;
            }
            if (data.LastName) {
                $scope.item.DoctorName += ' ' + data.LastName;
            }
            $scope.getdepartment();
            console.log(data);
        }
        $scope.getdeptCallback = function (scope, data, options, hasError) {
            $scope.item.map = data;
            var dept = [];
            for (var idx in data) {
                dept.push(data[idx])
                for (var iddx in $scope.lookup.Department) {
                    if ($scope.lookup.Department[iddx].Id == dept[idx].DepartmentId)
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[iddx]);
                }
                $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
            }
            $scope.doctorChange();
        };
        $scope.getdepartment = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.DoctorId
                }]
            };
            var options = {
                action: 'SystemSettings/User/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getdeptCallback
            };
            utl.Http.doAction(options);
        };
        $scope.referralCallBack = function (data) {
            if (data && data != undefined) {
                $scope.item.ReferralId = data;
                $scope.getReferralLookUp();
            }
        }
        $scope.Diagnosis = function () {
            utl.Modal.openFixedDialog('app.diagnosis', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initAllLookup
            });
        }
        $scope.openDiagnosis = function () {
            utl.Modal.open('app.diagnosisform', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.diagnosisCallBack
            });
        }
        $scope.diagnosisCallBack = function (data) {
            if (data && data != undefined) {
                $scope.item.DiagnosisId = data;
                $scope.initAllLookup();
            }
        }

        $scope.openGuarantor = function () {
            utl.Modal.open('app.guarantortab.general', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.guarantorCallBack
            });
        }

        $scope.guarantorCallBack = function (data) {
            if (data && data != undefined) {
                $scope.item.GuarantorId = data;
                $scope.initAllLookup();
            }
        }
        $scope.bedCharges = function () {
            utl.Modal.open('app.bedcharges', {
                params: {
                    id: $scope.item.BedId
                }
            });
        }

        //Add guarantors
        function onGuarantorSelected(dataFromModal) {
            $scope.item.GuarantorId = dataFromModal.gid;
            $scope.loadPatientGuarantors();
        }

        $scope.addGuarantor = function () {
            utl.Modal.openFixedDialog('app.guarantorupdateform', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    gid: $scope.item.GuarantorId,
                    parent: 'txn',
                    isFinalized: $scope.isFinalized
                },
                confirmCallback: onGuarantorSelected,
                cancelCallback: $scope.loadPatientGuarantors
            });
        }

        $scope.getFinalBillCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0)
                $scope.isFinalized = true;
        };

        $scope.mlcForm = function () {
            utl.Modal.openFixedDialog('app.mlcform', {
                params: {
                    id: 0,
                    encounterid: $scope.item.Id,
                    pid: $scope.item.PatientId

                },
                confirmCallback: $scope.getList
            });

        }

        $scope.getFinalBill = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 16,
                        Value: $scope.currentcontext.id
                    },
                    {
                        Key: 6,
                        Value: 2
                    },
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/PatientBills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getFinalBillCallback
                };
                utl.Http.doAction(options);
            }
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
        $scope.guarantorType = function (guarantorid) {
            for (var idx in $scope.lookup.Guarantor) {
                var item = $scope.lookup.Guarantor[idx];
                if (item.Id == guarantorid) {
                    $scope.item.GuarantorTypeId = item.GuarantorTypeId;
                    $scope.item.GuarantorName = item.Text;
                }
            }
            $scope.tariffChange();
        };
        //Load patient guarantors
        $scope.loadPatientGuarantorsCallback = function (scope, data, options, hasError) {
            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;

            if (!$scope.item.GuarantorId) {
                $scope.item.GuarantorId = utl.Lookup.getDefault($scope.lookup.PatientGuarantor, 'SELF');
                if ($scope.item.GuarantorId == -1) {
                    for (var idx in $scope.lookup.PatientGuarantor) {
                        $scope.item.GuarantorId = $scope.lookup.PatientGuarantor[1].GuarantorId;
                    }
                }
            }
            $scope.guarantorType($scope.item.GuarantorId);
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

        $scope.loadAdditionalLookup = function () {
            $scope.getDeptLookUp();
            $scope.wardLookUp();
            $scope.getRoomLookUp();
            $scope.getBedLookUp();
            $scope.getReferralLookUp(); //
            $scope.loadPatientGuarantors();
        }
        //autosearch related code starts for Doctors
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
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
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
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
            $scope.item.DoctorName = result;

            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
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
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        //autosearch related code ends for Doctors

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
                result = [selectedItem.DiagnosisName + '(' + selectedItem.Code + ')'].join('  ');
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
                if (item.Description) {
                    item.Version = item.Description;
                }
                item.Speciality = item.Speciality;
            }
        }
        //autosearch related code ends for Diagnosis

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
                $scope.item.ReferralName = selectedItem.ReferralName;
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
                    Value: $scope.item.ReferralTypeId
                }],
                PageContext: {
                    PageSize: -1,
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
                    }]
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
                "Key": "PromotionalScheme"
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
        }
        $scope.wardLookUp = function () {
            $scope.item.WardId = null;
            $scope.item.RoomId = null;
            $scope.item.BedId = null;
            var inputData = [{
                "Key": "Ward",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId() || null
                    },
                    {
                        Key: 5,
                        Value: $scope.item.LocationId || null
                    }
                    ]
                }
            }];
            $scope.lookupCall(inputData);
            $scope.item.WardId = $scope.item.WardId || null;
            $scope.item.RoomId = $scope.item.RoomId || null;
            $scope.item.BedId = $scope.item.BedId || 0;
        }

        $scope.getRoomLookUp = function () {
            var inputData = [{
                "Key": "Room",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.WardId || null
                    }]
                }
            }];
            $scope.lookupCall(inputData);
            $scope.item.RoomId = null;
            $scope.item.BedId = null;
        }
        $scope.getDeptLookUp = function () {
            var inputData = [{
                "Key": "Department",
            }];
            $scope.lookupCall(inputData);
        }
        $scope.getBedLookUp = function () {
            var inputData = [{
                "Key": "Bed",
                Request: {
                    Params: [{
                        Key: 1,
                        Value: $scope.item.WardId || null
                    },
                    {
                        Key: 2,
                        Value: $scope.item.RoomId || null
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
                            Value: $scope.item.WardId || null
                        },
                        {
                            Key: 2,
                            Value: $scope.item.RoomId || null
                        }
                        ]
                    }
                }];
            }
            $scope.lookupCall(inputData);
            $scope.item.BedId = null;
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
        $scope.fillDefaultValues();
        $scope.initAllLookup();
    }
    // Referaltype based Referral Lookup - End 

    admissionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();