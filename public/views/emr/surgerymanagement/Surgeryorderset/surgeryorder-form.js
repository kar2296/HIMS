(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('surgeryorderFormController', surgeryorderFormController);

    function surgeryorderFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.currentcontext = {
            id: $stateParams.id,
            ProcedureName: ''
        };
        vm.items = [];
        vm.procedurecount = 0;

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.ProcedureName = modalConfig.params.ProcedureName || '';
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.addNew = function () {
            var item = {
                Id: 0,
                ProcedureId: $scope.currentcontext.id,
                ServiceItemId: -1,
                FacilityId: utl.Session.getCurrentFacilityId(),
                Percent: 100,
                DoctorSharePercent: 0,
                IsCheifSurgeon: false,
                IsAssistantSurgeon: false,
                IsAnesthetist: false,
                IsOTHourlyCharge: false,
                IsProcedureCharge: false,
                IsActive: true,
                Status: 1
            };
            var lastIdx = vm.items.length - 1;
            if (vm.items.length === 0) {
                vm.items.push(item);
            } else if (vm.items[lastIdx].ServiceItemId > 0) {
                vm.items.push(item);
            }
        };

        $scope.ServiceItemChanged = function (item) {
            if (item && item.SelectedItem) {
                if (item.SelectedItem.IsSurgicalProcedure) {
                    if (vm.procedurecount === 0) {
                        item.IsProcedureCharge = true;
                        vm.procedurecount = 1;
                    } else {
                        item.IsProcedureCharge = false;
                    }
                }
                item.ServiceItem = {
                    IsOTHourlyCharge: item.SelectedItem.IsOTHourlyCharge === true
                };
                if (item.SelectedItem.IsOTHourlyCharge) {
                    item.IsOTHourlyCharge = true;
                }
                if (!item.Percent || item.Percent === 0) {
                    item.Percent = 100;
                }
            }
            $scope.addNew();
        };

        $scope.clear = function () {
            for (var idx = vm.items.length - 1; idx >= 0; idx--) {
                if (vm.items[idx].Id === 0) {
                    vm.items.splice(idx, 1);
                }
            }
            $scope.addNew();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data || [];
            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.IsProcedureCharge) {
                    vm.procedurecount = 1;
                }
                if (item.IsOTHourlyCharge && item.ServiceItem) {
                    item.IsOTHourlyCharge = (item.ServiceItem.IsOTHourlyCharge == true);
                }
            }
            $scope.addNew();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.id
                }]
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
            if (item.IsProcedureCharge) {
                vm.procedurecount = 0;
            }
            if (item.Id === 0) {
                var idx = vm.items.indexOf(item);
                if (idx > -1) {
                    vm.items.splice(idx, 1);
                }
            } else {
                item.Status = 2; // soft delete flag
            }
            var activeItems = vm.items.filter(function (it) { return it.Status === 1; });
            if (activeItems.length === 0) {
                $scope.addNew();
            }
        };

        $scope.deleteDetail = function (item) {
            if (item.ServiceItemId > 0) {
                var name = (item.SelectedItem && (item.SelectedItem.ServiceName || item.SelectedItem.Name)) || item.ServiceName || 'Service';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            } else {
                var idx = vm.items.indexOf(item);
                if (idx > -1 && vm.items.length > 1) {
                    vm.items.splice(idx, 1);
                }
            }
        };

        $scope.backToList = function () {
            if ($scope.cancelCallback) {
                $scope.cancelCallback();
            } else {
                $state.go('app.surgeryorder-list');
            }
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.ServiceItemId > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        $scope.saveItemCallBack = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if ($scope.confirmCallback) {
                $scope.confirmCallback();
            }
        };

        $scope.saveItem = function () {
            var lines = getLinesForSave();
            var options = {
                action: 'BillingMaster/ProcedureServices/ManageProcedureServices',
                data: {
                    Data: {
                        ProcedureId: $scope.currentcontext.id,
                        Details: lines
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
                {
                    header: 'Service Code',
                    field: 'ServiceCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Service Name',
                    field: 'ServiceName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItemsforSO',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                var name = selectedItem.ServiceName || selectedItem.Name || '';
                var code = selectedItem.ServiceCode || selectedItem.ItemCode || '';
                result = code ? name + ' (' + code + ')' : name;
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                var row = vm.serviceitemcontrolconfig.rowdata;
                var rowName = row.ServiceName || (row.SelectedItem && row.SelectedItem.Name) || '';
                var rowCode = row.ServiceCode || (row.SelectedItem && row.SelectedItem.ItemCode) || '';
                result = rowCode ? rowName + ' (' + rowCode + ')' : rowName;
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };

            if (vm.serviceitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && String(query).trim().length > 0) {
                inputData.Params.push({
                    Key: 1,
                    Value: String(query).trim()
                });
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode || item.ShortCode || '';
                item.ServiceName = item.Name || '';
                if (item.IsOTHourlyCharge) {
                    item.IsOTHourlyCharge = (item.IsOTHourlyCharge === true);
                }
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            }];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    surgeryorderFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();