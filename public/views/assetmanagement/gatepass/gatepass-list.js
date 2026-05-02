(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('GatePassListController', GatePassListController);

    function GatePassListController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.currentfilter = {
            GatePassTypeId: -1,
            GatePassStatusId: -1,
            GatePassNo: ''
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.GatePassTypeId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.AssetId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.GatePassStatusId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.GatePassNo
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/GatePass/GetGatePasss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.Asset_dashboard = function () {
            $state.go('app.newassetdashboard')
        };
        //Grid Actions

        // $scope.openModal = function (Id) {
        //     utl.Modal.openFixedDialog('app.gatepassform', {
        //         params: {
        //             id: Id
        //         },
        //         confirmCallback: $scope.initLookup
        //     });
        // }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            // $scope.openModal(0);
            $state.go('app.gatepassform', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'AssetManagement/GatePass/DeleteGatePass',
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
                $scope.openModal(entity.Id);
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


        //autosearch related code starts -
        vm.assettransfercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Asset Name',
                    field: 'AssetName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-assetname'
                },
                {
                    header: 'Asset Type',
                    field: 'AssetTypeId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-assettype'
                },
                {
                    header: 'Serial Number',
                    field: 'Serial',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-serialnumber'
                },
                {
                    header: 'Model Number',
                    field: 'ModelNum',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-modelnumber'
                },
                {
                    header: 'Manufacturer',
                    field: 'ManufacturerId',
                    datatype: 'string',
                    headercls: 'td-manufacturername',
                    fieldcls: 'td-manufacturername'
                },
                {
                    header: 'Vendor',
                    field: 'VendorMaster.VendorName',
                    datatype: 'string',
                    headercls: 'td-vendor',
                    fieldcls: 'td-vendor'
                }
            ],
            searchparams: {},
            result: {},
            api: 'AssetManagement/Asset/GetAssets',
            presearch: presearchpurchaseitem,
            formatdisplay: formatselectedpurchaseitem,
            postsearch: postsearchpurchaseitem
        };

        function formatselectedpurchaseitem() {
            var selectedItem = vm.assettransfercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.AssetName].join(' ');
                $scope.item.ManufacturerId = selectedItem.ManufacturerId;
                $scope.item.VendorId = selectedItem.VendorId;
                $scope.item.AssetTypeId = selectedItem.AssetTypeId;
                $scope.item.SerialNo = selectedItem.Serial;
                $scope.item.AssetName = selectedItem.AssetName;
                $scope.item.ModelNo = selectedItem.ModelNum;
            } else if (vm.assettransfercontrolconfig.rowdata) {
                result = [vm.assettransfercontrolconfig.rowdata.AssetName,
                    vm.assettransfercontrolconfig.rowdata.AssetTypeId,
                    vm.assettransfercontrolconfig.rowdata.Serial,
                    vm.assettransfercontrolconfig.rowdata.ModelNum,
                    vm.assettransfercontrolconfig.rowdata.ManufacturerId,
                    vm.assettransfercontrolconfig.rowdata.VendorId,
                ].join(' ');
            }
            return result;
        }

        function presearchpurchaseitem() {
            var query = vm.assettransfercontrolconfig.query;

            //Search only active
            var inputData = {
                Params: [
                    //  { Key: 2, Value: $scope.item.AssetName },
                    // { Key: 5, Value: $scope.item.AssetId },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.assettransfercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 14,
                    Value: query
                });
            }

            vm.assettransfercontrolconfig.searchparams = inputData;
        }

        function postsearchpurchaseitem() {
            for (var idx in vm.assettransfercontrolconfig.result) {
                var item = vm.assettransfercontrolconfig.result[idx];
                item.AssetName = item.AssetName;
                item.AssetTypeId = item.AssetTypeId;
                item.SerialNo = item.Serial;
                item.ModelNo = item.ModelNum;
                //item.ManufacturerId = item.Manufacturer.Description;
                item.VendorId = item.VendorId;
            }
        }
        //autosearch related code ends -


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "GatePassNo",
                    displayName: $translate.instant('assetmanagement.asset.gatepassno.lbl')
                },

                {
                    field: "GatePassDate",
                    displayName: $translate.instant('assetmanagement.asset.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.GatePassDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.GatePassDate| date: 'HH:mm'}}</span>" + "</div>"
                },

                {
                    field: "GatePassType.Description",
                    displayName: $translate.instant('assetmanagement.asset.type.lbl')
                },

                {
                    field: "AssetName",
                    displayName: $translate.instant('assetmanagement.asset.asset.lbl')
                },
                {
                    field: "GatePassStatus.Description",
                    displayName: $translate.instant('assetmanagement.asset.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><i class="fa fa-pencil-square-o" aria-hidden="true"uib-tooltip="View" tooltip-placement="bottom"></i></span>\
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
            // var curdeptids = utl.Session.getUserDepartments();
            var inputData = [
                // {
                //     "Key": "Department",
                //     Request: {
                //         Params: [
                //             { Key: 5, Value: 2 },
                //             { Key: 17, Value: curdeptids }, // Institution dept filter
                //         ]
                //     }
                // },
                {
                    "Key": "GatePassType"
                },
                {
                    "Key": "GatePassStatus"
                },
                {
                    "Key": "AssetType"
                },
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

    GatePassListController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl'];

})();