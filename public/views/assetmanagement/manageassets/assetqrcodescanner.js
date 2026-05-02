(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssetQrcodeScannerController', AssetQrcodeScannerController);

    function AssetQrcodeScannerController($http,$scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        console.log($scope.$stateParams.id, '***********************');
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({
            $scope: $scope
        }));
        $scope.qrurl = window.QR_CODE_URL;
        $scope.Items = [];
        $scope.currentfilter = {
            AssetTypeId: -1,
            AssetCategoryId: -1,
            ActiveStatusId: 2,
            DepartmentId: -1,
            EmployeeId: utl.Session.getCurrentUserId(),
        };
        $scope.$stateParams = {};
        $scope.$stateParams.id = parseInt($stateParams.id);
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.assetid = parseInt(modalConfig.params.id);
            $scope.currentcontext.assetname = String(modalConfig.params.assetname);
            $scope.currentcontext.Manufacturer = String(modalConfig.params.Manufacturer);
            $scope.currentcontext.Memory = String(modalConfig.params.Memory);
            $scope.currentcontext.ModelName = String(modalConfig.params.ModelName);
            $scope.currentcontext.ModelNums = String(modalConfig.params.ModelNums);
            $scope.currentcontext.groupId = parseInt(modalConfig.params.groupId);
            $scope.currentcontext.url = String(modalConfig.params.url);
            $scope.currentcontext.groupCode = modalConfig.params.groupCode;
            $scope.currentcontext.ShortCode = parseInt(modalConfig.params.ShortCode);
            $scope.currentcontext.Description = modalConfig.params.Description;
            $scope.currentcontext.AssetType = modalConfig.params.AssetType;

            // ShortCode:item.ShortCode,
            // Description:item.Description,
            // AssetType:item.AssetType.Description,

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        // $scope.currentcontext.assetid = parseInt($stateParams.id);

        $scope.Asset_dashboard = function () {
            $state.go('app.newassetdashboard')
        };
        selfUserLogin();

        function selfUserLogin() {
            var options = {
                action: 'auth/getClientToken',
                data: {
                    userName: 'selfuser',
                    password: 'pwd',
                    userList: $scope.userData
                },
                type: 'post',
                onComplete: (scope, data) => {
                    //console.log('jjjjjj', data);
                    var clientToken = data.token;
                    localStorage.setItem('token', clientToken)
                    $http.defaults.headers.post.Authorization = `bearer ${localStorage.getItem('token')}`;
                    $scope.getList();
                }
            };
            utl.Http.doAction(options);
        }


        // $scope.currentcontext = {
        //     ismodal: modalConfig && modalConfig.params ? true : false
        // };
        // $scope.currentcontext.id = parseInt(modalConfig.params.id);

        // $scope.confirmCallback = $uibModalInstance.close;
        // $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.warrentyitem = {};
        $scope.insuranceitem = {};
       

        $scope.getListCallback = function ($scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.getInsuranceList();
            $scope.getWarrentyList();
        };

        $scope.getList = function () {
            if ($scope.currentcontext.assetid) {
                var inputData = {
                    Params: [
                        {
                            Key: 0,
                            Value: $scope.currentcontext.assetid
                        },
                    ],
                };

                var options = {
                    action: 'AssetManagement/Asset/GetAssets',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };
        $scope.getWarrentyListCallback = function (scope, res, options, hasError) {
            $scope.warrentyitem = res.Data[0];
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getWarrentyList = function () {
            var inputData = {
                Params: [
                    {
                        Key: 5,
                        Value: $scope.currentcontext.assetid
                    },
                ],
            };
            var options = {
                action: 'AssetManagement/Assetwarranty/GetAssetWarranties',
                data: inputData,
                type: 'post',
                onComplete: $scope.getWarrentyListCallback
            };

            utl.Http.doAction(options);

        };

        $scope.getInsuranceListCallback = function (scope, res, options, hasError) {
            $scope.insuranceitem = res.Data[0];
        };

        $scope.getInsurancesList = function () {
            var inputData = {

                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentcontext.assetid
                    },
                ],

            };

            var options = {
                action: 'AssetManagement/AssetInsurance/GetAssetInsurances',
                data: inputData,
                type: 'post',
                onComplete: $scope.getInsuranceListCallback
            };

            utl.Http.doAction(options);

        };
        // $scope.qrcodeScanner = function (item) {
        //     $state.go('page.qrcodescanner', { assetid: item.Id },{assetname: item.AssetName});
        // }
        // $scope.qrcodeScanner = function (item) {
        //     var inputData = {
        //         Id: $scope.item.Id,
        //         // Data: {
        //         //     EncounterId: $scope.item.EncounterId
        //         //     }
        //     };
        //     var options = {
        //         action: 'AssetManagement/Asset/PrintAsset',
        //         data: inputData,
        //         type: 'post'
        //     };
        //     utl.Http.doDownload(options);
        // }
        $scope.qrcodeScanner = function () {
           
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.assetid },
                   
                ],
            };
            var options = {
                action: 'AssetManagement/Asset/PrintAssetQrcode',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);

        };
        // $scope.backToList = function () {
        //     $state.go('app.assettab.details');
        // }
        $scope.backToList = function () {
            $scope.confirmCallback();
            // $state.go('app.referencevaluegrouptab.referencevalues');
        }
        $scope.printQRcode = function () {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintPatientLabel && !isNaN($scope.NoofPrintPatientLabel))
                    noofprint = parseInt($scope.NoofPrintPatientLabel);
            } catch (ex) { noofprint = 1; }
        
                var vModelNum = '';
                var vAssetName = '';
                var vDepartmentName = ''; 
                var vAssetType = '';
                var vFacilityName = '';
                var vAccetInformation = '';
                var vManufacture = '';
                var vMemory = '';
                var vAssetCode = '';
                var vDescription = '';
                var vAssetTypeDesc = '';


                   // ShortCode:item.ShortCode,
            // Description:item.Description,
            // AssetType:item.AssetType.Description,
               
                try {

                if ($scope.currentcontext && $scope.currentcontext.ModelNums)
                    vModelNum += ' ' + $scope.currentcontext.ModelNums;
                if ($scope.currentcontext && $scope.currentcontext.assetname)
                    vAssetName = $scope.currentcontext.assetname;
                if ($scope.currentcontext && $scope.currentcontext.assetid)
                    vAssetType = $scope.currentcontext.assetid;
                    if ($scope.currentcontext && $scope.currentcontext.Memory)
                    vMemory = $scope.currentcontext.Memory;  
                    if ($scope.currentcontext && $scope.currentcontext.Manufacturer)
                    vManufacture = $scope.currentcontext.Manufacturer;   
                    if ($scope.currentcontext && $scope.currentcontext.AssetCode)
                    vAssetCode = $scope.currentcontext.AssetCode;  
                    if ($scope.currentcontext && $scope.currentcontext.Description )
                    vDescription  = $scope.currentcontext.Description;    
                    if ($scope.currentcontext && $scope.currentcontext.AssetTypeDesc )
                    vAssetTypeDesc  = $scope.currentcontext.AssetTypeDesc;       
              
                // vAccetInformation = 'AssetId:'+vAssetType+','
                // +'Manufacture:'+ vManufacture +',' 
                // +'AssetName:'+ vAssetName+','
                // +'Memory:'+vMemory+',' 
                // +'ModelNum:'+vModelNum+',' ; 
              
               // vAccetInformation ='AssetId:'+ vAssetType+'\n'+'Manufacturedate:' +vManufacture +'\n' +'Assetname:'+ vAssetName + '\n'+'Memort:'+vMemory;  
                // +'AssetCode:'+vAssetCode+','
                // +'Description:'+vDescription+','
                // +'AssetTypeDesc:'+vAssetTypeDesc+',';

                // vAccetInformation = 'AssetId:'+vAssetType+'\n'
                // +'Manufacture:'+ vManufacture +'\n' 
                // +'AssetName:'+ vAssetName+'\n'
                // +'Memory:'+vMemory+'\n' 
                // +'ModelNum:'+vModelNum+'\n'  
                // +'AssetCode:'+vAssetCode+'\n'
                // +'Description:'+vDescription+'\n'
                // +'AssetTypeDesc:'+vAssetTypeDesc+'\n';
                const url = window.appPath.apiroot;
                vAccetInformation = `http:${url}#/page/qrcodescanner/`+$scope.currentcontext.assetid;
                console.log(vAccetInformation,'vAccetInformation');

                } catch (ex) { }

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                if (window.clientcode.toLowerCase() == 'prakriya') {
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q406,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S3' + printCodes.new_line;
                code += 'D7' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R111,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'A582,255,2,4,1,1,N,"' + 'OP#' + '"' + printCodes.new_line;
                code += 'A492,255,2,4,1,1,N,"' + '  :' + ' ' + vModelNum + '"' + printCodes.new_line;
                code += 'A582,225,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                code += 'A492,225,2,4,1,1,N,"' + ':' + ' ' + vAssetName + '"' + printCodes.new_line;
                code += 'A582,195,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                code += 'A479,195,2,4,1,1,N,"' + ' :' + ' ' + vDepartmentName + '"' + printCodes.new_line;
                code += 'A583,165,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                code += 'A456,165,2,4,1,1,N,"' + ':' + ' ' + vFacilityName + '"' + printCodes.new_line;
                // code += 'A581,135,2,4,1,1,N,"' + 'Phone#' + '"' + printCodes.new_line;
                // code += 'A468,135,2,4,1,1,N,"' + ' :' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                // code += 'A225,105,2,4,1,1,N,"' + 'Gender' + '"' + printCodes.new_line;
                // code += 'A128,105,2,4,1,1,N,"' + ':' + ' ' + vGender + '"' + printCodes.new_line;
                // code += 'A580,75,2,4,1,1,N,"' + 'Doctor' + '"' + printCodes.new_line;
                // code += 'A453,75,2,4,1,1,N,"' + ':' + ' ' + vDoctor + '"' + printCodes.new_line;
                // code += 'A580,40,2,4,1,1,N,"' + 'DOB' + '"' + printCodes.new_line;
                // code += 'A453,40,2,4,1,1,N,"' + ':' + ' ' + vDOB + '"' + printCodes.new_line;
                // code += 'B415,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
            } else {
                
                code += 'SIZE 50.1 mm, 25 mm'+ printCodes.new_line;
                code += 'DIRECTION 0,0'+ printCodes.new_line;
                code += 'REFERENCE 0,0'+ printCodes.new_line;
                code += 'OFFSET 0 mm'+ printCodes.new_line;
                code += 'SET PEEL OFF'+ printCodes.new_line;
                code += 'SET CUTTER OFF'+ printCodes.new_line;
                code += 'SET PARTIAL_CUTTER OFF'+ printCodes.new_line;
                code += 'SET TEAR ON'+ printCodes.new_line;
                code += 'CLS'+ printCodes.new_line;
                code += 'QRCODE 263,189,L,6,A,180,M2,S7,"'+ vAccetInformation+' "'+ printCodes.new_line;
                code += 'CODEPAGE 1252'+ printCodes.new_line;
               // code += 'TEXT 268,46,"ROMAN.TTF",180,1,12,"12345678"'+ printCodes.new_line;
               // code += 'TEXT 268,46,"ROMAN.TTF",180,1,12,"'+ vAssetType+'"' +  printCodes.new_line;
                code += 'PRINT 1,1'+ printCodes.new_line;
                //code += 'PRINT 1,1' + printCodes.new_line;
               // code += noofprint > 1 ? 'PRINT 1,' + noofprint + printCodes.new_line : 'PRINT 1,1' + printCodes.new_line;
            }
             // code += 'P5' + printCodes.new_line;
            
             printData.push(code);
             $scope.printRaw(printData);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
            selfUserLogin();
        }

        $scope.initLookup = function () {
            // var curdeptids = utl.Session.getUserDepartments();
            var inputData = [];

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

    AssetQrcodeScannerController.$inject = ['$http','$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();