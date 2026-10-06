import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ServiceRequestInstance, ServiceRequestAttributes } from '../Model/Interface/Index';
import { ServiceRequestFilters, } from '../Common/Filters.e';
import { readFileSync, writeFileSync } from 'fs';
import { AppConfig } from '../../../../config/index';
import { SequenceKeys } from '../../General/Common/Sequence.s';


export class ServiceRequestBo extends BaseBo<ServiceRequestInstance, ServiceRequestAttributes> {
    public async AddServiceRequest(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        //sign data code starts
        if (req.Data.signdata && req.Data.signdata !== '') {
            let datetimestamp = Date.now();
            let signFilePath = AppConfig.UploadFilePath + '/' + req.Data.FirstName + '-sign-' + datetimestamp + '.png';
            await writeFileSync(signFilePath, new Buffer(req.Data.signdata, 'base64'));
            req.Data.SignPath = signFilePath;
        }
        //Handling for json 'null' value while save user with file upload
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        this.HandleNullDataViaFileUpload(req.Data);
        let result = await this.Save(req.Data);
        if (result) {
            let SerReqId = result.dataValues.Id;
            let serreqidentifier: any = null;
            if (req.Data.AssetTicketStatusId === 2 || req.Data.AssetTicketStatusId === '2') {
                serreqidentifier = this.getSequenceIdentifier(SequenceKeys.ServiceRequest);
            }
            if (serreqidentifier) {
                const afterO: any = () => {
                    return ((bo, request, SerReqId) => {
                        return {
                            updateServiceReqInfo: async (code: string) => {
                                request.Data.Id = SerReqId;
                                req.Data.TicketNumberIdentifier = code;
                                await bo.UpdateServiceReqInfo(request);
                            }
                        };
                    })(this, req, SerReqId);
                };
                this.deferSequenceKey(req.Data.Id, 'TicketNumberIdentifier', serreqidentifier, [
                    afterO().updateServiceReqInfo
                ]);
            }
            return SerReqId;
        }
        return 0;
    }
    public async UpdateServiceRequest(req: BaseRequest): Promise<boolean> {
        // this.HandleActiveState(req.Data);
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        //sign data code starts
        if (req.Data.signdata && req.Data.signdata !== '') {
            let datetimestamp = Date.now();
            let signFilePath = AppConfig.UploadFilePath + '/' + req.Data.FirstName + '-sign-' + datetimestamp + '.png';
            await writeFileSync(signFilePath, new Buffer(req.Data.signdata, 'base64'));
            req.Data.SignPath = signFilePath;
        }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        this.HandleNullDataViaFileUpload(req.Data);
        let result = await this.Update(req.Data);
        if (result) {
            let SerReqId = req.Data.Id;
            let serreqidentifier: any = null;
            if (req.Data.TicketNumberIdentifier === null) {
                serreqidentifier = this.getSequenceIdentifier(SequenceKeys.ServiceRequest);
            }
            if (serreqidentifier) {
                const afterO: any = () => {
                    return ((bo, request, SerReqId) => {
                        return {
                            updateServiceReqInfo: async (code: string) => {
                                request.Data.Id = SerReqId;
                                req.Data.TicketNumberIdentifier = code;
                                await bo.UpdateServiceReqInfo(request);
                            }
                        };
                    })(this, req, SerReqId);
                };
                this.deferSequenceKey(req.Data.Id, 'TicketNumberIdentifier', serreqidentifier, [
                    afterO().updateServiceReqInfo
                ]);
            }
            return SerReqId;
        }
        return result;
    }
    public async GetEndUserSignPic(req: BaseRequest): Promise<any> {
        let result = await readFileSync(req.Data.SignPath);
        return new Buffer(result).toString('base64');
    }
    public async GetServiceRequestById(req: BaseRequest): Promise<ServiceRequestAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Department, as: 'FromDepartment', required: false });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }
    public async GetServiceRequests(apiReq?: ApiRequest<ServiceRequestFilters>): Promise<ApiResponse<ServiceRequestAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        include.push({ model: this.Models.Department, as: 'FromDepartment', required: false });
        include.push({ model: this.Models.Department, as: 'ToDepartment', required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Assigned', required: false,
            include: [this.GetReference('Title')]
        });
        // include.push({
        //     model: this.Models.User, as: 'AssignedUser', attributes: ['FirstName', 'LastName'], required: false,
        //     include: [this.GetReference('Title')]
        // });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedById', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CompletedBy', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Asset, attributes: ['AssetName'], as: 'Asset', required: false,
            include: [this.GetReference('AssetType')]
        });
        include.push({
            model: this.Models.VendorMaster, attributes: ['VendorName'], as: 'AssignedVendor',
            required: false
        });
        include.push({
            model: this.Models.Facility, attributes: ['FacilityName'], as: 'AssignedFacility',
            required: false
        });
        include.push(this.GetReference('ServiceRequestStatus'));
        include.push(this.GetReference('AssetTicketStatus'));
        include.push(this.GetReference('AssetServiceType'));
        include.push(this.GetReference('TicketCategory'));
        include.push(this.GetReference('AssignType'));
        include.push(this.GetReference('Priority'));
        include.push(this.GetReference('Seviority'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceRequestFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ServiceRequestFilters.FromDepartmentId:
                        where['FromDepartmentId'] = param.Value;
                        break;
                    case ServiceRequestFilters.ServiceTypeId:
                        where['ServiceTypeId'] = param.Value;
                        break;
                    case ServiceRequestFilters.ExpectedDate:
                        where['ExpectedDate'] = param.Value;
                        break;
                    case ServiceRequestFilters.AssetTicketStatusId:
                        where['AssetTicketStatusId'] = param.Value;
                        break;
                    case ServiceRequestFilters.TicketNumberIdentifier:
                        (where as any)['$or'] = [{ 'TicketNumberIdentifier': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ServiceRequestFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    case ServiceRequestFilters.AssignTypeId:
                        where['AssignTypeId'] = { '$between': param.Value };
                        break;
                    case ServiceRequestFilters.PriorityId:
                        where['PriorityId'] = param.Value;
                        break;
                    case ServiceRequestFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case ServiceRequestFilters.AssignedId:
                        where['AssignedId'] = param.Value;
                        break;
                    case ServiceRequestFilters.AssetId:
                        where['AssetId'] = param.Value;
                        break;
                    case ServiceRequestFilters.ShortCode:
                        (where as any)['$or'] = [{ 'AssetName': { '$like': (param.Value || '') + '%' } },
                        { 'ShortCode': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case ServiceRequestFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ServiceRequestFilters.CategoryId:
                        where['CategoryId'] = param.Value;
                        break;
                    case ServiceRequestFilters.From:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case ServiceRequestFilters.To:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case ServiceRequestFilters.ToDepartmentId:
                        where['ToDepartmentId'] = param.Value;
                        break;
                    case ServiceRequestFilters.CreatedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    case ServiceRequestFilters.TicketStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AssetTicketStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case ServiceRequestFilters.PhoneNo:
                        (where as any)['$or'] = [{ 'PhoneNo': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case ServiceRequestFilters.RequestedBy:
                        where['RequestedBy'] = param.Value;
                        break;
                    case ServiceRequestFilters.ResolvedBy:
                        where['ResolvedBy'] = param.Value;
                        break;
                    case ServiceRequestFilters.CreatedResolved:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            (where as any)['$or'] = [{ 'RequestedBy': paramArr },
                            { 'ResolvedBy': paramArr }];
                        }
                        break;
                    case ServiceRequestFilters.CretedAssigned:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            (where as any)['$or'] = [{ 'RequestedBy': paramArr },
                            { 'AssignedId': paramArr }];
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async PrintServiceRequest(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: ServiceRequestFilters.Id, Value: req.Id }]
        };
        let data = await this.GetServiceRequests(apiReq);
        let servicerequest = data.Data[0];
        let info = {
            ServiceRequest: servicerequest
        };
        return await Report.Generate('serviceworkorder', { header: {}, body: info });
    }
    public async DeleteServiceRequest(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ServiceRequestInstance, ServiceRequestAttributes> {
        return this.Models.ServiceRequest;
    }
    public async GetAssetInfoDashBoard(req: BaseRequest): Promise<any> {
        if (req.Data.usergroupid !== 7) {
            let TicketCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let CreateCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': 2,
                    'RequestedBy': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let InprogressCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': { '$in': [3, 4, 5, 10] },
                    'AssignedId': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let CreateprogressCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': { '$in': [3, 4, 5, 10] },
                    'RequestedBy': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let DeferCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': 6,
                    'RequestedBy': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let ResolvedCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': 7,
                    'RequestedBy': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let MyTicketCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': { '$in': [2, 3, 4, 5, 6, 7, 8, 10] },
                    'RequestedBy': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let ClosedCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': 8,
                    'RequestedBy': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let AllOpenCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': 2,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let AllInProgressCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': { '$in': [3, 4, 5] },
                    'AssignTypeId': 2,
                    'AssignedId': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let AllInternalProgressCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': { '$in': [3, 4, 5] },
                    'AssignTypeId': 3,
                    'AssignedId': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let ResolvedByCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': 7,
                    'ResolvedBy': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });

            let RequestedBy = req.Data.userid;
            let ResolvedBy = req.Data.userid;

            return {
                'TicketCount': TicketCount,
                'CreateCount': CreateCount,
                'InprogressCount': InprogressCount,
                'DeferCount': DeferCount,
                'ResolvedCount': ResolvedCount,
                'MyTicketCount': MyTicketCount,
                'ClosedCount': ClosedCount,
                'AllOpenCount': AllOpenCount,
                'AllInProgressCount': AllInProgressCount,
                'AllInternalProgressCount': AllInternalProgressCount,
                'ResolvedByCount': ResolvedByCount,
                'CreateprogressCount': CreateprogressCount,
                'RequestedBy': RequestedBy,
                'ResolvedBy': ResolvedBy
            };
        } else if (req.Data.usergroupid === 7) {
            let TicketCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let CreateCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': 2,
                    'FacilityId': req.Data.FacilityId
                    // 'RequestedBy': req.Data.userid
                }
            });
            let InprogressCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': { '$in': [3, 4, 5, 10] },
                    'FacilityId': req.Data.FacilityId
                    // 'AssignedId': req.Data.userid
                }
            });
            let DeferCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': 6,
                    'FacilityId': req.Data.FacilityId
                    // 'RequestedBy': req.Data.userid
                }
            });
            let ResolvedCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': 7,
                    'FacilityId': req.Data.FacilityId
                    // 'RequestedBy': req.Data.userid,
                }
            });
            let MyTicketCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': { '$in': [2, 3, 4, 5, 6, 7, 8, 10] },
                    'RequestedBy': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let ClosedCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': 8,
                    'FacilityId': req.Data.FacilityId
                    // 'RequestedBy': req.Data.userid,
                }
            });
            let AllOpenCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': 2,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let AllInProgressCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': { '$in': [3, 4, 5] },
                    'AssignTypeId': 2,
                    'AssignedId': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            let AllInternalProgressCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'AssetTicketStatusId': { '$in': [3, 4, 5] },
                    'AssignTypeId': 3,
                    'AssignedId': req.Data.userid,
                    'FacilityId': req.Data.FacilityId
                }
            });
            return {
                'TicketCount': TicketCount,
                'CreateCount': CreateCount,
                'InprogressCount': InprogressCount,
                'DeferCount': DeferCount,
                'ResolvedCount': ResolvedCount,
                'MyTicketCount': MyTicketCount,
                'ClosedCount': ClosedCount,
                'AllOpenCount': AllOpenCount,
                'AllInProgressCount': AllInProgressCount,
                'AllInternalProgressCount': AllInternalProgressCount
            };
        }


    }

    private async UpdateServiceReqInfo(req: any) {
        console.log('NEWLY GENERATED ' + req.Data.TicketNumberIdentifier);
        let serReqUpdate: any = { TicketNumberIdentifier: req.Data.TicketNumberIdentifier };
        await this.Update(serReqUpdate, {
            fields: ['TicketNumberIdentifier'],
            where: {
                ServiceRequestId: req.Data.Id
            }
        });
    }


}
