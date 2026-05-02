(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ippatientfeedbacksListController', ippatientfeedbacksListController);

    function ippatientfeedbacksListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: 1,
            FeedbackTypeId: -1,
            FeedbackCategoryId: -1,
            ActiveStatusId: 2
        };
        $scope.currentcontext = {};

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 2, Value: $scope.currentfilter.FeedbackCategoryId },
                    { Key: 3, Value: $scope.currentfilter.FeedbackTypeId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/FeedbacksMaster/GetFeedbacksMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Title',
                field: 'Title',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Name',
                field: 'PatientName',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Age/Gender',
                field: 'Age',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'DOB',
                field: 'DOB',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'MRN',
                field: 'MRN',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Visit#',
                field: 'VisitIdentifier',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Ward/Room/Bed',
                field: 'WardDetail',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            ],
            searchparams: {},
            result: {},
            api: 'Visit/Visit/GetEncounters',
            presearch: presearchEncounter,
            formatdisplay: formatselectedEncounter,
            postsearch: postsearchEncounter
        };

        function formatselectedEncounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            var result = '';
            if (selectedItem) {
                result = '';
                if (selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
                // if (selectedItem.Patient.Department)
                //     result += '' + selectedItem.Department;
            }
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = '';
                if (selectedItem.Patient && selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient && selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient && selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
                // if (selectedItem.Patient && selectedItem.Patient.Department)
                //     result += '' + selectedItem.Patient.Department;
            }
            if (vm.patientcontrolconfig.selected)
                $scope.patientChanged();
            return result;
        }

        function presearchEncounter() {
            var query = vm.patientcontrolconfig.query;

            //Only ip encounter
            var inputData = {
                Params: [
                    {
                        Key: 15, //EncounterTypeId
                        Value: 2
                    },
                    {
                        Key: 38, //AdmissionStatusId
                        Value: [2, 3, 4, 5, 6]
                    },
                    {
                        Key: 1,
                        Value: utl.Session.getCurrentFacilityId()
                    }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.patientcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 11, //PatientNameMRN
                    Value: query
                });
            }
            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchEncounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Patient.Title ? item.Patient.Title.Description : '';
                if (item.Patient.LastName) item.PatientName = [item.Patient.FirstName, item.Patient.LastName].join(' ');
                else item.PatientName = item.Patient.FirstName;
                item.Age = item.Patient.Age + ' / ' + item.Patient.Gender.Description;
                item.DOB = $filter('date')(item.Patient.DOB, 'yyyy-MMM-dd');
                item.MRN = item.Patient.MRN;
                item.VisitIdentifier = item.VisitIdentifier;
                if (item.WardMaster) {
                    item.WardDetail = item.WardMaster.WardName;
                }
                if (item.WardRoomMaster) {
                    item.WardDetail += ' / ' + item.WardRoomMaster.RoomNo;
                }
                if (item.WardRoomBedMaster) {
                    item.WardDetail += ' / ' + item.WardRoomBedMaster.BedNo;
                }
            }
        }
        $scope.patientChanged = function () {
            $scope.Encounter = $scope.item.SelectedItem;
            $scope.item.PatientId = $scope.Encounter.PatientId;
            $scope.item.FirstName = $scope.Encounter.Patient.FirstName;
            $scope.item.LastName = $scope.Encounter.Patient.LastName;
            $scope.item.Age = $scope.Encounter.Patient.Age;
            $scope.item.DOB = $scope.Encounter.Patient.DOB;
            $scope.item.Mobile = $scope.Encounter.Patient.Mobile;
            $scope.item.MRN = $scope.Encounter.Patient.MRN;
            if ($scope.Encounter.WardMaster) {
                $scope.item.WardName = $scope.Encounter.WardMaster.WardName;
            }
            if ($scope.Encounter.WardRoomMaster) {
                $scope.item.RoomNo = $scope.Encounter.WardRoomMaster.RoomNo;
            }
            if ($scope.Encounter.WardRoomBedMaster) {
                $scope.item.BedNo = $scope.Encounter.WardRoomBedMaster.BedNo;
            }
            $scope.item.PhotoPath = $scope.Encounter.Patient.PhotoPath;
            $scope.item.DoctorName = $scope.Encounter.DoctorName;
            if ($scope.Encounter.Patient.Gender) {
                $scope.item.Gender = $scope.Encounter.Patient.Gender.Description;
            }
            $scope.getPatientProfilePic();
        };

        //get patient profile
        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    Id: $scope.item.Id,
                    PhotoPath: $scope.item.PhotoPath
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.PatInfoCallback = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            if ($scope.selectedPatient.Title) {
                $scope.item.Title = $scope.selectedPatient.Title.Description;
            }
            $scope.item.PatientId = $scope.selectedPatient.Id;
            $scope.item.FirstName = $scope.selectedPatient.FirstName;
            $scope.item.LastName = $scope.selectedPatient.LastName;
            $scope.item.Age = $scope.selectedPatient.Age;
            $scope.item.DOB = $scope.selectedPatient.DOB;
            $scope.item.Mobile = $scope.selectedPatient.Mobile;
            $scope.item.MRN = $scope.selectedPatient.MRN;
            $scope.item.PhotoPath = $scope.selectedPatient.PhotoPath;
            if ($scope.selectedPatient.Gender) {
                $scope.item.Gender = $scope.selectedPatient.Gender.Description;
            }
            if ($scope.selectedPatient.Encounters) {
                if ($scope.selectedPatient.Encounters.length > 0) {
                    for (var idxencounter in $scope.selectedPatient.Encounters) {
                        var encounters = $scope.selectedPatient.Encounters[idxencounter];
                        $scope.item.EncounterId = encounters.Id;
                    }
                }
            }
            $scope.getPatientProfilePic();
        };
        $scope.patientChange = function (pageNo) {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.PatInfoCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.moveHeaderFocus = function (nextId) {
            $scope.CanShow = 0;
            if (event.keyCode == 13) {
                if (nextId == "pid") {
                    if ($scope.item && $scope.item.PatientId) $('#DoctorId').focus();
                    else {
                        var titledom = document.getElementById('title');
                        $scope.setCmbFocus(titledom);
                    }
                }
            }
        };
        // $scope.feedback = function () {
        //     utl.Modal.openFixedDialog('app.ippatientfeedback', {
        //         params: {
        //             pid: $scope.item.PatientId,
        //             eid: $scope.item.EncounterId
        //         },
        //         confirmCallback: $scope.initLookup
        //     });
        // }
        $scope.feedback = function () {
            $state.go('app.patient-feedback-form', {
                context: 'ippf',
                pid: $scope.item.PatientId,
                eid: $scope.item.EncounterId,
                // id: $scope.item.Id
            });
        }
        $scope.openModal = function (Id) {
            utl.Modal.openFixedDialog('app.feedbackmaster', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function () {
            $scope.openModal(0);
        }
        //Grid Actions
        // $scope.addNew = function() {
        //    $state.go('app.remark', { id:0 });  


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/FeedbacksMaster/DeleteFeedbacksMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
                //$state.go('app.remark', { id:entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Code);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Facility.FacilityName", displayName: $translate.instant('generalmaster.feedbackmasters.facility.lbl') },
                { field: "FeedbackType.Description", displayName: $translate.instant('generalmaster.feedbackmasters.type.lbl') },
                { field: "FeedbackCategory.Description", displayName: $translate.instant('generalmaster.feedbackmasters.category.lbl') },
                { field: "Feedbacks", displayName: $translate.instant('generalmaster.feedbackmasters.feedbacks.lbl') },
                { field: "Description", displayName: $translate.instant('generalmaster.feedbackmasters.description.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.feedbackmasters.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><i class="fa fa-trash" aria-hidden="true"></i></span>\
                </div>',
                    // actions: [
                    //     { actiontype: 'edit', display: 'common.editaction.lbl' },
                    // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    // ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "FeedbackType" },
                { "Key": "FeedbackCategory" },
                { "Key": "ActiveStatus" }
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

    ippatientfeedbacksListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();