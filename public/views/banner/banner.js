(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('bannerController', bannerController);

    function bannerController($scope, $stateParams, $state, $translate, utl, Upload) {
        $scope.onRteChange = function(html) {
            $scope.$evalAsync(function() {
                var parts = "item.Content".split('.');
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
            IsActive: true,
            isDisabled: false
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.currentcontext = {};
        $scope.currentcontext.file = null;
        $scope.currentcontext.id = $stateParams.id;

        $scope.backToList = function () {
            $state.go('app.bannertab.bannerlist');

        }
        $scope.addNew = function () {
            $state.go('app.virtualcategoryform');
        }


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.save = function () {
            $scope.item.ActiveStatusId = 2;
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
            $scope.currentcontext.Image = data.Attachment;
        };

        $scope.getImages = function () {
            if ($scope.item.Attachment) {
                var inputData = {
                    Id: $scope.item.Id,
                    Attachment: $scope.item.Attachment
                };
                var options = {
                    action: 'VirtualHealthcare/BannerContent/GetAttachmentFile',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getImagesCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.getItemCallback = function (scope, data, options, hasError) {
        //     if (data.Data.length > 0) {
        //         $scope.item = data.Data[0];
        //         $scope.currentcontext.id = $scope.item.Id;
        //         $scope.getImages();
        //     }
        // };

        // $scope.getItem = function () {
        //     var inputData = {
        //         Params: [
        //             { Key: 1, Value: $scope.item.FacilityId },

        //         ]
        //     };
        //     var options = {
        //         action: 'VirtualHealthcare/BannerContent/GetBannerContents',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getItemCallback
        //     };

        //     utl.Http.doAction(options);
        // };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getImages();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'VirtualHealthcare/BannerContent/GetBannerContentById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };


        $scope.saveItem = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            var actionName = 'VirtualHealthcare/BannerContent/AddBannerContent';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'VirtualHealthcare/BannerContent/UpdateBannerContent';
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
                    $scope.getItem();
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
            if ($scope.currentcontext.id) {
                $scope.getItem();
            }

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
            },
            {
                "Key": "VirtualCategory"
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

    bannerController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})(); 