(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnOrderHistoryController', cnOrderHistoryController);

    function cnOrderHistoryController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentcontext.SelectAll = false;
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext.pid = modalConfig.params.pid;
        $scope.currentcontext.cid = modalConfig.params.cid;
        $scope.currentcontext.IsPatientCondition = false;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.SelectAllItems = function() {
            if ($scope.currentcontext.SelectAll) {
                for (var idx in $scope.items) {
                    var item = $scope.items[idx];
                    if (!item.ConsultationId ||
                        item.ConsultationId != null ||
                        item.ConsultationId < 0) {
                        item.Select = true;
                    }
                }
            } else {
                for (var idx in $scope.items) {
                    var item = $scope.items[idx];
                    if (!item.ConsultationId ||
                        item.ConsultationId != null ||
                        item.ConsultationId < 0) {
                        item.Select = false;
                    }
                }
            }
        };
        $scope.toggleCanShowDetails = function(clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        $scope.saveToNotes = function() {
            var resultitems = getSelectedItems();
            if (resultitems && resultitems.length > 0) {
                var actionName = 'emr/patientorder/ManagePatientOrders';
                var options = {
                    action: actionName,
                    data: {
                        Data: resultitems
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            } else {
                utl.Alert.showErrorMsg('Required any one order selection...');
                return false;
            }
        }

        $scope.saveItemCallback = function(scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        function getSelectedItems() {
            var resultitems = [];
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (!item.ConsultationId ||
                    item.ConsultationId != null ||
                    item.ConsultationId < 0) {
                    if (item.Select) {
                        var data = {
                            Id: item.Id,
                            ConsultationId: $scope.currentcontext.cid
                        }
                        resultitems.push(data);
                    }
                }
            }
            return resultitems;
        }

        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.items = res.Data;
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                item.Select = false;
                item.cnDisabled = false;
                if (item.ConsultationId > 0) {
                    item.cnDisabled = true;
                }
            }
        };

        $scope.getList = function() {

            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.pid
                }],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
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

        $scope.getList();
    }

    cnOrderHistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();