(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetWarrantyListController', assetWarrantyListController);

    function assetWarrantyListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.currentfilter = {

            WarrantyTypeId: -1,
            ActiveStatusId: 2
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

                    Params: [

                        {
                            Key: 1,
                            Value: $scope.currentfilter.WarrantyTypeId
                        },
                        {
                            Key: 2,
                            Value: $scope.currentfilter.FromDate
                        },
                        {
                            Key: 3,
                            Value: $scope.currentfilter.ToDate
                        },
                        {
                            Key: 4,
                            Value: $scope.currentfilter.ActiveStatusId
                        },
                        {
                            Key: 5,
                            Value: $scope.currentcontext.assetid
                        },
                        {
                            Key: 6,
                            Value: $scope.currentfilter.FacilityId
                        }

                        //   { Key: 1, Value: $scope.currentfilter.assetid }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'AssetManagement/Assetwarranty/GetAssetWarranties',
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
            $scope.openModal('app.assetwarranty', {
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
                action: 'AssetManagement/AssetWarranty/DeleteAssetWarranty',
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
            if (actionType == 'edit') {
                //  $state.go('app.wardtab.formroomdetail', { roomdetailid: entity.Id });
                $scope.openModal('app.assettab.assetwarranty', {
                    id: entity.Id
                });
            } else if (actionType == 'Active') {
                $scope.Update(entity.Id, 2);
            } else if (actionType == 'Inactive') {
                $scope.Update(entity.Id, 3);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.WarrantyType.Description);
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
            columnDefs: [{
                    field: "WarrantyType.Description",
                    displayName: $translate.instant('assetmanagement.warranty-list.warrantytype.lbl'),
                },
                {
                    field: "FromDate",
                    displayName: $translate.instant('assetmanagement.warranty-list.fromdate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.FromDate'></ngformatdate>"
                },
                {
                    field: "ToDate",
                    displayName: $translate.instant('assetmanagement.warranty-list.todate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.ToDate'></ngformatdate>"
                },
                {
                    field: "NoOfFreeServices",
                    displayName: $translate.instant('assetmanagement.warranty-list.freeservice.lbl'),
                },
                {
                    field: "NoOfPendingServices",
                    displayName: $translate.instant('assetmanagement.warranty-list.pendingservice.lbl'),
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('assetmanagement.warranty-list.status.lbl'),
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><i class="fa fa-pencil-square-o" aria-hidden="true"uib-tooltip="Edit" tooltip-placement="bottom"></i></span>\
                    </div>',
                    handleEvent: $scope.handleEvents,
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

    assetWarrantyListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();