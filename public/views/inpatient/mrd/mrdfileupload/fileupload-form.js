(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MRDFileUploadFormController', MRDFileUploadFormController);

    function MRDFileUploadFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, Upload) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.item = {
            CapturedDate: utl.Formatter.getCurrentDate(),
        };

        if (modalConfig && modalConfig.params) {
            $scope.Context = modalConfig.params.context;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.Patient = data;
            $scope.currentcontext.pid = $scope.Patient.Id;
            $scope.getItem();
        }
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
        $scope.clear = function () {
            $scope.item = {};
        }

        $scope.saveItem = function () {
            if (!$scope.item.PatientId) {
                utl.Alert.showErrorMsg($translate.instant('patientemr.mrdfilesdownloadupload.patientinfo.lbl'));
                return;
            }
            if (!$scope.currentcontext.file) {
                utl.Alert.showErrorMsg($translate.instant('patientemr.mrdfilesdownloadupload.nofilemsg.lbl'));
                return;
            }
            var actionName = 'IPManagement/MRDFileAttachments/AddMRDFileAttachment';
            var actionUrl = utl.Http.getRootPath() + actionName;
            Upload.upload({
                url: actionUrl,
                data: {
                    file: $scope.currentcontext.file,
                    Data: $scope.item
                }
            }).then(function (resp) { //upload function returns a promise
                utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                $scope.currentcontext.file = null;
                $scope.backToList();
            },
                function (resp) { //catch error
                    console.log('Error status: ' + resp.status);
                    utl.Alert.showErrorMsg('Error status: ' + resp.status);
                },
                function (evt) {
                    console.log(evt);
                });
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.fileSelected = function () {
            $scope.item.AttachmentName = '';
            if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                $scope.item.AttachmentName = $scope.currentcontext.file.name;
            }
        }


        $scope.getItemCallback = function (scope, res, options, hasError) {
            // $scope.item = {};
            if (res && res.Data) {
                if (res && res.Data && res.Data.length > 0) {
                    $scope.PatientInfo = res.Data[0];
                    $scope.item.PatientId = $scope.PatientInfo.Id;
                    $scope.item.PatienName = $scope.PatientInfo.FirstName;
                    $scope.item.MRN = $scope.PatientInfo.MRN;
                    if ($scope.PatientInfo.Encounters.length == 0) {
                        for (var idx in $scope.PatientInfo.Appointments) {
                            var aptenc = $scope.PatientInfo.Appointments[idx];
                        }
                        if ($scope.PatientInfo && aptenc.Encounters) {
                            if ($scope.PatientInfo && aptenc.Encounters
                                && aptenc.Encounters.length > 0) {
                                $scope.item.EncounterId = aptenc.Encounters[0].Id;
                                $scope.item.VisitIdentifier = aptenc.Encounters[0].VisitIdentifier;
                                $scope.item.EncounterTypeId = aptenc.Encounters[0].EncounterTypeId;
                                $scope.item.AdmissionDate = aptenc.Encounters[0].AdmissionDate;
                            }
                        }
                    } else if ($scope.PatientInfo.Encounters.length > 0)
                        // for (var idx in $scope.PatientInfo.Appointments) {
                        //     var aptenc = $scope.PatientInfo.Appointments[idx];
                        // }
                        if ($scope.PatientInfo && $scope.PatientInfo.Encounters) {
                            if ($scope.PatientInfo && $scope.PatientInfo.Encounters
                                && $scope.PatientInfo.Encounters.length > 0) {
                                $scope.item.EncounterId = $scope.PatientInfo.Encounters[0].Id;
                                $scope.item.VisitIdentifier = $scope.PatientInfo.Encounters[0].VisitIdentifier;
                                $scope.item.EncounterTypeId = $scope.PatientInfo.Encounters[0].EncounterTypeId;
                                $scope.item.AdmissionDate = $scope.PatientInfo.Encounters[0].AdmissionDate;
                            }
                        }
                    if ($scope.lookup.MRDFileType && $scope.lookup.MRDFileType.length > 0)
                        $scope.item.MRDFileTypeId = 1;
                }
            }
            $scope.item.CapturedDate = utl.Formatter.getCurrentDate();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.pid },
                        { Key: 8, Value: true },
                    ],
                    PageContext: {
                        PageSize: 10000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'registration/patient/GetPatients',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };

                utl.Http.doAction(options);
            }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "MRDFileType" },
                { "Key": "EncounterType" },
            ]
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

    MRDFileUploadFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'Upload'];

})();