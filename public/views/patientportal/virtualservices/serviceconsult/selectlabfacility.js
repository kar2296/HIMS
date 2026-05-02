(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('SelectLabFacilityController', SelectLabFacilityController);

    function SelectLabFacilityController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.items = [];
        $scope.ctgryInfo = $stateParams.ctgryInfo;
        $scope.currentcontext.vcategoryid = $scope.ctgryInfo.VirtualCategory.Id;
        $scope.currentcontext.vsubcategoryid = $scope.ctgryInfo.Id;
        $scope.currentcontext.ctypeId = $scope.ctgryInfo.VirtualCategory.ConsultancyTypeId;
        $scope.item = {
            lat: '',
            lng: ''
        };
        $scope.selectlab = function(item) {
            $scope.ctgryInfo.SelectedFacilityId = item.Id;
            $scope.ctgryInfo.SelectedFacilityName = item.FacilityName;
            $scope.ctgryInfo.ResultFormatTypeId = item.ResultFormatTypeId;
            $state.go('patientportal.virtualserviceselection', {
                ctgryInfo: $scope.ctgryInfo,
                islab: true
            });
        }

        $scope.custom_sort = function(a, b) {
            return parseInt(a.km) - parseInt(b.km);
        };

        $scope.getFacilityCallback = function(scope, res, options, hasError) {
            $scope.VirtualFacility = res.Data;
            for (let i = 0; i < $scope.VirtualFacility.length; i++) {
                var a = new google.maps.LatLng($scope.item.lat, $scope.item.lng);
                var b = new google.maps.LatLng($scope.VirtualFacility[i].Lat, $scope.VirtualFacility[i].Lng);
                var distance = google.maps.geometry.spherical.computeDistanceBetween(a, b);
                var value = distance / 1000;
                console.log('value', distance);
                var labfac = {
                    Id: $scope.VirtualFacility[i].Id,
                    FacilityName: $scope.VirtualFacility[i].FacilityName,
                    AddressLine1: $scope.VirtualFacility[i].AddressLine1,
                    AddressLine2: $scope.VirtualFacility[i].AddressLine2,
                    Area: $scope.VirtualFacility[i].Area,
                    km: value,
                    ResultFormatTypeId: $scope.VirtualFacility[i].ResultFormatTypeId
                }
                $scope.items.push(labfac);
                $scope.items.sort($scope.custom_sort);
                console.log('km', $scope.items)
            }
        };

        $scope.getLocation = function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        }

        function showPosition(position) {
            $scope.item.lat = position.coords.latitude;
            $scope.item.lng = position.coords.longitude;
            $scope.getFacility();
            console.log('lat', $scope.item.lat)
        }

        $scope.getFacility = function() {
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 6,
                        Value: true
                    },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.name
                    }
                ]
            };

            var options = {
                action: 'SystemSettings/facility/GetOtherFacilitys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFacilityCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.items = res.Data;
        }

        $scope.getList = function() {
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 6,
                        Value: true
                    },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.name
                    }
                ]
            };

            var options = {
                action: 'SystemSettings/facility/GetOtherFacilitys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getLocation();
        // $scope.getFacility();
    }

    SelectLabFacilityController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();