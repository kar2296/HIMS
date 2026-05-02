(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ConfirmOrderController', ConfirmOrderController);

    function ConfirmOrderController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.VirtualOrderDetails = [];
        $scope.currentcontext = {};
        $scope.currentcontext.oid = parseInt(modalConfig.params.id);
        $scope.currentcontext.ctypeId = parseInt(modalConfig.params.ctypeId);
        $scope.currentcontext.patUserid = parseInt(modalConfig.params.patUserid);
        $scope.currentcontext.apnmntdate = modalConfig.params.apnmntdate;
        $scope.currentcontext.slotdata = modalConfig.params.slotdata;
        $scope.currentcontext.drdetail = modalConfig.params.drdetail;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data[0];
            $scope.VirtualOrderDetails = $scope.item.VirtualOrderDetails;
        };

        $scope.getItem = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.oid
                }, ]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualOrder/GetVirtualOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };

        $scope.confirmorder = function () {
            $scope.item.VirtualOrderStatusId = 2;
            $scope.saveItem();
        };

        $scope.cancelorder = function () {
            $scope.item.VirtualOrderStatusId = 8;
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItem = function () {
            var lines = getLinesForSave();
            $scope.item.ConsultTypeId = $scope.currentcontext.ctypeId
            if ($scope.currentcontext.slotdata) {
                $scope.item.AppointmentDate = $scope.currentcontext.slotdata.AppointmentDate;
                $scope.item.StartTime = $scope.currentcontext.slotdata.StartTime;
                $scope.item.EndTime = $scope.currentcontext.slotdata.EndTime;
            }
            if ($scope.currentcontext.drdetail) {
                $scope.item.ServiceItemId = $scope.currentcontext.drdetail.ServiceItemId;
                $scope.item.OrderTotal = $scope.currentcontext.drdetail.ConsultAmt;
                $scope.item.OrderToId = $scope.currentcontext.drdetail.DepartmentId;
                $scope.item.DepartmentId = $scope.currentcontext.drdetail.DepartmentId;
                $scope.item.DoctorId = $scope.currentcontext.drdetail.Id;
                $scope.item.DoctorName = $scope.currentcontext.drdetail.Title.Description + ' ' + $scope.currentcontext.drdetail.FirstName + ' ' + $scope.currentcontext.drdetail.LastName;
            }

            $scope.item.AppointmentDate = $scope.currentcontext.apnmntdate;
            $scope.item.DepartmentId = $scope.item.OrderToId;
            $scope.item.PatUserId = $scope.currentcontext.patUserid;
            var inputData = {
                Header: $scope.item,
                Details: lines
            };
            var actionName = '';
            if ($scope.item.VirtualOrderStatusId == 2) {
                actionName = 'VirtualHealthcare/VirtualOrder/ConfirmVirtualOrder';
            }
            if ($scope.item.VirtualOrderStatusId == 8) {
                actionName = 'VirtualHealthcare/VirtualOrder/UpdateVirtualOrder';
            }
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.VirtualOrderDetails) {
                var item = $scope.VirtualOrderDetails[idx];
                if (item.ServiceId > -1 && item.Status == 1) {
                    item.VirtualOrderDetailStatusId = $scope.item.VirtualOrderStatusId;
                    result.push(item);
                }
            }
            return result;
        };

        $scope.getItem();
    }

    ConfirmOrderController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();