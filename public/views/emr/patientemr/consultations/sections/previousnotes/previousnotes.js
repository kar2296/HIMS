(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('previousNotesController', previousNotesController);

    function previousNotesController($scope, $sce, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;

        $scope.currentcontext = {
            recordcount: 5
        };
        $scope.IsPatientVitalCreated = false;
        $scope.IsPatientChiefComplaintsCreated = false;
        $scope.IsPatientDiagnosisCreated = false;
        $scope.IsPatientFollowupNotesCreated = false;
        $scope.DisplayDCAFPrint = false;
        $scope.DisplayOCAFPrint = false;
        $scope.DisplayUCAFPrint = false;
        $scope.sectionData = {};
        $scope.sectionDatas = [];
        $scope.item = {};
        $scope.sectionMap = {
            'emr.cn.allergy': {
                tmpl: 'cn-allergy-section.html',
                fn: getAllergyItems
            },
            'emr.cn.condition': {
                tmpl: 'cn-condition-section.html',
                fn: getConditions
            },
            'emr.cn.diagnosis': {
                tmpl: 'cn-diagnosis-section.html',
                fn: getDiagnosis
            },
            'emr.cn.vital': {
                tmpl: 'cn-vital-section.html',
                fn: getvitals
            },
            'emr.cn.procedure': {
                tmpl: 'cn-procedure-section.html',
                fn: getprocedures
            },
            'emr.cn.document': {
                tmpl: 'cn-documents-section.html',
                fn: getdocuments
            },
            'emr.cn.familycondition': {
                tmpl: 'cn-familycondition-section.html',
                fn: getfamilyconditions
            },
            'emr.cn.socialhistory': {
                tmpl: 'cn-socialhistory-section.html',
                fn: getsocialhistory
            },
            'emr.cn.familysocialhistory': {
                tmpl: 'cn-familysocialhistory-section.html',
                fn: getfamilysocialhistory
            },
            'emr.cn.immunization': {
                tmpl: 'cn-immunization-section.html',
                fn: getimmunization
            },
            'emr.cn.prescription': {
                tmpl: 'cn-prescription-section.html',
                fn: getprescription
            },
            'emr.cn.order': {
                tmpl: 'cn-order-section.html',
                fn: getorders
            },
            'emr.cn.chiefcomplaint': {
                tmpl: 'cn-chiefcomplaint-section.html',
                fn: getchiefcomplaints
            },
            'emr.cn.question': {
                tmpl: 'cn-question-section.html',
                fn: getCategorySectionEntrys
            },
            'emr.cn.followup': {
                tmpl: 'cn-followup-section.html',
                fn: getFollowupsections
            },
            'emr.cn.labresults': {
                tmpl: 'cn-labresult-section.html',
                fn: getLabResults
            },
            'emr.cn.radiologyresults': {
                tmpl: 'cn-radiologyresult-section.html',
                fn: getRadiologyResults
            },
            'emr.cn.mlc': {
                tmpl: 'cn-mlc-section.html',
                fn: getAdmissionMLC
            },
            'emr.cn.lensprescribe': {
                tmpl: 'cn-lensprescribe-section.html',
                fn: getLensPrescribe
            },
            'emr.cn.complaints': {
                tmpl: 'cn-complaints-section.html',
                fn: getComplaints
            },
            'emr.cn.clinicalnotes': {
                tmpl: 'cn-clinicalnotes-section.html',
                fn: getClinicalNotes
            },
            'emr.cn.executableprocedures': {
                tmpl: 'cn-executableprocedures-section.html',
                fn: getProcedureOrders
            }
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.ismodal = true;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }

        $scope.backToList = function () {
            $state.go('patientemr.consultations');
        };

        /* Get Section Data Starts */

        /* Allergy */
        function getAllergyListCallback(scope, res, options, hasError) {
            $scope.sectionData.allergy = res.Data;
        }

        function getAllergyItems() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 4,
                        Value: 1
                    }, /* Active Records */
                    {
                        Key: 5,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientallergy/GetPatientAllergys',
                data: inputData,
                type: 'post',
                onComplete: getAllergyListCallback
            };

            utl.Http.doAction(options);
        }

        /* Conditions */
        function getConditionListCallback(scope, res, options, hasError) {
            $scope.sectionData.conditions = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        }

        function getConditions() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.cid
                    },
                    {
                        Key: 7,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                onComplete: getConditionListCallback
            };

            utl.Http.doAction(options);
        }

        /* Vitals */
        function getVitalListCallback(scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.IsPatientVitalCreated = true;
            }

            $scope.sectionData.vitals = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
            var grouped = [];
            var oldSelecteddt = '';
            var _vitalName = '';
            var _vitalValue = '';
            var _uom = '';
            var _fullvalue = '';
            for (var i = 0; i < $scope.sectionData.vitals.length; i++) {
                var Selecteddt = $filter('date')($scope.sectionData.vitals[i].PerformedDate, 'yyyy-MM-dd');
                if (i == 0) oldSelecteddt = Selecteddt;
                if (oldSelecteddt != Selecteddt) {
                    if (_fullvalue.length > 0) {
                        grouped.push({
                            'Id': 0,
                            'Vitalinfo': _fullvalue,
                            'PerformedDate': oldSelecteddt
                        });
                        oldSelecteddt = Selecteddt;
                        _fullvalue = '';
                    }
                    _vitalName = $scope.sectionData.vitals[i].VitalName;
                    _vitalValue = $scope.sectionData.vitals[i].VitalValue;
                    _vitalValue = _vitalValue.replace('~', '/');
                    _fullvalue += _vitalName + ':' + _vitalValue + '; ';
                } else {
                    _vitalName = $scope.sectionData.vitals[i].VitalName;
                    _vitalValue = $scope.sectionData.vitals[i].VitalValue;
                    _vitalValue = _vitalValue.replace('~', '/');
                    _uom = $scope.sectionData.vitals[i].UOM;
                    _fullvalue += '<font class="col-sm-4 vitaldata" color="#1d6090" >' + _vitalName + '</font> : ' + ' ' + '<font color="darkcyan0" class="datas" >' + _vitalValue + '</font>' + ' ' + '<font color="black">' + _uom + ' </font> ' + ' </br>';
                }

                if (i == ($scope.sectionData.vitals.length - 1) && oldSelecteddt == Selecteddt) {
                    if (_fullvalue.length > 0) {
                        oldSelecteddt = Selecteddt;
                        grouped.push({
                            'Id': 0,
                            'Vitalinfo': _fullvalue,
                            'PerformedDate': oldSelecteddt
                        });
                        _fullvalue = '';
                    }
                }
            }

            $scope.sectionData.vitals = [];
            $scope.sectionData.vitals = grouped;
        }

        function getvitals() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 9,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 10,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                onComplete: getVitalListCallback
            };

            utl.Http.doAction(options);
        };

        /* Procedure */
        function getProcedureListCallback(scope, res, options, hasError) {
            $scope.sectionData.procedures = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getprocedures() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 5,
                        Value: 1
                    },
                    {
                        Key: 7,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientprocedure/GetPatientProcedures',
                data: inputData,
                type: 'post',
                onComplete: getProcedureListCallback
            };

            utl.Http.doAction(options);
        };

        /* Document */
        function getDocumentListCallback(scope, res, options, hasError) {
            $scope.sectionData.documents = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getdocuments() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                // action: 'emr/patientdocument/GetPatientDocuments',
                action: 'emr/ClinicalDocument/GetClinicalDocuments',
                data: inputData,
                type: 'post',
                onComplete: getDocumentListCallback
            };

            utl.Http.doAction(options);
        };

        /* Family Condition */
        function getFamilyConditionListCallback(scope, res, options, hasError) {
            $scope.sectionData.familyconditions = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getfamilyconditions() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 5,
                        Value: 1
                    },
                    {
                        Key: 7,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/familycondition/GetFamilyConditions',
                data: inputData,
                type: 'post',
                onComplete: getFamilyConditionListCallback
            };

            utl.Http.doAction(options);
        };

        /* Social History */
        function getSocialHisListCallback(scope, res, options, hasError) {
            $scope.sectionData.socialHistory = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getsocialhistory() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientsocialhistory/GetPatientSocialHistorys',
                data: inputData,
                type: 'post',
                onComplete: getSocialHisListCallback
            };

            utl.Http.doAction(options);
        };

        /* Family Social History */
        function getFamilySocHisListCallback(scope, res, options, hasError) {
            $scope.sectionData.FamilySocHistory = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getfamilysocialhistory() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/familysocialhistory/GetFamilySocialHistorys',
                data: inputData,
                type: 'post',
                onComplete: getFamilySocHisListCallback
            };

            utl.Http.doAction(options);
        };

        /* Immuization */
        function getImmunizationListCallback(scope, res, options, hasError) {
            for (var idx in res.Data) {
                if (res.Data[idx].ImmunizationStatusId == 3)
                    res.Data.splice(idx, 1);
            }
            $scope.sectionData.Immunizations = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getimmunization() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientimmunization/GetPatientImmunizations',
                data: inputData,
                type: 'post',
                onComplete: getImmunizationListCallback
            };

            utl.Http.doAction(options);
        };

        /* Chief Complaints / HPI */
        function getchiefcomplaintsCallback(scope, res, options, hasError) {
            $scope.sectionData.ChiefComplaints = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getchiefcomplaints() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/PatientChiefComplaint/GetPatientChiefComplaints',
                data: inputData,
                type: 'post',
                onComplete: getchiefcomplaintsCallback
            };

            utl.Http.doAction(options);
        };

        /* Prescriptions */
        function getPrescriptionListCallback(scope, res, options, hasError) {
            $scope.sectionData.prescriptions = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getprescription() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 12,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 6,
                        Value: 3
                    },
                    {
                        Key: 13,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: getPrescriptionListCallback
            };

            utl.Http.doAction(options);
        };

        /* Orders */
        function getOrderListCallback(scope, res, options, hasError) {
            $scope.sectionData.orders = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getorders() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    // { Key: 4, Value: 1 },
                    {
                        Key: 18,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 21,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: getOrderListCallback
            };

            utl.Http.doAction(options);
        }

        function getProcedureOrdersCallback(scope, res, options, hasError) {
            $scope.sectionData.ProcedureOrders = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getProcedureOrders() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 18,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 21,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/ProcedureOrder/GetProcedureOrders',
                data: inputData,
                type: 'post',
                onComplete: getProcedureOrdersCallback
            };

            utl.Http.doAction(options);
        }

        /* Follow-Up Sections */
        function getFollowupListCallback(scope, res, options, hasError) {
            $scope.sectionData.followup = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        }

        function getFollowupsections() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'appointment/patienttracker/GetPatientTrackers',
                data: inputData,
                type: 'post',
                onComplete: getFollowupListCallback
            };

            utl.Http.doAction(options);
        }

        /* Admission MLC */
        function getAdmissionMLCListCallback(scope, res, options, hasError) {
            $scope.sectionData.admissionmlc = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        }

        function getAdmissionMLC() {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/EncounterMLC/GetEncounterMLCs',
                data: inputData,
                type: 'post',
                onComplete: getAdmissionMLCListCallback
            };

            utl.Http.doAction(options);
        }

        /* Lens Prescription */
        function getLensPrescribeListCallback(scope, res, options, hasError) {
            $scope.sectionData.lensprescribe = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getLensPrescribe() {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 2,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 8,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/LensPrescription/GetLensPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: getLensPrescribeListCallback
            };

            utl.Http.doAction(options);
        };

        /* Lab Result Section */
        function getLabResultsCallback(scope, res, options, hasError) {
            $scope.sectionData.labresult = res.Data;
            var labresult = $scope.sectionData.labresult;
            for (var jdx in labresult) {
                for (var kdx in labresult[jdx].PatientWorkorders) {
                    var result = labresult[jdx].PatientWorkorders[kdx].PatientWorkorderdetails;
                    var testArr = [];
                    var tabIndex = 0;
                    var profileName = "";
                    var rootProfileName = "";
                    for (var idx in result) {
                        var item = result[idx];
                        var found = testArr.find(function (t) {
                            return t.Testname == item.Testname;
                        });
                        if (!found) {
                            found = {
                                Testid: item.Testid,
                                Testname: item.Testname,
                                details: [],
                                TestDisplayOrder: item.TestDisplayOrder
                            };
                            if (profileName != item.ProfileName) {
                                profileName = item.ProfileName;
                                found.ProfileName = profileName;
                            }
                            if (rootProfileName != item.RootProfileName) {
                                rootProfileName = item.RootProfileName;
                                found.RootProfileName = rootProfileName;
                            }
                            testArr.push(found);
                        }
                        item.tabIndex = tabIndex++;
                        found.details.push(item);
                    }

                    testArr = $filter('sortArrayItems')(testArr, [{
                        name: 'TestDisplayOrder',
                        direction: 'asc',
                        priority: 1,
                        type: 'int'
                    }]);

                    for (var idx in testArr) {
                        var item = testArr[idx];
                        item.details = $filter('sortArrayItems')(item.details, [{
                            name: 'AnalyteDisplayOrder',
                            direction: 'asc',
                            priority: 1,
                            type: 'int'
                        }]);
                    }

                    labresult[jdx].PatientWorkorders[kdx].woDetails = testArr;
                }
            }
        };

        function getLabResults() {
            var labtemp = $scope.item.ProfileMaster.ProfileSections;
            for (var idx in labtemp) {
                if (labtemp[idx].DockPositionId == 2) {
                    var labsectemp = labtemp[idx].SectionMaster;
                    if (labsectemp.SRef == 'emr.cn.labresults') {
                        var inputData = {
                            Params: [{
                                    Key: 21,
                                    Value: $scope.currentcontext.cid
                                },
                                {
                                    Key: 9,
                                    Value: 1
                                }, // testtype = lab
                                {
                                    Key: 22,
                                    Value: [4, 5, 7, 8, 9]
                                } // includeWOStatus Approved and Released
                            ],
                            PageContext: {
                                PageSize: 25,
                                PageNumber: 1
                            }
                        };
                        var options = {
                            action: 'emr/patientorder/GetPatientOrders',
                            data: inputData,
                            type: 'post',
                            onComplete: getLabResultsCallback
                        };
                        utl.Http.doAction(options);
                    }
                }
            }
        };

        /* Radiology Result */
        function getRadiologyResultsCallback(scope, res, options, hasError) {
            $scope.sectionData.radiologyresult = res.Data;
            var radiologyresult = $scope.sectionData.radiologyresult;
            for (var jdx in radiologyresult) {
                for (var kdx in radiologyresult[jdx].PatientWorkorders) {
                    var result = radiologyresult[jdx].PatientWorkorders[kdx].PatientWorkorderdetails;
                    var testArr = [];
                    var tabIndex = 0;
                    var profileName = "";
                    var rootProfileName = "";
                    for (var idx in result) {
                        var item = result[idx];
                        var found = testArr.find(function (t) {
                            return t.Testname == item.Testname;
                        });
                        if (!found) {
                            found = {
                                Testid: item.Testid,
                                Testname: item.Testname,
                                details: [],
                                TestDisplayOrder: item.TestDisplayOrder
                            };
                            if (profileName != item.ProfileName) {
                                profileName = item.ProfileName;
                                found.ProfileName = profileName;
                            }
                            if (rootProfileName != item.RootProfileName) {
                                rootProfileName = item.RootProfileName;
                                found.RootProfileName = rootProfileName;
                            }
                            testArr.push(found);
                        }
                        item.tabIndex = tabIndex++;
                        found.details.push(item);
                    }

                    testArr = $filter('sortArrayItems')(testArr, [{
                        name: 'TestDisplayOrder',
                        direction: 'asc',
                        priority: 1,
                        type: 'int'
                    }]);

                    for (var idx in testArr) {
                        var item = testArr[idx];
                        item.details = $filter('sortArrayItems')(item.details, [{
                            name: 'AnalyteDisplayOrder',
                            direction: 'asc',
                            priority: 1,
                            type: 'int'
                        }]);
                    }

                    radiologyresult[jdx].PatientWorkorders[kdx].woDetails = testArr;
                }
            }
        };

        function getRadiologyResults() {
            var radtemp = $scope.item.ProfileMaster.ProfileSections;
            for (var idx in radtemp) {
                if (radtemp[idx].DockPositionId == 2) {
                    var radSectTemp = radtemp[idx].SectionMaster;
                    if (radSectTemp.SRef == 'emr.cn.radiologyresults') {
                        var inputData = {
                            Params: [{
                                    Key: 21,
                                    Value: $scope.currentcontext.cid
                                },
                                {
                                    Key: 9,
                                    Value: 2
                                }, // testtype = lab
                                {
                                    Key: 22,
                                    Value: [4, 5, 7, 8, 9]
                                } // includeWOStatus Approved and Released
                            ]
                        };
                        var options = {
                            action: 'emr/patientorder/GetPatientOrders',
                            data: inputData,
                            type: 'post',
                            onComplete: getRadiologyResultsCallback
                        };
                        utl.Http.doAction(options);
                    };
                }
            }
        }

        /* Diagnosis */
        function getDiagnosisListCallback(scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.IsPatientDiagnosisCreated = true;
            }
            $scope.sectionData.diagnosis = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        }

        function getDiagnosis() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.cid
                    },
                    {
                        Key: 7,
                        Value: false
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                onComplete: getDiagnosisListCallback
            };

            utl.Http.doAction(options);
        }

        /* Chief Complaints */
        function getComplaintsCallback(scope, res, options, hasError) {
            $scope.sectionData.Complaints = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getComplaints() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/PatientChiefComplaint/GetPatientChiefComplaints',
                data: inputData,
                type: 'post',
                onComplete: getComplaintsCallback
            };

            utl.Http.doAction(options);
        };
        //Clinical Notes
        function getClinicalNotesCallback(scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.IsPatientChiefComplaintsCreated = true;
            }
            $scope.sectionData.ClinicalNote = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getClinicalNotes() {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 2,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.cid
                    }
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/PatientClinicalNotes/GetPatientClinicalNotess',
                data: inputData,
                type: 'post',
                onComplete: getClinicalNotesCallback
            };

            utl.Http.doAction(options);
        };

        function computeAnswers(data, displayOrderMap, sectionId, sectionName) {
            var questionSectionData = {
                sectionName: sectionName,
                cat: []
            }
            var categoryGrouped = _.groupBy(data, 'CategoryKey');
            for (var catKey in categoryGrouped) {
                var cat = {
                    CategoryName: {},
                    concepts: []
                };
                var concepts = categoryGrouped[catKey];
                cat.CategoryName = concepts[0].Category.CategoryName;
                var categoryId = concepts[0].Category.Id;
                cat.DisplayOrder = displayOrderMap[categoryId];
                for (var idx in concepts) {
                    var concept = concepts[idx];
                    var result = '';
                    switch (concept.Concept.ValueTypeId) {
                        case 3:
                            /* Term */
                            if (concept.Concept.IsMultiple == false && concept.ResultValue) {
                                result = concept.ResultValue;
                                var item = {
                                    ConceptName: concept.Concept.ConceptName,
                                    Result: result,
                                    Comments: concept.Comments,
                                    ValueTypeId: concept.Concept.ValueTypeId,
                                    IsMultiple: concept.Concept.IsMultiple
                                };
                                cat.concepts.push(item);
                            } else if (concept.Concept.IsMultiple == true) {
                                processTermBasedMulti(concept, cat);
                            }
                            break;
                        case 4:
                            /* Boolean */
                            if (concept.ResultValue != "" || concept.ResultValue == "0") {
                                result = concept.ResultValue == "1" ? 'Yes' : 'No';
                                var item = {
                                    ConceptName: concept.Concept.ConceptName,
                                    Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                            break;
                        case 5:
                            /* Boolean */
                            if (concept.ResultValue != "" || concept.ResultValue == "0") {
                                result = concept.ResultValue == "1" ? 'Yes' : 'No';
                                var item = {
                                    ConceptName: concept.Concept.ConceptName,
                                    Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                            break;
                        case 6:
                            /* Date */
                            if (concept.ResultValue != "") {
                                result = concept.ResultValue ? utl.Formatter.getDateTimeString(concept.ResultValue) : "";
                                var item = {
                                    ConceptName: concept.Concept.ConceptName,
                                    Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                            break;
                        case 8:
                            /* Notes */
                            if (concept.ResultValueRichText && concept.ResultValueRichText != "") {
                                result = concept.ResultValueRichText ? concept.ResultValueRichText : "";
                                var item = {
                                    ConceptName: concept.Concept.ConceptName,
                                    Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                            break;
                        case 12:
                            /* CKEditor */
                            if (concept.ResultValueRichText && concept.ResultValueRichText != "") {
                                result = concept.ResultValueRichText ? $sce.trustAsHtml(concept.ResultValueRichText) : "";
                                var item = {
                                    ConceptName: concept.Concept.ConceptName,
                                    Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                            break;
                        default:
                            if (concept.ResultValue != "") {
                                result = concept.ResultValue ? concept.ResultValue : "";
                                var item = {
                                    ConceptName: concept.Concept.ConceptName,
                                    Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                    }
                }
                var finalConcepts = [];
                for (var jdx in cat.concepts) {
                    var cpt = cat.concepts[jdx];
                    if (cpt.ValueTypeId == 3 && cpt.IsMultiple == true) {
                        if (cpt.Terms && cpt.Terms.length > 0) {
                            finalConcepts.push(cpt);
                        }
                    } else {
                        finalConcepts.push(cpt);
                    }
                }
                cat.concepts = finalConcepts;
                if (cat && cat.concepts && cat.concepts.length > 0) {
                    questionSectionData.cat.push(cat);
                }
            }
            questionSectionData.cat = _.orderBy(questionSectionData.cat, ['DisplayOrder']);;
            $scope.sectionData[sectionId] = questionSectionData;
        }

        function processTermBasedMulti(concept, categoryToAdd) {
            var item = null;
            for (var idx in categoryToAdd.concepts) {
                var existingConcept = categoryToAdd.concepts[idx];
                if (existingConcept.ConceptName == concept.Concept.ConceptName) {
                    item = existingConcept;
                    break;
                }
            }
            if (!item) {
                item = {
                    ConceptName: concept.Concept.ConceptName,
                    ValueTypeId: concept.Concept.ValueTypeId,
                    IsMultiple: concept.Concept.IsMultiple,
                    Terms: []
                };
                categoryToAdd.concepts.push(item);
            }
            if (concept.ResultValue == 1) {
                item.Terms.push({
                    TermName: concept.TermName,
                    Comments: concept.Comments
                });
            }
        }

        function getCategorySectionEntrysCallback(scope, res, options, hasError) {
            var maps = {};
            for (var idx in res.map) {
                var item = res.map[idx];
                maps[item.CategoryId] = item.DisplayOrder;
            }
            computeAnswers(res.list, maps, options.sectionId, options.sectionName);
        }

        function getCategorySectionEntrys(sectionId, sectionName) {
            var options = {
                action: 'emr/CategorySectionEntry/GetCategorySectionEntrysForReview',
                data: {
                    Data: {
                        sectionid: sectionId,
                        consultationid: $scope.currentcontext.cid
                    }
                },
                sectionName: sectionName,
                sectionId: sectionId,
                type: 'post',
                onComplete: getCategorySectionEntrysCallback
            };

            utl.Http.doAction(options);
        };

        /* Get Section Data Ends */

        function computeSectionList() {
            var profile = $scope.item.ProfileMaster;
            if (profile && profile.ProfileSections) {
                var sections = [];

                for (var idx in profile.ProfileSections) {
                    var profileSection = profile.ProfileSections[idx];
                    if (profileSection.SectionMaster) {
                        if ($scope.sectionMap.hasOwnProperty(profileSection.SectionMaster.SRef)) {
                            var currentSec = $scope.sectionMap[profileSection.SectionMaster.SRef];
                            var tabItem = {
                                sectionid: profileSection.SectionMaster.Id,
                                title: profileSection.SectionMaster.Name,
                                key: profileSection.SectionMaster.SRef,
                                tmpl: currentSec.tmpl
                            };
                            if (profileSection.SectionMaster.SectionTypeId == 2 || profileSection.SectionMaster.SectionTypeId == 3 ||
                                profileSection.SectionMaster.SectionTypeId == 4 || profileSection.SectionMaster.SectionTypeId == 5) {
                                currentSec.fn(profileSection.SectionMaster.Id, profileSection.SectionMaster.Name);
                            } else {
                                currentSec.fn();
                            }

                            tabItem.DisplayOrder = profileSection.DisplayOrder ? parseInt(profileSection.DisplayOrder) : 1000;
                            sections.push(tabItem)
                        }
                    }
                }

                sections = _.sortBy(sections, ['DisplayOrder']);
                $scope.currentcontext.sections = sections;
                //console.log($scope.sectionData);
            }
        }

        $scope.approveConsultation = function () {
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            updateProgressNoteStatus(2);
        };

        $scope.releaseToPatient = function () {
            updateProgressNoteStatus(3);
        };

        function updateStatusCallback() {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (modalConfig && modalConfig.params) {
                $scope.confirmCallback();
            } else {
                loadData()
            }
        }

        function loadData() {
            $scope.getCurrentConsultation();
        }

        function updateProgressNoteStatus(statusId) {
            var actionName = 'emr/consultation/UpdateProgressNoteStatus';
            $scope.item.ProgressNoteStatusId = statusId;
            var inputData = {
                Id: $scope.currentcontext.cid,
                Data: $scope.item
            }
            var options = {
                action: actionName,
                data: inputData,
                type: 'post',
                onComplete: updateStatusCallback
            };
            utl.Http.doAction(options);
        }

        /* Print */
        $scope.printConsultation = function () {
            var inputData = {
                Id: parseInt($scope.currentcontext.cid),
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid
                }
            };
            var options = {
                action: 'emr/consultation/PrintConsultation',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printConsultation2 = function () {
            var inputData = {
                Id: $scope.currentcontext.cid,
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid
                }
            };
            var options = {
                action: 'emr/consultation/PrintConsultationWithoutHeader',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printDCAFForm = function () {

            if ($scope.IsPatientChiefComplaintsCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Chief Complaints Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientVitalCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Vitals Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientDiagnosisCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Diagnosis Not Created For This Patient'));
                return;
            }

            var inputData = {
                Id: $scope.currentcontext.cid,
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid
                }
            };
            var options = {
                action: 'emr/consultation/PrintDCAFForm',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printDCAFFormWithLabel = function () {

            if ($scope.IsPatientChiefComplaintsCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Chief Complaints Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientVitalCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Vitals Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientDiagnosisCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Diagnosis Not Created For This Patient'));
                return;
            }
            var inputData = {
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    FormType: 'WithLabel'
                }
            };
            var options = {
                action: 'emr/consultation/PrintDCAFForm',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.printOCAFForm = function () {
            if ($scope.IsPatientChiefComplaintsCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Chief Complaints Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientVitalCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Vitals Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientDiagnosisCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Diagnosis Not Created For This Patient'));
                return;
            }
            var inputData = {
                Id: $scope.currentcontext.cid,
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid
                }
            };
            var options = {
                action: 'emr/consultation/printOCAFForm',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printOCAFFormWithLabel = function () {

            if ($scope.IsPatientChiefComplaintsCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Chief Complaints Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientVitalCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Vitals Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientDiagnosisCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Diagnosis Not Created For This Patient'));
                return;
            }

            var inputData = {
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    FormType: 'WithLabel'
                }
            };
            var options = {
                action: 'emr/consultation/printOCAFForm',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.printUCAFForm = function () {
            if ($scope.IsPatientChiefComplaintsCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Chief Complaints Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientVitalCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Vitals Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientDiagnosisCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Diagnosis Not Created For This Patient'));
                return;
            }
            var inputData = {
                Id: $scope.currentcontext.cid,
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid
                }
            };
            var options = {
                action: 'emr/consultation/printUCAFForm',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printUCAFFormWithLabel = function () {

            if ($scope.IsPatientChiefComplaintsCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Chief Complaints Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientVitalCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Vitals Not Created For This Patient'));
                return;
            } else if ($scope.IsPatientDiagnosisCreated == false) {
                utl.Alert.showErrorMsg($translate.instant('Diagnosis Not Created For This Patient'));
                return;
            }

            var inputData = {
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    FormType: 'WithLabel'
                }
            };
            var options = {
                action: 'emr/consultation/printUCAFForm',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        /* view Consultation */
        $scope.viewConsultation = function (item) {
            utl.Modal.openFixedDialog('patientemr.reviewnotes', {
                params: {
                    cid: item.Id,
                    pid: $scope.currentcontext.pid
                }
            });
        };

        /* Previous Notes */
        $scope.getAllConsultationCallback = function (scope, res, options, hasError) {
            $scope.sectionData.consultlist = res.Data;
        };

        $scope.getallConsultation = function (pageNo) {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.pid
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

        $scope.getDepartmentDetailsCallback = function (scope, data, options, hasError) {
            $scope.DepartmentData = data;
            $scope.currentcontext.IsDentalDept = data.IsDentalDept;
            $scope.currentcontext.IsOphthalmologyDept = data.IsOphthalmologyDept;
            if ($scope.currentcontext.IsDentalDept == true) {
                $scope.DisplayDCAFPrint = true;
            } else if ($scope.currentcontext.IsOphthalmologyDept == true) {
                $scope.DisplayOCAFPrint = true;
                $scope.DisplayUCAFPrint = true;
            } else {
                $scope.DisplayUCAFPrint = true;
            }
        };

        $scope.getDepartmentDetails = function (DepartmentId) {
            if (DepartmentId && DepartmentId > 0) {
                var options = {
                    action: 'SystemSettings/Department/GetDepartmentById',
                    data: {
                        Id: DepartmentId
                    },
                    type: 'post',
                    onComplete: $scope.getDepartmentDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getEncounterDetailsCallback = function (scope, data, options, hasError) {
            $scope.EncounterData = data;
            $scope.currentcontext.VisitTypeId = data.VisitTypeId;
            $scope.currentcontext.FreeVisit = data.FreeVisit;
            $scope.currentcontext.DepartmentId = data.DepartmentId;
            if ($scope.currentcontext.DepartmentId && $scope.currentcontext.DepartmentId > 0) {
                $scope.getDepartmentDetails($scope.currentcontext.DepartmentId);
            }
        };

        $scope.getEncounterDetails = function (EncounterId) {
            if (EncounterId && EncounterId > 0) {
                var options = {
                    action: 'Visit/Visit/GetEncounterById',
                    data: {
                        Id: EncounterId
                    },
                    type: 'post',
                    onComplete: $scope.getEncounterDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        /* Get Consultation */
        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.eid = data.EncounterId;
            $scope.getallConsultation();
            computeSectionList();
            if ($scope.currentcontext.eid && $scope.currentcontext.eid > 0) {
                $scope.getEncounterDetails($scope.currentcontext.eid);
            }
        };

        $scope.getCurrentConsultation = function (pageNo) {
            if ($scope.currentcontext.cid && $scope.currentcontext.cid > 0) {
                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: {
                        Id: $scope.currentcontext.cid
                    },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getCurrentConsultation();
    }

    previousNotesController.$inject = ['$scope', '$sce', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();