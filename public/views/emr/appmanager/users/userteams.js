(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('userTeamListController', userTeamListController);

    function userTeamListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.currentfilter = {
            name: '',
            ActiveFrom: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {};
        $scope.currentcontext.teamid = parseInt($stateParams.id);

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                Status: 1,
                IsDefault: true
            };
            vm.items.push(lineItem);
        }

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.items = data;
            $scope.addNewLineItem();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.teamid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/UserTeam/GetUserTeams',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            vm.items = [];
            $scope.currentfilter = {};
            $scope.addNewLineItem();
        };
        $scope.backToList = function () {
            $state.go('app.usertab.general', { id: 0 });
        }
        $scope.addNew = function () {
            $scope.addNewLineItem();
        };

        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.saveItem();
        };

        $scope.deleteItem = function (idx, item) {
            var name = item.GroupId || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        //Save Item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'SystemSettings/UserTeam/ManageUserTeams',
                    data: { Data: lines },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            //  $state.go('app.usertab.general', { id:0 });
            $state.go('app.usertab.general');
        }


        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [
                { search: 1, fields: ['Status'] }
            ]);

            var lastIndex = activeRecords.length - 1;
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (idx == lastIndex && !item.GroupId) {
                    continue;
                }
                else if (item.TeamId == -1 || !item.GroupId) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        };

        function getLinesForSave() {
            var result = [];
            var lastIndex = vm.items.length - 1;

            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.GroupId) {
                    item.UserId = $scope.currentcontext.teamid;
                    item.ActiveFrom = utl.Formatter.getCurrentDate();
                    result.push(item);
                }
            }
            return result;
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Group" },
                { "Key": "Team" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    userTeamListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();