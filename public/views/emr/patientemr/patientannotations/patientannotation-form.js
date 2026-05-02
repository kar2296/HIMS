(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientAnnotationFormController', patientAnnotationFormController);

    function patientAnnotationFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, Upload, $timeout) {
        var vm = this;

        $scope.item = {
            EncounterId: utl.Session.getEncounterId(),
            PerformedDate: utl.Formatter.getCurrentDate(),
            PerformedBy: utl.Session.getCurrentUserId()
        };
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.id = parseInt($stateParams.id);
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        }

        $scope.item.PatientId = $scope.currentcontext.pid;

        //convert to image
        $scope.exportImage = function () {
            var offScreen = document.getElementById('annroot');

            // Clone off-screen element
            var clone = hiddenClone(offScreen);

            // Use clone with htm2canvas and delete clone
            html2canvas(clone, {
                onrendered: function (canvas) {
                    //document.body.appendChild(canvas);
                    //document.body.removeChild(clone);

                    var data = canvas.toDataURL();
                    var docDefinition = {
                        content: [{
                            image: data,
                            width: 500,
                        }]
                    };
                    pdfMake.createPdf(docDefinition).download("Annotation.pdf");

                    document.body.removeChild(clone);
                    //document.body.removeChild(canvas);
                }
            });
        }

        function hiddenClone(element) {
            // Create clone of element
            var clone = element.cloneNode(true);

            // Position element relatively within the 
            // body but still out of the viewport
            var style = clone.style;
            style.position = 'relative';
            style.top = window.innerHeight + 'px';
            style.left = 0;
            style.fontSize = "25px";
            style.fontWeight = "bold";
            style.fontColor = "black";

            // Append clone to body and return the clone
            document.body.appendChild(clone);
            return clone;
        }


        //get annotation by id
        $scope.getAnnotationImageCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
            anno.reset();
            $timeout(applyAnnotations, 500);
        };

        $scope.getAnnotationImage = function () {
            var inputData = { Id: $scope.currentcontext.id, FilePath: $scope.item.FilePath };
            var options = {
                action: 'emr/patientannotation/GetAnnotationFile',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.getAnnotationImageCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.iswebcamphoto = false;  
            $scope.getAnnotationImage();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/patientannotation/GetPatientAnnotationById',
                    data: { Id: $scope.currentcontext.id, PatientId: $scope.currentcontext.pid },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, utl.Session.getCurrentUserId());
                if (doctorObj) {
                    $scope.item.PerformedBy = doctorObj.Id;
                }
            }
        };

        $scope.canShowSaveBtn = function() {
            return $scope.currentcontext.id <= 0;
        }

        $scope.canShowReviewBtn = function() {
            return $scope.item.AnnotationStatusId == 1;
        }

        $scope.canShowClearBtn = function() {
            return $scope.item.AnnotationStatusId != 2;
        }

        $scope.canShowCancelBtn = function() {
            return true;
        }

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('patientemr.patientannotations', { pid: $scope.currentcontext.pid });
            }
        }
        $scope.clear = function () {
            $scope.item.AnnotationTypeId = null;
            $scope.item.PerformedBy = null;
            $scope.item.Comments = null;
            $scope.currentcontext.file = null;
            $scope.currentcontext.Photo = null;
        };
        $scope.photoFileChanged = function () {
            $scope.item.iswebcamphoto = false;
            $scope.item.webcamphoto = '';
        }
        $scope.saveDraft = function () {
            $scope.item.AnnotationStatusId = 2;
            $scope.saveItem();
        }
        $scope.onreview = function () {
            $scope.item.AnnotationStatusId = 3;
            $scope.saveItem();
        }
        $scope.review = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want To Review This Annotation?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onreview,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            anno.removeAll();
            $scope.backToList();
        };

        $scope.saveItem = function () {
            
            var actionName = 'emr/patientannotation/AddPatientAnnotation';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/patientannotation/UpdatePatientAnnotation';
            }
            else{
                if (!$scope.currentcontext.file && !$scope.item.webcamphoto) {
                utl.Alert.showErrorMsg($translate.instant('patientemr.patientdocument-form.nofilemsg.lbl'));
                return;
                }
            }
            var annotations = {
                value: anno.getAnnotations()
            }
            for(var idx in annotations.value) {
                var annotationObj = annotations.value[idx];
                annotationObj.src = "ann-img1";
            }

            $scope.item.Annotations = JSON.stringify(annotations);

            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;

                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function (resp) { //upload function returns a promise
                    if (!(resp.data < 0)) {
                        $scope.saveItemCallback();
                    }
                },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: { Data: $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function webcamSuccess(base64String) {
            $scope.item.iswebcamphoto = true;
            $scope.item.webcamphoto = base64String;
            $scope.currentcontext.file = null;
        }

        $scope.openWebCam = function () {
            utl.Modal.open('webcam-modal', {
                params: { pid: $scope.currentcontext.id },
                confirmCallback: webcamSuccess
            });
        }

        function applyAnnotations() {
            if($scope.item.Annotations) {
                var annotations = JSON.parse($scope.item.Annotations);
                for(var idx in annotations.value) {
                    var annotationObj = annotations.value[idx];
                    console.log(annotationObj);
                    anno.addAnnotation(annotationObj);
                    annotationObj.src = "ann-img1";
                }
            }   
        }
        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AnnotationType" },
                { "Key": "AnnotationStatus" },
                { "Key": "User" }
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

    patientAnnotationFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'Upload', '$timeout'];

})();