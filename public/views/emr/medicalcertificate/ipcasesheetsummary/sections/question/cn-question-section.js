(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipcsQuestionSectionController', ipcsQuestionSectionController);
    function ipcsQuestionSectionController($rootScope, $scope, $sce, $stateParams, $state, $translate, $filter, utl, modalConfig, uibButtonConfig, $timeout) {
        var vm = this;

        var encounterinfo = utl.Session.getPatientEncounter();
        var Admissiondate = utl.Formatter.getDate(encounterinfo.AdmissionDate) || null;

        $scope.currentcontext = {
            recordcount: 5,
            view: 'listview',
        };
        $scope.gridData = [];
        $scope.cncontext = {
            tabstop: [],
            tabsright: [],
            currenttmpl: '',
            consultationid: 0,
            canshowuserpref: false
        };
        $scope.dateFormat = $rootScope.datePickerOptions.dateFormat;
        $scope.placeholder = $rootScope.datePickerOptions.placeholder;

        $scope.sectionData = {};
        $scope.sectionDatas = [];

        $scope.currentfilter = {};
        $scope.currentfilter.FromDate = Admissiondate;
        $scope.currentfilter.ToDate = utl.Formatter.getCurrentDate();

        $scope.sectionMap = {
            'emr.cn.question': { tmpl: 'cn-question-section.html', fn: getCategorySectionEntrys },
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.ismodal = true;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
            $scope.currentcontext.sectionid = $scope.$parent.cncontext.currentsection.sectionid;
            $scope.currentcontext.sectiontypeid = $scope.$parent.cncontext.currentsection.sectiontypeid;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.switchTopTab = function (tab) {
            $scope.cncontext.currentsection = tab;
        }
        $scope.listView = function () {
            $scope.currentcontext.view = 'listview';
            $scope.getCurrentConsultation();
            return;
        }
        $scope.tableview = function () {
            $scope.currentcontext.view = 'tableview';
        }
        $scope.handleEvents = function (actionType, item, index, row) {
            if (actionType == "add") {
                utl.Modal.open('patientemr.questionForm', {
                    params: {
                        id: 0, pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid,
                        cid: $scope.currentcontext.cid,
                        sid: $scope.currentcontext.sectionid,
                        stid: 2,
                        IPCasesheetId: 0
                    },
                    confirmCallback: $scope.getCurrentConsultation
                });
            } else if (actionType == "addlist") {
                utl.Modal.open('patientemr.questionForm', {
                    params: {
                        id: 0, pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid,
                        cid: $scope.currentcontext.cid,
                        sid: $scope.currentcontext.sectionid,
                        stid: 2,
                        IPCasesheetId: 0
                    },
                    confirmCallback: $scope.getCurrentConsultation
                });
            } else if (actionType == "edit") {
                utl.Modal.open('patientemr.questionForm', {
                    params: {
                        id: 0, pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid,
                        cid: $scope.currentcontext.cid,
                        sid: $scope.currentcontext.sectionid,
                        stid: 2,
                        IPCasesheetId: item.IPCasesheetId,
                    },
                    confirmCallback: $scope.getCurrentConsultation
                });
            } if (actionType == "view") {
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
            } else if (actionType == "print") {
                $scope.printIndIPCasesheet(item);
            }
            else if (actionType == "delete") {
                var IPCasesheetId_ = -1;
                if (item && item.IPCasesheetId) IPCasesheetId_ = item.IPCasesheetId;
                else if (row.entity.IPCasesheetId)
                    IPCasesheetId_ = row.entity.IPCasesheetId;
                if (IPCasesheetId_) {
                    utl.Dialog.confirmDelete($scope.onDeleteConfirm, IPCasesheetId_, null);
                }
            }
            else if (actionType == "printlist") {
                var item = row.entity;
                $scope.printIndIPCasesheet(item);
            }
        }

        $scope.onDeleteConfirm = function (IPCasesheetId_) {
            var options = {
                action: 'emr/CategorySectionEntry/DeleteCategorySectionEntryGroup',
                data: {
                    Data: {
                        sectionid: $scope.currentcontext.sectionid,
                        consultationid: $scope.currentcontext.cid,
                        ipcasesheetid: IPCasesheetId_,
                    }
                },
                type: 'post',
                onComplete: $scope.getCurrentConsultation
            }
            utl.Http.doAction(options);
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
        $scope.backToList = function () {
            $scope.tableview();
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

        //Get Section Data starts
        function computeAnswers(data, displayOrderMap, sectionId, sectionName) {
            var ipsciddata = [];
            var questionSectionData = { sectionName: sectionName, cat: [] }
            var categoryGrouped = groupByMulti(data, ['CategoryKey', 'IPCasesheetId']);
            console.log(categoryGrouped);
            var idxipcsid = 0;
            $scope.gridData = [];
            $scope.sectionData[sectionId] = null;
            vm.gridConfig.data = [];
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
                    cat.CreatedAt = createdat;
                    cat.Date = dateat;
                    // cat.Time = timeat;
                    // cat.IPCasesheetId = parseInt(idxipcsid);
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

                    if (finalConcepts && finalConcepts.length > 0 && !ipsciddata[idxipcsid]) {
                        ipsciddata[idxipcsid] = idxipcsid;
                        cat.Date = dateat;
                        cat.Time = timeat;
                        try {
                            cat.IPCasesheetId = parseInt(idxipcsid);
                        } catch (ex) { cat.IPCasesheetId = 0; }
                    }

                    if (cat && cat.concepts && cat.concepts.length > 0) {
                        questionSectionData.cat.push(cat);
                    }
                    questionSectionData.cat = _.orderBy(questionSectionData.cat, ['DisplayOrder']);
                    $scope.sectionData[sectionId] = questionSectionData;
                    if ($scope.currentcontext.view == "listview") {
                        if (cat.Date != '') {
                            if (questionSectionData.cat.length > $scope.gridData.length) {
                                $scope.gridData.push(cat);
                            }
                        }
                    }
                    vm.gridConfig.data = $scope.gridData;
                    vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
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
            var fromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');
            var options = {
                action: 'emr/CategorySectionEntry/GetCategorySectionEntrysForReview',
                data: {
                    Data: {
                        sectionid: sectionId,
                        consultationid: $scope.currentcontext.cid,
                        ipcasesheetat: [fromDate, toDate]
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
        function computeTabs() {
            var tabstop = [];
            var tabsright = [];
            for (var idx in $scope.sectionList) {
                var profileSection = $scope.sectionList[idx];
                if (profileSection) {
                    profileSection.SRef = profileSection.SRef || 'emr.cn.question';
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

            tabstop = _.sortBy(tabstop, ['DisplayOrder']);
            $scope.cncontext.tabstop = tabstop;

            //Load first tab item template by default
            $scope.switchTopTab($scope.cncontext.tabstop[0]);

        }
        $scope.getSectionMasterListCallback = function (scope, res, options, hasError) {
            $scope.sectionList = res.Data;
            computeTabs();
        };
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
        $scope.printIPCasesheet = function () {
            var inputData = {
                Id: $scope.currentcontext.cid,
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid,
                    Sectionid: $scope.currentcontext.sectionid,
                    stid: 2,
                    IPCasesheetId: 0
                }
            };
            var options = {
                action: 'emr/consultation/PrintIPCasesheet',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        vm.gridConfig = {
            columnDefs: [
                // { field: "Date", displayName: $translate.instant('patientemr.patientvital-list.vital.lbl') },
                { field: "Id", name: 'CaseSheet Details', cellTemplate: 'ipcasesheetListTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        //get consultation
        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.eid = data.EncounterId;
            computeSectionList();
            $scope.getSectionMasterList();
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
        // computeTabs();
    }
    ipcsQuestionSectionController.$inject = ['$rootScope', '$scope', '$sce', '$stateParams', '$state', '$translate', '$filter', 'utl', 'modalConfig', 'uibButtonConfig', '$timeout'];

})();