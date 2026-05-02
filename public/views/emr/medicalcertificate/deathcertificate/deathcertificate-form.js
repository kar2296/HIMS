
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('deathcertificateFormController', deathcertificateFormController);

    function deathcertificateFormController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            isCompleted: false,
            // DischargeDate: utl.Formatter.getCurrentDate(),
            // AdmissionDate: utl.Formatter.getCurrentDate()
            DisplayCertificateStatus: null,
            NoteTypeId: 1,
            DoctorId: 1,
            doa: utl.Formatter.getCurrentDate(),
            dateofbirth: utl.Formatter.getCurrentDate(),

        };
        // $scope.item.DischargeDate = new Date();
        // $scope.item.AdmissionDate = new Date();

      
     

        $scope.currentcontext = {};

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.getEncounters()
            if ($scope.currentcontext.id == 0) { $scope.item.isCompleted = false; }
        }
        //$scope.currentfilter = { PatientId: -1 };
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
        //Visibility rules starts    

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            // if (data.CertificateStatusId == 1)
            //     $scope.item.isCompleted = true;

            if (data.CertificateStatusId == 3) {
                $scope.item.isCompleted = true;
                $scope.item.DisplayCertificateStatus = 'Approved';

            }

            if (data.CertificateStatusId == 4) {
                $scope.item.isCompleted = true;
                $scope.item.DisplayCertificateStatus = 'Cancelled';
            }
            if (data.CertificateStatusId == 1) {
                $scope.item.DisplayCertificateStatus = 'Created';
            }
            if (data.CertificateStatusId == 2) {
                $scope.item.DisplayCertificateStatus = 'Draft';
            }
            // $scope.item.AdmissionDate = utl.Formatter.getCurrentDate();
            // $scope.item.DischargeDate = utl.Formatter.getCurrentDate()

        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'DischargeSummary/PatientCertificate/GetPatientCertificateById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.deathcertificates');
        }



        $scope.saveItemsCallback = function (scope, data, options, hasError) {


            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item.isCompleted = true;
            $scope.item.DisplayCertificateStatus = 'Approved';

        };
        $scope.saveItems = function () {

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

            var actionName = 'PatientCertificate/PatientCertificate/AddPatientCertificate';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'PatientCertificate/PatientCertificate/UpdatePatientCertificate';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.save = function () {
            $scope.item.CertificateStatusId = 2; // Draft

            $scope.saveactiveItem();
        }
        // $scope.save = function () {
        //     $scope.item.CertificateStatusId = 2; // Draft

        //     $scope.saveItem();
        // }
        $scope.saveandActive = function () {

            $scope.item.CertificateStatusId = 1; // Completed

            $scope.saveactiveItem();
        }
        $scope.approved = function () {

            $scope.item.CertificateStatusId = 3; // Completed

            $scope.saveItems();
        }
        $scope.onCancelConfirmed = function () {
            $scope.item.CertificateStatusId = 4; // Cancelled 
            $scope.saveItem();
        }

        // $scope.addNew = function () {
        //     $state.go('app.dischargesummary-form', { id: 0 });

        // }
        // $scope.addNew = function () {
        //     $scope.currentcontext.id = 0
        //     $scope.item = {};
        // }

        $scope.reverse = function () {
            $scope.item.isCompleted = false;

        }
        $scope.releasedtopatient = function () {
            $scope.item.CertificateStatusId = 5; // Cancelled 

            $scope.saveItem();
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


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'DischargeSummary/PatientCertificate/DeletePatientCertificate',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
            $scope.backToList();
        };
        $scope.saveDeleteRpt = function () {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, $scope.currentcontext.id);
            // Deleted  
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getItem
            });
        }


        //  End
        $scope.getencountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.Encounters = data.Data[0];
                $scope.item.EncounterId = $scope.Encounters.Id
                $scope.item.DoctorId = $scope.Encounters.DoctorId
                $scope.item.WardId = $scope.Encounters.WardId
                $scope.item.AdmissionStatusId = $scope.Encounters.AdmissionStatusId
                $scope.item.VisitIdentifier = $scope.Encounters.VisitIdentifier
                $scope.item.RoomId = $scope.Encounters.RoomId
                $scope.item.BedId = $scope.Encounters.BedId
                $scope.item.AdmissionDate = $scope.Encounters.AdmissionDate

            }
        };

        $scope.getEncounters = function () {

            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.item.PatientId },
                    { Key: 14, Value: 2 },
                    { Key: 3, Value: 2 },

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
       
$scope.print = function () {

            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'DischargeSummary/patientcertificate/PrintPatientCertificate',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.saveItem = function () {

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

            var actionName = 'PatientCertificate/PatientCertificate/AddPatientCertificate';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'PatientCertificate/PatientCertificate/UpdatePatientCertificate';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveactiveItemCallback = function (scope, data, options, hasError) {

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item.DisplayCertificateStatus = 'Approved';

        };
        $scope.saveactiveItem = function () {

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

            var actionName = 'PatientCertificate/PatientCertificate/AddPatientCertificate';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'PatientCertificate/PatientCertificate/UpdatePatientCertificate';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveactiveItemCallback
            };
            utl.Http.doAction(options);
        };

        //GetNoteTemplateById
        $scope.getNoteTemplateByIdCallback = function (scope, data, options, hasError) {
           $scope.item.DataTemplate = data.DataTemplate;
        }
        $scope.onNoteTemplateChange = function() {
              var options = {
                    action: 'clinicalmaster/NoteTemplate/GetNoteTemplateById',
                    data: { Id: $scope.item.NoteTemplateId },
                    type: 'post',
                    onComplete: $scope.getNoteTemplateByIdCallback
                };
                utl.Http.doAction(options);
        }
        
        //get notetemplate
        $scope.getNoteTemplatestCallback = function (scope, data, options, hasError) {
            $scope.lookup.NoteTemplate = data.NoteTemplate;
        }
        $scope.onNoteTypeChange = function() {

            //Reset NoteTemplate Id
            $scope.item.NoteTemplateId = -1;

             var inputData = [ 
                    { Key : "NoteTemplate", Request : { Params : [{ Key: 1, Value: $scope.item.NoteTypeId }]}}
                ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getNoteTemplatestCallback
            };
            utl.Http.doAction(options);
        }

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData =
                [
                    { "Key": "ReceiptType" },
                    { "Key": "Facility" },
                    { "Key": "PaymentType" },
                    { "Key": "EncounterType" },
                    { "Key": "Department" },
                    { "Key": "ServiceItem" },
                    { "Key": "DischargeType" },
                    { "Key": "Doctor" },
                    { "Key": "GuarantorType" },
                    { 'Key': 'Bank' },
                    { 'Key': 'AdvanceNo' },
                    { 'Key': 'CardType' },
                    { 'Key': 'CurrencyType' },
                    { 'Key': 'DueBillNo' },
                    { "Key": "NoteType" },
                    { "Key": "AdmissionStatus" },
                    { "Key": "NoteTemplate", Request : { Params : [{ Key: 1, Value: $scope.item.NoteTypeId }]} }
                ]
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

    deathcertificateFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();