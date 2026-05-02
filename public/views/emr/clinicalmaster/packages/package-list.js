(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('packageListController', packageListController);

    function packageListController($rootScope,$scope, $filter, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            GuarantorName: -1,
            GuarantorTypeId: -1,
            ActiveStatusId: 2
        };

        $scope.advancedfilter = {
            From: '',
            To: '',
            ApprovedBy: utl.Session.getCurrentUserId()
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.IPPackageCode },
                    { Key: 2, Value: $scope.currentfilter.GuarantorTypeId },
                    { Key: 3, Value: $scope.currentfilter.GuarantorName },
                    { Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/IPPackage/GetIPPackages',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.package', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/IPPackage/DeleteIPPackage',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.package', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.IPPackageName);
            } else if (actionType == 'view') {

                $state.go('app.package', { id: entity.Id });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "IPPackageCode", displayName: $translate.instant('clinicalmaster.package-list.code.lbl') },
                { field: "IPPackageName", displayName: $translate.instant('clinicalmaster.package-list.packagename.lbl') },
                { field: "Guarantor.GuarantorType.Description", displayName: $translate.instant('clinicalmaster.package-list.guarantor.lbl') },
                { field: "Guarantor.GuarantorName", displayName: $translate.instant('clinicalmaster.package-list.guarantorname.lbl') },
                {
                    field: "IPPackageAmount", displayName: $translate.instant('clinicalmaster.package-list.pakageamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PackageAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class ="ui-grid-cell-contents">' + '<span>{{entity.PackageAmount|displaycurrency}}&nbsp;</span>' + '</div>'
                },
                { field: "Department.DepartmentName", displayName: $translate.instant('clinicalmaster.package-list.department.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.package-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><i class="fa fa-trash " aria-hidden="true"></i></span>\
                                                </div>',
                                                handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
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
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "ActiveStatus" },
                { "Key": "Facility" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "GuarantorType" },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    packageListController.$inject = ['$rootScope','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();