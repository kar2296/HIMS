(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('storemasterStaffDiscountListController', storemasterStaffDiscountListController);

    function storemasterStaffDiscountListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.gridData = [];

        $scope.lookup = {};
        $scope.currentfilter = {
            ActiveStatusId: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            UserId: -1
        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        var storemasterid = parseInt($stateParams.id);
        var IsProfile = $state.params.IsProfile;
        var StoreCode = $state.params.StoreCode;
        var StoreName = $state.params.StoreName;
        var StoreTypeId = $state.params.StoreTypeId;
        var StoreType = $state.params.StoreType;

        $scope.getList = function () {
            if ($scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.item.FacilityId },
                        { Key: 5, Value: $scope.item.UserId },
                        { Key: 9, Value: $scope.currentfilter.ActiveStatusId }
                    ]
                };
                var options = {
                    action: 'pharmacy/StaffDiscount/GetStaffDiscounts',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            } else {
                $state.go('app.storemastertab.storemaster', { id: 0 });
            }
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            vm.gridConfig.data = $scope.gridData;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.addNew = function () {
            utl.Modal.open('app.storemastertab.storemasterstaffdiscount', {
                params: {
                    id: 0,
                    StoreMasterId: parseInt($stateParams.id),
                    StoreTypeId: $state.params.StoreTypeId,
                    StoreType: $state.params.StoreType,
                    StoreCode: $state.params.StoreCode,
                    StoreName: $state.params.StoreName,
                    IsProfile: $state.params.IsProfile
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.storemastertab.storemasterstaffdiscount', {
                params: { id: Id, StoreMasterId: parseInt($stateParams.id), StoreCode: $state.params.StoreCode, StoreName: $state.params.StoreName, IsProfile: $state.params.IsProfile },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        };

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'User Id', field: 'UserId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'User Name', field: 'UserName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.UserTypeId = selectedItem.UserTypeId;
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName].join(' ');
            }

            $scope.getList();

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.item.FacilityId }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        function setDefaults() {
            var ActiveId = utl.Lookup.getDefault($scope.lookup.ActiveStatus, 'Active');
            $scope.currentfilter.ActiveStatusId = ActiveId;
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "UserType.Description", displayName: $translate.instant('inventory.storeusermap.stafftype.lbl') },
                {
                    field: "UserName",
                    displayName: $translate.instant('inventory.storeusermap.staffname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{entity.UserName.Title.Description}} {{entity.User.FirstName}} {{entity.User.LastName}}</div>'
                },
                { field: "StaffDiscountType.Description", displayName: $translate.instant('inventory.storeusermap.staffdiscounttype.lbl') },
                { field: "StaffDiscountPercentage", displayName: $translate.instant('inventory.storeusermap.defaultdiscount.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.itemmastervendormappings.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            data: $scope.gridData
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" }
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

        $scope.initLookup();
    }

    storemasterStaffDiscountListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();