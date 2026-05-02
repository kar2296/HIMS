(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BedTransferReportController', BedTransferReportController);

    function BedTransferReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Transfer Date", "Patient Name", "MRN", "From Ward", "From Room", "From Tariff", "To Ward", "To Room", "To Tariff", "Doctor Name", "Department", "Transfer By"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var transferdate = '';
                var patname = '';
                var mrn = '';
                var fromward = '';
                var fromroom = '';
                // var frombed = '';
                var fromtariff = '';
                var toroom = '';
                var toward = '';
                var totariff = '';
                var docname = '';
                var transferby = '';
                if (rowArray.TransferDate) {
                    transferdate = rowArray.TransferDate;
                }
                if (rowArray.Patient.Title.Description) {
                    patname += ' ' + rowArray.Patient.Title.Description;
                }
                if (rowArray.Patient.FirstName) {
                    patname += ' ' + rowArray.Patient.FirstName;
                }
                if (rowArray.Patient.LastName) {
                    patname += ' ' + rowArray.Patient.LastName;
                }
                if (rowArray.Patient.MRN) {
                    mrn = rowArray.Patient.MRN;
                }
                if (rowArray.FromWard.WardName) {
                    fromward = rowArray.FromWard.WardName;
                }
                if (rowArray.FromRoom.RoomNo) {
                    fromroom = rowArray.FromRoom.RoomNo;
                }
                // if (rowArray.FromBed.BedNo) {
                //     frombed = rowArray.FromBed.BedNo;
                // }
                if (rowArray.FromServiceRateCategory.ServiceRateCategory) {
                    fromtariff = rowArray.FromServiceRateCategory.ServiceRateCategory;
                }
                if (rowArray.ToWard.WardName) {
                    toward = rowArray.ToWard.WardName;
                }
                if (rowArray.ToRoom.RoomNo) {
                    toroom = rowArray.ToRoom.RoomNo;
                }
                // if (rowArray.ToBed.BedNo) {
                //     tobed = rowArray.ToBed.BedNo;
                // }
                if (rowArray.ToServiceRateCategory.ServiceRateCategory) {
                    totariff = rowArray.ToServiceRateCategory.ServiceRateCategory;
                }
                if (rowArray.Doctor.Title.Description) {
                    docname += ' ' + rowArray.Doctor.Title.Description;
                }
                if (rowArray.Doctor.FirstName) {
                    docname += ' ' + rowArray.Doctor.FirstName;
                }
                if (rowArray.Doctor.LastName) {
                    docname += ' ' + rowArray.Doctor.LastName;
                }
                if (rowArray.ReqCompleted.Title.Description) {
                    transferby += ' ' + rowArray.ReqCompleted.Title.Description;
                }
                if (rowArray.ReqCompleted.FirstName) {
                    transferby += ' ' + rowArray.ReqCompleted.FirstName;
                }
                if (rowArray.ReqCompleted.LastName) {
                    transferby += ' ' + rowArray.ReqCompleted.LastName;
                }
                csvContent += transferdate + ',' + patname + ',' + mrn + ',' + fromward + ',' + fromroom + ',' + fromtariff + ',' + toroom + ',' + toward + ',' + totariff + ',' + docname + ',' + transferby + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'bedtransferreport.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: From
                },
                {
                    Key: 6,
                    Value: To
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.FromWardId
                },
                {
                    Key: 15,
                    Value: $scope.currentfilter.ToWardId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 3,
                    Value: 3
                },
                ],

            };
            var options = {
                action: "IPManagement/BedTransfer/GetBedTransfers",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };



        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            $scope.DoctorName = '';
            if ($scope.currentfilter.DoctorId > 0) {
                if (res.Data[0].Doctor.Title)
                    $scope.DoctorName = res.Data[0].Doctor.Title.Description;
                if (res.Data[0].Doctor.FirstName)
                    $scope.DoctorName += res.Data[0].Doctor.FirstName;
                if (res.Data[0].Doctor.LastName)
                    $scope.DoctorName += res.Data[0].Doctor.LastName;
            }
            if ($scope.currentfilter.FromWardId > 0) {
                $scope.FromWard = res.Data[0].FromWard.WardName;
            } else {
                $scope.FromWard = '';
            }
            if ($scope.currentfilter.ToWardId > 0) {
                $scope.ToWard = res.Data[0].ToWard.WardName;
            } else {
                $scope.ToWard = '';
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
                    Key: 5,
                    Value: From
                },
                {
                    Key: 6,
                    Value: To
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.FromWardId
                },
                {
                    Key: 15,
                    Value: $scope.currentfilter.ToWardId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 3,
                    Value: 3
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/BedTransfer/GetBedTransfers',
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
            if ($scope.Context == 'ipopreport') {
                $state.go('app.ipopreportstab.inpatientreport');
            }
            if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
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
                    DoctorName: $scope.DoctorName,
                    FromWard: $scope.FromWard,
                    ToWard: $scope.ToWard
                },
                Params: [{
                    Key: 5,
                    Value: From
                },
                {
                    Key: 6,
                    Value: To
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.FromWardId
                },
                {
                    Key: 15,
                    Value: $scope.currentfilter.ToWardId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 3,
                    Value: 3
                },
                ],
            };
            var options = {
                action: 'IPManagement/BedTransfer/PrintBedTransferReport',
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
                field: "TransferDate",
                displayName: $translate.instant('reports.transferdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TransferDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.TransferDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>\
                                        </div>"
            },
            {
                field: "Patient.MRN",
                displayName: $translate.instant('reports.mrn.lbl')
            },

            {
                field: "FromWard.WardName",
                displayName: $translate.instant('reports.fromward.lbl')

            },
            {
                field: "FromRoom.RoomNo",
                displayName: $translate.instant('From Room')
            },
            {
                field: "FromServiceRateCategory.ServiceRateCategory",
                displayName: $translate.instant('Tariff')
            },

            {
                field: "ToWard.WardName",
                displayName: $translate.instant('To Ward')

            },
            {
                field: "ToRoom.RoomNo",
                displayName: $translate.instant('To Room')
            },
            {
                field: "ToServiceRateCategory.ServiceRateCategory",
                displayName: $translate.instant('To Tariff')
            },
            // {
            //     field: "ToWard",
            //     displayName: $translate.instant('reports.toward.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'>\
            // <span> {{entity.ToWard.WardName}} </span>&nbsp;/<span> {{entity.ToRoom.RoomNo}} </span>&nbsp;\
            // /<span> {{entity.ToBed.BedNo}} </span> "
            // },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Doctor.Title && entity.Doctor.Title.Description'>{{entity.Doctor.Title.Description}}&nbsp;</span>\
                <span>{{entity.Doctor.FirstName}}</span>&nbsp;<span>{{entity.Doctor.LastName}}</span>\
                 </div>"
            },
            {
                field: "Department.DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.transferby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.ReqCompleted.Title && entity.ReqCompleted.Title.Description'>{{entity.ReqCompleted.Title.Description}}&nbsp;</span>\
                <span>{{entity.ReqCompleted.FirstName}}</span>&nbsp;<span>{{entity.ReqCompleted.LastName}}</span>\
                 </div>"
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
            {
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
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

    BedTransferReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();