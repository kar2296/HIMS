(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('disPrescriptionListController', disPrescriptionListController);

    function disPrescriptionListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.items = [];

        $scope.tablets = [];

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = res.Data;
            var tabletname = new Array();
            var disptabletname = new Array();
            var i = 0;
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                for (var idx1 in item.PrescriptionDetails) {
                    var itemdetail = item.PrescriptionDetails[idx1];
                    if (itemdetail) {
                        var Key = itemdetail.DrugCode
                        if (!(tabletname[Key])) {
                            tabletname[Key] = new Array();
                            tabletname[Key] = itemdetail.DrugName;
                            itemdetail.Selected = false;
                            disptabletname.push(itemdetail);
                        }
                    }
                }
            }
            $scope.tablets = disptabletname;
        };

        $scope.backToList = function () {
            $scope.cancelCallback();
        }
        $scope.saveItem = function () {
            var activeRecords = $filter('filterArrayItems')($scope.tablets, [{
                search: true,
                fields: ['Selected']
            }]);
            var prescriptionrxname = '';
            for (var idx in activeRecords) {
                if (prescriptionrxname.length == 0) prescriptionrxname = activeRecords[idx].DrugName;
                else prescriptionrxname += ' , ' + activeRecords[idx].DrugName;
            }
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback({ data: prescriptionrxname });
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 12, Value: $scope.currentcontext.eid },
                    { Key: 6, Value: 3 }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getList();

    }
    disPrescriptionListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();