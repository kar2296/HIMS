import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientRefundDetailsInstance, i.PatientRefundDetailsAttributes> {
    let PatientRefundDetails =
        sequelize.define<i.PatientRefundDetailsInstance, i.PatientRefundDetailsAttributes>('PatientRefundDetails', {
            Id: { type: DataTypes.BIGINT, field: 'PatientRefundDetailsId', primaryKey: true, autoIncrement: true },
            RefundDetailsDateTime: { type: DataTypes.DATE, field: 'RefundDetailsDateTime' },
            PatientRefundId: { type: DataTypes.BIGINT, field: 'PatientRefundId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            RefundAmount: { type: DataTypes.DOUBLE, field: 'RefundAmount' },
            DepartmentID: { type: DataTypes.BIGINT, field: 'DepartmentID' },
            StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
            PaymentCounterId: { type: DataTypes.BIGINT, field: 'PaymentCounterId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
            ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
            ReturnQuantity: { type: DataTypes.DECIMAL, field: 'ReturnQuantity' },
            BatchId: { type: DataTypes.STRING, field: 'BatchId' },
            ExpiryDate: { type: DataTypes.INTEGER, field: 'ExpiryDate' },
            Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
            GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
            GrossGSTAmount: { type: DataTypes.DECIMAL, field: 'GrossGSTAmount' },
            DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
            DoctorDiscountAmount: { type: DataTypes.DECIMAL, field: 'DoctorDiscountAmount' },
            GSTId: { type: DataTypes.INTEGER, field: 'GSTId' },
            GSTAmount: { type: DataTypes.DECIMAL, field: 'GSTAmount' },
            EducationCess: { type: DataTypes.DECIMAL, field: 'EducationCess' },
            NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            PharmacyReturnId: { type: DataTypes.BIGINT, field: 'PharmacyReturnId' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            RoundOffValue: { type: DataTypes.DECIMAL, field: 'RoundOffValue' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'patientrefunddetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });


    return PatientRefundDetails;
}
