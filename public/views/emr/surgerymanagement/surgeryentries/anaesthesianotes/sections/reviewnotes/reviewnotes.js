(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otreviewNotesController', otreviewNotesController);

    function otreviewNotesController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;

        $scope.currentcontext = {
            recordcount: 5
        };
        $scope.sectionData = {};
        $scope.sectionDatas = [];

        $scope.currentcontext.otregid = $scope.$parent.currentcontext.id;
        $scope.currentcontext.pid = $scope.$parent.currentcontext.pid;
        $scope.currentcontext.eid = $scope.$parent.currentcontext.eid;

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
            'emr.cn.prescription': { tmpl: 'cn-prescription-section.html', fn: getprescription },
            'emr.cn.order': { tmpl: 'cn-order-section.html', fn: getorders },
            'emr.cn.chiefcomplaint': { tmpl: 'cn-chiefcomplaint-section.html', fn: getchiefcomplaints },
            'emr.cn.question': { tmpl: 'cn-question-section.html', fn: getCategorySectionEntrys },
            'emr.cn.followup': { tmpl: 'cn-followup-section.html', fn: getFollowupsections },
            'emr.cn.labresults': { tmpl: 'cn-labresult-section.html', fn: getLabResults },
            'emr.cn.radiologyresults': { tmpl: 'cn-radiologyresult-section.html', fn: getRadiologyResults }
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.ismodal = true;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
            $scope.currentcontext.otregid = $scope.$parent.currentcontext.id;
            $scope.currentcontext.pid = $scope.$parent.currentcontext.pid;
            $scope.currentcontext.eid = $scope.$parent.currentcontext.eid;
        }
        $scope.backToList = function () {
            $state.go('patientemr.consultations');
        }

        //Get Section Data starts
        //Allergy
        function getAllergyListCallback(scope, res, options, hasError) {
            $scope.sectionData.allergy = res.Data;
        }

        function getAllergyItems() {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: 1 }, //Active records
                    { Key: 5, Value: $scope.currentcontext.eid },
                    { Key: 6, Value: $scope.currentcontext.cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientallergy/GetPatientAllergys',
                data: inputData,
                type: 'post',
                onComplete: getAllergyListCallback
            };

            utl.Http.doAction(options);
        }

        //Conditions
        function getConditionListCallback(scope, res, options, hasError) {
            $scope.sectionData.conditions = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        }

        function getConditions() {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 4, Value: 1 },
                { Key: 5, Value: $scope.currentcontext.eid },
                { Key: 6, Value: $scope.currentcontext.cid },
                { Key: 7, Value: true }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                onComplete: getConditionListCallback
            };

            utl.Http.doAction(options);
        }


        //Vital
        function getVitalListCallback(scope, res, options, hasError) {

            $scope.sectionData.vitals = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);

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
                        grouped.push({ 'Id': 0, 'Vitalinfo': _fullvalue, 'PerformedDate': oldSelecteddt });
                        oldSelecteddt = Selecteddt;
                        _fullvalue = '';
                    }
                    _vitalName = $scope.sectionData.vitals[i].VitalName;
                    _vitalValue = $scope.sectionData.vitals[i].VitalValue;
                    _vitalValue = _vitalValue.replace('~','/');
                    _fullvalue += _vitalName + ':' + _vitalValue + '; ';
               }
                else {
                    _vitalName = $scope.sectionData.vitals[i].VitalName;
                    _vitalValue = $scope.sectionData.vitals[i].VitalValue;
                    _vitalValue = _vitalValue.replace('~','/');
                    _uom = $scope.sectionData.vitals[i].UOM;
                    _fullvalue += '<font color="#007cff">' + _vitalName + '</font> : ' + ' ' + '<font color="darkcyan0">' + _vitalValue + '</font>' + ' ' + '<font color="black">' + _uom + ' </font> ' + ' </br>';
                }

                if (i == ($scope.sectionData.vitals.length - 1) && oldSelecteddt == Selecteddt) {
                    if (_fullvalue.length > 0) {
                        oldSelecteddt = Selecteddt;
                        grouped.push({ 'Id': 0, 'Vitalinfo': _fullvalue, 'PerformedDate': oldSelecteddt });
                        _fullvalue = '';
                    }
                }
            }

            $scope.sectionData.vitals = [];
            $scope.sectionData.vitals = grouped;

        }
        function getvitals() {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 9, Value: $scope.currentcontext.eid },
                { Key: 4, Value: 1 },
                { Key: 10, Value: $scope.currentcontext.cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                onComplete: getVitalListCallback
            };

            utl.Http.doAction(options);
        };

        //Procedure
        function getProcedureListCallback(scope, res, options, hasError) {
            $scope.sectionData.procedures = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };

        function getprocedures() {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 6, Value: $scope.currentcontext.eid },
                { Key: 5, Value: 1 },
                { Key: 7, Value: $scope.currentcontext.cid }],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientprocedure/GetPatientProcedures',
                data: inputData,
                type: 'post',
                onComplete: getProcedureListCallback
            };

            utl.Http.doAction(options);
        };

        //Document
        function getDocumentListCallback(scope, res, options, hasError) {
            $scope.sectionData.documents = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };
        function getdocuments() {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentcontext.eid },
                    { Key: 4, Value: $scope.currentcontext.cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/ClinicalDocument/GetClinicalDocuments',
                data: inputData,
                type: 'post',
                onComplete: getDocumentListCallback
            };

            utl.Http.doAction(options);
        };

        //Familycondition
        function getFamilyConditionListCallback(scope, res, options, hasError) {
            $scope.sectionData.familyconditions = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };

        function getfamilyconditions() {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 6, Value: $scope.currentcontext.eid },
                { Key: 5, Value: 1 },
                { Key: 7, Value: $scope.currentcontext.cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/familycondition/GetFamilyConditions',
                data: inputData,
                type: 'post',
                onComplete: getFamilyConditionListCallback
            };

            utl.Http.doAction(options);
        };

        //Social History
        function getSocialHisListCallback(scope, res, options, hasError) {
            $scope.sectionData.socialHistory = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };

        function getsocialhistory() {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 5, Value: $scope.currentcontext.eid },
                { Key: 4, Value: 1 },
                { Key: 6, Value: $scope.currentcontext.cid }],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientsocialhistory/GetPatientSocialHistorys',
                data: inputData,
                type: 'post',
                onComplete: getSocialHisListCallback
            };

            utl.Http.doAction(options);
        };

        //Family social history
        function getFamilySocHisListCallback(scope, res, options, hasError) {
            $scope.sectionData.FamilySocHistory = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };

        function getfamilysocialhistory() {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid },
                { Key: 5, Value: $scope.currentcontext.eid },
                { Key: 4, Value: 1 },
                { Key: 6, Value: $scope.currentcontext.cid }],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/familysocialhistory/GetFamilySocialHistorys',
                data: inputData,
                type: 'post',
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
            $scope.sectionData.Immunizations = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };

        function getimmunization() {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 5, Value: $scope.currentcontext.eid },
                    { Key: 6, Value: $scope.currentcontext.cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientimmunization/GetPatientImmunizations',
                data: inputData,
                type: 'post',
                onComplete: getImmunizationListCallback
            };

            utl.Http.doAction(options);
        };

        //Chief Complaints
        function getchiefcomplaintsCallback(scope, res, options, hasError) {
            $scope.sectionData.ChiefComplaints = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };

        function getchiefcomplaints() {

            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.pid }, { Key: 3, Value: $scope.currentcontext.eid },
                { Key: 4, Value: $scope.currentcontext.cid }],
                PageContext: { PageSize: 500, PageNumber: 1 }
            };

            var options = {
                action: 'emr/PatientChiefComplaint/GetPatientChiefComplaints',
                data: inputData,
                type: 'post',
                onComplete: getchiefcomplaintsCallback
            };

            utl.Http.doAction(options);
        };


        //Prescriptions
        function getPrescriptionListCallback(scope, res, options, hasError) {
            $scope.sectionData.prescriptions = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };

        function getprescription() {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 12, Value: $scope.currentcontext.eid },
                    { Key: 6, Value: 3 },
                    { Key: 13, Value: $scope.currentcontext.cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: getPrescriptionListCallback
            };

            utl.Http.doAction(options);
        };

        //Orders
        function getOrderListCallback(scope, res, options, hasError) {
            $scope.sectionData.orders = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };

        function getorders() {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: 1 },
                    { Key: 18, Value: $scope.currentcontext.eid },
                    { Key: 21, Value: $scope.currentcontext.cid }
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

        //Followupsections
        function getFollowupListCallback(scope, res, options, hasError) {
            $scope.sectionData.followup = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        }

        function getFollowupsections() {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: $scope.currentcontext.eid },
                    { Key: 3, Value: $scope.currentcontext.cid }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'appointment/patienttracker/GetPatientTrackers',
                data: inputData,
                type: 'post',
                onComplete: getFollowupListCallback
            };

            utl.Http.doAction(options);
        }

        //Lab Result Section
        function getLabResultsCallback(scope, res, options, hasError) {
            $scope.sectionData.labresult = res.Data;
            var labresult = $scope.sectionData.labresult;
            for(var jdx in labresult) {
                for(var kdx in labresult[jdx].PatientWorkorders) {

                    var result = labresult[jdx].PatientWorkorders[kdx].PatientWorkorderdetails;
                    var testArr = [];
                    var tabIndex = 0;
                    var profileName = "";
                    var rootProfileName = "";
                    for (var idx in result) {
                        var item = result[idx];

                        var found = testArr.find(function(t) {
                            return t.Testname == item.Testname;
                        });
                        if (!found) {
                            found = { Testid: item.Testid, Testname: item.Testname, details: [], TestDisplayOrder: item.TestDisplayOrder };
                            if (profileName != item.ProfileName) {
                                profileName = item.ProfileName;
                                found.ProfileName = profileName;
                            }
                            if ( rootProfileName != item.RootProfileName) {
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

        function getLabResults() {
            var inputData = {
                Params: [
                    { Key: 21, Value:  $scope.currentcontext.cid },
                    { Key: 9, Value: 1 }, // testtype = lab
                    { Key: 22, Value: "7,8,9" } // includeWOStatus Approved and Released
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: getLabResultsCallback
            };

            utl.Http.doAction(options);
        };

        //Radiology result
        function getRadiologyResultsCallback(scope, res, options, hasError) {
            $scope.sectionData.radiologyresult = res.Data;
            var radiologyresult = $scope.sectionData.radiologyresult;
            for(var jdx in radiologyresult) {
                for(var kdx in radiologyresult[jdx].PatientWorkorders) {
                    
                    var result = radiologyresult[jdx].PatientWorkorders[kdx].PatientWorkorderdetails;
                    var testArr = [];
                    var tabIndex = 0;
                    var profileName = "";
                    var rootProfileName = "";
                    for (var idx in result) {
                        var item = result[idx];

                        var found = testArr.find(function(t) {
                            return t.Testname == item.Testname;
                        });
                        if (!found) {
                            found = { Testid: item.Testid, Testname: item.Testname, details: [], TestDisplayOrder: item.TestDisplayOrder };
                            if (profileName != item.ProfileName) {
                                profileName = item.ProfileName;
                                found.ProfileName = profileName;
                            }
                            if ( rootProfileName != item.RootProfileName) {
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

        function getRadiologyResults() {
            var inputData = {
                Params: [
                    { Key: 21, Value:  $scope.currentcontext.cid },
                    { Key: 9, Value: 2 }, // testtype = lab 
                    { Key: 22, Value: "7,8,9" } // includeWOStatus Approved and Released
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

        //Diagnosis
        function getDiagnosisListCallback(scope, res, options, hasError) {
            $scope.sectionData.diagnosis = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        }

        function getDiagnosis() {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: 1 },
                    { Key: 5, Value: $scope.currentcontext.eid },
                    { Key: 6, Value: $scope.currentcontext.cid },
                    { Key: 7, Value: false }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                onComplete: getDiagnosisListCallback
            };

            utl.Http.doAction(options);
        }        
        //Questions
        // function getQuestionSectionCallback(scope, data, options, hasError) {
        //     computeCategories(options.data.Id, data.SectionCategoryMaps, data.Name);
        //     //$scope.getCategorySectionEntrys();
        // };

        // function getquestions(sectionId) {
        //     var options = {
        //         action: 'clinicalmaster/SectionMaster/GetSectionMasterById',
        //         data: { Id: sectionId },
        //         type: 'post',
        //         onComplete: getQuestionSectionCallback
        //     };
        //     utl.Http.doAction(options);
        // }

        //Questions
        // function computeCategories(sectionId, sectionCatMaps, sectionName) {
        //     var modeldata = {};

        //     var categoryList = [];
        //     for (var idx in sectionCatMaps) {
        //         var item = sectionCatMaps[idx];
        //         item.Category.Concepts = _.sortBy(item.Category.Concepts, ['DisplayOrder']);

        //         if (item.Category && item.Category.Concepts && item.Category.Concepts.length > 0) {
        //             for (var jdx in item.Category.Concepts) {
        //                 var concept = item.Category.Concepts[jdx];

        //                 var modelKey = item.Category.CategoryIdentifier + "." + concept.ConceptIdentifier;
        //                 concept.model = modelKey;
        //                 concept.CategoryIdentifier = item.Category.CategoryIdentifier;

        //                 modeldata[modelKey] = { master: concept, trans: {}, resultvalue: '' };
        //             }
        //             categoryList.push(item.Category);
        //         }
        //     }
        //     $scope.sectionData[sectionId] = categoryList;
        //     $scope.sectionData[sectionId].sectionName = sectionName;

        //     getCategorySectionEntrys(sectionId, sectionName, modeldata);
        //     //console.log(categoryList);
        // }

        // function applyAnswers(data, modeldata) {
        //     var sectionId=0;
        //     for(var idx in data) {
        //         var item = data[idx];
        //         sectionId = item.SectionId;
        //         var modelKey = item.CategoryKey + "." + item.ConceptKey;
        //         if(!modeldata[modelKey] && item.TermKey) {
        //              modelKey = modelKey + '.' + item.TermKey;
        //              modeldata[modelKey].trans = item;
        //              modeldata[modelKey].resultvalue = item.ResultValue == 1 ? true : false;
        //         }
        //         else if(modeldata[modelKey]) {
        //             modeldata[modelKey].trans = item;
        //             if(modeldata[modelKey].master.ValueTypeId == 4 ||
        //                 modeldata[modelKey].master.ValueTypeId == 5) {
        //                 modeldata[modelKey].resultvalue = item.ResultValue == 1 ? true : false;
        //             } else if(modeldata[modelKey].master.ValueTypeId == 6) {
        //                 modeldata[modelKey].resultvalue = item.ResultValue ? utl.Formatter.getDateTimeString(item.ResultValue) : "";
        //             } else if(modeldata[modelKey].master.IsMultiple && modeldata[modelKey].master.ValueTypeId == 3) {
        //                 if(item.ResultValue == 1) {
        //                     var term = _.find(modeldata[modelKey].master.Terms, function(r) {
        //                         return r.Id == item.TermKey;
        //                     });
        //                     if(!modeldata[modelKey].resultvalue) {
        //                         modeldata[modelKey].resultvalue = term ? term.TermName : '';
        //                     } else {
        //                         modeldata[modelKey].resultvalue = modeldata[modelKey].resultvalue + ', ' +  term.TermName;
        //                     }
        //                 }
        //             } else {
        //                 modeldata[modelKey].resultvalue = item.ResultValue;
        //             }
        //         }
        //     }
        //     if(sectionId > 0){
        //         $scope.sectionData[sectionId].questionvalue = modeldata;
        //     }
        //     console.log($scope.sectionData);
        // }




        function computeAnswers(data, displayOrderMap, sectionId, sectionName) {
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
                                    ValueTypeId: concept.Concept.ValueTypeId, IsMultiple: concept.Concept.IsMultiple
                                };
                                cat.concepts.push(item);
                            } else if (concept.Concept.IsMultiple == true) {
                                processTermBasedMulti(concept, cat);
                            }
                            break;
                        case 4: //boolean
                            if (concept.ResultValue != "" || concept.ResultValue == "0") {
                            result = concept.ResultValue == 1 ? 'Yes' : 'No';
                            var item = {
                                ConceptName: concept.Concept.ConceptName, Result: result,
                                ValueTypeId: concept.Concept.ValueTypeId
                            };
                            cat.concepts.push(item);
                            }
                            break;
                        case 5: //boolean
                            if (concept.ResultValue != "" || concept.ResultValue == "0") {
                            result = concept.ResultValue == 1 ? true : false;
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
            $scope.sectionData[sectionId] = questionSectionData;
            console.log($scope.sectionData[sectionId]);
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
                item.Terms.push({ TermName: concept.TermName });
            }
        }

        function getCategorySectionEntrysCallback(scope, res, options, hasError) {
            //applyAnswers(res.Data, options.modelinfo);
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
                data: { Data: {
                    sectionid: sectionId,
                    consultationid: $scope.currentcontext.cid,
                    otregisterid: $scope.currentcontext.otregid } },
                sectionName: sectionName,
                sectionId: sectionId,
                type: 'post',
                onComplete: getCategorySectionEntrysCallback
            };

            utl.Http.doAction(options);
        };

        //Get Section Data ends

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
            updateProgressNoteStatus(2); //
        }

        $scope.releaseToPatient = function () {
            updateProgressNoteStatus(3); //
        }

        function updateStatusCallback() {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (modalConfig && modalConfig.params) {
                $scope.confirmCallback();
            }
            else {
                loadData()
        }
        }
        function loadData() {
            $scope.getCurrentConsultation();
        }
        function updateProgressNoteStatus(statusId) {
            var actionName = 'emr/consultation/UpdateProgressNoteStatus';

            var options = {
                action: actionName,
                data: { Id: $scope.currentcontext.cid, Data: { ProgressNoteStatusId: statusId } },
                type: 'post',
                onComplete: updateStatusCallback
            };
            utl.Http.doAction(options);
        }
       
        //print
        $scope.printConsultation = function () {
            var inputData = {
                Id: $scope.currentcontext.cid,
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid,
                    otregisterid: $scope.currentcontext.otregid
                }
            };
            var options = {
                action: 'emr/consultation/PrintConsultation',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        //viewConsultation
        $scope.viewConsultation = function (item) {
            utl.Modal.open('patientemr.reviewnotes', {
                params: { cid: item.Id, pid: $scope.currentcontext.pid }
            });
            // $state.go('patientemr.consultation', { id: item.Id });
            // if ($scope.currentcontext.ismodal) {
            //     $state.go('patientemr.consultation', { id: item.Id });
            //     $scope.confirmCallback();
            // }
        }
        //previousnotes
        $scope.getAllConsultationCallback = function (scope, res, options, hasError) {
            $scope.sectionData.consultlist = res.Data;
        };
        $scope.getallConsultation = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.eid },
                    { Key: 3, Value: $scope.currentcontext.pid },
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
        //get consultation
        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.eid = data.EncounterId;
            $scope.getallConsultation();
            computeSectionList();
            //loadSectionData();
        };

        $scope.getCurrentConsultation = function (pageNo) {
            if ($scope.currentcontext.cid && $scope.currentcontext.cid > 0) {

                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: { Id: $scope.currentcontext.cid },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getCurrentConsultation();
    }

    otreviewNotesController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();