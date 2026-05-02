
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('importPOExcelController', importPOExcelController);

    function importPOExcelController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
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

        $scope.download = function () {

            const commonHeaders = ["SupplierName", "StoreName"];
            const commonData = ["", ""];

            const jsonFields = ["S.No", "ItemName", "ItemCode", "POQty", "FreeQty", "DiscountMode1", "Discount1", "DiscountMode2", "Discount2", "PrPriceUom", "MRPUom"];

            let csvContent = "";

            csvContent += commonHeaders.join(",") + "\n";

            csvContent += commonData.join(",") + "\n";

            csvContent += "\n";

            csvContent += jsonFields.join(",") + "\n";

            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Purchase Order Upload.csv';
            hiddenElement.click();
        };


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
            console.log("button clicked", file);

            if (!file) {
                alert("No File Selected! Please Select an Excel file.");
                return;
            }

            var reader = new FileReader();

            reader.onload = function (e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, { type: 'binary' });

                var firstSheetName = workbook.SheetNames[0];
                var sheet = workbook.Sheets[firstSheetName];
                var dataObjects = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                console.log("Parsed Excel Data:", dataObjects);

                if (dataObjects.length < 4) {
                    alert("No Data Found. Please check the Excel file.");
                    return;
                }

                let supplierName = dataObjects[1]?.[0] || ""; // Row 2, Column A
                let storeName = dataObjects[1]?.[1] || ""; // Row 2, Column B

                var filteredData = dataObjects.slice(4) // Skip empty row and headers
                    .map(row => ({
                        ItemName: row[1]?.trim() || "",
                        ItemCode: row[2] || "",
                        POQty: row[3] || "",
                        FreeQty: row[4] || "",
                        DiscountMode1: row[5] || "",
                        Discount1: row[6] || "",
                        DiscountMode2: row[7] || "",
                        Discount2: row[8] || "",
                        PrPriceUom: row[9] || "",
                        MRPUom: row[10] || ""
                    }))
                    .filter(row => row.ItemCode);

                console.log("Filtered Data:", filteredData);

                if (filteredData.length > 0) {
                    $scope.save([{ SupplierName: supplierName, StoreName: storeName, Items: filteredData }]);
                } else {
                    alert("No valid data found. Please check the Excel file.");
                }
            };

            reader.onerror = function (ex) {
                alert("Error reading file. Please check the file format.");
            };

            reader.readAsBinaryString(file);
        };


        $scope.save = function (inputData) {
            console.log(inputData);
        
            let result = [];
            let supplierName = inputData[0]?.SupplierName || "";
            let storeName = inputData[0]?.StoreName || "";
            let storeId = -1;
            let SupplierId = -1;
            let IsOpenPO = false;
        
            const convertToLowerCase = (value) => (value ? value.toString().trim().toLowerCase() : '');
        
            if (storeName && $scope.lookup?.UserStores) {
                const store = $scope.lookup.UserStores.find(s => convertToLowerCase(s.Text) === convertToLowerCase(storeName));
                if (store) {
                    storeId = store.Id;
                    IsOpenPO = store.StoreMaster.CanAllowOpenPO;
                }
            }
            if (supplierName && $scope.vendorData) {
                const supplier = $scope.vendorData.find(v => convertToLowerCase(v.VendorName) === convertToLowerCase(supplierName));
                if (supplier) SupplierId = supplier.Id;
            }
            inputData.forEach(data => {
                data.Items.forEach(itemData => {
                    let DiscountModeId1 = -1;
                    if (itemData.DiscountMode1) {
                        let discountMode = convertToLowerCase(itemData.DiscountMode1);
                        if (discountMode === 'percentage') {
                            discountMode = '%';
                        }
                        const discountModeObj = $scope.lookup?.DiscountMode?.find(d => convertToLowerCase(d.Text) === discountMode);
                        if (discountModeObj) {
                            DiscountModeId1 = discountModeObj.Id;
                        }
                    }
                    let DiscountModeId2 = -1;
                    if (itemData.DiscountMode2) {
                        let discountMode = convertToLowerCase(itemData.DiscountMode2);
                        if (discountMode === 'percentage') {
                            discountMode = '%';
                        }
                        const discountModeObj = $scope.lookup?.DiscountMode?.find(d => convertToLowerCase(d.Text) === discountMode);
                        if (discountModeObj) {
                            DiscountModeId2 = discountModeObj.Id;
                        }
                    }
                    result.push({
                        // ApprovedBy: utl.Session.getCurrentUserId(),
                        // RequestedBy: utl.Session.getCurrentUserId(),
                        ItemName: itemData.ItemName,
                        ItemCode: itemData.ItemCode,
                        PoQuantity: itemData.POQty,
                        FreeQty: itemData.FreeQty,
                        PrPriceUom: itemData.PrPriceUom,
                        MRPUom: itemData.MRPUom,
                        DiscountModeId1: DiscountModeId1,
                        Discount1: itemData.Discount1,
                        DiscountModeId2: DiscountModeId2,
                        Discount2: itemData.Discount2
                    });
                });
            });
        
            let finalResult = {
                SupplierName: supplierName,
                StoreName: storeName,
                StoreId: storeId,
                SupplierId: SupplierId,
                IsOpenPO: IsOpenPO,
                Items: result
            };
        
            console.log('Final Result:', finalResult);
            $scope.loading = true;
            $scope.confirmCallback({ result: finalResult });
        };
        
        $scope.getlistCallback = function (scope, data, options, hasError) {
            $scope.vendorData = hasError ? {} : data.Data;
        }

        $scope.getList = function () {
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: 1
                    },
                    {
                        Key: 4,
                        Value: 2
                    },
                    {
                        Key: 12,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'pharmacy/vendorfacilitymap/GetVendorFacilityMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getlistCallback
            };
            utl.Http.doAction(options);
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            console.log('lookup');
            console.log(data);
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
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
                { "Key": "DiscountMode" },
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

    importPOExcelController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$timeout', '$filter'];

})
    ();


