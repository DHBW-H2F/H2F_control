# Github description

Web user interface for viewing compressor and electrolyser data

The project is based on the CSS library `bootstrap` and Rust library `rocket`. 


### Project contents
- **src**: Rust back-end files
- **static**: Front-end files
- *config.yalm*: File containing the configuration and Rust dependencies
- *registers.json*: Lists the S7 addresses for communicating with LOGO8!
    - *Example* *{‘name’: ‘Restart_compressor’,‘id’: ‘DB1.DBX20.0’,“type”:‘BOOL’},*
    
- *rocket.toml*: file containing the rocket configuration and dependencies for the rest API

### Contents of the src folder
- *app_config.rs*: contains utility structures used in *main.rs*
- *control.rs*: contains utility functions for sending commands to devices used in *main.rs*
- *main.rs*: contains all the Rest API routes and launches the API

### Contents of the static folder
- **css**: all CSS files used by Bootstrap and the web UI
    - *style.css*: CSS file for the web UI
- **js**: contains Bootstrap JS files and those used by the web UI
    - *scrip.js*: file containing functions for elements common to all pages of the website
- *script_config.js*: file containing functions for elements for the __configurationPanel.html__ page
- *CompressorHMIDashboard.html*: Reproduction of the compressor software HMI
- *ConfigurationPanel.html*: Page that allows you to ‘control’ the electrolyser and compressor
- *ErrorsDashboard.html*: Page containing live compressor errors
- *LiveDashboard.html*: Main page containing all the information
- *ProductionDashboard.html*: The website's HTML page. It must be deployed on a server to load the JavaScript