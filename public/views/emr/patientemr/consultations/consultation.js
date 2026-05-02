(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('consultationController', consultationController);

    function consultationController($scope, $stateParams, $state, $translate, utl, $uibModal, $timeout) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getUPCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));
        $scope.Prevconsultlist = {};
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
        };

        if ($stateParams.context) {
            $scope.cncontext.context = $stateParams.context;
            $scope.Context = $stateParams.context;
            $scope.currentcontext.isivf = $stateParams.isivf;
        }

        $scope.cncontext.consultationid = $stateParams.id;

        if ($stateParams.eid && parseInt($stateParams.eid) > 0)
        // $scope.cncontext.encounterid = $stateParams.eid;

            $scope.item = {};

        $scope.sectionMap = {
            'emr.cn.allergy': {
                tmpl: getSectionPath() + 'allergy/cn-allergy-section.html',
                controller: 'cnAllergySectionController'
            },
            'emr.cn.condition': {
                tmpl: getSectionPath() + 'condition/cn-condition-section.html',
                controller: 'cnConditionSectionController'
            },
            'emr.cn.diagnosis': {
                tmpl: getSectionPath() + 'diagnosis/cn-diagnosis-section.html',
                controller: 'cnDiagnosisSectionController'
            },
            'emr.cn.examinationsystem': {
                tmpl: getSectionPath() + 'examinationsystem/cn-examinationsystem-section.html',
                controller: 'cnExaminationSystemSectionController'
            },
            'emr.cn.question': {
                tmpl: getSectionPath() + 'question/cn-question-section.html',
                controller: 'cnQuestionSectionController'
            },
            'emr.cn.vital': {
                tmpl: getSectionPath() + 'vital/cn-vital-section.html',
                controller: 'cnVitalSectionController'
            },
            'emr.cn.procedure': {
                tmpl: getSectionPath() + 'procedure/cn-procedure-section.html',
                controller: 'cnProcedureSectionController'
            },
            'emr.cn.document': {
                tmpl: getSectionPath() + 'document/cn-document-section.html',
                controller: 'cnDocumentSectionController'
            },
            'emr.cn.familycondition': {
                tmpl: getSectionPath() + 'familycondition/cn-familycondition-section.html',
                controller: 'cnFamilyConditionSectionController'
            },
            'emr.cn.socialhistory': {
                tmpl: getSectionPath() + 'socialhistory/cn-socialhistory-section.html',
                controller: 'cnSocialHistorySectionController'
            },
            'emr.cn.familysocialhistory': {
                tmpl: getSectionPath() + 'familysocialhistory/cn-familysocialhistory-section.html',
                controller: 'cnFamilySocialHistorySectionController'
            },
            'emr.cn.immunization': {
                tmpl: getSectionPath() + 'immunization/cn-immunization-section.html',
                controller: 'cnImmunizationSectionController'
            },
            'emr.cn.prescription': {
                tmpl: getSectionPath() + 'prescription/cn-prescription-section.html',
                controller: 'cnPrescriptionSectionController',
                params: { id: null }
            },
            'emr.cn.order': {
                tmpl: getSectionPath() + 'order/cn-order-section.html',
                controller: 'cnOrderSectionController'
            },
            'emr.cn.labresults': {
                tmpl: getSectionPath() + 'labresults/cn-labresults-section.html',
                controller: 'cnLabResultsSectionController'
            },
            'emr.cn.radiologyresults': {
                tmpl: getSectionPath() + 'radiologyresults/cn-radiologyresults-section.html',
                controller: 'cnRadiologyResultsSectionController'
            },
            'emr.cn.dietplan': {
                tmpl: getSectionPath() + 'dietplan/cn-dietplan-section.html',
                controller: 'cnDietPlanSectionController'
            },
            'emr.cn.chiefcomplaint': {
                tmpl: getSectionPath() + 'chiefcomplaint/cn-chiefcomplaint-section.html',
                controller: 'cnChiefComplaintSectionController'
            },
            'emr.cn.followup': {
                tmpl: getSectionPath() + 'followup/cn-followup-section.html',
                controller: 'cnFollowupSectionController'
            },
            'emr.cn.reviewnotes': {
                tmpl: getSectionPath() + 'reviewnotes/reviewnotes.html',
                controller: 'reviewNotesController'
            },
            'emr.cn.previousnotes': {
                tmpl: getSectionPath() + 'previousnotes/previousnotes.html',
                controller: 'previousNotesController'
            },
            'emr.cn.annotation': {
                tmpl: getSectionPath() + 'annotations/cn-annotation-section.html',
                controller: 'cnAnnotationSectionController'
            },
            'emr.cn.rheumatology': {
                tmpl: getSectionPath() + 'rheumatology/cn-rheumatology-section.html',
                controller: 'cnRheumatologySectionController'
            },
            'emr.cn.mlc': {
                tmpl: getSectionPath() + 'admissionmlc/cn-mlc-section.html',
                controller: 'cnMLCSectionController'
            },
            'emr.cn.lensprescribe': {
                tmpl: getSectionPath() + 'lensprescribe/cn-lensprescribe-section.html',
                controller: 'cnLensPrescribeSectionController'
            },
            'emr.cn.complaints': {
                tmpl: getSectionPath() + 'complaints/cn-complaints-section.html',
                controller: 'cnComplaintsSectionController'
            },
            'emr.cn.clinicalnotes': {
                tmpl: getSectionPath() + 'clinicalnotes/cn-clinicalnotes-section.html',
                controller: 'cnClinicalNoteSectionController'
            },
            'emr.cn.executableprocedures': {
                tmpl: getSectionPath() + 'executableprocedures/cn-procedure-section.html',
                controller: 'cnPatientProcedureSectionController'
            },
            'emr.cn.followupclinicalnotes': {
                tmpl: getSectionPath() + 'followup/cn-followupclinicalnotes-section.html',
                controller: 'cnFollowUpClinicalNotesSectionController'
            },
            'emr.cn.advicemedications': {
                tmpl: getSectionPath() + 'advicemedications/cn-advicemedications-section.html',
                controller: 'cnAdviceMedicationSectionController'
            },
            'emr.cn.treatmentplan': {
                tmpl: getSectionPath() + 'treatmentplan/cn-treatmentplan-section.html',
                controller: 'cnTreatmentplanSectionController'
            },
            'emr.cn.procedureorders': {
                tmpl: getSectionPath() + 'procedureorders/cn-procedureorders-section.html',
                controller: 'cnProcedureOrdersSectionController'
            }
        };

        function getSectionPath() {
            return "app/views/emr/patientemr/consultations/sections/";
        }

        $scope.cncontext.encounter = utl.Session.getPatientEncounter();
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.uid = parseInt(utl.Session.getCurrentUserId());
        if ($stateParams.pid) {
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
        }
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
                            title: profileSection.SectionMaster.Name,
                            sref: profileSection.SectionMaster.SRef,
                            key: profileSection.SectionMaster.SRef,
                            tmpl: currentTmpl,
                            controller: mapData.controller
                        };
                        var DisplayOrder = profileSection.DisplayOrder ? parseInt(profileSection.DisplayOrder) : 1000;
                        tabItem.DisplayOrder = DisplayOrder + 1;
                        if (profileSection.DockPositionId == 2) {
                            /* Top */
                            tabstop.push(tabItem)
                        } else if (profileSection.DockPositionId == 3) {
                            /* Right */
                            tabsright.push(tabItem)
                        }
                    }
                }

                tabstop = _.sortBy(tabstop, ['DisplayOrder']);
                $scope.cncontext.tabstop = tabstop;

                /* Add Review Note Tab to Top */
                var tabItem = {
                    sectionid: '',
                    sectiontypeid: '',
                    title: 'Summary',
                    sref: 'emr.cn.reviewnotes',
                    key: profileSection.SectionMaster.SRef,
                    tmpl: $scope.sectionMap['emr.cn.reviewnotes'].tmpl,
                    controller: $scope.sectionMap['emr.cn.reviewnotes'].controller
                };
                tabstop.push(tabItem);

                /* Add Review Note Tab to Top If the Visit is Follow-Up */
                // if ($scope.item.Encounter && $scope.item.Encounter.VisitTypeId == 2) {
                //     var previostabItem = {
                //         sectionid: '',
                //         sectiontypeid: '',
                //         title: 'Previous Summary Notes',
                //         sref: 'emr.cn.previousnotes',
                //         key: profileSection.SectionMaster.SRef,
                //         tmpl: $scope.sectionMap['emr.cn.previousnotes'].tmpl,
                //         controller: $scope.sectionMap['emr.cn.previousnotes'].controller
                //     };
                //     tabstop.push(previostabItem);
                // }

                tabstop = _.sortBy(tabstop, ['DisplayOrder']);
                $scope.cncontext.tabstop = tabstop;
                tabsright = _.sortBy(tabsright, ['DisplayOrder']);
                $scope.cncontext.tabsright = tabsright;

                /* Load first tab item template by default */
                /*
                if ($scope.item.Encounter && $scope.item.Encounter.VisitTypeId == 2) {
                    var tabindex = 0;
                    for (var tsidx in tabstop) {
                        var profileTab = tabstop[tsidx];
                        if (profileTab.controller == 'previousNotesController') {
                            tabindex = parseInt(tsidx);
                        }
                    }
                }

                if (tabindex > 0) {
                    $scope.switchTopTab($scope.cncontext.tabstop[tabindex]);
                } else {
                    $scope.switchTopTab($scope.cncontext.tabstop[0]);
                }
                */

                $scope.switchTopTab($scope.cncontext.tabstop[0]);
            }
        }

        $scope.switchTopTab = function(tab) {
            if (tab.controller == 'previousNotesController') {
                if ($scope.Prevconsultlist)
                    $scope.cncontext.consultationid = $scope.Prevconsultlist.Id;
            } else {
                $scope.cncontext.consultationid = $scope.cncontext.consultationid;
            }
            $scope.cncontext.currentsection = tab;
        };

        $scope.switchSideTab = function(tab) {
            $scope.cncontext.currentsidesection = tab;
            $timeout(function() {
                openSideTab($scope.cncontext.currentsidesection);
            }, 100);
        };

        var openSideTab = function(options) {
            var dialogSize = 'lg';
            var relativeto = '#tab-sidebar';

            var modalCfg = {
                params: {
                    cid: $scope.cncontext.consultationid,
                    sid: options.sectionid,
                    stid: options.sectiontypeid
                },
                confirmCallback: $scope.getList
            }

            var modalInstance = $uibModal.open({
                templateUrl: options.tmpl,
                size: dialogSize,
                controller: options.controller,
                controllerAs: 'vm',
                windowClass: 'modal modal-slide-in-right',
                resolve: {
                    modalConfig: function() {
                        return modalCfg;
                    }
                }
            });

            modalInstance.rendered.then(function(modal) {
                if (relativeto) {
                    var element = document.querySelector(relativeto);
                    if (element) {
                        var rect = element.getBoundingClientRect(),

                            modal = document.querySelector('.modal-dialog');
                        modal.style.margin = 0;
                        modal.style.top = rect.top + 30 + 'px';
                        modal.style.left = rect.left + rect.width - 35 - modal.offsetWidth + 'px';
                    }
                }
            });

            return modalInstance;
        }

        $scope.consultationChanged = function() {
            $scope.cncontext.currentsection = null;
            $scope.cncontext.currenttmpl = 'cn-dummy.html';
            $scope.getCurrentConsultation();
        };

        $scope.approveConsultation = function() {
            updateProgressNoteStatus(2);
        };

        $scope.releaseToPatient = function() {
            updateProgressNoteStatus(3);
        };

        function updateStatusCallback() {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        }

        function updateProgressNoteStatus(statusId) {
            var actionName = 'emr/consultation/UpdateProgressNoteStatus';
            var options = {
                action: actionName,
                data: {
                    Id: $scope.cncontext.consultationid,
                    Data: {
                        ProgressNoteStatusId: statusId
                    }
                },
                type: 'post',
                onComplete: updateStatusCallback
            };
            utl.Http.doAction(options);
        }

        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        };

        $scope.patient_dashboard = function() {
            $state.go('patientemr.emrdashboard');
        };

        $scope.getListCallback = function(scope, res, options, hasError) {
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

        $scope.getList = function() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.cncontext.encounter.Id
                    },
                    {
                        Key: 3,
                        Value: $scope.cncontext.encounter.PatientId
                    }
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

        $scope.getCurrentConsultationCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            computeTabs();
        };

        $scope.getCurrentConsultation = function() {
            if ($scope.cncontext.consultationid && $scope.cncontext.consultationid > 0) {
                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: {
                        Id: $scope.cncontext.consultationid
                    },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.update = function() {
            utl.Modal.open('patientemr.consultationform', {
                params: {
                    id: $scope.item.Id,
                    vid: $scope.item.VisitTypeId,
                    prfid: $scope.item.ProfileId,
                    date: $scope.item.CreatedAt
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.listview = function() {
            utl.Modal.open('patientemr.consultations', {
                params: {},
                confirmCallback: $scope.getList
            });
        };

        $scope.openConsultModal = function() {
            $scope.cncontext.canshowaddnew = true;
        };

        $scope.closeConsultModal = function() {
            $scope.cncontext.canshowaddnew = false;
        };

        $scope.profilePrefChanged = function(item) {
            $scope.prefcontext.profilename = item.Text;
        };

        $scope.openUserPref = function() {
            $scope.cncontext.canshowuserpref = true;
        };

        $scope.closeUserPref = function() {
            $scope.cncontext.canshowuserpref = false;
        };

        function saveUPSuccess() {
            $scope.closeUserPref();
            refreshPref();
        }

        $scope.saveUserPref = function() {
            var inputData = {
                profileid: $scope.prefcontext.profileid,
                profilename: $scope.prefcontext.profilename
            };
            $scope.saveUP($scope.prefKeys.ConsultationDefaultProfile, inputData, saveUPSuccess);
        };

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

        $scope.reviewNote = function() {
            utl.Modal.open('patientemr.reviewnotes', {
                params: {
                    cid: $scope.cncontext.consultationid,
                    pid: $scope.cncontext.encounter.Patient.Id
                }
            });
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));

            if (typeof(data) == "number") {
                $scope.cncontext.consultationid = data;
            }

            $scope.consultationChanged();
            $scope.closeConsultModal();
            $scope.getList();
        };

        $scope.saveItem = function(dataToSave) {
            var inputData = {
                PatientId: $scope.cncontext.encounter.PatientId,
                EncounterId: $scope.cncontext.encounter.Id,
                EncounterDoctorId: $scope.cncontext.encounter.EncounterDoctorId,
                ClaimProcessId: $scope.cncontext.encounter.ClaimProcessId,
                ClaimNumber: $scope.cncontext.encounter.ClaimNumber,
                Name: $scope.item.Name,
                ProfileId: $scope.item.ProfileId,
                ProgressNoteStatusId: 1
            };

            var actionName = 'emr/consultation/AddConsultation';

            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getAllConsultationCallback = function(scope, res, options, hasError) {
            $scope.Prevconsultlist = res.Data[(res.Data.length) - 1];
        };
        $scope.getallConsultation = function(pageNo) {
            var inputData = {
                Params: [
                    // { Key: 2, Value: $scope.currentcontext.eid },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 11,
                        Value: 1
                    },
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
                onComplete: $scope.getAllConsultationCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        };

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "Profile"
            }];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
        $scope.getallConsultation();
        getUserPref();
        if ($scope.cncontext.consultationid) {
            $scope.getCurrentConsultation();
        }


        $scope.getIvfConsCallback = function(scope, res, options, hasError) {
            if (res.Data.length == 0) {
                utl.Modal.openFixedDialog('patientemr.consultationtab.consultationform', {
                    params: {
                        id: 0,
                        context: $scope.cncontext.context,
                        isivf: true
                    },
                    // confirmCallback: $scope.getIvfCons
                });
                // utl.Alert.showErrorMsg($translate.instant("IVF Template in not added"));
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

        $scope.getIvfCons = function() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.cncontext.encounter.Id
                    },
                    {
                        Key: 3,
                        Value: $scope.cncontext.encounter.PatientId
                    },
                    {
                        Key: 12,
                        Value: true
                    }
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
                onComplete: $scope.getIvfConsCallback
            };

            utl.Http.doAction(options);
        };


        if ($scope.currentcontext.isivf) {
            $scope.getIvfCons();
        }
    }

    consultationController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModal', '$timeout'];

})();