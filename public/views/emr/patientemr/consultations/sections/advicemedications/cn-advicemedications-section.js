(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnAdviceMedicationSectionController', cnAdviceMedicationSectionController);

    function cnAdviceMedicationSectionController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.AdviceMedications = [];
        $scope.Item = [];
        $scope.item = {}
        $scope.IsDisabled = false;
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
        }

        $scope.addNewLineItem = function () {
            var medicationdetail = {
                Id: 0,
                DrugId: -1,
                IsFreeText: false,
                DrugName: '',
                Dosage: '',
                DrugRouteId: -1,
                MorningFrequency: false,
                AfterNoonFrequency: false,
                EveningFrequency: false,
                NightFrequency: false,
                Duration: 0,
                DurationPeriodId: 1,
                DrugInstructionId: -1,
                Status: 1,
            };
            $scope.AdviceMedications.push(medicationdetail);
        };

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.AdviceMedications = [];
                $scope.AdviceMedications = res.Data;
                $scope.IsDisabled = false;
                $scope.addNewLineItem();
            }
             else
                $scope.addNewLineItem();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.pid },
                    { Key: 2, Value: $scope.currentcontext.eid },
                    { Key: 3, Value: $scope.currentcontext.cid },
                ]
            };
            var options = {
                action: 'emr/PatientAdviceMedication/GetPatientAdviceMedications',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.mornfreq = function (item) {
            if (item.MorningFrequency) {
                item.MorningFrequency = false;
            } else {
                item.MorningFrequency = true;
            }
        };
        $scope.aftfreq = function (item) {
            if (item.AfterNoonFrequency) {
                item.AfterNoonFrequency = false;
            } else {
                item.AfterNoonFrequency = true;
            }
        };
        $scope.evefreq = function (item) {
            if (item.EveningFrequency) {
                item.EveningFrequency = false;
            } else {
                item.EveningFrequency = true;
            }
        };
        $scope.nightfreq = function (item) {
            if (item.NightFrequency) {
                item.NightFrequency = false;
            } else {
                item.NightFrequency = true;
            }
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.DeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/PatientAdviceMedication/DeletePatientAdviceMedication',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.deletePrescriptionDetail = function (idx, selectedItem) {
            utl.Dialog.confirmDelete($scope.DeleteConfirmed, selectedItem.Id);
        };

        $scope.drugChanged = function (idx, item) {
            item.DrugCode = item.SelectedItem.DrugCode;
            item.DrugName = item.SelectedItem.DrugName;
            item.Dosage = item.SelectedItem.Dosage;
            item.DrugRouteId = item.SelectedItem.DrugRouteId;
            item.Duration = item.SelectedItem.Duration;
            item.DurationPeriodId = item.SelectedItem.DurationPeriodId;
            if (item.DurationPeriodId == 0 || item.DurationPeriodId == null ||
                item.DurationPeriodId == -1 || item.DurationPeriodId == undefined ||
                item.DurationPeriodId == '' || item.DurationPeriodId == NaN) {
                    item.DurationPeriodId = 1;
                }
            item.DrugInstructionId = item.SelectedItem.DrugInstructionId;
            if (item.DrugInstructionId == 0 || item.DrugInstructionId == null ||
                item.DrugInstructionId == -1 || item.DrugInstructionId == undefined ||
                item.DrugInstructionId == '' || item.DrugInstructionId == NaN) {
                    item.DrugInstructionId = 1;
                }

            var activeRecords = $filter('filterArrayItems')($scope.AdviceMedications, [
                { search: 1, fields: ['Status'] }
            ]);
            var lastIndex = activeRecords.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        };

        vm.drugcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'DrugCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'DrugName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qty', field: 'Quantity', datatype: 'string', headercls: 'td-qty', fieldcls: 'td-qty' },
                { header: 'Type', field: 'DrugType', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                { header: 'Generic', field: 'GenericMaster', datatype: 'string', headercls: 'td-generic', fieldcls: 'td-generic' },
                { header: 'Forms', field: 'DrugForm', datatype: 'string', headercls: 'td-form', fieldcls: 'td-form' },
                { header: 'Frequency', field: 'DrugFrequency', datatype: 'string', headercls: 'td-frequency', fieldcls: 'td-frequency' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/DrugMaster/GetDrugMasters',
            formatdisplay: formatselecteddrugs,
            presearch: presearchdrugs,
            postsearch: postsearchdrugs
        };

        function formatselecteddrugs() {
            var selectedItem = vm.drugcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DrugName + '(' + selectedItem.DrugCode + ')'].join('  ');
            } else if (vm.drugcontrolconfig.rowdata) {
                result = [vm.drugcontrolconfig.rowdata.DrugCode, vm.drugcontrolconfig.rowdata.DrugName].join(' ');
            }
            return result;
        }

        function presearchdrugs() {
            var query = vm.drugcontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.drugcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query }, { Key: 6, Value: query });
            }
            vm.drugcontrolconfig.searchparams = inputData;
        }

        function postsearchdrugs() {
            for (var idx in vm.drugcontrolconfig.result) {
                var item = vm.drugcontrolconfig.result[idx];
                item.DrugCode = item.DrugCode;
                item.DrugName = item.DrugName;
                if (item.DrugType)
                    item.DrugType = item.DrugType.Description;
                if (item.ItemMaster) {
                    if (item.ItemMaster.StockItem) {
                        item.Quantity = item.ItemMaster.StockItem.Quantity;
                    }
                }
                if (item.GenericMaster)
                    item.GenericMaster = item.GenericMaster.GenericName;
                if (item.DrugForm)
                    item.DrugForm = item.DrugForm.Description;
                if (item.DrugFrequency)
                    item.DrugFrequency = item.DrugFrequency.Name;
            }
        }

        $scope.backToList = function () {
            $state.go('patientemr.dischargecasesheets', { pid: $scope.currentcontext.pid });
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            //$scope.backToList();
            $scope.getList();
        };
        $scope.saveItem = function () {
            $scope.Item = [];
            for (var idx in $scope.AdviceMedications) {
                if ($scope.AdviceMedications[idx].DrugName != '' ) {
                    var advicemedication = {
                        Id: $scope.AdviceMedications[idx].Id || 0,
                        PatientId: $scope.currentcontext.pid,
                        EncounterId: $scope.currentcontext.eid,
                        ConsultationId: $scope.currentcontext.cid,
                        DrugId: $scope.AdviceMedications[idx].DrugId,
                        IsFreeText: $scope.AdviceMedications[idx].IsFreeText,
                        DrugName: $scope.AdviceMedications[idx].DrugName,
                        Dosage: $scope.AdviceMedications[idx].Dosage,
                        MorningFrequency: $scope.AdviceMedications[idx].MorningFrequency,
                        AfterNoonFrequency: $scope.AdviceMedications[idx].AfterNoonFrequency,
                        EveningFrequency: $scope.AdviceMedications[idx].EveningFrequency,
                        NightFrequency: $scope.AdviceMedications[idx].NightFrequency,
                        Duration: $scope.AdviceMedications[idx].Duration,
                        DurationPeriod: $scope.AdviceMedications[idx].DurationPeriod,
                        DurationPeriodId: $scope.AdviceMedications[idx].DurationPeriodId,
                        DrugInstructionId: $scope.AdviceMedications[idx].DrugInstructionId,
                        DietAdvice: $scope.item.DietAdvice
                    }
                    $scope.Item.push(advicemedication);
                }
            }
            var options = {
                action: 'emr/PatientAdviceMedication/ManagePatientAdviceMedications',
                data: { Data: $scope.Item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };
        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DrugRoute" },
                { "Key": "DrugInstruction" },
                { "Key": "DurationPeriod", Default: false },
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

    cnAdviceMedicationSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();