(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetDocumentFormController', assetDocumentFormController);

    function assetDocumentFormController($scope, $stateParams, $state, $translate, Upload, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DocumentDate: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {
            file: null
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.assetid = parseInt($stateParams.id);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        // $scope.item.AssetId = $scope.currentcontext.pid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;

        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'AssetManagement/AssetDocument/GetAssetDocumentById',
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
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'AssetManagement/AssetDocument/AddAssetDocument';
            var actionUrl = utl.Http.getRootPath() + actionName;
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/AssetDocument/UpdateAssetDocument';
            }
            $scope.item.AssetId = $scope.currentcontext.assetid;

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

    assetDocumentFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'Upload', 'utl', '$uibModalInstance', 'modalConfig'];

})();