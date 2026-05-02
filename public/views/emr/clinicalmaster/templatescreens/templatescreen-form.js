(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('templatescreenFormController', templatescreenFormController);

    function templatescreenFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.currentcontext = {};

        $scope.currentcontext.id = parseInt($stateParams.id);
        // $scope.currentcontext = {};
        // if (modalConfig && modalConfig.params) {
        //     $scope.currentcontext.id = parseInt(modalConfig.params.id);
        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // }

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            if (data.ActiveStatusId == 2)
                $scope.item.IsActive = true;

            if ($scope.item.ProfilemasterTypeId)
                $scope.currentcontext.ProfilemasterTypeId = $scope.item.ProfilemasterTypeId;

            $scope.changeProfilemasterTypeId();
        };
        $scope.save = function() {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }
        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/ProfileMaster/GetProfileMasterById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $scope.confirmCallback();
        }
        $scope.backToList = function() {
            $state.go('app.templatescreens');
        };

        $scope.changeProfilemasterTypeId = function() {
            $scope.item.ProfilemasterTypeId = $scope.currentcontext.ProfilemasterTypeId;
            var secData = $scope.item.ProfilemasterTypeId.split(",");
            $scope.currentcontext.SectionNoteType = '';
            for (var i = 0; i < secData.length; i++) {
                var sectionNoteTypeObj = utl.Lookup.getObject($scope.lookup.SectionNoteType, secData[i]);
                if (i == 0) $scope.currentcontext.SectionNoteType += sectionNoteTypeObj.Text;
                else $scope.currentcontext.SectionNoteType += ' , ' + sectionNoteTypeObj.Text;
                $scope.item.SectionNoteTypeName = $scope.currentcontext.SectionNoteType;
            }
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'clinicalmaster/ProfileMaster/AddProfileMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/ProfileMaster/UpdateProfileMaster';
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "SectionNoteType"
            }, ];
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

    templatescreenFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();