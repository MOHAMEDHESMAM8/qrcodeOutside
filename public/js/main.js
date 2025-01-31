$(".team-select").on('change', function (e) {
  e.preventDefault();
 $('.tainee').hide();;
  $.ajax({
      url: "/teamdata",
      type: "POST",
      data: {
          code: $(this).find(":selected").val(),
      },
      success: function(data){
          for (var i = 0; i < data.codes.length; i++) {
            var option = document.createElement("option");
            option.value = data.codes[i][0];
            option.text = data.codes[i][1];
            $(".trainee-select")[0].appendChild(option);
        }
        $('.tainee').show();;

      }
  });
});


const scanner = new Html5QrcodeScanner('reader', { 
    // Scanner will be initialized in DOM inside element with id of 'reader'
    qrbox: {
        width: 250,
        height: 250,
    },  // Sets dimensions of scanning box (set relative to reader element width)
    fps: 30, // Frames per second to attempt a scan
});


scanner.render(success);

function success(result) {
  document.querySelector(".qr-form").style.display ="inline";
  document.getElementById("json_input").value = result;
  const jsonobj = JSON.parse(result);
  const name = jsonobj.name;
  document.getElementById("traineename").value = name;
  document.getElementById("reader").style.display = "none";


}





// tabs 
let tabs = document.querySelectorAll(".navbar-nav li");
let tabsArray = Array.from(tabs);
let divs = document.querySelectorAll(".content > div");
let divsArray = Array.from(divs);


document.querySelectorAll("#reader img")[0].style.display ="none";
document.querySelector("#reader ").style.border ="none";
document.querySelector("#reader").style.padding ="20px";
document.querySelector("#html5-qrcode-anchor-scan-type-change").innerHTML= "";





// function addnew(){
//     var code =  document.getElementById("code").value; 
//     var time = document.getElementById("time").value;
//     var meeting = document.getElementById("meeting");
//     var table = document.querySelector("table" );
//     var row = table.insertRow(-1);
//     var cell0 = row.insertCell(0);
//     var cell1 = row.insertCell(1);
//     var cell2 = row.insertCell(2);
//     var cell3 = row.insertCell(3);
//     cell0.setAttribute("class", "num");
//     cell1.innerHTML = code;
//     cell2.innerHTML = time;
//     cell3.innerHTML = meeting.options[meeting.selectedIndex].text;
//     var lastrow = document.querySelectorAll(".num");
//     cell0.innerHTML=1
//     // if(lastrow.length >=2){
//     //   cell0.innerHTML = parseInt(lastrow[lastrow.length].innerHTML)+1;
//     //   console.log(lastrow[lastrow.length-1].innerHTML)
//     // }
//     document.getElementById("hiddeninput" ).value = document.querySelector("table tbody" ).innerHTML;
//     console.log(document.querySelector("table tbody" ).innerHTML)

// }



