(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OPReferralDoctorReportController', OPReferralDoctorReportController);

    function OPReferralDoctorReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Visit Date", "Visit Number", "Patient Name", "MRN", "Doctor Name", "Payer Name", "Department", "Referral", "Type"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var visitDate = '';
                var visitno = '';
                var patname = '';
                var mrn = '';
                var docName = '';
                var insurance = '';
                var dept = '';
                var ref = '';
                var type = '';

                if (rowArray.AdmissionDate) {
                    // visitDate = rowArray.AdmissionDate;
                    visitDate = utl.Formatter.getDateTimeString(rowArray.AdmissionDate);
                }
                if (rowArray.VisitIdentifier) {
                    visitno = rowArray.VisitIdentifier;
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.Title) {
                        if (rowArray.Patient.Title.Description) {
                            patname += ' ' + rowArray.Patient.Title.Description;
                        }
                    }
                    if (rowArray.Patient.FirstName) {
                        patname += ' ' + rowArray.Patient.FirstName;
                    }
                    if (rowArray.Patient.LastName) {
                        patname += ' ' + rowArray.Patient.LastName;
                    }
                }
                if (rowArray.Patient) {
                    if (rowArray.Patient.MRN) {
                        mrn = rowArray.Patient.MRN;
                    }
                }
                if (rowArray.Doctor.Title) {
                    if (rowArray.Doctor.Title.Description) {
                        docName = rowArray.Doctor.Title.Description;
                    }
                }
                if (rowArray.Doctor.FirstName) {
                    docName += ' ' + rowArray.Doctor.FirstName;
                }
                if (rowArray.Doctor.LastName) {
                    docName += ' ' + rowArray.Doctor.LastName;
                }
                if (rowArray.Guarantor) {
                    if (rowArray.Guarantor.GuarantorName) {
                        insurance = rowArray.Guarantor.GuarantorName;
                    }
                }
                if (rowArray.Department) {
                    if (rowArray.Department.DepartmentName) {
                        dept = rowArray.Department.DepartmentName;
                    }
                }
                if (rowArray.Referral) {
                    if (rowArray.Referral.ReferralName) {
                        ref = rowArray.Referral.ReferralName;
                    }
                }
                if (rowArray.ReferralType) {
                    if (rowArray.ReferralType.Description) {
                        type = rowArray.ReferralType.Description;
                    }
                }
                csvContent += visitDate + ',' + visitno + ',' + patname + ',' + mrn + ',' + docName + ',' + insurance + ',' + dept + ',' + ref + ',' + type + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'opreferraldoctor-report.csv';
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
                    Key: 17,
                    Value: From
                },
                {
                    Key: 18,
                    Value: To
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 56,
                    Value: $scope.currentfilter.ReferralTypeId
                },
                {
                    Key: 15,
                    Value: 1
                },
                {
                    Key: 77,
                    Value: 9
                },
                ],

            };
            var options = {
                action: "Visit/Visit/GetEncounters",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;

            if ($scope.currentfilter.ReferralTypeId > 0) {
                $scope.ReferralType = res.Data[0].ReferralType.Description;
            }
            else {
                $scope.ReferralType = '';
            }
            if ($scope.currentfilter.GuarantorId > 0) {
                $scope.GuarantorName = res.Data[0].Guarantor.GuarantorName;
            }
            else {
                $scope.GuarantorName = '';
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
                    Key: 17,
                    Value: From
                },
                {
                    Key: 18,
                    Value: To
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 56,
                    Value: $scope.currentfilter.ReferralTypeId
                },
                {
                    Key: 15,
                    Value: 1
                },
                {
                    Key: 77,
                    Value: 9
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.ReferralId > 0) {
                inputData.Params.push({
                    Key: 41,
                    Value: $scope.currentfilter.ReferralId
                })
            }
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ReferralId > 1;
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'outpatientreport') {
                $state.go('app.ipopreportstab.outpatientreport');
            } if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
            } if ($scope.Context == 'financedashboard') {
                $state.go('app.financedashboard');
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
                    ReferralName: $scope.ReferralName,
                    ReferralType: $scope.ReferralType,
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
                    Key: 1,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 56,
                    Value: $scope.currentfilter.ReferralTypeId
                },
                {
                    Key: 15,
                    Value: 1
                },
                {
                    Key: 77,
                    Value: 9
                },
                ],
            };
            if ($scope.currentfilter.ReferralId > 0) {
                inputData.Params.push({
                    Key: 41,
                    Value: $scope.currentfilter.ReferralId
                })
            }
            var options = {
                action: 'Visit/Visit/PrintOPPatientReferralReport',
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
            $scope.ReferralName = result;
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [
                    {
                        Key: 8,
                        Value: 1
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (query && query.length > 2) {
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
                field: "AdmissionDate",
                displayName: $translate.instant('reports.visit.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "VisitIdentifier",
                displayName: $translate.instant('reports.opvisitnum.lbl')
            },
            {
                field: "FirstName",
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
                field: "FirstName",
                displayName: $translate.instant('reports.doctorname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Doctor.Title && entity.Doctor.Title.Description'>{{entity.Doctor.Title.Description}}&nbsp;</span>\
                <span>{{entity.Doctor.FirstName}}</span>&nbsp;<span>{{entity.Doctor.LastName}}</span>\
                 </div>"
            },
            {
                field: "Guarantor.GuarantorName",
                displayName: $translate.instant('reports.insurance.lbl')
            },
            {
                field: "Department.DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
            },
            {
                field: "Referral.ReferralName",
                displayName: $translate.instant('reports.referraldoctor.lbl')
            },
            {
                field: "ReferralType.Description",
                displayName: $translate.instant('reports.type.lbl')
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
                "Key": "Department"
            },
            {
                "Key": "AdmissionStatus"
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
                "Key": "ReferralType"
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

    OPReferralDoctorReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();