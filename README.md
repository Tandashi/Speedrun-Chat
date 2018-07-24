# Speedrun-Chat

## Installation
### Requirements
For this to work you need the Tempermonkey Extension for your Browser.

You can get Tempermonkey from here:  
[Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)  
[Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)  
[Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)  
Recommended Version: v4.6 by Jan Biniok

### How to install
Open this Link: https://github.com/Tandashi/Speedrun-Chat/raw/master/chat.user.js  
Then click on install.

## Setup / Configuration
### Get an API Key
**Please read the full paragraph before creating an account!**
To get an API Key you need to create an account. You can do this [here](https://speedrun.tandashi.de/chat/register).
Once you created the account you will be redirect to a page displaying your username and your API Key. Store this API Key somewhere safe because you will **not** be able to view it once more. This will change in future updates. Now you can configure the script.

### Configure script
Once you got your API Key you need to open the script. This can be done by clicking the Tampermonkey extension symbol on the top right corner (this could also be located somewhere else depending on your browser). In the dropdown menu select "Dashboard". Now you click on the "Speedrun.com Chat" script. Scroll down a bit till you see "// ==Config==". In this section somewhere should be this line:
```javascript
const API_KEY = "";
```
Paste your API Key between the two quotationmarks. Now safe the file with `CTRL + S` and your done with the configuration.  
If you should encounter any problems read the FAQ or contact me on Discord (Tandashi#5185).


## FAQ
Q: Why is there a popup when I click the message symbol for the first time?  
A: This is because by default it is not allowed to pull data from another website. Just press allow permanent to allow the script to pull messages from the API.
