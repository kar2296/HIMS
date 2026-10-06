import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ResearchProjectMemberInstance, i.ResearchProjectMemberAttributes> {
    let ResearchProjectMember = sequelize.
        define<i.ResearchProjectMemberInstance, i.ResearchProjectMemberAttributes>('ResearchProjectMember', {
       Id: { type: DataTypes.BIGINT, field: 'ResearchProjectMemberId', primaryKey: true, autoIncrement: true  },
       ResearchProjectId: { type: DataTypes.BIGINT, field: 'ResearchProjectId' },
       UserId: { type: DataTypes.BIGINT, field: 'UserId' },
       IsIncharge: { type: DataTypes.BOOLEAN, field: 'IsIncharge' },
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
            tableName: 'researchprojectmembers',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ResearchProjectMember as any).associate = function(models: Models) {
                    ResearchProjectMember.belongsTo(models.User);
                };
 return ResearchProjectMember;
}
