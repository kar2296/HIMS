(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FitnessFormController', FitnessFormController);

    function FitnessFormController($scope, $stateParams, $state, $translate, utl) {
        $scope.onRteChange = function(html) {
            $scope.$evalAsync(function() {
                var parts = "item.DataTemplate".split('.');
                var current = parts[0] === 'vm' ? (typeof vm !== 'undefined' ? vm : $scope.vm) : (parts[0] === 'cvm' ? (typeof cvm !== 'undefined' ? cvm : $scope.cvm) : $scope);
                var startIndex = (parts[0] === 'vm' || parts[0] === 'cvm') ? 1 : 0;
                for (var i = startIndex; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = html;
            });
        };

        var vm = this;
        $scope.item = {
            TemplateTypeId: 2
        }
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.applyVisibilityRules();
        };

         //Doctor config related code starts
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
            //Search only DoctorGroup
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
                item.Speciality = item.Department ? item.Department.DepartmentName : '';
            }
        }
        //Doctor config related code ends

        $scope.getencountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.Encounters = data.Data[0];
                $scope.item.EncounterId = $scope.Encounters.Id
                $scope.item.DoctorId = $scope.Encounters.DoctorId
                $scope.item.DepartmentId = $scope.Encounters.DepartmentId
                $scope.item.PatientId = $scope.Encounters.PatientId;

            }
        };
        $scope.getEncounters = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.item.PatientId },
                    // { Key: 15, Value: 2 }
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
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/FitnessCertificate/GetFitnessCertificateById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.applyVisibilityRules = function () {

            if ($scope.currentcontext.id <= 0) {
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveactiveBtn = true;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowReleasedBtn = false;
                $scope.canShowReverseBtn = false;
                $scope.canShowcancelBtn = false;
                $scope.canprintBtn = false;

            }
            //Created
            if ($scope.item.CertificateStatusId == 1) {
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveactiveBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowReleasedBtn = false;
                $scope.canShowReverseBtn = false;
                $scope.canShowcancelBtn = true;
                $scope.canprintBtn = false;

            }
            // Draft
            if ($scope.item.CertificateStatusId == 2) {
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveactiveBtn = true;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowReleasedBtn = false;
                $scope.canShowReverseBtn = false;
                $scope.canShowcancelBtn = false;
                $scope.canprintBtn = false;
            }
            // Approved
            if ($scope.item.CertificateStatusId == 3) {
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveactiveBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowReleasedBtn = true;
                $scope.canShowReverseBtn = true;
                $scope.canShowcancelBtn = true;
                $scope.canprintBtn = true;
            }
            //Cancelled
            if ($scope.item.CertificateStatusId == 4) {
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveactiveBtn = true;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowReleasedBtn = false;
                $scope.canShowReverseBtn = false;
                $scope.canShowcancelBtn = false;
                $scope.canprintBtn = false;
            }
            //Released
            if ($scope.item.CertificateStatusId == 5) {
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveactiveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowReleasedBtn = false;
                $scope.canShowReverseBtn = false;
                $scope.canShowcancelBtn = false;
                $scope.canprintBtn = true;
            }
        }
        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();

        // Patient autoSearch starts
        vm.patientconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Id', field: 'MemberId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Patient Name', field: 'PatientName', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'MRN', field: 'MRN', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Age', field: 'Age', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Gender', field: 'Gender', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
            ],
            searchparams: {},
            result: {},
            api: 'registration/patient/GetPatients',
            formatdisplay: formatselectedtest,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedtest() {

            var selectedItem = vm.patientconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Title.Description + ' ' + selectedItem.FirstName];
            } else if (vm.patientconfig.rowdata) {
                result = [vm.patientconfig.rowdata.MemberId].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {

            var query = vm.patientconfig.query;

            var inputData = {
                Params: [
                    { Key: 7, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.patientconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.patientconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.patientconfig.result) {
                var item = vm.patientconfig.result[idx];
                item.MemberId = item.Id;
                item.PatientName = item.FirstName;
                item.Age = item.Age;
                item.MRN = item.MRN;
                if (item.Gender)
                    item.Gender = item.Gender.Description;
            }
        }

        $scope.getPatientinfo = function () {
            $scope.PatientInfo = $scope.item.SelectedItem;
            $scope.item.PatientName = $scope.PatientInfo.Title.Description + ' ' + $scope.PatientInfo.FirstName + ' ' + $scope.PatientInfo.LastName;
            $scope.getEncounters();
        };


        $scope.getNoteTemplateByIdCallback = function (scope, data, options, hasError) {
            $scope.item.DataTemplate = data.DataTemplate;
        };
        $scope.onNoteTemplateChange = function () {
            var options = {
                action: 'clinicalmaster/NoteTemplate/GetNoteTemplateById',
                data: { Id: $scope.item.NoteTemplateId },
                type: 'post',
                onComplete: $scope.getNoteTemplateByIdCallback
            };
            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $state.go('app.medicalfitness');
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.addNew = function () {
            $state.go('app.notetemplates', { id: 0 });
        }
        $scope.save = function () {
            $scope.item.CertificateStatusId = 2; // Draft
            $scope.saveItem();
        };
        $scope.saveandActive = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.CertificateStatusId = 1; // Created
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
               messageKey: 'medicalcertificate.dischargesummary-form.save.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

            // $scope.saveItem();
        };
        $scope.approve = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.CertificateStatusId = 3; // Approved
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'medicalcertificate.dischargesummary-form.approved.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
            // $scope.saveItem();
        };
        $scope.reverse = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.CertificateStatusId = 2; // Draft
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'medicalcertificate.dischargesummary-form.reverseit.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

            // $scope.saveItem();
        };
        $scope.releasedtopatient = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.CertificateStatusId = 5; // Released To Patient
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                 messageKey: 'medicalcertificate.dischargesummary-form.release.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

            // $scope.saveItem();
        };
        $scope.cancel = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.CertificateStatusId = 4; // Cancelled
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
             messageKey: 'medicalcertificate.dischargesummary-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

            // $scope.saveItem();
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
                $scope.currentcontext.id = parseInt(data);
            }
            $scope.getItem();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'clinicalmaster/FitnessCertificate/AddFitnessCertificate';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/FitnessCertificate/UpdateFitnessCertificate';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };


        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'clinicalmaster/FitnessCertificate/PrintFitnessCertificate',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "NoteType" },
                { "Key": "CertificateStatus" },
                { "Key": "NoteTemplate", Request: { Params: [{ Key: 1, Value: $scope.item.TemplateTypeId }] } }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    FitnessFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();