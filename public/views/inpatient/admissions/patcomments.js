(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatCommentsController', PatCommentsController);

    function PatCommentsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };
        $scope.item = {};
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};
        $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);


        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.pid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/PatientComment/GetPatientComments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.PatientId = $scope.currentcontext.pid;
            $scope.item.EncounterId = $scope.currentcontext.eid;
            $scope.item.CommentOn = utl.Formatter.getCurrentDate();
            $scope.item.CommentBy = utl.Session.getCurrentUserId();

            var actionName = 'Visit/PatientComment/AddPatientComment';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('', { opbillingid: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                {
                    field: "CommentOn", displayName: $translate.instant('Date & Time'),
                    cellTemplate: "<ngformatdate datetime-val='entity.CommentOn '></ngformatdate>"
                },
                { field: "CommentsType.Description", displayName: $translate.instant('Type') },
                {
                    field: "CommentUser", displayName: $translate.instant('Entered By'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        + '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',entity)">'
                        + "<span >{{entity.CommentUser.Title.Description}}&nbsp;</span>"
                        + "<span >{{entity.CommentUser.FirstName}}&nbsp;</span>"
                        + "<span >{{entity.CommentUser.LastName}}&nbsp;</span>"
                        + "</span></div>"
                },               
                { field: "Comments", displayName: $translate.instant('Comments') },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.item.LockTypeId = 3;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "CommentsType" }
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

    PatCommentsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();