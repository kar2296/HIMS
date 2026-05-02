(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('labcenterListController', labcenterListController);

    function labcenterListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            facilityname: '',
            facilitycode: '',
            ActiveStatusId: 2
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };


        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.facilityname },
                    { Key: 2, Value: $scope.currentfilter.facilitycode },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 6, Value: true }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/facility/GetOtherFacilitys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'view') {
                $state.go('app.labcenterprofiletab.labcenterprofile', { id: entity.Id, FacilityName: entity.FacilityCode + ' - ' + entity.FacilityName });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "FacilityCode", displayName: $translate.instant('appmanager.facilitys.facilitycode.lbl') },
                { field: "FacilityName", displayName: $translate.instant('appmanager.facilitys.facilityname.lbl') },
                { field: "Organization.OrgName", displayName: $translate.instant('appmanager.facilitys.orgname.lbl') },
                {
                    field: "Address",
                    displayName: $translate.instant('appmanager.facilitys.address.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" title="{{entity.AddressLine1}} {{entity.AddressLine2}} {{entity.PincodeMaster.Pincode}}">{{entity.AddressLine1}} {{entity.AddressLine2}} {{entity.PincodeMaster.Pincode}}</div>'
                },
                { field: "ActiveStatus.Description", displayName: $translate.instant('appmanager.facilitys.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" },
                { "Key": "Organization" }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
            //$scope.getList();
        }

        $scope.initLookup();

    }

    labcenterListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();