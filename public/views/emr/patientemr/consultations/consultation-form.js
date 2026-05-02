(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('consultationFormController', consultationFormController);

    function consultationFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {
            encounter: utl.Session.getPatientEncounter()
        }
        $scope.lookup = {};
        if (modalConfig) {
            if (modalConfig.params.id)
                $scope.currentcontext.id = modalConfig.params.id;
            if (modalConfig.params.vid)
                $scope.currentcontext.encounter.VisitTypeId = modalConfig.params.vid;
            if (modalConfig.params.prfid)
                $scope.currentcontext.prfid = modalConfig.params.prfid;
            if (modalConfig.params.date)
                $scope.currentcontext.date = modalConfig.params.date;
            if (modalConfig.params.context)
                $scope.currentcontext.context = modalConfig.params.context;
            if (modalConfig.params.isivf)
                $scope.currentcontext.isivf = modalConfig.params.isivf;
            $scope.confirmCallback = $uibModalInstance.close;
        }
        console.log(utl.Session.getCurrentUserId());
        $scope.lookup.UserSelectedProfile = [];
        var encounter = $scope.currentcontext.encounter;
        console.log(encounter);
        if (encounter.EncounterTypeId == 2) {
            // $scope.currentcontext.ReasonForVisit = $scope.currentcontext.encounter.AdmittingReason.Description;
        }
        $scope.currentcontext.ReferredBy = $scope.currentcontext.encounter.ReferralName;


        $scope.item = {
            ConsultationDate: utl.Formatter.getCurrentDate(),
            PatientId: parseInt(utl.Session.getEMRPatientId()),
            EncounterId: encounter.Id,
            EncounterDoctorId: encounter.DoctorId,
            ProgressNoteStatusId: 1,
            VisitTypeId: $scope.currentcontext.encounter.VisitTypeId
        };

        if (modalConfig.params.doctor && modalConfig.params.doctor > 0) {
            $scope.item.EncounterDoctorId = modalConfig.params.doctor;
        } else {
            if (encounter.EncounterDoctors && encounter.EncounterDoctors.length > 0) {

                var doctor = $filter('filter')(encounter.EncounterDoctors, {
                    DoctorId: utl.Session.getCurrentUserId()
                });
                if (doctor.length > 0) {
                    $scope.item.EncounterDoctorId = doctor[0].DoctorId;
                } else {
                    $scope.item.EncounterDoctorId = encounter.DoctorId;
                }
            }
        }

        $scope.getencountersCallback = function(scope, data, options, hasError) {

            $scope.Encounters = data.Data;
            if (data.Data.length == 1) {
                $scope.item.VisitTypeId = 1
            } else if (data.Data.length > 1) {
                $scope.item.VisitTypeId = 2
            }
        };

        $scope.getEncounters = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.item.PatientId
                    },
                    // {
                    //     Key: 15,
                    //     Value: [1, 2]
                    // },
                    {
                        Key: 35,
                        Value: 1
                    },
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
        };
        if ($scope.currentcontext.prfid)
            $scope.item.ProfileId = $scope.currentcontext.prfid;
        if ($scope.currentcontext.date)
            $scope.item.ConsultationDate = $scope.currentcontext.date;
        $scope.backToList = function() {
            $scope.confirmCallback();
            // $state.reload();
        }

        $scope.saveItemCallback = function(scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (res === false) {
                $scope.currentcontext.id = options.data.Data.Id;
            } else {
                $scope.currentcontext.id = res;
            }
            $scope.openConsultation($scope.currentcontext.id);
            $scope.confirmCallback();
        };

        $scope.profileChanged = function() {
            var profileObj = utl.Lookup.getObject($scope.lookup.Profile, $scope.item.ProfileId);
            $scope.item.Name = profileObj.Text;
            $scope.item.IsIVF = profileObj.IsIVF;
        }

        $scope.openConsultation = function(consultationId) {
            $state.go('patientemr.consultation', {
                id: consultationId,
                eid: $scope.item.EncounterId,
                context: 'emr'
            });
        }

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.IsIVF = $scope.currentcontext.isivf || 0;
            var actionName = 'emr/consultation/AddConsultation';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/consultation/UpdateConsultation';
            }

            if (parseInt(modalConfig.params.prev_encounterid) > 0) {
                $scope.item.EncounterId = parseInt(modalConfig.params.prev_encounterid);
            }
            console.log($scope.item);
            // return;
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getUsermappedProfilesCallback = function(scope, res, options, hasError) {
            if (res.Data.length > 0) {
                for (var pdx in res.Data) {
                    var userprofiles = res.Data[pdx];
                    if (userprofiles.ProfileMaster)
                        $scope.lookup.UserSelectedProfile.push(userprofiles.ProfileMaster);
                }
            }
            // else {
            //     $scope.lookup.UserSelectedProfile = $scope.lookup.SelectedProfile;
            // }


            if ($scope.lookup.UserSelectedProfile.length == 0) {
                $scope.lookup.UserSelectedProfile = $scope.lookup.SelectedProfile;
            }


            for (var idx in $scope.lookup.UserSelectedProfile) {
                $scope.item.ProfileId = $scope.lookup.UserSelectedProfile[idx].Id;
            }
        };
        $scope.getUsermappedProfiles = function(profileType) {
            var inputData = {
                Params: [{
                        Key: 5,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 9,
                        Value: profileType
                    },
                ],
            };
            var options = {
                action: 'clinicalmaster/ProfileUser/GetProfileUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getUsermappedProfilesCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getOpProfileCallback = function(scope, res, options, hasError) {
            $scope.lookup.SelectedProfile = res.Data;
            $scope.getUsermappedProfiles(1);
        };

        $scope.getOpProfile = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 3,
                        Value: 2
                    },
                    // {
                    //     Key: 6,
                    //     Value: [-1, utl.Session.getCurrentFacilityId()]
                    // }
                ],
            };
            if ($scope.currentcontext.isivf) {
                inputData.Params.push({
                    Key: 5,
                    Value: true
                })
            }
            var options = {
                action: 'clinicalmaster/ProfileMaster/GetProfileMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOpProfileCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getIpProfileCallback = function(scope, res, options, hasError) {
            $scope.lookup.SelectedProfile = res.Data;
            $scope.getUsermappedProfiles(3);
        };

        $scope.getIpProfile = function() {
            var inputData = {
                Params: [{
                        Key: 4, //profilemastertypeid is 3
                        Value: 3
                    },
                    {
                        Key: 3,
                        Value: 2
                    },
                    // {
                    //     Key: 6,
                    //     Value: [-1, utl.Session.getCurrentFacilityId()]
                    // }
                ],
            };
            if ($scope.currentcontext.isivf) {
                inputData.Params.push({
                    Key: 5,
                    Value: true
                })
            }
            var options = {
                action: 'clinicalmaster/ProfileMaster/GetProfileMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getIpProfileCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getEmergencyProfileCallback = function(scope, res, options, hasError) {
            $scope.lookup.SelectedProfile = res.Data;
            $scope.getUsermappedProfiles(6);
        };

        $scope.getEmergencyProfile = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 6 //Emergency Profile
                    },
                    {
                        Key: 3,
                        Value: 2
                    },
                    // {
                    //     Key: 6,
                    //     Value: [-1, utl.Session.getCurrentFacilityId()]
                    // }
                ],
            };
            if ($scope.currentcontext.isivf) {
                inputData.Params.push({
                    Key: 5,
                    Value: true
                })
            }
            var options = {
                action: 'clinicalmaster/ProfileMaster/GetProfileMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEmergencyProfileCallback
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
                $scope.lookup.SelectedProfile = [];
                if (key == 'Profile') {
                    if ($scope.currentcontext.context == 'emr') {
                        $scope.getOpProfile();
                    }
                    if ($scope.currentcontext.context == 'ipemr') {
                        $scope.getIpProfile();
                    }
                    if ($scope.currentcontext.context == 'aeemr') {
                        $scope.getEmergencyProfile();
                    }
                }
            });
            // $scope.getEncounters();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "VisitType"
                },
                // {
                //     "Key": "NoteTemplate",
                //     Request: {
                //         Params: [{
                //             Key: 1,
                //             Value: 11
                //         },
                //         {
                //             Key: 4,
                //             Value: 2
                //         }
                //         ]
                //     }
                // },
                {
                    "Key": "Profile",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }, ]
                    }
                }
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

    consultationFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();