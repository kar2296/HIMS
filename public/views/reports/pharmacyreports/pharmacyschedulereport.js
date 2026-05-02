(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyScheduleReportController', PharmacyScheduleReportController);

    function PharmacyScheduleReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            // UserId: utl.Session.getCurrentUserId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };

        $scope.lookup = {};
        $scope.ScheduleTypelookup = [];
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.CanShowPrint = false;

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.PatientInfo = '';
                if (item.PatientBill.Patient) {
                    if (item.PatientBill.Patient.Title)
                        item.PatientInfo = item.PatientBill.Patient.Title.Description;
                    if (item.PatientBill.Patient.FirstName)
                        item.PatientInfo += ' ' + item.PatientBill.Patient.FirstName;
                    if (item.PatientBill.Patient.LastName)
                        item.PatientInfo += ' ' + item.PatientBill.Patient.LastName;
                    if (item.PatientBill.Patient.MRN)
                        item.PatientInfo += '/' + item.PatientBill.Patient.MRN;
                    if (item.PatientBill.Patient.Age)
                        item.PatientInfo += '/' + item.PatientBill.Patient.Age;
                    if (item.PatientBill.Patient.Gender)
                        item.PatientInfo += '/' + item.PatientBill.Patient.Gender.Description;
                } else if (!item.PatientBill.Patient) {
                    item.PatientInfo = item.PatientBill.PatientName + '/' + item.PatientBill.Age ;
                        if(item.PatientBill.Gender){
                            item.PatientInfo += '/' + item.PatientBill.Gender.Description;}
                }
                vm.gridConfig.data.push(item);
            }
            if (res.Data.length > 0) {
                // if ($scope.currentfilter.ScheduleTypeId) {
                //     $scope.ScheduleType = res.Data[0].ScheduleTypeDescription;
                // }
                if ($scope.currentfilter.StoreMasterId > 0) {
                    if (res.Data[0].StoreMaster)
                        $scope.StoreName = res.Data[0].StoreMaster.StoreDescription;
                }
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };



        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Bill Date", "Bill Number", "Patient Name", "Doctor Name", "Item Name", "Manufacturer Name", "Batch Id", "Expiry Date", "Quantity", "Schedule Type", "Signature"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var billDate = '';
                var billnum = '';
                var patName = '';
                var docName = '';
                var itemName = '';
                var manufac = '';
                var batchId = '';
                var expDate = '';
                var qty = '';
                var schedule = '';
                var signature = '';

                if (rowArray.BillDateTime) {
                    // billDate = rowArray.BillDateTime;
                    // billDate = $filter('date')(rowArray.BillDateTime, 'yyyy-MM-dd') || null;
                    billDate = utl.Formatter.getDateTimeString(rowArray.BillDateTime);
                }
                if (rowArray.PatientBill.BillNumber) {
                    billnum = rowArray.PatientBill.BillNumber;
                }
                if (rowArray.PatientInfo) {
                    patName = rowArray.PatientInfo;
                }
                if (rowArray.User) {
                    if (rowArray.User.Title.Description) {
                        docName = rowArray.User.Title.Description;
                    }
                    if (rowArray.User.FirstName) {
                        docName += ' ' + rowArray.User.FirstName;
                    }
                    if (rowArray.User.LastName) {
                        docName += ' ' + rowArray.User.LastName;
                    }
                }
                if (rowArray.ItemName) {
                    itemName = rowArray.ItemName;
                }
                if (rowArray.ManufacturerName) {
                    manufac = rowArray.ManufacturerName;
                }
                if (rowArray.BatchId) {
                    batchId = rowArray.BatchId;
                }
                if (rowArray.ExpiryDate) {
                    expDate = rowArray.ExpiryDate;
                }
                if (rowArray.Quantity) {
                    qty = rowArray.Quantity;
                }
                if (rowArray.ScheduleTypeDescription) {
                    schedule = rowArray.ScheduleTypeDescription;
                }
                if (rowArray.sign) {
                    signature = rowArray.sign;
                }
                csvContent += billDate + ',' + billnum + ',' + patName + ',' + docName + ',' + itemName + ',' + manufac + ',' + batchId + ',' + expDate + ',' + qty + ',' + schedule + ',' + signature + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'pharmacyschedule-report.csv';
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
                    Key: 14,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 28,
                    Value: $scope.currentfilter.ServiceId
                },
                {
                    Key: 35,
                    Value: [1, 2, 4]
                },
                {
                    Key: 15,
                    Value: true
                }
                ],

            };
            var options = {
                action: "billing/PatientBillDetails/GetPatientBillDetails",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
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
                    Key: 14,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 28,
                    Value: $scope.currentfilter.ServiceId
                },
                {
                    Key: 35,
                    Value: [1, 2, 4]
                },
                {
                    Key: 15,
                    Value: true
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.ScheduleTypeId) {
                inputData.Params.push({
                    Key: 41,
                    Value: $scope.currentfilter.ScheduleTypeId
                })
            }
            var options = {
                action: 'billing/PatientBillDetails/GetPatientBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.selectedScheduletype = function (selectedItem) {
            var scheduletype = '';
            scheduletype = selectedItem.Name;
        };

        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ServiceId = -1;
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'invoicecollectionreport') {
                $state.go('app.pharmacytabreport.invoicecollectionreport');
            } if ($scope.Context == 'pharmacyreport') {
                $state.go('app.financereporttab.pharmacyreport');
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
                    ScheduleType: $scope.ScheduleType,
                    ItemName: $scope.ItemName
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
                    Key: 14,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 28,
                    Value: $scope.currentfilter.ServiceId
                },
                // {
                //     Key: 35,
                //     Value: $scope.currentfilter.ScheduleTypeId
                // },
                {
                    Key: 35,
                    Value: [1, 2, 4]
                },
                {
                    Key: 15,
                    Value: true
                },
                ],
            };
            if ($scope.currentfilter.ScheduleTypeId) {
                inputData.Params.push({
                    Key: 41,
                    Value: $scope.currentfilter.ScheduleTypeId
                })
            }
            var options = {
                action: 'billing/PatientBillDetails/PrintPharmacyScheduleReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.itemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Item Code',
                field: 'ItemCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Item Name',
                field: 'ItemName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselectedmovementitem,
            presearch: presearchmovementitem,
            postsearch: postsearchmovementitem
        };

        function formatselectedmovementitem() {
            var selectedItem = vm.itemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.itemcontrolconfig.rowdata) {
                result = [vm.itemcontrolconfig.rowdata.ItemCode, vm.itemcontrolconfig.rowdata.ItemName].join(' ');
            }
            $scope.ItemName = result;
            return result;
        }

        function presearchmovementitem() {
            var query = vm.itemcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.itemcontrolconfig.searchbyid === true) {
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

            vm.itemcontrolconfig.searchparams = inputData;
        }

        function postsearchmovementitem() {
            for (var idx in vm.itemcontrolconfig.result) {
                var item = vm.itemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
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
                field: "PatientInfo",
                displayName: $translate.instant('reports.patient.lbl')
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.User.Title && entity.User.Title.Description'>{{entity.User.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.User.FirstName}}</span>&nbsp;<span>{{entity.User.LastName}}</span>\
                                        </div>"

            },
            {
                field: "ItemName",
                displayName: $translate.instant('reports.itemname.lbl')
            },
            {
                field: "ManufacturerName",
                displayName: $translate.instant('reports.manu.lbl')
            },
            {
                field: "BatchId",
                displayName: $translate.instant('reports.batchid.lbl')
            },
            {
                field: "ExpiryDate",
                displayName: $translate.instant('reports.expirydate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ExpiryDate | date : 'MMM-yyyy'}} </span>" + "</div>"
            },
            {
                field: "Quantity",
                displayName: $translate.instant('reports.qty.lbl')
            },
            // {
            //     field: "StoreMaster.StoreDescription",
            //     displayName: $translate.instant('reports.storename.lbl')
            // },
            // {
            //     field: "FirstName",
            //     displayName: $translate.instant('reports.updated.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'>\
            //                            <span ng-if='entity.UpdatedUser.Title && entity.UpdatedUser.Title.Description'>{{entity.UpdatedUser.Title.Description}}&nbsp;</span>\
            //                            <span>{{entity.UpdatedUser.FirstName}}</span>&nbsp;<span>{{entity.UpdatedUser.LastName}}</span>\
            //                             </div>"
            // },
            {
                field: "ScheduleTypeDescription",
                displayName: $translate.instant('reports.schedule.lbl')
            },
            {
                field: "",
                displayName: $translate.instant('reports.sign.lbl')
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
                if (key == 'ScheduleType') {
                    for (var usidx in $scope.lookup.ScheduleType) {
                        if ($scope.lookup.ScheduleType[usidx].Text != 'X') {
                            $scope.ScheduleTypelookup.push($scope.lookup.ScheduleType[usidx]);
                        }
                    }
                }
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
                "Key": "ScheduleType"
            },
            {
                "Key": "UserStores",
                Default: false,
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                    ]
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

    PharmacyScheduleReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();