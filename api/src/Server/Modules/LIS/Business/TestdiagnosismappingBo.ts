import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { TestdiagnosismappingInstance, TestdiagnosismappingAttributes } from '../Model/Interface/Index';
import { TestdiagnosisFilters } from '../Common/Filters.e';

export class TestdiagnosismappingBo extends BaseBo<TestdiagnosismappingInstance, TestdiagnosismappingAttributes> {
    public async AddTestdiagnosismapping(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTestdiagnosismapping(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetTestdiagnosismappingById(req: BaseRequest): Promise<TestdiagnosismappingAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTestdiagnosismappings(apiReq?: ApiRequest<TestdiagnosisFilters>):
        Promise<ApiResponse<TestdiagnosismappingAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Diagnosis, as: 'Diagnosis', attributes: ['DiagnosisName'], required: false });
        include.push(this.GetReference('DiagnosisCodeScheme'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TestdiagnosisFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TestdiagnosisFilters.TestMasterId:
                        where['TestmasterId'] = param.Value;
                        break;
                    case TestdiagnosisFilters.DiagnosistypeId:
                        where['DiagnosistypeId'] = param.Value;
                        break;
                    case TestdiagnosisFilters.DiagnosisId:
                        where['DiagnosisId'] = param.Value;
                        break;
                    case TestdiagnosisFilters.status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTestdiagnosismapping(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TestdiagnosismappingInstance, TestdiagnosismappingAttributes> {
        return this.Models.Testdiagnosismapping;
    }
}
