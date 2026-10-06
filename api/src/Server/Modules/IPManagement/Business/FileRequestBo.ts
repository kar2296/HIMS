import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common';
import { FileRequestInstance, FileRequestAttributes } from '../Model/Interface/Index';
import { FileRequestFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { BoFactory } from '../../Base/Business/Index';
import * as ipbo from '../../IPManagement/Business/Index';
import { MRDLocationFilters } from '../../IPManagement/Common/Filters.e';
import * as appbo from '../../Appointment/Business/Index';


export class FileRequestBo extends BaseBo<FileRequestInstance, FileRequestAttributes>  {
    public async AddFileRequest(req: BaseRequest): Promise<number> {
        let generateFileReq = 0;
        if (!req.Data.RequestIdentifier && req.Data.MRDFileStatusId === 1) {
            req.Data.RequestIdentifier = null;
            generateFileReq = 1;
        }
        let result = await this.Save(req.Data);
        let mrdReqId = result.dataValues.Id;
        if (generateFileReq === 1) {
            this.deferSequenceKey(mrdReqId, 'RequestIdentifier',
                this.getSequenceIdentifier(SequenceKeys.MrdRequestId));
        }
        let MrdLocBo = BoFactory.GetBo(ipbo.MRDLocationBo, this.Request);
        let locData: any = {
            Data: {
                MrdLocId: req.Data.MrdLocId,
                DepartmentId: req.Data.FromDepartmentId,
                LocationId: req.Data.ToDepartmentId,
                MRDMovementStatusId: req.Data.MRDMovementStatusId,
                PatientId: req.Data.PatientId,
                EncounterId: req.Data.EncounterId,
                MRDFileStatusId: req.Data.MRDFileStatusId,
                PriorityId: req.Data.PriorityId,
                IsManual: req.Data.IsManual,
                MRDTypeId: req.Data.MRDTypeId,
                RequestTypeId: req.Data.RequestTypeId,
            }
        };
        await MrdLocBo.UpdateMRDLocationFromRequest(locData);
        return mrdReqId;
    }


    public async ManageFileRequestFromApptReq(req: BaseRequest): Promise<boolean> {
        if (req && req.Data && req.Data.patientinfo) {
            console.log(req.Data);
            let apptsinfo: any = req.Data.patientinfo;
            let RequestTypeId_: any = req.Data.RequestTypeId;
            let FrmDeptId_: any = req.Data.FrmDeptId;
            let ToDeptId_: any = req.Data.ToDeptId;
            let PriorityId_: any = req.Data.PriorityId;
            let MRDTypeId_: any = 1;
            let MRDMovementStatusId: any = 1;
            let IsManual = false;
            let MrdLocId = -1;
            for (let kk = 0, len = apptsinfo.length; kk < len; kk++) {
                let apptinfo = apptsinfo[kk];
                let PatientId = apptinfo.PatientId;
                // Fetch MrdLocId
                if (PatientId > 0) {
                    let MrdLocBo = BoFactory.GetBo(ipbo.MRDLocationBo, this.Request);
                    let apiReq: any = {
                        Id: 0,
                        PageContext: { PageSize: 3, PageNumber: 1 },
                        Params: [
                            { Key: MRDLocationFilters.PatientId, Value: PatientId },
                        ]
                    };
                    let MRDLocData = await MrdLocBo.GetMRDLocations(apiReq);
                    if (MRDLocData && MRDLocData.Data && MRDLocData.Data.length > 0) {
                        MrdLocId = MRDLocData.Data[0].Id;
                    }
                    if (MrdLocId > 0) {
                        await this.ManageFileRequest(apptinfo.Patient.MRN,
                            RequestTypeId_, MRDTypeId_, PatientId,
                            0, apptinfo.DoctorId, apptinfo.DoctorName,
                            0, null, null, FrmDeptId_, ToDeptId_,
                            ToDeptId_, MRDMovementStatusId, MrdLocId, IsManual,
                            PriorityId_);

                        let locData: any = {
                            Data: {
                                MrdLocId: MrdLocId,
                                DepartmentId: FrmDeptId_,
                                LocationId: ToDeptId_,
                                MRDMovementStatusId: MRDMovementStatusId,
                                PatientId: PatientId,
                                MRDFileStatusId: 1,
                                PriorityId: PriorityId_,
                                IsManual: IsManual,
                                MRDTypeId: MRDTypeId_,
                            }
                        };
                        await MrdLocBo.UpdateMRDLocationFromRequest(locData);

                    }
                }
                let appid = -1;
                if (apptinfo && apptinfo.Id)
                    appid = apptinfo.Id;
                // Update Update MRDFileRequestStatus
                if (appid > 0) {
                    let ApptBo = BoFactory.GetBo(appbo.AppointmentBo, this.Request);
                    await ApptBo.UpdateIsMRDFileRequest(appid);
                }
            }
        }
        return true;
    }



    public async ManageFileRequest(PatientMRN: string, RequestTypeId_: number,
        MRDTypeId_: number, PatientId: number, EncounterId: number,
        DoctorId: number, DoctorName: string, RackId: number,
        Self: string, Reason: string, FrmDeptId: number, ToDeptId: number,
        CurrentLocId: number, MRDMovementStatusId: number, MrdLocId: number, IsManual: boolean,
        PriorityId: number): Promise<boolean> {
        let MRDRequestId_ = null;

        //already exist PatientId, FrmDeptId no insert
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: FileRequestFilters.PatientId, Value: PatientId },
                { Key: FileRequestFilters.FromDepartmentId, Value: FrmDeptId }
            ]
        };
        let MRDFileRequestData = await this.GetFileRequests(apiReq);
        let fileinsamedept = 0;
        if (MRDFileRequestData && MRDFileRequestData.Data &&
            MRDFileRequestData.Data.length > 0) {
            fileinsamedept = 1;
        }

        if (!fileinsamedept) {
            let MRDFileRequest: any = {
                Id: 0,
                RequestIdentifier: MRDRequestId_,
                RequestDate: new Date(),
                RequestTypeId: RequestTypeId_,
                MRDTypeId: MRDTypeId_,
                PriorityId: PriorityId,
                PatientId: PatientId,
                PatientMrn: PatientMRN,
                EncounterId: EncounterId,
                DoctorId: DoctorId,
                RequestedDoctorId: DoctorId,
                DoctorName: DoctorName,
                FromDepartmentId: FrmDeptId,
                ToDepartmentId: ToDeptId,
                CurrentLocationId: CurrentLocId,
                MRDFileStatusId: 1,
                MRDMovementStatusId: 1,
                IssueStatusId: 0,
                Reason: Reason,
                MrdLocId: MrdLocId,
                IsManual: IsManual
            };
            let result = await this.Save(MRDFileRequest);
            let MrdReqId = result.dataValues.Id;
            this.deferSequenceKey(MrdReqId, 'RequestIdentifier',
                this.getSequenceIdentifier(SequenceKeys.MrdRequestId));

        }



        return true;
    }

    public async UpdateFileRequest(req: BaseRequest): Promise<boolean> {
        let generateFileReq = 0;
        if (!req.Data.RequestIdentifier && req.Data.MRDFileStatusId === 1) {
            req.Data.RequestIdentifier = null;
            generateFileReq = 1;
            //await Sequence.Next(SequenceKeys.MrdRequestId);
        }
        let result = await this.Update(req.Data);
        if (generateFileReq === 1) {
            this.deferSequenceKey(req.Data.Id, 'RequestIdentifier',
                this.getSequenceIdentifier(SequenceKeys.MrdRequestId));
        }
        let MrdLocBo = BoFactory.GetBo(ipbo.MRDLocationBo, this.Request);
        let locData: any = {
            Data: {
                MrdLocId: req.Data.MrdLocId,
                DepartmentId: req.Data.FromDepartmentId,
                LocationId: req.Data.ToDepartmentId,
                MRDMovementStatusId: req.Data.MRDMovementStatusId,
                PatientId: req.Data.PatientId,
                EncounterId: req.Data.EncounterId,
                MRDFileStatusId: req.Data.MRDFileStatusId,
                PriorityId: req.Data.PriorityId,
                IsManual: req.Data.IsManual,
                MRDTypeId: req.Data.MRDTypeId,
            }
        };
        await MrdLocBo.UpdateMRDLocationFromRequest(locData);
        return result;
    }
    public async UpdateFileRequestWithStatus(details: FileRequestAttributes[])
        : Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }
    public async GetFileRequestById(req: BaseRequest): Promise<FileRequestAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetFileRequests(apiReq?: ApiRequest<FileRequestFilters>):
        Promise<ApiResponse<FileRequestAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'ParentDepartment', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDepartment', required: false });
        include.push(this.GetReference('PRIORITY'));
        include.push(this.GetReference('MRDFileStatus'));
        include.push(this.GetReference('MRDMovementStatus'));
        include.push(this.GetReference('EncounterType'));
        include.push(this.GetReference('MRDRequestType'));
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'EncounterTypeId', 'VisitTypeId', 'IsLatest'], required: false,
            include: [this.GetReference('VisitType'), this.GetReference('EncounterType')]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FileRequestFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FileRequestFilters.RequestIdentifier:
                        (where as any)[Op.or] = [{ RequestIdentifier: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case FileRequestFilters.FromDepartmentId:
                        where['FromDepartmentId'] = param.Value;
                        break;
                    case FileRequestFilters.ToDepartmentId:
                        where['ToDepartmentId'] = param.Value;
                        break;
                    case FileRequestFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case FileRequestFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case FileRequestFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case FileRequestFilters.RequestDate:
                        where['RequestDate'] = param.Value;
                        break;
                    case FileRequestFilters.From:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case FileRequestFilters.To:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case FileRequestFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Mobile: { [Op.like]: (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case FileRequestFilters.MRDFileStatusId:
                        where['MRDFileStatusId'] = param.Value;
                        break;
                    case FileRequestFilters.MRDTypeId:
                        where['MRDTypeId'] = param.Value;
                        break;
                    case FileRequestFilters.MRDMovementStatusId:
                        where['MRDMovementStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'MaritalStatusId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        order.push(['RequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteFileRequest(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FileRequestInstance, FileRequestAttributes> {
        return this.Models.FileRequest;
    }
    public async GetOtDashboardInfo(req: BaseRequest): Promise<any> {
        let MrdfilereceiveCount = await this.Items.count({
            where: {
                'Status': 1,
                'MRDFileStatusId': { '$in': [1, 2] }
            }
        });
        return {
            'MrdfilereceiveCount': MrdfilereceiveCount,
        };
    }
    public async GetOPDDashBoardInfo(req: BaseRequest): Promise<any> {
        let MRDRequestCount = await this.Items.count({
            where: {
                'Status': 1,
                'MRDFileStatusId': 1,
                'RequestDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // 'FacilityId': req.Data.FacilityId,
            }
        });
        return {
            'MRDRequestCount': MRDRequestCount,
        };
    }
}

