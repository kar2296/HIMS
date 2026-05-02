(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AppointmentBillPendinglistController', AppointmentBillPendinglistController);

    function AppointmentBillPendinglistController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;
        // angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        vm.appointment = {
            ShowCalendar: false
        };

        $scope.appointmentList = [];
        $scope.appointmentSessionList = [];

        $scope.currentcontext = {
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.CanDocFilter = false;
        $scope.currentfilter = {
            FacilityId: parseInt(utl.Session.getCurrentFacilityId()),
            PatientBillStatusId: 1,
            Billdatetime: utl.Formatter.getCurrentDate()
        };
        if ($scope.currentfilter.UserTypeId == 2) {
            $scope.CanDocFilter = true;
        }
        $scope.currentcontext.ct = $stateParams.ct;

        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId();
        }


        //Defaulting
        function setDefaults() {
            if ($scope.currentcontext.ct == 'ris') {
                $scope.currentfilter.AppointmentTypeId = 2;
                $scope.currentcontext.candisableappttype = true;
            } else {
                $scope.currentfilter.AppointmentTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Physician');
            }
        }

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            var items = res.Data;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            // if (!$scope.currentfilter.appointmentdate) return;

            var From = $filter('date')($scope.currentfilter.Billdatetime, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.Billdatetime, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.PatientBillStatusId
                    },
                    {
                        Key: 64,
                        Value: true
                    },
                    {
                        Key: 17,
                        Value: From
                    },
                    {
                        Key: 18,
                        Value: To
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'bill') {
                $state.go('app.clinicalapnmntbilling', {
                    bid: entity.Id,
                    pid: entity.PatientId,
                })
            }
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "BillNumber",
                displayName: $translate.instant('billing.findbill-list.billnumber.lbl')
            },
            {
                field: "Patient.MRN",
                displayName: $translate.instant('billing.findbill-list.mrn.lbl')
            },
            {
                field: "PatientName",
                displayName: $translate.instant('billing.findbill-list.patientname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.FirstName}}" tooltip-placement="left" >' +
                    "<span ><b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                    "<span >{{entity.Patient.LastName}}&nbsp;</span>" +
                    "</a></div>"
            },
            {
                field: "Date",
                displayName: $translate.instant('billing.findbill-list.date.lbl'),
                cellTemplate: "<ngformatdate datetime-val='entity.BillDateTime'></ngformatdate>"
            },
            {
                field: "BillAmount",
                displayName: $translate.instant('billing.findbill-list.billamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillAmount}}</span>" + "</div>"
            },
            {
                field: "BillDiscount",
                displayName: $translate.instant('billing.findbill-list.disamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDiscount}}</span>" + "</div>"
            },
            {
                field: "PaidAmount",
                displayName: $translate.instant('billing.findbill-list.paidamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PaidAmount}}</span>" + "</div>"
            },
            {
                field: "OutStandingAmount",
                displayName: $translate.instant('billing.findbill-list.dueamount.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.OutStandingAmount}}</span>" + "</div>"
            },
            {
                field: "PatientBillStatus.Description",
                displayName: $translate.instant('billing.findbill-list.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div  class="ui-grid-cell-contents">\
                   <span class="grid-action"  ng-click="handleEvents(\'bill\',entity)" ><i class="fa fa-pencil-square-o" aria-hidden="true" uib-tooltip="Edit" tooltip-placement="bottom"></i></span>\
                         </div>',
                handleEvent: $scope.handleEvents,
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            enableFullRowSelection: true


        };


        //Appointment category area ends
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "PatientBillStatus"
            },
            {
                "Key": "Department"
            },
            {
                "Key": "AppointmentType"
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
                "Key": "Resource"
            },
            {
                "Key": "AppointmentStatus"
            },
            {
                "Key": "Referral"
            },
            {
                "Key": "VisitType"
            },
            {
                "Key": "Priority"
            },
            {
                "Key": "AppointmentCategory"
            }
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

    AppointmentBillPendinglistController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();