(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('deptFormController', deptFormController);

    function deptFormController($rootScope, $scope, $stateParams, $state, $translate, utl, Upload, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            IsAllFacility: false
        };

        $scope.lookup = {
            DepartmentType: [],
            Speciality: [],
            CostCenter: [],
            Department: []
        };

        $scope.currentcontext = {
            file: null,
            id: parseInt($stateParams.id) || 0
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                item: angular.copy($scope.item),
                lookup: $scope.lookup,
                deptId: $scope.currentcontext.id,
                logoBase64: $scope.currentcontext.Logo || null
            };
        };

        $timeout(function () {
            if ($rootScope.app && $rootScope.app.layout) {
                $rootScope.app.layout.isCollapsed = true;
            }
        }, 100);

        // getDepartmentLogo
        $scope.getDepartmentLogoCallback = function (scope, data, options, hasError) {
            if (!hasError && data) {
                $scope.currentcontext.Logo = data.Logo;
                $scope.refreshReactProps();
            }
        };

        $scope.getDepartmentLogo = function () {
            if ($scope.item.LogoPath) {
                var inputData = { Id: $scope.item.Id, LogoPath: $scope.item.LogoPath };
                var options = {
                    action: 'SystemSettings/department/GetDepartmentLogo',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getDepartmentLogoCallback
                };
                utl.Http.doAction(options);
            }
        };

        // getItem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (!hasError && data) {
                $scope.item = angular.extend({}, $scope.item, data);
                $scope.getDepartmentLogo();
                $scope.refreshReactProps();
            }
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'SystemSettings/department/GetDepartmentById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.depts');
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if (hasError || (data && (data.hasError || data.Error))) {
                var msg = (data && data.Error && data.Error.Message) ||
                          (data && data.message) ||
                          'Failed to save department.';
                utl.Alert.showErrorMsg(msg);
                return;
            }
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl') || 'Saved successfully');
            $scope.backToList();
        };

        $scope.saveItem = function () {
            // Normalize facility
            if ($scope.item.IsAllFacility === true || $scope.item.IsAllFacility === 1) {
                $scope.item.IsAllFacility = 1;
                $scope.item.FacilityId = -1;
            } else {
                $scope.item.IsAllFacility = 0;
                $scope.item.FacilityId = $scope.item.FacilityId || utl.Session.getCurrentFacilityId() || 1;
            }

            // Sanitize foreign keys / numeric values so empty strings never reach DB
            if (!$scope.item.ParentDepartmentId || $scope.item.ParentDepartmentId === '0' || $scope.item.ParentDepartmentId === '') {
                $scope.item.ParentDepartmentId = null;
            }
            if (!$scope.item.SpecialityId || $scope.item.SpecialityId === '0' || $scope.item.SpecialityId === '') {
                $scope.item.SpecialityId = null;
            }
            if (!$scope.item.CostCenterId || $scope.item.CostCenterId === '0' || $scope.item.CostCenterId === '') {
                $scope.item.CostCenterId = null;
            }
            if ($scope.item.DisplayOrder === '' || $scope.item.DisplayOrder === undefined || $scope.item.DisplayOrder === null || isNaN(Number($scope.item.DisplayOrder))) {
                $scope.item.DisplayOrder = null;
            } else {
                $scope.item.DisplayOrder = Number($scope.item.DisplayOrder);
            }

            // Flags
            $scope.item.IsActive = ($scope.item.IsActive === false || $scope.item.IsActive === 0) ? 0 : 1;
            $scope.item.IsEmergency = $scope.item.IsEmergency ? 1 : 0;
            $scope.item.IsAdmittingDept = $scope.item.IsAdmittingDept ? 1 : 0;
            $scope.item.IncludeMRDRequired = $scope.item.IncludeMRDRequired ? 1 : 0;
            $scope.item.IsPatientFlowMandatory = $scope.item.IsPatientFlowMandatory ? 1 : 0;
            $scope.item.IsProcessingCenter = $scope.item.IsProcessingCenter ? 1 : 0;
            $scope.item.IsIPClearence = $scope.item.IsIPClearence ? 1 : 0;
            $scope.item.IsParentDepartment = $scope.item.IsParentDepartment ? 1 : 0;
            $scope.item.Rev = $scope.item.Rev || 0;
            $scope.item.Status = 1;

            var isUpdate = ($scope.currentcontext.id && $scope.currentcontext.id > 0) || ($scope.item.Id && $scope.item.Id > 0);
            var actionName = isUpdate ? 'SystemSettings/department/UpdateDepartment' : 'SystemSettings/department/AddDepartment';

            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;

                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function (resp) {
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl') || 'Saved successfully');
                    $scope.currentcontext.file = null;
                    $scope.backToList();
                }, function (resp) {
                    var errMsg = (resp && resp.data && resp.data.Error && resp.data.Error.Message) ||
                                 (resp && resp.data && resp.data.message) ||
                                 ('Error saving department: ' + (resp ? resp.status : ''));
                    utl.Alert.showErrorMsg(errMsg);
                });
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: null
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback,
                    onError: function (err) {
                        var msg = (err && err.Error && err.Error.Message) ||
                                  (err && err.message) ||
                                  (err && err.sqlMessage) ||
                                  (err && err.parent && err.parent.sqlMessage) ||
                                  'Failed to save department. Please check required fields.';
                        utl.Alert.showErrorMsg(msg);
                    }
                };
                utl.Http.doAction(options);
            }
        };

        $scope.clear = function () {
            $scope.item = {
                IsActive: true,
                IsAllFacility: false
            };
            $scope.refreshReactProps();
        };

        $scope.addNew = function () {
            $state.go('app.dept', { id: 0 });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { Key: 'DepartmentType' },
                { Key: 'Speciality' },
                { Key: 'CostCenter' },
                {
                    Key: 'Department',
                    Request: {
                        Params: [{ Key: 4, Value: 1 }]
                    }
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

        // React bridge action dispatcher
        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'backToList') {
                $scope.backToList();
            } else if (actionName === 'fieldChange') {
                if (payload) {
                    angular.extend($scope.item, payload);
                }
            } else if (actionName === 'onLogoUpload') {
                if (payload && payload.file) {
                    $scope.currentcontext.file = payload.file;
                }
            } else if (actionName === 'saveItem' || actionName === 'saveAndApprove') {
                $timeout(function () {
                    if (payload && payload.item) {
                        angular.extend($scope.item, payload.item);
                    }
                    if (payload && payload.file) {
                        $scope.currentcontext.file = payload.file;
                    }
                    if (actionName === 'saveAndApprove') {
                        $scope.item.ActiveStatus = 'Active';
                        $scope.item.ActiveStatusId = 2;
                    } else {
                        $scope.item.ActiveStatus = $scope.item.ActiveStatus || 'Draft';
                        $scope.item.ActiveStatusId = $scope.item.ActiveStatusId || 1;
                    }
                    $scope.saveItem();
                });
            }
        };

        $scope.initLookup();
        $scope.refreshReactProps();
    }

    deptFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$timeout'];
})();