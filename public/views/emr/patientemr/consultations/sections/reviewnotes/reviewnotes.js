(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('reviewNotesController', reviewNotesController);

    function reviewNotesController($scope, $sce, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getCNSectionBaseCtrl({
            $scope: $scope
        }));

        $scope.currentcontext = {
            recordcount: 5
        };
        $scope.sectionData = {};
        $scope.sectionDatas = [];
        $scope.selectedSecArr = [];
        $scope.item = {};
        // $scope.IsAllOrderSelectedss = false;

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
            'emr.cn.examinationsystem': {
                tmpl: 'cn-examinationsystem-section.html',
                fn: getExaminationSystems
            },
            'emr.cn.lensprescription': {
                tmpl: 'cn-lensprescribe-section.html',
                fn: getLensPrescribe
            },
            'emr.cn.surgeryadvice': {
                tmpl: 'cn-surgeryadvice-section.html',
                fn: getSurgeryAdvice
            },
            'emr.cn.injectionadvice': {
                tmpl: 'cn-injectionadvice-section.html',
                fn: getInjectionAdvice
            },
            'emr.cn.laseradvice': {
                tmpl: 'cn-laseradvice-section.html',
                fn: getLaserAdvice
            },
            'emr.cn.clinicalnotes': {
                tmpl: 'cn-clinicalnotes-section.html',
                fn: getClinicalNotes
            },
            'emr.cn.advicemedications': {
                tmpl: 'cn-advicemedications-section.html',
                fn: getAdviceMedications
            },
            'emr.cn.treatmentplan': {
                tmpl: 'cn-treatmentplan-section.html',
                fn: getTreatmentPlan
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
            $state.go('patientemr.consultationtab.consultationcurrentlist', {
                pid: $scope.currentcontext.pid,
                eid: $scope.currentcontext.eid,
                context: $scope.context
            });
        };
        //Get Section Data starts

        //Advicemedications
        function getAdviceMedicationsCallback(scope, res, options, hasError) {
            $scope.sectionData.Advicemedications = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        }

        function getAdviceMedications() {
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
                },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/PatientAdviceMedication/GetPatientAdviceMedications',
                data: inputData,
                type: 'post',
                onComplete: getAdviceMedicationsCallback
            };
            utl.Http.doAction(options);
        }
        //Allergy
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
                }, //Active records
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

        //Conditions
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

        $scope.selectAllItems = function () {
            for (var idx in $scope.currentcontext.testList) {
                var item = $scope.currentcontext.testList[idx];
                item.IsSelected = $scope.currentcontext.selectall;
                item.IsAllOrderSelected = $scope.currentcontext.selectall;
            }
        }

        $scope.IsAllOrderSelectedChange = function (item, sectionid) {
            // console.log(item);
            // console.log(sectionid);
            if (item.IsAllOrderSelected == true) {
                if ($scope.selectedSecArr.indexOf(sectionid) === -1) {
                    $scope.selectedSecArr.push(sectionid);
                }
            } else {
                const index = $scope.selectedSecArr.indexOf(sectionid);
                if (index > -1) {
                    $scope.selectedSecArr.splice(index, 1);
                }
            }


            // for (var idx1 in list) {
            //     var detail = list[idx1];
            //     if (detail.IsAllOrderSelected) {
            //         detail.IsSelected = true;
            //     } else if (!detail.IsAllOrderSelected) {
            //         detail.IsSelected = false;
            //     }
            // }

            // for (var jdx1 in item.details) {
            //     var detail1 = item.details[jdx1];
            //     if (item.IsAllOrderSelected) {
            //         detail1.IsAllOrderSelected = true;
            //     } else if (!item.IsAllOrderSelected) {
            //         detail1.IsAllOrderSelected = false;
            //     }
            // }
        }

        $scope.vitalcustom_sort = function (a, b) {
            if (b.VitalMaster.DisplayOrder && a.VitalMaster.DisplayOrder)
                return a.VitalMaster.DisplayOrder - b.VitalMaster.DisplayOrder;
            else
                return 0;
        }

        //Vital
        function getVitalListCallback(scope, res, options, hasError) {

            $scope.sectionData.vitals = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
            $scope.sectionData.vitals.sort($scope.vitalcustom_sort);
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
                    // _fullvalue += '<font color="#777777">' + _vitalName + '</font> : ' + ' ' + '<font color="#777777">' + _vitalValue + '</font>' + ' ' + '<font color="black">' + _uom + ' </font> ' + ' </br>';
                    _fullvalue += '<table>' + '<tr>' + '<td>' + _vitalName + '</td>' + '<td>' + _vitalValue + '</td>' + '<td>' + _uom + '</td>' + '</tr>' + '</table>';
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

        //Procedure
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

        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile = function (filePath) {
            var inputData = {
                FilePath: filePath
            };
            var options = {
                action: 'emr/ClinicalDocument/GetDocumentFile',
                data: {
                    Data: inputData
                },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }

        //Document
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
                action: 'emr/ClinicalDocument/GetClinicalDocuments',
                data: inputData,
                type: 'post',
                onComplete: getDocumentListCallback
            };

            utl.Http.doAction(options);
        };

        //Familycondition
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

        //Social History
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

        //Family social history
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

        //Immuization
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

        //Chief Complaints
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
                }, {
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


        //Prescriptions
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

        //Orders
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
                {
                    Key: 4,
                    Value: 1
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
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: getOrderListCallback
            };

            utl.Http.doAction(options);
        }

        //Followupsections
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
        //admissionMLC
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
        //Lab Result Section
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

                    //Sorting by test and analyte displayorder
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
                    Value: "7,8,9"
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
        };

        //Radiology result
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

                    //Sorting by test and analyte displayorder
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
                    Value: "7,8,9"
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

        //Diagnosis
        function getDiagnosisListCallback(scope, res, options, hasError) {
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

        //ExaminationSystem
        function getExaminationSystemsCallback(scope, res, options, hasError) {
            $scope.sectionData.examinationsystem = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getExaminationSystems() {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.currentcontext.cid
                },],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/PatientExaminationSystem/GetPatientExaminationSystems',
                data: inputData,
                type: 'post',
                onComplete: getExaminationSystemsCallback
            };
            utl.Http.doAction(options);
        };

        //LensPrescribe
        function getLensPrescribeCallback(scope, res, options, hasError) {
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
                    Key: 10,
                    Value: $scope.currentcontext.cid
                },]
            };
            var options = {
                action: 'emr/LensPrescription/GetLensPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: getLensPrescribeCallback
            };
            utl.Http.doAction(options);
        };

        //Surgery Advice
        function getSurgeryAdviceCallback(scope, res, options, hasError) {
            $scope.sectionData.surgeryadvice = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getSurgeryAdvice() {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.currentcontext.cid
                },],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/PatientSurgeryAdvice/GetPatientSurgeryAdvices',
                data: inputData,
                type: 'post',
                onComplete: getSurgeryAdviceCallback
            };
            utl.Http.doAction(options);
        };

        //Injection Advice
        function getInjectionAdviceCallback(scope, res, options, hasError) {
            $scope.sectionData.injectionadvice = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getInjectionAdvice() {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.currentcontext.cid
                },],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/PatientInjectionAdvice/GetPatientInjectionAdvices',
                data: inputData,
                type: 'post',
                onComplete: getInjectionAdviceCallback
            };
            utl.Http.doAction(options);
        };

        //Laser Advice
        function getLaserAdviceCallback(scope, res, options, hasError) {
            $scope.sectionData.laseradvice = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getLaserAdvice() {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.currentcontext.cid
                },],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/PatientLaserAdvice/GetPatientLaserAdvices',
                data: inputData,
                type: 'post',
                onComplete: getLaserAdviceCallback
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
                },
                {
                    Key: 4,
                    Value: 1
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

        // Treatment Plan
        function getTreatmentPlanCallback(scope, res, options, hasError) {
            $scope.TreatmentPlan = [];
            if (res.Data.length > 0) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    if (item.TreatmentPlanDetails.length > 0) {
                        var GroupedBatchData = _.groupBy(item.TreatmentPlanDetails, 'ServiceItemId');
                        for (var dx in GroupedBatchData) {
                            var plandata = GroupedBatchData[dx];
                            if (!item.TreatmentName) {
                                item.TreatmentName = plandata[0].ServiceName;
                            } else {
                                item.TreatmentName += ',' + plandata[0].ServiceName;
                            }
                        }
                    }
                    $scope.TreatmentPlan.push(item);
                }
            }
            $scope.sectionData.TreatmentPlan = $filter('sortArrayItems')($scope.TreatmentPlan, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        function getTreatmentPlan() {

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.pid
                },
                {
                    Key: 11,
                    Value: $scope.currentcontext.eid
                },
                {
                    Key: 12,
                    Value: $scope.currentcontext.cid
                },
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/TreatmentPlan/GetTreatmentPlans',
                data: inputData,
                type: 'post',
                onComplete: getTreatmentPlanCallback
            };

            utl.Http.doAction(options);
        };

        function computeAnswers(data, displayOrderMap, sectionId, sectionName) {
            var questionSectionData = {
                sectionName: sectionName,
                cat: []
            }
            var categoryGrouped = _.groupBy(data, 'CategoryKey');
            console.log(categoryGrouped);
            for (var catKey in categoryGrouped) {
                var cat = {
                    CategoryName: {},
                    concepts: []
                };
                // var concepts = categoryGrouped[catKey];
                var concepts = _.sortBy(categoryGrouped[catKey], 'Concept.DisplayOrder');
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
                        case 4: //boolean
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
                        case 5: //boolean
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
                        case 6: //date
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
                        case 8: //notes
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
                        case 10: //icd
                            if (concept.ResultValueJSON && concept.ResultValueJSON != "") {
                                result = concept.ResultValueJSON ? JSON.parse(concept.ResultValueJSON) : "";
                                if (result) {
                                    if (result.length > 0) {
                                        var Diagnosis = '';
                                        for (var indx in result) {
                                            var diagnosisname = result[indx].DiagnosisName;
                                            Diagnosis += diagnosisname + ',';
                                        }
                                    }
                                }
                                var item = {
                                    ConceptName: concept.Concept.ConceptName,
                                    Result: Diagnosis,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                            }
                            break;
                        case 12: //ckeditor
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
                data: {
                    Data: {
                        sectionid: sectionId,
                        consultationid: $scope.currentcontext.cid,
                        patientid: $scope.currentcontext.pid
                    }
                },
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
                var PrintOrder = [];
                if (profile.PrintConfig && profile.PrintConfig.length > 3)
                    PrintOrder = JSON.parse(profile.PrintConfig);

                for (var idx in profile.ProfileSections) {
                    var profileSection = profile.ProfileSections[idx];
                    if (profileSection.SectionMaster) {
                        if ($scope.sectionMap.hasOwnProperty(profileSection.SectionMaster.SRef)) {
                            var currentSec = $scope.sectionMap[profileSection.SectionMaster.SRef];
                            var tabItem = {
                                sectionid: profileSection.SectionMaster.Id,
                                title: profileSection.SectionMaster.Name,
                                key: profileSection.SectionMaster.SRef,
                                tmpl: currentSec.tmpl,
                                IsAllOrderSelected: true
                            };
                            if (profileSection.SectionMaster.SectionTypeId == 2 || profileSection.SectionMaster.SectionTypeId == 3 ||
                                profileSection.SectionMaster.SectionTypeId == 4 || profileSection.SectionMaster.SectionTypeId == 5) {
                                currentSec.fn(profileSection.SectionMaster.Id, profileSection.SectionMaster.Name);
                            } else {
                                currentSec.fn();
                            }

                            tabItem.DisplayOrder = profileSection.DisplayOrder ? parseInt(profileSection.DisplayOrder) : 1000;
                            try {
                                tabItem.PrintConfig = PrintOrder.PrintConfig[idx];
                            } catch (ex) {
                                tabItem.PrintConfig = 1000;
                            }
                            if (!tabItem.PrintConfig) tabItem.PrintConfig = tabItem.DisplayOrder;
                            sections.push(tabItem);
                            $scope.selectedSecArr.push(profileSection.SectionMaster.Id);
                        }
                    }
                }
                ///sections = _.sortBy(sections, ['DisplayOrder']);
                sections = _.sortBy(sections, ['PrintConfig']);
                $scope.currentcontext.sections = sections;
                $scope.currentcontext.sections.sort($scope.custom_sort);
                console.log($scope.currentcontext.sections);
            }
        }

        $scope.custom_sort = function (a, b) {
            if (b.DisplayOrder && a.DisplayOrder)
                return a.DisplayOrder - b.DisplayOrder;
            else
                return 0;
        }

        $scope.approveConsultation = function () {
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            // $scope.item.ProgressNoteStatusId = 2;

            var msg = 'Do You Want to Finalize the Notes?';
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: updateProgressNoteStatus(2),
            };
            utl.Dialog.confirmMessage(confirmOptions);
            // updateProgressNoteStatus(2); //;
        }

        $scope.releaseToPatient = function () {
            updateProgressNoteStatus(3); //
        }

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

        //print
        $scope.printConsultation = function () {

            var inputData = {
                Id: $scope.currentcontext.cid,
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid,
                    sectionList: $scope.selectedSecArr
                }
            };
            var options = {
                action: 'emr/consultation/PrintConsultation',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

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
        }
        //viewConsultation
        $scope.viewConsultation = function (item) {
            utl.Modal.open('patientemr.reviewnotes', {
                params: {
                    cid: item.Id,
                    pid: $scope.currentcontext.pid
                }
            });
        }
        //previousnotes
        $scope.getAllConsultationCallback = function (scope, res, options, hasError) {
            $scope.sectionData.consultlist = res.Data;
        };
        $scope.getallConsultation = function (pageNo) {
            var inputData = {
                Params: [
                    // { Key: 2, Value: $scope.currentcontext.eid },
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
            if ($scope.currentcontext.cid > 0) {
                inputData.Params.push({
                    Key: 14,
                    Value: $scope.currentcontext.cid
                })
            }
            if ($scope.context == 'emr') {
                inputData.Params.push({
                    Key: 11,
                    Value: 1
                })
            }
            if ($scope.context == 'ipemr') {
                inputData.Params.push({
                    Key: 11,
                    Value: 3
                })
            }
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

    reviewNotesController.$inject = ['$scope', '$sce', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();