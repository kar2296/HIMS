(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssetDisposeFormController', AssetDisposeFormController);

    function AssetDisposeFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DisposeDate: utl.Formatter.getCurrentDate(),
            DisposedBy: utl.Session.getCurrentUserId(),
            AssetId: -1
        };
        $scope.items = [];
        $scope.Item = [];
        $scope.Preferences = [];
        $scope.PrefData1 = [];
        $scope.PrefData2 = [];
        $scope.DisPoseReq = [];
        $scope.currentcontext = {};
        if ($stateParams.gid) {
            $scope.currentcontext.grpId = $stateParams.gid;
        } else {
            $scope.currentcontext.grpId = 0;
        }

        $scope.getDisposeReqListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.DisPoseReq = res.Data;
                $scope.item.AssetCode = res.Data[1].Asset.AssetName;
                $scope.item.AssetName = res.Data[1].Asset.Description;
                $scope.item.AssetTypeId = res.Data[1].Asset.AssetTypeId;
                $scope.item.Serial = res.Data[1].Asset.Serial;
                $scope.item.ModelNum = res.Data[1].Asset.ModelNum;
                $scope.item.EmployeeId = res.Data[1].Asset.EmployeeId;
                $scope.item.Contact = res.Data[1].Asset.Contact;
                $scope.item.ContactPerson = res.Data[1].Asset.ContactPerson;
                $scope.item.AssetCategoryId = res.Data[1].Asset.AssetCategoryId;
                $scope.item.AssetId = res.Data[1].AssetId;
                $scope.item.DisposeGroupId = res.Data[1].DisposeGroupId;
                $scope.item.ReasonForNotification = res.Data[1].ReasonForNotification;
                $scope.item.RequestedBy = res.Data[1].RequestedBy;
                $scope.item.RequestedDate = res.Data[1].RequestedDate;
                $scope.item.ApprovedBy = res.Data[1].ApprovedBy;
                $scope.item.DisposeStatusId = res.Data[1].DisposeStatusId;
                $scope.item.DisposeStatus = res.Data[1].DisposeStatus.Description;
                $scope.item.AccessmentBy = res.Data[1].AccessmentBy;
                $scope.item.AccessmentComments = res.Data[1].AccessmentComments;
                $scope.item.AccessmentDate = res.Data[1].AccessmentDate;
                $scope.item.AccessmentApprovedBy = res.Data[1].AccessmentApprovedBy;
                $scope.item.IsCommunicatetoUsers = res.Data[1].IsCommunicatetoUsers;
                $scope.item.IsSafelyRemovefromService = res.Data[1].IsSafelyRemovefromService;
                $scope.item.IsEraseConfidentialInformation = res.Data[1].IsEraseConfidentialInformation;
                $scope.item.IsTransfertoSafeandSecureStorage = res.Data[1].IsTransfertoSafeandSecureStorage;
                $scope.item.IsRemoveAnySoftware = res.Data[1].IsRemoveAnySoftware;
                $scope.item.IsUpdateCondemnationDatabase = res.Data[1].IsUpdateCondemnationDatabase;
                $scope.item.DisposeMethodId = res.Data[1].DisposeMethodId;
                $scope.item.DisposeCost = res.Data[1].DisposeCost;
                $scope.item.VendorName = res.Data[1].VendorName;
                $scope.item.VendorDetails = res.Data[1].VendorDetails;
                $scope.item.DisposedBy = res.Data[1].DisposedBy;
                $scope.item.DisposedDate = res.Data[1].DisposedDate;
                $scope.item.Comments = res.Data[1].Comments;
                if ($scope.item.DisposeStatusId == 2) {
                    $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
                } else {
                    $scope.item.ApprovedDate = res.Data[1].ApprovedDate;
                }
                if (res.Data[1].Asset.AssetType)
                    $scope.item.AssetType = res.Data[1].Asset.AssetType.Description;
                if (res.Data[1].Asset.AssetCategory)
                    $scope.item.AssetCategory = res.Data[1].Asset.AssetCategory.Description;
                if (res.Data[1].Department)
                    $scope.item.Department = res.Data[1].Department.DepartmentName;
                if (res.Data[1].Asset.Manufacturer)
                    $scope.item.Manufacturer = res.Data[1].Asset.Manufacturer.Description;
                if (res.Data[1].VendorMaster)
                    $scope.item.Vendor = res.Data[1].VendorMaster.VendorName;
                if (res.Data[1].Asset.Employee) {
                    $scope.item.Employee = '';
                    if (res.Data[1].Asset.Employee.Title)
                        $scope.item.Employee = res.Data[1].Asset.Employee.Title.Description;
                    if (res.Data[1].Asset.Employee.FirstName)
                        $scope.item.Employee += res.Data[1].Asset.Employee.FirstName;
                    if (res.Data[1].Asset.Employee.LastName)
                        $scope.item.Employee += res.Data[1].Asset.Employee.LastName;
                }
                $scope.applyVisisbilityRules();
                afterGetData(res);
            }
        };

        $scope.getDisposeReqList = function () {
            if ($scope.currentcontext.grpId > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.grpId
                    }],
                };
                var options = {
                    action: 'AssetManagement/AssetDispose/GetAssetDisposes',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDisposeReqListCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.getpreference();
                $scope.applyVisisbilityRules();
            }
        };

        function afterGetData(res) {
            for (var idx in res.Data) {
                if (res.Data.length > 2) {
                    var listLength = res.Data.length;
                    var pageCount = Math.ceil(listLength / 2);
                } else {
                    var pageCount = res.Data.length;
                    // var pageCount = Math.ceil(listLength / 2);
                }
                for (var i = 0; i < pageCount; i++) {
                    var parameter = res.Data[i];
                    var params = {
                        Id: parameter.Id,
                        DisposeTypeId: parameter.DisposeTypeId,
                        Text: parameter.DisposeTypeName,
                        DisposeTypeValue: parameter.DisposeTypeValue
                    };
                    $scope.PrefData1.push(params);
                }
                for (var i = pageCount; i >= pageCount; i++) {
                    var parameter = res.Data[i];
                    var params = {
                        Id: parameter.Id,
                        DisposeTypeId: parameter.DisposeTypeId,
                        Text: parameter.DisposeTypeName,
                        DisposeTypeValue: parameter.DisposeTypeValue
                    };
                    $scope.PrefData2.push(params);
                }
            }
        }

        $scope.applyVisisbilityRules = function () {
            if (!$scope.currentcontext.grpId) {
                $scope.CanShowRequest = true;
                $scope.CanShowSave = true;
                $scope.CanShowApprove = false;
                $scope.CanShowCondemnationApprove = false;
                $scope.CanShowFetch = true;
                $scope.CanShowDispose = false;
            }
            if ($scope.item.DisposeStatusId == 1) {
                $scope.CanShowRequest = true;
                $scope.CanShowSave = false;
                $scope.CanShowApprove = false;
                $scope.CanShowCondemnationApprove = false;
                $scope.CanShowFetch = false;
                $scope.CanShowDispose = false;
            }
            if ($scope.item.DisposeStatusId == 2) {
                $scope.CanShowRequest = false;
                $scope.CanShowSave = false;
                $scope.CanShowApprove = true;
                $scope.CanShowCondemnationApprove = false;
                $scope.CanShowFetch = false;
                $scope.CanShowDispose = false;
            }
            if ($scope.item.DisposeStatusId == 3) {
                $scope.CanShowRequest = false;
                $scope.CanShowSave = false;
                $scope.CanShowApprove = false;
                $scope.CanShowCondemnationApprove = true;
                $scope.CanShowFetch = false;
                $scope.CanShowDispose = false;
            }
            if ($scope.item.DisposeStatusId == 4) {
                $scope.CanShowRequest = false;
                $scope.CanShowSave = false;
                $scope.CanShowApprove = false;
                $scope.CanShowCondemnationApprove = false;
                $scope.CanShowFetch = false;
                $scope.CanShowDispose = true;
            }
        }

        function afterGet(res) {
            for (var idx in res.Data) {
                if (res.Data.length > 2) {
                    var listLength = res.Data.length;
                    var pageCount = Math.ceil(listLength / 2);
                } else {
                    var pageCount = res.Data.length;
                    // var pageCount = Math.ceil(listLength / 2);
                }
                for (var i = 0; i < pageCount; i++) {
                    var parameter = res.Data[i];
                    var params = {
                        Id: parameter.Id,
                        Text: parameter.Name,
                        DisposeTypeValue: false
                    };
                    $scope.PrefData1.push(params);
                }
                for (var i = pageCount; i >= pageCount; i++) {
                    var parameter = res.Data[i];
                    var params = {
                        Id: parameter.Id,
                        Text: parameter.Name,
                        DisposeTypeValue: false
                    };
                    $scope.PrefData2.push(params);
                }
            }
        }

        $scope.getpreferenceCallback = function (scope, res, options, hasError) {
            $scope.items = res.Data;
            if (res.Data) {
                afterGet(res);
            }
        };

        $scope.getpreference = function () {
            var inputData = {
                Params: [],
            };

            var options = {
                action: 'AssetManagement/Preferences/GetPreferencess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpreferenceCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getfetchCallback = function (scope, res, options, hasError) {
            var assetdata = res.Data[0];
            $scope.item.AssetId = assetdata.Id;
            $scope.item.AssetCode = assetdata.AssetName;
            $scope.item.AssetName = assetdata.Description;
            $scope.item.AssetTypeId = assetdata.AssetTypeId;
            $scope.item.Serial = assetdata.Serial;
            $scope.item.ModelNum = assetdata.ModelNum;
            $scope.item.ManufacturerId = assetdata.ManufacturerId;
            $scope.item.DepartmentId = assetdata.DepartmentId;
            $scope.item.EmployeeId = assetdata.EmployeeId;
            $scope.item.Contact = assetdata.Contact;
            $scope.item.ContactPerson = assetdata.ContactPerson;
            $scope.item.AssetCategoryId = assetdata.AssetCategoryId;
            $scope.item.VendorId = assetdata.VendorId;
            if (assetdata.AssetCategory)
                $scope.item.AssetCategory = assetdata.AssetCategory.Description;
            if (assetdata.Department)
                $scope.item.Department = assetdata.Department.DepartmentName;
            if (assetdata.Manufacturer)
                $scope.item.Manufacturer = assetdata.Manufacturer.Description;
            if (assetdata.AssetType)
                $scope.item.AssetType = assetdata.AssetType.Description;
            if (assetdata.VendorMaster)
                $scope.item.Vendor = assetdata.VendorMaster.VendorName;
            if (assetdata.Employee) {
                $scope.item.Employee = '';
                if (assetdata.Employee.Title)
                    $scope.item.Employee = assetdata.Employee.Title.Description;
                if (assetdata.Employee.FirstName)
                    $scope.item.Employee += assetdata.Employee.FirstName;
                if (assetdata.Employee.LastName)
                    $scope.item.Employee += assetdata.Employee.LastName;
            }
        };

        $scope.fetch = function (item) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: item.AssetId
                }],

            };

            var options = {
                action: 'AssetManagement/Asset/GetAssets',
                data: inputData,
                type: 'post',
                onComplete: $scope.getfetchCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $state.go('app.assetdisposetab.dispose')
        }
        $scope.clear = function () {
            $scope.item = {};
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
                },
                {
                    header: 'Model Number',
                    field: 'ModelNum',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-modelnumber'
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
                Params: [],
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
            }
        }
        //autosearch related code ends -


        $scope.Dispose = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.assettransfer.confirmdisposemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onDisposeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onDisposeConfirmed = function () {
            $scope.item.DisposeStatusId = 5;
            $scope.item.DisposedBy = utl.Session.getCurrentUserId();
            $scope.item.DisposedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            for (var i = 0; i < $scope.PrefData1.length; i++) {
                var parameter = $scope.PrefData1[i];
                var data = {
                    Id: parameter.Id || 0,
                    DisposeGroupId: $scope.item.DisposeGroupId,
                    DisposeTypeId: parameter.DisposeTypeId,
                    DisposeTypeName: parameter.Text,
                    DisposeTypeValue: parameter.DisposeTypeValue,
                    AssetId: $scope.item.AssetId,
                    DisposeStatusId: $scope.item.DisposeStatusId,
                    AssetTypeId: $scope.item.AssetTypeId,
                    AssetName: $scope.item.AssetName,
                    FacilityId: $scope.item.FacilityId,
                    DepartmentId: $scope.item.DepartmentId,
                    VendorId: $scope.item.VendorId,
                    ReasonForNotification: $scope.item.ReasonForNotification,
                    RequestedBy: $scope.item.RequestedBy,
                    RequestedDate: $scope.item.RequestedDate,
                    ApprovedBy: $scope.item.ApprovedBy,
                    ApprovedDate: $scope.item.ApprovedDate,
                    AccessmentBy: $scope.item.AccessmentBy,
                    AccessmentComments: $scope.item.AccessmentComments,
                    AccessmentDate: $scope.item.AccessmentDate,
                    AccessmentApprovedBy: $scope.item.AccessmentApprovedBy,
                    IsCommunicatetoUsers: $scope.item.IsCommunicatetoUsers,
                    IsSafelyRemovefromService: $scope.item.IsSafelyRemovefromService,
                    IsEraseConfidentialInformation: $scope.item.IsEraseConfidentialInformation,
                    IsTransfertoSafeandSecureStorage: $scope.item.IsTransfertoSafeandSecureStorage,
                    IsRemoveAnySoftware: $scope.item.IsRemoveAnySoftware,
                    IsUpdateCondemnationDatabase: $scope.item.IsUpdateCondemnationDatabase,
                    DisposeMethodId: $scope.item.DisposeMethodId,
                    DisposeCost: $scope.item.DisposeCost,
                    VendorName: $scope.item.VendorName,
                    VendorDetails: $scope.item.VendorDetails,
                    DisposedBy: $scope.item.DisposedBy,
                    DisposedDate: $scope.item.DisposedDate,
                    Comments: $scope.item.Comments
                }
                $scope.Preferences.push(data);
            }
            for (var i = 0; i < $scope.PrefData2.length; i++) {
                var parameter = $scope.PrefData2[i];
                var data = {
                    Id: parameter.Id || 0,
                    DisposeGroupId: $scope.item.DisposeGroupId,
                    DisposeTypeId: parameter.DisposeTypeId,
                    DisposeTypeName: parameter.Text,
                    DisposeTypeValue: parameter.DisposeTypeValue,
                    AssetId: $scope.item.AssetId,
                    DisposeStatusId: $scope.item.DisposeStatusId,
                    AssetTypeId: $scope.item.AssetTypeId,
                    AssetName: $scope.item.AssetName,
                    FacilityId: $scope.item.FacilityId,
                    DepartmentId: $scope.item.DepartmentId,
                    VendorId: $scope.item.VendorId,
                    ReasonForNotification: $scope.item.ReasonForNotification,
                    RequestedBy: $scope.item.RequestedBy,
                    RequestedDate: $scope.item.RequestedDate,
                    ApprovedBy: $scope.item.ApprovedBy,
                    ApprovedDate: $scope.item.ApprovedDate,
                    AccessmentBy: $scope.item.AccessmentBy,
                    AccessmentComments: $scope.item.AccessmentComments,
                    AccessmentDate: $scope.item.AccessmentDate,
                    AccessmentApprovedBy: $scope.item.AccessmentApprovedBy,
                    IsCommunicatetoUsers: $scope.item.IsCommunicatetoUsers,
                    IsSafelyRemovefromService: $scope.item.IsSafelyRemovefromService,
                    IsEraseConfidentialInformation: $scope.item.IsEraseConfidentialInformation,
                    IsTransfertoSafeandSecureStorage: $scope.item.IsTransfertoSafeandSecureStorage,
                    IsRemoveAnySoftware: $scope.item.IsRemoveAnySoftware,
                    IsUpdateCondemnationDatabase: $scope.item.IsUpdateCondemnationDatabase,
                    DisposeMethodId: $scope.item.DisposeMethodId,
                    DisposeCost: $scope.item.DisposeCost,
                    VendorName: $scope.item.VendorName,
                    VendorDetails: $scope.item.VendorDetails,
                    DisposedBy: $scope.item.DisposedBy,
                    DisposedDate: $scope.item.DisposedDate,
                    Comments: $scope.item.Comments
                }
                $scope.Preferences.push(data)
            }
            if ($scope.Preferences.length > 0) {
                var options = {
                    action: 'AssetManagement/AssetDispose/ManageAssetDispose',
                    data: {
                        Data: $scope.Preferences
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getDisposeReqList();

        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "DisposeMethod"
                },
                {
                    "Key": "User"
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

    AssetDisposeFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();