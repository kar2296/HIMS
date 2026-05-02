import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DoctorShareTdsInstance, i.DoctorShareTdsAttributes> {
    let DoctorShareTds = sequelize.define<i.DoctorShareTdsInstance, i.DoctorShareTdsAttributes>('DoctorShareTds', {
        Id: { type: DataTypes.BIGINT, field: 'PatientBillId', primaryKey: true, autoIncrement: true },
        PatientBillDetailId: { type: DataTypes.BIGINT, field: 'PatientBillDetailId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        VisitIdentifier: { type: DataTypes.STRING, field: 'VisitIdentifier' },
        BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
        BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        SwosthaID: { type: DataTypes.BIGINT, field: 'SwosthaID' },
        BillDoctorId: { type: DataTypes.BIGINT, field: 'BillDoctorId' },
        BillDoctorName: { type: DataTypes.STRING, field: 'BillDoctorName' },
        ShareDoctorId: { type: DataTypes.BIGINT, field: 'ShareDoctorId' },
        ShareDoctorName: { type: DataTypes.STRING, field: 'ShareDoctorName' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        TestDepartment: { type: DataTypes.STRING, field: 'TestDepartment' },
        ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
        TestName: { type: DataTypes.STRING, field: 'TestName' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        CategoryName: { type: DataTypes.STRING, field: 'CategoryName' },
        Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        GrossDoctorShare: { type: DataTypes.DECIMAL, field: 'GrossDoctorShare' },
        TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
        NetDoctorShare: { type: DataTypes.DECIMAL, field: 'NetDoctorShare' },
        ProviderShare: { type: DataTypes.DECIMAL, field: 'ProviderShare' },
        ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
        ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
        BillGeneratedBy: { type: DataTypes.BIGINT, field: 'BillGeneratedBy' },
        BillGeneratedName: { type: DataTypes.STRING, field: 'BillGeneratedName' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        PatientBillStatusId: { type: DataTypes.BIGINT, field: 'PatientBillStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        PatientDoctorShareDetailId: { type: DataTypes.BIGINT, field: 'PatientDoctorShareDetailId' },

    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'Patient_DoctorShare_Details',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (DoctorShareTds as any).associate = function (models: Models) {
        DoctorShareTds.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        DoctorShareTds.belongsTo(models.ReferenceValue, { as: 'EncounterType', targetKey: 'ReferenceValueCodeId' });
    };
    return DoctorShareTds;
}
