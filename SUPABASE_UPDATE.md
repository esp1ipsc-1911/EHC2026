# Supabase database update — run this SQL

Go to Supabase → SQL Editor → paste and run:

```sql
-- Step 1: Add division column
ALTER TABLE stage_positions
ADD COLUMN IF NOT EXISTS division TEXT NOT NULL DEFAULT 'Classic';

-- Step 2: Drop old primary key and create new composite key
ALTER TABLE stage_positions DROP CONSTRAINT IF EXISTS stage_positions_pkey;
ALTER TABLE stage_positions ADD PRIMARY KEY (stage_id, division);

-- Step 3: Add policy for division-filtered access (already exists, but refresh)
DROP POLICY IF EXISTS "allow_all_read"   ON stage_positions;
DROP POLICY IF EXISTS "allow_all_write"  ON stage_positions;
DROP POLICY IF EXISTS "allow_all_update" ON stage_positions;

CREATE POLICY "allow_all_read"   ON stage_positions FOR SELECT USING (true);
CREATE POLICY "allow_all_write"  ON stage_positions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update" ON stage_positions FOR UPDATE USING (true);
```

After running: each division gets its own separate data in the database.
