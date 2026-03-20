import json

with open(r"C:\Users\jason\.gemini\antigravity\brain\39d10aa4-c86e-4168-a7fd-6bf36cd3a3a0\.system_generated\steps\141\output.txt", "r", encoding="utf-8") as f:
    data = json.load(f)

with open(r"c:\Users\jason\Documents\AG-Sites\OnyxRE\web\src\supabase\database.types.ts", "w", encoding="utf-8") as f:
    f.write(data["types"])
