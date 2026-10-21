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
        $scope.lookup = {};
        
        var parsedId = parseInt($stateParams.id);
        if (isNaN(parsedId) || parsedId <= 0) {
            parsedId = parseInt($stateParams.AnalyteId);
        }
        if (isNaN(parsedId) || parsedId <= 0) {
            var m = window.location.hash.match(/[?&]id=(\d+)/) || window.location.hash.match(/analytemaster\/(\d+)/);
            if (m && m[1]) {
                parsedId = parseInt(m[1]);
            }
        }
        $scope.currentcontext.id = (!isNaN(parsedId) && parsedId > 0) ? parsedId : -1;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        // React bridge helper
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                id: $scope.currentcontext.id,
                item: angular.copy($scope.item),
                lookup: $scope.lookup,
                isModal: $scope.currentcontext.ismodal,
                facilityName: utl.Session.getCurrentFacilityName ? utl.Session.getCurrentFacilityName() : ''
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'backToList') {
                $scope.backToList();
            } else if (actionName === 'saveAndApprove' || actionName === 'save') {
                if (payload) {
                    var targetId = payload.Id || (payload.id ? parseInt(payload.id) : 0) || $scope.currentcontext.id;
                    angular.extend($scope.item, payload);
                    if (targetId && targetId > 0) {
                        $scope.currentcontext.id = targetId;
                        $scope.item.Id = targetId;
                    }
                }
                $scope.saveItem();
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.refreshReactProps();
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

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('app.analytemasters');
            }
        };

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('lis.analytemasters.excode.lbl') || 'Parameter code already exists.');
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl') || 'Saved successfully.');
            if (typeof (data) == "boolean") {
                if ($scope.currentcontext.ismodal) {
                    $scope.confirmCallback();
                } else if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                $state.go('app.analytetab.analytemaster', {
                    id: data,
                    IsProfile: null,
                    AnalyteName: options.data.Data.Code + ' - ' + options.data.Data.Name
                });
            } else {
                $scope.backToList();
            }
        };

        $scope.clear = function () {
            $scope.item = {};
            $scope.refreshReactProps();
        };

        $scope.saveItem = function () {
            if ($scope.item.Valuetype_e == 7) {
                if (!$scope.item.Formula) {
                    utl.Alert.showErrorMsg($translate.instant('Please Enter Formula') || 'Please enter formula');
                    return;
                }
            }
            if ($scope.item.Valuetype_e == 4) {
                if (!$scope.item.Listofvalue) {
                    utl.Alert.showErrorMsg($translate.instant('Please Enter Listofvalue') || 'Please enter list of values');
                    return;
                }
            }

            var itemId = ($scope.currentcontext.id && $scope.currentcontext.id > 0)
                ? $scope.currentcontext.id
                : ($scope.item && $scope.item.Id && $scope.item.Id > 0 ? $scope.item.Id : 0);

            var actionName = 'lis/analytemaster/AddAnalytemaster';
            if (itemId > 0) {
                actionName = 'lis/analytemaster/UpdateAnalytemaster';
                $scope.item.Id = itemId;
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
            return $scope.item.Valuetype_e == 7;
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();

            if ($scope.item.Activefrom == null)
                $scope.item.Activefrom = new Date();

            $scope.getMaxId();
            $scope.refreshReactProps();
        };

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
        };

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

            $scope.refreshReactProps();
        };

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
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    analyteMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();