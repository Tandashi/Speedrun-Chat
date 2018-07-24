  // ==UserScript==
  // @name         Speedrun.com Chat
  // @namespace    https://tandashi.de
  // @version      0.1.0
  // @description  Implement chat feature to speedrun.com
  // @author       Tandashi

  // @match        *://www.speedrun.com/*

  // @run-at       document-end
  // @grant        GM_xmlhttpRequest
  // @grant        GM_info
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
      GET_MESSAGES: "/get_messages"
    }
  }

  const ERROR_MESSAGES = {
    API_KEY_NOT_VALID: "API Key is not valid.",
    API_SERVER_ERROR: "A error occured on the server side.",
    API_USER_NOT_EXISTING: "User does not exist. You might have misspelled it or the user doesn't have an account.",
    API_MESSAGE_NOT_FOUND: "Message was not found."
  }
  // ==/Constants==

  // ==Config==
  const API_KEY = "";
  // ==/Config==

  var navbar, message_tab, message_menu;
  var messages;

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
  * Append header to the message_menu
  */
  function create_header() {
    const header = document.createElement("li");
    header.innerHTML = "<p style='float: left; font-weight: bold;'>Messages</p> <small style='float: right;'>v" + VERSION + " (by " + AUTHOR + ")</small>";
    header.classList.add("dropdown-header");

    return header;
  }

  /**
  * Append divider to the message_menu
  */
  function create_divider() {
    const divider = document.createElement("li");
    divider.classList.add("divider");
    divider.setAttribute("role", "separator");
    divider.style.width = "100%";
    return divider
  }

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

  /**
  * Inflate the messages in the message_menu
  */
  function inflate_messages() {
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
    const content_entry = document.createElement("a");
    content_entry.style.color = "black";
    content_entry.innerHTML = "<p>" + message.title + "<br /><small>From: " + message.from.username + "</small>" + "</p>" + message.message;

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
    const title_entry = document.createElement("a");
    title_entry.textContent = message.title;
    title_entry.style.float = "left";
    title_entry.style.width = "70%";
    list_entry.appendChild(title_entry);

    if(disabled != true){
      list_entry.addEventListener('click', (event) => {
        if(event.target == title_entry){
          inflate_message(message);
        }
      });

      const delete_entry = create_button("Delete", () => {
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

      delete_entry.style.width = "20%";
      list_entry.appendChild(delete_entry);
    }
    else {
      title_entry.style.width = "100%";
      title_entry.style.color = "grey";
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
