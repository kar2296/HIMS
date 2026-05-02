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
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.isemergency = $stateParams.isemergency;
        $scope.currentcontext.isdaycare = $stateParams.isdaycare;
        $scope.currentcontext.admdate = $stateParams.admdate;
        $scope.isFinalized = false;
        $scope.patientfilterconfig = {
            isbilloutstanding: true
        };
        $scope.DisableReferral = false;
        $scope.billItemCount = 0;
        $scope.currentcontext.CanAdmCancel = utl.Privilege.hasAccess('CanAdmCancel');
        $scope.currentcontext.CanReversebutton = utl.Privilege.hasAccess('CanReversebutton');
        $scope.currentcontext.retrycount = 0;
        $scope.currentcontext.retrycount =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'barcodecount');
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };
        $scope.editratetype = 0;
        $scope.editratetype =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'editratetype');

        if ($scope.editratetype == 0 || !$scope.editratetype) {
            $scope.DisRateType = true;
        }
        if ($scope.editratetype == 1) {
            $scope.DisRateType = false;
        }
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

        //Guarantor List
        vm.guarantorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Guarantor Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-type',
                fieldcls: 'td-type'
            }, {
                header: 'Guarantor Name',
                field: 'GuarantorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },

            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/Guarantor/GetGuarantors',
            formatdisplay: formatselectedguarantor,
            presearch: presearchguarantor,
            postsearch: postsearchguarantor
        };

        function formatselectedguarantor() {
            var selectedItem = vm.guarantorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.GuarantorId = selectedItem.Id;
                $scope.item.GuarantorName = selectedItem.GuarantorName;
                result = [selectedItem.GuarantorName].join(' ');
            } else if (vm.guarantorcontrolconfig.rowdata) {
                result = [vm.guarantorcontrolconfig.rowdata.GuarantorName].join(' ');
            }
            return result;
        }

        function presearchguarantor() {
            var query = vm.guarantorcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 7,
                    Value: [-1, utl.Session.getCurrentFacilityId()]
                },
                {
                    Key: 5,
                    Value: 2
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };


            if (vm.guarantorcontrolconfig.searchbyid === true) {
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

            vm.guarantorcontrolconfig.searchparams = inputData;
        }

        function postsearchguarantor() {
            for (var idx in vm.guarantorcontrolconfig.result) {
                var item = vm.guarantorcontrolconfig.result[idx];
                item.GuarantorName = item.GuarantorName;
                item.GuarantorCode = item.GuarantorCode;
                $scope.item.GuarantorTypeId = item.GuarantorTypeId;
                $scope.item.TpaId = item.TPAId;
                // if (item.RemarkType) {
                //     item.RemarkType = item.RemarkType.Description;
                // }
            }
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
                        $scope.item.Patient.Title.Description) {
                        vTitle += $scope.item.Patient.Title.Description;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.Patient.FirstName) {
                        vPatientName += ' ' + $scope.item.Patient.FirstName;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.Patient.Gender.Description) {
                        vGender = $scope.item.Patient.Gender.Description;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.Patient.Age) {
                        vAge = $scope.item.Patient.Age;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.VisitIdentifier) {
                        vOpno = $scope.item.VisitIdentifier;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.WardMaster.WardName) {
                        vWardName = $scope.item.WardMaster.WardName;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.WardRoomMaster.RoomNo) {
                        vRoomNo = $scope.item.WardRoomMaster.RoomNo;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.Patient.Mobile) {
                        vMobile = $scope.item.Patient.Mobile;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.AdmissionDate) {
                        vAdmissionDate = utl.Formatter.getDateTimeString($scope.item.AdmissionDate);

                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.PatientMrn) {
                        vMRN = $scope.item.PatientMrn;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.Doctor.FirstName) {
                        vDoctorName1 = $scope.item.Doctor.FirstName;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.Doctor.LastName) {
                        vDoctorName2 = $scope.item.Doctor.LastName;
                    }

                } catch (ex) { }

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                if (window.barcodeclientcode.toLowerCase() == 'prakriya') {
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
                } else if (window.barcodeclientcode.toLowerCase() == 'eecherode') {
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

                } else if (window.barcodeclientcode.toLowerCase() == 'dhanvantri') {
                    code += 'CT~~CD,~CC^~CT~' + printCodes.new_line;
                    code += ' ^XA' + printCodes.new_line;
                    code += '~TA000' + printCodes.new_line;
                    code += '~JSN' + printCodes.new_line;
                    code += '^LT0' + printCodes.new_line;
                    code += '^MNW' + printCodes.new_line;
                    code += '^MTT' + printCodes.new_line;
                    code += '^PON' + printCodes.new_line;
                    code += '^PMN' + printCodes.new_line;
                    code += '^LH0,0' + printCodes.new_line;
                    code += '^JMA' + printCodes.new_line;
                    code += '^PR2,2' + printCodes.new_line;
                    code += '~SD15' + printCodes.new_line;
                    code += ' ^JUS' + printCodes.new_line;
                    code += '^LRN' + printCodes.new_line;
                    code += '^CI27' + printCodes.new_line;
                    code += '^PA0,1,1,0' + printCodes.new_line;
                    code += '^XZ' + printCodes.new_line;
                    code += '^XA' + printCodes.new_line;
                    code += '^MMT' + printCodes.new_line;
                    code += '^PW1417' + printCodes.new_line;
                    code += '^LL709' + printCodes.new_line;
                    code += '^LS0' + printCodes.new_line;
                    code += ' ^FT41,99^A0N,67,66^FH\\^CI28^FDUHID^FS^CI27' + printCodes.new_line;
                    code += '^FT406,94^A0N,67,66^FH\\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^FT466,94^A0N,67,66^FH\\^CI28^FDDCC' + vMRN + '^FS^CI27' + printCodes.new_line;
                    code += ' ^FT47,195^A0N,67,66^FH\\^CI28^FDIP.NO^FS^CI27' + printCodes.new_line;
                    code += '^FT400,183^A0N,67,66^FH\\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^FT466,183^A0N,67,66^FH\\^CI28^FDIPDCC' + vOpno + '^FS^CI27' + printCodes.new_line;
                    code += '^FT41,279^A0N,67,66^FH\\^CI28^FDPat.Name^FS^CI27' + printCodes.new_line;
                    code += '^FT400,267^A0N,67,66^FH\\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^FT466,267^A0N,67,66^FH\\^CI28^FD' + vTitle + '' + vPatientName + '^FS^CI27' + printCodes.new_line;
                    code += ' ^FT41,351^A0N,67,66^FH\\^CI28^FDGender/Age^FS^CI27' + printCodes.new_line;
                    code += '^FT400,351^A0N,67,66^FH\\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^FT466,351^A0N,67,66^FH\\^CI28^FD' + vGender + '/' + vAge + 'Y^FS^CI27' + printCodes.new_line;
                    code += '^FT47,443^A0N,67,66^FH\\^CI28^FDConsultatant^FS^CI27' + printCodes.new_line;
                    code += '^FT400,435^A0N,67,66^FH\\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += '^FT466,435^A0N,67,66^FH\\^CI28^FDv' + DoctorName1 + '' + vDoctorName2 + ' N^FS^CI27' + printCodes.new_line;
                    code += '^FT47,519^A0N,67,66^FH\\^CI28^FDAdm.Date^FS^CI27' + printCodes.new_line;
                    code += '^FT400,519^A0N,67,66^FH\\^CI28^FD:^FS^CI27' + printCodes.new_line;
                    code += ' ^FT466,519^A0N,67,66^FH\\^CI28^FD' + vAdmissionDate + '^FS^CI27' + printCodes.new_line;
                    code += '^BY9,3,77^FT466,613^BCN,,Y,N' + printCodes.new_line;
                    code += '^FH\\^FD>;vMRN^FS' + printCodes.new_line;
                    code += '^PQ1,0,1,Y' + printCodes.new_line;
                    code += '^XZ' + printCodes.new_line;
                    $scope.printRaw(printData);

                } else if (window.barcodeclientcode.toLowerCase() == "wellcarehospital") {
                    code += "<xpml><page quantity='0' pitch='50.0 mm'></xpml>SIZE 99.10 mm, 50 mm" + printCodes.new_line;
                    code += "GAP 3 mm, 0 mm" + printCodes.new_line;
                    code += "DIRECTION 0,0" + printCodes.new_line;
                    code += "REFERENCE 0,0" + printCodes.new_line;
                    code += "OFFSET 0 mm" + printCodes.new_line;
                    code += "SET PEEL OFF" + printCodes.new_line;
                    code += "SET CUTTER OFF" + printCodes.new_line;
                    code += "SET PARTIAL_CUTTER OFF" + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><page quantity='1' pitch='50.0 mm'></xpml>SET TEAR ON" + printCodes.new_line;
                    code += "CLS" + printCodes.new_line;
                    code += "CODEPAGE 1252" + printCodes.new_line;
                    code += 'TEXT 782,381,"0",180,11,11,"UHID"' + printCodes.new_line;
                    code += 'TEXT 598,381,"0",180,16,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,381,"0",180,11,11,"' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 781,341,"0",180,11,11,"Ip Number"' + printCodes.new_line;
                    code += 'TEXT 598,341,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,341,"0",180,11,11,"' + vOpno + '"' + printCodes.new_line;
                    code += 'TEXT 771,301,"0",180,11,11,"PatientName"' + printCodes.new_line;
                    code += 'TEXT 598,301,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,301,"0",180,11,11,"' + vTitle + " " + vPatientName + '"' + printCodes.new_line;
                    code += 'TEXT 770,261,"0",180,11,11,"Age"' + printCodes.new_line;
                    code += 'TEXT 598,261,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,261,"0",180,11,11,"' + vAge + "Y" + '"' + printCodes.new_line;
                    code += 'TEXT 781,221,"0",180,11,11,"Sex"' + printCodes.new_line;
                    code += 'TEXT 598,221,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,221,"0",180,11,11,"' + vGender + '"' + printCodes.new_line;
                    code += 'TEXT 781,182,"0",180,11,11,"Adm Date"' + printCodes.new_line;
                    code += 'TEXT 599,182,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,182,"0",180,11,11,"' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'TEXT 781,142,"0",180,11,11,"Consultant"' + printCodes.new_line;
                    code += 'TEXT 599,142,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,142,"0",180,11,11,"' + vDoctorName1 + " " + vDoctorName2 + '"' + printCodes.new_line;
                    code += 'BARCODE 573,90,"93",50,0,180,3,6,"' + vMRN + '"' + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><end/></xpml>" + printCodes.new_line;
                    $scope.printRaw(printData);
                } else if (window.barcodeclientcode.toLowerCase() == "rkdiabetes") {
                    code += "<xpml><page quantity='0' pitch='50.0 mm'></xpml>SIZE 99.10 mm, 50 mm" + printCodes.new_line;
                    code += "GAP 3 mm, 0 mm" + printCodes.new_line;
                    code += "DIRECTION 0,0" + printCodes.new_line;
                    code += "REFERENCE 0,0" + printCodes.new_line;
                    code += "OFFSET 0 mm" + printCodes.new_line;
                    code += "SET PEEL OFF" + printCodes.new_line;
                    code += "SET CUTTER OFF" + printCodes.new_line;
                    code += "SET PARTIAL_CUTTER OFF" + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><page quantity='1' pitch='50.0 mm'></xpml>SET TEAR ON" + printCodes.new_line;
                    code += "CLS" + printCodes.new_line;
                    code += "CODEPAGE 1252" + printCodes.new_line;
                    code += 'TEXT 782,381,"0",180,11,11,"UHID"' + printCodes.new_line;
                    code += 'TEXT 598,381,"0",180,16,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,381,"0",180,11,11,"' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 781,341,"0",180,11,11,"Ip Number"' + printCodes.new_line;
                    code += 'TEXT 598,341,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,341,"0",180,11,11,"' + vOpno + '"' + printCodes.new_line;
                    code += 'TEXT 771,301,"0",180,11,11,"PatientName"' + printCodes.new_line;
                    code += 'TEXT 598,301,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,301,"0",180,11,11,"' + vTitle + " " + vPatientName + '"' + printCodes.new_line;
                    code += 'TEXT 770,261,"0",180,11,11,"Age"' + printCodes.new_line;
                    code += 'TEXT 598,261,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,261,"0",180,11,11,"' + vAge + "Y" + '"' + printCodes.new_line;
                    code += 'TEXT 781,221,"0",180,11,11,"Sex"' + printCodes.new_line;
                    code += 'TEXT 598,221,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,221,"0",180,11,11,"' + vGender + '"' + printCodes.new_line;
                    code += 'TEXT 781,182,"0",180,11,11,"Adm Date"' + printCodes.new_line;
                    code += 'TEXT 599,182,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,182,"0",180,11,11,"' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'TEXT 781,142,"0",180,11,11,"Consultant"' + printCodes.new_line;
                    code += 'TEXT 599,142,"0",180,11,11,":"' + printCodes.new_line;
                    code += 'TEXT 573,142,"0",180,11,11,"' + vDoctorName1 + " " + vDoctorName2 + '"' + printCodes.new_line;
                    code += 'BARCODE 573,90,"93",50,0,180,3,6,"' + vMRN + '"' + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><end/></xpml>" + printCodes.new_line;
                    $scope.printRaw(printData);
                } else if (window.barcodeclientcode.toLowerCase() == 'nkhospital') {
                    //var code = '';
                    code += 'SIZE 74.10 mm, 38 mm' + printCodes.new_line;
                    code += 'DIRECTION 0,0' + printCodes.new_line;
                    code += 'REFERENCE 0,0' + printCodes.new_line;
                    code += 'OFFSET 0 mm' + printCodes.new_line;
                    code += 'REFERENCE 0,0' + printCodes.new_line;
                    code += 'OFFSET 0 mm' + printCodes.new_line;
                    code += 'SET PEEL OFF' + printCodes.new_line;
                    code += 'SET CUTTER OFF' + printCodes.new_line;
                    code += 'SET PARTIAL_CUTTER OFF' + printCodes.new_line;
                    code += 'SET TEAR ON' + printCodes.new_line;
                    code += 'CLS' + printCodes.new_line;
                    code += 'CODEPAGE 1252' + printCodes.new_line;
                    code += 'TEXT 565,286,"ROMAN.TTF",180,13,10,"UHID :"' + printCodes.new_line;
                    code += 'TEXT 485,287,"ROMAN.TTF",180,13,10,"' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 565,254,"0",180,13,10,"IP NO :"' + printCodes.new_line;
                    code += 'TEXT 445,254,"0",180,13,10,"' + vOpno + '"' + printCodes.new_line;
                    code += 'TEXT 565,218,"0",180,13,10,"Pat. Name :"' + printCodes.new_line;
                    code += 'TEXT 386,221,"0",180,13,10,"' + vTitle + ' ' + vPatientName + '"' + printCodes.new_line;
                    code += 'TEXT 565,187,"0",180,13,10,"Consultant :"' + printCodes.new_line;
                    code += 'TEXT 372,188,"0",180,13,10,"' + vDoctorName1 + ' ' + vDoctorName2 + '"' + printCodes.new_line;
                    code += 'TEXT 565,147,"0",180,13,10,"Gender/ Age :"' + printCodes.new_line;
                    code += 'TEXT 360,145,"0",180,13,10,"' + vGender + '"' + printCodes.new_line;
                    code += 'TEXT 236,145,"0",180,13,10,"' + vAge + "Y" + '"' + printCodes.new_line;
                    code += 'TEXT 559,112,"ROMAN.TTF",180,13,10,"Adm. Date :"' + printCodes.new_line;
                    code += 'TEXT 379,112,"0",180,13,10,"' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'BAR 477,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 468,54, 5, 30' + printCodes.new_line;

                    code += 'BAR 462,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 456,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 447,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 432,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 426,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 411,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 402,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 396,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 390,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 384,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 372,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 360,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 354,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 348,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 333,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 324,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 318,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 312,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 294,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 288,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 282,54, 5, 30' + printCodes.new_line;

                    code += 'BAR 273,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 267,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 252,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 246,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 237,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 228,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 216,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 210,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 201,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 189,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 180,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 174,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 165,54, 5, 30' + printCodes.new_line;

                    code += 'BAR 150,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 144,54, 5, 30' + printCodes.new_line;
                    code += 'BAR 138,54, 5, 30' + printCodes.new_line;

                    code += 'TEXT 376,49,"ROMAN.TTF",180,1,10,"' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 256,145,"0",180,17,6,"/"' + printCodes.new_line;

                    $scope.printRaw(printData);
                } else if (window.barcodeclientcode.toLowerCase() == "eastcoasta5withheader") {
                    code += "<xpml><page quantity='0' pitch='25.0 mm'></xpml>SIZE 50.1 mm, 25 mm" + printCodes.new_line;
                    code += "DIRECTION 0,0" + printCodes.new_line;
                    code += "REFERENCE 0,0" + printCodes.new_line;
                    code += "OFFSET 0 mm" + printCodes.new_line;
                    code += "SET PEEL OFF" + printCodes.new_line;
                    code += "SET CUTTER OFF" + printCodes.new_line;
                    code += "SET PARTIAL_CUTTER OFF" + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><page quantity='1' pitch='25.0 mm'></xpml>SET TEAR ON" + printCodes.new_line;
                    code += "CLS" + printCodes.new_line;
                    code += "CODEPAGE 1252" + printCodes.new_line;
                    code += 'BARCODE 386,99,"93",54,0,180,3,6,"' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 260,41,"0",180,12,12,"' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 385,169,"0",180,10,10,"' + vTitle + " " + vPatientName + '"' + printCodes.new_line;
                    code += 'TEXT 355,128,"0",180,10,10,"' + vOpno + "" + "(" + vAge + "/" + vGender + ")" + '"' + printCodes.new_line;
                    code += 'PRINT 1,1' + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><end/></xpml>" + printCodes.new_line;
                    $scope.printRaw(printData);
                } else if (window.barcodeclientcode.toLowerCase() == "equitas") {
                    code += "<xpml><page quantity='0' pitch='50.0'></xpml>SIZE 99.10 mm, 50.0 mm" + printCodes.new_line;
                    code += "DIRECTION 0,0" + printCodes.new_line;
                    code += "REFERENCE 0,0" + printCodes.new_line;
                    code += "OFFSET 0 mm" + printCodes.new_line;
                    code += "SET PEEL OFF" + printCodes.new_line;
                    code += "SET CUTTER OFF" + printCodes.new_line;
                    code += "SET PARTIAL_CUTTER OFF" + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><page quantity='1' pitch='50.0 mm'></xpml>SET TEAR ON" + printCodes.new_line;
                    code += "CLS" + printCodes.new_line;
                    code += "CODEPAGE 1252" + printCodes.new_line;
                    code += 'TEXT 720,340,"0",180,12,12,"' + ' Pat.Name : ' + vTitle + vPatientName + '"' + printCodes.new_line;
                    code += 'TEXT 720,290,"0",180,12,12,"' + ' Gender/ Age : ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    code += 'TEXT 720,240,"0",180,12,12,"' + ' IP.NO / UHID : ' + vOpno + ' / ' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 720,190,"0",180,12,12,"' + ' Consultant DR : ' + vDoctorName1 + vDoctorName2 + '"' + printCodes.new_line;
                    code += 'TEXT 720,140,"0",180,12,12,"' + ' Adm.Date : ' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'BARCODE 720,90,"93",54,0,180,3,6,"' + vMRN + '"' + printCodes.new_line;
                    code += "PRINT 1,1"
                    code += "<xpml></page></xpml><xpml><end/></xpml>"
                    $scope.printRaw(printData);
                } else if (window.barcodeclientcode.toLowerCase() == 'bch') {
                    code += 'I8,A' + printCodes.new_line;
                    code += 'q799' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'Q200,25' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A570,205,2,2,1,1,N,"Name"' + printCodes.new_line;
                    code += 'A570,180,2,2,1,1,N,"Age/ Sex"' + printCodes.new_line;
                    code += 'A570,155,2,2,1,1,N,"BCH ID"' + printCodes.new_line;
                    code += 'A570,130,2,2,1,1,N,"IP NO"' + printCodes.new_line;
                    code += 'A570,105,2,2,1,1,N,"Doctor"' + printCodes.new_line;
                    code += 'A570,80,2,2,1,1,N,"Adm Date"' + printCodes.new_line;
                    code += 'A510,205,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A475,180,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A475,155,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A475,130,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A475,105,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A475,80,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A500,205,2,2,1,1,N,"' + vTitle + '' + vPatientName + '"' + printCodes.new_line;
                    code += 'A466,180,2,2,1,1,N,"' + vMRN + '"' + printCodes.new_line;
                    code += 'A466,155,2,2,1,1,N,"' + vAge + "Y /" + vGender + '"' + printCodes.new_line;
                    code += 'A466,130,2,2,1,1,N,"' + vOpno + '"' + printCodes.new_line;
                    code += 'A466,105,2,2,1,1,N,"' + vDoctorName1 + ' ' + vDoctorName2 + '"' + printCodes.new_line;
                    code += 'A466,80,2,2,1,1,N,"' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'B526,35,2,1C,3,3,35,N,"' + vMRN + '"' + printCodes.new_line;
                    code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                } else if (window.barcodeclientcode.toLowerCase() == 'dhee') {
                    code += 'I8,A' + printCodes.new_line;
                    code += 'q799' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'Q200,25' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A780,177,2,2,1,1,N,"Name"' + printCodes.new_line;
                    code += 'A780,147,2,2,1,1,N,"Age/ Sex"' + printCodes.new_line;
                    code += 'A780,116,2,2,1,1,N,"UHID"' + printCodes.new_line;
                    code += 'A780,86,2,2,1,1,N,"IP No"' + printCodes.new_line;
                    code += 'A780,56,2,2,1,1,N,"Adm Date"' + printCodes.new_line;
                    code += 'A685,177,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A685,147,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A685,116,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A685,86,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A685,56,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A675,177,2,2,1,1,N,"' + vTitle + '' + vPatientName + '"' + printCodes.new_line;
                    code += 'A675,147,2,2,1,1,N,"' + vAge + "Y /" + vGender + '"' + printCodes.new_line;
                    code += 'A675,116,2,2,1,1,N,"' + vMRN + '"' + printCodes.new_line;
                    code += 'A675,84,2,2,1,1,N,"' + vOpno + '"' + printCodes.new_line;
                    code += 'A675,56,2,2,1,1,N,"' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'A370,185,2,2,1,1,N,"Name"' + printCodes.new_line;
                    code += 'A370,155,2,2,1,1,N,"Age/ Sex"' + printCodes.new_line;
                    code += 'A370,125,2,2,1,1,N,"UHID"' + printCodes.new_line;
                    code += 'A370,94,2,2,1,1,N,"IP No"' + printCodes.new_line;
                    code += 'A370,64,2,2,1,1,N,"Adm Date"' + printCodes.new_line;
                    code += 'A275,185,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A275,155,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A275,125,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A275,94,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A275,64,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A266,185,2,2,1,1,N,"' + vTitle + '' + vPatientName + '"' + printCodes.new_line;
                    code += 'A266,155,2,2,1,1,N,"' + vAge + "Y /" + vGender + '"' + printCodes.new_line;
                    code += 'A266,125,2,2,1,1,N,"' + vMRN + '"' + printCodes.new_line;
                    code += 'A266,92,2,2,1,1,N,"' + vMRN + '"' + printCodes.new_line;
                    code += 'A266,62,2,2,1,1,N,"' + vAdmissionDate + '"' + printCodes.new_line;
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
                console.log(printData);
            } catch (ex) {
                console.log(ex);
            }
        };

        $scope.wristbandprint = function () {
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
                        vAdmissionDate = utl.Formatter.getDateTimeString($scope.item.AdmissionDate);

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
                if (window.barcodeclientcode.toLowerCase() == 'prakriya') {
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
                } else if (window.barcodeclientcode.toLowerCase() == "equitas") {
                    code += "<xpml><page quantity='0' pitch='25 mm'></xpml>SIZE 50 mm, 25 mm" + printCodes.new_line;
                    code += "DIRECTION 0,0" + printCodes.new_line;
                    code += "REFERENCE 0,0" + printCodes.new_line;
                    code += "OFFSET 0 mm" + printCodes.new_line;
                    code += "SET PEEL OFF" + printCodes.new_line;
                    code += "SET CUTTER OFF" + printCodes.new_line;
                    code += "SET PARTIAL_CUTTER OFF" + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><page quantity='1' pitch='25 mm'></xpml>SET TEAR ON" + printCodes.new_line;
                    code += "CLS" + printCodes.new_line;
                    code += "CODEPAGE 1252" + printCodes.new_line;
                    // code += 'TEXT 383,180,"0",180,8,8,"' + 'Pat.Name : ' + vTitle + vPatientName + '"' + printCodes.new_line;
                    // code += 'TEXT 383,140,"0",180,8,8,"' + 'Gender/Age : ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    // code += 'TEXT 383,100,"0",180,8,8,"' + 'UHID : ' + vMRN + '"' + printCodes.new_line;
                    // code += 'TEXT 383,60,"0",180,8,8,"' + 'Ward / RoomNo : ' + vWardName + vRoomNo + '"' + printCodes.new_line;
                    // code += 'TEXT 383,20,"0",180,8,8,"' + 'Consult.Dr : ' + vDoctorName1 + vDoctorName2 + '"' + printCodes.new_line;
                    // code += 'TEXT 383,140,"0",180,8,8,"' + 'Pat.Name : ' + vTitle + vPatientName + '"' + printCodes.new_line;
                    // code += 'TEXT 383,100,"0",180,8,8,"' + 'Age/Gender : ' + vAge + ' Y/ ' + vGender + '"' + printCodes.new_line;
                    // code += 'TEXT 383,180,"0",180,8,8,"' + 'UHID : ' + vMRN + '"' + printCodes.new_line;
                    // code += 'TEXT 383,60,"0",180,8,8,"' + 'Ward / RoomNo : ' + vWardName + vRoomNo + '"' + printCodes.new_line;
                    // code += 'TEXT 383,20,"0",180,8,8,"' + 'Consult : ' + 'Dr.' + vDoctorName1 + vDoctorName2 + '"' + printCodes.new_line;
                    // code += 'TEXT 383,140,"0",180,8,8,"' + 'Pat.Name : ' + vTitle + vPatientName + '"' + printCodes.new_line;
                    // code += 'TEXT 383,100,"0",180,8,8,"' + 'Age/Gender : ' + vAge + ' Y/ ' + vGender + '"' + printCodes.new_line;
                    // code += 'TEXT 383,180,"0",180,8,8,"' + 'UHID : ' + vMRN + '"' + printCodes.new_line;
                    // code += 'TEXT 383,60,"0",180,8,8,"' + 'Ward / RoomNo : ' + vWardName + vRoomNo + '"' + printCodes.new_line;
                    // code += 'TEXT 383,20,"0",180,8,8,"' + 'Consult : ' + 'Dr.' + vDoctorName1 + vDoctorName2 + '"' + printCodes.new_line;
                    code += 'TEXT 383,150,"0",180,8,8,"' + 'Pat.Name : ' + vTitle + vPatientName + '"' + printCodes.new_line;
                    code += 'TEXT 383,120,"0",180,8,8,"' + 'Age/Gender : ' + vAge + ' Y/ ' + vGender + '"' + printCodes.new_line;
                    code += 'TEXT 383,90,"0",180,8,8,"' + 'Adm.Date : ' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'TEXT 383,180,"0",180,8,8,"' + 'UHID : ' + vMRN + '/' + vOpno + '"' + printCodes.new_line;
                    code += 'TEXT 383,60,"0",180,8,8,"' + 'Ward / RoomNo : ' + vWardName + '/' + vRoomNo + '"' + printCodes.new_line;
                    code += 'TEXT 383,30,"0",180,8,8,"' + 'Consultant : ' + 'Dr.' + vDoctorName1 + vDoctorName2 + '"' + printCodes.new_line;
                    code += "PRINT 1,1"
                    code += "<xpml></page></xpml><xpml><end/></xpml>"
                    $scope.printRaw(printData);
                } else {
                    code += "<xpml><page quantity='0' pitch='25.4 mm'></xpml>SIZE 48.2 mm, 25.4 mm" + printCodes.new_line;
                    code += "DIRECTION 0,0" + printCodes.new_line;
                    code += "REFERENCE 0,0" + printCodes.new_line;
                    code += "OFFSET 0 mm" + printCodes.new_line;
                    code += "SET PEEL OFF" + printCodes.new_line;
                    code += "SET CUTTER OFF" + printCodes.new_line;
                    code += "SET PARTIAL_CUTTER OFF" + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><page quantity='1' pitch='25.4 mm'></xpml>SET TEAR ON" + printCodes.new_line;
                    code += "CLS" + printCodes.new_line;
                    code += "CODEPAGE 1252" + printCodes.new_line;
                    code += 'TEXT 383,181,"0",180,8,8,"' + 'Pat.Name : ' + vTitle + vPatientName + '"' + printCodes.new_line;
                    code += 'TEXT 383,142,"0",180,8,8,"' + 'Gender/Age : ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    code += 'TEXT 383,98,"0",180,8,8,"' + 'IP.NO/UHID : ' + vOpno + ' / ' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 379,59,"0",180,8,8,"' + 'Consult.DR : ' + vDoctorName1 + vDoctorName2 + '"' + printCodes.new_line;
                    code += "PRINT 1,1"
                    code += "<xpml></page></xpml><xpml><end/></xpml>"
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
            //Preparing Medblaze Data
            if (utl.Session.getMedblazePost() == 1) {
                var options = {
                    action: "Visit/Visit/postMedBlaze/",
                    data: {
                        Data: {
                            encounterId: data,
                            feedbackData: $scope.feedbackData
                        }
                    },
                    type: 'post',
                    // onComplete: $scope.saveItemCallback,
                    // onError: $scope.errorItemCallback
                };
                utl.Http.doAction(options);
            }

            if (window.clientcode.toLowerCase() == 'dhee') {
                var options = {
                    action: "Visit/Visit/postWhatsapp/",
                    data: {
                        Data: {
                            encounterId: data,
                            DoctorId: $scope.item.DoctorId,
                            FirstName: $scope.item.Patient.FirstName,
                            DepartmentName: $scope.item.DepartmentName,
                            MRN: $scope.item.Patient.MRN
                        }
                    },
                    type: 'post',
                    // onComplete: $scope.saveItemCallback,
                    // onError: $scope.errorItemCallback
                };
                utl.Http.doAction(options);
            }

            if (window.clientcode.toLowerCase() == 'eastcoasta5withheader') {
                var options = {
                    action: "Visit/Visit/SMSWithVisitIdentifier",
                    data: { Id: data },
                    type: 'post'
                };
                utl.Http.doAction(options);
            }

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
            if ($scope.item.Patient.Encounters && $scope.item.Patient.Encounters,length > 0) {
                if ($scope.item.Patient.Encounters[0].IsLatest == true && $scope.item.Patient.Encounters[0].IsDayCare == true && $scope.item.Patient.Encounters[0].IsEmergencyVisit == true) {
                    utl.Alert.showErrorMsg($translate.instant("Patient already in Emergency Admission.. Please Check it"));
                    return false;
                }
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

        // Auto Select Service Rate category-Start
        $scope.getBedInfo = function (scope, data, options, hasError) {
            // if (!$scope.item.ServiceRateCategoryId) {
            //     $scope.item.ServiceRateCategoryId = data.ServiceRateCategoryId;
            // }
            if ($scope.item.GuarantorTypeId && $scope.item.WardId) {
                $scope.getWardInsuranceTariffs($scope.item);
            }
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
            if ($scope.billItemCount > 0) {
                utl.Alert.showErrorMsg($translate.instant("Receipts are available"));
                return;
            }
            utl.Modal.open('app.admissioncancel', {
                params: {
                    patient: $scope.selectedPatient,
                    // encounter: $scope.item,
                    // mrdtype: 2

                },
                confirmCallback: $scope.CancelReason
            });
            // var msg = 'Do You Want Cancel all Bills?'
            // var confirmOptions = {
            //     headingKey: 'common.confirm-modal-header.lbl',
            //     messageKey: msg,
            //     yesKey: 'common.yeskey.lbl',
            //     noKey: 'common.nokey.lbl',
            //     onSuccessMethod: $scope.OnCancelConfirmed,
            // };
            // utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.CancelReason = function (item) {
            if (item.yesorno == '1') {
                $scope.item.Comments = item.reason;
                $scope.OnallCancelConfirmed();
            } else {
                // $scope.item.Comments = item.reason;
            }

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
            if (!$scope.item.DoctorId) {
                utl.Alert.showErrorMsg($translate.instant('Please select correct doctor name'));
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
            if ($scope.item.Patient.Encounters && $scope.item.Patient.Encounters.length > 0) {
                if ($scope.item.Patient.Encounters[0].IsLatest == true && $scope.item.Patient.Encounters[0].IsDayCare == true && $scope.item.Patient.Encounters[0].IsEmergencyVisit == true) {
                    utl.Alert.showErrorMsg($translate.instant("Patient already in Emergency Admission.. Please Check it"));
                    return false;
                }
            }
            // console.log($scope.item);
            // return;
            var patientName = $scope.item.FirstName;
            if ($scope.item.LastName) patientName += ' ' + $scope.item.LastName;
            // //Preparing Medblaze Data
            $scope.feedbackData = {
                processDefinitionKey: "botomate-process",
                variables: [{
                    name: "status",
                    type: "string",
                    value: "ADMITTED",
                    scope: "global"
                },
                {
                    name: "admitType",
                    type: "string",
                    value: "IP",
                    scope: "global"
                },
                {
                    name: "feedbackName",
                    type: "string",
                    value: "Inpatient Feedback",
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
                    value: $scope.item.PatientMrn,
                    scope: "global"
                },
                {
                    name: "ipNumber",
                    type: "string",
                    value: "",
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
                    value: patientName,
                    scope: "global"
                },
                {
                    name: "email",
                    type: "string",
                    value: ($scope.item.Email) ? $scope.item.Email : "",
                    scope: "global"
                },
                {
                    name: "mobileNo",
                    type: "string",
                    value: ($scope.item.Mobile) ? $scope.item.Mobile : "",
                    scope: "global"
                },
                {
                    name: "dateOfAdmission",
                    type: "date",
                    value: $scope.item.AdmissionDate,
                    scope: "global"
                },
                {
                    name: "dateOfBirth",
                    type: "date",
                    value: new Date($scope.item.Patient.DOB),
                    scope: "global"
                },
                {
                    name: "age",
                    type: "integer",
                    value: $scope.item.Patient.Age,
                    scope: "global"
                },
                {
                    name: "location",
                    type: "string",
                    value: $scope.item.LocationName,
                    scope: "global"
                },
                {
                    name: "floor",
                    type: "string",
                    value: $scope.item.RoomName,
                    scope: "global"
                },
                {
                    name: "bedNo",
                    type: "string",
                    value: $scope.item.BedName,
                    scope: "global"
                },
                {
                    name: "gender",
                    type: "string",
                    value: $scope.item.Patient.Gender.Description,
                    scope: "global"
                },
                {
                    name: "departmentName",
                    type: "string",
                    value: $scope.item.DepartmentName,
                    scope: "global"
                },
                {
                    name: "credit",
                    type: "string",
                    value: $scope.item.Patient.FirstName,
                    scope: "global"
                },
                {
                    name: "attendantMobileNumber",
                    type: "string",
                    value: ($scope.item.Patient.AlternateMobileNum) ? $scope.item.Patient.AlternateMobileNum : $scope.item.Patient.Mobile,
                    scope: "global"
                }
                ],
                returnVariables: false
            };
            $scope.item.feedbackData = $scope.feedbackData;
            // $scope.feedbackData.variables[5].value = data;
            console.log($scope.feedbackData.variables[5].value);
            console.log($scope.feedbackData);
            console.log($scope.item);
            // return;
            var actionName = 'Visit/Visit/ManageAdmissionEncounter';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item,
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

        $scope.getBillItemsCallback = function (scope, res, options, hasError) {
            $scope.billItemCount = 0;
            if (res.Data.length > 0) {

                // $scope.billItemCount = res.Data.length;
                for (var idx in res.Data) {
                    var patientBillDetails = res.Data[idx].PatientBillDetails;
                    if (patientBillDetails.length > 0) {
                        for (var jdx in patientBillDetails) {
                            var billitem = patientBillDetails[jdx];
                            if (billitem.PatientBillStatusId == 3) {
                                $scope.billItemCount++;
                            }
                        }
                    }
                }
            } else {
                $scope.billItemCount = 0;
            }
            console.log($scope.billItemCount);
        }

        $scope.getBillItems = function () {
            var inputData = {
                Params: [{
                    Key: 16,
                    Value: $scope.currentcontext.id
                }, {
                    Key: 6,
                    Value: 3
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Billing/PatientBills/getPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getBillItemsCallback
            };
            utl.Http.doAction(options);
        }


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
        $scope.print5 = function () {
            var inputData = {
                Id: $scope.item.Id,
                Data: true
            };
            var options = {
                action: 'Visit/Visit/PrintEncounter5',
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

        $scope.savedaycareEncCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.id = data;
            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.Billstransfer();
        };

        $scope.savedaycare = function () {
            $scope.item.AdmissionStatusId = 2;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to transfer the bill and receipt to IP?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.savedaycareEnc,
                onDismissMethod: $scope.saveItem
            };
            utl.Dialog.confirmMessage(confirmOptions);
            // $scope.checkOPEncounter();
        };

        $scope.savedaycareEnc = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.PatientMrn = $scope.item.Patient.MRN;
            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.EncId = $scope.currentcontext.eid;
            $scope.item.IsFromDayCare = true;
            $scope.item.Status = 1;
            $scope.item.EncounterTypeId = 2;
            $scope.item.OrganizationId = utl.Session.getCurrentOrgId();
            $scope.item.AdmissionDate = $scope.currentcontext.admdate;

            if ($scope.item.AdmissionStatusId == 6) {
                $scope.item.DischargeDate = utl.Formatter.getCurrentDate();
            }
            // console.log($scope.item);return;
            var actionName = 'Visit/Visit/ManageDayCareAdmissionEncounter';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.savedaycareEncCallback
            };
            utl.Http.doAction(options);
        };



        $scope.saveEmergency = function () {

            if ($scope.IsOpPatient) {
                var tracker_item = {
                    StartDate: utl.Formatter.getCurrentDate(),
                    AssignTo: 4,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    DurationPeriodId: 1,
                    DurationPeriod: 'Days',
                    isTracker: 0,
                    PatientTrackerId: 0,
                    PatientId: $scope.item.PatientId,
                    AppointmentId: $scope.item.OldAppointmentId,
                    DoctorId: $scope.Encounters.DoctorId,
                    EncounterId: $scope.Encounters.EncounterId,
                };
                var options = {
                    action: "appointment/patienttracker/CheckoutPatient",
                    data: {
                        Data: tracker_item
                    },
                    type: 'post',
                    onComplete: $scope.saveEmergencyItem
                };
                utl.Http.doAction(options);
            } else {
                $scope.saveEmergencyItem()
            }
        }

        $scope.saveEmergencyItem = function () {

            $scope.item.AdmissionStatusId = 2;

            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to transfer the bill and receipt to IP?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveAdmBills,
                onDismissMethod: $scope.saveItem
            };
            utl.Dialog.confirmMessage(confirmOptions);
            // $scope.checkOPEncounter();
        };

        $scope.BillstransferCallback = function (scope, data, options, hasError) {
            // $scope.currentcontext.id = data;
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $state.go('app.admissiontab.admission', {
                id: $scope.currentcontext.id
            });
        };

        $scope.Billstransfer = function () {
            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.OldEncId = $scope.currentcontext.eid;
            $scope.item.IsFromDayCare = $scope.currentcontext.isdaycare;
            var actionName = 'Visit/Visit/ManageEmergencyBillsTransfer';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.BillstransferCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveAdmBillsCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.id = data;

            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.Billstransfer();
        };

        $scope.saveAdmBills = function () {

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

            if ($scope.currentcontext.isemergency == true) {
                $scope.item.AdmissionDate = $scope.currentcontext.admdate;
                $scope.item.IsEmergencyPatient = true;
            }

            console.log($scope.item);
            //  return;
            var actionName = 'Visit/Visit/ManageAdmissionEncounter';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveAdmBillsCallback
            };
            utl.Http.doAction(options);
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
            $scope.item.ReferralName = (selectedItem)? selectedItem.Text: '';
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
                if (!$scope.item.GuarantorId) {
                    $scope.item.GuarantorId = $scope.lookup.Guarantor[1].Id;
                }
                $scope.PatGuarantorNoofFreeVisit = 0;
                // $scope.setDefaultService();
            }
            if ($scope.item.GuarantorTypeId && $scope.item.WardId) {
                $scope.getWardInsuranceTariffs($scope.item);
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
                if (!$scope.item.GuarantorId) {
                    $scope.item.GuarantorId = 1;
                }
                // if ($scope.PatientGuarantor == 0) {
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
                    $scope.item.ReferralId = $scope.Encounters.ReferralId;
                    $scope.item.ReferralTypeId = $scope.Encounters.ReferralTypeId;
                    $scope.Encounters = data.Data[0];
                    $scope.item.EncounterId = $scope.Encounters.Id;
                    $scope.item.OldAppointmentId = $scope.Encounters.AppointmentId;
                    $scope.currentcontext.admdate = $scope.Encounters.AdmissionDate;
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

        $scope.bedDetail = function (data) {
            console.log(data);
            $scope.item.LocationId = data.LocationId;
            $scope.item.LocationName = data.LocationName;
            $scope.initAllLookup();
            $scope.item.WardId = data.WardId;
            $scope.item.WardName = data.WardName;
            $scope.item.RoomId = data.RoomId;
            $scope.item.RoomName = data.RoomName;
            $scope.item.BedId = data.BedId;
            $scope.item.BedName = data.BedName;
            // $scope.item.ServiceRateCategoryId = data.ServiceRateCategoryId;
            $scope.item.PhotoPath = data.PhotoPath;
            // $scope.checkBedTariff();
            if ($scope.item.GuarantorTypeId && $scope.item.WardId) {
                $scope.getWardInsuranceTariffs($scope.item);
            }
        }

        $scope.getWardInsuranceTariffCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item.ServiceRateCategoryId = res.Data[0].RateTypeId;
            }
        };

        $scope.getWardInsuranceTariffs = function (wardInfo) {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: wardInfo.WardId
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
            if ($scope.currentcontext.selecteddept.length > 0) {
                $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
                $scope.item.DepartmentName = $scope.currentcontext.selecteddept[0].DepartmentName;
            }


        }
        $scope.onDoctorSelected = function (data) {
            $scope.currentcontext.selecteddept = [];
            $scope.item.DoctorName = '';
            if (data) {
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
        }
        $scope.onSecondaryDoctorSelected = function (data) {
            // $scope.currentcontext.selecteddept = [];
            $scope.item.SecondaryDoctorName = '';
            if (data) {
                if (data.Title) {
                    if (data.Title.Description) {
                        $scope.item.SecondaryDoctorName = data.Title.Description;
                    }
                }
                if (data.FirstName) {
                    $scope.item.SecondaryDoctorName += ' ' + data.FirstName;
                }
                if (data.LastName) {
                    $scope.item.SecondaryDoctorName += ' ' + data.LastName;
                }
                // $scope.getdepartment();
                console.log(data);
            }
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
                // $scope.item.DepartmentName = $scope.currentcontext.selecteddept[0].Department.DepartmentName;
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
        function onEncGuarantorSelected(dataFromModal) {
            // $scope.item.GuarantorId = dataFromModal.gid;
            $scope.item.GuarantorId = dataFromModal.GuarantorId;
            $scope.item.GuarantorTypeId = dataFromModal.GuarantorTypeId;
            $scope.item.GuarantorLetterNo = dataFromModal.GuarantorLetterNo;
            $scope.item.EligibleAmount = dataFromModal.EligibleAmount;
            $scope.item.CreditLimit = dataFromModal.CreditLimit;
            $scope.item.TpaId = dataFromModal.TpaId;
            $scope.item.ServiceRateCategoryId = dataFromModal.ServiceRateCategoryId;
            $scope.item.CoPayPercent = dataFromModal.CoPayPercent;
            $scope.loadPatientGuarantors();
        }

        $scope.addGuarantor = function () {
            utl.Modal.openFixedDialog('app.guarantorupdateform', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    gid: $scope.item.GuarantorId,
                    encid: $scope.currentcontext.id,
                    parent: 'txn',
                    isFinalized: $scope.isFinalized
                },
                confirmCallback: onEncGuarantorSelected,
                // cancelCallback: $scope.loadPatientGuarantors
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
                    $scope.item.TpaId = item.TPAId;
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
            // api: 'SystemSettings/User/GetUsers',
            api: 'SystemSettings/User/GetMinUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            if (!$scope.item.SecondaryDoctorId) {
                if (selectedItem.Department) {
                    $scope.item.DepartmentId = selectedItem.DepartmentId;
                    $scope.item.DepartmentName = selectedItem.Department.DepartmentName;
                }
            }
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
                },
                {
                    Key: 33,
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
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (!$scope.item.SecondaryDoctorId) {
                    if (item.Department) {
                        item.Speciality = item.Department.DepartmentName;
                    }
                }

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
                    },
                    {
                        Key: 3,
                        Value: 2
                    }],
                }
            },
            {
                "Key": "ServiceRateCategory",
                Request: {
                    Params: [{
                        Key: 5,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },
                    {
                        Key: 7,
                        Value: 2
                    }
                    ]
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
            $scope.getBillItems();
            $scope.loadAdditionalLookup();
            $scope.getFacInfo();
        }
        $scope.wardLookUp = function (selectedItem) {
            console.log(selectedItem);
            // console.log(selectedItem);return;
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
            // console.log(selectedItem);
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

        $scope.concentform = function () {
            $state.go('app.onlineconsent-form', {
                eid: $scope.item.Id,
                pid: $scope.item.PatientId,
            });
        }


        $scope.fillDefaultValues();
        $scope.initAllLookup();
    }
    // Referaltype based Referral Lookup - End

    admissionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();