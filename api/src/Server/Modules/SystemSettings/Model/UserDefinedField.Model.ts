import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UserDefinedFieldInstance, i.UserDefinedFieldAttributes> {
    let UserDefinedField = sequelize.define<i.UserDefinedFieldInstance, i.UserDefinedFieldAttributes>('UserDefinedField', {
        Id: { type: DataTypes.BIGINT, field: 'UserDefinedFieldId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ScreenId: { type: DataTypes.BIGINT, field: 'ScreenId' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        FieldNameId: { type: DataTypes.INTEGER, field: 'FieldNameId' },
        LabelNameChange: { type: DataTypes.STRING, field: 'LabelNameChange' },
        InputTypeId: { type: DataTypes.INTEGER, field: 'InputTypeId' },
        MinCharLength: { type: DataTypes.INTEGER, field: 'MinCharLength' },
        MaxCharLength: { type: DataTypes.INTEGER, field: 'MaxCharLength' },
        IsMandatory: { type: DataTypes.BOOLEAN, field: 'IsMandatory' },
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
            tableName: 'userdefinedfields',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return UserDefinedField;
}
