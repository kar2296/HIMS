(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('viewdoctorpayoutappipController', viewdoctorpayoutappipController);

    function viewdoctorpayoutappipController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout, modalConfig, $uibModalInstance) {
        var vm = this;
        $scope.currentfilter = {};

        $scope.item = {};
        $scope.currentcontext = {
            Completed: 0
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.billid = modalConfig.params.billid;
            $scope.currentcontext.encId = modalConfig.params.encId;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.Disable = true;
        $scope.DrShareDetails = [];



        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.DrShareDetails = res.Data;
            $scope.item = res.Data[0];
        };
        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 10, Value: $scope.currentcontext.billid },
                ],
            };
            var options = {
                action: 'billing/PatientDoctorShareDetails/GetPatientDoctorShareDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getbilldetailsListCallback = function (scope, res, options, hasError) {
            $scope.billdetail = res.Data;
            var hosamt = 0;
            var pharmamt = 0;
            var hosshare = 0;
            var totalamt = 0;
            var totdocchare = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                totalamt += item.NetAmount;
                totdocchare += item.DoctorShare;
                if (item.IsPharmacySale == 0 && item.IsPharmacyReturn == 0) {
                    hosamt += item.NetAmount;
                    hosshare += item.DoctorShare;
                }
                if (item.IsPharmacySale == 1) {
                    pharmamt += item.NetAmount;
                }
                if (item.IsPharmacyReturn == 1) {
                    pharmamt += item.NetAmount;
                }
            }
            $scope.item.HospitalAmount = (hosamt);
            $scope.item.TotalAmount = (totalamt);
            var NetNaturalValue = getNatural(Number($scope.item.TotalAmount).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.item.TotalAmount).toFixed(2));
            var RoundOffValue = 0;

            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.item.TotalAmount = NetNaturalValue;
                RoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.item.RoundOffValue = parseFloat(RoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.item.TotalAmount = NetNaturalValue + 1;
                RoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.item.RoundOffValue = parseFloat(RoundOffValue);
            } else {
                RoundOffValue = 0;
                $scope.item.RoundOffValue = parseFloat(RoundOffValue);
            }
            $scope.item.PharmacyAmount = (pharmamt);
            // $scope.item.Hospitalshare = (hosshare);
            $scope.item.Hospitalshare = $scope.item.HospitalAmount - (hosshare);
            $scope.item.TotalDocShare = totdocchare;
            // $scope.item.HospitalPercent = parseFloat((($scope.item.HospitalAmount || 0) - ($scope.item.Hospitalshare || 0)) / 100).toFixed(2);
            $scope.item.HospitalPercent = parseFloat(parseFloat($scope.item.Hospitalshare) / parseFloat($scope.item.HospitalAmount) * 100).toFixed(2);
            // Percentage = (HospitalShare/HospitalAmount)*100
            //Hospital Share
           NetNaturalValue = getNatural(Number($scope.item.Hospitalshare).toFixed(2));
           NetDecimalValue = getDecimal(Number($scope.item.Hospitalshare).toFixed(2));
           RoundOffValue = 0;

            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.item.Hospitalshare = NetNaturalValue;
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.item.Hospitalshare = NetNaturalValue + 1;
            } else {
                RoundOffValue = 0;
            }
        };

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }
        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        $scope.getbilldetailsList = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.encId },
                    { Key: 4, Value: 3 },
                    { Key: 12, Value: true },
                ],
            };
            var options = {
                action: 'billing/PatientBillDetails/GetPatientBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getbilldetailsListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.getbilldetailsList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                //{ "Key": "PaymentDate" },
                { "Key": "DoctorShareStatusIP" }
            ]
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
    viewdoctorpayoutappipController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout', 'modalConfig', '$uibModalInstance'];
})();