import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common';
import { MRDLocationInstance, MRDLocationAttributes } from '../Model/Interface/Index';
import { MRDLocationFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as ipbo from '../../IPManagement/Business/Index';


export class MRDLocationBo extends BaseBo<MRDLocationInstance, MRDLocationAttributes>  {
    public async AddMRDLocation(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        let MRDFileLocationId = result.dataValues.Id;
        return MRDFileLocationId;
    }

    public async isMRDFileRequest(): Promise<number> {
        let mrdfilerequest = 0;
        try {
            let facilityprebo = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
            let facilityPreferencesData =
                await facilityprebo.GetPrintPreferences('general', null, this.Session.FacilityId);
            if (facilityPreferencesData && facilityPreferencesData.mrdfilerequest) {
                try {
                    mrdfilerequest = parseInt(facilityPreferencesData.mrdfilerequest);
                } catch (ex) { mrdfilerequest = 0; }
            }
        } catch (ex) { mrdfilerequest = 0; }

        return mrdfilerequest;
    }

    public async ManageMRDLocation(PatientMRN: string, RequestTypeId_: number,
        MRDTypeId_: number, PatientId: number, EncounterId: number,
        DoctorId: number, DoctorName: string, RackId: number,
        Self: string, Reason: string, FrmDeptId: number, ToDeptId: number,
        CurrentLocId: number, NewPatient: number, MRDFileStatusId: number,
        MRDMovementStatusId: number, IsMRDRequired: number, IsMRDFileCreation: number,
        IsManual: boolean, PriorityId: number, MrdRequestTypeId_: number): Promise<boolean> {

        let mrdlocationid = -1;
        let MRDLocationInstance: any = await this.Find({
            where: {
                PatientId: PatientId,
            },
            attributes: ['Id']
        });
        if (MRDLocationInstance) {
            let mrdlocation = this.GetAttribute(MRDLocationInstance);
            mrdlocationid = mrdlocation.Id;
        }
        if (mrdlocationid === -1) {

            let MRDCreation: any = {
                Id: 0,
                BarcodeId: PatientMRN,
                TransactionDate: new Date(),
                FacilityId: this.Session.FacilityId,
                DepartmentId: FrmDeptId,
                PatientId: PatientId,
                PatientMrn: PatientMRN,
                EncounterId: EncounterId,
                DoctorId: DoctorId,
                RackId: RackId,
                LocationId: ToDeptId,
                Self: Self,
                Reason: Reason,
                MRDFileStatusId: MRDFileStatusId,
                MRDMovementStatusId: MRDMovementStatusId,
                IsManual: IsManual,
                PriorityId: PriorityId,
                MRDTypeId: MRDTypeId_,
                RequestTypeId: MrdRequestTypeId_
            };
            let result = await this.Save(MRDCreation);
            mrdlocationid = result.dataValues.Id;
        } else if (mrdlocationid !== -1) {
            let MRDCreation: any = {
                Data: {
                    Id: mrdlocationid,
                    BarcodeId: PatientMRN,
                    TransactionDate: new Date(),
                    FacilityId: this.Session.FacilityId,
                    DepartmentId: FrmDeptId,
                    PatientId: PatientId,
                    PatientMrn: PatientMRN,
                    EncounterId: EncounterId,
                    DoctorId: DoctorId,
                    RackId: RackId,
                    LocationId: ToDeptId,
                    Self: Self,
                    Reason: Reason,
                    MRDFileStatusId: MRDFileStatusId,
                    MRDMovementStatusId: MRDMovementStatusId,
                    IsManual: IsManual,
                    PriorityId: PriorityId,
                    MRDTypeId: MRDTypeId_,
                    RequestTypeId: MrdRequestTypeId_
                }
            };
            await this.Update(MRDCreation.Data);
        }


        if (await this.isMRDFileRequest()) {
            let FileReqBo = BoFactory.GetBo(ipbo.FileRequestBo, this.Request);
            await FileReqBo.ManageFileRequest(PatientMRN, RequestTypeId_,
                MRDTypeId_, PatientId, EncounterId,
                DoctorId, DoctorName, RackId,
                Self, Reason, FrmDeptId, ToDeptId,
                CurrentLocId, MRDMovementStatusId, mrdlocationid, IsManual, PriorityId);
        }



        return true;
    }

    public async UpdateMRDLocation(req: BaseRequest): Promise<boolean> {
        let MRDLocBo = BoFactory.GetBo(ipbo.MRDLocationBo, this.Request);
        await MRDLocBo.UpdateMRDLocationWithStatus(req.Data);
        let MRDMoveBo = BoFactory.GetBo(ipbo.MRDMovementBo, this.Request);
        await MRDMoveBo.ManageMRDMovementUpdates(req.Data);
        let filereqBo = BoFactory.GetBo(ipbo.FileRequestBo, this.Request);
        await filereqBo.UpdateFileRequestWithStatus(req.Data);
        return true;
    }

    public async UpdateMRDLocationFromRequest(req: BaseRequest): Promise<boolean> {
        let updateData: any = {
            Data: {
                Id: req.Data.MrdLocId,
                DepartmentId: req.Data.DepartmentId,
                LocationId: req.Data.LocationId,
                MRDMovementStatusId: req.Data.MRDMovementStatusId,
                PatientId: req.Data.PatientId,
                EncounterId: req.Data.EncounterId,
                MRDFileStatusId: req.Data.MRDFileStatusId,
                TransactionDate: new Date(),
                PriorityId: req.Data.PriorityId,
                IsManual: req.Data.IsManual,
                MRDTypeId: req.Data.MRDTypeId,
                RequestTypeId: req.Data.RequestTypeId,
            }
        };
        let result = await this.Update(updateData.Data);
        return result;
    }

    public async UpdateMRDLocationWithStatus(details: MRDLocationAttributes[])
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
    public async UpdateMRDLocationData(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetMRDLocationById(req: BaseRequest): Promise<MRDLocationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetMRDLocations(apiReq?: ApiRequest<MRDLocationFilters>):
        Promise<ApiResponse<MRDLocationAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'PatientDepartment', required: false });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName', 'IsMRDLocation'],
            as: 'FileLocation', required: false
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'AdmissionDate',
                'DischargeDate', 'EncounterId', 'IsBillCompleted', 'IsLatest', 'VisitTypeId'], required: false,
            include: [this.GetReference('VisitType'), this.GetReference('EncounterType')]
        });
        include.push(this.GetReference('PRIORITY', ['Description', 'ColorCode']));
        include.push(this.GetReference('MRDFileStatus'));
        include.push(this.GetReference('FileRack'));
        include.push(this.GetReference('MRDMovementStatus'));
        include.push(this.GetReference('EncounterType'));
        include.push(this.GetReference('MRDRequestType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case MRDLocationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case MRDLocationFilters.BarcodeId:
                        where['BarcodeId'] = param.Value;
                        break;
                    case MRDLocationFilters.TransactionDate:
                        where['TransactionDate'] = param.Value;
                        break;
                    case MRDLocationFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case MRDLocationFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case MRDLocationFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case MRDLocationFilters.PatientMrn:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Mobile: { [Op.like]: (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case MRDLocationFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case MRDLocationFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case MRDLocationFilters.RackId:
                        where['RackId'] = param.Value;
                        break;
                    case MRDLocationFilters.LocationId:
                        where['LocationId'] = param.Value;
                        break;
                    case MRDLocationFilters.MRDFileStatusId:
                        where['MRDFileStatusId'] = param.Value;
                        break;
                    case MRDLocationFilters.From:
                        where['TransactionDate'] = where['TransactionDate'] || {};
                        (where['TransactionDate'] as any)['$gte'] = param.Value;
                        break;
                    case MRDLocationFilters.To:
                        where['TransactionDate'] = where['TransactionDate'] || {};
                        (where['TransactionDate'] as any)['$lte'] = param.Value;
                        break;
                    case MRDLocationFilters.MRDMovementStatusId:
                        where['MRDMovementStatusId'] = param.Value;
                        break;
                    case MRDLocationFilters.MovementStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['MRDMovementStatusId'] = { '$in': paramArr };
                        }
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
        order.push(['TransactionDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteMRDLocation(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<MRDLocationInstance, MRDLocationAttributes> {
        return this.Models.MRDLocation;
    }
}

