(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('labourCostFormController', labourCostFormController);

    function labourCostFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
			 FacilityId:  utl.Session.getCurrentFacilityId(),
    
        };
        $scope.CreditNoteDetails = [];
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.labid);
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.costdetailid = parseInt($stateParams.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'CostManagement/LabourCost/GetLabourCostById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

               
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.addNew = function () {
            $state.go('app.costtab.labourcost', { id: 0 });
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'CostManagement/LabourCost/AddLabourCost';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'CostManagement/LabourCost/UpdateLabourCost';
            }
            $scope.item.CostDetailId = $scope.currentcontext.costdetailid;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.computeAmount = function (item) {
            var CTC = item.CTC;
            var AdditionalCost = item.AdditionalCost;

            item.TotalCTC = CTC + AdditionalCost;
        }
        $scope.computeprocedure = function (item){
            item.ProcedureCost= item.TotalCTC/item.AvgProcedure;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "EmployeeType" },
                { "Key": "ActiveStatus" },
              {
                "Key": "User",
                Request: {
                    Params: [{
                        Key: 5,
                        Value: 2
                    }]
                }
            },

            ];
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

    labourCostFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();