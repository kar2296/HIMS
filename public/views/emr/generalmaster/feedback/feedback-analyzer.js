(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('feedbacksAnalyzerController', feedbacksAnalyzerController);

    function feedbacksAnalyzerController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: 1,
            FeedbackTypeId: -1,
            FeedbackCategoryId: -1,
            ActiveStatusId: 2,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {};
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            if (res.Data.length > 0) {
                for (var pdx in res.Data) {
                    var item = res.Data[pdx];
                    item.VeryGoodCount = 0;
                    item.GoodCount = 0;
                    item.FairCount = 0;
                    item.PoorCount = 0;
                    item.VeryPoorCount = 0;
                    if (item.PatientFeedbackDetails.length > 0) {
                        for (var ddx in item.PatientFeedbackDetails) {
                            var details = item.PatientFeedbackDetails[ddx];
                            if (details.RatingId == 5) {
                                item.VeryGoodCount++;
                            }
                            if (details.RatingId == 4) {
                                item.GoodCount++;
                            }
                            if (details.RatingId == 3) {
                                item.FairCount++;
                            }
                            if (details.RatingId == 2) {
                                item.PoorCount++;
                            }
                            if (details.RatingId == 1) {
                                item.VeryPoorCount++;
                            }
                        }
                        if (details.Encounter) {
                            for (var enc in details.Encounter) {
                                var encounter = details.Encounter[enc];
                                if (encounter.WardMaster) {
                                    item.WardName = encounter.WardMaster.WardName
                                }
                            }
                        }
                    }
                    vm.gridConfig.data.push(item);
                }
            }
            // vm.gridConfig.data = res.Data;
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentfilter.FeedbackTypeId },
                    { Key: 2, Value: $scope.currentfilter.PatientId },
                    {
                        Key: 5,
                        Value: utl.Formatter.getFilterDate(From)
                    },
                    {
                        Key: 6,
                        Value: utl.Formatter.getFilterDate(To)
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/PatientFeedback/GetPatientFeedbacks',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        // $scope.openModal = function (Id) {
        //     utl.Modal.openFixedDialog('app.feedbackmaster', {
        //         params: { id: Id }, confirmCallback: $scope.initLookup
        //     }
        //     );
        // }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.patientfeedback', {
                params: {
                    id: Id
                    // pid: $scope.item.PatientId,
                    // eid: $scope.item.EncounterId
                },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.addNew = function () {
            $scope.openModal(0);
        }
        //Grid Actions
        // $scope.addNew = function() {
        //    $state.go('app.remark', { id:0 });  


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/FeedbacksMaster/DeleteFeedbacksMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                // $scope.openModal(entity.Id);
                $state.go('app.patientfeedback', { id:entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Code);
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "FeedbackOn",
                displayName: $translate.instant('Date'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.FeedbackOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.FeedbackOn| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>&nbsp;/<span>{{entity.Patient.MRN}}</span>&nbsp;/<span>{{entity.Patient.Age}}</span>&nbsp;/<span>{{entity.Patient.Gender.Description}}</span></a></div>"
            },
            {
                field: "Patient.MRN",
                displayName: $translate.instant('reports.mrn.lbl')
            },
            {
                field: "Encounter.EncounterType.Description",
                displayName: $translate.instant('Visit Type')
            },
            {
                field: "Encounter.WardMaster",
                displayName: $translate.instant('Ward/Room/Bed'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='entity.Encounter.WardMaster'>{{entity.Encounter.WardMaster.WardName }}</span>" +
                    "<span  ng-if='entity.Encounter.WardMaster'>/</span>" +
                    "<span  ng-if='entity.Encounter.WardRoomMaster'>{{entity.Encounter.WardRoomMaster.RoomNo }}</span>" +
                    "<span  ng-if='entity.Encounter.WardRoomMaster'>/</span>" +
                    "<span  ng-if='entity.Encounter.WardRoomBedMaster'>{{entity.Encounter.WardRoomBedMaster.BedNo}}</span>" +
                    "</div>"
            },
            // {
            //     field: "Encounter.DoctorName",
            //     displayName: $translate.instant('reports.doctorname.lbl')
            // },
            {
                field: "VeryPoorCount",
                displayName: $translate.instant('Poor')
            },
            {
                field: "PoorCount",
                displayName: $translate.instant('Fair')
            },
            {
                field: "FairCount",
                displayName: $translate.instant('Good')
            },
            {
                field: "GoodCount",
                displayName: $translate.instant('Very Good')
            },
            {
                field: "VeryGoodCount",
                displayName: $translate.instant('Excelent')
            },
            {
                field: "PatientFeedbackStatus.Description",
                displayName: $translate.instant('Status')
            },
            {
                field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
            </div>',
                handleEvent: $scope.handleEvents,
                actions: []
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
            var inputData = [
                { "Key": "Facility" },
                { "Key": "FeedbackType" },
                { "Key": "FeedbackCategory" },
                { "Key": "ActiveStatus" }
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

    feedbacksAnalyzerController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();