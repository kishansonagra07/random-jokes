const express = require('express');
const axios = require("axios");
const fs = require("fs");
const app = express();

app.get(['/','/index'], (req, res) =>  {
    res.status(200).json({
        message:'Welcome.. get random jokes via axios request to third party URL..'
    });
});
//using promise
app.get('/random-joke',(req,res) => {
        //source : http://www.icndb.com/api/
        axios({
            "method":"GET",
            "url":"http://api.icndb.com/jokes/random"
        })
        .then((response)=>{
            if(response.status === 200 && response.statusText === 'OK'){
                delete response.data.type
               return res.status(200).json({
                    status:'success',
                    data:response.data
                });
            } else {
                return res.status(400).json({
                    status:'failed',
                    data:[]
                });
            }
        })
        .catch((error)=>{
            return res.status(500).json({
                status:'error',
                data:'Something went wrong'
            });
        })
});

//using async / await
app.get('/bulk-jokes/:count',async (req,res) => {
        //source : http://www.icndb.com/api/
        let count = req.params.count * 1;  // 0-573 limit
        if(isNaN(count)) { count = 1; } // if it was a Not a Number set count to 1
        try {
            const response = await axios.get(`http://api.icndb.com/jokes/random/${count}`);
            if(response.status === 200 && response.statusText === 'OK'){
                delete response.data.type;
               /* for(var i = 0; i < response.data.value.length; i++) {
                    delete response.data.value[i].categories;
                }
                */ // delete unnecessary key
                fs.readFile('./jokes.json','utf-8',  function (err, data) {
                    if (err)  return res.status(500).json({
                        status:'failed',
                        message : 'Something went wrong'
                    });                    
                    if(data === "") {
                        var json = [];
                        json.push(response.data);
                    } else {
                        var json = JSON.parse(data);
                        json.push(response.data);
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
                    data:response.data
                });
            } else {
                return res.status(400).json({
                    status:'failed',
                    data:[]
                });
            }
        } catch(err){
            return res.status(500).json({
                status:'error',
                data:'Something went wrong'
            });
        }
});
app.listen(3000);
console.log('Server is running on port 3000');