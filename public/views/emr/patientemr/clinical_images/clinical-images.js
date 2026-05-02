(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ClinicalImagesListController', ClinicalImagesListController);

    function ClinicalImagesListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentcontext = {};
        $scope.AttachementImgs = [];
        $scope.currentfilter = {
            pid: parseInt(utl.Session.getEMRPatientId()),
            CreatedDate: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };

        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.items = [];
        // $scope.currentcontext = {
        //     option: 'currentvisits'
        // }
        // angular.extend(this, utl.Ctrl.getEMRBaseCtrl({ $scope: $scope }));

        // if ($stateParams.context) {
        //     $scope.context = $stateParams.context;
        // }
        // if ($stateParams.pid)
        //     $scope.currentcontext.pid = $stateParams.pid;
        // else
        //     $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        // if ($stateParams.eid)
        //     $scope.currentcontext.eid = $stateParams.eid;
        // else
        //     $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

        // $scope.options = [{
        //     key: 'currentvisits',
        //     name: $translate.instant('Current Visits')
        //     // title: $translate.instant('Current Visits'),
        //     // state: 'patientemr.clinicaldocumentlist',
        //     // canDisable: false
        // },
        // {
        //     key: 'previousvisits',
        //     name: $translate.instant('Previous Visits')
        //     // state: 'patientemr.previousdocuments',
        //     // canDisable: canDisableTab
        // },
        // ];
        // $scope.switchTab = function (tab) {
        //     if (!canDisableTab) {
        //         $state.go(tab.state);
        //     }
        // }
        // $scope.canShowSurrentVisits = function () {
        //     return $scope.currentcontext.tabs == 'currentvisits';
        // };

        // $scope.canShowPreviousVisits = function () {
        //     return $scope.currentcontext.tabs == 'previousvisits';
        // };

        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        }


        $scope.getCurrentVisitListCallback = function(scope, res, options, hasError) {
            $scope.items = [];
            for (var idx in res.Data) {
                var clinicaldata = res.Data[idx];
                if (clinicaldata.FilePath) {
                    $scope.getImages(clinicaldata);
                }
                $scope.items.push(clinicaldata);
            }
        };

        $scope.getList = function() {
            // var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    // { Key: 3, Value: $scope.currentcontext.eid },
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
            }

            var options = {
                action: 'emr/ClinicalDocument/GetClinicalDocuments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCurrentVisitListCallback
            }
            utl.Http.doAction(options);
        };

        //back
        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function() {
                $state.go('patientemr.emrdashboard');
            }
            //Grid Actions
        $scope.addNew = function() {
            utl.Modal.open('patientemr.clinicaldocumenttab.clinicaldocument', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }
        $scope.changeimage = function(item) {
            utl.Modal.open('patientemr.clinicaldocumenttab.clinicalimages', {
                params: { id: item.Id },
                confirmCallback: $scope.getList
            });
        }
        $scope.getImagesCallback = function(scope, data, options, hasError) {
            // item.Image = data.FilePath;
            var clinicalimageid = data.Id;
            var image = data.FilePath;
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clinicalimageid) {
                    item.Image = image;
                }
            }
            // $scope.items.Image = data.FilePath
        };
        $scope.getImages = function(item) {
            if (item.FilePath) {
                var inputData = {
                    Id: item.Id,
                    FilePath: item.FilePath
                };
                var options = {
                    action: 'emr/ClinicalDocument/GetAttachmentFile',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getImagesCallback
                };
                utl.Http.doAction(options);
            }
        };
        // $scope.getImages = function (items) {
        //     if (items.FilePath) {

        //         var options = {
        //             action: 'emr/ClinicalDocument/GetAttachmentFile',
        //             data: {
        //                 Data: entity.FilePath
        //             },
        //             type: 'post',
        //             onComplete: $scope.getImagesCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };

        //Download File
        $scope.downloadFileCallback = function(scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile = function(entity) {
            var inputData = { FilePath: entity.FilePath };
            var options = {
                action: 'emr/ClinicalDocument/GetDocumentFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }

        $scope.checkedinpatients = function() {
            $state.go('app.inpatienttab.allinpatient');
        };

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'download') {
                // $scope.downloadFile(entity);
                $scope.getImages(entity);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "CreatedDate",
                    displayName: $translate.instant('patientemr.patientdocument-list.createddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.CreatedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "DocumentType.Description", displayName: $translate.instant('patientemr.patientdocument-list.doctype.lbl') },
                { field: "Name", displayName: $translate.instant('patientemr.patientdocument-list.docview.lbl') },
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
                    <span class="grid-action" ng-click="handleEvents(\'download\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 1000 }
        };

        $scope.dashboard = function() {
            $state.go('patientemr.patientdashboard');
        }

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            // $scope.getImages();
        }

        $scope.initLookup = function() {
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

    ClinicalImagesListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();