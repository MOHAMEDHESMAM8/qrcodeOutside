
const express = require("express");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { title } = require("process");
const PORT = process.env.PORT || 1337;
const app = express();
const creds = require('./credentials.json');
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
const { google } = require("googleapis");
const cookieParser =require("cookie-parser");
const { testing } = require("googleapis/build/src/apis/testing");
const { cp } = require("fs");
app.use(cookieParser())
const { table } = require("console");
const path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const path = require('path');
const creds = require(path.join(__dirname, 'credentials.json'));


app.get("/attendanc e", async(req, res) => {

  if(!req.cookies.month){
      const auth = new google.auth.GoogleAuth({
        credentials: creds,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
      });
      // Create client instance for auth
      const client = await auth.getClient();
      const googleSheets = google.sheets({ version: "v4", auth: client });
      const spreadsheetId = "1Z0hwTM252VIsQG12D40jwlF20tDKwmIABipbtA4mxIU";
      const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "months!A2:A",
      });
      data = getRows.data
      var djoin = data.values.join().split(",")
      
      res.cookie("month",djoin,{maxAge:1800000});
      let ejsdata ={
        month : djoin
      }
      res.render("index",ejsdata);
  }else{
    let ejsdata ={
      month : req.cookies.month
    }
    res.render("index",ejsdata);
  }

});

app.get("/", (req, res) => {
  let data ={
    error :""
  }
  res.render("login",data);
});
app.get("/online", async (req, res) => {
  if(!req.cookies.online){
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    // Create client instance for auth
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = "1Z0hwTM252VIsQG12D40jwlF20tDKwmIABipbtA4mxIU";
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "months!D2:D20",
    });
    data = getRows.data
    var djoin = data.values.join().split(",")
    
    res.cookie("online",djoin,{maxAge:1800000});
    let ejsdata ={
      online : djoin
    }
    res.render("online",ejsdata);
}else{
  let ejsdata ={
    online : req.cookies.online
  }
  res.render("online",ejsdata);
}
});
app.post("/attendance", async (req, res) => {
  try {
    // Authenticate Google Sheets API
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = "1Z0hwTM252VIsQG12D40jwlF20tDKwmIABipbtA4mxIU";

    // Extract request body data
    const { event, json_input, time } = req.body;
    const { code } = JSON.parse(json_input);

    console.log(`Code: ${code}`);

    // Fetch both row and column data concurrently
    const [rowsResponse, columnResponse] = await Promise.all([
      googleSheets.spreadsheets.values.get({
        spreadsheetId,
        range: "حضور الشهر!A3:A",
      }),
      googleSheets.spreadsheets.values.get({
        spreadsheetId,
        range: `months!B${event}`,
      }),
    ]);

    // Find row index
    const rowData = rowsResponse.data.values?.flat() || [];
    const rowIndex = rowData.findIndex(row => row.trim() === code.trim()) + 3;
    console.log(`Row index: ${rowIndex}`);

    // Get column name
    const column = columnResponse.data.values?.[0]?.[0];
    console.log(`Column: ${column}`);

    if (!column || rowIndex < 3) {
      return res.status(400).json({ error: "Invalid code or event data" });
    }

    // Calculate values for update
    const lateScore = calculat(time);
    const lateCol = getlatecol(column);
    const range = `حضور الشهر!${column}${rowIndex}:${lateCol}`;

    // Update attendance
    await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      resource: { values: [["حضر", lateScore]] },
    });

    // Render response
    res.render("index", { month: req.cookies.month });

  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).render("error", { 
        message: "يرجي اغلاق الابلكيشن واعادة المحاولة من جديد من مرة اخر، او التواصل مع عبدالحميد لردا اسرع وشكرا <br> ادارة التدريب تحيكم"
    });

  }
});




app.post("/online", async (req, res) => {
  var table = req.body.table;

  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  // Create client instance for auth
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const spreadsheetId = "1Z0hwTM252VIsQG12D40jwlF20tDKwmIABipbtA4mxIU";
  const code = req.body.code;
  const time = req.body.time;
  const meeting = req.body.meeting;


  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "حضور الشهر!A3:A",
  });
  data = getRows.data
  var djoin = data.values.join().split(",")

  const get_row = djoin.indexOf(code) + 3
  const getColum = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,  
    range: "months!E"+meeting
  });
  const colum =getColum.data.values[0][0]
  const latescore = calculat(time)
  const lateCol = getlatecol(colum)
    // update the value  
    await googleSheets.spreadsheets.values.update({
      auth,
    spreadsheetId,
      range: 'حضور الشهر!'+colum+ get_row,
      valueInputOption: 'USER_ENTERED',
      resource :{
        values: [ ["حضر",latescore] ]
      }   
    }); 
  
  let ejsdata ={
    online : req.cookies.online
  }
  res.render("online",ejsdata);
});
 

app.post("/teamdata", async (req, res) => {
  if(req.cookies.team){
    res.status(200).send({ codes : req.cookies.team });
  }else{
       
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    // Create client instance for auth
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = "1Z0hwTM252VIsQG12D40jwlF20tDKwmIABipbtA4mxIU";

    var currentRange  ;
    var team= req.body.code;
    if(team == 1){
      currentRange ="data-team!A3:C";
    }else if(team == 2){
      currentRange ="data-team!E3:G";
    }else if(team == 3){
      currentRange ="data-team!I3:K";
    }else if(team == 4){
      currentRange ="data-team!M3:O";
    }else if(team == 5){
      currentRange ="data-team!Q3:S";
    }


    const getdata = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: currentRange ,
    });
    codes = getdata.data.values
    console.log(codes)
    res.cookie("team",codes,{maxAge:1800000});

    res.status(200).send({ codes : codes });

  }
});
app.post("/", async (req, res) => {
 
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  // Create client instance for auth

  const client = await auth.getClient();
  var usernme = req.body.username ;
  const userpassword= req.body.userpassword;

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const spreadsheetId = "1Z0hwTM252VIsQG12D40jwlF20tDKwmIABipbtA4mxIU";
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "LoginData!A:A",
  });

  var djoin = getRows.data.values.join().split(",");
 
  const get_row = djoin.indexOf(usernme.toLowerCase()) 


  const getpasswords = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "LoginData!B:B",
  });
  const passwords = getpasswords.data
  var passwordjoin = passwords.values.join().split(",")
  const password = passwordjoin[get_row]
    if (userpassword == password ){
      res.redirect("/attendance");
    }else {
    let data ={
      error :"لقد ادخلت بيانات خاطيء"
    }
    res.render("login",data);
  }

});



app.listen(PORT, (req, res) => console.log("running on 1337"));


function calculat(time){
  var counter = 0
  if(time<30 & time>10){
    counter += (time/10)*0.5
  }else if(time==30){
    counter += 2
  }else if(time>30){
    counter += 2
    var newtime= time- 30
    counter += (newtime/5)*0.5
  }else{
    counter =0 
  }
 if(counter>=5){
  return 5;
 }else{
  return counter
 }
};
function getlatecol(alph){
  alphatic=['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'aa','ab','ac','ad','ae','af','ag','ah','ai','aj','ak','al', 'am', 'an', 'ao', 'ap', 'aq', 'ar', 'as', 'at', 'au', 'av', 'aw', 'ax', 'ay', 'az',];
  current = alphatic.indexOf(alph.toLowerCase())
  return alphatic[current+1]
}











