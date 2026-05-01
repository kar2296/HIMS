(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('InvattachmentcontrolCtrl', ['utl', '$scope', '$timeout', '$translate', 'Upload',
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

					var actionName = "pharmacy/InventoryAttachment/AddInventoryAttachment";
					var actionUrl = utl.Http.getRootPath() + actionName;

					cvm.item.ObjectTypeId = cvm.config.objecttypeid;
					cvm.item.ItemId = cvm.config.itemid;
					cvm.item.ScreenName = cvm.config.screenname;

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
					cvm.gridConfig.TotalRecords = cvm.gridConfig.data.length;
				}
				cvm.getList = function () {

					var inputData = {
						Params: [
							{ Key: 2, Value: cvm.config.objecttypeid },
							{ Key: 3, Value: cvm.item.AttachmentTypeId },
							{ Key: 4, Value: cvm.config.itemid },
						],
						PageContext: {
							PageSize: 1000,
							PageNumber: 1
						}
					};
					var options = {
						action: 'pharmacy/InventoryAttachment/GetInventoryAttachments',
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
						action: 'pharmacy/InventoryAttachment/DeleteInventoryAttachment',
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
						action: 'pharmacy/InventoryAttachment/GetAttachmentFile',
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
							cellTemplate: '<div class="ui-grid-cell-contents">\
                                       <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                       <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"  ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
					cvm.getList();
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
		.component('inventoryattachmentcontrol', {
			bindings: {
				config: "="
			},
			controller: 'InvattachmentcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/inventoryattachmentcontrol.html'
		})

})();