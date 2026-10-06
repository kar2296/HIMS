import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common';
import { MRDMovementInstance, MRDMovementAttributes, MRDLocationAttributes } from '../Model/Interface/Index';
import { MRDMovementFilters, } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as encbo from '../../Visit/Business/Index';


export class MRDMovementBo extends BaseBo<MRDMovementInstance, MRDMovementAttributes>  {
    public async AddMRDMovement(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        let FilemovementId = result.dataValues.Id;
        return FilemovementId;
    }

    public async ManageMRDMovement(PatientMRN: string, RequestTypeId_: number,
        MRDTypeId_: number, PatientId: number, EncounterId: number,
        DoctorId: number, DoctorName: string, Reason: string, FrmDeptId: number,
        ToDeptId: number, CurrentLocId: number, NewPatient: number, MRDFileStatusId: number,
        MRDMovementStatusId: number): Promise<boolean> {
        if (NewPatient === 1) { // Only new Patient
            let MRDMovement: any = {
                Id: 0,
                BarcodeId: PatientMRN,
                TransactionDate: new Date(),
                FacilityId: this.Session.FacilityId,
                FromDepartmentId: FrmDeptId,
                PatientId: PatientId,
                PatientMrn: PatientMRN,
                EncounterId: EncounterId,
                DoctorId: DoctorId,
                ToDepartmentId: ToDeptId,
                Reason: Reason,
                MRDFileStatusId: MRDFileStatusId,
                MRDMovementStatusId: 0
            };
            await this.Save(MRDMovement);
            let encReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: EncounterFilters.Id, Value: EncounterId }]
            };
            let encBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encounterData = await encBO.GetEncounters(encReq);
            let Encounter = encounterData.Data[0];
            let MRDVisitEntry: any = {
                Id: 0,
                BarcodeId: PatientMRN,
                TransactionDate: new Date(),
                FacilityId: this.Session.FacilityId,
                FromDepartmentId: ToDeptId,
                PatientId: PatientId,
                PatientMrn: PatientMRN,
                EncounterId: EncounterId,
                DoctorId: DoctorId,
                ToDepartmentId: Encounter.DepartmentId,
                Reason: Reason,
                MRDMovementStatusId: MRDMovementStatusId
            };
            await this.Save(MRDVisitEntry);
        }
        return true;
    }
    public async ManageMRDMovementUpdates(details: MRDLocationAttributes[])
        : Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (details.length > 0) {
                    let MRDUpdateMovement: any = {
                        Id: 0,
                        BarcodeId: detail.PatientMrn,
                        TransactionDate: new Date(),
                        FacilityId: detail.FacilityId,
                        FromDepartmentId: detail.DepartmentId,
                        PatientId: detail.PatientId,
                        PatientMrn: detail.PatientMrn,
                        EncounterId: detail.EncounterId,
                        DoctorId: detail.DoctorId,
                        ToDepartmentId: detail.LocationId,
                        Reason: detail.Reason,
                        MRDFileStatusId: detail.MRDFileStatusId,
                        MRDMovementStatusId: detail.MRDMovementStatusId
                    };
                    await this.Save(MRDUpdateMovement);
                }
                // else if (detail.Id > 0) {
                //     await this.Update(detail);
                // }
            })(DetailItem);
        }));
        return true;
    }
    public async UpdateMRDMovement(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetMRDMovementById(req: BaseRequest): Promise<MRDMovementAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetMRDMovements(apiReq?: ApiRequest<MRDMovementFilters>):
        Promise<ApiResponse<MRDMovementAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'PatientDepartment', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'FileLocation', required: false });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('MRDFileStatus'));
        include.push(this.GetReference('MRDMovementStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case MRDMovementFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case MRDMovementFilters.BarcodeId:
                        where['BarcodeId'] = param.Value;
                        break;
                    case MRDMovementFilters.TransactionDate:
                        where['TransactionDate'] = param.Value;
                        break;
                    case MRDMovementFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case MRDMovementFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case MRDMovementFilters.PatientMrn:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Mobile: { [Op.like]: (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case MRDMovementFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case MRDMovementFilters.From:
                        where['TransactionDate'] = where['TransactionDate'] || {};
                        (where['TransactionDate'] as any)['$gte'] = param.Value;
                        break;
                    case MRDMovementFilters.To:
                        where['TransactionDate'] = where['TransactionDate'] || {};
                        (where['TransactionDate'] as any)['$lte'] = param.Value;
                        break;
                    case MRDMovementFilters.MRDMovementStatusId:
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
        order.push(['TransactionDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteMRDMovement(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<MRDMovementInstance, MRDMovementAttributes> {
        return this.Models.MRDMovement;
    }
}

