(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientipdispensedreportController', patientipdispensedreportController);

    function patientipdispensedreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Dispense Date", "Dispense", "Patient Name", "MRN", "Ward", "Room  Bed", "Request Date", "Request", "Requested By", "Store Name", "Dispensed By", "Gross Amt"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var dispenseDate = '';
                var diapense = '';
                var patienName = '';
                var mrn = '';
                var ward = '';
                var roomBed = '';
                var reqDate = '';
                var request = '';
                var reqBy = '';
                var storeName = '';
                var dispenseBy = '';
                var grossAmt = '';

                if (rowArray.DispenseDateTime) {
                    // dispenseDate = rowArray.DispenseDateTime;
                    dispenseDate = utl.Formatter.getDateTimeString(rowArray.DispenseDateTime);
                }

                if (rowArray.DispenseNumber) {
                    diapense = rowArray.DispenseNumber;
                }
                if (rowArray.Patient.Title) {
                    if (rowArray.Patient.Title.Description) {
                        patienName = rowArray.Patient.Title.Description;
                    }
                }

                if (rowArray.Patient.FirstName) {
                    patienName += ' ' + rowArray.Patient.FirstName;
                }
                if (rowArray.Patient.LastName) {
                    patienName += ' ' + rowArray.Patient.LastName;
                }
                if (rowArray.Patient.MRN) {
                    mrn = rowArray.Patient.MRN;
                }
                if (rowArray.WardMaster) {
                    if (rowArray.WardMaster.WardName) {
                        ward = rowArray.WardMaster.WardName;
                    }
                }
                if (rowArray.WardRoomMaster) {
                    if (rowArray.WardRoomMaster.RoomNo) {
                        roomBed = rowArray.WardRoomMaster.RoomNo;
                    }
                }
                if (rowArray.WardRoomBedMaster) {
                    if (rowArray.WardRoomBedMaster.BedNo) {
                        roomBed += ' ' + rowArray.WardRoomBedMaster.BedNo;
                    }
                }
                if (rowArray.PatientStockRequest) {
                    if (rowArray.PatientStockRequest.PatientRequestDateTime) {
                        // reqDate = rowArray.PatientStockRequest.PatientRequestDateTime;
                        reqDate = utl.Formatter.getDateTimeString(rowArray.PatientStockRequest.PatientRequestDateTime);
                    }
                }
                if (rowArray.PatientStockRequest) {
                    if (rowArray.PatientStockRequest.PatientRequestNumber) {
                        request = rowArray.PatientStockRequest.PatientRequestNumber;
                    }
                }
                if (rowArray.PatientStockRequest) {
                    if (rowArray.PatientStockRequest.RequestedUser.Title) {
                        if (rowArray.PatientStockRequest.RequestedUser.Title.Description) {
                            reqBy = rowArray.PatientStockRequest.RequestedUser.Title.Description;
                        }
                    }
                    if (rowArray.PatientStockRequest.RequestedUser.FirstName) {
                        reqBy += ' ' + rowArray.PatientStockRequest.RequestedUser.FirstName;
                    }
                    if (rowArray.PatientStockRequest.RequestedUser.LastName) {
                        reqBy += ' ' + rowArray.PatientStockRequest.RequestedUser.LastName;
                    }
                }
                if (rowArray.DispenseStore.StoreName) {
                    storeName = rowArray.DispenseStore.StoreName;
                }
                if (rowArray.DispensedUser.Title) {
                    if (rowArray.DispensedUser.Title.Description) {
                        dispenseBy = rowArray.DispensedUser.Title.Description;
                    }
                }
                if (rowArray.DispensedUser.FirstName) {
                    dispenseBy += ' ' + rowArray.DispensedUser.FirstName;
                }
                if (rowArray.DispensedUser.LastName) {
                    dispenseBy += ' ' + rowArray.DispensedUser.LastName;
                }
                if (rowArray.TotalGrossAmount) {
                    grossAmt = rowArray.TotalGrossAmount;
                }


                csvContent += dispenseDate + ',' + diapense + ',' + patienName + ',' + mrn + ',' + ward + ',' + roomBed + ',' + reqDate + ',' + request + ',' + reqBy + ',' + storeName + ',' + dispenseBy + ',' + grossAmt + "\n";
            });
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'patientipdispensed-report.csv';
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
                    Value: $scope.currentfilter.StoreMasterId
                }
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };
            var options = {
                action: "billing/patientdispense/GetPatientDispenses",
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
                } else {
                    $scope.WardName = '';
                }
                if ($scope.currentfilter.PatientRequestStatusId > 0) {
                    $scope.Status = item.PatientRequestStatus.Description;
                } else {
                    $scope.Status = '';
                }
                totalAmt = totalAmt + (item.TotalGrossAmount);

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
                    Value: $scope.currentfilter.StoreMasterId
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/patientdispense/GetPatientDispenses',
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
            if ($scope.Context == 'invoicecollectionreport') {
                $state.go('app.pharmacytabreport.invoicecollectionreport');
            } 
            if ($scope.Context == 'financedashboard') {
                $state.go('app.financedashboard');
            }

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
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/patientdispense/PrintPatientIPDispensesReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx",
                displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "DispenseDateTime",
                displayName: $translate.instant('Dispense Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DispenseDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DispenseDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "DispenseNumber",
                displayName: $translate.instant('Dispense #')
            },
            {
                field: "Patient Name",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}&nbsp/<span>{{entity.Patient.MRN}}</span>\
                                        </div>"
            },
            {
                field: "Patient.MRN",
                displayName: $translate.instant('MRN')
            },
            {
                field: "WardMaster.WardName",
                displayName: $translate.instant('Ward')
            },
            {
                field: "WardRoomMaster",
                displayName: $translate.instant('Room / Bed'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}} </span>" +
                    "<span ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            {
                field: "PatientStockRequest.PatientRequestDateTime",
                displayName: $translate.instant('Request Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientStockRequest.PatientRequestDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.PatientStockRequest.PatientRequestDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientStockRequest.PatientRequestNumber",
                displayName: $translate.instant('Request #')
            },
            {
                field: "Requested By",
                displayName: $translate.instant('Requested By'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.PatientStockRequest.RequestedUser.Title && entity.PatientStockRequest.RequestedUser.Title.Description'>{{entity.PatientStockRequest.RequestedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.PatientStockRequest.RequestedUser.FirstName}}</span>&nbsp;<span>{{entity.PatientStockRequest.RequestedUser.LastName}}\
                                        </div>"
            },
            {
                field: "DispenseStore.StoreName",
                displayName: $translate.instant('Store Name')
            },
            {
                field: "Dispensed By",
                displayName: $translate.instant('Dispensed By'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.DispensedUser.Title && entity.DispensedUser.Title.Description'>{{entity.DispensedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.DispensedUser.FirstName}}</span>&nbsp;<span>{{entity.DispensedUser.LastName}}\
                                        </div>"
            },
            {
                field: "TotalGrossAmount",
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
            {
                "Key": "PatientRequestStatus"
            },
            {
                "Key": "ToStore"
            },
            {
                "Key": "Ward"
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

    patientipdispensedreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();