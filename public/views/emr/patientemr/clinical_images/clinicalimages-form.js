(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ClinicalimagesFormController', ClinicalimagesFormController);

    function ClinicalimagesFormController($scope, $stateParams, $state, $translate, Upload, utl, $uibModalInstance, modalConfig) {
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
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
            $scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getImages(data);
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/ClinicalDocument/GetClinicalDocumentById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getImagesCallback = function (scope, data, options, hasError) {
            $scope.item.Image = data.FilePath;
            // var clinicalimageid = data.Id;
            // var image = data.FilePath;
            // for (var idx in $scope.items) {
            //     var item = $scope.items[idx];
            //     if (item.Id == clinicalimageid) {
            //         item.Image = image;
            //     }
            // }
            // $scope.items.Image = data.FilePath
        };
        $scope.getImages = function (data) {
            if (data.FilePath) {
                var inputData = {
                    Id: data.Id,
                    FilePath: data.FilePath
                };
                var options = {
                    action: 'emr/ClinicalDocument/GetAttachmentFile',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getImagesCallback
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
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };
        $scope.saveItem = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            var actionName = 'emr/ClinicalDocument/AddClinicalDocument';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/ClinicalDocument/UpdateClinicalDocument';
            }

            if ($scope.currentcontext.file) {
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
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: $scope.currentcontext.file
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        // $scope.saveItem = function () {

        //     if (!$scope.currentcontext.file) {
        //         utl.Alert.showErrorMsg($translate.instant('patientemr.patientdocument-form.nofilemsg.lbl'));
        //         return;
        //     }

        //     var actionName = 'emr/ClinicalDocument/AddClinicalDocument';
        //     var actionUrl = utl.Http.getRootPath() + actionName;
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //         actionName = 'emr/ClinicalDocument/UpdateClinicalDocument';
        //     }

        //     Upload.upload({
        //         url: actionUrl,
        //         data: {
        //             file: $scope.currentcontext.file,
        //             Data: $scope.item
        //         }
        //     }).then(function (resp) { //upload function returns a promise
        //         utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        //         $scope.currentcontext.file = null;
        //         $scope.backToList();
        //     },
        //         function (resp) { //catch error
        //             console.log('Error status: ' + resp.status);
        //             utl.Alert.showErrorMsg('Error status: ' + resp.status);
        //         },
        //         function (evt) {
        //             console.log(evt);
        //         });
        // };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DocumentType" },
                { "Key": "YesNo", Default: false }
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

    ClinicalimagesFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'Upload', 'utl', '$uibModalInstance', 'modalConfig'];

})();