
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('importTestMasterExcelController', importTestMasterExcelController);
        
    function importTestMasterExcelController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
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
                action: 'lis/testmaster/GetServiceRequestFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }
        $scope.download = function () {

            const JsonFields = ["Code", "Mnemonics", "Name", "Sampletype",
                "Methodology", "TestMasterType", "Department", "SubDepartment", "IsLabSync", "IsActive"]

            let csvContent = JsonFields.join(",") + "\n";

            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            // hiddenElement.href = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Test Master Bulk Upload.csv';
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
                            row.Code && row.Name
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
                    ActionFrom: utl.Formatter.getCurrentDate(),
                    ActiveFrom: utl.Formatter.getCurrentDate(),
                    ActiveStatusId: 1,
                    Code: data.Code,
                    DepartmentId: -1,
                    SubDepartmentId: -1,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    Name: data.Name,
                    Description: data.Name,
                    Mnemonics: data.Mnemonics,
                    SampletypeId: -1,
                    TESTMASTERTYPId: -1,
                    Methodology: data.Methodology,
                    OrganizationId: utl.Session.getCurrentOrgId(),
                    IsLabSync: data.IsLabSync,
                    ScheduleALL: true,
                    ScheduleFR: true,
                    ScheduleMO: true,
                    ScheduleSA: true,
                    ScheduleSU: true,
                    ScheduleTH: true,
                    ScheduleTU: true,
                    ScheduleWE: true,
                    IsActive: convertToBoolean(data.IsActive),
                    IsExcelUpload: true
                };
                // Strings converted to IDs
                const convertToLowerCase = function(value) {
                    if (value) {
                        return value.toString().toLowerCase();
                    }
                    return '';
                };
                if (data.Department) {
                    let deptlen = $scope.lookup.Department.length;
                    for (var i = 0; i < deptlen; i++) {
                        if (convertToLowerCase($scope.lookup.Department[i].Text) === convertToLowerCase(data.Department)) {
                            item.DepartmentId = $scope.lookup.Department[i].Id;
                            break;
                        }
                    }
                }
                if (data.SubDepartment) {
                    let sublen = $scope.lookup.SubDepartment.length;
                    for (var i = 0; i < sublen; i++) {
                        if (convertToLowerCase($scope.lookup.SubDepartment[i].Text) === convertToLowerCase(data.SubDepartment)) {
                            item.SubDepartmentId = $scope.lookup.SubDepartment[i].Id;
                            break;
                        }
                    }
                }
                if (data.Sampletype) {
                    let sublen = $scope.lookup.SampleMaster.length;
                    for (var i = 0; i < sublen; i++) {
                        if (convertToLowerCase($scope.lookup.SampleMaster[i].Text) === convertToLowerCase(data.Sampletype)) {
                            item.SampletypeId = $scope.lookup.SampleMaster[i].Id;
                            break;
                        }
                    }
                }
                if (data.TestMasterType) {
                    let sublen = $scope.lookup.TESTMASTERTYP.length;
                    for (var i = 0; i < sublen; i++) {
                        if (convertToLowerCase($scope.lookup.TESTMASTERTYP[i].Text) === convertToLowerCase(data.TestMasterType)) {
                            item.TESTMASTERTYPId = $scope.lookup.TESTMASTERTYP[i].Id;
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
                action: 'lis/testmaster/AddTestmasterExcel',
                data: {
                    Data: result
                },
                type: 'post',
                onComplete: $scope.importCallback //saveItemCallback
            };
            utl.Http.doAction(options);
        }

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
                { "Key": "Department" },
                { "Key": "SubDepartment" },
                {
                    "Key": "SampleMaster",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }]
                    }
                },
                { "Key": "TESTMASTERTYP" },
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

    importTestMasterExcelController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$timeout', '$filter'];

})
();


