//import modul-modul
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

//komponen App dan menginisialisasi state
function App() {
  // State untuk menyimpan task yang sedang diinput oleh pengguna
  const [task, setTask] = useState('');
  // State untuk menyimpan daftar todos
  const [todos, setTodos] = useState([]);
  // State untuk menyimpan ID task yang sedang diedit
  const [editingId, setEditingId] = useState(null);
  // State untuk menyimpan task yang telah diedit
  const [editedTask, setEditedTask] = useState('');

  // Mengambil daftar todos dari server ketika komponen pertama kali dirender
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fungsi untuk mengambil todos dari server dan menyimpannya di state
  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // Fungsi untuk menambahkan task baru ke server dan state
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

  // Fungsi untuk menandai task sebagai selesai atau belum selesai
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

  // Fungsi untuk memulai pengeditan task
  const handleEdit = (id, task) => {
    setEditingId(id);
    setEditedTask(task);
  };

  // Fungsi untuk menyimpan perubahan task yang telah diedit
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

  // Fungsi untuk menghapus task dari server dan state
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/todos/${id}`);
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // JSX yang merender tampilan aplikasi
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

//Mengekspor komponen App
export default App;
