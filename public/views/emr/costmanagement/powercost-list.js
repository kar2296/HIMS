(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('powerCostListController', powerCostListController);

    function powerCostListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.PowerCosts = [];
        $scope.currentcontext = {};
        $scope.TotalAmount = 0;
        $scope.AverageCost = 0;
        $scope.TotalPowerCost = 0;
        $scope.currentcontext.costdetailid = parseInt($stateParams.id);


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            var Amount = 0;
            var Average = 0;
            var PwrCost =0;
            for (var idx in res.Data) {
                Amount = Amount + res.Data[idx].Cost
                Average = Average + res.Data[idx].AvgProcedure
                PwrCost = PwrCost + res.Data[idx].PowerCost
            }

            $scope.TotalAmount = Amount;
            $scope.AverageCost = Average;
            $scope.TotalPowerCost = PwrCost;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.costdetailid },
                ],
            };
            var options = {
                action: 'CostManagement/PowerCost/GetPowerCosts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backToForm = function () {
            $state.go('app.costtab.details');
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.costtab.powercost', {
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
                action: 'CostManagement/PowerCost/DeletePowerCost',
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
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.AssetName);
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
                { field: "AssetName", displayName: $translate.instant('costmanagement.powercost-list.equipmentname.lbl') },
                { field: "Wattage.Description", displayName: $translate.instant('costmanagement.powercost-list.wattage.lbl') },
                { field: "BatteryBackup.Description", displayName: $translate.instant('costmanagement.powercost-list.batterybackup.lbl') },
                { field: "PowerPhase.Description", displayName: $translate.instant('costmanagement.powercost-list.powerphase.lbl') },
                { field: "KWHunit", displayName: $translate.instant('costmanagement.powercost-list.kwhunit.lbl') },
                
                {
                    field: "Cost", displayName: $translate.instant('costmanagement.powercost-list.cphour.lbl'), cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.Cost|displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "AvgProcedure", displayName: $translate.instant('costmanagement.powercost-list.avgprocedure.lbl'), cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.AvgProcedure|displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "PowerCost", displayName: $translate.instant('costmanagement.powercost-list.avgpowercost.lbl'), cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.PowerCost|displaycurrency}}&nbsp;</span>' + '</div>'
                },

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
       <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PowerPhase" },
                { "Key": "BatteryBackup" },
                { "Key": "Wattage" },

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

    powerCostListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();