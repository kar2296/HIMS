(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualCategorysFormController', VirtualCategorysFormController);

    function VirtualCategorysFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, Upload) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.currentcontext = {};
        $scope.currentcontext.file = null;
        // $scope.currentcontext.id = parseInt($stateParams.id);
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        // $scope.getItemCallback = function (scope, data, options, hasError) {
        //     $scope.item = data;

        // };

        // $scope.getItem = function (pageNo) {
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

        //         var options = {
        //             action: 'VirtualHealthcare/VirtualCategory/GetVirtualCategoryById',
        //             data: { Id: $scope.currentcontext.id },
        //             type: 'post',
        //             onComplete: $scope.getItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };

        $scope.backToList = function () {
            $scope.confirmCallback();
            // $state.go('app.virtualcategory');
        }
        $scope.addNew = function () {
            $state.go('app.virtualcategoryform', {
                id: 0
            });
        }


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveandApprove = function () {

            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }
        $scope.clear = function () {
            $scope.item = {};
        }

        $scope.getImagesCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Image = data.Image;
        };

        $scope.getImages = function () {
            if ($scope.item.Imagepath) {
                var inputData = {
                    Id: $scope.item.Id,
                    Imagepath: $scope.item.Imagepath
                };
                var options = {
                    action: 'VirtualHealthcare/VirtualCategory/GetVirtualCategoryImage',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getImagesCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getImages();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'VirtualHealthcare/VirtualCategory/GetVirtualCategoryById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'VirtualHealthcare/VirtualCategory/AddVirtualCategory';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'VirtualHealthcare/VirtualCategory/UpdateVirtualCategory';
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
            var inputData = [{
                    "Key": "ConsultancyType"
                },
                {
                    "Key": "Organization"
                },
                {
                    "Key": "Facility"
                }

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

    VirtualCategorysFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'Upload'];

})();