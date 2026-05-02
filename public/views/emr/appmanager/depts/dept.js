
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

        $scope.currentcontext = {
            file: null
        };

        $scope.currentcontext.id = parseInt($stateParams.id);

        //getDepartmentLogo
        $scope.getDepartmentLogoCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Logo = data.Logo;
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
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

        //getItem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getDepartmentLogo();
        };

        $scope.getItem = function (pageNo) {
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
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.IsAllFacility == true) {
                $scope.item.FacilityId = -1;
            }
            if ($scope.item.IsAllFacility == false) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }
            var actionName = 'SystemSettings/department/AddDepartment';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'SystemSettings/department/UpdateDepartment';
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


        $scope.clear = function () {
            $scope.item = {};
        };
        $scope.addNew = function () {
            $state.go('app.dept', { id: 0 });
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData =
                [
                    { Key: 'DepartmentType' },
                    { Key: 'Speciality' },
                    { Key: 'CostCenter' },
                    {
                        Key: 'Department',
                        Request: {
                            Params: [{ Key: 4, Value: 1 }]
                        }
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
        $scope.item.ActiveFrom = new Date();
    }

    deptFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$timeout'];

})();