(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('lisInterfaceListController', lisInterfaceListController);

    function lisInterfaceListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.currentfilter = {};
        // $scope.currentfilter.ProcessedDate = new Date();
        $scope.currentfilter.FromDate = new Date();
        $scope.currentfilter.ToDate = new Date();
        $scope.currentfilter.PatientNameMRN = null;
        $scope.currentfilter.EncounterTypeId = -1;
        $scope.currentfilter.Sampleid = null;
        $scope.currentfilter.AssetId = -1;
        $scope.currentfilter.MRNNo = null;
        $scope.currentfilter.StatusId = 0;
        $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.currentfilter.withpatientid = true;
        // vm.gridConfig = [];
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];

            if (res.Data.length > 0) {
                // const filtered = res.Data.filter((obj, index) => {
                //     return index === res.Data.findIndex(o => obj.Sampleid === o.Sampleid);
                // });


                // console.log(filtered);
                // data.Data.sort($scope.custom_sort);
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    if (item.PatientWorkorder && item.PatientWorkorder.Encounter) {
                        vm.gridConfig.data.push(item);
                    }
                    // vm.gridConfig.data = res.Data;
                }
            }
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            // vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords.length;
        }

        $scope.WithPatientInfo = function () {
            $scope.getList();
        }

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.Sampleid },
                    // { Key: 1, Value: $scope.currentfilter.AssetId },
                    { Key: 5, Value: $scope.currentfilter.PatientName },
                    { Key: 6, Value: $scope.currentfilter.MRNNo },
                    { Key: 7, Value: From },
                    { Key: 8, Value: To },
                    { Key: 9, Value: $scope.currentfilter.StatusId },
                    { Key: 10, Value: $scope.currentfilter.EncounterTypeId },
                    { Key: 11, Value: $scope.currentfilter.VisitIdentifier },
                    // { Key: 11, Value: $scope.currentfilter.VisitIdentifier },
                    { Key: 12, Value: $scope.currentfilter.FacilityId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            // if ($scope.currentfilter.withpatientid) {
            //     inputData.Params.push({ Key: 11, Value: true });
            // } else {
            //     inputData.Params.push({ Key: 12, Value: true });
            // }
            // if ($scope.currentfilter.StatusId == 1)
            //     inputData.Params.push({ Key: 9, Value: true });
            // else if ($scope.currentfilter.StatusId == 2)
            //     inputData.Params.push({ Key: 10, Value: true });
            // else if ($scope.currentfilter.StatusId == 0)
            //     inputData.Params.push({ Key: 9, Value: false }, { Key: 10, Value: false });

            // if ($scope.currentfilter.VisitIdentifier)
            //     inputData.Params.push({ Key: 7, Value: $scope.currentfilter.VisitIdentifier });

            // if ($scope.currentfilter.EncounterTypeId)
            //     inputData.Params.push({ Key: 8, Value: $scope.currentfilter.EncounterTypeId });

            var options = {
                action: 'lis/LISInterfaceResults/GetLISResults',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('app.lisinterfaceresult', {
                    params: {
                        id: entity.LISId,
                        pid: entity.LISInterfacePatientDetail.PatientId,
                        AssetId: entity.AssetId,
                        Sampleid: entity.Sampleid,
                        woid: entity.WorkOrderId
                    },
                    confirmCallback: $scope.getList,
                    cancelCallback: $scope.getList
                });
            } else if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: { pid: entity.PatientId }
                });
            } else if (actionType == 'view') {
                // $state.go('app.lisinterfaceresult', {
                //     id: entity.Id,
                //     pid: entity.PatientId,
                //     AssetId: entity.AssetId,
                //     Sampleid: entity.Sampleid,
                // });
                utl.Modal.open('app.lisinterfaceresult', {
                    params: {
                        id: entity.Id,
                        // pid: entity.PatientId,
                        pid: entity.LISInterfacePatientDetail.PatientId,
                        AssetId: entity.AssetId,
                        Sampleid: entity.Sampleid,
                    },
                    confirmCallback: $scope.getList,
                    cancelCallback: $scope.getList
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "Asset.AssetName", displayName: $translate.instant('lis.lisinterface.assetname.lbl') },
                { field: "Sampleid", displayName: $translate.instant('lis.lisinterface.sampleid.lbl') },
                {
                    field: "PatientName",
                    displayName: $translate.instant('lis.lisinterface.patientinfo.lbl'),
                    width: '20%',
                    // cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    //     '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                    //     "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                    //     "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                    //     "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                    //     "<span >/</span>" +
                    //     "<span >{{entity.Patient.MRN}}</span>" +
                    //     "<span >/<span>" +
                    //     "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                    //     "<span >{{entity.Patient.Age}}</span>" +
                    //     "<span >/</span>" +
                    //     "<span >{{entity.Patient.Gender.Description}}</span>" +
                    //     "</a></div>"
                },
                { field: "MRNNo", displayName: $translate.instant('UHID#') },
                { field: "PatientWorkorder.Encounter.VisitIdentifier", displayName: $translate.instant('lis.lisinterface.visitidentifier.lbl') },
                {
                    field: "Approved",
                    displayName: $translate.instant('Approved'),
                    cellTemplate: "<div class='ui-grid-cell-contents' ng-if='entity.Approved'> YES </div>" +
                        "<div class='ui-grid-cell-contents' ng-if='!entity.Approved'> NO </div>"
                },
                {
                    field: "Rejected",
                    displayName: $translate.instant('lis.lisinterface.rejected.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents' ng-if='entity.Rejected'> YES </div>" +
                        "<div class='ui-grid-cell-contents' ng-if='!entity.Rejected'> NO </div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                    \<span class="grid-action" ng-click="handleEvents(\'edit\',entity)"  ng-show="(!entity.Approved && !entity.Rejected)"><i class="fa fa-pencil-square-o" aria-hidden="true" uib-tooltip="Edit" tooltip-placement="bottom"></i></span>\
                                    \<span class="grid-action" ng-click="handleEvents(\'view\',entity)"  ng-show="(entity.Approved || entity.Rejected)"><i class="fa fa-eye" aria-hidden="true"></i></span>\
                                    \</div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.lookup.Status = [];
            $scope.lookup.Status.push({ "Id": 0, "Text": "Pending" });
            $scope.lookup.Status.push({ "Id": 1, "Text": "Approved" });
            $scope.lookup.Status.push({ "Id": 2, "Text": "Rejected" });
            $scope.lookup.Status.push({ "Id": 3, "Text": "All" });
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "EncounterType" },
                {
                    "Key": "AssetName",
                    Request: {
                        Params: [
                            { Key: 16, Value: true }
                        ]
                    }
                },

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

    lisInterfaceListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();