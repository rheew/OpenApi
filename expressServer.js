const express = require("express");
const app = express();
const path = require("path");
const request = require("request");
var mysql = require("mysql");
const jwt = require('jsonwebtoken');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0917",
  database: "fintech",
  port: "3306",
});

connection.connect();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public"))); //to use static asset

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.get("/main", function (req, res) {
  res.render("main");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get('/authTest', function (req, res){
  res.json('로그인이 완료된 사용자가 보는 화면')
});

app.get("/authResult", function (req, res) {
  var authCode = req.query.code;
  console.log("사용자 인증코드 : ", authCode);
  var option = {
    method: "POST",
    url: "https://testapi.openbanking.or.kr/oauth/2.0/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
    form: {
      code: authCode,
      //#자기 키로 시크릿 변경
      client_id: "ejOB306bkBwKMuO7VJBSepyZu6h5ooH52j2RFHVf",
      client_secret: "mn42bF3hegqPFsZVDJ6zVhx5t8M6D2Iwzxx7Xb7J",
      redirect_uri: "http://localhost:3000/authResult",
      grant_type: "authorization_code",
    },
  };
  request(option, function (error, response, body) {
    if (error) {
      console.error(error);
      throw error;
    } else {
      var accessRequestResult = JSON.parse(body);
      console.log(accessRequestResult);
      res.render("resultChild", { data: accessRequestResult });
    }
  });
});

app.post("/signup", function (req, res) {
  console.log(req.body);
  var userName = req.body.userName;
  var userPassword = req.body.userPassword;
  var userEmail = req.body.userEmail;
  var userAccessToken = req.body.userAccessToken;
  var userRefreshToken = req.body.userRefreshToken;
  var userSeqNo = req.body.userSeqNo;

  var sql =
    "INSERT INTO user (`name`, `email`, `password`, `accesstoken`, `refreshtoken`, `userseqno`) VALUES (?, ?, ?, ?, ?, ?)";
  connection.query(
    sql,
    [
      userName,
      userEmail,
      userPassword,
      userAccessToken,
      userRefreshToken,
      userSeqNo,
    ],
    function (error, results) {
      if (error) throw error;
      else {
        res.json(1);
      }
    }
  );
});


app.post("/login", function (req, res) {
  console.log(req.body);
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var sql = "SELECT * FROM user WHERE email = ?";
  connection.query(sql, [userEmail], function (error, results) {
    if (error) throw error;
    else {
      if (results.length == 0) {
        res.json("등록되지 않은 회원입니다.");
      } else {
        var dbPassword = results[0].password;
        console.log("db 에서 가져온 패스워드", dbPassword);
        if (userPassword == dbPassword) {
          var tokenKey = "f@i#n%tne#ckfhlafkd0102test!@#%";
          jwt.sign(
            {
              userId: results[0].id,
              userEmail: results[0].email,
            },
            tokenKey,
            {
              expiresIn: "10d",
              issuer: "fintech.admin",
              subject: "user.login.info",
            },
            function (err, token) {
              console.log("로그인 성공", token);
              res.json(token);
            }
          );
        } else {
          res.json("비밀번호가 다릅니다");
        }
      }
    }
  });
});

app.post('/list', function (req, res){
  //request 계좌 목록 조회 요청 만들기 request 모듈 활용
  //res.json(api 결과 body 객체)

  
  var option = {
    method: "GET",
    url: "https://testapi.openbanking.or.kr/v2.0/user/me",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      'Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxMTAwNzYwNTI2Iiwic2NvcGUiOlsiaW5xdWlyeSIsImxvZ2luIiwidHJhbnNmZXIiXSwiaXNzIjoiaHR0cHM6Ly93d3cub3BlbmJhbmtpbmcub3Iua3IiLCJleHAiOjE2MDIzOTM1ODAsImp0aSI6IjlhY2NjOWQ2LWU4NTktNDY2Ny05NDI3LTJkZGI1YWM4YzVjNSJ9.9JG7xn'
    },
    //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
    form: {
      user_seq_no: 1100760526
    },
  };
  request(option, function (error, response, body) {
    if (error) {
      console.error(error);
      throw error;
    } else {
      var accessRequestResult = JSON.parse(body);
      console.log(accessRequestResult);
      res.render("main", { data: accessRequestResult });
    }
  });
})
app.listen(3000);