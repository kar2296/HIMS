(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PrescriptionP1Controller', PrescriptionP1Controller);

    function PrescriptionP1Controller($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentcontext = {};
        $scope.currentfilter = {
            pid: parseInt(utl.Session.getEMRPatientId()),
            CreatedDate: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };
        $scope.currentfilter = {
            ProfileId: '3,4,5'
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


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            // var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 2,
                        Value: $scope.currentcontext.eid
                    },
                    // {
                    //     Key: 6,
                    //     Value: FromDate
                    // },
                    // {
                    //     Key: 7,
                    //     Value: ToDate
                    // },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.context == 'emr') {
                inputData.Params.push({
                    Key: 11,
                    Value: 1
                })
            }
            if ($scope.context == 'ipemr') {
                inputData.Params.push({
                    Key: 11,
                    Value: $scope.currentfilter.ProfileId
                })
            }
            var options = {
                action: 'emr/PrescriptionPad/GetPrescriptionPads',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            }
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
        $scope.addNew = function () {
            $state.go('patientemr.prescriptionpadform', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/PrescriptionPad/DeletePrescriptionPad',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        //Download File
        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile = function (entity) {
            var inputData = {
                FilePath: entity.FilePath
            };
            var options = {
                action: 'emr/PrescriptionPad/GetDocumentFile',
                data: {
                    Data: inputData
                },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }

        $scope.checkedinpatients = function () {
            $state.go('app.inpatienttab.allinpatient');
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'view') {
                $state.go('patientemr.prescriptionpadform', {
                    id: entity.Id
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "PrescribedOn",
                    displayName: $translate.instant('patientemr.patientdocument-list.createddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PrescribedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.PrescribedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "PrescriptionType.Description",
                    displayName: $translate.instant('patientemr.patientdocument-list.doctype.lbl')
                },
                {
                    field: "CreatedBy",
                    displayName: $translate.instant('patientemr.patientdocument-list.updatedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.CreatedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.CreatedUser.LastName}}</span>" + "</div>"
                },
                // { field: "YesNo.Description", displayName: $translate.instant('patientemr.patientdocument-list.updatedby.lbl') },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [];

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

    PrescriptionP1Controller.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();