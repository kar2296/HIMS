(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('InOutChartFormController', InOutChartFormController);

    function InOutChartFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {};
        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
        $scope.item = {
            Aspiration:0,
            VomitousDiarhoea:0,
            IntakeOutputChartDate: utl.Formatter.getCurrentDate(),
            IntakeOutputChartTime: time,
            EncounterId: utl.Session.getEncounterId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            CapturedBy: parseInt(utl.Session.getCurrentUserId()),
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/IntakeOutputChart/GetIntakeOutputChartById',
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
        $scope.save = function () {
            $scope.saveItem();
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.saveAndApprove = function () {
            $scope.saveItem();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'emr/IntakeOutputChart/AddIntakeOutputChart';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/IntakeOutputChart/UpdateIntakeOutputChart';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getDetailsCallback = function (scope, data, options, hasError) {
            var details = data.Data;
            if (data.Data.length > 0) {
                for (var idx in details)
                    var total = details[idx];
            }
        };

        $scope.getDetails = function (item) {
            if ($scope.currentcontext.pid > 0) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentcontext.pid },
                        { Key: 3, Value: $scope.currentcontext.eid },
                    ]
                };

                var options = {
                    action: 'emr/IntakeOutputChart/GetIntakeOutputCharts',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };

                utl.Http.doAction(options);
            }
        };
        $scope.computeAmount = function (item) {
            var IV = item.IV;
            var Oral = item.Oral;
            item.IntakeTotal = IV + Oral;
        }
        $scope.calculateAmount = function (item) {
            var Urine = item.Urine;
            var Aspiration = item.Aspiration;
            var VomitousDiarhoea = item.VomitousDiarhoea;
            item.OutputTotal = Urine + Aspiration + VomitousDiarhoea;
        }
        $scope.numberwithdecimal = function (e) {
            if ($.inArray(e.keyCode, [8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // Let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress && (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && e.keyCode != 46) {
                e.preventDefault();
            }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getDetails();
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "User" },
            ]
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

    InOutChartFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();