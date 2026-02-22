const fs = require('fs');
const file = 'c:/Users/Admin/Downloads/HACK2HUSTKE - Copy (3)/HACK2HUSTKE - Copy/HACK2HUSTKE - Copy/src/pages/Opportunities.tsx';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(/import \{([\s\S]*?)CheckCircle2([\s\S]*?)\} from 'lucide-react';/, "import {$1$2} from 'lucide-react';");
content = content.replace(/,\s*\n/g, '\n'); // clean up trailing comma if any
content = content.replace(/\/\* ───────── OFFER FORM MODAL ───────── \*\/[\s\S]*?const ITEMS_PER_PAGE/, 'const ITEMS_PER_PAGE');
fs.writeFileSync(file, content);
console.log('Fixed Opportunities.tsx');
