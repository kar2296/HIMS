import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DoctorDisplayInstance, i.DoctorDisplayAttributes> {
    let DoctorDisplay = sequelize.define<i.DoctorDisplayInstance, i.DoctorDisplayAttributes>('DoctorDisplay', {
        Id: { type: DataTypes.BIGINT, field: 'DoctorDisplayId', primaryKey: true, autoIncrement: true },
        Displaydate: { type: DataTypes.DATE, field: 'Displaydate' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DoctorName: { type: DataTypes.BIGINT, field: 'DoctorName' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        RoomNo: { type: DataTypes.STRING, field: 'RoomNo' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        Availablefrom: { type: DataTypes.TIME, field: 'Availablefrom' },
        Availableto: { type: DataTypes.TIME, field: 'Availableto' },
        DisplayNoId: { type: DataTypes.BIGINT, field: 'DisplayNoId' },
        DisplayStatusId: { type: DataTypes.BIGINT, field: 'DisplayStatusId' },
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
            tableName: 'doctordisplay',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (DoctorDisplay as any).associate = function (models: Models) {
        DoctorDisplay.belongsTo(models.ReferenceValue, { as: 'DisplayStatus', targetKey: 'ReferenceValueCodeId' });
        DoctorDisplay.belongsTo(models.ReferenceValue, { as: 'DisplayNo', targetKey: 'ReferenceValueCodeId' });
        DoctorDisplay.belongsTo(models.ReferenceValue, { as: 'LOCATION', foreignKey: 'LocationId', targetKey: 'ReferenceValueCodeId' });
                   DoctorDisplay.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
                   DoctorDisplay.belongsTo(models.User, { foreignKey: 'DoctorId' });
                };
 return DoctorDisplay;
}
