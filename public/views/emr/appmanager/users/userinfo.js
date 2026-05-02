(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('userinfoController', userinfoController);

    function userinfoController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl, Upload, $uibModalInstance, modalConfig,) {
        var vm = this;
        $scope.item = {};
        $scope.currentcontext = {
            id: utl.Session.getCurrentUserId(),
            ismodal: modalConfig && modalConfig.params ? true : false
        }
        $scope.getUserProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data;
        };
        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.getUserProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    PhotoPath: $scope.item.PhotoPath
                };
                var options = {
                    action: 'SystemSettings/User/GetUserProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getUserProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.clearimage = function () {
            $scope.currentcontext.file = null;
            $scope.currentcontext.Photo = null;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data[0];

            $scope.UserName = $scope.item.Title.Description + ' ' + $scope.item.UserName;
            $scope.Mobile = $scope.item.Mobile;
            $scope.Email = $scope.item.Email;
            $scope.Gender = $scope.item.Gender.Description;
            $scope.Qualification = $scope.item.Qualification;
            if ($scope.item.ClinicalRole) {
                $scope.designation = $scope.item.ClinicalRole.Description;
            }
            $scope.Age = $scope.item.Age;
            $scope.DOB = $scope.item.DOB;
            $scope.AddressLine1 = $scope.item.AddressLine1;
            $scope.AddressLine2 = $scope.item.AddressLine2;
            $scope.City = $scope.item.City;
            $scope.Country = $scope.item.Country;
            $scope.State = $scope.item.State;
            $scope.Area = $scope.item.Area;
            $scope.OrgName = $scope.item.Organization.OrgName;
            $scope.Facility = $scope.item.Facility.FacilityName;
            if ($scope.item.Department) {
                $scope.Department = $scope.item.Department.DepartmentName;
            }
            if ($scope.item.UserType) {
                $scope.UserType = $scope.item.UserType.Description;
            }
            if ($scope.item.Group) {
                $scope.Group = $scope.item.Group.GroupName;
            }
            if ($scope.item.SubDepartment) {
                $scope.SubDepartment = $scope.item.SubDepartment.DepartmentName;
            }
            $scope.LoginName = $scope.item.UserName;

            $scope.getUserProfilePic();
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);
    
        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getItem = function (pageNo) {
            var data = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.id
                }]
            }
            var options = {
                action: 'SystemSettings/User/GetUsers',
                data: data,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);

        };
        $scope.getItem();

    }

    userinfoController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$uibModalInstance', 'modalConfig'];

})();