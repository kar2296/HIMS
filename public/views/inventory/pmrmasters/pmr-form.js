(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PMRFormController', PMRFormController);

    function PMRFormController($scope, $stateParams, $state, $translate, utl, $filter, Upload) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            PMRCategoryId: -1,
            SpecialityId: -1,
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.currentcontext = {
            id: 0
        };

        $scope.currentcontext.pmrid = parseInt($stateParams.id);
        $scope.pmrDetails = [];
        $scope.PMRInfo = [];

        $scope.addNewLineItem = function() {
            var lineItem = {
                Id: 0,
                ItemMasterId: -1,
                ItemCode: '',
                ItemName: '',
                CategoryId: -1,
                SubCategoryId: -1,
                ProductTypeId: -1,
                SubProductTypeId: -1,
                Quantity: 0,
                IsActive: true,
                Status: 1,
            };

            $scope.pmrDetails.push(lineItem);
        };

        $scope.getPMR = function() {
            if ($scope.currentcontext.pmrid && $scope.currentcontext.pmrid > 0) {
                var inputData = {
                    Params: [{ Key: 0, Value: $scope.currentcontext.pmrid }],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                };
                var options = {
                    action: 'pharmacy/PMR/GetPMRs',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPMRInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPMRInfoCallback = function(scope, res, options, hasError) {
            $scope.PMRInfo = res.Data || [];
            if ($scope.PMRInfo && $scope.PMRInfo.length > 0) {
                $scope.PMRInfo.forEach(pmr => {
                    $scope.item.Id = pmr.Id;
                    $scope.item.PMRId = pmr.Id;
                    $scope.item.PMRCode = pmr.PMRCode;
                    $scope.item.PMRName = pmr.PMRName;
                    $scope.item.PMRCategoryId = pmr.PMRCategoryId;
                    $scope.item.ProcedureId = pmr.ProcedureId;
                    $scope.item.ProcedureName = pmr.ProcedureName;
                    $scope.item.SpecialityId = pmr.SpecialityId;
                    $scope.item.FacilityId = pmr.FacilityId;
                    $scope.item.ActiveStatusId = pmr.ActiveStatusId;
                    $scope.item.IsActive = pmr.IsActive;
                    $scope.item.Status = pmr.Status;

                    $scope.pmrDetails = [];
                    $scope.pmrDetails = pmr.PMRDetails;
                    for (var pmridx in $scope.pmrDetails) {
                        var pmritem = $scope.pmrDetails[pmridx];
                        if (pmritem.ItemMasterId > 0) {
                            if (pmritem.ItemMaster) {
                                pmritem.GenericName = pmritem.ItemMaster.GenericName;
                            }
                            if (pmritem.ProductType) {
                                pmritem.ProductType = pmritem.ProductType.ProductTypeName;
                            }
                            if (pmritem.Quantity) {
                                pmritem.Quantity = parseInt(pmritem.Quantity);
                            }
                        }
                    }
                    $scope.addNewLineItem();
                });
            }
        };

        vm.itemmastercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Product Type', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                { header: 'Generic', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                { header: 'Manufacturer', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselecteditem,
            presearch: presearchitem,
            postsearch: postsearchitem
        };

        function formatselecteditem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.itemmastercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + ' (' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.itemmastercontrolconfig.rowdata) {
                var ItemCode = vm.itemmastercontrolconfig.rowdata.ItemCode;
                if (vm.itemmastercontrolconfig.rowdata.ItemCode === "") {
                    ItemCode = vm.itemmastercontrolconfig.rowdata.ItemCode;
                } else {
                    ItemCode = ' (' + vm.itemmastercontrolconfig.rowdata.ItemCode + ')';
                }
                result = [vm.itemmastercontrolconfig.rowdata.ItemName, ItemCode].join(' ');
            }
            return result;
        }

        function presearchitem() {
            var query = vm.itemmastercontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.itemmastercontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.itemmastercontrolconfig.searchparams = inputData;
        }

        function postsearchitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.itemmastercontrolconfig.result) {
                var item = vm.itemmastercontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                item.GenericName = item.GenericName;
                item.ManufacturerName = item.ManufacturerName;
                item.ProductTypeName = '';
                if (item.ProductType) {
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                }
            }
        }

        $scope.OnItemselected = function(idx, item) {
            var Itemobj = item.SelectedItem;

            item.ItemMasterId = Itemobj.Id;
            item.ItemCode = Itemobj.ItemCode;
            item.ItemName = Itemobj.ItemName;
            item.GenericName = Itemobj.GenericName;
            item.ProductType = '';
            if (Itemobj.ProductType) {
                item.ProductType = Itemobj.ProductType.ProductTypeName;
            }
            item.CategoryId = Itemobj.CategoryId;
            item.SubCategoryId = Itemobj.SubCategoryId;
            item.ProductTypeId = Itemobj.ProductTypeId;
            item.SubProductTypeId = Itemobj.SubProductTypeId;
            item.Quantity = 0;
            item.IsActive = true;
            item.Status = 1;

            $scope.addNewLineItem();
        };

        $scope.clear = function() {
            $scope.pmrDetails = [];
            $scope.addNewLineItem();
        };

        $scope.addNew = function() {
            $scope.addNewLineItem();
        };

        $scope.save = function() {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandapprove = function() {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'pharmacy/PMR/AddPMR';
                if ($scope.currentcontext.pmrid && $scope.currentcontext.pmrid > 0) {
                    actionName = 'pharmacy/PMR/UpdatePMR';
                }

                var inputData = { Header: $scope.item, Details: lines };
                var options = {
                    action: actionName,
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            for (var iddx in $scope.pmrDetails) {
                var iddxitem = $scope.pmrDetails[iddx];
                if (iddxitem.ItemMasterId > 0 && iddxitem.Status === 1) {
                    // utl.Alert.showErrorMsg('Please Enter Qty for ' + iddxitem.ItemName);
                    // return false;
                }
            }

            return true;
        }

        $scope.deletePMRDetail = function(SelectedItem, idx) {
            if (SelectedItem.ItemMasterId > 0) {
                var name = "this item" || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, SelectedItem, name);
            } else {
                utl.Alert.showErrorMsg('This one is Empty Row..');
            }
        };

        $scope.onDeleteConfirmed = function(item) {
            item.Status = 2;
        };

        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Procedure Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Procedure Name', field: 'ProcedureName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/procedure/GetProcedures',
            formatdisplay: formatselectedprocedure,
            presearch: presearchprocedure,
            postsearch: postsearchprocedure
        };

        function formatselectedprocedure() {
            var selectedItem = vm.procedurecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.ProcedureCode = selectedItem.Code;
                result = [selectedItem.ProcedureName].join('  ');
            } else if (vm.procedurecontrolconfig.rowdata) {
                result = [vm.procedurecontrolconfig.rowdata.ProcedureName].join(' ');
            }
            $scope.item.ProcedureName = result;
            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            var inputData = {
                Params: [ /*{ Key: 7, Value: $scope.item.SpecialityId }*/ ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.procedurecontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.procedurecontrolconfig.searchparams = inputData;
        }

        function postsearchprocedure() {
            for (var idx in vm.procedurecontrolconfig.result) {
                var item = vm.procedurecontrolconfig.result[idx];
                item.Code = item.Code;
                item.ProcedureName = item.ProcedureName;
            }
        }

        $scope.backToList = function() {
            $state.go('app.pmrlist');
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.pmrDetails) {
                var item = $scope.pmrDetails[idx];
                if (item.Id > 0) {
                    if (item.ItemMasterId > 0) {
                        result.push(item);
                    }
                } else {
                    if (item.ItemMasterId > 0 && item.Status == 1) {
                        result.push(item);
                    }
                }
            }

            return result;
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($scope.currentcontext.pmrid && $scope.currentcontext.pmrid > 0) {
                $scope.getPMR();
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Procedure" },
                { "Key": "PMRCategory" },
                { "Key": "Department" },
                { "Key": "PaymentType" },
                { "Key": "CurrencyType" }
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

    PMRFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'Upload'];

})();