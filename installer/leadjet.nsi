; Leadjet Windows installer.
; Installs the standalone binary to "C:\Program Files (x86)\Leadjet" and adds it
; to the system PATH. Build with:  makensis -DVERSION=0.1.0 installer/leadjet.nsi
; Requires the EnVar plugin (https://nsis.sourceforge.io/EnVar_plug-in) for clean
; PATH add/remove; the release workflow provides it.

!ifndef VERSION
  !define VERSION "0.0.0"
!endif

!include "MUI2.nsh"

Name "Leadjet ${VERSION}"
OutFile "..\release\leadjet-setup.exe"
Unicode true
InstallDir "$PROGRAMFILES32\Leadjet"
InstallDirRegKey HKLM "Software\Leadjet" "InstallDir"
RequestExecutionLevel admin

!define UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\Leadjet"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  File "/oname=leadjet.exe" "..\release\leadjet-win.exe"
  WriteUninstaller "$INSTDIR\uninstall.exe"

  ; Add the install dir to the system PATH (deduped by the plugin).
  EnVar::SetHKLM
  EnVar::AddValue "Path" "$INSTDIR"

  ; Register for Add/Remove Programs.
  WriteRegStr HKLM "Software\Leadjet" "InstallDir" "$INSTDIR"
  WriteRegStr HKLM "${UNINST_KEY}" "DisplayName" "Leadjet"
  WriteRegStr HKLM "${UNINST_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "${UNINST_KEY}" "Publisher" "thmxsweb"
  WriteRegStr HKLM "${UNINST_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "${UNINST_KEY}" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "${UNINST_KEY}" "NoModify" 1
  WriteRegDWORD HKLM "${UNINST_KEY}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  EnVar::SetHKLM
  EnVar::DeleteValue "Path" "$INSTDIR"

  Delete "$INSTDIR\leadjet.exe"
  Delete "$INSTDIR\uninstall.exe"
  RMDir "$INSTDIR"

  DeleteRegKey HKLM "${UNINST_KEY}"
  DeleteRegKey HKLM "Software\Leadjet"
SectionEnd
