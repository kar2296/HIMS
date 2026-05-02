(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('templateparamFormController', templateparamFormController);

    function templateparamFormController($scope, $stateParams, $state, $translate, utl, uibButtonConfig) {
        var vm = this;
        uibButtonConfig.activeClass = "btn-primary";

        $scope.currentfilter = {
            catsearchtext: '',
            conceptsearchtext: '',
        };

        $scope.currentcontext = {
            id: parseInt($stateParams.id),
            categorylist: [],
            category: {},
            selectedcatid: '',
            concept: {},
            selectedconceptid: '',
            selectedcpt: null,
            selectedicd: null
        };
        $scope.currentcontext.category = {
            IsActive: true
        };
        /*Category related code starts */
        function sortData(category) {
            category.Concepts = _.sortBy(category.Concepts, ['DisplayOrder']);
            for (var idx in category.Concepts) {
                var concept = category.Concepts[idx];
                if (concept.Terms && concept.Terms.length > 0) {
                    concept.Terms = _.sortBy(concept.Terms, ['DisplayOrder']);
                }
                if (concept.ValueTypeId == 11) {
                    var attr = JSON.parse(concept.Attributes);
                    concept.AttrMin = attr.Min;
                    concept.AttrMax = attr.Max;
                    concept.AttrStep = attr.Step;
                }
            }
        }
        $scope.catSearchtextChange = function (searchText) {
            $scope.getCategoryList();
        }

        $scope.categoryTypeChange = function (selected) {
            $scope.currentcontext.category.CategoryType = selected.Text;
        }

        $scope.addNewCategory = function () {
            resetCategoryWorkArea();
            $scope.addNewConcept();
        }

        function resetCategoryWorkArea() {
            $scope.currentcontext.category = {
                IsActive: true
            };
            $scope.currentcontext.selectedcatid = '';
        }

        function resetConceptWorkArea() {
            $scope.currentcontext.concept = {};
            $scope.currentcontext.selectedconceptid = '';
        }

        function setDefault() {
            var catList = $scope.currentcontext.categorylist;
            var defaultCatId = $scope.currentcontext.id;
            for (var idx in catList) {
                var cat = catList[idx];
                if (cat.Id == defaultCatId) {
                    $scope.currentcontext.selectedcatid = defaultCatId;
                    $scope.catClick(cat);
                    break;
                }
            }
        }

        $scope.catClick = function (selectedCat) {
            selectedCat
            $scope.currentcontext.category = selectedCat;
            resetConceptWorkArea();
        }
        $scope.addNew = function () {
            $scope.currentcontext = {};
            $scope.addNewCategory();
        }
        //getCategoryList
        $scope.getCategoryListCallback = function (scope, res, options, hasError) {
            var catList = res.Data;
            for (var idx in catList) {
                var cat = catList[idx];
                sortData(cat);
            }
            $scope.currentcontext.categorylist = catList;
            setDefault();
        };

        $scope.getCategoryList = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.id
                    }, ],
                    PageContext: {
                        PageSize: 500,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'clinicalmaster/Category/GetCategorys',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getCategoryListCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentfilter.catsearchtext) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.catsearchtext
                    }, ],
                    PageContext: {
                        PageSize: 500,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'clinicalmaster/Category/GetCategorys',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getCategoryListCallback
                };
                utl.Http.doAction(options);
            }
        };

        function validateCategory() {
            var isValid = true;

            if (!$scope.currentcontext.category.CategoryName) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.category.category-req-msg.lbl'));
            }

            return isValid;
        }

        //saveCategory
        $scope.saveCategoryCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "number") {
                $scope.currentcontext.selectedcatid = data;
            }
            $scope.getCategoryById();
            $scope.getCategoryList();
        };

        $scope.saveCategory = function () {

            if (!validateCategory()) {
                return;
            }

            var actionName = 'clinicalmaster/Category/AddCategory';
            if ($scope.currentcontext.category.Id && $scope.currentcontext.category.Id > 0) {
                actionName = 'clinicalmaster/Category/UpdateCategory';
            }

            $scope.currentcontext.category.Concepts = collectConceptTerms();

            $scope.currentcontext.category.ActiveStatus = 'Active' //Active

            var options = {
                action: actionName,
                data: {
                    Data: $scope.currentcontext.category
                },
                type: 'post',
                onComplete: $scope.saveCategoryCallback
            };
            utl.Http.doAction(options);
        };

        function collectConceptTerms() {
            var result = [];

            for (var idx in $scope.currentcontext.category.Concepts) {
                var concept = $scope.currentcontext.category.Concepts[idx];

                if (concept.ConceptName && !(concept.Id == 0 && concept.Status == 2)) {
                    concept.ActiveStatus = 'Active';
                    var TermsList = [];
                    if (concept.Terms && concept.Terms.length > 0) {
                        for (var jdx in concept.Terms) {
                            var term = concept.Terms[jdx];
                            if (!(term.Id == 0 && term.Status == 2)) {
                                // if (term.Code && !(term.Id == 0 && term.Status == 2)) {
                                term.DisplayOrder = jdx;
                                term.Code = term.TermName;
                                TermsList.push(term);
                            }
                        }
                    }
                    if (concept.ValueTypeId == 11) {
                        var Attr = {
                            Min: concept.AttrMin,
                            Max: concept.AttrMax,
                            Step: concept.AttrStep
                        }
                        concept.Attributes = JSON.stringify(Attr);
                    }
                    concept.DisplayOrder = idx;
                    concept.Terms = TermsList;
                    result.push(concept);
                }
            }
            return result;
        }

        //get Category
        $scope.getCategoryByIdCallback = function (scope, data, options, hasError) {
            sortData(data);
            $scope.currentcontext.category = data;
        };

        $scope.getCategoryById = function () {
            if ($scope.currentcontext.selectedcatid && $scope.currentcontext.selectedcatid > 0) {

                var options = {
                    action: 'clinicalmaster/Category/GetCategoryById',
                    data: {
                        Id: $scope.currentcontext.selectedcatid
                    },
                    type: 'post',
                    onComplete: $scope.getCategoryByIdCallback
                };
                utl.Http.doAction(options);
            }
        };

        //deleteCategory
        $scope.deleteCategoryCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.addNewCategory();
            $scope.getCategoryList();
        };

        $scope.onDeleteCategoryConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/Category/DeleteCategory',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteCategoryCallback
            };
            utl.Http.doAction(options);
        }

        $scope.deleteCategory = function () {
            utl.Dialog.confirmDelete($scope.onDeleteCategoryConfirmed,
                $scope.currentcontext.category.Id, $scope.currentcontext.category.CategoryName);
        }

        /*Category related code ends */


        /*Concept related code starts */

        $scope.conceptSearchtextChange = function (searchText) {
            //$scope.getconceptlist();
        }

        $scope.addNewConcept = function () {
            $scope.currentcontext.category.Concepts = $scope.currentcontext.category.Concepts || [];
            $scope.currentcontext.concept = {
                CategoryId: $scope.currentcontext.selectedcatid,
                Status: 1
            };
            $scope.currentcontext.category.Concepts.push($scope.currentcontext.concept);
            $scope.currentcontext.selectedconceptid = '';
        }

        $scope.conceptClick = function (selectedConcept) {
            $scope.currentcontext.concept = selectedConcept;
            $scope.currentcontext.selectedconceptid = selectedConcept.Id;
        }

        function validateConcept() {
            var isValid = true;
            if (!$scope.currentcontext.concept.ConceptName) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.category.concept-req-msg.lbl'));
            }
            return isValid;
        }


        //deleteConcept
        $scope.onDeleteConceptConfirmed = function (item) {
            item.Status = 2;
            $scope.addNewConcept();
        }

        $scope.deleteConcept = function () {
            utl.Dialog.confirmDelete($scope.onDeleteConceptConfirmed,
                $scope.currentcontext.concept, $scope.currentcontext.concept.ConceptName);
        }

        /*Concept related code ends */

        /* Term related code starts */

        $scope.addNewTerm = function () {
            if ($scope.currentcontext.concept.ValueTypeId == 3 || $scope.currentcontext.concept.ValueTypeId == 13) { // 3 - Term based, 13 - combo
                var term = {
                    Id: 0,
                    TermName: '',
                    Description: '',
                    Status: 1
                };
                $scope.currentcontext.concept.Terms = $scope.currentcontext.concept.Terms || [];
                $scope.currentcontext.concept.Terms.push(term);
            }
        }

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        }

        $scope.deleteTerm = function (idx, item) {
            var name = item.TermName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }

        /* Termm related code ends */

        $scope.manageChiefComplaintMap = function () {
            utl.Modal.open('app.categorychiefcomplaintmap', {
                params: {
                    categoryid: $scope.currentcontext.selectedcatid
                }
            });
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getCategoryList();
            $scope.addNewCategory();
        }
        $scope.backToList = function () {
            $state.go('app.templateparams');
        }


        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "CategoryType"
                },
                {
                    "Key": "CategoryGroup"
                },
                /////// { "Key": "Category" },
                {
                    "Key": "ValueType"
                }
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

    templateparamFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();