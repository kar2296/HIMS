(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dietitemListController', dietitemListController);

    function dietitemListController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            DietCategoryId:-1,
            DietItemTypeId: -1,
            ActiveStatusId: 2
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DietItemTypeId },
                    { Key: 2, Value: $scope.currentfilter.DietCategoryId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.DietItemCode }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/DietItemMaster/GetDietItemMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.dietitem', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }

        //Grid Actions
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
                action: 'clinicalmaster/DietItemMaster/DeleteDietItemMaster',
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
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DietName);
                /*var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'common.deletemsg.lbl',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod : $scope.onDeleteConfirmed,
                    itemId : entity.Id
                };
                utl.Dialog.confirmMessage(confirmOptions); 
                */
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "DietItemCode", displayName: $translate.instant('clinicalmaster.diet-list.displayid.lbl') },
                { field: "DietName", displayName: $translate.instant('clinicalmaster.diet-list.allergyname.lbl') },
                { field: "DietItemType.Description", displayName: $translate.instant('clinicalmaster.diet-list.type.lbl') },
                { field: "Description", displayName: $translate.instant('clinicalmaster.diet-list.description.lbl') },
                { field: "DietCategory.Description", displayName: $translate.instant('clinicalmaster.diet-list.filter_category.lbl') },
                { field: "DietFrequency.Description", displayName: $translate.instant('clinicalmaster.diet-list.frequency.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.diet-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                 <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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
                { "Key": "DietItemType" },
                { "Key": "DietCategory" },
                { "Key": "ActiveStatus" },
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

    dietitemListController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl'];

})();