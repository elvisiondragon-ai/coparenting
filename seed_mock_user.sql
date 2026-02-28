-- ========================================================
-- ROBUST MOCK DATA & MIGRATION FOR roso@yahoo.com
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- ========================================================

-- 1. Ensure the 'data' column exists
ALTER TABLE public.coparenting_profiles 
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';

-- 2. Ensure 'user_id' has a UNIQUE constraint (Fixes Error 42P10)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'coparenting_profiles_user_id_key'
    ) THEN
        ALTER TABLE public.coparenting_profiles 
        ADD CONSTRAINT coparenting_profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 3. Create/Update the Mock Data
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the ID of the user roso@yahoo.com
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'roso@yahoo.com';

    IF target_user_id IS NOT NULL THEN
        -- Insert or Update the profile with full mock application state
        INSERT INTO public.coparenting_profiles (user_id, display_name, email, data)
        VALUES (
            target_user_id,
            'Ayah Roso',
            'roso@yahoo.com',
            '{
              "setup": {
                "parentAName": "Ayah Roso",
                "parentBName": "Ibu Rina",
                "children": ["Budi", "Sari"],
                "currency": "Rp",
                "startYear": 2026,
                "weekStart": "monday",
                "isConfigured": true
              },
              "recurringSchedule": {
                "monday": { "earlyMorning": "A", "morning": "A", "afternoon": "A", "night": "A" },
                "tuesday": { "earlyMorning": "A", "morning": "A", "afternoon": "A", "night": "A" },
                "wednesday": { "earlyMorning": "A", "morning": "A", "afternoon": "A", "night": "A" },
                "thursday": { "earlyMorning": "B", "morning": "B", "afternoon": "B", "night": "B" },
                "friday": { "earlyMorning": "B", "morning": "B", "afternoon": "B", "night": "B" },
                "saturday": { "earlyMorning": "B", "morning": "B", "afternoon": "B", "night": "B" },
                "sunday": { "earlyMorning": "B", "morning": "B", "afternoon": "B", "night": "B" }
              },
              "exceptions": [],
              "expenses": [
                {
                  "id": "e1",
                  "date": "2026-03-01",
                  "description": "SPP Sekolah Budi (Maret)",
                  "category": "School",
                  "amount": 1500000,
                  "paidBy": "A",
                  "splitA": 50,
                  "splitB": 50
                },
                {
                  "id": "e2",
                  "date": "2026-02-25",
                  "description": "Beli Seragam Olahraga Sari",
                  "category": "Clothes",
                  "amount": 450000,
                  "paidBy": "B",
                  "splitA": 50,
                  "splitB": 50
                },
                {
                  "id": "e3",
                  "date": "2026-02-28",
                  "description": "Vitamin dan Obat Flu",
                  "category": "Medical",
                  "amount": 125000,
                  "paidBy": "A",
                  "splitA": 50,
                  "splitB": 50
                }
              ],
              "childSupport": [
                {
                  "id": "cs1",
                  "month": "2026-02",
                  "dueDate": "2026-02-05",
                  "amountDue": 2000000,
                  "amountPaid": 2000000,
                  "paymentMethod": "Transfer BCA",
                  "status": "paid"
                },
                {
                  "id": "cs2",
                  "month": "2026-03",
                  "dueDate": "2026-03-05",
                  "amountDue": 2000000,
                  "amountPaid": 0,
                  "paymentMethod": "Belum Bayar",
                  "status": "unpaid"
                }
              ],
              "tasks": [
                {
                  "id": "t1",
                  "title": "Imunisasi Sari di Puskesmas",
                  "assignedTo": "B",
                  "dueDate": "2026-03-10",
                  "status": "todo",
                  "priority": "high"
                },
                {
                  "id": "t2",
                  "title": "Ambil Raport Budi",
                  "assignedTo": "A",
                  "dueDate": "2026-03-15",
                  "status": "todo",
                  "priority": "medium"
                },
                {
                  "id": "t3",
                  "title": "Beli Sepatu Baru Budi",
                  "assignedTo": "both",
                  "dueDate": "2026-03-05",
                  "status": "in-progress",
                  "priority": "low"
                }
              ],
              "notes": [
                {
                  "id": "n1",
                  "date": "2026-02-28",
                  "author": "A",
                  "content": "Budi menang lomba mewarnai hari ini di sekolah! Sangat bangga.",
                  "tags": ["sekolah", "prestasi"]
                },
                {
                  "id": "n2",
                  "date": "2026-03-01",
                  "author": "B",
                  "content": "Sari agak batuk sedikit, sudah diberi sanmol. Pantau suhunya malam ini.",
                  "tags": ["kesehatan"]
                }
              ]
            }'
        )
        ON CONFLICT (user_id) DO UPDATE 
        SET data = EXCLUDED.data, display_name = EXCLUDED.display_name;
    END IF;
END $$;
