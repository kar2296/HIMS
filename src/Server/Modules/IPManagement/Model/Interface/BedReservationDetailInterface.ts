import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BedReservationDetailAttributes extends IAttributes {
    Id: number;
    ReserveMaintenanceTypeId : number;
	FacilityId : number;
	WardId : number;
	RoomId : number;
	BedId : number;
	BedReservationTypeId : number;
	BedMaintenanceTypeId : number;
	FromDate: Date;
	ToDate: Date;
    Details:string;
    Status: number;
    ReleaseStatusId: number;
    Rev: number;
    ReleasedById: number;
    ReleasedOn: Date;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface BedReservationDetailInstance extends Instance<BedReservationDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BedReservationDetailAttributes;
}
