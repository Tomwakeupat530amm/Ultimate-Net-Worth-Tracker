import pandas as pd
import os

excel_file = r"c:\Users\minhn\OneDrive\Desktop\Ultimate Excel Net Worth Tracker\2 - Demo with Sample Data\Ultimate Net Worth Tracker BASE - Demo.xlsx"
out_dir = "supabase"

if not os.path.exists(out_dir): os.makedirs(out_dir)

# 1. Net Worth Tracking
df_nw = pd.read_excel(excel_file, sheet_name="Net Worth Tracking", header=None)
df_nw.to_csv(os.path.join(out_dir, "nw_tracking.csv"), index=False, header=False)

# 2. Contributions
df_c = pd.read_excel(excel_file, sheet_name="Contributions Tracking", header=None)
df_c.to_csv(os.path.join(out_dir, "contributions.csv"), index=False, header=False)

print("Extracted CSVs to supabase folder.")
