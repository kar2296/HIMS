(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('labredoreportController', labredoreportController);

    function labredoreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Order Number", "Patient Name", "MRN", "SubDepartment", "Order Doctor", "WorkOrder", "Tech Name", "Released Date", "Reason", "Redo By", "Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var orderno = '';
                var patName = '';
                var mrn = '';
                var subDept = '';
                var orderDoc = '';
                var work = '';
                var techName = '';
                var release = '';
                var reason = '';
                var redo = '';
                var status = '';

                if (rowArray.PatientOrder.OrderNumber) {
                    orderno = rowArray.PatientOrder.OrderNumber;
                }
                if (rowArray.Patient.Title.Description) {
                    patName = rowArray.Patient.Title.Description;
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

                if (rowArray.SubDepartment.DepartmentName) {
                    subDept = rowArray.SubDepartment.DepartmentName;
                }
                if (rowArray.Orderedbyname) {
                    orderDoc = rowArray.Orderedbyname;
                }

                if (rowArray.WorkOrderdid) {
                    work = rowArray.WorkOrderdid;
                }
                if (rowArray.Techuser.Title.Description) {
                    techName = rowArray.Techuser.Title.Description;
                }
                if (rowArray.Techuser.FirstName) {
                    techName += ' ' + rowArray.Techuser.FirstName;
                }
                if (rowArray.Techuser.LastName) {
                    techName += ' ' + rowArray.Techuser.LastName;
                }
                if (rowArray.ReleasedDate) {
                    // release = rowArray.ReleasedDate;
                    release = $filter('date')(rowArray.ReleasedDate, 'yyyy-MM-dd') || null;
                }
                if (rowArray.Reason) {
                    reason = rowArray.Reason;
                }
                if (rowArray.RedoBy) {
                    redo = rowArray.RedoBy;
                }
                if (rowArray.OrderStatus.DisplayName) {
                    status = rowArray.OrderStatus.DisplayName;
                }
                csvContent += orderno + ',' + patName + ',' + mrn + ',' + subDept + ',' + orderDoc + ',' + work + ',' + techName + ',' + release + ',' + reason + ',' + redo + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'labredo-report.csv';
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
                        Key: 23,
                        Value: $scope.currentfilter.SubDepartmentId
                    },
                    {
                        Key: 29,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 33,
                        Value: true
                    },
                ],

            };
            var options = {
                action: "lis/patientworkorder/GetPatientWorkorders",
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

                if ($scope.currentfilter.SubDepartmentId > 0) {
                    $scope.DepartmentName = item.SubDepartment.DepartmentName;
                } else {
                    $scope.DepartmentName = '';
                }

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
                Params: [{
                        Key: 11,
                        Value: From
                    },
                    {
                        Key: 12,
                        Value: To
                    },
                    {
                        Key: 23,
                        Value: $scope.currentfilter.SubDepartmentId
                    },
                    {
                        Key: 29,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 33,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/patientworkorder/GetPatientWorkorders',
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
                        Key: 23,
                        Value: $scope.currentfilter.SubDepartmentId
                    },
                    {
                        Key: 29,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 33,
                        Value: true
                    },
                ],
            };
            var options = {
                action: 'lis/patientworkorder/PrintLabRedoReport',
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
                    field: "idx",
                    displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "PatientOrder.OrderNumber",
                    displayName: $translate.instant('Order Number')
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
                // {
                //     field: "Doctor Name",
                //     displayName: $translate.instant('reports.doctorname.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>\
                //                            <span ng-if='entity.PatientOrder.Doctor.Title && entity.PatientOrder.Doctor.Title.Description'>{{entity.PatientOrder.Doctor.Title.Description}}&nbsp;</span>\
                //                            <span>{{entity.PatientOrder.Doctor.FirstName}}</span>&nbsp;<span>{{entity.PatientOrder.Doctor.LastName}}</span>\
                //                             </div>"
                // },
                {
                    field: "SubDepartment.DepartmentName",
                    displayName: $translate.instant('SubDepartment')
                },
                {
                    field: "Orderedbyname",
                    displayName: $translate.instant('Order Doctor')
                },
                {
                    field: "WorkOrderdid",
                    displayName: $translate.instant('WorkOrder #')
                },
                {
                    field: "Doctor Name",
                    displayName: $translate.instant('Tech Name'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Techuser.Title && entity.Techuser.Title.Description'>{{entity.Techuser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Techuser.FirstName}}</span>&nbsp;<span>{{entity.Techuser.LastName}}</span>\
                                        </div>"
                },
                {
                    field: "ReleasedDate",
                    displayName: $translate.instant('Released Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReleasedDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReleasedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Reason",
                    displayName: $translate.instant('Reason')
                },
                {
                    field: "",
                    displayName: $translate.instant('Redo By')
                },
                {
                    field: "OrderStatus.DisplayName",
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

    labredoreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();