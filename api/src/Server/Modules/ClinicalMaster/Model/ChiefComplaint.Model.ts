import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ChiefComplaintInstance, i.ChiefComplaintAttributes> {
    let ChiefComplaint = sequelize.define<i.ChiefComplaintInstance, i.ChiefComplaintAttributes>('ChiefComplaint', {
        Id: { type: DataTypes.BIGINT, field: 'ChiefComplaintId', primaryKey: true, autoIncrement: true },
        Code: { type: DataTypes.STRING, field: 'Code' },
        ChiefComplaint: { type: DataTypes.STRING, field: 'ChiefComplaint' },
        ChiefComplaintCategoryId: { type: DataTypes.BIGINT, field: 'ChiefComplaintCategoryId' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ReferrenceLink: { type: DataTypes.STRING, field: 'ReferrenceLink' },
        BodySite: { type: DataTypes.STRING, field: 'BodySite' },
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
            tableName: 'chiefcomplaints',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ChiefComplaint as any).associate = function(models: Models) {
                    ChiefComplaint.belongsTo(models.ReferenceValue, { as: 'ChiefComplaintCategory', targetKey: 'ReferenceValueCodeId' });
                    ChiefComplaint.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return ChiefComplaint;
}
