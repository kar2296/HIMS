(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drsharerevenuesummarybydoctorController', drsharerevenuesummarybydoctorController);

    function drsharerevenuesummarybydoctorController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        }

        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.DoctorInfo = res;
            $scope.doctor = [];
            $scope.totdoctor = [];
            $scope.opdoctor = [];
            $scope.totopdoctor = [];
            $scope.ipdoctor = [];
            $scope.totipdoctor = [];
            $scope.drsharedoctor = [];
            $scope.totdrsharedoctor = [];
            $scope.providersharedoctor = [];
            $scope.totprovidersharedoctor = [];
            $scope.grossdrsharedoctor = [];
            $scope.totgrossdrsharedoctor = [];
            $scope.tdssharedoctor = [];
            $scope.tottdssharedoctor = [];
            if ($scope.DoctorInfo) {
                var opdoctorcollection = [];
                var ipdoctorcollection = [];
                var directdoctorcollection = [];
                var drsharedoctorcollection = [];
                var providersharedoctorcollection = [];
                var grossdrsharedoctorcollection = [];
                var tdssharedoctorcollection = [];

                if ($scope.DoctorInfo.length > 0)
                    opdoctorcollection = $scope.DoctorInfo[0].Value;
                if ($scope.DoctorInfo.length > 1)
                    ipdoctorcollection = $scope.DoctorInfo[1].Value;
                if ($scope.DoctorInfo.length > 2)
                    directdoctorcollection = $scope.DoctorInfo[2].Value;
                if ($scope.DoctorInfo.length > 3)
                    providersharedoctorcollection = $scope.DoctorInfo[3].Value;
                if ($scope.DoctorInfo.length > 4)
                    grossdrsharedoctorcollection = $scope.DoctorInfo[4].Value;
                if ($scope.DoctorInfo.length > 5)
                    tdssharedoctorcollection = $scope.DoctorInfo[5].Value;
                if ($scope.DoctorInfo.length > 6)
                    drsharedoctorcollection = $scope.DoctorInfo[6].Value;

                var opTotNetAmt = 0;
                for (var idx in opdoctorcollection) {
                    var coll = opdoctorcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName)
                            if (coll[idx].DoctorName.Title)
                                $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    opTotNetAmt += NetAmt;
                    $scope.opdoctor.push({
                        'Key': key,
                        'Value': NetAmt
                    });
                    $scope.doctor.push({
                        'Key': key,
                        'Value': {
                            'OP': NetAmt,
                            'IP': 0.00,
                            'DrShare': 0.00,
                            'GrossDoctorShare': 0.00,
                            'ProviderShare': 0.00,
                            'TDSAmount': 0.00,
                        }
                    });
                }
                $scope.totopdoctor.push({
                    'Key': 'Total',
                    'Value': opTotNetAmt
                });
                var ipTotNetAmt = 0;
                for (var idx in ipdoctorcollection) {
                    var coll = ipdoctorcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName)
                            if (coll[idx].DoctorName.Title)
                                $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    ipTotNetAmt += NetAmt;
                    $scope.ipdoctor.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.doctor.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.IP = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.doctor.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': NetAmt,
                                'DrShare': 0.00,
                                'GrossDoctorShare': 0.00,
                                'ProviderShare': 0.00,
                                'TDSAmount': 0.00,
                            }
                        });

                }
                $scope.totipdoctor.push({
                    'Key': 'Total',
                    'Value': ipTotNetAmt
                });

                var directbillamt = 0;
                var opwithdirectamt = 0;
                for (var idx in directdoctorcollection) {
                    var coll = directdoctorcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName)
                            $scope.docName = coll[idx].DoctorName;

                        key = $scope.docName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    directbillamt += NetAmt;

                    $scope.opdoctor.push({
                        'Key': key,
                        'Value': NetAmt
                    });
                    $scope.doctor.push({
                        'Key': key,
                        'Value': {
                            'OP': NetAmt,
                            'IP': 0.00,
                            'DrShare': 0.00,
                            'GrossDoctorShare': 0.00,
                            'ProviderShare': 0.00,
                            'TDSAmount': 0.00,
                        }
                    });
                }

                var providershareTotNetAmt = 0;
                for (var idx in providersharedoctorcollection) {
                    var coll = providersharedoctorcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName)
                            if (coll[idx].DoctorName.Title)
                                $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        NetAmt += coll[idx].ProviderShare;
                    }
                    providershareTotNetAmt += NetAmt;
                    $scope.providersharedoctor.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.doctor.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.ProviderShare = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.doctor.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': 0.00,
                                'DrShare': 0.00,
                                'GrossDoctorShare': 0.00,
                                'ProviderShare': NetAmt,
                                'TDSAmount': 0.00,
                            }
                        });

                }
                $scope.totprovidersharedoctor.push({
                    'Key': 'Total',
                    'Value': providershareTotNetAmt
                });

                var grossdrshareTotNetAmt = 0;
                for (var idx in grossdrsharedoctorcollection) {
                    var coll = grossdrsharedoctorcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName)
                            if (coll[idx].DoctorName.Title)
                                $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        NetAmt += coll[idx].GrossDoctorShare;
                    }
                    grossdrshareTotNetAmt += NetAmt;
                    $scope.grossdrsharedoctor.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.doctor.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.GrossDoctorShare = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.doctor.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': 0.00,
                                'DrShare': 0.00,
                                'GrossDoctorShare': NetAmt,
                                'ProviderShare': 0.00,
                                'TDSAmount': 0.00,
                            }
                        });

                }
                $scope.totgrossdrsharedoctor.push({
                    'Key': 'Total',
                    'Value': grossdrshareTotNetAmt
                });

                var tdsshareTotNetAmt = 0;
                for (var idx in tdssharedoctorcollection) {
                    var coll = tdssharedoctorcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName)
                            if (coll[idx].DoctorName.Title)
                                $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        NetAmt += coll[idx].TDSAmount;
                    }
                    tdsshareTotNetAmt += NetAmt;
                    $scope.tdssharedoctor.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.doctor.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.TDSAmount = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.doctor.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': 0.00,
                                'DrShare': 0.00,
                                'GrossDoctorShare': 0.00,
                                'ProviderShare': 0.00,
                                'TDSAmount': NetAmt,
                            }
                        });

                }
                $scope.tottdssharedoctor.push({
                    'Key': 'Total',
                    'Value': tdsshareTotNetAmt
                });

                var drshareTotNetAmt = 0;
                for (var idx in drsharedoctorcollection) {
                    var coll = drsharedoctorcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName)
                            if (coll[idx].DoctorName.Title)
                                $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        NetAmt += coll[idx].NetDoctorShare;
                    }
                    drshareTotNetAmt += NetAmt;
                    $scope.drsharedoctor.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.doctor.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.DrShare = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.doctor.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': 0.00,
                                'DrShare': NetAmt,
                                'GrossDoctorShare': 0.00,
                                'ProviderShare': 0.00,
                                'TDSAmount': 0.00,
                            }
                        });

                }
                $scope.totdrsharedoctor.push({
                    'Key': 'Total',
                    'Value': drshareTotNetAmt
                });


                opwithdirectamt = opTotNetAmt + directbillamt;
                $scope.doctor.push({
                    'Key': 'Total',
                    'Value': {
                        'OP': opwithdirectamt,
                        'IP': ipTotNetAmt,
                        'DrShare': drshareTotNetAmt,
                        'GrossDoctorShare': grossdrshareTotNetAmt,
                        'ProviderShare': providershareTotNetAmt,
                        'TDSAmount': tdsshareTotNetAmt,
                    }
                });

            }
        }

        $scope.GetFacilityDashboardOptions = function () {
            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    DoctorId: $scope.currentfilter.DoctorId || 0,

                },
            };

            var options = {
                action: 'billing/CollectionBaseRevenue/GetRevenueDoctorSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    DoctorId: $scope.currentfilter.DoctorId || 0,
                    DoctorName: $scope.DoctorName
                }
            };
            var options = {
                action: 'billing/CollectionBaseRevenue/PrintRevenueSummaryDoctorReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Doctor Id',
                    field: 'DoctorId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName].join(' ');
            }
            $scope.DoctorName = result;
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }
            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }


        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.DoctorId = 0;
                // $scope.GetFacilityDashboardOptions();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.financereporttab.doctorsharereport')
        };

        // $scope.LoadDashboard = function() {
        //     $scope.GetFacilityDashboardOptions();
        // }

        // $scope.LoadDashboard();
    }
    drsharerevenuesummarybydoctorController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();