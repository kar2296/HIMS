import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ClinicalFindingInstance, i.ClinicalFindingAttributes> {
    let ClinicalFinding = sequelize.define<i.ClinicalFindingInstance,
        i.ClinicalFindingAttributes>('ClinicalFinding', {
            Id: { type: DataTypes.BIGINT, field: 'FindingId', primaryKey: true, autoIncrement: true },
            Code: { type: DataTypes.STRING, field: 'Code' },
            Name: { type: DataTypes.STRING, field: 'Name' },
            FindingTypeId: { type: DataTypes.BIGINT, field: 'FindingTypeId' },
            FindingId: { type: DataTypes.BIGINT, field: 'FindingId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            Description: { type: DataTypes.STRING, field: 'Description' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
            IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'clinicalfinding',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (ClinicalFinding as any).associate = function (models: Models) {
        ClinicalFinding.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        ClinicalFinding.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        ClinicalFinding.belongsTo(models.ReferenceValue, { as: 'FindingType', targetKey: 'ReferenceValueCodeId' });
    };
    return ClinicalFinding;
}
