import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AntibioticOrganismMapInstance, i.AntibioticOrganismMapAttributes> {
    let AntibioticOrganismMap = sequelize.define<i.AntibioticOrganismMapInstance, i.
        AntibioticOrganismMapAttributes>('AntibioticOrganismMap', {
            Id: { type: DataTypes.BIGINT, field: 'AntibioticOrganismMapId', primaryKey: true, autoIncrement: true },
            AntibioticMasterId: { type: DataTypes.BIGINT, field: 'AntibioticMasterId' },
            OrganismMapId: { type: DataTypes.BIGINT, field: 'OrganismMapId' },
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
            tableName: 'antibioticorganismmap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AntibioticOrganismMap as any).associate = function (models: Models) {
        AntibioticOrganismMap.belongsTo(models.AntibioticMaster);
        AntibioticOrganismMap.belongsTo(models.OrgIsolation, { foreignKey: 'OrganismMapId' });
    };
    return AntibioticOrganismMap;
}
