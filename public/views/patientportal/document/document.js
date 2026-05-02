(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('documentFormController', documentFormController);

    function documentFormController($scope, $stateParams, $state, $translate, Upload, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            EncounterId: utl.Session.getEncounterId(),
            CreatedBy: utl.Session.getCurrentUserId(),
            CreatedDate: utl.Formatter.getCurrentDate(),
        };
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({ $scope: $scope }));

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            file: null
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/ClinicalDocument/GetClinicalDocumentById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        //Document attachment code starts
        $scope.fileSelected = function () {
            if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                $scope.item.Name = $scope.currentcontext.file.name;
            }
        }
        //Document attachment code ends

        $scope.saveItem = function () {

            if (!$scope.currentcontext.file) {
                utl.Alert.showErrorMsg($translate.instant('patientemr.patientdocument-form.nofilemsg.lbl'));
                return;
            }

            var actionName = 'emr/ClinicalDocument/AddClinicalDocument';
            var actionUrl = utl.Http.getRootPath() + actionName;
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/ClinicalDocument/UpdateClinicalDocument';
            }

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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "DocumentType"
                },
                {
                    "Key": "YesNo",
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
        }

        $scope.initLookup();
    }

    documentFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'Upload', 'utl', '$uibModalInstance', 'modalConfig'];

})();