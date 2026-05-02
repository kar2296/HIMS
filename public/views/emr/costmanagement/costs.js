(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('costListController', costListController);

    function costListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {

            FacilityId: 1,
            ActiveStatusId: 2,
            DepartmentId: -1
        };

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;

            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            // item.TotalLabourCost = parseFloat(item.TotalLabourCost).toFixed(2);

        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DepartmentId },
                    { Key: 2, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 3, Value: $scope.currentfilter.FacilityId },
                    { Key: 4, Value: $scope.currentfilter.ItemName },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'CostManagement/CostDetail/GetCostDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.costs', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.costtab.details', { id: 0 });
            // $scope.openModal(0);
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'CostManagement/CostDetail/DeleteCostDetail',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {

                $state.go('app.costtab.details', { id: entity.Id, IsProfile: entity.IsProfile, AssetName: entity.Id + ' - ' + entity.AssetName + ' - ' + entity.Department.DepartmentName });
            }
            else if (actionType == 'Active') {
                $scope.Update(entity.Id, 2);
            }
            else if (actionType == 'Inactive') {
                $scope.Update(entity.Id, 3);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ItemName);
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
                { field: "Department.DepartmentName", displayName: $translate.instant('costmanagement.cost-list.department.lbl') },
                { field: "ItemName", displayName: $translate.instant('costmanagement.cost-list.servicenamelist.lbl') },
                {
                    field: "TotalStationedFixedCost", displayName: $translate.instant('costmanagement.cost-list.totalfixedcoststationed.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.TotalStationedFixedCost|displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "ConsumablesCost", displayName: $translate.instant('costmanagement.cost-list.consumablecost.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.ConsumablesCost|displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "TotalLabourCost", displayName: $translate.instant('costmanagement.cost-list.labourcost.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.TotalLabourCost|displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "TotalMobileCost", displayName: $translate.instant('costmanagement.cost-list.totalcostmobile.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.TotalMobileCost|displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "TotalStationedCost", displayName: $translate.instant('costmanagement.cost-list.totalcoststation.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.TotalStationedCost|displaycurrency}}&nbsp;</span>' + '</div>'
                },
                { field: "ActiveStatus.Description", displayName: $translate.instant('costmanagement.cost-list.status.lbl') },
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'edit', display: 'common.editaction.lbl' },
                //         { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                //     ]
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
       <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1 || entity.ActiveStatusId==2 || entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
    <span class="grid-action"  ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1 || entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
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
            // initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [

                { "Key": "Department" },
                { "Key": "ActiveStatus" },
                { "Key": "Facility" },

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

    costListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();