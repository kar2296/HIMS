(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingprescriptionreportController', pendingprescriptionreportController);

    function pendingprescriptionreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
        $scope.CanShowPrint = false;
        $scope.lookup = {};


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Prescription Date", "	Prescription", "Priority", "Doctor Name", "DrugName", "Quantity", "Instruction"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var prescribeDate = '';
                var prescribe = '';
                var priority = '';
                var docName = '';
                var drugName = '';
                var qty = '';
                var instruct = '';


                if (rowArray.Prescription.PrescriptionDate) {
                    // prescribeDate = rowArray.Prescription.PrescriptionDate;
                    // prescribeDate = $filter('date')(rowArray.PrescriptionDate, 'yyyy-MM-dd') || null;
                    prescribeDate = utl.Formatter.getDateTimeString(rowArray.PrescriptionDate);
                }
                if (rowArray.Prescription.Identifier) {
                    prescribe = rowArray.Prescription.Identifier;
                }

                if (rowArray.Prescription.PrescriptionPriority.Description) {
                    priority = rowArray.Prescription.PrescriptionPriority.Description;
                }
                if (rowArray.Prescription.Doctor.Title.Description) {
                    docName = rowArray.Prescription.Doctor.Title.Description;
                }
                if (rowArray.Prescription.Doctor.FirstName) {
                    docName += ' ' + rowArray.Prescription.Doctor.FirstName;
                }
                if (rowArray.Prescription.Doctor.LastName) {
                    docName += ' ' + rowArray.Prescription.Doctor.LastName;
                }

                if (rowArray.DrugName) {
                    drugName = rowArray.DrugName;
                }
                if (rowArray.Quantity) {
                    qty = rowArray.Quantity;
                }
                if (rowArray.DrugInstruction) {
                    if (rowArray.DrugInstruction.Description) {
                        instruct = rowArray.DrugInstruction.Description;
                    }
                }
                docName = docName.replace(/,/g, " ");
                docName = docName.replace(/ /g, " ");

                csvContent += prescribeDate + ',' + prescribe + ',' + priority + ',' + docName + ',' + drugName + ',' + qty + ',' + instruct + "\n";
            });
            // var encodedUri = encodeURI(csvContent);
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'pendingprescriptionreport.csv';
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
                    Key: 7,
                    Value: From
                },
                {
                    Key: 8,
                    Value: To
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.DoctorId
                }
                ],

            };
            var options = {
                action: "patientemr/PrescriptionDetail/GetPrescriptionDetails",
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

                vm.gridConfig.data.push(item);
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
                    Key: 7,
                    Value: From
                },
                {
                    Key: 8,
                    Value: To
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.DoctorId
                }],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/PrescriptionDetail/GetPrescriptionDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.StaffId = -1
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.pharmacytabreport.invoicecollectionreport')
        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    FacilityId: $scope.currentfilter.FacilityId,
                    DoctorName: $scope.DoctorName,
                    // StoreMasterId: $scope.currentfilter.StoreMasterId,
                },
                Params: [{
                    Key: 7,
                    Value: From
                },
                {
                    Key: 8,
                    Value: To
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.DoctorId
                }
                ],
            };
            var options = {
                action: 'emr/PrescriptionDetail/PrintPendingPrescriptionReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.staffcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Staff Id',
                field: 'UserId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Staff Name',
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
            var selectedItem = vm.staffcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.staffcontrolconfig.rowdata) {
                result = [vm.staffcontrolconfig.rowdata.UserId, vm.staffcontrolconfig.rowdata.UserName].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.staffcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 19,
                    Value: true
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.staffcontrolconfig.searchbyid == true) {
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

            vm.staffcontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.staffcontrolconfig.result) {
                var item = vm.staffcontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "Prescription.PrescriptionDate",
                displayName: $translate.instant('Prescription Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Prescription.PrescriptionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.Prescription.PrescriptionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "Prescription.Identifier",
                displayName: $translate.instant('Prescription #')
            },
            {
                field: "Prescription.PrescriptionPriority.Description",
                displayName: $translate.instant('Priority')

            },
            {
                field: "Doctor Name",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Prescription.Doctor.Title && entity.Prescription.Doctor.Title.Description'>{{entity.Prescription.Doctor.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Prescription.Doctor.FirstName}}</span>&nbsp;<span>{{entity.Prescription.Doctor.LastName}}</span>\
                                        </div>"
            },
            {
                field: "DrugName",
                displayName: $translate.instant('DrugName')

            },
            {
                field: "Quantity",
                displayName: $translate.instant('Quantity')
            },
            {
                field: "DrugInstruction.Description",
                displayName: $translate.instant('Instruction')
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
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
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

    pendingprescriptionreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();