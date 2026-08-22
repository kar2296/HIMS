(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientfeedbacksListController', patientfeedbacksListController);

    function patientfeedbacksListController($scope, $stateParams, $state, $translate, utl, $filter, $http) {
        var vm = this;
        $scope.currentuser = {
            username: sessionStorage.getItem('Session-UserFullName'),
            departmentname: sessionStorage.getItem('Session-DepartmentName'),
            facilityname: sessionStorage.getItem('Session-FacilityName'),

        };
        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: 1,
            FeedbackTypeId: -1,
            FeedbackCategoryId: -1,
            ActiveStatusId: 2
        };
        $scope.currentcontext = {};
        // The live template (see patient-feedback.html) never renders a grid element,
        // so $scope.item was previously auto-vivified to {} only by AngularJS's
        // two-way binding on <autosearch itemid="item.EncounterId" ...> -- explicit
        // now that the native directive is gone. Same effective starting state.
        $scope.item = {};

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
        //get patient profile
        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
            $scope.refreshReactProps();
            $scope.$applyAsync();
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
        // Dead code, not called by the live template (no ui-sref/ng-click reaches it)
        // -- preserved verbatim, unused, same as before this retrofit.
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

        // Kept in place, unused directly by the React bridge below (it mixed
        // display-string formatting for the native <autosearch> input with the
        // real IsBillLock/IsBillFinalized validation) -- the validation branch is
        // faithfully reimplemented in $scope.selectEncounter below instead, since
        // there's no native input to format a display string for anymore.
        function formatselectedEncounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            if (selectedItem) {
                if (selectedItem.IsBillLock) {
                    var msg = 'otregister-form.billlockalert.lbl';

                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                } else if (selectedItem.IsBillFinalized) {
                    var msg = 'otregister-form.billfinalizealert.lbl';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                }
            }
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                var strTitle = selectedItem.Patient && selectedItem.Patient.Title ? selectedItem.Patient.Title.Description : '';

                if (strTitle)
                    result += strTitle;
                if (selectedItem && selectedItem.Patient && selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem && selectedItem.Patient && selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;

                if (!$scope.currentcontext.ismodal) {
                    $scope.patientChanged();
                }
            }

            return result;
        }

        function presearchEncounter() {
            var query = vm.patientcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 15,
                    Value: 1
                },
                    // {
                    //     Key: 31,
                    //     Value: '2,3,4,5'
                    // }
                ],
                PageContext: {
                    PageSize: 200,
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
                    Key: 11,
                    Value: query
                });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchEncounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Patient.Title ? item.Patient.Title.Description : '';

                item.PatientName = '';
                if (item.Patient.FirstName)
                    item.PatientName += item.Patient.FirstName;
                if (item.Patient.LastName)
                    item.PatientName += item.Patient.LastName;

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
            $scope.item.PhotoPath = $scope.Encounter.Patient.PhotoPath;
            if ($scope.Encounter.Patient.Gender) {
                $scope.item.Gender = $scope.Encounter.Patient.Gender.Description;
            }
            $scope.getPatientProfilePic();
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
        $scope.feedbackmodal = function () {
            utl.Modal.openFixedDialog('app.patientfeedback', {
                params: {
                    pid: $scope.item.PatientId,
                    eid: $scope.item.EncounterId
                },
                confirmCallback: $scope.initLookup
            });
        }

        $scope.feedbackpage = function () {
            $state.go('app.patient-feedback-form', {
                context: 'oppf',
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
        $scope.verificationotp = function () {
            $state.go('app.patient-feedbackotpverification');
        }
        $scope.getpatienttoken = function () {
            $state.go('app.patientgettoken');
        }
        $scope.patientregistration = function () {
            $state.go('app.feedbackquickregistration');
        }
        $scope.finddoctors = function () {
            $state.go('app.feedbackcategoryselection');
        }
        $scope.getvirtualsubcategory = function (items) {
            $state.go('app.feedbackcategoryselection', {
                // categoryid: items.Id,
                // ctgryInfo: items
            });
        };
        $scope.getVirtualCategoryCallback = function (scope, res, options, hasError) {
            $scope.VirtualCategory = res.Data || [];
            loadImages();
        };
        $scope.getVirtualCategory = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
            };

            var options = {
                action: 'VirtualHealthcare/VirtualCategory/GetVirtualCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVirtualCategoryCallback
            };

            utl.Http.doAction(options);
        };



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

        /* React bridge code starts --------------------------------------------
         * The live template never actually renders vm.gridConfig (no ui-grid /
         * <custom-table> element in patient-feedback.html) -- the Feedbacks
         * Master CRUD machinery above (getList/handleEvents/onDeleteConfirmed/
         * openModal/addNew) is dead code in THIS screen and is left untouched,
         * unused, exactly as it was. What the template actually renders is:
         * search for a patient's encounter, show a profile card, and a button
         * that navigates to app.patient-feedback-form. That's what's ported.
         *
         * The real search behind the native <autosearch itemid="item.EncounterId"
         * iteminfo="item.SelectedItem" rowdata="item" config="vm.patientcontrolconfig"
         * itemchange="patientChanged()"> is reused verbatim (same api/presearch/
         * postsearch, same $http.post(window.appPath.apiroot + ...) mechanism the
         * shared autosearch directive itself uses -- see
         * public/vendor/components/autosearch.js's cvm.searchItem/searchItemCallback),
         * just exposed to React as a Promise-returning prop instead of being driven
         * by the directive's own ui-select binding.
         */
        $scope.searchEncounters = function (query) {
            vm.patientcontrolconfig.query = query;
            vm.patientcontrolconfig.searchbyid = false;
            presearchEncounter();
            if (!(query && query.length > 2)) {
                return Promise.resolve([]);
            }
            return $http.post(window.appPath.apiroot + vm.patientcontrolconfig.api, vm.patientcontrolconfig.searchparams)
                .then(function (res) {
                    vm.patientcontrolconfig.result = res.data.Data;
                    postsearchEncounter();
                    return vm.patientcontrolconfig.result;
                });
        };

        // Faithful re-implementation of autoSearchCtrl.OnSelectItem (sets
        // itemid/iteminfo, i.e. item.EncounterId/item.SelectedItem) followed by
        // formatselectedEncounter's real IsBillLock/IsBillFinalized validation
        // (same message keys, same error alert, same item reset on failure) and
        // patientChanged() (same field population + profile-pic fetch). The
        // original's "if (!$scope.currentcontext.ismodal)" guard around
        // patientChanged() is always true here -- currentcontext.ismodal is never
        // set anywhere in this controller -- so it's called unconditionally,
        // which is behaviorally identical for this screen's real usage.
        $scope.selectEncounter = function (encounter) {
            if (encounter) {
                if (encounter.IsBillLock) {
                    utl.Alert.showErrorMsg($translate.instant('otregister-form.billlockalert.lbl'));
                    $scope.item = {};
                    $scope.refreshReactProps();
                    return;
                } else if (encounter.IsBillFinalized) {
                    utl.Alert.showErrorMsg($translate.instant('otregister-form.billfinalizealert.lbl'));
                    $scope.item = {};
                    $scope.refreshReactProps();
                    return;
                }
            }
            $scope.item.EncounterId = encounter ? encounter.Id : null;
            $scope.item.SelectedItem = encounter;
            $scope.patientChanged();
            $scope.refreshReactProps();
        };

        $scope.reactProps = {};

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                item: $scope.item || {},
                photo: $scope.currentcontext.Photo
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'select':
                    $scope.selectEncounter(payload && payload.encounter);
                    return;
            }
            if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
        };

        $scope.refreshReactProps();
        /* React bridge code ends */

        $scope.getVirtualCategory();
        $scope.initLookup();
    }

    patientfeedbacksListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$http'];

})();
