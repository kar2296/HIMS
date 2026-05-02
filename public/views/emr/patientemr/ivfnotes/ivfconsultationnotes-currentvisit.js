(function () {
    'use strict';

    angular
        .module('app.pages') 
        .controller('IVFConsultationNotescurrentListController', IVFConsultationNotescurrentListController);

    function IVFConsultationNotescurrentListController($scope, $filter, $stateParams, $state, $translate, utl) {
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
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.tabs = [{
                title: $translate.instant('patientemr.patientorder-list.Patient.lbl'),
                state: 'patientemr.ivfnotestab.ivfnotescurrentlist'
            },
            {
                title: $translate.instant('patientemr.patientorder-list.Spouse.lbl'),
                state: 'patientemr.ivfnotestab.ivfnotespreviouslist'
            },
        ];
        $scope.switchTab = function(tab) {
            $state.go(tab.state);
        }
        $scope.currentcontext = {
            option: 'currentvisits'
        }
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({ $scope: $scope }));

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


        //getList
        $scope.getCurrentVisitListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            // for (var idx in res.Data) {
            //     var samples = res.Data[idx];
            //     // if (samples.SampleStatusId == 1) {
            //         //$scope.currentcontext.pid = samples.Id;
            //         $scope.currentcontext.pid=res.Data;
            //        // $scope.getList();
            //     // }
            // }
            $scope.Details = [];
            for (var idx in res.Data) {
                var item=res.Data[idx]
                $scope.Details.push(item);
            }


           

            
             

              

            }    

        $scope.getList = function () {
            // var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 7, Value: $scope.currentcontext.pid },
                    { Key: 9, Value: $scope.currentcontext.eid },
                    { Key: 1, Value: 1 },
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
                utl.Modal.open('patientemr.doctornotestab.doctornotesform', {
                    params: { id: entity.Id, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }

        };
        $scope.testtat = function(Details) {
            utl.Modal.open('patientemr.doctornotestab.doctornotesform', {
                params: {
                    id: Details.Id, 
                    pid: $scope.currentcontext.pid 
                },
                   confirmCallback: $scope.getList
            });
        }
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
                { field: "DailyNote", displayName: $translate.instant('patientemr.nursingnotes-list.notes.lbl') },
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

        $scope.EncInfoCallBack = function (scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
            var selectedItem = $scope.Encounter;
            if (selectedItem) {
                $scope.item.EncounterId = selectedItem.Id;
                $scope.item.AdmissionDate = selectedItem.AdmissionDate;
                $scope.item.DoctorId = selectedItem.DoctorId;
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                $scope.item.DepartmentName = selectedItem.Department.DepartmentName;
                $scope.item.WardId = selectedItem.WardId
                $scope.item.RoomId = selectedItem.RoomId;
                $scope.item.BedId = selectedItem.BedId;
                $scope.item.GuarantorId = selectedItem.GuarantorId;
                $scope.item.AdmissionStatusId = selectedItem.AdmissionStatusId;
                if (selectedItem.AdmissionStatusId == 6) {
                    $scope.item.DischargeDate = selectedItem.DischargeDate;
                } else {
                    $scope.item.DischargeDate = utl.Formatter.getCurrentDate();
                }
                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.PatientMrn = selectedItem.PatientMrn;
                $scope.item.VisitIdentifier = selectedItem.VisitIdentifier;
                $scope.item.Age = selectedItem.Patient.Age;
                $scope.item.Mobile = selectedItem.Patient.Mobile;
                $scope.item.GuarantorName = selectedItem.Guarantor.GuarantorName;
                $scope.item.PatientName = '';
                $scope.item.DoctorName = '';
                // $scope.item.DoctorName = selectedItem.Doctor.Title.Description + ' ' + selectedItem.Doctor.FirstName + ' ' + selectedItem.Doctor.LastName;
                if (selectedItem.Doctor.Title)
                    $scope.item.DoctorName += selectedItem.Doctor.Title.Description;
                if (selectedItem.Doctor.FirstName)
                    $scope.item.DoctorName += ' ' + selectedItem.Doctor.FirstName;
                if (selectedItem.Doctor.LastName)
                    $scope.item.DoctorName += ' ' + selectedItem.Doctor.LastName;
                if (selectedItem.Patient.Title)
                    $scope.item.PatientName += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient.FirstName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient.LastName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.LastName;
                if (selectedItem.Patient.Gender)
                    $scope.item.Gender = selectedItem.Patient.Gender.Description;
                if (selectedItem.EncounterTypeId == 2) {
                    $scope.item.EncounterTypeId = 2;
                    $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategoryId;
                    if (selectedItem.WardMaster) {
                        $scope.item.WardDetail = selectedItem.WardMaster.WardName;
                    }
                    if (selectedItem.WardRoomMaster) {
                        $scope.item.WardDetail += ' / ' + selectedItem.WardRoomMaster.RoomNo;
                    }
                    if (selectedItem.WardRoomBedMaster) {
                        $scope.item.WardDetail += ' / ' + selectedItem.WardRoomBedMaster.BedNo;
                    }
                } else {
                    $scope.item.ServiceRateCategoryId = 1;
                    $scope.item.EncounterTypeId = 1;
                }
            }
            if ($scope.currentcontext.id == 0 || !$scope.currentcontext.id) {
                $scope.getPrevPatCertByPatId();
            }
        }


        $scope.EncInfo = function () {
            if ($scope.currentcontext.encounterid && $scope.currentcontext.encounterid > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.encounterid
                    }]
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.EncInfoCallBack
                };
                utl.Http.doAction(options);
            }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.EncInfo();
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
    IVFConsultationNotescurrentListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();