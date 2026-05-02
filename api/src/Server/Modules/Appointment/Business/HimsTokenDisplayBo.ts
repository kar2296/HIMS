import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common';
import { TokenDisplayInstance, TokenDisplayAttributes } from '../Model/Interface/Index';
import { TokenDisplayFilters } from '../Common/Filters.e';

export class TokenDisplayBo extends BaseBo<TokenDisplayInstance, TokenDisplayAttributes>  {
    public async AddTokenDisplay(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTokenDisplay(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetTokenDisplayById(req: BaseRequest): Promise<TokenDisplayAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetListofTokens(req: BaseRequest):
        Promise<number[]> {
        let result: Array<number> = [];
        let response = await this.FindAll({
            where: {
                DepartmentId: req.Id,
                Status: req.Data.Status,
                TokenStatusId: req.Data.TokenStatusId
            },
            attributes: ['Id']
        });
        response.forEach((res) => {
            let attribs = this.GetAttribute(res);
            result.push(attribs.Id);
        });
        return result;
    }

    public async GetTokenDisplays(apiReq?: ApiRequest<TokenDisplayFilters>):
        Promise<ApiResponse<TokenDisplayAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any>= {};
        let isReqPatientSearch: boolean = false;
        include.push(this.GetReference('TokenStatus'));
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        // include.push({
        //     model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
        //     include: [this.GetReference('Title')]
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TokenDisplayFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TokenDisplayFilters.Department:
                        where['DepartmentId'] = param.Value;
                        break;
                    case TokenDisplayFilters.TokenStatus:
                        where['TokenStatusId'] = param.Value;
                        break;
                    case TokenDisplayFilters.PatientOrderId:
                        where['PatientOrderId'] = param.Value;
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
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTokenDisplay(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TokenDisplayInstance, TokenDisplayAttributes> {
        return this.Models.TokenDisplay;
    }

}

