// ==UserScript==
// @name         Speedrun.com Chat
// @namespace    https://tandashi.de
// @version      0.1.6
// @description  Implement chat feature to speedrun.com
// @author       Tandashi

// @match        *://www.speedrun.com/*

// @homepage    https://speedrun.tandashi.de/
// @downloadURL https://github.com/Tandashi/Speedrun-Chat/raw/master/chat.user.js
// @updateURL   https://github.com/Tandashi/Speedrun-Chat/raw/master/chat.user.js

// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

// ==Constants==
const VERSION = GM_info.script.version;
const AUTHOR = "Tandashi";

const MESSAGE_CHILD_ID = 1;

const MESSAGE_MENU_HEADER = 0;
const MESSAGE_MENU_DEVIDER = 1;
const MESSAGE_MENU_FIRST_MESSAGE = 2;

const API_URL = {
  BASE: "https://speedrun.tandashi.de/chat/api",
  POST: {
    SEND_MESSAGE: "/send_message",
    DELETE_MESSAGE: "/delete_message"
  },
  GET: {
    GET_MESSAGES: "/get_messages",
    CHECK_API_KEY: "/check_api_key"
  }
}

const ERROR_MESSAGES = {
  API_KEY_NOT_VALID: "API Key is not valid.",
  API_SERVER_ERROR: "A error occured on the server side.",
  API_USER_NOT_EXISTING: "User does not exist. You might have misspelled it or the user doesn't have an account.",
  API_MESSAGE_NOT_FOUND: "Message was not found.",
  API_SEND_TO_SELF: "You can't send messages to yourself."
}
// ==/Constants==

var navbar, message_tab, message_menu;
var messages;
var API_KEY = GM_getValue("API_KEY", null);

// Overwrite onload
window.onload = () => {
  // Get navbar element
  navbar = document.getElementById("navbar-right");
  // Get the message tab
  message_tab = navbar.children[MESSAGE_CHILD_ID];
  // Set onclick method of message tab
  message_tab.addEventListener('click', (event) => {
    // Check if we clicked on the message_tab and not on any child
    // if the event.target was the message_tab's first child we know that we clicked
    // next to the message symbol and not any child in the message_menu
    // if the event.target was the message_tab's first child and the first child of that
    // we clicked the message symbol directly and not any child in the message_menu
    // In both cases we need to call toggle_menu
    if(event.target == message_tab.children[0] || event.target == message_tab.children[0].children[0]) {
      // Check if we just opened the menu
      // toggle_menu returns true when we clicked and the menu opened
      if(toggle_menu()) {
        inflate_messages();
      }
    }
  });
  // Get message menu which displays all the messages
  message_menu = message_tab.querySelector(".dropdown-menu");
  message_menu.style.minWidth = "280px";
  // Remove the data-toggle attribute from the first message_tab child
  // so we can use or own open/close methods without problems
  message_tab.children[0].removeAttribute("data-toggle");
}

/**
* Create a header
*/
function create_header() {
  const header = document.createElement("li");
  header.classList.add("dropdown-header");

  const title = document.createElement("p");
  title.style.float = "left";
  title.style.fontWeight = "bold";
  title.textContent = "Messages";
  header.appendChild(title);

  const option_button = create_button("", () => {
    inflate_config();
  },"right")
  option_button.style.marginRight = "0";
  option_button.appendChild(create_icon("fa-cog"));
  header.appendChild(option_button);

  const small_text = document.createElement("small");
  small_text.style.float = "right";
  small_text.textContent = "v" + VERSION + " (by " + AUTHOR + ")";
  header.appendChild(small_text);

  return header;
}

/**
* Create a icon using font-awesome
* type = font-awesome type class
*/
function create_icon(type) {
  const i = document.createElement("i");
  i.classList.add("fa");
  i.classList.add(type);
  i.style.setProperty("margin-right", "0", "important");
  return i;
}

/**
* Create a divider
*/
function create_divider() {
  const divider = document.createElement("li");
  divider.classList.add("divider");
  divider.setAttribute("role", "separator");
  divider.style.width = "100%";
  return divider
}

/**
* Create a button
*/
function create_button(text, call, float) {
  const button = document.createElement("button");
  button.textContent = text;

  button.style.color = "white";
  button.style.background = "#cb4e4e";
  button.style.outline = "none";
  button.style.border = "none";
  button.style.borderRadius = "40px";
  button.style.margin = "0 5% 0 5%";
  button.style.float = float;

  // Create hover effect
  button.addEventListener('mouseleave', () => {
    button.style.background = "#cb4e4e";
  });
  // Create hover effect
  button.addEventListener('mouseenter', () => {
    button.style.background = "#bf2a2a";
  });

  button.addEventListener('click', call);

  return button
}

function inflate_config() {
  // Clear the menu
  clear_menu();
  // Add a header
  message_menu.appendChild(create_header());
  // Add a divider
  message_menu.appendChild(create_divider());

  const list_entry = document.createElement("li");
  message_menu.appendChild(list_entry);

  const reset_key_button = create_button("Reset API Key", () => {
    GM_deleteValue("API_KEY");
    inflate_api_config(inflate_messages);
  }, "none");
  list_entry.appendChild(reset_key_button);

  // Add a divider
  message_menu.appendChild(create_divider());

  const back_button = create_button("Back", () => {
    inflate_messages();
  }, "none");
  message_menu.appendChild(back_button);
}

function inflate_api_config(callback) {
  // Clear the menu
  clear_menu();
  // Add a header
  message_menu.appendChild(create_header());
  // Add a divider
  message_menu.appendChild(create_divider());

  const list_entry = document.createElement("li");
  const api_input = document.createElement("input");
  api_input.setAttribute("type", "text");
  api_input.setAttribute("placeholder", "API Key");
  api_input.style.width = "96%";
  api_input.style.margin = "2%";
  api_input.style.color = "black";
  list_entry.appendChild(api_input);

  const save_button = create_button("Save", () => {
    GM_xmlhttpRequest({
      method: "GET",
      url: API_URL.BASE + API_URL.GET.CHECK_API_KEY + "?k=" + api_input.value,
      async: false,
      onload: (response) => {
        switch(response.status) {
          case 200:
            GM_setValue("API_KEY", api_input.value);
            API_KEY = api_input.value;
            callback();
            break;
          case 401:
            alert(ERROR_MESSAGES.API_KEY_NOT_VALID);
            break;
          case 500:
            alert(ERROR_MESSAGES.API_SERVER_ERROR);
            break;
        }
      }
    });
  }, "right");
  list_entry.appendChild(save_button);

  message_menu.appendChild(list_entry);
}

/**
* Inflate the messages in the message_menu
*/
function inflate_messages() {
  // Check if API_KEY was configured
  // If not open the config menu
  if(API_KEY == null){
    inflate_api_config(inflate_messages);
    return;
  }

  // Clear the menu
  clear_menu();
  // Add a header
  message_menu.appendChild(create_header());
  // Add a divider
  message_menu.appendChild(create_divider());

  // Check if messages were once loaded
  // If they weren't load them
  if(messages == undefined) {
    load_messages();
    return;
  }

  if(messages.length == 0){
    add_message_entry({title: "No messages... Maybe reload?"}, true);
  }
  else{
    // Populate the messages
    messages.forEach((message) => {
      add_message_entry(message);
    });
  }

  // Add a divider
  message_menu.appendChild(create_divider());

  message_menu.appendChild(create_button("Refresh", load_messages, "left"));
  message_menu.appendChild(create_button("Compose", inflate_compose, "right"));
}

/**
* Inflate a message "menu" in the message_menu
*/
function inflate_message(message) {
  clear_menu();
  // Add a header
  message_menu.appendChild(create_header());
  // Add a divider
  message_menu.appendChild(create_divider());

  const list_entry = document.createElement("li");
  const content_entry = document.createElement("div");
  content_entry.style.margin = "0 5% 0 5%";

  const title = document.createElement("p");
  title.textContent = message.title;
  title.style.color = "black";
  title.style.width = "100%";
  title.style.fontWeight = "bold";
  title.style.marginBottom = "1%";
  content_entry.appendChild(title);

  const subtitle = document.createElement("small");
  subtitle.textContent = "From: " + message.from.username;
  subtitle.style.color = "black";
  subtitle.style.width = "100%";
  subtitle.style.marginBottom = "4%";
  subtitle.style.display = "block";
  content_entry.appendChild(subtitle);

  const message_area = document.createElement("p");
  message_area.textContent = message.message;
  message_area.style.color = "black";
  message_area.style.marginBottom = "0";
  message_area.style.whiteSpace = "pre-wrap";
  content_entry.appendChild(message_area);

  list_entry.appendChild(content_entry);
  message_menu.appendChild(list_entry);

  // Add a divider
  message_menu.appendChild(create_divider());
  message_menu.appendChild(create_button("Back", inflate_messages, "left"));
}

/**
* Inflate the compose "menu" in the message_menu
*/
function inflate_compose() {
  clear_menu();
  // Add a header
  message_menu.appendChild(create_header());
  // Add a divider
  message_menu.appendChild(create_divider());

  const to_box = document.createElement("input");
  to_box.setAttribute("type", "text");
  to_box.setAttribute("placeholder", "To");
  to_box.style.width = "96%";
  to_box.style.margin = "2%";
  to_box.style.color = "black";
  message_menu.appendChild(to_box);

  const title_box = document.createElement("input");
  title_box.setAttribute("type", "text");
  title_box.setAttribute("placeholder", "Title");
  title_box.style.width = "96%";
  title_box.style.margin = "2%";
  title_box.style.color = "black";
  message_menu.appendChild(title_box);

  const message_box = document.createElement("textarea");
  message_box.setAttribute("type", "text");
  message_box.setAttribute("placeholder", "Message");
  message_box.style.width = "96%";
  message_box.style.minHeight = "150px";
  message_box.style.margin = "2%";
  message_box.style.color = "black";
  message_menu.appendChild(message_box);

  // Add a divider
  message_menu.appendChild(create_divider());
  message_menu.appendChild(create_button("Back", inflate_messages, "left"));
  message_menu.appendChild(create_button("Send", () => {
    const message = {title: title_box.value, to: to_box.value, message: message_box.value}

    // Send message to server
    GM_xmlhttpRequest({
      method: 'POST',
      url: API_URL.BASE + API_URL.POST.SEND_MESSAGE,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: "k=" + API_KEY + "&to=" + message.to + "&title=" + message.title + "&message=" + message.message,
      onload: (response) => {
        // Check response from server
        switch(response.status){
          case 200:
            inflate_messages();
            break;
          case 400:
            alert(ERROR_MESSAGES.API_USER_NOT_EXISTING);
            break;
          case 418:
            alert(ERROR_MESSAGES.API_SEND_TO_SELF);
            break;
          case 500:
            alert(ERROR_MESSAGES.API_SERVER_ERROR);
            break;
          case 401:
            alert(ERROR_MESSAGES.API_KEY_NOT_VALID);
            break;
        }
      }
    });
  }, "right"));
}

function add_message_entry(message, disabled) {
  const list_entry = document.createElement("li");
  list_entry.style.overflow = "hidden";
  list_entry.style.display = "box";
  list_entry.style.marginTop = "3%";

  const title_entry = document.createElement("a");
  if(message.title.length > 25 && disabled != true) {
    title_entry.textContent = message.title.substr(0, 25) + " ...";
  }
  else{
    title_entry.textContent = message.title;
  }
  title_entry.style.float = "left";
  title_entry.style.marginLeft = "5%";
  title_entry.style.width = "80%";
  title_entry.style.borderRadius = "40px 0 0 40px";
  title_entry.style.padding = "0 3% 0 5%";
  title_entry.style.background = "#e5e5e5";

  list_entry.appendChild(title_entry);

  if(disabled != true){
    list_entry.addEventListener('click', (event) => {
      if(event.target == title_entry){
        inflate_message(message);
      }
    });

    // Create hover effect
    title_entry.addEventListener('mouseleave', () => {
      title_entry.style.background = "#e5e5e5";
    });
    // Create hover effect
    title_entry.addEventListener('mouseenter', () => {
      title_entry.style.background = "#d6d6d6";
    });

    const delete_entry = create_button("", () => {
      GM_xmlhttpRequest({
        method: 'POST',
        url: API_URL.BASE + API_URL.POST.DELETE_MESSAGE,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: "k=" + API_KEY + "&id=" + message._id,
        onload: (response) => {
          // Check response from server
          switch(response.status){
            case 200:
              load_messages();
              inflate_messages();
              break;
            case 400:
              alert(ERROR_MESSAGES.API_MESSAGE_NOT_FOUND);
              break;
            case 500:
              alert(ERROR_MESSAGES.API_SERVER_ERROR);
              break;
            case 401:
              alert(ERROR_MESSAGES.API_KEY_NOT_VALID);
              break;
          }
        }
      });
    }, "right");
    delete_entry.style.marginLeft = "0";
    delete_entry.style.borderRadius = "0 40px 40px 0";
    delete_entry.style.width = "10%";
    delete_entry.style.paddingLeft = "2%";
    delete_entry.appendChild(create_icon("fa-trash"));

    list_entry.appendChild(delete_entry);
  }
  else {
    title_entry.style.width = "100%";
    title_entry.style.color = "grey";
    title_entry.style.background = "transparent";
  }

  message_menu.appendChild(list_entry);
}

function load_messages() {
  GM_xmlhttpRequest({
    method: "GET",
    url: API_URL.BASE + API_URL.GET.GET_MESSAGES + "?k=" + API_KEY,
    async: false,
    onload: (response) => {
      switch(response.status) {
        case 200:
          messages = JSON.parse(response.responseText);
          inflate_messages();
          break;
        case 401:
          alert(ERROR_MESSAGES.API_KEY_NOT_VALID);
          break;
        case 500:
          alert(ERROR_MESSAGES.API_SERVER_ERROR);
          break;
      }
    }
  });
}

function open_menu() {
  // Add the open class to open the menu
  message_tab.classList.add("open");
}

function close_menu() {
  // Remove the open class to close the menu
  message_tab.classList.remove("open");
}

function toggle_menu() {
  // Check if message_tab contains the "open" class
  // If so the tab is currently open, if not it isn't
  if(message_tab.classList.contains("open")) {
    close_menu();
    return false;
  }
  else {
    open_menu();
    return true;
  }
}

function clear_menu() {
  // Remove all children
  message_menu.innerHTML = "";
}
