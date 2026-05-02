(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('labourCostListController', labourCostListController);

    function labourCostListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.LabourCosts = [];
        $scope.currentcontext = {};
        $scope.TotalAmount = 0;
        $scope.AverageCost= 0;
        $scope.Procedure= 0;
        $scope.LabourCost=0;

        $scope.currentcontext.costdetailid = parseInt($stateParams.id);


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            var Amount = 0;
            var Average=0;
            var PrgCost =0;
        
            for (var idx in res.Data) {
                Amount = Amount + res.Data[idx].TotalCTC
                Average = Average + res.Data[idx].AvgProcedure
                PrgCost = PrgCost + res.Data[idx].ProcedureCost
             }

            $scope.TotalAmount = Amount;
            $scope.AverageCost = Average;
            $scope.LabourCost = PrgCost;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function () {
            if ($scope.currentcontext.costdetailid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.costdetailid },
                    ],
                };
                var options = {
                    action: 'CostManagement/LabourCost/GetLabourCosts',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToForm = function () {
            $state.go('app.costtab.details');
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.costtab.labourcost', {
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
                action: 'CostManagement/LabourCost/DeleteLabourCost',
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
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.TotalCTC);
                
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "EmployeeType.Description", displayName: $translate.instant('costmanagement.labourcost-list.type.lbl') },
                {
                    field: "empName", displayName: $translate.instant('costmanagement.labourcost-list.employeename.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<span>'
                    + "{{entity.empNameName.Title.Description}}</span>"
                    + "<span >&nbsp;{{entity.empName.FirstName}}</span>"
                    + "<span >&nbsp;{{entity.empName.LastName}}</span>"
                    + "</span></div>"
                },
                {
                    field: "CTC", displayName: $translate.instant('costmanagement.labourcost-list.ctc.lbl'), cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.CTC|displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "AdditionalCost", displayName: $translate.instant('costmanagement.labourcost-list.additionalcost.lbl'), cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.AdditionalCost|displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "TotalCTC", displayName: $translate.instant('costmanagement.labourcost-list.totalctc.lbl'), cellTemplate: '<div class="ui-grid-cell-contents">' + '<span>{{entity.TotalCTC|displaycurrency}}&nbsp;</span>' + '</div>'
                },
                // { field: "AvgProcedure", displayName: $translate.instant('costmanagement.powercost-list.avgprocedure.lbl') },
                

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
                { "Key": "EmployeeType" },
                { "Key": "User" },

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

    labourCostListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();