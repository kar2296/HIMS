
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('importInsuranceMasterExcelController', importInsuranceMasterExcelController);
        
    function importInsuranceMasterExcelController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
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
                action: 'generalmaster/guarantor/GetServiceRequestFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }
        $scope.download = function () {

            const JsonFields = ["Code", "GuarantorName", "GuarantorType", "ContractDate",
                "ContractExpiryDate", "CountryName", "FacilityCode", "Phone", "ServiceRateCategory", 
                "IsActive", "IsIPBedTariff", "CreditLimit"]

            let csvContent = JsonFields.join(",") + "\n";

            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            // hiddenElement.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Insurance Master Bulk Upload.csv';
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
                        var filteredData = dataObjects.filter(row =>
                            row.Code && row.GuarantorName
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
            function excelSerialToDate(serial) {
                const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Fix time zone issue
                return new Date(excelEpoch.getTime() + Math.floor(serial) * 86400000); // Remove fractional time
            }
            
            
            // Example
            const contractDate = excelSerialToDate(45736.00011574074);
            console.log(contractDate.toISOString().slice(0, 19).replace("T", " ")); 
            
            const convertToBoolean = (value) => {
                return value && value.toString().toLowerCase() === 'yes';
            };
            for (var idx in inputData) {
                var data = inputData[idx];
                var item = {
                    Code: data.Code,
                    GuarantorName: data.GuarantorName,
                    GuarantorTypeId: -1,
                    ContractDate: excelSerialToDate(data.ContractDate).toISOString().slice(0, 19).replace("T", " "),
                    ContractExpiryDate: excelSerialToDate(data.ContractExpiryDate).toISOString().slice(0, 19).replace("T", " "),
                    CountryId: -1,
                    FacilityId: -1,
                    Phone: data.Phone,
                    ServiceRateCategoryId: -1,
                    IsIPBedTariff: data.IsIPBedTariff,
                    CreditLimit: data.CreditLimit,
                    OrganizationId: utl.Session.getCurrentOrgId(),
                    IsActive: convertToBoolean(data.IsActive),
                    IsAllFacility: convertToBoolean(data.IsAllFacility),
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
                if (data.GuarantorType) {
                    let faclen = $scope.lookup.GuarantorType.length;
                    for (var i = 0; i < faclen; i++) {
                        if (convertToLowerCase($scope.lookup.GuarantorType[i].Text) === convertToLowerCase(data.GuarantorType)) {
                            item.GuarantorTypeId = $scope.lookup.GuarantorType[i].Id;
                            break;
                        }
                    }
                }
                if (data.ServiceRateCategory) {
                    let faclen = $scope.lookup.ServiceRateCategory.length;
                    for (var i = 0; i < faclen; i++) {
                        if (convertToLowerCase($scope.lookup.ServiceRateCategory[i].Text) === convertToLowerCase(data.ServiceRateCategory)) {
                            item.ServiceRateCategoryId = $scope.lookup.ServiceRateCategory[i].Id;
                            break;
                        }
                    }
                }
                if (data.Country) {
                    let faclen = $scope.lookup.Country.length;
                    for (var i = 0; i < faclen; i++) {
                        if (convertToLowerCase($scope.lookup.Country[i].Text) === convertToLowerCase(data.Country)) {
                            item.CountryId = $scope.lookup.Country[i].Id;
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
                action: 'generalmaster/guarantor/AddGuarantorMasterExcel',
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
                { "Key": "GuarantorType" },
                { "Key": "ServiceRateCategory" },
                { "Key": "Country" }
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

    importInsuranceMasterExcelController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$timeout', '$filter'];

})
();


