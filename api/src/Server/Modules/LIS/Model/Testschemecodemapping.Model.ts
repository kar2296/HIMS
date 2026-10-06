import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TestschemecodemappingInstance, i.TestschemecodemappingAttributes> {
    let Testschemecodemapping = sequelize.define<i.TestschemecodemappingInstance,
        i.TestschemecodemappingAttributes>('Testschemecodemapping', {
            Id: { type: DataTypes.BIGINT, field: 'TestschemecodemapId', primaryKey: true, autoIncrement: true },
            IdentifyingId: { type: DataTypes.BIGINT, field: 'IdentifyingId' },
            Identifyingtype: { type: DataTypes.STRING, field: 'Identifyingtype' },
            Testschemecodename_e: { type: DataTypes.INTEGER, field: 'Testschemecodename_e' },
            Term: { type: DataTypes.STRING, field: 'Term' },
            SchemecodeId: { type: DataTypes.INTEGER, field: 'SchemecodeId' },
            Schemecodename: { type: DataTypes.STRING, field: 'Schemecodename' },
            Version: { type: DataTypes.STRING, field: 'Version' },
            Activefrom: { type: DataTypes.DATE, field: 'Activefrom' },
            Activeto: { type: DataTypes.DATE, field: 'Activeto' },
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
            tableName: 'testschemecodemapping',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return Testschemecodemapping;
}
