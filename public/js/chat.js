$(() => {
    var lang_map={                        
        "C":"c_cpp",
        "CPP":"c_cpp",
        "CPP11":"c_cpp",
        "CLOJURE":"clojure",
        "CSHARP":"csharp",
        "JAVA":"java",
        "JAVASCRIPT":"javascript",
        "HASKELL":"haskell",
        "PERL":"perl",
        "PHP":"php",
        "PYTHON":"python",
        "RUBY":"ruby"
      }

    var source_template={
          "C" : "#include <stdio.h>\nint main(void) {\n\t// your code goes here\n\treturn 0;\n}",
          "CPP" : "#include <iostream>\nusing namespace std;\nint main() {\n\t// your code goes here\n\treturn 0;\n}",
          "CPP11" : "#include <iostream>\nusing namespace std;\nint main() {\n\t// your code goes here\n\treturn 0;\n}",
          "CLOJURE" : "; your code goes here",
          "CSHARP" : "using System;\npublic class Test{\n\tpublic static void Main(){\n\t// your code goes here\n\t}\n}",
          "JAVA" : "/* package whatever; // don't place package name! */\nimport java.util.*;\nimport java.lang.*;\nimport java.io.*;\n\
        /* Name of the class has to be \"Main\" only if the class is public. */\nclass Ideone{\n\t\
        public static void main (String[] args) throws java.lang.Exception{\n\t\t// your code goes here\n\t}\n}",
          "JAVASCRIPT":"// your code goes here",
          "HASKELL":"main = -- your code goes here",
          "PERL":"#!/usr/bin/perl\n# your code goes here",
          "PHP":"<?php\n\n// your code goes here",
          "PYTHON":"# your code goes here",
          "RUBY":"# your code goes here"
        }  
    
    const $list = $("#messages-list"); 
    const $sendButton = $("#send-button");
    const $input = $("#message-input");
    const $messagesContainer = $("#messages-container");

    let timeoutId = null;  

    const username = $("#username").data("username");

    const socket = io("/chats");

    socket.on("connect", () => {
        socket.emit("data", {
            url: window.location.pathname,
            username
        });
    });
    $(document).ready(function(){
        const domain = 'meet.jit.si';
        const options = {
        roomName: 'Place_Me',
        width: 500,
        height: 700,
        parentNode: document.querySelector('#meet'),
        userInfo: {
            displayName: username
        }
    };
const api = new JitsiMeetExternalAPI(domain, options);
});
    socket.on("old messages", (chats) => {
        $list.html("");
        chats.forEach(chat => {
            appendMessage($list, chat);
        });
        updateScroll($messagesContainer);
    });

    socket.on("new message display", (chat) => {
        clearTypingMessage(timeoutId);
        appendMessage($list, chat);
        updateScroll($messagesContainer);
    });

    socket.on("get initcode", (data) => {
        var editor = ace.edit('editor');
        console.log("data.lang: "+ data.lang);
        $("#lang").val(data.lang).attr('selected',true);
        editor.getSession().setMode("ace/mode/" + lang_map[data.lang]);
        var data = editor.getSession().setValue(data.code);
    });

    socket.on("typing", (username) => {
        clearTypingMessage(timeoutId);
        $list.append(`
            <li id="typing" class="left" style="margin-bottom: 10px; width: 100%; text-align: center" >
                <div class="grey lighten-2 orange-text" style="padding-left: 10px; padding-right: 10px">${username} is typing.....</div>
            </li>
        `);
        updateScroll($messagesContainer);
        timeoutId = setTimeout(() => {
            $("#typing").remove();
        }, 500);
    });

    socket.on("compiling", (username) => {
        $('#unblock').css({'display':'none'});
        $('#block').css({'display': 'block'});
        $('.compile-username').html(`<b>${username}</b> compiled the code !`);
    });

    socket.on("updatecode", data =>{
        var editor = ace.edit('editor');
        editor.getSession().setValue(data.code);
    });

    socket.on("update inputbox", data =>{
        $("#inputbox").val(data);
    });

    socket.on("update outputbox", data =>{
        $('#unblock').css({'display':'block'});
        $('#block').css({'display': 'none'});
        $('#op').click();
        $("#outputbox").text(data);
    });

    socket.on("change lang", lang => {
        $("#lang option:selected").removeAttr("selected");
        $("#lang").val(lang).attr('selected',true);
        var editor = ace.edit('editor');
        editor.getSession().setMode("ace/mode/" + lang_map[lang]);
    });

    // --------------------
    //   EVENT LISTENERS
    // --------------------

    $( "#editor" ).keyup(function() {
      var editor = ace.edit('editor');
      var data = editor.getSession().getValue();
      socket.emit("set initcode", {code: data, lang: $("#lang option:selected").val()});
      socket.emit("update", {code: data, lang: $("#lang option:selected").val()});
    });

    $("#inputbox").keyup(function(){
        socket.emit("update input", $("#inputbox").val());
    });
    
    $('#ChangeOutput').on('click',function(){
        socket.emit("add link", {username: username, link: $('#link').text()});
        socket.emit("change output", $("#outputbox").text());
    });

    //setting the source code in editor according to lang selected
    $("#lang").change(function(){
        var lang = $("#lang option:selected").val();
        var editor = ace.edit('editor');
        console.log(source_template[lang]);
        editor.getSession().setMode("ace/mode/" + lang_map[lang]);
        socket.emit("update lang", lang);
    })

    $sendButton.click(() => {
        socket.emit("new message", $input.val());
        $input.val("");
    });

    $input.on("keypress", (event) => {
        //console.log("done");
        if (event.keyCode === 13)
            $sendButton.click();
        else {
            socket.emit("typed", username);
        }
    });

    $('#compile').on('click', function(){
        socket.emit("compile code", username );
    });

});

const appendMessage = ($list, message) => {
    var username = $("#username").data("username");
    if(message.sender === username){
        $list.append(`
        <li class="right" style="margin-bottom: 10px; width: 80%"> 
            <div class="teal lighten-4" style="padding-left: 10px; padding-right: 10px">${message.body}</div>` +           
        `</li>
    `);
    }else{
        $list.append(`
        <li class="left" style="margin-bottom: 10px; width: 80%">
            <b>${message.sender}:</b> 
            <div class="orange lighten-4" style="padding-left: 10px; padding-right: 10px">${message.body}</div>` +           
        `</li>
    `);
    }
};

const updateScroll = ($messagesContainer) => {
    $messagesContainer.scrollTop($messagesContainer.prop("scrollHeight"));
};

const clearTypingMessage = (timeoutId) => {
    $("#typing").remove();
    clearTimeout(timeoutId);
    timeoutId = null;
};

