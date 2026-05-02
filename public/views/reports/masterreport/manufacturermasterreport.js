(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ManufacturerMasterReportController', ManufacturerMasterReportController);

    function ManufacturerMasterReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            ActiveStatusId: 2,

        };


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Supplier Code", "Supplier", "Supplier Type", "Distribution Type", "Mobile", "Supplier Address", "EMail", "City", "Contact Person"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var supplierCode = '';
                var supplier = '';
                var supplierType = '';
                var distribute = '';
                var mobile = '';
                var supplierAdd = '';
                var email = '';
                var city = '';
                var contact = '';

                if (rowArray.VendorCode) {
                    supplierCode = rowArray.VendorCode;
                }
                if (rowArray.VendorName) {
                    supplier = rowArray.VendorName;
                }
                if (rowArray.VendorType.Description) {
                    supplierType = rowArray.VendorType.Description;
                }
                if (rowArray.DistributionType) {
                    if (rowArray.DistributionType.Description) {
                        distribute = rowArray.DistributionType.Description;
                    }
                }
                if (rowArray.MobileNumber) {
                    mobile = rowArray.MobileNumber;
                }
                if (rowArray.AddressLine1) {
                    supplierAdd = rowArray.AddressLine1;
                }
                if (rowArray.AddressLine2) {
                    supplierAdd += ' ' + rowArray.AddressLine2;
                }
                if (rowArray.Pincode) {
                    supplierAdd += ' ' + rowArray.Pincode;
                }
                if (rowArray.EmailAddress) {
                    email = rowArray.EmailAddress;
                }
                if (rowArray.City) {
                    city = rowArray.City;
                }
                if (rowArray.ContactPerson) {
                    contact = rowArray.ContactPerson;
                }


                csvContent += supplierCode + ',' + supplier + ',' + supplierType + ',' + distribute + ',' + mobile + ',' + supplierAdd + ',' + email + ',' + city + ',' + contact + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'manufacturermaster-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    }
                ],

            };
            var options = {
                action: "pharmacy/vendormaster/GetVendorMasters",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            if ($scope.currentfilter.ActiveStatusId > 0) {
                $scope.ActiveStatus = res.Data[0].ActiveStatus.Description;
            } else {
                $scope.ActiveStatus = '';
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/vendormaster/GetVendorMasters',
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
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.masterreport')
        };

        $scope.print = function () {
            var inputData = {
                Data: {
                    ActiveStatus: $scope.ActiveStatus
                },
                Params: [
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                ],
            };
            var options = {
                action: 'pharmacy/vendormaster/PrintManufacturerMasterReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "VendorCode",
                displayName: $translate.instant('reports.suppliercode.lbl')
            },
            {
                field: "VendorName",
                displayName: $translate.instant('reports.vendorname.lbl')
            },
            {
                field: "VendorType.Description",
                displayName: $translate.instant('reports.suppliertype.lbl')

            },
            {
                field: "DistributionType.Description",
                displayName: $translate.instant('reports.distributiontype.lbl')
            },

            {
                field: "MobileNumber",
                displayName: $translate.instant('reports.mobnum.lbl')
            },
            {
                field: "VendorAddress",
                displayName: $translate.instant('reports.vendoraddress.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.AddressLine1'>{{entity.AddressLine1}}&nbsp;</span>\
                                       <span>{{entity.AddressLine2}}</span>&nbsp;<span>{{entity.Pincode}}</span>\
                                        </div>"

            },
            {
                field: "EmailAddress",
                displayName: $translate.instant('reports.email.lbl')
            },
            {
                field: "City",
                displayName: $translate.instant('reports.city.lbl')
            },
            {
                field: "ContactPerson",
                displayName: $translate.instant('reports.contactperson.lbl')
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
            // $scope.getList();
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
            { "Key": "ActiveStatus" },
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

    ManufacturerMasterReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();