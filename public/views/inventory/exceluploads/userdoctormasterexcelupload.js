(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('UserDoctorMasterExceluploadController', UserDoctorMasterExceluploadController);

    function UserDoctorMasterExceluploadController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.lookup = {};

        $scope.backtoDashboard = function () {
            $state.go('app.exceluploads');
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.importuserdoctormasterexcel', {
                params: { id: Id },
                confirmCallback: $scope.getList
            });
        };

        $scope.itemUpload = function () {
            $scope.openModal(0, false);
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 34,
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
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
        $scope.getList();

    }

    UserDoctorMasterExceluploadController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();