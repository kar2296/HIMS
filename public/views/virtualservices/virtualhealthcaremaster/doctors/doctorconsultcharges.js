(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctorConsultChargesController', DoctorConsultChargesController);

    function DoctorConsultChargesController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentcontext.userid = parseInt($stateParams.id);
        $scope.currentcontext.facilityid = utl.Session.getCurrentFacilityId()
        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                Status: 1,
                StatusId: true
            };
            vm.items.push(lineItem);
        }
        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data;
            $scope.addNewLineItem();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.userid
                }],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'SystemSettings/userdefaultservice/GetUserDefaultServices',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            vm.items = [];
            $scope.addNewLineItem();
        }
        $scope.backToList = function () {
            $state.go('app.doctortab.doctorform', {
                id: $scope.currentcontext.userid
            });
        }
        $scope.addNew = function () {
            $scope.addNewLineItem();
        }

        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.savedelItem();
        }

        $scope.deleteItem = function (idx, item) {
            var name = '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }
        $scope.savedelItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.savedelItem = function () {
            if (validateGrid()) {
                var lines = getLinesFordel();
                var options = {
                    action: 'SystemSettings/userdefaultservice/ManageUserDefaultService',
                    data: {
                        Data: lines
                    },
                    type: 'post',
                    onComplete: $scope.savedelItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function getLinesFordel() {
            var result = [];
            var lastIndex = vm.items.length - 1;

            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.ServiceItemId != -1 && item.Quantity) {
                    item.UserId = $scope.currentcontext.userid;
                    item.FacilityId = $scope.currentcontext.facilityid;
                    result.push(item);
                }
            }
            return result;
        }

        //Save Item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'SystemSettings/userdefaultservice/ManageUserDefaultService',
                    data: {
                        Data: lines
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
                if (idx == lastIndex && !item.Quantity) {
                    continue;
                } else if (item.ServiceItemId == -1 || !item.Quantity || item.PatientTypeId == -1 || !item.GuarantorTypeId == -1 ||
                    !item.EligibleDays) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            var lastIndex = vm.items.length - 1;

            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.ServiceItemId != -1 && item.Quantity && item.EligibleDays) {
                    item.UserId = $scope.currentcontext.userid;
                    item.FacilityId = $scope.currentcontext.facilityid;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.guarantorTypeChangeCallback = function (scope, data, options, hasError) {
            $scope.lookup.Guarantor = data.Guarantor;
        };

        $scope.guarantorTypeChange = function (item) {
            var inputData = [{
                Key: "Guarantor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: item.GuarantorTypeId
                    }]
                }
            }];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.guarantorTypeChangeCallback
            };
            utl.Http.doAction(options);
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
            {
                header: 'ServiceItem Rate',
                field: 'Rate',
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
                result = [selectedItem.Name + '(' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata.ServiceItem) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceItem.ItemCode, vm.serviceitemcontrolconfig.rowdata.ServiceItem.Name].join(' ');
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
                },],
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
                if (item.ServiceItemTariffDetails && item.ServiceItemTariffDetails.length > 0)
                    item.Rate = item.ServiceItemTariffDetails[0].Rate;

            }
        }

        $scope.ServiceItemChanged = function (idx, item) {
            item.Rate = item.SelectedItem.Rate;
        };

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "ServiceItem"
            },
            {
                "Key": "EncounterType"
            },
            {
                "Key": "VisitType"
            },
            {
                "Key": "DiscountMode"
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

    DoctorConsultChargesController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();