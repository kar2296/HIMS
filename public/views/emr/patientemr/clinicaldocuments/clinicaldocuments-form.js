(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ClinicalDocumentFormController', ClinicalDocumentFormController);

    function ClinicalDocumentFormController($scope, $stateParams, $state, $translate, Upload, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            EncounterId: utl.Session.getEncounterId(),
            CreatedBy: utl.Session.getCurrentUserId(),
            CreatedDate: utl.Formatter.getCurrentDate(),
        };
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({ $scope: $scope }));

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            file: null,
            mrn: 'testing'
        };
        $scope.CanShowList = false;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
            $scope.currentcontext.from = modalConfig.params.from;
            $scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        console.log($scope.currentcontext);
        $scope.item.PatientId = $scope.currentcontext.pid;

        if (modalConfig && modalConfig.params.encounterid) {
            $scope.item.EncounterId = modalConfig.params.encounterid;
        }

        if (modalConfig && modalConfig.params.patientid) {
            $scope.item.PatientId = modalConfig.params.patientid;
        }

        $scope.getBannerCallback = function(scope, data, options, hasError) {
            $scope.item.MRN = data.MRN;
            //$scope.getImages(data);
        };

        $scope.getPatient = function() {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {

                var options = {
                    action: 'registration/patient/GetPatientBannerInfoById',
                    data: { Id: $scope.currentcontext.pid },
                    type: 'post',
                    onComplete: $scope.getBannerCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.getImages(data);
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/ClinicalDocument/GetClinicalDocumentById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getImagesCallback = function(scope, data, options, hasError) {
            $scope.item.Image = data.FilePath;
            // var clinicalimageid = data.Id;
            // var image = data.FilePath;
            // for (var idx in $scope.items) {
            //     var item = $scope.items[idx];
            //     if (item.Id == clinicalimageid) {
            //         item.Image = image;
            //     }
            // }
            // $scope.items.Image = data.FilePath
        };
        $scope.getImages = function(data) {
            if (data.FilePath) {
                var inputData = {
                    Id: data.Id,
                    FilePath: data.FilePath
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
        //Document attachment code starts
        $scope.fileSelected = function() {
                if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                    $scope.item.Name = $scope.currentcontext.file.name;
                }
            }
            //Document attachment code ends
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };
        $scope.saveItem = function() {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            var actionName = 'emr/ClinicalDocument/AddMultipleDocument';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/ClinicalDocument/UpdateClinicalDocument';
            }
            // console.log($scope.item);return;
            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName + '?MRN=' + $scope.item.MRN;
                console.log(actionUrl);
                Upload.upload({
                    url: actionUrl,
                    data: {
                        files: $scope.currentcontext.file,
                        Data: $scope.item,
                    },
                    files: $scope.currentcontext.file
                }).then(function(resp) { //upload function returns a promise
                        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                        $scope.currentcontext.file = null;
                        $scope.backToList();
                    },
                    function(resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function(evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: $scope.currentcontext.file
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $scope.confirmCallback();
        }

        $scope.getCurrentVisitListCallback = function(scope, res, options, hasError) {
            $scope.CanShowList = true;
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.item.PatientId },
                    { Key: 3, Value: $scope.item.EncounterId },
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

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'emr/ClinicalDocument/DeleteClinicalDocument',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

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

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'download') {
                $scope.downloadFile(entity);
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
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getPatient();
            if ($scope.currentcontext.from == 'billing') {
                $scope.getList();
            }
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "DocumentType" },
                { "Key": "YesNo", Default: false }
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

    ClinicalDocumentFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'Upload', 'utl', '$uibModalInstance', 'modalConfig'];

})();