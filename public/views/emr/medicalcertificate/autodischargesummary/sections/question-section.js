(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('disQuestionSectionController', disQuestionSectionController);

    function disQuestionSectionController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.sectionData = {};
        $scope.item = {};

        var SRef = 'emr.cn.question';

        $scope.currentfilter = {
            PatientAllergyStatusId: 1
        };

        $scope.currentcontext = {
            paneltype: utl.Session.get('dashboard-panel-type'),
            recordcount: utl.Session.getPatientDashboardRecordCount(),
            sectionList: utl.Session.getObject('dischargesummary-panel-heading')
        };

        for (var idx in $scope.currentcontext.sectionList) {
            if ($scope.currentcontext.sectionList[idx].SRef == SRef
               && $scope.currentcontext.sectionList[idx].printed == 0) {
                $scope.currentcontext.sectionList[idx].printed = 1;
                utl.Session.setObject('dischargesummary-panel-heading', $scope.currentcontext.sectionList);
                $scope.panelId = $scope.currentcontext.sectionList[idx].id;
                $scope.item.sectionid = $scope.currentcontext.sectionList[idx].id;
                $scope.panelheading = $scope.currentcontext.sectionList[idx].text;
                $scope.SectionTypeId = $scope.currentcontext.sectionList[idx].SectionTypeId;
                break;
            }
        }

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt($stateParams.eid);


        $scope.handleEvents = function (actionType, item) {
            if (actionType == "add") {
                utl.Modal.open('patientemr.questionForm', {
                    params: { id: 0, pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid,
                     sid: $scope.panelId, stid: $scope.SectionTypeId  },
                    confirmCallback: $scope.getList
                });
            }
        }

        $scope.getList = function () {
            var inputData = {
                Params :[
                    { Key: 2, Value: $scope.panelId }
                ],
                PageContext:{
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/CategorySectionEntry/GetCategorySectionEntrys',
                data: inputData,
                sectionName: $scope.panelheading,
                sectionId : $scope.panelId,
                type: 'post',
                onComplete: getCategorySectionEntrysCallback
            };

            utl.Http.doAction(options);
        };

        function getCategorySectionEntrysCallback(scope, res, options, hasError) {
            computeAnswers(res.Data, options.sectionId, options.sectionName);
        }

        function processTermBasedMulti(concept, categoryToAdd) {
            var item = null;
            for(var idx in categoryToAdd.concepts) {
                var existingConcept = categoryToAdd.concepts[idx];
                if(existingConcept.ConceptName == concept.Concept.ConceptName) {
                    item = existingConcept;
                    break;
                }
            }
            if(!item) {
                item = { ConceptName : concept.Concept.ConceptName,
                    ValueTypeId : concept.Concept.ValueTypeId, IsMultiple : concept.Concept.IsMultiple,
                    Terms : [] };
                categoryToAdd.concepts.push(item);
            }
            if(concept.ResultValue == 1) {
                item.Terms.push({ TermName : concept.TermName});
            }
        }

        function computeAnswers(data, sectionId, sectionName) {
            var questionSectionData = { sectionName: sectionName, cat: [] }
            var categoryGrouped = _.groupBy(data, 'CategoryKey');
            console.log(categoryGrouped);
            for(var catKey in categoryGrouped) {
                var cat = { CategoryName : {}, concepts : []};
                var concepts = categoryGrouped[catKey];
                cat.CategoryName = concepts[0].Category.CategoryName;
                for(var idx in concepts) {
                    var concept = concepts[idx];
                    var result = '';
                    switch(concept.Concept.ValueTypeId) {
                        case 3: //Term
                            if(concept.Concept.IsMultiple == false && concept.ResultValue) {
                                result = concept.ResultValue;
                                var item = { ConceptName : concept.Concept.ConceptName, Result: result,
                                                         ValueTypeId : concept.Concept.ValueTypeId, IsMultiple : concept.Concept.IsMultiple };
                                cat.concepts.push(item);
                            } else if(concept.Concept.IsMultiple == true) {
                                processTermBasedMulti(concept, cat);
                            }
                            break;
                        case 4: //boolean
                            result = concept.ResultValue == 1? 'Yes': 'No';
                            var item = { ConceptName : concept.Concept.ConceptName, Result: result,
                                                ValueTypeId : concept.Concept.ValueTypeId };
                            cat.concepts.push(item);
                            break;
                        case 5: //boolean
                            result = concept.ResultValue == 1? true: false;
                            var item = { ConceptName : concept.Concept.ConceptName, Result: result,
                                            ValueTypeId : concept.Concept.ValueTypeId };
                            cat.concepts.push(item);
                            break;
                        case 6: //date
                            result = concept.ResultValue ? utl.Formatter.getDateTimeString(concept.ResultValue) : "";
                            var item = { ConceptName : concept.Concept.ConceptName, Result: result,
                                                ValueTypeId : concept.Concept.ValueTypeId };
                            cat.concepts.push(item);
                            break;
                        default:
                            result = concept.ResultValue ? concept.ResultValue : "";
                            var item = { ConceptName : concept.Concept.ConceptName, Result: result,
                                                ValueTypeId : concept.Concept.ValueTypeId };
                            cat.concepts.push(item);
                    }
                }
                questionSectionData.cat.push(cat);
            }
            $scope.sectionData[sectionId] = questionSectionData;
            console.log($scope.sectionData[sectionId]);
        }


        $scope.getList();
    }

    disQuestionSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();