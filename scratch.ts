import { BoFactory } from './api/src/Server/Core/Base/Index';
import * as lisbo from './api/src/Server/Modules/LIS/Business/Index';
import { PatientWorkorderdetailsFilters } from './api/src/Common/Enums/Index';

async function run() {
    let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, <any>{});
    let Req: any = {
        Id: 0,
        PageContext: { PageSize: 1, PageNumber: 1 },
        Params: [
            { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
            { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }
        ]
    };
    let data = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
    console.log(JSON.stringify(data.Data[0], null, 2));
}

run().then(() => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
