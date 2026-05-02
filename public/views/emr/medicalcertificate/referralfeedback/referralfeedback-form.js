(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('referralfeedbackFormController', referralfeedbackFormController);

    function referralfeedbackFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.item = {
            TemplateTypeId: 11,
            ReferralDate: utl.Formatter.getCurrentDate(),
        }
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.applyVisibilityRules();
            $scope.patientChange();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'DischargeSummary/ReferralFeedback/GetReferralFeedbackById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
            else if ($scope.item.PatientId > 0) {
                $scope.patientChange();
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
            if ($scope.item.ReferralStatusId == 1) {
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
            if ($scope.item.ReferralStatusId == 2) {
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
            if ($scope.item.ReferralStatusId == 3) {
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
            if ($scope.item.ReferralStatusId == 4) {
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
            if ($scope.item.ReferralStatusId == 5) {
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
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.PatientInfo = data;
            $scope.item.PatientName = $scope.PatientInfo.Title.Description + ' ' + $scope.PatientInfo.FirstName + ' ' + $scope.PatientInfo.LastName;
            // $scope.item.ReferralId = $scope.PatientInfo.ReferrerId;
            // $scope.item.ReferralDoctor = $scope.PatientInfo.Referrer.ReferralName;
            if ($scope.PatientInfo.Referrer) {
            $scope.item.PhoneNo = $scope.PatientInfo.Referrer.PhoneNo;
            $scope.item.Address = $scope.PatientInfo.Referrer.AddressLine1;
            }
            for (var idx in $scope.PatientInfo.Encounters) {
                var encounter = $scope.PatientInfo.Encounters[idx];
                $scope.item.ReferralId = encounter.ReferralId;
                $scope.item.ReferralDoctor = encounter.ReferralName;
                $scope.item.SourceId = encounter.ReferralTypeId;
                $scope.item.VisitNo = encounter.VisitIdentifier;
            }
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
        }

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
            $state.go('app.referralfeedbacktab.referralfeedbacks');
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.addNew = function () {
            $state.go('app.referralfeedback', { id: 0 });
        }
        $scope.save = function () {
            $scope.item.ReferralStatusId = 2; // Draft
            $scope.saveItem();
        };
        $scope.saveandActive = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.ReferralStatusId = 1; // Created
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
            $scope.item.ReferralStatusId = 3; // Approved
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
            $scope.item.ReferralStatusId = 2; // Draft
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
            $scope.item.ReferralStatusId = 5; // Released To Patient
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
            $scope.item.ReferralStatusId = 4; // Cancelled
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

            var actionName = 'PatientCertificate/ReferralFeedback/AddReferralFeedback';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'PatientCertificate/ReferralFeedback/UpdateReferralFeedback';
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
                action: 'DischargeSummary/ReferralFeedback/PrintReferralFeedbackById',
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

    referralfeedbackFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();