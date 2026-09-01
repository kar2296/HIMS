(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MRDFileRequestApprovedListController', MRDFileRequestApprovedListController);

    function MRDFileRequestApprovedListController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.Items = [];
        $scope.currentfilter = {
            MRDIPFileStatusId: 3,
            RequestDate: utl.Formatter.getCurrentDate(),
        };
        //  $scope.currentfilter.DocumentDate = new Date();
        $scope.currentcontext = {};

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.RequestDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.RequestDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {

                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.PatientName
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.VisitNo
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.MRDIPFileStatusId
                    },
                    { Key: 9, Value: FromDate },
                    { Key: 10, Value: ToDate },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/IPFileRequest/GetIPFileRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);

        };

        //Grid Actions

        $scope.item = {};

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'IPManagement/IPFileRequest/DeleteIPFileRequest',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'filerequest') {
                // utl.Session.setEMRPatientId(entity.PatientId);
                $state.go('app.ipmrdfilerequestapproveform', {
                    id: entity.Id,
                });
            }
        }



        //React bridge: renders this screen's status filter through the shared
        //BridgeLookupSelectScreen and its <custom-table config="vm.gridConfig">
        //through the shared BridgeGridScreen. Cell text is formatted here with
        //the same $filter('date', ...) calls the original cellTemplates used,
        //so no formatting logic moves into React. Every dispatch lands back on
        //this controller's existing, unchanged functions.
            function patientNameAge(p) {
                if (!p) { return ''; }
                var title = p.Title && p.Title.Description ? p.Title.Description : '';
                return (title + (p.FirstName || '') + (p.LastName || '') + ' / ' + (p.Age || '')).trim();
            }
            function userLabel(u) {
                if (!u) { return ''; }
                return ((u.Title && u.Title.Description ? u.Title.Description + ' ' : '') + (u.FirstName || '') + ' ' + (u.LastName || '')).trim();
            }

        $scope.handleGridAction = function (actionType, payload) {
            var items = vm.gridConfig.data || [];
            var entity = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].Id === payload.id) { entity = items[i]; break; }
            }
            if (actionType == 'rowAction') {
                $scope.handleEvents('filerequest', entity);
            } else if (actionType == 'cellAction') {
                $scope.handleEvents('patientinfo', entity);
            }
        };

        $scope.handleFilterAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.currentfilter.MRDIPFileStatusId = payload.id;
                $scope.getList();
            }
        };

        $scope.refreshReactProps = function () {
            var defs = vm.gridConfig.columnDefs || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            var items = vm.gridConfig.data || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    columns: [
                    { key: '__sno', header: hdr(0), width: '60px' },
                    { key: 'requestdate', header: hdr(1), sortable: true },
                    { key: 'visitno', header: hdr(2), sortable: true },
                    { key: 'mrn', header: hdr(3), sortable: true },
                    { key: 'patient', header: hdr(4), link: true },
                    { key: 'requestuser', header: hdr(5) },
                    { key: 'doctorname', header: hdr(6), sortable: true },
                    { key: 'status', header: hdr(7), sortable: true }
                ],
                    actionsHeader: defs.length ? defs[defs.length - 1].displayName : 'Actions',
                    hasActions: true,
                    rows: items.map(function (entity) {
                        return {
                            id: entity.Id,
                            actionLabel: 'Approve',
                            cells: {
                        requestdate: (entity.RequestDate ? $filter('date')(entity.RequestDate, 'dd-MMM-yyyy') : '') + ' ' + (entity.RequestDate ? $filter('date')(entity.RequestDate, 'HH:mm') : ''),
                        visitno: entity.VisitNo,
                        mrn: entity.Patient && entity.Patient.MRN,
                        patient: patientNameAge(entity.Patient),
                        requestuser: userLabel(entity.RequestUser),
                        doctorname: entity.DoctorName,
                        status: entity.MRDIPFileStatus && entity.MRDIPFileStatus.Description
                    }
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
            $scope.reactPropsFilterContainer = {
                reactProps: {
                    options: ($scope.lookup && $scope.lookup.MRDIPFileStatus) || [],
                    value: $scope.currentfilter.MRDIPFileStatusId
                },
                onAction: $scope.handleFilterAction
            };
        };

        vm.gridConfig = {
            columnDefs: [
                {
                    field: "S.No",
                    displayName: $translate.instant('S.NO'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "RequestDate",
                    displayName: $translate.instant('Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.RequestDate| date: 'HH:mm'}}</span>" + "</div>"
                },

                {
                    field: "VisitNo",
                    displayName: $translate.instant('Visit No')
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('Patient ID')
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('admissions.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        // '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                        // '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        +
                        '<a ng-click="handleEvents(\'patientinfo\',entity)">' +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<b>{{entity.Patient.Title.Description}}</b></span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b></span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}</span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents
                },
                {
                    field: "RequestUser",
                    displayName: $translate.instant('inventory.stockrequests.requestedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.RequestUser.FirstName}}&nbsp;</span>" + "<span >{{entity.RequestUser.LastName}}</span>" + "</div>"
                },
                // {
                //     field: "Patient",
                //     displayName: $translate.instant('admissions.patientname.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>"
                //         // '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                //         // '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                //         +
                //         '<a ng-click="handleEvents(\'patientinfo\',entity)">' +
                //         "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                //         "{{entity.Patient.Title.Description}}</span>" +
                //         "<span >{{entity.Patient.FirstName}}</span>" +
                //         "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                //         "<span >/</span>" +
                //         "<span >{{entity.Patient.MRN}}</span>" +
                //         "<span >/<span>" +
                //         "<span >{{entity.Patient.Age}}</span>" +
                //         "<span >/</span>" +
                //         "<span >{{entity.Patient.Gender.Description}}</span>" +
                //         "</a></div>",
                //     handleEvent: $scope.handleEvents
                // },
                // { field: "WardMaster.WardName", displayName: $translate.instant('admissions.ward.lbl') },
                // {
                //     field: "WardRoomMaster",
                //     displayName: $translate.instant('admissions.roomdetails.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>" +
                //         "<span  ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName}} </span>" +
                //         "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                //         "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}} </span>" +
                //         "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                //         "<span  ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                //         "</div>"



                // },
                {
                    field: "DoctorName",
                    displayName: $translate.instant('Doctor Name')
                },
                // {
                //     field: "Guarantor.GuarantorName",
                //     displayName: $translate.instant('currentinpatient.guarantor.lbl')
                // },
                // { field: "Department.DepartmentName", displayName: $translate.instant('admissions.department.lbl') },
                {
                    field: "MRDIPFileStatus.Description",
                    displayName: $translate.instant('admissions.status.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <div style='height:15px;width:20px;border-radius: 7px;margin-top: 4px;class='col-sm-2'></div>\
                                                &nbsp;<span>{{entity.MRDIPFileStatus.Description}}</span>\
                                            </div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                               <span class="grid-action" ng-click="handleEvents(\'filerequest\',entity)"><i class="btn text-white dem-color4  btn-xs" aria-hidden="true"><strong>Approve</strong></i></span>\
                            </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.refreshReactProps();


        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "MRDIPFileStatus"
                }
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

    MRDFileRequestApprovedListController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();