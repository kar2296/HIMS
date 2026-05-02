(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('roleControlMapController', roleControlMapController);

    function roleControlMapController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        vm.currentcontext = {
            treeFilter: '',
            role: ''
        };
        vm.rCntrlDataList1 = [];
        vm.rCntrlDataList2 = [];
        if (modalConfig && modalConfig.params) {
            vm.currentcontext.id = parseInt(modalConfig.params.id);
            vm.currentcontext.role = modalConfig.params.role;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        vm.controlMap = {};
        vm.roleControlMap = {};
        vm.controlTypeIconMap = {
            EXTERNAL: 'fa-clone',
            MAIN: 'fa-beer',
            MENU: 'fa-bars',
            SUBMENU: 'fa-barcode',
            TABITEM: 'fa-tablet'
        };

        vm.backToList = function () {
            $scope.cancelCallback();
        }

        //getcontrols
        function getListCallback(scope, res, options, hasError) {
            computeTreeData(res.Data);
        };

        function getList() {

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/control/GetControls',
                data: inputData,
                type: 'post',
                onComplete: getListCallback
            };

            utl.Http.doAction(options);
        }

        //get role control maps
        function getRoleControlMapsCallback(scope, res, options, hasError) {
            computeControlMap(res);
            getList();
        };

        function getRoleControlMaps() {

            var inputData = {
                Params: [{
                    Key: 0,
                    Value: vm.currentcontext.id
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/Role/GetControls',
                data: inputData,
                type: 'post',
                onComplete: getRoleControlMapsCallback
            };

            utl.Http.doAction(options);
        }

        //save item
        function saveItemCallback(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        vm.saveItem = function () {

            vm.selectedNodes = [];
            collectSelectedNodes(vm.treeData);

            var inputData = {
                Id: vm.currentcontext.id,
                Data: vm.selectedNodes
            };

            var options = {
                action: 'SystemSettings/Role/MapControls',
                data: inputData,
                type: 'post',
                onComplete: saveItemCallback
            };

            utl.Http.doAction(options);
        };

        //collection before save
        function collectSelectedNodes(treeNodes) {

            for (var idx in treeNodes) {
                var treeNode = treeNodes[idx];

                if (treeNode.selected || treeNode.__ivhTreeviewIndeterminate) {
                    var selectedNode = {
                        RoleId: vm.currentcontext.id,
                        ControlCode: treeNode.ControlCode,
                        ControlId: treeNode.ControlId,
                        DisplayOrder: parseInt(idx)
                    };
                    vm.selectedNodes.push(selectedNode);
                }

                if (treeNode.children && treeNode.children.length > 0) {
                    collectSelectedNodes(treeNode.children);
                }
            }
        }

        //compute tree
        function computeTreeData(items) {
            var treeData = [];
            for (var idx in items) {
                var item = items[idx];

                //Preparing controls
                var isSelected = vm.roleControlMap[item.Id] ? true : false;
                var strLabel = item.TranslateRef ? $translate.instant(item.TranslateRef) : item.Display;
                var iconCls = vm.controlTypeIconMap[item.ControlType];

                var control = {
                    label: strLabel,
                    ControlId: item.Id,
                    ControlCode: item.ControlCode,
                    Display: item.Display,
                    TranslateRef: item.TranslateRef,
                    IconRef: item.IconRef,
                    ParentControlCode: item.ParentControlCode,
                    ControlPosition: item.ControlPosition,
                    ControlType: item.ControlType,
                    children: [],
                    selected: isSelected,
                    icon: iconCls
                };
                var parentNode = control.ParentControlCode ? vm.controlMap[control.ParentControlCode] : null;
                if (parentNode) {
                    parentNode.children.push(control);
                } else {
                    treeData.push(control);
                }

                vm.controlMap[control.ControlCode] = control;
            }
            vm.treeData = treeData;
            afterGet(vm.treeData)
            //console.log(vm.treeData);
        }

        function afterGet(res) {
            for (var idx in res) {
                if (vm.treeData.length > 2) {
                    var listLength = vm.treeData.length;
                    var pageCount = Math.ceil(listLength / 2);
                }
                for (var i = 0; i < pageCount; i++) {
                    var rcntrlData1 = vm.treeData[i];
                    if (rcntrlData1)
                        vm.rCntrlDataList1.push(rcntrlData1);
                }
                for (var i = pageCount; i >= pageCount; i++) {
                    if (i > vm.treeData.length) {
                        return;
                    }
                    if (vm.treeData.length >= i) {
                        var rcntrlData2 = vm.treeData[i];
                        if (rcntrlData2)
                            vm.rCntrlDataList2.push(rcntrlData2);
                    }
                }
            }
        }
        //compute controlMap
        function computeControlMap(map) {
            for (var idx in map) {
                var item = map[idx];
                vm.roleControlMap[item.ControlId] = item;
            }
        }

        //TODO : Comment
        //getList();

        //get saved role control map and then getcontrols
        getRoleControlMaps();
    }

    roleControlMapController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();