(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipCaseSheetSummaryListController', ipCaseSheetSummaryListController);

    function ipCaseSheetSummaryListController($rootScope, $scope, $sce, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.gridData = [];
        // $scope.currentfilter = {
        //     ProgressNoteStatusId: -1,
        //     encounter: utl.Session.getPatientEncounter(),
        //     fromdate: '',
        //     todate: utl.Formatter.getCurrentDate(),
        // };
        $scope.cncontext = {
            tabstop: [],
            tabsright: [],
            currenttmpl: '',
            consultationid: 0,
            canshowuserpref: false
        };
        $scope.sectionMap = {
            'emr.cn.question': { tmpl: 'cn-question-section.html', fn: getCategorySectionEntrys },
        };
        $scope.sectionData = {};
        $scope.sectionDatas = [];
        $scope.currentcontext = {};
        $scope.currentcontext.cid = $stateParams.cid;
        $scope.currentcontext.sectionid = $stateParams.sid;
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

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
                        consultationid: $scope.currentcontext.cid,
                    }
                },
                sectionName: sectionName,
                sectionId: sectionId,
                type: 'post',
                onComplete: getCategorySectionEntrysCallback
            };

            utl.Http.doAction(options);
        };
        //Get Section Data starts
        function computeAnswers(data, displayOrderMap, sectionId, sectionName) {
            var ipsciddata = [];
            var questionSectionData = { sectionName: sectionName, cat: [] }
            var categoryGrouped = groupByMulti(data, ['CategoryKey', 'IPCasesheetId']);
            console.log(categoryGrouped);
            var idxipcsid = 0;
            for (var catKey in categoryGrouped) {
                for (var ipcsid in categoryGrouped[catKey]) {
                    idxipcsid = ipcsid;
                    var cat = { CreatedAt: null, Date: '', Time: '', CreatedBy: {}, DoctorName: {}, CategoryName: {}, concepts: [], IPCasesheetId: 0, sectionName: '' };
                    var ipCaseSheetData = categoryGrouped[catKey];
                    var concepts = ipCaseSheetData[ipcsid];
                    cat.CategoryName = concepts[0].Category.CategoryName;
                    var categoryId = concepts[0].Category.Id;
                    cat.CreatedBy = concepts[0].CreatedUser.Title.Description + ' ' + concepts[0].CreatedUser.FirstName + ' ' + concepts[0].CreatedUser.LastName;
                    cat.DisplayOrder = displayOrderMap[categoryId];
                    cat.sectionName = questionSectionData.sectionName;
                    cat.DoctorName = concepts[0].Encounter.DoctorName;
                    var dateat = '';
                    var timeat = ''; var createdat = null;
                    for (var idx in concepts) {
                        var concept = concepts[idx];
                        console.log(concept);
                        createdat = concept.IPCasesheetAt;
                        dateat = utl.Formatter.getDateString(concept.IPCasesheetAt);
                        timeat = utl.Formatter.getTimeString24Hour(concept.IPCasesheetAt);
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
                                result = concept.ResultValue == 1 ? 'Yes' : 'No';
                                var item = {
                                    ConceptName: concept.Concept.ConceptName, Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                                break;
                            case 5: //boolean
                                result = concept.ResultValue == 1 ? true : false;
                                var item = {
                                    ConceptName: concept.Concept.ConceptName, Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                                break;
                            case 6: //date
                                result = concept.ResultValue ? utl.Formatter.getDateTimeString(concept.ResultValue) : "";
                                var item = {
                                    ConceptName: concept.Concept.ConceptName, Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
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
                                result = concept.ResultValue ? concept.ResultValue : "";
                                var item = {
                                    ConceptName: concept.Concept.ConceptName, Result: result,
                                    ValueTypeId: concept.Concept.ValueTypeId
                                };
                                cat.concepts.push(item);
                        }
                    }
                    cat.CreatedAt = createdat;
                    if (!ipsciddata[idxipcsid]) {
                        ipsciddata[idxipcsid] = idxipcsid;
                        cat.Date = dateat;
                        cat.Time = timeat;
                        try {
                            cat.IPCasesheetId = parseInt(idxipcsid);
                        } catch (ex) { cat.IPCasesheetId = 0; }
                    }
                    questionSectionData.cat.push(cat);
                    questionSectionData.cat = _.orderBy(questionSectionData.cat, ['DisplayOrder']);
                    $scope.sectionData[sectionId] = questionSectionData;
                    if (cat.Date != '') {
                        vm.gridConfig.data.push(cat);
                    }
                    // vm.gridConfig.data.push(cat);
                    // vm.gridConfig.data = $scope.sectionData[sectionId].cat;
                    console.log($scope.sectionData[sectionId]);
                }
            }
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
        var groupByMulti = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupByMulti(byFirst[prop], rest, context);
            }
            return byFirst;
        };
        function computeSectionList() {
            var profile = $scope.item.ProfileMaster;
            if (profile && profile.ProfileSections) {
                var sections = [];

                for (var idx in profile.ProfileSections) {
                    var profileSection = profile.ProfileSections[idx];
                    if (profileSection.SectionMaster) {
                        if ($scope.currentcontext.sectionid == profileSection.SectionMaster.Id) {
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
                }

                sections = _.sortBy(sections, ['DisplayOrder']);
                $scope.currentcontext.sections = sections;
                //console.log($scope.sectionData);
            }
        }
        $scope.backToList = function () {
            $state.go('patientemr.ipcasesheetsummary')
        }
        //Grid Actions
        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'view') {
                utl.Modal.open('patientemr.questionForm', {
                    params: {
                        id: 0, pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid,
                        cid: $scope.currentcontext.cid,
                        sid: $scope.currentcontext.sectionid,
                        stid: 2,
                        IPCasesheetId: row.entity.IPCasesheetId,
                    },
                    confirmCallback: $scope.getCurrentConsultation
                });
                // $state.go('patientemr.ipcasesheetsummary', { id: row.entity.Id });
            } else if (actionType == 'print') {
                var item = row.entity;
                $scope.printIndIPCasesheet(item);
            }
        }
        $scope.printIndIPCasesheet = function (item) {
            var inputData = {
                Id: $scope.currentcontext.cid,
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid,
                    Sectionid: $scope.currentcontext.sectionid,
                    stid: 2,
                    IPCasesheetId: item.IPCasesheetId
                }
            };
            var options = {
                action: 'emr/consultation/PrintIndIPCasesheet',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        vm.gridConfig = {
            columnDefs: [

                { field: "Id", name: 'CaseSheet Details', cellTemplate: 'ipcasesheetListTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'EncounterDoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.EncounterDoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.currentfilter.DoctorName = result;

            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.EncounterDoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        //get consultation
        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.eid = data.EncounterId;
            computeSectionList();
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
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getCurrentConsultation();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ProgressNoteStatus" }
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

    ipCaseSheetSummaryListController.$inject = ['$rootScope', '$scope', '$sce', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();