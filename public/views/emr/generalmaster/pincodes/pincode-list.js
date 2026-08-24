(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pincodeListController', pincodeListController);

    function pincodeListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            CountryId: -1,
            StateId: -1,
            CityId: -1,
            Pincode: ''
        };
        $scope.backtoList = function () {
            $state.go('app.commondashboard');
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Name },
                    { Key: 2, Value: $scope.currentfilter.CountryId },
                    { Key: 3, Value: $scope.currentfilter.StateId },
                    { Key: 4, Value: $scope.currentfilter.CityId },
                    { Key: 5, Value: $scope.currentfilter.Pincode },
                    { Key: 6, Value: $scope.currentfilter.Area },
                    { Key: 7, Value: $scope.currentfilter.PincodeArea },
                    { Key: 8, Value: $scope.currentfilter.AcitveStatusId },
                    { Key: 9, Value: $scope.currentfilter.DistrictId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/PincodeMaster/GetPincodeMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.pincode', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/PincodeMaster/DeletePincodeMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Pincode);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Pincode", displayName: $translate.instant('generalmaster.pincode-list.pincode.lbl') },
                { field: "Area", displayName: $translate.instant('generalmaster.pincode-list.area.lbl') },
                { field: "CityMaster.CityName", displayName: $translate.instant('generalmaster.pincode-list.city.lbl') },
                { field: "DistrictMaster.DistrictName", displayName: $translate.instant('generalmaster.pincode-list.district.lbl') },
                { field: "StateMaster.StateName", displayName: $translate.instant('generalmaster.pincode-list.state.lbl') },
                { field: "CountryMaster.CountryName", displayName: $translate.instant('generalmaster.pincode-list.country.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.pincode-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                 <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                 <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                 <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                            </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
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
                { "Key": "Country" },
                { "Key": "State" },
                { "Key": "City" },
                 { "Key": "District" },
                { "Key": "ActiveStatus" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        // REACT BRIDGE (GeneralMaster / Pincode Master list): hollow-controller
        // pattern -- real logic (getList/getListCallback, openModal/addNew,
        // deleteItemCallback/onDeleteConfirmed, handleEvents, backtoList) stays
        // exactly as above, unchanged. This just mirrors state into reactProps
        // and routes UI interactions back here by action name via
        // handleReactAction.
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                pagerObj: vm.gridConfig.pagerObj,
                currentfilter: $scope.currentfilter,
                lookup: {
                    Country: ($scope.lookup && $scope.lookup.Country) || [],
                    State: ($scope.lookup && $scope.lookup.State) || [],
                    City: ($scope.lookup && $scope.lookup.City) || [],
                    ActiveStatus: ($scope.lookup && $scope.lookup.ActiveStatus) || []
                }
            };
        };

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                $scope.currentfilter.Pincode = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'locationFilterChange') {
                angular.extend($scope.currentfilter, payload);
                $scope.getList();
            } else if (actionName === 'statusFilterChange') {
                $scope.currentfilter.ActiveStatusId = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload && payload.page;
                $scope.getList();
            } else if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload);
            } else if (actionName === 'delete') {
                $scope.handleEvents('delete', payload);
            } else if (actionName === 'backToList') {
                $scope.backtoList();
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    pincodeListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();