(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientFeedbackFormController', PatientFeedbackFormController);

    function PatientFeedbackFormController($rootScope, $scope, $timeout, $stateParams, $state, $translate, utl, Upload, $cookies) {
        var vm = this;

        $scope.item = {
            PatientFeedbackStatusId: 1
        };
        $scope.FeedbackDetails = [];

        angular.extend(this, utl.Ctrl.getValidationCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({
            $scope: $scope
        }));

        $scope.item = {
            CountryId: 1
        };
        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.item.PatientId=$stateParams.id;

        $scope.currentcontext.isnew = $stateParams.isnew;

        // $scope.currentcontext.id = modalConfig.params.id;
        // $scope.item.EncounterId = modalConfig.params.eid;
        // $scope.item.PatientId = modalConfig.params.pid;
        // $scope.currentcontext.context = modalConfig.params.context;
        // $scope.confirmCallback = $uibModalInstance.close;
        // $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.CanShowVerifyOtp = false;
        //logout
        $scope.logoutCallback = function(scope, res, options, hasError) {
            var cookies = $cookies.getAll();
            angular.forEach(cookies, function(v, k) {
                $cookies.remove(k, {
                    path: '/'
                });
            });
            $state.go('page.login');
        };
        $scope.logout = function() {
            var options = {
                action: 'auth/logout',
                data: null,
                type: 'post',
                onComplete: $scope.logoutCallback
            };
            utl.Http.doAction(options);
        };
        
        $scope.PatInfoCallback = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            if ($scope.selectedPatient.Title) {
                $scope.item.Title = $scope.selectedPatient.Title.Description;
            }
            $scope.item.PatientId = $scope.selectedPatient.Id;
            $scope.item.FirstName = $scope.selectedPatient.FirstName;
            $scope.item.LastName = $scope.selectedPatient.LastName;
            $scope.item.Age = $scope.selectedPatient.Age;
            $scope.item.DOB = $scope.selectedPatient.DOB;
            $scope.item.Mobile = $scope.selectedPatient.Mobile;
            $scope.item.MRN = $scope.selectedPatient.MRN;
            $scope.item.PhotoPath = $scope.selectedPatient.PhotoPath;
            if ($scope.selectedPatient.Gender) {
                $scope.item.Gender = $scope.selectedPatient.Gender.Description;
            }
            if ($scope.selectedPatient.Encounters) {
                if ($scope.selectedPatient.Encounters.length > 0) {
                    for (var idxencounter in $scope.selectedPatient.Encounters) {
                        var encounters = $scope.selectedPatient.Encounters[idxencounter];
                        $scope.item.EncounterId = encounters.Id;
                    }
                }
            }
            $scope.getPatientProfilePic();
          
        };
        $scope.patientChange = function (pageNo) {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.PatInfoCallback
                };
                utl.Http.doAction(options);
            }
        };
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

        $scope.getDetailCallback = function (scope, data, options, hasError) {
            $scope.FeedbackDetails = data.Data.reduce(function (res, currentValue) {
                if (res.indexOf(currentValue.FeedbackCategory.Description) === -1) {
                    res.push(currentValue.FeedbackCategory.Description);
                }
                return res;
            }, []).map(function (FeedbackCategory) {
                return {
                    FeedbackCategory: FeedbackCategory,
                    Feedbacks: data.Data.filter(function (_el) {
                        return _el.FeedbackCategory.Description === FeedbackCategory;
                    }).map(function (_el) { return _el })
                }
            });
            $scope.buttonVisibility();
        }
        $scope.getDetail = function () {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.item.PatientId },
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
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getDetail();
            $scope.getUserSignPic();
            $scope.IsCompleted = true;
        }
        $scope.getItem = function () {
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
        $scope.custom_sort = function (a, b) {
            return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
        }
        $scope.getEncounterCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            $scope.Encounter = data.Data[0];
        }
        $scope.getEncounter = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.item.PatientId }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if ($scope.currentcontext.ismodal)
                inputData.Params = [{ Key: 0, Value: $scope.item.EncounterId }];
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadFeedbacks();
            $scope.getEncounter();
            $scope.getItem();
            $scope.buttonVisibility();

            $scope.patientChange ();
            $scope.getDetail();
           // loadFeedbacks();
            //set default while adding alone
        }
        function getLinesForSave() {
            var result = [];
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
            return result;
        }
        $scope.openSignModal = function () {
            utl.Modal.open('sign-modal', {
                params: {},
                confirmCallback: refreshSign
            }
            );
        }
        $scope.doneAction = function () {
            var signature = $scope.accept();
            if (signature.isEmpty) {
                $scope.cancelCallback();
            } else {
                $scope.confirmCallback(signature.dataUrl);
            }
        }

        function refreshSign(signatureData) {
            $scope.item.signimagedata = signatureData;
            if (signatureData) {
                $scope.item.signdata = signatureData.split(',')[1];
            }
        }
        $scope.backTootp = function () {
            $state.go('app.patient-feedbackotpverification');
         }
        $scope.backToList = function () {
            $state.go('app.patient-feedback');
         }
         $scope.home = function () { 
            $state.go('app.patient-feedback');
            
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function (StatusId) {
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
            $scope.item.FeedbackTypeId = 2;
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
       
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Rating", Default: false },
                { "Key": "FeedbackCategory", Default: false },
                // { "Key": "Feedbacks", Default: false },
                {
                    "Key": "Feedbacks", Request: {
                        Params: [{ Key: 4, Value: 2 },
                        { Key: 3, Value: 2 }]
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

    PatientFeedbackFormController.$inject = ['$rootScope', '$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$cookies'];

})();