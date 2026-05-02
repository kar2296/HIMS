
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('importServiceTariffMasterExcelController', importServiceTariffMasterExcelController);
        
    function importServiceTariffMasterExcelController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
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

            const JsonFields = ["ServiceRateCategory", "Description", "EncounterType", "IsAllFacility", "ActiveStatusId"]

            let csvContent = JsonFields.join(",") + "\n";

            // csvContent += "Mr,Ramu,K,,1996-07-23,Married,HR,Male,977305345,,aah@gmail.com,Karthi,Amsa,432254674324,aaaa,bbbb,India,E1234,MR023000060100,609605";

            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            // hiddenElement.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Service_Tariff_Master_Upload.csv';
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
                            row.ServiceRateCategory && row.Description
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
                    ServiceRateCategory: data.ServiceRateCategory,
                    Description: data.Description,
                    FacilityId:utl.Session.getCurrentFacilityId(),
                    IsAllFacility: data.IsAllFacility,
                    EncounterTypeId: -1,
                    ActiveStatusId: data.ActiveStatusId,
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
                if (data.EncounterType) {
                    let catlen = $scope.lookup.EncounterType.length;
                    for (var i = 0; i < catlen; i++) {
                        if (convertToLowerCase($scope.lookup.EncounterType[i].Text) === convertToLowerCase(data.EncounterType)) {
                            item.EncounterTypeId = $scope.lookup.EncounterType[i].Id;
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
                action: 'clinicalmaster/ServiceRateCategory/AddServiceRateCategoryExcel',
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
                { "Key": "EncounterType" },
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

    importServiceTariffMasterExcelController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$timeout', '$filter'];

})
();


