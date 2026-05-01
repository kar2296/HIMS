import { BaseService, BoFactory } from '../../Base/Index';
import { TokenDisplayBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common';
import { Request } from '../../../Core/Index';
import { TokenDisplayAttributes } from '../Model/Interface/Index';
import { TokenDisplayFilters } from '../Common/Filters.e';

export class TokenDisplayService extends BaseService {
    private TokenDisplayBo: TokenDisplayBo;
    constructor(req?: Request) {
        super(req);
        this.TokenDisplayBo = BoFactory.GetBo(TokenDisplayBo, this.Request);
    }

    public async AddTokenDisplay(req: BaseRequest): Promise<number> {
        return await this.TokenDisplayBo.AddTokenDisplay(req);
    }

    public async UpdateTokenDisplay(req: BaseRequest): Promise<boolean> {
        return await this.TokenDisplayBo.UpdateTokenDisplay(req);
    }

    public async GetTokenDisplayById(req: BaseRequest): Promise<TokenDisplayAttributes> {
        return await this.TokenDisplayBo.GetTokenDisplayById(req);
    }
    public async GetListofTokens(apiReq?: ApiRequest<TokenDisplayFilters>): Promise<number[]> {
        return await this.TokenDisplayBo.GetListofTokens(apiReq);
    }

    public async GetTokenDisplays(apiReq?: ApiRequest<TokenDisplayFilters>):
        Promise<ApiResponse<TokenDisplayAttributes[]>> {
        return await this.TokenDisplayBo.GetTokenDisplays(apiReq);
    }

    public async DeleteTokenDisplay(req: BaseRequest): Promise<Boolean> {
        return await this.TokenDisplayBo.DeleteTokenDisplay(req);
    }
}
