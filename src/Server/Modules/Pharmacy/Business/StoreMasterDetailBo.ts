import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
// import { BoFactory } from '../../Base/Business/Index';
// import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest } from '../../../Common/Index';
import { StoreMasterDetailInstance, StoreMasterDetailAttributes } from '../Model/Interface/Index';
// import { StoreMasterDetailFilters, ItemStoreFilters } from '../Common/Filters.e';
// import * as bo from '../../Pharmacy/Business/Index';
// import { readFileSync } from 'fs';
// import { join } from 'path';
// import * as appMgrBO from '../../SystemSettings/Business/Index';

export class StoreMasterDetailBo extends BaseBo<StoreMasterDetailInstance, StoreMasterDetailAttributes> {
    public async AddStoreMasterDetail(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.LogoPath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public GetModel(): SStatic.Model<StoreMasterDetailInstance, StoreMasterDetailAttributes> {
        return this.Models.StoreMasterDetail;
    }


}
