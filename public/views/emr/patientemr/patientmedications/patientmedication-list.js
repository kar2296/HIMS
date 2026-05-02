(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientMedicationListController', patientMedicationListController);

    function patientMedicationListController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: '',
            DrugId: -1
        };
        $scope.currentcontext = {};
        $scope.item = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        };

        // $scope.backToList = function () {
        //     $state.go('patientemr.pmhxdashboard');
        // }

        // $scope.dashboard = function () {
        //     $state.go('patientemr.patientdashboard');
        // }

        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.medicationDetails = [];

        $scope.addNewLineItem = function () {
            var medicationDetail = getMedicationDetail();
            $scope.medicationDetails.push(medicationDetail);
        }

        function getMedicationDetail() {
            var medicationDetail = {
                Id: 0,
                PatientId: $scope.currentcontext.pid,
                DrugId: -1,
                IsGeneric: false,
                GenericId: -1,
                Dosage: '',
                Morning: 1,
                Noon: 1,
                Night: 1,
                PatientMedicationStatusId: 1,
                Status: 1
            };
            return medicationDetail;
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }

        //Grid Actions
        $scope.addNew = function () {
            var detail = getMedicationDetail();
            utl.Modal.open('patientemr.patientmedicationdetail', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.pid,
                    current_item: detail
                },
                confirmCallback: $scope.onDetailSave
            });
        }

        $scope.drugChanged = function (idx) {
            var lastIndex = $scope.medicationDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        }

        vm.drugcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Code',
                    field: 'DrugCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Name',
                    field: 'DrugName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Qty',
                    field: 'Quantity',
                    datatype: 'string',
                    headercls: 'td-qty',
                    fieldcls: 'td-qty'
                },
                {
                    header: 'Mrp',
                    field: 'MrPrice',
                    datatype: 'string',
                    headercls: 'td-mrp',
                    fieldcls: 'td-mrp'
                },
                {
                    header: 'Generic',
                    field: 'GenericMaster',
                    datatype: 'string',
                    headercls: 'td-generic',
                    fieldcls: 'td-generic'
                }
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
                Params: [{
                    Key: 5,
                    Value: $scope.item.PharmacyId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.drugcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                }, {
                    Key: 6,
                    Value: true
                });
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
                    item.MrPrice = parseFloat(item.ItemMaster.MrPrice).toFixed(2);
                }
                if (item.GenericMaster)
                    item.GenericMaster = item.GenericMaster.GenericName;
                if (item.DrugForm)
                    item.DrugForm = item.DrugForm.Description;
            }
        }


        vm.genericcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Name',
                    field: 'GenericName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                }
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/GenericMaster/GetGenericMasters',
            formatdisplay: formatselectedgenerics,
            presearch: presearchgenerics,
            postsearch: postsearchgenerics
        };

        function formatselectedgenerics() {
            var selectedItem = vm.genericcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.GenericName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.genericcontrolconfig.rowdata) {
                result = [vm.genericcontrolconfig.rowdata.Code, vm.genericcontrolconfig.rowdata.GenericName].join(' ');
            }
            return result;
        }

        function presearchgenerics() {
            var query = vm.genericcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.genericcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.genericcontrolconfig.searchparams = inputData;
        }

        function postsearchgenerics() {
            for (var idx in vm.genericcontrolconfig.result) {
                var item = vm.genericcontrolconfig.result[idx];
                item.GenericCode = item.Code;
                item.GenericName = item.GenericName;
            }
        }


        $scope.print = function () {
            utl.Modal.open('app.appointmentprint', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        }


        $scope.openattachments = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: {
                        pid: $scope.item.PatientId,
                        itemid: $scope.item.Id
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        }

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.medicationDetails) {
                var item = $scope.medicationDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                $scope.medicationDetails.push(itemFromModal);
            }
        }

        $scope.editMedicationDetail = function (item) {
            item.currenteditable = true;

            utl.Modal.open('patientemr.patientmedicationdetail', {
                params: {
                    id: item.Id,
                    pid: $scope.currentcontext.pid,
                    current_item: item
                },
                confirmCallback: $scope.onDetailSave
            });
        }

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        }
        //deleteLineItem
        $scope.deleteMedicationDetail = function (idx, item) {
            var name = item.DrugId || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }

        $scope.getItemsCallback = function (scope, res, options, hasError) {
            $scope.medicationDetails = res.Data || [];
            $scope.addNewLineItem();
        };
        $scope.getItems = function (pageNo) {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.DrugId
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientmedication/GetPatientMedications',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveItemsCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItems = function () {

            // if(!utl.Validator.validate($scope)) {
            //     return;
            // }

            //Check Mandatory values
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'emr/patientmedication/UpdatePatientMedication';

                var inputData = {
                    Details: lines
                };
                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemsCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.medicationDetails, [{
                search: 1,
                fields: ['Status']
            }]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if ((item.DrugId > 0 || item.GenericId > 0) && (!item.Dosage || !item.StartDate ||
                        item.DrugFrequencyId == -1)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.medicationDetails) {
                var item = $scope.medicationDetails[idx];
                if (item.DrugId > 0 || item.GenericId > 0) {
                    item.EncounterId = utl.Session.getEncounterId();
                    result.push(item);
                }
            }
            return result;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItems();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Drug"
                },
                {
                    "Key": "DrugRoute"
                },
                {
                    "Key": "DrugFrequency"
                },
                {
                    "Key": "PatientMedicationStatus"
                }
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

    patientMedicationListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();