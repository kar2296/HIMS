(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetFormController', assetFormController);

    function assetFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        var vm = this;
        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            EmployeeId: utl.Session.getCurrentUserId(),
        };
        $scope.currentcontext = {
            file: null,
            CurrentDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.ActionFrom = utl.Formatter.getCurrentDate();

        //getUserProfilePic
        $scope.getAssetProfilePicCallback = function (scope, data, options, hasError) {
            // console.log(data);
            $scope.currentcontext.Photo = data;
        };

        $scope.getAssetProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    Id: $scope.item.Id,
                    PhotoPath: $scope.item.PhotoPath
                };
                var options = {
                    action: 'AssetManagement/Asset/GetAssetProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getAssetProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.setinstalldate = function (item) {
            item.InstallDate = moment(item.InstalledOn);
            $scope.checkinstalldate(item);
        };
        $scope.checkinstalldate = function (item) {
            if (item.InstallDate > $scope.currentcontext.CurrentDate) {
                utl.Alert.showErrorMsg($translate.instant('Installation Date Should Be a Past Date'));
                $scope.item.InstalledOn = '';
            }
        };
        $scope.SetDateAcquired = function (item) {
            item.Dateacquired = moment(item.DateAcquired);
            $scope.checkacquireddate(item);
        };

        $scope.checkacquireddate = function (item) {
            if (item.Dateacquired > $scope.currentcontext.CurrentDate) {
                utl.Alert.showErrorMsg($translate.instant('Acquired Date Should be Past Date'));
                $scope.item.DateAcquired = '';
            }
        }

        $scope.findgrn = function () {
            utl.Modal.open('app.findgrn-list', {
                params: {
                    id: 0,
                    context: 'asset'
                },
                confirmCallback: $scope.grnData
            });
        }

        $scope.grnData = function (data) {
            var GrnDatas = data.grndata;
            $scope.item.GRNNum = GrnDatas.GrnNumber;
            $scope.item.PONum = GrnDatas.PoNumber;
            $scope.item.VendorId = GrnDatas.VendorMasterId;
            $scope.item.PO = GrnDatas.PoDate;
            $scope.item.GRN = GrnDatas.GrnDate;
            $scope.item.ContactPerson = GrnDatas.VendorMaster.ContactPerson;
            $scope.item.Contact = GrnDatas.VendorMaster.MobileNumber;
        }
        $scope.clearimage = function () {
            $scope.currentcontext.file = null;
            $scope.currentcontext.Photo = null;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
        }

        //getitem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.IsActive = true;
            if (data.ActiveStatusId == 2)
                $scope.item.isRequested = true;
            $scope.getAssetProfilePic();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'AssetManagement/Asset/GetAssetById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };

        $scope.backToList = function () {
            $state.go('app.assets');
        }
        $scope.addNew = function () {
            $state.go('app.assets', {
                id: 0
            });
        }

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                //  $state.go('app.usertab.general');
                $state.go('app.assettab.details', {
                    id: data,
                    IsProfile: null,
                    AssetId: options.data.Data.Id,
                    AssetName: options.data.Data.AssetName,
                    Department: options.data.Data.DepartmentName
                });
            } else {
                $scope.backToList(); // Safer side added
            }

        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'AssetManagement/Asset/AddAsset';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/Asset/UpdateAsset';
            }

            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;

                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function (resp) { //upload function returns a promise
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                    $scope.currentcontext.file = null;
                    $scope.backToList();
                },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: $scope.currentcontext.file
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        function patientPickerCallback(patientdata) {
            $state.go('app.assettab.details', {
                id: patientdata.pid
            });
        }

        $scope.findAsset = function () {
            utl.Modal.open('app.findasset-list', {
                params: {},
                confirmCallback: patientPickerCallback
            });
        }
        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };
        $scope.printAssetLabel = function () {
            var noofprint = 1;
            // try {
            //     if ($scope.NoofPrintMRDLabel && !isNaN($scope.NoofPrintMRDLabel))
            //         noofprint = parseInt($scope.NoofPrintMRDLabel);
            // } catch (ex) {
            //     noofprint = 1;
            // }
            try {
                var vModelNum = '';
                var vAssetName = '';
                try {

                    if ($scope.item && $scope.item.ModelNum)
                        vModelNum += ' ' + $scope.item.ModelNum;

                    if ($scope.item && $scope.item.AssetName)
                        vAssetName = $scope.item.AssetName;

                } catch (ex) { }

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
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
                code += 'A414,254,2,4,3,3,N,"' + vModelNum + '"' + printCodes.new_line;
                // code += 'A507,174,2,4,2,2,N,"' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                code += 'B437,116,2,1,4,12,66,B,"' + vAssetName + '"' + printCodes.new_line;
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) {
                console.log(ex);
            }
        };
        /* autosearch starts */
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Employee Name',
                field: 'UserName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Department',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        /* autosearch End */
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.numberwithDeconly = function (e) {
            if ((e.charCode >= 48 && e.charCode <= 57) || (e.charCode == 46)) {
                return;
            } else
                e.preventDefault();
        }
        $scope.AlphabetsOnly = function (e) {
            if ((e.charCode >= 65 && e.charCode <= 90) || (e.charCode >= 97 && e.charCode <= 122) || ((e.charCode == 32)) || (e.charCode == 46) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.qrcodeScanner = function (item) {
            utl.Modal.open('app.assetqrcodescanner', {
                params: {
                    id: item.Id,
                    assetname: item.AssetName,
                    Manufacturer: item.Manufacturer,
                    Memory: item.Memory,
                    ModelName: item.ModelName,
                    ModelNum: item.ModelNum,
                    AssetCode: item.AssetCode,
                    ShortCode: item.ShortCode,
                    Description: item.Description,
                    // AssetTypeDesc: item.AssetType.Description,
                },
                confirmCallback: patientPickerCallback
            });
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var curdeptids = utl.Session.getUserDepartments();
            var inputData = [{
                "Key": "AssetId"
            },
            {
                "Key": "AssetType"
            },
            {
                "Key": "AssetCategory"
            },
            {
                "Key": "VendorMaster",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 2
                    },
                        // {
                        //     Key: 17,
                        //     Value: curdeptids
                        // }, // Institution dept filter
                    ]
                }
            },
            {
                "Key": "Location"
            },
            {
                "Key": "DiscountMode"
            },
            {
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 5,
                        Value: 2
                    },
                        // {
                        //     Key: 17,
                        //     Value: curdeptids
                        // }, // Institution dept filter
                    ]
                }
            },
            {
                "Key": "User",
                Request: {
                    Params: [{
                        Key: 5,
                        Value: 2
                    }]
                }
            },
            {
                "Key": "VendorMaster"
            },
            {
                "Key": "ActiveStatus"
            },
            {
                "Key": "Company"
            }
            ]
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

    assetFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();