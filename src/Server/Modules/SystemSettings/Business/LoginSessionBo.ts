import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, CreateOptions, UpdateOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { LoginSessionInstance, LoginSessionAttributes } from '../Model/Interface/Index';
import { LoginSessionFilters } from '../Common/Filters.e';

export class LoginSessionBo extends BaseBo<LoginSessionInstance, LoginSessionAttributes>  {
    public async AddLoginSession(req: BaseRequest): Promise<number> {
        let options: CreateOptions = {};
        req.Data.UpdatedBy = req.Data.UserId;
        req.Data.CreatedBy = req.Data.UserId;
        req.Data.Status = 1;
        let result = await this.Items.create(req.Data, options);
        return result.dataValues.Id;
    }

    public async checkExistingLoginSession(req: BaseRequest): Promise<number> {
        let existingLoginSessions = await this.FindAll({
            where: {
                'UserName': req.Data.UserName,
                'LogoutTime': null,
            }
        });
        if (existingLoginSessions && existingLoginSessions.length > 0) {
            return (existingLoginSessions.length * -1);
        }
        return 1;
    }

    public async updateLoginSession(req: BaseRequest): Promise<boolean> {
        let promises: Array<any> = [];
        let result: any = await this.FindAll({
            where: {
                'UserId': req.Data.UserId,
                'LogoutTime': null,
            }
        });
        //console.log('before loop');

        let existingLoginSessions = this.GetAttributes(result);

        existingLoginSessions.forEach(session => {
            let options: UpdateOptions = { where: { Id: session.Id } };
            session.LogoutTime = new Date();
            session.UpdatedBy = session.UserId;
            //console.log(session);
            promises.push(this.Items.update(session, options));
        });
        await Promise.all(promises);

        //TODO : Clear redis sessions

        return true;
    }

    public async KeepAlive(req: BaseRequest): Promise<boolean> {
        return true;
    }

    public async GetLicenseDetails(req: BaseRequest): Promise<any> {
        return { LicenseEndDate: process.env.LICENSE_END_DATE };
    }

    public async GetLoginSessionById(req: BaseRequest): Promise<LoginSessionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLoginSessions(apiReq?: ApiRequest<LoginSessionFilters>): Promise<ApiResponse<LoginSessionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case LoginSessionFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case LoginSessionFilters.UserId:
                    where['UserId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteLoginSession(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<LoginSessionInstance, LoginSessionAttributes> {
        return this.Models.LoginSession;
    }

}
