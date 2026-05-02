(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PreDiagnosisHistoryController', PreDiagnosisHistoryController);

    function PreDiagnosisHistoryController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentcontext = {};
        $scope.currentfilter = {
            pid: parseInt(utl.Session.getEMRPatientId()),
            CreatedDate: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }

        $scope.getPreviousVisitListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };


        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    {
                        Key: 9,
                        Value: FromDate
                    },
                    {
                        Key: 10,
                        Value: ToDate
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            }

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPreviousVisitListCallback
            }


            utl.Http.doAction(options);
        };


        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.open('patientemr.clinicaldocumenttab.clinicaldocument', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            }
            );
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/ClinicalDocument/DeleteClinicalDocument',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.checkedinpatients = function () {
            $state.go('app.inpatienttab.allinpatient');
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }

        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "ConditionDate", displayName: $translate.instant('patientemr.patientdocument-list.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ConditionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ConditionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "Encounter.DoctorName", displayName: $translate.instant('patientemr.patientdocument-list.doctor.lbl') },
                { field: "ConditionType.Description", displayName: $translate.instant('patientemr.patientdocument-list.description.lbl') },
                { field: "Encounter.EncounterType.Description", displayName: $translate.instant('patientemr.patientdocument-list.visittype.lbl') },
                { field: "Encounter.VisitIdentifier", displayName: $translate.instant('patientemr.patientdocument-list.visit#.lbl') },
                { field: "DiagnosisName", displayName: $translate.instant('patientemr.patientdocument-list.diagnosis.lbl') },
                { field: "OtherDiagnosis", displayName: $translate.instant('patientemr.patientdocument-list.other.lbl') },

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
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

    PreDiagnosisHistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();