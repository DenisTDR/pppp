var MongoClient = require('mongodb').MongoClient;
console.log("da");
// Connect to the db
MongoClient.connect("mongodb://192.168.56.101:27017/admin", function (err, db) {
    if (err) {
        return console.dir(err);
    }

    console.log("connected");
    var dbauthresult = db.authenticate("adminsmt", "adminsmt2016", function (err, res) {
        if (err) {
            return console.dir(err);
        }
        console.log("authed");

        var db2 = db.db("ppp");
        var collections = {
            companies: db2.collection("companies"),
            users: db2.collection("users")
        };
        getData(collections);
        console.log("done?");
    });
});

function getData(collections) {
    collections.users.find({}).toArray().then(function (users) {
        collections.companies.find({}).toArray().then(function (companies) {
            doIt(users, companies);
            // for(var i1 = 0; i1 < companies.length; i1++){
            //     for(var i2= 0; i2 < companies[i1].users.length; i2++) {
            //         if(companies[i1].users[i2].toString() == "58e01b08179d5e714013113d"){
            //             console.log("gasit");
            //         }
            //     }
            // }
            console.log("done");
        });
    });
}

function doIt(users, companies) {
    var c = 0;
    var ca = 0;
    var okNrm = [];
    var nokNrm = [];
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        user.ok = false;

        if (hasCeva(user)) {
            ca++;
            user.ok = true;
        }
        if (!user.ok) {
            for (var j = 0; j < companies.length; j++) {
                var company = companies[j];
                if (companyHasUser(company, user)) {
                    user.ok = true;
                }
                // return;
            }
        }
        if (!user.ok) {
            if (okNrm.indexOf(user.studentID) === -1) {
                console.log(user._id + " -> " + user.lastName + " " + user.firstName);
                // console.log(user);
                c++;
                nokNrm.push(user.studentID);
            }
        }
        else {
            okNrm.push(user.studentID);
            if (nokNrm.indexOf(user.studentID) !== -1) {
                console.log("found duplicat: " + user.email);
                c--;
            }
        }
        if (i % 10 === 0) {
            // console.log("user #" + i);
        }
    }
    console.log(JSON.stringify(okNrm));
    console.log(JSON.stringify(nokNrm));
    console.log(c);
    console.log(ca);
}

function companyHasUser(company, user) {
    if (!company) {
        console.log("invalid company?");
        console.log(company);
        return false;
    }
    if (!company.users) {
        return false;
    }

    for (var i = 0; i < company.users.length; i++) {
        if (company.users[i].equals(user._id)) {
            return true;
        }
    }
    return false;
}

function hasCeva(user) {
    return !!user.hiredCompany || !!user.otherSituation;
}