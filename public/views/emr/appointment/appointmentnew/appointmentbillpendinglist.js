(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AppointmentBillPendinglistController', AppointmentBillPendinglistController);

    function AppointmentBillPendinglistController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;

        vm.appointment = {
            ShowCalendar: false
        };

        $scope.appointmentList = [];
        $scope.appointmentSessionList = [];
        $scope.isGridLoading = false;

        $scope.currentcontext = {};
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
            Billdatetime: utl.Formatter.getCurrentDate(),
            SearchQuery: ''
        };

        if (utl.Session.getUserTypeId() == 2) { // 2 => Physician
            $scope.CanDocFilter = true;
            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId();
        }

        $scope.currentcontext.ct = $stateParams.ct;

        // Defaulting
        function setDefaults() {
            if ($scope.currentcontext.ct == 'ris') {
                $scope.currentfilter.AppointmentTypeId = 2;
                $scope.currentcontext.candisableappttype = true;
            } else if ($scope.lookup && $scope.lookup.AppointmentType) {
                $scope.currentfilter.AppointmentTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Physician');
            }
        }

        // React Bridge State & Dispatcher
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: (vm.gridConfig && vm.gridConfig.data) ? vm.gridConfig.data : [],
                totalItems: (vm.gridConfig && vm.gridConfig.pagerObj) ? vm.gridConfig.pagerObj.totalItems : 0,
                pageSize: (vm.gridConfig && vm.gridConfig.pagerObj) ? vm.gridConfig.pagerObj.pageSize : 25,
                currentPage: (vm.gridConfig && vm.gridConfig.pagerObj) ? vm.gridConfig.pagerObj.currentPage : 1,
                lookup: $scope.lookup || {},
                currentfilter: $scope.currentfilter || {},
                currentcontext: $scope.currentcontext || {},
                canDocFilter: !!$scope.CanDocFilter,
                loading: !!$scope.isGridLoading
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            $scope.$evalAsync(function () {
                switch (actionName) {
                    case 'bill':
                    case 'edit':
                        if (payload) {
                            $scope.handleEvents('bill', payload);
                        }
                        break;
                    case 'patientinfo':
                        if (payload) {
                            var pid = payload.PatientId || (payload.Patient && payload.Patient.Id) || payload.pid || payload;
                            $scope.patientprofiledetails(pid);
                        }
                        break;
                    case 'filterChange':
                        if (payload && payload.currentfilter) {
                            angular.extend($scope.currentfilter, payload.currentfilter);
                            if (payload.currentPage) {
                                vm.gridConfig.pagerObj.currentPage = payload.currentPage;
                            } else {
                                vm.gridConfig.pagerObj.currentPage = 1;
                            }
                            $scope.getList();
                        }
                        break;
                    case 'pageChange':
                        if (payload && payload.page) {
                            vm.gridConfig.pagerObj.currentPage = payload.page;
                            $scope.getList();
                        }
                        break;
                    case 'refresh':
                        $scope.getList();
                        break;
                    case 'resetFilters':
                        $scope.currentfilter.PatientBillStatusId = 1;
                        $scope.currentfilter.Billdatetime = utl.Formatter.getCurrentDate();
                        $scope.currentfilter.SearchQuery = '';
                        if (utl.Session.getUserTypeId() == 2) {
                            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId();
                        } else {
                            $scope.currentfilter.DoctorId = undefined;
                        }
                        setDefaults();
                        vm.gridConfig.pagerObj.currentPage = 1;
                        $scope.getList();
                        break;
                    default:
                        console.warn('Unhandled React action in AppointmentBillPendinglistController:', actionName, payload);
                }
                $scope.refreshReactProps();
            });
        };

        // getList callback
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.isGridLoading = false;
            var items = (!hasError && res && res.Data) ? res.Data : [];
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = (!hasError && res && res.PageContext && res.PageContext.TotalRecords !== undefined)
                ? res.PageContext.TotalRecords
                : items.length;
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            $scope.isGridLoading = true;
            $scope.refreshReactProps();

            var From = $filter('date')($scope.currentfilter.Billdatetime, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.Billdatetime, 'yyyy-MM-dd 23:59:59') || null;

            var params = [
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
            ];

            if ($scope.currentfilter.DoctorId && $scope.currentfilter.DoctorId > 0) {
                params.push({
                    Key: 7,
                    Value: $scope.currentfilter.DoctorId
                });
            }

            if ($scope.currentfilter.SearchQuery && $scope.currentfilter.SearchQuery.trim()) {
                params.push({
                    Key: 13,
                    Value: $scope.currentfilter.SearchQuery.trim()
                });
            }

            var inputData = {
                Params: params,
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
            if (actionType === 'bill') {
                $state.go('app.clinicalapnmntbilling', {
                    bid: entity.Id,
                    pid: entity.PatientId
                });
            } else if (actionType === 'patientinfo') {
                var pid = entity.PatientId || (entity.Patient && entity.Patient.Id);
                if (pid) {
                    $scope.patientprofiledetails(pid);
                }
            }
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "BillNumber",
                    displayName: $translate.instant('billing.findbill-list.billnumber.lbl')
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('billing.findbill-list.mrn.lbl')
                },
                {
                    field: "PatientName",
                    displayName: $translate.instant('billing.findbill-list.patientname.lbl')
                },
                {
                    field: "Date",
                    displayName: $translate.instant('billing.findbill-list.date.lbl')
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('billing.findbill-list.billamount.lbl')
                },
                {
                    field: "BillDiscount",
                    displayName: $translate.instant('billing.findbill-list.disamount.lbl')
                },
                {
                    field: "PaidAmount",
                    displayName: $translate.instant('billing.findbill-list.paidamount.lbl')
                },
                {
                    field: "OutStandingAmount",
                    displayName: $translate.instant('billing.findbill-list.dueamount.lbl')
                },
                {
                    field: "PatientBillStatus.Description",
                    displayName: $translate.instant('billing.findbill-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl')
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            data: [],
            enableFullRowSelection: true
        };

        // Lookup initialization
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.refreshReactProps();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
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
        };

        $scope.initLookup();
        $scope.refreshReactProps();
    }

    AppointmentBillPendinglistController.$inject = [
        '$rootScope',
        '$scope',
        '$stateParams',
        '$state',
        '$translate',
        'utl',
        '$timeout',
        '$filter'
    ];

})();