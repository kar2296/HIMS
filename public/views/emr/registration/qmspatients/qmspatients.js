(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('QMSPatientController', QMSPatientController);

    function QMSPatientController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
            CurrentDate: utl.Formatter.getCurrentDate(),
            CurrentUserId: utl.Session.getCurrentUserId()
        };

        $scope.showNewPatientDetails = true;
        $scope.showOldPatientDetails = false;

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.PatientData = res.Data;
            } else {
                $scope.PatientData = [];
            }
        };

        $scope.getList = function (pageNo) {

            if ($scope.item.TokenNumber != '' ) {
                if ($scope.item.From == null || $scope.item.From == '') {
                    utl.Alert.showErrorMsg($translate.instant('Please Select Date'));
                    return;
                }
            }

            var inputData = {
                Params: [
                    { Key: 9, Value: $scope.item.PatientName },
                    { Key: 4, Value: $scope.item.MRN },
                    { Key: 6, Value: $scope.item.Mobile },
                    { Key: 10, Value: $scope.item.TokenNumber }
                ],
                PageContext: { PageSize: -1, PageNumber: 1 }
            };

            if ($scope.showOldPatientDetails == true) {
                inputData.Params.push({ Key: 2, Value: 2 });
            } else {
                inputData.Params.push({ Key: 2, Value: 1 });
            }

            if ($scope.item.From && $scope.item.To == null) {
                var FrmDate = $filter('date')($scope.item.From, 'yyyy-MM-dd 00:00:00');
                var ToDate = $filter('date')($scope.item.From, 'yyyy-MM-dd 23:59:59');
                if (FrmDate && ToDate)
                    inputData.Params.push({ Key: 8, Value: [FrmDate, ToDate] });
            }

            if ($scope.item.To && $scope.item.From == null) {
                var FrmDate = $filter('date')($scope.item.To, 'yyyy-MM-dd 00:00:00');
                var ToDate = $filter('date')($scope.item.To, 'yyyy-MM-dd 23:59:59');
                if (FrmDate && ToDate)
                    inputData.Params.push({ Key: 8, Value: [FrmDate, ToDate] });
            }

            if ($scope.item.From && $scope.item.To) {
                var StartFrmDate = $filter('date')($scope.item.From, 'yyyy-MM-dd 00:00:00');
                var StartToDate = $filter('date')($scope.item.To, 'yyyy-MM-dd 23:59:59');
                var EndFrmDate = $filter('date')($scope.item.From, 'yyyy-MM-dd 00:00:00');
                var EndToDate = $filter('date')($scope.item.To, 'yyyy-MM-dd 23:59:59');
                if (StartFrmDate && StartToDate)
                    inputData.Params.push({ Key: 8, Value: [StartFrmDate, StartToDate] });

            }

            var options = {
                action: 'Registration/QMS/GetQMS',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.sendPatientData = function (QMSId, PatientId, Patient) {
            $scope.confirmCallback({ qmsid: QMSId, pid: PatientId, patientdata: Patient });
        }

        $scope.openNewPatientDetailsTab = function () {
            $scope.showNewPatientDetails = true;
            $scope.showOldPatientDetails = false;
            $scope.initLookup();
        }

        $scope.openOldPatientDetailsTab = function () {
            $scope.showOldPatientDetails = true;
            $scope.showNewPatientDetails = false;
            $scope.initLookup();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
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

    QMSPatientController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();