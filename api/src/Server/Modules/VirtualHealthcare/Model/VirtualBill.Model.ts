import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualBillInstance, i.VirtualBillAttributes> {

    const VirtualBill = sequelize.define<i.VirtualBillInstance, i.VirtualBillAttributes>(
        'VirtualBill',
        {
            Id: { type: DataTypes.BIGINT, field: 'VirtualBillId', primaryKey: true, autoIncrement: true },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            VirtualCategoryId: { type: DataTypes.BIGINT, field: 'VirtualCategoryId' },
            VirtualSubCategoryId: { type: DataTypes.BIGINT, field: 'VirtualSubCategoryId' },
            CategoryTypeId: { type: DataTypes.BIGINT, field: 'CategoryTypeId' },
            BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
            BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
            VirtualBillTypeId: { type: DataTypes.BIGINT, field: 'VirtualBillTypeId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            PatientMrn: { type: DataTypes.STRING, field: 'PatientMrn' },
            Mobile: { type: DataTypes.STRING, field: 'Mobile' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
            NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
            BillDiscount: { type: DataTypes.DECIMAL, field: 'BillDiscount' },
            DiscountPercentage: { type: DataTypes.DECIMAL, field: 'DiscountPercentage' },
            BillDiscountTypeId: { type: DataTypes.BIGINT, field: 'BillDiscountTypeId' },
            DiscountApprovedBy: { type: DataTypes.BIGINT, field: 'DiscountApprovedBy' },
            BillDiscountModeId: { type: DataTypes.BIGINT, field: 'BillDiscountModeId' },
            DiscountModeValue: { type: DataTypes.DECIMAL, field: 'DiscountModeValue' },
            RoundOffValue: { type: DataTypes.DECIMAL, field: 'RoundOffValue' },
            VirtualBillStatusId: { type: DataTypes.BIGINT, field: 'VirtualBillStatusId' }, // ✅ added
            BilledCounter: { type: DataTypes.INTEGER, field: 'BilledCounter' },             // ✅ added
            PaidAmount: { type: DataTypes.DECIMAL, field: 'PaidAmount' },
            IsPaidFully: { type: DataTypes.BOOLEAN, field: 'IsPaidFully' },
            ReturnedAmount: { type: DataTypes.DECIMAL, field: 'ReturnedAmount' },
            OutStandingAmount: { type: DataTypes.DECIMAL, field: 'OutStandingAmount' },
            BillGeneratedBy: { type: DataTypes.BIGINT, field: 'BillGeneratedBy' },
            BillApprovedBy: { type: DataTypes.BIGINT, field: 'BillApprovedBy' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            CancelAmount: { type: DataTypes.DECIMAL, field: 'CancelAmount' },
            CancelReason: { type: DataTypes.STRING, field: 'CancelReason' },
            CancelledBy: { type: DataTypes.BIGINT, field: 'CancelledBy' },
            IsManualBill: { type: DataTypes.BOOLEAN, field: 'IsManualBill' },
            ManualBillNumber: { type: DataTypes.STRING, field: 'ManualBillNumber' },
            ManualBillDate: { type: DataTypes.DATE, field: 'ManualBillDate' },
            ManualBillComments: { type: DataTypes.STRING, field: 'ManualBillComments' },
            ToBeRefunded: { type: DataTypes.DECIMAL, field: 'ToBeRefunded' },
            RefundAmount: { type: DataTypes.DECIMAL, field: 'RefundAmount' },
            VirtualOrderId: { type: DataTypes.INTEGER, field: 'VirtualOrderId' },
            PaymentModeId: { type: DataTypes.INTEGER, field: 'PaymentModeId' },
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
            tableName: 'hims_virtualbills',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: { Status: 1 }
            }
        }
    );

    (VirtualBill as any).associate = function (models: any) {
        VirtualBill.belongsTo(models.VirtualCategory, { foreignKey: 'VirtualCategoryId' });
        VirtualBill.belongsTo(models.VirtualSubCategory, { foreignKey: 'VirtualSubCategoryId' });
        VirtualBill.belongsTo(models.ReferenceValue, {
            as: 'ConsultancyType',
            targetKey: 'ReferenceValueCodeId',
            foreignKey: 'CategoryTypeId'
        });
        VirtualBill.belongsTo(models.ReferenceValue, {
            as: 'VirtualBillStatus',
            targetKey: 'ReferenceValueCodeId',
            foreignKey: 'VirtualBillStatusId'
        });
    };

    return VirtualBill;
}
