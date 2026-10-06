import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PMRInstance, i.PMRAttributes> {
    let PMR = sequelize.define<i.PMRInstance,
        i.PMRAttributes>('PMR', {
            Id: { type: DataTypes.BIGINT, field: 'PMRId', primaryKey: true, autoIncrement: true },
            PMRCode: { type: DataTypes.STRING, field: 'PMRCode' },
            PMRName: { type: DataTypes.STRING, field: 'PMRName' },
            ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
            ProcedureCode: { type: DataTypes.STRING, field: 'ProcedureCode' },
            ProcedureName: { type: DataTypes.STRING, field: 'ProcedureName' },
            PMRCategoryId: { type: DataTypes.BIGINT, field: 'PMRCategoryId' },
            SpecialityId: { type: DataTypes.BIGINT, field: 'SpecialityId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
            ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
            ApprovedAt: { type: DataTypes.DATE, field: 'ApprovedAt' },
            IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
                tableName: 'pmr',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PMR as any).associate = function (models: Models) {
        PMR.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PMR.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        PMR.belongsTo(models.ReferenceValue, { as: 'PMRCategory', targetKey: 'ReferenceValueCodeId' });
        PMR.belongsTo(models.Procedure, { foreignKey: 'ProcedureId' });
        PMR.belongsTo(models.Speciality, { foreignKey: 'SpecialityId' });
        PMR.hasMany(models.PMRDetail);
    };
    return PMR;
}
