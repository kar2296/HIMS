(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('InActivePatientReportController', InActivePatientReportController);

    function InActivePatientReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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

        
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Patient Name", "Age and Sex", "MRN", "Visit Date", "Referral", "City"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var name = '';
                var age = '';
                var mrn = '';
                var visit = '';
                var ref = '';
                var city = '';

                if (rowArray.Title) {
                if (rowArray.Title.Description) {
                    name = rowArray.Title.Description;
                }
                if (rowArray.FirstName) {
                    name += ' ' + rowArray.FirstName;
                }
                if (rowArray.LastName) {
                    name += ' ' + rowArray.LastName;
                }
            }
                if (rowArray.Age) {
                    age = rowArray.Age;
                }
                if (rowArray.Gender.Description) {
                    age += ' ' + rowArray.Gender.Description;
                }
                if (rowArray.MRN) {
                    mrn = rowArray.MRN;
                }
                if (rowArray.RegisteredDate) {
                    visit = rowArray.RegisteredDate;
                }
                if (rowArray.Referral) {
                    if (rowArray.Referral.ReferralName) {
                        ref = rowArray.Referral.ReferralName;
                    }
                }
                if (rowArray.CityMaster) {
                if (rowArray.CityMaster.CityName) {
                    city = rowArray.CityMaster.CityName;
                }
            }
                // if (rowArray.Remark) {
                //     if (rowArray.Remark.Remarks) {
                //         reason = rowArray.Remark.Remarks;
                //     }
                // }
                csvContent += name + ',' + age + ',' + mrn + ',' + visit + ',' + ref + ',' + city + ',' + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'inactivepatient-reports.csv';
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
                    Key: 33,
                    Value: From
                },
                {
                    Key: 34,
                    Value: To
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 11,
                    Value: $scope.currentfilter.ReferrerId
                },
                {
                    Key: 7,
                    Value: 3
                }
                ],

            };
            var options = {
                action: "registration/patient/GetPatients",
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
                item.EncounterData = item.Encounters[0];
                vm.gridConfig.data.push(item);
            }

            if ($scope.currentfilter.ReferrerId > 0) {
                $scope.ReferralName = res.Data[0].Referral.ReferralName;
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
                    Key: 33,
                    Value: From
                },
                {
                    Key: 34,
                    Value: To
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 11,
                    Value: $scope.currentfilter.ReferrerId
                },
                {
                    Key: 7,
                    Value: 3
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'registration/patient/GetPatients',
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
            if ($scope.Context == 'outpatientreport') {
                $state.go('app.ipopreportstab.outpatientreport');
            } if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
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
                    ReferrerName: $scope.ReferralName
                },
                Params: [{
                    Key: 33,
                    Value: From
                },
                {
                    Key: 34,
                    Value: To
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 11,
                    Value: $scope.currentfilter.ReferrerId
                },
                {
                    Key: 7,
                    Value: 3
                },
                ],
            };
            var options = {
                action: 'registration/patient/PrintInActivePatientList',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        vm.referralcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Referral Code',
                field: 'ReferralCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Referral Name',
                field: 'ReferralName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Referral Type',
                field: 'ReferralType',
                datatype: 'string',
                headercls: 'td-type',
                fieldcls: 'td-type'
            },
            {
                header: 'PhoneNo',
                field: 'PhoneNo',
                datatype: 'string',
                headercls: 'td-phone',
                fieldcls: 'td-phone'
            },
            {
                header: 'Area',
                field: 'Area',
                datatype: 'string',
                headercls: 'td-area',
                fieldcls: 'td-area'
            }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/referral/GetReferrals',
            formatdisplay: formatselectedreferral,
            presearch: presearchreferral,
            postsearch: postsearchreferral
        };

        function formatselectedreferral() {
            var selectedItem = vm.referralcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
            } else if (vm.referralcontrolconfig.rowdata) {
                result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
            }
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.referralcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.ReferralId
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.referralcontrolconfig.searchparams = inputData;
        }

        function postsearchreferral() {
            for (var idx in vm.referralcontrolconfig.result) {
                var item = vm.referralcontrolconfig.result[idx];
                item.ReferralCode = item.ReferralCode;
                if (item.ReferralType)
                    item.ReferralType = item.ReferralType.Description;
                item.PhoneNo = item.PhoneNo;
                if (item.AddressLine1)
                    item.Area = item.AddressLine1 + ',' + item.CityName;
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Title && entity.Title.Description'>{{entity.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.FirstName}}</span>&nbsp;<span>{{entity.LastName}}</span>\
                                        </div>"
            },
            {
                field: "Age",
                displayName: $translate.instant('reports.age.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                           <span>{{entity.Age}}</span>&nbsp;/<span>{{entity.Gender.Description}}</span>\
                                     </div>"
            },
            {
                field: "MRN",
                displayName: $translate.instant('reports.mrn.lbl')
            },

            {
                field: "RegisteredDate",
                displayName: $translate.instant('reports.visit.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RegisteredDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "Referral.ReferralName",
                displayName: $translate.instant('reports.referraldoctor.lbl')
            },
            {
                field: "City",
                displayName: $translate.instant('reports.city.lbl') 
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
            }]
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

    InActivePatientReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();