(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('helpdeskController', helpdeskController);

    function helpdeskController($scope, $filter, $stateParams, $state, $translate, utl) {
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.servicerequest = [];
        $scope.Items = {};
        $scope.Items.CreateCount = '0';
        $scope.Items.InprogressCount = '0';
        $scope.Items.DeferCount = '0';
        $scope.Items.ResolvedCount = '0';
        $scope.Items.MyTicketCount = '0';
        $scope.Items.ClosedCount = '0';
        $scope.Items.AllOpenCount = '0';
        $scope.Items.AllInProgressCount = '0';
        $scope.Items.AllInternalProgressCount = '0';
        $scope.Items.ResolvedByCount = '0';
        $scope.Items.AllResolveCount = '0';
        $scope.currentcontext = {
            // option: '',
            IsShowTab: false,
            CanShowCreate: false,
            CanShowAssigned: false,
            CanShowResolved: false,
            CanShowClosed: false,
            CanShowDeferred: false,
            CanShowMyTickets: false,
            userid: utl.Session.getCurrentUserId(),
            udid: parseInt(utl.Session.getCurrentDepartmentId()),
            CreatedAt: utl.Formatter.getCurrentDate(),
            usergroupid: parseInt(utl.Session.getUserGroupId()),
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        // $scope.currentcontext.CanOpenTickets = utl.Privilege.hasPrivilege('CanOpenTickets');
        // $scope.currentcontext.CanProcessingTickets = utl.Privilege.hasPrivilege('CanProcessingTickets');
        // $scope.currentcontext.CanResolvedTickets = utl.Privilege.hasPrivilege('CanResolvedTickets');
        // $scope.currentcontext.CanClosedTickets = utl.Privilege.hasPrivilege('CanClosedTickets');
        // $scope.currentcontext.CanDeferredTickets = utl.Privilege.hasPrivilege('CanDeferredTickets');
        // $scope.currentcontext.CanMyTickets = utl.Privilege.hasPrivilege('CanMyTickets');
        // $scope.currentcontext.CanInbox = utl.Privilege.hasPrivilege('CanInbox');
        // $scope.currentcontext.CanExternalInbox = utl.Privilege.hasPrivilege('CanExternalInbox');
        // $scope.currentcontext.CanInternalInbox = utl.Privilege.hasPrivilege('CanInternalInbox');
        // $scope.currentcontext.CanViewTickets = utl.Privilege.hasPrivilege('CanViewTickets');
        // $scope.currentcontext.CanCloseTickets = utl.Privilege.hasPrivilege('CanCloseTickets');
        // $scope.currentcontext.CanResolveTickets = utl.Privilege.hasPrivilege('CanResolveTickets');
        // $scope.currentcontext.CanAssignTickets = utl.Privilege.hasPrivilege('CanAssignTickets');
        $scope.currentfilter = {
            FromDepartmentId: -1,
            ToDepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            AssignedId: utl.Session.getCurrentUserId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            CreatedAt: utl.Formatter.getCurrentDate()
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.servicerequest = res.Data;
            if ($scope.currentcontext.IsShowTab == true)
                $scope.currentcontext.IsShowTab = false;
            $scope.currentcontext.CanShowCreate = true;
            if ($scope.currentcontext.CanShowAssigned == true || $scope.currentcontext.CanShowResolved == true ||
                $scope.currentcontext.CanShowClosed == true || $scope.currentcontext.CanShowDeferred == true ||
                $scope.currentcontext.CanShowMyTickets == true) {
                $scope.currentcontext.CanShowCreate = true;
                $scope.currentcontext.CanShowAssigned = false;
                $scope.currentcontext.CanShowResolved = false;
                $scope.currentcontext.CanShowClosed = false;
                $scope.currentcontext.CanShowDeferred = false;
                $scope.currentcontext.CanShowMyTickets = false;
            }
        };
        $scope.getList = function (param) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FromDepartmentId },
                    { Key: 4, Value: 2 },
                    { Key: 5, Value: $scope.currentfilter.TicketNumberIdentifier },
                    { Key: 14, Value: $scope.currentfilter.FacilityId },
                    { Key: 15, Value: $scope.currentfilter.CategoryId },
                    { Key: 21, Value: $scope.currentfilter.PhoneNo },
                ],
            };
            if ($scope.currentcontext.usergroupid != 7) {
                inputData.Params.push({ Key: 22, Value: $scope.currentcontext.userid })
            }
            if (param == 1) {
                $scope.currentfilter.PhoneNo = "";
                $scope.currentfilter.TicketNumberIdentifier = "";
                $scope.currentfilter.FromDepartmentId = -1;
                $scope.currentfilter.CategoryId = -1;
            }

            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
      
        $scope.getDeferredCallback = function (scope, res, options, hasError) {
            $scope.servicerequest = res.Data;
            if ($scope.currentcontext.IsShowTab == true)
                $scope.currentcontext.IsShowTab = false;
            if ($scope.currentcontext.CanShowCreate == true || $scope.currentcontext.CanShowAssigned == true ||
                $scope.currentcontext.CanShowResolved == true || $scope.currentcontext.CanShowClosed == true || $scope.currentcontext.CanShowMyTickets == true) {
                $scope.currentcontext.CanShowCreate = false;
                $scope.currentcontext.CanShowAssigned = false;
                $scope.currentcontext.CanShowResolved = false;
                $scope.currentcontext.CanShowClosed = false;
                $scope.currentcontext.CanShowDeferred = true;
                $scope.currentcontext.CanShowMyTickets = false;
            }
        };
        $scope.getDeferred = function (param) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FromDepartmentId },
                    { Key: 4, Value: 6 },
                    { Key: 5, Value: $scope.currentfilter.TicketNumberIdentifier },
                    { Key: 14, Value: $scope.currentfilter.FacilityId },
                    { Key: 15, Value: $scope.currentfilter.CategoryId },
                    // { Key: 22, Value: $scope.currentcontext.userid },
                    { Key: 21, Value: $scope.currentfilter.PhoneNo },
                ],
            };
            if ($scope.currentcontext.usergroupid != 7) {
                inputData.Params.push({ Key: 22, Value: $scope.currentcontext.userid })
            }
            if (param == 1) {
                $scope.currentfilter.PhoneNo = "";
                $scope.currentfilter.TicketNumberIdentifier = "";
                $scope.currentfilter.FromDepartmentId = -1;
                $scope.currentfilter.CategoryId = -1;
            }
            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDeferredCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getResolvedCallback = function (scope, res, options, hasError) {
            $scope.servicerequest = res.Data;
            if ($scope.currentcontext.IsShowTab == true)
                $scope.currentcontext.IsShowTab = false;
            if ($scope.currentcontext.CanShowCreate == true || $scope.currentcontext.CanShowAssigned == true ||
                $scope.currentcontext.CanShowDeferred == true || $scope.currentcontext.CanShowClosed == true || $scope.currentcontext.CanShowMyTickets == true) {
                $scope.currentcontext.CanShowCreate = false;
                $scope.currentcontext.CanShowAssigned = false;
                $scope.currentcontext.CanShowResolved = true;
                $scope.currentcontext.CanShowClosed = false;
                $scope.currentcontext.CanShowDeferred = false;
                $scope.currentcontext.CanShowMyTickets = false;
            }
        };
        $scope.getResolved = function (param) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FromDepartmentId },
                    { Key: 4, Value: 7 },
                    { Key: 5, Value: $scope.currentfilter.TicketNumberIdentifier },
                    { Key: 14, Value: $scope.currentfilter.FacilityId },
                    { Key: 15, Value: $scope.currentfilter.CategoryId },
                    { Key: 21, Value: $scope.currentfilter.PhoneNo },
                ],
            };
            if ($scope.currentcontext.usergroupid != 7) {
                inputData.Params.push({ Key: 24, Value: $scope.currentcontext.userid })
                inputData.Params.push({ Key: 5, Value: $scope.currentfilter.TicketNumberIdentifier })
                inputData.Params.push({ Key: 21, Value: $scope.currentfilter.PhoneNo })
            }
            if (param == 1) {
                $scope.currentfilter.PhoneNo = "";
                $scope.currentfilter.TicketNumberIdentifier = "";
                $scope.currentfilter.FromDepartmentId = -1;
                $scope.currentfilter.CategoryId = -1;
            }
            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getResolvedCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getClosedCallback = function (scope, res, options, hasError) {
            $scope.servicerequest = res.Data;
            if ($scope.currentcontext.IsShowTab == true)
                $scope.currentcontext.IsShowTab = false;
            if ($scope.currentcontext.CanShowCreate == true || $scope.currentcontext.CanShowAssigned == true ||
                $scope.currentcontext.CanShowDeferred == true || $scope.currentcontext.CanShowResolved == true || $scope.currentcontext.CanShowMyTickets == true) {
                $scope.currentcontext.CanShowCreate = false;
                $scope.currentcontext.CanShowAssigned = false;
                $scope.currentcontext.CanShowResolved = false;
                $scope.currentcontext.CanShowClosed = true;
                $scope.currentcontext.CanShowDeferred = false;
                $scope.currentcontext.CanShowMyTickets = false;
            }
        };
        $scope.getClosed = function (param) {
            var inputData = {
                Params: [
                    // { Key: 1, Value: $scope.currentcontext.udid },
                    { Key: 4, Value: 8 },
                    { Key: 5, Value: $scope.currentfilter.TicketNumberIdentifier },
                    { Key: 14, Value: $scope.currentfilter.FacilityId },
                    { Key: 15, Value: $scope.currentfilter.CategoryId },
                    // { Key: 22, Value: $scope.currentcontext.userid },
                    { Key: 21, Value: $scope.currentfilter.PhoneNo },
                ],
            };
            if ($scope.currentcontext.usergroupid != 7) {
                inputData.Params.push({ Key: 22, Value: $scope.currentcontext.userid })
            }
            if (param == 1) {
                $scope.currentfilter.PhoneNo = "";
                $scope.currentfilter.TicketNumberIdentifier = "";
                $scope.currentfilter.FromDepartmentId = -1;
                $scope.currentfilter.CategoryId = -1;
            }
            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getClosedCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getAssignedCallback = function (scope, res, options, hasError) {
            $scope.servicerequest = res.Data;
            // if ($scope.currentcontext.option == '')
            //     $scope.currentcontext.option = 'myworkorder';
            // if ($scope.currentcontext.option == 'allworkorder')
            //     $scope.currentcontext.option = 'allworkorder';
            // if ($scope.currentcontext.option == 'externalworkorder')
            //     $scope.currentcontext.option = 'externalworkorder';
            if ($scope.currentcontext.IsShowTab == false)
                $scope.currentcontext.IsShowTab = true;
            if ($scope.currentcontext.CanShowCreate == true || $scope.currentcontext.CanShowClosed == true ||
                $scope.currentcontext.CanShowDeferred == true || $scope.currentcontext.CanShowResolved == true || $scope.currentcontext.CanShowMyTickets == true) {
                $scope.currentcontext.CanShowCreate = false;
                $scope.currentcontext.CanShowAssigned = true;
                $scope.currentcontext.CanShowResolved = false;
                $scope.currentcontext.CanShowClosed = false;
                $scope.currentcontext.CanShowDeferred = false;
                $scope.currentcontext.CanShowMyTickets = false;
            }
        };
        $scope.getAssigned = function (param) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.FromDepartmentId },
                    { Key: 20, Value: [3, 4, 5, 10] },
                    { Key: 5, Value: $scope.currentfilter.TicketNumberIdentifier },
                    { Key: 14, Value: $scope.currentfilter.FacilityId },
                    { Key: 15, Value: $scope.currentfilter.CategoryId },
                    { Key: 21, Value: $scope.currentfilter.PhoneNo },
                ],
            };
            if ($scope.currentcontext.usergroupid != 7) {
                inputData.Params.push({ Key: 10, Value: $scope.currentfilter.AssignedId })
            }
            if (param == 1) {
                $scope.currentfilter.PhoneNo = "";
                $scope.currentfilter.TicketNumberIdentifier = "";
                $scope.currentfilter.FromDepartmentId = -1;
                $scope.currentfilter.CategoryId = -1;
            }
            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAssignedCallback
            };
            utl.Http.doAction(options);
        };
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.getMyticketCallback = function (scope, res, options, hasError) {
            $scope.servicerequest = res.Data;
            if ($scope.currentcontext.IsShowTab == true)
                $scope.currentcontext.IsShowTab = false;
            if ($scope.currentcontext.CanShowMyTickets == false)
                $scope.currentcontext.CanShowMyTickets = true;
            if ($scope.currentcontext.CanShowCreate == true || $scope.currentcontext.CanShowAssigned == true ||
                $scope.currentcontext.CanShowResolved == true || $scope.currentcontext.CanShowClosed == true ||
                $scope.currentcontext.CanShowDeferred == true || $scope.currentcontext.CanShowMyTickets == true) {
                $scope.currentcontext.CanShowCreate = false;
                $scope.currentcontext.CanShowAssigned = false;
                $scope.currentcontext.CanShowResolved = false;
                $scope.currentcontext.CanShowClosed = false;
                $scope.currentcontext.CanShowDeferred = false;
            }
        };
        $scope.getMyticket = function (param) {
            var From = $filter('date')($scope.currentfilter.CreatedAt, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.CreatedAt, 'yyyy-MM-dd 23:59:59') || null;
            if (param == 1) {
                $scope.currentfilter.PhoneNo = "";
                $scope.currentfilter.TicketNumberIdentifier = "";
                $scope.currentfilter.FromDepartmentId = -1;
                $scope.currentfilter.CategoryId = -1;
            }
            var inputData = {
                Params: [
                    // { Key: 1, Value: $scope.currentcontext.udid },
                    { Key: 20, Value: $scope.currentfilter.AssetTicketStatusId },
                    { Key: 5, Value: $scope.currentfilter.TicketNumberIdentifier },
                    { Key: 14, Value: $scope.currentfilter.FacilityId },
                    { Key: 15, Value: $scope.currentfilter.CategoryId },
                    { Key: 21, Value: $scope.currentfilter.PhoneNo },
                    { Key: 22, Value: $scope.currentcontext.userid },
                    { Key: 16, Value: From },
                    { Key: 17, Value: To },
                ],
            };
            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getMyticketCallback
            };
            utl.Http.doAction(options);
        };
        $scope.GetAssetDashboardHeadingCallBack = function (scope, res, options, hasError) {
            $scope.Items.CreateCount = res.servicerequestbo.CreateCount;
            $scope.Items.InprogressCount = res.servicerequestbo.InprogressCount;
            $scope.Items.DeferCount = res.servicerequestbo.DeferCount;
            $scope.Items.ResolvedCount = res.servicerequestbo.ResolvedCount;
            $scope.Items.MyTicketCount = res.servicerequestbo.MyTicketCount;
            $scope.Items.ClosedCount = res.servicerequestbo.ClosedCount;
            $scope.Items.AllOpenCount = res.servicerequestbo.AllOpenCount;
            $scope.Items.AllInProgressCount = res.servicerequestbo.AllInProgressCount;
            $scope.Items.AllInternalProgressCount = res.servicerequestbo.AllInternalProgressCount;
            $scope.Items.ResolvedByCount = res.servicerequestbo.ResolvedByCount;
            if (!$scope.Items.CreateCount)
                $scope.Items.CreateCount = '0';
            if (!$scope.Items.InprogressCount)
                $scope.Items.InprogressCount = '0';
            if (!$scope.Items.DeferCount)
                $scope.Items.DeferCount = '0';
            if (!$scope.Items.ResolvedCount)
                $scope.Items.ResolvedCount = '0';
            if (!$scope.Items.MyTicketCount)
                $scope.Items.MyTicketCount = '0';
            if (!$scope.Items.ClosedCount)
                $scope.Items.ClosedCount = '0';
            if (!$scope.Items.AllOpenCount)
                $scope.Items.AllOpenCount = '0';
            if (!$scope.Items.AllInProgressCount)
                $scope.Items.AllInProgressCount = '0';
            if (!$scope.Items.AllInternalProgressCount)
                $scope.Items.AllInternalProgressCount = '0';
            if (!$scope.Items.ResolvedByCount)
                $scope.Items.ResolvedByCount = '0';
            if (res.servicerequestbo.RequestedBy != res.servicerequestbo.ResolvedBy) {
                $scope.Items.AllResolveCount = parseInt($scope.Items.ResolvedByCount) + parseInt($scope.Items.ResolvedCount);
            } else {
                $scope.Items.AllResolveCount = parseInt($scope.Items.ResolvedCount);
            }
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
        },
            $scope.hmisprofile = function () {
                $state.go('app.hims');
            }

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

        $scope.inbox = function () {
            $state.go('app.inbox');
        }

        $scope.externalinbox = function () {
            $state.go('app.externalinbox');
        }

        $scope.internalinbox = function () {
            $state.go('app.internalinbox');
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var openid = utl.Lookup.getDefault($scope.lookup.AssetTicketStatus, 'Created');
            var assignid = utl.Lookup.getDefault($scope.lookup.AssetTicketStatus, 'Assigned to FieldAgent');
            var assignvendorid = utl.Lookup.getDefault($scope.lookup.AssetTicketStatus, 'Assigned to ExternalStockHoolder');
            var assiginstid = utl.Lookup.getDefault($scope.lookup.AssetTicketStatus, 'Assigned to Institution');
            var deferid = utl.Lookup.getDefault($scope.lookup.AssetTicketStatus, 'Deferred');
            var resolved = utl.Lookup.getDefault($scope.lookup.AssetTicketStatus, 'Resolved');
            var closeid = utl.Lookup.getDefault($scope.lookup.AssetTicketStatus, 'Closed');
            var reopened = utl.Lookup.getDefault($scope.lookup.AssetTicketStatus, 'Reopened');
            $scope.currentfilter.AssetTicketStatusId = openid + ',' + assignid + ',' + assignvendorid + ',' + assiginstid + ',' + deferid
                + ',' + resolved + ',' + closeid + ',' + reopened;
            $scope.getCount();
        }

        $scope.initLookup = function () {
            var curdeptids = utl.Session.getUserDepartments();
            var inputData = [
                {"Key": "Company" },
                {
                    "Key": "Department",
                    Request: {
                        Params: [
                            { Key: 5, Value: 2 },
                            { Key: 17, Value: curdeptids }, // Institution dept filter
                        ]
                    }
                },
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
    helpdeskController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();