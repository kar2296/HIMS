(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrderStatisticsPathologistReportController', OrderStatisticsPathologistReportController);

    function OrderStatisticsPathologistReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "Order No and Bill No", "Patient Type", "Patient Name", "MRN", "Doctor Name", "Test Name", "Bill Amount", "Bill Discount", "Net Amount", "Pathologist Name"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var date = '';
                var orderNo = '';
                var patType = '';
                var patName = '';
                var mrn = '';
                var docName = '';
                var testName = '';
                var billAmt = '';
                var billDis = '';
                var netAmt = '';
                var patholog = '';


                if (rowArray.MedValidationdate) {
                    // date = rowArray.MedValidationdate;
                    date = $filter('date')(rowArray.MedValidationdate, 'yyyy-MM-dd') || null;
                }
                if (rowArray.BillDateTime) {
                    // date += ' ' + rowArray.BillDateTime;
                    date += ' ' + $filter('date')(rowArray.BillDateTime, 'yyyy-MM-dd') || null;
                }
                if (rowArray.BillNo) {
                    orderNo = rowArray.BillNo;
                }
                if (rowArray.Encounter.EncounterType.Description) {
                    patType = rowArray.Encounter.EncounterType.Description;
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
                    mrn = rowArray.Patient.MRN;
                }
                if (rowArray.PatientOrder.Doctor) {
                    if (rowArray.PatientOrder.Doctor.Title.Description) {
                        docName = rowArray.PatientOrder.Doctor.Title.Description;
                    }
                    if (rowArray.PatientOrder.Doctor.FirstName) {
                        docName += ' ' + rowArray.PatientOrder.Doctor.FirstName;
                    }
                    if (rowArray.PatientOrder.Doctor.LastName) {
                        docName += ' ' + rowArray.PatientOrder.Doctor.LastName;
                    }
                       }
                if (rowArray.Testname) {
                    testName = rowArray.Testname;
                }
                if (rowArray.PatientOrderDetail.PatientBillDetail) {
                if (rowArray.PatientOrderDetail.PatientBillDetail.Rate) {
                    billAmt = rowArray.PatientOrderDetail.PatientBillDetail.Rate;
                }
            }
            if (rowArray.PatientOrderDetail.PatientBillDetail) {
                if (rowArray.PatientOrderDetail.PatientBillDetail.DiscountAmount) {
                    billDis = rowArray.PatientOrderDetail.PatientBillDetail.DiscountAmount;
                }
            }
            if (rowArray.PatientOrderDetail.PatientBillDetail) {
                if (rowArray.PatientOrderDetail.PatientBillDetail.NetAmount) {
                    netAmt = rowArray.PatientOrderDetail.PatientBillDetail.NetAmount;
                }
            }
             
                if (rowArray.MedUser.Title.Description) {
                    patholog = rowArray.MedUser.Title.Description;
                }
                if (rowArray.MedUser.FirstName) {
                    patholog += ' ' + rowArray.MedUser.FirstName;
                }
                if (rowArray.MedUser.LastName) {
                    patholog += ' ' + rowArray.MedUser.LastName;
                }

                csvContent += date + ',' + orderNo + ',' + patType + ',' + patName + ',' + mrn + ',' + docName + ',' + testName + ',' + billAmt +','+ billDis +',' +netAmt + ',' + patholog +"\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'orderstatisticspathologist-report.csv';
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
                Params: [
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 15,
                        Value: 1
                    },
                    {
                        Key: 25,
                        Value: [7, 8, 9]
                    },
                    {
                        Key: 30,
                        Value: $scope.currentfilter.MedValidationById
                    }
                ],

            };
            var options = {
                action: "lis/patientworkorderdetails/GetPatientWorkorderdetailss",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.BillNo = '';
                if (item.PatientOrder.OrderNumber) {
                    item.BillNo = item.PatientOrder.OrderNumber;
                }
                if (item.PatientOrder.BillNumber) {
                    item.BillNo += '/' + item.PatientOrder.BillNumber;
                }
                if ($scope.currentfilter.MedValidationById > 0) {
                    if (item.MedUser.Title)
                        $scope.PathologistName = item.MedUser.Title.Description;
                    if (item.MedUser.FirstName)
                        $scope.PathologistName += ' ' + item.MedUser.FirstName;
                    if (item.MedUser.LastName)
                        $scope.PathologistName += ' ' + item.MedUser.LastName;
                } else {
                    $scope.PathologistName = '';
                }

                // if ($scope.currentfilter.SubDepartmentId > 0) {
                //     $scope.DepartmentName = item.Department.DepartmentName;
                // } else {
                //     $scope.DepartmentName = '';
                // }
                // if ($scope.currentfilter.EncounterTypeId > 0) {
                //     if (item.PatientOrder.EncounterType)
                //         $scope.PatientType = item.PatientOrder.EncounterType.Description;
                // } else {
                //     $scope.PatientType = '';
                // }
                // if ($scope.currentfilter.TestId > 0) {
                //     $scope.TestName = item.Testmaster.Name;
                // } else {
                //     $scope.TestName = '';
                // }

                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 15,
                        Value: 1
                    },
                    {
                        Key: 25,
                        Value: [7, 8, 9]
                    },
                    {
                        Key: 30,
                        Value: $scope.currentfilter.MedValidationById
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/patientworkorderdetails/GetPatientWorkorderdetailss',
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
            $state.go('app.labreports')
        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    PathologistName: $scope.PathologistName, 
                },
                Params: [
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 15,
                        Value: 1
                    },
                    {
                        Key: 25,
                        Value: [7, 8, 9]
                    },
                    {
                        Key: 30,
                        Value: $scope.currentfilter.MedValidationById
                    },
                ],
            };
            var options = {
                action: 'lis/patientworkorderdetails/PrintRadiologyOrderStatisticsReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'User Id',
                field: 'UserId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'User Name',
                field: 'UserName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.FacilityId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
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

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }


        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Name',
                field: 'Name',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Department',
                field: 'Department',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            ],
            searchparams: {},
            result: {},
            api: 'lis/testmaster/GetTestmasters',
            formatdisplay: formatselectedtest,
            presearch: presearchtest,
            postsearch: postsearchtest
        };

        function formatselectedtest() {
            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Name + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.testcontrolconfig.rowdata) {
                result = [vm.testcontrolconfig.rowdata.TestCode, vm.testcontrolconfig.rowdata.TestName].join(' ');
            }
            return result;
        }

        function presearchtest() {
            var query = vm.testcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 6,
                    Value: 2
                },
                    // {
                    //     Key: 8,
                    //     Value: {
                    //         'ServiceRateCategoryId': $scope.item.ServiceRateCategoryId
                    //     }
                    // }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.testcontrolconfig.searchbyid == true) {
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

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                var Tariff = {
                    Rate: 0,
                    DoctorShare: 0
                };
                var ServiceItem = item.ServiceItem;
                if (ServiceItem && ServiceItem.Id > 0 &&
                    ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                    Tariff = ServiceItem.ServiceItemTariffDetails[0];
                }
                item.Tariff = Tariff;
                item.Price = Tariff.Rate;
                item.Department = item.Department.DepartmentName;
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "MedValidationdate",
                displayName: $translate.instant('reports.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.MedValidationdate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "BillNo",
                displayName: $translate.instant('reports.billorderno.lbl')
            },
            {
                field: "Encounter.EncounterType.Description",
                displayName: $translate.instant('reports.patienttype.lbl')
            },
            {
                field: "Patient Name",
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
                field: "Doctor Name",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.PatientOrder.Doctor.Title && entity.PatientOrder.Doctor.Title.Description'>{{entity.PatientOrder.Doctor.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.PatientOrder.Doctor.FirstName}}</span>&nbsp;<span>{{entity.PatientOrder.Doctor.LastName}}</span>\
                                        </div>"
            },
            {
                field: "Testname",
                displayName: $translate.instant('reports.testname.lbl')
            },
            {
                field: "PatientOrderDetail.PatientBillDetail.Rate",
                displayName: $translate.instant('reports.billamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PatientOrderDetail.PatientBillDetail.Rate | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PatientOrderDetail.PatientBillDetail.DiscountAmount",
                displayName: $translate.instant('reports.billdis.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PatientOrderDetail.PatientBillDetail.DiscountAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PatientOrderDetail.PatientBillDetail.NetAmount",
                displayName: $translate.instant('reports.netamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PatientOrderDetail.PatientBillDetail.NetAmount | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "Med Name",
                displayName: $translate.instant('reports.pathologistname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.MedUser.Title && entity.MedUser.Title.Description'>{{entity.MedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.MedUser.FirstName}}</span>&nbsp;<span>{{entity.MedUser.LastName}}</span>\
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
            },
            {
                "Key": "EncounterType"
            },
            {
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 6,
                        Value: 8
                    }]
                }
            },
                // { "Key": "Department" }
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

    OrderStatisticsPathologistReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();