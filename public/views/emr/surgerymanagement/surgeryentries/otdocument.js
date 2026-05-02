(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otDocumentFormController', otDocumentFormController);

    function otDocumentFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, Upload) {
        var vm = this;

        $scope.item = {
            PatientId: 0,
            EncounterId: 0
        };

        $scope.currentcontext = {
            file: null
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.otregisterid = parseInt($stateParams.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.getOtregisterCallback = function (scope, data, options, hasError) {
            $scope.item.PatientId = data.PatientId;
            $scope.item.EncounterId = data.EncounterId;
        };

        $scope.getOtregisterById = function () {
            var options = {
                action: 'OtManagement/OtRegister/GetOtRegisterById',
                data: { Id: $scope.currentcontext.otregisterid },
                type: 'post',
                onComplete: $scope.getOtregisterCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'OtManagement/OtDocument/GetOtDocumentById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.fileSelected = function () {
            if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                $scope.item.Name = $scope.currentcontext.file.name;
            }
        }
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'OtManagement/OtDocument/AddOtDocument';
            var actionUrl = utl.Http.getRootPath() + actionName;
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'OtManagement/OtDocument/UpdateOtDocument';
            }
            $scope.item.OTRegisterId = $scope.currentcontext.otregisterid;

            if (!$scope.currentcontext.file) {
                utl.Alert.showErrorMsg($translate.instant('assetmanagement.assetdocument-form.nofilemsg.lbl'));
                return;
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
        function loadData() {
            $scope.getOtregisterById();
            $scope.getItem();
        }
        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
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

    otDocumentFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'Upload'];

})();