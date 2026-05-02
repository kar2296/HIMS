
(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('portalappointmentsController', portalappointmentsController);

function portalappointmentsController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));

    $scope.item = {
                IsActive : true

    };

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'SystemSettings/group/GetGroupById',
                data: { Id : $scope.currentcontext.id},
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.appointment = function () {
       $state.go('patientportal.doctorappointment');
    }
    $scope.dashboard = function () {
        $state.go('patientportal.virtualhealthcare');
     }
  $scope.clear = function() {
        $scope.item = {};
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    // $scope.getItem();
                }
            }
            else if (typeof (data) == "number") {
                $state.go('app.grouptab.general', { id: data });
            }
            else {
                $scope.backToList(); // Safer side added
            }
    };

    $scope.saveItem = function () {

        // if(!$scope.item_form.isValid()) {
        //     $scope.showErrorMsg($scope.i18n.appmanager.common.validationmsg.lbl);
        //     return;
        // }

        var actionName = 'SystemSettingsgroup/AddGroup';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'SystemSettingsgroup/UpdateGroup';
        }

        var options = {
            action: actionName,
            data: {Data : $scope.item },
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
        // var options = {
        //     action: 'SystemSettings/group/GetGroupLookups',
        //     data: null,
        //     type: 'get',
        //     onComplete: $scope.lookupCallback
        // };
        // utl.Http.doAction(options);
        $scope.getItem();
    }

    $scope.initLookup();
}

portalappointmentsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();