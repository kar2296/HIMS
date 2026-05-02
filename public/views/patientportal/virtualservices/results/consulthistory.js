(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('consulthistoryController', consulthistoryController);

    function consulthistoryController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, $timeout) {
        var vm = this;
        $scope.currentfilter = {
            FromDate: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};
        $scope.currentcontext.cid = parseInt($stateParams.cid);
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        // $scope.ConsultOrders = [];
        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.ConsultOrders = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.VirtualSubCategory) {
                    item.ConsultTypeId = item.VirtualSubCategory.ConsultancyTypeId;
                }
                item.AppointmentDate = item.OrderRequestDate;
                $scope.ConsultOrders.push(item);
            };
        };

        $scope.getList = function() {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            // var From = $filter('date')($scope.currentfilter.orderDate, 'yyyy-MM-dd 00:00:00');
            // var To = $filter('date')($scope.currentfilter.orderDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.VirtualOrderStatusId
                    },
                    {
                        Key: 3,
                        Value: From
                    },
                    {
                        Key: 4,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.cid
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.VirtualSubCategoryId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 17,
                        Value: 1
                    },
                ]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualOrder/GetVirtualOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getDocrescheduleInfoCallback = function(scope, data, options, hasError) {
            var UserData = data;
            var ReschduleTime = data.MaxRescheduleTime;
            var AppointmentDate = options.data.OrderScheduleDate;
            var vOrderId = options.data.OrderId;
            var doctorid = options.data.DocId;
            var dt1 = new Date(utl.Formatter.getCurrentDate());
            var dt2 = new Date(AppointmentDate);
            // console.log(diff_minutes(dt1, dt2));
            // var diff = diff_minutes(dt1, dt2);
            var diffMs = (dt1 - dt2); // milliseconds between now & Christmas
            var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
            if (diffMins < ReschduleTime) {
                $state.go('patientportal.reschedulevirtualappointment', {
                    isreschedule: true,
                    oid: vOrderId,
                    DocId: doctorid

                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('Exceeded ReSchedule Alloted Time'));
            }
        };

        $scope.getDocrescheduleInfo = function(info) {
            if (info.DoctorId && info.DoctorId > 0) {
                var options = {
                    action: 'SystemSettings/User/GetUserById',
                    data: {
                        Id: info.DoctorId,
                        OrderScheduleDate: info.OrderScheduleDate,
                        OrderId: info.Id,
                        DocId: info.DoctorId
                    },
                    type: 'post',
                    onComplete: $scope.getDocrescheduleInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'cancel') {
                utl.Modal.open('patientportal.cancelOrder', {
                    params: {
                        id: entity.Id,
                        ctypeId: entity.ConsultTypeId,
                        apnmntdate: entity.AppointmentDate
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'orderinfo') {
                utl.Modal.open('patientportal.virtualorderinfo', {
                    params: {
                        id: entity.Id,
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'reschedule') {
                $scope.getDocrescheduleInfo(entity);
            }
        }

        $scope.getList();
    }

    consulthistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig', '$timeout'];

})();