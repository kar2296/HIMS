(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('GRNFormController', GRNFormController);

    function GRNFormController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        var savehitcompleted = 0;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({
            $scope: $scope
        }));
        $scope.tabindexmap = {
            suppliertabindex: 1,
            // itemtabindex: 4
        };
        $scope.ConvertionQtyEdit = false;
        $scope.currentcontext = {
            id: -1
        };
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.notallowdiscount = 0;
        $scope.notallowdiscount =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'notallowdiscount')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'notallowdiscount') : 0;
        $scope.itemexactsearch = 0;
        $scope.itemexactsearch =
            (utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch')) ? utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch') : 0;
        $scope.jssgrn = 0;
        $scope.jssgrn =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'isjssgrn')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'isjssgrn') : 0;
        $scope.currentcontext.CanGRN_Authorize_Button = utl.Privilege.hasAccess('CanGRN_Authorize_Button')
        $scope.currentcontext.CanGRN_Approve_Button = utl.Privilege.hasAccess('CanGRN_Approve_Button')
        $scope.currentcontext.CanGRN_Save_Button = utl.Privilege.hasAccess('CanGRN_Save_Button')
        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            var patientId = data.Id;
            var photo = data.Photo;
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.Id == patientId) {
                    item.Photo = photo;
                }
            }
        };

        function po(podata) {
            $state.go('app.purchaseorder', {
                id: podata.poid
            });
        }

        function grn(grndata) {
            $state.go('app.grn', {
                id: grndata.grnid
            });
        }

        function poData(data) {
            $scope.getPurchaseOrder(data.poId);
        }

        function grnData(data) {
            $scope.currentcontext.id = data.grnId;
            $scope.getItem();
            $scope.getGrnDetails();
        }

        $scope.findgrn = function () {
            utl.Modal.open('app.findgrn-list', {
                params: {
                    id: 0
                },
                confirmCallback: grnData
            });
        };

        $scope.findpo = function () {
            utl.Modal.open('app.findpo-for-grn-list', {
                params: {
                    id: 0
                },
                confirmCallback: poData
            });
        };

        $scope.vendorprofiledetails = function (VendorMasterId) {
            utl.Modal.open('app.vendorprofile', {
                params: {
                    vid: VendorMasterId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            GrnTypeId: 1,
            GrnSubTypeId: -1,
            IsGeneralPoGrn: false,
            VendorFacilityMapId: -1,
            VendorMasterId: -1,
            VendorName: null,
            StoreMasterId: 0,
            StoreTypeId: 0,
            TotalGrossAmount: 0,
            GrnDiscount: 0,
            TotalDiscountAmount: 0,
            TotalDiscount1Amount: 0,
            TotalDiscount2Amount: 0,
            TotalGstAmount: 0,
            TotalCGstAmount: 0,
            TotalSGstAmount: 0,
            OtherCharges: 0,
            RoundOff: 0,
            TotalBeforeRoundOff: 0,
            TotalNetAmount: 0,
            TotalInvoiceAmount: 0,
            TotalCreditAmount: 0,
            isDisabled: false,
            storeDisabled: false,
            RecDisabled: true,
            GrnNumber: null,
            Comments: null,
            ReceivedBy: utl.Session.getCurrentUserId(),
            DisplayGrnStatus: null,
            PurchaseOrderId: 0,
            ActiveStatusId: 2,
            IsPOBasedGrn: false,
            Rank: 1,
            TotalQtyCount: 0,
            RemarkId: -1,
            IsCredit: true,
            IsOpenGRN: false,
            IsPOMandatory: false,
            IsGstEditablePo: false
        };

        $scope.currentfilter = {
            filter_facilityid: -1,
            filter_grntypeid: -1,
            filter_storemasterid: -1,
            filter_vendormasterid: -1,
            filter_grnnumber: '',
            filter_ponumber: '',
            filter_invoicenumber: '',
            filter_activestatusid: -1,
            filter_grnstatusid: -1,
            filter_grndate: null,
            filter_from: null,
            filter_to: null
        };

        $scope.currentfilter.filter_facilityid = $stateParams.filter_facilityid;
        $scope.currentfilter.filter_grntypeid = $stateParams.filter_grntypeid;
        $scope.currentfilter.filter_storemasterid = $stateParams.filter_storemasterid;
        $scope.currentfilter.filter_vendormasterid = $stateParams.filter_vendormasterid;
        $scope.currentfilter.filter_grnnumber = $stateParams.filter_grnnumber;
        $scope.currentfilter.filter_ponumber = $stateParams.filter_ponumber;
        $scope.currentfilter.filter_invoicenumber = $stateParams.filter_invoicenumber;
        $scope.currentfilter.filter_activestatusid = $stateParams.filter_activestatusid;
        $scope.currentfilter.filter_grnstatusid = $stateParams.filter_grnstatusid;
        $scope.currentfilter.filter_grndate = $stateParams.filter_grndate;
        $scope.currentfilter.filter_from = $stateParams.filter_from;
        $scope.item.WithHeader = true;
        $scope.item.WithoutHeader = false;
        $scope.currentfilter.filter_to = $stateParams.filter_to;

        $scope.lookup = {};
        $scope.vendorPriceDetails = [];


        $scope.openAttachments = function () {
            if (!$scope.item.Id) {
                utl.Alert.showErrorMsg($translate.instant('Please Save invoice before attachment'));
                return false;
            }
            utl.Modal.open('app.inventoryattachments', {
                params: {
                    gid: $scope.item.Id,
                    screenname: 'grn'
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.item.PoDate = utl.Formatter.getCurrentDate();
        $scope.item.InvoiceDate = utl.Formatter.getCurrentDate();
        $scope.item.DcDate = utl.Formatter.getCurrentDate();
        $scope.item.GpDate = utl.Formatter.getCurrentDate();
        $scope.item.ReceivedStoreName = '';
        $scope.item.VendorName = '';
        $scope.grnDetails = [];

        $scope.canShowPrintBtn = false;
        $scope.canShowDMPrintBtn = false;
        $scope.canShowSaveBtn = true;
        $scope.canShowSaveandApproveBtn = true;
        $scope.canShowAuthorizeBtn = true;
        $scope.canShowClearBtn = true;
        $scope.canShowCancelBtn = true;
        $scope.canShowExpiryBtn = false;

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.GrnStatusId != 1 || $scope.item.GrnStatusId != 2 || $scope.item.GrnStatusId != 3 || $scope.item.GrnStatusId != 4 || $scope.item.GrnStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowDMPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = false;
                $scope.canShowCancegrnBtn = false;
                $scope.canShowExpiryBtn = false;
            }
            // When In Draft Status
            if ($scope.item.GrnStatusId == 1) {
                $scope.canShowPrintBtn = false;
                $scope.canShowDMPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = false;
                $scope.canShowCancegrnBtn = false;
                $scope.canShowExpiryBtn = true;
            }
            // When In Approved Status
            if ($scope.item.GrnStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowDMPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancegrnBtn = true;
                $scope.canShowExpiryBtn = true
            }
            // When In Authorized Status
            if ($scope.item.GrnStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowDMPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancegrnBtn = true;
                $scope.canShowExpiryBtn = true
            }
            // When In Completed Status
            if ($scope.item.GrnStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowDMPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancegrnBtn = false;
                $scope.canShowExpiryBtn = true
            }
            // When In Cancelled Status
            if ($scope.item.GrnStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowDMPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancegrnBtn = false;
                $scope.canShowExpiryBtn = true
            }
        };

        $scope.addNewLineItem = function () {
            var NotEditMrPrice = false;
            var EditMrPrice = true;
            if ($scope.ShowMrp) {
                NotEditMrPrice = true;
                EditMrPrice = false;
            }
            var grnDetail = {
                AvailableQuantity: 0,
                BaseUom: {
                    Id: 0,
                    UomCode: null
                },
                BaseUomId: 1,
                BatchId: null,
                BatchRequired: false,
                IsBillable: false,
                CGstAmount: 0,
                CGstCode: null,
                CGstId: 0,
                CGstMaster: {
                    Id: 0,
                    GstCode: null,
                    GstName: null,
                    GstPercentage: null
                },
                CGstPercentage: 0,
                ConversionQuantity: 1,
                DeliveryStoreMasterId: 0,
                PrevDiscount: 0,
                Discount: 0,
                DiscountAmount: 0,
                DiscountMode: '',
                DiscountModeId: 2,
                DiscountMode1Id: 2,
                DiscountMode2Id: 2,
                Discount2: 0,
                Discount1: 0,
                dispExpiryDate: null,
                ExpiryDate: null,
                ExpiryRequired: false,
                FacilityId: $scope.item.FacilityId,
                FreeQty: 0,
                FreeQtyAfterConversion: 0,
                GrnQuantity: 0,
                GrnQuantityAfterConversion: 0,
                GrossAmount: 0,
                GstAmount: 0,
                GstCode: null,
                GstId: 0,
                GstMaster: {
                    Id: 0,
                    GstCode: null,
                    GstName: null,
                    GstPercentage: null
                },
                InGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                InGstId: 0,
                InGstCode: '',
                InGstPercentage: 0,
                InGstAmount: 0,
                UnitInGstAmount: 0,
                GstPercentage: 0,
                Id: 0,
                IsBatchRequired: false,
                IsExpiryRequired: false,
                IsManfRequired: false,
                IsMRPRequired: false,
                ItemCode: null,
                ItemFacilityMapId: -1,
                ItemMasterId: -1,
                ItemName: null,
                HSNCode: '',
                ManfRequired: false,
                ManufacturerId: 0,
                ManufacturedDate: null,
                MasterItem: {},
                MRPRequired: false,
                MrPrice: 0,
                NetAmount: 0,
                PoQuantity: 0,
                PrQuantity: 0,
                PurchaseOrderDetailId: 0,
                PurchaseOrderId: 0,
                PurchasePrice: 0,
                PurchasePriceAfterDiscount: 0,
                PurchaseUom: {
                    Id: 0,
                    UomCode: null
                },
                PurchaseUomId: 1,
                RdoItemMasterId: false,
                ReceivedQuantity: 0,
                SaleUom: {
                    Id: 0,
                    UomCode: null
                },
                SaleUomId: 1,
                SGstAmount: 0,
                SGstCode: null,
                SGstId: 0,
                SGstMaster: {
                    Id: 0,
                    GstCode: null,
                    GstName: null,
                    GstPercentage: null
                },
                SGstPercentage: 0,
                SNo: 0,
                Status: 1,
                StockItemId: 0,
                StockSerialItemId: 0,
                StoreMasterId: 0,
                tabindex: $scope.tabindexmap.itemtabindex++,
                TotalQuantity: 0,
                TotalQuantityAfterConversion: 0,
                UnitCGstAmount: 0,
                UnitCostPrice: 0,
                UnitGstAmount: 0,
                UnitSGstAmount: 0,
                UomCostPrice: 0,
                UomDiscountAmount: 0,
                UomDiscount1Amount: 0,
                UomDiscount2Amount: 0,
                UomMrPrice: 0,
                UomPrice: 0,
                UomPriceAfterDiscount: 0,
                VendorMasterId: 0,
                CanEditUomPrice: false,
                CanEditDiscount: false,
                CanEditUomMrPrice: EditMrPrice,
                CanNotEditUomPrice: false,
                CanNotEditDiscount: false,
                CanNotEditUomMrPrice: NotEditMrPrice,
                itemidxdesc: null,
                itemidxqty: null
            };

            if ($scope.currentcontext.id > 0) {
                grnDetail.GrnId = $scope.currentcontext.id;
            }

            $scope.grnDetails.push(grnDetail);
            $scope.setIndexforTableIndex();
        };

        $scope.add_new = function () {
            utl.Modal.open('app.grndetail', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.addNew = function () {
            if ($stateParams.id > 0)
                $state.go('app.grn', {
                    id: 0,
                    grnid: $scope.currentcontext.grnid
                });
            else
                $state.reload();
        };

        $scope.addnewclear = function () {
            savehitcompleted = 0;
            $state.reload();
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'pharmacy/grn/PrintGrn',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.print1 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            var options = {
                action: 'pharmacy/grn/Print1Grn',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.historygrn', {});
        };

        $scope.History = function (selectedItem, idx) {
            if (selectedItem.ItemMasterId > 0) {
                utl.Modal.open('app.grnhistory', {
                    params: {
                        itemmasterid: selectedItem.ItemMasterId,
                        itemcode: selectedItem.ItemCode,
                        itemname: selectedItem.ItemName
                    }
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.showerrormsg.lbl'));
            }
        };

        $scope.Stock = function (selectedItem, idx) {
            if (selectedItem.ItemMasterId > 0) {
                utl.Modal.open('app.grnstockdetails', {
                    params: {
                        itemmasterid: selectedItem.ItemMasterId,
                        itemcode: selectedItem.ItemCode,
                        itemname: selectedItem.ItemName
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.showerrormsg.lbl'));
            }
        };
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (item) {
            if (item.ItemMasterId != -1) {
                item.Status = 2;
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
                return false;
            }
        };

        $scope.deleteGrnDetail = function (idx, selectedItem) {
            if (selectedItem.ItemMasterId > 0) {
                var name = "this item" || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
            }
            $scope.item.OtherCharges = 0;
            $scope.item.RoundOff = 0;
            $scope.item.TotalGrossAmount = 0;
            $scope.item.TotalDiscountAmount = 0;
            $scope.item.TotalDiscount1Amount = 0;
            $scope.item.TotalDiscount2Amount = 0;
            $scope.item.TotalGstAmount = 0;
            $scope.item.TotalCGstAmount = 0;
            $scope.item.TotalSGstAmount = 0;
            $scope.item.TotalNetAmount = 0;
            $scope.item.TotalInvoiceAmount = 0;
            $scope.item.TotalBeforeRoundOff = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();

            $scope.setIndexforTableIndex();
        };

        // $scope.deleteItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        //     $scope.getList();
        // };

        // $scope.onDeleteConfirmed = function (item) {
        //     if (item.ItemMasterId != -1) {
        //         item.Status = 2;
        //     } else {
        //         utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.showerrormsg.lbl'));
        //         return false;
        //     }

        //     $scope.item.OtherCharges = 0;
        //     $scope.item.RoundOff = 0;
        //     $scope.item.TotalGrossAmount = 0;
        //     $scope.item.TotalDiscountAmount = 0;
        //     $scope.item.TotalGstAmount = 0;
        //     $scope.item.TotalCGstAmount = 0;
        //     $scope.item.TotalSGstAmount = 0;
        //     $scope.item.TotalNetAmount = 0;
        //     $scope.item.TotalInvoiceAmount = 0;
        //     $scope.item.TotalBeforeRoundOff = 0;

        //     $scope.TotalGrossAmount = 0;
        //     $scope.TotalDiscountAmount = 0;
        //     $scope.TotalGstAmount = 0;
        //     $scope.TotalCGstAmount = 0;
        //     $scope.TotalSGstAmount = 0;
        //     $scope.TotalNetAmount = 0;

        //     calculatetotalAmount();

        //     $scope.setIndexforTableIndex();
        // };

        // $scope.deleteItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        // };

        // $scope.DeleteConfirmed = function (deleteId) {
        //     var options = {
        //         action: 'pharmacy/grn/DeleteGrn',
        //         data: {
        //             Id: deleteId
        //         },
        //         type: 'post',
        //         onComplete: $scope.deleteItemCallback
        //     };
        //     utl.Http.doAction(options);
        //     $scope.backToList();
        // };

        // $scope.draftDelete = function () {
        //     utl.Dialog.confirmDelete($scope.DeleteConfirmed, $scope.currentcontext.id);
        // };

        // $scope.deleteGrnDetail = function (idx, selectedItem) {
        //     if (selectedItem.ItemMasterId > 0) {
        //         var name = "this item" || '';
        //         utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
        //     }
        // };

        $scope.editGrnDetail = function (item) {
            item.currenteditable = true;
            utl.Modal.open('app.grndetail', {
                params: {
                    id: $scope.currentcontext.id,
                    current_item: item
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.printbarcode = function (idx, item) {
            var vExpiryDate = "";
            var vBatchNo = "";
            var vItemName = "";
            var vItemCode = "";
            var vBarcode = "";
            for (var idx in $scope.grnDetails) {
                var item = $scope.grnDetails[idx];
                if (item.ItemMasterId) {
                    if (item.ItemMaster && item.ItemMaster.ItemName)
                        vItemName = item.ItemMaster.ItemName;
                    vItemCode = item.ItemMaster.ItemCode;
                    if (item.BatchId)
                        vBatchNo = item.BatchId;
                    if (item.BarCodeId)
                        vBarcode = item.BarCodeId;
                    $scope.printbarcodeScript(vItemName, vItemCode, vBarcode, vBatchNo, vExpiryDate, $scope.grnDetails);
                }
            }
        };

        $scope.printbarcodeScript = function (itemName, itemCode, barcodenr, batchno, expDate, items) {
            for (var idx1 in items) {
                var item = items[idx1];
                if (item.BarCodeId == barcodenr) {
                    var vItemName = '';
                    var vItemCode = '';
                    var vBatchInfo = '';
                    var vBarcode = '';
                    var vexpDate = '';

                    try {
                        if (itemName) {
                            vItemName = itemName;
                        }
                        if (itemCode) {
                            vItemCode = itemCode;
                        }
                        if (barcodenr) {
                            vBarcode = barcodenr;
                        }
                        if (batchno) {
                            vBatchInfo = batchno;
                        }
                        if (expDate) {
                            vexpDate = utl.Formatter.getExpDateString(expDate);
                        }

                    } catch (ex) { }

                    var code = '';
                    var printData = []
                    var printCodes = {
                        new_line: '\x0A'
                    };
                    var code = '';
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q200,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S2' + printCodes.new_line;
                    code += 'D15' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R215,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'B373,120,2,1,3,9,61,B,"' + barcodenr + '"' + printCodes.new_line;
                    // code += 'A373,170,2,2,1,1,N,"' + printCodes.new_line;
                    // code += 'A373,150,2,2,1,1,N,"' + printCodes.new_line;
                    code += 'A374,185,2,2,1,1,N,"' + vItemName + '(' + vItemCode + ')' + '"' + printCodes.new_line;
                    code += 'A374,155,2,2,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
                    code += 'A165,155,2,2,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;
                    code += 'P1,1' + printCodes.new_line;
                    printData.push(code);
                    console.log(printData);
                    $scope.printRaw(printData);
                }
            }
        };

        $scope.generatebarCode = function (idx, item) {
            var vExpiryDate = "";
            var vBatchNo = "";
            var vItemName = "";
            var vItemCode = "";
            var vBarcode = "";
            if (item.ItemMasterId) {
                if (item.ItemMaster && item.ItemMaster.ItemName)
                    vItemName = item.ItemMaster.ItemName;
                vItemCode = item.ItemMaster.ItemCode;
                if (item.BatchId)
                    vBatchNo = item.BatchId;
                if (item.ExpiryDate)
                    vExpiryDate = item.ExpiryDate;
                if (item.BarCodeId)
                    vBarcode = item.BarCodeId;
                $scope.generateBarcodeScript(vItemName, vItemCode, vBarcode, vBatchNo, vExpiryDate, item);
            }
        };

        $scope.generateBarcodeScript = function (itemName, itemCode, barcodenr, batchno, expDate, items) {

            var vItemName = '';
            var vItemCode = '';
            var vBatchInfo = '';
            var vexpDate = '';
            var vBarcode = '';
            try {
                if (itemName) {
                    vItemName = itemName;
                }
                if (itemCode) {
                    vItemCode = itemCode;
                }
                if (batchno) {
                    vBatchInfo = batchno;
                }
                if (barcodenr) {
                    vBarcode = barcodenr;
                }
                if (expDate) {
                    vexpDate = utl.Formatter.getExpDateString(expDate);
                }

            } catch (ex) { }

            var code = '';
            var printData = []
            var printCodes = {
                new_line: '\x0A'
            };
            var code = '';
            code += 'I8,A' + printCodes.new_line;
            code += 'q799' + printCodes.new_line;
            code += 'O' + printCodes.new_line;
            code += 'JF' + printCodes.new_line;
            code += 'ZT' + printCodes.new_line;
            code += 'Q120,25' + printCodes.new_line;
            code += 'N' + printCodes.new_line;
            code += 'A783,99,2,2,1,1,N,"' + vItemName + '"' + printCodes.new_line;
            code += 'A583,99,2,2,1,1,N,"' + vItemName + '"' + printCodes.new_line;
            code += 'A390,99,2,2,1,1,N,"' + vItemName + '"' + printCodes.new_line;
            code += 'A194,99,2,2,1,1,N,"' + vItemName + '"' + printCodes.new_line;

            code += 'B758,79,2,9,1,2,50,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A768,20,2,1,1,1,N,"' + vBarcode + '-' + vexpDate + '"' + printCodes.new_line;
            code += 'B549,79,2,9,1,2,50,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A559,20,2,1,1,1,N,"' + vBarcode + '-' + vexpDate + '"' + printCodes.new_line;
            code += 'B365,79,2,9,1,2,50,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A374,20,2,1,1,1,N,"' + vBarcode + '-' + vexpDate + '"' + printCodes.new_line;
            code += 'B175,79,2,9,1,2,50,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A184,20,2,1,1,1,N,"' + vBarcode + '-' + vexpDate + '"' + printCodes.new_line;

            // code += 'A778,10,2,1,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
            // code += 'A583,10,2,1,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
            // code += 'A390,10,2,1,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
            // code += 'A194,10,2,1,1,1,N,"' + vexpDate + '"' + printCodes.new_line;


            code += 'P1,1' + printCodes.new_line;
            printData.push(code);
            console.log(printData);
            $scope.printRaw(printData);

        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.grnDetails) {
                var item = $scope.grnDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.GrnId = $scope.currentcontext.id;
                }
                $scope.grnDetails.push(itemFromModal);
            }
        };

        $scope.getGrnDetailsCallback = function (scope, res, options, hasError) {
            $scope.grnDetails = res.Data || [];
            $scope.pendingPODetails = [];
            var TotGrnQty = 0;
            for (var idx in $scope.grnDetails) {
                var grnitem = $scope.grnDetails[idx];
                if (grnitem.ItemMasterId > 0) {
                    if (grnitem.DiscountModeId == 1) {
                        grnitem.DiscountMode = 'Rs.';
                    } else {
                        grnitem.DiscountMode = '%';
                    }

                    grnitem.GstCode = grnitem.GstMaster.GstCode;
                    grnitem.CGstCode = grnitem.CGstMaster.GstCode;
                    grnitem.SGstCode = grnitem.SGstMaster.GstCode;

                    if (grnitem.ItemMaster.IsBatchMandatory)
                        grnitem.IsBatchRequired = true;

                    if (grnitem.ItemMaster.IsExpiryMandatory)
                        grnitem.IsExpiryRequired = true;

                    if (grnitem.ItemMaster.IsManufacture)
                        grnitem.IsManfRequired = true;

                    if (grnitem.ItemMaster.IsMRPRequired)
                        grnitem.IsMRPRequired = true;

                    if (grnitem.ItemMaster.CanEditPriceForGrn) {
                        grnitem.CanEditUomPrice = true;
                        grnitem.CanEditDiscount = true;
                        grnitem.CanEditUomMrPrice = true;
                    } else {
                        grnitem.CanNotEditUomPrice = true;
                        grnitem.CanNotEditDiscount = true;
                        grnitem.CanNotEditUomMrPrice = true;
                    }

                    grnitem.MasterItem = grnitem.ItemMaster;
                    grnitem.HSNCode = grnitem.ItemMaster.HSNCode;

                    TotGrnQty = TotGrnQty + parseInt(grnitem.GrnQuantity);
                    $scope.item.TotalQtyCount = TotGrnQty;
                }

                if ($scope.item.GrnStatusId >= 2 || $scope.item.PurchaseOrderId !== 0) {
                    grnitem.RdoItemMasterId = true;
                }

                if (grnitem.PurchaseOrderDetail) {
                    var PODetailItem = grnitem.PurchaseOrderDetail;
                    PODetailItem.PurchaseOrderDetailId = PODetailItem.Id;
                    $scope.pendingPODetails.push(PODetailItem);
                }

                if (grnitem.StoreMaster) {
                    $scope.item.StoreTypeId = grnitem.StoreMaster.StoreTypeId;
                }

                $scope.setDispExpiry(grnitem);
            }

            $scope.grnDetails.sort($scope.custom_sort);
            $scope.setIndexforTableIndex();

            if ($scope.item.GrnStatusId == 1 && $scope.item.PurchaseOrderId === 0) {
                $scope.addNewLineItem();
            }
        };

        $scope.getGrnDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.id
                    }],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'pharmacy/grndetail/GetGrnDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getGrnDetailsCallback
                };
                utl.Http.doAction(options);
            }
            //  else {
            //     $scope.addNewLineItem();
            // }
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.storeDisabled = true;
            if (data.GrnStatusId == 1) {
                $scope.item.isDisabled = false;
                $scope.item.DisplayGrnStatus = 'Draft';
            }
            if (data.GrnStatusId == 2) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayGrnStatus = 'Approved';
            }
            if (data.GrnStatusId == 3) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayGrnStatus = 'Authorized';
            }
            if (data.GrnStatusId == 4) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayGrnStatus = 'Completed';
            }
            if (data.GrnStatusId == 5) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayGrnStatus = 'Cancelled';
            }
            $scope.item.RecDisabled = true;

            $scope.currentfilter.filter_grntypeid = data.GrnTypeId;
            //$scope.currentfilter.GrnTypeId = data.GrnTypeId;
            $scope.currentfilter.filter_storemasterid = data.StoreMasterId;
            //$scope.currentfilter.StoreMasterId = data.StoreMasterId;
            $scope.currentfilter.filter_grnstatusid = data.GrnStatusId;
            //$scope.currentfilter.GrnStatusId = data.GrnStatusId;
            $scope.currentfilter.filter_grndate = data.GrnDate;
            //$scope.currentfilter.GrnDate = data.GrnDate;

            $scope.applyVisibilityRules();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/grn/GetGrnById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.getPurchaseOrder = function (id) {
            $scope.item.PurchaseOrderId = id;
            $scope.getPurchaseOrderById();
            $scope.getPurchaseOrderDetails();
        };

        $scope.getPurchaseOrderById = function () {
            if ($scope.item.PurchaseOrderId && $scope.item.PurchaseOrderId > 0) {
                var options = {
                    action: 'pharmacy/purchaseorder/GetPurchaseOrderById',
                    data: {
                        Id: $scope.item.PurchaseOrderId
                    },
                    type: 'post',
                    onComplete: $scope.getPurchaseOrderCallback
                };
                utl.Http.doAction(options);
            } else { }
        };

        $scope.getPurchaseOrderCallback = function (scope, data, options, hasError) {
            var result = data;

            // $scope.item.StoreMasterId = result.DeliveryStoreMasterId;
            $scope.item.StoreMasterId = result.StoreMasterId;
            $scope.item.VendorFacilityMapId = result.VendorFacilityMapId;
            $scope.item.VendorMasterId = result.VendorMasterId;
            $scope.item.FacilityId = result.FacilityId;
            $scope.item.PoDate = result.PoDate;
            $scope.item.PoNumber = result.PoNumber;
            if (result.RequestedUser) {
                $scope.item.OrderedBy = '';
                if (result.RequestedUser.Title) {
                    $scope.item.OrderedBy = result.RequestedUser.Title.Description;
                }
                if (result.RequestedUser.FirstName != null) {
                    $scope.item.OrderedBy = $scope.item.OrderedBy + ' ' + result.RequestedUser.FirstName;
                }
                if (result.RequestedUser.LastName != null) {
                    $scope.item.OrderedBy = $scope.item.OrderedBy + ' ' + result.RequestedUser.LastName;
                }
            }
            $scope.item.GrnTypeId = 2;
            $scope.item.IsPOBasedGrn = true;
        };

        $scope.getPurchaseOrderDetails = function () {
            if ($scope.item.PurchaseOrderId && $scope.item.PurchaseOrderId > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.item.PurchaseOrderId
                    },
                    {
                        Key: 6,
                        Value: $scope.item.StoreMasterId
                    }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'pharmacy/purchaseorderdetail/GetPurchaseOrderDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPurchaseOrderDetailsCallback
                };
                utl.Http.doAction(options);
            } else { }
        };

        $scope.getPurchaseOrderDetailsCallback = function (scope, res, options, hasError) {
            $scope.pendingPODetails = [];
            for (var indx in res.Data) {
                if (res.Data[indx].PoQuantity != res.Data[indx].ReceivedQuantity) {
                    $scope.pendingPODetails.push(res.Data[indx]);
                }
            }
            $scope.grnDetails = $scope.pendingPODetails || [];
            for (var idx in $scope.grnDetails) {
                var grnitem = $scope.grnDetails[idx];
                if (grnitem.ItemMasterId > 0) {
                    grnitem.PurchaseOrderDetailId = grnitem.Id;
                    grnitem.Id = 0;
                    grnitem.GrnQuantity = 0;
                    if (grnitem.DiscountModeId == 1) {
                        grnitem.DiscountMode = 'Rs.';
                    } else {
                        grnitem.DiscountMode = '%';
                    }

                    grnitem.GstCode = grnitem.GstMaster.GstCode;
                    grnitem.CGstCode = grnitem.CGstMaster.GstCode;
                    grnitem.SGstCode = grnitem.SGstMaster.GstCode;
                    grnitem.FacilityId = $scope.item.FacilityId;
                    if (grnitem.ItemMaster) {
                        grnitem.MasterItem = grnitem.ItemMaster;
                        grnitem.SaleUomId = grnitem.ItemMaster.SaleUomId;
                        grnitem.HSNCode = grnitem.ItemMaster.HSNCode;
                    }

                    /*
                    if (grnitem.ItemMaster.ItemFacilityMaps && grnitem.ItemMaster.ItemFacilityMaps.length > 0) {
                        grnitem.ItemFacilityMapId = grnitem.ItemMaster.ItemFacilityMaps[0].Id;
                    }
                    */

                    if (grnitem.ItemMaster.StockItem) {
                        grnitem.StockItemId = grnitem.ItemMaster.StockItem.Id;
                    } else {
                        grnitem.StockItemId = 0;
                    }

                    if (grnitem.ItemMaster.IsBatchMandatory)
                        grnitem.IsBatchRequired = true;

                    if (grnitem.ItemMaster.IsExpiryMandatory)
                        grnitem.IsExpiryRequired = true;

                    if (grnitem.ItemMaster.IsManufacture)
                        grnitem.IsManfRequired = true;

                    if (grnitem.ItemMaster.IsMRPRequired)
                        grnitem.IsMRPRequired = true;

                    if (grnitem.ItemMaster.CanEditPriceForGrn) {
                        grnitem.CanEditUomPrice = true;
                        grnitem.CanEditDiscount = true;
                        grnitem.CanEditUomMrPrice = true;
                    } else {
                        grnitem.CanNotEditUomPrice = true;
                        grnitem.CanNotEditDiscount = true;
                        grnitem.CanNotEditUomMrPrice = true;
                    }


                    grnitem.RdoItemMasterId = true;
                }
            }

            /* $scope.grnDetails.sort($scope.custom_sort); */

            $scope.setIndexforTableIndex();
            $timeout(function () {
                $('#vendorid').focus();
            }, 1000);
        };

        $scope.insertGrnDetail = function (idx, item) {
            if (item.PurchaseOrderId > 0) {
                if (item.ItemMasterId > 0) {
                    if (item.GrnQuantity > 0) {
                        if (item.GrnQuantity < item.PoQuantity) {
                            var newgrnDetail = {
                                AvailableQuantity: item.AvailableQuantity,
                                BaseUom: item.BaseUom,
                                BaseUomId: item.BaseUomId,
                                CanEditUomPrice: item.CanEditUomPrice,
                                CanEditDiscount: item.CanEditDiscount,
                                CanEditUomMrPrice: item.CanEditUomMrPrice,
                                CanNotEditUomPrice: item.CanNotEditUomPrice,
                                CanNotEditDiscount: item.CanNotEditDiscount,
                                CanNotEditUomMrPrice: item.CanNotEditUomMrPrice,
                                CGstAmount: item.CGstAmount,
                                CGstCode: item.CGstCode,
                                CGstId: item.CGstId,
                                CGstMaster: item.CGstMaster,
                                CGstPercentage: item.CGstPercentage,
                                Comments: item.Comments,
                                ConversionQuantity: item.ConversionQuantity,
                                CreatedAt: item.CreatedAt,
                                CreatedBy: item.CreatedBy,
                                DeliveryStore: item.DeliveryStore,
                                DeliveryStoreMasterId: item.DeliveryStoreMasterId,
                                Discount: item.Discount,
                                DiscountAmount: item.DiscountAmount,
                                DiscountMode: item.DiscountMode,
                                DiscountModeId: item.DiscountModeId,
                                FreeQty: 0,
                                GrnQuantity: 0,
                                GrossAmount: item.GrossAmount,
                                GstAmount: item.GstAmount,
                                GstCode: item.GstCode,
                                GstId: item.GstId,
                                GstMaster: item.GstMaster,
                                GstPercentage: item.GstPercentage,
                                Id: item.Id,
                                IsBatchRequired: item.IsBatchRequired,
                                IsExpiryRequired: item.IsExpiryRequired,
                                ItemCode: item.ItemCode,
                                ItemMaster: item.ItemMaster,
                                HSNCode: item.ItemMaster.HSNCode,
                                ItemMasterId: item.ItemMasterId,
                                ItemName: item.ItemName,
                                MrPrice: item.MrPrice,
                                NetAmount: item.NetAmount,
                                PoQuantity: item.PoQuantity,
                                PrQuantity: item.PrQuantity,
                                PurchaseOrder: item.PurchaseOrder,
                                PurchaseOrderDetailId: item.PurchaseOrderDetailId,
                                PurchaseOrderId: item.PurchaseOrderId,
                                PurchasePrice: item.PurchasePrice,
                                PurchasePriceAfterDiscount: item.PurchasePriceAfterDiscount,
                                PurchaseRequestDetailId: item.PurchaseRequestDetailId,
                                PurchaseUom: item.PurchaseUom,
                                PurchaseUomId: item.PurchaseUomId,
                                RdoItemMasterId: item.RdoItemMasterId,
                                ReceivedQuantity: item.ReceivedQuantity,
                                RequestedStore: item.RequestedStore,
                                //Rev: item.Rev,
                                SGstAmount: item.SGstAmount,
                                SGstCode: item.SGstCode,
                                SGstId: item.SGstId,
                                SGstMaster: item.SGstMaster,
                                SGstPercentage: item.SGstPercentage,
                                SNo: 0,
                                Status: item.Status,
                                StoreMasterId: item.StoreMasterId,
                                TotalQuantity: item.TotalQuantity,
                                TotalQuantityAfterConversion: item.TotalQuantityAfterConversion,
                                UnitCGstAmount: item.UnitCGstAmount,
                                UnitCostPrice: item.UnitCostPrice,
                                UnitGstAmount: item.UnitGstAmount,
                                UnitSGstAmount: item.UnitSGstAmount,
                                UomCostPrice: item.UomCostPrice,
                                UomDiscountAmount: item.UomDiscountAmount,
                                UomDiscount1Amount: item.UomDiscount1Amount,
                                UomDiscount2Amount: item.UomDiscount2Amount,
                                UomMrPrice: item.UomMrPrice,
                                UomPrice: item.UomPrice,
                                UomPriceAfterDiscount: item.UomPriceAfterDiscount,
                                UpdatedAt: item.UpdatedAt,
                                UpdatedBy: item.UpdatedBy,
                                VendorItem: item.VendorItem,
                                VendorMaster: item.VendorMaster,
                                VendorMasterId: item.VendorMasterId,
                                itemidxdesc: null,
                                itemidxqty: null
                            };
                            $scope.grnDetails.push(newgrnDetail);
                        } else {
                            utl.Alert.showErrorMsg($translate.instant('inventory.grn.grnpoqtyalert.lbl') + item.ItemName);
                            return false;
                        }
                    } else {
                        utl.Alert.showErrorMsg($translate.instant('inventory.grn.grnqtyalert.lbl') + item.ItemName);
                        return false;
                    }
                }

                /* $scope.grnDetails.sort($scope.custom_sort); */

                $scope.setIndexforTableIndex();
            }
        };

        $scope.custom_sort = function (a, b) {
            if (a.Id < b.Id)
                return -1;
            if (a.Id > b.Id)
                return 1;
            return 0;
        };

        $scope.GrnNumCallback = function (scope, data, options, hasError) {
            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            savehitcompleted = 0;
            console.log(data);
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Your Grn has been Approved!.. Ref No is ' + '<br>' + '<b>' + data.GrnNumber + '</b>',
                okkey: 'OK',
                // noKey: 'common.nokey.lbl',
                onSuccessMethod: function () {
                    loadData();
                    if (data.GrnStatusId == 3) {
                        $scope.addNew();
                    }
                }
            };

            utl.Dialog.SuccessMessage(confirmOptions);


            // $scope.backToList();
        };
        $scope.getGrnNum = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/grn/GetGrnByIdwoDetails',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.GrnNumCallback
                };
                utl.Http.doAction(options);
            }
            // else {
            //     $scope.applyVisibilityRules();
            // }
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            savehitcompleted = 0;
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
                $scope.item.storeDisabled = true;
            }
            $scope.getGrnNum();
            /* $scope.backToList(); */
        };

        $scope.errorItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showErrorMsg($translate.instant('inventory.grn.giveninvoice.lbl'));
            savehitcompleted = 0;
        };

        $scope.backToList = function () {
            $state.go('app.grns', {
                filter_id: $scope.currentcontext.id,
                filter_facilityid: $scope.currentfilter.filter_facilityid,
                filter_grntypeid: $scope.currentfilter.filter_grntypeid,
                filter_storemasterid: $scope.currentfilter.filter_storemasterid,
                filter_vendormasterid: $scope.currentfilter.filter_vendormasterid,
                filter_grnnumber: $scope.currentfilter.filter_grnnumber,
                filter_ponumber: $scope.currentfilter.filter_ponumber,
                filter_invoicenumber: $scope.currentfilter.filter_invoicenumber,
                filter_activestatusid: $scope.currentfilter.filter_activestatusid,
                filter_grnstatusid: $scope.currentfilter.filter_grnstatusid,
                filter_grndate: $scope.currentfilter.filter_grndate,
                filter_from: $scope.currentfilter.filter_from,
                filter_to: $scope.currentfilter.filter_to
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.editgrnDetail = function (item) {
            item.currenteditable = true;
            utl.Modal.open('app.grndetail', {
                params: {
                    id: $scope.currentcontext.id,
                    current_item: item
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.grnDetails) {
                var item = $scope.grnDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.grnId = $scope.currentcontext.id;
                }
                $scope.grnDetails.push(itemFromModal);
            }
        };

        $scope.SaveandDraft = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.grns.savemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.GrnStatusId = 1;
            $scope.item.GrnDate = utl.Formatter.getCurrentDate();
            $scope.item.ReceivedBy = utl.Session.getCurrentUserId();
            $scope.item.ReceivedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.VendorMasterId <= 0) {
                utl.Alert.showErrorMsg($translate.instant('Please Select GRN Supplier'));
                return false;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.grns.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            if ($scope.item.GrnStatusId == 1) {

            } else {
                $scope.item.ReceivedBy = utl.Session.getCurrentUserId();
                $scope.item.ReceivedDate = utl.Formatter.getCurrentDate();
            }
            $scope.item.GrnStatusId = 2;
            $scope.item.GrnDate = utl.Formatter.getCurrentDate();
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandAuthorize = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.grns.authorizemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandAuthorizeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandAuthorizeConfirmed = function () {
            $scope.item.GrnStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onComplete = function () {
            $scope.item.GrnStatusId = 4;
            $scope.item.CompletedBy = utl.Session.getCurrentUserId();
            $scope.item.CompletedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.Cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.grn.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.GrnStatusId = 5;
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelledDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.barcodemanual = function (idx, item) {
            utl.Modal.openFixedDialog('app.manualbarcode', {
                params: {
                    itemId: item.ItemMasterId,
                    index: idx,
                    barcode: item.BarCodeId
                },
                confirmCallback: $scope.BarcodeSave
            });
        };

        $scope.BarcodeSave = function (itemFromModal) {
            $scope.grnDetails[itemFromModal.index].BarCodeId = itemFromModal.BarCodeId;
        }

        $scope.saveItem = function () {

            if (savehitcompleted == 1) return false;
            // if ($scope.item.VendorMasterId <= 0) {
            //     utl.Alert.showErrorMsg($translate.instant('Please Select GRN Supplier'));
            //     return false;
            // }

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.item.GrnStatusId <= 2) {
                if ($scope.item.PurchaseOrderId && $scope.item.PurchaseOrderId > 0) {
                    //var groupedGrnItems = groupBy_PurchaseOrderDetailId_ItemMasterId($scope.grnDetails, ['PurchaseOrderDetailId', 'ItemMasterId']);
                    var PoGrnQtyCheck = 0;
                    var PoGrnItemName = null;
                    var POStatusCheck = 0;
                    var AtLeatOneItem = 0;
                    for (var podidx in $scope.pendingPODetails) {
                        var PoGrnItemTotalQty = 0;
                        var poditem = $scope.pendingPODetails[podidx];
                        for (var grnidx in $scope.grnDetails) {
                            var grnitem = $scope.grnDetails[grnidx];
                            if (grnitem.ItemMasterId > 0 &&
                                poditem.PurchaseOrderDetailId == grnitem.PurchaseOrderDetailId &&
                                poditem.ItemMasterId == grnitem.ItemMasterId &&
                                parseInt(grnitem.GrnQuantity) > 0 &&
                                grnitem.Status == 1) {

                                if (grnitem && parseInt(grnitem.GrnQuantity) > 0) {
                                    AtLeatOneItem = 1;
                                }

                                PoGrnItemTotalQty = PoGrnItemTotalQty + parseInt(grnitem.GrnQuantity);

                                if ((parseInt(PoGrnItemTotalQty) + parseInt(poditem.ReceivedQuantity)) > parseInt(poditem.PoQuantity)) {
                                    PoGrnQtyCheck = 1;
                                    PoGrnItemName = poditem.ItemName;
                                    break;
                                } else {
                                    continue;
                                }
                            }
                        }

                        if ((parseInt(PoGrnItemTotalQty) + parseInt(poditem.ReceivedQuantity)) < parseInt(poditem.PoQuantity)) {
                            POStatusCheck = 1;
                        }
                    }

                    if (PoGrnQtyCheck === 1) {
                        utl.Alert.showErrorMsg($translate.instant('inventory.grn.grnpoqtyalert.lbl') + PoGrnItemName);
                        return false;
                    }

                    if (AtLeatOneItem === 0) {
                        utl.Alert.showErrorMsg($translate.instant('inventory.grn.qtyatleastoneitem.lbl'));
                        return false;
                    }

                    if (POStatusCheck === 1) {
                        $scope.item.PoStatusId = 2;
                    } else {
                        $scope.item.PoStatusId = 4;
                    }
                }
            }


            if (checkMandatoryFields()) {

                var res = getLinesForSave();
                var lines = [];
                if (res.isValid)
                    lines = res.lines;
                else
                    return false;

                if ($scope.jssgrn == 1) {
                    console.log(makeRoundOff($scope.item.TotalGstAmount));
                    console.log(makeRoundOff(parseFloat($scope.item.TotalSGstAmount) + parseFloat($scope.item.TotalCGstAmount)));

                  //  if (makeRoundOff($scope.item.TotalGstAmount) > (makeRoundOff(parseFloat($scope.item.TotalSGstAmount) + parseFloat($scope.item.TotalCGstAmount)))) {
                       // utl.Alert.showErrorMsg($translate.instant('Please Check Total Gst Amount'));
                     //   return false;
              //      }
                    if ($scope.item.TotalGstAmount >= $scope.item.TotalGrossAmount) {
                        utl.Alert.showErrorMsg($translate.instant('Please Check Total Gst Amount'));
                        return false;
                    }
                }
                var actionName = 'pharmacy/grn/AddGrn';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'pharmacy/grn/UpdateGrn';
                }

                savehitcompleted = 1;

                var inputData = {
                    Header: $scope.item,
                    Details: lines
                };
                // console.log(inputData);return;
                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback,
                    // onError: $scope.errorItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            if ($scope.item.GrnStatusId <= 2) {
                if ($scope.grnDetails.length > 1 && $scope.item.PurchaseOrderId === 0) {
                    for (var iddx in $scope.grnDetails) {
                        var iddxitem = $scope.grnDetails[iddx];
                        if (iddxitem.IsBillable === true) {
                            if (iddxitem.MrPrice == 0) {
                                utl.Alert.showErrorMsg(`${iddxitem.ItemName}: ${$translate.instant('MRP should not be 0')}`);
                                return false;
                            }
                            if (iddxitem.MrPrice < iddxitem.PurchasePrice) {
                                if ($scope.jssgrn == 0) {
                                    utl.Alert.showErrorMsg(`${iddxitem.ItemName}: ${$translate.instant('MRP should not be less than Purchase Price')}`);
                                    return false;
                                }
                            }
                        }
                        if (iddxitem.ItemMasterId > 0 && parseInt(iddxitem.GrnQuantity) <= 0 && iddxitem.Status === 1) {
                            if (parseInt(iddxitem.FreeQty) == 0) {
                                utl.Alert.showErrorMsg($translate.instant('inventory.grn.enterqty.lbl') + iddxitem.ItemName);
                                return false;
                            }
                        } else if (iddxitem.ItemMasterId > 0 && parseFloat(iddxitem.UomPrice) <= 0 && iddxitem.Status === 1) {
                            utl.Alert.showErrorMsg($translate.instant('inventory.grn.greaterthanzero.lbl') + iddxitem.ItemName);
                            return false;
                        } else if (iddxitem.ItemMasterId > 0 && parseFloat(iddxitem.UomMrPrice) < parseFloat(iddxitem.UomPrice)) {
                            if ($scope.jssgrn == 0) {
                                utl.Alert.showErrorMsg($translate.instant('Sales Price should greater than or equal to purchase price for') + iddxitem.ItemName);
                                return false;
                            }
                        }
                        // else if (iddxitem.IsMRPRequired) {
                        //     if (iddxitem.ItemMasterId > 0 && parseFloat(iddxitem.UomMrPrice) < parseFloat(iddxitem.UomCostPrice) ) {
                        //         utl.Alert.showErrorMsg($translate.instant('inventory.grn.mrpgreaterucp.lbl') + iddxitem.ItemName);
                        //         return false;
                        //     }
                        // }
                    }
                } else if ($scope.item.PurchaseOrderId > 0) {
                    for (var pridx in $scope.grnDetails) {
                        var pridxitem = $scope.grnDetails[pridx];
                        if (pridxitem.IsBillable === true) {
                            if (pridxitem.MrPrice == 0) {
                                utl.Alert.showErrorMsg(`${pridxitem.ItemName}: ${$translate.instant('MRP should not be 0')}`);
                                return false;
                            }
                            if (pridxitem.MrPrice < pridxitem.PurchasePrice) {
                                // utl.Alert.showErrorMsg(`${pridxitem.ItemName}: ${$translate.instant('MRP should not be less than Purchase Price')}`);
                                // return false;
                            }
                        }
                        /*
                        if (pridxitem.ItemMasterId > 0 && parseInt(pridxitem.GrnQuantity) <= 0) {
                            utl.Alert.showErrorMsg('Please Enter Qty for ' + pridxitem.ItemName);
                            return false;
                        }
                        */
                        if (pridxitem.ItemMasterId > 0 && parseFloat(pridxitem.UomPrice) <= 0) {
                            utl.Alert.showErrorMsg($translate.instant('inventory.grn.greaterthanzero.lbl') + pridxitem.ItemName);
                            return false;
                        }
                        // else if (pridxitem.IsMRPRequired) {
                        //     if (pridxitem.ItemMasterId > 0 && parseFloat(pridxitem.UomMrPrice) < parseFloat(pridxitem.UomCostPrice)) {
                        //         utl.Alert.showErrorMsg($translate.instant('inventory.grn.mrpgreaterucp.lbl') + pridxitem.ItemName);
                        //         return false;
                        //     }
                        // }
                        else if (pridxitem.ItemMasterId > 0 && parseInt(pridxitem.GrnQuantity) > parseInt(pridxitem.PoQuantity)) {
                            utl.Alert.showErrorMsg($translate.instant('inventory.grn.grnqtygreaterpoqty.lbl') + pridxitem.ItemName);
                            return false;
                        }
                    }
                } else if ($scope.grnDetails.length == 1 && $scope.item.PurchaseOrderId === 0) {
                    for (var idddx in $scope.grnDetails) {
                        var idddxitem = $scope.grnDetails[idddx];
                        if (idddxitem.ItemMasterId > 0 && idddxitem.Status === 1) {
                            if (parseInt(idddxitem.GrnQuantity) <= 0) {
                                utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.requestedquantity.lbl') + idddxitem.ItemName);
                                return false;
                            } else if (parseFloat(idddxitem.UomPrice) <= 0) {
                                utl.Alert.showErrorMsg($translate.instant('inventory.grn.greaterthanzero.lbl') + idddxitem.ItemName);
                                return false;
                            }
                            // else if (idddxitem.IsMRPRequired) {
                            //     if (parseFloat(idddxitem.UomMrPrice) < parseFloat(idddxitem.UomCostPrice)) {
                            //         utl.Alert.showErrorMsg($translate.instant('inventory.grn.mrpgreaterucp.lbl') + idddxitem.ItemName);
                            //         return false;
                            //     }
                            // }
                        } else {
                            utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepriceatleastone.lbl'));
                            return false;
                        }
                    }
                }
            }

            return true;
        }
        $scope.getvendorListCallback = function (scope, res, options, hasError) {
            $scope.vendorPriceDetails = res.Data;

        };

        $scope.getvendorItems = function (itemid) {
            var inputData = {
                Params: [{
                    Key: 14,
                    Value: utl.Session.getCurrentFacilityId()
                },
                // {
                //     Key: 6,
                //     Value: [2, 3, 4]
                // },
                // {
                //     Key: 10,
                //     Value: $scope.item.VendorMasterId
                // },
                {
                    Key: 2,
                    Value: itemid
                },
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/GrnDetail/GetGrnDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvendorListCallback
            };

            utl.Http.doAction(options);
        };

        function duplicateBatchCheck(item) {
            var duplicateCount = 0;
            for (var idx in $scope.grnDetails) {
                var batchitem = $scope.grnDetails[idx];
                if (batchitem.ItemMasterId == item.ItemMasterId && batchitem.BatchId == item.BatchId && batchitem.Status == 1) {
                    duplicateCount = duplicateCount + 1;
                }
            }

            if (duplicateCount > 1) {
                utl.Alert.showErrorMsg($translate.instant('inventory.grn.duplicatebatch.lbl') + item.ItemName);
                return false;
            }

            return true;
        }

        function getLinesForSave() {
            var result = [];
            var isValid = false;
            var CheckBatches = $scope.grnDetails;
            for (var idx in $scope.grnDetails) {
                var item = $scope.grnDetails[idx];
                item.VendorMasterId = $scope.item.VendorMasterId;
                item.StoreMasterId = $scope.item.StoreMasterId;
                item.FacilityId = $scope.item.FacilityId;
                if (item.FreeQty === undefined || item.FreeQty === null) {
                    item.FreeQty = 0;
                } else if (parseInt(item.FreeQty) === 0) {
                    item.FreeQty = 0;
                }
                if (item.UomMrPrice === undefined || item.UomMrPrice === null) {
                    item.UomMrPrice = 0;
                } else {
                    item.UomMrPrice = parseFloat(item.UomMrPrice).toFixed(4);
                    item.MrPrice = parseFloat(item.UomMrPrice).toFixed(4) / item.ConversionQuantity;
                }
                if (!item.BarCodeId) {
                    var digits = item.BatchId + utl.Formatter.getExpDateString(item.ExpiryDate);
                    item.BarCodeId = '';
                    for (let i = 0; i < 8; i++) {
                        item.BarCodeId += digits[Math.floor(Math.random() * 10)];
                    }
                }
                if (item.Id > 0) {
                    if (item.ItemMasterId > 0 && parseFloat(item.GrnQuantity) > 0) {
                        item.GrnQuantity = parseFloat(item.GrnQuantity);
                        if (duplicateBatchCheck(item)) {
                            result.push(item);
                            isValid = true;
                        } else {
                            return {
                                isValid: false,
                                lines: []
                            };
                        }
                    }
                } else {
                    if (item.ItemMasterId > 0 && item.Status == 1 && parseFloat(item.GrnQuantity) > 0) {
                        item.GrnQuantity = parseFloat(item.GrnQuantity);
                        if (duplicateBatchCheck(item)) {
                            result.push(item);
                            isValid = true;
                        } else {
                            return {
                                isValid: false,
                                lines: []
                            };
                        }
                    } else {
                        if (parseInt(item.FreeQty) > 0 && parseInt(item.GrnQuantity) == 0) {
                            if (duplicateBatchCheck(item)) {
                                result.push(item);
                                isValid = true;
                            } else {
                                return {
                                    isValid: false,
                                    lines: []
                                };
                            }
                        }

                    }
                }
                if (!item.ExpiryDate) {
                    var myDate = new Date();
                    item.ExpiryDate = myDate.setYear(myDate.getFullYear() + 10);
                    item.BatchId = item.ItemCode;
                }
                /*
                if (item.ItemMasterId > 0 && item.Status == 1 && parseInt(item.GrnQuantity) > 0) {
                    item.GrnQuantity = parseInt(item.GrnQuantity);
                    if (duplicateBatchCheck(item)) {
                        result.push(item);
                        isValid = true;
                    } else {
                        return {
                            isValid: false,
                            lines: []
                        };
                    }
                }
                */
            }
            return {
                isValid: isValid,
                lines: result
            };
        }

        function loadData() {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                $scope.item.storeDisabled = true;
            }
            $scope.getItem();
            $scope.getGrnDetails();
            $scope.getfacility();
        }

        $scope.SelectedReceivedStore = function (selectedItem) {
            $scope.item.StoreCode = selectedItem.StoreCode;
            $scope.item.StoreName = selectedItem.StoreName;
            $scope.item.StoreTypeId = selectedItem.StoreMaster.StoreTypeId;
            $scope.item.StoreSubTypeId = selectedItem.StoreMaster.StoreSubTypeId;
            $scope.item.SequenceOptionId = selectedItem.StoreMaster.SequenceOptionId;
            $scope.item.IsOpenGRN = selectedItem.StoreMaster.CanAllowOpenGRN;
            $scope.item.IsGstEditablePo = selectedItem.StoreMaster.IsGstEditablePo;
            if ($scope.item.IsPOMandatory) {
                if (selectedItem.StoreMaster.IsPOMandatory) { } else {
                    $scope.grnDetails = [];
                    $scope.addNewLineItem();
                }
            } else {
                if (selectedItem.StoreMaster.IsPOMandatory) {
                    $scope.grnDetails = [];
                    $scope.addNewLineItem();
                }
            }
            $scope.item.IsPOMandatory = selectedItem.StoreMaster.IsPOMandatory;
        };

        $scope.SelectedVendor = function (selectedItem) {
            $scope.item.VendorCode = selectedItem.VendorCode;
            $scope.item.VendorName = selectedItem.VendorName;
        };

        $scope.onVendorItemSelected = function (idx, selectedItem) {
            var SelectedMasterItem = selectedItem.SelectedItem;

            if (SelectedMasterItem.ItemMaster.ItemFacilityMaps &&
                SelectedMasterItem.ItemMaster.ItemFacilityMaps.length > 0) {
                selectedItem.ItemFacilityMapId = SelectedMasterItem.ItemMaster.ItemFacilityMaps[0].Id;
            }
            selectedItem.ItemVendorMapId = SelectedMasterItem.Id;
            selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.IsBillable = SelectedMasterItem.IsBillable;
            selectedItem.ItemName = SelectedMasterItem.ItemName;
            selectedItem.ManufacturerId = SelectedMasterItem.ItemMaster.ManufacturerId;
            selectedItem.IsMultiUse = SelectedMasterItem.ItemMaster.IsMultiUse;
            selectedItem.NoOfTransactions = SelectedMasterItem.ItemMaster.NoOfTransactions;
            selectedItem.HSNCode = SelectedMasterItem.ItemMaster.HSNCode;
            selectedItem.GrnQuantity = 0;
            selectedItem.FreeQty = SelectedMasterItem.FreeQty;
            selectedItem.ConversionQuantity = SelectedMasterItem.ConversionQuantity || 0;
            selectedItem.GrnQuantityAfterConversion = 0;
            selectedItem.BatchId = '';
            selectedItem.ExpiryDate = null;
            selectedItem.ManufacturedDate = null;
            if (SelectedMasterItem.PurchaseUom !== null) {
                selectedItem.BaseUomId = SelectedMasterItem.PurchaseUom.Id;
                selectedItem.BaseUom.Id = SelectedMasterItem.PurchaseUom.Id;
                selectedItem.BaseUom.UomCode = SelectedMasterItem.PurchaseUom.UomName;

                selectedItem.PurchaseUomId = SelectedMasterItem.PurchaseUom.Id;
                selectedItem.PurchaseUom.Id = SelectedMasterItem.PurchaseUom.Id;
                selectedItem.PurchaseUom.UomCode = SelectedMasterItem.PurchaseUom.UomName;
            }
            if (SelectedMasterItem.SaleUom !== null) {
                selectedItem.SaleUomId = SelectedMasterItem.SaleUom.Id;
                selectedItem.SaleUom.Id = SelectedMasterItem.SaleUom.Id;
                selectedItem.SaleUom.UomCode = SelectedMasterItem.SaleUom.UomName;
            }

            if (SelectedMasterItem.GstMaster !== null) {
                selectedItem.GstMaster.Id = SelectedMasterItem.GstMaster.Id;
                selectedItem.GstId = SelectedMasterItem.GstMaster.Id;
                selectedItem.GstMaster.GstCode = SelectedMasterItem.GstMaster.GstCode;
                selectedItem.GstCode = SelectedMasterItem.GstMaster.GstCode;
                selectedItem.GstMaster.GstPercentage = parseFloat(SelectedMasterItem.GstMaster.GstPercentage.toFixed(4));
                selectedItem.GstPercentage = parseFloat(SelectedMasterItem.GstMaster.GstPercentage.toFixed(4));
            } else {
                selectedItem.GstId = SelectedMasterItem.GstId || 0;
                selectedItem.GstMaster.Id = SelectedMasterItem.GstId || 0;
                selectedItem.GstMaster.GstCode = '';
                selectedItem.GstCode = '';
                selectedItem.GstMaster.GstPercentage = 0;
                selectedItem.GstPercentage = 0;
            }

            if (SelectedMasterItem.CGstMaster !== null) {
                selectedItem.CGstMaster.Id = SelectedMasterItem.CGstMaster.Id;
                selectedItem.CGstId = SelectedMasterItem.CGstMaster.Id;
                selectedItem.CGstMaster.GstCode = SelectedMasterItem.CGstMaster.GstCode;
                selectedItem.CGstCode = SelectedMasterItem.CGstMaster.GstCode;
                selectedItem.CGstMaster.GstPercentage = parseFloat(SelectedMasterItem.CGstMaster.GstPercentage.toFixed(4));
                selectedItem.CGstPercentage = parseFloat(SelectedMasterItem.CGstMaster.GstPercentage.toFixed(4));
            } else {
                selectedItem.CGstMaster.Id = SelectedMasterItem.CGstId || 0;
                selectedItem.CGstId = SelectedMasterItem.CGstId || 0;
                selectedItem.CGstMaster.GstCode = '';
                selectedItem.CGstCode = '';
                selectedItem.CGstMaster.GstPercentage = 0;
                selectedItem.CGstPercentage = 0;
            }

            if (SelectedMasterItem.SGstMaster !== null) {
                selectedItem.SGstMaster.Id = SelectedMasterItem.SGstMaster.Id;
                selectedItem.SGstId = SelectedMasterItem.SGstMaster.Id;
                selectedItem.SGstMaster.GstCode = SelectedMasterItem.SGstMaster.GstCode;
                selectedItem.SGstCode = SelectedMasterItem.SGstMaster.GstCode;
                selectedItem.SGstMaster.GstPercentage = parseFloat(SelectedMasterItem.SGstMaster.GstPercentage.toFixed(4));
                selectedItem.SGstPercentage = parseFloat(SelectedMasterItem.SGstMaster.GstPercentage.toFixed(4));
            } else {
                selectedItem.SGstMaster.Id = SelectedMasterItem.SGstId || 0;
                selectedItem.SGstId = SelectedMasterItem.SGstId || 0;
                selectedItem.SGstMaster.GstCode = '';
                selectedItem.SGstCode = '';
                selectedItem.SGstMaster.GstPercentage = 0;
                selectedItem.SGstPercentage = 0;
            }

            selectedItem.UomPrice = parseFloat(SelectedMasterItem.UomPrice.toFixed(4));
            selectedItem.PurchasePrice = parseFloat(SelectedMasterItem.Price.toFixed(4));

            selectedItem.UomMrPrice = parseFloat(SelectedMasterItem.UomMrPrice.toFixed(4));
            selectedItem.MrPrice = parseFloat(SelectedMasterItem.MrPrice.toFixed(4));

            selectedItem.DiscountModeId = SelectedMasterItem.DiscountModeId;
            if (SelectedMasterItem.DiscountModeId == 1) {
                selectedItem.DiscountMode = 'Rs.';
                selectedItem.Discount = parseFloat(SelectedMasterItem.Discount.toFixed(4));
                selectedItem.UomDiscountAmount = parseFloat(SelectedMasterItem.Discount.toFixed(4));
                selectedItem.UomDiscount1Amount = parseFloat(SelectedMasterItem.Discount1.toFixed(4));
                selectedItem.UomDiscount2Amount = parseFloat(SelectedMasterItem.Discount2.toFixed(4));
                selectedItem.DiscountAmount = parseFloat((SelectedMasterItem.Discount / selectedItem.ConversionQuantity).toFixed(4));
            } else if (SelectedMasterItem.DiscountModeId == 2) {
                selectedItem.DiscountMode = '%';
                selectedItem.Discount = parseFloat(SelectedMasterItem.Discount.toFixed(4));
                selectedItem.UomDiscountAmount = parseFloat(((selectedItem.UomPrice / 100) * SelectedMasterItem.Discount).toFixed(4));
                selectedItem.UomDiscount1Amount = parseFloat(((selectedItem.UomPrice / 100) * SelectedMasterItem.Discount1).toFixed(4));
                selectedItem.UomDiscount2Amount = parseFloat(((selectedItem.UomPrice / 100) * SelectedMasterItem.Discount2).toFixed(4));
                selectedItem.DiscountAmount = parseFloat(((selectedItem.PurchasePrice / 100) * SelectedMasterItem.Discount).toFixed(4));
            } else {
                selectedItem.DiscountMode = '';
                selectedItem.Discount = 0;
                selectedItem.UomDiscountAmount = 0;
                selectedItem.UomDiscount1Amount = 0;
                selectedItem.UomDiscount2Amount = 0;
                selectedItem.DiscountAmount = 0;
            }

            selectedItem.UomPriceAfterDiscount = parseFloat(selectedItem.UomPrice - selectedItem.UomDiscountAmount.toFixed(4));
            selectedItem.PurchasePriceAfterDiscount = parseFloat(selectedItem.PurchasePrice - selectedItem.DiscountAmount.toFixed(4));

            selectedItem.GstAmount = ((selectedItem.UomPriceAfterDiscount / 100) * parseInt(selectedItem.GstPercentage)) * parseInt(selectedItem.GrnQuantity);
            // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
            selectedItem.UnitGstAmount = (selectedItem.PurchasePriceAfterDiscount / 100) * selectedItem.GstPercentage;
            // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
            selectedItem.CGstAmount = (selectedItem.UomPriceAfterDiscount / 100) * selectedItem.CGstPercentage;
            selectedItem.UnitCGstAmount = (selectedItem.PurchasePriceAfterDiscount / 100) * selectedItem.CGstPercentage;

            // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
            selectedItem.SGstAmount = (selectedItem.UomPriceAfterDiscount / 100) * selectedItem.SGstPercentage;
            selectedItem.UnitSGstAmount = (selectedItem.PurchasePriceAfterDiscount / 100) * selectedItem.SGstPercentage;

            // selectedItem.GstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * SelectedMasterItem.GstMaster.GstPercentage).toFixed(4));
            // selectedItem.UnitGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * SelectedMasterItem.GstMaster.GstPercentage).toFixed(4));

            // selectedItem.CGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * SelectedMasterItem.CGstMaster.GstPercentage).toFixed(4));
            // selectedItem.UnitCGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * SelectedMasterItem.CGstMaster.GstPercentage).toFixed(4));

            // selectedItem.SGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * SelectedMasterItem.SGstMaster.GstPercentage).toFixed(4));
            // selectedItem.UnitSGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * SelectedMasterItem.SGstMaster.GstPercentage).toFixed(4));

            selectedItem.UomCostPrice = parseFloat((selectedItem.UomPriceAfterDiscount + selectedItem.GstAmount).toFixed(4));
            selectedItem.UnitCostPrice = parseFloat((selectedItem.PurchasePriceAfterDiscount + selectedItem.UnitGstAmount).toFixed(4));

            selectedItem.GrossAmount = 0;
            selectedItem.NetAmount = 0;

            if (SelectedMasterItem.ItemMaster.StockItem) {
                selectedItem.StockItemId = SelectedMasterItem.ItemMaster.StockItem.Id;
            } else {
                selectedItem.StockItemId = 0;
            }

            if (SelectedMasterItem.ItemMaster.IsBatchMandatory)
                selectedItem.IsBatchRequired = true;

            if (SelectedMasterItem.ItemMaster.IsExpiryMandatory)
                selectedItem.IsExpiryRequired = true;

            if (SelectedMasterItem.ItemMaster.IsManufacture)
                selectedItem.IsManfRequired = true;

            if (SelectedMasterItem.ItemMaster.IsMRPRequired)
                selectedItem.IsMRPRequired = true;

            var GrnLineDetails = [];
            for (var gldid = 0; gldid < $scope.grnDetails.length; gldid++) {
                var GrnLineDetail = $scope.grnDetails[gldid];
                if (GrnLineDetail.Status == 1) {
                    GrnLineDetails.push(GrnLineDetail);
                }
            }

            var lastIndex = GrnLineDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
            $scope.getvendorItems(selectedItem.ItemMasterId);
        };


        $scope.getItembyId = function (itemid) {
            if (itemid && itemid > 0) {

                var options = {
                    action: 'pharmacy/itemmaster/GetItemMasterById',
                    data: {
                        Id: itemid
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.onMasterItemSelected = function (idx, selectedItem) {
            var SelectedMasterItem = selectedItem.SelectedItem;
            if ($scope.jssgrn == 1) {
                var SelectedMasterItem = selectedItem.SelectedItem.ItemMaster;
            }

            selectedItem.MasterItem = SelectedMasterItem;
            if (SelectedMasterItem.ItemFacilityMaps && SelectedMasterItem.ItemFacilityMaps.length > 0) {
                selectedItem.ItemFacilityMapId = SelectedMasterItem.ItemFacilityMaps[0].Id;
            }

            selectedItem.ItemMasterId = SelectedMasterItem.Id;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.IsBillable = SelectedMasterItem.IsBillable;
            selectedItem.ItemName = SelectedMasterItem.ItemName;
            selectedItem.UomPrice = SelectedMasterItem.ItemPrice;

            if ($scope.jssgrn == 1) {
                SelectedMasterItem.Mrp = parseFloat(SelectedMasterItem.MrPrice).toFixed(2);
                selectedItem.UomMrPrice = SelectedMasterItem.Mrp;
                selectedItem.MrPrice = SelectedMasterItem.Mrp;
            } else {
                selectedItem.UomMrPrice = SelectedMasterItem.Mrp;
                selectedItem.MrPrice = SelectedMasterItem.Mrp;
            }

            selectedItem.GstId = SelectedMasterItem.GstId;
            if ($scope.notallowdiscount == 0) {
                selectedItem.DiscountModeId = SelectedMasterItem.DiscountModeId;
                selectedItem.Discount = SelectedMasterItem.Discount;
            } else {
                // selectedItem.DiscountModeId = SelectedMasterItem.DiscountModeId;
                // selectedItem.Discount = SelectedMasterItem.Discount;
            }

            selectedItem.FreeQty = SelectedMasterItem.FreeQty || 0;
            selectedItem.ManufacturerId = SelectedMasterItem.ManufacturerId;
            selectedItem.HSNCode = SelectedMasterItem.HSNCode;
            selectedItem.IsMultiUse = SelectedMasterItem.IsMultiUse;
            selectedItem.IsReusable = SelectedMasterItem.IsReusable;
            selectedItem.Min = SelectedMasterItem.Min;
            selectedItem.Max = SelectedMasterItem.Max;
            selectedItem.NoOfTransactions = SelectedMasterItem.NoOfTransactions;
            selectedItem.GrnQuantity = 0;
            // selectedItem.FreeQty = 0;
            selectedItem.GrnQuantityAfterConversion = 0;
            selectedItem.BatchId = '';
            selectedItem.ExpiryDate = null;
            selectedItem.ManufacturedDate = null;

            if (SelectedMasterItem.PurchaseUom) {
                selectedItem.PurchaseUomId = SelectedMasterItem.PurchaseUom.Id || 0;
                selectedItem.PurchaseUom.Id = SelectedMasterItem.PurchaseUom.Id || 0;
                selectedItem.PurchaseUom.UomCode = SelectedMasterItem.PurchaseUom.UomCode;
            }

            if (SelectedMasterItem.SaleUom) {
                selectedItem.SaleUomId = SelectedMasterItem.SaleUom.Id || 0;
                selectedItem.SaleUom.Id = SelectedMasterItem.SaleUom.Id || 0;
                selectedItem.SaleUom.UomCode = SelectedMasterItem.SaleUom.UomCode;
            }

            if (SelectedMasterItem.UomConversions) {
                if (SelectedMasterItem.UomConversions.length > 0) {
                    for (var idxUOM in SelectedMasterItem.UomConversions) {
                        var uom = SelectedMasterItem.UomConversions[idxUOM];
                        if (uom.UomTypeId == 2) {
                            selectedItem.ConversionQuantity = uom.ConversionQuantity || 1;
                        }
                        if ($scope.item.IsOpenGRN && uom.UomTypeId == 2) {
                            selectedItem.UomCode = uom.UomMaster.UomName;
                            if (selectedItem.UomCode != '' && selectedItem.UomCode != null) {
                                selectedItem.PurchaseUomId = uom.UomMaster.UomId || 0;
                                selectedItem.PurchaseUom.Id = uom.UomMaster.UomId || 0;
                                selectedItem.PurchaseUom.UomCode = uom.UomMaster.UomName;
                            }
                        }
                        if ($scope.item.IsOpenGRN && uom.UomTypeId == 3) {
                            selectedItem.UomCode = uom.UomMaster.UomName;
                            if (selectedItem.UomCode != '' && selectedItem.UomCode != null) {
                                selectedItem.SaleUomId = uom.UomMaster.UomId || 0;
                                selectedItem.SaleUom.Id = uom.UomMaster.UomId || 0;
                                selectedItem.SaleUom.UomCode = uom.UomMaster.UomName;
                            }
                        }
                        if ($scope.item.IsOpenGRN && uom.UomTypeId == 1) {
                            selectedItem.UomCode = uom.UomMaster.UomName;
                            if (selectedItem.UomCode != '' && selectedItem.UomCode != null) {
                                selectedItem.BaseUomId = uom.UomMaster.UomId || 0;
                                selectedItem.BaseUom.Id = uom.UomMaster.UomId || 0;
                                selectedItem.BaseUom.UomCode = uom.UomMaster.UomName;
                            }
                        }
                    }
                }
            }

            if (SelectedMasterItem.GstMaster) {
                selectedItem.GstMaster.Id = SelectedMasterItem.GstMaster.Id || 1;
                selectedItem.GstId = SelectedMasterItem.GstMaster.Id || 1;
                selectedItem.GstMaster.GstCode = SelectedMasterItem.GstMaster.GstCode;
                selectedItem.GstCode = SelectedMasterItem.GstMaster.GstCode;
                selectedItem.GstMaster.GstPercentage = parseFloat(SelectedMasterItem.GstMaster.GstPercentage.toFixed(4));
                selectedItem.GstPercentage = parseFloat(SelectedMasterItem.GstMaster.GstPercentage.toFixed(4));
            } else {
                selectedItem.GstId = SelectedMasterItem.GstId || 1;
                selectedItem.GstMaster.Id = SelectedMasterItem.GstId || 1;
                selectedItem.GstMaster.GstCode = '';
                selectedItem.GstCode = '';
                selectedItem.GstMaster.GstPercentage = 0;
                selectedItem.GstPercentage = 0;
            }

            if (SelectedMasterItem.CGstMaster) {
                selectedItem.CGstMaster.Id = SelectedMasterItem.CGstMaster.Id || 1;
                selectedItem.CGstId = SelectedMasterItem.CGstMaster.Id || 1;
                selectedItem.CGstMaster.GstCode = SelectedMasterItem.CGstMaster.GstCode;
                selectedItem.CGstCode = SelectedMasterItem.CGstMaster.GstCode;
                selectedItem.CGstMaster.GstPercentage = parseFloat(SelectedMasterItem.CGstMaster.GstPercentage.toFixed(4));
                selectedItem.CGstPercentage = parseFloat(SelectedMasterItem.CGstMaster.GstPercentage.toFixed(4));
            } else {
                selectedItem.CGstMaster.Id = SelectedMasterItem.CGstId || 1;
                selectedItem.CGstId = SelectedMasterItem.CGstId || 1;
                selectedItem.CGstMaster.GstCode = '';
                selectedItem.CGstCode = '';
                selectedItem.CGstMaster.GstPercentage = 0;
                selectedItem.CGstPercentage = 0;
            }

            if (SelectedMasterItem.SGstMaster) {
                selectedItem.SGstMaster.Id = SelectedMasterItem.SGstMaster.Id || 1;
                selectedItem.SGstId = SelectedMasterItem.SGstMaster.Id || 1;
                selectedItem.SGstMaster.GstCode = SelectedMasterItem.SGstMaster.GstCode;
                selectedItem.CGstCode = SelectedMasterItem.SGstMaster.GstCode;
                selectedItem.SGstMaster.GstPercentage = parseFloat(SelectedMasterItem.SGstMaster.GstPercentage.toFixed(4));
                selectedItem.SGstPercentage = parseFloat(SelectedMasterItem.SGstMaster.GstPercentage.toFixed(4));
            } else {
                selectedItem.SGstMaster.Id = SelectedMasterItem.SGstId || 1;
                selectedItem.SGstId = SelectedMasterItem.SGstId || 1;
                selectedItem.SGstMaster.GstCode = '';
                selectedItem.CGstCode = '';
                selectedItem.SGstMaster.GstPercentage = 0;
                selectedItem.SGstPercentage = 0;
            }

            if (SelectedMasterItem.InGstMaster) {
                selectedItem.InGstMaster.Id = SelectedMasterItem.InGstMaster.Id || 1;
                selectedItem.InGstId = SelectedMasterItem.InGstMaster.Id || 1;
                selectedItem.InGstMaster.GstCode = SelectedMasterItem.InGstMaster.GstCode;
                selectedItem.InGstCode = SelectedMasterItem.InGstMaster.GstCode;
                selectedItem.InGstMaster.GstPercentage = parseFloat(SelectedMasterItem.InGstMaster.GstPercentage.toFixed(4));
                selectedItem.InGstPercentage = parseFloat(SelectedMasterItem.InGstMaster.GstPercentage.toFixed(4));
            } else {
                selectedItem.InGstMaster.Id = SelectedMasterItem.InGstId || 1;
                selectedItem.InGstId = SelectedMasterItem.InGstId || 1;
                selectedItem.InGstMaster.GstCode = '';
                selectedItem.InGstCode = '';
                selectedItem.InGstMaster.GstPercentage = 0;
                selectedItem.InGstPercentage = 0;
            }

            // if (SelectedMasterItem.CGstMaster) {
            //     selectedItem.CGstMaster.Id = SelectedMasterItem.CGstMaster.Id || 1;
            //     selectedItem.CGstId = SelectedMasterItem.CGstMaster.Id || 1;
            //     selectedItem.CGstMaster.GstCode = SelectedMasterItem.CGstMaster.GstCode;
            //     selectedItem.CGstCode = SelectedMasterItem.CGstMaster.GstCode;
            //     selectedItem.CGstMaster.GstPercentage = parseFloat(SelectedMasterItem.CGstMaster.GstPercentage.toFixed(4));
            //     selectedItem.CGstPercentage = parseFloat(SelectedMasterItem.CGstMaster.GstPercentage.toFixed(4));
            // } else {
            //     selectedItem.CGstMaster.Id = SelectedMasterItem.CGstId || 1;
            //     selectedItem.CGstId = SelectedMasterItem.CGstId || 1;
            //     selectedItem.CGstMaster.GstCode = '';
            //     selectedItem.CGstCode = '';
            //     selectedItem.CGstMaster.GstPercentage = 0;
            //     selectedItem.CGstPercentage = 0;
            // }

            if (SelectedMasterItem.ItemVendorMaps) {
                var VendorMappedItem = SelectedMasterItem.ItemVendorMaps[0];
                selectedItem.UomPrice = VendorMappedItem.UomPrice;
                selectedItem.PurchasePrice = VendorMappedItem.Price;
                selectedItem.UomMrPrice = VendorMappedItem.UomMrPrice;
                selectedItem.MrPrice = VendorMappedItem.MrPrice;
                selectedItem.DiscountModeId = VendorMappedItem.DiscountModeId;
                if (VendorMappedItem.DiscountModeId === 1) {
                    selectedItem.DiscountMode = 'SR';
                    selectedItem.Discount = VendorMappedItem.Discount;
                    selectedItem.UomDiscountAmount = parseFloat(VendorMappedItem.Discount.toFixed(4));
                    selectedItem.UomDiscount1Amount = parseFloat(VendorMappedItem.Discount1.toFixed(4));
                    selectedItem.UomDiscount2Amount = parseFloat(VendorMappedItem.Discount2.toFixed(4));
                    selectedItem.DiscountAmount = parseFloat((VendorMappedItem.Discount / VendorMappedItem.ConversionQuantity).toFixed(4));
                } else if (SelectedMasterItem.DiscountModeId == 2) {
                    selectedItem.DiscountMode = '%';
                    selectedItem.Discount = VendorMappedItem.Discount;
                    selectedItem.UomDiscountAmount = parseFloat(((selectedItem.UomPrice / 100) * VendorMappedItem.Discount).toFixed(4));
                    selectedItem.UomDiscount1Amount = parseFloat(((selectedItem.UomPrice / 100) * VendorMappedItem.Discount1).toFixed(4));
                    selectedItem.UomDiscount2Amount = parseFloat(((selectedItem.UomPrice / 100) * VendorMappedItem.Discount2).toFixed(4));
                    selectedItem.DiscountAmount = parseFloat(((selectedItem.PurchasePrice / 100) * VendorMappedItem.Discount).toFixed(4));
                } else {
                    selectedItem.DiscountMode = '';
                    selectedItem.Discount = 0;
                    selectedItem.UomDiscountAmount = 0;
                    selectedItem.UomDiscount1Amount = 0;
                    selectedItem.UomDiscount2Amount = 0;
                    selectedItem.DiscountAmount = 0;
                }

                selectedItem.UomPriceAfterDiscount = parseFloat(selectedItem.UomPrice - selectedItem.UomDiscountAmount.toFixed(4));
                selectedItem.PurchasePriceAfterDiscount = parseFloat(selectedItem.PurchasePrice - selectedItem.DiscountAmount.toFixed(4));

                selectedItem.GstAmount = ((selectedItem.UomPriceAfterDiscount / 100) * parseInt(selectedItem.GstPercentage)) * parseInt(selectedItem.GrnQuantity);
                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                selectedItem.UnitGstAmount = (selectedItem.PurchasePriceAfterDiscount / 100) * selectedItem.GstPercentage;
                // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                selectedItem.CGstAmount = (selectedItem.UomPriceAfterDiscount / 100) * selectedItem.CGstPercentage;
                selectedItem.UnitCGstAmount = (selectedItem.PurchasePriceAfterDiscount / 100) * selectedItem.CGstPercentage;

                // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                selectedItem.SGstAmount = (selectedItem.UomPriceAfterDiscount / 100) * selectedItem.SGstPercentage;
                selectedItem.UnitSGstAmount = (selectedItem.PurchasePriceAfterDiscount / 100) * selectedItem.SGstPercentage;

                // selectedItem.GstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * VendorMappedItem.GstMaster.GstPercentage).toFixed(4));
                // selectedItem.UnitGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * VendorMappedItem.GstMaster.GstPercentage).toFixed(4));

                // selectedItem.CGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * VendorMappedItem.CGstMaster.GstPercentage).toFixed(4));
                // selectedItem.UnitCGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * VendorMappedItem.CGstMaster.GstPercentage).toFixed(4));

                // selectedItem.SGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * VendorMappedItem.SGstMaster.GstPercentage).toFixed(4));
                // selectedItem.UnitSGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * VendorMappedItem.SGstMaster.GstPercentage).toFixed(4));

                selectedItem.UomCostPrice = parseFloat((selectedItem.UomPriceAfterDiscount + selectedItem.GstAmount).toFixed(4));
                selectedItem.UnitCostPrice = parseFloat((selectedItem.PurchasePriceAfterDiscount + selectedItem.UnitGstAmount).toFixed(4));

                selectedItem.GrossAmount = 0;
                selectedItem.NetAmount = 0;
            } else {
                // selectedItem.UomPrice = 0;
                selectedItem.PurchasePrice = 0;
                // selectedItem.UomMrPrice = 0;
                // selectedItem.MrPrice = 0;
                // selectedItem.DiscountModeId = 2;
                // selectedItem.DiscountMode = '%';
                // selectedItem.Discount = 0;
                selectedItem.UomDiscountAmount = 0;
                selectedItem.UomDiscount1Amount = 0;
                selectedItem.UomDiscount2Amount = 0;
                selectedItem.DiscountAmount = 0;
                selectedItem.UomPriceAfterDiscount = 0;
                selectedItem.PurchasePriceAfterDiscount = 0;
                selectedItem.GstAmount = 0;
                selectedItem.UnitGstAmount = 0;
                selectedItem.CGstAmount = 0;
                selectedItem.UnitCGstAmount = 0;
                selectedItem.SGstAmount = 0;
                selectedItem.UnitSGstAmount = 0;
                selectedItem.UomCostPrice = 0;
                selectedItem.UnitCostPrice = 0;
                selectedItem.GrossAmount = 0;
                selectedItem.NetAmount = 0;
            }

            if (SelectedMasterItem.StockItem) {
                selectedItem.StockItemId = SelectedMasterItem.StockItem.Id;
            } else {
                selectedItem.StockItemId = 0;
            }

            if (SelectedMasterItem.IsBatchMandatory)
                selectedItem.IsBatchRequired = true;

            if (SelectedMasterItem.IsExpiryMandatory)
                selectedItem.IsExpiryRequired = true;

            if (SelectedMasterItem.IsManufacture)
                selectedItem.IsManfRequired = true;

            if (SelectedMasterItem.IsMRPRequired)
                selectedItem.IsMRPRequired = true;

            var GrnLineDetails = [];
            for (var gldid = 0; gldid < $scope.grnDetails.length; gldid++) {
                var GrnLineDetail = $scope.grnDetails[gldid];
                if (GrnLineDetail.Status == 1) {
                    GrnLineDetails.push(GrnLineDetail);
                }
            }

            var lastIndex = GrnLineDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
            $scope.getvendorItems(selectedItem.ItemMasterId);
        };

        $scope.validateFreeQty = function (item) {
            if (item.FreeQty === undefined || item.FreeQty === null) {
                item.GrnQuantityAfterConversion = parseFloat(item.GrnQuantity) * item.ConversionQuantity;
                item.FreeQtyAfterConversion = 0 * item.ConversionQuantity;

                item.TotalQuantity = parseFloat(item.GrnQuantity) + 0;
                item.TotalQuantityAfterConversion = item.TotalQuantity * item.ConversionQuantity;
            } else {
                /*
                if (parseInt(item.GrnQuantity) < parseInt(item.FreeQty)) {
                    item.FreeQty = 0;
                    utl.Alert.showErrorMsg('Free Qty should not greater than GRN Qty');
                } else {
                    item.GrnQuantityAfterConversion = parseInt(item.GrnQuantity) * item.ConversionQuantity;
                    item.FreeQtyAfterConversion = parseInt(item.FreeQty) * item.ConversionQuantity;

                    item.TotalQuantity = parseInt(item.GrnQuantity) + parseInt(item.FreeQty);
                    item.TotalQuantityAfterConversion = item.TotalQuantity * item.ConversionQuantity;
                }
                */
                if (parseInt(item.FreeQty) >= 0) {
                    item.GrnQuantityAfterConversion = parseFloat(item.GrnQuantity) * item.ConversionQuantity;
                    item.FreeQtyAfterConversion = parseFloat(item.FreeQty) * item.ConversionQuantity;

                    item.TotalQuantity = parseFloat(item.GrnQuantity) + parseInt(item.FreeQty);
                    item.TotalQuantityAfterConversion = item.TotalQuantity * item.ConversionQuantity;
                }
                // $scope.computeAmount(item);
            }
        };

        $scope.validateMRPrice = function (item) {
            if (item.IsMRPRequired) {
                if (parseFloat(item.UomMrPrice) < parseFloat(item.UomCostPrice)) {
                    item.UomMrPrice = 0;
                    utl.Alert.showErrorMsg($translate.instant('inventory.grn.mrpgreaterucp.lbl'));
                } else { }
            }
        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // Let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress && (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.setDispExpiry = function (item) {
            item.dispExpiryDate = moment(item.ExpiryDate).format("MMYY");
        };

        $scope.setExpiryFocus = function (item, idx) {
            item.dispExpiryDate = null;
            item.ExpiryDate = null;
            utl.Alert.showErrorMsg($translate.instant('inventory.grn.expirydatefuturedate.lbl'));
            $("#dispExpiryDate" + idx).focus();
        };

        $scope.CheckExpiryDate = function (item, idx) {
            try {
                if (item.dispExpiryDate) {
                    if (item.dispExpiryDate.length > 3) {
                        var TodayDate = new Date().toISOString().slice(0, 10);
                        var CurDate = new Date(TodayDate);
                        item.dispExpiryDate = item.dispExpiryDate.replace('/', '');
                        item.dispExpiryDate = item.dispExpiryDate.replace('-', '');
                        var date = "01";
                        var month = item.dispExpiryDate.slice(0, 2);
                        if (month > 12) {
                            $scope.setExpiryFocus(item, idx);
                        } else {
                            month -= 1;
                            var year1 = new Date().getFullYear();
                            year1 = year1.toString().substr(0, 2);
                            var year = year1 + item.dispExpiryDate.slice(2, 4);
                            // var year = item.dispExpiryDate.slice(2, 6);
                            var ExpDate = new Date(year, month, date);
                            var ExpiryDays = Math.round((ExpDate - CurDate) / (1000 * 60 * 60 * 24));
                            if (ExpiryDays <= 0) {
                                item.dispExpiryDate = null;
                                item.ExpiryDate = null;
                                utl.Alert.showErrorMsg($translate.instant('inventory.grn.expirydatefuturedate.lbl'));
                                $("#dispExpiryDate" + idx).focus();
                            } else {
                                item.ExpiryDate = ExpDate;
                            }
                        }
                    } else {
                        $scope.setExpiryFocus(item, idx);
                    }
                } else {
                    item.dispExpiryDate = null;
                    item.ExpiryDate = null;
                }
            } catch (e) {
                $scope.setExpiryFocus(item, idx);
            }
        };

        $scope.CheckManufacturedDate = function (item) {
            var TodayDate = new Date().toISOString().slice(0, 10);
            var CurDate = new Date(TodayDate);

            var PastDate = item.ManufacturedDate.slice(0, 10);
            var ManfDate = new Date(PastDate);

            var ManufacturedDays = Math.round((ManfDate - CurDate) / (1000 * 60 * 60 * 24));

            if (ManufacturedDays > 0) {
                item.ManufacturedDate = null;
                utl.Alert.showErrorMsg($translate.instant('inventory.grn.manufactureddate.lbl'));
            }
        };

        $scope.computeRoundOff = function (item) {
            if (item.RoundOff === undefined || item.RoundOff === null) {
                $scope.item.RoundOff = 0;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.GrnDiscount = 0;
            $scope.OtherCharges = 0;
            $scope.TotalCreditAmount = 0;
            $scope.RoundOff = 0;

            calculatetotalAmount();
        };

        $scope.computeCNamount = function (item) {
            if (item.TotalCreditAmount === undefined || item.TotalCreditAmount === null)
                $scope.item.TotalCreditAmount = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.GrnDiscount = 0;
            $scope.OtherCharges = 0;
            $scope.TotalCreditAmount = 0;
            $scope.RoundOff = 0;

            $scope.item.RoundOff = 0;

            calculatetotalAmount();
        };

        $scope.computeOtherCharges = function (item) {
            if (item.OtherCharges === undefined || item.OtherCharges === null)
                $scope.item.OtherCharges = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.GrnDiscount = 0;
            $scope.OtherCharges = 0;
            $scope.RoundOff = 0;
            $scope.TotalCreditAmount = 0;
            calculatetotalAmount();
        };
        $scope.computeTransportCharges = function (item) {
            if (item.TransportCharges === undefined || item.TransportCharges === null)
                $scope.item.TransportCharges = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.GrnDiscount = 0;
            $scope.OtherCharges = 0;
            $scope.TransportCharges = 0;
            $scope.RoundOff = 0;
            $scope.TotalCreditAmount = 0;
            calculatetotalAmount();
        };
        $scope.OnSelectGsttransportcharges = function (item, selectedItem) {
            var gstitem = selectedItem;
            item.TransportChargesGstId = gstitem.Id;
            item.TransportChargesGstPercentage = gstitem.GstPercentage;
            $scope.computeTransportGstAmountCharges(item);
        };
        $scope.computeTransportGstAmountCharges = function (item) {
            $scope.TransportCharges = 0;
            $scope.TransportGstAmount = 0;
            if (item.TransportChargesGstId > 0) {
                item.TransportChargesGstId = item.TransportChargesGstId;
                item.OtherChargesGstPercentage = parseFloat(item.OtherChargesGstPercentage);
            }
            if (parseFloat(item.TransportCharges) > 0)
                $scope.TransportCharges = parseFloat(item.TransportCharges || 0);
            $scope.TransportGstAmount = (parseFloat(item.TransportCharges || 0) / 100) * parseFloat(item.TransportChargesGstPercentage || 0).toFixed(2);
            $scope.item.TransportChargesGstAmount = $scope.TransportGstAmount;
            $scope.TransportCharges = (parseFloat($scope.item.TransportChargesGstAmount) + parseInt(item.TransportCharges));

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;
            // $scope.RoundOff = 0;
            // $scope.item.OtherChargesGstAmount = 0
            calculatetotalAmount();
            // $scope.item.TotalNetAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
            // $scope.item.TotalAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
        };
        $scope.OnSelectGstothercharges = function (item, selectedItem) {
            var gstitem = selectedItem;
            item.OtherChargesGstId = gstitem.Id;
            item.OtherChargesGstPercentage = gstitem.GstPercentage;
            $scope.computeOtherGstAmountCharges(item);
        };
        $scope.computeOtherGstAmountCharges = function (item) {
            $scope.OtherCharges = 0;
            $scope.OCGstAmount = 0;
            if (item.OtherChargesGstId > 0) {
                item.OtherChargesGstId = item.OtherChargesGstId;
                item.OtherChargesGstPercentage = parseFloat(item.OtherChargesGstPercentage);
            }
            if (parseFloat(item.OtherCharges) > 0)
                $scope.OtherCharges = parseFloat(item.OtherCharges || 0);
            $scope.OCGstAmount = (parseFloat(item.OtherCharges || 0) / 100) * parseFloat(item.OtherChargesGstPercentage || 0).toFixed(2);
            $scope.item.OtherChargesGstAmount = $scope.OCGstAmount;
            $scope.OtherCharges = (parseFloat($scope.item.OtherChargesGstAmount) + parseInt(item.OtherCharges));

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;
            // $scope.RoundOff = 0;
            // $scope.item.OtherChargesGstAmount = 0
            calculatetotalAmount();
            // $scope.item.TotalNetAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
            // $scope.item.TotalAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
        };

        $scope.computeHeaderDiscount = function (item) {
            if (item.GrnDiscount === undefined || item.GrnDiscount === null)
                $scope.item.GrnDiscount = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.GrnDiscount = 0;
            $scope.OtherCharges = 0;
            $scope.RoundOff = 0;
            $scope.TotalCreditAmount = 0;
            calculatetotalAmount();
        };

        $scope.computemultipleHeaderDiscount = function (item) {
            if (item.Discount1 === undefined || item.Discount1 === null)
                $scope.item.Discount1 = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.GrnDiscount = 0;
            $scope.OtherCharges = 0;
            $scope.RoundOff = 0;
            $scope.TotalCreditAmount = 0;
            calculatetotalAmount();
        };
        $scope.onDiscountModeChange = function (grnItem, selectedMasterItem, idx) {
            if (grnItem.DiscountModeId == 1) {
                if (parseFloat(grnItem.Discount) <= parseFloat(grnItem.UomPrice)) {
                    $scope.item.OtherCharges = 0;
                    $scope.item.RoundOff = 0;

                    grnItem.UomDiscountAmount = parseFloat(grnItem.Discount);
                    grnItem.UomDiscount1Amount = parseFloat(grnItem.Discount1);
                    grnItem.UomDiscount2Amount = parseFloat(grnItem.Discount2);
                    grnItem.DiscountAmount = parseFloat(grnItem.Discount) / grnItem.ConversionQuantity;
                    grnItem.UomPriceAfterDiscount = parseFloat(grnItem.UomPrice) - grnItem.UomDiscountAmount;
                    grnItem.UomPriceAfter1Discount = parseFloat(grnItem.UomPrice) - grnItem.UomDiscount1Amount;
                    grnItem.UomPriceAfter2Discount = parseFloat(grnItem.UomPrice) - grnItem.UomDiscount2Amount;
                    grnItem.PurchasePriceAfterDiscount = parseFloat(grnItem.PurchasePrice) - grnItem.DiscountAmount;

                    grnItem.GstAmount = ((grnItem.UomPriceAfterDiscount / 100) * parseInt(grnItem.GstPercentage)) * parseInt(grnItem.GrnQuantity);
                    // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                    grnItem.UnitGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.GstPercentage;
                    // grnItem.CGstAmount = ((grnItem.UomPriceAfterDiscount / 100) * parseInt(grnItem.CGstPercentage)) * parseInt(item.GrnQuantity);
                    item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                    grnItem.UnitCGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.CGstPercentage;

                    // grnItem.SGstAmount = ((grnItem.UomPriceAfterDiscount / 100) * parseInt(grnItem.SGstPercentage)) * parseInt(grnItem.GrnQuantity);
                    item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                    grnItem.UnitSGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.SGstPercentage;

                    // grnItem.GstAmount = (grnItem.UomPriceAfterDiscount / 100) * grnItem.GstPercentage;
                    // grnItem.UnitGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.GstPercentage;

                    // grnItem.CGstAmount = (grnItem.UomPriceAfterDiscount / 100) * grnItem.CGstPercentage;
                    // grnItem.UnitCGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.CGstPercentage;

                    // grnItem.SGstAmount = (grnItem.UomPriceAfterDiscount / 100) * grnItem.SGstPercentage;
                    // grnItem.UnitSGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.SGstPercentage;

                    grnItem.UomCostPrice = parseFloat((grnItem.UomPriceAfterDiscount + grnItem.GstAmount).toFixed(4));
                    grnItem.UnitCostPrice = parseFloat((grnItem.PurchasePriceAfterDiscount + grnItem.UnitGstAmount).toFixed(4));
                } else if (parseFloat(grnItem.Discount) > parseFloat(grnItem.UomPrice)) {
                    grnItem.Discount = 0;
                    grnItem.UnitDiscountAmount = 0;
                    grnItem.DiscountAmount = 0;
                    utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepricefirstalert.lbl'));
                }
            } else if (grnItem.DiscountModeId == 2) {
                if (grnItem.Discount > 100) {
                    grnItem.Discount = 0;
                    grnItem.UnitDiscountAmount = 0;
                    grnItem.DiscountAmount = 0;
                    utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepriceseconddalert.lbl'));
                } else {
                    $scope.item.OtherCharges = 0;
                    $scope.item.RoundOff = 0;
                    grnItem.PurchasePrice = parseFloat(grnItem.UomPrice) / grnItem.ConversionQuantity;

                    grnItem.UomDiscountAmount = (parseFloat(grnItem.UomPrice) / 100) * parseFloat(grnItem.Discount);
                    grnItem.UomDiscount1Amount = (parseFloat(grnItem.UomPrice) / 100) * parseFloat(grnItem.Discount1);
                    grnItem.UomDiscount2Amount = (parseFloat(grnItem.UomPrice) / 100) * parseFloat(grnItem.Discount2);
                    grnItem.DiscountAmount = (parseFloat(grnItem.PurchasePrice) / 100) * parseFloat(grnItem.Discount);

                    grnItem.UomPriceAfterDiscount = parseFloat(grnItem.UomPrice) - grnItem.UomDiscountAmount;
                    grnItem.PurchasePriceAfterDiscount = parseFloat(grnItem.PurchasePrice) - grnItem.DiscountAmount;

                    grnItem.GstAmount = ((grnItem.UomPriceAfterDiscount / 100) * parseInt(grnItem.GstPercentage)) * parseInt(grnItem.GrnQuantity);
                    // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                    grnItem.UnitGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.GstPercentage;
                    // grnItem.CGstAmount = ((grnItem.UomPriceAfterDiscount / 100) * parseInt(grnItem.CGstPercentage)) * parseInt(grnItem.GrnQuantity);
                    item.CGstAmount = (grnItem.UomPriceAfterDiscount / 100) * grnItem.CGstPercentage;
                    grnItem.UnitCGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.CGstPercentage;

                    // grnItem.SGstAmount = ((grnItem.UomPriceAfterDiscount / 100) * parseInt(grnItem.SGstPercentage)) * parseInt(grnItem.GrnQuantity);
                    item.SGstAmount = (grnItem.UomPriceAfterDiscount / 100) * grnItem.SGstPercentage;
                    grnItem.UnitSGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.SGstPercentage;

                    // grnItem.GstAmount = (grnItem.UomPriceAfterDiscount / 100) * grnItem.GstPercentage;
                    // grnItem.UnitGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.GstPercentage;

                    // grnItem.CGstAmount = (grnItem.UomPriceAfterDiscount / 100) * grnItem.CGstPercentage;
                    // grnItem.UnitCGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.CGstPercentage;

                    // grnItem.SGstAmount = (grnItem.UomPriceAfterDiscount / 100) * grnItem.SGstPercentage;
                    // grnItem.UnitSGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.SGstPercentage;

                    grnItem.UomCostPrice = parseFloat((grnItem.UomPriceAfterDiscount + grnItem.GstAmount).toFixed(4));
                    grnItem.UnitCostPrice = parseFloat((grnItem.PurchasePriceAfterDiscount + grnItem.UnitGstAmount).toFixed(4));
                }
            } else {
                if (parseFloat(grnItem.Discount) > 100) {
                    grnItem.Discount = 0;
                    grnItem.DiscountAmount = 0;
                    utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepriceseconddalert.lbl'));
                } else {
                    $scope.item.OtherCharges = 0;
                    $scope.item.RoundOff = 0;
                    grnItem.PurchasePrice = parseFloat(grnItem.UomPrice) / grnItem.ConversionQuantity;

                    grnItem.UomDiscountAmount = (parseFloat(grnItem.UomPrice) / 100) * parseFloat(grnItem.Discount);
                    grnItem.UomDiscount1Amount = (parseFloat(grnItem.UomPrice) / 100) * parseFloat(grnItem.Discount1);
                    grnItem.UomDiscount2Amount = (parseFloat(grnItem.UomPrice) / 100) * parseFloat(grnItem.Discount2);
                    grnItem.DiscountAmount = (parseFloat(grnItem.PurchasePrice) / 100) * parseFloat(grnItem.Discount);

                    grnItem.UomPriceAfterDiscount = parseFloat(grnItem.UomPrice) - grnItem.UomDiscountAmount;
                    grnItem.PurchasePriceAfterDiscount = parseFloat(grnItem.PurchasePrice) - grnItem.DiscountAmount;

                    grnItem.GstAmount = ((grnItem.UomPriceAfterDiscount / 100) * parseInt(grnItem.GstPercentage)) * parseInt(grnItem.GrnQuantity);
                    // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                    grnItem.UnitGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.GstPercentage;
                    // grnItem.CGstAmount = ((grnItem.UomPriceAfterDiscount / 100) * parseInt(grnItem.CGstPercentage)) * parseInt(item.GrnQuantity);
                    item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                    grnItem.UnitCGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.CGstPercentage;

                    // grnItem.SGstAmount = ((grnItem.UomPriceAfterDiscount / 100) * parseInt(grnItem.SGstPercentage)) * parseInt(item.GrnQuantity);
                    item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                    grnItem.UnitSGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.SGstPercentage;


                    // grnItem.GstAmount = (grnItem.UomPriceAfterDiscount / 100) * grnItem.GstPercentage;
                    // grnItem.UnitGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.GstPercentage;

                    // grnItem.CGstAmount = (grnItem.UomPriceAfterDiscount / 100) * grnItem.CGstPercentage;
                    // grnItem.UnitCGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.CGstPercentage;

                    // grnItem.SGstAmount = (grnItem.UomPriceAfterDiscount / 100) * grnItem.SGstPercentage;
                    // grnItem.UnitSGstAmount = (grnItem.PurchasePriceAfterDiscount / 100) * grnItem.SGstPercentage;

                    grnItem.UomCostPrice = parseFloat((grnItem.UomPriceAfterDiscount + grnItem.GstAmount).toFixed(4));
                    grnItem.UnitCostPrice = parseFloat((grnItem.PurchasePriceAfterDiscount + grnItem.UnitGstAmount).toFixed(4));
                }
            }

            grnItem.GrossAmount = parseFloat((parseFloat(grnItem.UomPrice) * parseFloat(grnItem.GrnQuantity)).toFixed(4));
            grnItem.NetAmount = parseFloat((parseFloat(grnItem.UomCostPrice) * parseFloat(grnItem.GrnQuantity)).toFixed(4));

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };
        // $scope.ComputeMultipleDiscount = function (item) {
        //     if (item.DiscountMode1Id == 1) {
        //         item.DiscountModeId = item.DiscountMode1Id;
        //         item.Discount = parseFloat(item.Discount1) + parseFloat(item.Discount2);

        //     }
        //     if (item.DiscountMode2Id == 1) {
        //         item.DiscountModeId = item.DiscountMode2Id;
        //         item.Discount = parseFloat(item.Discount1) + parseFloat(item.Discount2);

        //     }
        //     if (item.DiscountMode1Id == 2) {
        //         item.DiscountModeId = item.DiscountMode2Id;
        //         item.Discount = parseFloat(item.Discount1) + parseFloat(item.Discount2);

        //     }
        //     if (item.DiscountMode2Id == 2) {
        //         item.DiscountModeId = item.DiscountMode2Id;
        //         item.Discount = parseFloat(item.Discount1) + parseFloat(item.Discount2);
        //     }
        //     $scope.computeforgivenDiscount(item);
        // }

        $scope.ComputeSchemeDiscount = function (item) {
            console.log(item);
            if (parseFloat(item.UomPrice) === 0 || item.UomPrice === undefined || item.UomPrice === null) {
                $scope.item.OtherCharges = 0;
                $scope.item.RoundOff = 0;

                item.UomPrice = 0;
                item.PurchasePrice = 0;
                item.Discount = 0;
                item.UomDiscountAmount = 0;
                item.UomDiscount1Amount = 0;
                item.UomDiscount2Amount = 0;
                item.DiscountAmount = 0;
                item.UomPriceAfterDiscount = 0;
                item.PurchasePriceAfterDiscount = 0;
                item.GstAmount = 0;
                item.UnitGstAmount = 0;
                item.CGstAmount = 0;
                item.UnitCGstAmount = 0;
                item.SGstAmount = 0;
                item.UnitSGstAmount = 0;
                item.UomCostPrice = 0;
                item.UnitCostPrice = 0;
                item.GrossAmount = 0;
                item.NetAmount = 0;

                utl.Alert.showErrorMsg($translate.instant('inventory.grn.actualpriceiszero.lbl'));
            } else if ((item.Discount1 === undefined || item.Discount1 === null) && (item.Discount2 === undefined || item.Discount2 === null)) {

                $scope.item.OtherCharges = 0;
                $scope.item.RoundOff = 0;

                item.UomDiscountAmount = 0;
                item.UomDiscount1Amount = 0;
                item.UomDiscount2Amount = 0;
                item.DiscountAmount = 0;
                item.UomPriceAfterDiscount = 0;
                item.PurchasePriceAfterDiscount = 0;

                item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseFloat(item.GrnQuantity);
                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;


                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                // item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                // item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                // item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                // item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
            } else if (parseFloat(item.Discount1) == 0 && parseFloat(item.Discount2) == 0) {
                $scope.item.OtherCharges = 0;
                $scope.item.RoundOff = 0;

                item.UomDiscountAmount = 0;
                item.UomDiscount1Amount = 0;
                item.UomDiscount2Amount = 0;
                item.DiscountAmount = 0;

                item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);

                item.UomPriceAfterDiscount = parseFloat(item.UomPrice);
                item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice);

                item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseFloat(item.GrnQuantity);
                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                // item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                // item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                // item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                // item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
            } else {
                item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);
                item.GrossAmount = parseFloat((parseFloat(item.UomPrice) * parseFloat(item.GrnQuantity)).toFixed(4));

                // item.TaxableAmount = parseFloat((parseFloat(item.PurchasePriceAfterDiscount) * parseFloat(item.GrnQuantityAfterConversion)).toFixed(4));
                // item.NetAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.GrnQuantity)).toFixed(4));


                if (item.DiscountMode1Id == 1) {
                    if (parseFloat(item.Discount1) <= parseFloat(item.UomPrice)) {


                        // item.UomDiscountAmount = parseFloat(item.Discount);
                        // item.UomDiscount1Amount = parseFloat(item.Discount1);
                        // item.UomDiscount2Amount = parseFloat(item.Discount2);
                        item.UomDiscountAmount = parseFloat(item.Discount1);
                        item.UomDiscount1Amount = parseFloat(item.Discount1);
                        item.DiscountAmount = parseFloat(item.Discount1) / item.ConversionQuantity;

                        //Discount1
                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        item.PurchasePriceAfterDiscount = parseFloat((parseFloat(item.UomPrice) * parseFloat(item.GrnQuantity)).toFixed(4)) - item.DiscountAmount;

                        if (item.DiscountMode2Id == 1) {
                            if (parseFloat(item.Discount2) <= parseFloat(item.UomPrice)) {
                                item.UomDiscount2Amount = parseFloat(item.Discount2);
                                item.UomDiscountAmount = parseFloat(item.Discount1) + parseFloat(item.Discount2);
                                item.DiscountAmount = item.DiscountAmount + (parseFloat(item.Discount2) / item.ConversionQuantity);

                                //Discount2
                                item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                                item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                            }
                        } else if (item.DiscountMode2Id == 2) {

                            // item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                            item.UomDiscount2Amount = (parseFloat(item.UomPriceAfterDiscount) / 100) * parseFloat(item.Discount2);

                            item.UomDiscountAmount = item.UomDiscount2Amount;
                            item.DiscountAmount = (parseFloat(item.PurchasePriceAfterDiscount) / 100) * parseFloat(item.Discount2);

                            item.UomPriceAfterDiscount = parseFloat(item.UomPriceAfterDiscount) - item.UomDiscount2Amount;
                            item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePriceAfterDiscount) - item.DiscountAmount;
                        }


                        //GST Calculation
                        // item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseInt(item.GrnQuantity);
                        item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                        // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                        item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                        item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        // item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                        // item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        // item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        // item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        // item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
                    } else if (parseFloat(item.Discount1) > parseFloat(item.UomPrice)) {
                        // item.Discount = item.PrevDiscount;
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepricefirstalert.lbl'));
                    }
                    // item.NetAmount = parseFloat((parseFloat(item.UnitCostPrice) * parseInt(item.GrnQuantityAfterConversion)).toFixed(4));
                    item.NetAmount = parseFloat(parseFloat(item.UnitCostPrice).toFixed(4));
                } else if (item.DiscountMode1Id == 2) {
                    if (item.Discount1 > 100) {
                        // item.Discount = item.PrevDiscount;
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepriceseconddalert.lbl'));
                    } else {
                        $scope.item.OtherCharges = 0;
                        $scope.item.RoundOff = 0;
                        // item.PrevDiscount = item.Discount;

                        item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                        item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);

                        // item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                        // item.UomDiscount2Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount2);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount1);
                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscount1Amount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;


                        if (item.DiscountMode2Id == 1) {
                            if (parseFloat(item.Discount2) <= parseFloat(item.UomPrice)) {
                                item.UomDiscount2Amount = parseFloat(item.Discount2);
                                item.UomDiscountAmount = parseFloat(item.Discount1) + parseFloat(item.Discount2);
                                item.DiscountAmount = item.DiscountAmount + (parseFloat(item.Discount2) / item.ConversionQuantity);

                                //Discount2
                                item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                                item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                            }
                        } else if (item.DiscountMode2Id == 2) {

                            // item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                            item.UomDiscount2Amount = (parseFloat(item.UomPriceAfterDiscount) / 100) * parseFloat(item.Discount2);

                            item.UomDiscountAmount = item.UomDiscount2Amount;
                            item.DiscountAmount = (parseFloat(item.PurchasePriceAfterDiscount) / 100) * parseFloat(item.Discount2);

                            item.UomPriceAfterDiscount = parseFloat(item.UomPriceAfterDiscount) - item.UomDiscount2Amount;
                            item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePriceAfterDiscount) - item.DiscountAmount;
                        }

                        // item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        // item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseFloat(item.GrnQuantity);
                        // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                        // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                        item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                        item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
                    }
                    item.NetAmount = parseFloat((parseFloat(item.UnitCostPrice) * parseInt(item.GrnQuantityAfterConversion)).toFixed(4));
                } else {
                    if (parseFloat(item.Discount) > 100) {
                        item.Discount = 0;
                        item.DiscountAmount = 0;
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepriceseconddalert.lbl'));
                    } else {
                        $scope.item.OtherCharges = 0;
                        $scope.item.RoundOff = 0;

                        item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                        item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);

                        item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                        item.UomDiscount2Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount2);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);

                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                        item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
                    }
                }
            }


            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
            $scope.pricecheck(item);
        };

        $scope.ComputeMultipleDiscount = function (item) {
            console.log(item);
            // $scope.ComputeSchemeDiscount(item);
            if (parseFloat(item.UomPrice) === 0 || item.UomPrice === undefined || item.UomPrice === null) {
                $scope.item.OtherCharges = 0;
                $scope.item.RoundOff = 0;

                item.UomPrice = 0;
                item.PurchasePrice = 0;
                item.Discount = 0;
                item.UomDiscountAmount = 0;
                item.UomDiscount1Amount = 0;
                item.UomDiscount2Amount = 0;
                item.DiscountAmount = 0;
                item.UomPriceAfterDiscount = 0;
                item.PurchasePriceAfterDiscount = 0;
                item.GstAmount = 0;
                item.UnitGstAmount = 0;
                item.CGstAmount = 0;
                item.UnitCGstAmount = 0;
                item.SGstAmount = 0;
                item.UnitSGstAmount = 0;
                item.UomCostPrice = 0;
                item.UnitCostPrice = 0;
                item.GrossAmount = 0;
                item.NetAmount = 0;

                utl.Alert.showErrorMsg($translate.instant('inventory.grn.actualpriceiszero.lbl'));
            } else if ((item.Discount1 === undefined || item.Discount1 === null) && (item.Discount2 === undefined || item.Discount2 === null)) {

                $scope.item.OtherCharges = 0;
                $scope.item.RoundOff = 0;

                item.UomDiscountAmount = 0;
                item.UomDiscount1Amount = 0;
                item.UomDiscount2Amount = 0;
                item.DiscountAmount = 0;
                item.UomPriceAfterDiscount = 0;
                item.PurchasePriceAfterDiscount = 0;

                item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseFloat(item.GrnQuantity);
                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;


                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                // item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                // item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                // item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                // item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
            } else if (parseFloat(item.Discount1) == 0 && parseFloat(item.Discount2) == 0) {
                $scope.item.OtherCharges = 0;
                $scope.item.RoundOff = 0;

                item.UomDiscountAmount = 0;
                item.UomDiscount1Amount = 0;
                item.UomDiscount2Amount = 0;
                item.DiscountAmount = 0;

                item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);

                item.UomPriceAfterDiscount = parseFloat(item.UomPrice);
                item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice);

                item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseFloat(item.GrnQuantity);
                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;
                item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
            } else {
                if (item.DiscountMode1Id == 1) {
                    // if (parseFloat(item.Discount1) <= parseFloat(item.UomPrice)) {
                    $scope.item.OtherCharges = 0;
                    $scope.item.RoundOff = 0;
                    // item.PrevDiscount = item.Discount;

                    item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                    item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);

                    // item.UomDiscountAmount = parseFloat(item.Discount);
                    // item.UomDiscount1Amount = parseFloat(item.Discount1);
                    // item.UomDiscount2Amount = parseFloat(item.Discount2);

                    item.UomDiscount1Amount = parseFloat(item.Discount1) / item.GrnQuantityAfterConversion;
                    item.UomDiscountAmount = parseFloat(item.UomDiscount1Amount);
                    item.DiscountAmount = parseFloat(item.Discount1) / item.GrnQuantityAfterConversion;

                    //Discount1
                    item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                    item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                    if (item.DiscountMode2Id == 1) {
                        // if (parseFloat(item.Discount2) <= parseFloat(item.UomPrice)) {
                        // item.UomDiscount2Amount = parseFloat(item.Discount2);
                        // item.UomDiscountAmount = parseFloat(item.Discount1) + parseFloat(item.Discount2);
                        // item.DiscountAmount = item.DiscountAmount + (parseFloat(item.Discount2) / item.GrnQuantityAfterConversion);
                        item.UomDiscount2Amount = (parseFloat(item.Discount2) / item.GrnQuantityAfterConversion)
                        item.UomDiscountAmount = parseFloat(item.UomDiscount1Amount) + parseFloat(item.UomDiscount2Amount);
                        item.DiscountAmount = item.DiscountAmount + (parseFloat(item.Discount2) / item.GrnQuantityAfterConversion);


                        //Discount2
                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        // }
                    } else if (item.DiscountMode2Id == 2) {

                        // item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                        item.UomDiscount2Amount = (parseFloat(item.UomPriceAfterDiscount) / 100) * parseFloat(item.Discount2);

                        item.UomDiscountAmount = item.UomDiscount2Amount;
                        item.DiscountAmount = (parseFloat(item.PurchasePriceAfterDiscount) / 100) * parseFloat(item.Discount2);

                        item.UomPriceAfterDiscount = parseFloat(item.UomPriceAfterDiscount) - item.UomDiscount2Amount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePriceAfterDiscount) - item.DiscountAmount;
                    }
                    // } else if (parseFloat(item.Discount1) > parseFloat(item.UomPrice)) {
                    //     // item.Discount = item.PrevDiscount;
                    //     utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepricefirstalert.lbl'));
                    // }
                } else if (item.DiscountMode1Id == 2) {
                    if (item.Discount1 > 100) {
                        // item.Discount = item.PrevDiscount;
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepriceseconddalert.lbl'));
                    } else {
                        $scope.item.OtherCharges = 0;
                        $scope.item.RoundOff = 0;
                        // item.PrevDiscount = item.Discount;

                        item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                        item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);

                        // item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                        // item.UomDiscount2Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount2);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount1);
                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscount1Amount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;


                        if (item.DiscountMode2Id == 1) {
                            // if (parseFloat(item.Discount2) <= parseFloat(item.UomPrice)) {
                            item.UomDiscount2Amount = (parseFloat(item.Discount2) / item.GrnQuantityAfterConversion);
                            item.UomDiscountAmount = parseFloat(item.UomDiscount1Amount) + parseFloat(item.UomDiscount2Amount);
                            item.DiscountAmount = item.DiscountAmount + (parseFloat(item.Discount2) / item.GrnQuantityAfterConversion);

                            //Discount2
                            item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                            item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                            // }
                        } else if (item.DiscountMode2Id == 2) {

                            // item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                            item.UomDiscount2Amount = (parseFloat(item.UomPriceAfterDiscount) / 100) * parseFloat(item.Discount2);

                            item.UomDiscountAmount = item.UomDiscount2Amount;
                            item.DiscountAmount = (parseFloat(item.PurchasePriceAfterDiscount) / 100) * parseFloat(item.Discount2);

                            item.UomPriceAfterDiscount = parseFloat(item.UomPriceAfterDiscount) - item.UomDiscount2Amount;
                            item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePriceAfterDiscount) - item.DiscountAmount;
                        }

                        // item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        // item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        // item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseFloat(item.GrnQuantity);
                        // // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        // item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                        // // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                        // item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        // item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        // // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                        // item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        // item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        // item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        // item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
                    }
                } else {
                    if (parseFloat(item.Discount) > 100) {
                        item.Discount = 0;
                        item.DiscountAmount = 0;
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepriceseconddalert.lbl'));
                    } else {
                        $scope.item.OtherCharges = 0;
                        $scope.item.RoundOff = 0;

                        item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                        item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);

                        item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                        item.UomDiscount2Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount2);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);

                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        // item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                        // item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        // item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        // item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        // item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        // item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        // item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
                    }
                }
                // Example usage
                // calculatePrices(item);
            }


            //GST Calculation
            item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseInt(item.GrnQuantity);
            // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
            item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
            // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
            item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
            item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

            // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
            item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
            item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

            item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
            item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
            // item.GrossAmount = parseFloat((parseFloat(item.UomPrice) * parseFloat(item.GrnQuantityAfterConversion)).toFixed(4));
            item.GrossAmount = parseFloat((parseFloat(item.UomPrice) * parseFloat(item.GrnQuantity)).toFixed(4));
            item.TaxableAmount = parseFloat((parseFloat(item.PurchasePriceAfterDiscount) * parseFloat(item.GrnQuantityAfterConversion)).toFixed(4));
            // item.NetAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.GrnQuantity)).toFixed(4));
            // item.NetAmount = parseFloat(item.UnitCostPrice).toFixed(2);
            item.NetAmount = parseFloat((parseFloat(item.UnitCostPrice) * parseInt(item.GrnQuantityAfterConversion)).toFixed(4));

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
            $scope.pricecheck(item);
        };

        // function calculatePrices(item) {
        //     // Helper functions for common calculations
        //     function calculatePurchasePrice(price, quantity) {
        //         return parseFloat(price / quantity).toFixed(4);
        //     }

        //     function applyFlatDiscount(price, discount) {
        //         return parseFloat(price) - parseFloat(discount);
        //     }

        //     function applyPercentageDiscount(price, discount) {
        //         return parseFloat(price) - (parseFloat(price) * parseFloat(discount) / 100);
        //     }

        //     function showError(messageKey) {
        //         utl.Alert.showErrorMsg($translate.instant(messageKey));
        //     }

        //     // Initialize default values
        //     $scope.item.OtherCharges = 0;
        //     $scope.item.RoundOff = 0;

        //     // Calculate base prices
        //     item.PurchasePrice = calculatePurchasePrice(item.UomPrice, item.ConversionQuantity);
        //     item.MrPrice = calculatePurchasePrice(item.UomMrPrice, item.ConversionQuantity);

        //     // Handle primary discount mode
        //     if (item.DiscountMode1Id === 1) { // Flat discount
        //         if (parseFloat(item.Discount1) <= parseFloat(item.UomPrice)) {
        //             item.UomDiscountAmount = parseFloat(item.Discount1);
        //             item.DiscountAmount = item.UomDiscountAmount / item.ConversionQuantity;
        //             item.UomPriceAfterDiscount = applyFlatDiscount(item.UomPrice, item.UomDiscountAmount);
        //             item.PurchasePriceAfterDiscount = applyFlatDiscount(item.PurchasePrice, item.DiscountAmount);
        //         } else {
        //             showError('inventory.purchaserequest.purchasepricefirstalert.lbl');
        //             return;
        //         }
        //     } else if (item.DiscountMode1Id === 2) { // Percentage discount
        //         if (parseFloat(item.Discount1) <= 100) {
        //             item.UomDiscount1Amount = (parseFloat(item.UomPrice) * parseFloat(item.Discount1)) / 100;
        //             item.DiscountAmount = (parseFloat(item.PurchasePrice) * parseFloat(item.Discount1)) / 100;
        //             item.UomPriceAfterDiscount = applyPercentageDiscount(item.UomPrice, item.Discount1);
        //             item.PurchasePriceAfterDiscount = applyPercentageDiscount(item.PurchasePrice, item.Discount1);
        //         } else {
        //             showError('inventory.purchaserequest.purchasepriceseconddalert.lbl');
        //             return;
        //         }
        //     }

        //     // Handle secondary discount mode
        //     if (item.DiscountMode2Id === 1) { // Flat discount
        //         if (parseFloat(item.Discount2) <= parseFloat(item.UomPrice)) {
        //             const discount2Amount = parseFloat(item.Discount2);
        //             item.UomDiscount2Amount = discount2Amount;
        //             item.UomDiscountAmount += discount2Amount;
        //             item.DiscountAmount += discount2Amount / item.ConversionQuantity;
        //             item.UomPriceAfterDiscount = applyFlatDiscount(item.UomPriceAfterDiscount, discount2Amount);
        //             item.PurchasePriceAfterDiscount = applyFlatDiscount(item.PurchasePriceAfterDiscount, discount2Amount);
        //         }
        //     } else if (item.DiscountMode2Id === 2) { // Percentage discount
        //         const discount2Amount = (parseFloat(item.UomPriceAfterDiscount) * parseFloat(item.Discount2)) / 100;
        //         item.UomDiscount2Amount = discount2Amount;
        //         item.DiscountAmount += (parseFloat(item.PurchasePriceAfterDiscount) * parseFloat(item.Discount2)) / 100;
        //         item.UomPriceAfterDiscount = applyFlatDiscount(item.UomPriceAfterDiscount, discount2Amount);
        //         item.PurchasePriceAfterDiscount = applyFlatDiscount(item.PurchasePriceAfterDiscount, item.DiscountAmount);
        //     }

        //     // Final error handling for invalid discounts
        //     if (parseFloat(item.Discount) > 100) {
        //         item.Discount = 0;
        //         item.DiscountAmount = 0;
        //         showError('inventory.purchaserequest.purchasepriceseconddalert.lbl');
        //     }
        // }



        $scope.calculateGST = function (priceAfterDiscount, gstPercentage, quantity) {
            const gstAmount = (priceAfterDiscount / 100) * gstPercentage * quantity;
            return gstAmount;
        };

        $scope.computeforgivenDiscount = function (item) {
            if (parseFloat(item.UomPrice) === 0 || item.UomPrice === undefined || item.UomPrice === null) {
                $scope.item.OtherCharges = 0;
                $scope.item.RoundOff = 0;

                item.UomPrice = 0;
                item.PurchasePrice = 0;
                item.Discount = 0;
                item.UomDiscountAmount = 0;
                item.UomDiscount1Amount = 0;
                item.UomDiscount2Amount = 0;
                item.DiscountAmount = 0;
                item.UomPriceAfterDiscount = 0;
                item.PurchasePriceAfterDiscount = 0;
                item.GstAmount = 0;
                item.UnitGstAmount = 0;
                item.CGstAmount = 0;
                item.UnitCGstAmount = 0;
                item.SGstAmount = 0;
                item.UnitSGstAmount = 0;
                item.UomCostPrice = 0;
                item.UnitCostPrice = 0;
                item.GrossAmount = 0;
                item.NetAmount = 0;

                utl.Alert.showErrorMsg($translate.instant('inventory.grn.actualpriceiszero.lbl'));
            } else if (item.Discount === undefined || item.Discount === null) {
                $scope.item.OtherCharges = 0;
                $scope.item.RoundOff = 0;

                item.UomDiscountAmount = 0;
                item.UomDiscount1Amount = 0;
                item.UomDiscount2Amount = 0;
                item.DiscountAmount = 0;
                item.UomPriceAfterDiscount = 0;
                item.PurchasePriceAfterDiscount = 0;

                item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseFloat(item.GrnQuantity);
                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;


                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                // item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                // item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                // item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                // item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
            } else if (parseFloat(item.Discount) === 0) {
                $scope.item.OtherCharges = 0;
                $scope.item.RoundOff = 0;

                item.UomDiscountAmount = 0;
                item.UomDiscount1Amount = 0;
                item.UomDiscount2Amount = 0;
                item.DiscountAmount = 0;

                item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);

                item.UomPriceAfterDiscount = parseFloat(item.UomPrice);
                item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice);

                item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseFloat(item.GrnQuantity);
                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                // item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                // item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                // item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                // item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
            } else {
                if (item.DiscountModeId == 1) {
                    if (parseFloat(item.Discount) <= parseFloat(item.UomPrice)) {
                        $scope.item.OtherCharges = 0;
                        $scope.item.RoundOff = 0;
                        item.PrevDiscount = item.Discount;

                        item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                        item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);

                        item.UomDiscountAmount = parseFloat(item.Discount);
                        item.UomDiscount1Amount = parseFloat(item.Discount1);
                        item.UomDiscount2Amount = parseFloat(item.Discount2);
                        item.DiscountAmount = parseFloat(item.Discount) / item.ConversionQuantity;

                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseInt(item.GrnQuantity);
                        // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                        // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                        item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                        item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        // item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                        // item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        // item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        // item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        // item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
                    } else if (parseFloat(item.Discount) > parseFloat(item.UomPrice)) {
                        item.Discount = item.PrevDiscount;
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepricefirstalert.lbl'));
                    }
                } else if (item.DiscountModeId == 2) {
                    if (item.Discount > 100) {
                        item.Discount = item.PrevDiscount;
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepriceseconddalert.lbl'));
                    } else {
                        $scope.item.OtherCharges = 0;
                        $scope.item.RoundOff = 0;
                        item.PrevDiscount = item.Discount;

                        item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                        item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);

                        item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                        item.UomDiscount2Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount2);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);

                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseFloat(item.GrnQuantity);
                        // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                        // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                        item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                        item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
                    }
                } else {
                    if (parseFloat(item.Discount) > 100) {
                        item.Discount = 0;
                        item.DiscountAmount = 0;
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepriceseconddalert.lbl'));
                    } else {
                        $scope.item.OtherCharges = 0;
                        $scope.item.RoundOff = 0;

                        item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                        item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);

                        item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                        item.UomDiscount2Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount2);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);

                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                        item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
                    }
                }
            }

            item.GrossAmount = parseFloat((parseFloat(item.UomPrice) * parseFloat(item.GrnQuantity)).toFixed(4));
            // item.NetAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.GrnQuantity)).toFixed(4));
            item.NetAmount = parseFloat((parseFloat(item.UnitCostPrice) * parseInt(item.GrnQuantityAfterConversion)).toFixed(4));

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
            $scope.pricecheck(item);
        };

        $scope.pricecheck = function (item) {
            if (parseFloat(item.UomPrice) > parseFloat(item.UomMrPrice)) {
                utl.Alert.showErrorMsg($translate.instant('inventory.grn.alertuompurchase.lbl'));
            }
        }
        $scope.computeforgivenPrice = function (item) {
            if (parseFloat(item.UomPrice) > 0) {
                $scope.item.OtherCharges = 0;
                $scope.item.RoundOff = 0;
                item.PurchasePrice = parseFloat((item.UomPrice) / (item.ConversionQuantity)).toFixed(4);
                if ($scope.currentcontext.MrpPercent > 0 && $scope.ShowMrp) {
                    var MrPrice = parseFloat(item.UomPrice) * parseFloat($scope.currentcontext.MrpPercent) / 100;
                    item.UomMrPrice = parseFloat(item.UomPrice) + MrPrice;
                }
                item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);
                if (parseFloat(item.Discount) > 0) {
                    if (item.DiscountModeId == 1) {
                        item.UomDiscountAmount = parseFloat(item.Discount);
                        item.UomDiscount1Amount = parseFloat(item.Discount1);
                        item.UomDiscount2Amount = parseFloat(item.Discount2);
                        item.DiscountAmount = parseFloat(item.Discount) / item.ConversionQuantity;
                    } else if (item.DiscountModeId == 2) {
                        item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                        item.UomDiscount2Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount2);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);
                    } else {
                        item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                        item.UomDiscount2Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount2);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);
                    }
                } else {
                    item.UomDiscountAmount = 0;
                    item.UomDiscount1Amount = 0;
                    item.UomDiscount2Amount = 0;
                    item.DiscountAmount = 0;
                }

                item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseFloat(item.GrnQuantity);
                // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                // item.GstAmount = parseFloat(((item.PurchasePriceAfterDiscount) * (item.TotalQuantityAfterConversion) * item.GstPercentage / 100).toFixed(4));
                item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                // item.CGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.CGstPercentage)) * parseInt(item.GrnQuantity);
                item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                // item.SGstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.SGstPercentage)) * parseInt(item.GrnQuantity);
                item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));

                item.GrossAmount = parseFloat((parseFloat(item.UomPrice) * parseFloat(item.GrnQuantity)).toFixed(4));
                item.TaxableAmount = parseFloat((parseFloat(item.PurchasePriceAfterDiscount) * parseFloat(item.GrnQuantityAfterConversion)).toFixed(4));
                item.NetAmount = parseFloat((parseFloat(item.UnitCostPrice) * parseInt(item.GrnQuantityAfterConversion)).toFixed(4));

                $scope.TotalGrossAmount = 0;
                $scope.TotalDiscountAmount = 0;
                $scope.TotalDiscount1Amount = 0;
                $scope.TotalDiscount2Amount = 0;
                $scope.TotalGstAmount = 0;
                $scope.TotalCGstAmount = 0;
                $scope.TotalSGstAmount = 0;
                $scope.TotalNetAmount = 0;

                calculatetotalAmount();
            } else if (parseFloat(item.UomPrice) === 0 || item.UomPrice === undefined || item.UomPrice === null) {
                item.UomPrice = 0;
                item.PurchasePrice = 0;
                item.Discount = 0;
                item.UomDiscountAmount = 0;
                item.UomDiscount1Amount = 0;
                item.UomDiscount2Amount = 0;
                item.DiscountAmount = 0;
                item.UomPriceAfterDiscount = 0;
                item.PurchasePriceAfterDiscount = 0;
                item.GstAmount = 0;
                item.UnitGstAmount = 0;
                item.CGstAmount = 0;
                item.UnitCGstAmount = 0;
                item.SGstAmount = 0;
                item.UnitSGstAmount = 0;
                item.UomCostPrice = 0;
                item.UnitCostPrice = 0;
                item.GrossAmount = 0;
                item.NetAmount = 0;

                utl.Alert.showErrorMsg($translate.instant('inventory.grn.purchasepricezero.lbl'));
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalDiscount1Amount = 0;
            $scope.TotalDiscount2Amount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        $scope.computeAmount = function (item) {
            if (checkpoqty(item)) {
                if (parseFloat(item.GrnQuantity) > 0) {
                    if (item.IsReusable) {
                        item.MinQtyConv = item.GrnQuantity * item.Min;
                    }
                    if ($scope.item.PurchaseOrderId && $scope.item.PurchaseOrderId > 0) {
                        var PoGrnItemTotalQty = 0;
                        for (var grnidx in $scope.grnDetails) {
                            var grnitem = $scope.grnDetails[grnidx];
                            if (item.PurchaseOrderDetailId == grnitem.PurchaseOrderDetailId &&
                                item.ItemMasterId == grnitem.ItemMasterId && grnitem.Status == 1) {
                                PoGrnItemTotalQty = PoGrnItemTotalQty + parseFloat(grnitem.GrnQuantity);
                                if ((parseInt(PoGrnItemTotalQty) + parseInt(item.ReceivedQuantity)) > parseInt(item.PoQuantity)) {
                                    item.GrnQuantity = 0;
                                    utl.Alert.showErrorMsg($translate.instant('inventory.grn.grnpoqtyalert.lbl') + item.ItemName);
                                    return false;
                                }
                            }
                        }
                    }

                    item.TotalQuantity = parseFloat(item.GrnQuantity) + parseInt(item.FreeQty);
                    item.TotalQuantityAfterConversion = item.TotalQuantity * item.ConversionQuantity;
                    item.GrnQuantityAfterConversion = parseFloat(item.GrnQuantity) * item.ConversionQuantity;
                    item.FreeQtyAfterConversion = parseInt(item.FreeQty) * item.ConversionQuantity;

                    item.PurchasePrice = parseFloat(item.UomPrice) / item.ConversionQuantity;
                    item.MrPrice = parseFloat(item.UomMrPrice) / item.ConversionQuantity;
                    if ($scope.ShowmultipleDiscount == true) {
                        $scope.ComputeMultipleDiscount(item);
                    } else {

                        if (parseFloat(item.Discount) > 0) {
                            if (item.DiscountModeId == 1) {
                                item.UomDiscountAmount = parseFloat(item.Discount);
                                item.UomDiscount1Amount = parseFloat(item.Discount1);
                                item.UomDiscount2Amount = parseFloat(item.Discount2);
                                item.DiscountAmount = parseFloat(item.Discount) / item.ConversionQuantity;
                            } else if (item.DiscountModeId == 2) {
                                item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                                item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                                item.UomDiscount2Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount2);
                                item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);
                            } else {
                                item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                                item.UomDiscount1Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount1);
                                item.UomDiscount2Amount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount2);
                                item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);
                            }
                        } else {
                            item.UomDiscountAmount = 0;
                            item.UomDiscount1Amount = 0;
                            item.UomDiscount2Amount = 0;
                            item.DiscountAmount = 0;
                        }

                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        item.GstAmount = ((item.UomPriceAfterDiscount / 100) * parseInt(item.GstPercentage)) * parseFloat(item.GrnQuantity);
                        // item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                        item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));

                        item.GrossAmount = parseFloat((parseFloat(item.UomPrice) * parseFloat(item.GrnQuantity)).toFixed(4));
                        item.TaxableAmount = parseFloat((parseFloat(item.PurchasePriceAfterDiscount) * parseFloat(item.GrnQuantityAfterConversion)).toFixed(4));
                        item.NetAmount = parseFloat((parseFloat(item.UnitCostPrice) * parseFloat(item.GrnQuantityAfterConversion)).toFixed(4));
                        // item.NetAmount = parseFloat((parseFloat(item.UomCostPrice) * parseInt(item.GrnQuantity)).toFixed(4));
                        // item.UomNetAmount = parseFloat((parseFloat(item.UnitCostPrice) * parseInt(item.GrnQuantity)).toFixed(4));

                        $scope.item.OtherCharges = 0;
                        $scope.item.RoundOff = 0;

                        if (item.IsBatchRequired)
                            item.BatchRequired = true;

                        if (item.IsExpiryRequired)
                            item.ExpiryRequired = true;

                        if (item.IsManfRequired)
                            item.ManfRequired = true;

                        if (item.IsMRPRequired)
                            item.MRPRequired = true;
                    }
                } else if (parseFloat(item.GrnQuantity) === 0) {
                    item.TotalQuantity = 0;
                    item.TotalQuantityAfterConversion = 0;
                    item.GrnQuantityAfterConversion = 0;
                    item.GrossAmount = 0;
                    item.NetAmount = 0;

                    $scope.item.OtherCharges = 0;
                    $scope.item.RoundOff = 0;

                    item.BatchRequired = false;
                    item.ExpiryRequired = false;
                    item.ManfRequired = false;
                    item.MRPRequired = false;
                } else if (item.GrnQuantity === undefined || item.GrnQuantity === null) {
                    item.TotalQuantity = 0;
                    item.TotalQuantityAfterConversion = 0;
                    item.GrnQuantityAfterConversion = 0;
                    item.GrossAmount = 0;
                    item.NetAmount = 0;

                    $scope.item.OtherCharges = 0;
                    $scope.item.RoundOff = 0;

                    item.BatchRequired = false;
                    item.ExpiryRequired = false;
                    item.ManfRequired = false;
                    item.MRPRequired = false;
                } else {
                    item.TotalQuantity = 0;
                    item.TotalQuantityAfterConversion = 0;
                    item.GrnQuantityAfterConversion = 0;
                    item.GrossAmount = 0;
                    item.NetAmount = 0;

                    $scope.item.OtherCharges = 0;
                    $scope.item.RoundOff = 0;

                    item.BatchRequired = false;
                    item.ExpiryRequired = false;
                    item.ManfRequired = false;
                    item.MRPRequired = false;
                }

                $scope.TotalGrossAmount = 0;
                $scope.TotalDiscountAmount = 0;
                $scope.TotalDiscount1Amount = 0;
                $scope.TotalDiscount2Amount = 0;
                $scope.TotalGstAmount = 0;
                $scope.TotalCGstAmount = 0;
                $scope.TotalSGstAmount = 0;
                $scope.TotalNetAmount = 0;
                $scope.OtherCharges = 0;
                $scope.TotalCreditAmount = 0;
                $scope.RoundOff = 0;
                $scope.TotalQtyCount = 0;

                calculatetotalAmount();
            }
        };

        function checkpoqty(item) {
            if ($scope.item.PurchaseOrderId > 0 && parseFloat(item.GrnQuantity) > item.PoQuantity) {
                utl.Alert.showErrorMsg($translate.instant('inventory.grn.grnqtygreaterpoqty.lbl') + item.ItemName);
                item.GrnQuantity = 0;
                return false;
            }

            return true;
        }

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        function calculatetotalAmount() {
            if ($scope.item.GrnDiscount) {
                $scope.GrnDiscount = $scope.item.GrnDiscount;
            } else {
                $scope.GrnDiscount = 0;
            }
            if ($scope.item.TotalCreditAmount) {
                $scope.TotalCreditAmount = $scope.item.TotalCreditAmount;
            } else {
                $scope.TotalCreditAmount = 0;
            }
            if ($scope.item.OtherCharges) {
                $scope.OtherCharges = $scope.item.OtherCharges;
            } else {
                $scope.OtherCharges = 0;
            }
            if ($scope.item.TransportCharges) {
                $scope.TransportCharges = $scope.item.TransportCharges;
            } else {
                $scope.TransportCharges = 0;
            }
            if ($scope.item.OtherChargesGstAmount > 0) {
                $scope.OtherChargesGstAmount = $scope.item.OtherChargesGstAmount;
            } else {
                $scope.OtherChargesGstAmount = 0
            }
            if ($scope.item.TransportChargesGstAmount > 0) {
                $scope.TransportChargesGstAmount = $scope.item.TransportChargesGstAmount;
            } else {
                $scope.TransportChargesGstAmount = 0
            }
            // $scope.GrnDiscount = $scope.item.GrnDiscount;
            // $scope.OtherCharges = $scope.item.OtherCharges;
            // $scope.TotalCreditAmount = $scope.item.TotalCreditAmount;
            // if ($scope.item.RoundOff === '-' || $scope.item.RoundOff === '') {
            //     $scope.RoundOff = 0;
            // } else {
            //     $scope.RoundOff = parseFloat($scope.item.RoundOff);
            // }

            for (var idx in $scope.grnDetails) {
                var activeitem = $scope.grnDetails[idx];
                if (activeitem.ItemMasterId > 0 && parseInt(activeitem.GrnQuantity) > 0 && activeitem.Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + activeitem.GrossAmount).toFixed(4));
                    if ($scope.ShowmultipleDiscount == true) {
                        $scope.TotalDiscount1Amount = parseFloat(($scope.TotalDiscount1Amount + (activeitem.UomDiscount1Amount * parseInt(activeitem.GrnQuantity))).toFixed(4));
                        $scope.TotalDiscount2Amount = parseFloat(($scope.TotalDiscount2Amount + (activeitem.UomDiscount2Amount * parseInt(activeitem.GrnQuantity))).toFixed(4));
                        // $scope.TotalDiscountAmount = parseFloat(($scope.TotalDiscountAmount + ($scope.TotalDiscount2Amount + $scope.TotalDiscount1Amount)).toFixed(4));
                    } else {
                        $scope.TotalDiscountAmount = parseFloat(($scope.TotalDiscountAmount + (activeitem.UomDiscountAmount * parseInt(activeitem.GrnQuantity))).toFixed(4));
                    }


                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + (activeitem.GstAmount)).toFixed(4));
                    // $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + (activeitem.GstAmount * parseInt(activeitem.GrnQuantity))).toFixed(4));
                    $scope.TotalCGstAmount = parseFloat(($scope.TotalCGstAmount + (activeitem.CGstAmount * parseInt(activeitem.GrnQuantity))).toFixed(4));
                    $scope.TotalSGstAmount = parseFloat(($scope.TotalSGstAmount + (activeitem.SGstAmount * parseInt(activeitem.GrnQuantity))).toFixed(4));
                    // $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + (activeitem.GstAmount)).toFixed(4));
                    // $scope.TotalCGstAmount = parseFloat(($scope.TotalCGstAmount + (activeitem.CGstAmount)).toFixed(4));
                    // $scope.TotalSGstAmount = parseFloat(($scope.TotalSGstAmount + (activeitem.SGstAmount)).toFixed(4));
                    // $scope.TotalNetAmount = (parseFloat($scope.TotalNetAmount) + parseFloat(activeitem.NetAmount)).toFixed(4);
                    // $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + activeitem.NetAmount).toFixed(4));

                    $scope.TotalQtyCount = parseInt($scope.TotalQtyCount) + parseInt(activeitem.GrnQuantity);
                }
            }

            if ($scope.ShowmultipleDiscount == true) {
                $scope.TotalNetAmount = parseFloat(parseFloat($scope.TotalGrossAmount) + parseFloat($scope.TotalGstAmount) - (parseFloat($scope.TotalDiscount1Amount) + parseFloat($scope.TotalDiscount2Amount))).toFixed(4);
            } else {
                $scope.TotalNetAmount = parseFloat(parseFloat($scope.TotalGrossAmount) + parseFloat($scope.TotalGstAmount) - parseFloat($scope.TotalDiscountAmount)).toFixed(4);
            }

            //Auto RoundOff
            $scope.currentcontext.TotNetAmount = parseFloat($scope.TotalNetAmount).toFixed(2);

            var NetNaturalValue = getNatural(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var NetRoundOffValue = 0;
            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.currentcontext.TotNetAmount = NetNaturalValue;
                NetRoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                NetRoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
            } else {
                NetRoundOffValue = 0;
                $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
            }
            $scope.RoundOff = $scope.item.TotRndoffAmt;
            // $scope.TotalNetAmount = $scope.currentcontext.TotNetAmount + $scope.RoundOff;
            $scope.TotalNetAmount = $scope.currentcontext.TotNetAmount;
            //Auto RoundOff

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;


            if ($scope.ShowmultipleDiscount == true) {
                $scope.item.TotalDiscount1Amount = $scope.TotalDiscount1Amount;
                $scope.item.TotalDiscount2Amount = $scope.TotalDiscount2Amount;
                $scope.item.TotalDiscountAmount = $scope.TotalDiscount1Amount + $scope.TotalDiscount2Amount;
            } else {
                $scope.item.TotalDiscountAmount = $scope.TotalDiscountAmount;
            }
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalCGstAmount = $scope.TotalCGstAmount;
            $scope.item.TotalSGstAmount = $scope.TotalSGstAmount;
            $scope.item.TotalNetAmount = ((($scope.TotalNetAmount - $scope.GrnDiscount) + $scope.OtherCharges + $scope.OtherChargesGstAmount + $scope.TransportCharges + $scope.TransportChargesGstAmount) - $scope.TotalCreditAmount);
            $scope.item.TotalInvoiceAmount = $scope.TotalNetAmount;
            $scope.item.BalanceAmount = $scope.item.TotalNetAmount;
            $scope.item.TotalQtyCount = $scope.TotalQtyCount;
        }

        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,

            options: [{
                header: 'Supplier Code',
                field: 'VendorCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Supplier Name',
                field: 'VendorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Supplier Contact',
                field: 'MobileNumber',
                datatype: 'string',
                headercls: 'td-phoneno',
                fieldcls: 'td-phoneno'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendorfacilitymap/GetVendorFacilityMaps',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.VendorMasterId = selectedItem.VendorMasterId;
                $scope.item.VendorCode = selectedItem.VendorCode;
                $scope.item.VendorName = selectedItem.VendorName;
                $scope.item.PaymentTermsId = selectedItem.VendorMaster.PaymentTermsId;
                $scope.item.PANNo = selectedItem.VendorMaster.PANNo;
                $scope.item.GSTNo = selectedItem.VendorMaster.GSTNo;
                $scope.item.TANNo = selectedItem.VendorMaster.TANNo;
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;

            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 1
                },
                {
                    Key: 4,
                    Value: 2
                },
                // {
                //     Key: 13,
                //     Value: $scope.item.StoreTypeId
                // },
                {
                    Key: 12,
                    Value: [-1, $scope.item.FacilityId]
                }
                ],
                PageContext: {
                    PageSize: 200,
                    PageNumber: 1
                }
            };

            if (vm.vendorcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }

            vm.vendorcontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.vendorcontrolconfig.result) {

                var item = vm.vendorcontrolconfig.result[idx];
                // item.VendorMasterId = item.Id;
                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
                item.PhoneNumber = item.PhoneNumber;
            }
        }

        vm.grnitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Item Code',
                field: 'ItemCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Item Name',
                field: 'ItemName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Product Type Name',
                field: 'ProductTypeName',
                datatype: 'string',
                headercls: 'td-producttypename',
                fieldcls: 'td-producttypename'
            },
            /*
            {
                header: 'Generic Name',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-genericname',
                fieldcls: 'td-genericname'
            },
            */
            // {
            //     header: 'Manufacturer Name',
            //     field: 'ManufacturerName',
            //     datatype: 'string',
            //     headercls: 'td-manufacturername',
            //     fieldcls: 'td-manufacturername'
            // },
            {
                header: 'Stock-In-Hand',
                field: 'StockInHand',
                datatype: 'string',
                headercls: 'td-stockinhand',
                fieldcls: 'td-stockinhand'
            },
                // {
                //     header: 'Mrp',
                //     field: 'Mrp',
                //     datatype: 'string',
                //     headercls: 'td-mrp',
                //     fieldcls: 'td-mrp'
                // }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemVendorMaps',
            formatdisplay: formatselectedgrnitem,
            presearch: presearchgrnitem,
            postsearch: postsearchgrnitem
        };

        function formatselectedgrnitem() {
            var selectedItem = vm.grnitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                // result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
                result = selectedItem.ItemName;
            } else if (vm.grnitemcontrolconfig.rowdata) {
                // result = [vm.grnitemcontrolconfig.rowdata.ItemName, vm.grnitemcontrolconfig.rowdata.ItemCode].join(' ');
                result = [vm.grnitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchgrnitem() {
            var inputData = {};
            var query = null;
            // if ($scope.item.IsOpenGRN) {
            // vm.grnitemcontrolconfig.api = 'pharmacy/itemmaster/GetMinItemsForGRN';

            query = vm.grnitemcontrolconfig.query;
            if ($scope.jssgrn == 1) {
                vm.grnitemcontrolconfig.api = 'pharmacy/itemmaster/GetInventoryItemsforGRN';
                inputData = {
                    Params: [{
                        Key: 13,//ActiveStatus
                        Value: 2
                    },
                    {
                        Key: 1,
                        Value: $scope.item.StoreMasterId
                    },
                        // {
                        //     Key: 7,
                        //     Value: $scope.item.StoreTypeId
                        // },
                        // {
                        //     Key: 24,
                        //     Value: $scope.item.VendorMasterId
                        // }
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
            } else {
                vm.grnitemcontrolconfig.api = 'pharmacy/itemmaster/GetItemsForGRN';
                inputData = {
                    Params: [{
                        Key: 3,//ActiveStatus
                        Value: 2
                    },
                    {
                        Key: 11,
                        Value: $scope.item.StoreMasterId
                    },
                    {
                        Key: 7,
                        Value: $scope.item.StoreTypeId
                    },
                        // {
                        //     Key: 24,
                        //     Value: $scope.item.VendorMasterId
                        // }
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
            }



            if (vm.grnitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                // if ($scope.itemexactsearch == 1) {
                //     inputData.Params.push({
                //         Key: 31,
                //         Value: query
                //     });
                // } else {
                //     inputData.Params.push({
                //         Key: 1,
                //         Value: query
                //     });
                // }
                if ($scope.jssgrn == 1) {
                    inputData.Params.push({
                        Key: 24,
                        Value: query
                    });
                } else {
                    inputData.Params.push({
                        Key: 1,
                        Value: query
                    });
                }
            }
            // } else {
            //     vm.grnitemcontrolconfig.api = 'pharmacy/itemmaster/GetItemVendorMaps';
            //     query = vm.grnitemcontrolconfig.query;
            //     inputData = {
            //         Params: [{
            //             Key: 1,
            //             Value: $scope.item.VendorMasterId
            //         },
            //         {
            //             Key: 4,
            //             Value: $scope.item.StoreMasterId
            //         },
            //         {
            //             Key: 3,
            //             Value: 2
            //         },
            //         /* { Key: 6, Value: $scope.item.Rank }, */
            //         {
            //             Key: 13,
            //             Value: $scope.item.StoreTypeId
            //         }
            //         ],
            //         PageContext: {
            //             PageSize: -1,
            //             PageNumber: 1
            //         }
            //     };

            //     if (vm.grnitemcontrolconfig.searchbyid === true) {
            //         inputData.Params.push({
            //             Key: 0,
            //             Value: query
            //         });
            //     } else if (query && query.length > 2) {
            //         inputData.Params.push({
            //             Key: 3,
            //             Value: query
            //         });
            //     }
            // }

            vm.grnitemcontrolconfig.searchparams = inputData;
        }

        function postsearchgrnitem() {
            for (var idx in vm.grnitemcontrolconfig.result) {
                var item = vm.grnitemcontrolconfig.result[idx];
                // var item = vm.grnitemcontrolconfig.result[idx].ItemMaster;
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                item.IsBillable = item.IsBillable;
                if (item.ProductType) {
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.ProductType) {
                            item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                        } else {
                            item.ProductTypeName = '';
                        }
                    } else {
                        item.ProductTypeName = '';
                    }
                }
                if (item.GenericMaster) {
                    item.GenericName = item.GenericMaster.GenericName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.GenericMaster) {
                            item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                        } else {
                            item.GenericName = '';
                        }
                    } else {
                        item.GenericName = '';
                    }
                }
                if (item.Manufacturer) {
                    item.ManufacturerName = item.Manufacturer.VendorName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.Manufacturer) {
                            item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                        } else {
                            item.ManufacturerName = '';
                        }
                    } else {
                        item.ManufacturerName = '';
                    }
                }
                if (item.StockItem) {
                    item.StockInHand = item.StockItem.Quantity;
                    item.Mrp = parseFloat(item.MrPrice).toFixed(2);
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.StockItem) {
                            item.StockInHand = item.ItemMaster.StockItem.Quantity;
                            // item.Mrp = parseFloat(item.ItemMaster.MrPrice).toFixed(2);
                        } else {
                            item.StockInHand = 0;
                        }
                    } else {
                        item.StockInHand = 0;
                    }
                    item.Mrp = parseFloat(item.UomMrPrice).toFixed(2);
                }
            }
        }

        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.grnDetails) {
                if ($scope.grnDetails[idx].Status == 1) {
                    $scope.grnDetails[idx].SNo = SNo;
                    $scope.grnDetails[idx].itemidxdesc = 'desc' + (SNo - 1);
                    $scope.grnDetails[idx].itemidxqty = 'qty' + (SNo - 1);
                    SNo++;
                }
            }
        };

        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "vendorid") {
                    $timeout(function () {
                        nextId = "invoiceid";
                        $('#' + nextId).focus();
                    }, 100);
                } else if (nextId == "invoiceid") {
                    nextId = "dcid";
                    $('#' + nextId).focus();
                }
                // else if (nextId == "dcid") {
                //     nextId = "gpid";
                //     $('#' + nextId).focus();
                // }
                else if (nextId == "dcid") {
                    if ($scope.item.PurchaseOrderId && $scope.item.PurchaseOrderId > 0) {
                        nextId = "qty0"
                        $('#' + nextId).focus();
                    } else {
                        var idx = $scope.grnDetails.length - 1;
                        nextId = "desc" + '' + idx;
                        $('#' + nextId).focus();
                    }
                }
            }
        };

        $scope.getActiveRecord = function () {
            var activeRecords = $filter('filterArrayItems')($scope.grnDetails, [{
                search: 1,
                fields: ['Status']
            }]);

            return activeRecords;
        };
        $scope.OnSelectGst = function (item, selectedItem) {
            var gstitem = selectedItem;
            item.GstId = gstitem.Id;
            item.GstName = gstitem.Text;
            item.GstPercentage = gstitem.GstPercentage;
            if (gstitem.ChildGstId) {
                item.CGstId = gstitem.ChildGstId;
                item.CGstPercentage = gstitem.ChildGst.GstPercentage;
                item.SGstId = gstitem.ChildGstId;
                item.SGstPercentage = gstitem.ChildGst.GstPercentage;
            }
            $scope.computeAmount(item);
        }
        $scope.moveFocus = function (nextId, prevId, downId, upId, index, event, item) {
            if (event.keyCode == 39) { // right
                nextId = nextId + index;
                $('#' + nextId).select();
                $('#' + nextId).focus();
            } else if (event.keyCode == 37) { // left
                prevId = prevId + index;
                $('#' + prevId).focus();
            }
            // else if (event.keyCode == 38) { // Up
            //     upId = upId + (index - 1);
            //     $('#' + upId).focus();
            // } else if (event.keyCode == 40) { // Down
            //     downId = downId + (index + 1);
            //     $('#' + downId).focus();
            // }
            if (event.keyCode == 13) {
                if (nextId == 'desc') {
                    var activeRecords = $scope.getActiveRecord();
                    if ($scope.item.PurchaseOrderId && $scope.item.PurchaseOrderId > 0) {
                        var idx = index + 1;
                        nextId = "qty" + '' + idx;
                        if (idx == (activeRecords.length)) {
                            nextId = "approvebtnsubmit";
                            $('#' + nextId).focus();
                        } else {
                            $timeout(function () {
                                $('#' + nextId).focus();
                            }, 100);
                        }
                    } else {
                        var idx = activeRecords.length - 1;
                        nextId = "desc" + '' + idx;
                        if (idx == (index)) {
                            nextId = "approvebtnsubmit";
                            $('#' + nextId).focus();
                        } else {
                            $timeout(function () {
                                $('#' + nextId).focus();
                            }, 100);
                        }
                    }
                } else if (nextId == 'qty') {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                } else if (nextId == 'grnitem') {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                } else if (nextId == 'freeqty') {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                } else if (nextId == 'batchnr') {
                    // alert(1);
                    // alert(nextId);
                    // alert(index);
                    nextId = nextId + index;
                    // alert('nextId=' + nextId);
                    $('#' + nextId).focus();
                } else if (nextId == 'dispExpiryDate') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'manufdt') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'uomprice') {
                    if ($scope.item.PurchaseOrderId && $scope.item.PurchaseOrderId > 0) {
                        if (item.CanEditUomPrice) {
                            nextId = nextId + index;
                            $('#' + nextId).focus();
                        } else {
                            var activeRecords = $scope.getActiveRecord();
                            var idx = index + 1;
                            nextId = "qty" + '' + idx;
                            if (idx == (index)) {
                                nextId = "approvebtnsubmit";
                                $('#' + nextId).focus();
                            } else {
                                $timeout(function () {
                                    $('#' + nextId).focus();
                                }, 100);
                            }
                        }
                    } else {
                        nextId = nextId + index;
                        $('#' + nextId).focus();
                    }
                } else if (nextId == 'discount') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'uommrp') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'discount2') {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                }
            }
            if (event.key == "Delete" && event.keyCode == 46) {
                $scope.onDeleteConfirmed(item);
                $timeout(function () {
                    var activeRecords = $scope.getActiveRecord();
                    var idx = activeRecords.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }, 100);
            }
            if (event.key == "Insert" && event.keyCode == 45) {
                if ($scope.item.PurchaseOrderId > 0) {
                    $scope.insertGrnDetail(index, item);
                    $timeout(function () {
                        var idx = $scope.grnDetails.length + 1;
                        nextId = "desc" + '' + idx;
                        $('#' + nextId).focus();
                    }, 10);
                }
            }
        };

        $scope.numberwithdecimal = function (e) {
            if ($.inArray(e.keyCode, [8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // Let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress && (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && e.keyCode != 46) {
                e.preventDefault();
            }
        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // Let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress && (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.setCmbFocus = function (dom) {
            $timeout(function () {
                var uiSelect = angular.element(dom);
                var uichild = uiSelect.controller('uiSelect');
                uichild.activate();
            }, 100);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#authorizebtnsubmit').text("Authorize (F2)");
            $('#approvebtnsubmit').text("Approve (F4)");
            $('#printbtnsubmit').text("Print (Alt + P)");
            $('#btndmprint').text("DMPrint (Alt + P)");
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                    $scope.item.StoreSubTypeId = value[0].StoreMaster.StoreSubTypeId;
                    $scope.item.SequenceOptionId = value[0].StoreMaster.SequenceOptionId;
                    $scope.item.IsOpenGRN = value[0].StoreMaster.CanAllowOpenGRN;
                    $scope.item.IsPOMandatory = value[0].StoreMaster.IsPOMandatory;
                    $scope.item.IsGstEditablePo = value[0].StoreMaster.IsGstEditablePo;
                } else if (key == 'UserStores' && $scope.item.StoreMasterId > 0) {
                    for (var userstoreid = 0; userstoreid < $scope.lookup['UserStores'].length; userstoreid++) {
                        if ($scope.lookup['UserStores'][userstoreid].Id == $scope.item.StoreMasterId) {
                            $scope.item.StoreTypeId = $scope.lookup['UserStores'][userstoreid].StoreMaster.StoreTypeId;
                            $scope.item.StoreSubTypeId = $scope.lookup['UserStores'][userstoreid].StoreMaster.StoreSubTypeId;
                            $scope.item.SequenceOptionId = $scope.lookup['UserStores'][userstoreid].StoreMaster.SequenceOptionId;
                            $scope.item.IsOpenGRN = $scope.lookup['UserStores'][userstoreid].StoreMaster.CanAllowOpenGRN;
                            $scope.item.IsPOMandatory = $scope.lookup['UserStores'][userstoreid].StoreMaster.IsPOMandatory;
                            $scope.item.IsGstEditablePo = $scope.lookup['UserStores'][userstoreid].StoreMaster.IsGstEditablePo;
                        }
                    }
                }
            });

        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "GrnType"
            },
            {
                "Key": "Remark",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 8
                    }, {
                        Key: 5,
                        Value: 2
                    }],

                }
            },
            {
                "Key": "GstMaster",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 2
                    }, {
                        Key: 5,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },
                        // { Key: 8, Value:? true }
                    ]
                }
            },
            {
                "Key": "PaymentTerms"
            },
            {
                "Key": "UserStores",
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 2,
                        Value: $scope.item.FacilityId
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
                "Key": "DiscountMode"
            }
            ];

            $scope.getLookUp(inputData);
            loadData();
            $timeout(function () {
                $('#vendorid').focus();
            }, 1000);
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

        /* Grn dotmatrix print starts */

        $scope.dmPrint = function () {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showSuccessMsg($translate.instant('inventory.grn.noperference.lbl'));
                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'pharmacy/grn/DMPrintGrn',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.dmPrintCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.dmPrintCallback = function (scope, data, options, hasError) {
            console.log(data);
            var dmPrintInput = preparePrintData(data);
            $scope.printGRNDetail(dmPrintInput);
        };

        function preparePrintData(data) {
            console.log('preparePrintData starts');

            var vGRNNo = '';
            var vStoreName = '';
            var vGRNDate = '';
            var vGRNType = '';
            var vVendorName = '';
            var vInvoiceDate = '';
            var vInvoiceNo = '';
            var vPODate = '';
            var vDCDate = '';
            var vDCNo = '';
            var vPONo = '';
            var vGPDate = '';
            var vGPNo = '';
            var vOrderBy = '';
            var vGRNStatus = '';
            var vApprovedBy = '';
            var vgrndis = '';
            var vStoreheading1 = '';
            var vStoreheading2 = '';
            var vStoreheading3 = '';
            var vStoreheading4 = '';

            if (data.Grn.GrnType) vGRNType = '' + data.Grn.GrnType.Description;
            if (data.Grn.VendorMaster) vVendorName = '' + data.Grn.VendorMaster.VendorName;
            if (data.Grn.StoreMaster) vStoreName = '' + data.Grn.StoreMaster.StoreName;
            if (data.Grn.CreatedUser) {
                if (data.Grn.CreatedUser.Title)
                    vOrderBy += data.Grn.CreatedUser.Title.Description;
                if (data.Grn.CreatedUser.FirstName)
                    vOrderBy += ' ' + data.Grn.CreatedUser.FirstName;
                if (data.Grn.CreatedUser.LastName)
                    vOrderBy += ' ' + data.Grn.CreatedUser.LastName;
            }
            if (data.Grn.GrnStatus) vGRNStatus = '' + data.Grn.GrnStatus.Description;

            if (data.Grn.ApprovedUser) {
                if (data.Grn.ApprovedUser.Title)
                    vApprovedBy += data.Grn.ApprovedUser.Title.Description;
                if (data.Grn.ApprovedUser.FirstName)
                    vApprovedBy += ' ' + data.Grn.ApprovedUser.FirstName;
                if (data.Grn.ApprovedUser.LastName)
                    vApprovedBy += ' ' + data.Grn.ApprovedUser.LastName;
            }
            if (data.PrintData.heading1)
                vStoreheading1 = data.PrintData.heading1
            if (data.PrintData.heading2)
                vStoreheading2 = data.PrintData.heading2
            if (data.PrintData.heading3)
                vStoreheading3 = data.PrintData.heading3
            if (data.PrintData.heading4)
                vStoreheading4 = data.PrintData.heading4

            var GRNDateOnly = utl.Formatter.getDateString(data.Grn.GrnDate);
            var GRNDateTime = new Date(data.Grn.GrnDate);
            var Minutes = GRNDateTime.getMinutes();
            var Hours = GRNDateTime.getHours();
            var Meridiem = 'AM';
            if (Hours > 12 || Hours == 12) {
                Meridiem = 'PM';
                Hours = Hours - 12;
            }
            if (Hours < 10) {
                Hours = '0' + Hours;
            }
            if (Minutes < 10) {
                Minutes = '0' + Minutes;
            }
            var GRNTime = Hours + ':' + Minutes + ' ' + Meridiem;

            var InvoiceDateOnly = utl.Formatter.getDateString(data.Grn.InvoiceDate);
            var InvoiceDateTime = new Date(data.Grn.InvoiceDate);
            var Minutes = InvoiceDateTime.getMinutes();
            var Hours = InvoiceDateTime.getHours();
            var Meridiem = 'AM';
            if (Hours > 12 || Hours == 12) {
                Meridiem = 'PM';
                Hours = Hours - 12;
            }
            if (Hours < 10) {
                Hours = '0' + Hours;
            }
            if (Minutes < 10) {
                Minutes = '0' + Minutes;
            }
            var InvoiceTime = Hours + ':' + Minutes + ' ' + Meridiem;

            var dmPrintInput = {};

            dmPrintInput.header = {
                vGRNNo: data.Grn.GrnNumber,
                vStoreName: vStoreName,
                vGRNDate: utl.Formatter.getDateTimeString(data.Grn.GrnDate),
                vGRNType: vGRNType,
                vVendorName: vVendorName,
                vInvoiceDate: utl.Formatter.getDateTimeString(data.Grn.InvoiceDate),
                vInvoiceNo: data.Grn.InvoiceNumber,
                vPODate: utl.Formatter.getDateTimeString(data.Grn.PoDate),
                vDCDate: utl.Formatter.getDateTimeString(data.Grn.DcDate),
                vDCNo: data.Grn.DcNumber,
                vPONo: data.Grn.PoNumber,
                vGPDate: utl.Formatter.getDateTimeString(data.Grn.GpDate),
                vGPNo: data.Grn.GpNumber,
                vOrderBy: vOrderBy,
                vGRNStatus: vGRNStatus,
                vGrossAmount: data.Grn.TotalGrossAmount,
                vDiscount: data.Grn.TotalDiscountAmount,
                vDiscount1: data.Grn.TotalDiscount1Amount,
                vDiscount2: data.Grn.TotalDiscount2Amount,
                vGSTAmount: data.Grn.TotalGstAmount,
                vOtherCost: data.Grn.OtherCharges,
                vRoundOff: data.Grn.RoundOff,
                vNetAmount: data.Grn.TotalNetAmount,
                vcomments: data.Grn.Comments,
                vapprovedby: vApprovedBy || '',
                vgrndis: data.Grn.GrnDiscount,
                vStoreheading1: vStoreheading1,
                vStoreheading2: vStoreheading2,
                vStoreheading3: vStoreheading3,
                vStoreheading4: vStoreheading4,
                GRNDateOnly: GRNDateOnly,
                GRNTime: GRNTime,
                InvoiceDateOnly: InvoiceDateOnly,
                InvoiceTime: InvoiceTime
            };

            dmPrintInput.lines = [];
            var islno = 1;

            data.GrnDetailDetail.sort(function (a, b) {
                if (a.Id < b.Id) return -1;
                else if (a.Id > b.Id) return 1;
                return 0;
            });

            for (var idx in data.GrnDetailDetail) {
                var GRNDetail = data.GrnDetailDetail[idx];

                var expiryDate = GRNDetail.ExpiryDate ? utl.Formatter.formatDate(GRNDetail.ExpiryDate, 'MM/YY') : '';

                var batchid = GRNDetail.BatchId;
                if (batchid && batchid.length > 4) {
                    batchid = batchid.substring(0, 4);
                }
                var FullBatch = GRNDetail.BatchId;
                var cgstamt = GRNDetail.GrnQuantity * GRNDetail.CGstAmount.toFixed(2);
                var sgstamt = GRNDetail.GrnQuantity * GRNDetail.SGstAmount.toFixed(2);
                var Amt = GRNDetail.NetAmount - (GRNDetail.GrnQuantity * GRNDetail.CGstAmount + GRNDetail.GrnQuantity * GRNDetail.SGstAmount);
                var totgst = cgstamt + sgstamt;
                var TotalMrp = GRNDetail.GrnQuantity * GRNDetail.UomMrPrice;
                var Dis = GRNDetail.GrnQuantity * GRNDetail.UomDiscountAmount;

                var ProfitAmount = TotalMrp - GRNDetail.NetAmount;
                var ProfitPercentage = ((ProfitAmount / GRNDetail.NetAmount) * 100);

                var vHSN = '';
                if (GRNDetail.ItemMaster)
                    if (GRNDetail.ItemMaster.ProductRegNo)
                        vHSN = '' + GRNDetail.ItemMaster.ProductRegNo;

                var TotalQtyInDetail = GRNDetail.GrnQuantityAfterConversion + GRNDetail.FreeQtyAfterConversion;

                var detail = {
                    ispace: ' ',
                    slno: islno++,
                    MatName: GRNDetail.ItemName,
                    hsn: vHSN,
                    batch: batchid,
                    exp: expiryDate,
                    Ordqty: GRNDetail.PoQuantity,
                    Recqty: GRNDetail.GrnQuantity,
                    FreeQty: GRNDetail.FreeQty,
                    ConversionQty: GRNDetail.ConversionQuantity,
                    TotalQty: GRNDetail.GrnQuantityAfterConversion,
                    TotalFreeQty: GRNDetail.FreeQtyAfterConversion,
                    PurchasePrice: GRNDetail.UomPrice.toFixed(2),
                    mrp: GRNDetail.UomMrPrice.toFixed(2),
                    value: Amt.toFixed(2),
                    dis: Dis.toFixed(2),
                    UOM: GRNDetail.PurchaseUom.UomName,
                    cgstper: GRNDetail.CGstPercentage,
                    cgstamt: cgstamt.toFixed(2),
                    sgstper: GRNDetail.SGstPercentage,
                    sgstamt: sgstamt.toFixed(2),
                    totgst: totgst.toFixed(2),
                    amount: GRNDetail.NetAmount.toFixed(2),
                    TotalMrp: TotalMrp.toFixed(2),
                    ProfitPercentage: ProfitPercentage.toFixed(2),
                    FullBatch: FullBatch,
                    TotalQtyInDetail: TotalQtyInDetail
                };
                dmPrintInput.lines.push(detail);
            }

            dmPrintInput.AmountDevivationLines = [];
            var SerialNo = 1;
            for (var idx in data.GrnAmountDeviationDetails) {
                var GRNAmountDevivationDetail = data.GrnAmountDeviationDetails[idx];

                var GRNNumber = GRNAmountDevivationDetail.Grn.GrnNumber;
                var GRNDate = utl.Formatter.getDateString(GRNAmountDevivationDetail.Grn.GrnDate);
                var VendorName = GRNAmountDevivationDetail.VendorMaster.VendorName;
                var ItemCode = GRNAmountDevivationDetail.ItemCode;
                var ItemName = GRNAmountDevivationDetail.ItemName;
                var ExpiryDate = GRNAmountDevivationDetail.ExpiryDate ? utl.Formatter.formatDate(GRNAmountDevivationDetail.ExpiryDate, 'MM/YY') : '';
                var BatchNo = GRNAmountDevivationDetail.BatchId;
                if (BatchNo && BatchNo.length > 6) {
                    BatchNo = BatchNo.substring(0, 6);
                }
                var GRNQuantity = GRNAmountDevivationDetail.GrnQuantity;
                var FreeQuantity = GRNAmountDevivationDetail.FreeQty;
                var ConversionQuantity = GRNAmountDevivationDetail.ConversionQuantity;
                var UomPrice = GRNAmountDevivationDetail.UomPrice.toFixed(2);
                var PurchasePrice = GRNAmountDevivationDetail.PurchasePrice.toFixed(2);
                var UomPriceAfterDiscount = GRNAmountDevivationDetail.UomPriceAfterDiscount.toFixed(2);
                var PurchasePriceAfterDiscount = GRNAmountDevivationDetail.PurchasePriceAfterDiscount.toFixed(2);
                var DiscountAmount = GRNAmountDevivationDetail.DiscountAmount.toFixed(2);
                var MRP = GRNAmountDevivationDetail.UomMrPrice.toFixed(2);
                var UOMName = GRNAmountDevivationDetail.PurchaseUom.UomName;

                var CGSTAmount = GRNAmountDevivationDetail.GrnQuantity * GRNAmountDevivationDetail.CGstAmount.toFixed(2);
                var SGSTAmount = GRNAmountDevivationDetail.GrnQuantity * GRNAmountDevivationDetail.SGstAmount.toFixed(2);
                var TotalGST = CGSTAmount + SGSTAmount;
                var Amount = GRNAmountDevivationDetail.NetAmount - (GRNAmountDevivationDetail.GrnQuantity * GRNAmountDevivationDetail.CGstAmount + GRNAmountDevivationDetail.GrnQuantity * GRNAmountDevivationDetail.SGstAmount);
                var TotalMRP = GRNAmountDevivationDetail.GrnQuantity * GRNAmountDevivationDetail.UomMrPrice;
                var Discount = GRNAmountDevivationDetail.GrnQuantity * GRNAmountDevivationDetail.UomDiscountAmount;
                var TotalAmount = GRNAmountDevivationDetail.NetAmount.toFixed(1);

                var AmountDevivationDetail = {
                    ispace: ' ',
                    ispace1: '',
                    SerialNo: SerialNo++,
                    GRNNumber: GRNNumber,
                    GRNDate: GRNDate,
                    VendorName: VendorName,
                    ItemCode: ItemCode,
                    ItemName: ItemName,
                    ExpiryDate: ExpiryDate,
                    BatchNo: BatchNo,
                    GRNQuantity: GRNQuantity,
                    FreeQuantity: FreeQuantity,
                    ConversionQuantity: ConversionQuantity,
                    UomPrice: UomPrice,
                    PurchasePrice: PurchasePrice,
                    UomPriceAfterDiscount: UomPriceAfterDiscount,
                    PurchasePriceAfterDiscount: PurchasePriceAfterDiscount,
                    DiscountAmount: DiscountAmount,
                    MRP: MRP,
                    UOMName: UOMName,
                    CGSTAmount: CGSTAmount.toFixed(1),
                    SGSTAmount: SGSTAmount.toFixed(1),
                    TotalGST: TotalGST.toFixed(1),
                    Amount: Amount.toFixed(1),
                    TotalMRP: TotalMRP.toFixed(1),
                    Discount: Discount.toFixed(1),
                    TotalAmount: TotalAmount
                };
                dmPrintInput.AmountDevivationLines.push(AmountDevivationDetail);
            }
            console.log('preparePrintData ends');
            return dmPrintInput;
        }
        $scope.getfacilityCallback = function (scope, data, options, hasError) {
            $scope.data = data;
            $scope.item.IsConvertionQtyEdit = $scope.data.IsConvertionQtyEdit;
            $scope.ShowmultipleDiscount = $scope.data.IsMultipleDiscount;
            if ($scope.item.IsConvertionQtyEdit == true) {
                $scope.ConvertionQtyEdit = true;
            }
            if ($scope.item.IsConvertionQtyEdit == false) {
                $scope.ConvertionQtyEdit = false;
            }
            $scope.ShowMrp = data.ShowMrp;
            $scope.DisablesalePrice = false;
            if ($scope.ShowMrp) {
                $scope.DisablesalePrice = true;
            }
            $scope.currentcontext.MrpPercent = data.MrpPercent;
            $scope.addNewLineItem();
        };
        $scope.getfacility = function () {
            var options = {
                action: 'SystemSettings/facility/GetFacilityById',
                data: {
                    Id: utl.Session.getCurrentFacilityId()
                },
                type: 'post',
                onComplete: $scope.getfacilityCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPharmacyPrintPreference = function () {
            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('dmprint', 'pharmacydmprintenable');

            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('print', 'laserprintenable');

            if ($scope.dmprintpreferences)
                if ($scope.dmprintpreferences <= 0)
                    $('#btndmprint').hide();


            if ($scope.printpreferences)
                if ($scope.printpreferences <= 0)
                    $('#btnprint').hide();
        };

        function makeRoundOff(num) {
            var NetNaturalValue = getNatural(Number(num).toFixed(2));
            var NetDecimalValue = getDecimal(Number(num).toFixed(2));
            var RoundOffValue = 0;
            var roundoffNum = 0;
            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                roundoffNum = NetNaturalValue;
                RoundOffValue = -1 * (NetDecimalValue / 100);
                // $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                roundoffNum = NetNaturalValue + 1;
                RoundOffValue = (100 - NetDecimalValue) / 100;
                // $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            } else {
                RoundOffValue = 0;
                // $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
                roundoffNum = num;
            }
            return roundoffNum;
        }

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        /* Pharmacy  Sales - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 115 && savehitcompleted === 0 && $scope.canShowSaveandApproveBtn) { // F4  - SaveAndApprove
                $scope.SaveandApprove();
            }
            if (kCode == 113 && savehitcompleted === 0 && $scope.canShowAuthorizeBtn) { // F2  - Authorize
                $scope.SaveandAuthorize();
            }
            if (kCode == 118) { // F7  - New Page
                $scope.clear();
            }
            if (kCode == 119) { // F8  - Find Bills
                $scope.findpo();
            }
            if (e.altKey && kCode == 80) { // alt + p  - DMPrint
                if ($scope.dmprintpreferences > 0) {
                    $scope.dmPrint();
                } else if ($scope.printpreferences > 0) {
                    $scope.print();
                }
            }
            if (kCode == 27) { // Esc
                $scope.autosearchpopup = 0;
            }
        }

        angular.element(document).on('keydown', keyupHandler);

        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Pharmacy  Sales - Shortcut Keys - End */

        $scope.checkHeader = function (iVal) {
            if (iVal == 1) {
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
        };
        $scope.getPharmacyPrintPreference();
        $scope.initLookup();
    }

    GRNFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();
