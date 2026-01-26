var arrValUtility = { IsCompleteLoadData: true };
var boolIsCheckJapanseNumber = false; // Bien dung de kiem tra khi user nhap so tieng nhat.
var boolIsCheckVietnameseText = false; // Bien dung de kiem tra khi user nhap chu tieng viet.
var arrayCharacterJapanese = []; // Mang chua cac ki tu Japanese can convert sang English
var colorSortOrder_1 = '#cafdcac4';//xanh nhạt
var colorSortOrder_2 = '#FFF';//trắng
var colorSortOrder_3 = '#f2f2f2';//xám nhạt
var colorSortOrder_4 = '#fbd4b4';//màu cam nhạt 
var colorpickerSuite = '';
var gridOptionsTraceability, ListDataFull, ListRowChild, gridApi, pagerApi;//khai báo các biến quan trọng trong lưới aggrid
var sortData = { sortColumnEventActual: '', sortOrderEventActual: '' }
//set thông báo 
const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});
function NotificationToast(icon, title) {
    setTimeout(function () {
        Toast.fire({ icon: icon, title: title });
    }, 1000);
}
async function ToastConfirm(
    text = "Are you sure?"
) {
    let msg = arrMsg.key_bancochacchan;
    const result = await Swal.fire({
        msg,
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: arrMsg.key_yes,
        cancelButtonText: arrMsg.key_cancel
    });

    return result.isConfirmed;
}
// Các hằng số cho Traceability
var arrConstant = {
    SortOrder_Lot: 1, // Order
    SortOrder_Agent: 2,// Agent
    SortOrder_Farm: 3,// Farmer
    isCheckAll: false,// Farmer
    isLoadFirst: true,// Farmer
    page: 1,// Farmer
    pageSize: 20,// Farmer
}
var arrParentIds = [];


arrayCharacterJapanese.push("０", "１", "２", "３", "４", "５", "６", "７", "８", "９", "．",
    " ", ">", "_", "ｑ", "ｗ", "ｅ", "ｒ", "ｔ", "ｙ", "ｕ", "ｉ", "ｏ", "ｐ", "ａ", "ｓ", "ｄ", "ｆ", "ｇ", "ｈ", "ｊ", "ｋ", "ｌ", "ｚ",
    "ｘ", "ｃ", "ｖ", "ｂ", "ｎ", "ｍ", "‘", "～", "！", "＠", "＃", "＄", "％", "＾", "＆", "＊", "（", "）", "＿", "＋",
    "；", "：", "’", "”", "，", "＜", "*", "＞", "／", "？", "/", "＝", "［", "｛", "］", "｝", "｜", "+", "￥", "，", "－",
    "ん", "つ", "きゃ", "きゅ", "きょ", "にゃ", "にゅ", "にょ", "しゃ", "し", "しゅ", "しょ", "ち", "ちゃ", "ちゅ", "ちょ",
    "ひゃ", "ひゅ", "ひょ", "みゃ", "みゅ", "みょ", "りゃ", "りゅ", "りょ", "ぎゃ", "ぎゅ", "ぎょ", "びゃ", "びゅ", "びょ",
    "ぴゃ", "ぴゅ", "ぴょ", "じゃ", "じゅ", "じょ", "ば", "だ", "が", "は", "か", "ま", "な", "ぱ", "ら", "さ", "た", "わ",
    "や", "ざ", "あ", "べ", "で", "げ", "へ", "け", "め", "ね", "ぺ", "れ", "せ", "て", "ゑ", "ぜ", "え", "び", "ぎ", "ひ",
    "き", "み", "に", "ぴ", "り", "ゐ", "じ", "い", "ぼ", "ど", "ご", "ほ", "こ", "も", "の", "ぽ", "ろ", "そ", "と", "を",
    "よ", "ぞ", "お", "ぶ", "ぐ", "ふ", "く", "む", "ぬ", "ぷ", "る", "す", "ゆ", "ず", "う", "ゔ", "ぢ", "づ", "ン", "シ",
    "チ", "ツ", "キャ", "キュ", "キョ", "ニャ", "ニュ", "ニョ", "シャ", "シュ", "ショ", "チャ", "チュ", "チョ", "ヒャ", "ヒュ",
    "ヒョ", "ミャ", "ミュ", "ミョ", "リャ", "リュ", "リョ", "ギャ", "ギュ", "ギョ", "ビャ", "ビュ", "ビョ", "ピャ", "ピュ", "ピョ",
    "ジャ", "ジュ", "ジョ", "バ", "ダ", "ガ", "ハ", "カ", "マ", "ナ", "パ", "ラ", "サ", "タ", "ワ", "ヤ", "ザ", "ア", "ベ",
    "デ", "ゲ", "ヘ", "ケ", "メ", "ネ", "ペ", "レ", "セ", "テ", "ヱ", "ゼ", "エ", "ビ", "ギ", "ヒ", "キ", "ミ", "ニ", "ピ",
    "リ", "ヰ", "ジ", "イ", "ボ", "ド", "ゴ", "ホ", "コ", "モ", "ノ", "ポ", "ロ", "ソ", "ト", "ヲ", "ヨ", "ゾ", "オ", "ブ",
    "グ", "フ", "ク", "ム", "ヌ", "プ", "ル", "ス", "ユ", "ズ", "ウ", "oo", "ou", "uu", "é", "ū", "ō", "n", "tsu", "kya",
    "kyu", "kyo", "んya", "んyu", "んyo", "sha", "shi", "shu", "sho", "chi", "cha", "chu", "cho", "hya", "hyu", "hyo",
    "mya", "myu", "myo", "rya", "ryu", "ryo", "gya", "gyu", "gyo", "bya", "byu", "byo", "pya", "pyu", "pyo", "ja", "ju",
    "jo", "ba", "da", "ga", "ha", "ka", "ma", "んa", "pa", "ra", "sa", "ta", "wa", "ya", "za", "a", "be", "de", "ge", "he",
    "ke", "me", "んe", "pe", "re", "se", "te", "we", "ze", "e", "bi", "gi", "hi", "ki", "mi", "んi", "pi", "ri", "wi", "ji",
    "i", "bo", "do", "go", "ho", "ko", "mo", "んo", "po", "ro", "so", "to", "wo", "yo", "zo", "o", "bu", "gu", "fu", "ku",
    "mu", "んu", "pu", "ru", "su", "yu", "zu", "u", "v", "゜", "゛", "れ", "け", "め", "る", "ね");

function replaceButtonText(buttonId, text) {
    if (document.getElementById) {
        var button = document.getElementById(buttonId);
        if (button) {
            if (button.childNodes[0]) {
                button.childNodes[0].nodeValue = text;
            }
            else if (button.value) {
                button.value = text;
            }
            else //if (button.innerHTML)
            {
                button.innerHTML = text;
            }
        }
    }
}

// Replaces all instances of the given substring.
String.prototype.replaceAll = function (
    strTarget, // The substring you want to replace
    strSubString // The string you want to replace in.
    ) {
    var strText = this;
    var intIndexOfMatch = strText.indexOf(strTarget);

    // Keep looping while an instance of the target string
    // still exists in the string.
    while (intIndexOfMatch != -1) {
        // Relace out the current instance.
        strText = strText.replace(strTarget, strSubString)

        // Get the index of any next matching substring.
        intIndexOfMatch = strText.indexOf(strTarget);
    }

    // Return the updated string with ALL the target strings
    // replaced out with the new substring.
    return (strText);
}


// Validate Date Format
function isDateFormat(value) {
    try {
        //Change the below values to determine which format of date you wish to check. It is set to dd/mm/yyyy by default.
        var DayIndex = 2;
        var MonthIndex = 1;
        var YearIndex = 0;

        value = value.replace(/-/g, "/").replace(/\./g, "/");
        var SplitValue = value.split("/");
        var ret = true;
        if (SplitValue.length > 3) {
            ret = false;
        }
        if (!(SplitValue[DayIndex].length == 1 || SplitValue[DayIndex].length == 2)) {
            ret = false;
        }
        if (ret && !(SplitValue[MonthIndex].length == 1 || SplitValue[MonthIndex].length == 2)) {
            ret = false;
        }
        if (ret && SplitValue[YearIndex].length != 4) {
            ret = false;
        }
        if (ret) {
            var Day = parseInt(SplitValue[DayIndex], 10);
            var Month = parseInt(SplitValue[MonthIndex], 10);
            var Year = parseInt(SplitValue[YearIndex], 10);

            if (ret = ((Year > 1900) && (Year < 3000))) {
                if (ret = (Month <= 12 && Month > 0)) {

                    var LeapYear = (((Year % 4) == 0) && ((Year % 100) != 0) || ((Year % 400) == 0));

                    if (ret = Day > 0) {
                        if (Month == 2) {
                            ret = LeapYear ? Day <= 29 : Day <= 28;
                        }
                        else {
                            if ((Month == 4) || (Month == 6) || (Month == 9) || (Month == 11)) {
                                ret = Day <= 30;
                            }
                            else {
                                ret = Day <= 31;
                            }
                        }
                    }
                }
            }
        }
        return ret;
    }
    catch (e) {
        return false;
    }
}

// Validation Email
function ValidateEmail(x) {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (x.indexOf(" ") > -1)
        return false;
    return reg.test(x);
}

// Validation Phone: Chi duoc nhap So, Dau Gach.
function ValidatePhone(x) {
    var ValidateChar = /^[0-9\-]+$/;

    if (x.trim() == "") {
        return true;
    }

    if (x.match(ValidateChar)) {
        return true;
    }
    else {
        return false;
    }
}

// Validation Code: Chi duoc nhap So, Dau Gach va dau gach duoi.
function ValidateCode(x) {

    var ValidateSpecialChar = /^[0-9\_\-]+$/;

    if (x.match(ValidateSpecialChar)) {
        return true;
    }
    else {
        return false;
    }
}

// Validation cac ki tu dac biet: Chi duoc nhap cac ki tu: chu (Hoa, thuong), So, ki tu gach duoi _
function ValidateSpecialCharacter(x) {
    var ValidateSpecialChar = /^[A-Za-z0-9\_\-]+$/;

    if (x.match(ValidateSpecialChar)) {
        return true;
    }
    else {
        return false;
    }
}

// Validation cac ki tu dac biet: Chi duoc nhap cac ki tu: chu (Hoa, thuong), So, ki tu gach duoi _
//Dung cho Key
function ValidateSpecialCharacterForId(x) {
    var ValidateSpecialChar = /^[A-Za-z0-9\_]+$/;

    if (x.match(ValidateSpecialChar)) {
        return true;
    }
    else {
        return false;
    }
}

//Validation cac ki tu dac biet (Invoice): Chi duoc nhap cac ki tu: chu(Hoa, thuong), So
function ValidateSpecialCharacterInvoiceForId(x) {
    var ValidateSpecialChar = /^[A-Za-z0-9]+$/;

    if (x.match(ValidateSpecialChar)) {
        return true;
    }
    else {
        return false;
    }
}
//Ham kiem tra nhap ky tu dac biet cho Invoice
function ValidateSpecialCharacterInvoice_Key(e) {
    return e.which == 8 ? true : ValidateSpecialCharacterInvoiceForId(e.key);
}

// Validation cac ki tu dac biet: Chi duoc nhap cac ki tu: chu (Hoa, thuong), So, ki tu gach duoi _
function ValidateSpecialCharacterCompanyOmitNames(x) {
    var ValidateSpecialChar = /[!@#$%\^&*(){}[\]<>?\/|+]/;  // /^[\<\>\~\!\@\#\$\%\^\&\/\=\;\+\-\?\.\{\}\[\]\||\\\*]/;

    if (x.match(ValidateSpecialChar)) {
        return false;
    }
    else {
        return true;
    }
}
// End Validation cac ki tu dac biet
// Validation cac ki tu dac biet: Chi duoc nhap cac ki tu: chu (Hoa, thuong), So, ki tu gach duoi _
function ValidateKeySpecialCharacter_Project(e) {
    var text = String.fromCharCode(e.which);
    var ValidateSpecialChar = /^[A-Za-z0-9\_\-]+$/;
    if (text.match(ValidateSpecialChar) || (e.keyCode == 8 || e.keyCode == 46 || (e.keyCode == 37 && text != "%") || (e.keyCode == 39 && text != "'"))) {
        return true
    }
    else {
        return false;
    }
}
function ValidateIsNum_Key(e) {
    var text = String.fromCharCode(e.which);
    var ValidateSpecialChar = /^[0-9\.]+$/;
    if (text.match(ValidateSpecialChar) || (e.keyCode == 8 || e.keyCode == 46 || (e.keyCode == 37 && text != "%") || (e.keyCode == 39 && text != "'"))) {
        return true
    }
    else {
        return false;
    }
}
function ValidateIsNum(x) {
    var ValidateSpecialChar = /^[0-9\.]+$/;
    if (x.match(ValidateSpecialChar)) {
        return true;
    }
    else {
        return false;
    }
}
function ValidateIsNumNotDot(x) {
    var ValidateSpecialChar = /^[0-9]+$/;
    if (x.match(ValidateSpecialChar)) {
        return true;
    }
    else {
        return false;
    }
}
function ValidateSpecialCharacter_Project(x) {
    var ValidateSpecialChar = /^[A-Za-z0-9\_\-\s]+$/;
    if (x.match(ValidateSpecialChar)) {
        return true;
    }
    else {
        return false;
    }
}
function ValidateIsDate(e) {
    var text = String.fromCharCode(e.which);
    var ValidateSpecialChar = /^[0-9\/\-]+$/;
    if (text.match(ValidateSpecialChar)) {
        return true
    }
    else {
        return false;
    }
}
// Doan code chan nut Enter
document.onkeypress = stopRKey;

function stopRKey(evt) {
    var evt = (evt) ? evt : ((event) ? event : null);
    var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
    if ((evt.keyCode == 13) && (node.type == "text")) { return false; }
}

function multiLineHtmlEncode(value) {
    var lines = value.split(/\r\n|\r|\n/);
    for (var i = 0; i < lines.length; i++) {
        lines[i] = htmlEncode(lines[i]);
    }
    return lines.join('\r\n');
}

function htmlEncode(value) {
    if (value) {
        return jQuery('<div/>').text(value).html();
    } else {
        return '';
    }
}
function htmlDecode(value) {
    if (value) {
        return $('<div/>').html(value).text();
    } else {
        return '';
    }
}
function htmldecode(value) {
    if (value) {
        value.replace(/&amp;/g, '&');
    } else {
        return '';
    }
}

//-----------MAKING THREAD - START --------------
//loops through an array in segments
var threadedLoop = function () {
    var self = this;

    //holds the threaded work
    var thread = {
        work: null,
        wait: null,
        index: 0,
        //total: array.length,
        finished: false
    };

    //set the properties for the class
    //this.collection = array;
    this.finish = function () { };
    this.action = function () { throw "You must provide the action to do for each element"; };
    this.interval = 1;

    //set this to public so it can be changed
    //var chunk = parseInt(thread.total * .005);
    //this.chunk = (chunk == NaN || chunk == 0) ? thread.total : chunk;

    //end the thread interval
    thread.clear = function () {
        window.clearInterval(thread.work);
        window.clearTimeout(thread.wait);
        thread.work = null;
        thread.wait = null;
    };

    //checks to run the finish method
    thread.end = function () {
        if (thread.finished) { return; }
        self.finish();
        thread.finished = true;
    };

    //set the function that handles the work
    thread.process = function () {
        //if (thread.index >= thread.total) { return false; }

        //thread, do a chunk of the work
        //        if (thread.work) {
        //            var part = Math.min((thread.index + self.chunk), thread.total);
        //            while (thread.index++ < part) {
        //                self.action(self.collection[thread.index], thread.index, thread.total);
        //            }            
        //        }
        //        else {

        //            //no thread, just finish the work
        //            while (thread.index++ < thread.total) {
        //                self.action(self.collection[thread.index], thread.index, thread.total);
        //            }
        //        }

        //check for the end of the thread
        //        if (thread.index >= thread.total) {
        //            thread.clear();
        //            thread.end();
        //        }

        self.action();

        // Finished action
        thread.clear();
        thread.end();

        //return the process took place
        return true;

    };

    //set the working process
    self.start = function () {
        thread.finished = false;
        thread.index = 0;
        thread.work = window.setInterval(thread.process, self.interval);
    };

    //stop threading and finish the work
    self.wait = function (timeout) {

        //create the waiting function
        var complete = function () {
            thread.clear();
            thread.process();
            thread.end();
        };

        //if there is no time, just run it now
        if (!timeout) {
            complete();
        }
        else {
            thread.wait = window.setTimeout(complete, timeout);
        }
    };

};

//-----------MAKING THREAD - END ----------------

var isUserAnswered = true;

// Show dialog with OK button: Information, warning, Error - START
function showDialog(msg, title) {

    // Reset answered flag
    isUserAnswered = false;

    // Define button OK
    var buttonOpts = {};
    buttonOpts['OK'] = function () {
        isUserAnswered = true;
        $(this).dialog("close");
    };

    var $dialog = $('<div title="' + title + '"></div>')
                    .html(msg)
                    .dialog({
                        modal: true,
                        autoOpen: false,
                        buttons: buttonOpts,
                        close: function () { isUserAnswered = true; }
                    });

    // Show dialog
    $dialog.dialog('open');
}


//Tai
function showDialogs(id, msg, titles) {

    // Reset answered flag
    isUserAnswered = false;

    // Define button OK
    var buttonOpts = {};
    buttonOpts['OK'] = function () {
        isUserAnswered = true;
        $(this).dialog("close");
    };

    $(id).html(msg)
                    .dialog({
                        modal: true,
                        title: titles,
                        autoOpen: false,
                        buttons: buttonOpts,
                        close: function () { isUserAnswered = true; }
                    });

    // Show dialog
    $(id).dialog('open');
}
// Show dialog with OK button: Information, warning, Error - END

// Show dialog with OK button: Information, warning, Error
function showConfirmDialog(msg, title, yesFunct, noFunct) {

    // Reset answered flag
    isUserAnswered = false;

    // Define button YES
    var buttonOpts = {};
    buttonOpts[CtrYes()] = function () {
        isUserAnswered = true;
        if (null != yesFunct) {
            yesFunct();
        }
        $(this).dialog("close");
    };

    // Define button NO
    buttonOpts[CtrNo()] = function () {
        isUserAnswered = true;
        if (null != noFunct) {
            noFunct();
        }
        $(this).dialog("close");
    };

    var $dialog = $('<div title="' + title + '"></div>')
                    .html(msg)
                    .dialog({
                        modal: true,
                        autoOpen: false,
                        buttons: buttonOpts,
                        open: function () {
                            $('.ui-dialog-buttonpane')
                                    .find('button:contains("' + CtrNo() + '")')
                                    .prepend('<span style="float:left; margin-top: 3px;" class="ui-icon ui-icon-cancel"></span>');
                            $('.ui-dialog-buttonpane')
                                    .find('button:contains("' + CtrYes() + '")')
                                    .prepend('<span style="float:left; margin-top: 3px;" class="ui-icon ui-icon-disk"></span>');
                        },
                        close: function () {
                            CloseDialog();
                        }
                    });

    // Show dialog
    $dialog.dialog('open');
}

function showConfirmDialog_Close(msg, title, yesFunct, noFunct, closeFunct) {

    // Reset answered flag
    isUserAnswered = false;

    // Define button YES
    var buttonOpts = {};
    buttonOpts[CtrYes()] = function () {
        isUserAnswered = true;
        if (null != yesFunct) {
            yesFunct();
        }
        $(this).dialog("close");
    };

    // Define button NO
    buttonOpts[CtrNo()] = function () {
        isUserAnswered = true;
        if (null != noFunct) {
            noFunct();
        }
        $(this).dialog("close");
    };

    var $dialog = $('<div title="' + title + '"></div>')
                    .html(msg)
                    .dialog({
                        modal: true,
                        autoOpen: false,
                        buttons: buttonOpts,
                        open: function () {
                            $('.ui-dialog-buttonpane')
                                    .find('button:contains("' + CtrNo() + '")')
                                    .prepend('<span style="float:left; margin-top: 3px;" class="ui-icon ui-icon-cancel"></span>');
                            $('.ui-dialog-buttonpane')
                                    .find('button:contains("' + CtrYes() + '")')
                                    .prepend('<span style="float:left; margin-top: 3px;" class="ui-icon ui-icon-disk"></span>');
                        },
                        close: function () {
                            if (null != closeFunct) {
                                closeFunct();
                            }
                        }
                    });

    // Show dialog
    $dialog.dialog('open');
}

function CloseDialog() {
}
// Waiting until user close Dialog to execute func
function ActionAfterDialog(func) {
    var int = window.setInterval(function () {
        if (true == isUserAnswered) {
            func();
            window.clearInterval(int);
        }
    }, 1000);
}

// Convert to Japanese Type with comma:
function ParseMoneyJapan(amount) {
    var delimiter = ","; // replace comma if desired
    var a = amount.split('.', 2)
    var d = a[1];
    var i = parseInt(a[0]);
    if (isNaN(i)) { return ''; }
    var minus = '';
    if (i < 0) { minus = '-'; }
    i = Math.abs(i);
    var n = new String(i);
    var a = [];
    while (n.length > 3) {
        var nn = n.substr(n.length - 3);
        a.unshift(nn);
        n = n.substr(0, n.length - 3);
    }
    if (n.length > 0) { a.unshift(n); }
    n = a.join(delimiter);
    amount = n;
    if (undefined != d) {
        if (d.length > 1) {
            amount = n + '.' + d;
        }
    }

    amount = minus + amount;

    return amount;
}

// Convert date to YYYYMMDD
Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
};

// Convert date to YYYYMMDD
Date.prototype.yyyymmddFormat = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]); // padding
};

// Convert date to YYYYMM
Date.prototype.yyyymmFormat= function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + "/" + (mm[1] ? mm : "0" + mm[0]); // padding
};

// Convert date to yyyyMMddhhmmss
Date.prototype.yyyyMMddhhmmssFormat = function () {
    var yyyy = this.getFullYear().toString();
    var MM = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    var hh = this.getHours().toString();
    var mm = this.getMinutes().toString();
    var ss = this.getSeconds().toString();
    return yyyy + "/" + (MM[1] ? MM : "0" + MM[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + ' ' + (hh[1] ? hh : "0" + hh[0]) + ":" + (mm[1] ? mm : "0" + mm[0]) + ":" + (ss[1] ? ss : "0" + ss[0]); // padding
};
// Convert date to hhmmddMMyyyyFormat
Date.prototype.hhmmddMMyyyyFormat = function () {
	var yyyy = this.getFullYear().toString();
	var MM = (this.getMonth() + 1).toString(); // getMonth() is zero-based
	var dd = this.getDate().toString();
	var hh = this.getHours().toString();
	var mm = this.getMinutes().toString();
	return (hh[1] ? hh : "0" + hh[0]) + ":" + (mm[1] ? mm : "0" + mm[0]) + ' ' + (dd[1] ? dd : "0" + dd[0]) + "/" + (MM[1] ? MM : "0" + MM[0]) + "/" + yyyy; // padding
};

// Convert date to yyyyMMddhhmm
Date.prototype.yyyyMMddhhmmFormat = function () {
    var yyyy = this.getFullYear().toString();
    var MM = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    var hh = this.getHours().toString();
    var mm = this.getMinutes().toString();
    return yyyy + "/" + (MM[1] ? MM : "0" + MM[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + ' ' + (hh[1] ? hh : "0" + hh[0]) + ":" + (mm[1] ? mm : "0" + mm[0]); // padding
};

//VuongLV: Viet ham ho tro bien Date Add Year, Month, Day, Hours, Minutes 2024/12/31
Date.prototype.ToDay = function () {
    return new Date(this.yyyymmddFormat());
};

Date.prototype.AddYear = function (value) {
    let date = new Date(this.getFullYear() + value, this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getMilliseconds());
    if (this.getDate() != date.getDate()) {
        date = new Date(date.getFullYear(), date.getMonth(), 0, this.getHours(), this.getMinutes(), this.getMilliseconds());
    }

    return date;
};

Date.prototype.AddMonth = function (value) {
    let date = new Date(this.getFullYear(), this.getMonth() + value, this.getDate(), this.getHours(), this.getMinutes(), this.getMilliseconds());
    if (this.getDate() != date.getDate()) {
        date = new Date(date.getFullYear(), date.getMonth(), 0, this.getHours(), this.getMinutes(), this.getMilliseconds());
    }

    return date;
};

Date.prototype.AddDay = function (value) {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate() + value, this.getHours(), this.getMinutes(), this.getMilliseconds());
};

Date.prototype.AddHours = function (value) {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours() + value, this.getMinutes(), this.getMilliseconds());
};

Date.prototype.AddMinutes = function (value) {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes() + value, this.getMilliseconds());
};
//VuongLV: Viet ham ho tro bien Date Add Year, Month, Day, Hours, Minutes 2024/12/31 End

function daysBetween(date1, date2) {
    //Get 1 day in milliseconds
    var one_day = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;

    // Convert back to days and return
    return Math.round(difference_ms / one_day);
}


// Set center cho form va doubleclick canh center form
function DragFormCenter(div, isFormJQGrid) {
    var width_div = div.width() / 2;
    var width_window = $(window).width() / 2;
    var height_div = div.height() / 2;
    var height_window = $(window).height() / 2;
    var left_div = 0;
    var top_div = 0;
    if (width_window - width_div > 0) {
        left_div = width_window - width_div;
    }
    if (height_window - height_div > 0) {
        top_div = height_window - height_div;
    }

    if (isFormJQGrid == true) {
        var form = div.find('form');
        if (width_window - width_div < 0) {
            form.css('width', $(window).width() - 10);
        }
        if (height_window - height_div < 0) {
            form.css('height', $(window).height() - (div.height() - form.height()) - 10);
        }
        if ($.isIE == false) {
            div.css({ 'width': 'auto', 'height': 'auto' });
        }
    }

    div.dblclick(function () {
        div.css({ 'left': left_div, 'top': top_div });
    });
    div.css({ 'left': left_div, 'top': top_div });

    $('.ui-widget-overlay').unbind();
}

function ClearWindowSelection(window) {
    if (jQuery.browser.msie == true) { // IE?
        if (document.selection) {
            //alert(document.selection);
            //document.selection.empty();
        }
    }
    else if (jQuery.browser.chrome == true) { // Chrome
        if (window.getSelection().empty) {
            window.getSelection().empty();
        }
    }
    else if (jQuery.browser.mozilla == true) { // Firefox
        if (window.getSelection().removeAllRanges) {
            window.getSelection().removeAllRanges();
        }
    }
}

function PFN_createCookie(name, value, days) {
    if (days) {
        var date = new Date();

        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

        var expires = '; expires=' + date.toGMTString();
    } else {
        expires = '';
    }

    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
}

function PFN_readCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = decodeURIComponent(ca[i]);

        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
}

// Ham dinh nghia khi Change Language
function ChangeLanguage() {
    SaveCurrentInfoPage();
}

// Ham dinh nghia khi click Menu
function CallFunctionClickMenu() {
    DestructionCookie();
}

// function SaveCurrentInfoPage() {
// }

function DestructionCookie() {
}

// Kiem tra trinh duyet dang thao tac
function GetBrowserName() {
    var name = "Unknown";
    if (navigator.userAgent.indexOf("MSIE") != -1) {
        name = "MSIE";
    }
    else if (navigator.userAgent.indexOf("Firefox") != -1) {
        name = "Firefox";
    }
    else if (navigator.userAgent.indexOf("Opera") != -1) {
        name = "Opera";
    }
    else if (navigator.userAgent.indexOf("Chrome") != -1) {
        name = "Chrome";
    }
    else if (navigator.userAgent.indexOf("Safari") != -1) {
        name = "Safari";
    }
    return name;
}

$.isOpera = !!(window.opera && window.opera.version);  // Opera 8.0+
$.isFirefox = CheckBrowser('MozBoxSizing');                 // FF 0.8+
//$.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
$.isSafari = GetBrowserName() == "Safari"
$.isChrome = !$.isSafari && CheckBrowser('WebkitTransform');  // Chrome 1+
$.isIE = false || CheckBrowser('msTransform');  // At least IE6

function CheckBrowser(prop) {
    return prop in document.documentElement.style;
}

function currencyFmatter(el, cellval, opts) {
    if (el != null && !isNaN(el)) {
        var current = formatCurrency(el);
        return current.replace('.00', '');
    }
    return "";
}

//isShowZero: true => Khong hien thi gia tri 0
//isNotShowFormatCurrency: true => Khong hien thi ki tu ￥
function formatCurrency(num, isShowZero, isNotShowFormatCurrency) {
    if (!num || parseFloat(num) == "0") {
        if (isShowZero) return (isNotShowFormatCurrency ? "" : "￥") + "0";
        return "";
    }

    var numOriginal = num.toString();
    num = num.toString().replace("-", "");
    result = '';
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num) || num.split('.').length > 2) {
        num = "0";
        if (!isShowZero) return "";
    }

    var intnumber = num.split('.')[0];
    if (intnumber.length > 3) {
        while (intnumber.length > 3) {
            result = intnumber.substring(intnumber.length - 3) + "," + result;
            intnumber = intnumber.substring(0, intnumber.length - 3);
        }
    }

    result = intnumber + ',' + result;

    if (result.substring(result.length - 1).indexOf(',') > -1) {
        result = result.substring(0, result.length - 1);
    }

    if (result == '') { result = '0'; }

    var float = '';
    if (num.split('.').length == 2) {
        var float = num.split('.')[1];
        if (float.length > 2) {
            float = Math.round(parseFloat(float.substring(0, 2) + '.' + float.substring(2)));
        }
        else if (float.length == 1) {
            float = float + '0';
        }

        if (parseInt(float) != 0) {
            result = result + '.' + float;
        }
    }

    return (isNotShowFormatCurrency ? "" : "￥") + (numOriginal.indexOf("-") > -1 ? "-" : "") + result;
}

function unformatCurrency(cellvalue, options) {
    cellvalue = ParseString(cellvalue);
    return cellvalue.replace("￥", "").replace(/\$|\,/g, '');
}

function formatCurrencyNotOdd(num) { // Format ko So le: Chi lay phan nguyen.
    if (!num || parseFloat(num) == "0") return "";
    if (num < 0) {
        num = parseInt(num); // num = -Math.round(Math.abs(num));//Tam thoi ko su dung lam tron 2 so le
    }
    else {
        num = parseInt(num); // num = Math.round(num);//Tam thoi ko su dung lam tron 2 so le
    }
    return formatCurrency(num);
}

// Format theo cac kieu lam tron: 1:Round, 2:RoundUp, 3:RondDown
//isNotOdd: true=>Ko hien thi so le
function formatCurrencyCustom(num, strSuffixCurrency, isNotOdd) {
    if (ParseDouble(num) == 0) return '';
    if (ParseBool(isNotOdd))
        return formatCurrencyNotOdd(num).replace('￥', '') + strSuffixCurrency;
    return formatCurrency(num).replace('￥', '') + strSuffixCurrency;
}

function RoundCustom(num, intRoundType) { //Lam tron so: 1:Round, 2:RoundUp, 3:RondDown
    if (ParseDouble(num) == 0) return '';
    num = ParseDouble(num);
    if (intRoundType == 1) {
        num = Math.round(num);
    }
    else if (intRoundType == 2) {
        num = (num >= 0 ? Math.ceil(num) : -Math.ceil(Math.abs(num)));
    }
    else if (intRoundType == 3) {
        num = (num >= 0 ? Math.floor(num) : -Math.floor(Math.abs(num)));
    }

    return num;
}

function formatNumber(num) {
    if (!num || parseFloat(num) == "0") return "";
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num))
        num = "0";
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10)
        cents = "0" + cents;
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
        num = num.substring(0, num.length - (4 * i + 3)) + ',' +
              num.substring(num.length - (4 * i + 3));
    if (parseFloat(cents) == 0) {
        return (((sign) ? '' : '-') + num);
    }
    else {
        return (((sign) ? '' : '-') + num + '.' + cents);
    }
}

function unformatNumber(cellvalue, options) {

    return cellvalue.replace(/\$|\,/g, '');
}

function currencyFmatter_Project(e, id) {
    SetNumberEnglishForObject(e, false);
    $(id).val(currencyFmatter(unformatCurrency($(id).val(), ""), "", ""));
}

function currencyFmatterNotOdd(e, id) {
    SetNumberEnglishForObject(e, false);
    $(id).val(formatCurrencyNotOdd(unformatCurrency($(id).val())));
}

function IsNullOrEmpty(object) {
    if (object == null || object.toString().trim() == "null") { return true; }
    else {
        if (object.toString().trim() == "") { return true; }
        else { return false; }
    }
}

function IsNullOrEmptyObject(object) {
    if (object == null || object.toString().trim() == "null") { return true; }
    else {
        if (object.toString().trim() == "") { return true; }
        else { return false; }
    }
}

//TuanLA them truong hop check null/undefined
function IsNull(c) {
    if (c == undefined ||
        c == 'undefined' ||
        c == null ) {
        return false;
    }
    return true;
}

function ParseString(object) {
    if (IsNullOrEmpty(object)) {
        return "";
    }

    return object.toString().trim();
}

function ParseDouble(object) {
    if (IsNullOrEmpty(object) || parseFloat(object).toString() == 'NaN') {
        return 0;
    }
    return parseFloat(object);
}

function ParseNumberJapanseToNumberEnglish(value, maxLength) {
    boolIsCheckJapanseNumber = false;
    value = value.toString().trim();
    for (var i = 0; i < arrayCharacterJapanese.length; i++) {
        if (value.indexOf(arrayCharacterJapanese[i]) > -1) {
            boolIsCheckJapanseNumber = true;
            break;
        }
    }

    var newValue = value;
    if (boolIsCheckJapanseNumber == true) {
        newValue = newValue.replace(/[ａ-ｚＡ-Ｚ]/g, "").replace(/１/g, "1").replace(/２/g, "2").replace(/３/g, "3").replace(/４/g, "4").replace(/５/g, "5").replace(/６/g, "6").replace(/７/g, "7").replace(/８/g, "8").replace(/９/g, "9").replace(/０/g, "0").replace(/．/g, ".");
        for (var i = 11; i < arrayCharacterJapanese.length; i++) {
            newValue = newValue.replaceAll(arrayCharacterJapanese[i], "");
        }

        var position = newValue.indexOf("."); // Xu ly ket qua tra ve 1 dau .
        if (position > -1) {
            var tempValue = newValue.replaceAll(".", "");
            newValue = tempValue;
            tempValue = newValue.substr(0, position) + "." + newValue.substr(position);
            newValue = tempValue;
        }
    }

    newValue = newValue.substr(0, (maxLength + (position > -1 ? 1 : 0))); // Cat chuoi theo MaxLength

    if (ValidateIsNum(newValue) == false) return "";
    return newValue;
}

function SetNumberEnglishForObject(e, boolIsFocus) {
    var dataNew = ParseNumberJapanseToNumberEnglish(e.target.value, e.target.maxLength);
    if (boolIsCheckJapanseNumber == true) {
        $(e.target).blur();
        $(e.target).val(dataNew);
        if (boolIsFocus == true) { $(e.target).focus(); }
    }
}

// Kiem tra ki tu duoc nhap trong cac textbox co kieu du lieu so.
// isShiftKey: true => Duoc su dung phim Shift
function ValidateKeyDownDataIsNumber(e, isShiftKey) {
    if (((e.which >= 48 && e.which <= 57) || (e.which >= 96 && e.which <= 105) // Ki tu so 0..9 (Phim + Phim so)
        || (e.which == 190 || e.which == 110) // Ki tu . (Phim + Phim so)
        || (e.which == 229) // Ki tu Phim so (ben trai) tren Chrome khi nhap Tieng Nhat.
        || (e.which == 46) // Ki tu Del
        || (e.which == 8) // Ki tu Backspace
        || (e.which == 9) // Ki tu Tab
        || (e.which == 35) // Ki tu Home
        || (e.which == 36) // Ki tu End
        || (e.which == 37) // Ki tu <-
        || (e.which == 39) // Ki tu ->
        ) && (isShiftKey || //Duoc su dung phim Shift
                (!e.shiftKey) //Khong su dung phim Shift
            )
        ) {
        return true;
    }
    return false;
}

// Kiem tra ki tu duoc nhap trong cac textbox co kieu du lieu so NGUYEN
function ValidateKeyDownDataIsNumberInt(e) {
    if (((e.which >= 48 && e.which <= 57) || (e.which >= 96 && e.which <= 105) // Ki tu so 0..9 (Phim + Phim so)
        || (e.which == 229) // Ki tu Phim so (ben trai) tren Chrome khi nhap Tieng Nhat.
        || (e.which == 46) // Ki tu Del
        || (e.which == 8) // Ki tu Backspace
        || (e.which == 9) // Ki tu Tab
        || (e.which == 35) // Ki tu Home
        || (e.which == 36) // Ki tu End
        || (e.which == 37) // Ki tu <-
        || (e.which == 39) // Ki tu ->
        ) && (!e.shiftKey)) {//Khong su dung phim Shift
        return true;
    }
    return false;
}

function ValidateKeyDownDataIsNumberNegative(e) {
    if ((e.which >= 48 && e.which <= 57) || (e.which >= 96 && e.which <= 105) // Ki tu so 0..9 (Phim + Phim so)
        || (e.which == 189 || e.which == 173 || e.which == 109) // Ki tu - (Phim + Phim so) //(189: IE, Chrome | 173: FireFox)
        || (e.which == 190 || e.which == 110) // Ki tu . (Phim + Phim so)
        || (e.which == 229) // Ki tu Phim so (ben trai) tren Chrome khi nhap Tieng Nhat.
        || (e.which == 46) // Ki tu Del
        || (e.which == 8) // Ki tu Backspace
        || (e.which == 9) // Ki tu Tab
        || (e.which == 35) // Ki tu Home
        || (e.which == 36) // Ki tu End
        || (e.which == 37) // Ki tu <-
        || (e.which == 39) // Ki tu ->
        ) {
        return true;
    }
    return false;
}

/// <summary>
/// Add AfterShow Event to DatePicker
/// </summary>
function AddAfterShowDatePicker() {
    $.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
    $.datepicker._updateDatepicker = function (inst) {
        $.datepicker._updateDatepicker_original(inst);
        var afterShow = this._get(inst, 'afterShow');
        if (afterShow)
            afterShow.apply((inst.input ? inst.input[0] : null));  // trigger custom callback
    };
}

// Set focus vao vi tri cuoi cung cua doi tuong.
function SetFocusAtEnd(elem) {
    var elemLen = elem.value.length;
    // For IE Only
    if (document.selection) {
        elem.focus();
        var oSel = document.selection.createRange();
        oSel.moveStart('character', elemLen);
        oSel.moveEnd('character', elemLen);
        oSel.select();
    }
    else if (elem.selectionStart || elem.selectionStart == '0') {
        // Firefox/Chrome
        elem.selectionStart = elemLen;
        elem.selectionEnd = elemLen;
        elem.focus();
    } // if
}

function ParseBigNumber(num) {
    var c = new BigNumber(num.split('E+')[0]).multiply(new BigNumber(10).pow(parseInt(num.split('E+')[1])));
    return c;
}

// Set MaxLength for TextArea.
; (function ($) {
    $.fn.maxlength = function () {

        $("textarea[maxlength]").keypress(function (event) {
            var key = event.which;

            //all keys including return.
            if (key >= 33 || key == 13 || key == 32) {
                var maxLength = $(this).attr("maxlength");
                var length = this.value.length;
                if (length >= maxLength) {
                    event.preventDefault();
                }
            }
        });
    }

})(jQuery);

function ParseBool(object) {
    if (IsNullOrEmpty(object)) {
        return false;
    }
    if (ParseString(object).toLowerCase() == 'true') {
        return true;
    }
    else {
        return false;
    }
}

/// Convert object to Boolean value from Bit value
/// <param name="obj">Object will be converted</param>
/// <returns>Converted Boolen value</returns>
function ParseBoolFromBit(object) {
    if (ParseString(object) == "1")
        return true;
    return false;
}

function CompareDate(startdate, enddate) { // So sanh a > b ?
    var startDate = new Date(startdate);
    var endDate = new Date(enddate);

    if (startDate.getTime() >= endDate.getTime()) { return false; }
    else { return true; }
}

function CompareDateEqual(startdate, enddate) { //So sanh a >= b
    var startDate = new Date(startdate);
    var endDate = new Date(enddate);

    if (startDate.getTime() > endDate.getTime()) { return false; }
    else { return true; }
}

function ValidateNumber(x) {
    var ValidateChar = /^[0-9\.]+$/;

    if (x == undefined || x.trim() == "") { return true; }

    if (x.match(ValidateChar)) { return true; }
    else { return false; }
}

function GetValueOfRadio(radioName) {
    return $('input:radio[name="' + radioName + '"]').filter('[checked="checked"]').val();
}

function CheckRightClick(e) {
    var rightclick;
    if (!e) var e = window.event;
    if (e.which) rightclick = (e.which == 3);
    else if (e.button) rightclick = (e.button == 2);
    return rightclick;
}

function AddSearchInCboDynamic(e, arrStyle, arrStyleChild, intTimeOut, funcOpenSelect) {
    setTimeout(function () {
        if (IsNullOrEmpty(arrStyle)) arrStyle = { 'height': '100%', "max-width": "550px", "margin-top": "1px" };
        else if (!IsNullOrEmpty(arrStyle.widthObj) && (ParseDouble(arrStyle.width) != ParseDouble(eval(arrStyle.widthObj)))) {
            arrStyle.width = ParseDouble(eval(arrStyle.widthObj));
        }
        $(e).on("select2-opening", function () {
            $(".select2-drop-active").each(function () {
                $(this).data("select2").close(); // Đóng tất cả Select2 đang mở
            });
        });

        $(e).select2({ dropdownCss: { "max-width": "550px", "width": "auto" } }).on("select2-open", function () {
            $('#select2-drop').css({
                'min-width': $('#s2id_' + $(e).attr('id')).width(), 'left': $('#s2id_' + $(e).attr('id')).children('a').offset().left
            });
            if ($('#select2-drop').offset().top > $('#s2id_' + $(e).attr('id')).children('a').offset().top) {
                $('#select2-drop').css({ 'top': $('#s2id_' + $(e).attr('id')).children('a').offset().top + $('#s2id_' + $(e).attr('id')).children('a').height() });
            }
            $('#select2-drop').addClass($(e).attr('id')); // thêm class id của cbo khi click lần đầu tiên

            //VuongLV: Điều chỉnh để select2 khi open option sẻ được scroll lên vị trí trên cùng
            let scrollTop = $('.select2-results .select2-highlighted').prop('offsetTop');
            if (scrollTop) {
                $('.select2-results').scrollTop(scrollTop);
            }
            //VuongLV: Điều chỉnh để select2 khi open option sẻ được scroll lên vị trí trên cùng end

            HideDatePicker();
            HideMultiSelect();

            $("#select2-drop-mask").hide();
            $(document).one("mousedown", function (event) {
                var dropdownElement = $(e).select2('dropdown')[0];
                if (dropdownElement && !dropdownElement.contains(event.target) && !$(e).next(".select2-container").has(event.target).length) {
                    $(e).select2("close"); // Đóng dropdown
                }
            });

            if (funcOpenSelect) {
                funcOpenSelect(e);
            }
        });
        $('#s2id_' + $(e).attr('id')).attr('style', arrStyle).find('span[class="select2-chosen"]').css({ 'font-weight': 'normal', 'text-align': 'left', 'color': '#444444;' });
        $('#s2id_' + $(e).attr('id')).children('a').attr('style', arrStyleChild);
        $('.select2-search').parent().css({ 'min-width': $('#s2id_' + $(e).attr('id')).width() });
    }, ParseDouble(intTimeOut));
}

function HideDatePicker() {
    $('.datepicker').hide();
}

//VuongLV: Them ham an multi select 2024/07/04
function HideMultiSelect(idCbo) {
    $.each($('button[id^="multi_"].ui-multiselect'), function () {
        let idMulti = this.id.replace('multi_', '');
        if ($('#' + idMulti).multiselect('isOpen')) {
            $('#' + idMulti).multiselect('close');
        }
    });
}
//VuongLV: Them ham an multi select end

//Set gia tri Select2 tu id the Select
//objSelect: The Select thuong
//value: Gia tri can set
//fnAfterSetValue: function can xu ly sau khi Set value cho Select2
function SetValSelect2BySelect(objSelect, value, fnAfterSetValue) {
    if (IsNullOrEmpty(value))
        objSelect.select2('val', objSelect.val());
    else
        objSelect.select2('val', value);

    if (fnAfterSetValue != null) {
        fnAfterSetValue();
    }
}

function ResetValCboDynamic(e) {
    $(e).select2('val', '');
}

function RemoveCboDynamic(e) {
    $(e).select2('destroy');
}

function RemoveArrCboDynamic(arrObj) {
    var arrTemp = arrObj.split(',');
    for (var i = 0; i < arrTemp.length; i++) {
        RemoveCboDynamic(ParseString(arrTemp[i]));
        //console.log($(arrTemp[i]).select2("val")); console.log($('#s2id_' + $(arrTemp[i]).attr('id')).html());
    }
}

function AddClassErrCboDynamic(obj) {
    $('#s2id_' + $(obj).attr('id')).find('a[class="select2-choice"]').addClass('ui-state-error');
}

function RemoveClassErrCboDynamic(obj) {
    $('#s2id_' + $(obj).attr('id')).find('a').removeClass('ui-state-error');
}

function SetFullWidthPage() {
    if ($('.wrapper')[0].style.width != '98.5%') { $('#FullScreen').trigger('click'); }
}

function GetValByTitleRow(rowid, colName, gridName) { //Lay gtri 1 cell dua vao Title
    return ParseString($('#' + rowid + ' td[aria-describedby="' + gridName + '_' + colName + '"]').attr('title'));
}
function GetValByHTMLCell(rowid, colName, gridName) { //Lay gtri 1 cell dua vao HTML cua cell
    return ParseString($('#' + rowid + ' td[aria-describedby="' + gridName + '_' + colName + '"]').html());
}
function SetValHTMLCell(rowid, colName, gridName, value) { //Set gtri vao HTML cua cell
    $('tr[id=' + rowid + ']').find('td[aria-describedby="' + gridName + '_' + colName + '"]').attr('title', value).attr('org_val', value).text(value);
}
function GetRowSelected(grid) {//Lay row duoc Seleted.
    return ParseString(grid.jqGrid('getGridParam', 'selrow'));
}

function DisabledButton(objName) {
    $('#' + objName).attr('disabled', true); //.addClass('ui-state-disabled');
}

function EnableButton(objName) {
    $('#' + objName).attr('disabled', false); //.removeClass('ui-state-disabled');
}

function IsOpeningRow(rowid) {//Ktra row dang mo hay ko?
    if ($('#' + rowid).attr('editable') == '1') { return true; }
    return false;
}

function AddClassErr(object, isNotFocus) {//isNotFocus: true=> Khong Focus vao object.
    if (ParseBool(isNotFocus))
        $('#' + object).addClass('ui-state-error');
    else
        $('#' + object).addClass('ui-state-error').focus();
}

function RemoveClassErr(object) {
    $('#' + object).removeClass('ui-state-error');
}

function RemoveClassErrByObject(object) {
    $(object).removeClass('ui-state-error');
}

function GetCurrentDate(isShowTime, isShowSecond) {
    var d = new Date();
    var preDate = $.datepicker.formatDate('yy/mm/dd', d);
    if (isShowTime) {
        preDate = preDate + ' '
         + (d.getHours() > 9 ? d.getHours() : ('0' + d.getHours()))
         + ':' + (d.getMinutes() > 9 ? d.getMinutes() : ('0' + d.getMinutes()));
    }
    if (isShowSecond) {
        preDate = preDate + ':' + (d.getSeconds() > 9 ? d.getSeconds() : ('0' + d.getSeconds()));
    }
    return preDate;
}

function FormatPercent(value) {
    if (IsNullOrEmpty(value)) return '';
    return value + ' %';
}

function UnFormatPercent(value) {
    if (IsNullOrEmpty(value)) return '';
    value = ParseString(value);
    return value.replace(' %', '');
}

//Kiem tra dang xu ly Search Advance
function IsSearchForm(gridId) { return $('#searchmodfbox_' + gridId).css('display') != 'none'; }

// Show dialog with OK button: Information, warning, Error
function showConfirmDialog_Advance(msg, title, msgYes, msgNo, msgClose, isDisYes, isDisNo, yesFunct, noFunct, closeFunct) {
    // Reset answered flag
    isUserAnswered = false;

    // Define button YES
    var buttonOpts = {};
    buttonOpts[msgYes] = function () {
        isUserAnswered = true;
        if (null != yesFunct) {
            yesFunct();
        }
        $(this).dialog("close");
    };

    // Define button NO
    buttonOpts[msgNo] = function () {
        isUserAnswered = true;
        if (null != noFunct) {
            noFunct();
        }
        $(this).dialog("close");
    };

    // Define button close
    buttonOpts[msgClose] = function () {
        isUserAnswered = true;
        if (null != closeFunct) {
            closeFunct();
        }
        $(this).dialog("close");
    };

    var $dialog = $('<div title="' + title + '"></div>')
                    .html(msg)
                    .dialog({
                        modal: true,
                        autoOpen: false,
                        buttons: buttonOpts,
                        open: function () {
                            $('.ui-dialog-buttonpane')
                                    .find('button:contains("' + msgYes + '")')
                                    .prepend('<span style="float:left; margin-top: 3px;" class="ui-icon ui-icon-disk"></span>');
                            $('.ui-dialog-buttonpane')
                                    .find('button:contains("' + msgNo + '")').last()
                                    .prepend('<span style="float:left; margin-top: 3px;" class="ui-icon ui-icon-disk"></span>');
                            $('.ui-dialog-buttonpane')
                                    .find('button:contains("' + msgClose + '")')
                                    .prepend('<span style="float:left; margin-top: 3px;" class="ui-icon ui-icon-cancel"></span>');
                            if (isDisYes) {
                                $('.ui-dialog-buttonpane').find('button:contains("' + msgYes + '")').attr('disabled', true).css({'cursor': 'default', 'color': '#cccccc' });
                            }
                            if (isDisNo) {
                                $('.ui-dialog-buttonpane').find('button:contains("' + msgNo + '")').last().attr('disabled', true).css({ 'cursor': 'default', 'color': '#cccccc' });
                            }
                        },
                        close: function () {
                            if (null != closeFunct) {
                                closeFunct();
                            }
                        }
                    });

    // Show dialog
    $dialog.dialog('open');
}

//NguyenNQ: Add in 2017/11/14: Fix t.hop khong su dung Scroll tren Table Frozen
function ActiveScrollByFrozenColumn(myGrid) {
    $(myGrid[0].grid.fbDiv).on('mousewheel DOMMouseScroll', function (e) {
        var dir, amt = 100;
        if (e.type === 'mousewheel') {
            dir = e.originalEvent.wheelDelta > 0 ? '-=' : '+=';
        }
        else {
            dir = e.originalEvent.detail < 0 ? '-=' : '+=';
        }

        $(myGrid[0].grid.bDiv).stop().animate({
            scrollTop: dir + amt
        }, 100, 'linear');
    });
}
//NguyenNQ: Add in 2017/11/14: Fix t.hop khong su dung Scroll tren Table Frozen End

function safariWindows() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("safari/") !== -1 &&  // It says it's Safari
        ua.indexOf("windows") !== -1 &&  // It says it's on Windows
        ua.indexOf("chrom") === -1     // It DOESN'T say it's Chrome/Chromium
       ) {
        return true;
    }
    else {
        return false;
    }
}

//Mr.Quang fix show icon sort frozen column
//objSort: object cua onSortCol function
//idxcol: vi tri col sort
//sortorder: loai sort
//indexRowHeader: vi tri row(tr) header sort
function ShowSortIconFrozenColumn(objSort, idxcol, sortorder, indexRowHeader) {
    //add 
    if (objSort.p.lastsort >= 0 && objSort.p.lastsort !== idxcol && objSort.p.colModel[objSort.p.lastsort].sortable !== false) {
        $(objSort.grid.headers[objSort.p.lastsort].el).find(">div.ui-jqgrid-sortable>span.s-ico").hide();
        $(objSort.grid.headers[objSort.p.lastsort].el).removeClass('ui-state-highlight');
        // removeClass tren cot sort truoc do cho table frozen
        $('.frozen-div tr').eq(indexRowHeader).children().eq(objSort.p.lastsort).find(">div.ui-jqgrid-sortable>span.s-ico").hide();
    }
    // addClass tren cot sort tren table frozen
    var spanicon = $('.frozen-div tr').eq(indexRowHeader).children().eq(idxcol).find(">div.ui-jqgrid-sortable>span.s-ico");
    spanicon.show();
    if (sortorder == "asc") {
        spanicon.children().eq(0).removeClass('ui-state-disabled');
        spanicon.children().eq(1).addClass('ui-state-disabled');
    } else {
        spanicon.children().eq(0).addClass('ui-state-disabled');
        spanicon.children().eq(1).removeClass('ui-state-disabled');
    }
}
//End Mr.Quang fix show icon sort frozen column

//NguyenNQ: Add in 2017/12/05
//Lay ten Column tu gia tri Index trong JQGrid
//objJQGrid: Doi tuong JQGrid
//indexColumn: Thu tu column can lay ten
function GetColumnNameByIndexOnJQGrid(objJQGrid, indexColumn) {
    return objJQGrid.jqGrid('getGridParam', 'colModel')[indexColumn].name;
}
//NguyenNQ: End Add in 2017/12/05 End

//NguyeNQ: Add in 2018/09/18 Start
//Lay Index tu Column Name
//objJQGrid: Doi tuong JQGrid
//indexColumn: Thu tu column can lay ten
function GetColumnIndexByName(objJQGrid, columnName) {
    var cm = objJQGrid.jqGrid('getGridParam', 'colModel');
    for (var i = 0; i < cm.length; i++) {
        if (cm[i].name == columnName) {
            return i;
        }
    }
    return -1;
};

//Lay width tu Column Name
//objJQGrid: Doi tuong JQGrid
//indexColumn: Thu tu column can lay ten
function GetColWidthByName(objJQGrid, columnName) {
    return objJQGrid.jqGrid('getGridParam', 'colModel')[GetColumnIndexByName(objJQGrid, columnName)].width;
}

//NguyeNQ: Add in 2018/09/18 End

//NguyenNQ: Add in 2017/12/06
//Cat ki tu khoang trang truoc khi Search => Fix Bug fn parseJSON bi loi
//dataFilters: chuoi Search can xu ly
function TrimDataFilters(dataFilters) {
    if (IsNullOrEmpty(dataFilters)) return '';
    return dataFilters.replaceAll('"	', '"').replaceAll('	"', '"').replaceAll('" ', '"').replaceAll(' "', '"').replaceAll('	','').toString();
}
//NguyenNQ: Add in 2017/12/06 End

//jqGridName: id cua grid.
function setTopAndHeightTableFrozen(jqGridName) {
    var divDatatable = $("#gview_" + jqGridName).children("div").eq(2);
    var divDataTable_Frozen = $("#gview_" + jqGridName).children("div").eq(4);
    var heightScrollbar = $("#gview_" + jqGridName).children("div").eq(2)[0].offsetHeight - $("#gview_" + jqGridName).children("div").eq(2)[0].clientHeight;
    divDataTable_Frozen.height(divDatatable.height() - heightScrollbar);

    //set height cho table header frozen
    $('.frozen-div').height($('.ui-jqgrid-hbox').height());

    //set top cho table data frozen
    var top = parseInt($('.frozen-div')[0].style.height.replace('px', '')) + 1;
    $('.frozen-bdiv').css("top", top + 'px');
}

//objJQGrid: Table JQGrid
function ResetTopFrozen(objJQGrid, isScrollDynamic) {
    if (isScrollDynamic) {
        objJQGrid.trigger('scroll');
    }
}

function SetCloumWitdhJqgrid() {
    $.jgrid.extend({
        setColWidth: function (iCol, newWidth, adjustGridWidth) {
            return this.each(function () {
                var $self = $(this), grid = this.grid, p = this.p, colName, colModel = p.colModel, i, nCol;
                if (typeof iCol === "string") {
                    // the first parametrer is column name instead of index
                    colName = iCol;
                    for (i = 0, nCol = colModel.length; i < nCol; i++) {
                        if (colModel[i].name === colName) {
                            iCol = i;
                            break;
                        }
                    }
                    if (i >= nCol) {
                        return; // error: non-existing column name specified as the first parameter
                    }
                } else if (typeof iCol !== "number") {
                    return; // error: wrong parameters
                }
                grid.resizing = { idx: iCol };
                grid.headers[iCol].newWidth = newWidth;
                grid.newWidth = p.tblwidth + newWidth - grid.headers[iCol].width;
                grid.dragEnd();   // adjust column width
                if (adjustGridWidth !== false) {
                    $self.jqGrid("setGridWidth", grid.newWidth, false); // adjust grid width too
                }
            });
        }
    });
}

function GetWidthColumnAllFrozen(gridName) {
    return $('.frozen-div table[aria-labelledby="gbox_' + gridName + '"]').outerWidth();
}
function ResizeWidthColumn(strArrCol, gridName, gridObj, widthOrg) {
    var widthColResize = 100;
    var widthScreen = $('.wrapper').outerWidth();
    var widthColum = GetWidthColumnAllFrozen(gridName);
    var width = 0;
    if (widthColum > widthScreen - widthColResize) {
        width = widthColResize + (widthColum - widthScreen);
    } else if (widthScreen > widthOrg && widthColum < widthOrg) {
        width = -(widthOrg - widthColum);
    } else if (widthScreen > widthColum && widthScreen < widthOrg) {
        width = -(widthScreen - widthColum - widthColResize);
    }
    if (width != 0) {
        var widthRatio = parseInt(width / strArrCol.length);
        $.each(strArrCol, function (index, item) {
            var widthOneCol = GetColWidthByName(gridObj, item) - widthRatio;
            widthOneCol = widthOneCol < 50 ? 50 : widthOneCol;
            gridObj.jqGrid("setColWidth", item, widthOneCol, false);
        });
    }
}
 
//Set gia tri Title va org_val cho 1 Cell bat ky trong JQGrid
//gridName: Ten Grid JQGrid 
//rowid: id row
//columnName: Ten cot
//value: gia tri
function SaveTitleCellJQGrid(gridName, rowid, columnName, value) {
    $('#' + rowid + ' td[aria-describedby="' + gridName + '_' + columnName + '"]').attr('title', value).attr('org_val', value);
}
function CreateCookieMessage(title, message, type) {
    PFN_createCookie('title', title, 1);
    PFN_createCookie('message', message, 1);
    PFN_createCookie('type', type, 1);
    PFN_createCookie('isshow', 'true', 1);
}
function ResetCookieMessage() {
    PFN_createCookie('title', '', -1);
    PFN_createCookie('message', '', 1);
    PFN_createCookie('type', '', 1);
    PFN_createCookie('isshow', 'false', 1);
}
function ShowMessage() {
    var title = PFN_readCookie('title');
    var message = PFN_readCookie('message');
    var type = PFN_readCookie('type');
    var ishow = ParseBool(PFN_readCookie('isshow'))
    
    if(ishow) {
        ShowMessageBox(title, message, type);
        ResetCookieMessage();
    }
}
function ShowMessageBox(title, message, type, isSuccess, isDelay) {
    if(typeof isSuccess !== 'undefined') {
        CreateCookieMessage(title, message, type);
        return false;
    }
    var template = '<span data-notify="' + title + '">' + title + '</span><br/>';
    switch(type) {
        case '1':
            color = 'success';
          break;
        case '2':
            color = 'danger';
          break;
        case '3':
            color = 'warning';
          break;
        default:
            color = 'success';
    } 
    $.notify(
    {
        icon: '../Contents/images/lang_icon/American_flag.jpg',
        //title: template,
        message: message
    }, 
    {
        type: color,
        //icon_type: 'image',
        delay: isDelay ? 6000 : 3000
    });
}
function ShowMessageConfirm(title, _functionOK, content, strClassBtn, width, class_confirm, _functionCancel) {
    //class duoc tao ra se co format 'jconfirm-' + class_confirm
    let theme = ['light'];
    if (!IsNullOrEmpty(class_confirm)) {
        theme.push(class_confirm);
    }

    $.confirm({
        theme: theme.join(),
        title: title,
        useBootstrap: false,   // không dùng grid bootstrap
        boxWidth: (IsNullOrEmpty(width) ? 350 : width) + 'px',
        content: '' +
        '<form action="" class="formName">' +
            '<div class="form-group">' +
                '<label style="width: 100%;">' + content + '</label>' +
            '</div>' +
        '</form>',
        buttons: {
            formSubmit: {
				text: arrMsgAgGrid.OK,
				btnClass: !IsNullOrEmpty(strClassBtn) ? strClassBtn : 'btn-red',
                keys: ['enter'],
                action: function () {
                    _functionOK(this);   
                }
            },
            [arrMsgAgGrid.Cancel]: {
                keys: ['esc'],
                action: function () {
                    if (_functionCancel) {
                        _functionCancel(this);
                    }
                }
            }
        },
    });
}
$(function () {
    if($.datetimepicker === undefined) return false;
    $.datetimepicker.setLocale('vi');
    $(".datetime").datetimepicker({
        format: 'Y/m/d',
        defaultTime: '8:00',
        datepicker: true,
        timepicker: false,
        locale: 'vi',
        scrollInput: false
    });
    $(".datetime, .datetime_custom, .require").focusout(function(e) {
        if($.trim($(this).val()).length > 0) {
          $(this).removeClass('is-invalid');
          $(this).parent().removeClass('has-error has-danger');
          $(this).next().addClass('hide');
        }
        else {
          $(this).addClass('is-invalid');
          $(this).parent().addClass('has-error has-danger');
          $(this).next().removeClass('hide');
        }
    });
	// $('input.floatNumber').on('blur', function() {
	//	this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
	//});
	function formatNumber(value) {
		// Loại bỏ dấu phẩy cũ và định dạng lại số
		return value.replace(/\D/g, '') // Loại bỏ ký tự không phải số
			.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Thêm dấu phẩy
	}

	$('input.floatNumber').on('input', function () {
		let inputVal = $(this).val(); // Lấy giá trị người dùng nhập
		let caretPos = this.selectionStart; // Lưu vị trí con trỏ
		let formattedValue = formatNumber(inputVal); // Định dạng lại giá trị

		$(this).val(formattedValue); // Gán giá trị mới cho input

		// Đặt lại vị trí con trỏ sau khi định dạng
		let newCaretPos = formattedValue.length - (inputVal.length - caretPos);
		this.setSelectionRange(newCaretPos, newCaretPos);
	});
});
function SetClassForCombobox(obj) {
    if ($(obj).val() !== "0" && $(obj).val() !== "") {
        $(obj).removeClass('is-invalid');
        $(obj).parent().removeClass('has-error has-danger');
        $(obj).next().addClass('hide');
    }
    else {
        $(obj).addClass('is-invalid');
        $(obj).parent().addClass('has-error has-danger');
        $(obj).next().removeClass('hide');
    }
}
function SetClassForComboboxSelect2(obj) {
    if ($(obj).val() !== "0" && $(obj).val() !== "") {
        $(obj).removeClass('is-invalid');
        $(obj).parent().removeClass('has-error has-danger');
        $(obj).next().next().addClass('hide');
    }
    else {
        $(obj).addClass('is-invalid');
        $(obj).parent().addClass('has-error has-danger');
        $(obj).next().next().removeClass('hide');
    }
}
function RemoveValidComboboxSelect2(obj) {
    $(obj).removeClass('is-invalid');
    $(obj).parent().removeClass('has-error has-danger');
    $(obj).next().next().addClass('hide');
}
function ResetModalForm(obj) {
    $(obj).on('hidden.bs.modal', function () {
        $(this).find("input, textarea").val('').end()
               .find("input[type=checkbox], input[type=radio]").prop("checked", "").end();
        // if($(this).find("select").length > 0)
        //   $(this).find("select")[0].selectedIndex = 0
        $.each($(this).find("select"), function(key, obj) {
            $(obj).prop('selectedIndex', 0);
        });
    })
}
function SetClassForControl(obj) {
    if($(obj).val() === "") {
        $(obj).addClass('is-invalid');
        $(obj).parent().addClass('has-error has-danger');
        $(obj).next().removeClass('hide');
    }
    else {
        $(obj).removeClass('is-invalid');
        $(obj).parent().removeClass('has-error has-danger');
        $(obj).next().addClass('hide');
    }
}
function ResetValidControl(obj) {
    $(obj).addClass('is-invalid');
    $(obj).parent().addClass('has-error has-danger');
    $(obj).next().removeClass('hide');
}
function RemoveValidControl(obj) {
    $(obj).removeClass('is-invalid');
    $(obj).parent().removeClass('has-error has-danger');
    $(obj).next().addClass('hide');
}
function ShowHideColumn() {
    var arrDisplayCol = GetArrDisplayCol('cboColumnsDisplay');
    var field = '';
    var arrColumnDefsOrigin = gridOptions.columnDefs
    var arrColumnDefPermission = []
    var arrFieldOfListColumn = arrVal.ListColumn ? arrVal.ListColumn.map(item => item.FIELD_ID) : []

    // lọc lại columnDefs theo permission từng user
    arrColumnDefsOrigin.forEach((item) => {
        if (item.children === undefined && arrFieldOfListColumn.includes(item.field)) {
            arrColumnDefPermission.push(item)
        }
        else if (item.children) {
            let children = item.children
            children = children.filter(itemchild => arrFieldOfListColumn.includes(itemchild.field))
            let itemNew = { ...item, children: children }
            if (children.length != 0) arrColumnDefPermission.push(itemNew)
        } 
    })

    
    $.each(arrColumnDefPermission, function (index, item) {
        if (item.children === undefined) {
            field = item.field;
			if (arrDisplayCol.split(",").includes(field) || IsNullOrEmpty(arrDisplayCol)) {
                gridOptions.columnApi.setColumnVisible(field, true);
            }
            else if (field != "Edit"
                && field != "DeleteRestore"
                && field != "No"
                && field != "IS_ACTIVE"
                && field != "Recovery"
                && field != "AttachMent"
                && field != "ATTACH_FILE"
                && field != "Download") {
                gridOptions.columnApi.setColumnVisible(field, false);
            }
        }
        else {
            $.each(item.children, function (_index, _item) {
                field = _item.field;
				if (arrDisplayCol.split(",").includes(field) || IsNullOrEmpty(arrDisplayCol)) {
                    gridOptions.columnApi.setColumnVisible(field, true);
                }
                else if (field != "Edit"
                    && field != "DeleteRestore"
                    && field != "No"
                    && field != "IS_ACTIVE"
                    && field != "Recovery"
                    && field != "AttachMent"
                    && field != "ATTACH_FILE"
                    && field != "Download") {
                    gridOptions.columnApi.setColumnVisible(field, false);
                }
            })
        }
	});
	gridOptions.columnApi.setColumnsPinned(['ATTACH_FILE'], 'right');
}
function GetArrDisplayCol(combobox) {
    var arrCompanyId = GetSelectedTextDisplayCol(combobox).toString();
    var companyIDs = IsCheckAllFullCombobox(combobox) ? "" : (IsNullOrEmpty(arrCompanyId) ? "*" : arrCompanyId);
    
    return companyIDs;
}
function GetSelectedTextDisplayCol(combobox) {
    var companyIDs = new Array();
    $('#menu_multi_' + combobox + ' input[type="checkbox"]:not(#checkedall_' + combobox + ')').filter(':checked').each(function () {
        if ($(this).val() != '') {
            companyIDs.push($(this).attr('value'));
        }
    });
    return companyIDs;
}
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if(results === null)
        return '';
    return results[1] || '';
}
function GetArrColumnId(combobox) {
    var arrColId = GetSelectedColumnsDisplayID(combobox).toString();
    var colIDs = IsCheckAllFullCombobox(combobox) ? "" : (IsNullOrEmpty(arrColId) ? "*" : arrColId);
    return colIDs;
}
function GetSelectedColumnsDisplayID(combobox) {
    var colIDs = new Array();
    $('#menu_multi_' + combobox + ' input[type="checkbox"]:not(#checkedall_' + combobox + ')').filter(':checked').each(function () {
        if ($(this).val() != '') {
            colIDs.push($(this).val());
        }
    });
    return colIDs;
}
function IsCheckAllFullCombobox(combobox) {
    if ($('#menu_multi_' + combobox + ' ul input[type="checkbox"]').not('#checkedall_' + combobox).length == $('#menu_multi_' + combobox + ' ul input:checked').not('#checkedall_' + combobox).length) {
        return true;
    }
    return false;
}
function SetValueForMutiSelect(comboboxid, strSelect) {
    var text = "";
    if (strSelect == '*') {
        $('#menu_multi_' + comboboxid).find('input[type="checkbox"]').attr('checked', false);
    }
    else if (strSelect != '' && strSelect != null) {
        $('#menu_multi_' + comboboxid).find('input[type="checkbox"]').attr('checked', false);
        strSelect = strSelect.split(",");
        strSelect.forEach(function (currentValue, index, arr) {
            var selectorCheckbox = $('input[name="multiselect_' + comboboxid + '"][value="' + currentValue + '"]');
            selectorCheckbox.prop('checked', true);
            text += $.trim(selectorCheckbox.attr('title')) + ', ';
        });
        text = text.substring(0, text.length - 2);
        $('#multi_' + comboboxid + ' span').eq(1).text(text);
    }
    else {
        if (IsCheckAllFullCombobox(comboboxid))
            $('#multi_' + comboboxid + ' span').eq(1).text($('#menu_multi_' + comboboxid + ' .ui-helper-reset li').eq(0).text());
    }
}
function ScrollPage(grid) {
    var row_index = PFN_readCookie('row_index');
    // var totalRow = gridOptions.api.getDisplayedRowCount();
    if (row_index != null && row_index > 0) {
        var rowIndex = parseInt(row_index);
        grid.api.ensureIndexVisible(rowIndex);
    }
}
function RecoverFilterValue(obj) {
    if($('#' + obj).val() !== undefined)
       return $('#' + obj).val();
    else
       return PFN_readCookie(obj) == null ? '' : PFN_readCookie(obj);
}

//VuongLV: Dieu chinh lai ham Format Number 2025/04/03
function registerFormatNumberOnInput(id, isShowZero, isShowFormatCurrency) {
    let maxLength = null;
    if ($('#' + id).is('[maxlength]')) {
        maxLength = parseInt($('#' + id).attr('maxlength'));
        $('#' + id).removeAttr('maxlength').attr('max-length', maxLength);
    }

    $('#' + id).on('input change', function (e) {
        let inputOrg = this.value;
        let inputVal = unformatCurrency(this.value);
        if (maxLength && inputVal.length > maxLength) {
            inputVal = inputVal.substring(0, maxLength);
        }

        if (!IsNullOrEmpty(inputVal) && ValidateIsNum(inputVal)) {
            var caretPos = this.selectionStart;
            let input = inputVal.split('.');
            var formattedValue = formatCurrency(input[0], isShowZero, !isShowFormatCurrency);

            if (input.length > 1) {
                formattedValue = formattedValue + '.' + input[1];
            }

            this.value = formattedValue;
            let newCaretPos = formattedValue.length - (inputOrg.length - caretPos);
            this.setSelectionRange(newCaretPos, newCaretPos);
        } else {
            this.value = '';
        }
    }).keypress(function (e) {
        if ((e.key == '.') && (this.value.indexOf('.') > -1)) return false;

        // Kiem tra Validate value nhap vao
        return  ValidateIsNum(e.key);
    });

    ValidateIsNumByPaste([id]);
}
//VuongLV: Dieu chinh lai ham Format Number 2025/04/03 End

//LamNV: Add in 2022/11/15
//Rut gon link URL 
function SetUrlFromOrtherSite() {
    var pathname = window.location.href;
    if (pathname.indexOf("?") != -1) {
        window.history.pushState(pathname.split("?")[0], "Title", pathname.split("?")[0]);
    }
}
//LamNV:End Add in 2022/11/15  End

//VuongLV: Add in 2024/04/10: Convert StringByte64 ToObject
function ConvertStringByte64ToObject(strObject) {
    var compressedData = window.atob(strObject); // Giải mã chuỗi base64
    var decompressedData = pako.inflate(compressedData, { to: 'string' }); // Giải nén dữ liệu GZip
    return JSON.parse(decompressedData);
}
//VuongLV: Add in 2024/04/10: Convert StringByte64 ToObject End

function LogOff() {
    var action = window.location.pathname;
    window.location = '/Account/LogOn' + (IsNullOrEmpty(action) ? '' : '?returnUrl=' + window.location.pathname);
}

function CheckSession() {//Ktra ton tai Session ?
    if (arrValUtility.IsCompleteLoadData) {
        $.ajaxSetup({ async: false });
        var xhr = $.post('/Account/CheckSession').success();
        $.ajaxSetup({ async: true });
        return ParseBool(xhr.responseText);
    }
    return true;
}

//HungAnh: Thêm hàm xử lý enter xuống dòng 26/01/2024
function RegPressKeyEnterMultiLine(obj) {
    $(obj).off('keydown').on('keydown', function (e) {
        if (e.which === 13 || e.keyCode === 13) {
            e.preventDefault(); //Ngăn chặn sự kiện mặc định của Enter

            //Lấy giá trị và vị trí con trỏ hiện tại
            var textarea = $(this);
            var currentValue = textarea.val();
            var cursorPosition = textarea.prop("selectionStart");

            //Thêm dòng mới vào ô textarea khi nhấn Enter
            var newValue = currentValue.substring(0, cursorPosition) + "\n" + currentValue.substring(cursorPosition);

            //Đặt lại giá trị của ô textarea
            textarea.val(newValue);

            //Di chuyển con trỏ đến vị trí mong muốn (dòng mới)
            textarea.prop("selectionStart", cursorPosition + 1);
            textarea.prop("selectionEnd", cursorPosition + 1);

            return false;
        }
    });
}

// Phuvm: Ham set CboTime thanh select2 và set scroll option được chọn lên nằm đầu 27/12/2023
function AddCboDynamic(e, intTimeOut) {
    if (intTimeOut == undefined)
        intTimeOut = 0;

    setTimeout(function () {
        if ($(e).length == 0) return false;
        let widthDropdown = $(e).outerWidth();
        $(e).select2({ dropdownCss: { "max-width": "550px", "width": "auto", 'border': '1px solid #999' }, minimumResultsForSearch: Infinity, dropdownCssClass: "lightboxDateTime" });
        //bắt sự kiện mở dropdown
        $(e).off().on("select2-open", function () {
            //lấy index * chiều cao của 1 phần tử
            $('.select2-results .select2-result-selectable').filter(function (idx, item) {
                //add class safari cho item trong cbo
                $.isSafari ? $(item).addClass('cbo_datetime_select2_safari') : $(item).addClass('cbo_datetime_select2')
                return $(item).is(":hidden");
            }).remove();
            let scrollTop = $('.select2-results .select2-result-selectable').index($('.select2-results .select2-highlighted')) * $('.select2-results .select2-result-selectable').outerHeight();
            $('.select2-results').scrollTop(scrollTop);


            //add thêm min-width
            $('#select2-drop').attr('style', $('#select2-drop').attr('style') + '; ' + 'min-width: ' + widthDropdown + 'px !important');
        });
        IntEventChangeDay();
        SetValSelect2BySelect($(e), $(e).val());
    }, intTimeOut);
}
// Phuvm: End Ham set CboTime thanh select2 và set scroll option được chọn lên nằm đầu
//Phuvm 28/12/2023 thêm hoặc xóa CboTime select2
function AddRemoveArrCboDynamic(arrObj, isAdd) {
    if (arrObj.length == 0) return false;
    for (var i = 0; i < arrObj.length; i++) {
        isAdd ? AddCboDynamic(arrObj[i]) : RemoveCboDynamic(arrObj[i]);
    }
}

//Phuvm: Set ngày không vượt quá tháng
function SetValueByValidateDateTime(year, month, objCboDay) {
    switch (month) {
        case 1://tháng 1
        case 3://tháng 3
        case 5://tháng 5
        case 7://tháng 7
        case 8://tháng 8
        case 10://tháng 10
        case 12://tháng 12
            $(objCboDay).find('option[value=31], option[value=30], option[value = 30]').show();
            break;
        case 4://tháng 4
        case 6://tháng 6
        case 9://tháng 9
        case 11://tháng 11
            $(objCboDay).find(' option[value=31]').hide();
            $(objCboDay).find(' option[value=30], option[value=29]').show();
            if (parseInt($(objCboDay).val()) > 30) $(objCboDay).val("30");
            break;
        case 2://tháng 2
            $(objCboDay).find('option[value=31], option[value=30], option[value=29]').hide();
            //năm nhuận
            if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) {
                $(objCboDay).find(' option[value=29]').show();
                if (parseInt($(objCboDay).val()) > 29) $(objCboDay).val("29");
            }
            else {  //năm bình thường
                if (parseInt($(objCboDay).val()) > 28) $(objCboDay).val("28");
            }
            break;
    }
    //Set value 
    SetValSelect2BySelect($(objCboDay), $(objCboDay).val());
}

//NguyenNQ(20231027): Add function Merge Array
Array.prototype.pushArray = function (arr) {
    this.push.apply(this, arr);
};
//NguyenNQ(20231027): Add function Merge Array End

//Phuvm update ListCboStaffFilter (gọi khi mở popup Tag/GroupTag) START
//ObjFilter: Element || arrListCboStaffString: mảng combobox staff || staffId: Id của staff || tagName: tên của Tag || statusDelete: trạng thái xóa(config dùng chung) || statusTag: trạng thái của tag || msg: message
function UpdateStaffByListCboStaffFilter(ObjFilter, arrListCboStaffString, staffId, tagName, statusDelete, statusTag, msg) {
    if ($(ObjFilter).length <= 0) return;
    //add combobox vào element
    $(ObjFilter).empty().html(arrListCboStaffString);
    //Khai báo biến
    let optionSelect = $("#" + $(ObjFilter).attr('id') + " option[value='" + staffId + "']");
    var staffName = optionSelect.attr('staff_name');
    //Kiểm tra điều kiện
    if (statusTag == statusDelete) {//tag đang bị xóa lần 1
        optionSelect.html(staffName);
    }
    else if (!IsNullOrEmpty(staffName)) {//có staff
        optionSelect.html(staffName + ' (' + tagName + ')');
    }
    else {//không có staff
        optionSelect.html(msg);
    }
    return $(ObjFilter).html();
}
//Phuvm update ListCboStaffFilter (gọi khi mở popup Tag/GroupTag) END

//Add Function Sort Multi Column
Array.prototype.keySort = function (keys) {

    keys = keys || {};

    // via
    var obLen = function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key))
                size++;
        }
        return size;
    };

    // avoiding using Object.keys because I guess did it have IE8 issues?
    // else var obIx = function(obj, ix){ return Object.keys(obj)[ix]; } or
    // whatever
    var obIx = function (obj, ix) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (size == ix)
                    return key;
                size++;
            }
        }
        return false;
    };

    var keySort = function (a, b, d) {
        d = d !== null ? d : 1;
        // a = a.toLowerCase(); // this breaks numbers
        // b = b.toLowerCase();
        if (a == b)
            return 0;
        return a > b ? 1 * d : -1 * d;
    };

    var KL = obLen(keys);

    if (!KL)
        return this.sort(keySort);

    for (var k in keys) {
        // asc unless desc or skip
        keys[k] =
            keys[k] == 'desc' || keys[k] == -1 ? -1
                : (keys[k] == 'skip' || keys[k] === 0 ? 0
                    : 1);
    }

    this.sort(function (a, b) {
        var sorted = 0, ix = 0;

        while (sorted === 0 && ix < KL) {
            var k = obIx(keys, ix);
            if (k) {
                var dir = keys[k];
                sorted = keySort(a[k], b[k], dir);
                ix++;
            }
        }
        return sorted;
    });
    return this;
};
//Add Function Sort Multi Column End

// Hien thi uploading : true : hien thi, false : an.
function ShowHideUpLoading(isShow) {
    $('#mod-progress-upload').modal(isShow ? 'show' : 'hide');
}


function ShowModalValidate(title, msg, yesFunct, AfterShowFunct, closeFunct) {
    $('#myModalLabel').html(title);
    $('#divValidateError').html(msg);
    $('#myModalValidate').modal('show');
    $('#myModalValidate').unbind('hidden.bs.modal');
    $('#myModalValidate').unbind('shown.bs.modal');
    $('#myModalValidate').on("shown.bs.modal", function () {
        //HideContextMenu();
        if (AfterShowFunct != null) {
            AfterShowFunct();
        }
        $('#myModalValidate').find('.btn_close_warning_validate').focus();
    });
    $('#myModalValidate').on('hidden.bs.modal', function (e) {
        if (yesFunct != null) {
            yesFunct();
        }
        $('#myModalValidate .modal-dialog').css({ 'left': '0px', 'top': '0px' });
        if (closeFunct != null) {
            closeFunct();
        }
    })
    //CollapseMenu();
}

//closeFunct: Function duoc xu ly sau khi tat dialog Confirm
function ShowModalConfirm(title, msg, yesFunct, noFunct, closeFunct) {
    $('#myModalConfirmLabel').html(title);
    $('#divMsgConfirm').html(msg);
    $('.btn_confirm_yes').attr('disabled', false);
    $('#myModalConfirm').modal('show');
    $('#myModalConfirm').unbind('shown.bs.modal');
    $('#myModalConfirm').unbind('keydown.dismiss.bs.modal');
    $('#myModalConfirm').on("shown.bs.modal", function () {
        //HideContextMenu();
        $('#myModalConfirm').find('.btn_confirm_yes').unbind('click');
        $('#myModalConfirm').find('.btn_confirm_yes').on('click', function () {
            $('.btn_confirm_yes').attr('disabled', true)
            HideModalConfirm()
            if (yesFunct != null) {
                yesFunct();
            }
            removeSelectionScreen();
        });
        $('#myModalConfirm').find('.btn_confirm_no').unbind('click');
        $('#myModalConfirm').find('.btn_confirm_no').on('click', function () {
            if (noFunct) {
                noFunct();
            }
            removeSelectionScreen();
        });
        $('#myModalConfirm').find('.btn_confirm_yes').focus();
    });
    $('#myModalConfirm').on('keydown.dismiss.bs.modal', function (e) {
        if (e.which == 27) {
            $('#myModalConfirm').find('.btn_confirm_no').trigger('click');
        }
        else if (e.which == 32)
            e.preventDefault();
    });

    if (!IsNullOrEmpty(closeFunct)) {
        $('#myModalConfirm').on('hidden.bs.modal', function () {
            closeFunct();
        });
    }
    //CollapseMenu();
}

function ShowModalConfirmAdvance(title, msg, yesFunct, nofunct, cancelFunct,
    valueBtn1, valueBtn2, valueBtn3) {
    $('#myModalConfirmAdvance .modal-title').html(title);
    $('#myModalConfirmAdvance .modal-body label').html(msg);
    $('#myModalConfirmAdvance').modal('show');
    $('#myModalConfirmAdvance').unbind('shown.bs.modal');
    $('#myModalConfirmAdvance').unbind('keydown.dismiss.bs.modal');

    if (!IsNullOrEmpty(valueBtn1)) {
        $('#myModalConfirmAdvance').find('.btn_confirm_pasteequals').html(valueBtn1);
    }
    if (!IsNullOrEmpty(valueBtn2)) {
        $('#myModalConfirmAdvance').find('.btn_confirm_pastechild').html(valueBtn2);
    }
    if (!IsNullOrEmpty(valueBtn3)) {
        $('#myModalConfirmAdvance').find('.btn_confirm_cancel').html(valueBtn3);
    }

    $('#myModalConfirmAdvance').on("shown.bs.modal", function () {
        $('#myModalConfirmAdvance').find('.btn_confirm_pasteequals').unbind('click');
        $('#myModalConfirmAdvance').find('.btn_confirm_pastechild').unbind('click');
        $('#myModalConfirmAdvance').find('.btn_confirm_cancel').unbind('click');

        $('#myModalConfirmAdvance').find('.btn_confirm_pasteequals').on('click', function () {
            $('#myModalConfirmAdvance').modal('hide');
            if (yesFunct != null) {
                yesFunct();
            }
        });
        $('#myModalConfirmAdvance').find('.btn_confirm_pastechild').on('click', function () {
            $('#myModalConfirmAdvance').modal('hide');
            if (nofunct != null) {
                nofunct();
            }
        });
        $('#myModalConfirmAdvance').find('.btn_confirm_cancel').on('click', function () {
            $('#myModalConfirmAdvance').modal('hide');
            if (cancelFunct != null) {
                cancelFunct();
            }
        });
        $('#myModalConfirmAdvance').find('.btn_confirm_pasteequals').focus();
    });

    $('#myModalConfirmAdvance').on('keydown.dismiss.bs.modal', function (e) {
        if (e.which == 27) {
            $('#myModalConfirmAdvance').find('.btn_confirm_cancel').trigger('click');
        }
        else if (e.which == 32)
            e.preventDefault();
    });
    //CollapseMenu();
}

function ActionForm(url, objParam, isBlank) {
    var $form = $("<form/>").attr("id", "data_form")
        .attr("action", url)
        .attr("method", "post");
    if (isBlank) {
        $form.attr("target", "_blank");
    }
    $("body").append($form);
    for (var i = 0; i < objParam.length; i++) {
        $.each(objParam[i], function (key, value) {
            AddParameter($form, key, value);
        });
    }
    $form[0].submit();
}
function AddParameter(form, name, value) {
    var $input = $("<input />").attr("type", "hidden").attr("name", name).attr("value", value);
    form.append($input);
}

function HideModal() {
    $('#myModalValidate').modal('hide');
}
function HideModalConfirm() {
    $('#myModalConfirm').modal('hide');
}
function HideModalConfirmCancel() {
    $('#myModalConfirmCancel').modal('hide');
}

function removeSelectionScreen() {
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {  // IE?
        document.selection.empty();
    }
}

function ValidateNotExceedTenCharacter(x) {
    if (x.length > 10) {
        return false;
    }
    return true;
}

//VuongLV: Ham chuyển trang href với phương thức method là POST
function postAndRedirect(url, params) {
    // Tạo một form ẩn
    var form = document.createElement("form");
    form.style.display = "none";
    form.method = "POST";
    form.action = url;

    // Thêm dữ liệu vào form dưới dạng các input
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var input = document.createElement("input");
            input.name = key;
            input.value = params[key];
            form.appendChild(input);
        }
    }

    // Thêm form vào document và tự động gửi
    document.body.appendChild(form);
    form.submit();
}
//VuongLV: Ham chuyển trang href với phương thức method là POST End

function GetWeekName(date) {
    let objDate = new Date(date);
    let day = objDate.getDay();
    switch (day) {
        case 0: return ' 日曜日';
        case 1: return ' 月曜日';
        case 2: return ' 火曜日';
        case 3: return ' 水曜日';
        case 4: return ' 木曜日';
        case 5: return ' 金曜日';
        case 6: return ' 土曜日';
    };
}
function SetDraggableForModalBoostrap(elem) {
	(function ($) {
		$.fn.drags = function (opt) {

			opt = $.extend({ handle: "", cursor: "move" }, opt);

			if (opt.handle === "") {
				var $el = this;
			} else {
				var $el = this.find(opt.handle);
			}

			return $el.css('cursor', opt.cursor).on("mousedown", function (e) {
				if (opt.handle === "") {
					var $drag = $(this).parent().addClass('draggable');
				} else {
					var $drag = $(this).parent().addClass('active-handle').parent().addClass('draggable');
				}
				var z_idx = $drag.css('z-index'),
					drg_h = $drag.outerHeight(),
					drg_w = $drag.outerWidth(),
					pos_y = $drag.offset().top + drg_h - e.pageY,
					pos_x = $drag.offset().left + drg_w - e.pageX;
				$drag.css('z-index', 1000).parents().on("mousemove", function (e) {
					$('.draggable').offset({
						top: e.pageY + pos_y - drg_h,
						left: e.pageX + pos_x - drg_w
					}).on("mouseup", function () { 
						$(this).parent().removeClass('draggable').css('z-index', z_idx);
					});
				});
				e.preventDefault(); // disable selection
			}).on("mouseup", function () {
				if (opt.handle === "") {
					$(this).parent().removeClass('draggable');
				} else {
					$(this).parent().removeClass('active-handle').parent().removeClass('draggable');
				}
			});

		}
	})(jQuery);
	$(elem).drags();	
}

function showDialogsWaiting(msg, isShow) {
    if (isShow) {
        $('body').append('<div id="ajax-mask-show-waiting" class="ajax-mask" style="display: block;z-index: 100;"><div class="loading-bar"><img src="../../Contents/imgs/loading-spinner-grey.gif">&nbsp;&nbsp;<span style="vertical-align: super;">' + msg + ' ...</span></div></div>');
    } else {
        $('#ajax-mask-show-waiting').remove();
    }
}


//Disabled mang Button dang: 'A,B,C...'
function DisabledButtonArr(arrName) {
    var arrTemp = arrName.split(',');
    for (var i = 0; i < arrTemp.length; i++) {
        DisabledButton(arrTemp[i]);
    }
}

function DisableContextMenuBrowser() {
    $("#cmroot").bind("contextmenu", function () {
        return false;
    });
}

function EnableButton(objName) {
    $('#' + objName).attr('disabled', false).removeClass('ui-state-disabled');
}

//Enable mang Button dang: 'A,B,C...'
function EnableButtonArr(arrName) {
    var arrTemp = arrName.split(',');
    for (var i = 0; i < arrTemp.length; i++) {
        EnableButton(arrTemp[i]);
    }
}

// Fix truong hop mo dong grid tu dong scroll ve trai
// Fix: khong cho focus vao control dau tien. 
function overWriteSettingGrid() {
    $.jgrid = $.jgrid || {};
    var jgrid = $.jgrid;
    jgrid.extend({
        //Editing
        editRow: function (rowid, keys, oneditfunc, successfunc, url, extraparam, aftersavefunc, errorfunc, afterrestorefunc, beforeEditRow) {
            // Compatible mode old versions
            var oMuligrid = {}, args = $.makeArray(arguments).slice(1);

            if ($.type(args[0]) === "object") {
                oMuligrid = args[0];
            } else {
                if (keys !== undefined) { oMuligrid.keys = keys; }
                if ($.isFunction(oneditfunc)) { oMuligrid.oneditfunc = oneditfunc; }
                if ($.isFunction(successfunc)) { oMuligrid.successfunc = successfunc; }
                if (url !== undefined) { oMuligrid.url = url; }
                if (extraparam != null) { oMuligrid.extraparam = extraparam; }
                if ($.isFunction(aftersavefunc)) { oMuligrid.aftersavefunc = aftersavefunc; }
                if ($.isFunction(errorfunc)) { oMuligrid.errorfunc = errorfunc; }
                if ($.isFunction(afterrestorefunc)) { oMuligrid.afterrestorefunc = afterrestorefunc; }
                if ($.isFunction(beforeEditRow)) { oMuligrid.beforeEditRow = beforeEditRow; }
                // last two not as param, but as object (sorry)
                //if (restoreAfterError !== undefined) { oMuligrid.restoreAfterError = restoreAfterError; }
                //if (mtype !== undefined) { oMuligrid.mtype = mtype || "POST"; }
            }

            // End compatible
            return this.each(function () {
                var $t = this, $self = $($t), p = $t.p, cnt = 0, focus = null, svr = {}, colModel = p.colModel, opers = p.prmNames;
                if (!$t.grid) { return; }
                var o = $.extend(true, {
                    keys: false,
                    oneditfunc: null,
                    successfunc: null,
                    url: null,
                    extraparam: {},
                    aftersavefunc: null,
                    errorfunc: null,
                    afterrestorefunc: null,
                    restoreAfterError: true,
                    beforeEditRow: null,
                    mtype: "POST",
                    focusField: true
                }, jgrid.inlineEdit, p.inlineEditing || {}, oMuligrid),
                    ind = $self.jqGrid("getInd", rowid, true),
                    focusField = o.focusField,
                    td = typeof focusField === "object" && focusField != null ?
                        $(focusField.target || focusField).closest("tr.jqgrow>td")[0] : null;

                if (ind === false) { return; }

                if (o.extraparam[opers.oper] !== opers.addoper) {
                    //if (!editFeedback.call($t, o, "beforeEditRow", o, rowid)) { return; }
                }

                if (($(ind).attr("editable") || "0") === "0" && !$(ind).hasClass("not-editable-row")) {
                    var editingInfo = jgrid.detectRowEditing.call($t, rowid);
                    if (editingInfo != null && editingInfo.mode === "cellEditing") {
                        var savedRowInfo = editingInfo.savedRow, tr = $t.rows[savedRowInfo.id],
                            highlightClass = getGuiStateStyles.call($t, "select");
                        $self.jqGrid("restoreCell", savedRowInfo.id, savedRowInfo.ic);
                        // remove highlighting of the cell
                        $(tr.cells[savedRowInfo.ic]).removeClass("edit-cell " + highlightClass);
                        $(tr).addClass(highlightClass).attr({ "aria-selected": "true", "tabindex": "0" });
                    }
                    jgrid.enumEditableCells.call($t, ind, $(ind).hasClass("jqgrid-new-row") ? "add" : "edit", function (options) {
                        var cm = options.cm, $dataFiled = $(options.dataElement), dataWidth = options.dataWidth, tmp, opt, elc,
                            nm = cm.name, edittype = cm.edittype, iCol = options.iCol, editoptions = cm.editoptions || {};
                        if (options.editable === "hidden") { return; }
                        try {
                            tmp = $.unformat.call(this, options.td, { rowId: rowid, colModel: cm }, iCol);
                        } catch (_) {
                            tmp = edittype === "textarea" ? $dataFiled.text() : $dataFiled.html();
                        }
                        svr[nm] = tmp; // include only editable fields in svr object
                        $dataFiled.html("");
                        opt = $.extend({}, editoptions, { id: rowid + "_" + nm, name: nm, rowId: rowid, mode: options.mode });
                        if (tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length === 1 && tmp.charCodeAt(0) === 160)) { tmp = ""; }
                        elc = jgrid.createEl.call($t, edittype, opt, tmp, true, $.extend({}, jgrid.ajaxOptions, p.ajaxSelectOptions || {}));
                        $(elc).addClass("editable");
                        $dataFiled.append(elc);
                        if (dataWidth) {
                            // change the width from auto or the value from editoptions
                            // in case of editing ExpandColumn of TreeGrid
                            $(elc).width(options.dataWidth);
                        }
                        jgrid.bindEv.call($t, elc, opt);
                        //Again IE
                        if (edittype === "select" && editoptions.multiple === true && editoptions.dataUrl === undefined && jgrid.msie) {
                            $(elc).width($(elc).width());
                        }
                        if (focus === null) { focus = iCol; }
                        cnt++;
                    });
                    if (cnt > 0) {
                        svr.id = rowid;
                        p.savedRow.push(svr);
                        $(ind).attr("editable", "1");
                        if (focusField) {
                            if (typeof focusField === "number" && parseInt(focusField, 10) <= colModel.length) {
                                focus = focusField;
                            } else if (typeof focusField === "string") {
                                focus = p.iColByName[focusField];
                            } else if (td != null) {
                                focus = td.cellIndex;
                            }
                            setTimeout(function () {
                                // we want to use ":focusable"
                                var nFrozenColumns = $self.jqGrid("getNumberOfFrozenColumns"),
                                    getTdByColIndex = function (iCol) {
                                        return p.frozenColumns && nFrozenColumns > 0 && focus < nFrozenColumns ?
                                            $t.grid.fbRows[ind.rowIndex].cells[iCol] :
                                            ind.cells[iCol];
                                    },
                                    getFocusable = function (elem) {
                                        return $(elem).find("input,textarea,select,button,object,*[tabindex]")
                                            .filter(":input:visible:not(:disabled)");
                                    },
                                    getFirstFocusable = function () {
                                        return getFocusable(p.frozenColumns && nFrozenColumns > 0 ? $t.grid.fbRows[ind.rowIndex] : ind)
                                            .first();
                                    },
                                    $fe = getFocusable(getTdByColIndex(focus));

                                if ($fe.length > 0) {
                                    //$fe.first().focus();
                                } else if (typeof o.defaultFocusField === "number" || typeof o.defaultFocusField === "string") {
                                    $fe = getFocusable(getTdByColIndex(typeof o.defaultFocusField === "number" ? o.defaultFocusField : p.iColByName[o.defaultFocusField]));
                                    if ($fe.length === 0) {
                                        //$fe = getFirstFocusable();
                                    }
                                    $fe.first().focus();
                                } else {
                                    //getFirstFocusable().focus();
                                }
                            }, 0);
                        }
                        if (o.keys === true) {
                            var $ind = $(ind);
                            if (p.frozenColumns) {
                                $ind = $ind.add($t.grid.fbRows[ind.rowIndex]);
                            }
                            $ind.bind("keydown", function (e) {
                                if (e.keyCode === 27) {
                                    $self.jqGrid("restoreRow", rowid, o.afterrestorefunc);
                                    return false;
                                }
                                if (e.keyCode === 13) {
                                    var ta = e.target;
                                    if (ta.tagName === "TEXTAREA") { return true; }
                                    $self.jqGrid("saveRow", rowid, o);
                                    return false;
                                }
                            });
                        }
                        //fullBoolFeedback.call($t, o.oneditfunc, "jqGridInlineEditRow", rowid, o);
                    }
                }
            });
        },
    });
}

function focusControlOnCellClick(obj, timeOut) {
    setTimeout(function () {
        if ($(obj).find('.select2-container').length > 0) {
            $(obj).find('input').eq(0).focus()
        }
        else if ($(obj).children().length >= 2 && (obj).children().eq(0).hasClass('tree-wrap')) {
            $(obj).children().eq(1).children().focus();
        }
        else {
            $(obj).children().eq(0).focus();
        }
    }, timeOut);
}

function CollapseMenu() {
    //  $('.dropdown.active.open').trigger('click');
    $('.dropdown').removeClass('open');
}

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

function hexToRgb(hex, IsEmpty) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        var r = parseInt(result[1], 16);
        var g = parseInt(result[2], 16);
        var b = parseInt(result[3], 16);
        return IsEmpty ? r + ", " + g + ", " + b : 'rgb(' + r + ", " + g + ", " + b + ')';
    }
    return null;
}

function rgb2hsb(r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
        diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    //percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }
    return {
        // h: Math.round(h * 360),
        // s: percentRoundFn(s * 100),
        // v: percentRoundFn(v * 100)
        h: (h * 360),
        s: (s * 100),
        v: (v * 100)
    };
}

// dang ky su kien khi an phim TAB, Shift Tab
// fix: khi tab control cuoi cung thi focus vao control dau tien cua dong
function registerEventPreTabInline(rowId, isCurrentForm) {
    var lstIDControl = [];
    $('#' + rowId).find('input, select, button, .fm-button').filter(function () {
        if ($(this).parent().css('display') != 'none' && !$(this).prop('disabled')) {
            lstIDControl.push(this);
        }
    });
    $(document).on('keydown', function (e) {
        if (!IsOpeningRow(rowId) && isCurrentForm != true) { return true; }
        var isTabCellDisable = ($(e.target)[0].nodeName == 'TR' || $(e.target)[0].nodeName == 'DIV' || $(e.target)[0].nodeName == undefined || $(e.target)[0].nodeName == 'BODY')
        if (e.which == 9 && !e.shiftKey) {
            HideDivCompanyList();
            if ($(e.target).attr('id') == $(lstIDControl).last().attr('id') || isTabCellDisable) {
                $(lstIDControl).first().focus();
                return false;
            }
        }
        else if (e.keyCode == 9 && e.shiftKey) {
            HideDivCompanyList();
            if ($(e.target).attr('id') == $(lstIDControl).first().attr('id') || isTabCellDisable) {
                $(lstIDControl).last().focus();
                return false;
            }
        }
    });
}

function RegisterDraggable(obj) {
    obj.draggable({
        handle: ".modal-header",
        //containment: 'html',
        start: function (event, ui) {
            //HideDivCompanyList();
        },
    });
}

//Format ki tu JP sang ki tu English(Doi voi ki tu so, ki tu chuoi thi remove)
function SetNumberEnglishForObjectBasic(e, boolIsFocus, isNum, isTel, isInputNegativeNum) {
    var iCursorPos = e.target.selectionStart;//Vi tri focus

    var dataNew = ParseNumberJapanseToNumberEnglish(e.target.value, e.target.maxLength, isNum, isTel, isInputNegativeNum);
    if (boolIsCheckJapanseNumber == true) {
        $(e.target).val(dataNew);
        if (boolIsFocus == true) {
            $(e.target).setCursorPosition(iCursorPos, iCursorPos);
        }
    }
    else {
        if (isTel && !ValidatePhoneBasic(dataNew)) {
            $(e.target).val($(e.target).val().substr(0, $(e.target).val().trim().length - 1)); //Xoa ki tu ko hop le
            if (boolIsFocus == true) { $(e.target).setCursorPosition(iCursorPos, iCursorPos); }
        }
        else {
            if (isInputNegativeNum && $(e.target).val() > 0
                && ($(e.target).val().length > $(e.target).attr('maxlength') - 1)) { //Neu co so am & nhap > MaxLength thi set lai gia tri tuong ung voi MaxLength
                $(e.target).val($(e.target).val().substr(0, $(e.target).val().trim().length - 1));
            }
        }
    }
}

function ValidateKeyDownDataIsNumberNegative(e) {
    if ((e.which >= 48 && e.which <= 57) || (e.which >= 96 && e.which <= 105) // Ki tu so 0..9 (Phim + Phim so)
        || (e.which == 189 || e.which == 173 || e.which == 109) // Ki tu - (Phim + Phim so) //(189: IE, Chrome | 173: FireFox)
        || (e.which == 190 || e.which == 110) // Ki tu . (Phim + Phim so)
        || (e.which == 229) // Ki tu Phim so (ben trai) tren Chrome khi nhap Tieng Nhat.
        || (e.which == 46) // Ki tu Del
        || (e.which == 8) // Ki tu Backspace
        || (e.which == 9) // Ki tu Tab
        || (e.which == 35) // Ki tu Home
        || (e.which == 36) // Ki tu End
        || (e.which == 37) // Ki tu <-
        || (e.which == 39) // Ki tu ->
    ) {
        return true;
    }
    return false;
}

function ResetToPageOne(myGrid, page) {
    myGrid.setGridParam({ page: page });
}
//Phuvm thêm hàm get date theo format ngôn ngữ
function getDateNowByFormatLang(isJP) {
	return isJP ? new Date().yyyymmddFormat().split('/')[0] + "年" + new Date().yyyymmddFormat().split('/')[1] + "月" + new Date().yyyymmddFormat().split('/')[2] + "日" : new Date().yyyymmddFormat();
}

function DragFormCenterNew(div, isFormJQGrid, func) {
    var width_div = div.width() / 2;
    var width_window = $(window).width() / 2;
    var height_div = $(div.find('div:eq(1)')).height() / 2;
    var height_window = $(window).height() / 2;
    var left_div = 0;
    var top_div = 0;
    if (width_window - width_div > 0) {
        left_div = width_window - width_div;
    }
    if (height_window - height_div > 0) {
        top_div = height_window - height_div;
    }
    // fix bug khong xuat hien thanh sroll khi chieu cao popup > chieu cao man hinh
    var heightModal = div.find('.modal-dialog').height() > $('body').height() ? $('body').height() : div.find('.modal-dialog').height();
    var heightModalBody = div.find('.modal-body').outerHeight() > $('body').height() ? $('.ui-render-content').height() : div.find('.modal-body').outerHeight();
    var widthModalBody = div.find('.modal-body').outerHeight() > $('body').height() ? div.find('.modal-body').outerWidth() + 20 : div.find('.modal-body').outerWidth();

    div.height(heightModal).width(div.find('.modal-dialog').width());
    div.find('form').css({ 'min-height': div.find('form').height(), 'min-width': div.find('form').width() });

    div.css({ 'min-height': heightModal, 'min-width': div.find('.modal-dialog').width(), 'overflow': 'visible' }); // QUIHV fix khi resize popup => min-width popup
    if (div.attr('id').indexOf('searchmodfbox') == -1) {
        div.find('.modal-body').css({ 'min-height': heightModalBody });
    }
    div.find('.modal-body').css({ 'min-width': widthModalBody, 'max-height': $('body').height() - 100 + 'px' });
    var modal_header = div.find('.modal-header');
    modal_header.css({ 'width': 'auto', 'height': 'auto' });

    $(div).find('.modal-header').dblclick(function () {
        //width_div = div.width() / 2;
        width_div = div.find('.modal-content').width() / 2; // QUIHV fix khi double click vao popup => dua form ve center.
        width_window = $(window).width() / 2;
        height_div = $(div.find('div:eq(1)')).height() / 2;
        height_window = $(window).height() / 2;
        left_div = width_window - width_div;
        top_div = height_window - height_div;
        //top_div - 30 : tru margin-top cua class modal-dialog
        div.css({ 'left': left_div, 'top': Math.ceil(top_div) });
        if (func != undefined && func != null) {
            func();
        }
    });
    //top_div - 30 : tru margin-top cua class modal-dialog
    div.css({ 'left': left_div, 'top': Math.ceil(top_div) });
    $('.ui-widget-overlay').unbind();
    //RegisterDraggable(div);
}

function ValidateColorpicker(rowid, colName) {
    if ($("#" + rowid + "_ColorPicker_" + colName).data('colorpickerId') == undefined) {
        colorpicker(rowid, colName);
        return true;
    }
    return false;
}

function SetColorDataLocal(selRowId, colName, obj) {
    var IdTable = $('#' + selRowId).parent().parent().attr('id')
    ValidateColorpicker(selRowId, colName);
    var colorpickerId = $("#" + selRowId + "_ColorPicker_" + colName).data('colorpickerId');
    $('#' + selRowId + "_ColorPicker_" + colName + ' div').css('background-color', obj.valueColor);
    $('#' + selRowId + ' td[aria-describedby="' + IdTable + '_' + colName + '"]').html(obj.valueColor)
    $('#' + selRowId + ' td[aria-describedby="' + IdTable + '_NEW' + colName + '"]').html(obj.valueColor)
    $('#' + colorpickerId).find("div.colorpicker_color").css('background-color', obj.colorpicker_color)
    $('#' + colorpickerId).find("div.colorpicker_new_color").css('background-color', obj.colorpicker_new_color)
    $('#' + colorpickerId).find("div.colorpicker_current_color").css('background-color', obj.colorpicker_current_color)

    var colorpicker = $("#" + colorpickerId).data('colorpicker');
    colorpicker.fields.eq(0).val(obj.valueColor.replace('#', ''));
    colorpicker.fields.eq(1).val(obj.r)
    colorpicker.fields.eq(2).val(obj.g)
    colorpicker.fields.eq(3).val(obj.b)
    colorpicker.fields.eq(4).val(obj.h)
    colorpicker.fields.eq(5).val(obj.s)
    colorpicker.fields.eq(6).val(obj.v)

    $('#' + colorpickerId).find("div.colorpicker_color div").last().css('left', obj.positionLeft);
    $('#' + colorpickerId).find("div.colorpicker_color div").last().css('top', obj.positionTop);
    $('#' + colorpickerId).find('div.colorpicker_hue div:eq(0)').css('top', obj.colorpicker_hue)
}

/*allowCopy: true include key: coppy+ anykey, key home, key end  + dau '.'*/
//isAllowComma: true: cho phep nhap dau phay, false: Khong cho phep nhap dau phay
//isAllowNegativeNum: true: cho phep nhap so am, false: Khong cho phep nhap so am
function ValidateIsNum_Key_dot(e, allowCopy, isAllowComma, isAllowNegativeNum) {
    var text = String.fromCharCode(e.which);
    var ValidateSpecialChar = /^[0-9\.]+$/;

    if (isAllowComma) {
        if (isAllowNegativeNum)
            ValidateSpecialChar = /^[0-9\.,-]+$/;
        else
            ValidateSpecialChar = /^[0-9\.,]+$/;
    }
    else {
        if (isAllowNegativeNum)
            ValidateSpecialChar = /^[0-9\.-]+$/;
    }

    if (text.match(ValidateSpecialChar) || (allowCopy != null && allowCopy && ((e.keyCode == 35 && text != "#") || (e.keyCode == 36 && text != '$') || e.ctrlKey)) || (e.keyCode == 8 || (e.keyCode == 9) || e.keyCode == 46 || (e.keyCode == 37 && text != "%") || (e.keyCode == 39 && text != "'") || (e.keyCode == 39 && text != "'"))) {
        return true
    }
    else {
        return false;
    }
}
function SetShowHideColumnByPer(fieldId, isHide) {
	if (!IsNullOrEmpty(arrVal.ListColumn)) {
		if (isHide) {
			return isHide;
		}
		return !arrVal.ListColumn.some(x => x.FIELD_ID == fieldId && x.IS_ACTIVE_USER == 1);
    }
    else return true
}
// Hàm để decode ký tự HTML
function decodeHtmlEntities(str) {
	let textarea = document.createElement('textarea');
	let decoded = str;

	// Lặp lại quá trình decode đến khi chuỗi không còn ký tự HTML mã hóa
	do {
		textarea.innerHTML = decoded;
		decoded = textarea.value;
	} while (decoded.includes('&') || decoded.includes('&#'));

	return decoded;
}
//Phuvm hàm set fronzen khi resize màn hình 
//arrayColIdDefault: mảng chứa cột mặc định của lưới; arrayColIdMin: mảng cột fronzen rút gọn khi thu màn hình
//minWidthSetPinned chiều rộng tối thiểu của các cột không fronzen
function SetPinedColumnByScreen(grid, arrayColIdDefault, arrayColIdMin, minWidthSetPinned) {
	let columns = grid.getAllGridColumns()
		.filter(col => arrayColIdDefault.includes(col.colId))
		.map(col => { return { colId: col.colId, width: col.userProvidedColDef.width } });

	var widthPinned = columns.map(x => x.width).reduce((acc, val) => acc + val, 0);//chiều rộng cột fronzen
	var width = $(window).outerWidth(true);//chiều rộng màn hình
	if (width < widthPinned + minWidthSetPinned) {
		grid.setColumnsPinned(arrayColIdDefault, false)//false => set bỏ 
		grid.setColumnsPinned(arrayColIdMin, true);//true => set fronzen
	}
	else {
		grid.setColumnsPinned(arrayColIdDefault, true);
	}	
}

/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */
function GetMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}

//HungAnh: Viết hàm set style button trên lưới 05/12/2024
function SetStyleButtonPagingJQGrid(obj, isForm, msgCancel, msgSave, isVersionOld) {
    if (!IsNullOrEmpty(obj)) {
        if (isVersionOld) {//Nay cho phien ban cu
            obj.find('td').find('.ui-icon').remove()
            $('.ui-state-disabled').hide()
            obj.find('td').removeClass('ui-pg-button ui-corner-all')
                .addClass('btn btn-sm btn-primary w-80px ml-2 btn__add').children().addClass('d-flex justify-content-center f-12 h-btn').css('width', '100%')
        }
        else {
            obj.find('.fa').remove();
            $('.ui-jqgrid-disablePointerEvents').hide()
            obj.removeClass('btn btn-xs ui-pg-button');
            obj.addClass('btn btn-sm btn-primary w-80px ml-2 btn__add').children().addClass('d-flex justify-content-center').css('width', '100%');
        }
    }

    if (isForm) {
        var htmlBtn = `<button id='cData' class='btn btn-sm btn-secondary'>${msgCancel}</button>
                    <button id='sData' class='btn btn-sm btn-primary'>${msgSave}</button>`;
        $('#Act_Buttons').find('.EditButton').html(htmlBtn)
    }
}
//HungAnh: Viết hàm set style button trên lưới 05/12/2024 End

//Quanha hàm format record text cho jqgrid 06/12/2024
function FormatRecordText() {
    return `{0} ${arrMsg.To} {1} ${arrMsg.Of} {1}`
}
//Quanha hàm format record text cho jqgrid 06/12/2024 End

//Phuvm 9/12/2024 set focus row và open row lần đầu load lưới
function selectRowAndFocusById(id) {
	const rowNode = gridOptions.api.getRowNode(id);
	if (rowNode) {
		$('span.ag-icon.ag-icon-tree-closed').click();//open row select 
		gridOptions.api.deselectAll(); // Optional: Deselect any previously selected row
		rowNode.setSelected(true);// set focus row
	}
}
//Phuvm 9/12/2024 set focus row và open row lần đầu load lưới End

function ShowHideLoading(isShow, divId) {
    if (IsNullOrEmpty(divId)) {
        divId = '';
    }

	if (isShow) {
        $("" + divId + " .ajax-mask").show();
	}
	else {
        $("" + divId + " .ajax-mask").hide();
	}
}

//Phuvm 17/12/2024 Redirect theo link returnUrl nếu có || thì redirect theo urlDefault
function RedirectByReturnLink(idFocusRow, urlDefault, data) {
	const params = new URLSearchParams(window.location.search);
	var returnUrl = params.get('returnUrl');
	if (returnUrl) {
		returnUrl = returnUrl + '&isscroll=true' + (!IsNullOrEmpty(data) ? '&' + idFocusRow + '=' + data : '');
	}
	const idFocus = params.get(idFocusRow) ? '&' + idFocusRow + '=' + params.get(idFocusRow)  : '';

	window.location.href = !IsNullOrEmpty(returnUrl) ? returnUrl + idFocus : urlDefault ;
}
//VuongLV: Tu dong tao nghi khong luong
function UpdateDataLeaveOfAbsence(funcLoadGrid, isAutoUpdateFast) {
    $.ajax({
        type: "POST",
        datatype: "json",
        url: '/api/PASApi/UpdateDataLeaveOfAbsence?isAutoUpdateFast=' + ParseBool(isAutoUpdateFast),
        async: true,
        success: function (res) {
            if (res == 1) {
                if (IsNull(funcLoadGrid)) {
                    funcLoadGrid();
                }
            }
        }
    });
}
//Phuvm 20/12/2024 Auto Checkout 
function UpdateCheckOutDateWhenEndDay(isStartCheckOut) {
    if (!isStartCheckOut) return;

    $.ajax({
		type: "POST",
		datatype: "json",
		url: '/api/PASApi/UpdateCheckOutDateWhenEndDay',
		async: true,
		success: function (res) {
		}
	});
}
//Phuvm 6/3/2025 Auto Sync CheckInOut 
function SyncCheckInOutDate() {
	$.ajax({
		type: "POST",
		datatype: "json",
		url: '/api/PASApi/SyncCheckInOutDate',
		async: true,
		success: function (res) {
		}
	});
}

//HungAnh: Render cbo time 27/12/2024
function RenderComboboxTime(selectIds) {
    const interval = 15; // khoảng cách thời gian mỗi option (phút)
    const totalMinutes = 24 * 60; // tổng số phút trong ngày

    const ids = typeof selectIds == 'string' ? selectIds.split(',') : selectIds;

    ids.forEach(id => {
        const select = document.getElementById(id.trim());
        if (select) {
            for (let i = 0; i < totalMinutes; i += interval) {
                const hours = Math.floor(i / 60).toString().padStart(2, '0');
                const minutes = (i % 60).toString().padStart(2, '0');
                const option = document.createElement('option');
                option.value = `${hours}:${minutes}`;
                option.textContent = `${hours}:${minutes}`;
                select.appendChild(option);
            }
        }
    });
}
//HungAnh: Render cbo time 27/12/2024 End

//HungAnh: resize grid 06/01/2025
function resizeGridNew(gridOptions, gridId, heightNumber) {
    setTimeout(function () {
        $(window).bind('resize', function () {
            setWidthHeightGridNew(heightNumber, gridOptions, gridId);
            ScrollPage(gridOptions);
        }).trigger('resize');
    }, 100);
}

function setWidthHeightGridNew(heightLayout, gridOptions, gridId) {
    var height = $(window).height() - $('.top_header').outerHeight() - $('.dm_group.dmg-shortcut').outerHeight() - $('.filterHeader').outerHeight() - heightLayout;
    $(gridId).css('height', height);
    if (typeof gridOptions != 'undefined')
        gridOptions.api.sizeColumnsToFit();
}
//HungAnh: resize grid 06/01/2025 End
//Phuvm 20/12/2024 set level cho cbo company select2 single 
function SetStyleSelect2ByCbo(selectElement) {
	$(selectElement).select2({
		templateResult: function (data) {
			if (!data.id) {
				return data.text;
			}
			return $(
				`<div style="display: flex; align-items: center;">                  
                    <span class="Level_Company_`+ $(data.element).attr('level') +`">${data.text}</span>
                </div>`
			);
		},
		language: {
			noResults: function () {
				return arrMsg.NOT_FOUND;
			}
		},
	});
}
//Phuvm 23/1/2025 Set column ẩn hiện
function UpdateStatusByHiddenColumn(FunctionId, UserID, arrColumnsCheck) {
	var strControlId = arrColumnsCheck.map(item => `'${item}'`).join(', ');
	$.ajax({
		type: "POST",
		datatype: "json",
		url: '/Common/UpdateStatusByHiddenColumn',
		data: {
			FUNCTION_ID: FunctionId,
			STAFF_ID: UserID,
			ArrControlId: strControlId,
			IsActive: true
		},
		async: true,
		success: function (res) {
		}
	});
}
//Phuvm 23/1/2025 obj element cbo column, arrList column
function LoadCboColumnDisplay(obj, arrColumns) {	
	if (arrColumns.filter(x => x.IS_ACTIVE_USER == 0).length > 0) {
		$('#checkedall_' + $(obj).attr('id')).prop('checked', false);
		var ArrItemUnCheck = arrColumns.filter(x => x.IS_ACTIVE_USER == 0);
		ArrItemUnCheck.forEach(function (item, index) {
			$('input[name="multiselect_' + $(obj).attr('id') + '"][value="' + item.FIELD_ID + '"]').prop('checked', false);
		})
		$('#multi_' + $(obj).attr('id')+' span:last').html(arrColumns.filter(x => x.IS_ACTIVE_USER == 1).length + ' checked')
	}
}

function GetUpdatedRequestCount(isChangeCbo) {
    let companyIndex = GetSessionStorage('companyIndex');
    let fiscalYear = GetSessionStorage('cboYear');
    $.ajax({
        url: '/Home/GetUpdatedRequestCount',
        type: 'GET',
        data: {
            fiscalYear: isChangeCbo ? $('#cboYear').val() : (IsNullOrEmpty(fiscalYear) ? '' : fiscalYear),
            companyIndex: isChangeCbo ? GetValueCompanyIndex() : (IsNullOrEmpty(companyIndex) ? '' : companyIndex),
            isChangeCbo: isChangeCbo,
        },
        success: function (res) {
            if (res) {
                $('.nav-link').each(function () {
                    var funcId = $(this).attr('func_id');
                    var countRequest = null;

                    if (funcId == '50000042') {
                        countRequest = res.CountRequestApproval;
                    }
                    else if (funcId == '50000043') {
                        countRequest = res.CountRequestAttendance;
                    }
                    else if (funcId == '50000044') {
                        countRequest = res.CountRequestComplete;
                    }
                    else if (funcId == '50000045') {
                        countRequest = res.CountRequestReject;
                    }

                    var textWithoutCount = $(this).text().replace(/\s\(\d+\)$/, '');

                    if (res.CountRequestApproval == 0 && res.CountRequestAttendance == 0 && res.CountRequestComplete == 0 && countRequest) {
                        $(this).text(textWithoutCount + ' (0)');
                    }
                    else if (countRequest != null) {
                        $(this).text(textWithoutCount + ' (' + countRequest + ')');
                    }
                    else {
                        $(this).text(textWithoutCount);
                    }
                });
            }
        }
    });
}

function SetSessionStorage(key, value) {
    sessionStorage.setItem(key, value);
}

function GetSessionStorage(key) {
    return sessionStorage.getItem(key);
}

function RemoveSessionStorage(key) {
    sessionStorage.removeItem(key);
}

(function ($) {
    $.fn.hasScrollBar = function () {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

function IsHasSpecialCharacter(str) {
    var specialChar = /\[\{\|\(#\.;;\.#\)\|\}\]/;
    if (specialChar.test(str)) {
        return true;
    }
    else {
        return false
    }
}

function SetFocusWhenAddNew(...ids) {
    ids.forEach(id => {
        var selectedValue = $('#gs_list_' + id).val();
        if (!IsNullOrEmpty(selectedValue)) {
            $('#' + id).val(selectedValue).trigger('change');
        }
    });
}

//HungAnh: Đăng ký sự kiện colorpicker dhx 21/02/2025
//id_1: id của div colorpicker
//id_2: id thẻ input
function InitColorpickerSuite(id_1, id_2, valueColor) {
    colorpickerSuite = new dhx.Colorpicker(null, {
        css: "dhx_widget--bordered",
        grayShades: true,
        palette: [
            ["#D4DAE4", "#B0B8CD", "#949DB1", "#727A8C", "#5E6677", "#3F4757", "#1D2534"],
            ["#FFCDD2", "#FE9998", "#F35C4E", "#E94633", "#D73C2D", "#CA3626", "#BB2B1A"],
            ["#F9E6AD", "#F4D679", "#EDB90F", "#EAA100", "#EA8F00", "#EA7E00", "#EA5D00"],
            ["#BCE4CE", "#90D2AF", "#33B579", "#36955F", "#247346", "#1D5B38", "#17492D"],
            ["#BDF0E9", "#92E7DC", "#02D7C5", "#11B3A5", "#018B80", "#026B60", "#024F43"],
            ["#B3E5FC", "#81D4FA", "#29B6F6", "#039BE5", "#0288D1", "#0277BD", "#01579B"],
            ["#AEC1FF", "#88A3F9", "#5874CD", "#2349AE", "#163FA2", "#083596", "#002381"],
            ["#C5C0DA", "#9F97C1", "#7E6BAD", "#584A8F", "#4F4083", "#473776", "#3A265F"],
            ["#D6BDCC", "#C492AC", "#A9537C", "#963A64", "#81355A", "#6E3051", "#4C2640"],
            ["#D2C5C1", "#B4A09A", "#826358", "#624339", "#5D4037", "#4E342E", "#3E2723"]
        ]
    });

    const popup = new dhx.Popup();
    popup.attach(colorpickerSuite);
    popup.hide();

    //Set color default
    SetColorpicker(valueColor)

    //Xử lý sự kiện change và click
    colorpickerSuite.events.on("change", function (color) {
        $('#' + id_2).val(color);
        popup.hide();
        $('#' + id_1 + ' div').css('background-color', color);
    });

    $('#' + id_1).off("click").on("click", function () {
        popup.show(this);
    });

    return colorpickerSuite;
}

function SetColorpicker(val) {
    if (val == undefined) { val = "" };
    colorpickerSuite.setValue(val);
    colorpickerSuite.setCustomColors([val]);
}
//HungAnh: Đăng ký sự kiện colorpicker dhx 21/02/2025 End

function LoadCboCompany(id, msgSelect, msgAll, func) {
    $.ajax({
        url: "/Common/GetListCompany",
        type: "POST",
        async: false,
        dataType: "json",
        success: function (data) {
            $("#" + id).html(data).attr("multiple", "multiple");
            RegAllCboMulti('ALL', id, msgSelect, msgAll, 'ALL', func);
        },
        error: function () {
        }
    });
}

//HungAnh: 10/03/2025 hàm format text khi chứa kí tự đặc biệt
//isInvoice: true => xu ly cho Invoice
function FormatCharacterSpecialByPaste(ids, isNewChar, isInvoice) {
    ids.forEach(id => {
        $('#' + id).on("paste", function (e) {
            e.preventDefault();
            let pasteData = ParseString((e.originalEvent.clipboardData || window.clipboardData).getData('text'));
            let maxLength = ParseDouble($(this).attr('maxlength'));
            if (boolIsCheckVietnameseText) {
                pasteData = pasteData.normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/đ/g, "d")
                    .replace(/Đ/g, "D");
            }
            let cleanData = isNewChar ? pasteData.replace(/[^A-Za-z0-9_\-\.\ ]/g, '') : pasteData.replace(/[^A-Za-z0-9._-]/g, '');          
            if (isInvoice) {
                cleanData = pasteData.replace(/[^A-Za-z0-9]/g, '');
            }                        

            let input = this;
            let start = input.selectionStart;
            let end = input.selectionEnd;
            let currentValue = input.value;

            input.value = currentValue.substring(0, start) + cleanData + currentValue.substring(end);
            input.setSelectionRange(start + cleanData.length, start + cleanData.length);

            //Check maxLength
            currentValue = input.value;
            if (maxLength > 0 && maxLength < currentValue.length) {
                input.value = currentValue.substring(0, maxLength);
            }
        });
    });
}
//HungAnh: 10/03/2025 hàm format text khi chứa kí tự đặc biệt end

function GetFiscalYear(date) {
    if (!IsNullOrEmpty(date) && isDateFormat(date)) {
        return new Date(date).AddMonth(-3).getFullYear();
    }

    return new Date().AddMonth(-3).getFullYear();
}

//HungAnh: 21/03/2025 ham kiem tra va format so khi copy/paste
function ValidateIsNumByPaste(ids) {
    ids.forEach(id => {
        $('#' + id).off("paste").on("paste", function (e) {
            e.preventDefault();
            let pasteData = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
            let cleanData = pasteData.replace(/\D/g, '');

            if (cleanData) {
                let input = $(this);
                let start = input[0].selectionStart;
                let end = input[0].selectionEnd;
                let currentValue = input.val();
                let newValue = currentValue.substring(0, start) + cleanData + currentValue.substring(end);

                input.val(newValue);
                input[0].setSelectionRange(start + cleanData.length, start + cleanData.length);
                input.trigger('change');
            }
        });
    });
}
//HungAnh: 21/03/2025 ham kiem tra va format so khi copy/paste End

//HungAnh: Canh giua popup 24/03/2025
function SetCenterModalBootstrap(modalId, w, h) {
    let modal = $(modalId);
    let modalDialog = modal.find('.modal-dialog');
    let modalContent = modal.find('.modal-content');
    let winWidth = $(window).width(), winHeight = $(window).height();
    let isMobile = winWidth <= 768;
    let width = isMobile ? winWidth * 0.95 : Math.min(winWidth * 0.9, w);
    let height = isMobile ? winHeight * 0.9 : Math.min(winHeight * 0.9, h);

    ////Set kich thuoc popup ngay khi vua mo
    modalDialog.css({
        'min-width': width + 'px',
        'min-height': height + 'px',
        'height': height + 'px',
        'position': 'fixed'
    });
    ////Lay width/height de tinh toan lai top/left cho popup
    let height_div = modalDialog.outerHeight(), width_div = modalDialog.outerWidth();
    let top = Math.max((winHeight - height_div - 45) / 2, 10);
    let left = Math.max((winWidth - width_div) / 2, 10);

    if (width_div > winWidth) { left = 10; }
    modalContent.css({ 'height': '100%' });
    modalDialog.css({ 'top': Math.ceil(top) + 'px', 'left': Math.ceil(left) + 'px', 'visibility': 'visible' });

    ////ResizeObserver: theo doi kich thuoc phan tu cu the
    ////Do kich thuoc thay doi nen phai lay lai size de resize lai popup
    let observer = new ResizeObserver(() => {
        if (modal.is(':visible')) {
            let newWinWidth = $(window).width(), newWinHeight = $(window).height();
            isMobile = newWinWidth <= 768;
            let newWidth = isMobile ? newWinWidth * 0.95 : Math.min(newWinWidth * 0.9, w);
            let newHeight = isMobile ? newWinHeight * 0.9 : Math.min(newWinHeight * 0.9, h);

            modalDialog.css({ 'min-width': (newWidth - 30) + 'px', 'min-height': newHeight + 'px' });

            ////Lay width/height de tinh toan lai top/left cho popup sau khi resize
            let newTop = Math.max((newWinHeight - modalDialog.outerHeight() - 50) / 2, 10);
            let newLeft = Math.max((newWinWidth - modalDialog.outerWidth()) / 2, 10);

            modalDialog.css({ 'top': Math.ceil(newTop) + 'px', 'left': Math.ceil(newLeft) + 'px' });
            modalContent.css({ 'width': '', 'height': modalDialog.outerHeight()-50, 'left': '', 'top': '' });
            if (isMobile) {
                modalDialog.css({ 'width': '', 'height': '' });
            }

            let modalHeight = modalContent.height() || 400;

            $('.carousel-item img').css({ 'height': modalHeight - 180 });
        }
    });

    observer.observe(document.body);
    RegisterDraggable(modalDialog);
}
//HungAnh: Canh giua popup 24/03/2025 End

//HungAnh: 25/03/2025 viet ham dang ky su kien modal
function RegEvtModalBootstrap(modalId, isResize, w, h, gridId, funcAfterShow) {
    let modal = $(modalId).modal('show');
    let modalDialog = modal.find('.modal-dialog');
    let modalContent = modal.find('.modal-content');

    modalDialog.css('visibility', 'hidden');
    modal.off('shown.bs.modal').on('shown.bs.modal', function () {
        SetCenterModalBootstrap(modalId, w, h);
        if (funcAfterShow) {
            funcAfterShow();
        }
    });

    if (isResize) {
        modalContent.resizable({
            minWidth: 600,
            minHeight: 250,
            handles: 'n, e, s, w, ne, sw, se, nw',
            resize: function (event, ui) {
                let modalHeight = ui.size.height; 

                if (!IsNullOrEmpty(gridId)) {
                    $(gridId).height(modalHeight - 185);
                } else {
                    $(event.target).height(modalHeight);
                }

                $('.carousel-item img').css({ 'height': modalHeight - 180 });
            },
        });
    }

    modal.off('hidden.bs.modal').on('hidden.bs.modal', function () {
        modalDialog.css({ 'width': '', 'height': '', 'top': '', 'left': '' });
        modalContent.css({ 'width': '', 'height': '', 'left': '' });
        $('.carousel-item img').css({ 'height': 500 });
    });
}
//HungAnh: 15/03/2025 viet ham dang ky su kien modal end
//Phuvm 26/3/2025 thay thế ký tự đặc biệt bằng _ để upload file 
function replaceSpecialChars(filename, replacement = '_') {
	// Tách phần tên file và phần đuôi file
	const parts = filename.split('.');

	// Hàm kiểm tra và thay thế ký tự đặc biệt, giữ nguyên tiếng Việt
	const replaceSpecialOnly = (str) => {
		// Regex loại bỏ các ký tự đặc biệt nhưng giữ lại chữ cái (bao gồm tiếng Việt)
		return str.replace("'", replacement);
	};

	// Nếu file có đuôi
	if (parts.length > 1) {
		const extension = parts.pop(); // Lấy phần đuôi file
		const namePart = parts.join('.'); // Gộp lại phần tên nếu có nhiều dấu chấm

		// Loại bỏ các ký tự đặc biệt ở phần tên, giữ nguyên đuôi file và tiếng Việt
		const cleanName = replaceSpecialOnly(namePart);
		return `${cleanName}.${extension}`;
	}

	// Nếu không có đuôi file, replace các ký tự đặc biệt
	return replaceSpecialOnly(filename);
}
//Phuvm 26/3/2025 hàm replace ký tự đặc biệt cho nhiều file 
function replaceSpecialCharsObjectFile(ObjectFile) {
	if (ObjectFile.length > 0) {
		// Giả sử existingFile là file gốc của bạn
		for (let i = 0; i < ObjectFile.length; i++) {
			const existingFile = ObjectFile[i];

			const newFile = new File([existingFile], replaceSpecialChars(ObjectFile[i].name), {
				type: existingFile.type,
				lastModified: existingFile.lastModified
			});

			// Thay thế file cũ bằng file mới
			ObjectFile[i] = newFile;
		}
	}
	return ObjectFile;
}

//HungAnh: Format value co kieu 3 ngon ngu ghep voi nhau 27/03/2025
function FormatSpecialCharacterCommon(cellvalue) {
    let lastDashIndex = cellvalue.lastIndexOf(" - ");
    let mainPart = cellvalue;
    let trailingPart = "";

    if (lastDashIndex !== -1) {
        mainPart = cellvalue.substring(0, lastDashIndex);
        trailingPart = cellvalue.substring(lastDashIndex);
    }

    let value = mainPart.split(strSplit);
    if (value.length > 1) {
        let result = "";
        if (langCurrent == 'ja') {
            result = value[0].trim();
        } else if (langCurrent == 'en') {
            result = value[1].trim();
        } else {
            result = value.length > 2 ? value[2].trim() : value[1].trim();
        }
        return result + trailingPart;
    }
}
//HungAnh: Format value co kieu 3 ngon ngu ghep voi nhau 27/03/2025 End

//HungAnh: Custom ham xuat excel, word 10/04/2025
function DownloadFileCommon(res, type) {
    var typeExport = '';
    if (type == 1) { //Excel
        typeExport = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    else if (type == 2) { //Word
        typeExport = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    else if (type == 3) { //Pdf
        typeExport = 'application/pdf';
    }

    var blob = new Blob([new Uint8Array(res.data)], { type: typeExport });
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = res.fileName;
    a.click();
}
//HungAnh: Custom ham xuat excel, word 10/04/2025 End

//HungAnh: Hàm lưu, xóa data trên local storage
function CreateLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function ReadLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

function RemoveLocalStorage(key) {
    localStorage.removeItem(key);
}
//HungAnh: Hàm lưu, xóa data trên local storage End

//HungAnh: Ham format text khi nhap tieng viet(dung cho cac man hinh co chua ma code)
function CleanVietnameseChar(str, isInvoice) {
    let value = str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");

    value = isInvoice ? value.replace(/[^A-Za-z0-9]/g, "") : value.replace(/[^A-Za-z0-9._-]/g, "");

    return value;
}

function FormatTextOnInput(el, isInvoice) {
    setTimeout(() => {
        let pos = el.selectionStart;
        let before = el.value;
        let after = CleanVietnameseChar(before, isInvoice);

        if (before !== after) {
            let diffBefore = before.slice(0, pos);
            let diffAfter = CleanVietnameseChar(diffBefore, isInvoice);
            let newPos = diffAfter.length;

            el.value = after;
            el.setSelectionRange(newPos, newPos);
        }
    }, 0);
}

function ScrollToRowByCookie(gridApi, cookieKey, rowDataKey) {
    let rowIndex = PFN_readCookie(cookieKey);
    if (!IsNullOrEmpty(rowIndex)) {
        gridApi.getGridOption('rowData').some((obj, index) => {
            if (obj[rowDataKey] == rowIndex) {
                gridApi.ensureIndexVisible(index, 'bottom');
                let rowNode = gridApi.getDisplayedRowAtIndex(index);
                rowNode.setSelected(true);
                return true;
            }
            return false;
        });

        PFN_createCookie(cookieKey, '', -1);
    }
}
//TuanLn: Thêm hàm xử lý collapse filter search
function RegEventCollapse() {
    var $collapse = $('#collapseSearch');
    var $btn = $('#btnSearch');
    // Chỉ set trạng thái lúc load lần đầu
    if ($(window).width() > 768) {
        // Desktop → mở sẵn
        $collapse.addClass('in'); // Bootstrap 3: class "in" = show
        $btn.removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up');
    } else {
        // Mobile → đóng sẵn
        $collapse.removeClass('in');
        $btn.removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down');
    }
    // Sự kiện toggle icon
    $collapse.on('shown.bs.collapse hidden.bs.collapse', function () {
        $btn.toggleClass('glyphicon-menu-down glyphicon-menu-up');
        setWidthHeightGrid(25);
    });
}
//TuanLn: Thêm hàm check đang mở trên trình duyệt mobile hay không
function isMobileBrowser() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toInt(x, d = 0) { x = Number(x); return Number.isFinite(x) ? Math.trunc(x) : d; }
/**
* makePaginator(opts)
* opts = {
*  listEl: Element | selector,
*  pagerEl: Element | selector,
*  data?: any[],                          // client-side
*  fetch?: ({page, pageSize}) => Promise<{items:any[], total:number}>, // server-side
*  render: (item, i) => string,           // return HTML string
*  page?: number,                         // default 1
*  pageSize?: number,                     // default 20
*  window?: number,                       // page window around current, default 2
*  total?: number,                        // optional when data not given but known
*  emptyText?: string,                    // default 'No data'
*  onChange?: (state) => void             // callback after render
* }
*/
function makePaginator(opts) {
    let {
        data = [],
        listEl,
        pagerEl,
        infoEl,          // tùy chọn
        page = 1,
        pageSize = 10,
        renderItem,      // (item) => html string
        render,          // (items, state) => tự render toàn bộ
        onChange         // (state) => {}
    } = opts;

    const $list = typeof listEl === 'string' ? document.querySelector(listEl) : listEl;
    const $pager = typeof pagerEl === 'string' ? document.querySelector(pagerEl) : pagerEl;
    const $info = infoEl ? (typeof infoEl === 'string' ? document.querySelector(infoEl) : infoEl) : null;

   
    function state() {
        if (pageSize == '*') {
            pageSize = data.length;
        }
         
        const total = data.length;
        const pages = Math.max(1, Math.ceil(total / pageSize));
        page = Math.min(Math.max(1, page), pages);
        const start = ((page - 1) * pageSize) != 0 ? (page - 1) * pageSize : 0;
        const end = Math.min(start + pageSize, total);
        return { page, pages, pageSize, total, start, end };
    }

    function drawInfo(s) {
        if ($info) $info.textContent = `Showing ${s.total ? s.start + 1 : 0} to ${s.end} of ${s.total} entries`;
    }

    function btn(label, disabled, active, click) {
        const li = document.createElement('li');
        li.className = 'page-item' + (disabled ? ' disabled' : '') + (active ? ' active' : '');

        const a = document.createElement('button');
        a.className = 'page-link btn btn-light-secondary';
        a.onclick = e => { e.preventDefault(); if (!disabled) click(); };

        if (label === 'left' || label === 'right') {
            let icon = (label === 'left' ? '<' : '>');
            a.textContent = icon; 
        } else {
            a.textContent = label;   // ← số trang
        }

        li.appendChild(a);
        return li;                 // ← trả về <li>, KHÔNG trả về <ul>
    }
    function dots() {
        const li = document.createElement('li');
        li.className = 'page-item disabled';
        li.innerHTML = '<span class="page-link">…</span>';
        return li;
    }

    function drawPager(s) {
        if (!$pager) return;
        $pager.innerHTML = '';
        $pager.appendChild(btn('left', s.page === 1, false, () => { page--; refresh(); }));
        const push = n => $pager.appendChild(btn(String(n), false, n === s.page, () => { page = n; refresh(); }));

        if (s.pages <= 7) {
            for (let i = 1; i <= s.pages; i++) push(i);
        } else {
            push(1);
            if (s.page > 3) $pager.appendChild(dots());
            for (let i of [s.page - 1, s.page, s.page + 1]) if (i > 1 && i < s.pages) push(i);
            if (s.page < s.pages - 2) $pager.appendChild(dots());
            push(s.pages);
           
        }
        $pager.appendChild(btn('right', s.page === s.pages, false, () => { page++; refresh(); }));
    }

    function drawList(slice, s) {
        if (render) return render(slice, s);
        if (!$list) return;
        if (!renderItem) {
            // fallback tối giản
            $list.innerHTML = slice.map(x => `<div>${x.rowNo ?? ''} ${x.farmerName ?? ''}</div>`).join('');
        } else {
            $list.innerHTML = slice.map(renderItem).join('');
        }
    }

    function refresh() {
        const s = state();
        const slice = data.slice(s.start, s.end);
        drawList(slice, s);
        drawInfo(s);
        drawPager(s);
        onChange && onChange(s);
    }

    // API
    const api = {
        goto: p => { page = p; refresh(); },
        next: () => { page++; refresh(); },
        prev: () => { page--; refresh(); },
        setPageSize: n => { pageSize = n; page = 1; refresh(); },
        reload: arr => { data = Array.isArray(arr) ? arr : []; page = 1; refresh(); },
        getState: () => state(),
        getCurrentPage: () => state().page,
        getTotalPages: () => state().pages
    };

    refresh();
    return api;
}
function LoadComboAgent(Obj) {
    $('#' + Obj).select2();
}


//Phuvm 10/4/2025 set ngôn ngữ
function SetLanguage(langCurrent) {
    const returnUrl = location.pathname + location.search; // local path
    $.ajax({
        type: "POST",
        datatype: "json",
        url: '/Common/SetLanguageCookie',
        data: { culture: langCurrent, returnUrl: returnUrl },
        async: false,
        success: function (res) {
            if (res && res.redirectUrl) window.location.href = res.redirectUrl;
            else location.reload();
        }
	});
}

//


//function ShowOrHideRowChildren(id_list, selector, funcSetValueArrParentIds, sortOrder) {
//    var selectorCell = $(selector).parent().parent().parent();
//    var selectorRow = $(selectorCell).parent();
//    var itemParent = ListDataFull.find(x => x.sortIdList == id_list);
//    var row_index = parseInt($(selectorRow).attr('row-index')) + 1;
//    var listChild;
//    if (sortOrder == 1) {
//        listChild = ListRowChild.filter(function (item) {
//            return id_list == id_list.substring(0, item.sortIdList.lastIndexOf('__'));
//        });
//    }
//    else if (sortOrder == 2) {
//        listChild = ListRowChild.filter(function (item) {
//            return item.sortIdList.includes(id_list) && item.sortOrder == sortOrder + 1;
//        });
//    }

//    if (itemParent.isOpenChild) {
//        //Close Row
//        $(selector).attr('class', 'ag-icon ag-icon-tree-closed');
//        itemParent.isOpenChild = false;
//        gridApi.applyTransaction({ remove: listChild });
//        listChild.forEach(function (item) {
//            item.isOpenChild = false;
//        });

//        if (typeof funcSetValueArrParentIds === 'function') {
//            let arrParentIds = [...listChild.map(x => x.sortIdList)];
//            funcSetValueArrParentIds(arrParentIds, false);
//        }
//    } else {
//        if (sortOrder == 1) {
//            if (arrConstant.isCheckAll) {
//                listChild = ListDataFull.filter(function (item) {
//                    return item.sortOrder > sortOrder;
//                });
//                ListDataFull.filter(x => x.isOpenChild = arrConstant.isCheckAll);
//            }
//            else {
//                listChild = listChild.filter(function (item) {
//                    return item.sortOrder == sortOrder + 1;
//                });
//            }
//        }
//        //Open Row
//        $(selector).attr('class', 'ag-icon ag-icon-tree-open');
//        itemParent.isOpenChild = true;
//        gridApi.applyTransaction({
//            add: listChild,
//            addIndex: row_index,
//        });

//        if (typeof funcSetValueArrParentIds === 'function') {
//            let arrParentIds = [...listChild.map(x => x.sortIdList)];
//            funcSetValueArrParentIds(arrParentIds, true);
//        }
//    }
//}
function renderPagination(agPaging, gridApiPaging,listDataPaging, IsOptionAll = false) {
    let idListPaging = 'ListPaging',idPaging = 'Paging',startCell = 'start-entries',lastCell = 'last-entries',totalCell = 'total-entries';
    let element =
    `<div class="grid-info">
        <div class="ag-paging-grid">
            <span>${arrMsg.key_rowperpage}</span>:
            <select class="datatable-selector selector-paging cboSelect2SearchPage" name="per-page" id="selectorPaging">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="*">All</option>
            </select>
        </div>
        <label>
            <span id="${startCell}">1</span>
            <span>-</span>
            <span id="${lastCell}"></span>
            <span>${arrMsg.key_of}</span>
            <span id="${totalCell}"></span>
        </label>
    </div>
    <nav class="grid-paging" id="${idListPaging}">
        <ul id="${idPaging}" class="pagination pagination-sm mb-0"></ul>
        <span id="rowCount" style="margin-left:12px"></span>
    </nav>`;
    if (arrConstant.isLoadFirst) {
        arrConstant.isLoadFirst = false;
        $('#' + agPaging).append(element);
    }
    $('.cboSelect2SearchPage').css("width", 50);
    $('.cboSelect2SearchPage').select2({
        placeholder: 'Vui lòng chọn',
        minimumResultsForSearch: Infinity
    });
    pagerApi = makePaginator({
        data: listDataPaging,
        listEl: '#' + idPaging,
        pagerEl: '#' + idListPaging,
        page: 1,
        pageSize: $('.selector-paging').val(),
        renderItem: x => ``,
        onChange: s => {
            gridApiPaging.setGridOption("rowData", (IsOptionAll ? listDataPaging.slice(1, s.total) : listDataPaging.slice(s.start, s.end)));
            OnChangePaging(s);
        }
    });
    function OnChangePaging(s) {
        let total = s.total;
        let start = (s.start == 0 ? 1 : s.start);
        let last = (s.start + parseInt(s.pageSize)) > total ? total : s.start + parseInt(s.pageSize);
        $('#' + totalCell).text(total);
        $('#' + startCell).text(start);
        $('#' + lastCell).text(last);
    }
}
function OnDragMoveSetRow() {
    const start = (arrConstant.page - 1) * arrConstant.pageSize;
    const n = gridApi.getDisplayedRowCount();
    const ordered = [];
    for (let i = 0; i < n; i++) {
        ordered.push(gridApi.getDisplayedRowAtIndex(i).data);
    }
    // ghi đè đoạn trang hiện tại vào mảng gốc
    ListDataFull.splice(start, n, ...ordered);
}
function ApplyCboSelect2() {
    /* =========================================
       Cbobox Select2 No Search
    ========================================= */
    $('.cboSelect2NoSearch').each(function () {
        if ($(this).find('option').length === 0) {
            $(this).append('<option></option>');
        }
    });
    $('.cboSelect2NoSearch').select2({
        placeholder: 'Vui lòng chọn',
        minimumResultsForSearch: Infinity,
        allowClear: true
    });
    $('.cboSelect2NoSearch').on('click', function (e) {
        let idElemnt = $(this).attr('id');
        RemoveValidateError(idElemnt);
    })
    /* =========================================
       Cbobox Select2 Search
    ========================================= */
    $('.cboSelect2Search').css("width", 200);
    $('.cboSelect2Search').select2({
        placeholder: 'Vui lòng chọn',
        allowClear: true

    });
}
function RenderComboBox(arrlstData, idElemnt, selectFirst) {
    let ComboBoxHtml = "";
    if (selectFirst) {
        ComboBoxHtml += `<option value="">${arrMsg.key_vuilongchon}</option>`;
    }
    arrlstData.forEach((item, index) => {
        ComboBoxHtml += `<option value="${item.value}">${item.text}</option>`;
    });
    $('#' + idElemnt).html(ComboBoxHtml);
}

function ValidateError(idElemnt) {
    $('#' + idElemnt).addClass('error');
}
function RemoveValidateError(idElemnt) {
    $('#' + idElemnt).addClass('error');
}
function LogoutAuth() {
    // Create form và submit
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/Account/Logout';

    // Add anti-forgery token
    const token = document.querySelector('input[name="__RequestVerificationToken"]');
    if (token) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = '__RequestVerificationToken';
        input.value = token.value;
        form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
    
}
// ========================================
// CLOSE MODAL
// ========================================
function closeModal(idModal, idForm) {
    if (!IsNullOrEmpty(idModal)) {
        $('#' + idModal).fadeOut(300).hide();
    };
    if (!IsNullOrEmpty(idForm)) { $('#' + idForm)[0].reset() };
}
function loadChartOverview(idElement, type) {
    let objectChart;
    if (type == 'overview') {
        objectChart = {
            chart: {
                height: 320,
                type: 'donut'
            },
            series: [objectAgent.total, objectFarm.total],
            colors: [objectAgent.color, objectFarm.color],
            labels: [arrMsg.key_tongdaily, arrMsg.key_tongnhavuon],
            fill: {
                opacity: [1, 1, 1, 0.3]
            },
            legend: {
                show: false
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            name: {
                                show: true
                            },
                            value: {
                                show: true
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            responsive: [
                {
                    breakpoint: 575,
                    options: {
                        chart: {
                            height: 250
                        },
                        plotOptions: {
                            pie: {
                                donut: {
                                    size: '65%',
                                    labels: {
                                        show: false
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        };

    }
    else if (type == 'sale') {
        objectChart = {
            chart: {
                type: 'bar',
                height: 430,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    columnWidth: '40%',
                    borderRadius: 4
                }
            },
            stroke: {
                show: true,
                width: 8,
                colors: ['transparent']
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                show: true,
                fontFamily: `'Public Sans', sans-serif`,
                offsetX: 10,
                offsetY: 10,
                labels: {
                    useSeriesColors: false
                },
                markers: {
                    width: 10,
                    height: 10,
                    radius: '50%',
                    offsexX: 2,
                    offsexY: 2
                },
                itemMargin: {
                    horizontal: 15,
                    vertical: 5
                }
            },
            colors: ['#E58A00', '#4680FF'],
            series: [
                {
                    name: arrMsg.key_tongsoluongnguyenlieudamua,
                    data: [180, 90, 135, 114, 120, 145]
                },
                {
                    name: arrMsg.key_tongthanhphamdavanchuyen,
                    data: [120, 45, 78, 150, 168, 99]
                }
            ],
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
            }
        };
    }
    else if (type == 'Farm') {
        objectChart = {
            series: [objectFarm.total],
            chart: {
                height: 150,
                type: 'radialBar'
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        margin: 0,
                        size: '60%',
                        background: 'transparent',
                        imageOffsetX: 0,
                        imageOffsetY: 0,
                        position: 'front'
                    },
                    track: {
                        background: objectFarm.color,
                        strokeWidth: '50%'
                    },

                    dataLabels: {
                        show: true,
                        name: {
                            show: false
                        },
                        value: {
                            formatter: function (val) {
                                return parseInt(val);
                            },
                            offsetY: 7,
                            color: objectFarm.color,
                            fontSize: '20px',
                            fontWeight: '700',
                            show: true
                        }
                    }
                }
            },
            colors: [objectFarm.color],
            fill: {
                type: 'solid'
            },
            stroke: {
                lineCap: 'round'
            }
        };
    }
    else if (type == 'Agent') {
        objectChart = {
            series: [objectAgent.total],
            chart: {
                height: 150,
                type: 'radialBar'
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        margin: 0,
                        size: '60%',
                        background: 'transparent',
                        imageOffsetX: 0,
                        imageOffsetY: 0,
                        position: 'front'
                    },
                    track: {
                        background: objectAgent.color,
                        strokeWidth: '50%'
                    },

                    dataLabels: {
                        show: true,
                        name: {
                            show: false
                        },
                        value: {
                            formatter: function (val) {
                                return parseInt(val);
                            },
                            offsetY: 7,
                            color: objectAgent.color,
                            fontSize: '20px',
                            fontWeight: '700',
                            show: true
                        }
                    }
                }
            },
            colors: [objectAgent.color],
            fill: {
                type: 'solid'
            },
            stroke: {
                lineCap: 'round'
            }
        };
    }
    else if (type == 'Report') {
        objectChart = {
            chart: {
                height: 250,
                type: 'bar',
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 4,
                    borderRadiusApplication: 'end'
                }
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'left'
            },
            dataLabels: {
                enabled: false
            },
            colors: ['#4680FF', '#4680FF'],
            stroke: {
                show: true,
                width: 3,
                colors: ['transparent']
            },
            fill: {
                colors: ['#4680FF', '#4680FF'],
                opacity: [1, 0.5]
            },
            grid: {
                strokeDashArray: 4
            },
            series: [
                {
                    name: arrMsg.key_tongsoluongnguyenlieudamua,
                    data: [76, 85, 101, 98, 87, 105, 91]
                },
                {
                    name: arrMsg.key_tongthanhphamdavanchuyen,
                    data: [44, 55, 57, 56, 61, 58, 63]
                }
            ],
            xaxis: {
                categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return '$ ' + val + ' thousands';
                    }
                }
            }
        };
    }
    var chart = new ApexCharts(document.querySelector('#' + idElement), objectChart);
    chart.render();
}