(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('MRDFileReceiveFormController', MRDFileReceiveFormController);

    function MRDFileReceiveFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            DisplayStatus: null
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);


        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.MRDIPFileStatusId == 1) {
                $scope.item.DisplayStatus = 'Return to MRD'
            }
            if ($scope.item.MRDIPFileStatusId == 2) {
                $scope.item.DisplayStatus = 'Received at MRD'
            }
            if ($scope.item.MRDIPFileStatusId == 3) {
                $scope.item.DisplayStatus = 'Requested'
            }
            if ($scope.item.MRDIPFileStatusId == 4) {
                $scope.item.DisplayStatus = 'Transfered'
            }
            if ($scope.item.MRDIPFileStatusId == 5) {
                $scope.item.DisplayStatus = 'Received at Dept'
            }
            if ($scope.item.MRDIPFileStatusId == 7) {
                $scope.item.DisplayStatus = 'Incomplete'
            }
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'IPManagement/MRDFiles/GetMRDFilesById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function() {
            $state.go('app.mrdfilereceivelist');
        };
        $scope.clear = function() {
            $scope.item = {};
        }

        $scope.saveAndApprove = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to receive MRD?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function() {
            $scope.item.MRDIPFileStatusId = 2;
            $scope.item.ReceivedBy = utl.Session.getCurrentUserId();
            $scope.item.ReceivedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.incomplete = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to Mark as Incomplete?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onincompleteConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onincompleteConfirmed = function() {
            $scope.item.MRDIPFileStatusId = 7;
            // $scope.item.ReceivedBy = utl.Session.getCurrentUserId();
            // $scope.item.ReceivedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = options.data.Data.Id;
            $scope.getItem();
        };

        $scope.saveItem = function() {

            var actionName = 'IPManagement/MRDFiles/AddMRDFiles';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/MRDFiles/UpdateMRDFiles';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
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
            var inputData = [
                { "Key": "MRDIPFileStatus" }
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

    MRDFileReceiveFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();