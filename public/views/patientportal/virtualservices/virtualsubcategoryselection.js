(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualSubcategorySelectController', VirtualSubcategorySelectController);

    function VirtualSubcategorySelectController($scope, $stateParams, $state, $translate, utl, Upload) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        $scope.VirtualSubCategory = [];
        $scope.Banner = [];
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.categoryid = parseInt($stateParams.categoryid);
        $scope.currentcontext.CategoryInfo = $stateParams.ctgryInfo;
        $scope.CanShowLabResult = false;
        $scope.CanShowVaccineResult = false;
        $scope.CanShowConsultInfo = false;
        $scope.CanShowOxygenInfo = false;
        $scope.item = {};
        if ($scope.currentcontext.CategoryInfo.IsLabCategory) {
            $scope.CanShowLabResult = true;
        }
        if ($scope.currentcontext.CategoryInfo.IsVaccineOrders) {
            $scope.CanShowVaccineResult = true;
        }
        if ($scope.currentcontext.CategoryInfo.ConsultancyTypeId == 1) {
            $scope.CanShowConsultInfo = true;
        }
        if ($scope.currentcontext.CategoryInfo.Id == 6) {
            $scope.CanShowOxygenInfo = true;
        }

        $scope.currentcontext.FindTypeOptions = [{
            Id: 1,
            Text: $translate.instant('Find Specialities')
        },
        {
            Id: 2,
            Text: $translate.instant('Find Doctors')
        }
        ]
        $scope.item.FindTypeId = 1;

        $scope.canShowSpecialities = function () {
            return $scope.item.FindTypeId == 1;
        }

        $scope.canShowDoctors = function () {
            return $scope.item.FindTypeId == 2;
        }

        $scope.GetVirtualsubctgryimgCallback = function (scope, data, options, hasError) {
            var ctgryid = data.Id;
            var image = data.Image;
            for (var idx in $scope.VirtualSubCategory) {
                var item = $scope.VirtualSubCategory[idx];
                if (item.Id == ctgryid) {
                    item.Image = image;
                }
            }
        };

        $scope.GetVirtualsubctgryimg = function (item) {
            if (item.Imagepath) {
                var inputData = {
                    Id: item.Id,
                    Imagepath: item.Imagepath
                };
                var options = {
                    action: 'VirtualHealthcare/VirtualSubCategory/GetVirtualSubCategoryImage',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.GetVirtualsubctgryimgCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadImages() {
            for (var idx in $scope.VirtualSubCategory) {
                var item = $scope.VirtualSubCategory[idx];
                if (item.Imagepath) {
                    $scope.GetVirtualsubctgryimg(item);
                }
            }
        }


        $scope.getVirtualsubcategoryCallback = function (scope, res, options, hasError) {
            $scope.VirtualSubCategory = res.Data || [];
            loadImages();
        };

        $scope.getVirtualsubcategory = function (pageNo) {

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.categoryid
                },
                {
                    Key: 4,
                    Value: 2
                },
                {
                    Key: 3,
                    Value: $scope.currentcontext.specname
                },
                ],
            };



            $scope.getImagesCallback = function (scope, data, options, hasError) {
                var Bannerid = data.Id;
                var image = data.Attachment;
                for (var idx in $scope.Banner) {
                    var item = $scope.Banner[idx];
                    if (item.Id == Bannerid) {
                        item.Image = image;
                    }
                }
            };

            $scope.getImages = function (item) {
                if (item.Attachment) {
                    var inputData = {
                        Id: item.Id,
                        Attachment: item.Attachment
                    };
                    var options = {
                        action: 'VirtualHealthcare/BannerContent/GetAttachmentFile',
                        data: {
                            Data: inputData
                        },
                        type: 'post',
                        onComplete: $scope.getImagesCallback
                    };
                    utl.Http.doAction(options);
                }
            };
            function loadbannerImages() {
                for (var idx in $scope.Banner) {
                    var item = $scope.Banner[idx];
                    if (item.Attachment) {
                        $scope.getImages(item);
                    }
                }
            }
            $scope.getBannerCallback = function (scope, res, options, hasError) {
                $scope.Banner = res.Data || [];
                loadbannerImages();
            };



            $scope.getBanner = function () {

                var inputData = {
                    Params: [
                        {
                            Key: 2,
                            Value: $scope.currentcontext.categoryid
                        },
                    ],
                };
                var options = {
                    action: 'VirtualHealthcare/BannerContent/GetBannerContents',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBannerCallback
                };

                utl.Http.doAction(options);
            };

            var options = {
                action: 'VirtualHealthcare/VirtualSubCategory/GetVirtualSubCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVirtualsubcategoryCallback
            };

            utl.Http.doAction(options);
        };

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
        $scope.getUserSessionsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var sessioncount = 0;
                for (var jx in data.Data) {
                    var apnmntSession = data.Data[jx];
                    sessioncount++;
                    for (var idx in $scope.UserInfo) {
                        var item = $scope.UserInfo[idx];
                        if (item.Id == apnmntSession.DoctorId) {
                            if (sessioncount == 1) {
                                if (apnmntSession.StartTime) {
                                    item.AvailbleTimings = apnmntSession.StartTime;
                                }
                                if (apnmntSession.EndTime) {
                                    item.AvailbleTimings += ' To ' + apnmntSession.EndTime;
                                }
                            } else if (sessioncount > 1) {
                                if (apnmntSession.StartTime) {
                                    item.AvailbleTimings += ' & ' + apnmntSession.StartTime;
                                }
                                if (apnmntSession.EndTime) {
                                    item.AvailbleTimings += ' To ' + apnmntSession.EndTime;
                                }
                            }
                            if (sessioncount == 1) {
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
                            } else if (sessioncount > 1) {
                                if (apnmntSession.IsAll) {
                                    item.AvailableDays += ' & ' + 'Sun' + ',' + 'Mon' + ',' + 'Tue' + ',' + 'Wed' + ',' + 'Thur' + ',' + 'Fri' + ',' + 'Sat';
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
            }
        }

        $scope.getUserSessions = function (userData) {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: utl.Session.getCurrentFacilityId()
                },
                {
                    Key: 5,
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
                        item.DiscountModeId = consultcharge.DiscountModeId;
                        item.Discount = consultcharge.Discount;
                        item.Amount = consultcharge.Rate;
                        if (item.DiscountModeId == 1) {
                            item.DiscountAmt = item.Discount;
                        }
                        if (item.DiscountModeId == 2) {
                            item.DiscountAmt = ((item.Amount) * (item.Discount / 100));
                        }
                        item.ConsultAmt = (item.Amount) - (item.DiscountAmt || 0);
                        // $scope.getServiceDetails(consultcharge);
                    }
                }
            }
        }

        $scope.getDocTariffDetails = function (userData) {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: userData.FacilityId
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

        $scope.getServiceDetailsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var rateDetail = data.Data[0];
                for (var idx in $scope.UserInfo) {
                    var item = $scope.UserInfo[idx];
                    if (item.ServiceItemId == rateDetail.ServiceItemId) {
                        item.Amount = rateDetail.Rate;
                        if (item.DiscountModeId == 1) {
                            item.DiscountAmt = item.Discount;
                        }
                        if (item.DiscountModeId == 2) {
                            item.DiscountAmt = ((item.Amount) * (item.Discount / 100));
                        }
                        item.ConsultAmt = (item.Amount) - (item.DiscountAmt);
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
                Params: [{
                    Key: 2,
                    Value: 1
                }, {
                    Key: 1,
                    Value: $scope.currentcontext.name
                },
                {
                    Key: 5,
                    Value: 2
                },
                {
                    Key: 20,
                    Value: true
                },
                {
                    Key: 21,
                    Value: $scope.currentcontext.vcategoryid
                },
                {
                    Key: 22,
                    Value: $scope.currentcontext.vsubcategoryid
                },

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

        $scope.backToList = function () {
            $state.go('patientportal.virtualhealthcare');
        }

        $scope.home = function () {
            $state.go('patientportal.virtualhealthcare');
        }
        $scope.labresult = function () {
            $state.go('patientportal.virtuallabresults');
        }
        $scope.vaccineresult = function () {
            $state.go('patientportal.vaccineresults');
        }
        $scope.oxygenhistory = function () {
            $state.go('patientportal.oxygenhistory');
        }
        $scope.consulthstry = function () {
            $state.go('patientportal.consulthistory', {
                cid: $scope.currentcontext.categoryid
            });
        }
        $scope.bookapnmnt = function (item) {
            $state.go('patientportal.bookvirtualappointment', {
                docData: item,
                ctgryInfo: $scope.currentcontext.CategoryInfo,
                ctgryid: $scope.currentcontext.categoryid,
                ctypeId: $scope.currentcontext.CategoryInfo.ConsultancyTypeId
            });
        }
        $scope.selectorderInfo = function (item) {
            if (item.VirtualCategory.ConsultancyTypeId == 1) {
                $state.go('patientportal.virtualdoctorselection', {
                    ctgryInfo: item
                });
            }
            if (item.VirtualCategory.ConsultancyTypeId == 2) {
                if (item.VirtualCategory.IsLabCategory == true) {
                    $state.go('patientportal.selectlabfacility', {
                        ctgryInfo: item
                    });
                } else if (item.VirtualCategory.IsVaccineOrders == true) {
                    if (item.SubCategoryName.toLowerCase() == "vaccine card") {
                        $state.go('patientportal.vaccinecard', {
                            ctgryInfo: item
                        });
                    } else {
                        $state.go('patientportal.selectvaccinecenters', {
                            ctgryInfo: item
                        });
                    }
                } else if (item.VirtualCategory.Id == 6) {
                    $state.go('patientportal.selectoxygenproviders', {
                        ctgryInfo: item
                    });
                } else {
                    $state.go('patientportal.virtualserviceselection', {
                        ctgryInfo: item
                    });
                }
            }

        };
        $scope.getVirtualsubcategory();
        $scope.getUsers();
        $scope.getBanner();

    }

    VirtualSubcategorySelectController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();