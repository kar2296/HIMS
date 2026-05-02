import { BaseBo } from '../../../src/Server/Modules/Base/Index';
import { QueryTypes, Instance } from 'sequelize';
import { DbConfig } from '../../../src/Config';
import { IAttributes } from '../../../src/Server/Modules/Base/Index';

export class TableBO extends BaseBo<Instance<IAttributes>, IAttributes> {
    public AllColumns: Array<Column>;
    public constructor() {
        super();
    }

    public async GetColumnDetails(tableName: string): Promise<Array<Column>> {
        let qryRepo = new QueryRepo();
        let qry = qryRepo.ColumnDetailsQuery[DbConfig.Options.dialect];
        let replacements = DbConfig.Options.dialect === 'mssql'
            ? { TableName: tableName }
            : { DbName: DbConfig.Database, TableName: tableName };
        let data = await this.Dal.query(qry, { replacements: replacements, type: QueryTypes.SELECT });
        return data;
    }
    public GetModel(): any {
        return null;
    }
    // public async GetTableDetails(tableName: string): Promise<Array<Column>> {

    //     await this.GetAllColumnDetails();
    //     return <Column[]>this.AllColumns.Where(x => x.Name.toLowerCase() === tableName.toLowerCase());
    // }

    // public async GetAllColumnDetails(): Promise<Array<Column>> {
    //     if (!this.AllColumns) {
    //         await this.Dal.Connect();
    //         let data = await this.Dal.ExecuteQuery<Column>(`select
    //         t.Name,
    //         c.column_id as ColumnId,
    //         c.name as ColumnName,
    //         c.max_length as [MaxLength],
    //         c.precision as [Precision],
    //         c.scale as Scale,
    //         c.is_nullable as IsNullable,
    //         c.is_identity as IsIdentity,
    //         tp.name as Type
    //         from sys.tables t
    //         left join sys.columns c on t.object_id = c.object_id
    //         left join sys.types tp on c.system_type_id = tp.system_type_id
    //         where t.type = 'U'`);
    //         this.AllColumns = data;
    //     }
    //     return this.AllColumns;
    // }
}

export class Column {
    public Name: string;
    public ColumnId: number;
    public ColumnName: string;
    public MaxLength: number;
    public Precision: number;
    public Scale: number;
    public IsNullable: boolean;
    public IsIdentity: boolean;
    public Type: string;
    public TypescriptType: string;
    public SequelizeType: string;
    public IsPrimaryKey: number;
    public IsUniqueKey: number;
    public IsForeignKey: number;
    public ForeignKeyTableName: string;
    public ForeignKeyColumnName: string;
}

// export interface Table {
//     Name: string;
//     Details: Array<Column>;
// }

// export interface Module {
//     ModuleName: string;
//     Tables: Array<Table>;
// }

// export interface Context {
//     Modules: Array<Module>;
// }

export interface Entity {
    Name: string;
    Table: string;
    Details: Array<Column>;
}
export interface Business {
    Name: string;
    EntityName: string;
    SubEntities: Array<string>;
}
export interface Service {
    Name: string;
    Bo: string;
    DependsBO: Array<string>;
}
export interface Module {
    ModuleName: string;
    Entities: Array<Entity>;
    Business: Array<Business>;
    Service: Array<Service>;
}
export interface Context {
    Modules: Array<Module>;
}


class QueryRepo {
    ColumnDetailsQuery: IQueryRepo;
    constructor() {
        this.ColumnDetailsQuery = {
            mssql: `select
                    t.Name,
                    c.column_id as ColumnId,
                    c.name as ColumnName,
                    c.max_length as [MaxLength],
                    c.precision as [Precision],
                    c.scale as Scale,
                    c.is_nullable as IsNullable,
                    c.is_identity as IsIdentity,
                    tp.name as Type
                    from sys.tables t
                    left join sys.columns c on t.object_id = c.object_id
                    left join sys.types tp on c.system_type_id = tp.system_type_id
                    where t.type = 'U'
                    and t.Name = :TableName
            `,
            mysql: `select
                    t.Table_Name 'Name',
                    c.ORDINAL_POSITION 'ColumnId',
                    c.column_name 'ColumnName',
                        c.CHARACTER_MAXIMUM_LENGTH 'MaxLength',
                        c.NUMERIC_PRECISION 'Precision',
                        c.NUMERIC_SCALE 'Scale',
                    case c.Is_Nullable
                        when 'YES' then 1
                                else 0
                    end 'IsNullable',
                        case c.EXTRA
                        when 'auto_increment' then 1
                                else 0
                    end 'IsIdentity',
                    c.Data_Type 'Type',
                    c.COLUMN_KEY = 'PRI' IsPrimaryKey,
                    c.COLUMN_KEY = 'UNI' IsUnique,
                    c.Extra  = 'auto_increment' IsAutoIncrement,
                    cu.REFERENCED_TABLE_NAME is not null IsForeignKey,
                    cu.REFERENCED_TABLE_NAME ForeignKeyTableName,
                    cu.REFERENCED_COLUMN_NAME ForeignKeyColumnName
                    from
                            information_schema.tables t
                            inner join information_schema.columns c on t.table_name = c.table_name
                            left join information_schema.key_column_usage cu on cu.Table_name = t.table_name
                                    and c.COLUMN_NAME = cu.COLUMN_NAME
                                    and cu.REFERENCED_TABLE_NAME is not null
                    where t.table_schema  = :DbName
                    and c.table_schema = :DbName
                    and t.table_name = :TableName
                    Order by t.Table_name, c.ORDINAL_POSITION
                `
        };
    }
}


interface IQueryRepo {
    mysql: string;
    mssql: string;
    [Dilect: string]: string;
}
