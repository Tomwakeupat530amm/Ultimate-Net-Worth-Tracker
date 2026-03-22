import csv
import os
from datetime import datetime

def generate_full_seed_sql(email="demo@gmail.com"):
    nw_csv = r"c:\Users\minhn\OneDrive\Desktop\Ultimate Excel Net Worth Tracker\net-worth-tracker-web\supabase\nw_tracking.csv"
    contr_csv = r"c:\Users\minhn\OneDrive\Desktop\Ultimate Excel Net Worth Tracker\net-worth-tracker-web\supabase\contributions.csv"
    out_sql = r"c:\Users\minhn\OneDrive\Desktop\Ultimate Excel Net Worth Tracker\net-worth-tracker-web\supabase\01_demo_seed_excel.sql"

    user_sub = "(SELECT id FROM target_user_info)"

    sql = [
        "-- EXCEL-PARITY DEMO SEED SCRIPT (v3)",
        "-- This script populates 100% accurate data from the demo Excel file.",
        "",
        "-- 1. SETUP: ONLY CHANGE THE EMAIL BELOW",
        "DROP TABLE IF EXISTS target_user_info;",
        f"CREATE TEMP TABLE target_user_info AS SELECT id FROM auth.users WHERE email = '{email}';",
        "",
        "-- 2. VALIDATION: Check if user exists",
        "DO $$",
        "BEGIN",
        "  IF NOT EXISTS (SELECT 1 FROM target_user_info) THEN",
        f"    RAISE EXCEPTION 'LỖI: Không tìm thấy email {email} trong hệ thống auth.users. Vui lòng kiểm tra lại dòng đầu tiên!';",
        "  END IF;",
        "  IF NOT EXISTS (SELECT 1 FROM categories WHERE user_id = (SELECT id FROM target_user_info)) THEN",
        "    RAISE EXCEPTION 'LỖI: User tồn tại nhưng chưa có danh mục (Categories). Vui lòng đăng nhập vào web app 1 lần để hệ thống tạo danh mục mặc định rồi mới chạy script này!';",
        "  END IF;",
        "END $$;",
        "",
        "BEGIN;",
        f"DELETE FROM net_worth_entries WHERE user_id = {user_sub};",
        f"DELETE FROM contribution_transactions WHERE user_id = {user_sub};",
        "",
        "-- Ensure required categories exist",
        "INSERT INTO categories (user_id, name, type) ",
        f"SELECT {user_sub}, 'Cash', 'asset'",
        f"WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = {user_sub} AND name = 'Cash');",
        "INSERT INTO categories (user_id, name, type) ",
        f"SELECT {user_sub}, 'Investments', 'asset'",
        f"WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = {user_sub} AND name = 'Investments');",
        "INSERT INTO categories (user_id, name, type) ",
        f"SELECT {user_sub}, 'Mortgage', 'liability'",
        f"WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = {user_sub} AND name = 'Mortgage');",
        ""
    ]

    # Process Net Worth Tracking
    with open(nw_csv, "r", encoding="utf-8") as f:
        reader = list(csv.reader(f))
        
        # Headers/Timeline row is row 1 (0-based)
        timeline = reader[1]
        
        # Data rows start from row 4
        for row_idx in range(4, len(reader)):
            row = reader[row_idx]
            if not row or not row[1]: continue # Empty rows
            
            cat_name = row[1].strip()
            cat_type = 'asset' if row_idx < 20 else 'liability' # Rough guess based on excel structure
            
            # Identify category ID
            cat_sub = f"(SELECT id FROM categories WHERE user_id = {user_sub} AND name = '{cat_name}' LIMIT 1)"
            
            for col_idx in range(4, len(timeline)):
                val_str = row[col_idx].replace(',', '').strip()
                if not val_str or val_str == '-': continue
                
                try:
                    val = float(val_str)
                    date_label = timeline[col_idx]
                    # Parse date label "1/2024" or similar
                    parts = date_label.split('/')
                    if len(parts) == 2:
                        m, y = int(parts[0]), int(parts[1])
                        sql.append(f"INSERT INTO net_worth_entries (user_id, category_id, month, year, value) SELECT {user_sub}, {cat_sub}, {m}, {y}, {val};")
                except ValueError:
                    continue

    # Process Contributions
    sql.append("\n-- Process Contributions")
    with open(contr_csv, "r", encoding="utf-8") as f:
        reader = list(csv.reader(f))
        # Data starts from row 2
        for row_idx in range(2, len(reader)):
            row = reader[row_idx]
            if not row or len(row) < 5 or not row[0]: continue
            
            try:
                # Date format in CSV might be MM/DD/YYYY or similar
                date_str = row[0]
                # Fix common excel date weirdness if needed
                amt = float(row[2].replace(',', ''))
                cat_name = row[3].strip()
                c_type = row[4].strip().lower() # 'asset' or 'liability'
                
                cat_sub = f"(SELECT id FROM categories WHERE user_id = {user_sub} AND name = '{cat_name}' LIMIT 1)"
                sql.append(f"INSERT INTO contribution_transactions (user_id, category_id, date, amount, type) SELECT {user_sub}, {cat_sub}, '{date_str}', {amt}, '{c_type}';")
            except:
                continue

    sql.append("\nCOMMIT;")
    
    with open(out_sql, "w", encoding="utf-8") as f:
        f.write("\n".join(sql))
    print(f"Generated {out_sql} for {email}")

if __name__ == "__main__":
    generate_full_seed_sql("demo@gmail.com")
