
class DarkModeService {
    
    /**
     * Set the Dark/Light Mode
     * @param shouldEnable boolean
     */
    enableDarkTheme(shouldEnable:boolean) {
      document.body.classList.toggle("dark",shouldEnable);
    }
  
}
export {DarkModeService};