(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('TicketAssignmentController', TicketAssignmentController);

    function TicketAssignmentController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.item = {
            AssignedOn: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            AssignedFacilityId: utl.Session.getCurrentFacilityId(),
            AssignedFacilityName: utl.Session.getCurrentFacilityName(),
            AssignTypeId: 3,
            CreatedBy: utl.Session.getCurrentUserId()
        }
        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.currentcontext.CanDefer = utl.Privilege.hasPrivilege('CanDefer')
        $scope.currentcontext.CanAssign = utl.Privilege.hasPrivilege('CanAssign')
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
            // $scope.item.AssignedOn = utl.Formatter.getCurrentDate();
        }

        vm.AssignType = [
            // { Id: 1, Text: $translate.instant('assetmanagement.assignment-form.inhouse.lbl') },
            { Id: 3, Text: $translate.instant('assetmanagement.assignment-form.institution.lbl') },
            { Id: 2, Text: $translate.instant('assetmanagement.assignment-form.externalvendor.lbl') },

        ]
        $scope.canShowUser = function () {
            return $scope.item.AssignTypeId == 1;
        }
        $scope.canShowVendor = function () {
            return $scope.item.AssignTypeId == 2;
        }
        $scope.canShowInstitute = function () {
            return $scope.item.AssignTypeId == 3;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.AssignedFacilityId != null) {
                $scope.item.AssignedFacilityId = data.AssignedFacilityId;
            } else {
                $scope.item.AssignedFacilityId = data.FacilityId;
            }
            if (data.AssetTicketStatusId == 2) {
                $scope.item.AssignedOn = utl.Formatter.getCurrentDate();
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
                $scope.item.AssignedFacilityId = utl.Session.getCurrentFacilityId();
                $scope.item.CreatedBy = utl.Session.getCurrentUserId();
                $scope.item.AssignTypeId = 3;
            }
            if (data.AssetTicketStatusId == 1) {
                $scope.item.AssetTicketStatus = "Draft";
            }
            if (data.AssetTicketStatusId == 2) {
                $scope.item.AssetTicketStatus = "Created";
                $scope.item.CreatedBy = data.ReportedById;
                $scope.initLookup(data.ReportedById);
            }
            if (data.AssetTicketStatusId == 3) {
                $scope.item.AssetTicketStatus = "Assigned to FieldAgent";
            }
            if (data.AssetTicketStatusId == 4) {
                $scope.item.AssetTicketStatus = "Assigned to ExternalStockHolder";
            }
            if (data.AssetTicketStatusId == 5) {
                $scope.item.AssetTicketStatus = "Assigned to Institution";
                $scope.item.CreatedBy = data.ReportedById;

                $scope.initLookup(data.ReportedById);
            }
            if (data.AssetTicketStatusId == 6) {
                $scope.item.AssetTicketStatus = "Deferred";
                $scope.item.CreatedBy = data.ReportedById;
                $scope.initLookup(data.ReportedById);
            }
            if (data.AssetTicketStatusId == 7) {
                $scope.item.AssetTicketStatus = "Resolved";
                $scope.item.CreatedBy = data.ReportedById;
                $scope.initLookup(data.ReportedById);
            }
            if (data.AssetTicketStatusId == 8) {
                $scope.item.AssetTicketStatus = "Closed";
                $scope.item.CreatedBy = data.ReportedById;
                $scope.initLookup(data.ReportedById);
            }
            if (data.AssetTicketStatusId == 9) {
                $scope.item.AssetTicketStatus = "Cancelled";
            }
            if (data.AssetTicketStatusId == 10) {
                $scope.item.AssetTicketStatus = "Reopened";
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'AssetManagement/ServiceRequest/GetServiceRequestById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.populateEstimateDisDate = function () {
            if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.AssignedOn && $scope.item.AssignedOn != '') {
                var AssignedOn = new Date($scope.item.AssignedOn);
                $scope.item.ExpectedDate = new Date(AssignedOn.getFullYear(),
                    AssignedOn.getMonth(),
                    AssignedOn.getDate() + parseInt($scope.item.ALOS));
            }
        }

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            // if ($scope.item.AssetTicketStatusId == 5) {
            //     if (!$scope.item.AssignedFacilityId || $scope.item.AssignedFacilityId == -1) {
            //         utl.Alert.showErrorMsg($translate.instant('assetmanagement.helpdesk.selectinstitute.lbl'));
            //         return;
            //     }
            //     if (!$scope.item.ToDepartmentId || $scope.item.ToDepartmentId == -1) {
            //         utl.Alert.showErrorMsg($translate.instant('assetmanagement.helpdesk.selectdept.lbl'));
            //         return;
            //     }
            // }
            // if ($scope.item.AssetTicketStatusId == 4) {
            //     if (!$scope.item.AssignedId || $scope.item.AssignedId ==-1) {
            //         utl.Alert.showErrorMsg($translate.instant('assetmanagement.helpdesk.selectuser.lbl'));
            //         return;
            //     }
            // }

            var actionName = 'AssetManagement/ServiceRequest/AddServiceRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/ServiceRequest/UpdateServiceRequest';
            }
            $scope.item.AssignedOn = utl.Formatter.getCurrentDate();

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.saveAndAssign = function () {
            if ($scope.item.AssignTypeId == 1) {
                $scope.item.AssetTicketStatusId = 3;
            } else if ($scope.item.AssignTypeId == 2) {
                $scope.item.AssetTicketStatusId = 4;
                if ($scope.item.AssetTicketStatusId == 4) {
                    if (!$scope.item.AssignedId || $scope.item.AssignedId == -1) {
                        utl.Alert.showErrorMsg($translate.instant('assetmanagement.helpdesk.selectuser.lbl'));
                        return;
                    }
                }
            } else if ($scope.item.AssignTypeId == 3) {
                $scope.item.AssetTicketStatusId = 5;
                if ($scope.item.AssetTicketStatusId == 5) {
                    if (!$scope.item.AssignedFacilityId || $scope.item.AssignedFacilityId == -1) {
                        utl.Alert.showErrorMsg($translate.instant('assetmanagement.helpdesk.selectinstitute.lbl'));
                        return;
                    }
                    if (!$scope.item.ToDepartmentId || $scope.item.ToDepartmentId == -1) {
                        utl.Alert.showErrorMsg($translate.instant('assetmanagement.helpdesk.selectdept.lbl'));
                        return;
                    }
                }
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.assignmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.Deferred = function () {
            $scope.item.AssetTicketStatusId = 6;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.defermsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.cancel = function () {
            $scope.item.AssetTicketStatusId = 9;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.closePopUp = function () {
            $scope.confirmCallback();
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });

            if ($scope.item.AssignedOn == null)
                $scope.item.AssignedOn = new Date();
        }

        //facility autosearch starts
        vm.facilitycontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Facility Code', field: 'FacilityCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Facility Name', field: 'FacilityName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/Facility/GetFacilitys',
            formatdisplay: formatselectedfacilityitem,
            presearch: presearchfacilityitem,
            postsearch: postsearchfacilityitem
        };

        function formatselectedfacilityitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.facilitycontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = selectedItem.FacilityName;
            } else if (vm.facilitycontrolconfig.rowdata) {
                result = vm.facilitycontrolconfig.rowdata.AssignedFacilityName;
            }
            return result;
        }

        function presearchfacilityitem() {
            var query = vm.facilitycontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 },
                    { Key: 4, Value: true }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.facilitycontrolconfig.searchparams = inputData;
        }

        function postsearchfacilityitem() {
            for (var idx in vm.facilitycontrolconfig.result) {
                var item = vm.facilitycontrolconfig.result[idx];
                $scope.item.AssignedFacilityCode = item.FacilityCode;
                $scope.item.AssignedFacilityName = item.FacilityName;
            }
        }
        //facility autosearch ends

        // user autosearch starts
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'User Id', field: 'UserId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'User Name', field: 'UserName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
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
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserName].join(' ');
            }
            return result;
        }
        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.item.AssignedFacilityId },
                    { Key: 5, Value: 2 },
                    { Key: 6, Value: $scope.item.ToDepartmentId },
                    { Key: 20, Value: 8 },
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };
            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }
            vm.usercontrolconfig.searchparams = inputData;
        }
        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                if (item.Title)
                    item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        // user autosearch ends

        //exteranaluser autosearch starts
        vm.externalusercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'User Id', field: 'UserId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'User Name', field: 'UserName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselectedexternaluser,
            presearch: presearchexternaluser,
            postsearch: postsearchexternaluser
        };
        function formatselectedexternaluser() {
            var selectedItem = vm.externalusercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                result = [selectedItem.UserName].join('  ');
            } else if (vm.externalusercontrolconfig.rowdata) {
                result = [vm.externalusercontrolconfig.rowdata.UserName].join(' ');
            }
            return result;
        }
        function presearchexternaluser() {
            var query = vm.externalusercontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 2, Value: utl.Session.getCurrentFacilityId() },
                    { Key: 5, Value: 2 },
                    { Key: 3, Value: 13 },
                    { Key: 20, Value: 8 },
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };
            if (vm.externalusercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }
            vm.externalusercontrolconfig.searchparams = inputData;
        }
        function postsearchexternaluser() {
            for (var idx in vm.externalusercontrolconfig.result) {
                var item = vm.externalusercontrolconfig.result[idx];
                item.UserId = item.Id;
                if (item.Title)
                    item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        // exteranaluser autosearch ends

        $scope.initLookup = function (params) {
            if (params != 0) {
                var CreatedBy = params;
            } else {
                var CreatedBy = utl.Session.getCurrentUserId();
            }
            var inputData = [
                {
                    "Key": "AssetUser",
                    Request: {
                        Params: [
                            { Key: 5, Value: 2 },
                            { Key: 6, Value: $scope.item.ToDepartmentId }
                        ]
                    }
                },
                { "Key": "AssetAssignType", "Default": false },
                { "Key": "Priority" },
                { "Key": "AssetTicketStatus" },
                { "Key": "AssetDepartment" },
                { "Key": "ExternalStakeHolder" },
                { "Key": "ExternalUser" },
                {"Key": "Company" },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: CreatedBy
                        }]
                    },
                    Default: false
                },
            ];
            $scope.getLookUp(inputData);

        }
        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();
        $scope.getItem();
        $scope.getDeptUsers = function () {
            var inputData = [{
                "Key": "AssetUser",
                Request: {
                    Params: [
                        { Key: 2, Value: utl.Session.getCurrentFacilityId() },
                        { Key: 5, Value: 2 },
                        { Key: 6, Value: $scope.item.ToDepartmentId }
                    ]
                }
            }];
            $scope.getLookUp(inputData);
        };
    }

    TicketAssignmentController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();