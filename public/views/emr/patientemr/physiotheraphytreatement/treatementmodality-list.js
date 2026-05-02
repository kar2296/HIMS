(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('TreatementModalityListController', TreatementModalityListController);

    function TreatementModalityListController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        $scope.Items = [];
        $scope.item = {}
        $scope.currentfilter = {
            Name: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            CreatedBy: utl.Session.getCurrentUserId(),
            IsActive: true,
            ActiveStatusId: 2
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                FacilityId: utl.Session.getCurrentFacilityId(),
                Status: 1,
                ModalityName: '',
                IsActive: true
            };

            vm.items.push(lineItem);
            $scope.setIndexforTableIndex();
        }
        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data;
            $scope.addNewLineItem();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    // {
                    //     Key: 1,
                    //     Value: $scope.currentfilter.ModalityName
                    // },

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/TreatementModality/GetTreatementModalitys',
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

        $scope.Save = function () {
            $scope.item.ActiveStatusId = 2;
            $scope.saveItem();
        };
        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.saveItem();
        }

        $scope.deleteItem = function (idx, item) {
            var name = item.ModalityName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }


        // $scope.deleteItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        //     $scope.getList();
        // };
        // $scope.deleteItem = function (idx, item) {
        //     var options = {
        //         action: 'emr/TreatementModality/DeleteTreatementModality',
        //         data: { Id: deleteId },
        //         type: 'post',
        //         onComplete: $scope.deleteItemCallback
        //     };
        //     utl.Http.doAction(options);
        // };


        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in vm.items) {
                if (vm.items[idx].Status == 1) {
                    vm.items[idx].SNo = SNo;
                    vm.items[idx].itemidxdesc = 'desc' + idx;
                    SNo++;
                }
            }
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
                    action: 'emr/TreatementModality/ManageTreatementModality',
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
                if (idx == lastIndex && !item.ModalityName) {
                    continue;
                } else if (item.FacilityId == -1 || !item.ModalityName) {
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
                if (item.ModalityName) {
                    result.push(item);
                }
            }
            return result;
        }

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility"
                },
                {
                    "Key": "ActiveStatus"
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

    TreatementModalityListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();