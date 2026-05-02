import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { IncidentManagementInstance, IncidentManagementAttributes } from '../Model/Interface/Index';
import { IncidentManagementFilters } from '../Common/Filters.e';

export class IncidentManagementBo extends BaseBo<IncidentManagementInstance, IncidentManagementAttributes> {
    public async AddIncidentManagement(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateIncidentManagement(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetMaxId(req: BaseRequest): Promise<number> {
        let MaxId = 0;
        let maxidInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('IncidentManagementId')), 'IncidentManagementId'],
            ],
            where: {
                Status: 1,
            }
        });
        if (maxidInstance) {
            let Incident: any = this.GetAttribute(maxidInstance);
            let lastIncidentManagementId = Incident['IncidentManagementId'];
            if (lastIncidentManagementId) MaxId = lastIncidentManagementId;
        }
        return ++MaxId;

    }

    public async GetIncidentManagementById(req: BaseRequest): Promise<IncidentManagementAttributes> {
        let include: Array<IncludeOptions> = [];
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetIncidentManagements(apiReq?:
        ApiRequest<IncidentManagementFilters>): Promise<ApiResponse<IncidentManagementAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('IncidentType'));
        include.push(this.GetReference('Priority'));
        include.push(this.GetReference('IncidentStatus'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AssignedToUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.Patient,
            attributes: ['PatientId', 'FirstName', 'TitleId', 'LastName', 'MRN'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AssignedFromUser', required: false,
            include: [this.GetReference('Title')]
        });
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case IncidentManagementFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case IncidentManagementFilters.IncidentTypeId:
                        where['IncidentTypeId'] = param.Value;
                        break;
                    case IncidentManagementFilters.IncidentStatusId:
                        where['IncidentStatusId'] = param.Value;
                        break;
                    case IncidentManagementFilters.PriorityId:
                        where['PriorityId'] = param.Value;
                        break;
                    case IncidentManagementFilters.IncidentNo:
                        where['IncidentNo'] = { [Op.like]: '%' + (param.Value || '') + '%' };
                        break;
                    case IncidentManagementFilters.IncidentDate:
                        where['IncidentDate'] = { [Op.between]: param.Value || '' };
                        break;
                    case IncidentManagementFilters.From:
                        where['IncidentDate'] = where['IncidentDate'] || {};
                        (where['IncidentDate'] as any)[Op.gte] = param.Value;
                        break;
                    case IncidentManagementFilters.To:
                        where['IncidentDate'] = where['IncidentDate'] || {};
                        (where['IncidentDate'] as any)[Op.lte] = param.Value;
                        break;
                    case IncidentManagementFilters.AssignedFrom:
                        where['AssignedFrom'] = param.Value;
                        break;
                    case IncidentManagementFilters.AssignedTo:
                        where['AssignedTo'] = param.Value;
                        break;
                    case IncidentManagementFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case IncidentManagementFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async DeleteIncidentManagement(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public GetModel(): SStatic.Model<IncidentManagementInstance, IncidentManagementAttributes> {
        return this.Models.IncidentManagement;
    }
}
