import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CollectionBaseRevenueInstance, i.CollectionBaseRevenueAttributes> {
    let CollectionBaseRevenue = sequelize.define<i.CollectionBaseRevenueInstance,
        i.CollectionBaseRevenueAttributes>('CollectionBaseRevenue', {
            Id: { type: DataTypes.BIGINT, field: 'CollectionBaseRevenueId', primaryKey: true, autoIncrement: true },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            PatientBillDetailId: { type: DataTypes.BIGINT, field: 'PatientBillDetailId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
            CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
            ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
            VisitIdentifier: { type: DataTypes.STRING, field: 'VisitIdentifier' },
            BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
            BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            SwosthaID: { type: DataTypes.STRING, field: 'SwosthaID' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            TestDepartmentName: { type: DataTypes.STRING, field: 'TestDepartmentName' },
            ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
            ServiceCategoryName: { type: DataTypes.STRING, field: 'ServiceCategoryName' },
            BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
            BillDiscount: { type: DataTypes.DECIMAL, field: 'BillDiscount' },
            BillNetAmount: { type: DataTypes.DECIMAL, field: 'BillNetAmount' },
            GrossDoctorShare: { type: DataTypes.DECIMAL, field: 'GrossDoctorShare' },
            TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
            NetDoctorShare: { type: DataTypes.DECIMAL, field: 'NetDoctorShare' },
            ProviderShare: { type: DataTypes.DECIMAL, field: 'ProviderShare' },
            ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
            BillGeneratedName: { type: DataTypes.STRING, field: 'BillGeneratedName' },
            BillGeneratedBy: { type: DataTypes.BIGINT, field: 'BillGeneratedBy' },
            PatientBillStatusId: { type: DataTypes.BIGINT, field: 'PatientBillStatusId' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'collectionbaserevenue',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                // defaultScope: {
                //     where: {
                //         Status: 1
                //     }
                // }
            });
    (CollectionBaseRevenue as any).associate = function (models: Models) {
        CollectionBaseRevenue.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        CollectionBaseRevenue.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        CollectionBaseRevenue.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        CollectionBaseRevenue.belongsTo(models.ServiceCategory, { foreignKey: 'CategoryId' });

    };

    return CollectionBaseRevenue;
}
