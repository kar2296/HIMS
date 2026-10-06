# Phase 0: MySQL to PostgreSQL Compatibility Analysis & Technical Matrix

**Document Version:** 1.0.0  
**Target PostgreSQL Version:** 14.18 (Production Standard)  
**Source MySQL Version:** 5.7.44  

---

## 1. Overview & Architectural Compatibility

This document provides a comprehensive, field-level compatibility analysis between **MySQL 5.7** and **PostgreSQL 14**, addressing data types, SQL query semantics, sequences, transactions, collations, and Node.js API response serialization for the Hospital Information Management System (HIMS).

---

## 2. Data Type Mapping & Conversion Matrix

The live MySQL `test` database contains 17,258 column definitions across 554 tables. The table below specifies the exact data type mapping to PostgreSQL 14:

| MySQL 5.7 Data Type | Count in Schema | PostgreSQL 14 Target Type | Conversion Rules & Migration Notes |
| :--- | :--- | :--- | :--- |
| `bigint` / `bigint unsigned` | 4,698 | `BIGINT` / `BIGSERIAL` | Primary keys map to `BIGSERIAL` (or `IDENTITY`). In Node.js `pg` driver, `bigint` is parsed as string by default; custom type parser is required. |
| `int` / `int unsigned` | 3,340 | `INTEGER` / `SERIAL` | Maps directly to `INTEGER` (4 bytes, signed). Auto-increment primary keys map to `SERIAL`. |
| `varchar(n)` | 3,154 | `VARCHAR(n)` or `TEXT` | PostgreSQL supports variable-length `VARCHAR(n)` without performance difference compared to `TEXT`. Multi-byte UTF-8 characters calculate by character count, not bytes. |
| `datetime` | 1,825 | `TIMESTAMPTZ` / `TIMESTAMP` | Stored datetimes with local hospital timezone (+05:30) must be converted to `TIMESTAMPTZ` with timezone awareness or standardized to UTC. |
| `decimal(p, s)` | 1,547 | `NUMERIC(p, s)` | Exact numeric representation for currency, taxes, and tariffs. `pg` driver serializes `numeric` as string to preserve precision; use custom parser or float parsing where appropriate. |
| `tinyint(1)` (Boolean) | 892 | `BOOLEAN` | In MySQL, `tinyint(1)` holds `0` and `1`. In PostgreSQL, native `BOOLEAN` holds `TRUE` and `FALSE`. API serialization adapters must handle `0`/`1` $\leftrightarrow$ `false`/`true`. |
| `tinyint` (non-boolean) | 5 | `SMALLINT` | Maps to `SMALLINT` (2 bytes, range -32,768 to 32,767). |
| `date` | 101 | `DATE` | Maps directly to `DATE` (YYYY-MM-DD). |
| `time` | 54 | `TIME WITHOUT TIME ZONE` | Maps directly to `TIME`. |
| `longtext` | 47 | `TEXT` | PostgreSQL `TEXT` is unbounded (up to 1 GB) and replaces `LONGTEXT` with optimal TOAST compression. |
| `float` | 47 | `REAL` | 4-byte single precision floating point. |
| `double` | 23 | `DOUBLE PRECISION` | 8-byte double precision floating point. |
| `char(n)` | 21 | `CHAR(n)` / `VARCHAR(n)` | Fixed-length string. Recommended to convert to `VARCHAR(n)` to avoid blank-padding semantics. |
| `text` | 14 | `TEXT` | Maps directly to `TEXT`. |
| `bit(n)` | 11 | `BIT(n)` / `BOOLEAN` | Single-bit flags map to `BOOLEAN`; multi-bit fields map to `BIT(n)` or `VARBIT`. |
| `json` | 2 | `JSONB` | PostgreSQL `JSONB` provides decomposed binary format, full GIN indexing, and efficient containment operators (`@>`, `?`, `?|`). |
| `varbinary(n)` | 1 | `BYTEA` | Binary data storage maps to PostgreSQL `BYTEA`. |

---

## 3. SQL Syntax & Function Equivalence

While the majority of queries are generated via Sequelize ORM, any direct SQL queries, job scripts, and reporting views require function conversions:

```mermaid
graph LR
    subgraph MySQL Syntax
        M1[IFNULL a, b]
        M2[GROUP_CONCAT col]
        M3[DATE_FORMAT d, fmt]
        M4[DATE_ADD d, INTERVAL 1 DAY]
        M5[INSERT ... ON DUPLICATE KEY UPDATE]
        M6[LIMIT offset, count]
        M7[\`identifier\`]
    end
    subgraph PostgreSQL Syntax
        P1[COALESCE a, b]
        P2[STRING_AGG col, sep]
        P3[TO_CHAR d, fmt]
        P4[d + INTERVAL '1 day']
        P5[INSERT ... ON CONFLICT DO UPDATE]
        P6[LIMIT count OFFSET offset]
        P7[\"identifier\" or lowercase]
    end
    M1 --> P1
    M2 --> P2
    M3 --> P3
    M4 --> P4
    M5 --> P5
    M6 --> P6
    M7 --> P7
```

### 3.1 Syntax Conversion Rules

1. **Identifier Quoting:**
   - **MySQL:** Backticks (`` `table_name` ``, `` `column_name` ``).
   - **PostgreSQL:** Double quotes (`"table_name"`, `"column_name"`) or unquoted lowercase identifiers.
   - *Recommendation:* Standardize all DDL and queries to lowercase unquoted identifiers (`patients`, `patient_id`, `created_at`).

2. **Null Coalescing:**
   - **MySQL:** `IFNULL(column, default_value)`
   - **PostgreSQL:** `COALESCE(column, default_value)`

3. **String Aggregation:**
   - **MySQL:** `GROUP_CONCAT(name ORDER BY id SEPARATOR ', ')`
   - **PostgreSQL:** `STRING_AGG(name, ', ' ORDER BY id)`

4. **Date & Time Formatting:**
   - **MySQL:** `DATE_FORMAT(CreatedAt, '%Y-%m-%d %H:%i:%s')`
   - **PostgreSQL:** `TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS')`

5. **Date Arithmetic:**
   - **MySQL:** `DATE_ADD(NOW(), INTERVAL 7 DAY)` / `DATE_SUB(NOW(), INTERVAL 1 MONTH)`
   - **PostgreSQL:** `NOW() + INTERVAL '7 days'` / `NOW() - INTERVAL '1 month'`

6. **Pagination:**
   - **MySQL:** `LIMIT 50, 25` (offset 50, count 25) or `LIMIT 25 OFFSET 50`
   - **PostgreSQL:** `LIMIT 25 OFFSET 50` (strict standard syntax)

7. **Upsert Operations:**
   - **MySQL:** `INSERT INTO table (id, val) VALUES (1, 'A') ON DUPLICATE KEY UPDATE val = 'A'`
   - **PostgreSQL:** `INSERT INTO table (id, val) VALUES (1, 'A') ON CONFLICT (id) DO UPDATE SET val = EXCLUDED.val`

---

## 4. Primary Keys, Sequences, and Redis Integration

### 4.1 Sequence Synchronization (`setval`)
In MySQL, inserting an explicit ID automatically advances the `AUTO_INCREMENT` pointer to `MAX(id) + 1`. In PostgreSQL, sequences (`BIGSERIAL`) operate independently of explicit `INSERT` values.
- **Migration Hazard:** If existing rows are loaded with explicit primary keys (`PatientId = 2063`), the PostgreSQL sequence may still point to `1`. The next `INSERT` will attempt to use ID `1` or collision IDs, failing with a unique constraint violation (`23505`).
- **Required Automated Fix:** After migrating data or running bulk loads, execute sequence resets across all tables:
```sql
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT table_name, column_name, pg_get_serial_sequence(table_name, column_name) AS seq_name
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND pg_get_serial_sequence(table_name, column_name) IS NOT NULL
    LOOP
        EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I), 1) + 1, false);', rec.seq_name, rec.column_name, rec.table_name);
    END LOOP;
END $$;
```

### 4.2 Redis Sequence Generator & Deferred Keys
The HIMS application uses Redis for atomic business code generation (e.g. `MRN-YYYY-XXXXX`, `INV-2026-00123`).
- In `BaseBo.deferSequenceKey()`, the system reserves key placeholders and commits them upon successful database transaction.
- **PostgreSQL Parity:** The Redis sequence generation logic operates above the database layer and remains 100% compatible with PostgreSQL without modification.

---

## 5. Transaction Semantics & Error Handling

### 5.1 The Aborted Transaction State
In PostgreSQL, if any query inside a `BEGIN ... COMMIT` block produces an error (such as a foreign key violation or invalid type cast), PostgreSQL marks the entire transaction as `ABORTED`:
```
ERROR: current transaction is aborted, commands ignored until end of transaction block
```
- **MySQL Behavior:** MySQL allowed error handling in application code and permitted executing further queries in the same transaction unless a fatal server disconnect occurred.
- **PostgreSQL Mitigation in Backend:**
  1. Ensure that `TransMiddleware` in [Router.ts](file:///Users/sharmila/Rajesh/my-app/api/src/Server/Router.ts) immediately issues a `ROLLBACK` whenever any controller/service throws an error.
  2. For nested business operations that may expect soft errors, use **Savepoints** (`SAVEPOINT sp1; ... ROLLBACK TO SAVEPOINT sp1;`).

---

## 6. API Response Serialization & Client Compatibility

### 6.1 Node.js `pg` Driver Type Parsers
By default, the `pg` driver serializes certain PostgreSQL types differently than `mysql2`:

```typescript
// Required configuration in PostgreSQL Database Bootstrap
import { types } from 'pg';

// 1. BigInt (OID 20): parse as integer if within safe JS integer limit (Number.MAX_SAFE_INTEGER = 9007199254740991)
types.setTypeParser(20, (val: string) => {
    const num = parseInt(val, 10);
    return Number.isSafeInteger(num) ? num : val;
});

// 2. Numeric / Decimal (OID 1700): parse as float for monetary amounts matching MySQL decimalNumbers: true
types.setTypeParser(1700, (val: string) => parseFloat(val));

// 3. Date / Timestamps (OID 1114, 1184): return ISO string format
types.setTypeParser(1114, (val: string) => val); // TIMESTAMP WITHOUT TIME ZONE
types.setTypeParser(1184, (val: string) => new Date(val).toISOString()); // TIMESTAMPTZ
```

### 6.2 Boolean Representation
- MySQL returns `0` or `1` for `tinyint(1)` columns unless transformed.
- PostgreSQL returns `true` or `false` for `BOOLEAN` columns.
- **Frontend Audit:** The React frontend contains ~116 components checking `if (item.IsActive)` or `item.IsActive ? ...`. Using true booleans improves type-safety and eliminates legacy truthy/falsy bugs.

---

## 7. Collation, Character Encoding & Case Sensitivity

1. **Encoding:** Standardize database encoding to `UTF8` with `LC_COLLATE = 'en_US.UTF-8'` and `LC_CTYPE = 'en_US.UTF-8'`.
2. **Case Insensitive Searching:**
   - MySQL `LIKE` queries with `utf8mb4_unicode_ci` were case-insensitive by default.
   - In PostgreSQL, standard `LIKE` is case-sensitive. Sequelize translates `$iLike` / `Op.iLike` to PostgreSQL `ILIKE`, ensuring seamless case-insensitive searching across patient names, doctor names, and master items.
   - For high-volume search fields (`patients.first_name`, `patients.mrn`, `patients.mobile`), create PostgreSQL trigram indexes using the `pg_trgm` extension:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_patients_first_name_trgm ON patients USING gin (first_name gin_trgm_ops);
CREATE INDEX idx_patients_mobile_trgm ON patients USING gin (mobile gin_trgm_ops);
```

---

## 8. Summary of Action Items for Phase 1

1. Configure Sequelize Postgres dialect with pool and logging in `DbConfig.ts`.
2. Register custom `pg` type parsers for BigInt and Numeric types.
3. Remove the MySQL-specific `SET SESSION sql_mode` hook from `Repository.ts`.
4. Apply lowercase naming convention across all PostgreSQL tables and columns.
5. Create PostgreSQL sequence reset script (`setval`) for data synchronization.
6. Enable `pg_trgm` extension for high-performance case-insensitive patient search.
