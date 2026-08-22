(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('QMSPatientController', QMSPatientController);

    function QMSPatientController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
            CurrentDate: utl.Formatter.getCurrentDate(),
            CurrentUserId: utl.Session.getCurrentUserId()
        };

        $scope.showNewPatientDetails = true;
        $scope.showOldPatientDetails = false;

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.PatientData = res.Data;
            } else {
                $scope.PatientData = [];
            }
        };

        $scope.getList = function (pageNo) {

            if ($scope.item.TokenNumber != '' ) {
                if ($scope.item.From == null || $scope.item.From == '') {
                    utl.Alert.showErrorMsg($translate.instant('Please Select Date'));
                    return;
                }
            }

            var inputData = {
                Params: [
                    { Key: 9, Value: $scope.item.PatientName },
                    { Key: 4, Value: $scope.item.MRN },
                    { Key: 6, Value: $scope.item.Mobile },
                    { Key: 10, Value: $scope.item.TokenNumber }
                ],
                PageContext: { PageSize: -1, PageNumber: 1 }
            };

            if ($scope.showOldPatientDetails == true) {
                inputData.Params.push({ Key: 2, Value: 2 });
            } else {
                inputData.Params.push({ Key: 2, Value: 1 });
            }

            if ($scope.item.From && $scope.item.To == null) {
                var FrmDate = $filter('date')($scope.item.From, 'yyyy-MM-dd 00:00:00');
                var ToDate = $filter('date')($scope.item.From, 'yyyy-MM-dd 23:59:59');
                if (FrmDate && ToDate)
                    inputData.Params.push({ Key: 8, Value: [FrmDate, ToDate] });
            }

            if ($scope.item.To && $scope.item.From == null) {
                var FrmDate = $filter('date')($scope.item.To, 'yyyy-MM-dd 00:00:00');
                var ToDate = $filter('date')($scope.item.To, 'yyyy-MM-dd 23:59:59');
                if (FrmDate && ToDate)
                    inputData.Params.push({ Key: 8, Value: [FrmDate, ToDate] });
            }

            if ($scope.item.From && $scope.item.To) {
                var StartFrmDate = $filter('date')($scope.item.From, 'yyyy-MM-dd 00:00:00');
                var StartToDate = $filter('date')($scope.item.To, 'yyyy-MM-dd 23:59:59');
                var EndFrmDate = $filter('date')($scope.item.From, 'yyyy-MM-dd 00:00:00');
                var EndToDate = $filter('date')($scope.item.To, 'yyyy-MM-dd 23:59:59');
                if (StartFrmDate && StartToDate)
                    inputData.Params.push({ Key: 8, Value: [StartFrmDate, StartToDate] });

            }

            var options = {
                action: 'Registration/QMS/GetQMS',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.sendPatientData = function (QMSId, PatientId, Patient) {
            $scope.confirmCallback({ qmsid: QMSId, pid: PatientId, patientdata: Patient });
        }

        $scope.openNewPatientDetailsTab = function () {
            $scope.showNewPatientDetails = true;
            $scope.showOldPatientDetails = false;
            $scope.initLookup();
        }

        $scope.openOldPatientDetailsTab = function () {
            $scope.showOldPatientDetails = true;
            $scope.showNewPatientDetails = false;
            $scope.initLookup();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
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

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to QMSPatientsScreen.tsx).
        // All API calls/business logic above (getList/getListCallback/
        // initLookup/lookupCallback/sendPatientData/
        // openNewPatientDetailsTab/openOldPatientDetailsTab) are UNCHANGED.
        // This block only wraps the existing callbacks (save the original
        // function reference, call it, then refresh reactProps) and
        // dispatches React's actions back into those SAME unchanged
        // functions.
        // ---------------------------------------------------------------

        // item.From/item.To are real plain Date objects (seeded via
        // utl.Formatter.getCurrentDate() and read directly by getList()'s
        // $filter('date') calls) -- normalize to/from an ISO yyyy-MM-dd
        // string only at this bridge boundary so the native DatePicker gets
        // the string shape it expects, without changing what getList()
        // itself receives/sends.
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

        // --- React bridge: wrap the ORIGINAL getListCallback unchanged, then refresh reactProps ---
        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            updateReactProps();
        };

        // --- React bridge: wrap the ORIGINAL lookupCallback unchanged, then refresh reactProps ---
        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            updateReactProps();
        };

        function updateReactProps() {
            $scope.reactProps = {
                item: {
                    MRN: $scope.item.MRN,
                    PatientName: $scope.item.PatientName,
                    Mobile: $scope.item.Mobile,
                    TokenNumber: $scope.item.TokenNumber,
                    From: toIsoDateString($scope.item.From),
                    To: toIsoDateString($scope.item.To)
                },
                patientData: $scope.PatientData || [],
                showNewPatientDetails: $scope.showNewPatientDetails,
                showOldPatientDetails: $scope.showOldPatientDetails,
                isModal: $scope.currentcontext.ismodal
            };
        }

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'filterChange':
                    if (payload.field === 'From' || payload.field === 'To') {
                        $scope.item[payload.field] = fromIsoDateString(payload.value);
                    } else {
                        $scope.item[payload.field] = payload.value;
                    }
                    updateReactProps();
                    // Matches the real template: MRN/PatientName/Mobile/TokenNumber
                    // have no ng-change (only on-enter="getList()"); From/To both
                    // have a real ng-change="getList()" and refetch immediately.
                    if (payload.field === 'From' || payload.field === 'To') {
                        $scope.getList();
                    }
                    break;
                case 'search':
                    // Mirrors the real on-enter="getList()" on the MRN/Name/Mobile/Token boxes.
                    $scope.getList();
                    break;
                case 'openNewPatientDetailsTab':
                    $scope.openNewPatientDetailsTab();
                    updateReactProps();
                    break;
                case 'openOldPatientDetailsTab':
                    $scope.openOldPatientDetailsTab();
                    updateReactProps();
                    break;
                case 'sendPatientData':
                    $scope.sendPatientData(payload.qmsId, payload.patientId, payload.patient);
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };

        updateReactProps();
    }

    QMSPatientController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();