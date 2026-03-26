const fs = require('fs');
const content = fs.readFileSync('C:/Users/jason/.gemini/antigravity/brain/39d10aa4-c86e-4168-a7fd-6bf36cd3a3a0/.system_generated/steps/331/output.txt', 'utf8');
const data = JSON.parse(content);
fs.writeFileSync('C:/Users/jason/Documents/AG-Sites/OnyxRE/web/src/supabase/database.types.ts', data.types);
