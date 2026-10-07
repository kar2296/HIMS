(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('bulkCheckoutController', bulkCheckoutController);

    function bulkCheckoutController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.appointmentList = [];
        $scope.ApnmntData = [];
        $scope.IsCheckedOut = false;
        $scope.loading = false;
        $scope.isCheckingOut = false;
        $scope.currentcontext = {
            selectall: false
        };
        $scope.currentfilter = {
            FacilityId: parseInt(utl.Session.getCurrentFacilityId()),
            AppointmentStatusId: 6,
            patientnamemrn: '',
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            if ($rootScope.app && $rootScope.app.layout) {
                $rootScope.app.layout.isCollapsed = true;
            }
        }

        // Bridge to React component
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                filter: {
                    FacilityId: $scope.currentfilter.FacilityId,
                    AppointmentStatusId: $scope.currentfilter.AppointmentStatusId,
                    patientnamemrn: $scope.currentfilter.patientnamemrn,
                    From: $scope.currentfilter.From,
                    To: $scope.currentfilter.To
                },
                lookup: $scope.lookup || {},
                appointments: $scope.ApnmntData || [],
                isCheckedOut: $scope.IsCheckedOut,
                selectAll: $scope.currentcontext ? !!$scope.currentcontext.selectall : false,
                loading: !!$scope.loading,
                isCheckingOut: !!$scope.isCheckingOut
            };
        };

        // getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.loading = false;
            $scope.ApnmntData = [];
            var items = res && res.Data ? res.Data : [];
            for (var idx in items) {
                var item = items[idx];
                item.IsSelected = false;
                item.Encounter = (item.Encounters && item.Encounters.length > 0) ? item.Encounters[0] : null;
                $scope.ApnmntData.push(item);
            }
            if ($scope.currentfilter.AppointmentStatusId == 11) {
                $scope.IsCheckedOut = true;
            } else {
                $scope.IsCheckedOut = false;
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.getList = function () {
            $scope.loading = true;
            $scope.refreshReactProps();

            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 16,
                        Value: $scope.currentfilter.patientnamemrn
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.AppointmentStatusId
                    },
                    { Key: 9, Value: FromDate },
                    { Key: 10, Value: ToDate }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
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

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'select') {
                $scope.confirmCallback({
                    BillId: entity.Id,
                    PatientId: entity.PatientId,
                    BillTypeId: entity.BillTypeId
                });
            }
        };

        $scope.selectAllItems = function () {
            for (var idx in $scope.ApnmntData) {
                var item = $scope.ApnmntData[idx];
                if (item.AppointmentStatusId != 11) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllApnmntSelected = $scope.currentcontext.selectall;
                }
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.IsAllApnmntSelectedChange = function (list, item) {
            item.IsSelected = !item.IsSelected;
            item.IsAllApnmntSelected = item.IsSelected;
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.checkoutPatientsCallback = function (scope, res, options, hasError) {
            $scope.isCheckingOut = false;
            if (!hasError) {
                utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl') || 'Checkout completed successfully');
            }
            $scope.getList();
        };

        $scope.batchCheckout = function (selectedIds) {
            var selectedRows = [];
            if (selectedIds && selectedIds.length > 0) {
                selectedRows = $scope.ApnmntData.filter(function (it) {
                    return selectedIds.indexOf(it.Id) > -1;
                });
            } else {
                selectedRows = $scope.ApnmntData.filter(function (it) {
                    return it.IsSelected == true;
                });
            }

            if (selectedRows.length === 0) {
                utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.test-notselection-msg.lbl') || 'Please select at least one record');
                return;
            }

            var isValid = true;
            var inputArr = [];
            for (var idx in selectedRows) {
                var item = selectedRows[idx];
                if (item.AppointmentStatusId != 6) {
                    isValid = false;
                    break;
                } else {
                    inputArr.push({
                        PatientId: item.PatientId,
                        AppointmentId: item.Id
                    });
                }
            }

            if (!isValid) {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-list.ony-checkin-appts-msg.lbl') || 'Please select appointments with checked in status');
                return;
            }

            $scope.isCheckingOut = true;
            $scope.refreshReactProps();

            var options = {
                action: 'appointment/patienttracker/CheckoutPatients',
                data: {
                    Data: inputArr
                },
                type: 'post',
                onComplete: $scope.checkoutPatientsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "AppointmentType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Resource" },
                { "Key": "AppointmentStatus" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        // React bridge action dispatcher
        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'search':
                    $scope.currentfilter.patientnamemrn = payload ? payload.query : '';
                    $scope.getList();
                    break;
                case 'filterChange':
                    if (payload && payload.key) {
                        $scope.currentfilter[payload.key] = payload.value;
                        $scope.getList();
                    }
                    break;
                case 'toggleSelectAll':
                    $scope.currentcontext = $scope.currentcontext || {};
                    $scope.currentcontext.selectall = payload && payload.selected;
                    $scope.selectAllItems();
                    break;
                case 'toggleSelectRow':
                    if (payload && payload.item) {
                        var found = $scope.ApnmntData.find(function (x) { return x.Id === payload.item.Id; });
                        if (found) {
                            found.IsSelected = payload.selected !== undefined ? payload.selected : !found.IsSelected;
                            found.IsAllApnmntSelected = found.IsSelected;
                        }
                    }
                    $scope.refreshReactProps();
                    $scope.$applyAsync();
                    break;
                case 'batchCheckout':
                    $scope.batchCheckout(payload && payload.selectedIds);
                    break;
                case 'refresh':
                    $scope.getList();
                    break;
                default:
                    if (typeof $scope[actionName] === 'function') {
                        $scope[actionName](payload);
                    }
                    break;
            }
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    bulkCheckoutController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();