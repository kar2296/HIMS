(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IVFConsultationNotesspouseListController', IVFConsultationNotesspouseListController);

    function IVFConsultationNotesspouseListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.Items = [];
        $scope.item = [];
        $scope.currentcontext.testList = [];
        $scope.currentfilter = {
            NoteTypeId: 1,
            CapturedBy: -1,
            NoteStatusId: 1,
            // CapturedOn: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        } else {
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        }
        $scope.tabs = [{
                title: $translate.instant('patientemr.patientorder-list.Patient.lbl'),
                state: 'patientemr.ivfnotestab.ivfnotescurrentlist'
            },
            {
                title: $translate.instant('patientemr.patientorder-list.Spouse.lbl'),
                state: 'patientemr.ivfnotestab.ivfnotespreviouslist'
            },
        ];
        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
        $scope.currentcontext = {
            option: 'currentvisits'
        }
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }

        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        } else {
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        }


        //getList
        $scope.getCurrentVisitListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.Details = [];
            for (var idx in res.Data) {
                var item = res.Data[idx]
                $scope.Details.push(item);
            }
        }

        $scope.getList = function () {
            var inputData = {
                Params: [{
                        Key: 7,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 9,
                        Value: $scope.encounteritem.Id
                    },
                    {
                        Key: 1,
                        Value: 1
                    },
                    // {
                    //     Key: 5,
                    //     Value: FromDate
                    // },
                    // {
                    //     Key: 6,
                    //     Value: ToDate
                    // },
                ],
                // PageContext: {
                //     PageSize: vm.gridConfig.pagerObj.pageSize,
                //     PageNumber: vm.gridConfig.pagerObj.currentPage
                // }
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            }

            var options = {
                action: 'emr/DailyNote/GetDailyNotes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCurrentVisitListCallback
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
            utl.Modal.open('patientemr.doctornotestab.doctornotesform', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    eid: $scope.encounteritem.Id,
                    isspouse: true,
                    lpid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/DailyNote/DeleteDailyNote',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('patientemr.doctornotestab.doctornotesform', {
                    params: {
                        id: entity.Id,
                        pid: $scope.item.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }

        };

        vm.gridConfig = {
            columnDefs: [{
                    field: "CapturedOn",
                    displayName: $translate.instant('patientemr.nursingnotes-list.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CapturedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.CapturedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "CapturedBy",
                    displayName: $translate.instant('patientemr.nursingnotes-list.capturedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CapturedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.CapturedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.CapturedUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "DailyNote",
                    displayName: $translate.instant('patientemr.nursingnotes-list.notes.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" uib-tooltip="Edit" tooltip-placement="bottom" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.getlinkPatientsCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.Patientdata = res.Data[0];
                if ($scope.Patientdata.Encounters && $scope.Patientdata.Encounters.length > 0) {
                    $scope.encounteritem = $scope.Patientdata.Encounters[0];
                    if ($scope.encounteritem.EncounterStatusId == 1) {
                        $scope.EncounterStatus = 'Checked-In';
                    } else {
                        $scope.EncounterStatus = 'Checked-Out';
                    }
                } else {
                    $scope.EncounterStatus = 'Checked-Out';
                }
                if ($scope.Patientdata.ReferrerId) {
                    $scope.ShowReferTab = true;
                }
            }
            $scope.getList();
        };

        $scope.getlinkPatients = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.PatientId
                }, ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getlinkPatientsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getfamilylinksCallback = function (scope, data, options, hasError) {
            $scope.PatientLink = data[0];
            $scope.item.PatientId = $scope.PatientLink.MemberId;
            $scope.getlinkPatients();
        };

        $scope.getfamilylinks = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.pid
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/FamilyLink/GetFamilyLinks',
                data: inputData,
                type: 'post',
                onComplete: $scope.getfamilylinksCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
            $scope.getfamilylinks();
        };
        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Note"
                },
                {
                    "Key": "User"
                },
                {
                    "Key": "NoteStatus"
                }
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
    IVFConsultationNotesspouseListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();