const express = require('express');
const bodyParser = require('body-parser');
const{MongoClient, Db} = require('mongodb')
const  path = require('path');
const app = express();
app.use(express.static(path.join(__dirname,'/build')))
app.use(bodyParser.json());
const port = 8000;
const articlesInfo ={
    'learn-react':{
        upvotes:0,
        comments:[],
    },
        'learn-node':{
            upvotes:0,
            comments:[],
        },
        
            'my-Thoughts-on-resumes':{
                upvotes:0,
                comments:[],
            },

}
const withdb = async (operations,res)=>{
    try{
    const client =  await MongoClient.connect('mongodb://localhost:27017',{useNewUrlParser:true});
    const db = client.db('my-blog');
    await operations(db);
    client.close();
    }catch(error){
        res.status(500).json({message: 'error connecting',error})
    
    }
}

    app.get('/api/articles/:name' , async (req , res)=>{
        withdb(async(db)=>{
        const articleName = req.params.name;
        const articleinf = await db.collection('articles').findOne({name:articleName})
        res.status(200).json(articleinf);
},res);

})




    app.post('/api/articles/:name/upvote' ,async (req , res)=>{
        withdb( async(db)=>{
        const articleName = req.params.name;
      
        const info = await db.collection('articles').findOne({name:articleName});
        
        const post = await db.collection('articles').updateOne({name:articleName},
           {
            '$set':{
                upvotes:info.upvotes+1
            }
           }
            )
        const updatedinfo = await db.collection('articles').findOne({name:articleName});
        res.status(200).json(updatedinfo)
        
    },res);
})

app.post('/api/articles/:name/add-comment' ,async (req , res)=>{
    const {username,text}= req.body;
    const articleName = req.params.name;
    withdb(async(db)=>{
            const info = await db.collection('articles').findOne({name:articleName});
          await db.collection('articles').updateOne({name:articleName},{
            '$set':{
                    comments: info.comments.concat({username,text}),
            }
        })
        const updatedcoments = await db.collection('articles').findOne({name:articleName});
        res.status(200).json(updatedcoments);
    },res);
  

})

// app.post('/api/articles/:name/upvote' , (req , res)=>{
//     const articleName = req.params.name;
    
//      articlesInfo[articleName].upvotes+=1;
//      res.status(500).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes`)
//    res.send('hello from simple server :)')
    
// })

// app.post('/api/articles/:name/add-comment' , (req , res)=>{
//      const{username,text} = req.body;
//      const articleName = req.params.name;
//      articlesInfo[articleName].comments.push({username,text})
//    res.status(200).send(articlesInfo[articleName])


// })
app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname+'/build/index.html'));
})
app.listen(port,()=>console.log('its listening port ',port))