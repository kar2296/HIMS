(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('prescriptionDetailFormController', prescriptionDetailFormController);

    function prescriptionDetailFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));
        $scope.item = {
            DurationPeriodId: 1,
            StartDate: utl.Formatter.getCurrentDate()
        };

        $scope.currentfilter = {
            GuarantorId: 3,
            PrescriptionPriorityId: 2
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            prescriptiondetail: {},
            isedit: false
        };

        if ($scope.currentcontext.ismodal) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

            if (modalConfig.params.current_item) {
                $scope.item = modalConfig.params.current_item;
            }

            if (modalConfig.params.isedit) {
                $scope.currentcontext.isedit = modalConfig.params.isedit;
            }

            if (modalConfig.params.itemid) {
                $scope.item.DrugId = parseInt(modalConfig.params.itemid);
            }

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/prescriptiondetail/GetPrescriptionDetailById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            }
        }

        //computeQuantity
        $scope.computeQuantity = function (item) {
            if (item.DrugFrequencyId != -1 && item.Duration && item.DurationPeriodId != -1) {
                var drugFrequencyObj = utl.Lookup.getObject($scope.lookup.DrugFrequency, item.DrugFrequencyId);
                var noOfTimes = drugFrequencyObj.NoOfTimes;
                var totalDays = 0;
                if (item.DurationPeriodId == 1) { //Days
                    totalDays = item.Duration * 1;
                } else if (item.DurationPeriodId == 2) { //Weeks
                    totalDays = item.Duration * 7;
                } else if (item.DurationPeriodId == 3) { //Months
                    totalDays = item.Duration * 30;
                }

                item.Quantity = noOfTimes * totalDays;
            }
        }

        $scope.saveItem = function () {
            $scope.confirmCallback($scope.item);
        }

        //setDefaults
        function setDefaults() {
            if ($scope.item.DrugId > 0) {
                var drug = utl.Lookup.getObject($scope.lookup.Drug, $scope.item.DrugId);
                $scope.fillMasterInfo(drug);
            }
        }

        $scope.fillMasterInfo = function (selectedItem) {
            $scope.item.DrugFrequencyId = selectedItem.DrugFrequencyId;
            $scope.item.DrugRouteId = selectedItem.DrugRouteId;
            $scope.item.GenericId = selectedItem.GenericId;
            $scope.item.DrugFormId = selectedItem.DrugFormId;
            $scope.item.RxName = selectedItem.DrugName;
            // $scope.item.GenericMaster = item.GenericMaster;
            // $scope.item.DrugForm = item.DrugForm;
            // $scope.item.DrugFrequency = item.DrugFrequency.Name;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            //set default while adding alone
            if (!$scope.currentcontext.isedit) {
                setDefaults();
            }
        }
        //autosearch related code starts for DIAGNOSIS
        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'DiagnosisName', field: 'DiagnosisName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Version', field: 'Version', datatype: 'string', headercls: 'td-Version', fieldcls: 'td-Version' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-Speciality', fieldcls: 'td-Speciality' },
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
                result = [selectedItem.DiagnosisName, selectedItem.Code].join('  ');
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
                item.DiagnosisVersion = item.DiagnosisVersion.Description;
                item.Speciality = item.Speciality;
            }
        }
        //autosearch related code ends for Diagnosis
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Drug" },
                { "Key": "DrugFrequency" },
                { "Key": "DrugRoute" },
                { "Key": "DurationPeriod", Default: false },
                { "Key": "Pharmacy" },
                { "Key": "DrugForm" },
                { "Key": "PrescriptionPriority" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "SubstitutionAllowed", Default: false },
                { "Key": "YesNo", Default: false }
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

    prescriptionDetailFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();