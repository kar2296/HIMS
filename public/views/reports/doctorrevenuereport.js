(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctorRevenueReportController', DoctorRevenueReportController);

    function DoctorRevenueReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.CanShowPrint = false;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            UserId: utl.Session.getCurrentUserId(),
            UserName: utl.Session.getCurrentUserName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentfilter.DoctorId = -1;

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.DoctorId > 0) {
                    if (item.Doctor.Title)
                        $scope.DoctorName = item.Doctor.Title.Description;
                    if (item.Doctor.FirstName)
                        $scope.DoctorName += ' ' + item.Doctor.FirstName;
                    if (item.Doctor.LastName)
                        $scope.DoctorName += ' ' + item.Doctor.LastName;
                } else {
                    $scope.DoctorName = '';
                }
                if(vm.gridConfig.data.length) {
                    $scope.CanShowPrint = true;
                }
                totalamount = totalamount + (item.Amount);
                vm.gridConfig.data.push(item);
            }
            $scope.TotalAmount = totalamount;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            $scope.CanShowPrint = false;
            var inputData = {
                Params: [{
                    Key: 6,
                    Value: From
                },
                {
                    Key: 7,
                    Value: To
                },
                {
                    Key: 33,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.DoctorId
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/PatientBillDetails/GetPatientBillDetails',
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
            $state.go('app.billingreports')
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
                },
                Params: [{
                    Key: 6,
                    Value: From
                },
                {
                    Key: 7,
                    Value: To
                },
                {
                    Key: 33,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.DoctorId
                },
                ],
            };
            var options = {
                action: 'billing/PatientBillDetails/PrintDoctorRevenueReport',
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
                field: "BillDateTime",
                displayName: $translate.instant('reports.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReceiptDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientBill.BillNumber",
                displayName: $translate.instant('reports.billno.lbl')
            },
            {
                field: "Doctor Name",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.User.Title && entity.User.Title.Description'>{{entity.User.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.User.FirstName}}</span>&nbsp;<span>{{entity.User.LastName}}</span>\
                                        </div>"
            },
            {
                field: "Department.DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
            },
            {
                field: "ServiceName",
                displayName: $translate.instant('reports.servicename.lbl')
            },
            {
                field: "Amount",
                displayName: $translate.instant('reports.amt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Amount | displaycurrency}}</span>" + "</div>"
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
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },]
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

    DoctorRevenueReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();