(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctorNotesFormController', DoctorNotesFormController);

    function DoctorNotesFormController($scope, $interval, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            OrganizationId: utl.Session.getCurrentOrgId(),
            CapturedOn: utl.Formatter.getCurrentDate(),
            CapturedBy: utl.Session.getCurrentUserId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            EncounterId: utl.Session.getEncounterId(),
            NoteTypeId: 1
        };

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.currentcontext.lpid = parseInt(modalConfig.params.lpid);
            $scope.currentcontext.isspouse = modalConfig.params.isspouse;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.NoteStatusId == 2) {
                $scope.IsDisabled = true;
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/DailyNote/GetDailyNoteById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
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
                var uiSelect = angular.element(document.getElementById('notetype'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }
            $interval.cancel($scope.startinterval);
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        };
        $scope.clear = function () {
            $scope.item = {};
        };
        $scope.onreview = function () {
            $scope.item.NoteStatusId = 2;
            $scope.saveItem();
        }
        $scope.review = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Review This Note?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onreview,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'emr/DailyNote/AddDailyNote';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/DailyNote/UpdateDailyNote';
            }
            if ($scope.currentcontext.isspouse) {
                $scope.item.LinkedPatientId = $scope.currentcontext.lpid;
            }
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };
        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Note"
                },
                {
                    "Key": "User",
                    Request: {
                        Params: [
                            { Key: 0, Value: utl.Session.getCurrentUserId() }
                        ]
                    }
                },
                {
                    "Key": "NoteStatus"
                }
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
    DoctorNotesFormController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();