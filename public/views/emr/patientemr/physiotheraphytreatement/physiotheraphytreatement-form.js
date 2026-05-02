(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PhysiotheraphyTreatementFormController', PhysiotheraphyTreatementFormController);

    function PhysiotheraphyTreatementFormController($scope, $stateParams, $state, $translate, Upload, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            // EncounterId: utl.Session.getEncounterId(),
            CreatedBy: utl.Session.getCurrentUserId(),
            PhysiotherapistId: utl.Session.getCurrentUserId(),
            PhysiotheraphyDate: utl.Formatter.getCurrentDate(),
            PhysiotheraphyStatusId: -1
        };
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({ $scope: $scope }));

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            file: null
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
            $scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/PhysiotheraphyTreatement/GetPhysiotheraphyTreatementById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getDuration = function (item) {
            var duration = 0;
            $scope.item.StartTime = item.StartTime;
            $scope.item.EndTime = item.EndTime;
            duration = parseInt($scope.item.EndTime) - parseInt($scope.item.StartTime);
            $scope.item.Duration = duration;

        }


        // $scope.save = function () {
        //     if (!utl.Validator.validate($scope)) {
        //         return;
        //     }
        //     var confirmOptions = {
        //         headingKey: 'common.confirm-modal-header.lbl',
        //         messageKey: 'Are you Sure,You Want To Save?',
        //         yesKey: 'common.yeskey.lbl',
        //         noKey: 'common.nokey.lbl',
        //         onSuccessMethod: $scope.onSaveandDraftConfirmed,
        //     };
        //     utl.Dialog.confirmMessage(confirmOptions);
        // };
        $scope.save = function () {
            $scope.item.PhysiotheraphyStatusId = 2,
                $scope.saveItem();
        }


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // if ($scope.currentcontext.context == 'modal') {
            $scope.confirmCallback();
            // } else
            //     $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'emr/PhysiotheraphyTreatement/AddPhysiotheraphyTreatement';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/PhysiotheraphyTreatement/UpdatePhysiotheraphyTreatement';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };



        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "TreatementModality" },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 5,
                            Value: 2
                        }],
    
                    }
                },
                // { "Key": "PhysiotherapistUser" },
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

    PhysiotheraphyTreatementFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'Upload', 'utl', '$uibModalInstance', 'modalConfig'];

})();