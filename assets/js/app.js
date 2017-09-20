// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import socket from "./socket"

window.onload = function() {
  checkCookie();
  let roomChannel = socket.channel("room:lobby", {username: getCookie("username")})
  let chatChannel = socket.channel("chat:lobby", {user: getCookie("username")})
  let slideChannel = socket.channel("slide:lobby", {})
  roomChannel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })
  chatChannel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })
  slideChannel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })


  var $messages  = $("#messages")
  var $input     = $("#message-input")
  var $submitMessage = $("#submitMessage");
  var $currentViewers = $("#currentViews");
  var $presenceList = $("#presenceList");
  var $back = $("#back");
  var $next = $("#next");
  var $slideImage = $("#slideImage");


  roomChannel.on("presence_state", state => {
    $currentViewers.text(Object.keys(state).length)
    for (var [key, value] of Object.entries(state)) {
      var element = document.getElementById(key.toString())
      if (!element) {
        $presenceList.append(`<li id="${key}" class="list-group-item"><i class="glyphicon glyphicon-ok-circle"></i> ${key.toString()}</li>`)
      }
    }
  })

  roomChannel.on("presence_diff", diff => {
    for (var [key, value] of Object.entries(diff.joins)) {
      var element = document.getElementById(key.toString())
      if (element) {
        element.innerHTML = "<i class='glyphicon glyphicon-ok-circle'></i> " + key.toString()
      }
    }
    for (var [key, value] of Object.entries(diff.leaves)) {
      var element = document.getElementById(key.toString())
      if (element) {
        element.innerHTML = "<i class='glyphicon glyphicon-remove-circle'></i> " + key.toString()
      }
    }
    console.log(diff)
  })


  $input.off("keypress").on("keypress", e => {
    if (e.keyCode == 13) {
      chatChannel.push("new:msg", {user: getCookie("username"), body: $input.val()})
      $input.val("")
    }
  })

  $submitMessage.on("click", e => {
    chatChannel.push("new:msg", {user: getCookie("username"), body: $input.val()})
    $input.val("")
  })

  $next.on("click", e => {
    slideChannel.push("new:msg", {action: "add"})
  })

  $back.on("click", e => {
    slideChannel.push("new:msg", {action: "subtract"})
  })

  slideChannel.on("new:msg", msg => {
    var imageSrc = "https://s3.amazonaws.com/elixirtalk/slide_"+ msg["slide"] +".png"
    $("#slideImage").attr("src", imageSrc)
  })

  chatChannel.on("new:msg", msg => {
    $messages.append(messageTemplate(msg))
    scrollTo(0, document.body.scrollHeight)
  })

  chatChannel.on("user:entered", msg => {
    var username = sanitize(msg.user)
    $messages.append(`<br/><i>[${username} entered]</i>`)
  })
}

function sanitize(html){ return $("<div/>").text(html).html() }

function messageTemplate(msg){
  let username = sanitize(msg.user)
  let body     = sanitize(msg.body)

  return(`<p><a href='#'>[${username}]</a>&nbsp; ${body}</p>`)
}






function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        return;
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
    }
}
