(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('generalexpensereportController', generalexpensereportController);

    function generalexpensereportController($scope, $stateParams, $state, $translate, $filter, utl, $timeout, $rootScope) {
        var vm = this;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            //             UserName: utl.Session.getCurrentUserName(),
        };
        $scope.CanShowPrint = false;
        $scope.lookup = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.backtoReport = function () {
            if ($scope.Context == 'opinvoicebillingreport') {
                $state.go('app.billingreportstab.opinvoicebillingreport');
            }
            if ($scope.Context == 'collectionsummary') {
                $state.go('app.financereporttab.collectionsummary');
            }

        };
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "Voucher No", "PaidTo", "Amount", "User", "Type", "Narration", "Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var date = '';
                var voucher = '';
                var name = '';
                var amt = '';
                var billedBy = '';
                var type = '';
                var narration = '';
                var status = '';

                if (rowArray.ExpenseDate) {
                    // date = rowArray.ExpenseDate;
                    // date = $filter('date')(rowArray.ExpenseDate, 'yyyy-MM-dd') || null;
                    date = utl.Formatter.getDateTimeString(rowArray.ExpenseDate);
                }

                if (rowArray.VoucherNo) {
                    voucher = rowArray.VoucherNo;
                }
                if (rowArray.Name) {
                    name = rowArray.Name;
                }
                if (rowArray.ExpenseAmount) {
                    amt = rowArray.ExpenseAmount;
                }
                if (rowArray.RequestedUser) {
                    if (rowArray.RequestedUser.Title) {
                        if (rowArray.RequestedUser.Title.Description) {
                            billedBy = rowArray.RequestedUser.Title.Description;
                        }
                    }
                    if (rowArray.RequestedUser.FirstName) {
                        billedBy += ' ' + rowArray.RequestedUser.FirstName;
                    }
                    if (rowArray.RequestedUser.LastName) {
                        billedBy += ' ' + rowArray.RequestedUser.LastName;
                    }
                }
                if (rowArray.GeneralExpenseType) {
                    if (rowArray.GeneralExpenseType.Description) {
                        type = rowArray.GeneralExpenseType.Description;
                    }
                }
                if (rowArray.Remarks) {
                    narration = rowArray.Remarks;
                }
                if (rowArray.GeneralExpenseStatus) {
                    if (rowArray.GeneralExpenseStatus.Description) {
                        status = rowArray.GeneralExpenseStatus.Description;
                    }
                }
                csvContent += date + ',' + voucher + ',' + name + ',' + amt + ',' + billedBy + ',' + type + ',' + narration + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'generalexpense-reports.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalNetamount = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd') || null;

            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.ExpenseTypeId
                },
                {
                    Key: 5,
                    Value: From
                },
                {
                    Key: 6,
                    Value: To
                },
                ],

            };
            var options = {
                action: "Billing/GeneralExpenses/GetGeneralExpensess",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            var totalamount = 0;
            for (var idx in data.Data) {
                var item = data.Data[idx];
                if ($scope.currentfilter.ExpenseTypeId > 0) {
                    if (data.Data.length > 0) {
                        $scope.ExpenseType = item.GeneralExpenseType.Description;
                    }
                } else {
                    $scope.ExpenseType = '';
                }
                item.ExpenseAmount = isNaN(parseFloat(item.ExpenseAmount)) ? (0) : parseFloat(item.ExpenseAmount);

                totalamount = totalamount + (item.ExpenseAmount)

                vm.gridConfig.data.push(item);
            }
            $scope.TotalNetamount = totalamount;
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
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
                $scope.TotalNetamount = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd') || null;

            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.ExpenseTypeId
                },
                {
                    Key: 5,
                    Value: From
                },
                {
                    Key: 6,
                    Value: To
                },


                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/GeneralExpenses/GetGeneralExpensess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.UserId = -1;
                $scope.getList();
            }
        };
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
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
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.UserName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    // { Key: 3, Value: 2 }
                ],
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
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    UserName: $scope.UserName,
                    User: $scope.currentfilter.UserId,
                    ExpenseType: $scope.ExpenseType

                },
                Params: [{
                    Key: 3,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.ExpenseTypeId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 5,
                    Value: From
                },
                {
                    Key: 6,
                    Value: To
                },


                ],

            };

            var options = {
                action: 'Billing/GeneralExpenses/PrintGeneralExpenseList',
                data: inputData,
                type: 'post',
            };

            utl.Http.doDownload(options);
        };
        // var rowtpl = '<div ng-class="{\'GeneralExpenseStatus\':entity.ExpenseStatusId==3 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            // rowTemplate: rowtpl,
            columnDefs: [{
                field: "idx",
                displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span>{{index+1}} </span> </div>"
            },
            {
                field: "ExpenseDate",
                displayName: $translate.instant('billing.generalexpenses.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span>{{entity.ExpenseDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.ExpenseDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "VoucherNo",
                displayName: $translate.instant('billing.generalexpenses.voucherno.lbl'),

            },
            {
                field: "GeneralExpenseType.Description",
                displayName: $translate.instant('billing.generalexpenses.type.lbl'),

            },
            {
                field: "Name",
                displayName: $translate.instant('Paid To'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Name}}&nbsp;</span>" + "</div>"
            },
            {
                field: "ExpenseAmount",
                displayName: $translate.instant('billing.generalexpenses.amount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ExpenseAmount | displaycurrency}}</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span class='pl-3' >{{entity.ExpenseAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "RequestedUser",
                displayName: $translate.instant('User'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.RequestedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.RequestedUser.LastName}}</span>" + "</div>"
            },
            {
                field: "Remarks",
                displayName: $translate.instant('Narration'),

            },

            {
                field: "GeneralExpenseStatus.Description",
                displayName: $translate.instant('billing.generalexpenses.status.lbl'),

            }
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
        };
        $scope.initLookup = function () {
            var inputData = [{
                "Key": "GeneralExpenseStatus"
            },
            {
                "Key": "GeneralExpenseType"
            },
            {
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },

            ];

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
    generalexpensereportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout', '$rootScope'];

})();