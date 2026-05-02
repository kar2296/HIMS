
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('activeUserListController', activeUserListController);

    function activeUserListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        
        $scope.getListCallback = function (scope, res, options, hasError) {
            var response = res.result;
            var users = _.filter(response, function(obj){
                if(obj.hasOwnProperty('passport')) {
                    if(obj.passport.hasOwnProperty('user')) {
                        return true;
                    }
                }
            });
            vm.gridConfig.data = users;
            //vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var options = {
                action: 'auth/getActiveUsers',
                data: null,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "passport.user.SessionContext.FacilityName", displayName: $translate.instant('appmanager.activeuser.facility.lbl') },
                        { field: "passport.user.SessionContext.UserFullName", displayName: $translate.instant('appmanager.activeuser.username.lbl') },
                        { field: "passport.user.SessionContext.UserType.Description", displayName: $translate.instant('appmanager.activeuser.usertype.lbl') },
                        { field: "passport.user.SessionContext.Group.Description", displayName: $translate.instant('appmanager.activeuser.groupname.lbl') },
                        { field: "passport.user.SessionContext.DepartmentName", displayName: $translate.instant('appmanager.activeuser.department.lbl') },
                        { field: "passport.user.SessionContext.LoginTime", displayName: $translate.instant('appmanager.activeuser.logintime.lbl'),
                            cellTemplate : "<ngformatdate datetime-val='row.entity.passport.user.SessionContext.LoginTime'></ngformatdate>" },
                        { field: "ttl", displayName: $translate.instant('appmanager.activeuser.ttl.lbl') }
                    ]
    };

        $scope.getList();

    }

    activeUserListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();