(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('equipmentFormController', equipmentFormController);

    function equipmentFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        var vm = this;
        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
        };
        // $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
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
                var inputData = { Id: $scope.item.Id, PhotoPath: $scope.item.PhotoPath };
                var options = {
                    action: 'AssetManagement/EquipmentList/GetAssetProfilePic',
                    data: { Data: inputData },
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
                    action: 'AssetManagement/EquipmentList/GetAssetById',
                    data: { Id: $scope.currentcontext.id },
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
            $state.go('app.labequipmentlist');
        }
        $scope.addNew = function () {
            $state.go('app.labequipmentform', { id: 0 });
        }



        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList(); // Safer side added
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'AssetManagement/EquipmentList/AddAsset';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/EquipmentList/UpdateAsset';
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
            }
            else {
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
            $state.go('app.labequipmentform', { id: patientdata.pid });
        }



        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var curdeptids = utl.Session.getUserDepartments();
            var inputData = [
                { "Key": "AssetId" },
                { "Key": "ActiveStatus" },
                {"Key": "Company" },
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

    equipmentFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();