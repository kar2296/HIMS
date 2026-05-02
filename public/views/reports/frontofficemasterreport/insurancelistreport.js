(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('InsuranceListReportController', InsuranceListReportController);

    function InsuranceListReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.lookup = {};
        $scope.GuarantorTypelookup = [];


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Code", "Payer Name", "Type", "Contract Date", "Contract Expiry Date", "Credit Limit", "Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var insurance = '';
                var type = '';
                var contract = '';
                var expDate = '';
                var credit = '';
                var status = '';

                if (rowArray.Code) {
                    code = rowArray.Code;
                }
                if (rowArray.GuarantorName) {
                    insurance = rowArray.GuarantorName;
                }
                if (rowArray.GuarantorType.Description) {
                    type = rowArray.GuarantorType.Description;
                }
                if (rowArray.ContractDate) {
                    contract = rowArray.ContractDate;
                }
                if (rowArray.AdmissionDate) {
                    contract += ' ' + rowArray.AdmissionDate;
                }
                if (rowArray.ContractExpiryDate) {
                    expDate = rowArray.ContractExpiryDate;
                }
                if (rowArray.AdmissionDate) {
                    expDate += ' ' + rowArray.AdmissionDate;
                }
                if (rowArray.CreditLimit) {
                    credit = rowArray.CreditLimit;
                }

                if (rowArray.ActiveStatus.Description) {
                    status = rowArray.ActiveStatus.Description;
                }

                csvContent += code + ',' + insurance + ',' + type + ',' + contract + ',' + expDate + ',' + credit + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'insurancelist-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [
                    {
                        Key: 7,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 2,
                        Value: [2, 3, 4, 5]
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    }
                ],

            };
            var options = {
                action: "generalmaster/guarantor/GetGuarantors",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            if ($scope.currentfilter.GuarantorTypeId > 0) {
                $scope.GuarantorType = res.Data[0].GuarantorType.Description;
            }
            else {
                $scope.GuarantorType = '';
            }
            if ($scope.currentfilter.ActiveStatusId > 0) {
                $scope.ActiveStatus = res.Data[0].ActiveStatus.Description;
            }
            else {
                $scope.ActiveStatus = '';
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    {
                        Key: 7,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 2,
                        Value: [2, 3, 4, 5]
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                ],

                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.GuarantorTypeId > 0) {
                inputData.Params.push({
                    Key: 2,
                    Value: $scope.currentfilter.GuarantorTypeId
                })
            }
            if ($scope.currentfilter.ContractExpiryDate) {
                var FrmDate = $filter('date')($scope.currentfilter.ContractExpiryDate, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.ContractExpiryDate, 'yyyy-MM-dd 23:59:59') || null;
                inputData.Params.push({
                    Key: 8,
                    Value: [FrmDate, ToDate]
                })
            }
            var options = {
                action: 'generalmaster/guarantor/GetGuarantors',
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
            $state.go('app.ipopreportstab.masterreport')
        };

        $scope.print = function () {
            var inputData = {
                Data: {
                    FacilityName: $scope.currentfilter.FacilityName,
                    GuarantorType: $scope.GuarantorType,
                    ActiveStatus: $scope.ActiveStatus,
                },
                Params: [
                    {
                        Key: 7,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 2,
                        Value: [2, 3, 4, 5]
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                ],
            };
            if ($scope.currentfilter.GuarantorTypeId > 0) {
                inputData.Params.push({
                    Key: 2,
                    Value: $scope.currentfilter.GuarantorTypeId
                })
            }
            var options = {
                action: 'generalmaster/guarantor/PrintInsuranceListReport',
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
                field: "Code",
                displayName: $translate.instant('reports.code.lbl')
            },
            {
                field: "GuarantorName",
                displayName: $translate.instant('reports.insurance.lbl')
            },
            {
                field: "GuarantorType.Description",
                displayName: $translate.instant('reports.type.lbl')
            },
            {
                field: "ContractDate",
                displayName: $translate.instant('reports.contractdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ContractDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },

            {
                field: "ContractExpiryDate",
                displayName: $translate.instant('reports.contractexpdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ContractExpiryDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "CreditLimit",
                displayName: $translate.instant('reports.creditlimit.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreditLimit}} </span> </div>"
            },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('reports.activestatus.lbl')
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
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'GuarantorType') {
                    for (var usidx in $scope.lookup.GuarantorType) {
                        if ($scope.lookup.GuarantorType[usidx].Text != 'SELF') {
                            $scope.GuarantorTypelookup.push($scope.lookup.GuarantorType[usidx]);
                        }
                    }
                }
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
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
            { 'Key': 'GuarantorType' },
            { 'Key': 'ActiveStatus' }]
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

    InsuranceListReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();