(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientmedicineindentreportController', patientmedicineindentreportController);

    function patientmedicineindentreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Request Date", "Indent", "Patient Name", "MRN", "Ward", "Room and Bed", "Created By", "To Pharmacy", "Approved By", "Status"]
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
                var approved = '';
                var status = '';

                if (rowArray.PatientRequestDateTime) {
                    // reqDate = rowArray.PatientRequestDateTime;
                    reqDate = utl.Formatter.getDateTimeString(rowArray.PatientRequestDateTime);
                }
                if (rowArray.PatientRequestNumber) {
                    indent = rowArray.PatientRequestNumber;
                }
                if (rowArray.Patient.Title) {
                    if (rowArray.Patient.Title.Description) {
                        patName = rowArray.Patient.Title.Description;
                    }
                }
                if (rowArray.Patient.FirstName) {
                    patName += ' ' + rowArray.Patient.FirstName;
                }
                if (rowArray.Patient.LastName) {
                    patName += ' ' + rowArray.Patient.LastName;
                }
                if (rowArray.Patient.MRN) {
                    patName += ' ' + rowArray.Patient.MRN;
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
                        room = rowArray.WardRoomMaster.RoomNo;
                    }
                }
                if (rowArray.WardRoomBedMaster) {
                    if (rowArray.WardRoomBedMaster.BedNo) {
                        room += ' ' + rowArray.WardRoomBedMaster.BedNo;
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
                if (rowArray.ToStore) {
                    if (rowArray.ToStore.StoreName) {
                        toPharma = rowArray.ToStore.StoreName;
                    }
                }
                if (rowArray.ApprovedUser.Title) {
                    if (rowArray.ApprovedUser.Title.Description) {
                        approved = rowArray.ApprovedUser.Title.Description;
                    }
                }
                if (rowArray.ApprovedUser.FirstName) {
                    approved += ' ' + rowArray.ApprovedUser.FirstName;
                }
                if (rowArray.ApprovedUser.LastName) {
                    approved += ' ' + rowArray.ApprovedUser.LastName;
                }
                if (rowArray.PatientRequestStatus) {
                    if (rowArray.PatientRequestStatus.Description) {
                        status = rowArray.PatientRequestStatus.Description;
                    }
                }

                csvContent += reqDate + ',' + indent + ',' + patName + ',' + mrn + ',' + ward + ',' + room + ',' + createdBy + ',' + toPharma + ',' + approved + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'patientmedicineindent-report.csv';
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
                    Key: 14,
                    Value: From
                },
                {
                    Key: 15,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.ToStoreId
                },
                {
                    Key: 21,
                    Value: $scope.currentfilter.PatientRequestStatusId
                }
                ],

            };
            var options = {
                action: "InPatient/patientstockrequests/GetPatientStockRequests",
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
                    $scope.StoreName = item.ToStore.StoreName;
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
                    Key: 14,
                    Value: From
                },
                {
                    Key: 15,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.ToStoreId
                },
                {
                    Key: 21,
                    Value: $scope.currentfilter.PatientRequestStatusId
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/patientstockrequests/GetPatientStockRequests',
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
                    Key: 14,
                    Value: From
                },
                {
                    Key: 15,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.ToStoreId
                },
                {
                    Key: 21,
                    Value: $scope.currentfilter.PatientRequestStatusId
                },
                ],
            };
            var options = {
                action: 'IPManagement/patientstockrequests/PrintPatientMedicineReport',
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
                field: "PatientRequestDateTime",
                displayName: $translate.instant('Request Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientRequestDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.PatientRequestDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientRequestNumber",
                displayName: $translate.instant('Indent #')
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
                field: "Created By",
                displayName: $translate.instant('Created By'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.CreatedUser.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}\
                                        </div>"
            },
            {
                field: "ToStore.StoreName",
                displayName: $translate.instant('To Pharmacy')
            },
            {
                field: "Approved By",
                displayName: $translate.instant('Approved By'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.ApprovedUser.Title && entity.ApprovedUser.Title.Description'>{{entity.ApprovedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.ApprovedUser.FirstName}}</span>&nbsp;<span>{{entity.ApprovedUser.LastName}}\
                                        </div>"
            },
            {
                field: "PatientRequestStatus.Description",
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

    patientmedicineindentreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();