(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ExternalInboxController', ExternalInboxController);

    function ExternalInboxController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.servicerequest = [];
        $scope.Items = {};
        $scope.Items.AllInProgressCount = '0';
        $scope.currentcontext = {
            option: '',
            userid: utl.Session.getCurrentUserId(),
            udid: parseInt(utl.Session.getCurrentDepartmentId()),
            CreatedAt: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext.CanOpenTickets = utl.Privilege.hasPrivilege('CanOpenTickets');
        $scope.currentcontext.CanProcessingTickets = utl.Privilege.hasPrivilege('CanProcessingTickets');
        $scope.currentcontext.CanResolvedTickets = utl.Privilege.hasPrivilege('CanResolvedTickets');
        $scope.currentcontext.CanClosedTickets = utl.Privilege.hasPrivilege('CanClosedTickets');
        $scope.currentcontext.CanDeferredTickets = utl.Privilege.hasPrivilege('CanDeferredTickets');
        $scope.currentcontext.CanMyTickets = utl.Privilege.hasPrivilege('CanMyTickets');
        $scope.currentcontext.CanViewTickets = utl.Privilege.hasPrivilege('CanViewTickets');
        $scope.currentcontext.CanCloseTickets = utl.Privilege.hasPrivilege('CanCloseTickets');
        $scope.currentcontext.CanResolveTickets = utl.Privilege.hasPrivilege('CanResolveTickets');
        $scope.currentcontext.CanAssignTickets = utl.Privilege.hasPrivilege('CanAssignTickets');
        $scope.currentfilter = {
            FromDepartmentId: -1,
            ToDepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            AssignedId: utl.Session.getCurrentUserId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            CreatedAt: utl.Formatter.getCurrentDate(),
            AssetTicketStatusId: '3,4,5'
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.servicerequest = res.Data;
        };
        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FromDepartmentId },
                    { Key: 20, Value: $scope.currentfilter.AssetTicketStatusId },
                    { Key: 5, Value: $scope.currentfilter.TicketNumberIdentifier },
                    { Key: 14, Value: $scope.currentfilter.FacilityId },
                    { Key: 10, Value: $scope.currentcontext.userid },
                    { Key: 15, Value: $scope.currentfilter.CategoryId },
                    { Key: 21, Value: $scope.currentfilter.PhoneNo },
                ],
            };
            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.GetAssetDashboardHeadingCallBack = function (scope, res, options, hasError) {
            $scope.Items.AllInProgressCount = res.servicerequestbo.AllInProgressCount;
            if (!$scope.Items.AllInProgressCount)
                $scope.Items.AllInProgressCount = '0';
            $scope.getList();
        };
        $scope.getCount = function () {
            var inputData = {
                Data: {
                    Keys: [{ Key: 'servicerequestbo' }]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'AssetManagement/AssetDashboard/GetAssetDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetAssetDashboardHeadingCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.newticket = function () {
            $state.go('app.newticket');
        };
        $scope.hmisprofile = function () {
            $state.go('app.hims');
        };

        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };
        $scope.downloadFile = function (item) {
            var inputData = { FilePath: item.FilePath };
            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequestFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }
        $scope.download = function (idx, item) {
            $scope.downloadFile(item);
        }

        $scope.view = function (idx, item) {
            utl.Modal.openFixedDialog('app.addnewticket', {
                params: { id: item.Id },
            });
        }

        $scope.assign = function (idx, item) {
            utl.Modal.openFixedDialog('app.ticketassignment', {
                params: { id: item.Id }, confirmCallback: $scope.initLookup
            });
        }

        $scope.addnewticket = function () {
            utl.Modal.openFixedDialog('app.addnewticket', {
                params: { id: 0 }, confirmCallback: $scope.initLookup
            });
        }

        $scope.resolve = function (idx, item) {
            utl.Modal.openFixedDialog('app.ticketexecution', {
                params: { id: item.Id }, confirmCallback: $scope.initLookup
            });
        }

        $scope.closed = function (idx, item) {
            utl.Modal.openFixedDialog('app.resolvedform', {
                params: { id: item.Id }, confirmCallback: $scope.initLookup
            });
        }
        $scope.helpdesk = function () {
            $state.go('app.helpdesk');
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var assignid = utl.Lookup.getDefault($scope.lookup.AssetTicketStatus, 'Assigned to FieldAgent');
            var assignvendorid = utl.Lookup.getDefault($scope.lookup.AssetTicketStatus, 'Assigned to ExternalStockHoolder');
            var assiginstid = utl.Lookup.getDefault($scope.lookup.AssetTicketStatus, 'Assigned to Institution');
            $scope.currentfilter.AssetTicketStatusId = assignid + ',' + assignvendorid + ',' + assiginstid;
            $scope.getCount();
        }

        $scope.initLookup = function () {
            var inputData = [
                {"Key": "Company" },
                { "Key": "Department" },
                { "Key": "TicketCategory" },
                { "Key": "AssetTicketStatus" },
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
    ExternalInboxController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();