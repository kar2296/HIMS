import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AntibioticMasterInstance, i.AntibioticMasterAttributes> {
    let AntibioticMaster = sequelize.define<i.AntibioticMasterInstance, i.AntibioticMasterAttributes>('AntibioticMaster', {
        Id: { type: DataTypes.BIGINT, field: 'AntibioticMasterId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        AntibioticName: { type: DataTypes.STRING, field: 'AntibioticName' },
        Mnemonic: { type: DataTypes.STRING, field: 'Mnemonic' },
        DisplayOrder: { type: DataTypes.STRING, field: 'DisplayOrder' },
        AntibioticTypeId: { type: DataTypes.BIGINT, field: 'AntibioticTypeId' },
        OrganismId: { type: DataTypes.BIGINT, field: 'OrganismId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'antibioticmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AntibioticMaster as any).associate = function (models: Models) {
        AntibioticMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        AntibioticMaster.belongsTo(models.ReferenceValue, { as: 'AntibioticType', targetKey: 'ReferenceValueCodeId' });
        AntibioticMaster.belongsTo(models.OrgIsolation, { foreignKey: 'OrganismId' });
    };
    return AntibioticMaster;
}
