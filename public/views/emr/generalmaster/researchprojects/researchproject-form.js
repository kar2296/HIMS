(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('researchProjectFormController', researchProjectFormController);

    function researchProjectFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId:utl.Session.getCurrentFacilityId(),
        };
        $scope.projectmember = {};
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;

            $scope.getProjectMembers();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'generalmaster/ResearchProject/GetResearchProjectById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));

            if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
                $scope.currentcontext.id = parseInt(data);
            }

            $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'generalmaster/ResearchProject/AddResearchProject';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'generalmaster/ResearchProject/UpdateResearchProject';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ProjectType" },
                { "Key": "User" }
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

        //Project member related code starts
        $scope.getProjectMembersCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data;
        };

        $scope.getProjectMembers = function (pageNo) {

            if ($scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'generalmaster/ResearchProjectMember/GetResearchProjectMembers',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getProjectMembersCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            //utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getProjectMembers();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/ResearchProjectMember/DeleteResearchProjectMember',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.User.FirstName);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "User.FirstName", displayName: $translate.instant('generalmaster.researchprojectmember-list.projectmember.lbl') },
                {
                    field: "IsIncharge", displayName: $translate.instant('generalmaster.researchprojectmember-list.isincharge.lbl'),
                    cellTemplate: "<displayyesno input-val='row.entity.IsIncharge'></displayyesno>"
                },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ]
        };

        $scope.addMemberCallback = function (scope, data, options, hasError) {
            //utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.projectmember = {};
            $scope.getProjectMembers();
        };

        $scope.addMember = function () {

            var actionName = 'generalmaster/ResearchProjectMember/AddResearchProjectMember';
            $scope.projectmember.ResearchProjectId = $scope.currentcontext.id;

            var options = {
                action: actionName,
                data: { Data: $scope.projectmember },
                type: 'post',
                onComplete: $scope.addMemberCallback
            };
            utl.Http.doAction(options);
        };
        $scope.item.StartDate = new Date();
        //Project member related code ends
    }

    researchProjectFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl','$uibModalInstance','modalConfig'];

})();