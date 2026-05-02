(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetInsuranceListController', assetInsuranceListController);

    function assetInsuranceListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2,
        };
        //  $scope.currentfilter.DocumentDate = new Date();
        $scope.currentcontext = {};
        $scope.currentcontext.assetid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if ($scope.currentcontext.assetid > 0) {


                var inputData = {

                    Params: [{
                            Key: 1,
                            Value: $scope.currentfilter.ActiveStatusId
                        },
                        {
                            Key: 2,
                            Value: $scope.currentcontext.assetid
                        },
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'AssetManagement/AssetInsurance/GetAssetInsurances',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }

        };

        //Grid Actions
        $scope.addNew = function () {
            // $state.go('app.wardtab.formroomdetail', { roomdetailid: 0 });
            $scope.openModal('app.assettab.insuranceform', {
                id: 0
            });
        }
        $scope.item = {};
        $scope.backToForm = function () {
            $state.go('app.assettab.details');
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'AssetManagement/AssetInsurance/DeleteAssetInsurance',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.openFixedDialog(appKey, {
                params: stateParams,
                confirmCallback: $scope.initLookup
            });
        }
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit' || actionType == 'view') {
                $scope.openModal('app.assettab.insuranceform', {
                    id: entity.Id,
                    AssetName:entity.Asset.Description,
                    AssetCode:entity.Asset.ShortCode
                });
            } else if (actionType == 'Active') {
                $scope.Update(entity.Id, 2);
            } else if (actionType == 'Inactive') {
                $scope.Update(entity.Id, 3);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.WarrantyType.Description);
            }
        }


        vm.gridConfig = {
            columnDefs: [{
                    field: "InsuranceName",
                    displayName: $translate.instant('assetmanagement.warranty-list.insurancename.lbl'),
                },
                {
                    field: "IDVValue",
                    displayName: $translate.instant('assetmanagement.warranty-list.idvvalue.lbl'),
                },

                {
                    field: "PeriodStart",
                    displayName: $translate.instant('assetmanagement.warranty-list.periodstart.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.PeriodStart'></ngformatdate>"
                },
                {
                    field: "PeriodEnd",
                    displayName: $translate.instant('assetmanagement.warranty-list.periodend.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.PeriodEnd'></ngformatdate>"
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('assetmanagement.warranty-list.status.lbl'),
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2"><i class="fa fa-pencil-square-o" aria-hidden="true"uib-tooltip="View" tooltip-placement="bottom"></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><i class="btn btn-success btn-rounded fa fa-pencil" aria-hidden="true"uib-tooltip="Edit" tooltip-placement="bottom"></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><i class="btn btn-danger btn-rounded fa fa-trash" aria-hidden="true"uib-tooltip="Delete" tooltip-placement="bottom"></i></span>\
                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [{
                            actiontype: 'edit',
                            display: 'common.editaction.lbl'
                        },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
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

        //  $scope.dashboard = function () {
        //    $state.go('patientemr.patientdashboard');
        // }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "WarrantyType"
                },
                {
                    "Key": "ActiveStatus"
                }
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

    assetInsuranceListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();