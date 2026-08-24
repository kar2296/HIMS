(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PendingOrderListController', PendingOrderListController);

    function PendingOrderListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.Items = [];
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({ $scope: $scope }));
        $scope.currentfilter = {
            orderpriorityid: -1,
            orderstatusid: 1,
            patient: '',
            WardId: -1,
            TestTypeId: -1,
            OrderDate: utl.Formatter.getCurrentDate()
        };
        $scope.advancedfilter = {
            From: '',
            To: '',
        };


        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.currentcontext = {};




        //get list
        $scope.custom_sort = function (a, b) {
            return new Date(b.OrderRequestDate).getTime() - new Date(a.OrderRequestDate).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.OrderDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentfilter.OrderDate, 'yyyy-MM-dd 23:59:59');
            // if ($scope.advancedfilter.From || $scope.advancedfilter.To || $scope.currentfilter.patient ||
            //     $scope.currentfilter.OrderNumber) {
            //     $scope.currentfilter.OrderDate = '';
            // }
            var inputData = {
                Params: [
                    { Key: 8, Value: $scope.currentfilter.patient },
                    { Key: 4, Value: $scope.currentfilter.orderstatusid },
                    // { Key: 6, Value: $scope.currentfilter.OrderNumber },
                    // { Key: 7, Value: [FrmDate, ToDate] },
                    // { Key: 11, Value: $scope.currentfilter.OrderFromId },
                    // { Key: 10, Value: $scope.advancedfilter.DoctorId },
                    // { Key: 3, Value: $scope.advancedfilter.orderpriorityid },
                    // { Key: 4, Value: $scope.advancedfilter.orderstatusid },
                    // { Key: 6, Value: $scope.advancedfilter.OrderNumber },
                    // { Key: 11, Value: $scope.advancedfilter.OrderFromId },
                    // { Key: 12, Value: $scope.advancedfilter.From },
                    // { Key: 13, Value: $scope.advancedfilter.To },
                    { Key: 12, Value: FrmDate },
                    { Key: 13, Value: ToDate }
                    // { Key: 14, Value: $scope.advancedfilter.OrderToId },
                    // { Key: 15, Value: $scope.currentfilter.TestTypeId },
                    //{ Key: 20, Value: $scope.currentfilter.VisitTypeId },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };



            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        //Grid Actions
        $scope.addNewOrder = function () {
            if (!isMainContext())
                if ($scope.currentcontext.encounter.IsBillLock == false) {
                    $state.go(formState, { id: 0, pid: $scope.currentcontext.pid, testtype: $scope.currentfilter.TestTypeId });
                } else
                    utl.Alert.showErrorMsg(" Bill is Locked");
            else {
                $state.go(formState, { id: 0, pid: $scope.currentcontext.pid, testtype: $scope.currentfilter.TestTypeId }); $state.go(formState, { id: 0, pid: $scope.currentcontext.pid, testtype: $scope.currentfilter.TestTypeId });
            }
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientorder/DeletePatientOrder',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'opbillinglist') {
                $state.go('app.opbilling-list', { id: row.entity.PatientId, orderdetails: row.entity.PatientOrderDetails });
                // $state.go(formState, { id: row.entity.Id, pid: row.entity.PatientId, testtype: $scope.currentfilter.TestTypeId });
            } else if (actionType == 'dgbillinglist') {
                $state.go('app.opbilling-list', { id: row.entity.PatientId, orderdetails: row.entity.PatientOrderDetails, tp: 'DG' });
            } else if (actionType == 'b2bbillinglist') {
                $state.go('app.b2bbilling-form', { id: row.entity.PatientId, billingorderdetails: row.entity.PatientOrderDetails });

                // $state.go(formState, { id: row.entity.Id, pid: row.entity.PatientId, testtype: $scope.currentfilter.TestTypeId });
            }

        }
        vm.gridConfig = {
            columnDefs: [
                {
                    field: "OrderRequestDate",
                    displayName: $translate.instant('patientemr.patientorder-list.ordereddateandtime.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.OrderRequestDate'></ngformatdate>"
                },
                { field: "Patient.MRN", displayName: $translate.instant('patientemr.patientorder-list.mrn.lbl') },
                {
                    field: "Patient.FirstName",
                    displayName: $translate.instant('patientemr.patientorder-list.patient.lbl'),
                    width: '20%',
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                        <span ng-if="row.entity.Patient.Title && row.entity.Patient.Title.Description">{{row.entity.Patient.Title.Description}}&nbsp;</span>\
                                                        <span>{{row.entity.Patient.FirstName}}</span>&nbsp;<span>{{row.entity.Patient.LastName}}</span>\
                                                </div>'
                },
                {
                    field: "OrderedBy", displayName: $translate.instant('patientemr.patientorder-list.orderedby.lbl'),
                    cellTemplate: "<displayuser user='row.entity.User'></displayuser>"
                },
                { field: "OrderNumber", displayName: $translate.instant('patientemr.patientorder-list.orderedno.lbl') },
                {
                    field: "Patient.FirstName",
                    displayName: $translate.instant('patientemr.patientorder-list.referredby.lbl'),
                    width: '20%',
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                        <span ng-if="row.entity.Patient.Title && row.entity.Patient.Title.Description">{{row.entity.Patient.Title.Description}}&nbsp;</span>\
                                                        <span>{{row.entity.Patient.FirstName}}</span>&nbsp;<span>{{row.entity.Patient.LastName}}</span>\
                                                </div>'
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                     <span class=" text-white btn btn-sm" ng-click="grid.appScope.handleEvents(\'b2bbillinglist\',row)"><a translate="B2B"></a></span>\
                     <span class=" text-white btn btn-sm" ng-click="grid.appScope.handleEvents(\'opbillinglist\',row)"><a translate="registration.patientsearch.opb.lbl"></a></span>\
                     <span class=" text-white btn btn-sm" ng-click="grid.appScope.handleEvents(\'dgbillinglist\',row)"><a translate="DGB"></a></span>\
                    \
                    </div> ',
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OrderPriority" },
                { "Key": "OrderStatus" },
                //{ "Key": "Doctor" },
                { "Key": "TESTMASTERTYP" },
                { "Key": "EncounterType" },
                { "Key": "Department" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "OrderType" },
                { "Key": "Ward" },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        // ---------------------------------------------------------------
        // REACT BRIDGE (UI-modernization retrofit, Billing / Clinical
        // Orders "Pending Orders" list, app.pendingorders). AngularJS
        // still owns all real state and logic below -- this block only
        // mirrors it into $scope.reactProps and routes UI interactions
        // back here by action name via handleReactAction. No business
        // logic was changed. currentfilter.OrderDate is a real JS Date
        // object (ng-date-object/uib-datepicker-popup) -- converted to/
        // from an ISO yyyy-mm-dd string only at this boundary, exactly
        // like every other DatePicker-backed bridge in this codebase.
        $scope.refreshReactProps = function () {
            var d = $scope.currentfilter.OrderDate;
            var isoDate = '';
            if (d) {
                var dateObj = (d instanceof Date) ? d : new Date(d);
                if (!isNaN(dateObj.getTime())) {
                    var mm = ('0' + (dateObj.getMonth() + 1)).slice(-2);
                    var dd = ('0' + dateObj.getDate()).slice(-2);
                    isoDate = dateObj.getFullYear() + '-' + mm + '-' + dd;
                }
            }
            $scope.reactProps = {
                items: (vm.gridConfig && vm.gridConfig.data) || [],
                pagerObj: (vm.gridConfig && vm.gridConfig.pagerObj) || {},
                currentfilter: {
                    patient: $scope.currentfilter.patient,
                    orderstatusid: $scope.currentfilter.orderstatusid,
                    OrderDate: isoDate
                },
                lookup: $scope.lookup || {}
            };
        };

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                $scope.currentfilter.patient = payload && payload.patient;
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'dateChange') {
                var newDate = (payload && payload.value) ? new Date(payload.value) : '';
                $scope.currentfilter.OrderDate = newDate;
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'statusFilterChange') {
                $scope.currentfilter.orderstatusid = payload ? payload.value : undefined;
                vm.gridConfig.pagerObj.currentPage = 1;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload && payload.page;
                $scope.getList();
            } else if (actionName === 'b2bbillinglist' || actionName === 'opbillinglist' || actionName === 'dgbillinglist') {
                $scope.handleEvents(actionName, { entity: payload });
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    PendingOrderListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();