(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('questionFormController', questionFormController);

    function questionFormController($scope, $stateParams, $state, $translate, utl, uibButtonConfig, $uibModalInstance, modalConfig) {
        var vm = this;
        uibButtonConfig.activeClass = "btn-primary";

        $scope.currentfilter = {};

        $scope.currentfilter.DateTime = new Date();

        $scope.currentcontext = {
            selectedcptvalue: null,
            selectedicdvalue: null
        };

        $scope.modeldata = {};

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());


        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;
            $scope.currentcontext.sectionid = modalConfig.params.sid ? parseInt(modalConfig.params.sid) : null;
            $scope.currentcontext.sectiontypeid = modalConfig.params.stid ? parseInt(modalConfig.params.stid) : null;
            $scope.IPCasesheetId = modalConfig.params.IPCasesheetId ? parseInt(modalConfig.params.IPCasesheetId) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;

        } else {
            $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
            $scope.currentcontext.sectionid = $scope.$parent.cncontext.currentsection.sectionid;
            $scope.currentcontext.sectiontypeid = $scope.$parent.cncontext.currentsection.sectiontypeid;
        }


        $scope.conceptControlTypeMap = {
            freetext: 'text',
            numeric: 'text',
            'termbased-single': 'termbased-single',
            'termbased-multi': 'termbased-multi',
            boolean: 'boolean',
            checkbox: 'checkbox',
            date: 'date',
            email: 'email',
            notes: 'textarea',
            cpt: 'cpt',
            icd: 'icd',
            rating: 'rating',
            slider: 'text',
            ckeditor: 'ckeditor'
        };

        var sectionTypeCategoryTypeMap = {
            3: 'HPI',
            4: 'ROS',
            5: 'PE'
        };

        $scope.backTohome = function () {
            $scope.confirmCallback();
        }

        $scope.openCommentsModal = function (item) {
            utl.Modal.open('app.questioncomments', {
                params: { modelkey: item.model, comments: $scope.modeldata[item.model].Comments }, confirmCallback: commentsPopupCallback
            });
        }

        function commentsPopupCallback(item) {
            $scope.modeldata[item.modelkey].Comments = item.comments;
        }

        //Save entries
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItem = function () {

            var currdt = $scope.currentfilter.DateTime;
            var inputArr = [];
            for (var idx in $scope.currentcontext.categories) {
                var item = $scope.currentcontext.categories[idx];
                for (var jdx in item.Concepts) {
                    var concept = item.Concepts[jdx];

                    if (concept.ValueTypeId == 3 && concept.IsMultiple == true) {
                        for (var idx in concept.Terms) {
                            var term = concept.Terms[idx];
                            var ans = {
                                Id: 0,
                                IPCasesheetAt: currdt,
                                EncounterId: $scope.currentcontext.eid, ConsultationId: $scope.currentcontext.cid,
                                PatientId: $scope.currentcontext.pid, SectionId: $scope.currentcontext.sectionid,
                                CategoryKey: concept.CategoryIdentifier, ConceptKey: concept.ConceptIdentifier,
                                ResultValue: $scope.modeldata[term.model].resultvalue == true ? 1 : 0,
                                TermKey: term.Code,
                                TermName: term.TermName,
                                Comments: $scope.modeldata[term.model].Comments
                            };
                            if ($scope.modeldata[term.model].trans &&
                                $scope.modeldata[term.model].trans.Id) {
                                ans.Id = $scope.modeldata[term.model].trans.Id;
                            }

                            inputArr.push(ans);
                        }
                    } else if (concept.ValueTypeId == 9 || concept.ValueTypeId == 10) {
                        var ans = {
                            Id: 0,
                            IPCasesheetAt: currdt,
                            EncounterId: $scope.currentcontext.eid, ConsultationId: $scope.currentcontext.cid,
                            PatientId: $scope.currentcontext.pid, SectionId: $scope.currentcontext.sectionid,
                            CategoryKey: concept.CategoryIdentifier, ConceptKey: concept.ConceptIdentifier,
                            ResultValueJSON: JSON.stringify($scope.modeldata[concept.model].resultvaluejson),
                            Comments: $scope.modeldata[concept.model].Comments
                        };
                        if ($scope.modeldata[concept.model].trans &&
                            $scope.modeldata[concept.model].trans.Id) {
                            ans.Id = $scope.modeldata[concept.model].trans.Id;
                        }

                        inputArr.push(ans);
                    } else if(concept.ValueTypeId == 12) {

                        var ans = {
                            Id: 0,
                            IPCasesheetAt: currdt,
                            EncounterId: $scope.currentcontext.eid, ConsultationId: $scope.currentcontext.cid,
                            PatientId: $scope.currentcontext.pid, SectionId: $scope.currentcontext.sectionid,
                            CategoryKey: concept.CategoryIdentifier, ConceptKey: concept.ConceptIdentifier,
                            ResultValueRichText: $scope.modeldata[concept.model].resultvaluerichtext,
                            Comments: $scope.modeldata[concept.model].Comments
                        };
                        if ($scope.modeldata[concept.model].trans &&
                            $scope.modeldata[concept.model].trans.Id) {
                            ans.Id = $scope.modeldata[concept.model].trans.Id;
                        }

                        inputArr.push(ans);
                    } else if(concept.ValueTypeId == 8) { // notes

                        var strValue = $scope.modeldata[concept.model].resultvaluerichtext ?
                                    $scope.modeldata[concept.model].resultvaluerichtext.replace(/\r?\n/g, '<br />') : '';
                        var ans = {
                            Id: 0,
                            IPCasesheetAt: currdt,
                            EncounterId: $scope.currentcontext.eid, ConsultationId: $scope.currentcontext.cid,
                            PatientId: $scope.currentcontext.pid, SectionId: $scope.currentcontext.sectionid,
                            CategoryKey: concept.CategoryIdentifier, ConceptKey: concept.ConceptIdentifier,
                            ResultValueRichText: strValue,
                            Comments: $scope.modeldata[concept.model].Comments
                        };
                        if ($scope.modeldata[concept.model].trans &&
                            $scope.modeldata[concept.model].trans.Id) {
                            ans.Id = $scope.modeldata[concept.model].trans.Id;
                        }

                        inputArr.push(ans);
                    }  else {
                        var ans = {
                            Id: 0,
                            IPCasesheetAt: currdt,
                            EncounterId: $scope.currentcontext.eid, ConsultationId: $scope.currentcontext.cid,
                            PatientId: $scope.currentcontext.pid, SectionId: $scope.currentcontext.sectionid,
                            CategoryKey: concept.CategoryIdentifier, ConceptKey: concept.ConceptIdentifier,
                            ResultValue: $scope.modeldata[concept.model].resultvalue,
                            Comments: $scope.modeldata[concept.model].Comments
                        };
                        if ($scope.modeldata[concept.model].trans &&
                            $scope.modeldata[concept.model].trans.Id) {
                            ans.Id = $scope.modeldata[concept.model].trans.Id;
                        }

                        inputArr.push(ans);
                    }
                }
            }
            console.log(inputArr);

            var actionName = 'emr/CategorySectionEntry/ManageCategorySectionEntries';
            var inputData = { details: inputArr };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }

        //get entries
        function applyAnswers(data) {
            for (var idx in data) {
                try {
                    var item = data[idx];
                    var modelKey = item.CategoryKey + "." + item.ConceptKey;
                    if (!$scope.modeldata[modelKey] && item.TermKey) {
                        modelKey = modelKey + '.' + item.TermKey;
                        $scope.modeldata[modelKey].trans = item;
                        $scope.modeldata[modelKey].resultvalue = item.ResultValue == 1 ? true : false;
                    }
                    else if ($scope.modeldata[modelKey]) {
                        $scope.modeldata[modelKey].trans = item;
                        if ($scope.modeldata[modelKey].master.ValueTypeId == 5) {
                            $scope.modeldata[modelKey].resultvalue = item.ResultValue == 1 ? true : false;
                        } else {
                            $scope.modeldata[modelKey].resultvalue = item.ResultValue;
                            $scope.modeldata[modelKey].Comments = item.Comments;
                        }
                        if ($scope.modeldata[modelKey].master.ValueTypeId == 9 || $scope.modeldata[modelKey].master.ValueTypeId == 10) {
                            $scope.modeldata[modelKey].resultvaluejson = JSON.parse(item.ResultValueJSON);
                        } else {
                            $scope.modeldata[modelKey].resultvaluejson = [];
                        }

                        if($scope.modeldata[modelKey].master.ValueTypeId == 12) {

                            $scope.modeldata[modelKey].resultvaluerichtext = item.ResultValueRichText;
                        }
                        if($scope.modeldata[modelKey].master.ValueTypeId == 8) {
                            var strText = item.ResultValueRichText ? item.ResultValueRichText.replace(/<Br\s*[\/]?>/gi, "\n") : '';
                            $scope.modeldata[modelKey].resultvaluerichtext = strText;
                        }
                    }
                } catch (ex) { }
            }
        }

        $scope.getCategorySectionEntrysCallback = function (scope, res, options, hasError) {
            applyAnswers(res.Data);
        };

        $scope.getCategorySectionEntrys = function () {
            if ($scope.IPCasesheetId) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentcontext.sectionid },
                        { Key: 3, Value: $scope.currentcontext.cid },
                        { Key: 4, Value: $scope.IPCasesheetId }
                    ],
                    PageContext: {
                        PageSize: 500,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'emr/CategorySectionEntry/GetCategorySectionEntrys',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getCategorySectionEntrysCallback
                };

                utl.Http.doAction(options);
            }
        };

        //Compute categories
        function computeCategories() {
            $scope.modeldata = {};

            var sectionCatMaps = $scope.currentcontext.section.SectionCategoryMaps;
            var categoryList = [];
            for (var idx in sectionCatMaps) {
                var item = sectionCatMaps[idx];
                if (item.Category && item.Category.Concepts && item.Category.Concepts.length > 0) {
                    var category = computeCategory(item.Category);
                    categoryList.push(category);
                }
            }
            $scope.currentcontext.categories = categoryList;
        }

        function computeCategory(cat) {
            cat.Concepts = _.sortBy(cat.Concepts, ['DisplayOrder']);
            for (var jdx in cat.Concepts) {
                try {
                    var concept = cat.Concepts[jdx];
                    var strValueType = concept.ValueType.ReferenceValueCode.toLowerCase();
                    var controlType = $scope.conceptControlTypeMap[strValueType];
                    concept.tmpl = 'qn-' + controlType + '.html';
                    if (concept.ValueTypeId == 3 && concept.IsMultiple == false) {
                        concept.tmpl = 'qn-termbased-single.html';
                    }
                    if (concept.ValueTypeId == 3 && concept.IsMultiple == true) {
                        concept.tmpl = 'qn-termbased-multiple.html';
                    }

                    var modelKey = cat.CategoryIdentifier + "." + concept.ConceptIdentifier;
                    concept.model = modelKey;
                    concept.CategoryIdentifier = cat.CategoryIdentifier;

                    if (concept.Terms && concept.Terms.length > 0) {
                        concept.Terms = _.sortBy(concept.Terms, ['DisplayOrder']);
                    }
                    if (concept.ValueTypeId == 3 && concept.IsMultiple == true) {
                        for (var jdx in concept.Terms) {
                            var term = concept.Terms[jdx];
                            modelKey = concept.model + '.' + term.Code;
                            term.model = modelKey;
                            $scope.modeldata[modelKey] = { master: concept, term: term, trans: {}, resultvalue: '' };
                        }
                    } else {
                        $scope.modeldata[modelKey] = { master: concept, trans: {}, resultvalue: '', attr: {} };
                    }
                    if (concept.ValueTypeId == 11) {
                        var attr = concept.Attributes ? JSON.parse(concept.Attributes) : { Min: 0, Max: 10, Step: 1 };
                        $scope.modeldata[modelKey].attr = { Min: attr.Min, Max: attr.Max, Step: attr.Step };
                    }
                } catch (ex) { }
            }
            return cat;
        }

        //get section
        $scope.getSectionCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.section = data;
            computeCategories();
            $scope.getCategorySectionEntrys();
        };

        $scope.getSection = function (pageNo) {
            if ($scope.currentcontext.sectionid && $scope.currentcontext.sectionid > 0) {

                var options = {
                    action: 'clinicalmaster/SectionMaster/GetSectionMasterById',
                    data: { Id: $scope.currentcontext.sectionid },
                    type: 'post',
                    onComplete: $scope.getSectionCallback
                };
                utl.Http.doAction(options);
            }
        };


        //get section
        $scope.getCategoriesCallback = function (scope, res, options, hasError) {
            var categories = res.Data;
            $scope.modeldata = {};
            $scope.booleanValues = [{ Id: 1, Text: 'Yes' }, { Id: 2, Text: 'No' }];

            var categoryList = [];
            for (var idx in categories) {
                var item = categories[idx];
                if (item && item.Concepts && item.Concepts.length > 0) {
                    var category = computeCategory(item);
                    categoryList.push(category);
                }
            }
            $scope.currentcontext.categories = categoryList;

            $scope.getCategorySectionEntrys();
        };

        $scope.getCategories = function (pageNo) {
            if ($scope.currentcontext.sectionid && $scope.currentcontext.sectionid > 0) {

                var inputData = {
                    consultationid: $scope.currentcontext.cid,
                    categorytype: sectionTypeCategoryTypeMap[$scope.currentcontext.sectiontypeid]
                };

                var options = {
                    action: 'clinicalmaster/category/GetCategoriesByType',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getCategoriesCallback
                };
                utl.Http.doAction(options);
            }
        };

        /* CPT related code starts */
        //autosearch starts

        vm.procedureconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'ProcedureName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/procedure/GetProcedures',
            formatdisplay: formatselectedcpt,
            presearch: presearchcpt,
            postsearch: postsearchcpt
        };

        function presearchcpt() {
            var query = vm.procedureconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.procedureconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }
            vm.procedureconfig.searchparams = inputData;
        }

        function postsearchcpt() {
        }

        function formatselectedcpt() {

        }

        $scope.procedureChange = function (concept) {
            var item = {};
            var selectedicd = concept.selectedcptvalue;
            var isExist = _.find($scope.modeldata[concept.model].resultvaluejson, { 'ProcedureId': selectedicd.Id });
            if (!isExist) {
                if (selectedicd) {
                    item = {
                        ProcedureId: selectedicd.Id,
                        ProcedureName: selectedicd.ProcedureName
                    };
                }
                $scope.modeldata[concept.model].resultvaluejson = $scope.modeldata[concept.model].resultvaluejson || [];
                $scope.modeldata[concept.model].resultvaluejson.push(item);
            }
        }

        $scope.removeProcedure = function (concept, ProcedureId) {
            $scope.modeldata[concept].resultvaluejson = _.remove($scope.modeldata[concept].resultvaluejson, function (currentObject) {
                return currentObject.ProcedureId !== ProcedureId;
            });
        }

        /* CPT related code ends */

        /* ICD related code starts */
        //autosearch starts

        vm.diagnosisconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'DiagnosisName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/diagnosis/GetDiagnosiss',
            formatdisplay: formatselectedicd,
            presearch: presearchicd,
            postsearch: postsearchicd
        };

        function presearchicd() {
            var query = vm.diagnosisconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.diagnosisconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }
            vm.diagnosisconfig.searchparams = inputData;
        }

        function postsearchicd() {
        }

        function formatselectedicd() {

        }

        $scope.diagnosisChange = function (concept) {
            var item = {};
            var selectedicd = concept.selectedicdvalue;
            var isExist = _.find($scope.modeldata[concept.model].resultvaluejson, { 'DiagnosisId': selectedicd.Id });
            if (!isExist) {
                if (selectedicd) {
                    item = {
                        DiagnosisId: selectedicd.Id,
                        DiagnosisName: selectedicd.DiagnosisName
                    };
                }
                $scope.modeldata[concept.model].resultvaluejson = $scope.modeldata[concept.model].resultvaluejson || [];
                $scope.modeldata[concept.model].resultvaluejson.push(item);
            }
        }

        $scope.removeDiagnosis = function (concept, DiagnosisId) {
            $scope.modeldata[concept].resultvaluejson = _.remove($scope.modeldata[concept].resultvaluejson, function (currentObject) {
                return currentObject.DiagnosisId !== DiagnosisId;
            });
        }

        /* ICD related code ends */

        //ckeditor function  starts
        $scope.openRichTextEditor = function (concept) {
            $scope.currentcontext.currentrichtexteditor = concept;
            utl.Modal.open('richtexteditor-modal', {
                params: { richtext: $scope.modeldata[concept].resultvaluerichtext, notetypeid: 12 },
                confirmCallback: $scope.richtexteditorCallback
            });
        }

        $scope.richtexteditorCallback = function (richtext) {
            if ($scope.currentcontext.currentrichtexteditor && richtext) {
                var concept = $scope.currentcontext.currentrichtexteditor;
                $scope.modeldata[concept].resultvaluerichtext = richtext.editortext;
                $scope.currentcontext.currentrichtexteditor = '';
            }
        }
        //ckeditor function ends

        function loadData() {
            if ($scope.currentcontext.sectiontypeid == 2) { //question
                $scope.getSection();
            } else if ($scope.currentcontext.sectiontypeid == 3 || $scope.currentcontext.sectiontypeid == 4 ||
                $scope.currentcontext.sectiontypeid == 5) { //HPI, ROS, PE
                $scope.getCategories();
            }
        }

        //default items for boolean
        $scope.booleanValues = [{ Id: 0, Text: 'No' }, { Id: 1, Text: 'Yes' }];

        loadData();
    }

    questionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig', '$uibModalInstance', 'modalConfig'];

})();