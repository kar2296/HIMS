(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabTestMasterPriceController', LabTestMasterPriceController);

    function LabTestMasterPriceController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),

        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var servicedata = res.Data[idx];
                if (servicedata.ServiceItemTariffDetails.length > 0) {
                    var Tariff = servicedata.ServiceItemTariffDetails[0];
                    servicedata.Price = Tariff.Rate;
                    vm.gridConfig.data.push(servicedata);
                }
            }
            //             vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentfilter.TestId },
                    { Key: 3, Value: $scope.currentfilter.CategoryId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/serviceitem/GetServiceItems',
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
                Params: [
                    { Key: 0, Value: $scope.currentfilter.TestId },
                    { Key: 3, Value: $scope.currentfilter.CategoryId },
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
                },],
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
                field: "SNo",
                displayName: $translate.instant('reports.snum.lbl')
            },
            {
                field: "ItemCode",
                displayName: $translate.instant('reports.testcode.lbl')
            },
            {
                field: "Name",
                displayName: $translate.instant('reports.testname.lbl')

            },
            {
                field: "ParentCategory.ServiceCategoryName",
                displayName: $translate.instant('reports.cat.lbl')
            },

            {
                field: "Price",
                displayName: $translate.instant('reports.price.lbl')
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
            { "Key": "ServiceCategory" },
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

    LabTestMasterPriceController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();