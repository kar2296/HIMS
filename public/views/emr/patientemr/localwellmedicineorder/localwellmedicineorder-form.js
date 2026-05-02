(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('localwellmedicineorderFormController', localwellmedicineorderFormController);

    function localwellmedicineorderFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, lodash, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {};

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.surgeryid) {
            $scope.currentcontext.surgeryid = $stateParams.surgeryid;
        }
        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.PatientIndentDetails = [];

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.ProductDetails = [];
        $scope.selectedPatient = {};
        $scope.lookup = {};

        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.item.CustomerId = $scope.selectedPatient.CustomerId;
            $scope.item.MRN = $scope.selectedPatient.MRN;
        };

        function checkExist(item) {
            for (var idx in $scope.ProductDetails) {
                if ((item.medicine_id == $scope.ProductDetails[idx].medicine_id) && ($scope.ProductDetails[idx].Status == 1)) {
                    return true;
                }
            }
            return false;
        }

        $scope.addNew = function () {
            $state.go('patientemr.localwellmedicineorderform', {
                id: 0
            });
        }

        $scope.Clear = function () {
            document.getElementById("item_form").reset();
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }

        $scope.backToList = function () {
            if ($scope.Context == 'ipemr' || !$scope.Context) {
                $state.go('patientemr.localwellmedicineorder');
            }
        };


        $scope.addNewLineItem = function () {
            // don't add another empty row if last row is still empty
            var lastIndex = $scope.ProductDetails.length - 1;
            if (lastIndex >= 0) {
                var last = $scope.ProductDetails[lastIndex];
                if (!last) { /* continue to add */ }
                else {
                    var hasValue = (last.medicine_id && last.medicine_id > 0) || (last.medicine_name && last.medicine_name.length > 0);
                    if (!hasValue) {
                        // last row is empty — don't add another
                        return;
                    }
                }
            }

            var ProductDetail = {
                medicine_id: 0,
                medicine_name: '',
                sale_rate: 0,
                RequestedQuantity: 0,
                front_medicine_image_url: null,
                Status: 1
            };
            $scope.ProductDetails.push(ProductDetail);
            $scope.updateSNo();
        };

        $scope.updateSNo = function () {
            for (var i = 0; i < $scope.ProductDetails.length; i++) {
                $scope.ProductDetails[i].SNo = i + 1;
            }
        };

        $scope.SaveandApprove = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are you sure! You want to Order Medicine?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            $scope.saveItem();
        };

        $scope.saveItem = function () {
            if (!$scope.ProductDetails || $scope.ProductDetails.length === 0) {
                utl.Alert.showErrorMsg('Please select at least one medicine');
                return false;
            }

            var lines = getLinesForSave();
            if (lines.length === 0) {
                utl.Alert.showErrorMsg('Please enter valid quantity');
                return false;
            }

            var inputData = {
                CustomerId: $scope.item.CustomerId || null,
                Products: lines,
                OrderNotes: $scope.item.OrderNotes || '',
                PatientId: $scope.item.PatientId
            };

            var options = {
                action: 'Registration/LocalWellCustomerOrder/AddCustomerOrder',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        function getLinesForSave() {
            var result = [];
            var hasError = false;

            for (var idx in $scope.ProductDetails) {
                var item = $scope.ProductDetails[idx];

                // if medicine is selected but no quantity → error
                if (item.medicine_id > 0) {
                    if (!item.RequestedQuantity || item.RequestedQuantity <= 0) {
                        utl.Alert.showErrorMsg('Please enter quantity for ' + (item.medicine_name || 'selected medicine'));
                        hasError = true;
                        break;
                    }
                    result.push({
                        medicine_id: item.medicine_id,
                        order_quantity: item.RequestedQuantity,
                        sale_rate: item.sale_rate
                    });
                }
            }

            if (hasError) {
                return [];
            }

            return result;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.getencountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var encounter = data.Data[0];
                $scope.item.EncounterId = encounter.Id
                $scope.item.AdmissionStatusId = encounter.AdmissionStatusId
            }
            $scope.addNewLineItem();
        };

        $scope.getEncounterById = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.eid
                },]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.ProductDetails.length - 1;
            if (lastIndex >= 0) {
                var last = $scope.ProductDetails[lastIndex];
                if (last && (!last.medicine_id || last.medicine_id === 0) && (!last.medicine_name || last.medicine_name.length === 0)) {
                    return; // don’t add duplicate empty row
                }
            }

            var ProductDetail = {
                rowId: Date.now() + Math.random(), // 👈 unique stable id
                medicine_id: 0,
                medicine_name: '',
                sale_rate: 0,
                RequestedQuantity: 0,
                Status: 1
            };
            $scope.ProductDetails.push(ProductDetail);
            $scope.updateSNo();
        };


        $scope.updateSNo = function () {
            for (var i = 0; i < $scope.ProductDetails.length; i++) {
                $scope.ProductDetails[i].SNo = i + 1;
            }
        };

        $scope.onItemSelected = function (idx, selectedItem) {
            // Only act when user actually selected something
            if (!selectedItem || !selectedItem.SelectedItem) return;

            var SelectedMasterItem = selectedItem.SelectedItem;

            // check duplicate excluding current index
            var exists = $scope.ProductDetails.some(function (p, i) {
                return (i !== idx) && p.medicine_id && (p.medicine_id === SelectedMasterItem.medicine_id);
            });

            if (exists) {
                utl.Alert.showErrorMsg('This medicine is already added.');
                // clear selection on this row so user can pick another medicine
                selectedItem.medicine_id = 0;
                selectedItem.medicine_name = '';
                selectedItem.sale_rate = 0;
                selectedItem.SelectedItem = null;
                selectedItem.front_medicine_image_url = null;
                return;
            }

            // set values on the row
            selectedItem.medicine_id = SelectedMasterItem.medicine_id;
            selectedItem.medicine_name = SelectedMasterItem.medicine_name;
            selectedItem.sale_rate = SelectedMasterItem.sale_rate || selectedItem.sale_rate;
            selectedItem.front_medicine_image_url = SelectedMasterItem.front_medicine_image_url || null;
            selectedItem.Status = 1;

            $scope.updateSNo();

            // If this was the last row, add a new empty row for next input
            var lastIndex = $scope.ProductDetails.length - 1;
            if (idx === lastIndex) {
                $scope.addNewLineItem();
            }
        };

        $scope.deletePatientRequestDetail = function (idx, row) {
            if (!row || row.medicine_id === 0) {
                utl.Alert.showErrorMsg('Empty row cannot be deleted.');
                return;
            }

            var name = row.medicine_name || 'this item';
            var payload = { __rowId: row.rowId };
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, payload, name);
        };

        $scope.onDeleteConfirmed = function (payload) {
            var rowId = payload.__rowId;

            $scope.ProductDetails = $scope.ProductDetails.filter(function (p) {
                return p.rowId !== rowId;
            });

            // Always ensure last row is empty
            if ($scope.ProductDetails.length === 0) {
                $scope.addNewLineItem();
            } else {
                var last = $scope.ProductDetails[$scope.ProductDetails.length - 1];
                if (last.medicine_id > 0 || (last.medicine_name && last.medicine_name.length > 0)) {
                    $scope.addNewLineItem();
                }
            }

            $scope.updateSNo();
        };

        vm.pharmacyitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Medicine Form',
                field: 'medicine_form',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Medicine Name',
                field: 'medicine_name',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Sale Rate',
                field: 'sale_rate',
                datatype: 'string',
                headercls: 'td-stockinhand',
                fieldcls: 'td-stockinhand'
            },
            ],
            searchparams: {},
            result: {},
            api: 'Registration/LocalWellCustomerOrder/SearchMedicine',
            formatdisplay: formatselectedpharmacyitem,
            presearch: presearchpharmacyitem,
            postsearch: postsearchpharmacyitem
        };

        function formatselectedpharmacyitem() {
            var selectedItem = vm.pharmacyitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.medicine_name, '(', selectedItem.medicine_form, ')'].join(' ');
            }
            // else if (vm.pharmacyitemcontrolconfig.rowdata) {
            //     result = [vm.pharmacyitemcontrolconfig.rowdata.medicine_name, vm.pharmacyitemcontrolconfig.rowdata.medicine_form].join(' ');
            // }
            return result;
        }

        function presearchpharmacyitem() {
            var query = vm.pharmacyitemcontrolconfig.query;
            var inputData = {
                Data: {
                    MedicineName: ''
                }
            };

            if (query && query.length > 2) {
                inputData.Data.MedicineName = query
            }

            vm.pharmacyitemcontrolconfig.searchparams = inputData;
        }

        function postsearchpharmacyitem() {
            for (var idx in vm.pharmacyitemcontrolconfig.result) {
                var item = vm.pharmacyitemcontrolconfig.result[idx];
                item.medicine_form = item.medicine_form;
                item.medicine_name = item.medicine_name;
                item.sale_rate = item.sale_rate;
            }
        }

        $scope.canShowPatientBanner = function () {
            if (this.item.PatientId > 0) {
                return true;
            }
            return false;
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getEncounterById();
            $scope.patientChange();
        };

        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,

                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        };

        $scope.initAllLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            ];
            $scope.lookupCall(inputData);
        };

        $scope.initAllLookup();
    }

    localwellmedicineorderFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', 'lodash', '$uibModalInstance', 'modalConfig'];

})();