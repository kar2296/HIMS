(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetTransferListController', assetTransferListController);

    function assetTransferListController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.currentfilter = {
            FromDepartmentId: -1,
            AssetTypeId: -1,
            AssetName: "",
            AssetTransferStatusId: 2
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FromDepartmentId
                    },
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentfilter.ToDepartmentId
                    // },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.AssetName
                    },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.AssetTransferStatusId
                    },
                    // {
                    //     Key: 5,
                    //     Value: $scope.currentfilter.AssetId
                    // },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            $scope.Asset_dashboard = function () {
                $state.go('app.newassetdashboard')
            };
            var options = {
                action: 'AssetManagement/AssetTransfer/GetAssetTransfers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        // $scope.openModal = function (Id) {
        //     utl.Modal.openFixedDialog('app.assettransfer', {
        //         params: {
        //             id: Id
        //         },
        //         confirmCallback: $scope.initLookup
        //     });
        // }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            // $scope.openModal(0);
            $state.go('app.assettransfer-form', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'AssetManagement/AssetTransfer/DeleteAssetTransfer',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'view') {
                // $scope.openModal(entity.Id);
                $state.go('app.assettransfer-form', { id: 0 });
            } else if (actionType == 'delete') {
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
            columnDefs: [{
                    field: "TransferedDate",
                    displayName: $translate.instant('assetmanagement.assettransfer.transferedon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TransferedDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.TransferedDate| date: 'HH:mm'}}</span>" + "</div>"
                },

                {
                    field: "AssetTransferNo",
                    displayName: $translate.instant('assetmanagement.assettransfer.transfer#.lbl')
                },

                {
                    field: "AssetName",
                    displayName: $translate.instant('assetmanagement.assettransfer.assetname.lbl')
                },
                // { field: "AssetType.Description", displayName: $translate.instant('assetmanagement.assettransfer.assettype.lbl') },
                {
                    field: "FromDepartment.DepartmentName",
                    displayName: $translate.instant('assetmanagement.assettransfer.fromdepartment.lbl')
                },
                {
                    field: "ToDepartment.DepartmentName",
                    displayName: $translate.instant('assetmanagement.assettransfer.todepartment.lbl')
                },
                {
                    field: "AssetTransferStatus.Description",
                    displayName: $translate.instant('assetmanagement.assettransfer.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><i class=" fa fa-pencil-square-o" aria-hidden="true"uib-tooltip="View" tooltip-placement="bottom"></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.AssetTransferStatusId==1"><i class="btn btn-danger btn-rounded fa fa-trash" aria-hidden="true"uib-tooltip="Delete" tooltip-placement="bottom"></i></span>\
                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [{
                            actiontype: 'edit',
                            display: 'common.editaction.lbl'
                        },
                        {
                            actiontype: 'delete',
                            display: 'common.deleteaction.lbl'
                        }
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
            $scope.getList();
        }

        $scope.initLookup = function () {
            // var curdeptids = utl.Session.getUserDepartments();
            var inputData = [
                {
                    "Key": "Department",
                    Request: {
                        Params: [{
                                Key: 5,
                                Value: 2
                            },
                            // {
                            //     Key: 17,
                            //     Value: curdeptids
                            // }, /// Institution dept filter
                        ]
                    }
                },
                {
                    "Key": "SubDepartment"
                },
                {
                    "Key": "AssetType"
                },
                {
                    "Key": "TransferType"
                },
                {
                    "Key": "AssetName"
                },
                {
                    "Key": "AssetTransferStatus"
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

    assetTransferListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();