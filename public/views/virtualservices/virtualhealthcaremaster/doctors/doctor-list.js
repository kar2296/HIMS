(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctorListController', DoctorListController);

    function DoctorListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {

        var vm = this;

        $scope.currentfilter = {
            username: '',
            facilityid: utl.Session.getCurrentFacilityId(),
            usertypeid: -1,
            groupid: -1,
            ActiveStatusId: 2
        };


        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.username
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.facilityid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.usertypeid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.groupid
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 20,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.doctortab.doctorform', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'SystemSettings/user/DeleteUser',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'view') {
                $state.go('app.doctortab.doctorform', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    UserName: entity.UserName
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.UserName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "FirstName",
                    displayName: $translate.instant('virtualhealth.doctors.name.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{entity.Title.Description}}&nbsp;entity.FirstName}}&nbsp;{{entity.LastName}}</div>'
                },
                {
                    field: "Gender.Description",
                    displayName: $translate.instant('virtualhealth.doctors.gender.lbl')
                },
                {
                    field: "UserType.Description",
                    displayName: $translate.instant('virtualhealth.doctors.type.lbl')
                },
                {
                    field: "Group.GroupName",
                    displayName: $translate.instant('virtualhealth.doctors.primarygroup.lbl')
                },
                {
                    field: "UserName",
                    displayName: $translate.instant('virtualhealth.doctors.loginname.lbl')
                },
                {
                    field: "UserDept.DepartmentName",
                    displayName: $translate.instant('virtualhealth.doctors.departmentname.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('virtualhealth.doctors.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                              <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                            </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };


        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "Organization"
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "Speciality"
                },
                {
                    "Key": "clinicalrole"
                },
                // { "Key": "Pincode" },
                // { "Key": "Country" },
                // { "Key": "State" },
                //{ "Key": "City" },
                {
                    "Key": "DoctorShareClass"
                },
                {
                    "Key": "UserType"
                },
                {
                    "Key": "Group"
                },
                {
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "Gender"
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

    DoctorListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();