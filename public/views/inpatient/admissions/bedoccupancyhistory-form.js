(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('bedoccupancyHistoryFormController', bedoccupancyHistoryFormController);

    function bedoccupancyHistoryFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            CurrentDate: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.encounterid = parseInt($stateParams.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.BillingStartDate = $scope.item.AdmissionDate;
            $scope.item.CurrentDate = utl.Formatter.getCurrentDate();
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistoryById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.checkstartdate = function(item) {
            var admdate = new Date(item.AdmissionDate);
            var admsndate = admdate.getDate();
            var admsnhrs = admdate.getHours();
            var billstartdate = new Date(item.BillingStartDate);
            var billstrtdate = billstartdate.getDate();
            var billstrthrs = billstartdate.getHours();
            if (admsndate > billstrtdate) {
                utl.Alert.showErrorMsg($translate.instant('Bill Start Date Should not be a Past Date'));
            }
            if (billstrthrs > 0) {
                if (admsndate <= billstrtdate) {
                    if (admsnhrs >= billstrthrs) {
                        utl.Alert.showErrorMsg($translate.instant('Bill Start Date Should not be a Past Date'));
                    }
                }
            }
        }

        $scope.checkenddate = function(item) {
            var crntdate = new Date(item.CurrentDate);
            var tdydate = crntdate.getDate();
            // var admsnhrs = admdate.getHours();
            var billenddate = new Date(item.BillingEndDate);
            var billendeddate = billenddate.getDate();
            // var billstrthrs = billstartdate.getHours();
            if (tdydate < billendeddate) {
                utl.Alert.showErrorMsg($translate.instant('Bill End Date Should not be a Future Date'));
            }
            // if (billstrthrs > 0) {
            //     if (tdydate <= billendeddate) {
            //         if (admsnhrs >= billstrthrs) {
            //             utl.Alert.showErrorMsg($translate.instant('Bill Start Date Should not be a Past Date'));
            //         }
            ///     }
            // }
        }

        $scope.backToList = function() {
            $scope.confirmCallback($scope.item);
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.EncounterId = $scope.currentcontext.encounterid;

            var options = {
                action: 'IPManagement/BedOccupancyHistory/ManageBedOccupancyUpDownTariff',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
            // $scope.confirmCallback($scope.item);
        }


        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "ServiceRateCategory"
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

    bedoccupancyHistoryFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();