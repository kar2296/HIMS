(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('allergyFormController', allergyFormController);

function allergyFormController($scope, $stateParams, $state, $translate, utl,$uibModalInstance, modalConfig) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));   
    
    $scope.item = {
        IsActive : true
    };
    $scope.currentcontext =  {};
if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'clinicalmaster/AllergyMaster/GetAllergyMasterById',
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
$scope.clear = function() {
        $scope.item = {};
    }
      $scope.addNew = function() {
        $state.go('app.allergies', { id:0 });
    }
    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {
        
        if(!utl.Validator.validate($scope)) {
            return;
        }
            
        var actionName = 'clinicalmaster/AllergyMaster/AddAllergyMaster';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'clinicalmaster/AllergyMaster/UpdateAllergyMaster';
        }
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };
        /*Autosearch for Generics*/
        vm.genericcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Generic Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Generic Name', field: 'GenericName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Allergen Type', field: 'AllergenType', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/GenericMaster/GetGenericMasters',
            formatdisplay: formatselectedgeneric,
            presearch: presearchgeneric,
            postsearch: postsearchgeneric
        };

        function formatselectedgeneric() {
            var selectedItem = vm.genericcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.GenericId = selectedItem.Id;
                $scope.item.GenericCode = selectedItem.Code;
                $scope.item.GenericName = selectedItem.GenericName;
                $scope.item.ScheduleTypeId = selectedItem.ScheduleTypeId;
                result = [selectedItem.GenericName + '(' + selectedItem.Code + ')'].join('    ');
            } else if (vm.genericcontrolconfig.rowdata) {
                result = [vm.genericcontrolconfig.rowdata.GenericName, vm.genericcontrolconfig.rowdata.GenericCode].join(' ');
            }
            return result;
        }

        function presearchgeneric() {
            var query = vm.genericcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 2, Value: 3 },
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.genericcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.GenericId
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }
            vm.genericcontrolconfig.searchparams = inputData;
        }

        function postsearchgeneric() {
            for (var idx in vm.genericcontrolconfig.result) {
                var item = vm.genericcontrolconfig.result[idx];
                item.Code = item.Code;
                item.GenericName = item.GenericName;
                item.AllergenType = item.AllergenType.Description;
            }
        }

        // DietItemMaster AutoSearch
        vm.dietcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'DietItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'DietName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/DietItemMaster/GetDietItemMasters',
            formatdisplay: formatselecteddiet,
            presearch: presearchdiet,
            postsearch: postsearchdiet
        };

        function formatselecteddiet() {
            var selectedItem = vm.dietcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.DietName = selectedItem.DietName;
                $scope.item.DietCode = selectedItem.DietItemCode;
                result = [selectedItem.DietName + '(' + selectedItem.DietItemCode + ')'].join('  ');
            } else if (vm.dietcontrolconfig.rowdata) {
                result = [vm.dietcontrolconfig.rowdata.DietName, vm.dietcontrolconfig.rowdata.DietItemCode,].join(' ');
            }

            return result;
        }

        function presearchdiet() {

            var query = vm.dietcontrolconfig.query;

            var inputData = {
                Params: [
                    { Key: 1, Value: 2 },
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (query && query.length > 2) {
                inputData.Params.push({ Key: 4, Value: query });
            }

            vm.dietcontrolconfig.searchparams = inputData;
        }

        function postsearchdiet() {
            for (var idx in vm.dietcontrolconfig.result) {
                var item = vm.dietcontrolconfig.result[idx];
                if (item.DietItemTypeId > 0) {
                    item.DietName = item.DietName
                    item.DietItemTypeId = item.DietItemTypeId;
                    item.DietCategoryId = item.DietCategoryId;
                    item.DietFrequencyId = item.DietFrequencyId;
                }
            }
        }
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
    }
    
    $scope.initLookup = function () {
        var inputData = [
                            { "Key": "AllergyEventType" },
                            { "Key": "AllergyType" }
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

allergyFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl','$uibModalInstance','modalConfig'];

})();