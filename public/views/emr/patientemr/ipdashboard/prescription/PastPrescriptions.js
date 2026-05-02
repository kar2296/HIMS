(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PastPrescriptionController', PastPrescriptionController);

    function PastPrescriptionController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.Prescriptions = [];
        $scope.currentfilter = {
            DoctorId: -1,
            DepartmentId: -1,
            PharmacyId: -1,
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };
        $scope.CanShowPresDetails = false;
        $scope.item = {}
        $scope.currentcontext = {};

        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;
            $scope.currentfilter.DoctorId = $scope.currentcontext.encounter.DoctorId;
        }
        $scope.currentcontext.context = $stateParams.context;
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());


        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in $scope.Prescriptions) {
                var item = $scope.Prescriptions[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.Prescriptions = res.Data;
        };

        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.pid
                },
                {
                    Key: 8,
                    Value: FromDate
                },
                {
                    Key: 9,
                    Value: ToDate
                },

                ],
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.CancelCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.SaveCancelled = function (entity, StatusId) {
            var inputData = {
                Header: {
                    Id: entity.Id,
                    PrecriptionStatusId: StatusId,
                },
                Details: entity.PrescriptionDetails
            };
            var options = {
                action: 'emr/prescription/UpdateCancelPrescription',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.CancelCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'repeat') {
                $state.go('patientemr.prescribetab.rxprescriptions', {
                    cid: entity.Id,
                    pid: $scope.currentcontext.pid,
                    context: $scope.currentcontext.context
                });
            } else if (actionType == 'print') {
                $scope.PrescribePrint(entity);
            } else if (actionType == 'cancel') {
                $scope.SaveCancelled(entity, 2);
            }
        };
        $scope.PrescribePrint = function (entity) {
            var inputData = {
                Id: entity.Id
            };
            var options = {
                action: 'emr/prescription/PrintPrescription',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };
        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Pharmacy"
            },];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $scope.initLookup();
    }
    PastPrescriptionController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();