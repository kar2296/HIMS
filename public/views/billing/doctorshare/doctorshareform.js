(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorShareFormController', doctorShareFormController);

    function doctorShareFormController($scope, $filter, $stateParams, $state, $translate, utl, uibButtonConfig) {
        var vm = this;
        uibButtonConfig.activeClass = "btn-primary";

        $scope.CategoryItems = [];
        $scope.ItemDetails = [];
        $scope.RangeDetails = [];

        $scope.DoctorShareClass = 0;

        $scope.currentcontext = {
            SelectedOption: 1
        };
        $scope.currentcontext.id = 0;
        if ($stateParams.id) {
            try {
                $scope.currentcontext.id = parseInt($stateParams.id);
            } catch (ex) { $scope.currentcontext.id = 0; }
        }


        $scope.currentfilter = {

            DoctorClassId: -1,
            DoctorClassName: '',
            EncounterTypeId: 1,
            EncounterTypeName: '',
            ShareTypeId: -1,
            ShareTypeName: '',
            ActiveFrom: new Date(),
            ActiveTo: new Date(),
            ServiceCategoryId: -1,
            EligiblePercentage: 100,
            SharePercentage: 0,

            ShareAmount: 0,
            ServiceId: -1,
            SelectedServiceItem: {},

            RangeDescription: '',
            MinRange: 0,
            MaxRange: 0,
            SharePerRange: 0,

        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                DoctorShareClass: $scope.DoctorShareClass,
                currentcontext: $scope.currentcontext,
                CategoryItems: $scope.CategoryItems,
                ItemDetails: $scope.ItemDetails,
                RangeDetails: $scope.RangeDetails
            };
        };

        $scope.addDoctorShare = function () {
            var Msg = '';
            if ($scope.currentfilter.DoctorClassId <= 0) {
                Msg = 'Select the Doctor Class';
            } else if ($scope.currentfilter.EncounterTypeId <= 0) {
                Msg = 'Select the Encounter Type';
            } else if ($scope.currentfilter.ShareTypeId <= 0) {
                Msg = 'Select the Fee Type';
            } else if (!$scope.currentfilter.ActiveFrom) {
                Msg = 'Select the Active From date';
            } else if (!$scope.currentfilter.ActiveTo) {
                Msg = 'Select the Active To date';
            }
            if (Msg) {
                utl.Alert.showErrorMsg($translate.instant(Msg));
                return;
            }
            $scope.DoctorShareClass = 1;
            $scope.currentfilter.DoctorClassName =
                utl.Lookup.getDesc($scope.lookup.DoctorClass, $scope.currentfilter.DoctorClassId);
            $scope.currentfilter.EncounterTypeName =
                utl.Lookup.getDesc($scope.lookup.EncounterType, $scope.currentfilter.EncounterTypeId);
            $scope.currentfilter.ShareTypeName =
                utl.Lookup.getDesc($scope.lookup.ShareType, $scope.currentfilter.ShareTypeId);
            $scope.refreshReactProps();
        }

        $scope.clearDoctorShare = function () {
            $scope.DoctorShareClass = 0;
            $scope.currentfilter = {
                DoctorClassId: -1,
                DoctorClassName: '',
                EncounterTypeId: 1,
                EncounterTypeName: '',
                ShareTypeId: -1,
                ShareTypeName: '',
                ActiveFrom: new Date(),
                ActiveTo: new Date(),
                ServiceCategoryId: -1,
                EligiblePercentage: 100,
                SharePercentage: 0,

                ShareAmount: 0,
                ServiceId: -1,
                SelectedServiceItem: {},

            };
            $scope.CategoryItems = [];
            $scope.ItemDetails = [];
            $scope.RangeDetails = [];
            $scope.refreshReactProps();
        }

        // Category wise changes

        $scope.categroySelection = function () {
            $scope.currentcontext.SelectedOption = 1;
            $scope.refreshReactProps();
        };

        $scope.addCategory = function () {
            var index = -1;
            for (var idx in $scope.CategoryItems) {
                var item = $scope.CategoryItems[idx];
                if (item.ServiceCategoryId == $scope.currentfilter.ServiceCategoryId) {
                    index = idx;
                    break;
                }
            }
            var Msg = '';
            if ($scope.currentfilter.ServiceCategoryId <= 0) {
                Msg = 'Select Service Category';
            }
            if ($scope.currentfilter.SharePercentage <= 0) {
                Msg = 'Share Percentage should not less than or equal to zero';
            } else if ($scope.currentfilter.EligiblePercentage < $scope.currentfilter.SharePercentage) {
                Msg = 'Eligible Percentage should not less than or equal to Share Percentage';
            }
            if (Msg) {
                utl.Alert.showErrorMsg($translate.instant(Msg));
                return;
            }
            if (index < 0) { // Insert
                var items = {
                    Id: 0,
                    ServiceCategoryId: $scope.currentfilter.ServiceCategoryId,
                    Name: utl.Lookup.getDesc($scope.lookup.ServiceCategory, $scope.currentfilter.ServiceCategoryId),
                    EligiblePer: $scope.currentfilter.EligiblePercentage,
                    SharePer: $scope.currentfilter.SharePercentage,
                    Status: 1
                };
                $scope.CategoryItems.push(items);
            } else { // Update
                $scope.CategoryItems[index].ServiceCategoryId = $scope.currentfilter.ServiceCategoryId;
                $scope.CategoryItems[index].Name = utl.Lookup.getDesc($scope.lookup.ServiceCategory, $scope.currentfilter.ServiceCategoryId);
                $scope.CategoryItems[index].EligiblePer = $scope.currentfilter.EligiblePercentage;
                $scope.CategoryItems[index].SharePer = $scope.currentfilter.SharePercentage;
                $scope.CategoryItems[index].Status = 1;
            }
            $scope.currentfilter.ServiceCategoryId = -1;
            $scope.currentfilter.EligiblePercentage = 100;
            $scope.currentfilter.SharePercentage = 0;
            $scope.refreshReactProps();
        }

        $scope.editCategoryReqst = function (index, catitms) {
            $scope.currentfilter.ServiceCategoryId = catitms.ServiceCategoryId;
            $scope.currentfilter.EligiblePercentage = catitms.EligiblePer;
            $scope.currentfilter.SharePercentage = catitms.SharePer;
            $scope.refreshReactProps();
        }

        $scope.deleteCategoryReqst = function (index, catitms) {
            catitms.Status = 2;
            $scope.refreshReactProps();
        }
        $scope.saveCategoryShare = function () {
            var Msg = '';
            if ($scope.currentfilter.DoctorClassId <= 0) {
                Msg = 'Select the Doctor Class';
            } else if ($scope.currentfilter.EncounterTypeId <= 0) {
                Msg = 'Select the Encounter Type';
            } else if ($scope.currentfilter.ShareTypeId <= 0) {
                Msg = 'Select the Fee Type';
            } else if (!$scope.currentfilter.ActiveFrom) {
                Msg = 'Select the Active From date';
            } else if (!$scope.currentfilter.ActiveTo) {
                Msg = 'Select the Active To date';
            }
            var lineitempresent = 0;
            for (var idcx in $scope.CategoryItems) {
                var catitem = $scope.CategoryItems[idcx];
                if (catitem.Status == 1) {
                    lineitempresent++;
                    if (catitem.SharePer <= 0) {
                        Msg = 'Share Percentage should not less than or equal to zero';
                        break;
                    } else if (catitem.EligiblePer < catitem.SharePer) {
                        Msg = 'Eligible Percentage should not less than or equal to Share Percentage';
                        break;
                    }

                    try {
                        var perct = parseFloat(catitem.EligiblePer);
                        if (perct > 100) {
                            Msg = 'Eligible Percentage should not greater than 100';
                        }
                    } catch (ex) {  Msg = 'Invalide Eligible Percentage'; }


                    try {
                        var perct = parseFloat(catitem.SharePer);
                        if (perct > 100) {
                            Msg = 'Share Percentage should not greater than 100';
                        }
                    } catch (ex) {  Msg = 'Invalide Share Percentage'; }

                }
            }
            if (lineitempresent == 0) {
                Msg = 'Add Category Detail information';
            }
            if (Msg) {
                utl.Alert.showErrorMsg($translate.instant(Msg));
                return;
            }
            var header = $scope.getCategoryHeaderItems();
            var lines = $scope.getCategoryLineItems();
            var inputData = { Header: header, Details: lines };

            var actionName = 'billing/doctorshare/AddDoctorShare';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0)
                actionName = 'billing/doctorshare/UpdateDoctorShare';

            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getCategoryHeaderItems = function () {
            var header = {
                Id: $scope.currentcontext.id,
                OrgId: utl.Session.getCurrentOrgId(),
                FacilityId: utl.Session.getCurrentFacilityId(),
                DoctorClassId: $scope.currentfilter.DoctorClassId,
                ShareTypeId: $scope.currentfilter.ShareTypeId,
                ActiveFrom: $scope.currentfilter.ActiveFrom,
                ActiveTo: $scope.currentfilter.ActiveTo,
                EncounterTypeId: $scope.currentfilter.EncounterTypeId,
                ActiveStatusId: 2,
                Status: 1,
            };
            return header;
        }
        $scope.getCategoryLineItems = function () {
            var lines = [];
            for (var idcx in $scope.CategoryItems) {
                var cateItem = $scope.CategoryItems[idcx];

                if (cateItem.Status != 1 && !cateItem.Id)
                    continue;

                var lineitem = {
                    Id: cateItem.Id,
                    DoctorShareId: null,
                    OrgId: utl.Session.getCurrentOrgId(),
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    SharingTypeId: 1, // Category wise
                    ServiceCategoryId: cateItem.ServiceCategoryId,
                    ServiceId: null,
                    ServiceName: null,
                    EncounterTypeId: $scope.currentfilter.EncounterTypeId,
                    ShareTypeId: $scope.currentfilter.ShareTypeId,
                    EligiblePercentage: cateItem.EligiblePer,
                    SharePercentage: cateItem.SharePer,
                    ShareAmount: 0,
                    MinAmount: 0,
                    MaxAmount: 0,
                    ActiveFrom: $scope.currentfilter.ActiveFrom,
                    ActiveTo: $scope.currentfilter.ActiveTo,
                    ActiveStatusId: 2,
                    Status: cateItem.Status,
                };
                lines.push(lineitem);
            }

            return lines;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if (!$scope.currentcontext.id && typeof (data) == 'number') {
                $scope.currentcontext.id = data;
            }
            $scope.getItem();
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.itemWiseSelection = function () {
            $scope.currentcontext.SelectedOption = 2;
            $scope.refreshReactProps();
        };

        $scope.payoutRangeSelection = function () {
            $scope.currentcontext.SelectedOption = 3;
            $scope.refreshReactProps();
        };

        // item wise changes

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Service Code', field: 'ServiceCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Service Name', field: 'ServiceName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                // { header: 'ServiceItem Rate', field: 'ServiceItemRate', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' },
                // { header: 'Night Tariff %', field: 'NightTariffAmt', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' },
                // { header: 'Holiday Tariff %', field: 'HolidayTariffAmt', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };
        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }
        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 4, Value: 2 },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            inputData.Params.push({ Key: 8, Value: utl.Session.getCurrentFacilityId() });
            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }
            vm.serviceitemcontrolconfig.searchparams = inputData;
        }
        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, { ServiceRateCategoryId: $scope.currentfilter.ServiceRateCategoryId }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                    item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                }
                var selectedGuarantor = utl.Lookup.getObject($scope.lookup.PatientGuarantor, $scope.currentfilter.GuarantorId);
                if (selectedGuarantor && selectedGuarantor.GuarantorId) {
                    var ServiceItemAliasobj = $filter('filter')(item.ServiceItemAliases, { ExternalProviderId: selectedGuarantor.GuarantorId }, true);
                    if (ServiceItemAliasobj != null && ServiceItemAliasobj.length > 0) {
                        item.AliasId = ServiceItemAliasobj[0].AliasId;
                        item.AliasName = ServiceItemAliasobj[0].AliasName;
                    }
                }
            }
        }

        $scope.ServiceItemChanged = function () {
            // console.log($scope.currentfilter.SelectedServiceItem);
        }

        $scope.addItemDetails = function () {
            var index = -1;
            for (var idx in $scope.ItemDetails) {
                var item = $scope.ItemDetails[idx];
                if (item.ServiceId == $scope.currentfilter.ServiceId) {
                    index = idx;
                    break;
                }
            }

            var Msg = '';
            if ($scope.currentfilter.ServiceId <= 0) {
                Msg = 'Select Service Category';
            }
            if ($scope.currentfilter.SharePercentage <= 0 && $scope.currentfilter.ShareAmount <= 0) {
                Msg = 'Share Percentage / Share Amount should not less than or equal to zero';
            } else if ($scope.currentfilter.EligiblePercentage < $scope.currentfilter.SharePercentage) {
                Msg = 'Eligible Percentage should not less than or equal to Share Percentage';
            }
            if (Msg) {
                utl.Alert.showErrorMsg($translate.instant(Msg));
                return;
            }
            var servicename = '';
            var serviceid = -1;
            if ($scope.currentfilter.SelectedServiceItem &&
                $scope.currentfilter.SelectedServiceItem.Description)
                servicename = $scope.currentfilter.SelectedServiceItem.Description;

                if ($scope.currentfilter.SelectedServiceItem &&
                    $scope.currentfilter.SelectedServiceItem.Id)
                    serviceid = $scope.currentfilter.SelectedServiceItem.Id;

            if (index < 0) { // Insert
                var items = {
                    Id: 0,
                    ServiceId: serviceid,
                    Name: servicename,
                    EligiblePer: $scope.currentfilter.EligiblePercentage,
                    SharePer: $scope.currentfilter.SharePercentage,
                    ShareAmt: $scope.currentfilter.ShareAmount,
                    Status: 1
                };
                $scope.ItemDetails.push(items);
            } else { // Update
                $scope.ItemDetails[index].ServiceId = serviceid;
                $scope.ItemDetails[index].Name = servicename;
                $scope.ItemDetails[index].EligiblePer = $scope.currentfilter.EligiblePercentage;
                $scope.ItemDetails[index].SharePer = $scope.currentfilter.SharePercentage;
                $scope.ItemDetails[index].ShareAmt = $scope.currentfilter.ShareAmount;
                $scope.ItemDetails[index].Status = 1;
            }
            $('#ServiceId').focus();
            $('#ServiceId').val('');
            $scope.currentfilter.ServiceId = -1;
            $scope.currentfilter.EligiblePercentage = 100;
            $scope.currentfilter.SharePercentage = 0;
            $scope.currentfilter.ShareAmount = 0;
            $scope.refreshReactProps();
        }
        $scope.deleteItemDetailReqst = function (index, servItem) {
            servItem.Status = 2;
            $scope.refreshReactProps();
        }
        $scope.editItemDetailReqst = function (index, servItem) {
            $scope.currentfilter.ServiceId = servItem.ServiceId;
            $scope.currentfilter.EligiblePercentage = servItem.EligiblePer;
            $scope.currentfilter.SharePercentage = servItem.SharePer;
            $scope.currentfilter.ShareAmount = servItem.ShareAmt;
            $scope.refreshReactProps();
        }

        $scope.saveItemShare = function () {
            var Msg = '';
            if ($scope.currentfilter.DoctorClassId <= 0) {
                Msg = 'Select the Doctor Class';
            } else if ($scope.currentfilter.EncounterTypeId <= 0) {
                Msg = 'Select the Encounter Type';
            } else if ($scope.currentfilter.ShareTypeId <= 0) {
                Msg = 'Select the Fee Type';
            } else if (!$scope.currentfilter.ActiveFrom) {
                Msg = 'Select the Active From date';
            } else if (!$scope.currentfilter.ActiveTo) {
                Msg = 'Select the Active To date';
            }
            var lineitempresent = 0;
            for (var idcx in $scope.ItemDetails) {
                var catitem = $scope.ItemDetails[idcx];
                if (catitem.Status == 1) {
                    lineitempresent++;
                    if (catitem.SharePer <= 0 && catitem.ShareAmt <= 0) {
                        Msg = 'Share Percentage should not less than or equal to zero';
                        break;
                    } else if (catitem.EligiblePer < catitem.SharePer) {
                        Msg = 'Eligible Percentage should not less than or equal to Share Percentage';
                        break;
                    }

                    try {
                        var perct = parseFloat(catitem.EligiblePer);
                        if (perct > 100) {
                            Msg = 'Eligible Percentage should not greater than 100';
                        }
                    } catch (ex) {  Msg = 'Invalide Eligible Percentage'; }


                    try {
                        var perct = parseFloat(catitem.SharePer);
                        if (perct > 100) {
                            Msg = 'Share Percentage should not greater than 100';
                        }
                    } catch (ex) {  Msg = 'Invalide Share Percentage'; }
                }
            }
            if (lineitempresent == 0) {
                Msg = 'Add Category Detail information';
            }
            if (Msg) {
                utl.Alert.showErrorMsg($translate.instant(Msg));
                return;
            }
            var header = $scope.getCategoryHeaderItems();
            var lines = $scope.getItemDetails();
            var inputData = { Header: header, Details: lines };

            var actionName = 'billing/doctorshare/AddDoctorShare';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0)
                actionName = 'billing/doctorshare/UpdateDoctorShare';

            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getItemDetails = function () {
            var lines = [];
            for (var idcx in $scope.ItemDetails) {
                var cateItem = $scope.ItemDetails[idcx];

                if (cateItem.Status != 1 && !cateItem.Id)
                    continue;

                var lineitem = {
                    Id: cateItem.Id,
                    DoctorShareId: null,
                    OrgId: utl.Session.getCurrentOrgId(),
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    SharingTypeId: 2, // Item wise
                    ServiceCategoryId: -1,
                    ServiceId: cateItem.ServiceId,
                    ServiceName: cateItem.Name,
                    EncounterTypeId: $scope.currentfilter.EncounterTypeId,
                    ShareTypeId: $scope.currentfilter.ShareTypeId,
                    EligiblePercentage: cateItem.EligiblePer,
                    SharePercentage: cateItem.SharePer,
                    ShareAmount: cateItem.ShareAmt,
                    MinAmount: 0,
                    MaxAmount: 0,
                    ActiveFrom: $scope.currentfilter.ActiveFrom,
                    ActiveTo: $scope.currentfilter.ActiveTo,
                    ActiveStatusId: 2,
                    Status: cateItem.Status,
                };
                lines.push(lineitem);
            }

            return lines;
        }

        // Payout Range wise changes

        $scope.addRangeDetails = function () {
            var index = -1;
            for (var idx in $scope.RangeDetails) {
                var item = $scope.RangeDetails[idx];
                if (item.MinRange == $scope.currentfilter.MinRange &&
                    item.MaxRange == $scope.currentfilter.MaxRange) {
                    index = idx;
                    break;
                }
            }
            if (!$scope.currentfilter.MinRange)
                $scope.currentfilter.MinRange = 0;

            var Msg = '';
            if (!$scope.currentfilter.RangeDescription) {
                Msg = 'Enter the Range Description';
            } else if ($scope.currentfilter.MinRange < 0) {
                Msg = 'Enter the Min Range';
            } else if (!$scope.currentfilter.MaxRange || $scope.currentfilter.MaxRange <= 0) {
                Msg = 'Enter the Max Range';
            } else if (!$scope.currentfilter.SharePerRange || $scope.currentfilter.SharePerRange <= 0) {
                Msg = 'Enter the Share Percentage';
            }
            if (Msg) {
                utl.Alert.showErrorMsg($translate.instant(Msg));
                return;
            }


            if (index < 0) { // Insert
                var items = {
                    Id: 0,
                    Name: $scope.currentfilter.RangeDescription,
                    MinRange: $scope.currentfilter.MinRange,
                    MaxRange: $scope.currentfilter.MaxRange,
                    SharePerRange: $scope.currentfilter.SharePerRange,
                    Status: 1
                };
                $scope.RangeDetails.push(items);
            } else { // Update
                $scope.RangeDetails[index].Name = $scope.currentfilter.RangeDescription;
                $scope.RangeDetails[index].MinRange = $scope.currentfilter.MinRange;
                $scope.RangeDetails[index].MaxRange = $scope.currentfilter.MaxRange;
                $scope.RangeDetails[index].SharePerRange = $scope.currentfilter.SharePerRange;
                $scope.RangeDetails[index].Status = 1;
            }
            $scope.currentfilter.RangeDescription = '';
            $scope.currentfilter.MinRange = 0;
            $scope.currentfilter.MaxRange = 0;
            $scope.currentfilter.SharePerRange = 0;
            $scope.refreshReactProps();
        }

        $scope.deleteRangeReqst = function (index, rngitms) {
            rngitms.Status = 2;
            $scope.refreshReactProps();
        }

        $scope.editRangeReqst = function (index, rngitms) {
            $scope.currentfilter.RangeDescription = rngitms.Name;
            $scope.currentfilter.MinRange = rngitms.MinRange;
            $scope.currentfilter.MaxRange = rngitms.MaxRange;
            $scope.currentfilter.SharePerRange = rngitms.SharePerRange;
            $scope.refreshReactProps();
        }

        $scope.saveRangeShare = function () {
            var Msg = '';
            if ($scope.currentfilter.DoctorClassId <= 0) {
                Msg = 'Select the Doctor Class';
            } else if ($scope.currentfilter.EncounterTypeId <= 0) {
                Msg = 'Select the Encounter Type';
            } else if ($scope.currentfilter.ShareTypeId <= 0) {
                Msg = 'Select the Fee Type';
            } else if (!$scope.currentfilter.ActiveFrom) {
                Msg = 'Select the Active From date';
            } else if (!$scope.currentfilter.ActiveTo) {
                Msg = 'Select the Active To date';
            }



            var lineitempresent = 0;
            for (var idcx in $scope.RangeDetails) {
                var catitem = $scope.RangeDetails[idcx];

                if (!catitem.MinRange)
                    catitem.MinRange = 0;

                if (catitem.Status == 1) {
                    lineitempresent++;
                    if (!catitem.Name) {
                        Msg = 'Enter the Range Description';
                        break;
                    } else if (catitem.MinRange < 0) {
                        Msg = 'Enter the Min Range';
                        break;
                    } else if (!catitem.MaxRange || catitem.MaxRange <= 0) {
                        Msg = 'Enter the Max Range';
                        break;
                    } else if (!catitem.SharePerRange || catitem.SharePerRange <= 0) {
                        Msg = 'Enter the Share Percentage';
                        break;
                    }

                    try {
                        var perct = parseFloat(catitem.SharePerRange);
                        if (perct > 100) {
                            Msg = 'Share Percentage should not greater than 100';
                        }
                    } catch (ex) {  Msg = 'Invalide Share Percentage'; }

                }
            }
            if (lineitempresent == 0) {
                Msg = 'Add Range Detail information';
            }
            if (Msg) {
                utl.Alert.showErrorMsg($translate.instant(Msg));
                return;
            }
            var header = $scope.getCategoryHeaderItems();
            var lines = $scope.getRangeDetails();
            var inputData = { Header: header, Details: lines };

            var actionName = 'billing/doctorshare/AddDoctorShare';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0)
                actionName = 'billing/doctorshare/UpdateDoctorShare';

            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getRangeDetails = function () {
            var lines = [];
            for (var idcx in $scope.RangeDetails) {
                var cateItem = $scope.RangeDetails[idcx];

                if (cateItem.Status != 1 && !cateItem.Id)
                    continue;

                var lineitem = {
                    Id: cateItem.Id,
                    DoctorShareId: null,
                    OrgId: utl.Session.getCurrentOrgId(),
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    SharingTypeId: 3, // Range wise
                    ServiceCategoryId: -1,
                    ServiceId: -1,
                    ServiceName: cateItem.Name,
                    EncounterTypeId: $scope.currentfilter.EncounterTypeId,
                    ShareTypeId: $scope.currentfilter.ShareTypeId,
                    EligiblePercentage: 0,
                    SharePercentage: cateItem.SharePerRange,
                    ShareAmount: 0,
                    MinAmount: cateItem.MinRange,
                    MaxAmount: cateItem.MaxRange,
                    ActiveFrom: $scope.currentfilter.ActiveFrom,
                    ActiveTo: $scope.currentfilter.ActiveTo,
                    ActiveStatusId: 2,
                    Status: cateItem.Status,
                };
                lines.push(lineitem);
            }

            return lines;
        }

        // Fetch Master Data

        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.clearDoctorShare();
            $scope.DoctorShareClass = 1;
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    $scope.currentfilter.DoctorClassId = item.DoctorClassId;
                    if (item.DoctorClass && item.DoctorClass.Description)
                        $scope.currentfilter.DoctorClassName = item.DoctorClass.Description;
                    if (item.EncounterType && item.EncounterType.Description)
                        $scope.currentfilter.EncounterTypeName = item.EncounterType.Description;
                    if (item.ShareType && item.ShareType.Description)
                        $scope.currentfilter.ShareTypeName = item.ShareType.Description;
                    $scope.currentfilter.ShareTypeId = item.ShareTypeId;
                    $scope.currentfilter.EncounterTypeId = item.EncounterTypeId;
                    $scope.currentfilter.ActiveFrom = item.ActiveFrom;
                    $scope.currentfilter.ActiveTo = item.ActiveTo;

                    for (var dtidx in item.DoctorShareDetails) {
                        var dtitem = item.DoctorShareDetails[dtidx];

                        var sername = '';
                        if (dtitem.ServiceCategory && dtitem.ServiceCategory.ServiceCategoryName)
                            sername = dtitem.ServiceCategory.ServiceCategoryName;

                        if (dtitem.SharingTypeId == 1) { // Category wise
                            var lineitems = {
                                Id: dtitem.Id,
                                ServiceCategoryId: dtitem.ServiceCategoryId,
                                Name: sername,
                                EligiblePer: dtitem.EligiblePercentage,
                                SharePer: dtitem.SharePercentage,
                                Status: dtitem.Status
                            };
                            $scope.CategoryItems.push(lineitems);
                        } else if (dtitem.SharingTypeId == 2) { // item wise
                            var lineitems = {
                                Id: dtitem.Id,
                                ServiceId: dtitem.ServiceId,
                                Name: dtitem.ServiceName,
                                EligiblePer: dtitem.EligiblePercentage,
                                SharePer: dtitem.SharePercentage,
                                ShareAmt: dtitem.ShareAmount,
                                Status: 1
                            };
                            $scope.ItemDetails.push(lineitems);
                        } else if (dtitem.SharingTypeId == 3) { // Range wise
                            var lineitems = {
                                Id: dtitem.Id,
                                Name: dtitem.ServiceName,
                                MinRange: dtitem.MinAmount,
                                MaxRange: dtitem.MaxAmount,
                                SharePerRange: dtitem.SharePercentage,
                                Status: 1
                            };
                            $scope.RangeDetails.push(lineitems);
                        }

                    }
                }
            }
            $scope.refreshReactProps();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/doctorshare/GetDoctorShare',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        // Fetch Master Data

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


        // Initialization changes

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.currentfilter.ActiveFrom = new Date();
            if ($scope.currentcontext.id > 0) {
                $scope.getItem();
            }
            $scope.refreshReactProps();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "DoctorClass" },
                { "Key": "ShareType" },
                { "Key": "ActiveStatus" },
                { "Key": "EncounterType" },
                { "Key": "ServiceCategory" },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        // React bridge dispatcher: routes actions from the 4 React-mounted
        // pieces of this screen (DrShareHeaderScreen, DrShareCategoryTabScreen,
        // DrShareItemsListScreen, DrShareRangeTabScreen) to the existing
        // AngularJS $scope methods. editCategoryReqst/deleteCategoryReqst/
        // editItemDetailReqst/deleteItemDetailReqst/editRangeReqst/
        // deleteRangeReqst all ignore their "index" parameter and mutate the
        // passed object reference directly (a pre-existing quirk), so lookups
        // below match by natural/business key (ServiceCategoryId, ServiceId,
        // or the MinRange/MaxRange pair) instead of array index, mirroring
        // the original semantics and avoiding any filtered-vs-unfiltered
        // array index mismatch.
        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'doctorClassChange':
                    $scope.currentfilter.DoctorClassId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'activeFromChange':
                    $scope.currentfilter.ActiveFrom = payload.value ? new Date(payload.value) : null;
                    $scope.refreshReactProps();
                    break;
                case 'encounterTypeChange':
                    $scope.currentfilter.EncounterTypeId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'shareTypeChange':
                    $scope.currentfilter.ShareTypeId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'activeToChange':
                    $scope.currentfilter.ActiveTo = payload.value ? new Date(payload.value) : null;
                    $scope.refreshReactProps();
                    break;
                case 'clear':
                    $scope.clearDoctorShare();
                    break;
                case 'add':
                    $scope.addDoctorShare();
                    break;
                case 'selectCategory':
                    $scope.categroySelection();
                    break;
                case 'selectItems':
                    $scope.itemWiseSelection();
                    break;
                case 'selectPayoutRange':
                    $scope.payoutRangeSelection();
                    break;

                case 'serviceCategoryChange':
                    $scope.currentfilter.ServiceCategoryId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'eligiblePercentageChange':
                    $scope.currentfilter.EligiblePercentage = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'sharePercentageChange':
                    $scope.currentfilter.SharePercentage = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'addCategory':
                    $scope.addCategory();
                    break;
                case 'editCategory':
                    for (var cidx in $scope.CategoryItems) {
                        if ($scope.CategoryItems[cidx].ServiceCategoryId == payload.serviceCategoryId) {
                            $scope.editCategoryReqst(null, $scope.CategoryItems[cidx]);
                            break;
                        }
                    }
                    break;
                case 'deleteCategory':
                    for (var cdidx in $scope.CategoryItems) {
                        if ($scope.CategoryItems[cdidx].ServiceCategoryId == payload.serviceCategoryId) {
                            $scope.deleteCategoryReqst(null, $scope.CategoryItems[cdidx]);
                            break;
                        }
                    }
                    break;
                case 'saveCategoryShare':
                    $scope.saveCategoryShare();
                    break;

                case 'editItemDetail':
                    for (var iidx in $scope.ItemDetails) {
                        if ($scope.ItemDetails[iidx].ServiceId == payload.serviceId) {
                            $scope.editItemDetailReqst(null, $scope.ItemDetails[iidx]);
                            break;
                        }
                    }
                    break;
                case 'deleteItemDetail':
                    for (var ididx in $scope.ItemDetails) {
                        if ($scope.ItemDetails[ididx].ServiceId == payload.serviceId) {
                            $scope.deleteItemDetailReqst(null, $scope.ItemDetails[ididx]);
                            break;
                        }
                    }
                    break;
                case 'saveItemShare':
                    $scope.saveItemShare();
                    break;

                case 'rangeDescriptionChange':
                    $scope.currentfilter.RangeDescription = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'minRangeChange':
                    $scope.currentfilter.MinRange = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'maxRangeChange':
                    $scope.currentfilter.MaxRange = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'sharePerRangeChange':
                    $scope.currentfilter.SharePerRange = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'addRange':
                    $scope.addRangeDetails();
                    break;
                case 'editRange':
                    for (var ridx in $scope.RangeDetails) {
                        if ($scope.RangeDetails[ridx].MinRange == payload.minRange && $scope.RangeDetails[ridx].MaxRange == payload.maxRange) {
                            $scope.editRangeReqst(null, $scope.RangeDetails[ridx]);
                            break;
                        }
                    }
                    break;
                case 'deleteRange':
                    for (var rdidx in $scope.RangeDetails) {
                        if ($scope.RangeDetails[rdidx].MinRange == payload.minRange && $scope.RangeDetails[rdidx].MaxRange == payload.maxRange) {
                            $scope.deleteRangeReqst(null, $scope.RangeDetails[rdidx]);
                            break;
                        }
                    }
                    break;
                case 'saveRangeShare':
                    $scope.saveRangeShare();
                    break;
            }
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();
        $scope.initLookup();

        // Initialization changes
    }

    doctorShareFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();