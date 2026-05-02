(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('opbilllinkingController', opbilllinkingController);

    function opbilllinkingController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentfilter = {
            facilityid: utl.Session.getCurrentFacilityId(),
            DoctorId: -1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            BillingStatusId: 1
        };


        // $scope.getListCallback = function (scope, data, options, hasError) {
        //     vm.gridConfig.data = [];
        //     for (var ex in data.Data) {
        //         var encItem = data.Data[ex];
        //         encItem.EncounterDoctorStatus = '';
        //         if (encItem.EncounterDoctors) {
        //             if (encItem.EncounterDoctors.length > 0) {
        //                 var encDoctor = encItem.EncounterDoctors[0];
        //                 if (encDoctor.EncounterDoctorStatus == 1) {
        //                     encItem.EncounterDoctorStatus = 'Pending';
        //                 }
        //                 if (encDoctor.EncounterDoctorStatus == 2) {
        //                     encItem.EncounterDoctorStatus = 'Consultation In-Progress';
        //                 }
        //                 if (encDoctor.EncounterDoctorStatus == 3) {
        //                     encItem.EncounterDoctorStatus = 'Completed';
        //                 }
        //             }
        //         }
        //         vm.gridConfig.data.push(encItem);
        //     }

        //     vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        // };

        // $scope.getListCallback = function (scope, data, options, hasError) {
        //     vm.gridConfig.data = [];
        //     for (var ex in data.Data) {
        //         var encItem = data.Data[ex];
        //         // encItem.EncounterDoctorStatus = '';
        //         if (encItem.EncounterDoctors) {
        //             if (encItem.EncounterDoctors.length > 0) {
        //                 for (var idx in encItem.EncounterDoctors) {
        //                     let temp = encItem;
        //                     temp.EncounterDoctorStatus = '';
        //                     var encDoctor = encItem.EncounterDoctors[idx];
        //                     // var encDoctor = encItem.EncounterDoctors[0];
        //                     if (encDoctor.EncounterDoctorStatus == 1) {
        //                         temp.EncounterDoctorStatus = 'Pending';
        //                     }
        //                     if (encDoctor.EncounterDoctorStatus == 2) {
        //                         temp.EncounterDoctorStatus = 'Consultation In-Progress';
        //                     }
        //                     if (encDoctor.EncounterDoctorStatus == 3) {
        //                         temp.EncounterDoctorStatus = 'Completed';
        //                     }
        //                     temp.DoctorId = encDoctor.DoctorId;
        //                     // encItem.DoctorName = encDoctor.DoctorName? encDoctor.DoctorName: '';
        //                     temp.Doctor = encDoctor.Doctor? encDoctor.Doctor: '';
        //                     temp.DepartmentId = encDoctor.DepartmentId;
        //                     temp.Department.DepartmentName = encDoctor.Department?encDoctor.Department.DepartmentName: '';
        //                     vm.gridConfig.data.push(temp);
        //                 }
        //             }

        //         }
        //     }
        //     vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        // };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.TokenNo = '';
                if (item.Appointment.AppointmentDisplays.length > 0) {
                    item.TokenNo = item.Appointment.AppointmentDisplays[0].TokenNo;
                }
                if (item.Patient) {
                    var regDate = new Date(item.Patient.RegisteredDate);
                    var todayDate = new Date();
                    if (utl.Formatter.isDateEquals(regDate, todayDate) === true) {
                        item.RegisterType = "New";
                    } else {
                        item.RegisterType = "Follow Up";
                    }
                    //console.log(utl.Formatter.isDateEquals(regDate,todayDate));
                    // console.log(regDate==todayDate) // false
                    // console.log(regDate.toDateString() == todayDate.toDateString())
                    vm.gridConfig.data.push(item);
                }
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;

        };

        // $scope.getList = function () {

        //     var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
        //     var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

        //     var inputData = {
        //         Params: [{
        //             Key: 1,
        //             Value: $scope.currentfilter.facilityid
        //         },
        //         {
        //             Key: 5,
        //             Value: $scope.currentfilter.DoctorId
        //         },
        //         {
        //             Key: 4,
        //             Value: $scope.currentfilter.PatientId
        //         },
        //         {
        //             Key: 6,
        //             Value: $scope.currentfilter.DepartmentId
        //         },
        //         {
        //             Key: 66,
        //             Value: $scope.currentfilter.BillingStatusId
        //         },
        //         {
        //             Key: 15,
        //             Value: 1
        //         },
        //         {
        //             Key: 35,
        //             Value: true
        //         },
        //         {
        //             Key: 17,
        //             Value: From
        //         },
        //         {
        //             Key: 18,
        //             Value: To
        //         },
        //         ],
        //         PageContext: {
        //             PageSize: vm.gridConfig.pagerObj.pageSize,
        //             PageNumber: vm.gridConfig.pagerObj.currentPage
        //         }
        //     };

        //     var options = {
        //         action: 'Visit/Visit/GetMinEncounters',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getListCallback
        //     };

        //     utl.Http.doAction(options);
        // };

        $scope.getList = function () {
            // if (!$scope.currentfilter.patientname) {
            //     // if ($scope.currentfilter.visitdate == null) {
            //     //     utl.Alert.showErrorMsg($translate.instant('Please Select Date...'));
            //     //     return false;
            //     // }
            // }
            var FrRegDt = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToRegDt = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: {
                            'AppointmentStatus': 6,
                            'My': false
                        }
                    },
                    // {
                    //     Key: 16,
                    //     Value: $scope.currentfilter.PatientId
                    // },
                    // {
                    //     Key: 13,
                    //     Value: $scope.currentfilter.DoctorId
                    // },
                    // {
                    //     Key: 12,
                    //     Value: $scope.currentfilter.DepartmentId
                    // },
                    // {
                    //     Key: 34,
                    //     Value: $scope.currentfilter.BillingStatusId
                    // },
                    {
                        Key: 10,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    // {
                    //     Key: 21,
                    //     Value: 1
                    // },
                    {
                        Key: 20,
                        Value: 1
                    },
                    // {
                    //     Key: 22,
                    //     Value: [FrRegDt, ToRegDt]
                    // }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            }
            if (!$scope.currentfilter.patientname) {
                inputData.Params.push({
                    Key: 22,
                    Value: [FrRegDt, ToRegDt]
                })
            }
            if ($scope.currentfilter.PatientId > 0) {
                inputData.Params.push({
                    Key: 16,
                    Value: $scope.currentfilter.PatientId
                })
            }
            if ($scope.currentfilter.DoctorId > 0) {
                inputData.Params.push({
                    Key: 13,
                    Value: $scope.currentfilter.DoctorId
                })
            }
            if ($scope.currentfilter.DepartmentId > 0) {
                inputData.Params.push({
                    Key: 12,
                    Value: $scope.currentfilter.DepartmentId
                })
            }
            if ($scope.currentfilter.BillingStatusId > 0) {
                inputData.Params.push({
                    Key: 34,
                    Value: $scope.currentfilter.BillingStatusId
                })
            }
            if (!$scope.currentfilter.patientname && $scope.currentfilter.consultationstatusid > 0) {
                inputData.Params.push({
                    Key: 4,
                    Value: $scope.currentfilter.consultationstatusid
                })
            }
            var options = {
                action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        vm.doctorcontrolconfig = {
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
                }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                // $scope.item.DoctorId = selectedItem.Id;
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName].join(' ');
            }
            $scope.DoctorName = result;
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
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
            if (vm.doctorcontrolconfig.searchbyid == true) {
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
            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.DoctorId = -1;
                $scope.getList();
            }
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'billing') {
                utl.Modal.open('app.updateconsbilling', {
                    params: {
                        eid: entity.EncounterId,
                        pid: entity.PatientId,
                        did: entity.DoctorId,
                        tp: 'OP'
                    },
                    confirmCallback: $scope.getList
                });
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
                    field: "Patient",
                    displayName: $translate.instant('admissions.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        //     '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                        //     '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)" >' +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                        "<span >/<span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents
                },
                {
                    field: "Age",
                    displayName: $translate.instant('Age/Sex'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}&nbsp;</span>"
                },
                {
                    field: "MRN",
                    displayName: $translate.instant('Patient ID'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.MRN}}</span>" + "</div>"
                },
                // {
                //     field: "Encounter.VisitType.Description",
                //     displayName: $translate.instant('Visit Type')
                // },
                {
                    field: "RegisterType",
                    displayName: $translate.instant('New/Follow-Up')
                },
                {
                    field: "Encounter.AdmissionDate",
                    displayName: $translate.instant('Visit Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Encounter.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.Encounter.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Doctor",
                    displayName: $translate.instant('currentinpatient.doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="handleEvents(\'patientinfo\',entity    )">' +
                        "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}</span>" +
                        "</span></div>"
                },
                // {
                //     field: "DoctorName",
                //     displayName: $translate.instant('currentinpatient.doctorname.lbl'),

                // },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('admissions.department.lbl')
                },
                {
                    field: "ConsultationStatus.Description",
                    displayName: $translate.instant('Consultation Status')
                },
                {
                    field: "Encounter.BillingRemarks",
                    displayName: $translate.instant('Billing Remarks')
                },
                {
                    field: "Encounter.BillingStatus.Description",
                    displayName: $translate.instant('Billing Status')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                <span class="grid-action" ng-click="handleEvents(\'billing\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                            </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }

        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    }]
                }
            }, {
                "Key": "BillingStatus"
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
    opbilllinkingController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();