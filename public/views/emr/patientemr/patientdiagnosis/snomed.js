(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('diagnosisSNOMEDController', diagnosisSNOMEDController);

    function diagnosisSNOMEDController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = {};
        $scope.SelectedConcept = '';
        $scope.MainConceptData = {};
        $scope.Concepts = [];
        $scope.MainConcept = [];
        $scope.ParentConcept = [];
        $scope.ChildConcept = [];
        $scope.BlockScreen = false;

        $scope.currentcontext ={};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        $scope.getSNOMED = function () {
            $scope.Concepts = [];
            if ($scope.item.Description) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.item.Description },
                    ],
                    PageContext: {
                        PageSize: 100000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'clinicalmaster/diagnosis/GetSNOMEDCT', //GetSNOMEDCTByConceptId
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getSNOMEDCallback
                };
                $scope.BlockScreen = true;
                utl.Http.doAction(options);
            }
        }

        $scope.getSNOMEDCallback = function (scope, res, options, hasError) {
            $scope.BlockScreen = false;
            $scope.Concepts = [];
            for (var idx in res) {
                var snomeddata = res[idx];
                if (snomeddata.matches) {
                    for (var midx in snomeddata.matches) {
                        var matchdata = snomeddata.matches[midx];
                        var matchdata = {
                            'ConceptId': matchdata.conceptId,
                            'ConceptName': matchdata.fsn || matchdata.term,
                        };
                        $scope.Concepts.push(matchdata);
                    }
                }
            }
        }

        $scope.MappedItems = function (concept) {
            $scope.MainConcept = [];
            $scope.ParentConcept = [];
            $scope.ChildConcept = [];
            if (concept.ConceptId) {
                $scope.SelectedConcept = concept.ConceptName + '(' + concept.ConceptId + ')';
                $scope.MainConceptData = {
                    'ConceptId': concept.ConceptId,
                    'ConceptName': concept.ConceptName,
                };
                var inputData = {
                    Params: [
                        { Key: 0, Value: concept.ConceptId },
                    ],
                    PageContext: {
                        PageSize: 100000,
                        PageNumber: 1
                    }
                };
                $scope.BlockScreen = true;
                var options = {
                    action: 'clinicalmaster/diagnosis/GetSNOMEDCTByConceptId',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.MappedItemsCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.MappedItemsCallback = function (scope, res, options, hasError) {
            $scope.BlockScreen = false;
            $scope.MainConcept = [];
            $scope.ParentConcept = [];
            $scope.ChildConcept = [];
            $scope.MainConcept.push($scope.MainConceptData);
            for (var idx in res) {
                var snomeddata = res[idx];
                if (snomeddata.Parents) {
                    for (var midx in snomeddata.Parents) {
                        var Parentsdata = snomeddata.Parents[midx];
                        var matchdata = {
                            'ConceptId': Parentsdata.conceptId,
                            'ConceptName': Parentsdata.defaultTerm
                        };
                        $scope.ParentConcept.push(matchdata);
                    }
                }
                if (snomeddata.Children) {
                    for (var midx in snomeddata.Children) {
                        var Childrendata = snomeddata.Children[midx];
                        var matchdata = {
                            'ConceptId': Childrendata.conceptId,
                            'ConceptName': Childrendata.defaultTerm
                        };
                        $scope.ChildConcept.push(matchdata);
                    }
                }
            }
        }


        $scope.saveItemCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.AddPatientCondition = function () {
             if ($scope.MainConceptData  && $scope.MainConceptData.ConceptId) {
                $scope.item.PatientId = $scope.currentcontext.pid;
                $scope.item.EncounterId = utl.Session.getEncounterId();
                $scope.item.DiagnosisId = -1;
                $scope.item.Code = $scope.MainConceptData.ConceptId;
                $scope.item.DiagnosisName = $scope.MainConceptData.ConceptName;
                $scope.item.Description = $scope.MainConceptData.ConceptName;
                $scope.item.ConditionDate = utl.Formatter.getCurrentDate();
                $scope.item.ConditionTypeId = 1;
                $scope.item.ConditionStatusId = 1;
                $scope.item.IsPatientCondition = 0;
                $scope.item.CategoryId = 0;
                $scope.item.TypeId = 0;
                $scope.item.GradeId = 0;
                $scope.item.SideId = 0;
                $scope.item.IsSNOMED = true;
                var actionName = 'emr/patientcondition/AddPatientCondition';
                var options = {
                    action: actionName,
                    data: { Data: $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            } else {
                utl.Alert.showErrorMsg($translate.instant('Please Enter Any Diagnosis'));
            }
        };



    }

    diagnosisSNOMEDController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();