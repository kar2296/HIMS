(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('localwellmedicineorderListController', localwellmedicineorderListController);

    function localwellmedicineorderListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.currentcontext = {};
        $scope.lookup = {};

        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        if ($stateParams.id) {
            $scope.currentcontext.surgeryid = $stateParams.id;
        }
        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        } else {
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        }
        $scope.currentcontext.isAutoBillLock = 0;
        $scope.currentcontext.isAutoBillLock = utl.FacilitySetting.getFacilitySettingValue('billing', 'isautobilllock');

        $scope.item = {
            Id: -1,
            PatientStockRequestId: -1,
            PrescriptionId: -1,
            PatientRequestTypeId: 1,
            IsBillLock: false
        };
        $scope.doctor_dashboard = function () {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientRequestDateTime: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate()
        };

        $scope.getLocalWellOrderList = function () {
            var FromReq = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToReq = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: FromReq },
                    { Key: 5, Value: ToReq },
                ]
            };

            var options = {
                action: 'Registration/LocalWellCustomerOrder/GetLocalWellCustomerOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getLocalWellOrderListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getLocalWellOrderListCallback = function (scope, data, options, hasError) {
            $scope.allOrdersStatus = []; // clear old data always

            if (data.Data && data.Data.length > 0) {
                var lcwelldata = data.Data;
                var orderIds = lcwelldata.map(x => x.CustomerOrderId);

                orderIds.forEach(orderId => {
                    $scope.getOrderStatus(orderId);
                });
            } else {
                // No data → reset grid
                vm.gridConfig.data = [];
                vm.gridConfig.pagerObj.totalItems = 0;
                $scope.$applyAsync();
            }
        };

        $scope.getOrderStatus = function (orderId) {
            var inputData = { CustomerOrderId: orderId };

            var options = {
                action: 'Registration/LocalWellCustomerOrder/GetOrderStatus',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: function (scope, response, options, hasError) {
                    if (response && response.data && response.data.customer_orders_status) {
                        // Push each status into array
                        $scope.allOrdersStatus.push(response.data.customer_orders_status);

                        // Bind array to grid
                        vm.gridConfig.data = $scope.allOrdersStatus;
                        vm.gridConfig.pagerObj.totalItems = $scope.allOrdersStatus.length;
                        $scope.$applyAsync();
                    }
                }
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {

            if ($scope.item.IsBillLock == true) {
                if ($scope.currentcontext.isAutoBillLock == 1 && $scope.item.GuarantorTypeId == 1) { console.log('Allow Indent') } else {
                    var msg = '';
                    msg = 'Bill has been Locked';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    return;
                }
            }
            if ($scope.context == 'ipemr') {
                $state.go('patientemr.localwellmedicineorderform', { id: 0 });
            }
            if ($scope.context == 'emr') {
                $state.go('patientemr.localwellmedicineorderform', { id: 0 });
            }
        };

        $scope.doctor_dashboard = function () {
            if ($scope.Context == 'ipemr' || !$scope.Context) {
                if ($scope.From == 'nursing') {
                    $state.go('app.nursingdashboard');
                } else {
                    $state.go('app.doctordashboard');
                }
            }
            if ($scope.Context == 'surgery') {
                $state.go('app.surgerydashboard');
            }
        }

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getLocalWellOrderList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'view') {
                $state.go('patientemr.localwellmedicineorderform', { id: entity.Id, eid: entity.EncounterId, pid: entity.PatientId });
            }
            if (actionType == 'edit') {
                $state.go('patientemr.localwellmedicineorderform', { id: entity.Id, eid: entity.Id, pid: entity.PatientId });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "S.No",
                displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
            },
            {
                field: "created_on",
                displayName: $translate.instant('Order Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.created_on | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.created_on| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "order_notes",
                displayName: $translate.instant('Order Notes')

            },
            {
                field: "status_name",
                displayName: $translate.instant('Status')

            },
            {
                field: "order_no",
                displayName: $translate.instant('Order No')

            },
            {
                field: "medicines",
                displayName: $translate.instant('Medicines'),
                cellTemplate:
                    "<div class='ui-grid-cell-contents'>" +
                    "<span ng-repeat='m in entity.medicines track by $index'>" +
                    "{{m.medicine_name}}<span ng-if='!$last'>, </span>" +
                    "</span>" +
                    "</div>"
            }
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">\
                //                                     <span class="grid-action" ng-click="handleEvents(\'edit\',entity)><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                //                                                                                    </div>',
                //     handleEvent: $scope.handleEvents,
                //     actions: []
                // }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getLocalWellOrderList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
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
    }

    localwellmedicineorderListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();