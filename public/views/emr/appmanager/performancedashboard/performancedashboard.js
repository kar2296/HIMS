(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('performanceDahboardGlanceController', performanceDahboardGlanceController);

    function performanceDahboardGlanceController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.users.pagetitle.lbl);
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            username: '',
            facilityid: utl.Session.getCurrentFacilityId(),
            usertypeid: -1,
            groupid: -1,
            ActiveStatusId: 2
        };
        // 01-02-2017
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                OrgId: -1,
                DepartmentId: -1,
                SpecialityId: -1,
                ClinicalRoleId: -1,
                Mobile: '',
                PincodeId: -1,
                CountryId: -1,
                StateId: -1,
                CityId: -1,
                Area: '',
                DoctorShareClassId: -1,
                GenderId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                        type: 'select',
                        translate: 'appmanager.users.filter_facility.lbl',
                        model: 'OrgId',
                        options: $scope.lookup.Organization,
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'appmanager.user.department.lbl',
                        model: 'DepartmentId',
                        options: $scope.lookup.Department,
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'appmanager.user.speciality.lbl',
                        model: 'SpecialityId',
                        options: $scope.lookup.Speciality,
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'appmanager.user.clinicalrole.lbl',
                        model: 'ClinicalRoleId',
                        options: $scope.lookup.Speciality,
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    // { type: 'text', translate: 'appmanager.user.mobile.lbl', model: 'Mobile', position: { r: 2, c: 0 } },
                    {
                        type: 'select',
                        translate: 'appmanager.user.pincode.lbl',
                        model: 'PincodeId',
                        options: $scope.lookup.Pincode,
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'appmanager.user.country.lbl',
                        model: 'CountryId',
                        options: $scope.lookup.Country,
                        position: {
                            r: 2,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'appmanager.user.state.lbl',
                        model: 'StateId',
                        options: $scope.lookup.State,
                        position: {
                            r: 3,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'appmanager.user.citytown.lbl',
                        model: 'CityId',
                        options: $scope.lookup.City,
                        position: {
                            r: 3,
                            c: 1
                        }
                    },
                    // { type: 'text', translate: 'appmanager.user.area.lbl', model: 'Area', position: { r: 4, c: 1 } },
                    {
                        type: 'select',
                        translate: 'appmanager.user.gender.lbl',
                        model: 'GenderId',
                        options: $scope.lookup.Gender,
                        position: {
                            r: 4,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'appmanager.user.doctorshareclass.lbl',
                        model: 'DoctorShareClassId',
                        options: $scope.lookup.DoctorShareClass,
                        position: {
                            r: 4,
                            c: 1
                        }
                    },
                    {
                        type: 'text',
                        translate: 'appmanager.user.mobile.lbl',
                        model: 'Mobile',
                        position: {
                            r: 5,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'appmanager.user.area.lbl',
                        model: 'Area',
                        position: {
                            r: 5,
                            c: 1
                        }
                    }
                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-primary'
                    },
                    {
                        type: 'reset',
                        translate: 'common.resetaction.lbl',
                        cls: 'btn-danger'
                    }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.openAdvancedFilter = function () {

            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }
        // 01-02-2017
        //Dynamic form  ends

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
                        Key: 6,
                        Value: $scope.advancedfilter.OrgId
                    },
                    {
                        Key: 7,
                        Value: $scope.advancedfilter.DepartmentId
                    },
                    {
                        Key: 8,
                        Value: $scope.advancedfilter.SpecialityId
                    },
                    {
                        Key: 9,
                        Value: $scope.advancedfilter.ClinicalRoleId
                    },
                    {
                        Key: 10,
                        Value: $scope.advancedfilter.PincodeId
                    },
                    {
                        Key: 11,
                        Value: $scope.advancedfilter.CountryId
                    },
                    {
                        Key: 12,
                        Value: $scope.advancedfilter.StateId
                    },
                    {
                        Key: 13,
                        Value: $scope.advancedfilter.CityId
                    },
                    {
                        Key: 14,
                        Value: $scope.advancedfilter.Area
                    },
                    {
                        Key: 15,
                        Value: $scope.advancedfilter.DoctorShareClassId
                    },
                    {
                        Key: 16,
                        Value: $scope.advancedfilter.Mobile
                    },
                    {
                        Key: 17,
                        Value: $scope.advancedfilter.GenderId
                    }
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
            $state.go('app.usertab.general', {
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

            if (actionType == 'edit') {
                $state.go('app.usertab.general', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    UserName: entity.UserName
                });
            } else if (actionType == 'view') {
                $state.go('app.usertab.general', {
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
            columnDefs: [
                // { field: "Facility.FacilityName", displayName: $translate.instant('appmanager.users.facility.lbl') },
                {
                    field: "FirstName",
                    displayName: $translate.instant('appmanager.users.name.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{entity.Title.Description}} {{entity.FirstName}} {{entity.LastName}}</div>'
                },
                {
                    field: "Gender.Description",
                    displayName: $translate.instant('appmanager.users.gender.lbl')
                },
                {
                    field: "UserType.Description",
                    displayName: $translate.instant('appmanager.users.type.lbl')
                },
                {
                    field: "Group.GroupName",
                    displayName: $translate.instant('appmanager.users.primarygroup.lbl')
                },
                // {
                //     field: "LoginPermission",
                //     displayName: $translate.instant('appmanager.users.loginavailable.lbl'),
                //     cellTemplate: "<displayyesno input-val='entity.LoginPermission'></displayyesno>"
                // },
                {
                    field: "UserName",
                    displayName: $translate.instant('appmanager.users.loginname.lbl')
                },
                {
                    field: "UserDept.DepartmentName",
                    displayName: $translate.instant('appmanager.dept.departmentname.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('appmanager.users.status.lbl')
                },
                //{ field: "Email", displayName: $translate.instant('appmanager.users.email.lbl') },
                //{ field: "Mobile", displayName: $translate.instant('appmanager.users.mobile.lbl') },
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'edit', display: 'common.editaction.lbl' },
                //         { actiontype: 'delete', display: 'common.deleteaction.lbl' },
                //         { actiontype: 'print', display: 'common.deleteaction.lbl' }
                //     ]
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                 <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                 <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
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

    performanceDahboardGlanceController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();