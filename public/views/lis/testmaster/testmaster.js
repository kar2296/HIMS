(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('testMasterFormController', testMasterFormController);

    function testMasterFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            OrganizationId: utl.Session.getCurrentFacilityId(),
            TESTMASTERTYPId: 1
        };
        $scope.selectediteminfo = {};
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
        $scope.item.ActionFrom = utl.Formatter.getCurrentDate();

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
            } else if (actionName === 'save') {
                if (payload) {
                    angular.extend($scope.item, payload);
                }
                $scope.onSaveandDraftConfirmed();
            } else if (actionName === 'saveAndApprove') {
                if (payload) {
                    angular.extend($scope.item, payload);
                }
                $scope.onSaveandApproveConfirmed();
            } else if (actionName === 'getsubdeptUsers') {
                if (payload && payload.DepartmentId) {
                    $scope.item.DepartmentId = payload.DepartmentId;
                    $scope.getsubdeptUsers();
                }
            } else if (actionName === 'getSampleVolume') {
                if (payload && payload.selected) {
                    $scope.getSampleVolume(payload.selected);
                    $scope.refreshReactProps();
                }
            }
        };

        function setDefaults() {
            if ($scope.currentcontext.id == 0) {
                $scope.item.ScheduleALL = true;
                $scope.allChkChanged();
            }
        }

        $scope.allChkChanged = function () {
            if ($scope.item.ScheduleALL == true) {
                $scope.item.ScheduleSU = true;
                $scope.item.ScheduleMO = true;
                $scope.item.ScheduleTU = true;
                $scope.item.ScheduleWE = true;
                $scope.item.ScheduleTH = true;
                $scope.item.ScheduleFR = true;
                $scope.item.ScheduleSA = true;
            } else {
                $scope.item.ScheduleSU = false;
                $scope.item.ScheduleMO = false;
                $scope.item.ScheduleTU = false;
                $scope.item.ScheduleWE = false;
                $scope.item.ScheduleTH = false;
                $scope.item.ScheduleFR = false;
                $scope.item.ScheduleSA = false;
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.$parent) {
                $scope.$parent.IsProfile = $scope.item.IsProfile;
                $scope.$parent.TestType = $scope.item.TESTMASTERTYPId;
            }
            $scope.refreshReactProps();
        };

        $scope.getItem = function (pageNo) {
            if (!$scope.currentcontext.id && $scope.currentcontext.id == 0)
                setDefaults();

            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'lis/testmaster/GetTestmasterById',
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
                $state.go('app.testmasters');
            }
        };

        vm.AssignToOptions = [{
                Id: 1,
                Text: $translate.instant('lis.testmaster.inhouse.lbl') || 'In-House'
            },
            {
                Id: 2,
                Text: $translate.instant('lis.testmaster.external.lbl') || 'External'
            }
        ];

        $scope.profile = function () {
            if ($scope.$parent) {
                $scope.$parent.IsProfile = $scope.item.IsProfile;
                $scope.$parent.TestType = $scope.item.TESTMASTERTYPId;
            }
            $scope.refreshReactProps();
        };

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('lis.testmaster.excode.lbl') || 'Code already exists.');
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl') || 'Saved successfully.');
            if (typeof (data) == "boolean") {
                if ($scope.currentcontext.ismodal) {
                    $scope.confirmCallback();
                }
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                $state.go('app.testmastertab.testmaster', {
                    id: data,
                    IsProfile: null,
                    TestName: options.data.Data.Code + ' - ' + options.data.Data.Name,
                    TestCode: options.data.Data.Name,
                });
            } else {
                $scope.backToList();
            }
        };

        $scope.clear = function () {
            $scope.item = {};
            $scope.refreshReactProps();
        };

        $scope.getSampleVolume = function (Selected) {
            if (Selected && Selected.Id > 0) {
                $scope.item.SampleVolume = "" + Selected.Volume + " " + (Selected.SampleUnits ? Selected.SampleUnits.Description : '');
            } else {
                $scope.item.SampleVolume = "";
            }
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.onSaveandApproveConfirmed = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItem = function () {
            var actionName = 'lis/testmaster/AddTestmaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'lis/testmaster/UpdateTestmaster';
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

        $scope.onDeptSelected = function (selectedItem) {
            $scope.item.SubDepartmentId = selectedItem.Id;
            $scope.refreshReactProps();
        };

        $scope.deptChange = function () {
            var deptObj = utl.Lookup.getObject($scope.lookup.Department, $scope.item.SubDepartmentId);
            $scope.item.DepartmentId = deptObj.DepartmentId;
            $scope.getList();
            $scope.refreshReactProps();
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            angular.forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            if ($scope.item.ActiveFrom == null)
                $scope.item.ActiveFrom = new Date();

            $scope.getMaxId();
            $scope.refreshReactProps();
        };

        $scope.getMaxId = function () {
            $scope.testmasertcode =
                utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'testmasertcode');
            if ($scope.testmasertcode && !$scope.currentcontext.id) {
                var options = {
                    action: 'lis/testmaster/GetMaxId',
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

            $scope.testmasertcodeprefix =
                utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'testmasertcodeprefix');
            if ($scope.testmasertcodeprefix) {
                StartingNr = $scope.testmasertcodeprefix + '' + StartingNr;
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
                    "Key": "TESTMASTERTYP"
                },
                {
                    "Key": "SubDepartment"
                },
                {
                    "Key": 'Department'
                },
                {
                    "Key": "LOCATION"
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
                    "Key": "ContainterMaster",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: 2
                        }]
                    }
                },
                {
                    "Key": "ResourceMaster"
                },
                {
                    "Key": "TATGROUP"
                },
                {
                    "Key": "Side",
                    Default: false
                },
                {
                    "Key": "TestMasterPosition",
                    Default: false
                }
            ];
            $scope.getLookUp(inputData);
        };

        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getsubdeptUsers = function () {
            var inputData = [{
                "Key": "SubDepartment",
                Request: {
                    Params: [{
                        Key: 6,
                        Value: $scope.item.DepartmentId || -1
                    }]
                }
            }];
            $scope.getLookUp(inputData);
        };

        $scope.refreshReactProps();
        $scope.initLookup();
        $scope.getItem();
    }

    testMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();