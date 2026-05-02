(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('agingoutstandingreportviewController', agingoutstandingreportviewController);

    function agingoutstandingreportviewController($scope, $stateParams, $state, $translate, $filter, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            // FacilityId: utl.Session.getCurrentFacilityId(),
            // FacilityName: utl.Session.getCurrentFacilityName(),
            // FromDate: utl.Formatter.getCurrentDate(),
            // ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentfilter.GuarantorId = parseInt(modalConfig.params.gid);
            $scope.currentfilter.FacilityId = parseInt(modalConfig.params.facId);
            $scope.currentcontext.encTypeId = parseInt(modalConfig.params.encTypeId);
            $scope.currentcontext.billtypeId = modalConfig.params.billtypeId;
            $scope.currentfilter.FromDate = modalConfig.params.fromdate;
            $scope.currentfilter.ToDate = modalConfig.params.todate;
            $scope.currentfilter.dayscount = modalConfig.params.dayscount;
            $scope.viewfrom = modalConfig.params.from;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.excelDownloadCallbackExcel = function(scope, data, options, hasError) {
            const JsonFields = ["Bill Date", "Bill Number", "Patient Name", "Bill Amount", "Bill Discount", "paid Amount", "Due Amount", "Due Approval", "Remark", "Billed By"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function(rowArray) {
                var billdate = '';
                var billno = '';
                var patname = '';
                var billamt = '';
                var billdis = '';
                var paidamt = '';
                var dueamt = '';
                var dueApprove = '';
                var remark = '';
                var billedBy = '';

                if (rowArray.BillDateTime) {
                    // billdate = rowArray.BillDateTime;
                    billdate = $filter('date')(rowArray.BillDateTime, 'yyyy-MM-dd') || null;
                }
                if (rowArray.BillNumber) {
                    billno = rowArray.BillNumber;
                }
                if (rowArray.Patient.Title) {
                    if (rowArray.Patient.Title.Description) {
                        patname += ' ' + rowArray.Patient.Title.Description;
                    }
                    if (rowArray.Patient.FirstName) {
                        patname += ' ' + rowArray.Patient.FirstName;
                    }
                    if (rowArray.Patient.LastName) {
                        patname += ' ' + rowArray.Patient.LastName;
                    }
                }
                if (rowArray.BillAmount) {
                    billamt = rowArray.BillAmount;
                }
                if (rowArray.BillDiscount) {
                    billdis = rowArray.BillDiscount;
                }
                if (rowArray.PaidAmount) {
                    paidamt = rowArray.PaidAmount;
                }
                if (rowArray.OutStandingAmount) {
                    dueamt = rowArray.OutStandingAmount;
                }
                if (rowArray.PrivateDue) {
                    if (rowArray.PrivateDue.Title.Description) {
                        dueApprove = rowArray.PrivateDue.Title.Description;
                    }
                    if (rowArray.PrivateDue.FirstName) {
                        dueApprove += ' ' + rowArray.PrivateDue.FirstName;
                    }
                    if (rowArray.PrivateDue.LastName) {
                        dueApprove += ' ' + rowArray.PrivateDue.LastName;
                    }
                    if (rowArray.GuarantorName) {
                        dueApprove += ' ' + rowArray.GuarantorName;
                    }
                }
                if (rowArray.Comments) {
                    remark = rowArray.Comments;
                }
                if (rowArray.Updateduser.Title.Description) {
                    billedBy = rowArray.Updateduser.Title.Description;
                }
                if (rowArray.Updateduser.FirstName) {
                    billedBy += ' ' + rowArray.Updateduser.FirstName;
                }
                if (rowArray.Updateduser.LastName) {
                    billedBy += ' ' + rowArray.Updateduser.LastName;
                }
                dueApprove = dueApprove.replace(/,/g, " ");
                dueApprove = dueApprove.replace(/ /g, " ");

                csvContent += billdate + ',' + billno + ',' + patname + ',' + billamt + ',' + billdis + ',' + paidamt + ',' + dueamt + ',' + dueApprove + ',' + remark + ',' + billedBy + "\n";
            });
            // var encodedUri = encodeURI(csvContent);
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'outstanding-reports.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function() {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalDueAmt = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 61,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 30,
                        Value: $scope.currentfilter.PrivateDueId
                    },
                    {
                        Key: 45,
                        Value: '0'
                    },
                    {
                        Key: 6,
                        Value: [1, 5]
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 50,
                        Value: false
                    },
                    {
                        Key: 21,
                        Value: false
                    },
                ],

            };
            var options = {
                action: "billing/patientbills/GetPatientBillswithoutdetails",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totaldueamount = 0;
            for (var idx in res.Data) {
                var less30 = 0;
                var less60 = 0;
                var less90 = 0;
                var above90 = 0;
                var insagingData = res.Data[idx];
                if ($scope.currentfilter.GuarantorId > 0) {
                    if (res.Data.length > 0) {
                        $scope.GuarantorName = insagingData.GuarantorName;
                    }
                } else {
                    $scope.GuarantorName = '';
                }
                if ($scope.currentfilter.GuarantorTypeId > 0) {
                    if (res.Data.length > 0) {
                        $scope.GuarantorType = insagingData.GuarantorType.Description;
                    }
                } else {
                    $scope.GuarantorType = '';
                }
                if (insagingData.GuarantorTypeId > 1) {
                    if (insagingData.GuarantorId > 0) {
                        var date1 = new Date(insagingData.BillDateTime);
                        var To = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
                        var date2 = new Date(To);
                        var difference_ms = date2.getTime() - date1.getTime();
                        difference_ms = difference_ms / 1000;
                        var seconds = Math.floor(difference_ms % 60);
                        difference_ms = difference_ms / 60;
                        var minutes = Math.floor(difference_ms % 60);
                        difference_ms = difference_ms / 60;
                        var hours = Math.floor(difference_ms % 24);
                        var days = Math.floor(difference_ms / 24);
                        var NoofDays = days + 1;
                        // if (insagingData.GuarantorType) {
                        //     insData.InsuranceType = insagingData.GuarantorType.Description;
                        // }
                        // if (insagingData.GuarantorMaster) {
                        //     insData.InsuranceName = insagingData.GuarantorMaster.GuarantorName;
                        // }
                        var InsuranceId = insagingData.GuarantorId;
                        if ($scope.currentfilter.dayscount == 1) {
                            if (NoofDays <= 30) {
                                vm.gridConfig.data.push(insagingData);
                            }
                        }

                        if ($scope.currentfilter.dayscount == 2) {
                            if (NoofDays > 30 && NoofDays <= 60) {
                                vm.gridConfig.data.push(insagingData);
                            }
                        }
                        if ($scope.currentfilter.dayscount == 3) {
                            if (NoofDays > 60 && NoofDays <= 90) {
                                vm.gridConfig.data.push(insagingData);
                            }
                        }
                        if ($scope.currentfilter.dayscount == 4) {
                            if (NoofDays > 90) {
                                vm.gridConfig.data.push(insagingData);
                            }
                        }
                    }
                }
            }
            for (var jdx in vm.gridConfig.data) {
                var item = vm.gridConfig.data[jdx];
                totaldueamount = totaldueamount + (item.OutStandingAmount);
            }
            $scope.TotalDueAmt = totaldueamount;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 61,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    // {
                    //     Key: 30,
                    //     Value: $scope.currentfilter.PrivateDueId
                    // },
                    {
                        Key: 63,
                        Value: '0'
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.billtypeId
                    },
                    // {
                    //     Key: 19,
                    //     Value: $scope.currentcontext.encTypeId
                    // },
                    {
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 21,
                        Value: false
                    },
                ],
            };
            var options = {
                action: 'billing/patientbills/GetPatientBillswithoutdetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function(data) {
            if (data == undefined) {
                $scope.getList();
            }
        };
        $scope.backtoReport = function() {
            if ($scope.Context == 'opinvoicebillingreport') {
                $state.go('app.billingreportstab.opinvoicebillingreport');
            }
            if ($scope.Context == 'collectionsummary') {
                $state.go('app.financereporttab.collectionsummary');
            }

        };
        $scope.print = function() {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    DueApproval: $scope.DueApproval,
                    GuarantorName: $scope.GuarantorName
                },
                Params: [{
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 61,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 30,
                        Value: $scope.currentfilter.PrivateDueId
                    },
                    {
                        Key: 45,
                        Value: '0'
                    },
                    {
                        Key: 6,
                        Value: [1, 5]
                    },
                    {
                        Key: 50,
                        Value: false
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintOutstandingReport',
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
                    field: "BillDateTime",
                    displayName: $translate.instant('reports.billdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "BillNumber",
                    displayName: $translate.instant('reports.billno.lbl')
                },
                {
                    field: "Patient Name",
                    displayName: $translate.instant('reports.patient.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>\
                                        </div>"
                },
                // {
                //     field: "ReferralName",
                //     displayName: $translate.instant('reports.referraldoctor.lbl')
                // },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('reports.billamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "BillDiscount",
                    displayName: $translate.instant('reports.billdis.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDiscount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "PaidAmount",
                    displayName: $translate.instant('reports.paidamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "OutStandingAmount",
                    displayName: $translate.instant('reports.dueamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "DueApproval",
                    displayName: $translate.instant('reports.dueapproval.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.PrivateDueId && entity.PrivateDue.Title && entity.PrivateDue.Title.Description'>{{entity.PrivateDue.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.PrivateDue.FirstName}}</span>&nbsp;<span>{{entity.PrivateDue.LastName}}</span>\
                                       <span ng-if='entity.GuarantorDueId'>{{entity.GuarantorName}}&nbsp;</span>\
                                        </div>"
                },
                {
                    field: "Comments",
                    displayName: $translate.instant('reports.remark.lbl')
                },
                {
                    field: "BilledBy",
                    displayName: $translate.instant('reports.billedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Updateduser.Title && entity.Updateduser.Title.Description'>{{entity.Updateduser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Updateduser.FirstName}}</span>&nbsp;<span>{{entity.Updateduser.LastName}}</span>\
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
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
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "PrivateDueApprover"
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

    agingoutstandingreportviewController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$uibModalInstance', 'modalConfig'];

})();