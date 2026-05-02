(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorInvoiceTdsController', doctorInvoiceTdsController);

    function doctorInvoiceTdsController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        $scope.item=[];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: -1,
            DoctorInvoiceNo: '',
            GeneratedBy: -1,
            InvoiceDate: utl.Formatter.getCurrentDate(),
            FrmDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            InvoiceStatusId: 2,
            Doctor: ''
        };

        $scope.CanShowPrint = false;

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Invoice Date","Invoice No","Doctor Name", "Invoice Amount", "Tax Amount","Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var invoiceDate = '';
                var invoiceNo = '';
                var docName = '';
                var invoiceAmt = '';
                var taxAmt = '';
                var status='';

                if (rowArray.InvoiceDateTime) {
                    invoiceDate = rowArray.InvoiceDateTime;
                }
                if (rowArray.DoctorInvoiceIdentifier) {
                    invoiceNo = rowArray.DoctorInvoiceIdentifier;
                }
                if (rowArray.Doctor.Title.Description) {
                    docName = rowArray.Doctor.Title.Description;
                }
                if (rowArray.Doctor.FirstName) {
                    docName += ' ' + rowArray.Doctor.FirstName;
                }
                if (rowArray.Doctor.LastName) {
                    docName += ' ' + rowArray.Doctor.LastName;
                }
                if (rowArray.InvoiceAmount) {
                    invoiceAmt = rowArray.InvoiceAmount;
                }
                if (rowArray.TDSAmount) {
                    taxAmt = rowArray.TDSAmount;
                }
                if (rowArray.DoctorInvoiceStatus.Description) {
                    status = rowArray.DoctorInvoiceStatus.Description;
                }
                csvContent += invoiceDate + ',' +invoiceNo + ',' + docName + ',' + invoiceAmt + ',' + taxAmt + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'doctortdsrepo.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
              var From = $filter('date')($scope.currentfilter.FrmDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DoctorId },
                    { Key: 9, Value: From },
                    { Key: 10, Value: To },
                    { Key: 12, Value: '0' }
                ],

            };
            var options = {
                action: "doctorinvoice/DoctorInvoice/GetDoctorInvoices",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, data, options, hasError) {
            // vm.gridConfig.data = res.Data;
            vm.gridConfig.data = [];
            var totaltdsamount = 0;
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.TotalTDSAmount = isNaN(parseFloat(item.TDSAmount)) ? (0) : parseFloat(item.TDSAmount);

                totaltdsamount = totaltdsamount + (item.TotalTDSAmount)

                vm.gridConfig.data.push(item);
            }
            if($scope.currentfilter.DoctorId>0){
                if(item.Doctor.Title)
                $scope.DoctorName= item.Doctor.Title.Description;
                if(item.Doctor.FirstName)
                $scope.DoctorName+=' '+item.Doctor.FirstName; 
                if(item.Doctor.LastName)
                $scope.DoctorName+=' '+item.Doctor.LastName; 
            }else{
                $scope.DoctorName='';
            }
            $scope.TotalTDSAmount = totaltdsamount;
            if(vm.gridConfig.data.length) {
                $scope.CanShowPrint = true;
            }
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };
         $scope.backtoReport = function () {
            $state.go('app.financereporttab.doctorinvoicereport')
        } 

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
            // if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
            //     !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
            //     vm.gridConfig.data = [];
            //     $scope.TotalTDSAmount = 0; 
            //     $scope.CanShowPrint = false;
            //     return;
            // }
            var From = $filter('date')($scope.currentfilter.FrmDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DoctorId },
                    { Key: 9, Value: From },
                    { Key: 10, Value: To },
                    { Key: 12, Value: '0' }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            // if (FrmDate != null)
            //     inputData.Params.push({ Key: 5, Value: [FrmDate, ToDate] });
            var options = {
                action: 'doctorinvoice/DoctorInvoice/GetDoctorInvoices',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "S.No", displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "InvoiceDateTime",
                    displayName: $translate.instant('doctorinvoice-list.filter_invoicedate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.InvoiceDateTime'></ngformatdate>"
                },
                {
                    field: "DoctorInvoiceIdentifier",
                    displayName: $translate.instant('doctorinvoice-list.filter_invoiceno.lbl')
                },
                {
                    field: "Doctor",
                    displayName: $translate.instant('doctorinvoice-list.filter_doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                // {
                //     field: "EncounterType.Description",
                //     displayName: $translate.instant('doctorinvoice-list.visittype.lbl')
                // },
                {
                    field: "InvoiceAmount",
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.InvoiceAmount | displaycurrency}}</span>" + "</div>",
                    displayName: $translate.instant('doctorinvoice-list.invoiceamount.lbl')
                },

                {
                    field: "TDSAmount",
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TDSAmount | displaycurrency}}</span>" + "</div>",
                    displayName: $translate.instant('doctorinvoice-list.taxamount.lbl')
                },
                {
                    field: "DoctorInvoiceStatus.Description",
                    displayName: $translate.instant('doctorinvoice-list.filter_status.lbl')
                },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        //     {
        //         field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
        //         cellTemplate: '<div class="ui-grid-cell-contents">\
        //                                              <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="entity.DoctorInvoiceStatusId==2"><i class="fas fa-eye" aria-hidden="true"></i></span>\
        //                                             <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="entity.DoctorInvoiceStatusId==1||entity.DoctorInvoiceStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
        //                                             </div>',
        //         // cellTemplate: 'actionTemplate.html',
        //         // actions: [
        //         //     // { actiontype: 'cancel', display: 'common.cancelaction.lbl' },
        //         //     { actiontype: 'edit', display: 'common.editaction.lbl' }
        //         // ]
        //     }],
        //     pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        // };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FrmDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    DoctorName: $scope.DoctorName
                },
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DoctorId },
                    { Key: 9, Value: From },
                    { Key: 10, Value: To },
                    { Key: 12, Value: '0' }
                ],
            };
            var options = {
                action: 'doctorinvoice/DoctorInvoice/PrintDoctorInvoiceTds',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "InvoiceDate" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    doctorInvoiceTdsController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();