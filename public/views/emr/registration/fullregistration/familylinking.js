(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('familylinkingController', familylinkingController);

    function familylinkingController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        $scope.currentfilter = {
            name: ''
        };
        $scope.item = {
            MemberId: 0,
        };
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt($stateParams.id);
        $scope.item.PatientId = $scope.currentcontext.pid;


        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                PatientName: '',
                Age: 0,
                Gender: '',
                MRN: 0,
                NationalId: 0,
                Status: 1,
            };
            vm.items.push(lineItem);
        }
        // Patient autoSearch starts
        vm.patientconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Id',
                    field: 'MemberId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Patient Name',
                    field: 'PatientName',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'MRN',
                    field: 'MRN',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Age',
                    field: 'Age',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Gender',
                    field: 'Gender',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'NationalityId',
                    field: 'NationalityId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
            ],
            searchparams: {},
            result: {},
            api: 'registration/patient/GetPatients',
            formatdisplay: formatselectedtest,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedtest() {

            var selectedItem = vm.patientconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Title.Description + ' ' + selectedItem.FirstName];
            } else if (vm.patientconfig.rowdata) {
                result = [vm.patientconfig.rowdata.MemberId].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {

            var query = vm.patientconfig.query;

            var inputData = {
                Params: [{
                    Key: 7,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.patientconfig.searchbyid == true) {
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

            vm.patientconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.patientconfig.result) {
                var item = vm.patientconfig.result[idx];
                item.MemberId = item.Id;
                item.PatientName = item.Title.Description + ' ' + item.FirstName;
                item.Age = item.Age;
                item.MRN = item.MRN;
                item.Gender = item.Gender.Description;
                item.NationalityId = item.NationalityId;
            }
        }

        $scope.PatientChanged = function (idx, item) {
            var lastIndex = vm.items.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();

                console.log(item.SelectedItem);
                var Patientobj = item.SelectedItem;
                if (Patientobj != null) {
                    item.MemberId = Patientobj.Id;
                    item.PatientName = Patientobj.FirstName;
                    item.Age = Patientobj.Age;
                    item.Gender = Patientobj.Gender;
                    item.MRN = Patientobj.MRN;
                    item.NationalId = Patientobj.NationalityId;
                }
            }
        }
        // Patient autoSearch ends
        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.items = data;
            $scope.addNewLineItem();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.item.PatientId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/FamilyLink/GetFamilyLinks',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backTolist = function () {
            $state.go('app.fullregistrationtab.basic');
        }
        $scope.clear = function () {
            vm.items = [];
            $scope.addNewLineItem();
        };

        $scope.addNew = function () {
            $scope.addNewLineItem();
        };

        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.saveItem();
        };

        $scope.deleteItem = function (idx, item) {
            var name = item.PatientName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        //Save Item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'registration/FamilyLink/ManageFamilyLinks',
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
                if (idx == lastIndex && !item.PatientId) {
                    continue;
                } else if (!item.RelationshipId || item.RelationshipId == -1) {
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
                if (item.RelationshipId) {
                    item.PatientId = $scope.currentcontext.pid;
                    result.push(item);
                }
            }
            return result;
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Relationship"
            }, ];

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

    familylinkingController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();