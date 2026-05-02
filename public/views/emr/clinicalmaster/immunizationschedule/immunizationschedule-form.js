(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('immunizationScheduleFormController', immunizationScheduleFormController);

    function immunizationScheduleFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true
        };

        $scope.currentcontext = {};
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
                    action: 'clinicalmaster/ImmunizationSchedule/GetImmunizationScheduleById',
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
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'clinicalmaster/ImmunizationSchedule/AddImmunizationSchedule';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/ImmunizationSchedule/UpdateImmunizationSchedule';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            $scope.item = {};
        }
        //autosearch related code starts for Diagnosis 
        vm.immunizationcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'ImmunizationName', field: 'ImmunizationName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Duration', field: 'Duration', datatype: 'string', headercls: 'td-Duration', fieldcls: 'td-Duration' },
                { header: 'Route', field: 'Route', datatype: 'string', headercls: 'td-Route', fieldcls: 'td-Route' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/Immunization/GetImmunizations',
            formatdisplay: formatselectedimmune,
            presearch: presearchimmune,
            postsearch: postsearchimmune
        };
        function formatselectedimmune() {
            var selectedItem = vm.immunizationcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ImmunizationName].join('  ');
            } else if (vm.immunizationcontrolconfig.rowdata) {
                result = [vm.immunizationcontrolconfig.rowdata.ImmunizationName].join(' ');
            }
            return result;
        }
        function presearchimmune() {

            var query = vm.immunizationcontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.immunizationcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.immunizationcontrolconfig.searchparams = inputData;
        }

        function postsearchimmune() {

            for (var idx in vm.immunizationcontrolconfig.result) {

                var item = vm.immunizationcontrolconfig.result[idx];
                item.ImmunizationName = item.ImmunizationName;
                item.Duration = item.Duration;
                if (item.Route)
                    item.Route.Description = item.Route.Description;
            }
        }
        // autosearch related code ends for Diagnosis 
        $scope.getImmunization = function () {
            $scope.Immunization = $scope.item.selectedItem;
            $scope.item.ImmunizationName = $scope.Immunization.ImmunizationName;
            $scope.item.ScheduleFlagId = $scope.Immunization.ScheduleFlagId;
            $scope.item.Duration = $scope.Immunization.Duration;
            $scope.item.RouteId = $scope.Immunization.RouteId;
            $scope.item.PeriodId = $scope.Immunization.PeriodId;
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ScheduleName" },
                { "Key": "Period" },
                { "Key": "Dosage", Default: false },
                { "Key": "Route" },
                { "Key": "ScheduleFlag" },
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

    immunizationScheduleFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();