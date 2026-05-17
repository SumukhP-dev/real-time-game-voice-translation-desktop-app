; Remove stale ml-service before new files are copied (customInstall runs *after* copy and would delete the fresh bundle).
!macro customInit
  RMDir /r "$INSTDIR\resources\ml-service"
!macroend
