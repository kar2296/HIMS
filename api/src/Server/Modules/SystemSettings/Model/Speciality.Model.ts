import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.SpecialityInstance, i.SpecialityAttributes> {
    let Speciality = sequelize.define<i.SpecialityInstance, i.SpecialityAttributes>('Speciality', {
        Id: { type: DataTypes.BIGINT, field: 'SpecialityId', primaryKey: true, autoIncrement: true },
        ParentSpecialityId: { type: DataTypes.BIGINT, field: 'ParentSpecialityId' },
        SpecialityCode: { type: DataTypes.STRING, field: 'SpecialityCode' },
        SpecialityName: { type: DataTypes.STRING, field: 'SpecialityName' },
        SpecialityTypeId: { type: DataTypes.INTEGER, field: 'SpecialityTypeId' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
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
            tableName: 'specialities',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Speciality as any).associate = function(models: Models) {
                    Speciality.belongsTo(models.Facility);
                    Speciality.belongsTo(models.ReferenceValue, { as: 'SpecialityType', targetKey: 'ReferenceValueCodeId' });
                    Speciality.belongsTo(models.Speciality, { as: 'ParentSpeciality', foreignKey: 'ParentSpecialityId' });
                    Speciality.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return Speciality;
}
