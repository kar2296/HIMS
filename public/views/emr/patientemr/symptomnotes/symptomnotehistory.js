(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SymptomNotesHistoryController', SymptomNotesHistoryController);

    function SymptomNotesHistoryController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentcontext = {};
        $scope.currentfilter = {
            pid: parseInt(utl.Session.getEMRPatientId()),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            // CreatedDate: utl.Formatter.getCurrentDate(),
            // From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            // To: utl.Formatter.getCurrentDate()
        };
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.currentcontext.id = $scope.currentcontext.Id;

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }


        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 2,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 6,
                        Value: utl.Formatter.getFilterDate(From)
                    },
                    {
                        Key: 7,
                        Value: utl.Formatter.getFilterDate(To)
                    }
                    // {
                    //     Key: 3,
                    //     Value: $scope.currentcontext.cid
                    // }
                ],
            };

            var options = {
                action: 'emr/PatientClinicalNotes/GetPatientClinicalNotess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
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

        //Download File
        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile = function (entity) {
            var inputData = { FilePath: entity.FilePath };
            var options = {
                action: 'emr/ClinicalDocument/GetDocumentFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }

        $scope.checkedinpatients = function () {
            $state.go('app.inpatienttab.allinpatient');
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'edit') {
                $state.go('patientemr.symptomnotestab.symptomnoteslist', {
                    id: entity.Id,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                });
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "CreatedAt", displayName: $translate.instant('patientemr.patientdocument-list.createddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "IllnessType.Description", displayName: $translate.instant('patientemr.clinicalnotes.illnesstype.lbl') },
                { field: "Encounter.DoctorName", displayName: $translate.instant('patientemr.clinicalnotes.doctorname.lbl') },
                { field: "Encounter.VisitType.Description", displayName: $translate.instant('patientemr.clinicalnotes.visittype.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
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

    SymptomNotesHistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();