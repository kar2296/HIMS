(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('servicegroupratemappingListController', servicegroupratemappingListController);

    function servicegroupratemappingListController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {

        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2
        };

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    // {
                    //     Key: 1,
                    //     Value: $scope.currentfilter.ServiceGroupId
                    // },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.ServiceGroup
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.BedTypeId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.Amount
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                 
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'BillingMaster/ServiceGroupRateMapping/GetAllServiceGroupRateMapping',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.open('app.servicegroupratemapping', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            }
            );
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'BillingMaster/ServiceGroupRateMapping/DeleteServiceGroupRateMapping',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                utl.Modal.open('app.servicegroupratemapping', {
                    params: { id: entity.Id },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ServiceRateCategory);
            } else if (actionType == 'view') {
                utl.Modal.open('app.servicegroupratemapping', {
                    params: { id: entity.Id },
                    confirmCallback: $scope.getList
                }
                );
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // {
                //     field: "Id",
                //     displayName: $translate.instant('ServiceId')
                // },
                {
                    field: "ServiceGroup",
                    displayName: $translate.instant('ServiceGroup')
                },
                {
                    field: "BedType.Description",
                    displayName: $translate.instant('BedType')
                },
                {
                    field: "Amount",
                    displayName: $translate.instant('Amount')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('Status')
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                         \<span class="grid-action" ng-click="handleEvents(\'edit\',entity)"  ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                         \<span class="grid-action" ng-click="handleEvents(\'delete\',entity)"  ng-show="entity.ActiveStatusId == 3||ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                         \</div>',
                    handleEvent: $scope.handleEvents,
                    actions: [

                    ]
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "BedType"
                },
                {
                    "Key": "ActiveStatus"
                },
                
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

    servicegroupratemappingListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();