(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceItemPackageMapListController', serviceItemPackageMapListController);

    function serviceItemPackageMapListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentcontext.serviceitemid = parseInt($stateParams.id);

        $scope.addNewLineItem = function() {
            var lineItem = {
                Id: 0,
                Status: 1,
                Quantity: 1,
                StatusId: true
            };
            vm.items.push(lineItem);
        }

        // ServiceItem autoSearch starts
        vm.serviceitemconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'Name', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Department', field: 'Department', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
                { header: 'Price', field: 'ItemCost', datatype: 'string', headercls: 'td-price', fieldcls: 'td-price' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/serviceitem/GetServiceItems',
            formatdisplay: formatselectedtest,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedtest() {

            var selectedItem = vm.serviceitemconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Name + '(' + selectedItem.ItemCode + ')'].join('  ');
            } else if (vm.serviceitemconfig.rowdata) {
                result = [vm.serviceitemconfig.rowdata.ServiceCode, vm.serviceitemconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {

            var query = vm.serviceitemconfig.query;

            var inputData = {
                Params: [
                    { Key: 4, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.serviceitemconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.serviceitemconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemconfig.result) {
                var item = vm.serviceitemconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                item.Department = item.Department.DepartmentName;
            }
        }

        $scope.serviceItemChanged = function(idx, item) {
                var lastIndex = vm.items.length - 1;
                if (idx == lastIndex) {
                    $scope.addNewLineItem();

                    console.log(item.SelectedItem);
                    var Serviceobj = item.SelectedItem;
                    if (Serviceobj != null) {
                        item.ServiceCode = Serviceobj.ItemCode;
                        item.ServiceName = Serviceobj.Name;
                    }
                }
            }
            // ServiceItem autoSearch ends

        //getlist
        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.items = res.Data;
            $scope.addNewLineItem();
        };

        $scope.getList = function() {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.serviceitemid }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/serviceitempackagemap/GetServiceItemPackageMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.clear = function() {
            vm.items = [];
            $scope.addNewLineItem();
        }
        $scope.backToList = function() {
            $state.go('app.serviceitemtab.details', { id: $scope.currentcontext.serviceitemid });
        }
        $scope.back = function() {
            $state.go('app.serviceitems', { id: $scope.currentcontext.serviceitemid });
        }
        $scope.addNew = function() {
            $scope.addNewLineItem();
        }

        //deleteLineItem
        $scope.onDeleteConfirmed = function(item) {
            item.Status = 2;
            $scope.saveItem();
        }

        $scope.deleteItem = function(idx, item) {
            var name = item.AliasName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }

        //Save Item
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function() {
            if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'clinicalmaster/serviceitempackagemap/ManageSerivceItemPackageMap',
                    data: { Data: lines },
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

            //var lastIndex = activeRecords.length-1;
            //for(var idx in activeRecords) {
            //    var item = activeRecords[idx];
            //    if(idx == lastIndex && !item.AliasId && !item.AliasName) {
            //        continue;
            //    }
            //    else if(item.FacilityId == -1 || item.ExternalProviderId == -1 || !item.AliasId || !item.AliasName) {
            //        utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
            //        return false;
            //    }
            //}
            return true;
        }

        function getLinesForSave() {
            var result = [];
            var lastIndex = vm.items.length - 1;

            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.ServiceId) {
                    item.ServiceItemId = $scope.currentcontext.serviceitemid;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.computeNetAmount = function(item) {
                if (item.Quantity && item.Amount) {
                    item.NetAmount = item.Quantity * item.Amount;
                }
            }
            //lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "TestMaster" },
                { "Key": "ServiceItemDiscountType" }
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

    serviceItemPackageMapListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();