(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('templatescreenSectionController', templatescreenSectionController);

    function templatescreenSectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, lodash, $filter, $timeout) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {
            profileSections: [],
            searchtext: ''
        };
        $scope.currentcontext={};
        // $scope.currentcontext.id = parseInt($stateParams.id);

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.profileId = parseInt(modalConfig.params.profileId);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.profileId = $stateParams.id;
        $scope.currentcontext.name = $stateParams.name;
        $scope.itemMoved = function (item) {
            $scope.currentcontext.searchtext = '';

            $timeout(function () {
                var indexToSplice = null;
                for (var idx in $scope.models.lists.TotalList) {
                    var section = $scope.models.lists.TotalList[idx];
                    if (section.SectionId == item.SectionId) {
                        indexToSplice = idx;
                    }
                }
                console.log('indexToSplice');
                console.log(indexToSplice);
                $scope.models.lists.TotalList.splice(indexToSplice, 1);
            }, 500);
        }

        //get item
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data;
            $scope.currentcontext.name=$scope.item.id;
            getMappingData();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.profileId && $scope.currentcontext.profileId > 0) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.profileId
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'clinicalmaster/ProfileSection/GetProfileSections',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.templatescreens');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.backToList();
        };

        $scope.saveItem = function () {
            setMappingData();
            var actionName = 'clinicalmaster/ProfileSection/ManageProfileSection';

            var options = {
                action: actionName,
                data: {
                    Id: $scope.currentcontext.profileId,
                    Data: $scope.currentcontext.profileSections
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function prepareSectionMap() {
            $scope.sectionMap = {};
            if ($scope.lookup.SectionMaster && $scope.lookup.SectionMaster.length > 0) {
                for (var idx in $scope.lookup.SectionMaster) {
                    var item = $scope.lookup.SectionMaster[idx];
                    $scope.sectionMap[item.Id] = item;
                }
            }
        }

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            prepareSectionMap();

            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "SectionMaster",
                Default: false
            }];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        //drag and drop codes

        $scope.models = {
            selected: null,
            lists: {
                "PositionTop": [],
                "PositionRight": [],
                "TotalList": []
            }
        };

        function objectComparer(current, other) {
            return current.SectionId == other.SectionId;
        }

        function getMappingData() {
            if ($scope.currentcontext.profileId && $scope.currentcontext.profileId > 0) {
                for (var idx in $scope.item) {
                    var profileSection = $scope.item[idx];
                    if ($scope.sectionMap[profileSection.SectionId]) {
                        profileSection.Text = $scope.sectionMap[profileSection.SectionId].Text;
                        // Position Top
                        if ($scope.item[idx].DockPositionId == 2) {
                            $scope.models.lists.PositionTop.push(profileSection);
                        }
                        // Position Right
                        if ($scope.item[idx].DockPositionId == 3) {
                            $scope.models.lists.PositionRight.push(profileSection);
                        }

                        delete $scope.sectionMap[profileSection.SectionId];
                    }
                }
            }

            //Sort based on display order
            $scope.models.lists.PositionTop = $filter('sortArrayItems')($scope.models.lists.PositionTop, [{
                name: 'DisplayOrder',
                direction: 'asc',
                priority: 1,
                type: 'int'
            }]);
            $scope.models.lists.PositionRight = $filter('sortArrayItems')($scope.models.lists.PositionRight, [{
                name: 'DisplayOrder',
                direction: 'asc',
                priority: 1,
                type: 'int'
            }]);

            var sectionMasterList = [];
            for (var idx in $scope.sectionMap) {
                ///////if ($scope.sectionMap[idx].SectionNoteTypeId != 2)
                sectionMasterList.push($scope.sectionMap[idx]);
            }
            $scope.models.lists.TotalList = sectionMasterList;
        }

        function setMappingData() {
            $scope.currentcontext.profileSections = [];

            //prepare top section
            var displayorder = 1;
            for (var idx in $scope.models.lists.PositionTop) {
                var item = {
                    ProfileId: $scope.currentcontext.profileId,
                    SectionId: parseInt($scope.models.lists.PositionTop[idx].SectionId),
                    DockPositionId: 2,
                    DisplayOrder: displayorder
                };
                $scope.currentcontext.profileSections.push(item);
                displayorder++;
            }

            //prepare right section
            displayorder = 1;
            for (var idx in $scope.models.lists.PositionRight) {
                var item = {
                    ProfileId: $scope.currentcontext.profileId,
                    SectionId: parseInt($scope.models.lists.PositionRight[idx].SectionId),
                    DockPositionId: 3,
                    DisplayOrder: displayorder
                };
                $scope.currentcontext.profileSections.push(item);
                displayorder++;
            }
        }

        $scope.initLookup();
    }

    templatescreenSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'lodash', '$filter', '$timeout'];

})();