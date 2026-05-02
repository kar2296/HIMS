
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('importStockMasterExcelController', importStockMasterExcelController);
        
    function importStockMasterExcelController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;
        $scope.Items = [];
        $scope.Item = [];

        
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.employeeid = parseInt($stateParams.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
            $scope.currentcontext.isViewMode = modalConfig.params.isViewMode;
        }
        $scope.loading = false;

        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };
        $scope.downloadFile = function (item) {
            var inputData = { FilePath: item };
            console.log(inputData);
            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequestFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }
        $scope.download = function () {

            const JsonFields = ["ItemCode", "ItemName", "ItemDescription", "FacilityCode",
                "ImplantType", "Category", "SubCategory", "ProductType", "GenericName", "ManufacturerName", "BaseUom", "PurchaseUom", "SaleUom", "ConversionQty", "NoOfTransactions", "ScheduleType", "Gst", "InGst", "CGst", "SGst", "ProductRegNo", "IsBatchMandatory", "IsExpiryMandatory", "DiscountMode", "Discount", "CostPrice", "MrPrice", "DrugName", "IsConsignment", "IsBillable", "IsHighAlert", "IsNarcotic", "IsReusable", "IsNonClaimable", "ABCClass", "VED",
             "IsEmergency",  "AllowStaffDiscount", "IsLASADrug", "ActiveStatusId", "IsActive", "FreeQty"]

            let csvContent = JsonFields.join(",") + "\n";

            // csvContent += "Mr,Ramu,K,,1996-07-23,Married,HR,Male,977305345,,aah@gmail.com,Karthi,Amsa,432254674324,aaaa,bbbb,India,E1234,MR023000060100,609605";

            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            // hiddenElement.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Item Bulk Upload.csv';
            hiddenElement.click();

        }

        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.selectedFile = null;
        $scope.msg = "";

        $scope.loadFile = function (files) {
            $scope.$apply(function () {

                $scope.selectedFile = files[0];

            })
        }

        $scope.handleFile = function () {

            var file = $scope.selectedFile;
            console.log("button clicked");
            console.log(file);

            if (file) {
                console.log("fff");
                var reader = new FileReader();

                // console.log('XLSX',XLSX);
                reader.onload = function (e) {

                    var data = e.target.result;

                    var workbook = XLSX.read(data, { type: 'binary' });

                    var first_sheet_name = workbook.SheetNames[0];

                    var dataObjects = XLSX.utils.sheet_to_json(workbook.Sheets[first_sheet_name]);

                    if (dataObjects.length > 0) {
                        //console.log(dataObjects[0]);
                        // if (dataObjects[0].ItemCode && dataObjects[0].ItemName && dataObjects[0].ItemDescription) {
                        //     $scope.save(dataObjects);
                        var filteredData = dataObjects.filter(row =>
                            row.ItemCode && row.ItemName && row.ItemDescription
                        );
                        if (filteredData.length > 0) {
                            $scope.save(filteredData);
                        } else {
                            alert("No valid data found. Please check the Excel file.");
                        }
                    } else {
                        alert("No Data Found");
                        $scope.msg = "Error : Something Wrong !";
                    }
                }
                reader.onerror = function (ex) {
                }
                reader.readAsBinaryString(file);
            }
            else {
                alert("No File Selected! Plz Select Excel");
            }
        }

        $scope.save = function (inputData) {
            console.log(inputData);
            var result = [];

            const convertToBoolean = (value) => {
                return value && value.toString().toLowerCase() === 'yes';
            };

            for (var idx in inputData) {
                var data = inputData[idx];
                var item = {
                    // Date: utl.Formatter.getCurrentDate(),
                    // FacilityId: utl.Session.getCurrentFacilityId(),
                    ItemCode: data.ItemCode,
                    ItemName: data.ItemName,
                    ItemDescription: data.ItemDescription,
                    FacilityId: -1,
                    ImplantTypeId: -1,
                    CategoryId: -1,
                    SubCategoryId: -1,
                    ProductTypeId: -1,
                    GenericId: -1,
                    ManufacturerId: -1,
                    BaseUomId: -1,
                    PurchaseUomId: -1,
                    SaleUomId: -1,
                    ConversionQty: data.ConversionQty,
                    NoOfTransactions: data.NoOfTransactions,
                    ScheduleTypeId: -1,
                    GstId: -1,
                    InGstId: -1,
                    CGstId: -1,
                    SGstId: -1,
                    ProductRegNo: data.ProductRegNo,
                    IsBatchMandatory: convertToBoolean(data.IsBatchMandatory),
                    IsExpiryMandatory: convertToBoolean(data.IsExpiryMandatory),
                    DiscountModeId: -1,
                    Discount: data.Discount,
                    CostPrice: data.CostPrice,
                    MrPrice: data.MrPrice,
                    DrugName: data.DrugName,
                    IsConsignment: convertToBoolean(data.IsConsignment),
                    IsBillable: convertToBoolean(data.IsBillable),
                    IsHighAlert: convertToBoolean(data.IsHighAlert),
                    IsNarcotic: convertToBoolean(data.IsNarcotic),
                    IsReusable: convertToBoolean(data.IsReusable),
                    IsNonClaimable: convertToBoolean(data.IsNonClaimable),
                    ABCClassId: -1,
                    VEDId: -1,
                    IsEmergency: convertToBoolean(data.IsEmergency),
                    AllowStaffDiscount: convertToBoolean(data.AllowStaffDiscount),
                    IsLASADrug: convertToBoolean(data.IsLASADrug),
                    ActiveStatusId: data.ActiveStatusId,
                    IsActive: convertToBoolean(data.IsActive),
                    FreeQty: data.FreeQty,
                    GenericCode: '',
                    GenericName: '',
                    ManufacturerCode: '',
                    ManufacturerName: '',
                    DrugCode: '',
                    DrugName: '',
                    DrugId: -1,
                    IsExcelUpload: true
                };
                // Strings converted to IDs
                const convertToLowerCase = function(value) {
                    if (value) {
                        return value.toString().toLowerCase();
                    }
                    return '';
                };
                if (data.FacilityCode) {
                    let faclen = $scope.lookup.Facility.length;
                    for (var i = 0; i < faclen; i++) {
                        if (convertToLowerCase($scope.lookup.Facility[i].FacilityCode) === convertToLowerCase(data.FacilityCode)) {
                            item.FacilityId = $scope.lookup.Facility[i].Id;
                            break;
                        }
                    }
                }
                if (data.ImplantType) {
                    let implen = $scope.lookup.ImplantType.length;
                    for (var i = 0; i < implen; i++) {
                        if (convertToLowerCase($scope.lookup.ImplantType[i].Text) === convertToLowerCase(data.ImplantType)) {
                            item.ImplantTypeId = $scope.lookup.ImplantType[i].Id;
                            break;
                        }
                    }
                }
                if (data.Category) {
                    let catlen = $scope.lookup.ItemCategory.length;
                    for (var i = 0; i < catlen; i++) {
                        if (convertToLowerCase($scope.lookup.ItemCategory[i].Text) === convertToLowerCase(data.Category)) {
                            item.CategoryId = $scope.lookup.ItemCategory[i].Id;
                            break;
                        }
                    }
                }
                if (data.SubCategory) {
                    let sublen = $scope.lookup.ItemSubCategory.length;
                    for (var i = 0; i < sublen; i++) {
                        if (convertToLowerCase($scope.lookup.ItemSubCategory[i].Text) === convertToLowerCase(data.SubCategory)) {
                            item.SubCategoryId = $scope.lookup.ItemSubCategory[i].Id;
                            break;
                        }
                    }
                }
                if (data.ProductType) {
                    let prolen = $scope.lookup.ProductType.length;
                    for (var i = 0; i < prolen; i++) {
                        if (convertToLowerCase($scope.lookup.ProductType[i].Text) === convertToLowerCase(data.ProductType)) {
                            item.ProductTypeId = $scope.lookup.ProductType[i].Id;
                            break;
                        }
                    }
                }
                if (data.GenericName) {
                    let genlen = $scope.lookup.Generic.length;
                    for (var i = 0; i < genlen; i++) {
                        if (convertToLowerCase($scope.lookup.Generic[i].Text) === convertToLowerCase(data.GenericName)) {
                            item.GenericId = $scope.lookup.Generic[i].Id;
                            item.GenericCode = $scope.lookup.Generic[i].Code;
                            item.GenericName = $scope.lookup.Generic[i].Text;
                            break;
                        }
                    }
                }
                if (data.ManufacturerName) {
                    let manulen = $scope.lookup.VendorMaster.length;
                    for (var i = 0; i < manulen; i++) {
                        if (convertToLowerCase($scope.lookup.VendorMaster[i].Text) === convertToLowerCase(data.ManufacturerName)) {
                            item.ManufacturerId = $scope.lookup.VendorMaster[i].Id;
                            item.ManufacturerCode = $scope.lookup.VendorMaster[i].VendorCode;
                            item.ManufacturerName = $scope.lookup.VendorMaster[i].Text;
                            break;
                        }
                    }
                }
                if (data.BaseUom) {
                    let uombaselen = $scope.lookup.UomMaster.length;
                    for (var i = 0; i < uombaselen; i++) {
                        if (convertToLowerCase($scope.lookup.UomMaster[i].Text) === convertToLowerCase(data.BaseUom)) {
                            item.BaseUomId = $scope.lookup.UomMaster[i].Id;
                            break;
                        }
                    }
                }
                if (data.PurchaseUom) {
                    let uompurchaselen = $scope.lookup.UomMaster.length;
                    for (var i = 0; i < uompurchaselen; i++) {
                        if (convertToLowerCase($scope.lookup.UomMaster[i].Text) === convertToLowerCase(data.PurchaseUom)) {
                            item.PurchaseUomId = $scope.lookup.UomMaster[i].Id;
                            break;
                        }
                    }
                }
                if (data.SaleUom) {
                    let salelen = $scope.lookup.UomMaster.length;
                    for (var i = 0; i < salelen; i++) {
                        if (convertToLowerCase($scope.lookup.UomMaster[i].Text) === convertToLowerCase(data.SaleUom)) {
                            item.SaleUomId = $scope.lookup.UomMaster[i].Id;
                            break;
                        }
                    }
                }
                if (data.ScheduleType) {
                    let schedulelen = $scope.lookup.ScheduleType.length;
                    for (var i = 0; i < schedulelen; i++) {
                        if (convertToLowerCase($scope.lookup.ScheduleType[i].Text) === convertToLowerCase(data.ScheduleType)) {
                            item.ScheduleTypeId = $scope.lookup.ScheduleType[i].Id;
                            break;
                        }
                    }
                }
                if (data.InGst) {
                    let ingstlen = $scope.lookup.GstMaster.length;
                    for (var i = 0; i < ingstlen; i++) {
                        const gstMasterText = convertToLowerCase($scope.lookup.GstMaster[i].Text).replace('%', '').trim();
                        const inputGst = convertToLowerCase(data.InGst).replace('%', '').trim();

                        if (gstMasterText === inputGst) {
                            item.InGstId = $scope.lookup.GstMaster[i].Id;
                            break;
                        }
                    }
                }
                if (data.Gst) {
                    let gstlen = $scope.lookup.GstMaster.length;
                    for (var i = 0; i < gstlen; i++) {
                        const gstMasterText = convertToLowerCase($scope.lookup.GstMaster[i].Text).replace('%', '').trim();
                        const inputGst = convertToLowerCase(data.Gst).replace('%', '').trim();
                
                        if (gstMasterText === inputGst) {
                            item.GstId = $scope.lookup.GstMaster[i].Id;
                            break;
                        }
                    }
                }
                if (data.CGst) {
                    let cgstlen = $scope.lookup.GstMaster.length;
                    for (var i = 0; i < cgstlen; i++) {
                        const gstMasterText = convertToLowerCase($scope.lookup.GstMaster[i].Text).replace('%', '').trim();
                        const inputGst = convertToLowerCase(data.CGst).replace('%', '').trim();
                
                        if (gstMasterText === inputGst) {
                            item.CGstId = $scope.lookup.GstMaster[i].Id;
                            break;
                        }
                    }
                }
                if (data.SGst) {
                    let sgstlen = $scope.lookup.GstMaster.length;
                    for (var i = 0; i < sgstlen; i++) {
                        const gstMasterText = convertToLowerCase($scope.lookup.GstMaster[i].Text).replace('%', '').trim();
                        const inputGst = convertToLowerCase(data.SGst).replace('%', '').trim();
                
                        if (gstMasterText === inputGst) {
                            item.SGstId = $scope.lookup.GstMaster[i].Id;
                            break;
                        }
                    }
                }                
                if (data.DiscountMode) {
                    let discountMode = convertToLowerCase(data.DiscountMode);
                    // Convert '0' to '%' for matching
                    if (discountMode === 'percentage') {
                        discountMode = '%';
                    }
                    let discountlen = $scope.lookup.DiscountMode.length;
                    for (let i = 0; i < discountlen; i++) {
                        if (convertToLowerCase($scope.lookup.DiscountMode[i].Text) === discountMode) {
                            item.DiscountModeId = $scope.lookup.DiscountMode[i].Id;
                            break;
                        }
                    }
                }
                if (data.ABCClass) {
                    let abclen = $scope.lookup.ABCClass.length;
                    for (var i = 0; i < abclen; i++) {
                        if (convertToLowerCase($scope.lookup.ABCClass[i].Text) === convertToLowerCase(data.ABCClass)) {
                            item.ABCClassId = $scope.lookup.ABCClass[i].Id;
                            break;
                        }
                    }
                }
                if (data.VED){
                    let vedlen = $scope.lookup.VED.length;
                    for (var i = 0; i < vedlen; i++) {
                        if (convertToLowerCase($scope.lookup.VED[i].Text) == convertToLowerCase(data.VED)) {
                            item.VEDId = $scope.lookup.VED[i].Id;
                            break;
                        }
                    }
                }
                if (data.DrugName){
                    let druglen = $scope.lookup.Drug.length;
                    for (var i = 0; i < druglen; i++) {
                        if (convertToLowerCase($scope.lookup.Drug[i].Text) == convertToLowerCase(data.DrugName)) {
                            item.DrugId = $scope.lookup.Drug[i].Id;
                            item.DrugCode = $scope.lookup.Drug[i].DrugCode;
                            item.DrugName = $scope.lookup.Drug[i].Text;
                            break;
                        }
                    }
                }
                
                result.push(item);
            }
            console.log('result');
            console.log(result);
            $scope.loading = true;
            var options = {
                action: 'Pharmacy/ItemMaster/AddItemMasterExcel',
                data: {
                    Data: result
                },
                type: 'post',
                onComplete: $scope.importCallback //saveItemCallback
            };
            utl.Http.doAction(options);
        }
        // End Excel Save

        $scope.importCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('You have Successfully Imported'));
            console.log("Response");
            console.log(data);
            $scope.backToList();
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            console.log('lookup');
            console.log(data);
            $scope.lookup = hasError ? {} : data;
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ImplantType" },
                { "Key": "ItemCategory" },
                { "Key": "ItemSubCategory" },
                { "Key": "Generic" },
                { "Key": "VendorMaster" },
                { "Key": "UomMaster" },
                { "Key": "ScheduleType" },
                { "Key": "GstMaster" },
                { "Key": "ABCClass" },
                { "Key": "VED" },
                { "Key": "DiscountMode" },
                { "Key": "ProductType" },
                { "Key": "Drug" }
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

    importStockMasterExcelController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$timeout', '$filter'];

})
();


