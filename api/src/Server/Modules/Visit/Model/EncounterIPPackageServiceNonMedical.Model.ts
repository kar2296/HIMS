import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EncounterIPPackageServiceNonMedicalInstance, i.EncounterIPPackageServiceNonMedicalAttributes> {
    let EncounterIPPackageServiceNonMedical = sequelize.define<i.
        EncounterIPPackageServiceNonMedicalInstance,
        i.EncounterIPPackageServiceNonMedicalAttributes>('EncounterIPPackageServiceNonMedical', {
            Id: { type: DataTypes.BIGINT, field: 'EncounterIPPackageServiceNonMedicalId', primaryKey: true, autoIncrement: true },
            EncounterIPPackageDetailId: { type: DataTypes.BIGINT, field: 'EncounterIPPackageDetailId' },
            PatientBillDetailId: { type: DataTypes.BIGINT, field: 'PatientBillDetailId' },
            ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
            ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
            ServiceItemName: { type: DataTypes.STRING, field: 'ServiceItemName' },
            Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
            Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
            Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
            TotalAmount: { type: DataTypes.DECIMAL, field: 'TotalAmount' },
            ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
                tableName: 'encounterippackagenonmedical',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });
    (EncounterIPPackageServiceNonMedical as any).associate = function (models: Models) {
        EncounterIPPackageServiceNonMedical.belongsTo(models.PatientBillDetails);
    };

    return EncounterIPPackageServiceNonMedical;
}
