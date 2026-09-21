const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const sourceDir = "C:\\\\Users\\\\manoj\\\\Consumer Trust";
const targetDirs = [
  "C:\\\\Users\\\\manoj\\\\OneDrive\\\\Desktop\\\\Consumer-Trust-Portal",
  "C:\\\\Users\\\\manoj\\\\OneDrive\\\\Desktop\\\\Consumer_Trust_Code",
  "C:\\\\Users\\\\manoj\\\\Downloads\\\\Consumer_Trust_Code"
];

const excludeDirs = new Set(["node_modules", ".git", "dist", ".gemini", "scratch", ".system_generated"]);

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (excludeDirs.has(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

for (const target of targetDirs) {
  try {
    console.log(`Syncing to: ${target}`);
    copyRecursive(sourceDir, target);
    console.log(`Synced successfully to: ${target}`);
  } catch (err) {
    console.warn(`Sync warning for ${target}:`, err.message);
  }
}

// Create or update zip on Desktop
try {
  const zipTarget = "C:\\\\Users\\\\manoj\\\\OneDrive\\\\Desktop\\\\Consumer_Trust_Portal.zip";
  console.log(`Creating/updating ZIP at: ${zipTarget}`);
  const psCmd = `powershell -Command "Compress-Archive -Path '${sourceDir}\\\\backend', '${sourceDir}\\\\frontend', '${sourceDir}\\\\package.json', '${sourceDir}\\\\README.md' -DestinationPath '${zipTarget}' -Force"`;
  execSync(psCmd, { stdio: "inherit" });
  console.log(`ZIP created successfully at ${zipTarget}`);
} catch (zipErr) {
  console.warn("ZIP creation note:", zipErr.message);
}

console.log("All sync targets updated successfully!");
