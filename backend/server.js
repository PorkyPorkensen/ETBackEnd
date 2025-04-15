const express = require('express');
const mongoose = require('mongoose')
const Task = require('./models/Task')
const User = require('./models/User')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config();

const app = express();
const PORT = 5000
const mongoURI = process.env.MONGO_URI


app.use(cors())
app.use(express.json())

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err))

// async function findUserByUsername(username){
//     try {
//         const res = await fetch('https://etbackend-production.up.railway.app/api/users');
//         const users = await res.json()
//         return res.data.find(user => user.userName.toLowerCase() === username.toLowerCase())
//     } catch (error) {
//         console.error('Error fetching user', error);
//         return null
//     }
// }

function authenticateToken(req, res, next){
    const authHeader = req.headers['Authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.sendStatus(401)
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })

}
app.post('/api/tasks', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save()
        res.status(201).json(task)
    } catch (err) {
        res.status(400).json({error: err.message})
    }
})

app.post('/api/users', async (req, res) => {
    try {
        const { userName, userID } = req.body;
        
        if (!userName || !userID) {
            return res.status(400).json({ error: "Missing required fields: userName and userID" });
        }

        const user = new User({ userName, userID });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { userName, userID } = req.body;
  
    try {
      const response = await fetch('https://etbackend-production.up.railway.app/api/users');
      const users = await response.json();
  
      const user = users.find(user => user.userName === userName);
  
      if (!user) return res.status(401).json({ message: 'User not found' });
  
      if (user.userID !== userID) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
  
      const token = jwt.sign({ id: user.id, userName: user.userName }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.json({ token, userID: user.userID, userName: user.userName });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find()
        let sortedTasks = tasks.sort((a, b) => a.completed - b.completed)
        res.status(200).json(sortedTasks)
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

app.get('/', async (req, res) => {
    try {
        const tasks = await Task.find()
        let sortedTasks = tasks.sort((a, b) => a.completed - b.completed)
        res.status(200).json(sortedTasks)
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

app.get('/api/tasks/completed', async (req, res) => {
    try {
      const completedTasks = await Task.find({ completed: true });
      res.status(200).json(completedTasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  app.put('/api/users/:id', async (req, res) => {
    try {
        const selectedUser = await User.findOne({ userID: req.params.id });

        console.log(req.params.id)
        if (!selectedUser) return res.status(404).json({error: 'User was not found'})
            selectedUser.userName = req.body.userName
        await selectedUser.save()
        res.status(200).json({message: `User ${req.params.id} 's Username was changed`})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

app.put('/api/tasks/:id', async (req, res) => {
    try {
        const selectedTask = await Task.findById(req.params.id);
        if (!selectedTask) return res.status(404).json({error: 'Task was not found'})
            selectedTask.completed = !selectedTask.completed
        const updatedTask = await selectedTask.save()
        res.status(200).json({message: `Task ${req.params.id} 's Status was changed`})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

app.delete('/api/tasks/:id', async (req, res) => {
    console.log('DELETE request recieved for the task ID:', req.params.id)
    try {
        let selectedTask = await Task.findByIdAndDelete(req.params.id)
        if (!selectedTask) return res.status(404).json({error: 'Task was not found'})
        res.status(200).json({message: 'Task Successfully deleted'})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

app.listen(PORT, () => console.log(`Server is running on ${PORT}`))