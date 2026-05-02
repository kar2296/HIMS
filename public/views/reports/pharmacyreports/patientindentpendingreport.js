(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientindentpendingreportController', patientindentpendingreportController);

    function patientindentpendingreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            ToStoreId: -1,
            WardId: -1
        };
        $scope.CanShowPrint = false;
        $scope.lookup = {};

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Request Date", "Indent", "Patient Name", "MRN", "Ward", "Room and Bed", "Created By", "To Pharmacy", "Item Code", "Item Name", "Qty"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var reqDate = '';
                var indent = '';
                var patName = '';
                var mrn = '';
                var ward = '';
                var room = '';
                var createdBy = '';
                var toPharma = '';
                var itemCode = '';
                var itemName = '';
                var qty = '';

                if (rowArray.PatientStockRequests.PatientRequestDateTime) {
                    // reqDate = rowArray.PatientStockRequests.PatientRequestDateTime;
                    reqDate = utl.Formatter.getDateTimeString(rowArray.PatientStockRequests.PatientRequestDateTime);
                }
                if (rowArray.PatientStockRequests.PatientRequestNumber) {
                    indent = rowArray.PatientStockRequests.PatientRequestNumber;
                }
                if (rowArray.PatientStockRequests.Patient) {
                    if (rowArray.PatientStockRequests.Patient.Title.Description) {
                        patName = rowArray.PatientStockRequests.Patient.Title.Description;
                    }
                }
                if (rowArray.PatientStockRequests.Patient.FirstName) {
                    patName += ' ' + rowArray.PatientStockRequests.Patient.FirstName;
                }
                if (rowArray.PatientStockRequests.Patient.LastName) {
                    patName += ' ' + rowArray.PatientStockRequests.Patient.LastName;
                }

                if (rowArray.PatientStockRequests.Patient.MRN) {
                    mrn = rowArray.PatientStockRequests.Patient.MRN;
                }
                if (rowArray.PatientStockRequests.WardMaster) {
                    if (rowArray.PatientStockRequests.WardMaster.WardName) {
                        ward = rowArray.PatientStockRequests.WardMaster.WardName;
                    }
                }
                if (rowArray.PatientStockRequests.WardRoomMaster) {
                    if (rowArray.PatientStockRequests.WardRoomMaster.RoomNo) {
                        room = rowArray.PatientStockRequests.WardRoomMaster.RoomNo;
                    }
                }
                if (rowArray.PatientStockRequests.WardRoomBedMaster) {
                    if (rowArray.PatientStockRequests.WardRoomBedMaster.BedNo) {
                        room += ' ' + rowArray.PatientStockRequests.WardRoomBedMaster.BedNo;
                    }
                }
                if (rowArray.CreatedUser.Title) {
                    if (rowArray.CreatedUser.Title.Description) {
                        createdBy = rowArray.CreatedUser.Title.Description;
                    }
                }
                if (rowArray.CreatedUser.FirstName) {
                    createdBy += ' ' + rowArray.CreatedUser.FirstName;
                }
                if (rowArray.CreatedUser.LastName) {
                    createdBy += ' ' + rowArray.CreatedUser.LastName;
                }
                if (rowArray.PatientStockRequests.ToStore) {
                    if (rowArray.PatientStockRequests.ToStore.StoreName) {
                        toPharma = rowArray.PatientStockRequests.ToStore.StoreName;
                    }
                }
                if (rowArray.ItemMaster.ItemCode) {
                    itemCode = rowArray.ItemMaster.ItemCode;
                }
                if (rowArray.ItemMaster.ItemName) {
                    itemName = rowArray.ItemMaster.ItemName;
                }
                if (rowArray.RequestedQuantity) {
                    qty = rowArray.RequestedQuantity;
                }

                csvContent += reqDate + ',' + indent + ',' + patName + ',' + mrn + ',' + ward + ',' + room + ',' + createdBy + ',' + toPharma + ',' + itemCode + ',' + itemName + ',' + qty + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'patientindentpending-report.csv';
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
                    Key: 9,
                    Value: From
                },
                {
                    Key: 10,
                    Value: To
                },
                {
                    Key: 12,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 13,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.ToStoreId
                },
                {
                    Key: 11,
                    Value: 2
                }
                ],

            };
            var options = {
                action: "InPatient/patientstockrequestdetails/GetPatientStockRequestDetails",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalbillamount = 0;
            var totalgst = 0;
            var totalcgst = 0;
            var totalsgst = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.ToStoreId > 0) {
                    $scope.StoreName = item.PatientStockRequests.ToStore.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                if ($scope.currentfilter.WardId > 0) {
                    $scope.WardName = item.PatientStockRequests.WardMaster.WardName;
                }
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
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
                    Key: 9,
                    Value: From
                },
                {
                    Key: 10,
                    Value: To
                },
                {
                    Key: 12,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 13,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.ToStoreId
                },
                {
                    Key: 11,
                    Value: 2
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/patientstockrequestdetails/GetPatientStockRequestDetails',
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
                    FacilityId: $scope.currentfilter.FacilityId,
                    StoreName: $scope.StoreName,
                    ToStoreId: $scope.currentfilter.ToStoreId,
                    WardName: $scope.WardName,
                    Status: $scope.Status

                },
                Params: [{
                    Key: 9,
                    Value: From
                },
                {
                    Key: 10,
                    Value: To
                },
                {
                    Key: 12,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 13,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.ToStoreId
                },
                {
                    Key: 11,
                    Value: 2
                },
                ],
            };
            var options = {
                action: 'IPManagement/patientstockrequestdetails/PrintPatientIndentPendingReport',
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
                field: "PatientStockRequests.PatientRequestDateTime",
                displayName: $translate.instant('Request Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientStockRequests.PatientRequestDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.PatientStockRequests.PatientRequestDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientStockRequests.PatientRequestNumber",
                displayName: $translate.instant('Indent #')
            },
            {
                field: "Patient Name",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.PatientStockRequests.Patient.Title && entity.PatientStockRequests.Patient.Title.Description'>{{entity.PatientStockRequests.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.PatientStockRequests.Patient.FirstName}}</span>&nbsp;<span>{{entity.PatientStockRequests.Patient.LastName}}&nbsp\
                                        </div>"
            },
            {
                field: "PatientStockRequests.Patient.MRN",
                displayName: $translate.instant('MRN')
            },
            {
                field: "PatientStockRequests.WardMaster.WardName",
                displayName: $translate.instant('Ward')
            },
            {
                field: "WardRoomMaster",
                displayName: $translate.instant('Room / Bed'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ng-if='entity.PatientStockRequests.WardRoomMaster'>{{entity.PatientStockRequests.WardRoomMaster.RoomNo}} </span>" +
                    "<span ng-if='entity.PatientStockRequests.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.PatientStockRequests.WardRoomBedMaster'>{{entity.PatientStockRequests.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            {
                field: "Created By",
                displayName: $translate.instant('Created By'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.CreatedUser.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}\
                                        </div>"
            },
            {
                field: "PatientStockRequests.ToStore.StoreName",
                displayName: $translate.instant('To Pharmacy')
            },
            {
                field: "ItemMaster.ItemCode",
                displayName: $translate.instant('Item Code')
            },
            {
                field: "ItemMaster.ItemName",
                displayName: $translate.instant('Item Name')
            },
            {
                field: "RequestedQuantity",
                displayName: $translate.instant('Qty')
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

    patientindentpendingreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();