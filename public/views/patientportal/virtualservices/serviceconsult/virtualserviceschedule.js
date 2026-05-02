(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualServiceScheduleController', VirtualServiceScheduleController);

    function VirtualServiceScheduleController($scope, $stateParams, $state, $translate, utl, Upload) {

        $scope.currentcontext = {};
        $scope.orderid = parseInt($stateParams.orderdata);
        $scope.slotdata = $stateParams.slotinfo;
        $scope.currentcontext.vcategoryid = parseInt($stateParams.ctgryid);
        $scope.currentcontext.vsubcategoryid = parseInt($stateParams.subctgryid);
        $scope.currentcontext.ctypeId = parseInt($stateParams.ctypeId);
        $scope.item = {}
        $scope.VOrderDetails = [];


        $scope.getvirtualorderDetailsCallback = function (scope, data, options, hasError) {
            $scope.VOrderDetails = data.Data;
            $scope.OrderScheduleDate = $scope.VOrderDetails[0].VirtualOrder.OrderScheduleDate;
        };

        $scope.getvirtualorderDetails = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.orderid

                }],
            };
            var options = {
                action: 'VirtualHealthcare/VirtualOrderDetail/GetVirtualOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvirtualorderDetailsCallback
            };
            utl.Http.doAction(options);
        };


        $scope.backToList = function () {
            $state.go('app.bookappointment', {
                docData: $scope.drdetail,
            });
        };
        $scope.confirmorder = function () {
            $state.go('patientportal.virtualserviceconfirmorder', {
                pid: $scope.selectedPatient.Id,
                orderid: $scope.orderid,
                ctgryid: $scope.currentcontext.vcategoryid,
                subctgryid: $scope.currentcontext.vsubcategoryid,
                ctypeId: $scope.currentcontext.ctypeId
            });
        }
        $scope.getvirtualorderDetails();
    }

    VirtualServiceScheduleController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();