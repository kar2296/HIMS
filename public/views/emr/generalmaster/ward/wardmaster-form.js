(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('wardmasterdetailFormController', wardmasterdetailFormController);

    function wardmasterdetailFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            WardMasterTypeId: 1,
            StoreMasterId: 0
        };
        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.fillDefaultValues = function () {

        }
        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'generalmaster/wardmaster/GetwardmasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.ward');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            //  $scope.backToList();
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                //  $state.go('app.usertab.general');
                $state.go('app.wardtab.detail', {
                    id: data,
                    wardname: options.data.Data.WardName
                });
            } else {
                $scope.backToList(); // Safer side added
            }

        };
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'generalmaster/wardmaster/AddWardmaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'generalmaster/wardmaster/UpdateWardMaster';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.clear = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            //$scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'StoreMaster' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                }
            });
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                {
                    "Key": "Department",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 1
                        }, {
                            Key: 5,
                            Value: 2
                        }, {
                            Key: 9,
                            Value: true
                        }]
                    }
                },
                { "Key": "WardType" },
                {
                    "Key": "ServiceRateCategory",
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Location",
                    Request: {
                        Params: [
                            { Key: 2, Value: [-1, utl.Session.getCurrentFacilityId()] }
                        ],
                    }
                },
                { "Key": "Block" },
                { "Key": "WardMasterType", Default: false },
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [
                            { Key: 2, Value: 1 },
                            { Key: 3, Value: 2 },
                            { Key: 7, Value: 2 },
                            { Key: 6, Value: [-1, utl.Session.getCurrentFacilityId()] }
                        ]
                    },
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

    wardmasterdetailFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();