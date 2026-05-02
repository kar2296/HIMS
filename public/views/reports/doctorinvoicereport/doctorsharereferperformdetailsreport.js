(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorsharereferperformdetailsreportController', doctorsharereferperformdetailsreportController);

    function doctorsharereferperformdetailsreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalbillamount = 0;
            var totalbilldiscount = 0;
            var totalnetamount = 0;
            var totaldoctorshare = 0;
            var totaltdsamount = 0;
            var totalnetdramount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                // if ($scope.currentfilter.DoctorId > 0) {
                //     if (item.User.Title)
                //         $scope.DoctorName = item.User.Title.Description;
                //     if (item.User.FirstName)
                //         $scope.DoctorName += ' ' + item.User.FirstName;
                //     if (item.User.LastName)
                //         $scope.DoctorName += ' ' + item.User.LastName;
                // } else {
                //     $scope.DoctorName = '';
                // }
                // if ($scope.currentfilter.DoctorId > 0) {
                //     if (res.Data.length > 0) {
                //         $scope.DoctorName = item.DoctorName;
                //     }
                // } else {
                //     $scope.DoctorName = '';
                // }
                if ($scope.currentfilter.EncounterTypeId > 0) {
                    if (res.Data.length > 0) {
                        $scope.EncounterType = item.PatientBill.EncounterType.Description;
                    }
                } else {
                    $scope.EncounterType = '';
                }
                if (item.User.GstMaster) {
                    item.TdsPercentage = item.User.GstMaster.GstPercentage;
                }
                if (item.TdsPercentage) {
                    item.TdsAmount = item.DoctorShareAmount * (item.TdsPercentage / 100);
                }
                if (item.TdsAmount) {
                    item.NetDrAmount = item.DoctorShareAmount - item.TdsAmount;
                } else {
                    item.NetDrAmount = item.DoctorShareAmount;
                }

                totalbillamount = totalbillamount + (item.PatientBillDetail.GrossAmount);
                totalbilldiscount = totalbilldiscount + (item.PatientBillDetail.DiscountAmount);
                totalnetamount = totalnetamount + (item.ServiceAmount);
                totaldoctorshare = totaldoctorshare + (item.DoctorShareAmount);
                totaltdsamount = totaltdsamount + (item.TdsAmount);
                totalnetdramount = totalnetdramount + (item.NetDrAmount);
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalBillAmt = totalbillamount;
            $scope.TotalDisAmt = totalbilldiscount;
            $scope.TotalNetAmt = totalnetamount;
            $scope.TotalDoctorShareAmt = totaldoctorshare;
            $scope.TotalTdsAmt = totaltdsamount;
            $scope.TotalNetDrAmt = totalnetdramount;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
            if ($scope.currentfilter.DoctorId > 0) {
                if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                    !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                    vm.gridConfig.data = [];
                    $scope.TotalBillAmt = 0;
                    $scope.TotalDisAmt = 0;
                    $scope.TotalNetAmt = 0;
                    $scope.TotalPaidAmt = 0;
                    $scope.TotalDueAmt = 0;
                    $scope.CanShowPrint = false;
                    return;
                }
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                            Key: 1,
                            Value: From
                        },
                        {
                            Key: 2,
                            Value: To
                        },
                        {
                            Key: 5,
                            Value: $scope.currentfilter.EncounterTypeId
                        },
                        {
                            Key: 4,
                            Value: $scope.currentfilter.DoctorId
                        },
                        // {
                        //     Key: 10,
                        //     Value: $scope.currentfilter.GuarantorId
                        // },
                        // {
                        //     Key: 53,
                        //     Value: $scope.currentfilter.DepartmentId
                        // },
                        // {
                        //     Key: 6,
                        //     Value: [1, 5]
                        // },
                        {
                            Key: 12,
                            Value: 1
                        },
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };
                var options = {
                    action: 'billing/patientdoctorsharedetails/GetPatientDoctorShareDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.SelectedDoctor = function (selectedItem) {
            $scope.DoctorName = selectedItem.Text;
        };
        $scope.backtoReport = function () {
            $state.go('app.financereporttab.doctorinvoicereport')
        }

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    DoctorName: $scope.DoctorName,
                    EncounterType: $scope.EncounterType,
                    DepartmentName: $scope.DepartmentName
                },
                Params: [{
                        Key: 1,
                        Value: From
                    },
                    {
                        Key: 2,
                        Value: To
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.EncounterTypeId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 12,
                        Value: 1
                    },
                ],
            };
            var options = {
                action: 'billing/patientdoctorsharedetails/PrintDoctorShareDetailReport',
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


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "idx",
                    displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "BillDateTime",
                    displayName: $translate.instant('reports.billdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "PatientBill.BillNumber",
                    displayName: $translate.instant('reports.billno.lbl')
                },
                {
                    field: "PatientBill.Patient.MRN",
                    displayName: $translate.instant('MRN')
                },
                {
                    field: "Patient Name",
                    displayName: $translate.instant('reports.patient.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.PatientBill.Patient.Title && entity.PatientBill.Patient.Title.Description'>{{entity.PatientBill.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.PatientBill.Patient.FirstName}}</span>&nbsp;<span>{{entity.PatientBill.Patient.LastName}}</span>\
                                        </div>"
                },
                {
                    field: "DoctorName",
                    displayName: $translate.instant('reports.doctorname.lbl')
                },
                {
                    field: "DrShareType.Description",
                    displayName: $translate.instant('Type')
                },
                {
                    field: "ServiceName",
                    displayName: $translate.instant('Service Name')
                },
                {
                    field: "PatientBillDetail.GrossAmount",
                    displayName: $translate.instant('reports.billamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PatientBillDetail.GrossAmount | displaycurrency}}</span>" + "</div>"

                },
                {
                    field: "PatientBillDetail.DiscountAmount",
                    displayName: $translate.instant('reports.billdis.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PatientBillDetail.DiscountAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "ServiceAmount",
                    displayName: $translate.instant('Net Bill Amount '),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ServiceAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "DoctorShareAmount",
                    displayName: $translate.instant('Doctor Share Amount'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DoctorShareAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "TdsAmount",
                    displayName: $translate.instant('TDS Amount'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TdsAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "NetDrAmount",
                    displayName: $translate.instant('Net Dr.Share Amount'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetDrAmount | displaycurrency}}</span>" + "</div>"
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
                    "Key": "EncounterType"
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
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Department"
                }
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

    doctorsharereferperformdetailsreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();