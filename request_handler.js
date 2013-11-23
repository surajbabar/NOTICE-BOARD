var nodemailer = require('nodemailer');
var mailSender = require('./mailSender.js').mailSender;
var url = require('url');
var http = require('http');
var pages = require('./readfile.js').pages;
var contentType = {html:'text/html',jpg:'image/jpeg',ico:'image/x-icon'};

var getNoticeFromURL = function(req,res){
    var notice = {};
    var address = url.parse(req.url,true);
    notice.sender = address.query.author;
    notice.subject = address.query.subject;
    notice.message = address.query.message;
    notice.date = new Date();
    if(notice.sender && notice.subject && notice.message && notice.date)
         return notice;
    return 0;
};
var addNewNotice = function(res,notice){
    pages.noticeBoard.push(notice);
    var noticePath = './notice_files/dataBase/notices.json'; 
    fs.writeFile(noticePath,JSON.stringify(pages.noticeBoard));
    res.write('<a href = "/see">Notice added. Click here to see</a>');
    res.end();
};
var handler = {};
handler['/back.jpg'] = function(req,res){
    res.writeHead(200,{'Content-Type': contentType.jpg});
    res.write(pages.back_jpg);
    res.end();
};
handler['/images/bg.jpg'] = function(req,res){
    res.writeHead(200,{'Content-Type': contentType.jpg});
    res.write(pages.bg_jpg);
    res.end();
};
handler['/sth.css'] = function(req,res){
    res.writeHead(200,{'Content-Type': contentType.css});
    res.write(pages.sth_css);
    res.end();
};

handler['/login'] = function(req,res){
    userDetails = url.parse(req.url,true).query;
    var options = {hostname: 'localhost', port: 8085,};
    var user = {};
    user.id = userDetails.userID;
    user.password = userDetails.password;
    pages.loginDetails[user.id] &&
        (pages.loginDetails[user.id].password == user.password) &&
        (pages.home = pages.home.replace(/none/g,'block'))&&
        (pages.home = pages.home.replace(/block/,'none'));
    handler['/'](req,res);
};
handler['/post'] = function(req,res){
    res.writeHead(200, {"Content-Type":contentType.html});
    var notice = getNoticeFromURL(req,res);
    notice && addNewNotice(res,notice);
    res.write(pages.addNotice_html);
    res.end();
    return 1;
};
handler['/logout'] = function(req,res){
    (pages.home = pages.home.replace(/block/g,'none'))&&
    (pages.home = pages.home.replace(/none/,'block'));
    res.write(pages.home);
    res.end();
}
handler['/signUp'] = function(req,res){
    res.writeHead(200, {"Content-Type":"text/html"});
    res.write(pages.verification);
    res.end();
};
handler['/verify'] = function(req,res){
    var userDetails = {};
    var code = parseInt(Math.random()*1000000);
    console.log("AAA",decodeURIComponent('%40'));
    var getUserInfo = function(data){
        var fields = data.split('&');
        fields.forEach(function(field){
            field = field.split('=');
            userDetails[field[0]] = field[1];
        });
    };
    req.setEncoding('utf-8');
    req.on('data',getUserInfo);
    res.writeHead(200, {"Content-Type":"text/html"});
    req.on('end',function(data){
        if(!pages.loginDetails[userDetails.uName]){
            pages.loginDetails[userDetails.uName]={};
        userDetails.Email = userDetails.Email.replace(/%40/,'@');
        mailSender.message.to =userDetails.Email; 
        var notice = mailSender.message.text;
        mailSender.message.text = notice.replace(/RANDOMCODE/,code);
        mailSender.transport.sendMail(mailSender.message, function(error){
            if(error){
                console.log('Error occured\r\n'+error.message);
                return;
            }            
        });
        mailSender.message.text = notice;
        res.write(pages.signUp.replace('NAME',userDetails.uName).replace('EMAIL',userDetails.Email));
        }
        else
        res.write(pages.verification);
    });
    res.end();
};
handler['/signUpInfo'] = function(req,res){
    var userDetails = {};
    var getUserInfo = function(data){
        var fields = data.split('&');
        fields.forEach(function(field){
            field = field.split('=');
            userDetails[field[0]] = field[1];
        });
    };
    req.setEncoding('utf-8');
    req.on('data',getUserInfo);
    req.on('end',function(data){
        pages.loginDetails[userDetails.uName].password = userDetails.Npwd;
        pages.loginDetails[userDetails.uName].email = userDetails.Email;
        (pages.home = pages.home.replace(/none/g,'block')) &&
        (pages.home = pages.home.replace(/block/,'none')); 
    console.log(userDetails.Email);
        fs.writeFile('./notice_files/dataBase/loginDetails.json',JSON.stringify(pages.loginDetails));
        res.write(pages.home);
    });    
    res.end();
};
handler['/supportScripts.js'] = function(req,res){
    res.writeHead(200,{'Content-Type': contentType.css});
    res.write(pages.supportScriptsJs);
    res.end();
};

exports.path = handler;