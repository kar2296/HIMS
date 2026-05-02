(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FeedbackCategorySelectController', FeedbackCategorySelectController);

    function FeedbackCategorySelectController($scope, $stateParams, $state, $translate, utl, Upload) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        var vm = this;
        $scope.UserInfo = [];
        $scope.ctgryInfo = $stateParams.ctgryInfo;
        $scope.currentcontext = {};
      //  $scope.currentcontext.vcategoryid = $scope.ctgryInfo.VirtualCategory.Id;
       // $scope.currentcontext.vsubcategoryid = $scope.ctgryInfo.Id;
        //$scope.currentcontext.ctypeId = $scope.ctgryInfo.VirtualCategory.ConsultancyTypeId;

        $scope.loaduserimages = function () {
            for (var idx in $scope.UserInfo) {
                var userData = $scope.UserInfo[idx];
                if (userData.PhotoPath) {
                    $scope.getUserProfilePic(userData);
                }
            }
        }

        $scope.getUserProfilePicCallback = function (scope, data, options, hasError) {
            var userId = data.Id;
            var photo = data.Photo;
            for (var idx in $scope.UserInfo) {
                var item = $scope.UserInfo[idx];
                if (item.Id == userId) {
                    item.Photo = photo;
                }
            }
        };

        $scope.getUserProfilePic = function (item) {
            if (item.PhotoPath) {
                var inputData = {
                    Id: item.Id,
                    PhotoPath: item.PhotoPath
                };
                var options = {
                    action: 'SystemSettings/User/GetUserProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getUserProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.loadapntsession = function () {
            for (var idx in $scope.UserInfo) {
                var userData = $scope.UserInfo[idx];
                $scope.getUserSessions(userData);
            }
        };
        $scope.home = function () {
            $state.go('patientportal.virtualhealthcare');
        }
        $scope.backToList = function () {
            $state.go('patientportal.virtualsubcategoryselection', {
                categoryid: $scope.currentcontext.vcategoryid
            });
        }
        $scope.getUserSessionsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var apnmntSession = data.Data[0];
                for (var idx in $scope.UserInfo) {
                    var item = $scope.UserInfo[idx];
                    if (item.Id == apnmntSession.DoctorId) {
                        if (apnmntSession.StartTime) {
                            item.AvailbleTimings = apnmntSession.StartTime;
                        }
                        if (apnmntSession.EndTime) {
                            item.AvailbleTimings += ' To ' + apnmntSession.EndTime;
                        }
                        if (apnmntSession.IsAll) {
                            item.AvailableDays = 'Sun' + ',' + 'Mon' + ',' + 'Tue' + ',' + 'Wed' + ',' + 'Thur' + ',' + 'Fri' + ',' + 'Sat';
                        }
                        if (!apnmntSession.IsAll) {
                            if (apnmntSession.IsSunday) {
                                item.AvailableDays = 'Sun';
                            }
                            if (apnmntSession.IsMonday) {
                                if (!item.AvailableDays) {
                                    item.AvailableDays = 'Mon';
                                } else {
                                    item.AvailableDays += ',' + 'Mon';
                                }
                            }
                            if (apnmntSession.IsTuesday) {
                                if (!item.AvailableDays) {
                                    item.AvailableDays = 'Tue';
                                } else {
                                    item.AvailableDays += ',' + 'Tue';
                                }
                            }
                            if (apnmntSession.IsWednesday) {
                                if (!item.AvailableDays) {
                                    item.AvailableDays = 'Wed';
                                } else {
                                    item.AvailableDays += ',' + 'Wed';
                                }
                            }
                            if (apnmntSession.IsThursday) {
                                if (!item.AvailableDays) {
                                    item.AvailableDays = 'Thur';
                                } else {
                                    item.AvailableDays += ',' + 'Thur';
                                }
                            }
                            if (apnmntSession.IsFriday) {
                                if (!item.AvailableDays) {
                                    item.AvailableDays = 'Fri';
                                } else {
                                    item.AvailableDays += ',' + 'Fri';
                                }
                            }
                            if (apnmntSession.IsSaturday) {
                                if (!item.AvailableDays) {
                                    item.AvailableDays = 'Sat';
                                } else {
                                    item.AvailableDays += ',' + 'Sat';
                                }
                            }
                        }
                    }
                }
            }
        }

        $scope.getUserSessions = function (userData) {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: utl.Session.getCurrentFacilityId()
                },
                {
                    Key: 9,
                    Value: userData.Id
                },

                ],
            };
            var options = {
                action: 'appointment/AppointmentMultiSession/GetAppointmentMultiSessions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getUserSessionsCallback
            };

            utl.Http.doAction(options);
        }

        $scope.loadDocTariff = function () {
            for (var idx in $scope.UserInfo) {
                var userData = $scope.UserInfo[idx];
                $scope.getDocTariffDetails(userData);
            }
        };

        $scope.getDocTariffDetailsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var consultcharge = data.Data[0];
                for (var idx in $scope.UserInfo) {
                    var item = $scope.UserInfo[idx];
                    if (item.Id == consultcharge.UserId) {
                        item.ServiceItemId = consultcharge.ServiceItemId;
                        item.Amount = rateDetail.Rate;
                        if (item.DiscountModeId == 1) {
                            item.DiscountAmt = item.Discount;
                        }
                        if (item.DiscountModeId == 2) {
                            item.DiscountAmt = ((item.Amount) * (item.Discount / 100));
                        }
                        item.ConsultAmt = (item.Amount) - (item.DiscountAmt);
                        // $scope.getServiceDetails(consultcharge);
                    }
                }
            }
        }

        $scope.getDocTariffDetails = function (userData) {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: utl.Session.getCurrentFacilityId()
                },
                {
                    Key: 2,
                    Value: userData.Id
                },

                ],
            };
            var options = {
                action: 'SystemSettings/userdefaultservice/GetUserDefaultServices',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDocTariffDetailsCallback
            };

            utl.Http.doAction(options);
        }

        $scope.getDocTariffDetailsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var consultcharge = data.Data[0];
                for (var idx in $scope.UserInfo) {
                    var item = $scope.UserInfo[idx];
                    if (item.Id == consultcharge.UserId) {
                        // item.ServiceItemId = consultcharge.ServiceItemId;
                        item.Amount = consultcharge.Rate;
                        if (consultcharge.DiscountModeId == 1) {
                            item.DiscountAmt = consultcharge.Discount;
                        }
                        if (consultcharge.DiscountModeId == 2) {
                            item.DiscountAmt = ((item.Amount) * (consultcharge.Discount / 100));
                        }
                        item.ConsultAmt = (item.Amount) - (item.DiscountAmt || 0);
                        // $scope.getServiceDetails(consultcharge);
                    }
                }
            }
        }

        $scope.getServiceDetails = function (consultcharge) {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: consultcharge.ServiceItemId
                },
                {
                    Key: 5,
                    Value: utl.Session.getCurrentFacilityId()
                },

                ],
            };
            var options = {
                action: 'clinicalmaster/serviceitemtariffdetail/GetServiceItemTariffDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getServiceDetailsCallback
            };

            utl.Http.doAction(options);
        }
        $scope.getUsersCallback = function (scope, res, options, hasError) {
            $scope.UserInfo = res.Data;
            $scope.loadapntsession();
            $scope.loaduserimages();
            $scope.loadDocTariff();
        };

        $scope.getUsers = function () {
            var inputData = {
                Params: [
                //     {
                //     Key: 2,
                //     Value: utl.Session.getCurrentFacilityId()
                // },
                // {
                //     Key: 1,
                //     Value: $scope.currentcontext.name
                // },
                {
                    Key: 5,
                    Value: 2
                },
                // {
                //     Key: 20,
                //     Value: true
                // },
                // {
                //     Key: 21,
                //     Value: $scope.currentcontext.vcategoryid
                // },
                // {
                //     Key: 22,
                //     Value: $scope.currentcontext.vsubcategoryid
                // },

                ],
            };
            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getUsersCallback
            };

            utl.Http.doAction(options);
        };

        $scope.bookapnmnt = function (item) {
            $state.go('app.bookfeedbackvirtualappointment', { 
                docData: item,
                ctgryInfo: $scope.ctgryInfo,
                ctgryid: $scope.currentcontext.vcategoryid,
                subctgryid: $scope.currentcontext.vsubcategoryid,
                ctypeId: $scope.currentcontext.ctypeId
            });
        }

        $scope.getUsers();

    }

    FeedbackCategorySelectController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();