(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('EscalationMatrixController', EscalationMatrixController);

    function EscalationMatrixController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.Items = [];
        $scope.item = {}
        $scope.currentfilter = {
            OffSet: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            UnitId: -1,
            AnchorId: -1,
            HelpdeskStatusId: -1,
            EscalationStatusId:-1,
            //ActiveStatusId: true
        };

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                OffSet: '',
                FacilityId: utl.Session.getCurrentFacilityId(),
                Status: 1,
                Level: 0,
                UnitId: 0,
                AnchorId: 0,
                HelpdeskStatusId: 0,
                NotificationTypeId: 0,
                NotificationToId: 0,
            };

            vm.items.push(lineItem);
            $scope.setIndexforTableIndex();
        }

        $scope.setIndexforTableIndex = function () {
            var Level = 1;
            for (var idx in vm.items) {
                if (vm.items[idx].Status == 1) {
                    vm.items[idx].Level = Level;
                    vm.items[idx].itemidxdesc = 'desc' + (Level - 1);
                    Level++;
                }
            }
        };
        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data;
            $scope.addNewLineItem();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    // { Key: 1, Value: $scope.currentfilter.Name }
                ],
                PageContext: {
                    PageSize: 400,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'AssetManagement/EscalationMatrix/GetEscalationMatrixs',
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

        $scope.addNew = function () {
            $scope.addNewLineItem();
        }

        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.saveItem();
        }

        $scope.deleteItem = function (idx, item) {
            var name = item.NotificationToId || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }
        $scope.Asset_dashboard = function () {
            $state.go('app.newassetdashboard')
        };

        //Save Item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            // if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'AssetManagement/EscalationMatrix/ManageEscalationMatrix',
                    data: { Data: lines },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
           // }
        };

        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [
                { search: 1, fields: ['Status'] }
            ]);

            var lastIndex = activeRecords.length - 1;
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (idx == lastIndex && !item.OffSet && !item.NotificationToId) {
                    continue;
                } else if (item.FacilityId == -1 || !item.OffSet || !item.NotificationToId) {
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
                if (item.OffSet && item.NotificationToId) {
                    result.push(item);
                }
            }
            return result;
        }

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
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
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    { Key: 5, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {"Key": "Company" },
                { "Key": "EscalationMatrixNotificationType", Default: false },
                { "Key": "EscalationMatrixUnit" },
                { "Key": "EscalationMatrixAnchor" },
                { "Key": "AssetTicketStatus" }
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

    EscalationMatrixController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();