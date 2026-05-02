(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientImmunizationFormController', patientImmunizationFormController);

    function patientImmunizationFormController($scope, $timeout, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, uibButtonConfig) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";

        $scope.item = {
            PerformedDate: utl.Formatter.getCurrentDate(),
            EncounterId: utl.Session.getEncounterId(),
            ImmunizationStatusId: 2,
            ImmunizationTypeId: 1,
            AdministeredById: utl.Session.getCurrentUserId(),
            ImmunizationAdministrationTypeId: 1,
            TotalDosageCount : ''
        };
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            selectedMenu: 'form'
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            if (modalConfig.params.itemid) {
                $scope.item.ImmunizationId = parseInt(modalConfig.params.itemid);
            }

            if (modalConfig.params.context) {
                $scope.currentcontext.selectedMenu = modalConfig.params.context;
            }

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.id = parseInt($stateParams.id);
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        }

        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.topmenus = [
            { key: 'form', name: $translate.instant('patientemr.patientimmunization-form.form-menu.lbl') },
            { key: 'chart', name: $translate.instant('patientemr.patientimmunization-form.chart-menu.lbl') }
        ];

        //Visibility Rules starts

        $scope.canShowFormArea = function () {
            return $scope.currentcontext.selectedMenu == 'form';
        }

        $scope.canShowChartArea = function () {
            return $scope.currentcontext.selectedMenu == 'chart';
        }

        //Visibility Rules ends

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.setFocusTitle();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/patientimmunization/GetPatientImmunizationById',
                    data: { Id: $scope.currentcontext.id },
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
                $timeout(function () {
                    $scope.callTitleFocus();
                }, 1000);
            }
        }
        $scope.callTitleFocus = function () {
            if ($scope.currentcontext.id <= 0) {
                var immztypedom = document.getElementById('immunizationtype');
                if (immztypedom) {
                    var uiSelect = angular.element(immztypedom);
                    var uichild = uiSelect.controller('uiSelect');
                    //uichild.focusser[0].focus();
                    uichild.activate();
                    uichild.close();
                }
            }
        }
        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('patientemr.patientimmunizations', { pid: $scope.currentcontext.pid });
            }
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            var actionName = 'emr/patientimmunization/AddPatientImmunization';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/patientimmunization/UpdatePatientImmunization';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        //setDefaults
        function setDefaults() {
            if ($scope.item.ImmunizationId > 0) {
                var immunization = utl.Lookup.getObject($scope.lookup.Immunization, $scope.item.ImmunizationId);
                $scope.fillMasterInfo(immunization);
            }
            checkSourceandFillData();
        }

        function checkSourceandFillData() {
            if (modalConfig.params.source && modalConfig.params.source == 'immunizationschedule') {
                var dose = modalConfig.params.dose ? modalConfig.params.dose : null;
                if (dose) {
                    var immunization = utl.Lookup.getObject($scope.lookup.Immunization, dose.ImmunizationId);
                    $scope.item.ImmunizationId = immunization.Id;
                    $scope.item.ImmunizationName = immunization.Text;
                    $scope.item.Description = immunization.Description;
                    $scope.item.ImmunizationStatusId = 2; // ADMINISTERED
                    $scope.item.PatientImmunizationScheduleId = dose.Id;
                    $scope.item.TotalDosageCount = dose.DosageId;
                }
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Immunization" },
                { "Key": "Route" },
                { "Key": "Dosage", Default: false },
                { "Key": "ImmunizationType" },
                { "Key": "ImmunizationStatus" },
                { "Key": "ImmunizationAdministrationType" },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: utl.Session.getCurrentUserId()
                        }]
                    },
                    Default: false
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

        $scope.fillMasterInfo = function (selectedItem) {
            $scope.item.ImmunizationName = selectedItem.Text;
            $scope.item.Description = selectedItem.Description;
            $scope.item.RouteId = selectedItem.RouteId;
        }

        $scope.initLookup();
    }

    patientImmunizationFormController.$inject = ['$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'uibButtonConfig'];

})();