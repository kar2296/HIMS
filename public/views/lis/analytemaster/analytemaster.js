(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('analyteMasterFormController', analyteMasterFormController);

    function analyteMasterFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            OrganizationId: utl.Session.getCurrentFacilityId(),
            AnalyteTypeId: 1,
            ActionFrom: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.id = -1;
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        // $scope.item.ActionFrom = utl.Formatter.getCurrentDate();
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'lis/analytemaster/GetAnalytemasterById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.backToList = function () {
        //     $state.go('app.analytemasters');
        // }
        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else
                $state.go('app.analytemasters');
        }
        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('lis.analytemasters.excode.lbl'));
            }
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if ($scope.currentcontext.ismodal) {
                    $scope.confirmCallback();
                } else if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                //  $state.go('app.usertab.general');
                $state.go('app.analytetab.analytemaster', {
                    id: data,
                    IsProfile: null,
                    AnalyteName: options.data.Data.Code + ' - ' + options.data.Data.Name
                });
            } else {
                $scope.backToList(); // Safer side added
            }
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.item.Valuetype_e == 7) {
                if (!$scope.item.Formula) {
                    utl.Alert.showErrorMsg($translate.instant('Please Enter Formula'));
                    return;
                }
            }
            if ($scope.item.Valuetype_e == 4) {
                if (!$scope.item.Listofvalue) {
                    utl.Alert.showErrorMsg($translate.instant('Please Enter Listofvalue'));
                    return;
                }
            }

            var actionName = 'lis/analytemaster/AddAnalytemaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'lis/analytemaster/UpdateAnalytemaster';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.IsAutoCalculationType = function () {
            return $scope.item.Valuetype_e == 7 // Auto Calculation
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();

            if ($scope.item.Activefrom == null)
                $scope.item.Activefrom = new Date();

            $scope.getMaxId();

        }

        $scope.getMaxId = function () {
            $scope.analytemastercode =
                utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'analytemastercode');
            if ($scope.analytemastercode && !$scope.currentcontext.id) {
                var options = {
                    action: 'lis/analytemaster/GetMaxId',
                    data: {
                        Id: 0
                    },
                    type: 'post',
                    onComplete: $scope.getMaxIdCallback
                };
                utl.Http.doAction(options);
            }
        }

        function ZeroPadding(num, size) {
            var s = num + "";
            while (s.length < size) s = "0" + s;
            return s;
        }

        $scope.getMaxIdCallback = function (scope, data, options, hasError) {
            var StartingNr = '0001';

            if (data)
                StartingNr = ZeroPadding(data, 4);

            $scope.analytemastercodeprefix =
                utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'analytemastercodeprefix');
            if ($scope.analytemastercodeprefix) {
                StartingNr = $scope.analytemastercodeprefix + '' + StartingNr;
            }

            if (StartingNr)
                $scope.item.Code = StartingNr;

        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Organization"
                },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                {
                    "Key": "ANALYTETYPE"
                },
                {
                    "Key": "ANALYTEUOM"
                },
                {
                    "Key": "ANALYTEVALUETYPE"
                },
                {
                    "Key": "SampleMaster",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }]
                    }
                },
                {
                    "Key": "GRAPHTYPE"
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

    analyteMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();