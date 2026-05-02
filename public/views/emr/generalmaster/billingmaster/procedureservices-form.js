(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('procedureservicesFormController', procedureservicesFormController);

    function procedureservicesFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentcontext = {
            id: $stateParams.id
        }
        vm.items = [];
        vm.procedurecount = 0;

        $scope.addNew = function () {
            var item = {
                Id: 0,
                ProcedureId: $stateParams.id,
                ServiceItemId: -1,
                FacilityId: utl.Session.getCurrentFacilityId(),
                IsActive: true,
                Status: 1
            };
            var LastIdx = vm.items.length - 1;
            if (vm.items.length == 0)
                vm.items.push(item);
            else if (vm.items[LastIdx].ServiceItemId > 0)
                vm.items.push(item);
        }

        $scope.ServiceItemChanged = function (item) {

            if (item.SelectedItem.IsSurgicalProcedure)
                if (vm.procedurecount === 0) {
                    item.IsProcedureCharge = true;
                    vm.procedurecount = 1;
                }
                else {
                    item.IsProcedureCharge = false;
                }
        }

        $scope.clear = function () {
            for (var idx in vm.items) {
                var index = vm.items.indexOf(vm.items[idx])
                if (vm.items[idx].Id == 0)
                    vm.items.splice(index);
            }
            $scope.addNewLineItem();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data;
            for(var idx in vm.items){
                var item=vm.items[idx];
                if(item.IsProcedureCharge)
                    vm.procedurecount=1;
            }
            $scope.addNew();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.id },
                ]
            };

            var options = {
                action: 'BillingMaster/ProcedureServices/GetProcedureServices',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.onDeleteConfirmed = function (item) {
            if (item.IsProcedureCharge)
                vm.procedurecount = 0;
            if (item.Id == 0) {
                var idx = vm.items.indexOf(item);
                vm.items.splice(idx, 1);
            }
            else
                item.Status = 2;
            var lastidx = vm.items.length - 1;
            if (vm.items.indexOf(item) === lastidx) {
                $scope.addNewLineItem();
            }
        };

        $scope.deleteDetail = function (item) {
            var lastidx = vm.items.length - 1;
            if (item.ServiceItemId > 0) {
                var name = item.SelectedItem.ServiceName || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }


        };
        $scope.backToList = function () {
            $state.go('app.procedureservices-list');
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in vm.items) {
                var item = vm.items[idx];
                item.ServiceName = item.SelectedItem.ServiceName;
                if (item.ServiceItemId > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        $scope.saveItemCallBack = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.saveItem = function () {
            var options = {
                action: 'BillingMaster/ProcedureServices/ManageProcedureServices',
                data: {
                    Data: {
                        ProcedureId: $scope.currentcontext.id,
                        Details: getLinesForSave()
                    }
                },
                type: 'post',
                onComplete: $scope.saveItemCallBack
            };

            utl.Http.doAction(options);
        };

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Service Code', field: 'ServiceCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Service Name', field: 'ServiceName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;

            //Search only active patients
            var inputData = {
                Params: [
                    { Key: 4, Value: 2 },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;

            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" }
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

    procedureservicesFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();