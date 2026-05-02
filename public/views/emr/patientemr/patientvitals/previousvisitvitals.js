(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PreviousVitalController', PreviousVitalController);

    function PreviousVitalController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));
        $scope.currentfilter = {
            PerformedBy: -1,
            VitalId: -1,
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {};

        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter)
            $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;
        //growth chart code starts
        // $scope.growthcharttabs = [{
        //         key: 'headcircum',
        //         name: $translate.instant('patientemr.patientvital-list.growth-headcircum.lbl'),
        //         xaxislbl: 'Age (in months)',
        //         yaxislbl: 'Head circumference (cm)'
        //     },
        //     {
        //         key: 'bmi',
        //         name: $translate.instant('patientemr.patientvital-list.growth-bmi.lbl'),
        //         xaxislbl: 'Age (in months)',
        //         yaxislbl: 'BMI (kg/m2)'
        //     },
        //     {
        //         key: 'height',
        //         name: $translate.instant('patientemr.patientvital-list.growth-height.lbl'),
        //         xaxislbl: 'Age (in months)',
        //         yaxislbl: 'Height (cm)'
        //     },
        //     {
        //         key: 'weight',
        //         name: $translate.instant('patientemr.patientvital-list.growth-weight.lbl'),
        //         xaxislbl: 'Age (in months)',
        //         yaxislbl: 'Weight (kg)'
        //     }
        // ];

        // $scope.growthchartconfig = {
        //     patientid: $scope.currentcontext.pid,
        //     gender: utl.Session.getPatientGender(),
        //     patientdob: utl.Session.getPatientDOB(),
        //     vital: $scope.growthcharttabs[0].key,
        //     xaxislbl: $scope.growthcharttabs[0].xaxislbl,
        //     yaxislbl: $scope.growthcharttabs[0].yaxislbl
        // };

        // $scope.growhtchartChange = function (item) {
        //     $scope.growthchartconfig = {
        //         patientid: $scope.currentcontext.pid,
        //         gender: utl.Session.getPatientGender(),
        //         patientdob: utl.Session.getPatientDOB(),
        //         vital: item.key,
        //         xaxislbl: item.xaxislbl,
        //         yaxislbl: item.yaxislbl
        //     };
        // }
        //growth chart code ends

        // $scope.toggleView = function () {
        //     $scope.currentcontext.selectedMenu = $scope.canShowGridArea() ? 'chart' : 'list';
        // }

        // $scope.listView = function () {
        //     $scope.currentcontext.view = 'listview';
        // }

        // $scope.dateView = function () {
        //     $scope.currentcontext.view = 'dateview';
        // }

        // $scope.canShowGridArea = function () {
        //     return $scope.currentcontext.selectedMenu == 'list';
        // }

        // $scope.canShowChartArea = function () {
        //     return $scope.currentcontext.selectedMenu == 'chart';
        // }

        // //Visibility Rules ends

        // $scope.showGrowthChart = function () {
        //     var patientAge = utl.Formatter.getAgeFromDOB(utl.Session.getPatientDOB());
        //     if (patientAge >= 5) {
        //         var confirmOptions = {
        //             headingKey: 'common.confirm-modal-header.lbl',
        //             messageKey: 'patientemr.patientvital-list.growthchart-confirmmsg.lbl',
        //             yesKey: 'common.yeskey.lbl',
        //             noKey: 'common.nokey.lbl',
        //             onSuccessMethod: openGrowthChart,
        //         };
        //         utl.Dialog.confirmMessage(confirmOptions);
        //     } else {
        //         openGrowthChart();
        //     }
        // }

        // function openGrowthChart() {
        //     $scope.currentcontext.view = "growthchart";
        // }

        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {
            var vitals = res.Data;
            for (var idx in vitals) {
                var vital = vitals[idx];
                vitals[idx].PerformedDate = utl.Formatter.getDateTimeString(vitals[idx].PerformedDate);
                switch (vital.VitalId) {
                    case 1: //height
                        if (vital.VitalValue.includes("~")) {
                            var vitalvalues = vital.VitalValue.split("~");
                            vitals[idx].VitalValue = vitalvalues[0] + "'" + vitalvalues[1] + "\"";
                        }
                        break;
                    case 8: //BP
                        if (vital.VitalValue.includes("~")) {
                            var vitalvalues = vital.VitalValue.split("~");
                            vitals[idx].VitalValue = vitalvalues[0] + "/" + vitalvalues[1];
                        }
                        break;
                    default:
                        break;
                }
            }
            var finalData = [];
            var headerData = _.uniqBy(vitals, 'VitalName');
            var groupedData = _.groupBy(vitals, 'PerformedDate');
            for (var groupKey in groupedData) {
                var tr = [];
                tr.push({
                    ColVal: groupKey
                });
                for (var header in headerData) {
                    var td = _.find(groupedData[groupKey], {
                        VitalName: headerData[header].VitalName
                    });
                    var vitalValue = '';
                    if (td) {
                        vitalValue = td.VitalValue + ' ' + td.UOM;
                    }
                    tr.push({
                        ColVal: vitalValue
                    });
                }
                finalData.push(tr);
            }
            $scope.currentcontext.groupedData = finalData;
            $scope.currentcontext.headerData = headerData;
            console.log(finalData);
            vm.gridConfig.data = vitals;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    // {
                    //     Key: 3,
                    //     Value: $scope.currentfilter.VitalId
                    // },
                    // {
                    //     Key: 7,
                    //     Value: $scope.currentfilter.PerformedBy
                    // },
                    {
                        Key: 5,
                        Value: utl.Formatter.getFilterDate(FromDate)
                    },
                    {
                        Key: 6,
                        Value: utl.Formatter.getFilterDate(ToDate)
                    },
                    // {
                    //     Key: 9,
                    //     Value: $scope.currentcontext.eid
                    // },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //Grid Actions

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientvital/DeletePatientVital',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientvital', {
                    params: {
                        id: entity.Id,
                        gid: entity.GroupId,
                        pid: $scope.currentcontext.pid
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.VitalName);
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "VitalName",
                    displayName: $translate.instant('patientemr.patientvital-list.vital.lbl')
                },
                {
                    field: "VitalValue",
                    displayName: $translate.instant('patientemr.patientvital-list.vitalvalue.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.VitalValue }}</span>" + "<span >&nbsp;</span>" +
                        "<span  >{{entity.UOM}}</span>" +
                        "</div>"
                },
                {
                    field: "ReferenceRangeFrom",
                    displayName: $translate.instant('patientemr.patientvital-list.range.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span >{{entity.ReferenceRangeFrom }}</span>" +
                        "<span  >-</span>" +
                        "<span  >{{entity.ReferenceRangeTo}}</span>" +
                        "</div>"
                },
                {
                    field: "VitalQualifier",
                    displayName: $translate.instant('patientemr.patientvital-list.vitalqualifier.lbl')
                },
                {
                    field: "PerformedDate",
                    displayName: $translate.instant('patientemr.patientvital-list.captureddate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PerformedDate'></ngformatdate>"
                },
                {
                    field: "User.FirstName",
                    displayName: $translate.instant('patientemr.patientvital-list.capturedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                        "<span >{{entity.PerformedUser.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.PerformedUser.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.PerformedUser.LastName}}&nbsp;</span>" +
                        "</span></div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                   <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Vital"
                },
                {
                    "Key": "User"
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

    PreviousVitalController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();