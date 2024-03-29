let editor;

window.onload = function() {
    editor = ace.edit("editor");
    //editor.setTheme("ace/theme/solarized_light");
    editor.setTheme("ace/theme/idle_fingers");
    editor.session.setMode("ace/mode/c_cpp");
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
    });
}

function changeLanguage() {

    let language = $("#languages").val();

    if(language == 'c' || language == 'cpp')editor.session.setMode("ace/mode/c_cpp");
    else if(language == 'java')editor.session.setMode("ace/mode/java");
    else if(language == 'python3')editor.session.setMode("ace/mode/python");
    else if(language == 'js')editor.session.setMode("ace/mode/javascript");
}

function btnLoading(elem) {
    $(elem).attr("data-original-text", $(elem).text()); // <-use .text() instead of .html()
    $(elem).prop("disabled", true);
    $(elem).html('<span class="spinner-border spinner-border-sm align-middle" aria-hidden="true" role="status"></span> Running...');
}

function btnReset(elem) {
    $(elem).prop("disabled", false);
    $(elem).text($(elem).attr("data-original-text"));
}



async function executeCode(val) {

    try {
        btnLoading(val); // disable button and create a Running... button text

        $(".output").text(""); //clearing the console


        let resp = await fetch('https://codejudge.geeksforgeeks.org/submit-request', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Origin': 'https://ide.geeksforgeeks.org',
                'Referer': 'https://ide.geeksforgeeks.org/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            },
            body: JSON.stringify({
                'language': $("#languages").val(),
                'code': editor.getSession().getValue(),
                'input': document.getElementById("inp").value,  
                'save': false
            })
        });
    
        let res = await resp.json();
        //alert(res.submission_id);

        console.log("fetching..");
        let opt = await getResult(res);

        let model = await opt.json();

        while(model.status=='in-queue'){
            opt = await getResult(res);
            model = await opt.json();
            console.log("fetching..");
        }

        if(model.errorCode==""){
            //document.getElementById("exec").disabled = false;
            //alert("insideopt");
            $(".output").text(model.output)
        }
        else if(model.rntError!="" && model.rntError!=undefined){
            //document.getElementById("exec").disabled = false;
            //alert("insiddere");
            $(".output").text(model.rntError)
        }
        else{
            //document.getElementById("exec").disabled = false;
            //alert("inside ce");
            $(".output").text(model.cmpError)
        }

        if(model.output!="" && model.output!=undefined){
            //alert("insideopt");
            $(".output").text(model.output)
        }


        btnReset(val); // restore original button state



        // alert("error code");
        // alert(model.errorCode);
        
        // alert(model.status);
        // alert("opt");
        // alert(model.output);
        // alert("error");
        // alert(model.cmpError);
        // console.log(model);

        // let result = await getResult.json();
        // console.log(result);
        // alert(result.status);
        // alert(result.output);




        // $.ajax({

        //     url: "/ide/app/compiler.php",

        //     method: "POST",

        //     data: {
        //         language: $("#languages").val(),
        //         code: editor.getSession().getValue()
        //     },

        //     success: function(response) {
        //         $(".output").text(response)
        //     }
        // })
    } catch (error) {
        btnReset(val);
        alert("No Network!");
    }
}



async function getResult(res){
    await waitforme(2000);
    return await fetch('https://codejudge.geeksforgeeks.org/get-status/'+res.submission_id, {
    headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Origin': 'https://ide.geeksforgeeks.org',
        'Referer': 'https://ide.geeksforgeeks.org/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    }
});
}

function waitforme(millisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, millisec);
    })
}