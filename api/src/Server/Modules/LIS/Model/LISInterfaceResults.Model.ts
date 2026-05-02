import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LISInterfaceResultInstance, i.LISInterfaceResultAttributes> {
    let LISInterfaceResults = sequelize.define<i.LISInterfaceResultInstance, i.LISInterfaceResultAttributes>('LISInterfaceResults', {
        Id: { type: DataTypes.BIGINT, field: 'LISResultId', primaryKey: true, autoIncrement: true },
        LISId: { type: DataTypes.BIGINT, field: 'LISId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        WorkOrderId: { type: DataTypes.BIGINT, field: 'WorkOrderId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        MRNNo: { type: DataTypes.STRING, field: 'MRNNo' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        Sampleid: { type: DataTypes.STRING, field: 'Sampleid' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        AnalyteId: { type: DataTypes.BIGINT, field: 'AnalyteId' },
        AnalyteName: { type: DataTypes.STRING, field: 'AnalyteName' },
        ResultValue: { type: DataTypes.STRING, field: 'ResultValue' },
        FullResultValue: { type: DataTypes.STRING, field: 'FullResultValue' },
        // DisplayNo: { type: DataTypes.INTEGER, field: 'DisplayNo' },
        Approved: { type: DataTypes.BOOLEAN, field: 'Approved' },
        ApprovedById: { type: DataTypes.INTEGER, field: 'ApprovedById' },
        ApproveDt: { type: DataTypes.DATE, field: 'ApproveDt' },
        Rejected: { type: DataTypes.BOOLEAN, field: 'Rejected' },
        RejectedById: { type: DataTypes.INTEGER, field: 'RejectedById' },
        RejectedDt: { type: DataTypes.DATE, field: 'RejectedDt' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'lisinterfaceresults',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
    (LISInterfaceResults as any).associate = function (models: Models) {
        LISInterfaceResults.belongsTo(models.LISInterfacePatientDetails, { foreignKey: 'LISId' });
        LISInterfaceResults.belongsTo(models.PatientWorkorder, { foreignKey: 'WorkOrderId' });
        LISInterfaceResults.belongsTo(models.PatientWorkorderdetails, { foreignKey: 'WorkOrderId' });
        LISInterfaceResults.belongsTo(models.Analytemaster, { as: 'Analyte', foreignKey: 'AnalyteId' });
    };
    return LISInterfaceResults;
}
