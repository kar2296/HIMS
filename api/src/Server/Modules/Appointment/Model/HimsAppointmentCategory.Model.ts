import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AppointmentCategoryInstance, i.AppointmentCategoryAttributes> {
    let AppointmentCategory = sequelize.define<i.AppointmentCategoryInstance, i.AppointmentCategoryAttributes>('AppointmentCategory', {
        Id: { type: DataTypes.BIGINT, field: 'AppointmentCategoryId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        AppointmentCategoryTypeId: { type: DataTypes.BIGINT, field: 'AppointmentCategoryTypeId' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Color: { type: DataTypes.STRING, field: 'Color' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        CancelorRescheduleComments: { type: DataTypes.STRING, field: 'CancelorRescheduleComments' },
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
            tableName: 'appointmentcategories',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (AppointmentCategory as any).associate = function(models: Models) {
                    AppointmentCategory.belongsTo(models.Facility);
                    AppointmentCategory.belongsTo(models.ReferenceValue,
                                { as: 'AppointmentCategoryType', targetKey: 'ReferenceValueCodeId' });
                    AppointmentCategory.belongsTo(models.ReferenceValue,
                                { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return AppointmentCategory;
}
