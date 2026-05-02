(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('discasshtconsultationCompareController', discasshtconsultationCompareController);

    function discasshtconsultationCompareController($scope, $sce, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.items = {};
        $scope.consultationDataList = {};
        $scope.currentcontext.sectionList = [];
        $scope.currentcontext.cids = JSON.parse($stateParams.cids);

        $scope.sectionMap = {
            'emr.cn.allergy': { tmpl: 'cn-allergy-section.html', fn: getAllergyItems },
            'emr.cn.condition': { tmpl: 'cn-condition-section.html', fn: getConditions },
            'emr.cn.diagnosis': { tmpl: 'cn-diagnosis-section.html', fn: getDiagnosis },
            'emr.cn.vital': { tmpl: 'cn-vital-section.html', fn: getvitals },
            'emr.cn.procedure': { tmpl: 'cn-procedure-section.html', fn: getprocedures },
            'emr.cn.document': { tmpl: 'cn-documents-section.html', fn: getdocuments },
            'emr.cn.familycondition': { tmpl: 'cn-familycondition-section.html', fn: getfamilyconditions },
            'emr.cn.socialhistory': { tmpl: 'cn-socialhistory-section.html', fn: getsocialhistory },
            'emr.cn.familysocialhistory': { tmpl: 'cn-familysocialhistory-section.html', fn: getfamilysocialhistory },
            'emr.cn.immunization': { tmpl: 'cn-immunization-section.html', fn: getimmunization },
            //'emr.cn.prescription': { tmpl: 'cn-prescription-section.html', fn: getprescription },
            'emr.cn.order': { tmpl: 'cn-order-section.html', fn: getorders },
            'emr.cn.chiefcomplaint': { tmpl: 'cn-chiefcomplaint-section.html', fn: getchiefcomplaints },
            'emr.cn.followup': { tmpl: 'cn-followup-section.html', fn: getFollowupsections },
            'emr.cn.labresults': { tmpl: 'cn-labresult-section.html', fn: getLabResults },
            'emr.cn.radiologyresults': { tmpl: 'cn-radiologyresult-section.html', fn: getRadiologyResults },
            'emr.cn.mlc': { tmpl: 'cn-mlc-section.html', fn: getAdmissionMLC },
            'emr.cn.question': { tmpl: 'cn-question-section.html', fn: getCategorySectionEntrys }
        };

        //Allergy
        function getAllergyListCallback(scope, res, options, hasError) {
            $scope.consultationDataList[options.cid].Allergy = { data: res.Data, tmpl: options.tmpl };
            console.log($scope.consultationDataList);
        }

        function getAllergyItems(cid, eid, tmpl) {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: 1 }, //Active records
                    { Key: 5, Value: eid },
                    { Key: 6, Value: cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientallergy/GetPatientAllergys',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getAllergyListCallback
            };

            utl.Http.doAction(options);
        }

        //Conditions
        function getConditionListCallback(scope, res, options, hasError) {
            var conditions = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].Condition = { data: conditions, tmpl: options.tmpl };
        }

        function getConditions(cid, eid, tmpl) {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 4, Value: 1 },
                { Key: 5, Value: eid },
                { Key: 6, Value: cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getConditionListCallback
            };

            utl.Http.doAction(options);
        }

        //Diagnosis
        function getDiagnosisListCallback(scope, res, options, hasError) {
            var diagnosis = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].Diagnosis = { data: diagnosis, tmpl: options.tmpl };
        }

        function getDiagnosis(cid, eid, tmpl) {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: 1 },
                    { Key: 5, Value: eid },
                    { Key: 6, Value: cid },
                    { Key: 7, Value: false }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getDiagnosisListCallback
            };

            utl.Http.doAction(options);
        }
        //Vital
        function getVitalListCallback(scope, res, options, hasError) {

            var vitals = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);

            var grouped = [];
            var oldSelecteddt = '';
            var _vitalName = '';
            var _vitalValue = '';
            var _uom = '';
            var _fullvalue = '';
            for (var i = 0; i < vitals.length; i++) {
                var Selecteddt = $filter('date')(vitals[i].PerformedDate, 'yyyy-MM-dd');
                if (i == 0) oldSelecteddt = Selecteddt;
                if (oldSelecteddt != Selecteddt) {
                    if (_fullvalue.length > 0) {
                        grouped.push({ 'Id': 0, 'Vitalinfo': _fullvalue, 'PerformedDate': oldSelecteddt });
                        oldSelecteddt = Selecteddt;
                        _fullvalue = '';
                    }
                    _vitalName = vitals[i].VitalName;
                    _vitalValue = vitals[i].VitalValue;
                    _vitalValue = _vitalValue.replace('~', '/');
                    _fullvalue += _vitalName + ':' + _vitalValue + '; ';
                }
                else {
                    _vitalName = vitals[i].VitalName;
                    _vitalValue = vitals[i].VitalValue;
                    _vitalValue = _vitalValue.replace('~', '/');
                    _uom = vitals[i].UOM;
                    _fullvalue += '<font color="#007cff">' + _vitalName + '</font> : ' + ' ' + '<font color="darkcyan0">' + _vitalValue + '</font>' + ' ' + '<font color="black">' + _uom + ' </font> ' + ' </br>';
                }

                if (i == (vitals.length - 1) && oldSelecteddt == Selecteddt) {
                    if (_fullvalue.length > 0) {
                        oldSelecteddt = Selecteddt;
                        grouped.push({ 'Id': 0, 'Vitalinfo': _fullvalue, 'PerformedDate': oldSelecteddt });
                        _fullvalue = '';
                    }
                }
            }

            $scope.consultationDataList[options.cid].Vital = { data: grouped, tmpl: options.tmpl };
        }
        function getvitals(cid, eid, tmpl) {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 9, Value: eid },
                { Key: 4, Value: 1 },
                { Key: 10, Value: cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getVitalListCallback
            };

            utl.Http.doAction(options);
        };

        //Procedure
        function getProcedureListCallback(scope, res, options, hasError) {
            var procedures = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].Procedure = { data: procedures, tmpl: options.tmpl };
        };

        function getprocedures(cid, eid, tmpl) {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 6, Value: eid },
                { Key: 5, Value: 1 },
                { Key: 7, Value: cid }],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientprocedure/GetPatientProcedures',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getProcedureListCallback
            };

            utl.Http.doAction(options);
        };

        //Document
        function getDocumentListCallback(scope, res, options, hasError) {
            var documents = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].Document = { data: documents, tmpl: options.tmpl };
        };
        function getdocuments(cid, eid, tmpl) {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: eid },
                    { Key: 4, Value: cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/ClinicalDocument/GetClinicalDocuments',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getDocumentListCallback
            };

            utl.Http.doAction(options);
        };

        //Familycondition
        function getFamilyConditionListCallback(scope, res, options, hasError) {
            var familyconditions = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].FamilyCondition = { data: familyconditions, tmpl: options.tmpl };
        };

        function getfamilyconditions(cid, eid, tmpl) {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 6, Value: eid },
                { Key: 5, Value: 1 },
                { Key: 7, Value: cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/familycondition/GetFamilyConditions',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getFamilyConditionListCallback
            };

            utl.Http.doAction(options);
        };

        //Social History
        function getSocialHisListCallback(scope, res, options, hasError) {
            var socialHistory = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].SocialHistory = { data: socialHistory, tmpl: options.tmpl };
        };

        function getsocialhistory(cid, eid, tmpl) {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 5, Value: eid },
                { Key: 4, Value: 1 },
                { Key: 6, Value: cid }],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientsocialhistory/GetPatientSocialHistorys',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getSocialHisListCallback
            };

            utl.Http.doAction(options);
        };

        //Family social history
        function getFamilySocHisListCallback(scope, res, options, hasError) {
            var familySocHistory = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].FamilySocialHistory = { data: familySocHistory, tmpl: options.tmpl };
        };

        function getfamilysocialhistory(cid, eid, tmpl) {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 5, Value: eid },
                { Key: 4, Value: 1 },
                { Key: 6, Value: cid }],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/familysocialhistory/GetFamilySocialHistorys',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getFamilySocHisListCallback
            };

            utl.Http.doAction(options);
        };


        //Immuization
        function getImmunizationListCallback(scope, res, options, hasError) {
            for (var idx in res.Data) {
                if (res.Data[idx].ImmunizationStatusId == 3)
                    res.Data.splice(idx, 1);
            }
            var immunizations = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].Immunization = { data: immunizations, tmpl: options.tmpl };
        };

        function getimmunization(cid, eid, tmpl) {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 5, Value: eid },
                    { Key: 6, Value: cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientimmunization/GetPatientImmunizations',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getImmunizationListCallback
            };

            utl.Http.doAction(options);
        };

        //Prescriptions
        function getPrescriptionListCallback(scope, res, options, hasError) {
            var prescriptions = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].Prescription = { data: prescriptions, tmpl: options.tmpl };
        };

        function getprescription(cid, eid, tmpl) {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 12, Value: eid },
                    { Key: 6, Value: 3 },
                    { Key: 13, Value: cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getPrescriptionListCallback
            };

            utl.Http.doAction(options);
        };

        //Orders
        function getOrderListCallback(scope, res, options, hasError) {
            var orders = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].Order = { data: orders, tmpl: options.tmpl };
        };

        function getorders(cid, eid, tmpl) {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: 1 },
                    { Key: 18, Value: eid },
                    { Key: 21, Value: cid }
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
                cid: cid,
                tmpl: tmpl,
                onComplete: getOrderListCallback
            };

            utl.Http.doAction(options);
        }

        //Chief Complaints
        function getchiefcomplaintsCallback(scope, res, options, hasError) {
            var chiefComplaints = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].ChiefComplaint = { data: chiefComplaints, tmpl: options.tmpl };
        };

        function getchiefcomplaints(cid, eid, tmpl) {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid }, { Key: 3, Value: eid },
                { Key: 4, Value: cid }],
                PageContext: { PageSize: 500, PageNumber: 1 }
            };

            var options = {
                action: 'emr/PatientChiefComplaint/GetPatientChiefComplaints',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getchiefcomplaintsCallback
            };

            utl.Http.doAction(options);
        };

        //Followupsections
        function getFollowupListCallback(scope, res, options, hasError) {
            var followup = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].FollowUpReferral = { data: followup, tmpl: options.tmpl };
        }

        function getFollowupsections(cid, eid, tmpl) {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: eid },
                    { Key: 3, Value: cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'appointment/patienttracker/GetPatientTrackers',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getFollowupListCallback
            };

            utl.Http.doAction(options);
        }
        //admissionMLC
        function getAdmissionMLCListCallback(scope, res, options, hasError) {
            var admissionmlc = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
            $scope.consultationDataList[options.cid].AdmissionMLC = { data: admissionmlc, tmpl: options.tmpl };
        }

        function getAdmissionMLC(cid, eid, tmpl) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: eid },
                    { Key: 4, Value: cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'Visit/EncounterMLC/GetEncounterMLCs',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getAdmissionMLCListCallback
            };

            utl.Http.doAction(options);
        }
        //Lab Result Section
        function getLabResultsCallback(scope, res, options, hasError) {
            $scope.consultationDataList[options.cid].LabResults = { data: res.Data, tmpl: options.tmpl };
            var labresult = $scope.consultationDataList[options.cid].LabResults.data;
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
                            found = { Testid: item.Testid, Testname: item.Testname, details: [], TestDisplayOrder: item.TestDisplayOrder };
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

                    //Sorting by test and analyte displayorder
                    testArr = $filter('sortArrayItems')(testArr, [
                        { name: 'TestDisplayOrder', direction: 'asc', priority: 1, type: 'int' }
                    ]);

                    for (var idx in testArr) {
                        var item = testArr[idx];
                        item.details = $filter('sortArrayItems')(item.details, [
                            { name: 'AnalyteDisplayOrder', direction: 'asc', priority: 1, type: 'int' }
                        ]);
                    }

                    labresult[jdx].PatientWorkorders[kdx].woDetails = testArr;
                }
            }
        };

        function getLabResults(cid, eid, tmpl) {
            var inputData = {
                Params: [
                    { Key: 21, Value: cid },
                    { Key: 9, Value: 1 }, // testtype = lab
                    { Key: 22, Value: "7,8,9" } // includeWOStatus Approved and Released
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getLabResultsCallback
            };

            utl.Http.doAction(options);
        };

        //Radiology result
        function getRadiologyResultsCallback(scope, res, options, hasError) {
            $scope.consultationDataList[options.cid].RadiologyResults = { data: res.Data, tmpl: options.tmpl };
            var radiologyresult = $scope.consultationDataList[options.cid].RadiologyResults.data;
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
                            found = { Testid: item.Testid, Testname: item.Testname, details: [], TestDisplayOrder: item.TestDisplayOrder };
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

                    //Sorting by test and analyte displayorder
                    testArr = $filter('sortArrayItems')(testArr, [
                        { name: 'TestDisplayOrder', direction: 'asc', priority: 1, type: 'int' }
                    ]);

                    for (var idx in testArr) {
                        var item = testArr[idx];
                        item.details = $filter('sortArrayItems')(item.details, [
                            { name: 'AnalyteDisplayOrder', direction: 'asc', priority: 1, type: 'int' }
                        ]);
                    }

                    radiologyresult[jdx].PatientWorkorders[kdx].woDetails = testArr;
                }
            }
        };

        function getRadiologyResults(cid, eid, tmpl) {
            var inputData = {
                Params: [
                    { Key: 21, Value: cid },
                    { Key: 9, Value: 2 }, // testtype = lab
                    { Key: 22, Value: "7,8,9" } // includeWOStatus Approved and Released
                ]
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getRadiologyResultsCallback
            };

            utl.Http.doAction(options);
        };

        function computeAnswers(cid, template, data, displayOrderMap, sectionId, sectionName) {
            var questionSectionData = { sectionName: sectionName, cat: [] }
            var categoryGrouped = _.groupBy(data, 'CategoryKey');
            console.log(categoryGrouped);
            for (var catKey in categoryGrouped) {
                var cat = { CategoryName: {}, concepts: [] };
                var concepts = categoryGrouped[catKey];
                cat.CategoryName = concepts[0].Category.CategoryName;
                var categoryId = concepts[0].Category.Id;
                cat.DisplayOrder = displayOrderMap[categoryId];

                for (var idx in concepts) {
                    var concept = concepts[idx];
                    var result = '';
                    switch (concept.Concept.ValueTypeId) {
                        case 3: //Term
                            if (concept.Concept.IsMultiple == false && concept.ResultValue) {
                                result = concept.ResultValue;
                                var item = {
                                    ConceptName: concept.Concept.ConceptName, Result: result,
                                    Comments: concept.Comments,
                                    ValueTypeId: concept.Concept.ValueTypeId, IsMultiple: concept.Concept.IsMultiple
                                };
                                cat.concepts.push(item);
                            } else if (concept.Concept.IsMultiple == true) {
                                processTermBasedMulti(concept, cat);
                            }
                            break;
                        case 4: //boolean
                            if (concept.ResultValue != "" || concept.ResultValue == "0") {
                                result = concept.ResultValue == "1" ? 'Yes' : 'No';
                                var item = {
                                    ConceptName: concept.Concept.ConceptName, Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                            break;
                        case 5: //boolean
                            if (concept.ResultValue != "" || concept.ResultValue == "0") {
                                result = concept.ResultValue == "1" ? 'Yes' : 'No';
                                var item = {
                                    ConceptName: concept.Concept.ConceptName, Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                            break;
                        case 6: //date
                            if (concept.ResultValue != "") {
                                result = concept.ResultValue ? utl.Formatter.getDateTimeString(concept.ResultValue) : "";
                                var item = {
                                    ConceptName: concept.Concept.ConceptName, Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                            break;
                        case 8: //notes
                            if (concept.ResultValueRichText && concept.ResultValueRichText != "") {
                                result = concept.ResultValueRichText ? concept.ResultValueRichText : "";
                                var item = {
                                    ConceptName: concept.Concept.ConceptName, Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                            break;
                        case 12: //ckeditor
                            if (concept.ResultValueRichText && concept.ResultValueRichText != "") {
                                result = concept.ResultValueRichText ? $sce.trustAsHtml(concept.ResultValueRichText) : "";
                                var item = {
                                    ConceptName: concept.Concept.ConceptName, Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                            break;
                        default:
                            if (concept.ResultValue != "") {
                                result = concept.ResultValue ? concept.ResultValue : "";
                                var item = {
                                    ConceptName: concept.Concept.ConceptName, Result: result,
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
            $scope.consultationDataList[cid][sectionName.replace(/ /g,'')] = { data: questionSectionData, tmpl: template };
            console.log($scope.consultationDataList);
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
                    ValueTypeId: concept.Concept.ValueTypeId, IsMultiple: concept.Concept.IsMultiple,
                    Terms: []
                };
                categoryToAdd.concepts.push(item);
            }
            if (concept.ResultValue == 1) {
                item.Terms.push({ TermName: concept.TermName, Comments: concept.Comments });
            }
        }

        //CategorySectionEntrys
        function getCategorySectionEntrysCallback(scope, res, options, hasError) {
            //applyAnswers(res.Data, options.modelinfo);
            var maps = {};
            for (var idx in res.map) {
                var item = res.map[idx];
                maps[item.CategoryId] = item.DisplayOrder;
            }
            computeAnswers(options.cid, options.tmpl, res.list, maps, options.sectionId, options.sectionName);
        }

        function getCategorySectionEntrys(cid, eid, tmpl, sectionId, sectionName) {

            var options = {
                action: 'emr/CategorySectionEntry/GetCategorySectionEntrysForReview',
                data: { Data: { sectionid: sectionId, consultationid: cid } },
                sectionName: sectionName,
                sectionId: sectionId,
                type: 'post',
                cid: cid,
                tmpl: tmpl,
                onComplete: getCategorySectionEntrysCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getConsultationCallback = function (scope, data, options, hasError) {
            var cid = options.data.Id;
            $scope.items[cid] = data;
            $scope.consultationDataList[cid] = {};
            console.log($scope.items);
            var eid = '';

            if(data.Encounter)
                eid = data.Encounter.Id;

            var profile = data.ProfileMaster;
            if (profile && profile.ProfileSections) {

                for (var idx in profile.ProfileSections) {
                    var profileSection = profile.ProfileSections[idx];
                    if (profileSection.SectionMaster) {
                        if ($scope.sectionMap.hasOwnProperty(profileSection.SectionMaster.SRef)) {
                            var sectionName = profileSection.SectionMaster.Name.replace(/ /g,''); //name without space
                            if(!$scope.currentcontext.sectionList.includes(sectionName)) {
                                $scope.currentcontext.sectionList.push(sectionName);
                            }
                            var currentSec = $scope.sectionMap[profileSection.SectionMaster.SRef];
                            if(profileSection.SectionMaster.SRef == 'emr.cn.question') {
                                currentSec.fn(cid, eid, currentSec.tmpl, profileSection.SectionMaster.Id, profileSection.SectionMaster.Name);
                            }  else {
                                currentSec.fn(cid, eid, currentSec.tmpl);
                            }
                        }
                    }
                }
                console.log($scope.currentcontext.sectionList);
            }

        };
        //dashboard
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.backToList = function () {
            $state.go('patientemr.consultations');
        }

        $scope.getConsultations = function () {
            $scope.currentcontext.cids.forEach((item)=> {
                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: { Id: item },
                    type: 'post',
                    onComplete: $scope.getConsultationCallback
                };
                utl.Http.doAction(options);
            })
        };

        $scope.getConsultations();
    }

    discasshtconsultationCompareController.$inject = ['$scope', '$sce', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();