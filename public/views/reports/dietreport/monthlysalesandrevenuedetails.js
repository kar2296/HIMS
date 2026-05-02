(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('monthlysalesandrevenuedetailsController', monthlysalesandrevenuedetailsController);

    function monthlysalesandrevenuedetailsController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.ItemWiseData = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            UserId: utl.Session.getCurrentUserId(),
            UserName: utl.Session.getCurrentUserName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "Order Number", "Patient Name", "MRN", "Room Details", "Item Name", "Ordered By"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var date = '';
                var order = '';
                var patient = '';
                var mrn = '';
                var room = '';
                var itemName = '';
                var orderBy = '';


                if (rowArray.RequestDate) {
                    date = rowArray.RequestDate;
                }

                if (rowArray.PatientDietOrder.OrderNumber) {
                    order = rowArray.PatientDietOrder.OrderNumber;
                }
                if (rowArray.Patient.Title.Description) {
                    patient = rowArray.Patient.Title.Description.Description;
                }
                if (rowArray.Patient.FirstName) {
                    patient += ' ' + rowArray.Patient.FirstName;
                }
                if (rowArray.Patient.LastName) {
                    patient += ' ' + rowArray.Patient.LastName;
                }
                if (rowArray.Patient.MRN) {
                    mrn = rowArray.Patient.MRN;
                }
                if (rowArray.PatientDietOrder.WardMaster.WardName) {
                    room = rowArray.PatientDietOrder.WardMaster.WardName;
                }
                if (rowArray.PatientDietOrder.WardRoomMaster.RoomNo) {
                    room += ' ' + rowArray.PatientDietOrder.WardRoomMaster.RoomNo;
                }
                if (rowArray.PatientDietOrder.WardRoomBedMaster.BedNo) {
                    room += ' ' + rowArray.PatientDietOrder.WardRoomBedMaster.BedNo;
                }
                if (rowArray.DietName) {
                    itemName = rowArray.DietName;
                }

                if (rowArray.PatientDietOrder.User.Title.Description) {
                    orderBy = rowArray.PatientDietOrder.User.Title.Description;
                }
                if (rowArray.PatientDietOrder.User.FirstName) {
                    orderBy += ' ' + rowArray.PatientDietOrder.User.FirstName;
                }
                if (rowArray.PatientDietOrder.User.LastName) {
                    orderBy += ' ' + rowArray.PatientDietOrder.User.LastName;
                }

                csvContent += date + ',' + order + ',' + patient + ',' + mrn + ',' + room + ',' + itemName + ',' + orderBy + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'monthlysalesandrevenuedetails-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalAmount = 0;
                $scope.TotalDisAmount = 0;
                $scope.TotalNetAmount = 0;
                $scope.TotalDocshare = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 7,
                    Value: From
                },
                {
                    Key: 8,
                    Value: To
                },
                ],

            };
            var options = {
                action: "patientemr/patientdietorderdetail/GetPatientDietOrderDetails",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalamount = 0;
            // var totaldisamount = 0;
            // var totalnetamount = 0;
            // var totaldocshare = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.PaymentType = '';
                if (item.PatientBill) {
                    if (item.PatientBill.PatientPaymentDetails.length > 0) {
                        var PayDetails = item.PatientBill.PatientPaymentDetails[0];
                        item.PaymentType = PayDetails.PaymentType.Description;

                    }
                }
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
                // item.NetAmt = parseFloat(item.GrossAmount) - parseFloat(item.DiscountAmt || 0);
                totalamount = totalamount + (item.GrossAmount);
                // totaldisamount = totaldisamount + (item.DiscountAmt || 0);
                // totalnetamount = totalnetamount + (item.NetAmt || 0);
                // totaldocshare = totaldocshare + (item.DoctorShare);

                vm.gridConfig.data.push(item);
            }
            $scope.TotalAmount = totalamount;
            // $scope.TotalDisAmount = totaldisamount;
            // $scope.TotalNetAmount = totalnetamount;
            // $scope.TotalDocshare = totaldocshare;
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };


        $scope.getList = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalAmount = 0;
                $scope.TotalDisAmount = 0;
                $scope.TotalNetAmount = 0;
                $scope.TotalDocshare = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 7,
                    Value: From
                },
                {
                    Key: 8,
                    Value: To
                },
                    // {
                    //     Key: 33,
                    //     Value: $scope.currentfilter.FacilityId
                    // },
                    // {
                    //     Key: 16,
                    //     Value: $scope.currentfilter.DoctorId
                    // },
                    // {
                    //     Key: 32,
                    //     Value: 5
                    // },
                    // {
                    //     Key: 4,
                    //     Value: 3
                    // },
                    // {
                    //     Key: 36,
                    //     Value: false
                    // }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientdietorderdetail/GetPatientDietOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ServiceId = -1;
                // $scope.getList();
            }
        };

        $scope.backtoReport = function () {
            if ($scope.Context == 'dietreport') {
                $state.go('app.dietreport');
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
                    BillingGroup: $scope.BillingGroup,
                    BillingService: $scope.BillingService
                },
                Params: [{
                    Key: 7,
                    Value: From
                },
                {
                    Key: 8,
                    Value: To
                },
                    // {
                    //     Key: 33,
                    //     Value: $scope.currentfilter.FacilityId
                    // },
                    // {
                    //     Key: 16,
                    //     Value: $scope.currentfilter.DoctorId
                    // },
                    // {
                    //     Key: 32,
                    //     Value: 5
                    // },
                    // {
                    //     Key: 4,
                    //     Value: 3
                    // },
                    // {
                    //     Key: 36,
                    //     Value: false
                    // }
                ],
            };
            var options = {
                action: 'emr/patientdietorderdetail/PrintMonthlySalesandRevenueDetails',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Service Code',
                field: 'ServiceCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Service Name',
                field: 'ServiceName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },

            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        };

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            inputData.Params.push({
                Key: 8,
                Value: utl.Session.getCurrentFacilityId()
            });

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                // if (otherservicemiddlesearch) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
                // }
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        };

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
            }
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "RequestDate",
                displayName: $translate.instant('reports.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.RequestDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientDietOrder.OrderNumber",
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
            {
                field: "WardRoomMaster",
                displayName: $translate.instant('reports.room.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ng-if='entity.PatientDietOrder.WardRoomMaster'>{{entity.PatientDietOrder.WardMaster.WardName}} </span>" +
                    "<span ng-if='entity.PatientDietOrder.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.PatientDietOrder.WardRoomMaster'>{{entity.PatientDietOrder.WardRoomMaster.RoomNo}} </span>" +
                    "<span ng-if='entity.PatientDietOrder.WardRoomMaster'>/</span>" +
                    "<span ng-if='entity.PatientDietOrder.WardRoomBedMaster'>{{entity.PatientDietOrder.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            {
                field: "DietName",
                displayName: $translate.instant('Item Name')
            },
            {
                field: "Collected By",
                displayName: $translate.instant('Ordered By'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.PatientDietOrder.User.Title && entity.PatientDietOrder.User.Title.Description'>{{entity.PatientDietOrder.User.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.PatientDietOrder.User.FirstName}}</span>&nbsp;<span>{{entity.PatientDietOrder.User.LastName}}</span>\
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
            var inputData = [
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

    monthlysalesandrevenuedetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();