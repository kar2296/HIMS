(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orgListController', orgListController);

    function orgListController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            orgname: '',
            orgcode: '',
            ActiveStatusId: 2
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.orgname },
                    { Key: 2, Value: $scope.currentfilter.orgcode },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/organization/GetOrganizations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.org', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'SystemSettings/organization/DeleteOrganization',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.org', { id: entity.Id });
            }
            else if (actionType == 'view') {
                $state.go('app.org', { id: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.OrgName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "OrgCode", displayName: $translate.instant('appmanager.orgs.orgcode.lbl') },
                { field: "OrgName", displayName: $translate.instant('appmanager.orgs.orgname.lbl') },
                {
                    field: "AddressLine1", displayName: $translate.instant('appmanager.orgs.address.lbl'),
                    cellTemplate: '<div>{{entity.AddressLine1}} {{entity.AddressLine2}} {{entity.PinCode}}</div>'
                },
                { field: "City", displayName: $translate.instant('appmanager.orgs.city.lbl') },
                { field: "Country", displayName: $translate.instant('appmanager.orgs.country.lbl') },
                // { field: "LicenseDetail", displayName: $translate.instant('appmanager.orgs.licensedetails.lbl') },
                // { field: "OrgLogo", displayName: $translate.instant('appmanager.orgs.logo.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('appmanager.orgs.status.lbl') },
                // { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                //         cellTemplate : 'actionTemplate.html',
                //         actions : [
                //                     {actiontype: 'edit', display : 'common.editaction.lbl'},
                //                     {actiontype: 'delete', display : 'common.deleteaction.lbl'}
                //                  ]
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" }
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

    orgListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();