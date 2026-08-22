(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientFollowUpFormController', PatientFollowUpFormController);

    function PatientFollowUpFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            FollowupStatusId:1
        };

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.item.EncounterId = parseInt(modalConfig.params.eid);
            $scope.Encounter = (modalConfig.params.encounter);
            $scope.item.PatientId = $scope.Encounter.PatientId;
            $scope.item.DoctorId = $scope.Encounter.DoctorId;
            $scope.item.DoctorName = $scope.Encounter.DoctorName;
            if ($scope.Encounter.Procedure)
                $scope.item.RecomendedProcedure = $scope.Encounter.Procedure.ProcedureName;
            $scope.item.DepartmentId = $scope.Encounter.DepartmentId;
            $scope.item.UnitId = $scope.Encounter.TeamId;
            if ($scope.Encounter.UserTeam)
                $scope.item.UserTeam = $scope.Encounter.UserTeam.Team.Description;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.RecomendedProcedure = $scope.item.RecomendedProcedure;
            $scope.item.UserTeam = $scope.item.Team.Description;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'registration/patientfollowup/GetPatientFollowupById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.getListCallback = function (scope, res, options, hasError) {
        //     vm.gridConfig.data = res.Data;
        // };

        // $scope.getList = function (pageNo) {
        //     var inputData = {
        //         Params: [
        //             { Key: 9, Value: $scope.currentcontext.encounterid }
        //         ],
        //         PageContext: {
        //             // PageSize: vm.gridConfig.pagerObj.pageSize,
        //             PageNumber: vm.gridConfig.pagerObj.currentPage
        //         }
        //     };

        //     var options = {
        //         action: 'registration/patientfollowup/GetPatientFollowups',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getListCallback
        //     };

        //     utl.Http.doAction(options);
        // };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.save = function () {
            $scope.item.FollowupStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveandApprove = function () {

            if ($scope.item.IsActive) {
                $scope.item.FollowupStatusId = 2;
            }
            else {
                $scope.item.FollowupStatusId = 3;
            }
            $scope.saveItem();
        }

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'registration/patientfollowup/Addpatientfollowup';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'registration/patientfollowup/Updatepatientfollowup';
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
            //$scope.getList();
            // if ($scope.item.Activefrom == null)
            //     $scope.item.Activefrom = new Date();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "FollowupStatus" },
                { "Key": "Facility" },
                { "Key": "FollowupType" },


            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);

        }

        $scope.initLookup();

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to PatientFollowupFormScreen.tsx).
        // All API calls/business logic above are untouched -- wrapped, not
        // rewritten. See the disclosure comment block at the top of
        // PatientFollowupFormScreen.tsx for real, preserved bugs found while
        // migrating: the "Save & Approve" button's real ng-click calls
        // saveAndApprove() (capital A) but the controller only ever defines
        // saveandApprove() (lowercase a) -- a pre-existing typo that makes
        // that whole button permanently dead in production, reproduced here
        // by deliberately NOT giving 'saveAndApprove' a case below, plus the
        // dead item.IsActive field, the mismatched translate="..." literal
        // strings on the summary line, the missing null guard on
        // $scope.Encounter when modalConfig.params.encounter is absent, and
        // the unguarded $scope.item.Team.Description read in
        // getItemCallback().
        // ---------------------------------------------------------------
        var DATE_FIELDS = ['FirstFollowupDate', 'FirstAdmitedDate', 'SecondFollowupDate', 'SecondAdmitedDate', 'ThirdFollowupDate', 'ThirdAdmitedDate'];

        function toIsoDateString(d) {
            if (!d) return '';
            var dt = new Date(d);
            if (isNaN(dt.getTime())) return '';
            var mm = ('0' + (dt.getMonth() + 1)).slice(-2);
            var dd = ('0' + dt.getDate()).slice(-2);
            return dt.getFullYear() + '-' + mm + '-' + dd;
        }
        function fromIsoDateString(s) {
            if (!s) return null;
            var parts = String(s).split('-');
            if (parts.length !== 3) return null;
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }

        function buildReactItem() {
            var it = $scope.item || {};
            var out = angular.extend({}, it);
            for (var i = 0; i < DATE_FIELDS.length; i++) {
                out[DATE_FIELDS[i]] = toIsoDateString(it[DATE_FIELDS[i]]);
            }
            return out;
        }

        function updateReactProps() {
            $scope.reactProps = {
                item: buildReactItem(),
                lookup: $scope.lookup || {}
            };
        }

        var _origGetItemCallback = $scope.getItemCallback;
        $scope.getItemCallback = function (scope, data, options, hasError) {
            _origGetItemCallback(scope, data, options, hasError);
            updateReactProps();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            updateReactProps();
        };

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'itemFieldChange':
                    var value = payload.value;
                    if (DATE_FIELDS.indexOf(payload.field) !== -1) {
                        value = fromIsoDateString(value);
                    }
                    $scope.item[payload.field] = value;
                    updateReactProps();
                    break;
                case 'save':
                    $scope.save();
                    updateReactProps();
                    break;
                case 'clear':
                    $scope.clear();
                    updateReactProps();
                    break;
                case 'backToList':
                    $scope.backToList();
                    break;
                // 'saveAndApprove' intentionally NOT handled here -- the real
                // button's ng-click="saveAndApprove()" does not match this
                // controller's actual $scope.saveandApprove (lowercase
                // "and"), so clicking it is a pre-existing no-op in
                // production. See disclosure above.
                default:
                    break;
            }
            $scope.$applyAsync();
        };

        updateReactProps();
    }

    PatientFollowUpFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();