import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface LabourCostAttributes extends IAttributes {
    Id: number;
    LabourCostId: number;
    CostDetailId: number;
    EmployeeName: string;
	 FacilityId: number;
    AvgProcedure: string;
    ProcedureCost: string;
    EmployeeTypeId: number;
     EmployeeId: number;
    CTC: number;
    AdditionalCost: number;
    TotalCTC: number;
    NetCTC: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LabourCostInstance extends Instance<LabourCostAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LabourCostAttributes;
}
