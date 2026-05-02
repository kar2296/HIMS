(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientIntakeOutoutFormController', patientIntakeOutoutFormController);

    function patientIntakeOutoutFormController($scope, $interval, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            IntakeOutputTypeId: 1, // Intake
            CapturedBy: parseInt(utl.Session.getCurrentUserId()),
            ReviewedBy: parseInt(utl.Session.getCurrentUserId()),
            IntakeOutputTime: utl.Formatter.getCurrentDate(),
            EncounterId: utl.Session.getEncounterId()
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.id = parseInt($stateParams.id);
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        }

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.applyVisibilityRules();
            $scope.getCreatedUser();
            $scope.setFocusTitle();
        };
        $scope.getCreatedUserCallback = function (scope, res, options, hasError) {
            $scope.CreatedUser = res.Data[0];
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getCreatedUser = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.id }
                ]
            };

            var options = {
                action: 'emr/patientintakeoutput/GetPatientIntakeOutputs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCreatedUserCallback
            };

            utl.Http.doAction(options);
        };
        $scope.applyVisibilityRules = function () {
            // Draft

            if ($scope.currentcontext.id <= 0) {
                $scope.canShowSaveBtn = true;
                $scope.canShowReviewBtn = false;
                $scope.canShowValueBtn=false;


            } else {
                $scope.canShowSaveBtn = true;
                $scope.canShowReviewBtn = false;
                $scope.canShowValueBtn=false;

                if ($scope.item.IntakeOutputStatusId == 1) {
                    $scope.canShowSaveBtn = false;
                    $scope.canShowReviewBtn = true;
                    $scope.canShowValueBtn=false;

                }
                if ($scope.item.IntakeOutputStatusId == 2) {
                    $scope.canShowSaveBtn = false;
                    $scope.canShowReviewBtn = false;
                    $scope.canShowValueBtn=true;
                }
            }
        }

        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/patientintakeoutput/GetPatientIntakeOutputById',
                    data: { Id: $scope.currentcontext.id, PatientId: $scope.currentcontext.pid },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.setFocusTitle();
            }
        };
        $scope.setFocusTitle = function () {
            if ($scope.currentcontext.id <= 0) {
                $scope.startinterval = $interval(function () {
                    $scope.callTitleFocus();
                }, 1000);
            }
        }
        $scope.callTitleFocus = function () {
            if ($scope.currentcontext.id <= 0) {
                console.log("test print by ");
                var uiSelect = angular.element(document.getElementById('type'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }
            $interval.cancel($scope.startinterval);
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.save = function () {
            $scope.item.IntakeOutputStatusId = 1;
            // $scope.saveItem();
        }

        $scope.review = function () {
            $scope.item.IntakeOutputStatusId = 2;
            // $scope.saveItem();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'emr/patientintakeoutput/AddPatientIntakeOutput';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/patientintakeoutput/UpdatePatientIntakeOutput';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.IntakeOutputTypeChange = function () {

        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "User" },
                { "Key": "IntakeOutputType" },
                { "Key": "IntakeType" },
                { "Key": "OutputType" },
                { "Key": "IntakeOutputStatus" }
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

    patientIntakeOutoutFormController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();