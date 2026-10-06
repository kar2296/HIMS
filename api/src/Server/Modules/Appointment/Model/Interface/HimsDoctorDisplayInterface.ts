import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface DoctorDisplayAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    Displaydate: Date;
    DoctorId: number;
    DoctorName: number;
    DepartmentId: number;
    RoomNo: string;
    LocationId: number;
    Availablefrom: string;
    Availableto: string;
    DisplayNoId:number;
    DisplayStatusId:number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DoctorDisplayInstance extends Instance<DoctorDisplayAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DoctorDisplayAttributes;
}
