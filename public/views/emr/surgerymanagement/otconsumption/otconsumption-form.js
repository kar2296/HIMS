(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OTConsumptionFormController', OTConsumptionFormController);

    function OTConsumptionFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.tabindexmap = {
            consumptiontabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            StoreTypeId: 0,
            ConsumptionTypeId: 2,
            ProductTypeId: -1,
            TotalGrossAmount: 0,
            TotalDiscountAmount: 0,
            TotalGstAmount: 0,
            TotalNetAmount: 0,
            Comments: null,
            isDisabled: false,
            StockConsumptionNumber: null,
            DisplayConsumptionStatus: null
        };

        $scope.lookup = {};
        $scope.itemUsedBatches = {};
        $scope.currentcontext = {
            id: -1
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.consumptionattachments', {
                params: { stockconsumptionid: 0, itemmasterid: 0 },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.CanApprove = utl.Privilege.hasPrivilege('CanApprove');
        $scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint');
        $scope.currentcontext.CanSave = utl.Privilege.hasPrivilege('CanSave');
        $scope.currentcontext.CanAuthorize = utl.Privilege.hasPrivilege('CanAuthorize');
        $scope.currentcontext.CanAttachment = utl.Privilege.hasPrivilege('CanAttachment');
        $scope.currentcontext.CanDelete = utl.Privilege.hasPrivilege('CanDelete');
        $scope.currentcontext.CanAddNew = utl.Privilege.hasPrivilege('CanAddNew');
        $scope.currentcontext.CanHistory = utl.Privilege.hasPrivilege('CanHistory');
        $scope.item.ConsumptionDate = utl.Formatter.getCurrentDate();
        $scope.item.StoreName = '';
        $scope.stockconsumptionDetails = [];

        $scope.canShowPrintBtn = true;
        $scope.canShowSaveBtn = true;
        $scope.canShowSaveandApproveBtn = true;
        $scope.canShowAuthorizeBtn = true;
        $scope.canShowClearBtn = true;
        $scope.canShowCancelBtn = false;

        // Patient Autosearch Start
        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Title', field: 'Title', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'PatientName', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Age/Gender', field: 'Age', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'DOB', field: 'DOB', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'MRN', field: 'MRN', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Visit#', field: 'VisitIdentifier', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Ward/Room/Bed', field: 'WardDetail', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
            ],
            searchparams: {},
            result: {},
            api: 'Encounter/Visit/GetEncounters',
            presearch: presearchEncounter,
            formatdisplay: formatselectedEncounter,
            postsearch: postsearchEncounter
        };

        function formatselectedEncounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            if (selectedItem) {
                if (selectedItem.IsBillLock) {
                    var msg = 'Bill has been Locked';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    //$scope.item = {};
                }
                else if (selectedItem.IsBillFinalized) {
                    var msg = 'Bill has been Finalized';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    // $scope.item = {};
                }
            }
            var result = '';
            if (selectedItem) {
                result = '';
                if (selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
            }
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = '';
                if (selectedItem.Patient && selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient && selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient && selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
            }
            if (vm.patientcontrolconfig.selected)
                $scope.patientChanged();
            return result;
        }

        $scope.patientChanged = function () {
            var selectedItem = $scope.item.SelectedItem;
            if (selectedItem) {
                $scope.item.DoctorId = selectedItem.DoctorId;
                $scope.item.DoctorName = selectedItem.Doctor.Title.Description + ' ' + selectedItem.Doctor.FirstName + ' ' + selectedItem.Doctor.LastName;
                $scope.item.OrderFromId = selectedItem.DepartmentId;
                $scope.item.OrderToId = 8;
                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.PatientName = '';
                if (selectedItem.Patient.Title)
                    $scope.item.PatientName += selectedItem.Patient.Title.Description;

                if (selectedItem.Patient.FirstName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.FirstName;

                if (selectedItem.Patient.LastName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.LastName;

                if (selectedItem.EncounterTypeId == 2) {
                    $scope.item.EncounterTypeId = 2;
                    $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategoryId;
                } else {
                    $scope.item.ServiceRateCategoryId = 1;
                    $scope.item.EncounterTypeId = 1;
                }
                $scope.item.EncounterId = selectedItem.Id;
                $scope.item.LocationId = selectedItem.LocationId;
                $scope.item.WardId = selectedItem.WardId;
                $scope.item.RoomId = selectedItem.RoomId;
                $scope.item.BedId = selectedItem.BedId;
            }
        }

        function presearchEncounter() {
            var query = vm.patientcontrolconfig.query;

            //Only ip encounter
            var inputData = {
                Params: [
                    { Key: 15, Value: 2 }

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if ($scope.currentcontext.id == 0 && $scope.currentcontext.testtype > 0) {
                inputData.Params.push({ Key: 3, Value: 2 || 3 || 4 }, { Key: 15, Value: 2 })
            }

            if (vm.patientcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 11, Value: query });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchEncounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Patient.Title ? item.Patient.Title.Description : '';
                if (item.Patient.LastName) item.PatientName = [item.Patient.FirstName, item.Patient.LastName].join(' ');
                else item.PatientName = item.Patient.FirstName;
                item.Age = item.Patient.Age + ' / ' + item.Patient.Gender.Description;
                item.DOB = $filter('date')(item.Patient.DOB, 'yyyy-MMM-dd');
                item.MRN = item.Patient.MRN;
                item.VisitIdentifier = item.VisitIdentifier;
                if (item.WardMaster) {
                    item.WardDetail = item.WardMaster.WardName;
                }
                if (item.WardRoomMaster) {
                    item.WardDetail += ' / ' + item.WardRoomMaster.RoomNo;
                }
                if (item.WardRoomBedMaster) {
                    item.WardDetail += ' / ' + item.WardRoomBedMaster.BedNo;
                }
            }
        }
        //Patient Autosearch End

        //Procedure autosearch Starts

        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Procedure Name', field: 'ProcedureName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Category', field: 'Category', datatype: 'string', headercls: 'td-category', fieldcls: 'td-category' },
                { header: 'Technique', field: 'Technique', datatype: 'string', headercls: 'td-technique', fieldcls: 'td-technique' },
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
                result = [selectedItem.ProcedureName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.procedurecontrolconfig.rowdata) {
                result = [vm.procedurecontrolconfig.rowdata.Code, vm.procedurecontrolconfig.rowdata.ProcedureName].join(' ');
            }
            $scope.item.ProcedureName = result;

            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
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
                item.ProcedureId = item.Code;
                item.ProcedureName = item.ProcedureName;
                if (item.ProcedureCategory)
                    item.Category = item.ProcedureCategory.Description;
                if (item.ProcedureTechnique)
                    item.Technique = item.ProcedureTechnique.Description;
            }
        }
        //Procedure autosearch End

        //Doctor Autosearch Starts

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function setChiefSurgeon() {
            if ($scope.item.ChiefSurgeon)
                var surgeon = '';
            if ($scope.item.ChiefSurgeon.Title) surgeon = $scope.item.ChiefSurgeon.Title.Description
            if ($scope.item.ChiefSurgeon.FirstName) surgeon += ' ' + $scope.item.ChiefSurgeon.FirstName
            if ($scope.item.ChiefSurgeon.LastName) surgeon += ' ' + $scope.item.ChiefSurgeon.LastName
            $scope.$parent.SelectedItem.ChiefSurgeon = surgeon;
        }

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            if (vm.doctorcontrolconfig.searchbyid == true)
                if (!$scope.currentcontext.ismodal) {
                    setChiefSurgeon();
                }
            // $scope.getDoctorTeam();
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.doctorcontrolconfig.field == 'surgeon' || vm.doctorcontrolconfig.field == 'chiefsurgeon')
                inputData.Params.push({ Key: 12, Value: true });
            if (vm.doctorcontrolconfig.field == 'anesthesist')
                inputData.Params.push({ Key: 11, Value: true });
            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        //Doctor Autosearch End



        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.ConsumptionStatusId != 1 || $scope.item.ConsumptionStatusId != 2 || $scope.item.ConsumptionStatusId != 3 || $scope.item.ConsumptionStatusId != 4 || $scope.item.ConsumptionStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
            }
            // When In Draft Status
            if ($scope.item.ConsumptionStatusId == 1) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
            }
            // When In Approved Status
            if ($scope.item.ConsumptionStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            // When In Authorized Status
            if ($scope.item.ConsumptionStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            // Complete
            if ($scope.item.ConsumptionStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            // Cancell
            if ($scope.item.ConsumptionStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
        };
        $scope.canShowPatientBanner = function () {
            if (this.item.PatientId > 0) {
                return true;
            }
            return false;
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.stockconsumptionDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.stockconsumptionDetails[lastIndex].ItemMasterId == -1)
                    return false;
            }
            var stockconsumptionDetail = {
                Id: 0,
                ItemMasterId: -1,
                ItemCode: '',
                ItemName: '',
                BaseUom: { Id: 0, UomCode: '' },
                BaseUomId: 0,
                PurchaseUom: { Id: 0, UomCode: '' },
                PurchaseUomId: 0,
                SaleUom: { Id: 0, UomCode: '' },
                SaleUomId: 0,
                QtyConsumed: 0,
                QtyBeforeConsumption: 0,
                PurchasePrice: 0,
                DiscountModeId: 0,
                DiscountMode: '',
                ManufacturerName: '',
                Discount: 0,
                DiscountAmount: 0,
                UnitDiscountAmount: 0,
                UomPriceAfterDiscount: 0,
                PurchasePriceAfterDiscount: 0,
                GstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                GstId: 0,
                GstPercentage: 0,
                GstAmount: 0,
                InGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                InGstId: 0,
                InGstPercentage: 0,
                InGstAmount: 0,
                CGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                CGstId: 0,
                CGstPercentage: 0,
                CGstAmount: 0,
                SGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                SGstId: 0,
                SGstPercentage: 0,
                SGstAmount: 0,
                UnitGstAmount: 0,
                UnitCostPrice: 0,
                MrPrice: 0,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1,
                BatchDetails: [],
                BatchDetail: {
                    Id: 0, StockItemId: 0, ItemMasterId: 0, StoreMasterId: 0, BatchId: '', Quantity: 0, ExpiryDate: null, Ucp: 0, Mrp: 0,
                    GstId: 0, GstPercentage: 0, InGstId: 0, InGstPercentage: 0, CGstId: 0, CGstPercentage: 0, SGstId: 0, SGstPercentage: 0,
                    BaseUomId: 0, PurchaseUomId: 0, SaleUomId: 0, ManufacturerId: 0, VendorMasterId: 0, GrnId: 0, GrnDetailId: 0, Rev: 0, SerialDetails: null
                },
                StockSerialItemId: 0,
                StockSerialItemRev: 0,
                StockItemId: 0,
                StockItemRev: 0,
                StoreMasterId: 0,
                BatchId: '',
                Quantity: 0,
                ExpiryDate: '',
                Ucp: 0,
                Mrp: 0,
                GrnId: 0,
                GrnDetailId: 0
            };
            if ($scope.currentcontext.id > 0) {
                stockconsumptionDetail.StockConsumptionId = $scope.currentcontext.id;
            }
            $scope.stockconsumptionDetails.push(stockconsumptionDetail);
        };

        $scope.add_new = function () {
            utl.Modal.open('app.otconsumption', {
                params: { id: 0 },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.Clear = function () {
            $scope.stockconsumptionDetails = [];
            $scope.addNewLineItem();
        };

        $scope.addNew = function () {
            if ($stateParams.id > 0)
                $state.go('app.otconsumption', {
                    id: 0,
                    prid: 0
                });
            else
                $state.reload();
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'pharmacy/StockConsumption/PrintStockConsumption',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.stockconsumptionhistory', {
                params: { hid: HistoryId }
            });
        };

        $scope.History = function (item, idx) {
            utl.Modal.open('app.consumptionhistory', {
                params: {
                    itemmasterid: item.ItemMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.Stock = function (selectedItem, idx) {
            utl.Modal.open('app.consumptionstockdetails', {
                params: {
                    itemmasterid: selectedItem.ItemMasterId,
                    itemcode: selectedItem.ItemCode,
                    itemname: selectedItem.ItemName
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        };

        $scope.deleteStockConsumptionDetail = function (idx, item) {
            var name = "this item" || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.editStockConsumptionDetail = function (item) {
            item.currenteditable = true;
            utl.Modal.open('app.stockconsumptiondetail', {
                params: { id: $scope.currentcontext.id, current_item: item },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.stockconsumptionDetails) {
                var item = $scope.stockconsumptionDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.StockConsumptionId = $scope.currentcontext.id;
                }
                $scope.stockconsumptionDetails.push(itemFromModal);
            }
        };

        $scope.getStockConsumptionDetailsCallback = function (scope, res, options, hasError) {
            $scope.stockconsumptionDetails = res.Data || [];
            for (var idx in $scope.stockconsumptionDetails) {
                var conitem = $scope.stockconsumptionDetails[idx];
                conitem.BatchDetails = [];
                if (conitem.ItemMasterId > 0) {
                    conitem.SelectedBatchId = conitem.BatchId;
                    var ConsumededBatchDetail = {
                        Id: 0,
                        StockItemId: 0,
                        ItemMasterId: 0,
                        StoreMasterId: 0,
                        BatchId: '',
                        SelectedBatchId: '',
                        Quantity: 0,
                        ExpiryDate: null,
                        Ucp: 0,
                        Mrp: 0,
                        SerialDetails: null
                    };

                    ConsumededBatchDetail.Id = conitem.StockSerialItemId;
                    ConsumededBatchDetail.StockItemId = conitem.StockItemId;
                    ConsumededBatchDetail.ItemMasterId = conitem.ItemMasterId;
                    ConsumededBatchDetail.StoreMasterId = conitem.StoreMasterId;
                    ConsumededBatchDetail.BatchId = conitem.BatchId;
                    ConsumededBatchDetail.SelectedBatchId = conitem.BatchId;
                    ConsumededBatchDetail.Quantity = parseInt(conitem.QtyConsumed);
                    ConsumededBatchDetail.ExpiryDate = conitem.ExpiryDate;
                    ConsumededBatchDetail.Ucp = conitem.UnitCostPrice;
                    ConsumededBatchDetail.Mrp = conitem.MrPrice;

                    ConsumededBatchDetail.SerialDetails = [
                        ' Batch: ', conitem.BatchId,
                        ' | Qty: ', parseInt(conitem.QtyConsumed),
                        ' | Expiry: ', conitem.ExpiryDate,
                        ' | UCP: ', conitem.UnitCostPrice,
                        ' | MRP: ', conitem.MrPrice
                    ].join(' ');

                    conitem.BatchDetails.push(ConsumededBatchDetail);
                }

                if (conitem.ConsumedStore) {
                    $scope.item.StoreTypeId = conitem.ConsumedStore.StoreTypeId;
                }
            }

            $scope.addNewLineItem();

            $scope.computeAmount();
        };

        $scope.getStockConsumptionDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'pharmacy/stockconsumptiondetail/GetStockConsumptionDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getStockConsumptionDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.ConsumptionStatusId == 1) {
                $scope.item.isDisabled = false;
                $scope.item.DisplayConsumptionStatus = 'Draft';
            }
            if (data.ConsumptionStatusId == 2) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayConsumptionStatus = 'Approved';
            }
            if (data.ConsumptionStatusId == 3) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayConsumptionStatus = 'Authorized';
            }
            if (data.ConsumptionStatusId == 4) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayConsumptionStatus = 'Completed';
            }
            if (data.ConsumptionStatusId == 5) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayConsumptionStatus = 'Cancelled';
            }
            $scope.applyVisibilityRules();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/stockconsumption/GetStockConsumptionById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.item.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = data;
            $scope.getItem();
        };

        $scope.backToList = function () {
            $state.go('app.otconsumptions', $scope.currentcontext.id);
        };

        $scope.SaveandDraft = function () {
            $scope.item.ConsumptionStatusId = 1;
            $scope.saveItem();
        };

        $scope.SaveandApprove = function () {
            $scope.item.ConsumptionStatusId = 2;
            $scope.item.ConsumedBy = utl.Session.getCurrentUserId();
            $scope.item.ConsumptionDate = utl.Formatter.getCurrentDate();
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandAuthorize = function () {
            $scope.item.ConsumptionStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onComplete = function () {
            $scope.item.ConsumptionStatusId = 4;
            $scope.saveItem();
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.ConsumptionStatusId = 5;
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelledDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.CancelConsumption = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stockconsumption.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'pharmacy/stockconsumption/AddStockConsumption';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'pharmacy/stockconsumption/UpdateStockConsumption';
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
            for (var iddx in $scope.stockconsumptionDetails) {
                var iddxitem = $scope.stockconsumptionDetails[iddx];
                if (iddxitem.ItemMasterId > 0 && iddxitem.QtyConsumed <= 0) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.enterqtymsg.lbl') + iddxitem.ItemName);
                    return false;
                }
            }

            return true;
        }

        $scope.duplicateBatchCheck = function (item) {
            var cnt = 0;
            for (var idx in $scope.stockconsumptionDetails) {
                var batchitem = $scope.stockconsumptionDetails[idx];
                if (batchitem.ItemMasterId == item.ItemMasterId && batchitem.BatchId == item.BatchId) {
                    cnt = cnt + 1;
                }
            }

            if (cnt > 1) {
                alert($translate.instant('inventory.openingstockentry.enterbatchmsg.lbl') + item.ItemName);
            }
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.stockconsumptionDetails) {
                var item = $scope.stockconsumptionDetails[idx];
                if (item.ItemMasterId > 0 && item.Status == 1) {
                    item.StoreMasterId = $scope.item.StoreMasterId;
                    $scope.duplicateBatchCheck(item);
                    result.push(item);
                }
            }
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getStockConsumptionDetails();
        }

        $scope.onBatchSelected = function (consumingItem, SelectedMasterItem, idx) {
            var existing = $scope.itemUsedBatches[consumingItem.ItemMasterId].indexOf(consumingItem.BatchId);
            var modified = $scope.itemUsedBatches[consumingItem.ItemMasterId].indexOf(consumingItem.SelectedBatchId);
            if (modified == -1) {
                consumingItem.BatchId = selectedMasterItem.BatchId;
                consumingItem.SelectedBatchId = selectedMasterItem.BatchId;
                onsumingItem.BarcodeId = selectedMasterItem.BarcodeId;
                consumingItem.ExpiryDate = selectedMasterItem.ExpiryDate;
                consumingItem.QtyBeforeConsumption = selectedMasterItem.Quantity;
                consumingItem.QtyConsumed = 0;
                consumingItem.PurchaseUomId = selectedMasterItem.PurchaseUomId;
                consumingItem.BaseUomId = selectedMasterItem.BaseUomId;
                consumingItem.UomPrice = selectedMasterItem.UomPrice;
                consumingItem.PurchasePrice = selectedMasterItem.PurchasePrice;
                consumingItem.DiscountModeId = selectedMasterItem.DiscountModeId;
                consumingItem.Discount = selectedMasterItem.Discount;
                consumingItem.UomDiscountAmount = selectedMasterItem.UomDiscountAmount;
                consumingItem.DiscountAmount = selectedMasterItem.DiscountAmount;
                consumingItem.UomPriceAfterDiscount = selectedMasterItem.UomPriceAfterDiscount;
                consumingItem.UnitCostPrice = selectedMasterItem.Ucp;
                consumingItem.MrPrice = selectedMasterItem.Mrp;
                consumingItem.Ucp = selectedMasterItem.Ucp;
                consumingItem.Mrp = selectedMasterItem.Mrp;
                consumingItem.GstId = selectedMasterItem.GstId;
                consumingItem.GstPercentage = selectedMasterItem.GstPercentage;
                consumingItem.GstAmount = selectedMasterItem.GstAmount;
                consumingItem.UnitGstAmount = selectedMasterItem.UnitGstAmount;
                consumingItem.InGstId = selectedMasterItem.InGstId;
                consumingItem.InGstPercentage = selectedMasterItem.InGstPercentage;
                consumingItem.InGstAmount = selectedMasterItem.InGstAmount;
                consumingItem.UnitInGstAmount = selectedMasterItem.UnitInGstAmount;
                consumingItem.CGstId = selectedMasterItem.CGstId;
                consumingItem.CGstPercentage = selectedMasterItem.CGstPercentage;
                consumingItem.CGstAmount = selectedMasterItem.CGstAmount;
                consumingItem.UnitCGstAmount = selectedMasterItem.UnitCGstAmount;
                consumingItem.SGstId = selectedMasterItem.SGstId;
                consumingItem.SGstPercentage = selectedMasterItem.SGstPercentage;
                consumingItem.SGstAmount = selectedMasterItem.SGstAmount;
                consumingItem.UnitSGstAmount = selectedMasterItem.UnitSGstAmount;
                consumingItem.PurchaseUomId = selectedMasterItem.PurchaseUomId;
                consumingItem.BaseUomId = selectedMasterItem.BaseUomId;
                consumingItem.SaleUomId = selectedMasterItem.SaleUomId;
                consumingItem.ConversionQuantity = selectedMasterItem.ConversionQuantity;
                consumingItem.ManufacturerId = selectedMasterItem.ManufacturerId;
                consumingItem.VendorMasterId = selectedMasterItem.VendorMasterId;
                consumingItem.GrnId = selectedMasterItem.GrnId;
                consumingItem.GrnDetailId = selectedMasterItem.GrnDetailId;
                consumingItem.StockSerialItemId = selectedMasterItem.Id;
                consumingItem.StockSerialItemRev = selectedMasterItem.Rev;
                consumingItem.StockItemId = selectedMasterItem.StockItemId;
                consumingItem.GrossAmount = 0.00;
                consumingItem.NetAmount = 0.00;
                consumingItem.Comments = '';

                if (existing > -1) {
                    $scope.itemUsedBatches[consumingItem.ItemMasterId].splice(existing, 1);
                }
                $scope.itemUsedBatches[consumingItem.ItemMasterId].push(consumingItem.BatchId);

            } else if (modified > -1) {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.batchselectedmsg.lbl') + consumingItem.ItemName);
                consumingItem.SelectedBatchId = consumingItem.BatchId;
            }

            $scope.computeAmount();
        };

        $scope.onItemSelected = function (idx, selectedItem) {
            var prevItem = selectedItem.PreviousItem;
            var SelectedMasterItem = selectedItem.SelectedItem;
            selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.ItemName = SelectedMasterItem.ItemName;

            if (prevItem && prevItem.ItemMasterId != SelectedMasterItem.ItemMasterId) {
                selectedItem.BatchDetails = [];
                selectedItem.QtyConsumed = 0;
                var existing = $scope.itemUsedBatches[prevItem.ItemMasterId].indexOf(prevItem.BatchId);
                if (existing > -1) {
                    $scope.itemUsedBatches[prevItem.ItemMasterId].splice(existing, 1);
                }
                $scope.computeAmount(selectedItem);
            }

            var stockserialitems = null;
            if (SelectedMasterItem.ItemMaster.StockItem &&
                SelectedMasterItem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                stockserialitems = SelectedMasterItem.ItemMaster.StockItem.StockSerialItems;
                selectedItem.StockItemRev = SelectedMasterItem.ItemMaster.StockItem.Rev;
                var usedBatches = $scope.itemUsedBatches[selectedItem.ItemMasterId] || [];
                for (var batid = 0; batid < stockserialitems.length; batid++) {
                    var serialitem = stockserialitems[batid];
                    if (serialitem.Quantity > 0 && usedBatches.indexOf(serialitem.BatchId) == -1) {
                        serialitem.SerialDetails = [
                            ' Batch: ', serialitem.BatchId,
                            ' | Qty: ', serialitem.Quantity,
                            ' | Expiry: ', $filter('date')(serialitem.ExpiryDate, 'd-MMM-y'),
                            ' | UCP: ', serialitem.Ucp,
                            ' | MRP: ', serialitem.Mrp
                        ].join(' ');

                        selectedItem.BatchDetails.push(serialitem);
                    }
                }

                if (selectedItem.BatchDetails && selectedItem.BatchDetails.length > 0) {
                    selectedItem.StockSerialItemId = selectedItem.BatchDetails[0].Id;
                    selectedItem.StockSerialItemRev = selectedItem.BatchDetails[0].Rev;
                    selectedItem.StockItemId = selectedItem.BatchDetails[0].StockItemId;
                    selectedItem.BarCodeId = selectedItem.BatchDetails[0].BarCodeId;
                    selectedItem.BatchId = selectedItem.BatchDetails[0].BatchId;
                    selectedItem.SelectedBatchId = selectedItem.BatchDetails[0].BatchId;
                    selectedItem.ExpiryDate = selectedItem.BatchDetails[0].ExpiryDate;
                    selectedItem.QtyBeforeConsumption = selectedItem.BatchDetails[0].Quantity;
                    selectedItem.UomPrice = selectedItem.BatchDetails[0].UomPrice;
                    selectedItem.PurchasePrice = selectedItem.BatchDetails[0].PurchasePrice;
                    selectedItem.DiscountModeId = selectedItem.BatchDetails[0].DiscountModeId;
                    selectedItem.Discount = selectedItem.BatchDetails[0].Discount;
                    selectedItem.UomDiscountAmount = selectedItem.BatchDetails[0].UomDiscountAmount;
                    selectedItem.DiscountAmount = selectedItem.BatchDetails[0].DiscountAmount;
                    selectedItem.UomPriceAfterDiscount = selectedItem.BatchDetails[0].UomPriceAfterDiscount;
                    selectedItem.UnitCostPrice = selectedItem.BatchDetails[0].Ucp;
                    selectedItem.MrPrice = selectedItem.BatchDetails[0].Mrp;
                    selectedItem.Ucp = selectedItem.BatchDetails[0].Ucp;
                    selectedItem.Mrp = selectedItem.BatchDetails[0].Mrp;
                    selectedItem.GstId = selectedItem.BatchDetails[0].GstId;
                    selectedItem.GstPercentage = selectedItem.BatchDetails[0].GstPercentage;
                    selectedItem.GstAmount = selectedItem.BatchDetails[0].GstAmount;
                    selectedItem.UnitGstAmount = selectedItem.BatchDetails[0].UnitGstAmount;
                    selectedItem.InGstId = selectedItem.BatchDetails[0].InGstId;
                    selectedItem.InGstPercentage = selectedItem.BatchDetails[0].InGstPercentage;
                    selectedItem.InGstAmount = selectedItem.BatchDetails[0].InGstAmount;
                    selectedItem.UnitInGstAmount = selectedItem.BatchDetails[0].UnitInGstAmount;
                    selectedItem.CGstId = selectedItem.BatchDetails[0].CGstId;
                    selectedItem.CGstPercentage = selectedItem.BatchDetails[0].CGstPercentage;
                    selectedItem.CGstAmount = selectedItem.BatchDetails[0].CGstAmount;
                    selectedItem.UnitCGstAmount = selectedItem.BatchDetails[0].UnitCGstAmount;
                    selectedItem.SGstId = selectedItem.BatchDetails[0].SGstId;
                    selectedItem.SGstPercentage = selectedItem.BatchDetails[0].SGstPercentage;
                    selectedItem.SGstAmount = selectedItem.BatchDetails[0].SGstAmount;
                    selectedItem.UnitSGstAmount = selectedItem.BatchDetails[0].UnitSGstAmount;
                    selectedItem.PurchaseUomId = selectedItem.BatchDetails[0].PurchaseUomId;
                    selectedItem.BaseUomId = selectedItem.BatchDetails[0].BaseUomId;
                    selectedItem.SaleUomId = selectedItem.BatchDetails[0].SaleUomId;
                    selectedItem.ConversionQuantity = selectedItem.BatchDetails[0].ConversionQuantity;
                    selectedItem.ManufacturerId = selectedItem.BatchDetails[0].ManufacturerId;
                    selectedItem.VendorMasterId = selectedItem.BatchDetails[0].VendorMasterId;
                    selectedItem.GrnId = selectedItem.BatchDetails[0].GrnId;
                    selectedItem.GrnDetailId = selectedItem.BatchDetails[0].GrnDetailId;


                    $scope.itemUsedBatches[selectedItem.ItemMasterId] = $scope.itemUsedBatches[selectedItem.ItemMasterId] || [];
                    $scope.itemUsedBatches[selectedItem.ItemMasterId].push(selectedItem.BatchId);
                } else {
                    utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.allbatchesmsg.lbl') + selectedItem.ItemName);
                    return false;
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.stockadjustmentform.qtyavailable.lbl') + selectedItem.ItemName);
                return false;
            }

            selectedItem.PreviousItem = {};
            selectedItem.PreviousItem.BatchId = selectedItem.BatchId;
            selectedItem.PreviousItem.ItemMasterId = selectedItem.ItemMasterId;

            var PharItemLineDetails = [];
            for (var pildid = 0; pildid < $scope.stockconsumptionDetails.length; pildid++) {
                var PharItemLineDetail = $scope.stockconsumptionDetails[pildid];
                if (PharItemLineDetail.Status == 1) {
                    PharItemLineDetails.push(PharItemLineDetail);
                }
            }

            var lastIndex = PharItemLineDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        };

        $scope.computeAmount = function (item) {
            if (item.QtyConsumed > 0) {
                if (item.QtyConsumed > item.QtyBeforeConsumption) {
                    item.QtyConsumed = 0;
                    utl.Alert.showErrorMsg($translate.instant('inventory.stockadjustmentform.qtygreateravailqty.lbl'));
                    return false;
                }

                item.GrossAmount = item.UnitCostPrice * item.QtyConsumed;
                item.NetAmount = item.UnitCostPrice * item.QtyConsumed;
            } else if (item.QtyConsumed === 0) {
                item.GrossAmount = 0;
                item.NetAmount = 0;
            } else if (item.GrnQuantity === 'undefined') {
                item.GrossAmount = 0;
                item.NetAmount = 0;
            } else {
                item.GrossAmount = 0;
                item.NetAmount = 0;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.stockconsumptionDetails) {
                var activeitem = $scope.stockconsumptionDetails[idx];
                if (activeitem.ItemMasterId > 0 && parseInt(activeitem.QtyConsumed) > 0 && activeitem.Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + activeitem.GrossAmount).toFixed(2));
                    $scope.TotalDiscountAmount = parseFloat(($scope.TotalDiscountAmount + (activeitem.DiscountAmount * activeitem.QtyConsumed)).toFixed(2));
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + (activeitem.GstAmount * activeitem.QtyConsumed)).toFixed(2));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + activeitem.NetAmount).toFixed(2));
                }
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalDiscountAmount = $scope.TotalDiscountAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
        }

        vm.stockconsumptionitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Product Type Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                { header: 'Generic Name', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                { header: 'Manufacturer Name', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
                { header: 'Stock-In-Hand', field: 'StockInHand', datatype: 'string', headercls: 'td-stockinhand', fieldcls: 'td-stockinhand' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemStoreMaps',
            formatdisplay: formatselectedstockconsumptionitem,
            presearch: presearchstockconsumptionitem,
            postsearch: postsearchstockconsumptionitem
        };

        function formatselectedstockconsumptionitem() {
            var selectedItem = vm.stockconsumptionitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.stockconsumptionitemcontrolconfig.rowdata) {
                result = [vm.stockconsumptionitemcontrolconfig.rowdata.ItemName, vm.stockconsumptionitemcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchstockconsumptionitem() {
            var query = vm.stockconsumptionitemcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.item.StoreMasterId },
                    { Key: 4, Value: 1 },
                    { Key: 13, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.stockconsumptionitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.stockconsumptionitemcontrolconfig.searchparams = inputData;
        }

        function postsearchstockconsumptionitem() {
            for (var idx in vm.stockconsumptionitemcontrolconfig.result) {
                var item = vm.stockconsumptionitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                if (item.ItemMaster.StockItem !== null) {
                    item.StockInHand = item.ItemMaster.StockItem.Quantity;
                } else {
                    item.StockInHand = 0;
                }
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                } else if (key == 'UserStores' && $scope.item.StoreMasterId > 0) {
                    for (var userstoreid = 0; userstoreid < $scope.lookup['UserStores'].length; userstoreid++) {
                        if ($scope.lookup['UserStores'][userstoreid].Id == $scope.item.StoreMasterId) {
                            $scope.item.StoreTypeId = $scope.lookup['UserStores'][userstoreid].StoreMaster.StoreTypeId;
                        }
                    }
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ConsumptionType" },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },
                {
                    "Key": "ProductType",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
            ];

            $scope.getLookUp(inputData);
            loadData();
        };

        $scope.getLookUp = function (inputData) {
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

    OTConsumptionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();