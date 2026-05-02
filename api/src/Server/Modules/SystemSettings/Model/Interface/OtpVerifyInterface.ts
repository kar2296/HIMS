import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface OtpVerifyAttributes extends IAttributes {
    Id: number;
    CountryCode: string;
    Mobile: string;
    Otp: string;
    IsOtpVerified: boolean;
    ForgotOtp: string;
    IsForgotOtpVerified: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OtpVerifyInstance extends Instance<OtpVerifyAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OtpVerifyAttributes;
}
