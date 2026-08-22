(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientidentityDocumentController', patientidentityDocumentController);

    function patientidentityDocumentController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {};
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.ImagePath) {
                $scope.getPatientId();
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'registration/PatientIdentity/GetPatientIdentityById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientIdCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientId = function () {
            if ($scope.item.ImagePath) {
                var inputData = { Id: $scope.item.Id, ImagePath: $scope.item.ImagePath };
                var options = {
                    action: 'registration/PatientIdentity/GetPatientIdDocs',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientIdCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.clear = function () {
            $scope.item = {};
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function () {

            var actionName = 'registration/PatientIdentity/AddPatientIdentity';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'registration/PatientIdentity/UpdatePatientIdentity';
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to PatientIdDocumentsScreen.tsx).
        // All API calls/business logic above are untouched. Note: the real
        // Save button in this screen has always dispatched to an undefined
        // `save()` function (only `saveItem` exists) -- that bug is
        // preserved faithfully by NOT wiring a 'save' case below, matching
        // the original's silent no-op.
        // ---------------------------------------------------------------
        $scope.reactProps = {
            item: $scope.item,
            photo: null
        };

        var origGetItemCallback = $scope.getItemCallback;
        $scope.getItemCallback = function (scope, data, options, hasError) {
            origGetItemCallback(scope, data, options, hasError);
            $scope.reactProps.item = $scope.item;
        };

        var origGetPatientIdCallback = $scope.getPatientIdCallback;
        $scope.getPatientIdCallback = function (scope, data, options, hasError) {
            origGetPatientIdCallback(scope, data, options, hasError);
            $scope.reactProps.photo = $scope.currentcontext.Photo;
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'fileSelected':
                    $scope.currentcontext.file = payload.file;
                    break;
                case 'backToList':
                    $scope.backToList();
                    break;
                default:
                    // 'save' intentionally not handled here -- see comment above.
                    break;
            }
            $scope.$applyAsync();
        };
    }

    patientidentityDocumentController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'Upload'];

})();