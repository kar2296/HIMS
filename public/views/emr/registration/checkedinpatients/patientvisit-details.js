(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientvisitdetailsController', patientvisitdetailsController);

    function patientvisitdetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.PastVisits = [];
        $scope.item = {};
        $scope.currentvisit = {};
        $scope.selectedvisit = {};
        $scope.selectedvisits = 0;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if ($scope.currentcontext.ismodal) {
            $scope.currentcontext.aid = modalConfig.params.aid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.currentcontext.eid = modalConfig.params.eid;

            if (modalConfig.params.current_visit) {
                $scope.currentvisit = modalConfig.params.current_visit;
            }

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.backToList = function () {
            $state.go('app.opbilling', { opbillingid: 0 });
        };

        $scope.yes = function () {
            $scope.selectedvisits = 0;
            for (var idx in $scope.PastVisits) {
                var visit = $scope.PastVisits[idx];
                if (visit.IsMLC) {
                    $scope.selectedvisits = $scope.selectedvisits + 1;
                    $scope.selectedvisit = visit;
                }
            }

            if ($scope.selectedvisits > 1) {
                utl.Alert.showErrorMsg($translate.instant('registration.findpreviousvisits.multiplalert.lbl'));
                return false;
            } else if ($scope.selectedvisits < 1) {
                utl.Alert.showErrorMsg($translate.instant('registration.findpreviousvisits.singlealert.lbl'));
                return false;
            } else {
                $scope.confirmCallback({
                    AppointmentId: $scope.currentcontext.aid,
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    current_visit: $scope.currentvisit,
                    selected_visit: $scope.selectedvisit
                });
            }
        };

        $scope.notshown = function () {
        };

        $scope.newconsultation = function () {
            if ($scope.currentcontext.aid && $scope.currentcontext.pid) {
                utl.Modal.open('app.patientvisit-tracker', {
                    params: {
                        pid: $scope.currentcontext.pid,
                        aid: $scope.currentcontext.aid,
                        assignto: 1
                    },
                    confirmCallback: NewConsultationCallback
                    //confirmCallback: $scope.doctor_dashboard()
                });
            }
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.checkedinpatients');
        };

        function NewConsultationCallback(NewConsultation) {
            $scope.confirmCallback({
                new_visit: NewConsultation.ReferredNewConsultation,
                AppointmentId: $scope.currentcontext.aid,
                PatientId: $scope.currentcontext.pid,
                EncounterId: $scope.currentcontext.eid,
                current_visit: $scope.currentvisit,
                selected_visit: $scope.selectedvisit
            });
        };

        $scope.Callback = function () {
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                res.Data.sort($scope.custom_sort);
            }
            for (var idx in res.Data) {
                var visititem = res.Data[idx];
                if (visititem.VisitTypeId === 1) {
                    if (visititem.PatientConditions && visititem.PatientConditions.length > 0) {
                        visititem.OtherDiagnosis = '';
                        visititem.OtherDiagnosis = visititem.PatientConditions[0].DiagnosisName;
                    } else {
                        visititem.OtherDiagnosis = '';
                    }
                    if (visititem.ClaimNumber) {
                        visititem.ClaimNo = visititem.ClaimNumber;
                    } else {
                        visititem.ClaimNo = '';
                    }
                    if (visititem.PatientClinicalNote) {
                        visititem.complaints = '';
                        if (visititem.PatientClinicalNote.ChiefComplaints) {
                            visititem.complaints = visititem.PatientClinicalNote.ChiefComplaints;
                        }
                    }
                    if ($scope.currentvisit.Encounter.PreviousEncounterId === visititem.Id) {
                        visititem.IsMLC = true;
                    } else {
                        visititem.IsMLC = false;
                    }

                    $scope.PastVisits.push(visititem);
                }
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.pid },
                    { Key: 15, Value: 1 },
                    { Key: 49, Value: false },
                    { Key: 50, Value: false },
                    { Key: 53, Value: true },
                    { Key: 54, Value: true }
                ],
                PageContext: { PageSize: 10, PageNumber: 1 }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    patientvisitdetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();