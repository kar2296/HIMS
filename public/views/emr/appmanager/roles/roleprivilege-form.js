(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('rolePrivilegeFormController', rolePrivilegeFormController);

    function rolePrivilegeFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            PrivilegeActionId: -1,
            AccessObjectTypeId: parseInt(modalConfig.params.privilegeid),
            RoleId: parseInt(modalConfig.params.roleid),
            RoleCode: modalConfig.params.code,
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            isEdit: modalConfig.params.isEdit,
            Selected: null,
            MasterList: [],
            AllowList: [],
            DenyList: []
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.items = res.Data;
            if ($scope.currentcontext.items) {
                var SelectedId = $scope.currentcontext.items[0].AccessObjectTypeId
                for (var idx in $scope.lookup.AccessAction) {
                    if ($scope.lookup.AccessAction[idx].ObjectTypeId == SelectedId)
                        $scope.currentcontext.MasterList.push($scope.lookup.AccessAction[idx]);
                }
            }
            getSpecificListData();
            console.log(res.Data);
        };

        $scope.getList = function () {
            if ($scope.currentcontext.isEdit) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.item.RoleId },
                        { Key: 3, Value: $scope.item.AccessObjectTypeId },
                        { Key: 4, Value: $scope.item.FacilityId },
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'SystemSettings/roleprivilege/GetRolePrivileges',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };

        function getSpecificListData() {
            var items = $scope.currentcontext.items;
            $scope.item.FacilityId = items[0].FacilityId;
            $scope.item.AccessObjectTypeId = items[0].AccessObjectTypeId;
            var selectedList = [];
            var allowList = [];
            var denyList = [];
            for (var idx in items) {
                var item = items[idx];
                if (item.Access == 'allow') {
                    var action = { Id: item.PrivilegeActionId, Code: item.AccessAction, Text: item.AccessAction }
                    selectedList.push(action);
                    allowList.push(action);
                } else if (item.Access == 'deny') {
                    var action = { Id: item.PrivilegeActionId, Code: item.AccessAction, Text: item.AccessAction }
                    selectedList.push(action);
                    denyList.push(action);
                }
            }
            $scope.currentcontext.AllowList = allowList;
            $scope.currentcontext.DenyList = denyList;
            $scope.currentcontext.MasterList = _.differenceBy($scope.currentcontext.MasterList, selectedList, 'Id');
        }

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            }
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            //Prepare data
            var inputData = { Id: $scope.item.RoleId, Data: [] }
            var typeObj = utl.Lookup.getObject($scope.lookup.AccessObjectType, $scope.item.AccessObjectTypeId);
            var header = {
                Id: $scope.item.RoleId, Code: $scope.item.RoleCode, FacilityId: $scope.item.FacilityId,
                TypeId: $scope.item.AccessObjectTypeId, Type: typeObj.Code
            };

            //Allow List
            for (var idx in $scope.currentcontext.AllowList) {
                var action = {
                    RoleId: header.Id, RoleCode: header.Code, FacilityId: header.FacilityId,
                    AccessObjectTypeId: header.TypeId, AccessObjectType: header.Type,
                    PrivilegeActionId: $scope.currentcontext.AllowList[idx].Id, AccessAction: $scope.currentcontext.AllowList[idx].Code,
                    Access: "allow"
                }
                inputData.Data.push(action);
            }

            //Deny List
            for (var idx in $scope.currentcontext.DenyList) {
                var action = {
                    RoleId: header.Id, RoleCode: header.Code, FacilityId: header.FacilityId,
                    AccessObjectTypeId: header.TypeId, AccessObjectType: header.Type,
                    PrivilegeActionId: $scope.currentcontext.DenyList[idx].Id, AccessAction: $scope.currentcontext.DenyList[idx].Code,
                    Access: "deny"
                }
                inputData.Data.push(action);
            }

            var actionName = 'SystemSettings/roleprivilege/ManageRolePrivilege';

            var options = {
                action: actionName,
                data: inputData,
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.onObjectTypeSelected = function (selectedItem) {
            $scope.currentcontext.MasterList = [];
            $scope.loadMasterList();
            console.log(selectedItem);
            if (selectedItem) {
                if (selectedItem.Id > 0) {
                    for (var idx in $scope.lookup.AccessAction) {
                        if ($scope.lookup.AccessAction[idx].ObjectTypeId == selectedItem.Id)
                            $scope.currentcontext.MasterList.push($scope.lookup.AccessAction[idx]);
                    }
                }
            }
            if ($scope.currentcontext.items)
                getSpecificListData();
        }

        $scope.loadMasterList = function () {
            if ($scope.lookup.AccessAction) {
                for (var idx in $scope.lookup.AccessAction) {
                    if ($scope.lookup.AccessAction[idx].ObjectTypeId == null)
                        $scope.currentcontext.MasterList.push($scope.lookup.AccessAction[idx]);
                }
            }
        };

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.loadMasterList();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "AccessAction", Default: false },
                { "Key": "AccessObjectType" }
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

    rolePrivilegeFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();