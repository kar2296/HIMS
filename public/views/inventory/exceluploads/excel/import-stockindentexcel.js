
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('importStockIndentExcelController', importStockIndentExcelController);
        
    function importStockIndentExcelController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
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

            const JsonFields = ["FromStoreCode", "FromStoreName", "ToStoreCode", "ToStoreName", "FromFacilityCode", "ToFacilityCode",
                "MedicalORNonMedical", "NormalOREmergency", "ItemCode", "ItemName", "RequestedQuantity", "Comments"]

            let csvContent = JsonFields.join(",") + "\n";

            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            // hiddenElement.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Stock Indent Upload.csv';
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
                            row.FromStoreCode && row.ToStoreCode && row.ItemCode
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

            for (var idx in inputData) {
                var data = inputData[idx];
                var item = {
                    // Header
                    ApprovedBy: utl.Session.getCurrentUserId(),
                    // ApprovedDate: utl.Formatter.getCurrentDate(),
                    FacilityId: -1,
                    ItemCategoryId: -1,
                    RequestStatusId: 2,
                    RequestedBy: utl.Session.getCurrentUserId(),
                    StockPriorityId: -1,
                    StockRequestTypeId: -1,
                    StoreMasterId: -1,
                    StoreName: '',
                    ToFacilityId: -1,
                    ToStoreMasterId: -1,
                    ToStoreName: '',
                    // Details
                    BaseUomId: -1,
                    Comments: data.Comments,
                    GrossAmount: 0,
                    GstId: -1,
                    GstPercentage: '',
                    ItemCode: '',
                    ItemMasterId: -1,
                    ItemName: '',
                    NetAmount: 0,
                    PurConQty: '',
                    PurchasePrice: '',
                    PurchaseUomId: -1,
                    RequestedQuantity: data.RequestedQuantity,
                    RequestNumber: null
                };
                // Strings converted to IDs
                const convertToLowerCase = function(value) {
                    if (value) {
                        return value.toString().trim().toLowerCase();
                    }
                    return '';
                };
                if (data.FromFacilityCode) {
                    let faclen = $scope.lookup.Facility.length;
                    for (var i = 0; i < faclen; i++) {
                        if (convertToLowerCase($scope.lookup.Facility[i].FacilityCode) === convertToLowerCase(data.FromFacilityCode)) {
                            item.FacilityId = $scope.lookup.Facility[i].Id;
                            break;
                        } else {
                            item.FacilityId = utl.Session.getCurrentFacilityId();
                        }
                    }
                }
                if (data.ToFacilityCode) {
                    let faclen = $scope.lookup.Facility.length;
                    for (var i = 0; i < faclen; i++) {
                        if (convertToLowerCase($scope.lookup.Facility[i].FacilityCode) === convertToLowerCase(data.ToFacilityCode)) {
                            item.ToFacilityId = $scope.lookup.Facility[i].Id;
                            break;
                        } else {
                            item.ToFacilityId = utl.Session.getCurrentFacilityId();
                        }
                    }
                }
                if (data.ItemCode) {
                    let faclen = $scope.lookup.StoreItem.length;
                    for (var i = 0; i < faclen; i++) {
                        if (convertToLowerCase($scope.lookup.StoreItem[i].ItemCode) === convertToLowerCase(data.ItemCode)) {
                            item.ItemCode = $scope.lookup.StoreItem[i].ItemCode;
                            item.ItemMasterId = $scope.lookup.StoreItem[i].ItemMasterId;
                            item.ItemName = $scope.lookup.StoreItem[i].ItemName;
                            item.BaseUomId = $scope.lookup.StoreItem[i].ItemMaster.BaseUomId;
                            item.GstId = $scope.lookup.StoreItem[i].ItemMaster.GstId;
                            item.GstPercentage = $scope.lookup.StoreItem[i].ItemMaster.GstMaster.GstPercentage;
                            item.PurConQty = $scope.lookup.StoreItem[i].ItemMaster.PurConQty;
                            item.PurchasePrice = $scope.lookup.StoreItem[i].ItemMaster.ItemPrice;
                            item.PurchaseUomId = $scope.lookup.StoreItem[i].ItemMaster.PurchaseUomId;
                            break;
                        }
                    }
                }
                if (data.MedicalORNonMedical) {
                    let faclen = $scope.lookup.StockRequestType.length;
                    for (var i = 0; i < faclen; i++) {
                        if (convertToLowerCase($scope.lookup.StockRequestType[i].Text) === convertToLowerCase(data.MedicalORNonMedical)) {
                            item.StockRequestTypeId = $scope.lookup.StockRequestType[i].Id;
                            break;
                        }
                    }
                }
                if (data.NormalOREmergency) {
                    let faclen = $scope.lookup.StockPriority.length;
                    for (var i = 0; i < faclen; i++) {
                        if (convertToLowerCase($scope.lookup.StockPriority[i].Text) === convertToLowerCase(data.NormalOREmergency)) {
                            item.StockPriorityId = $scope.lookup.StockPriority[i].Id;
                            break;
                        }
                    }
                }
                if (data.FromStoreCode) {
                    let faclen = $scope.lookup.FromStore.length;
                    for (var i = 0; i < faclen; i++) {
                        if (convertToLowerCase($scope.lookup.FromStore[i].StoreCode) === convertToLowerCase(data.FromStoreCode)) {
                            item.StoreMasterId = $scope.lookup.FromStore[i].Id;
                            item.StoreName = $scope.lookup.FromStore[i].StoreName;
                            item.ItemCategoryId = $scope.lookup.ToStore[i].StoreTypeId;
                            break;
                        }
                    }
                }
                if (data.ToStoreCode) {
                    let faclen = $scope.lookup.ToStore.length;
                    for (var i = 0; i < faclen; i++) {
                        if (convertToLowerCase($scope.lookup.ToStore[i].StoreCode) === convertToLowerCase(data.ToStoreCode)) {
                            item.ToStoreMasterId = $scope.lookup.ToStore[i].Id;
                            item.ToStoreName = $scope.lookup.ToStore[i].StoreName;
                            break;
                        }
                    }
                }
                
                // result.push(item);
                if (item.StoreMasterId !== -1 && item.ToStoreMasterId !== -1 && item.ItemMasterId !== -1) {
                    result.push(item);
                }
            }
            console.log('result');
            console.log(result);
            $scope.loading = true;
            var options = {
                action: 'pharmacy/stockrequest/AddExcelStockRequest',
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
                { "Key": "StoreItem" },
                { "Key": "UserStores" },
                { "Key": "FromStore" },
                { "Key": "ToStore" },
                { "Key": "StockRequestType" },
                { "Key": "StockPriority" },
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

    importStockIndentExcelController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$timeout', '$filter'];

})
();


