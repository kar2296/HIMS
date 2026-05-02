(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientfeedbacksFormNewController', patientfeedbacksFormNewController);

    function patientfeedbacksFormNewController($rootScope, $timeout, $scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, lodash) {
        var vm = this;
        $scope.item = {
            PatientFeedbackStatusId: 1
        };
        $scope.FeedbackDetails = [];
        $scope.item.PatientId = parseInt($stateParams.pid);
        $scope.item.EncounterId = parseInt($stateParams.eid);
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.context = $stateParams.context;
        $scope.IsCompleted = false;
        // $scope.currentcontext.encounter = utl.Session.getPatientEncounter();

        // if (modalConfig && modalConfig.params) {
        //     $scope.currentcontext.id = modalConfig.params.id;
        //     $scope.item.EncounterId = modalConfig.params.eid;
        //     $scope.item.PatientId = modalConfig.params.pid;
        //     $scope.currentcontext.context = modalConfig.params.context;
        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // }

        //Sign related code starts
        $scope.openSignModal = function() {
            utl.Modal.open('sign-modal', {
                params: {},
                confirmCallback: refreshSign
            });
        }

        function refreshSign(signatureData) {
            $scope.item.signimagedata = signatureData;
            if (signatureData) {
                $scope.item.signdata = signatureData.split(',')[1];
            }
        }
        //back
        
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function() {
                $state.go('patientemr.emrdashboard');
            }
            //Sign related code ends
        function loadFeedbacks() {
            for (var idx in $scope.lookup.FeedbackCategory) {
                var feedbackcategory = $scope.lookup.FeedbackCategory[idx];
                var feedbacks = [];
                for (var i in $scope.lookup.Feedbacks) {
                    var item = $scope.lookup.Feedbacks[i];
                    if (item.FeedbackCategoryId == feedbackcategory.Id) {
                        item.FeedbackMasterId = item.Id;
                        item.FeedbackTypeId = item.FeedbackTypeId;
                        item.Id = 0;
                        feedbacks.push(item)
                    }
                }
                feedbackcategory.Feedbacks = feedbacks;
                if (feedbacks.length != 0) {
                    $scope.FeedbackDetails.push(feedbackcategory);
                }
            }
        }
        $scope.getDetailCallback = function(scope, data, options, hasError) {
            $scope.FeedbackDetails = data.Data.reduce(function(res, currentValue) {
                if (res.indexOf(currentValue.FeedbackCategory.Description) === -1) {
                    res.push(currentValue.FeedbackCategory.Description);
                }
                return res;
            }, []).map(function(FeedbackCategory) {
                return {
                    FeedbackCategory: FeedbackCategory,
                    Feedbacks: data.Data.filter(function(_el) {
                        return _el.FeedbackCategory.Description === FeedbackCategory;
                    }).map(function(_el) { return _el })
                }
            });
            $scope.buttonVisibility();
        }
        $scope.getDetail = function() {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentcontext.id },
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'emr/PatientFeedbackDetails/GetPatientFeedbackDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailCallback
                };

                utl.Http.doAction(options);
            }
        }
        $scope.buttonVisibility = function() {
            if ($scope.item.PatientFeedbackStatusId == 1) {
                $scope.EnableSave = true;
                $scope.EnableApprove = true;
                $scope.EnableReview = false;
                $scope.EnableClear = true;
            } else if ($scope.item.PatientFeedbackStatusId == 2) {
                $scope.EnableSave = false;
                $scope.EnableApprove = false;
                $scope.EnableReview = true;
                $scope.EnableClear = false;
            } else if ($scope.item.PatientFeedbackStatusId == 3) {
                $scope.EnableSave = false;
                $scope.EnableApprove = false;
                $scope.EnableReview = false;
                $scope.EnableClear = false;
            }
        }
        $scope.clear = function() {
                $scope.FeedbackDetails = [];
                loadFeedbacks();
            }
            //GetUserSignPic
        $scope.getUserSignPicCallback = function(scope, data, options, hasError) {
            $scope.currentcontext.SignPhoto = data;
        };

        $scope.getUserSignPic = function() {
            if ($scope.item.SignPath) {
                var inputData = { SignPath: $scope.item.SignPath };
                var options = {
                    action: 'emr/patientfeedback/GetFeedbackSignPic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getUserSignPicCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.getDetail();
            $scope.getUserSignPic();
            $scope.IsCompleted = true;
        }
        $scope.getItem = function() {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/patientfeedback/GetPatientFeedbackById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };

                utl.Http.doAction(options);
            }
        }
        $scope.custom_sort = function(a, b) {
            return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
        }
        $scope.getEncounterCallback = function(scope, data, options, hasError) {
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            $scope.Encounter = data.Data[0];
        }
        $scope.getEncounter = function() {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.item.PatientId }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            // if ($scope.currentcontext.ismodal)
            inputData.Params = [{ Key: 0, Value: $scope.item.EncounterId }];
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        }

        function getLinesForSave() {
            var result = [];
            if ($scope.currentcontext.context == 'ippf') {
                for (var idx in $scope.FeedbackDetails) {
                    var feedbackcategory = $scope.FeedbackDetails[idx];
                    for (var i in feedbackcategory.Feedbacks) {
                        var item = feedbackcategory.Feedbacks[i];
                        item.FeedbackCategoryId = item.FeedbackCategoryId;
                        item.FeedbackMasterId = item.FeedbackMasterId;
                        item.FeedbackTypeId = 1;
                        item.RatingId = item.RatingId || -1;
                        item.PatientFeedbackStatusId = $scope.item.PatientFeedbackStatusId;
                        result.push(item);
                    }
                }
            }
            if ($scope.currentcontext.context == 'oppf') {
                for (var idx in $scope.FeedbackDetails) {
                    var feedbackcategory = $scope.FeedbackDetails[idx];
                    for (var i in feedbackcategory.Feedbacks) {
                        var item = feedbackcategory.Feedbacks[i];
                        item.FeedbackCategoryId = item.FeedbackCategoryId;
                        item.FeedbackMasterId = item.FeedbackMasterId;
                        item.FeedbackTypeId = 2;
                        item.RatingId = item.RatingId || -1;
                        item.PatientFeedbackStatusId = $scope.item.PatientFeedbackStatusId;
                        result.push(item);
                    }
                }
            }
            return result;
        }
        // $scope.backToList = function () {
        //     if ($scope.currentcontext.ismodal) {
        //         $scope.confirmCallback();
        //     } else
        //         $state.go('patientemr.patientfeedbacks');
        // }
        $scope.backToList = function() {
            if ($scope.currentcontext.context == 'ippf') {
                $state.go('app.ippatient-feedback');
            }
            if ($scope.currentcontext.context == 'oppf') {
                $state.go('app.patient-feedback');
            }
        }
        $scope.confirmation = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are you sure do you want to Complete this Feedback',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.review,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.openModal = function(Id) {
            utl.Modal.open('app.incidentservicerequest', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        }

        //Grid Actions
        $scope.previousincident = function() {
            // $state.go('app.location-form', { id: 0 });
            $scope.openList(0);
        }

        $scope.openList = function(Id) {
            utl.Modal.open('app.incidentservicerequests', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        }

        //Grid Actions
        $scope.incident = function() {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        $scope.savedraft = function() {
            $scope.saveItem(1);
        }
        $scope.saveapprove = function() {
            $scope.saveItem(2);
        }
        $scope.review = function() {
            $scope.saveItem(3);
        }
        $scope.saveItem = function(StatusId) {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            $scope.item.PatientFeedbackStatusId = StatusId;
            $scope.item.EncounterId = $scope.Encounter.Id;
            $scope.item.FacilityId = 1;
            $scope.item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
            $scope.item.WardId = $scope.Encounter.WardId;
            $scope.item.RoomId = $scope.Encounter.RoomId;
            $scope.item.BedId = $scope.Encounter.BedId;
            if ($scope.currentcontext.context == 'ippf') {
                $scope.item.FeedbackTypeId = 1;
            }
            if ($scope.currentcontext.context == 'oppf') {
                $scope.item.FeedbackTypeId = 2;
            }
            if ($scope.item.PatientFeedbackStatusId == 2)
                $scope.item.FeedbackOn = utl.Formatter.getCurrentDate();
            if ($scope.item.PatientFeedbackStatusId == 3) {
                $scope.item.ReviewedBy = utl.Session.getCurrentUserId();
                $scope.item.ReviewedOn = utl.Formatter.getCurrentDate();
            }
            $scope.item.Details = getLinesForSave();

            var actionName = 'emr/PatientFeedback/AddPatientFeedback';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/PatientFeedback/UpdatePatientFeedback';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadFeedbacks();
            $scope.getEncounter();
            $scope.getItem();
            $scope.buttonVisibility();
            //set default while adding alone
        }
        $scope.initLookup = function() {
            var ftype = 1;
            if ($scope.currentcontext.context == 'ippf') {
                ftype = 1;
            }
            if ($scope.currentcontext.context == 'oppf') {
                ftype = 2;
            }
            var inputData = [
                { "Key": "Rating", Default: false },
                { "Key": "FeedbackCategory", Default: false },
                // { "Key": "Feedbacks", Default: false },
                {
                    "Key": "Feedbacks",
                    Request: {
                        Params: [{ Key: 4, Value: 2 },
                            { Key: 3, Value: ftype }
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

    patientfeedbacksFormNewController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', 'lodash'];

})();