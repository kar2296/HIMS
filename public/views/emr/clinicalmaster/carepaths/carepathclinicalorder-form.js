(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('carepathclinicalorderFormController', carepathclinicalorderFormController);

    function carepathclinicalorderFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Quantity: 1,
            Days: 1,
            IsManditory: true,

        };

        $scope.currentcontext = {};
        // $scope.currentcontext.id = parseInt($stateParams.carepathclinicalorderid);
        // $scope.currentcontext.carepathid = parseInt($stateParams.id);
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id)
            $scope.currentcontext.carepathid = parseInt($stateParams.id)
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.CancelCallback = $uibModalInstance.dismiss;
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/CarePathClinicalOrder/GetCarePathClinicalOrderById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.backToList = function () {
        //     $state.go('app.carepathtab.carepathclinicalorders');
        // }
        $scope.backToList = function () {
            $scope.confirmCallback();
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            var actionName = 'clinicalmaster/CarePathClinicalOrder/AddCarePathClinicalOrder';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/CarePathClinicalOrder/UpdateCarePathClinicalOrder';
            }

            $scope.item.CarePathId = $scope.currentcontext.carepathid;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'Name', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                // { header: 'Type', field: 'Sampletype', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                // { header: 'Department', field: 'Department', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
                // { header: 'Price', field: 'Price', datatype: 'string', headercls: 'td-price', fieldcls: 'td-price' },
            ],
            searchparams: {},
            result: {},
            api: 'lis/testmaster/GetTestmasters',
            formatdisplay: formatselectedtest,
            presearch: presearchtest,
            postsearch: postsearchtest
        };

        function formatselectedtest() {

            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.TestName + '(' + selectedItem.TestCode + ')'].join('  ');
            } else if (vm.testcontrolconfig.rowdata) {
                result = [vm.testcontrolconfig.rowdata.TestCode, vm.testcontrolconfig.rowdata.TestName].join(' ');
            }
            return result;
        }

        function presearchtest() {
            var query = vm.testcontrolconfig.query;

            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.item.TESTMASTERTYPId },
                    { Key: 6, Value: 2 },
                    // { Key: 8, Value: { 'ServiceRateCategoryId': $scope.item.ServiceRateCategoryId } }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.testcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                item.TestCode = item.Code;
                item.TestName = item.Name;
                // item.DrugType = item.DrugType.Description;
                // if (item.GenericMaster)
                //     item.GenericMaster = item.GenericMaster.GenericName;
                // if (item.DrugForm)
                //     item.DrugForm = item.DrugForm.Description;
                // item.DrugFrequency = item.DrugFrequency.Name;

            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [

                { "Key": "TESTMASTERTYP" },
                { "Key": "TestMaster" },
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

    carepathclinicalorderFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();