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
            $rootScope.app.layout.isCollapsed = true;
        }

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.ApnmntData = [];
            var items = res.Data;
            for (var idx in items) {
                var item = items[idx];
                item.IsSelected = false;
                item.Encounter = (item.Encounters && item.Encounters.length > 0) ? item.Encounters[0] : null;
                $scope.ApnmntData.push(item);
            }
            if ($scope.currentfilter.AppointmentStatusId == 11) {
                $scope.IsCheckedOut = true;
            }
        };

        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
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
        }

        $scope.selectAllItems = function () {
            for (var idx in $scope.ApnmntData) {
                var item = $scope.ApnmntData[idx];
                item.IsSelected = $scope.currentcontext.selectall;
                item.IsAllApnmntSelected = $scope.currentcontext.selectall;
            }
        }

        $scope.IsAllApnmntSelectedChange = function (list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (item.IsSelected == false) {
                    detail.IsSelected = true;
                } else if (item.IsSelected == true) {
                    detail.IsSelected = false;
                }
            }
        }


        $scope.checkoutPatientsCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.batchCheckout = function () {
            //console.log('getSelectionRows');
            //console.log(getSelectionRows());

            var selectedRows = $scope.ApnmntData;
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.test-notselection-msg.lbl'));
                return;
            }


            var isValid = true;
            // var selectedRows = getSelectionRows();
            var inputArr = [];
            for (var idx in selectedRows) {
                var item = selectedRows[idx];
                if (item.IsSelected == true) {
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

            }

            if (!isValid) {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-list.ony-checkin-appts-msg.lbl'));
                return;
            }
            console.log(inputArr);

            var options = {
                action: 'appointment/patienttracker/CheckoutPatients',
                data: {
                    Data: inputArr
                },
                type: 'post',
                onComplete: $scope.checkoutPatientsCallback
            };

            utl.Http.doAction(options);
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
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
            }];

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

    bulkCheckoutController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();