(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceCategoryListController', serviceCategoryListController);

    function serviceCategoryListController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        $scope.Items = [];
        $scope.item = {}
        $scope.currentfilter = {
            Name: '',
            FacilityId: [-1, utl.Session.getCurrentFacilityId()],
            SourceTypeId: 1,
            ServiceGroupId: -1,
            ActiveStatusId: true
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
                    Key: 1,
                    Value: $scope.currentfilter.Name
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.SourceTypeId
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.ServiceGroupId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.StatusId
                }
                ],
                PageContext: {
                    PageSize: 400,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/servicecategory/GetServiceCategorys',
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
            var name = item.ServiceCategoryName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
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
                    action: 'clinicalmaster/servicecategory/ManageSerivceCategories',
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
                if (idx == lastIndex && !item.ServiceCategoryCode && !item.ServiceCategoryName) {
                    continue;
                } else if (!item.ServiceCategoryCode || !item.ServiceCategoryName) {
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
                if (item.ServiceCategoryCode && item.ServiceCategoryName) {
                    if (item.IsAllFacility == true) {
                        item.FacilityId = -1;
                    }
                    if (item.IsAllFacility == false) {
                        item.FacilityId = utl.Session.getCurrentFacilityId();
                    }
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
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },
            {
                "Key": "SourceType"
            },
            {
                "Key": "OrderMasterStatus"
            },
            {
                "Key": "ServiceGroup"
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

    serviceCategoryListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();