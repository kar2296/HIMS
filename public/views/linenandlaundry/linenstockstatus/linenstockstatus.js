(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LinenStockStatusController', LinenStockStatusController);

    function LinenStockStatusController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            LinenItemMasterId: -1,
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
        };

        $scope.linendashboard = function () {
            $state.go('app.linendashboard');
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var TotalQty = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                TotalQty = TotalQty + res.Data[idx].Quantity;
                vm.gridConfig.data.push(item);
            }

            $scope.TotalQuantity = TotalQty;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.DepartmentId },
                    { Key: 2, Value: $scope.currentfilter.LinenItemMasterId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'LinenAndLaundry/LinenStockItems/GetLinenStockItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "Department.DepartmentName",
                displayName: $translate.instant('linenandlaundry.linenstockstatus.department.lbl')
            },
            {
                field: "LinenItemMaster.Code",
                displayName: $translate.instant('linenandlaundry.linenstockstatus.itemcode.lbl')
            },
            {
                field: "LinenItemMaster.Name",
                displayName: $translate.instant('linenandlaundry.linenstockstatus.itemname.lbl')
            },
            {
                field: "Quantity",
                displayName: $translate.instant('linenandlaundry.linenstockstatus.quantity.lbl')
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        //  LinenItemMaster Autosearch Start
        vm.linenitemmastercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'LinenItemMasterId', field: 'LinenItemMasterId', datatype: 'string', headercls: 'td-id', fieldcls: 'td-id' },
                { header: 'Code', field: 'LinenItemCode', datatype: 'string', headercls: 'td-name', fieldcls: 'td-code' },
                { header: 'Name', field: 'LinenItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-code' },

            ],
            searchparams: {},
            result: {},
            api: 'linenandlaundry/linenitemmaster/GetLinenItemMaster',
            formatdisplay: formatselectedlinenitemmaster,
            presearch: presearchlinenitemmaster,
            postsearch: postsearchbincode
        };

        function formatselectedlinenitemmaster() {
            var selectedItem = vm.linenitemmastercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.currentfilter.LinenItemMasterId = selectedItem.Id;
                $scope.currentfilter.LinenItemCode = selectedItem.Code;
                $scope.currentfilter.LinenItemName = selectedItem.Name;
                // $scope.item.Code = selectedItem.Name;
                result = [selectedItem.LinenItemName].join(' ');
            } else if (vm.linenitemmastercontrolconfig.rowdata) {
                result = [vm.linenitemmastercontrolconfig.rowdata.LinenItemName].join(' ');
            }
            return result;
        }


        function presearchlinenitemmaster() {
            var query = vm.linenitemmastercontrolconfig.query;
            var inputData = {
                Params: [{ Key: 6, Value: $scope.currentfilter.DepartmentId }],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.linenitemmastercontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.linenitemmastercontrolconfig.searchparams = inputData;
        }

        function postsearchbincode() {
            for (var idx in vm.linenitemmastercontrolconfig.result) {
                var item = vm.linenitemmastercontrolconfig.result[idx];
                item.LinenItemMasterId = item.Id;
                item.LinenItemCode = item.Code;
                item.LinenItemName = item.Name;
            }
        }

        // LinenItemMaster Autosearch End



        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility"
                },
                {
                    "Key": "Department"
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

    LinenStockStatusController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();