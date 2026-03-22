import random
from datetime import datetime, timedelta

def generate_long_term_data(email="demo@example.com", months=120):
    start_date = datetime(2015, 1, 1)
    sql = [
        "-- 10-Year Stress Test Data",
        f"-- Target email: {email}",
        "",
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
        f"DELETE FROM net_worth_entries WHERE user_id = (SELECT id FROM target_user_info);",
        f"DELETE FROM contribution_transactions WHERE user_id = (SELECT id FROM target_user_info);",
        "",
        "-- Ensure required categories exist",
        "INSERT INTO categories (user_id, name, type) ",
        "SELECT (SELECT id FROM target_user_info), 'Cash', 'asset'",
        "WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = (SELECT id FROM target_user_info) AND name = 'Cash');",
        "INSERT INTO categories (user_id, name, type) ",
        "SELECT (SELECT id FROM target_user_info), 'Investments', 'asset'",
        "WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = (SELECT id FROM target_user_info) AND name = 'Investments');",
        "INSERT INTO categories (user_id, name, type) ",
        "SELECT (SELECT id FROM target_user_info), 'Mortgage', 'liability'",
        "WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = (SELECT id FROM target_user_info) AND name = 'Mortgage');",
        ""
        ""
    ]
    
    # Categories IDs (assuming standard ones exist)
    cat_ids = {
        "Cash": f"(SELECT id FROM categories WHERE user_id = (SELECT id FROM target_user_info) AND name = 'Cash' LIMIT 1)",
        "Bank": f"(SELECT id FROM categories WHERE user_id = (SELECT id FROM target_user_info) AND name = 'Bank Accounts' LIMIT 1)",
        "Investments": f"(SELECT id FROM categories WHERE user_id = (SELECT id FROM target_user_info) AND name = 'Investments' LIMIT 1)",
        "Mortgage": f"(SELECT id FROM categories WHERE user_id = (SELECT id FROM target_user_info) AND name = 'Mortgage' LIMIT 1)"
    }
    
    # Profitable scenario: Start with assets > liabilities
    current_cash = 25000
    current_investments = 75000
    current_mortgage = 40000
    
    # Growth rates
    income_pct = 0.03 # 3% monthly savings growth
    market_pct = 0.015 # 1.5% average monthly market return
    contribution_amt = 3000 # 3k monthly contribution
    
    for i in range(months):
        # Strict month-by-month calculation
        # Start at 2015-01-01 + i months
        total_months = (start_date.year * 12 + start_date.month - 1) + i
        y = total_months // 12
        m = (total_months % 12) + 1
        d_str = f"{y}-{m:02d}-01"
        
        # Consistent growth
        
        # Grow assets
        current_investments *= 1.006 # ~7% annual growth
        
        # Monthly savings/contribution
        savings = 1000 + random.randint(-200, 500)
        current_cash += savings
        
        # Mortgage payment
        mortgage_pay = 1500
        interest = current_mortgage * 0.003
        principal = mortgage_pay - interest
        current_mortgage -= principal
        
        # Entries
        sql.append(f"INSERT INTO net_worth_entries (user_id, category_id, month, year, value) SELECT (SELECT id FROM target_user_info), {cat_ids['Cash']}, {m}, {y}, {round(current_cash, 2)};")
        sql.append(f"INSERT INTO net_worth_entries (user_id, category_id, month, year, value) SELECT (SELECT id FROM target_user_info), {cat_ids['Investments']}, {m}, {y}, {round(current_investments, 2)};")
        sql.append(f"INSERT INTO net_worth_entries (user_id, category_id, month, year, value) SELECT (SELECT id FROM target_user_info), {cat_ids['Mortgage']}, {m}, {y}, {round(max(0, current_mortgage), 2)};")
        
        # Transactions
        sql.append(f"INSERT INTO contribution_transactions (user_id, category_id, date, amount, type) SELECT (SELECT id FROM target_user_info), {cat_ids['Investments']}, '{d_str}', {round(savings, 2)}, 'asset';")
        sql.append(f"INSERT INTO contribution_transactions (user_id, category_id, date, amount, type) SELECT (SELECT id FROM target_user_info), {cat_ids['Mortgage']}, '{d_str}', {round(principal, 2)}, 'liability';")
        sql.append("")

    sql.append("COMMIT;")
    return "\n".join(sql)

if __name__ == "__main__":
    email = "demo@gmail.com" # Default to common demo email
    result = generate_long_term_data(email)
    with open(r"c:\Users\minhn\OneDrive\Desktop\Ultimate Excel Net Worth Tracker\net-worth-tracker-web\supabase\02_long_term_stress_test.sql", "w", encoding="utf-8") as f:
        f.write(result)
    print("Generated 02_long_term_stress_test.sql")
