(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnPrescriptionController', cnPrescriptionController);

    function cnPrescriptionController($scope, $filter, $stateParams, $state, $translate, utl, modalConfig, $uibModalInstance) {
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
        $scope.currentcontext.cid = modalConfig.params.consid;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId()),
            $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;
        $scope.currentfilter.DoctorId = $scope.currentcontext.encounter.DoctorId;
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
            for (var idx in $scope.Prescriptions) {
                var item = $scope.Prescriptions[idx];
                item.Select = false;
                item.cnDisabled = false;
                if (item.ConsultationId > 0) {
                    item.cnDisabled = true;
                }
            }
        };
        $scope.backToList = function () {
            $state.go('app.users');
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

        $scope.SelectAllItems = function () {
            if ($scope.currentcontext.SelectAll) {
                for (var idx in $scope.Prescriptions) {
                    var item = $scope.Prescriptions[idx];
                    if (!item.ConsultationId ||
                        item.ConsultationId != null ||
                        item.ConsultationId < 0) {
                        item.Select = true;
                    }
                }
            } else {
                for (var idx in $scope.Prescriptions) {
                    var item = $scope.Prescriptions[idx];
                    if (!item.ConsultationId ||
                        item.ConsultationId != null ||
                        item.ConsultationId < 0) {
                        item.Select = false;
                    }
                }
            }
        };

        $scope.saveItemCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveToNotes = function () {
            var resultitems = getSelectedItems();
            if (resultitems && resultitems.length > 0) {
                var actionName = 'emr/prescription/ManagePrescriptionNote';
                // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                //     actionName = 'emr/prescription/UpdatePrescription';
                // }
                // var inputData = {
                //     Header: resultitems,
                //     Details: lines
                // };
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
                utl.Alert.showErrorMsg('Required any one Vital selection...');
                return false;
            }
        }

        function getSelectedItems() {
            var resultitems = [];
            for (var idx in $scope.Prescriptions) {
                var item = $scope.Prescriptions[idx];
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

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.Prescriptions) {
                var item = $scope.Prescriptions[idx];
                result = item.PrescriptionDetails;
            }
            return result;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };
        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Pharmacy"
            }, ];
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
    cnPrescriptionController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', 'modalConfig', '$uibModalInstance'];

})();