(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('carepathprescriptionFormController', carepathprescriptionFormController);

    function carepathprescriptionFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Quantity: 1,
            Duration: 1,
            IsManditory: true,
        };

        $scope.currentcontext = {};
        // $scope.currentcontext.id = parseInt($stateParams.carepathprescriptionid);
        // $scope.currentcontext.carepathid = parseInt($stateParams.id);
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id)
            $scope.currentcontext.carepathid = parseInt($stateParams.id)
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;

        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/CarePathPrescription/GetCarePathPrescriptionById',
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

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.getgenericsCallBack = function (scope, data, options, hasError) {
            $scope.Generic = data;
            $scope.item.GenericId = $scope.Generic.GenericId;
        }
        $scope.getgenerics = function () {
            var options = {
                action: 'clinicalmaster/DrugMaster/GetDrugMasterById',
                data: { Id: $scope.item.DrugId },
                type: 'post',
                onComplete: $scope.getgenericsCallBack
            };
            utl.Http.doAction(options);
        }
        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            var actionName = 'clinicalmaster/CarePathPrescription/AddCarePathPrescription';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/CarePathPrescription/UpdateCarePathPrescription';
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }
        vm.drugcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'DrugCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'DrugName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                // { header: 'Qty', field: 'Quantity', datatype: 'string', headercls: 'td-qty', fieldcls: 'td-qty' },
                // { header: 'Type', field: 'DrugType', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                // { header: 'Generic', field: 'GenericMaster', datatype: 'string', headercls: 'td-generic', fieldcls: 'td-generic' },
                // { header: 'Forms', field: 'DrugForm', datatype: 'string', headercls: 'td-form', fieldcls: 'td-form' },
                // { header: 'Frequency', field: 'DrugFrequency', datatype: 'string', headercls: 'td-frequency', fieldcls: 'td-frequency' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/DrugMaster/GetDrugMasters',
            formatdisplay: formatselecteddrugs,
            presearch: presearchdrugs,
            postsearch: postsearchdrugs
        };

        function formatselecteddrugs() {
            var selectedItem = vm.drugcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DrugName + '(' + selectedItem.DrugCode + ')'].join('  ');
            } else if (vm.drugcontrolconfig.rowdata) {
                result = [vm.drugcontrolconfig.rowdata.DrugCode, vm.drugcontrolconfig.rowdata.DrugName].join(' ');
            }
            return result;
        }

        function presearchdrugs() {
            var query = vm.drugcontrolconfig.query;

            var inputData = {
                Params: [{ Key: 5, Value: $scope.item.PharmacyId },
                    //    {Key:4 ,Value :$scope.item.GenericId}
                ],

                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.drugcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query }, { Key: 6, Value: query });
            }
            vm.drugcontrolconfig.searchparams = inputData;
        }

        function postsearchdrugs() {
            for (var idx in vm.drugcontrolconfig.result) {

                var item = vm.drugcontrolconfig.result[idx];
                item.DrugCode = item.DrugCode;
                item.DrugName = item.DrugName;
                item.DrugType = item.DrugType.Description;

                if (item.GenericMaster)
                    item.GenericMaster = item.GenericMaster.GenericName;
                if (item.DrugForm)
                    item.DrugForm = item.DrugForm.Description;
                if (item.DrugFrequency)
                    item.DrugFrequency = item.DrugFrequency.Name;
            }
        }

        vm.genericcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'GenericName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                // { header: 'Type', field: 'AllergenType', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/GenericMaster/GetGenericMasters',
            formatdisplay: formatselectedgenerics,
            presearch: presearchgenerics,
            postsearch: postsearchgenerics
        };

        function formatselectedgenerics() {
            var selectedItem = vm.genericcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.GenericName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.genericcontrolconfig.rowdata) {
                result = [vm.genericcontrolconfig.rowdata.Code, vm.genericcontrolconfig.rowdata.GenericName].join(' ');
            }
            return result;
        }

        function presearchgenerics() {
            var query = vm.genericcontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.genericcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.genericcontrolconfig.searchparams = inputData;
        }

        function postsearchgenerics() {
            for (var idx in vm.genericcontrolconfig.result) {
                var item = vm.genericcontrolconfig.result[idx];
                item.GenericCode = item.Code;
                item.GenericName = item.GenericName;
            }
        }
        $scope.initLookup = function () {
            var inputData = [

                { "Key": "TESTMASTERTYP" },
                { "Key": "TestMaster" },
                { "Key": "DrugFrequency" },
                { "Key": "DrugRoute" },
                { "Key": "Generic" },
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

    carepathprescriptionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();