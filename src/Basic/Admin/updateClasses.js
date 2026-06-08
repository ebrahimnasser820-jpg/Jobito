const fs = require('fs');
const file = 'c:/Users/MOHAM/Project/Jobito/Jobito/src/Basic/Admin/Admin.tsx';
let code = fs.readFileSync(file, 'utf8');

// Ensure import styles
code = code.replace(/import "\.\/Admin\.css";\r?\n?/, '');
code = code.replace(/import "\.\/Admin\.module\.css";\r?\n?/, '');

if (!code.includes('var(--bg)') && !code.includes('import styles from "./Admin.module.css";')) {
    code = code.replace(/import \{ useState, useEffect, useRef \} from "react";/, 'import { useState, useEffect, useRef } from "react";\nimport styles from "./Admin.module.css";');
}

// Ensure the import styles line is there if it got missed
if (!code.includes('import styles from "./Admin.module.css";')) {
    code = `import styles from "./Admin.module.css";\n` + code;
}

// Replace string literal classNames
code = code.replace(/className="([^"]+)"/g, (match, classNames) => {
    let classes = classNames.split(' ').map(c => c.trim()).filter(Boolean);
    if (classes.length === 1) {
        return `className={styles["${classes[0]}"]}`;
    }
    let combined = classes.map(c => `\${styles["${c}"]}`).join(' ');
    return `className={\`${combined}\`}`;
});

// Specific template literal classNames in Admin.tsx
code = code.replace(/className=\{`layout \$\{dark \? "dark" : ""\}`\}/, "className={`\\${styles.layout} \\${dark ? styles.dark : \"\"}`}");

code = code.replace(/className=\{`nav-item \$\{activeNav === n\.id \? "active" : ""\}`\}/g, "className={`\\${styles[\"nav-item\"]} \\${activeNav === n.id ? styles.active : \"\"}`}");

code = code.replace(/className=\{`bar \$\{isHov \? "highlight" : ""\}`\}/g, "className={`\\${styles.bar} \\${isHov ? styles.highlight : \"\"}`}");

code = code.replace(/className=\{`kpi-change \$\{k\.change >= 0 \? "up" : "down"\}`\}/g, "className={`\\${styles[\"kpi-change\"]} \\${k.change >= 0 ? styles.up : styles.down}`}");

code = code.replace(/className=\{`finance-badge \$\{k\.change >= 0 \? "up" : "down"\}`\}/g, "className={`\\${styles[\"finance-badge\"]} \\${k.change >= 0 ? styles.up : styles.down}`}");

fs.writeFileSync(file, code);
console.log('Success');
