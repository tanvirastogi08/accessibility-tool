# Accessibility-Tool

A tool which will check the accessibility of your independent component.

## Installation

Run `npm install` at the root path of the project to install the dependencies.

## Build (instructions)

Run `npm run build` to run the server.

1. Fill the Path starting from '/content/...'.

2. Change the HostName to one of localhost or 10.122.16.147

3. Default Port is 4502, update if needed.

4. Hit enter after filling all the details.

5. After few moments, the accessibility report is generated for the current path and it will be visible in your browser.

6. To validate the next component path you can simply go back from thankyou page -> home page -> enter new Path -> hit submit button. It will generate the report of your new component path OR run the command `npm run build` again to validate next component.