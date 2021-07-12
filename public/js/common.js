$(() => {
    console.log(window.location.href);

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
    
    $('textarea[data-editor]').each(function () {
      var textarea = $(this);
      var lang = $("#lang option:selected").val();
      var editDiv = $('<div>', {
        position: 'absolute',
        height: textarea.height(),
        'id' : 'editor',
        'class': textarea.attr('class')
      }).insertBefore(textarea);
      textarea.css('display', 'none');
      var editor = ace.edit(editDiv[0]);

       $("#link").text("link");
      
      editor.getSession().setMode("ace/mode/" + lang_map[lang]);
      editor.setTheme("ace/theme/clouds");

      if(window.location.pathname === "/compiler")
      {
          $.ajax({
            type: 'GET' ,
            url: "https://place-me-harshgulati.herokuapp.com/compiler/info" ,
            async: false,
            success: function(data) {
              //console.log(data);
              var editor = ace.edit('editor');
              editor.getSession().setValue(data.user.initcode.code);
              $("#lang option:selected").removeAttr("selected");
              $("#lang").val(data.user.initcode.lang).attr('selected',true);
            }
          });
      }

        $('#compile').on('click', function(){
            var text = editor.getSession().getValue();
            var input = $("#inputbox").val();
            var lang = $("#lang option:selected").val();
            text = text.replace(/\n/g, "\r\n");
            var source = {source: text , input: input, lang: lang};

            $.ajax({
              type: 'POST',
              url: "https://place-me-harshgulati.herokuapp.com/compiler/compiler",
              data: source,
              success: function(data){
                  
                  $("#link").text(data.web_link);
                  
                 if(data.compile_status === "OK"){  
                      //code runs successfully - display output
                      $("#outputbox").html("<b> SUCCESS : </b>" + data.run_status.time_used + "s  " + data.run_status.memory_used + "KB<br>" + data.run_status.output);
                  }else {     
                      //there is some error in the code
                       if(data.run_status.status_detail)
                         $("#outputbox").html("<b> ERROR :  </b>" + data.message + "<br>" + data.run_status.status_detail);
                      else
                         $("#outputbox").html("<b> ERROR <b>");  
                  }

                  console.log("clear op");
                  $("#op").click();

                  if(window.location.pathname !== "/compiler")
                  {
                    $('#ChangeOutput').click();
                  }
              }
            });
            return false;
        });
    });

    updateDatabase = () => {
      var editor = ace.edit('editor');
      var data = {  code : editor.getSession().getValue(),
                    lang: $("#lang option:selected").val()
                };
      $.ajax({
        type: 'POST' ,
        url: "https://place-me-harshgulati.herokuapp.com/compiler/save" ,
        data: data , 
        async: false,
        success: function(data) {
          console.log("success");
        }
      });
    }

    $("#theme").change(function(){
        var theme = $("#theme option:selected").text();
        var editor = ace.edit('editor');
        editor.setTheme("ace/theme/" + theme);
    })

    $('#ClearOutput').on('click',function(){
        $("#outputbox").text("");
        if(window.location.pathname !== "/compiler")
        {
          console.log("done.");
          $('#ChangeOutput').click();
        }
    });

    $('#template').on('click', function() {
        var lang = $("#lang option:selected").val();
        var editor = ace.edit('editor');
        editor.getSession().setValue(source_template[lang]);
        $("#editor").keyup();
    });

    var toggle = -1;
   
    $('.side-nav-button').click( function () {
        toggle *= -1;
        if (toggle === -1) {
            $('#profile-sidebar').css({'display':'none'});
            $('.fa-chevron-left').css({'display': 'none'});
            $('.fa-chevron-right').css({'display': 'block'});
            $('#main').css({'padding-left' : '0'});
            $('#sidebar-nav').css({'left' : '10px'});
            $('.ace_editor').width($('.card').width());
        }
        else {
            $('#profile-sidebar').css({'display':'block'});
            $('.fa-chevron-right').css({'display': 'none'});
            $('.fa-chevron-left').css({'display': 'block'});
            $('#main').css({'padding-left' : '15%' });
            $('#sidebar-nav').css({'left' : $('#profile-sidebar').width() + 10 });
            $('.ace_editor').width($('.card').width());
        }
    });
});
