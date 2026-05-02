(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('locationListController', locationListController);

    function locationListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            facilityid: utl.Session.getCurrentFacilityId(),
            activestatusid: 2,
            locationname: ''
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.facilityid },
                    { Key: 3, Value: $scope.currentfilter.activestatusid },
                    { Key: 1, Value: $scope.currentfilter.locationname }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/LocationMaster/GetLocationMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.location-form', {
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
                action: 'generalmaster/locationmaster/DeleteLocationMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                //$state.go('app.location-form', { id: entity.Id });
                $scope.openModal(entity.Id);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Code);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('generalmaster.location-list.facility.lbl') },
                { field: "Code", displayName: $translate.instant('generalmaster.location-list.locationcode.lbl') },
                { field: "LocationName", displayName: $translate.instant('generalmaster.location-list.location.lbl') },
                { field: "Description", displayName: $translate.instant('generalmaster.location-list.description.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.location-list.isactive.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                handleEvent: $scope.handleEvents,
                    // actions: [
                    //     { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    // ]
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
                { "Key": "Facility" },
                { "Key": "Location" },
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
        $scope.initLookup();
    }

    locationListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();