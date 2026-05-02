(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientOrderDetailFormController', patientOrderDetailFormController);

    function patientOrderDetailFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Quantity: 1,
            TestPrice: 10,
            Discount: 0,
            TaxCost: 0,
            NetAmount: 10,
            Status: 1
        };
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));
        $scope.item.IsDisabled = false;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if ($scope.currentcontext.ismodal) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

            if (modalConfig.params.current_item) {
                $scope.item = modalConfig.params.current_item;
            }

            if (modalConfig.params.itemid) {
                $scope.item.TestId = parseInt(modalConfig.params.itemid);
                $scope.item.TestTypeId = parseInt(modalConfig.params.testtypeid);
            }

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item.PatientId = $scope.currentcontext.pid;

        //computeNetAmount
        $scope.computeNetAmount = function (item) {
            if (item.TestPrice && item.Quantity) {
                item.NetAmount = item.TestPrice * item.Quantity;
            }
        }


        $scope.saveItem = function () {
            $scope.confirmCallback($scope.item);
        }

        //setDefaults
        function setDefaults() {
            if ($scope.item.TestId > 0) {
                var test = utl.Lookup.getObject($scope.lookup.TestMaster, $scope.item.TestId);
                $scope.fillMasterInfo(test);
            }
        }

        var sort_by = function (field, reverse, primer) {
            var key = primer ?
                function (x) { return primer(x[field]) } :
                function (x) { return x[field] };

            reverse = !reverse ? 1 : -1;

            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }
        //Load patient guarantors
        $scope.loadPatientGuarantorsCallback = function (scope, data, options, hasError) {
            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;

            if (!$scope.item.GuarantorId) {
                $scope.item.GuarantorId = utl.Lookup.getDefault($scope.lookup.PatientGuarantor, 'SELF');
            }
        }

        $scope.loadPatientGuarantors = function () {
            //Get only active guarantors - 2
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {
                var inputData = [
                    { Key: "PatientGuarantor", Request: { Params: [{ Key: 1, Value: 2 }, { Key: 2, Value: $scope.currentcontext.pid }] } }
                ];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.loadPatientGuarantorsCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.fillMasterInfo = function (selectedItem) {
            $scope.item.TestName = selectedItem.Name;
            $scope.item.TestCode = selectedItem.Code;
            $scope.item.TestDescription = selectedItem.Description;
            $scope.item.SpecimanId = selectedItem.SampletypeId;
            // $scope.item.SideId = selectedItem.SideId;
            // $scope.item.TestMasterPositionId = selectedItem.TestMasterPositionId
            // $scope.item.Quantity = 1;
            // $scope.item.TestPrice = 10;
            // $scope.item.Discount = 0;
            // $scope.item.TaxCost = 0;
            // $scope.item.NetAmount = 10;
            // $scope.item.Status = 1;
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
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.loadPatientGuarantors();
            setDefaults();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OrderPriority" },
                { "Key": "TestMaster" },
                {
                    "Key": "SampleMaster",
                    Request: {
                        Params: [{ Key: 3, Value: 2 }]
                    }
                },
                // { "Key": "Diagnosis" },
                { "Key": "BodySite" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "OrderStatus" },
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

        $scope.initLookup();
    }

    patientOrderDetailFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();