import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [task, setTask] = useState('');
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedTask, setEditedTask] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleSubmit = async () => {
    if (task.trim() !== '') {
      try {
        const response = await axios.post('http://localhost:5000/todos', { task });
        setTodos([...todos, response.data]);
        setTask('');
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      const updatedTodos = todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      });
  
      setTodos(updatedTodos);
  
      const todoToUpdate = todos.find((todo) => todo.id === id);
      await axios.put(`http://localhost:5000/todos/${id}`, {
        task: todoToUpdate.task,
        completed: !todoToUpdate.completed,
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleEdit = (id, task) => {
    setEditingId(id);
    setEditedTask(task);
  };

  const handleSaveEdit = async (id) => {
    try {
      const updatedTodos = todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, task: editedTask };
        }
        return todo;
      });

      setTodos(updatedTodos);
      setEditingId(null);

      await axios.put(`http://localhost:5000/todos/${id}`, {
        task: editedTask,
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/todos/${id}`);
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">To Do List</h1>
      <div className="input-container">
        <input
          className="task-input"
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter task..."
        />
        <button className="add-button" onClick={handleSubmit}>Add Task</button>
      </div>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={todo.completed ? 'completed-task' : 'task'}
            onClick={() => handleToggleComplete(todo.id)}
          >
            <span
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
            >
              {editingId === todo.id ? (
                <input
                  type="text"
                  value={editedTask}
                  onChange={(e) => setEditedTask(e.target.value)}
                  onBlur={() => handleSaveEdit(todo.id)}
                  autoFocus
                />
              ) : (
                <span onClick={() => handleEdit(todo.id, todo.task)}>{todo.task}</span>
              )}
            </span>
            <button onClick={() => handleDelete(todo.id)} className="delete-button">
              <span role="img" aria-label="Delete" className="delete-icon">❌</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
