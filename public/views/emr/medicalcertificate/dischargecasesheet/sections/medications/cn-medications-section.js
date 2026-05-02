(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MedicationSectionController', MedicationSectionController);

    function MedicationSectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.Items = [];
        $scope.UniqueMedications = {};
        $scope.Medications = [];
        $scope.currentcontext = {};

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.Disabled = false;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
        }
        // $scope.item.PatientId = $scope.currentcontext.pid;
        // $scope.item.EncounterId = $scope.currentcontext.eid;
        // $scope.item.ConsultationId = $scope.currentcontext.cid;

        $scope.SelectAll = function () {
            for (var idx in $scope.Medications) {
                var medicate = $scope.Medications[idx];
                medicate.IsSelectedDrug = $scope.currentcontext.IsSelectAllDrug;
            }
        };

        $scope.getPrescribeDetailsCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                for (var idx in res.Data) {
                    var medicate = res.Data[idx];
                    if(!$scope.UniqueMedications[medicate.DrugName]) {
                        $scope.currentcontext.IsSelectAllDrug = true;
                        $scope.UniqueMedications[medicate.DrugName] = medicate.DrugName;
                        medicate.IsSelectedDrug = true;
                        $scope.Medications.push(medicate);
                    }
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('Prescribe Any Medicines'));
            }
        };

        $scope.getPrescribeDetails = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: $scope.currentcontext.eid },
                    { Key: 5, Value: 3 }
                ],
            };
            var options = {
                action: 'emr/prescriptiondetail/GetPrescriptionDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrescribeDetailsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.Medications = [];
            $scope.UniqueMedications = {};
            if (res.Data.length > 0) {
                for (var idx in res.Data) {
                    var medicate = res.Data[idx];
                    if(!$scope.UniqueMedications[medicate.DrugName]) {
                        $scope.currentcontext.IsSelectAllDrug = true;
                        $scope.UniqueMedications[medicate.DrugName] = medicate.DrugName;
                        medicate.IsSelectedDrug = true;
                        $scope.Medications.push(medicate);
                    }
                }
            }
            $scope.Disabled = false;
            $scope.getPrescribeDetails();

        };
        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.pid },
                    { Key: 2, Value: $scope.currentcontext.eid },
                    { Key: 3, Value: $scope.currentcontext.cid },
                ],
            };
            var options = {
                action: 'emr/PatientDischargeMedication/GetPatientDischargeMedications',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);

        };

        //popup
        $scope.labresult = function () {
            utl.Modal.open('patientemr.labresults', {
                params: {
                    eid: $scope.currentcontext.eid, pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.radiologyresult = function () {
            utl.Modal.open('patientemr.radiologyresults', {
                params: {
                    eid: $scope.currentcontext.eid, pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            $scope.Disabled = true;
            var actionName = 'emr/PatientDischargeMedication/ManagePatientDischargeMedication';
            // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            //     actionName = 'emr/PatientDischargeMedication/UpdatePatientDischargeMedication';
            // }
            var lines = getlinesforsave();
            var options = {
                action: actionName,
                data: { Data: $scope.Items },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function getlinesforsave() {
            for (var idx in $scope.Medications) {
                var item = $scope.Medications[idx];
                if (item.Id > 0) {
                    if (!item.ConsultationId) {
                        var medicatedetail = {
                            Id: 0,
                            PatientId: $scope.currentcontext.pid,
                            EncounterId: $scope.currentcontext.eid,
                            ConsultationId: $scope.currentcontext.cid,
                            DrugId: $scope.Medications[idx].DrugId,
                            DrugName: $scope.Medications[idx].DrugName,
                            IsSelectedDrug: item.IsSelectedDrug || 0
                        }
                        $scope.Items.push(medicatedetail);
                    } else if (item.ConsultationId) {
                        var medicatedetail = {
                            Id: item.Id,
                            PatientId: $scope.currentcontext.pid,
                            EncounterId: $scope.currentcontext.eid,
                            ConsultationId: $scope.currentcontext.cid,
                            DrugId: $scope.Medications[idx].DrugId,
                            DrugName: $scope.Medications[idx].DrugName,
                            IsSelectedDrug: item.IsSelectedDrug
                        }
                        $scope.Items.push(medicatedetail);
                    }
                }
            }
            return $scope.Items;
        }
        //Grid Actions
        $scope.backToList = function () {
            $state.go('patientemr.dischargecasesheets', { pid: $scope.currentcontext.pid });
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [];

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

    MedicationSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();