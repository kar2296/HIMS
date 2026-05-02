(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('gstMastersListController', gstMastersListController);

    function gstMastersListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            gstcode: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            GstPercentage: '',
            gstname: '',
            ActiveStatusId: 2

        };
        $scope.backtoList = function () {
            $state.go('app.Inventorymastermanagement');
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.gstcode },
                    { Key: 2, Value: $scope.currentfilter.gstname },
                    { Key: 4, Value: $scope.currentfilter.GstPercentage },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 5, Value: $scope.currentfilter.FacilityId }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/gstmaster/GetGstMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.gstmaster', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/gstmaster/DeleteGstMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.gstmaster', { id: entity.Id });
            }
            else if (actionType == 'view') {
                $state.go('app.gstmaster', { id: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GstName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "GstCode", displayName: $translate.instant('inventory.gstmasters.code.lbl') },
                { field: "GstName", displayName: $translate.instant('inventory.gstmasters.name.lbl') },
                { field: "GstPercentage", displayName: $translate.instant('inventory.gstmaster.gstpercentage.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.gstmasters.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: /*  vidya 17/2/2017 */
                        '<div class="ui-grid-cell-contents">\
   <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    \
                                                </div>', handleEvent: $scope.handleEvents,
                    /*  vidya 17/2/2017 */
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
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
                { "Key": "Facility" },

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

    gstMastersListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();