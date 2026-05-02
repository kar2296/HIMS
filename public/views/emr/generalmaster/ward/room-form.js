(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('roomdetailFormController', roomdetailFormController);

    function roomdetailFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, Upload) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        var vm = this;
        $scope.item = {
            ActiveStatusId: 2
        };
        $scope.currentcontext = {
            file: null
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.roomdetailid);
            $scope.currentcontext.wardid = parseInt($stateParams.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        // $scope.currentcontext.id = parseInt($stateParams.roomdetailid);
        // $scope.currentcontext.wardid = parseInt($stateParams.id);
        $scope.fillDefaultValues = function () {

        }
        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }
        $scope.getRoomProfilePicCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data;
        };


        $scope.getRoomProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    PhotoPath: $scope.item.PhotoPath
                };
                var options = {
                    action: 'generalmaster/wardroommaster/GetRoomLogo',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getRoomProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getRoomProfilePic();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'generalmaster/wardroommaster/GetWardRoomMasterById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            // $state.go('app.wardtab.room');
            $scope.confirmCallback();
        }

        $scope.save = function () {
            $scope.saveItem();
        }

        $scope.saveAndApprove = function () {
            $scope.item.ActiveStatusId = 2;
            $scope.saveItem();
        }
        $scope.clear = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'generalmaster/wardroommaster/AddWardRoomMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'generalmaster/wardroommaster/UpdateWardRoomMaster';
            }

            $scope.item.WardId = $scope.currentcontext.wardid;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

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
                        //  $scope.currentcontext.file = null;
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
                    "Key": "Facility"
                },
                {
                    "Key": "RoomTypeMaster"
                },
                {
                    "Key": "ServiceRateCategory",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }],
                    }
                },
                {
                    "Key": "ActiveStatus"
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

    roomdetailFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'Upload'];

})();