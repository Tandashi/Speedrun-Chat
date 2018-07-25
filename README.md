# Speedrun-Chat
This script allows you to write messages on speedrun.com

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
To get an API Key you need to create an account. You can do this [here](https://speedrun.tandashi.de/chat/register). (Please use the **same** username for this account as your speedrun.com username to make it easier for people to contact you)  
Once you created the account you will be redirect to a page displaying your username and your API Key. Store this API Key somewhere safe because you will **not** be able to view it once more. This will change in future updates. Now you can configure the script.

### Configure script
Once you got your API Key you need to configure the script. To configure the script just go to speedrun.com and click the message icon. A textbox asking you to input your API Key will appear. Paste your API Key into the textbox. Now click save and your done with the configuration.  
If you should encounter any problems read the FAQ or contact me on Discord (Tandashi#5185).

### Further Configuration
To open the settings menu just click the settings icon in the top right corner. The following settings can be ajusted:

|Name|Description|Version|
|-|-|-|
|Reset API Key|Click to reset the stored API Key|v0.1.4+|

## FAQ
Q: Why is there a popup when I click the message symbol for the first time?  
A: This is because by default it is not allowed to pull data from another website. Just press `always allow domain` to allow the script to pull messages from the API.
