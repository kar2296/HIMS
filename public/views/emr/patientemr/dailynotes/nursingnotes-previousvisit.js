(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('NursingNotesPreviousListController', NursingNotesPreviousListController);

    function NursingNotesPreviousListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.Items = [];
        $scope.currentfilter = {
            NoteTypeId: 2,
            CapturedBy: -1,
            NoteStatusId: 1,
            // CapturedOn: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
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
        $scope.checkedinpatients = function () {
            $state.go('app.inpatienttab.allinpatient');
        };
        $scope.print=function(){
            // if ($scope.currentcontext.option == 'intakeoutput') {
                var inputData = {
                    // id: 0,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                };
                var options = {
                    action:  'emr/DailyNote/PrintDailyNotes',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            // };
        }
        //getList
        $scope.getPreviousVisitListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 7, Value: $scope.currentcontext.pid },
                    { Key: 1, Value: 2 },
                    {
                        Key: 5,
                        Value: FromDate
                    },
                    {
                        Key: 6,
                        Value: ToDate
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            }

            var options = {
                action: 'emr/DailyNote/GetDailyNotes',
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
            utl.Modal.open('patientemr.nursingnotestab.nursingnotesform', {
                params:
                {
                    id: 0,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                },
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
                action: 'emr/DailyNote/DeleteDailyNote',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('patientemr.nursingnotestab.nursingnotesform', {
                    params: { id: entity.Id, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }

        };
        vm.gridConfig = {
            columnDefs: [
                {
                    field: "CapturedOn", displayName: $translate.instant('patientemr.nursingnotes-list.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CapturedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.CapturedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "CapturedBy",
                    displayName: $translate.instant('patientemr.nursingnotes-list.capturedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CapturedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.CapturedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.CapturedUser.LastName}}</span>" + "</div>"
                },
                { field: "Encounter.EncounterType.Description", displayName: $translate.instant('patientemr.patientdocument-list.visittype.lbl') },
                { field: "Encounter.VisitIdentifier", displayName: $translate.instant('patientemr.patientdocument-list.visit#.lbl') },
                { field: "DailyNote", displayName: $translate.instant('patientemr.nursingnotes-list.notes.lbl') },
                { field: "SpecialNote", displayName: $translate.instant('Special Notes') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" uib-tooltip="Edit" tooltip-placement="bottom" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Note" },
                { "Key": "User" },
                { "Key": "NoteStatus" }
            ];
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
    NursingNotesPreviousListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();