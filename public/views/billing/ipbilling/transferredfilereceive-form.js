(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('TransferredFileReceiveFormController', TransferredFileReceiveFormController);

    function TransferredFileReceiveFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            DisplayStatus: null
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.MRDIPFileStatusId == 1){
                $scope.item.DisplayStatus = 'Return to MRD'
            }
            if ($scope.item.MRDIPFileStatusId == 2){
                $scope.item.DisplayStatus = 'Received at MRD'
            }
            if ($scope.item.MRDIPFileStatusId == 3){
                $scope.item.DisplayStatus = 'Requested'
            }
            if ($scope.item.MRDIPFileStatusId == 4){
                $scope.item.DisplayStatus = 'Transfered'
            }
            if ($scope.item.MRDIPFileStatusId == 5){
                $scope.item.DisplayStatus = 'Received at Dept'
            }
            if ($scope.item.MRDIPFileStatusId == 8){
                $scope.item.DisplayStatus = 'Transferred File Return'
            }
            if ($scope.item.MRDIPFileStatusId == 9){
                $scope.item.DisplayStatus = 'Transferred File Receive'
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'IPManagement/IPFileRequest/GetIPFileRequestById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
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
        $scope.backToList = function () {
            $state.go('app.transferredfilereceivelist');
        };
        $scope.clear = function () {
            $scope.item = {};
        }

        $scope.saveAndApprove = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to receive the file?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            $scope.item.MRDIPFileStatusId = 9;
            $scope.item.ReceivedBy = utl.Session.getCurrentUserId();
            $scope.item.ReceivedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            var actionName = 'IPManagement/IPFileRequest/AddIPFileRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/IPFileRequest/UpdateIPFileRequest';
            }
            $scope.item.MrdIPfileId = $scope.currentcontext.mid;
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

    TransferredFileReceiveFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();