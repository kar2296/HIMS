(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('attachmentcontrolCtrl', ['utl', '$scope', '$timeout', '$translate', 'Upload',
			function (utl, $scope, $timeout, $translate, Upload) {
				var cvm = this;

				cvm.currentcontext = {
					file: null
				};
				cvm.item = {
					AttachmentTypeId: -1,
					AttachmentType: '',
					Comments: ''
				};

				$scope.$watch('cvm.config.patientid',
					function (newValue) {
						if (newValue) {
							cvm.getList();
						}
					});

				cvm.fileSelected = function () {
					if (cvm.currentcontext.file && cvm.currentcontext.file.name) {
						cvm.item.AttachmentName = cvm.currentcontext.file.name;
					}
				}

				cvm.attachmentTypeChange = function (selectedAttachmentType) {
					if (selectedAttachmentType.Id != -1) {
						cvm.item.AttachmentType = selectedAttachmentType.Text;
					} else {
						cvm.item.AttachmentType = '';
					}
					cvm.getList();
				}

				//save item
				cvm.saveItem = function () {
					if (!cvm.currentcontext.file) {
						utl.Alert.showErrorMsg($translate.instant('registration.attachmentcontrol.nofilemsg.lbl'));
						return;
					}

					var actionName = "registration/PatientAttachment/AddPatientAttachment";
					var actionUrl = utl.Http.getRootPath() + actionName;

					cvm.item.PatientId = cvm.config.patientid;
					cvm.item.ObjectTypeId = cvm.config.objecttypeid;
					cvm.item.ItemId = cvm.config.itemid;

					Upload.upload({
						url: actionUrl,
						data: {
							file: cvm.currentcontext.file,
							Data: cvm.item
						}
					}).then(function (resp) { //upload function returns a promise
						utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
						cvm.currentcontext.file = null;

						//reset form and reload list
						cvm.item = {
							AttachmentTypeId: -1,
							AttachmentType: '',
							Comments: ''
						};
						cvm.getList();
					},
						function (resp) { //catch error
							console.log('Error status: ' + resp.status);
							utl.Alert.showErrorMsg('Error status: ' + resp.status);
						},
						function (evt) {
							console.log(evt);
						});
				}

				//get list
				cvm.getListCallback = function (scope, res, options, hasError) {
					cvm.gridConfig.data = res.Data;
				}
				cvm.getList = function () {

					var inputData = {
						Params: [{ Key: 2, Value: cvm.config.patientid },
						{ Key: 3, Value: cvm.config.objecttypeid },
						{ Key: 4, Value: cvm.item.AttachmentTypeId },

						],
						PageContext: {
							PageSize: 1000,
							PageNumber: 1
						}
					};

					if (cvm.config.encounterid) {
						inputData.Params.push({ Key: 3, Value: cvm.config.encounterid });
					}

					var options = {
						action: 'registration/PatientAttachment/GetPatientAttachments',
						data: inputData,
						type: 'post',
						onComplete: cvm.getListCallback
					};
					utl.Http.doAction(options);
				}

				//Delete
				cvm.deleteItemCallback = function (scope, data, options, hasError) {
					utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
					cvm.getList();
				};

				cvm.onDeleteConfirmed = function (deleteId) {
					var options = {
						action: 'registration/PatientAttachment/DeletePatientAttachment',
						data: { Id: deleteId },
						type: 'post',
						onComplete: cvm.deleteItemCallback
					};
					utl.Http.doAction(options);
				}

				//Download File
				cvm.downloadFileCallback = function (scope, data, options, hasError) {
					console.log('File downloaded successfully...');
					//window.open(data);
				};

				cvm.downloadFile = function (entity) {
					var inputData = { FilePath: entity.FilePath };
					var options = {
						action: 'registration/PatientAttachment/GetAttachmentFile',
						data: { Data: inputData },
						onComplete: cvm.downloadFileCallback
					};
					utl.Http.doDownload(options);
				}

				$scope.handleEvents = function (actionType, entity) {

					if (actionType == 'delete') {
						utl.Dialog.confirmDelete(cvm.onDeleteConfirmed, entity.Id, entity.AttachmentName);
					} else if (actionType == 'view') {
						cvm.downloadFile(entity);
					}
				}

				cvm.gridConfig = {
					columnDefs: [
						{ field: "AttachmentName", displayName: $translate.instant('registration.attachmentcontrol.attachmentname.lbl') },
						{ field: "AttachmentType", displayName: $translate.instant('registration.attachmentcontrol.attachmenttype.lbl') },
						{ field: "Comments", displayName: $translate.instant('registration.attachmentcontrol.comments.lbl') },
						{
							field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
							cellTemplate: '<div class="ui-grid-cell-contents text-center" style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 4px;">\
                                       <button type="button" class="btn btn-xs btn-default" ng-click="handleEvents(\'view\',entity)" title="View / Download" style="padding: 4px 8px; border-radius: 5px; border: 1px solid #cbd5e1; background: #ffffff; color: #21008d; font-weight: 600; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"><i class="fa fa-download" style="margin-right: 4px;"></i> View</button>\
                                       <button type="button" class="btn btn-xs btn-danger" ng-click="handleEvents(\'delete\',entity)" title="Delete" style="padding: 4px 8px; border-radius: 5px; border: 1px solid #ef4444; background: #ef4444; color: #ffffff; font-weight: 600; cursor: pointer; box-shadow: 0 1px 3px rgba(239,68,68,0.2);"><i class="fa fa-trash"></i></button>\
                                </div>',
							handleEvent: $scope.handleEvents,
							actions: []
						}
					],
					data: []
				};

				//lookup
				cvm.lookupCallback = function (scope, data, options, hasError) {
					cvm.lookup = hasError ? {} : data;
				}

				cvm.initLookup = function () {
					var inputData = [
						{ "Key": "AttachmentType", Request: { Params: [{ Key: 3, Value: 2 }] } }
					];

					var options = {
						action: 'General/Options/getoptions',
						data: inputData,
						type: 'post',
						onComplete: cvm.lookupCallback
					};
					utl.Http.doAction(options);
				}

				cvm.init = function () {
					cvm.initLookup();
				}

				//caution : base method, please don't modifiy
				cvm.$onInit = function () {
					$timeout(cvm.init, 100);
				}
			}])
		.component('attachmentcontrol', {
			bindings: {
				config: "="
			},
			controller: 'attachmentcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/attachmentcontrol.html'
		})

})();