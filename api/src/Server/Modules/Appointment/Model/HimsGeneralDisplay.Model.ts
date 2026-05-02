import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GeneralDisplayInstance, i.GeneralDisplayAttributes> {
    let GeneralDisplay = sequelize.define<i.GeneralDisplayInstance, i.GeneralDisplayAttributes>('GeneralDisplay', {
        Id: { type: DataTypes.BIGINT, field: 'GeneraldisplayId', primaryKey: true, autoIncrement: true },
        Displaydate: { type: DataTypes.DATE, field: 'Displaydate' },
        LOCATIONId: { type: DataTypes.BIGINT, field: 'LOCATIONId' },
        DisplayNoId: { type: DataTypes.BIGINT, field: 'DisplayNoId' },
        DisplayText: { type: DataTypes.STRING, field: 'DisplayText' },
        //DisplayStatusId: { type: DataTypes.INTEGER, field: 'DisplayStatusId' },
        GeneralDisplayStatusId: { type: DataTypes.BIGINT, field: 'GeneralDisplayStatusId' },
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
            tableName: 'generaldisplay',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (GeneralDisplay as any).associate = function(models: Models) {
                    GeneralDisplay.belongsTo(models.ReferenceValue, { as: 'LOCATION', targetKey: 'ReferenceValueCodeId' });
                    GeneralDisplay.belongsTo(models.ReferenceValue, { as: 'DisplayNo', targetKey: 'ReferenceValueCodeId' });
                    GeneralDisplay.belongsTo(models.ReferenceValue, { as: 'GeneralDisplayStatus', targetKey: 'ReferenceValueCodeId' });

                };
 return GeneralDisplay;
}
