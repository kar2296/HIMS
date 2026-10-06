import {BaseService, BoFactory} from '../../Base/Index';
import { UserDefinedFieldBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ISearchEnums} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { UserDefinedFieldAttributes} from '../Model/Interface/Index';

export class UserDefinedFieldService extends BaseService {
    private UserDefinedFieldBo: UserDefinedFieldBo;
    constructor(req?: Request) {
        super(req);
        this.UserDefinedFieldBo = BoFactory.GetBo(UserDefinedFieldBo, this.Request);
    }

    public async AddUserDefinedField(req: BaseRequest): Promise<number> {
        return await this.UserDefinedFieldBo.AddUserDefinedField(req);
    }

    public async UpdateUserDefinedField(req: BaseRequest): Promise<boolean> {
        return await this.UserDefinedFieldBo.UpdateUserDefinedField(req);
    }

    public async GetUserDefinedFieldById(req: BaseRequest): Promise<UserDefinedFieldAttributes> {
        return await this.UserDefinedFieldBo.GetUserDefinedFieldById(req);
    }

    public async GetUserDefinedFields(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<UserDefinedFieldAttributes>> {
        return await this.UserDefinedFieldBo.GetUserDefinedFields(apiReq);
    }

    public async DeleteUserDefinedField(req: BaseRequest): Promise<Boolean> {
        return await this.UserDefinedFieldBo.DeleteUserDefinedField(req);
    }
}
