(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentpatientfromappreportController', appointmentpatientfromappreportController);

    function appointmentpatientfromappreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            DoctorId: -1,
        };
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Patient Name", "MRN", "Age", "Gender", "Schedule Date", "Remark", "Doctor Name", "Booked Date", "AppointmentStatus", "Consult Type"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var patName = '';
                var mrn = '';
                var age = '';
                var gender = '';
                var schedule = '';
                var remark = '';
                var docName = '';
                var bookedDate = '';
                var appointment = '';
                var consulty = '';

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
                if (rowArray.Patient.Age) {
                    age = rowArray.Patient.Age;
                }
                if (rowArray.Patient.Gender.Description) {
                    gender = rowArray.Patient.Gender.Description;
                }
                if (rowArray.AppointmentDate) {
                    schedule = rowArray.AppointmentDate;
                }
                if (rowArray.StartTime) {
                    schedule += ' ' + rowArray.StartTime;
                }
                if (rowArray.EndTime) {
                    schedule += ' ' + rowArray.EndTime;
                }
                if (rowArray.Remark) {
                    if (rowArray.Remark.Remarks) {
                        remark = rowArray.Remark.Remarks;
                    }
                }

                if (rowArray.User.Title.Description) {
                    docName = rowArray.User.Title.Description;
                }
                if (rowArray.User.FirstName) {
                    docName += ' ' + rowArray.User.FirstName;
                }
                if (rowArray.User.LastName) {
                    docName += ' ' + rowArray.User.LastName;
                }
                if (rowArray.CreatedAt) {
                    bookedDate = rowArray.CreatedAt;
                }
                if (rowArray.AppointmentStatus.Description) {
                    appointment = rowArray.AppointmentStatus.Description;
                }
                if (rowArray.VirtualOrder.OrderConsultType) {
                if (rowArray.VirtualOrder.OrderConsultType.Description) {
                    consulty = rowArray.VirtualOrder.OrderConsultType.Description;
                }
            }
                csvContent += patName + ',' + mrn + ',' + age + ',' + gender + ',' + schedule + ',' + remark + ',' + docName + ',' + bookedDate + ',' + appointment + ',' + consulty + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'appointmentpatientfromapp-report.csv';
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
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                    {
                        Key: 21,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 20,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 7,
                        Value: 2
                    },
                    {
                        Key: 22,
                        Value: true
                    }
                ],

            };
            var options = {
                action: "appointment/Appointment/GetAppointments",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };



        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            // for (var idx in res.Data) {
            //     var item = res.Data[idx]; 
            //     vm.gridConfig.data.push(item);
            // }  
            $scope.DoctorName = '';
            if ($scope.currentfilter.DoctorId > 0) {
                if (res.Data[0].User.Title)
                    $scope.DoctorName = res.Data[0].User.Title.Description;
                if (res.Data[0].User.FirstName)
                    $scope.DoctorName += res.Data[0].User.FirstName;
                if (res.Data[0].User.LastName)
                    $scope.DoctorName += res.Data[0].User.LastName;
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
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                    {
                        Key: 21,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 20,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 7,
                        Value: 2
                    },
                    {
                        Key: 22,
                        Value: true
                    },
                    // {
                    //     Key: 52,
                    //     Value: true
                    // },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'appointment/Appointment/GetAppointments',
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
            }
            if ($scope.Context == 'mrdreports') {
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
                    DoctorName: $scope.DoctorName,

                },
                Params: [{
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                    {
                        Key: 21,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 20,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 7,
                        Value: 2
                    },
                    {
                        Key: 22,
                        Value: true
                    },
                ],
            };
            var options = {
                action: 'appointment/Appointment/PrintAppointmentPatientfromAppReport',
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
                    field: "FirstName",
                    displayName: $translate.instant('reports.patient.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>&nbsp;/<span>{{entity.Patient.MRN}}</span>&nbsp;/<span>{{entity.Patient.Age}}</span>&nbsp;/<span>{{entity.Patient.Gender.Description}}</span></a></div>"
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('reports.mrn.lbl')
                },
                {
                    field: "Patient.Age",
                    displayName: $translate.instant('Age')
                },
                {
                    field: "Patient.Gender.Description",
                    displayName: $translate.instant('Gender')
                },
                {
                    field: "AppointmentDate",
                    displayName: $translate.instant('Schedule Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AppointmentDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.StartTime}}</span>" + "<span >{{entity.EndTime}}</span>" + "</div>"
                },
                {
                    field: "Remark.Remarks",
                    displayName: $translate.instant('Remark')
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
                    field: "CreatedAt",
                    displayName: $translate.instant('Booked Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "AppointmentStatus.Description",
                    displayName: $translate.instant('AppointmentStatus')
                },
                {
                    field: "VirtualOrder.OrderConsultType.Description",
                    displayName: $translate.instant('Consult Type')
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

    appointmentpatientfromappreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();