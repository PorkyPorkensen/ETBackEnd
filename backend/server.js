const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose')
const Task = require('./models/Task')
const User = require('./models/User')
const cors = require('cors')


const app = express();
const PORT = 5000
const mongoURI = process.env.MONGO_URI


app.use(cors())
app.use(express.json())

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err))


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
// MY SOLUTION BELOW TO THE QUESTION: 'ADD A ROUTE FOR COMPLETED TASKS'

// app.get('/api/tasks/completed', async (req, res) => {
//     try {
//         let tasks = await Task.find()
//         let completedTaskArray = []
//         tasks.forEach((task) => {
//             if(task.completed === true) completedTaskArray.push(task)
//                 else return
//             })
//         res.status(200).json(completedTaskArray)
//     } catch (err) {
//         res.status(500).json({error: err.message})
//     }
// })

// AI's solution: You can use .find() to find the tasks with completed being true.

app.get('/api/tasks/completed', async (req, res) => {
    try {
      const completedTasks = await Task.find({ completed: true });
      res.status(200).json(completedTasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });




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