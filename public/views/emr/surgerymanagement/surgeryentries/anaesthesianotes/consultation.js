(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AnaesthesiaNoteconsultationController', AnaesthesiaNoteconsultationController);

    function AnaesthesiaNoteconsultationController($scope, $stateParams, $state, $translate, utl, $uibModal, $timeout) {
        var vm = this;

        var SectionNoteTypeId = 5; // OT Reference Id // SectionNoteType

        $scope.consultationloaded = false;

        $scope.currentcontext = {};

        $scope.cncontext = {
            tabstop: [],
            tabsright: [],
            currenttmpl: '',
            consultationid: 0,
            canshowuserpref: false,
            encounter: {}
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.cncontext.encounter.PatientId = parseInt($stateParams.pid);
        $scope.cncontext.encounter.Id = parseInt($stateParams.eid);
        $scope.cncontext.encounter.EncounterDoctorId = 0;
        $scope.item = {};


        $scope.getOTRegData = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id },
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getOTRegDataCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getOTRegDataCallback = function (scope, res, options, hasError) {
            if (res && res.Data
                && res.Data.length > 0) {
                var item = res.Data[0];
                $scope.currentcontext.pid = item.PatientId;
                $scope.currentcontext.eid = item.EncounterId;
                $scope.cncontext.encounter.PatientId = item.PatientId;
                $scope.cncontext.encounter.Id = item.EncounterId;
            }
            $scope.getCurrentConsultation();
        };



        $scope.profileinfo = { profileid: -1, Name: null };

        $scope.sectionMap = {
            'emr.cn.allergy': { tmpl: getSectionPath() + 'allergy/cn-allergy-section.html', controller: 'cnAllergySectionController' },
            'emr.cn.condition': { tmpl: getSectionPath() + 'condition/cn-condition-section.html', controller: 'cnConditionSectionController' },
            'emr.cn.diagnosis': { tmpl: getSectionPath() + 'diagnosis/cn-diagnosis-section.html', controller: 'cnDiagnosisSectionController' },
            'emr.cn.question': { tmpl: getSectionPath() + 'question/cn-question-section.html', controller: 'otcnQuestionSectionController' },
            'emr.cn.vital': { tmpl: getSectionPath() + 'vital/cn-vital-section.html', controller: 'cnVitalSectionController' },
            'emr.cn.procedure': { tmpl: getSectionPath() + 'procedure/cn-procedure-section.html', controller: 'cnProcedureSectionController' },
            'emr.cn.document': { tmpl: getSectionPath() + 'document/cn-document-section.html', controller: 'cnDocumentSectionController' },
            'emr.cn.familycondition': { tmpl: getSectionPath() + 'familycondition/cn-familycondition-section.html', controller: 'cnFamilyConditionSectionController' },
            'emr.cn.socialhistory': { tmpl: getSectionPath() + 'socialhistory/cn-socialhistory-section.html', controller: 'cnSocialHistorySectionController' },
            'emr.cn.familysocialhistory': { tmpl: getSectionPath() + 'familysocialhistory/cn-familysocialhistory-section.html', controller: 'cnFamilySocialHistorySectionController' },
            'emr.cn.immunization': { tmpl: getSectionPath() + 'immunization/cn-immunization-section.html', controller: 'cnImmunizationSectionController' },
            'emr.cn.prescription': { tmpl: getSectionPath() + 'prescription/cn-prescription-section.html', controller: 'cnPrescriptionSectionController', params: { id: null } },
            'emr.cn.order': { tmpl: getSectionPath() + 'order/cn-order-section.html', controller: 'cnOrderSectionController' },
            'emr.cn.labresults': { tmpl: getSectionPath() + 'labresults/cn-labresults-section.html', controller: 'cnLabResultsSectionController' },
            'emr.cn.radiologyresults': { tmpl: getSectionPath() + 'radiologyresults/cn-radiologyresults-section.html', controller: 'cnRadiologyResultsSectionController' },
            'emr.cn.dietplan': { tmpl: getSectionPath() + 'dietplan/cn-dietplan-section.html', controller: 'cnDietPlanSectionController' },
            'emr.cn.chiefcomplaint': { tmpl: getSectionPath() + 'chiefcomplaint/cn-chiefcomplaint-section.html', controller: 'cnChiefComplaintSectionController' },
            'emr.cn.followup': { tmpl: getSectionPath() + 'followup/cn-followup-section.html', controller: 'cnFollowupSectionController' },
            'emr.cn.reviewnotes': { tmpl: getSectionPath() + 'reviewnotes/reviewnotes.html', controller: 'otreviewNotesController' },
            'emr.cn.annotation': { tmpl: getSectionPath() + 'annotations/cn-annotation-section.html', controller: 'cnAnnotationSectionController' }
        };

        function getSectionPath() {
            return "app/views/emr/surgerymanagement/surgeryentries/anaesthesianotes/sections/";
        }


        function computeTabs() {
            var profile = $scope.item.ProfileMaster;
            if (profile && profile.ProfileSections) {
                if (profile.ProfileSections.length > 0) {
                    var tabstop = [];
                    var tabsright = [];

                    for (var idx in profile.ProfileSections) {
                        var profileSection = profile.ProfileSections[idx];
                        if (profileSection.SectionMaster) {
                            profileSection.SectionMaster.SRef = profileSection.SectionMaster.SRef || 'emr.cn.question';
                            var mapData = $scope.sectionMap[profileSection.SectionMaster.SRef];
                            var currentTmpl = mapData.tmpl;
                            var tabItem = {
                                sectionid: profileSection.SectionMaster.Id,
                                sectiontypeid: profileSection.SectionMaster.SectionTypeId,
                                title: profileSection.SectionMaster.Name, sref: profileSection.SectionMaster.SRef,
                                key: profileSection.SectionMaster.SRef, tmpl: currentTmpl,
                                controller: mapData.controller
                            };
                            tabItem.DisplayOrder = profileSection.DisplayOrder ? parseInt(profileSection.DisplayOrder) : 1000;

                            if (profileSection.DockPositionId == 2) { //top
                                tabstop.push(tabItem)
                            } else if (profileSection.DockPositionId == 3) { //right
                                tabsright.push(tabItem)
                            }
                        }
                    }

                    tabstop = _.sortBy(tabstop, ['DisplayOrder']);
                    $scope.cncontext.tabstop = tabstop;

                    //Add review note tab to top
                    var tabItem = {
                        sectionid: '',
                        sectiontypeid: '',
                        title: 'Review Notes', sref: 'emr.cn.reviewnotes',
                        key: profileSection.SectionMaster.SRef, tmpl: $scope.sectionMap['emr.cn.reviewnotes'].tmpl,
                        controller: $scope.sectionMap['emr.cn.reviewnotes'].controller
                    };
                    tabstop.push(tabItem)

                    tabsright = _.sortBy(tabsright, ['DisplayOrder']);
                    $scope.cncontext.tabsright = tabsright;

                    //Load first tab item template by default
                    $scope.switchTopTab($scope.cncontext.tabstop[0]);

                }
            }
        }

        $scope.switchTopTab = function (tab) {
            $scope.cncontext.currentsection = tab;
        }

        $scope.switchSideTab = function (tab) {
            $scope.cncontext.currentsidesection = tab;

            $timeout(function () {
                openSideTab($scope.cncontext.currentsidesection);
            }, 100);
        }

        var openSideTab = function (options) {
            var dialogSize = 'lg';
            var relativeto = '#tab-sidebar';
            var modalCfg = {
                params: { cid: $scope.cncontext.consultationid, sid: options.sectionid, stid: options.sectiontypeid },
                confirmCallback: $scope.getList
            }

            var modalInstance = $uibModal.open({
                templateUrl: options.tmpl,
                size: dialogSize,
                controller: options.controller,
                controllerAs: 'vm',
                windowClass: 'modal modal-slide-in-right',
                resolve: {
                    modalConfig: function () {
                        return modalCfg;
                    }
                }
            });

            modalInstance.rendered.then(function (modal) {

                if (relativeto) {
                    var element = document.querySelector(relativeto);
                    if (element) {
                        var rect = element.getBoundingClientRect(),

                            modal = document.querySelector('.modal-dialog');
                        console.log(rect);
                        modal.style.margin = 0;
                        modal.style.top = rect.top + 30 + 'px';
                        modal.style.left = rect.left + rect.width - 35 - modal.offsetWidth + 'px';
                    }
                }
            });

            return modalInstance;
        }



        $scope.approveConsultation = function () {
            updateProgressNoteStatus(2); //
        }

        $scope.releaseToPatient = function () {
            updateProgressNoteStatus(3); //
        }

        function updateStatusCallback() {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        }

        function updateProgressNoteStatus(statusId) {
            var actionName = 'emr/consultation/UpdateProgressNoteStatus';

            var options = {
                action: actionName,
                data: { Id: $scope.cncontext.consultationid, Data: { ProgressNoteStatusId: statusId } },
                type: 'post',
                onComplete: updateStatusCallback
            };
            utl.Http.doAction(options);
        }

        /*
        $scope.update = function () {
            utl.Modal.open('patientemr.consultationform', {
                params: {
                    id: $scope.item.Id, vid: $scope.item.VisitTypeId, prfid: $scope.profileinfo.profileid,
                    date: $scope.item.CreatedAt
                },
                confirmCallback: $scope.getList
            });
        }
        */

        $scope.consultationChanged = function () {
            $scope.cncontext.currentsection = null;
            $scope.cncontext.currenttmpl = 'cn-dummy.html';
            $scope.cncontext.tabstop = [];
            $scope.cncontext.consultationid = 0;
            $scope.consultationloaded = false;
        };

        // Delete OT Consultation Notes
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.consultationChanged();
        };
        $scope.deleteItem = function () {
            if ($scope.cncontext.consultationid && $scope.cncontext.consultationid > 0) {
                var options = {
                    action: 'emr/consultation/DeleteConsultation',
                    data: { Id: $scope.cncontext.consultationid },
                    type: 'post',
                    onComplete: $scope.deleteItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        // Delete OT Consultation Notes

        //open Review Note modal
        $scope.reviewNote = function () {
            utl.Modal.open('patientemr.reviewnotes', {
                params: { cid: $scope.cncontext.consultationid, pid: $scope.cncontext.encounter.PatientId }
            });
        }
        //open Review Note modal

        //Save profile Info
        $scope.saveItem = function () {
            if ($scope.profileinfo && $scope.profileinfo.profileid
                && $scope.profileinfo.profileid > 0) {
                var inputData = {
                    PatientId: $scope.cncontext.encounter.PatientId,
                    EncounterId: $scope.cncontext.encounter.Id,
                    EncounterDoctorId: $scope.cncontext.encounter.EncounterDoctorId,
                    Name: $scope.profileinfo.Name,
                    ProfileId: $scope.profileinfo.profileid,
                    ProgressNoteStatusId: 1
                };
                var actionName = 'emr/consultation/AddConsultation';
                var options = {
                    action: actionName,
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            } else {
                utl.Alert.showErrorMsg('Select Profile....');
            }
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "number") {
                $scope.cncontext.consultationid = data;
            }
            $scope.getCurrentConsultation();
        };
        //Save profile Info

        //get profile Info Name
        $scope.profilePrefChanged = function (SelectedProfile) {
            if (SelectedProfile && SelectedProfile.Id) {
                $scope.profileinfo.Name = SelectedProfile.Text;
            }
        };
        //get profile Info Name

        // Create Consultation from Profile Information
        $scope.CreategetOTNotesProfileEntry = function () {
            var ProfileName = null;
            for (var idx in $scope.lookup.Profile) {
                if ($scope.lookup.Profile[idx].Id == $scope.profileinfo.profileid) {
                    ProfileName = $scope.lookup.Profile[idx].Text;
                    break;
                }
            }
            if ($scope.profileinfo && $scope.profileinfo.profileid
                && $scope.profileinfo.profileid > 0) {
                $scope.consultation = {
                    ConsultationDate: new Date(),
                    EncounterDoctorId: utl.Session.getCurrentUserId(),
                    EncounterId: $scope.currentcontext.eid,
                    Name: ProfileName,
                    PatientId: $scope.currentcontext.pid,
                    ProfileId: $scope.profileinfo.profileid,
                    ProgressNoteStatusId: 1,
                    VisitTypeId: null
                }
                var actionName = 'emr/consultation/AddConsultation';
                var options = {
                    action: actionName,
                    data: { Data: $scope.consultation },
                    type: 'post',
                    onComplete: $scope.OTNotesProfileEntryCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.OTNotesProfileEntryCallback = function (scope, res, options, hasError) {
            if (res === false) {
                $scope.cncontext.consultationid = options.data.Data.Id;
            } else {
                $scope.cncontext.consultationid = res;
            }
            if ($scope.cncontext.consultationid > 0) {
                $scope.getCurrentConsultation();
            }
        };
        // Create Consultation from Profile Information

        //get consultation for encounterid and OT Note Profile id
        $scope.getOTNotes = function () {
            var inputData = {
                Params: [
                    { Key: 11, Value: SectionNoteTypeId },
                    { Key: 2, Value: $scope.currentcontext.eid },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOTNotesCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getOTNotesCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.cncontext.consultationid = res.Data[0].Id;
                $scope.getCurrentConsultation();
            } else {
                $scope.CreategetOTNotesProfileEntry();
            }
        };
        //get consultation for encounterid and OT Note Profile id


        //get consultation for consultationid
        $scope.getCurrentConsultation = function () {
            if ($scope.cncontext.consultationid && $scope.cncontext.consultationid > 0) {
                $scope.consultationloaded = true;
                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: { Id: $scope.cncontext.consultationid },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.getOTNotes();
            }
        };
        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            computeTabs();
        };
        //get consultation for consultationid


        //get profileuser preference
        $scope.getProfileUserPreference = function () {
            var profileids = [];
            for (var idx in $scope.lookup.Profile) {
                if ($scope.lookup.Profile[idx].Id) {
                    profileids.push($scope.lookup.Profile[idx].Id)
                }
            }
            if (profileids && profileids.length > 0) {
                var inputData = {
                    Params: [
                        { Key: 5, Value: utl.Session.getCurrentUserId() },
                        { Key: 2, Value: profileids },
                        { Key: 8, Value: 1 },
                    ],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'clinicalmaster/ProfileUser/GetProfileUsers',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getProfileUserPreferenceCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getProfileUserPreferenceCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0)
                $scope.profileinfo.profileid = res.Data[0].ProfileId;

            if (!$scope.currentcontext.eid) $scope.getOTRegData();
            else if ($scope.currentcontext.eid <= 0) $scope.getOTRegData();
            else $scope.getCurrentConsultation();

        };
        //get profileuser preference


        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getProfileUserPreference();
        };
        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Profile",
                    Request: { Params: [{ Key: 4, Value: SectionNoteTypeId }] }
                },
                { "Key": "SectionNoteType" }
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
        //lookup
    }

    AnaesthesiaNoteconsultationController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModal', '$timeout'];

})();
