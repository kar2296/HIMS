(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('EquipmentUsedController', EquipmentUsedController);

    function EquipmentUsedController($scope, $stateParams, $state, $translate, utl, $filter, $interval) {
        var vm = this;
        vm.items = [];
        $scope.currentcontext = {
            otregisterid: $stateParams.id
        };
        $scope.item = {};
        $scope.IsStarted = true;
        $scope.IsStopped = true;
        $scope.CanShowEquipment = false;
        $scope.currentcontext.otregisterid = parseInt($stateParams.id);

        $scope.addNewLineItem = function (item) {
            var lineItem = {
                Id: 0,
                IsStarted: false,
                IsCompleted: false,
                IsBilled: false,
                Status: 1
            };
            vm.items.push(lineItem);
        };

        $scope.start = function (item) {
            if (item.StartTime == undefined)
                item.StartTime = utl.Formatter.getCurrentDate();
            $scope.IsStarted = true;
            $scope.IsStopped = false;
            if (item.TotalHours == undefined)
                item.TotalHours = 0;
            item.IsStarted = true;
        };

        function checkValidity(item) {
            if ((item.StopTime.getTime() - item.StartTime.getTime()) < 0) {
                utl.Alert.showErrorMsg($translate.instant('otregisterequipment-tab.invalidduration.lbl'));
                item.StopTime = '';
                $scope.IsStarted = true;
                $scope.IsStopped = false;
                return false;
            } else {
                return true;
            }
        }

        $scope.stop = function (item) {
            $scope.IsStarted = true;
            $scope.IsStopped = true;
            item.IsStarted = false;
            item.StopTime = new Date();
            $scope.getHours(item);
        };

        $scope.getHours = function (item) {
            if (item.StartTime) {
                $scope.IsStarted = true;
                $scope.IsStopped = false;
            }
            if (item.StopTime) {
                $scope.IsStarted = true;
                $scope.IsStopped = true;
                // checkValidity(item);
                if (checkValidity(item)) {
                    if (item.IsStarted) {
                        $scope.IsStarted = true;
                        $scope.IsStopped = true;
                        item.IsStarted = false;
                    }
                    item.TotalHours = ((item.StopTime.getTime() - item.StartTime.getTime()) / (1000 * 3600));
                    item.TotalHours = parseFloat(item.TotalHours).toFixed(2);
                    item.TotalHours = parseFloat(item.TotalHours);
                    if (item.ChargeTypeId == 2) {
                        item.TotalHours = Math.floor(item.TotalHours) + '.' + Math.floor((item.TotalHours % 1) * 60);
                        item.TotalHours = parseFloat(item.TotalHours);
                    }
                    if (item.ChargeTypeId == 1) {
                        item.TotalHours = item.TotalHours / 24;
                        item.TotalHours = Math.ceil(item.TotalHours);
                    }
                }
            }
        };

        $scope.equipmentChanged = function (item) {
            var selecteditem = item.SelectedItem;
            $scope.IsStarted = false;
            $scope.IsStopped = true;
            if (selecteditem.IsEquipmentDaily) {
                item.ChargeTypeId = 1;
                item.ChargeType = 'Days';
            } else if (selecteditem.IsEquipmentHour) {
                item.ChargeTypeId = 2;
                item.ChargeType = 'Hours';
            }
        };

        $scope.getOtregisterCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.Encounter.IsBillLock == true) {
                utl.Alert.showErrorMsg($translate.instant('Bill Has Been Locked'));
                $scope.CanShowEquipment = true;
            }
        };

        $scope.getOtregisterById = function () {
            var options = {
                action: 'OtManagement/OtRegister/GetOtRegisterById',
                data: { Id: $scope.currentcontext.otregisterid },
                type: 'post',
                onComplete: $scope.getOtregisterCallback
            };

            utl.Http.doAction(options);
        };

        vm.filter = $filter;
        $scope.getListCallback = function (scope, data, options, hasError) {
            for (var idx in data.Data) {
                data.Data[idx].StartTime = new Date(data.Data[idx].StartTime);
                data.Data[idx].StopTime = new Date(data.Data[idx].StopTime);
                data.Data[idx].IsStarted = true;
                if (data.Data[idx].StopTime != null) {
                    data.Data[idx].IsCompleted = true;
                }
                if (data.Data[idx].ChargeTypeId == 1)
                    data.Data[idx].ChargeType = 'Days';
                if (data.Data[idx].ChargeTypeId == 2)
                    data.Data[idx].ChargeType = 'Hours'
            }
            vm.items = data.Data;
            $scope.addNewLineItem();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{ Key: 1, Value: $scope.currentcontext.otregisterid }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'OtManagement/OtPatientEquipments/GetOtPatientEquipmentss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            for (var idx in vm.items) {
                var index = vm.items.indexOf(vm.items[idx])
                if (vm.items[idx].Id == 0)
                    vm.items.splice(index);
            }
            $scope.addNewLineItem();
        };

        $scope.addNew = function () {
            $scope.addNewLineItem();
        };

        $scope.backToList = function () {
            $state.go('app.otregisters');
        };

        $scope.backToDetail = function () {
            $state.go('app.otregistertab.otregister', { id: $scope.currentcontext.otregisterid });
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        };

        $scope.deleteItem = function (idx, item) {
            var name = item.EquipmentId || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'OtManagement/OtPatientEquipments/ManageOtPatientEquipments',
                    data: {
                        Data: {
                            Details: lines,
                            EncounterId: $scope.item.EncounterId
                        }
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [
                { search: 1, fields: ['Status'] }
            ]);

            var lastIndex = activeRecords.length - 1;
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (idx == lastIndex && !item.StartTime) {
                    continue;
                } else if (item.EquipmentId == -1 || !item.StartTime) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        };

        function getLinesForSave() {
            var result = [];
            var lastIndex = vm.items.length - 1;
            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.EquipmentId > 0 && item.StartTime) {
                    item.SelectedItem = item.SelectedItem;
                    item.PatientId = $scope.item.PatientId;
                    item.OTRegisterId = $scope.item.Id;
                    item.EncounterId = $scope.item.EncounterId;
                    item.WardId = $scope.item.WardId;
                    item.RoomId = $scope.item.RoomId;
                    item.BedId = $scope.item.BedId;
                    item.ServiceRateCategoryId = $scope.item.ServiceRateCategoryId;
                    item.OTRoomId = $scope.item.OTRoomId;
                    result.push(item);
                }
            }
            return result;
        };

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Service Code', field: 'ServiceCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Service Name', field: 'ServiceName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'ServiceItem Rate', field: 'ServiceItemRate', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' }
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
            var inputData = {
                Params: [
                    { Key: 4, Value: 2 },
                    { Key: 13, Value: true },
                ],
                PageContext: {
                    PageSize: 25,
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
                var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, { ServiceRateCategoryId: $scope.item.ServiceRateCategoryId }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                    item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                }
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getOtregisterById();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Team" },
                { "Key": "ChargeType" }
            ];
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

    EquipmentUsedController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$interval'];

})();