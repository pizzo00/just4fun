import http = require('http');
import url = require('url');
import fs = require('fs');
import colors = require('colors');

import {isMatch, Match} from "./models/Match";
import * as match from "./models/Match"
import * as mongoose from "mongoose";

colors.enabled = true;

let server = http.createServer( function (req, res){
    console.log("New server connection".inverse);
    console.log("REQUEST:".bold)
    console.log("      URL: ".cyan + req.url );
    console.log("   METHOD: ".cyan + req.method );
    console.log("  Headers: ".cyan + JSON.stringify( req.headers ) );

    let body: string = "";

    req.on("data", function( chunk ) {
        body = body + chunk;

    }).on("end", function() {
        let respond = function( status_code: number, response_data: Object ) : void {
            res.writeHead(status_code, { "Content-Type": "application/json" });
            res.write(JSON.stringify(response_data), "utf-8");
            res.end();
        }
        if (req.url == "/match" && req.method == "GET"){
            let a;
            match.getModel().findOne({}).then( (data) => {
                a = data;
            }).then(()=>{
                return respond(200, a)
            })
        }
        if (req.url == "/match1" && req.method == "PUT"){
            let a;
            match.getModel().findOne({}).then((data) =>{
                a = data
                a.makeMove("b", 0)
                a.save()
            }).then(() => {
                return respond(200, {HE: "LO"})
            })
        }
        if (req.url == "/match0" && req.method == "PUT"){
            let a;
            match.getModel().findOne({}).then((data) =>{
                a = data
                a.makeMove("a", 5)
                a.save()
            }).then(() => {
                return respond(200, {HE: "LO"})
            })
        }

        console.log("Request end".bold);
    });


})

mongoose.connect( `mongodb://just4fun:${encodeURIComponent("@Just@4@FUN@")}@54.38.158.223:27017/just4fun`, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {

        console.log("Connected to MongoDB".bgGreen.black);
        return match.getModel().countDocuments({}); // We explicitly return a promise here
    }
).then((c) => {
    if (c == 0){
        let a = match.getModel().create({
            player0: "a",
            player1: "b",
            winner: {
                player: null,
                positions: null
            },
            turn: 0,
            board: [[null, null, null, null, null, null, null], [null, null, null, null, null, null, null], [null, null, null, null, null, null, null], [null, null, null, null, null, null, null], [null, null, null, null, null, null, null], [null, null, null, null, null, null, null]],
            moves: [],
            matchStart: Date.now(),
            lastMove: Date.now(),
        })
        return Promise.all([a]);
    }

}).then(() => {
    return new Promise( (resolve, reject) => {
        server.listen(8080, function () {
            console.log("HTTP Server started on port 8080".bgGreen.black);
            resolve(0);
        });
        server.on('error', (e) => { reject(e); } );
    });
})




