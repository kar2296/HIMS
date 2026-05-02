(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('templatetabFormController', templatetabFormController);

    function templatetabFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {
            SectionNoteTypeId: '1',
            SectionNoteType: '',
            searchtext: '',
            Selected: null,
            MasterList: [],
            SelectedList: []
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if ($stateParams.id)
            $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.canShowSectionCategoryMap = function () {
            return $scope.item.SectionTypeId == 2;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;

            if ($scope.item.SectionNoteTypeId)
                $scope.currentcontext.SectionNoteTypeId = $scope.item.SectionNoteTypeId;

            $scope.changeSectionNoteTypeId();

            if ($scope.item.SectionTypeId == 2) {
                getSectionCategory();
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/SectionMaster/GetSectionMasterById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.changeSectionNoteTypeId = function () {
            $scope.item.SectionNoteTypeId = $scope.currentcontext.SectionNoteTypeId;
            var secData = $scope.item.SectionNoteTypeId.split(",");
            $scope.currentcontext.SectionNoteType = '';
            for (var i = 0; i < secData.length; i++) {
                var sectionNoteTypeObj = utl.Lookup.getObject($scope.lookup.SectionNoteType, secData[i]);
                if (i == 0) $scope.currentcontext.SectionNoteType += sectionNoteTypeObj.Text;
                else $scope.currentcontext.SectionNoteType += ' , ' + sectionNoteTypeObj.Text;
                $scope.item.SectionNoteTypeName = $scope.currentcontext.SectionNoteType;
            }
        }

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if (!$scope.item.Id) {
                $scope.item.Id = data;
            }
            if ($scope.item.SectionTypeId == 2) {
                saveSectionCategory();
            } else {
                utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                $scope.backToList();
            }
        };

        $scope.saveItem = function () {
            if (!$scope.item.SectionNoteTypeId && !$scope.item.SectionTypeId) {
                utl.Alert.showErrorMsg($translate.instant('Please Enter Required Field'));
                return;
            }
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }

            var actionName = 'clinicalmaster/SectionMaster/AddSectionMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/SectionMaster/UpdateSectionMaster';
            }

            if (!$scope.item.SRef && $scope.item.SectionTypeId == 2) {
                $scope.item.SRef = 'emr.cn.question';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveSectionCategoryCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.backToList = function () {
            $state.go('app.templatetabs');
        }

        function saveSectionCategory() {

            var inputData = [];
            for (var idx in $scope.currentcontext.SelectedList) {
                var item = $scope.currentcontext.SelectedList[idx];
                inputData.push({
                    SectionId: $scope.item.Id,
                    CategoryId: item.Id,
                    DisplayOrder: idx
                });
            }

            var actionName = 'clinicalmaster/SectionMaster/MapCategories';

            var options = {
                action: actionName,
                data: {
                    Data: {
                        map: inputData,
                        sectionid: $scope.item.Id
                    }
                },
                type: 'post',
                onComplete: $scope.saveSectionCategoryCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getSectionCategoryCallback = function (scope, data, options, hasError) {
            var catList = data;
            var selectedItems = [];
            for (var idx in catList) {
                var catObj = utl.Lookup.getObject($scope.lookup.Category, catList[idx].CategoryId);
                selectedItems.push({
                    Id: catObj.Id,
                    Text: catObj.Text,
                    DisplayOrder: catObj.DisplayOrder
                });
            }
            $scope.currentcontext.SelectedList = _.orderBy(selectedItems, ['DisplayOrder']);
            $scope.currentcontext.MasterList = _.differenceBy($scope.currentcontext.MasterList, selectedItems, 'Id');
        };

        function getSectionCategory() {
            if ($scope.currentcontext.id) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.id
                    }]
                };
                var actionName = 'clinicalmaster/SectionMaster/GetCategories';

                var options = {
                    action: actionName,
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getSectionCategoryCallback
                };
                utl.Http.doAction(options);
            }
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getCategoryList();
        }


        $scope.getCategoryList = function () {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                } // active category list
                ],
                PageContext: {
                    PageSize: 100000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'clinicalmaster/Category/GetCategorysWithoutConcept',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCategoryListCallback
            };
            utl.Http.doAction(options);
        };


        $scope.getCategoryListCallback = function (scope, res, options, hasError) {
            try {
                var CategoryList = [];
                for (var idx in res.Data) {
                    var catg = res.Data[idx];
                    let CateoryObj = {
                        Id: catg.Id,
                        Text: catg.CategoryName,
                        Description: catg.CategoryName
                    };
                    CategoryList.push(CateoryObj);
                }
                $scope.lookup["Category"] = CategoryList;
            } catch (ex) { }
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                $scope.getItem();
            }
            $scope.currentcontext.MasterList = _.orderBy($scope.lookup.Category, ['Id']);
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "DockPosition"
            },
            {
                "Key": "SectionType",
                Default: false
            },
            // {
            //     "Key": "SectionMaster"
            // },
            {
                "Key": "SectionNoteType",
                Default: 1
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

    templatetabFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();