(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('templatescreenprintconfigController', templatescreenprintconfigController);

    function templatescreenprintconfigController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, lodash, $filter, $timeout) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {
            profileSections: [],
            searchtext: ''
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.profileId = parseInt(modalConfig.params.profileId);
            $scope.currentcontext.name = modalConfig.params.name;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
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
                $scope.models.lists.TotalList.splice(indexToSplice, 1);
            }, 500);
        }

        //get item
        function getProfileItemCallback(scope, data, options, hasError) {
            $scope.item = data;
            getMappingData();
        }

        function getProfileItem() {
            if ($scope.currentcontext.profileId && $scope.currentcontext.profileId > 0) {
                var options = {
                    action: 'clinicalmaster/ProfileMaster/GetProfileMasterById',
                    data: {
                        Id: $scope.currentcontext.profileId
                    },
                    type: 'post',
                    onComplete: getProfileItemCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getProfileSectionCallback = function (scope, data, options, hasError) {
            var profileSections = data.Data;
            var availableSections = [];
            var sectionMaster = $scope.lookup.SectionMaster;
            for (var idx in profileSections) {
                var section = {};
                section = _.find(sectionMaster, function (s) {
                    return profileSections[idx].SectionId == s.Id
                });
                if (section) {
                    availableSections.push(section);
                }
            }
            $scope.models.lists.TotalList = availableSections;
            prepareSectionMap();
            getProfileItem();
        };

        $scope.getProfileSection = function (pageNo) {
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
                    onComplete: $scope.getProfileSectionCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.profiles');
        }
        $scope.backToList = function () {

            $scope.confirmCallback();
        }



        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItem = function () {
            setMappingData();
            var actionName = 'clinicalmaster/ProfileMaster/UpdatePrintConfig';

            var inputData = {
                PrintConfig: $scope.currentcontext.printSection
            };

            var options = {
                action: actionName,
                data: {
                    Id: $scope.currentcontext.profileId,
                    Data: JSON.stringify(inputData)
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function prepareSectionMap() {
            $scope.sectionMap = {};
            if ($scope.models.lists.TotalList && $scope.models.lists.TotalList.length > 0) {
                for (var idx in $scope.models.lists.TotalList) {
                    var item = $scope.models.lists.TotalList[idx];
                    $scope.sectionMap[item.Id] = item;
                }
            }
        }

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getProfileSection();
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
                "PrintSections": [],
                "TotalList": []
            }
        };

        function objectComparer(current, other) {
            return current.SectionId == other.SectionId;
        }

        function getMappingData() {
            if ($scope.currentcontext.profileId && $scope.currentcontext.profileId > 0) {
                var mappedSection = JSON.parse($scope.item.PrintConfig);
                for (var idx in mappedSection.PrintConfig) {
                    var section = {};
                    section.Id = mappedSection.PrintConfig[idx];
                    if ($scope.sectionMap[section.Id]) {
                        section.Text = $scope.sectionMap[section.Id].Text;
                        $scope.models.lists.PrintSections.push(section);

                        delete $scope.sectionMap[section.Id];
                    }
                }
            }

            var sectionMasterList = [];
            for (var idx in $scope.sectionMap) {
                if ($scope.sectionMap[idx].SectionNoteTypeId != 2)
                    sectionMasterList.push($scope.sectionMap[idx]);
            }
            $scope.models.lists.TotalList = sectionMasterList;
        }

        function setMappingData() {
            $scope.currentcontext.printSection = [];
            var printSections = $scope.models.lists.PrintSections;
            for (var idx in printSections) {
                var sectionId = {};
                sectionId = printSections[idx].Id;
                $scope.currentcontext.printSection.push(sectionId);
            }
        }

        $scope.initLookup();
    }

    templatescreenprintconfigController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'lodash', '$filter', '$timeout'];

})();