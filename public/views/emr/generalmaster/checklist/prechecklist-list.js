(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('checkListController', checkListController);

    function checkListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: 1,
            FeedbackTypeId: -1,
            FeedbackCategoryId: -1,
            ActiveStatusId: 2
        };
        $scope.currentcontext = {};
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                 { Key: 1, Value: $scope.currentfilter.FacilityId },
                 { Key: 2, Value: $scope.currentfilter.ActiveStatusId },
                 { Key: 3, Value: $scope.currentfilter.CheckListTypeId},
                 { Key: 4, Value: $scope.currentfilter. CheckListCategoryId},

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/CheckList/GetCheckLists',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.prechecklists', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function () {
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
                action: 'generalmaster/CheckList/DeleteCheckList',
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
                { field: "Facility.FacilityName", displayName: $translate.instant('generalmaster.feedbackmasters.facility.lbl') },
                { field: "CheckListType.Description", displayName: $translate.instant('generalmaster.feedbackmasters.type.lbl') },
                { field: "CheckListCategory.Description", displayName: $translate.instant('generalmaster.feedbackmasters.category.lbl') },
                { field: "CheckLists", displayName: $translate.instant('generalmaster.checklist.pagetitle.lbl') },
                { field: "Description", displayName: $translate.instant('generalmaster.feedbackmasters.description.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.feedbackmasters.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
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
                { "Key": "CheckListType" },
                { "Key": "CheckListCategory" },
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

    checkListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();