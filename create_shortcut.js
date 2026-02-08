const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = __dirname;
const pngPath = path.join(projectRoot, 'client', 'public', 'logo.png');
const icoPath = path.join(projectRoot, 'logo.ico');
const batPath = path.join(projectRoot, 'start_app.bat');

// 1. Convert PNG to ICO
try {
    const pngBuf = fs.readFileSync(pngPath);
    const size = pngBuf.length;

    // Header: Reserved (2), Type (2), Count (2)
    const header = Buffer.from([0, 0, 1, 0, 1, 0]);

    // Directory Entry: 16 bytes
    // Width(1), Height(1), Colors(1), Res(1), Planes(2), BPP(2), Size(4), Offset(4)
    // We assume 256x256 usually fits modern PNGs, or set 0 for automatic
    const entry = Buffer.alloc(16);
    entry.writeUInt8(0, 0); // Width (0 = 256)
    entry.writeUInt8(0, 1); // Height
    entry.writeUInt8(0, 2); // Colors
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Planes
    entry.writeUInt16LE(32, 6); // BPP
    entry.writeUInt32LE(size, 8); // Size
    entry.writeUInt32LE(22, 12); // Offset (6+16)

    const icoBuf = Buffer.concat([header, entry, pngBuf]);
    fs.writeFileSync(icoPath, icoBuf);
    console.log('Generated logo.ico');

} catch (e) {
    console.error('Error converting ICO:', e.message);
    process.exit(1);
}

// 2. Create Desktop Shortcut via temporary PowerShell script
const psSriptPath = path.join(projectRoot, 'temp_shortcut.ps1');
const psContent = `
$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = $WshShell.SpecialFolders.Item("Desktop")
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\\InvoiceHub.lnk")
$Shortcut.TargetPath = "${batPath}"
$Shortcut.WorkingDirectory = "${projectRoot}"
$Shortcut.IconLocation = "${icoPath}"
$Shortcut.Description = "Launch InvoiceHub"
$Shortcut.Save()
`;

try {
    fs.writeFileSync(psSriptPath, psContent);
    execSync(`powershell -ExecutionPolicy Bypass -File "${psSriptPath}"`);
    fs.unlinkSync(psSriptPath);
    console.log('Shortcut created on Desktop successfully.');
} catch (e) {
    console.error('Error creating shortcut:', e.message);
}

