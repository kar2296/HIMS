(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientipdispensedetailsreportController', patientipdispensedetailsreportController);

    function patientipdispensedetailsreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.CanShowPrint = false;
        $scope.lookup = {};

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Dispense Date", "Dispense", "Patient Name", "MRN", "Ward", "Room  Bed", "Request Date", "Request", "Item Code", "Item Name", "Qty", "Batch", "Exp Date", "Gross Amt"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var dispenseDate = '';
                var dispense = '';
                var patientName = '';
                var mrn = '';
                var ward = '';
                var room = '';
                var requestDate = '';
                var request = '';
                var itemCode = '';
                var itemName = '';
                var qty = '';
                var batch = '';
                var expDate = '';
                var grossAmt = '';

                if (rowArray.PatientDispense.DispenseDateTime) {
                    // dispenseDate = rowArray.PatientDispense.DispenseDateTime;
                    dispenseDate = utl.Formatter.getDateTimeString(rowArray.PatientDispense.DispenseDateTime);
                }

                if (rowArray.PatientDispense.DispenseNumber) {
                    dispense = rowArray.PatientDispense.DispenseNumber;
                }
                if (rowArray.PatientDispense.Patient.Title) {
                    if (rowArray.PatientDispense.Patient.Title.Description) {
                        patientName = rowArray.PatientDispense.Patient.Title.Description;
                    }
                }

                if (rowArray.PatientDispense.Patient.FirstName) {
                    patientName += ' ' + rowArray.PatientDispense.Patient.FirstName;
                }
                if (rowArray.PatientDispense.Patient.LastName) {
                    patientName += ' ' + rowArray.PatientDispense.Patient.LastName;
                }
                if (rowArray.PatientDispense.Patient.MRN) {
                    patientName += ' ' + rowArray.PatientDispense.Patient.MRN;
                }
                if (rowArray.PatientDispense.Patient.MRN) {
                    mrn = rowArray.PatientDispense.Patient.MRN;
                }
                if (rowArray.PatientDispense.WardMaster) {
                    if (rowArray.PatientDispense.WardMaster.WardName) {
                        ward = rowArray.PatientDispense.WardMaster.WardName;
                    }
                }
                if (rowArray.PatientDispense.WardRoomMaster) {
                    if (rowArray.PatientDispense.WardRoomMaster.RoomNo) {
                        room = rowArray.PatientDispense.WardRoomMaster.RoomNo;
                    }
                }
                if (rowArray.PatientDispense.WardRoomBedMaster) {
                    if (rowArray.PatientDispense.WardRoomBedMaster.BedNo) {
                        room += ' ' + rowArray.PatientDispense.WardRoomBedMaster.BedNo;
                    }
                }
                if (rowArray.PatientStockRequestDetail) {
                    if (rowArray.PatientStockRequestDetail.PatientStockRequests) {
                        if (rowArray.PatientStockRequestDetail.PatientStockRequests.PatientRequestDateTime) {
                            // requestDate = rowArray.PatientStockRequestDetail.PatientStockRequests.PatientRequestDateTime;
                            requestDate = utl.Formatter.getDateTimeString(rowArray.PatientStockRequestDetail.PatientStockRequests.PatientRequestDateTime);
                        }
                    }

                    if (rowArray.PatientStockRequestDetail.PatientStockRequests.PatientRequestNumber) {
                        request = rowArray.PatientStockRequestDetail.PatientStockRequests.PatientRequestNumber;
                    }
                }
                if (rowArray.ItemCode) {
                    itemCode = rowArray.ItemCode;
                }
                if (rowArray.ItemName) {
                    itemName = rowArray.ItemName;
                }
                if (rowArray.DispensedQuantity) {
                    qty = rowArray.DispensedQuantity;
                }
                if (rowArray.BatchId) {
                    batch = rowArray.BatchId;
                }
                if (rowArray.ExpiryDate) {
                    expDate = rowArray.ExpiryDate;
                }
                if (rowArray.GrossAmount) {
                    grossAmt = rowArray.GrossAmount;
                }

                csvContent += dispenseDate + ',' + dispense + ',' + patientName + ',' + mrn + ',' + ward + ',' + room + ',' + requestDate + ',' + request + ',' + itemCode + ',' + itemName + ',' + qty + ',' + batch + ',' + expDate + ',' + grossAmt + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'patientipdispensedetails-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: From
                },
                {
                    Key: 5,
                    Value: To
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.StoreMasterId
                }
                ],

            };
            var options = {
                action: "billing/patientdispensedetails/GetPatientDispenseDetails",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };



        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalAmt = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = item.DispenseStore.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                if ($scope.currentfilter.WardId > 0) {
                    $scope.WardName = item.WardMaster.WardName;
                }
                else {
                    $scope.WardName = '';
                }
                if ($scope.currentfilter.PatientRequestStatusId > 0) {
                    $scope.Status = item.PatientRequestStatus.Description;
                }
                else {
                    $scope.Status = '';
                }
                totalAmt = totalAmt + (item.GrossAmount);

                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalAmt = totalAmt;

            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

    
        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: From
                },
                {
                    Key: 5,
                    Value: To
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.StoreMasterId
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/patientdispensedetails/GetPatientDispenseDetails',
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
            $state.go('app.pharmacytabreport.invoicecollectionreport')
        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    StoreName: $scope.StoreName,
                    WardName: $scope.WardName,
                    Status: $scope.Status

                },
                Params: [{
                    Key: 11,
                    Value: From
                },
                {
                    Key: 12,
                    Value: To
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 10,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.ToStoreId
                },
                ],
            };
            var options = {
                action: 'billing/patientdispensedetails/PrintPatientIPDispensesDetailsReport',
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
                field: "PatientDispense.DispenseDateTime",
                displayName: $translate.instant('Dispense Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientDispense.DispenseDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.PatientDispense.DispenseDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientDispense.DispenseNumber",
                displayName: $translate.instant('Dispense #')
            },
            {
                field: "Patient Name",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.PatientDispense.Patient.Title && entity.PatientDispense.Patient.Title.Description'>{{entity.PatientDispense.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.PatientDispense.Patient.FirstName}}</span>&nbsp;<span>{{entity.PatientDispense.Patient.LastName}}&nbsp/<span>{{entity.PatientDispense.Patient.MRN}}</span>\
                                        </div>"
            },
            {
                field: "PatientDispense.Patient.MRN",
                displayName: $translate.instant('MRN')
            },
            {
                field: "PatientDispense.WardMaster.WardName",
                displayName: $translate.instant('Ward')
            },
            {
                field: "PatientDispense.PatientDispense.",
                displayName: $translate.instant('Room / Bed'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ng-if='entity.PatientDispense.WardRoomMaster'>{{entity.PatientDispense.WardRoomMaster.RoomNo}} </span>" +
                    "<span ng-if='entity.PatientDispense.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.PatientDispense.WardRoomBedMaster'>{{entity.PatientDispense.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            {
                field: "PatientStockRequestDetail.PatientStockRequests.PatientRequestDateTime",
                displayName: $translate.instant('Request Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientStockRequestDetail.PatientStockRequests.PatientRequestDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.PatientStockRequestDetail.PatientStockRequests.PatientRequestDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientStockRequestDetail.PatientStockRequests.PatientRequestNumber",
                displayName: $translate.instant('Request #')
            },
            // {
            //     field: "Requested By",
            //     displayName: $translate.instant('Requested By'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'>\
            //                            <span ng-if='entity.PatientStockRequest.RequestedUser.Title && entity.PatientStockRequest.RequestedUser.Title.Description'>{{entity.PatientStockRequest.RequestedUser.Title.Description}}&nbsp;</span>\
            //                            <span>{{entity.PatientStockRequest.RequestedUser.FirstName}}</span>&nbsp;<span>{{entity.PatientStockRequest.RequestedUser.LastName}}\
            //                             </div>"
            // },
            {
                field: "ItemCode",
                displayName: $translate.instant('Item Code')
            },
            {
                field: "ItemName",
                displayName: $translate.instant('Item Name')
            },
            // {
            //     field: "Dispensed By",
            //     displayName: $translate.instant('Dispensed By'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'>\
            //                            <span ng-if='entity.DispensedUser.Title && entity.DispensedUser.Title.Description'>{{entity.DispensedUser.Title.Description}}&nbsp;</span>\
            //                            <span>{{entity.DispensedUser.FirstName}}</span>&nbsp;<span>{{entity.DispensedUser.LastName}}\
            //                             </div>"
            // },
            {
                field: "DispensedQuantity",
                displayName: $translate.instant('Qty')
            },
            {
                field: "BatchId",
                displayName: $translate.instant('Batch')
            },
            {
                field: "ExpiryDate",
                displayName: $translate.instant('Exp Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ExpiryDate | date : 'dd-MMM-yyyy'}} </span>" + "</div>"
            },
            {
                field: "GrossAmount",
                displayName: $translate.instant('Gross Amt')
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
            { "Key": "PatientRequestStatus" },
            { "Key": "ToStore" },
            { "Key": "Ward" },]
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

    patientipdispensedetailsreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();