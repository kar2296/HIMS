(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalItemDetailsReportController', OpticalItemDetailsReportController);

    function OpticalItemDetailsReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),

        };
        $scope.backtoReport = function () {
            $state.go('app.opticalreports')
        };
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Code", "Item Name", "Product Type", "Rate", "GST Percentage", "Hike", "Sales Price"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var name = '';
                var product = '';
                var rate = '';
                var gst = '';
                var hike = '';
                var sales = '';

                if (rowArray.ItemCode) {
                    code = rowArray.ItemCode;
                }
                if (rowArray.ItemName) {
                    name = rowArray.ItemName;
                }

                if (rowArray.OpticalProductType.Description) {
                    product = rowArray.OpticalProductType.Description;
                }
                if (rowArray.Rate) {
                    rate = rowArray.Rate;
                }
                if (rowArray.GSTPercentage) {
                    gst = rowArray.GSTPercentage;
                }
                if (rowArray.HikePercentage) {
                    hike = rowArray.HikePercentage;
                }
                if (rowArray.SalesPrice) {
                    sales = rowArray.SalesPrice;
                }
                csvContent += code + ',' + name + ',' + product + ',' + rate + ',' + gst + ',' + hike + ',' + sales + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'opticalitemdetailsreport.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentfilter.OpticalProductTypeId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.ItemCode
                    },
                ],

            };
            var options = {
                action: "Inventory/OpticalItemMaster/GetOpticalItemMasters",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentfilter.OpticalProductTypeId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.ItemCode
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/OpticalItemMaster/GetOpticalItemMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.getList();
            }
        };

        $scope.print = function () {
            var inputData = {
                Params: [{
                        Key: 0,
                        Value: $scope.currentfilter.TestId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.CategoryId
                    },
                ],
            };
            var options = {
                action: 'clinicalmaster/serviceitem/PrintTestMasterPrice',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Test Code',
                    field: 'ServiceCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Test Name',
                    field: 'ServiceName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
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
                }, ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            inputData.Params.push({
                Key: 8,
                Value: utl.Session.getCurrentFacilityId()
            });

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
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "ItemCode",
                    displayName: $translate.instant('inventory.opticalitemmaster.filter_itemcode.lbl')
                },
                {
                    field: "ItemName",
                    displayName: $translate.instant('inventory.opticalitemmaster.filter_itemname.lbl')
                },
                {
                    field: "OpticalProductType.Description",
                    displayName: $translate.instant('inventory.opticalitemmaster.filter_producttype.lbl')
                },
                {
                    field: "Rate",
                    displayName: $translate.instant('inventory.opticalitemmaster.rate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Rate | displaycurrency}}</span>" + "</div>"

                },
                {
                    field: "GSTPercentage",
                    displayName: $translate.instant('inventory.opticalitemmaster.gst.lbl')
                },
                {
                    field: "HikePercentage",
                    displayName: $translate.instant('inventory.opticalitemmaster.hike.lbl')
                },
                {
                    field: "SalesPrice",
                    displayName: $translate.instant('inventory.opticalitemmaster.salesprice.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.SalesPrice | displaycurrency}}</span>" + "</div>"

                },
                {
                    field: "Status",
                    displayName: $translate.instant('Status')
                },

            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

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
                    "Key": "OpticalProductType"
                },

                {
                    "Key": "ServiceCategory"
                },
            ]
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

    OpticalItemDetailsReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();