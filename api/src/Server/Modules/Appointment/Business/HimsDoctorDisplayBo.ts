import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common';
import { DoctorDisplayInstance, DoctorDisplayAttributes } from '../Model/Interface/Index';
import { DoctorDisplayFilters } from '../Common/Filters.e';

export class DoctorDisplayBo extends BaseBo<DoctorDisplayInstance, DoctorDisplayAttributes>  {
    public async AddDoctorDisplay(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDoctorDisplay(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDoctorDisplayById(req: BaseRequest): Promise<DoctorDisplayAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetListofDoctors(req: BaseRequest):
        Promise<number[]> {
        let result: Array<number> = [];
        let response = await this.FindAll({
            where: {
                DisplayStatusId: 1,
                DisplayNoId: req.Id
            },
            attributes: ['Id']
        });
        response.forEach((res) => {
            let attribs = this.GetAttribute(res);
            result.push(attribs.Id);
        });
        return result;
    }

    public async GetDoctorDisplays(apiReq?: ApiRequest<DoctorDisplayFilters>):
        Promise<ApiResponse<DoctorDisplayAttributes[]>> {
        let where: WhereOptions<any> = {};
        let doctorWhere: WhereOptions<any> = {};
        let deptWhere: WhereOptions<any> = {};
        let isReqDoctorSearch, isReqDeptSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('DisplayStatus'));
        include.push(this.GetReference('DisplayNo'));
        include.push(this.GetReference('LOCATION'));
        // include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DoctorDisplayFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DoctorDisplayFilters.Department:
                        where['DepartmentId'] = param.Value;
                        break;
                    case DoctorDisplayFilters.Location:
                        where['LocationId'] = param.Value;
                        break;
                    case DoctorDisplayFilters.DoctorName:
                        where['DoctorId'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case DoctorDisplayFilters.DisplayStatus:
                        where['DisplayStatusId'] = param.Value;
                        break;
                    case DoctorDisplayFilters.DisplayNo:
                        where['DisplayNoId'] = param.Value;
                        break;
                    case DoctorDisplayFilters.Docname:
                        (doctorWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqDoctorSearch = true;
                        break;
                    case DoctorDisplayFilters.Deptname:
                        (deptWhere as any)['$or'] = [{ 'DepartmentName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'DepartmentCode': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqDeptSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'],
            where: doctorWhere,
            required: isReqDoctorSearch,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName', 'DepartmentCode'],
            where: deptWhere,
            required: isReqDeptSearch
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDoctorDisplay(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DoctorDisplayInstance, DoctorDisplayAttributes> {
        return this.Models.DoctorDisplay;
    }
    public async GetOPDDashBoardInfo(req: BaseRequest): Promise<any> {
        let DoctorDisplayCount = await this.Items.count({
            where: {
                'Status': 1,
                'DisplayStatusId': 1,
                'CreatedAt': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                // 'FacilityId': req.Data.FacilityId,
            }
        });
        return {
            'DoctorDisplayCount': DoctorDisplayCount,
        };
    }
}

