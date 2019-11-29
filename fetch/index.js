const express = require('express');
const fetch = require('node-fetch');
const fs = require("fs");
const app = express();

app.get(['/','/index'], (req, res) =>  {
    res.status(200).json({
        message:'Welcome.. get random jokes via fetch request to third party URL..'
    });
});
//using promise
app.get('/random-joke',(req,res) => {
    //source : http://www.icndb.com/api/
    fetch('http://api.icndb.com/jokes/random')
        .then(response => response.json())
        .then(realData => {
            delete realData.type;
            return res.status(200).json({
                status:'success',
                data:realData
            });
        })
        .catch((error)=>{
            return res.status(500).json({
                status:'error',
                data:'Something went wrong'
            });
        });
});

//using async / await
app.get('/bulk-jokes/:count',async (req,res) => {
        //source : http://www.icndb.com/api/
        let count = req.params.count * 1;  // 0-573 limit
        if(isNaN(count)) { count = 1; } // if it was a Not a Number set count to 1
        try {
            const response = await fetch(`http://api.icndb.com/jokes/random/${count}`);
            const realData = await response.json();
                delete realData.type;
                for(var i = 0; i < realData.value.length; i++) {
                    delete realData.value[i].categories;
                }
                 // delete unnecessary key
                fs.readFile('./jokes.json','utf-8',  function (err, data) {
                    if (err)  return res.status(500).json({
                        status:'failed',
                        message : 'Something went wrong'
                    });                    
                    if(data === "") {
                        var json = [];
                        json.push(realData);
                    } else {
                        var json = JSON.parse(data);
                        json.push(realData);
                    }
             
                     fs.writeFile('./jokes.json', JSON.stringify(json, null, 4), (err) => {
                        if (err)  return res.status(500).json({
                            status:'failed',
                            message : 'Something went wrong'
                        });
                     });
                 });
                 return res.status(200).json({
                    status:'success',
                    data:realData
                });
        } catch(err){
            return res.status(500).json({
                status:'error',
                data:'Something went wrong'
            });
        }
});
app.listen(3000);
console.log('Server is running on port 3000');