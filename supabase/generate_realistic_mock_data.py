import random
from datetime import datetime
import os

def generate_realistic_mock_data(email="demo@gmail.com", months=120):
    start_date = datetime(2015, 1, 1)
    
    # Excel Categories mapping
    assets = {
        "Real Estate": {"start": 350000, "monthly_growth": 0.003, "monthly_contrib": 0},
        "Equities": {"start": 50000, "monthly_growth": 0.007, "monthly_contrib": 500, "volatility": 0.03},
        "Pensions": {"start": 30000, "monthly_growth": 0.004, "monthly_contrib": 600},
        "Vehicles": {"start": 25000, "monthly_growth": -0.015, "monthly_contrib": 0}, # Depreciates
        "Cash": {"start": 10000, "monthly_growth": 0.001, "monthly_contrib": 200, "volatility": 0.05}
    }
    
    liabilities = {
        "Mortgage": {"start": 250000, "monthly_interest": 0.003, "monthly_pay": 1500},
        "Student Loans": {"start": 40000, "monthly_interest": 0.004, "monthly_pay": 400},
        "Car Loans": {"start": 20000, "monthly_interest": 0.005, "monthly_pay": 450},
        "Personal Loans": {"start": 5000, "monthly_interest": 0.008, "monthly_pay": 200}
    }

    sql = [
        "-- Realistic 10-Year Excel-like Mock Data",
        f"-- Target email: {email}",
        "",
        "BEGIN;",
        "",
        "DROP TABLE IF EXISTS target_user_info;",
        f"CREATE TEMP TABLE target_user_info AS SELECT id FROM auth.users WHERE email = '{email}';",
        "",
        "-- VALIDATION",
        "DO $$",
        "BEGIN",
        "  IF NOT EXISTS (SELECT 1 FROM target_user_info) THEN",
        f"    RAISE EXCEPTION 'Account {email} not found!';",
        "  END IF;",
        "END $$;",
        "",
        "-- Clean old data",
        "DELETE FROM net_worth_entries WHERE user_id = (SELECT id FROM target_user_info);",
        "DELETE FROM contribution_transactions WHERE user_id = (SELECT id FROM target_user_info);",
        "DELETE FROM categories WHERE user_id = (SELECT id FROM target_user_info);",
        "",
        "-- Create Categories",
    ]
    
    # Generate SQL to insert categories
    for name in assets.keys():
        sql.append(f"INSERT INTO categories (id, user_id, name, type, is_active) VALUES (gen_random_uuid(), (SELECT id FROM target_user_info), '{name}', 'asset', true);")
    for name in liabilities.keys():
        sql.append(f"INSERT INTO categories (id, user_id, name, type, is_active) VALUES (gen_random_uuid(), (SELECT id FROM target_user_info), '{name}', 'liability', true);")
    
    sql.append("")
    
    cat_ids = {}
    for name in list(assets.keys()) + list(liabilities.keys()):
        cat_ids[name] = f"(SELECT id FROM categories WHERE user_id = (SELECT id FROM target_user_info) AND name = '{name}' LIMIT 1)"

    # Current states
    current_assets = {k: v["start"] for k, v in assets.items()}
    current_liabs = {k: v["start"] for k, v in liabilities.items()}
    
    for i in range(months):
        # Strict month calculation
        total_months = (start_date.year * 12 + start_date.month - 1) + i
        y = total_months // 12
        m = (total_months % 12) + 1
        d_str = f"{y}-{m:02d}-01"
        
        # Assets updates
        for name, conf in assets.items():
            # Apply growth
            growth = conf["monthly_growth"]
            if "volatility" in conf:
                growth += random.uniform(-conf["volatility"], conf["volatility"])
            current_assets[name] *= (1 + growth)
            
            # Apply contrib
            contrib = conf["monthly_contrib"]
            if contrib > 0:
                current_assets[name] += contrib
                sql.append(f"INSERT INTO contribution_transactions (user_id, category_id, date, amount, type) SELECT (SELECT id FROM target_user_info), {cat_ids[name]}, '{d_str}', {round(contrib, 2)}, 'asset';")
            
            sql.append(f"INSERT INTO net_worth_entries (user_id, category_id, month, year, value) SELECT (SELECT id FROM target_user_info), {cat_ids[name]}, {m}, {y}, {round(max(0, current_assets[name]), 2)};")
            
        # Liabilities updates
        for name, conf in liabilities.items():
            if current_liabs[name] <= 0:
                # Paid off
                sql.append(f"INSERT INTO net_worth_entries (user_id, category_id, month, year, value) SELECT (SELECT id FROM target_user_info), {cat_ids[name]}, {m}, {y}, 0;")
                continue
                
            interest = current_liabs[name] * conf["monthly_interest"]
            pay = conf["monthly_pay"]
            principal = pay - interest
            
            if principal > current_liabs[name]:
                principal = current_liabs[name]
                
            current_liabs[name] -= principal
            
            sql.append(f"INSERT INTO contribution_transactions (user_id, category_id, date, amount, type) SELECT (SELECT id FROM target_user_info), {cat_ids[name]}, '{d_str}', {round(principal, 2)}, 'liability';")
            sql.append(f"INSERT INTO net_worth_entries (user_id, category_id, month, year, value) SELECT (SELECT id FROM target_user_info), {cat_ids[name]}, {m}, {y}, {round(max(0, current_liabs[name]), 2)};")
            
        sql.append("") # Spacer between months

    sql.append("COMMIT;")
    return "\n".join(sql)

if __name__ == "__main__":
    email = "demo@gmail.com" # Can be changed in the SQL
    result = generate_realistic_mock_data(email)
    out_path = os.path.join(os.path.dirname(__file__), "03_realistic_excel_mock_data.sql")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(result)
    print(f"Generated {out_path}")
