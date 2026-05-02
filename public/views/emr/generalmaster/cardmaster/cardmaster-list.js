(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cardMasterListController', cardMasterListController);

    function cardMasterListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            CardTypeId: -1,

            ActiveStatusId: 2
        };
        $scope.currentcontext = {};
        // $scope.currentcontext.RemarkId = parseInt($stateParams.id);
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Code },
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 3, Value: $scope.currentfilter.CardMasterTypeId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/CardMaster/GetCardMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.cardmasters', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }
        //Grid Actions
        // $scope.addNew = function() {
        //    $state.go('app.remark', { id:0 });


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/remark/DeleteRemark',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
                //$state.go('app.remark', { id:row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.Code);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('generalmaster.cardmaster-list.facility.lbl') },
                { field: "CardMasterType.Description", displayName: $translate.instant('generalmaster.cardmaster-list.type.lbl') },
                { field: "Code", displayName: $translate.instant('generalmaster.cardmaster-list.code.lbl') },
                { field: "CardName", displayName: $translate.instant('generalmaster.cardmaster-list.cardname.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.cardmaster-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                               \
                                                    <span class="grid-action"  ng-click="grid.appScope.handleEvents(\'edit\',row)"   ><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                   \
                                                   <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"  ng-hide="row.entity.ActiveStatusId == 2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                                                   </div>',

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
                { "Key": "CardMasterType" },
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

    cardMasterListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();