; software/installer/storium-installer.iss

[Setup]
AppId={{STORIUM-ELECTRON-STORIUM-1}}
AppName=STORIUM
AppVersion=1.0.0
AppPublisher=storium_Team
DefaultDirName={pf}\STORIUM
DefaultGroupName=STORIUM
DisableDirPage=no
DisableProgramGroupPage=no
OutputDir=output
OutputBaseFilename=StoriumSetup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Files]
; .iss is in software\installer, dist is at repo root -> ..\..\dist\win-unpacked\*
Source: "C:\Users\PC\Documents\GitHub\Software-Engineering-Project\dist\win-unpacked\*"; DestDir: "{app}"; \
  Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Start Menu shortcut
Name: "{group}\STORIUM"; Filename: "{app}\storium.exe"
; Desktop shortcut
Name: "{commondesktop}\STORIUM"; Filename: "{app}\storium.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; \
  GroupDescription: "Additional icons:"

[Run]
; Checkbox on final page to run app after install
Filename: "{app}\storium.exe"; Description: "Launch STORIUM"; \
  Flags: nowait postinstall skipifsilent
