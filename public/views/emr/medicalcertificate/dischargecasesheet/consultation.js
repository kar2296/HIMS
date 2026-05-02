(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('discasshtconsultationController', discasshtconsultationController);

    function discasshtconsultationController($scope, $stateParams, $state, $translate, utl, $uibModal, $timeout) {
        var vm = this;

        //Preference code
        angular.extend(this, utl.Ctrl.getUPCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({ $scope: $scope }));
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.tabs = [
            {
                title: $translate.instant('patientemr.patientorder-list.currentvisit.lbl'),
                state: 'patientemr.dischargesummarytab.dischargesummarycurrentvisit'
            },
            {
                title: $translate.instant('patientemr.patientorder-list.history.lbl'),
                state: 'patientemr.dischargesummarytab.dischargesummaryhistory'
            },
        ];

        $scope.cncontext = {
            tabstop: [],
            tabsright: [],
            currenttmpl: '',
            consultationid: 0,
            canshowuserpref: false
        };

        $scope.prefcontext = {
            profileid: '',
            profilename: ''
        }

        $scope.cncontext.consultationid = $stateParams.id;

        $scope.item = {};


        $scope.sectionMap = {
            'emr.cn.allergy': { tmpl: getSectionPath() + 'allergy/cn-allergy-section.html', controller: 'discasshtcnAllergySectionController' },
            'emr.cn.condition': { tmpl: getSectionPath() + 'condition/cn-condition-section.html', controller: 'discasshtcnConditionSectionController' },
            'emr.cn.diagnosis': { tmpl: getSectionPath() + 'diagnosis/cn-diagnosis-section.html', controller: 'discasshtcnDiagnosisSectionController' },
            'emr.cn.question': { tmpl: getSectionPath() + 'question/cn-question-section.html', controller: 'discasshtcnQuestionSectionController' },
            // 'emr.cn.vital': { tmpl: getSectionPath() + 'vital/cn-vital-section.html', controller: 'discasshtcnVitalSectionController' },
            'emr.cn.vital': { tmpl: getSectionPath() + 'vital/cn-vital-section.html', controller: 'cnVitalSectionController' },
            'emr.cn.procedure': { tmpl: getSectionPath() + 'procedure/cn-procedure-section.html', controller: 'discasshtcnProcedureSectionController' },
            'emr.cn.document': { tmpl: getSectionPath() + 'document/cn-document-section.html', controller: 'discasshtcnDocumentSectionController' },
            'emr.cn.familycondition': { tmpl: getSectionPath() + 'familycondition/cn-familycondition-section.html', controller: 'discasshtcnFamilyConditionSectionController' },
            'emr.cn.socialhistory': { tmpl: getSectionPath() + 'socialhistory/cn-socialhistory-section.html', controller: 'discasshtcnSocialHistorySectionController' },
            'emr.cn.familysocialhistory': { tmpl: getSectionPath() + 'familysocialhistory/cn-familysocialhistory-section.html', controller: 'discasshtcnFamilySocialHistorySectionController' },
            'emr.cn.immunization': { tmpl: getSectionPath() + 'immunization/cn-immunization-section.html', controller: 'discasshtcnImmunizationSectionController' },
            // 'emr.cn.prescription': { tmpl: getSectionPath() + 'prescription/cn-prescription-section.html', controller: 'discasshtcnPrescriptionSectionController' },
            'emr.cn.prescription': { tmpl: getSectionPath() + 'prescription/cn-prescription-section.html', controller: 'cnPrescriptionSectionController' },
            'emr.cn.order': { tmpl: getSectionPath() + 'order/cn-order-section.html', controller: 'discasshtcnOrderSectionController' },
            'emr.cn.labresults': { tmpl: getSectionPath() + 'labresults/cn-labresults-section.html', controller: 'discasshtcnLabResultsSectionController' },
            'emr.cn.radiologyresults': { tmpl: getSectionPath() + 'radiologyresults/cn-radiologyresults-section.html', controller: 'discasshtcnRadiologyResultsSectionController' },
            'emr.cn.dietplan': { tmpl: getSectionPath() + 'dietplan/cn-dietplan-section.html', controller: 'discasshtcnDietPlanSectionController' },
            'emr.cn.chiefcomplaint': { tmpl: getSectionPath() + 'chiefcomplaint/cn-chiefcomplaint-section.html', controller: 'discasshtcnChiefComplaintSectionController' },
            'emr.cn.followup': { tmpl: getSectionPath() + 'followup/cn-followup-section.html', controller: 'discasshtcnFollowupSectionController' },
            'emr.cn.reviewnotes': { tmpl: getSectionPath() + 'reviewnotes/reviewnotes.html', controller: 'discasshtreviewNotesController' },
            'emr.cn.annotation': { tmpl: getSectionPath() + 'annotations/cn-annotation-section.html', controller: 'discasshtcnAnnotationSectionController' },
            'emr.cn.rheumatology': { tmpl: getSectionPath() + 'rheumatology/cn-rheumatology-section.html', controller: 'discasshtcnRheumatologySectionController' },
            'emr.cn.mlc': { tmpl: getSectionPath() + 'admissionmlc/cn-mlc-section.html', controller: 'discasshtcnMLCSectionController' },
            'emr.cn.medications': { tmpl: getSectionPath() + 'medications/cn-medications-section.html', controller: 'MedicationSectionController' },
            'emr.cn.otnotes': { tmpl: getSectionPath() + 'otnotes/cn-otnotes-section.html', controller: 'OtNotesSectionController' },
            'emr.cn.advicemedications': { tmpl: getSectionPath() + 'advicemedications/cn-advicemedications-section.html', controller: 'AdviceMedicationSectionController' },
            'emr.cn.dischargeadvice': { tmpl: getSectionPath() + 'advicemedications/cn-dischargeadvicemedications-section.html', controller: 'DischargeAdviceMedicationSectionController' }
        };

        function getSectionPath() {
            return "app/views/emr/medicalcertificate/dischargecasesheet/sections/";
        }

        $scope.cncontext.encounter = utl.Session.getPatientEncounter();
        computeEncounterDoctorId();

        function computeEncounterDoctorId() {
            var currentUserId = parseInt(utl.Session.getCurrentUserId());
            if ($scope.cncontext.encounter) {
                var encounterDoctors = $scope.cncontext.encounter.EncounterDoctors;
                if (encounterDoctors) {
                    for (var idx in encounterDoctors) {
                        var encounterDoctor = encounterDoctors[idx];
                        if (encounterDoctor.DoctorId == currentUserId) {
                            $scope.cncontext.encounter.EncounterDoctorId = encounterDoctor.Id;
                            break;
                        }
                    }
                }
            }
        }

        function computeTabs() {
            var profile = $scope.item.ProfileMaster;
            if (profile && profile.ProfileSections) {
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
                    title: 'Summary Notes', sref: 'emr.cn.reviewnotes',
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

        $scope.switchTopTab = function (tab) {
            $scope.cncontext.currentsection = tab;

            // $timeout(function() {
            //   $scope.cncontext.currentsection = tab;
            // }, 100);
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

        $scope.consultationChanged = function () {
            $scope.cncontext.currentsection = null;
            $scope.cncontext.currenttmpl = 'cn-dummy.html';

            $scope.getCurrentConsultation();
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

        //back

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (!res.Data || res.Data.length == 0) {
                if ($scope.prefcontext.profileid > 0) {
                    $scope.saveItem();
                }
            } else {
                $scope.cncontext.consultations = res.Data;
                if ($scope.cncontext.consultations && $scope.cncontext.consultations.length > 0) {
                    if (!$scope.cncontext.consultationid || $scope.cncontext.consultationid == 0) {
                        $scope.cncontext.consultationid = $scope.cncontext.consultations[0].Id;
                    }
                    $scope.getCurrentConsultation();
                }
            }
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.cncontext.encounter.Id },
                    { Key: 3, Value: $scope.cncontext.encounter.PatientId }
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
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //get consultation
        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            computeTabs();
        };

        $scope.getCurrentConsultation = function () {
            if ($scope.cncontext.consultationid && $scope.cncontext.consultationid > 0) {

                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: { Id: $scope.cncontext.consultationid },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.update = function () {
            utl.Modal.open('patientemr.discstconsultationform', {
                params: {
                    id: $scope.item.Id, vid: $scope.item.VisitTypeId,
                    prfid: $scope.item.ProfileId, date: $scope.item.CreatedAt,
                    selecteditem: $scope.item
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.listview = function () {
            utl.Modal.open('patientemr.dischargecasesheets', {
                params: {},
                confirmCallback: $scope.getList
            });
        }

        $scope.addNew = function () {
            utl.Modal.open('patientemr.discstconsultationform', {
                params: {
                    id: $scope.cncontext.consultationid
                },
                confirmCallback: $scope.getList
            });
        }
        //open new consult
        $scope.openConsultModal = function () {
            $scope.cncontext.canshowaddnew = true;
        }

        $scope.closeConsultModal = function () {
            $scope.cncontext.canshowaddnew = false;
        }

        //pref area starts
        $scope.profilePrefChanged = function (item) {
            $scope.prefcontext.profilename = item.Text;
        }

        $scope.openUserPref = function () {
            $scope.cncontext.canshowuserpref = true;
        }

        $scope.closeUserPref = function () {
            $scope.cncontext.canshowuserpref = false;
        }

        function saveUPSuccess() {
            $scope.closeUserPref();
            refreshPref();
        }
        $scope.saveUserPref = function () {
            var inputData = { profileid: $scope.prefcontext.profileid, profilename: $scope.prefcontext.profilename };
            $scope.saveUP($scope.prefKeys.ConsultationDefaultProfile, inputData, saveUPSuccess);
        }

        function refreshPref() {
            $scope.refreshUP($scope.prefKeys.ConsultationDefaultProfile, refreshPrefCallback);
        }
        function refreshPrefCallback(prefValue) {
            computePrefValue(prefValue);
        }

        function getUserPref() {
            $scope.getUP($scope.prefKeys.ConsultationDefaultProfile, getUserPrefCallback);
        }
        function getUserPrefCallback(prefValue) {
            computePrefValue(prefValue);
            $scope.getList();
        }

        function computePrefValue(prefValue) {
            var defaultProfileId = prefValue && prefValue.profileid ? prefValue.profileid : '';
            var defaultProfileName = prefValue && prefValue.profilename ? prefValue.profilename : '';

            $scope.prefcontext.profileid = defaultProfileId;
            $scope.prefcontext.profilename = defaultProfileName;

            $scope.item.ProfileId = defaultProfileId;
            $scope.item.Name = defaultProfileName;
        }

        //pref area ends

        //open Review Note modal
        $scope.reviewNote = function () {
            utl.Modal.open('patientemr.reviewnotes', {
                params: { cid: $scope.cncontext.consultationid, pid: $scope.cncontext.encounter.Patient.Id }
            }
            );
        }

        //save item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));

            if (typeof (data) == "number") {
                $scope.cncontext.consultationid = data;
            }

            $scope.consultationChanged();
            $scope.closeConsultModal();
            $scope.getList();
        };

        $scope.saveItem = function (dataToSave) {

            var inputData = {
                PatientId: $scope.cncontext.encounter.PatientId,
                EncounterId: $scope.cncontext.encounter.Id,
                EncounterDoctorId: $scope.cncontext.encounter.EncounterDoctorId,
                Name: $scope.item.Name,
                ProfileId: $scope.item.ProfileId,
                ProgressNoteStatusId: 1,
                AdmissionDate: $scope.item.AdmissionDate,
                DischargeDate: $scope.item.DischargeDate,
                SurgeryDate: $scope.item.SurgeryDate
            };

            // var consultation

            var actionName = 'emr/consultation/AddConsultation';
            if($scope.cncontext.consultationid && parseInt($scope.cncontext.consultationid) > 0) {
                inputData.Id = $scope.cncontext.consultationid;
                actionName = 'emr/consultation/UpdateConsultation';
            }

            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Profile" }
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
        getUserPref();

        $scope.getCurrentConsultation();

    }

    discasshtconsultationController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModal', '$timeout'];

})();