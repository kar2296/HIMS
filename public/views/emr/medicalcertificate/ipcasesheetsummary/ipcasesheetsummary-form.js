(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipCaseSheetSummaryFormController', ipCaseSheetSummaryFormController);

    ipCaseSheetSummaryFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig', '$timeout'];

    function ipCaseSheetSummaryFormController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, $timeout) {
        var vm = this;

        //Preference code
        angular.extend(this, utl.Ctrl.getUPCtrl({ $scope: $scope }));

        $scope.currentfilter = {
        };

        $scope.cncontext = {
            tabstop: [],
            tabsright: [],
            currenttmpl: '',
            consultationid: 0,
            canshowuserpref: false
        };

        $scope.canShowDischargeBtn = false;
        if ($stateParams.eid) {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
        }

        if ($stateParams.id)
            $scope.cncontext.consultationid = $stateParams.id;

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        $scope.sectionList = [];

        $scope.sectionMap = {
            'emr.cn.question': { tmpl: getSectionPath() + 'question/cn-question-section.html', controller: 'ipcsQuestionSectionController' },
        };

        function getSectionPath() {
            return "app/views/emr/medicalcertificate/ipcasesheetsummary/sections/";
        }

        $scope.getSectionMasterListCallback = function (scope, res, options, hasError) {
            $scope.sectionList = res.Data;
            // computeTabs();
            // prepareMap();
            getUserPref();
        };

        function getUserPrefCallback(prefValue) {
            var tabstop = [];
            var tabsright = [];
            var selectedSections = prefValue && prefValue.selected ? prefValue.selected : [];
            if (selectedSections && selectedSections.length > 0) {
                for (var idx in selectedSections) {
                    for (var jdx in $scope.sectionList) {
                        if ($scope.sectionList[jdx].Name == selectedSections[idx].Text) {
                            var profileSection = $scope.sectionList[jdx];
                            if (profileSection) {
                                var mapData = $scope.sectionMap[profileSection.SRef];
                                if (mapData) {
                                    var currentTmpl = mapData.tmpl;
                                    var tabItem = {
                                        sectionid: profileSection.Id,
                                        sectiontypeid: profileSection.SectionTypeId,
                                        title: profileSection.Name, sref: profileSection.SRef,
                                        key: profileSection.SRef, tmpl: currentTmpl,
                                        controller: mapData.controller
                                    };
                                    tabItem.DisplayOrder = profileSection.DisplayOrder ? parseInt(profileSection.DisplayOrder) : 1000;
                                    tabstop.push(tabItem);
                                }
                            }
                        }
                        $scope.sections = tabstop;
                    }
                }
            }
            else {
                $scope.sections = sectionList;
            }
            tabstop = _.sortBy(tabstop, ['DisplayOrder']);
            $scope.cncontext.tabstop = tabstop;
            //Load first tab item template by default
            $scope.switchTopTab($scope.cncontext.tabstop[0]);

        }
        // else {
        //     $scope.sections = sectionList;
        // }
        // for (var idx in $scope.sectionList) {
        //     var profileSection = $scope.sectionList[idx];
        //     if (profileSection) {
        //         profileSection.SRef = profileSection.SRef || 'emr.cn.question';
        //         var mapData = $scope.sectionMap[profileSection.SRef];
        //         if (mapData) {
        //             var currentTmpl = mapData.tmpl;
        //             var tabItem = {
        //                 sectionid: profileSection.Id,
        //                 sectiontypeid: profileSection.SectionTypeId,
        //                 title: profileSection.Name, sref: profileSection.SRef,
        //                 key: profileSection.SRef, tmpl: currentTmpl,
        //                 controller: mapData.controller
        //             };
        //             tabItem.DisplayOrder = profileSection.DisplayOrder ? parseInt(profileSection.DisplayOrder) : 1000;
        //             tabstop.push(tabItem);
        //         }
        //     }
        // }

        $scope.switchTopTab = function (tab) {
            $scope.cncontext.currentsection = tab;
        }

        $scope.getSectionMasterList = function () {
            var inputData = {
                Params: [
                    { Key: 5, Value: 3 }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'clinicalmaster/SectionMaster/GetSectionMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getSectionMasterListCallback
            };
            utl.Http.doAction(options);
        };

        function getMasterList() {
            var result = [];
            for (var idx in $scope.sectionList) {
                var item = $scope.sectionList[idx];
                var cfgItem = { Id: item.Id, Text: item.Name };
                result.push(cfgItem);
            }
            return result;
        }

        function refreshPref() {
            $scope.refreshUP($scope.prefKeys.DischargeSummarySection, getUserPrefCallback);
        }
        function getUserPref() {
            $scope.getUP($scope.prefKeys.DischargeSummarySection, getUserPrefCallback);
        }

        //Actions
        $scope.configuration = function () {
            utl.Modal.open('patientemr.ipcasesheetsummaryconfig', {
                params: { cfg: { master: getMasterList(), prefkey: $scope.prefKeys.DischargeSummarySection } },
                confirmCallback: refreshPref
            });
        }

        $scope.getencounterCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.currentcontext.eid = res.Data[0].Id;
                $scope.getCurrentConsultation();
            }
        };

        $scope.getEncounter = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.eid },
                    { Key: 15, Value: 2 }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencounterCallback
            };

            utl.Http.doAction(options);
        };
        // function getUserPrefCallback(prefValue) {
        // var selectedSections = prefValue && prefValue.selected ? prefValue.selected : [];
        // var resultList = [];
        // if (selectedSections && selectedSections.length > 0) {
        //     for (var idx in selectedSections) {
        //         var item = selectedSections[idx];
        //         var sectionItem = sectionMap[item.Id];
        //         resultList.push(sectionItem);
        //     }
        //     $scope.sections = resultList;
        // } else {
        //     $scope.sections = sectionList;;
        // }
        // }
        function prepareMap() {
            var resultList = [];
            for (var idx in $scope.sectionList) {
                var item = $scope.sectionList[idx];
                sectionMap[item.id] = item;
            }
        }

        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.getEncounter
            });
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if (!$scope.currentcontext.eid) $scope.getEncounter();
            else $scope.getCurrentConsultation();
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

        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }


        //get consultation
        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            // $scope.getSectionMasterList();
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
            } else {
                $scope.getIPCaseSheetId();
            }
        };

        $scope.getIPCaseSheetIdCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.cncontext.consultationid = res.Data[0].Id;
                $scope.getCurrentConsultation();
            } else {
                $scope.CreateIPCaseSheetProfileEntry();
            }
        };

        $scope.getIPCaseSheetId = function () {
            var inputData = {
                Params: [
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
                onComplete: $scope.getIPCaseSheetIdCallback
            };

            utl.Http.doAction(options);
        };

        $scope.CreateIPCaseSheetProfileEntry = function () {
            var vName = "IP Case Sheet";
            var actionName = 'emr/consultation/AddConsultation';
            var profileObj = utl.Lookup.getObjectByText($scope.lookup.Profile, vName);
            $scope.item = {
                ConsultationDate: new Date(),
                EncounterDoctorId: utl.Session.getCurrentUserId(),
                EncounterId: $scope.currentcontext.eid,
                Name: vName,
                PatientId: $scope.currentcontext.pid,
                ProfileId: profileObj.Id,
                ProgressNoteStatusId: 1,
                VisitTypeId: null
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.IPCaseSheetProfileEntryCallback
            };
            utl.Http.doAction(options);
        };

        $scope.IPCaseSheetProfileEntryCallback = function (scope, res, options, hasError) {
            if (res === false) {
                $scope.cncontext.consultationid = options.data.Data.Id;
            } else {
                $scope.cncontext.consultationid = res;
            }
            if ($scope.cncontext.consultationid > 0) {
                $scope.getCurrentConsultation();
                // $scope.getSectionMasterList();
            }
        };
        $scope.getSectionMasterList();
    }



})();