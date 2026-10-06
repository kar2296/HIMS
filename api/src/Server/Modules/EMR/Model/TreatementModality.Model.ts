import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TreatementModalityInstance, i.TreatementModalityAttributes> {
    let TreatementModality = sequelize.define<i.TreatementModalityInstance, i.TreatementModalityAttributes>('TreatementModality', {
        Id: { type: DataTypes.BIGINT, field: 'TreatementModalityId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ModalityName: { type: DataTypes.STRING, field: 'ModalityName' },
        ModalityCode: { type: DataTypes.STRING, field: 'ModalityCode' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        Createdby: { type: DataTypes.INTEGER, field: 'Createdby' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        Updatedby: { type: DataTypes.INTEGER, field: 'Updatedby' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'treatementmodality',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (TreatementModality as any).associate = function(models: Models) {
                    TreatementModality.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return TreatementModality;
}
