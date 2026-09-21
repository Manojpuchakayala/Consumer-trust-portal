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

console.log("=== Fast Synchronizing Folders ===");
for (const target of targetDirs) {
  try {
    copyRecursive(sourceDir, target);
    console.log(`[OK] Synced to: ${target}`);
  } catch (err) {
    console.warn(`[WARN] Syncing ${target}:`, err.message);
  }
}

// Create clean zip from the synchronized folder (which already excludes node_modules)
const cleanExportFolder = "C:\\\\Users\\\\manoj\\\\OneDrive\\\\Desktop\\\\Consumer-Trust-Portal";
const zipTarget = "C:\\\\Users\\\\manoj\\\\OneDrive\\\\Desktop\\\\Consumer_Trust_Portal.zip";

try {
  if (fs.existsSync(zipTarget)) {
    fs.unlinkSync(zipTarget);
  }
  const zipCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${cleanExportFolder}\\\\*' -DestinationPath '${zipTarget}' -Force"`;
  execSync(zipCmd, { stdio: "inherit" });
  console.log(`[OK] Clean ZIP package created at: ${zipTarget}`);
} catch (zipErr) {
  console.warn(`[WARN] ZIP creation:`, zipErr.message);
}

console.log("=== Synchronization Complete ===");
