// ==UserScript==
// @name        SC_Colour_My_Task_View
// @namespace   johdo10-ca.com
// @description Applies colors to various fields in the Task View
// @version     0.4
// @grant none
// @include		https://ca.my.salesforce.com/00T*
// @exclude		https://ca.my.salesforce.com/00Ta*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require     http://rawgit.com/datejs/Datejs/master/build/date.js
//   for US date format, use http://rawgit.com/datejs/Datejs/master/build/date.js
//   for AU date format, use http://rawgit.com/datejs/Datejs/master/build/date-en-AU.js 
//   official DateJS site: https://github.com/datejs/Datejs
//   doc: https://code.google.com/archive/p/datejs/wikis/APIDocumentation.wiki
//   doc: https://github.com/datejs/Datejs/blob/master/README.md
// ==/UserScript==
//
// Release Notes:
//  0.4   - Don Johnson: Initial Release and testing
//
//   ***********************
//   *** Program Options ***
//   ***********************
// Each column eligible for testing is listed below, along with values needed to test, print diagnostics, and identify it.
// Change the "test" value to 1 to test/colorize this column, or to 0 to not test the column.
// Do not change the logg or colname values unless you are instructed to do so.
var columns = {};
    columns.Type     = {test:1,   logg:0, colname:"TASK_TYPE" };
    columns.Subject  = {test:1,   logg:0, colname:"TASK_SUBJECT" };
    columns.Assigned = {test:1,   logg:0, colname:"CORE_USERS_FULL_NAME"};
    columns.Due      = {test:1,   logg:0, colname:"00Na000000Arhfs"};
    columns.AAlias   = {test:0,   logg:0, colname:"CORE_USERS_ALIAS"};
    columns.Status   = {test:0,   logg:0, colname:"TASK_STATUS"};
    columns.SLOTimer = {test:0,   logg:0, colname:"00Na000000Arhfz"};
    columns.OpenCB   = {test:0,   logg:0, colname:"00Na000000Arhft"};
//
//
// ------------- Column Selection options and color values ----------------
// Please see http://html-color-codes.info/color-names/ for colors to use in the background/foreground values, or
//            http://html-color-codes.info/ to enter the hex values (be sure to use the "#")
//
// Enter values and foreground/background colors for the TYPE column 
var Type_val = ["Callback", "SE Action", "SE Info", "Initial Callback", "Client Follow-up"];
var Type_fg  = ["Black",    "White",     "White",   "Black",            "Black"];
var Type_bg  = ["Yellow",   "RoyalBlue", "Navy",    "#FF4444",          "PaleGreen"];

// Enter values and foreground/background colors for the SUBJECT column 
var Subject_val = ["Call",   "Case Update", "File",   "New Case"];
var Subject_fg  = ["Black",  "Black",       "Black",  "Black"];
var Subject_bg  = ["Yellow", "Yellow",      "Yellow", "#FF4444"];

// Enter values and foreground/background colors for the STATUS column 
var Status_val = ["Open",     "Not Started", "In Progress"];
var Status_fg  = ["Black",    "Black",       "Black"];
var Status_bg  = ["Lavender", "Tomato",      "LightGreen"];

// Enter values and background color for the ASSIGNED TO or ASSIGNED ALIAS column 
var Assigned_val = "Johnson Jr.";    // Enter the lastname value desired for The ASSIGNED TO field (format: lastname,firstname) 
var Assigned_bg  = "PaleTurquoise";
var AAlias_val   = "JOHDO10";        // Enter the PMF ID of the ASSIGNED ALIAS field to select

// Enter background/foreground colors for the DUE DATE (SLO) or SLO Timer column 
var Due_late_bg = "DarkRed";   var Due_late_fg = "White";
var Due_soon_bg = "#FF4444";   var Due_soon_fg = "Black";
    
// Enter background/foreground colors for the OPEN CB column 
var OpenCB_bg  =  "Yellow";    var OpenCB_fg  = "Black";

// 
// =========== Do not change anything below this line ==========

function logmsg(type, msg) {
    if ((type == "Note") || (columns[type].logg === 1)) {
        console.log("%c Colour_My_Task " +type.toUpperCase() + ": "+msg,'background: #E0F8E0; color: Green'); 
    }
}

function column_found(colname) {  
    var c_found = document.querySelector("div.x-grid3-cell-inner.x-grid3-col-" + colname);
    if (typeof c_found !== "undefined") { logmsg("Note", colname + " column Found"); return 1; }
    else                                { logmsg("Note", colname + " column NOT FOUND"); return 0; }    
} 


function check_columns() {
    logmsg("Note","In check_columns"); 
    
    for (var name in columns) {
        if (columns[name].test === 1) {
            if (column_found(columns[name].colname)) {
                $("div.x-grid3-cell-inner.x-grid3-col-"+columns[name].colname).each(function(){
                    var t_text = $(this).text();
                    logmsg(name,t_text);
                    switch (name) {
// ----  TYPE  ------------------------------------------------
                        case "Type": {
                            for (var i_type = 0; i_type < Type_val.length; i_type++) {
                                if (Type_val[i_type] == t_text) { $(this).css({"background-color": Type_bg[i_type], "color": Type_fg[i_type]}); break; }    
                            } break;
                        } 
// ----  SUBJECT ----------------------------------------------
                        case "Subject": {
                            for (var i_subj = 0; i_subj < Subject_val.length; i_subj++) {
                                if (Subject_val[i_subj] == t_text) { $(this).css({"background-color": Subject_bg[i_subj], "color": Subject_fg[i_subj]}); break; }
                            } break;
                        } 
// ----  ASSIGNED----------------------------------------------
                        case "Assigned": {
                            var names = t_text.split(",");
                            if (names[0] == Assigned_val ) {  $(this).closest("TR").css({"background-color": Assigned_bg});  } break;
                        } 
// ----  DUE  -------------------------------------------------
                        case "Due": {
                            if (t_text.length < 8) { logmsg("Note","Due Date Value is invalid: Text("+t_text+") Length("+ t_text.length+")"); }
                            else {                           
                                if (Date.parse(t_text).isBefore(Date.today().setTimeToNow())) { 
                                    $(this).css({"background-color": Due_late_bg, "color": Due_late_fg}); }
                                else if (Date.parse(t_text).isBefore(Date.today().setTimeToNow().addHours(1))) { 
                                    $(this).css({"background-color": Due_soon_bg, "color": Due_soon_fg}); }
                            }
                            break;
                        } 
// ----  AALIAS  -(Assigned Alias)-----------------------------
                        case "AAlias": {
                            if (AAlias_val == t_text) {  $(this).closest("TR").css({"background-color": Assigned_bg}); } break;
                        } 
// ----  STATUS  ----------------------------------------------
                        case "Status": {
                            for (var i_stat = 0; i_stat < Status_val.length; i_stat++) {
                                if (Status_val[i_stat] == t_text) {$(this).css({"background-color": Status_bg[i_stat], "color": Status_fg[i_stat]}); break; }
                            } break; 
                        } 
// ----  SLOTimer  --------------------------------------------
                        case "SLOTimer": {
                            var slo_values = t_text.split(" ");
                            if (slo_values[0].substring(0,1) == "-")                 { $(this).css({"background-color": Due_late_bg, "color": Due_late_fg}); }
                            else if ((slo_values[0] === 0) && (slo_values[2] === 0)) { $(this).css({"background-color": Due_soon_bg, "color": Due_soon_fg}); }
                            break;
                        } 
// ----  OpenCB  ----------------------------------------------
                        case "OpenCB": {
                            if (t_text == "Y")  { $(this).css({"background-color": OpenCB_bg, "color": OpenCB_fg}); }
                            break;
                        }                           
// ----------------------------------------------------------                           
                    }   // End of switch (name)
                });     // End of column .each.function()
            }           // End of if column_found
        }   // End of if (columns[name].test === 1) 
    }       // End of loop of each name in columns
}   //  End of check_columns function



logmsg ("Note", "Script starting");
check_columns();
logmsg ("Note", "Script ending");


// Set refresh interval to 30 seconds
 setInterval(function(){check_columns();}, 30000);