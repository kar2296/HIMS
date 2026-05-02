(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MedicalEquipmentController', MedicalEquipmentController);

    function MedicalEquipmentController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;


        vm.items = [];
        $scope.currentcontext = {
            eid: $stateParams.eid
        };
        $scope.item = {};
        $scope.IsStarted = false;
        $scope.toggle = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = parseInt(modalConfig.params.encounterid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        // $scope.CanShowStart = true;
        // $scope.CanShowStop = false;
        $scope.addNewLineItem = function (item) {
            var lineItem = {
                Id: 0,
                IsStarted: false,
                IsCompleted: false,
                IsBilled: false,
                // StartTime: utl.Formatter.getCurrentDate(),
                // StopTime: utl.Formatter.getCurrentDate(),
                Status: 1,
            };
            vm.items.push(lineItem);
        }

        $scope.doctor_dashboard = function () {
            if ($scope.Context == 'ipemr' || !$scope.Context) {
                if ($scope.From == 'nursing') {
                    $state.go('app.nursingdashboard');
                } else {
                    $state.go('app.doctordashboard');
                }
            }
            if ($scope.Context == 'surgery') {
                $state.go('app.surgerydashboard');
            }
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.start = function (item) {
            if (!item.EquipmentId) {
                utl.Alert.showErrorMsg($translate.instant('Please select equipment'));
                return false;
            } else {
                if (item.StartTime == undefined)
                    item.StartTime = utl.Formatter.getCurrentDate();
                $scope.IsStarted = true;
                if (item.TotalHours == undefined)
                    item.TotalHours = 0;
                item.IsStarted = true;
            }
        };

        function checkValidity(item) {
            if ((item.StopTime.getTime() - item.StartTime.getTime()) < 0) {
                var starttime = new Date(item.StartTime);
                var startedDate = starttime.getDate();
                var startedHrs = starttime.getHours();
                var surenddtae = new Date(item.StopTime);
                var stopDate = surenddtae.getDate();
                var stopHrs = surenddtae.getHours();
                if (startedDate > stopDate) {
                    utl.Alert.showErrorMsg($translate.instant('Stop Time Should not be a Past Date'));
                    return false;
                }
                if (stopHrs > 0) {
                    if (startedDate <= stopDate) {
                        if (startedHrs >= stopHrs) {
                            utl.Alert.showErrorMsg($translate.instant('Stop Time Should not be a Past Date'));
                            return false;
                        }
                    }
                }
            } else {
                return true;
            }
            // if ((item.StopTime.getTime() - item.StartTime.getTime()) < 0) {
            //     utl.Alert.showErrorMsg($translate.instant('otregisterequipment-tab.invalidduration.lbl'));
            //     item.StopTime = '';
            //     $scope.IsStarted = true;
            //     $scope.IsStopped = false;
            //     return false;
            // } else return true;
        }

        $scope.stop = function (item) {
            $scope.IsStarted = false;
            item.IsStarted = false;
            // item.StopTime = Math.abs(new Date().getTime() - item.StartTime.getTime());
            // if(item.)
            item.StopTime = new Date();
            $scope.getHours(item);
        };

        $scope.getHours = function (item) {
            if (item.StopTime) {
                // checkValidity(item);
                if (checkValidity(item)) {
                    if (item.IsStarted) {
                        $scope.IsStarted = false;
                        item.IsStarted = false;
                    }
                    item.TotalHours = ((item.StopTime.getTime() - item.StartTime.getTime()) / (1000 * 3600));
                    item.TotalHours = parseFloat(item.TotalHours).toFixed(2);
                    item.TotalHours = parseFloat(item.TotalHours);
                    if (item.ChargeTypeId == 2) {
                        item.TotalHours = Math.floor(item.TotalHours) + '.' + Math.floor((item.TotalHours % 1) * 60) //Converting Decimal to Minutes
                        item.TotalHours = parseFloat(item.TotalHours);
                        item.Quantity = Math.ceil(item.TotalHours);
                        // var NetNaturalValue = getNatural(Number($scope.currentcontext.TotNetAmount).toFixed(2));
                        // var NetDecimalValue = getDecimal(Number($scope.currentcontext.TotNetAmount).toFixed(2));
                    }
                    if (item.ChargeTypeId == 1) {
                        item.TotalHours = item.TotalHours / 24; // Converting Hours to days
                        item.TotalHours = Math.ceil(item.TotalHours);
                        item.Quantity = Math.ceil(item.TotalHours);
                    }
                }
            }
        };

        $scope.equipmentChanged = function (item) {
            var selecteditem = item.SelectedItem;
            if (selecteditem.IsEquipmentDaily) {
                item.ChargeTypeId = 1;
                item.ChargeType = 'Days';
            } else if (selecteditem.IsEquipmentHour) {
                item.ChargeTypeId = 2;
                item.ChargeType = 'Hours';
            }
            if (item.EquipmentId > 0) {
                item.CanShowStart = true;
                item.CanShowStop = false;
            }
        }

        //   var startTime=moment("12:16:59 am", "HH:mm:ss a");
        //  var endTime=moment("06:12:07 pm", "HH:mm:ss a");
        //  var duration = moment.duration(endTime.diff(startTime));
        //  var hours = parseInt(duration.asHours());
        //  var minutes = parseInt(duration.asMinutes())-hours*60;
        //  alert (hours + ' hour and '+ minutes+' minutes.)

        $scope.getEncounterCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.Guarantor) {
                $scope.item.CoPayPercent = $scope.item.Guarantor.CoPayPercent;
            }
            if (data.IsBillLock == true) {
                utl.Alert.showErrorMsg($translate.instant('Bill Has Been Locked'));
                $scope.CanShowEquipment = true;
                // $scope.confirmCallback();
            }
        };

        $scope.getEncounterById = function () {
            var options = {
                action: 'Visit/Visit/getEncounterById',
                data: {
                    Id: $scope.currentcontext.eid
                },
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };
        vm.filter = $filter;
        $scope.getListCallback = function (scope, data, options, hasError) {
            for (var idx in data.Data) {
                data.Data[idx].StartTime = new Date(data.Data[idx].StartTime);
                data.Data[idx].IsStarted = true;
                if (data.Data[idx].StopTime != null) {
                    data.Data[idx].StopTime = new Date(data.Data[idx].StopTime);
                    data.Data[idx].IsCompleted = true;
                }
                if (data.Data[idx].StartTime && !data.Data[idx].StopTime) {
                    data.Data[idx].CanShowStart = false;
                    data.Data[idx].CanShowStop = true;
                }
                if (data.Data[idx].StartTime && data.Data[idx].StopTime) {
                    data.Data[idx].CanShowStart = false;
                    data.Data[idx].CanShowStop = false;
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
                Params: [{
                    Key: 3,
                    Value: $scope.currentcontext.eid
                }],
                // PageContext: {
                //     PageSize: 25,
                //     PageNumber: 1
                // }
            };

            var options = {
                action: 'OtManagement/OtPatientEquipments/GetOtPatientEquipmentss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.print = function () {
            var inputData = {
                Data: {
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    EncounterId: $scope.currentcontext.eid
                },
                Params: [{
                    Key: 3,
                    Value: $scope.currentcontext.eid
                }],
            };

            var options = {
                action: 'OtManagement/OtPatientEquipments/PrintOtPatientEquipments',
                data: inputData,
                type: 'post',
                onComplete: $scope.downloadFileCallback
            };

            utl.Http.doDownload(options);
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

            // $scope.clear();
            $scope.addNewLineItem();
        };
        $scope.backToList = function () {
            $state.go('app.otregisters');
        }

        // $scope.backToDetail = function () {
        //     $state.go('app.otregistertab.otregister', { id: $scope.currentcontext.otregisterid });
        // }
        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            // $scope.saveItem();
        };

        $scope.deleteItem = function (idx, item) {
            var name = item.EquipmentId || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };
        //Save Item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (modalConfig && modalConfig.params) {
                $scope.confirmCallback();
            } else {
                $scope.getList();
            }
        };

        $scope.saveItem = function () {

            if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'OtManagement/OtPatientEquipments/ManageOtPatientEquipments',
                    data: {
                        Data: {
                            Details: lines,
                            EncounterId: $scope.item.Id
                        }
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [{
                search: 1,
                fields: ['Status']
            }]);

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
                    // item.OTRegisterId = $scope.item.Id;
                    item.EncounterId = $scope.item.Id;
                    item.WardId = $scope.item.WardId;
                    item.RoomId = $scope.item.RoomId;
                    item.BedId = $scope.item.BedId;
                    item.ServiceRateCategoryId = $scope.item.ServiceRateCategoryId;
                    item.CoPayPercent = parseFloat($scope.item.CoPayPercent);
                    // item.OTRoomId = $scope.item.OTRoomId;
                    result.push(item);
                }
            }
            return result;
        };

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
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
                },
                // { header : 'ServiceRate Catogory', field : 'ServiceRateCategory', datatype: 'string', headercls:'td-category', fieldcls:'td-category' },
                {
                    header: 'ServiceItem Rate',
                    field: 'ServiceItemRate',
                    datatype: 'string',
                    headercls: 'td-rate',
                    fieldcls: 'td-rate'
                }
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
                Params: [{
                        Key: 4,
                        Value: 2
                    },
                    {
                        Key: 13,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
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

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, {
                    ServiceRateCategoryId: $scope.item.ServiceRateCategoryId
                }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                    item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                }
                // if (item.ServiceItemTariffDetails && item.ServiceItemTariffDetails.length > 0)
                //     item.ServiceItemRate = item.ServiceItemTariffDetails[0].Rate;

            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getEncounterById();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Team"
                },
                {
                    "Key": "ChargeType"
                }
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
    MedicalEquipmentController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();