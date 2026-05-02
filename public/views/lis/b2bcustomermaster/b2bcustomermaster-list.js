(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('B2BCustomerListController', B2BCustomerListController);

    function B2BCustomerListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            B2BCustomerName: "",
            FacilityId: -1,
            ActiveStatusId: 2,
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.TESTMASTERTYPId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.B2BCustomerName
                    },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/B2BCustomerMaster/GetB2BCustomerMasterss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.b2bcustomertab.b2bcustomerform', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/B2BCustomerMaster/DeleteB2BCustomerMaster',
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
                $state.go('app.b2bcustomertab.b2bcustomerform', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    ProviderName: entity.ProviderName
                });
            } else if (actionType == 'view') {
                $state.go('app.b2bcustomertab.b2bcustomerform', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    ProviderName: entity.ProviderName
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ProviderName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "Code",
                    displayName: $translate.instant('lis.externalprovidermaster.code.lbl')
                },
                {
                    field: "B2BCustomerName",
                    displayName: $translate.instant('lis.externalprovidermaster.b2bname.lbl')
                },
                {
                    field: "TESTMASTERTYP.Description",
                    displayName: $translate.instant('lis.externalprovidermaster.type.lbl')
                },
                // {
                //     field: "Facility.FacilityName",
                //     displayName: $translate.instant('lis.externalprovidermaster.facility.lbl')
                // },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('lis.externalprovidermaster.status.lbl')
                },
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">\
                //                                    \
                //                                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',entity)"  ><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                //                                     \
                //                                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',entity)"  ng-show="entity.ActiveStatusId == 3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                //                                    \
                //                                 </div>',
                //     actions: [

                //     ]
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                               <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                               <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                               <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                            </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
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
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                {
                    "Key": "TESTMASTERTYP"
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

    B2BCustomerListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();