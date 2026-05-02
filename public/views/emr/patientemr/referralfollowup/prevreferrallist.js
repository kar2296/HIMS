(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReferralFollowupprevreferrallistController', ReferralFollowupprevreferrallistController);

    function ReferralFollowupprevreferrallistController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {
            // ismodal: modalConfig && modalConfig.params ? true : false
        };

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.pid)
            $scope.currentcontext.PatientId = $stateParams.pid;
        else
            $scope.currentcontext.PatientId = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.EncounterId = $stateParams.eid;
        else
            $scope.currentcontext.EncounterId = parseInt(utl.Session.getEncounterId());

        $scope.getListCallback = function(scope, res, options, hasError) {
            for (var pdx in res.Data) {
                var trackData = res.Data[pdx];
                if (trackData.AssignedGroupId > 0 || trackData.AssignedUserId > 0 || trackData.AssignedUserDepartmentId > 0) {
                    if (trackData.AssignedUserId) {
                        trackData.ReferredUser = trackData.AssignedUserName;
                    }
                    if (trackData.AssignedGroupId) {
                        trackData.ReferredUser = trackData.AssignedGroupName;
                    }
                    $scope.items.push(trackData);
                }
            }
        };

        $scope.getList = function() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.PatientId
                    },
                    {
                        Key: 7,
                        Value: 2
                    },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'appointment/patienttracker/GetPatientTrackers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.edit = function(item) {
            $state.go('patientemr.referralfollowuptab.referralfollowup', {
                id: item.Id
            });
        };


        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'appointment/patienttracker/DeletePatientTracker',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.delete = function(item) {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
        }


        $scope.getList();
    }

    ReferralFollowupprevreferrallistController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();