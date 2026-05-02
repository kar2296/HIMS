(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('messagesController', messagesController);

    function messagesController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        $scope.messages = [];
        $scope.currentcontext = {
            file: null
        };
        $scope.lookup = {};
        $scope.item = {
            FromUserId: utl.Session.getCurrentUserId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            OrganizationId: parseInt(utl.Session.getCurrentOrgId()),
            SendDate: utl.Formatter.getCurrentDate(),
            UserTypeId: utl.Session.getUserTypeId()
        };

        $scope.ShowEmptymsg = false;
        $scope.ShowCompose = false;
        $scope.ShowView = false;
        $scope.ShowOutboxmsgs = false;
        $scope.CanShowPatSearch = false;
        $scope.CanShowUserSearch = false;
        $scope.CanShowSupportSearch = false;
        $scope.CanShowAttachView = false;
        if ($stateParams.id) {
            $scope.currentcontext.id = parseInt($stateParams.id);
        }
        if ($scope.currentcontext.id == 0) {
            $scope.ShowCompose = true;
            $scope.ShowView = false;
        }

        $scope.currentfilter = {
            pid: parseInt(utl.Session.getPatientPortalPatientId()),
            MessageStatusId: 2,
            FacilityId: utl.Session.getCurrentFacilityId(),
            UserTypeId: parseInt(utl.Session.getUserTypeId())
        };

        $scope.compsenewmsg = function() {
            $scope.item.ToUserId = -1;
            $scope.item.UserName = ' ';
            $scope.item.MessageTypeId = -1;
            $scope.item.PriorityId = -1;
            $scope.item.Subject = ' ';
            $scope.item.Description = ' ';
            $scope.ShowCompose = true;
            $scope.ShowView = false;
            $scope.getMessageInfo(0);
        };

        $scope.sentmsgs = function() {
            $scope.ShowOutboxmsgs = true;
            $scope.getSendmsgs();
        }

        $scope.view = function(item) {
            $scope.ShowView = true;
            if (!item.IsRead) {
                $scope.update(item);
            }
            $scope.getMessageInfo(item);
        };


        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.ShowCompose = false;
            if ($scope.item.Attachment) {
                $scope.CanShowAttachView = true;
            }
            if ($scope.item.FromUser) {
                if ($scope.item.FromUser.Title) {
                    $scope.item.FromUserName = $scope.item.FromUser.Title.Description;
                }
                if ($scope.item.FromUser.FirstName) {
                    if ($scope.item.FromUser.Title) {
                        $scope.item.FromUserName += ' ' + $scope.item.FromUser.FirstName;
                    } else {
                        $scope.item.FromUserName = $scope.item.FromUser.FirstName;
                    }
                }
                if ($scope.item.FromUser.LastName) {
                    $scope.item.FromUserName += ' ' + $scope.item.FromUser.LastName;
                }
            }
        }

        $scope.getItem = function() {
            if ($scope.currentcontext.id > 0) {
                var options = {
                    action: 'SystemSettings/Message/GetMessageById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.item.ToUserId = -1;
                $scope.item.UserName = ' ';
                $scope.item.MessageTypeId = -1;
                $scope.item.PriorityId = -1;
                $scope.item.Subject = ' ';
                $scope.item.Description = ' ';
            }
        }

        $scope.viewsentitem = function(item) {
            $scope.ShowView = true;
            $scope.getMessageInfo(item);
        };

        $scope.getAttachmentViewCallback = function(scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.getAttachmentView = function(item) {
            var inputData = {
                Attachment: item.Attachment
            };
            var options = {
                action: 'SystemSettings/Message/GetAttachmentFile',
                data: {
                    Data: inputData
                },
                onComplete: $scope.getAttachmentViewCallback
            };
            utl.Http.doDownload(options);
        }


        $scope.getMessageInfoCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.ShowCompose = false;
            if ($scope.item.Attachment) {
                $scope.CanShowAttachView = true;
            }
            if ($scope.item.FromUser) {
                if ($scope.item.FromUser.Title) {
                    $scope.item.FromUserName = $scope.item.FromUser.Title.Description;
                }
                if ($scope.item.FromUser.FirstName) {
                    if ($scope.item.FromUser.Title) {
                        $scope.item.FromUserName += ' ' + $scope.item.FromUser.FirstName;
                    } else {
                        $scope.item.FromUserName = $scope.item.FromUser.FirstName;
                    }
                }
                if ($scope.item.FromUser.LastName) {
                    $scope.item.FromUserName += ' ' + $scope.item.FromUser.LastName;
                }
            }
        }
        $scope.setMaster = function(PatUserType) {
            $scope.selected = PatUserType;
        }

        $scope.isSelected = function(PatUserType) {
            return $scope.selected === PatUserType;
        }
        $scope.getMessageInfo = function(item) {
            if (item.Id > 0) {
                var options = {
                    action: 'SystemSettings/Message/GetMessageById',
                    data: {
                        Id: item.Id
                    },
                    type: 'post',
                    onComplete: $scope.getMessageInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.item.ToUserId = -1;
                $scope.item.UserName = ' ';
                $scope.item.MessageTypeId = -1;
                $scope.item.PriorityId = -1;
                $scope.item.Subject = ' ';
                $scope.item.Description = ' ';
                $scope.item = {};
                document.getElementById("item_form").reset();
            }
        }

        $scope.getsenderData = function(item) {
            $scope.item.UserTypeId = item.Id;
            if (item.Id == 8) {
                $scope.CanShowPatSearch = true;
                $scope.CanShowUserSearch = false;
                $scope.CanShowSupportSearch = false;
            }
            if (item.Id != 8 && item.Id != 11) {
                $scope.CanShowPatSearch = false;
                $scope.CanShowUserSearch = true;
                $scope.CanShowSupportSearch = false;
            }
            if (item.Id == 11) {
                $scope.item.ToUserId = 1;
                $scope.item.ToOrganizationId = 1;
                $scope.item.ToFacilityId = 1;
                $scope.CanShowPatSearch = false;
                $scope.CanShowUserSearch = false;
                $scope.CanShowSupportSearch = true;
            }
        }

        $scope.getPatientInfo = function(scope, data, options, hasError) {
            $scope.selectedPatient = data;
            if ($scope.selectedPatient.Facility) {
                $scope.item.ToOrganizationId = $scope.selectedPatient.Facility.Organization.Id || -1;
            }
            $scope.item.ToFacilityId = $scope.selectedPatient.FacilityId || -1;
        };


        $scope.patientChange = function() {
            if ($scope.item.ToUserId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.ToUserId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }


        $scope.getSendmsgsCallback = function(scope, res, options, hasError) {
            $scope.messages = [];
            $scope.sentmessages = [];
            $scope.ShowEmptymsg = false;
            $scope.ShowView = false;
            for (var idx in res.Data) {
                var msg = res.Data[idx];
                if (msg.UserTypeId == 11) {
                    msg.ToUserName = 'Support';
                }
                if (msg.ToUser) {
                    if (msg.ToUser.Title) {
                        msg.ToUserName = msg.ToUser.Title.Description;
                    }
                    if (msg.ToUser.FirstName) {
                        if (msg.ToUser.Title) {
                            msg.ToUserName += ' ' + msg.ToUser.FirstName;
                        } else {
                            msg.ToUserName = msg.ToUser.FirstName;
                        }
                    }
                    if (msg.ToUser.LastName) {
                        msg.ToUserName += ' ' + msg.ToUser.LastName;
                    }
                }
                $scope.sentmessages.push(msg);
            }
            if (res.Data.length == 0) {
                $scope.ShowEmptymsg = true;
            }
        };

        $scope.getSendmsgs = function() {
            $scope.ShowCompose = false;
            var inputData = {
                Params: [
                    { Key: 3, Value: utl.Session.getCurrentUserId },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/Message/GetMessages',
                data: inputData,
                type: 'post',
                onComplete: $scope.getSendmsgsCallback
            };

            utl.Http.doAction(options);
        };


        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.messages = [];
            $scope.UnreadCount = 0;
            $scope.sentmessages = [];
            $scope.ShowEmptymsg = false;
            $scope.ShowOutboxmsgs = false;
            $scope.ShowView = false;
            for (var idx in res.Data) {
                var msg = res.Data[idx];
                if (msg.FromUser) {
                    if (msg.FromUser.Title) {
                        msg.FromUserName = msg.FromUser.Title.Description;
                    }
                    if (msg.FromUser.FirstName) {
                        if (msg.FromUser.Title) {
                            msg.FromUserName += ' ' + msg.FromUser.FirstName;
                        } else {
                            msg.FromUserName = msg.FromUser.FirstName;
                        }
                    }
                    if (msg.FromUser.LastName) {
                        msg.FromUserName += ' ' + msg.FromUser.LastName;
                    }
                }
                if (msg.UserTypeId == $scope.currentfilter.UserTypeId) {
                    if (msg.ToUserId == $scope.currentfilter.pid) {
                        $scope.messages.push(msg);
                    }
                }
            }
            $scope.UnreadCount = 0;
            for (var jdx in $scope.messages) {
                var unmsg = $scope.messages[jdx];
                if (unmsg.IsRead == false) {
                    $scope.UnreadCount++;
                }
            }

            if (res.Data.length == 0) {
                $scope.ShowEmptymsg = true;
            }
        };

        $scope.getList = function(statusId) {

            var inputData = {
                Params: [
                    { Key: 2, Value: statusId }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/Message/GetMessages',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getCountsCallback = function(scope, res, options, hasError) {
            $scope.Outmessages = [];
            for (var cdx in res.Data) {
                var cmsgs = res.Data[cdx];
                if (cmsgs.UserTypeId == ($scope.currentfilter.UserTypeId)) {
                    if (cmsgs.ToUserId == utl.Session.getCurrentUserId()) {
                        $scope.messages.push(cmsgs);
                    }
                }
                if (cmsgs.FromUserId == utl.Session.getCurrentUserId()) {
                    $scope.Outmessages.push(cmsgs);
                }
            }
            $scope.UnreadCount = 0;
            $scope.ArchievedCount = 0;
            $scope.DeletedCount = 0;
            $scope.OutboxCount = $scope.Outmessages.length;
            for (var jdx in $scope.messages) {
                var unmsg = $scope.messages[jdx];
                if (unmsg.IsRead == false) {
                    $scope.UnreadCount++;
                }
                if (unmsg.MessageStatusId == 3) {
                    $scope.ArchievedCount++;
                }
                if (unmsg.MessageStatusId == 4) {
                    $scope.DeletedCount++;
                }
            }
        }
        $scope.getCounts = function() {

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/Message/GetMessages',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCountsCallback
            };

            utl.Http.doAction(options);
        };

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'User Id',
                    field: 'UserId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'User Name',
                    field: 'UserName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Qualification',
                    field: 'Qualification',
                    datatype: 'string',
                    headercls: 'td-Qualification',
                    fieldcls: 'td-Qualification'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName,
                    vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            // $scope.item.UserName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.item.UserTypeId
                }, {
                    Key: 5,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
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

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.fileChanged = function() {
            if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                $scope.item.AttachmentName = $scope.currentcontext.file.name;
            }
        }

        $scope.reply = function(item) {
            $scope.ShowCompose = true;
            $scope.ShowView = false;
            $scope.item.ParentMessageId = item.Id;
            $scope.item.IsReply = true;
            $scope.item.ToUserId = item.FromUserId;
            $scope.item.UserTypeId = item.FromUser.UserTypeId;
            $scope.item.FromUserId = utl.Session.getCurrentUserId();
            $scope.item.MessageStatusId = 2;
            $scope.item.MessageTypeId = -1;
            $scope.item.PriorityId = -1;
            $scope.item.Subject = ' ';
            $scope.item.Description = '';
        }

        $scope.sendmsg = function() {
            $scope.item.MessageStatusId = 2;
            $scope.saveItem();
        };

        $scope.update = function(item) {
            $scope.currentcontext.id = item.Id;
            $scope.item.IsRead = true;
            $scope.item.ReadDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        }

        $scope.updateStatus = function(item, statusId) {
            $scope.currentcontext.id = item.Id;
            $scope.item.MessageStatusId = statusId;
            $scope.saveItem();
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.ShowCompose = false;
            document.getElementById("item_form").reset();
            $scope.getList(2);
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.IsReply) {
                $scope.item.Id = 0;
            }
            var actionName = 'SystemSettingsMessage/AddMessage';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'SystemSettingsMessage/UpdateMessage';
            }

            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;

                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function(resp) { //upload function returns a promise
                        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                        $scope.currentcontext.file = null;
                        $scope.saveItemCallback();
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup.PatUserType = [];
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserType') {
                    for (var udx in $scope.lookup.UserType) {
                        var usertype = $scope.lookup.UserType[udx];
                        if (usertype.Id == 2 || usertype.Id == 11) {
                            $scope.lookup.PatUserType.push(usertype);
                        }
                    }
                }
            });
            $scope.getList(2);
            $scope.getCounts();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "UserType",
                    Default: false
                },
                {
                    "Key": "MessageType"
                },
                {
                    "Key": "PRIORITY"
                }
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
    messagesController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();