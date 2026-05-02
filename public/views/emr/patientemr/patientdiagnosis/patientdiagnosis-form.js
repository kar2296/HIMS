(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientDiagnosisFormController', patientDiagnosisFormController);

    function patientDiagnosisFormController($scope, $interval, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            ConditionDate: utl.Formatter.getCurrentDate(),
            EncounterId: utl.Session.getEncounterId(),
            ConditionStatusId: 1,
            ConditionTypeId: 1
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            if (modalConfig.params.itemid) {
                $scope.item.DiagnosisId = parseInt(modalConfig.params.itemid);
            }

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.id = parseInt($stateParams.id);
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        }

        $scope.item.PatientId = $scope.currentcontext.pid;


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/patientcondition/GetPatientConditionById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
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
                var uiSelect = angular.element(document.getElementById('conditiontype'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }
            $interval.cancel($scope.startinterval);
        }
        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('patientemr.patientconditions', { pid: $scope.currentcontext.pid });
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
            var details = setDefaults();
            var actionName = 'emr/patientcondition/AddPatientCondition';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/patientcondition/UpdatePatientCondition';
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
            if ($scope.item.DiagnosisId > 0) {
                var details = '';
                if ($scope.item.DiagnosisName) details += $scope.item.DiagnosisName;
                if ($scope.item.CategoryId > 0) {
                    var condition = utl.Lookup.getObject($scope.lookup.DiagnosisCategory, $scope.item.CategoryId);
                    if (condition.Text) details += '-' + condition.Text;
                }
                if ($scope.item.TypeId > 0) {
                    var condition = utl.Lookup.getObject($scope.lookup.DiagnosisType, $scope.item.TypeId);
                    if (condition.Text) details += '-' + condition.Text;
                }
                if ($scope.item.GradeId > 0) {
                    var condition = utl.Lookup.getObject($scope.lookup.Grade, $scope.item.GradeId);
                    if ($scope.item.selectedItem.Grade) details += '-' + $scope.item.selectedItem.Grade;
                }
                if ($scope.item.SideId > 0) {
                    var condition = utl.Lookup.getObject($scope.lookup.Side, $scope.item.SideId);
                    if ($scope.item.selectedItem.Side) details += '-' + $scope.item.selectedItem.Side;
                }
                $scope.item.DiagnosisDetails = details;
            }
        }
        //autosearch related code starts for Diagnosis
        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'DiagnosisName', field: 'DiagnosisName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Version', field: 'Version', datatype: 'string', headercls: 'td-Version', fieldcls: 'td-Version' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-Speciality', fieldcls: 'td-Speciality' },
                { header: 'Category', field: 'Category', datatype: 'string', headercls: 'td-Category', fieldcls: 'td-Category' },
                { header: 'Type', field: 'Type', datatype: 'string', headercls: 'td-Type', fieldcls: 'td-Type' },
                { header: 'Side', field: 'Side', datatype: 'string', headercls: 'td-Side', fieldcls: 'td-Side' },
                { header: 'Grade', field: 'Grade', datatype: 'string', headercls: 'td-Grade', fieldcls: 'td-Grade' },
                { header: 'Position', field: 'Position', datatype: 'string', headercls: 'td-Type', fieldcls: 'td-Type' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/diagnosis/GetDiagnosiss',
            formatdisplay: formatselecteddiagnosis,
            presearch: presearchdiagnosis,
            postsearch: postsearchdiagnosis
        };
        function formatselecteddiagnosis() {
            var selectedItem = vm.diagnosiscontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DiagnosisName].join('  ');
            } else if (vm.diagnosiscontrolconfig.rowdata) {
                result = [vm.diagnosiscontrolconfig.rowdata.Code, vm.diagnosiscontrolconfig.rowdata.DiagnosisName,
                vm.diagnosiscontrolconfig.rowdata.DiagnosisVersionId, vm.diagnosiscontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }
        function presearchdiagnosis() {

            var query = vm.diagnosiscontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.diagnosiscontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.diagnosiscontrolconfig.searchparams = inputData;
        }

        function postsearchdiagnosis() {

            for (var idx in vm.diagnosiscontrolconfig.result) {

                var item = vm.diagnosiscontrolconfig.result[idx];
                item.Code = item.Code;
                item.DiagnosisName = item.DiagnosisName;
                if (item.DiagnosisVersion)
                    item.Version = item.DiagnosisVersion.Description;
                item.Speciality = item.Speciality;
                if (item.DiagnosisCategory)
                    item.Category = item.DiagnosisCategory.Description;
                if (item.DiagnosisType)
                    item.Type = item.DiagnosisType.Description;
                if (item.Side)
                    item.Side = item.Side.Description;
                if (item.Grade)
                    item.Grade = item.Grade.Description;
                if (item.TestMasterPosition)
                    item.Position = item.TestMasterPosition.Description;
            }
        }
        // autosearch related code ends for Diagnosis
        $scope.getDiagnosis = function () {
            $scope.Diagnosis = $scope.item.selectedItem;
            $scope.item.Description = $scope.Diagnosis.Description;
            $scope.item.Code = $scope.Diagnosis.Code;
            $scope.item.DiagnosisName = $scope.Diagnosis.DiagnosisName;
            $scope.item.BodySite = $scope.Diagnosis.BodySite;
            $scope.item.SideId = $scope.Diagnosis.SideId;
            $scope.item.CategoryId = $scope.Diagnosis.CategoryId;
            $scope.item.TypeId = $scope.Diagnosis.TypeId;
            $scope.item.GradeId = $scope.Diagnosis.GradeId;
            $scope.item.TestMasterPositionId = $scope.Diagnosis.TestMasterPositionId;
            var details = '';
            if ($scope.Diagnosis.DiagnosisName) details += $scope.Diagnosis.DiagnosisName;
            if ($scope.Diagnosis.Category) details += '-' + $scope.Diagnosis.Category;
            if ($scope.Diagnosis.Type) details += '-' + $scope.Diagnosis.Type;
            if ($scope.Diagnosis.Grade) details += '-' + $scope.Diagnosis.Grade;
            if ($scope.Diagnosis.Side) details += +'-' + $scope.Diagnosis.Side;
            $scope.item.DiagnosisDetails = details;
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Diagnosis" },
                { "Key": "ConditionType" },
                { "Key": "ConditionStatus" },
                { "Key": "BodySite" },
                { "Key": "DiagnosisCategory" },
                { "Key": "DiagnosisType" },
                { "Key": "Grade" },
                { "Key": "Side", Default: false },
                { "Key": "TestMasterPosition", Default: false },
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
            $scope.item.Code = selectedItem.Code;
            $scope.item.DiagnosisName = selectedItem.DiagnosisName;
            $scope.item.Description = selectedItem.Description;
        }

        $scope.initLookup();
    }

    patientDiagnosisFormController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();