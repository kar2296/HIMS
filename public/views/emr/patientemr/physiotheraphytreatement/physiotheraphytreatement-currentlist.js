(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PhysiotheraphycurrentlistController', PhysiotheraphycurrentlistController);

    function PhysiotheraphycurrentlistController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentcontext = {};
        $scope.currentfilter = {
            pid: parseInt(utl.Session.getEMRPatientId()),
            CreatedDate: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate(),
            PhysiotheraphyStatusId: -1,
            TreatementModalityId: -1,
        };


        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());



        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.currentpatient = function () {
            $state.go('app.bedmanagementtab.inpatient');
        };


        $scope.getCurrentVisitListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentcontext.eid },
                    // { Key: 8, Value: $scope.currentfilter.TreatementModalityId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            }
            if ($scope.currentfilter.TreatementModalityId > 0) {
                inputData.Params.push({ Key: 8, Value: $scope.currentfilter.TreatementModalityId })
            }
            var options = {
                action: 'emr/PhysiotheraphyTreatement/GetPhysiotheraphyTreatements',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCurrentVisitListCallback
            }
            utl.Http.doAction(options);
        };

        $('.filters > i.icofont-filter').click(function () {
            $(this).find('i.icofont-filter').toggleClass('fa-plus fa-minus')
                .closest('panel').siblings('panel')
                .find('i.icofont-filter')
                .removeClass('fa-minus').addClass('fa-plus');
            $("#collapseOne").toggle();
        });

        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.openFixedDialog('patientemr.physiotheraphytab.physiotheraphytreatement', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }

        $scope.Addtreatementmodality = function () {
            utl.Modal.open('patientemr.physiotheraphytab.treatementmodality', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            }
            );
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/PhysiotheraphyTreatement/DeletePhysiotheraphyTreatement',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }


        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'view') {
                utl.Modal.open('patientemr.physiotheraphytab.physiotheraphytreatement', {
                    params: { id: entity.Id, pid: entity.PatientId, eid: entity.EncounterId },
                    // confirmCallback: $scope.getList
                });
                // $state.go('app.surgeryscheduleform', { id: entity.Id, pid: entity.PatientId, eid: entity.EncouterId });
                // $scope.downloadFile(entity);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "PhysiotheraphyDate", displayName: $translate.instant('patientemr.physiotheraphy.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PhysiotheraphyDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.PhysiotheraphyDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "TreatementModality.ModalityName", displayName: $translate.instant('patientemr.physiotheraphy.treatementmodality.lbl') },
                {
                    field: "Time", displayName: $translate.instant('patientemr.physiotheraphy.timestart.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StartTime| date: 'HH:mm'}}&nbsp;{{entity.EndTime| date: 'HH:mm'}}</span>" + "</div>"
                },
                // {
                //     field: "EndTime", displayName: $translate.instant('patientemr.physiotheraphy.timeend.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.EndTime| date: 'HH:mm'}}</span>" + "</div>"
                // },
                { field: "Duration", displayName: $translate.instant('patientemr.physiotheraphy.duration(mins).lbl') },
                { field: "BP", displayName: $translate.instant('patientemr.physiotheraphy.bpmmhg.lbl') },
                { field: "RBSFBS", displayName: $translate.instant('patientemr.physiotheraphy.rbs/fbs.lbl') },
               {
                    field: "PhysiotherapistUser",
                    displayName: $translate.instant('patientemr.physiotheraphy.physiotherapist.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PhysiotherapistUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.PhysiotherapistUser.FirstName}}&nbsp;</span>" + "<span >{{entity.PhysiotherapistUser.LastName}}</span>" + "</div>"
                },
                { field: "ClinicNotes", displayName: $translate.instant('Clinic Notes') },


                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><i class="icofont-ui-delete" aria-hidden="true"></i></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "TreatementModality" },
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

    PhysiotheraphycurrentlistController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();