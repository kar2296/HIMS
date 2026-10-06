import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LHRCVoucherDetailInstance, i.LHRCVoucherDetailAttributes> {
    let LHRCVoucherDetail = sequelize.define<i.LHRCVoucherDetailInstance, i.LHRCVoucherDetailAttributes>('LHRCVoucherDetail', {
        Id: { type: DataTypes.BIGINT, field: 'LHRCVoucherDetailsId', primaryKey: true, autoIncrement: true },
        LHRCVoucherId: { type: DataTypes.BIGINT, field: 'LHRCVoucherId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        AmbulanceName: { type: DataTypes.STRING, field: 'AmbulanceName' },
        DriverName: { type: DataTypes.STRING, field: 'DriverName' },
        VehicleName: { type: DataTypes.STRING, field: 'VehicleName' },
        PayTo: { type: DataTypes.STRING, field: 'PayTo' },
        VoucherAmount: { type: DataTypes.DECIMAL, field: 'VoucherAmount' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
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
            tableName: 'lhrcvoucherdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    // (LHRCVoucherDetail as any).associate = function (models: Models) {
    //     LHRCVoucherDetail.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
    //     LHRCVoucherDetail.belongsTo(models.PatientBillDetails, { foreignKey: 'PatientBillDetailId' });
    //     // LHRCVoucherDetail.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
    //     LHRCVoucherDetail.belongsTo(models.ReferenceValue, { as: 'InvoiceStatus', targetKey: 'ReferenceValueCodeId' });
    //     LHRCVoucherDetail.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
    //     LHRCVoucherDetail.belongsTo(models.User, { foreignKey: 'CreatedBy' });
    // };
    return LHRCVoucherDetail;
}
