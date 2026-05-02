(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetTransferFormController', assetTransferFormController);

    function assetTransferFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            IsActive: true,
            FromFacilityId: utl.Session.getCurrentFacilityId(),
            // FromDepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            TransferedDate: utl.Formatter.getCurrentDate(),
            TransferedById: utl.Session.getCurrentUserId(),
            RequestedDate: utl.Formatter.getCurrentDate(),
            RequestedDate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};
        // if (modalConfig && modalConfig.params) {
        //     $scope.currentcontext.id = parseInt(modalConfig.params.id);
        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.applyVisibilityRules();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'AssetManagement/AssetTransfer/GetAssetTransferById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.currentcontext.id == 0 || !$scope.currentcontext.id) {
                $scope.canShowTransfer = true;
                $scope.canShowApprove = false;
            }
            if ($scope.item.AssetTransferStatusId == 2) {
                $scope.canShowTransfer = false;
                $scope.canShowApprove = true;
            }
            if ($scope.item.AssetTransferStatusId == 3) {
                $scope.canShowTransfer = false;
                $scope.canShowApprove = false;
            }
        };

        $scope.populateEstimateDisDate = function () {
            if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.TransferedDate && $scope.item.TransferedDate != '') {
                var TransferedDate = new Date($scope.item.TransferedDate);
                $scope.item.ExpectedDischargeDate = new Date(TransferedDate.getFullYear(),
                    TransferedDate.getMonth(),
                    TransferedDate.getDate() + parseInt($scope.item.ALOS));
            }
        }

        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.addNew = function () {
            $state.go('app.assettransfer', {
                id: 0
            });
        }
        //autosearch related code starts -
        vm.assettransfercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Asset Code',
                field: 'AssetCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-assetcode'
            }, {
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
                $scope.item.Serial = selectedItem.Serial;
                $scope.item.AssetName = selectedItem.AssetName;
                $scope.item.ModelNum = selectedItem.ModelNum;
                $scope.item.Manufacturer = selectedItem.Manufacturer;
                $scope.item.LocationId = selectedItem.LocationId;
                $scope.item.FromDepartmentId = selectedItem.DepartmentId;
            } else if (vm.assettransfercontrolconfig.rowdata) {
                result = [vm.assettransfercontrolconfig.rowdata.AssetName,
                vm.assettransfercontrolconfig.rowdata.AssetTypeId,
                vm.assettransfercontrolconfig.rowdata.Serial,
                vm.assettransfercontrolconfig.rowdata.ModelNum,
                vm.assettransfercontrolconfig.rowdata.ManufacturerId,
                vm.assettransfercontrolconfig.rowdata.VendorId,
                vm.assettransfercontrolconfig.rowdata.LocationId,
                vm.assettransfercontrolconfig.rowdata.DepartmentId,
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
                item.AssetCode = item.AssetName;
                item.AssetName = item.Description;
                item.AssetTypeId = item.AssetType.Description;
                item.Serial = item.Serial;
                item.ModelNum = item.ModelNum;
                //item.ManufacturerId = item.Manufacturer.Description;
                item.VendorId = item.VendorId;
            }
        }
        //autosearch related code ends -

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'User Id',
                field: 'UserId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'User Name',
                field: 'UserName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.UserTypeId = selectedItem.UserTypeId;
                result = [selectedItem.FirstName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.FirstName].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.item.FromFacilityId
                },],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                if (item.Title)
                    item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }


        vm.tousercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'User Id',
                field: 'UserId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'User Name',
                field: 'UserName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselectedtouser,
            presearch: presearchtouser,
            postsearch: postsearchtouser
        };

        function formatselectedtouser() {
            var selectedItem = vm.tousercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.FirstName].join('  ');
            } else if (vm.tousercontrolconfig.rowdata) {
                result = [vm.tousercontrolconfig.rowdata.UserId, vm.tousercontrolconfig.rowdata.FirstName].join(' ');
            }

            return result;
        }

        function presearchtouser() {
            var query = vm.tousercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.item.TOFacilityId
                }, {
                    Key: 6,
                    Value: $scope.item.ToDepartmentId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.tousercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.tousercontrolconfig.searchparams = inputData;
        }

        function postsearchtouser() {
            for (var idx in vm.tousercontrolconfig.result) {
                var item = vm.tousercontrolconfig.result[idx];
                item.UserId = item.Id;
                if (item.Title)
                    item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }
        $scope.SelectedToDept = function (selectedItem) {
            if ($scope.item.FromDepartmentId == selectedItem.Id) {
                $scope.item.ToDepartmentId = -1;
                utl.Alert.showErrorMsg($translate.instant('Transfer Department Sholud not same as From Department!.Please Select any other Department'));
                return false;
            }
        };
        $scope.Transfer = function () {
            if (!$scope.item.ToDepartmentId) {
                utl.Alert.showErrorMsg($translate.instant('Please Enter To Department'));
            } else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'inventory.stocktransfers.transfermsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onTransferConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        };
        $scope.onTransferConfirmed = function () {
            $scope.item.AssetTransferStatusId = 2;
            $scope.item.TransferedById = utl.Session.getCurrentUserId();
            $scope.item.TransferedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.Approve = function () {
            $scope.item.AssetTransferStatusId = 3;
            $scope.item.ApprovedById = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function () {
            var actionName = 'AssetManagement/AssetTransfer/AddAssetTransfer';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/AssetTransfer/UpdateAssetTransfer';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
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
                            // }, // Institution dept filter
                        ]
                    }
                },
                {
                    "Key": "AssetType"
                },
                {
                    "Key": "Manufacturer"
                },
                {
                    "Key": "Company",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }, {
                            Key: 6,
                            Value: utl.Session.getCurrentOrgId()
                        }]
                    }
                },
                {
                    "Key": "TransferType"
                },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: 2
                        }]
                    }
                },
                {
                    "Key": "Location"
                },
                {
                    "Key": "VendorMaster"
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

    assetTransferFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();