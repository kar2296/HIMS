import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CollectionReportInstance, i.CollectionReportAttributes> {
    let CollectionReport = sequelize.define<i.CollectionReportInstance,
        i.CollectionReportAttributes>('CollectionReport', {
           Id: { type: DataTypes.BIGINT, field: 'DailyCollectionId', primaryKey: true, autoIncrement: true },
            CollectionDate: { type: DataTypes.DATE, field: 'CollectionDate' },
            OpeningBalance: { type: DataTypes.DECIMAL, field: 'OpeningBalance' },
            Cash: { type: DataTypes.DECIMAL, field: 'Cash' },
            PettyCash: { type: DataTypes.DECIMAL, field: 'PettyCash' },
            Deposit: { type: DataTypes.DECIMAL, field: 'Deposit' },
            BalanceCash: { type: DataTypes.DECIMAL, field: 'BalanceCash' },
            Card: { type: DataTypes.DECIMAL, field: 'Card' },
            EOD: { type: DataTypes.DECIMAL, field: 'EOD' },
            VarianceCard: { type: DataTypes.DECIMAL, field: 'VarianceCard' },
            UPI: { type: DataTypes.DECIMAL, field: 'UPI' },
            BankCredit: { type: DataTypes.DECIMAL, field: 'BankCredit' },
            VarianceUPI: { type: DataTypes.DECIMAL, field: 'VarianceUPI' },
            Chequeddwire: { type: DataTypes.DECIMAL, field: 'Chequeddwire' },
            ChequeDeposit: { type: DataTypes.DECIMAL, field: 'ChequeDeposit' },
            VarianceCheque: { type: DataTypes.DECIMAL, field: 'VarianceCheque' },
            FullTotal: { type: DataTypes.DECIMAL, field: 'FullTotal' },
            IsUpdated: { type: DataTypes.BOOLEAN, field: 'IsUpdated' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            CollectionStatusId: { type: DataTypes.INTEGER, field: 'CollectionStatusId' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'rep_dailycollection',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });
    (CollectionReport as any).associate = function (models: Models) {
        CollectionReport.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        CollectionReport.belongsTo(models.ReferenceValue, { as: 'CollectionStatus', targetKey: 'ReferenceValueCodeId' });
        CollectionReport.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        // CollectionReport.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        // CollectionReport.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        // CollectionReport.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
        // CollectionReport.belongsTo(models.ServiceCategory, { foreignKey: 'CategoryId' });

    };

    return CollectionReport;
}
