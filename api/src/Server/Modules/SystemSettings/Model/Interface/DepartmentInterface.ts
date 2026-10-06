import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DepartmentAttributes extends IAttributes {
    Id: number;
    ParentDepartmentId: number;
    DepartmentCode: string;
    DepartmentName: string;
    DepartmentTypeId: number;
    Description: string;
    IsMRDLocation: boolean;
    IsAssetDept: boolean;
    GenderId: number;
    SpecialityId: number;
    PhoneNo: string;
    IsEmergency: boolean;
    IsAdmittingDept: boolean;
    IsAllFacility: boolean;
    FacilityId: number;
    IncludeMRDRequired: boolean;
    IsPatientFlowMandatory: boolean;
    IsProcessingCenter: boolean;
    IsIPClearence: boolean;
    CostCenterId: number;
    URL: string;
    ThresholdDuration: number;
    FollowupDays: number;
    NightStartTime: string;
    NightEndTime: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    DepartmentLogo: string;
    DeptSeqName: string;
    IsParentDepartment: boolean;
    IsVirtual: boolean;
    IsPatientPortal: boolean;
    IsActive: boolean;
    DisplayOrder: number;
    IsBloodBank: boolean;
    IsDiet: boolean;
    ActiveStatusId: number;
    LogoPath: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DepartmentInstance extends Instance<DepartmentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DepartmentAttributes;
}
