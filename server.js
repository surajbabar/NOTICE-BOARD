var pages = require('./readfile.js').pages;
var path =  require('./readfile.js').path;

var fs = require('fs');

var express = require('express');
var notice = express();
notice.listen('8085');
notice.use(express.bodyParser()); 

notice.post('/verify', function(req, res){
	res.sendfile(path.signUp);
});
notice.post('/signUp', function(req, res){
	res.sendfile(path.verification);
});
notice.post('/profile', function(req, res){
	res.sendfile(path.profile);
});
notice.get('/profile/view_notices', function(req, res){
    var notices = [];
    pages.noticeBoard.forEach(function(notice,index){
        notice = "Author : " + notice.sender + '\n' +
                 "Date : " + notice.date + '\n' +
                 "Subject : " + notice.subject + '\n' +
                                notice.message + '\n';
        notice = notice.replace(/\n/g,'<br/>');
        notices.push(notice);
    });
    pages.viewNotice = pages.viewNotice.replace(/{TEXT}/,notices.join('<br/>'));
	res.send(pages.viewNotice);
});
notice.get('/profile/post_notice', function(req, res){
	res.sendfile(path.addNotice);
});
notice.post('/profile/view_notices', function(req, res){
    var notice = req.body;
    notice.date = new Date();
    pages.noticeBoard.unshift(notice);
    fs.writeFile('./notice_files/dataBase/notices.json',JSON.stringify(pages.noticeBoard));
    res.redirect('/profile/view_notices');
});
notice.post('/login', function(req, res){
	res.sendfile(path.home);
});
notice.get('/*',function(req , res){
	res.sendfile(path.home);
});
