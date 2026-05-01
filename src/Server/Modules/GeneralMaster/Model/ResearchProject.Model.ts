import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ResearchProjectInstance, i.ResearchProjectAttributes> {
    let ResearchProject = sequelize.define<i.ResearchProjectInstance, i.ResearchProjectAttributes>('ResearchProject', {
        Id: { type: DataTypes.BIGINT, field: 'ResearchProjectId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ProjectTypeId: { type: DataTypes.BIGINT, field: 'ProjectTypeId' },
        ProjectCode: { type: DataTypes.STRING, field: 'ProjectCode' },
        ProjectName: { type: DataTypes.STRING, field: 'ProjectName' },
        StartDate: { type: DataTypes.DATE, field: 'StartDate' },
        EndDate: { type: DataTypes.DATE, field: 'EndDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'researchprojects',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ResearchProject as any).associate = function(models: Models) {
                    ResearchProject.belongsTo(models.Facility);
                    ResearchProject.belongsTo(models.ReferenceValue, { as: 'ProjectType', targetKey: 'ReferenceValueCodeId' });
                    ResearchProject.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return ResearchProject;
}
