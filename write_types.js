const fs = require('fs');
const content = fs.readFileSync('C:/Users/jason/.gemini/antigravity/brain/ec7c87d0-624a-4ac2-a077-d1ccd6ff2c99/.system_generated/steps/53/output.txt', 'utf8');
const json = JSON.parse(content);

if (!fs.existsSync('src/supabase')) {
  fs.mkdirSync('src/supabase', { recursive: true });
}

fs.writeFileSync('src/supabase/database.types.ts', json.types);
console.log('Types written to src/supabase/database.types.ts');
