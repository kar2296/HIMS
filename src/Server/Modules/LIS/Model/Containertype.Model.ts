import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ContainertypeInstance, i.ContainertypeAttributes> {
    let Containertype = sequelize.define<i.ContainertypeInstance, i.ContainertypeAttributes>('Containertype', {
        Id: { type: DataTypes.BIGINT, field: 'ContainertypeId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Mnemonics: { type: DataTypes.STRING, field: 'Code' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        CONTAINTYPId: { type: DataTypes.BIGINT, field: 'CONTAINTYPId' },
        COLORId: { type: DataTypes.BIGINT, field: 'COLORId' },
        Height: { type: DataTypes.FLOAT, field: 'Height' },
        HEIGHTUNITSId: { type: DataTypes.BIGINT, field: 'HEIGHTUNITSId' },
        Diameter: { type: DataTypes.FLOAT, field: 'Diameter' },
        DIAMETERUNITSId: { type: DataTypes.BIGINT, field: 'DIAMETERUNITSId' },
        Minvolume: { type: DataTypes.FLOAT, field: 'Minvolume' },
        Maxvolume: { type: DataTypes.FLOAT, field: 'Maxvolume' },
        Labeltype: { type: DataTypes.BIGINT, field: 'Labeltype' },
        Inst: { type: DataTypes.STRING, field: 'Inst' },
        Activefrom: { type: DataTypes.DATE, field: 'Activefrom' },
        Activeto: { type: DataTypes.DATE, field: 'Activeto' },
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
            tableName: 'containertype',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Containertype as any).associate = function(models: Models) {
                    Containertype.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    Containertype.belongsTo(models.ReferenceValue, { as: 'CONTAINTYP', targetKey: 'ReferenceValueCodeId' });
                    Containertype.belongsTo(models.ReferenceValue, { as: 'HEIGHTUNITS', targetKey: 'ReferenceValueCodeId' });
                    Containertype.belongsTo(models.ReferenceValue, { as: 'DIAMETERUNITS', targetKey: 'ReferenceValueCodeId' });
                };
 return Containertype;
}
