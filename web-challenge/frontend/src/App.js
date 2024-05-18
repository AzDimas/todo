import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Variabel state untuk mengelola tugas, batas waktu, status pengeditan, dan detail tugas yang diedit
function App() {
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [editedDeadline, setEditedDeadline] = useState('');

  // Mengambil daftar tugas awal dari server saat komponen dipasang
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fungsi untuk mengambil tugas dari server backend
  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

   // Fungsi untuk menangani penambahan tugas baru
  const handleSubmit = async () => {
    if (task.trim() !== '') {
      try {
        const response = await axios.post('http://localhost:5000/todos', { task, deadline });
        setTodos([...todos, response.data]);
        setTask('');
        setDeadline('');
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  // Fungsi untuk mengubah status selesai atau belum selesai dari sebuah tugas
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
        deadline: todoToUpdate.deadline,
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Fungsi untuk menetapkan status pengeditan dan detail tugas yang diedit saat mengedit sebuah tugas
  const handleEdit = (id, task, deadline) => {
    setEditingId(id);
    setEditedTask(task);
    setEditedDeadline(deadline);
  };

  // Fungsi untuk menangani penyimpanan detail tugas yang diedit
  const handleSaveEdit = async (id) => {
    try {
      const updatedTodos = todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, task: editedTask, deadline: editedDeadline };
        }
        return todo;
      });

      setTodos(updatedTodos);
      setEditingId(null);

      await axios.put(`http://localhost:5000/todos/${id}`, {
        task: editedTask,
        deadline: editedDeadline,
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Fungsi untuk menangani penghapusan sebuah tugas
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/todos/${id}`);
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Fungsi untuk menentukan kategori peringatan berdasarkan batas waktu tugas
  const getWarningCategory = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffInMs = deadlineDate - now;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays > 7) {
      return 'Santai';
    } else if (diffInDays >= 1) {
      return 'Siap-siap';
    } else if (diffInDays > 0) {
      return 'Gawat';
    } else {
      return 'Terlambat';
    }
  };

  // Render antarmuka pengguna (UI)
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
        <input
          className="deadline-input"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          placeholder="Enter deadline..."
        />
        <button className="add-button" onClick={handleSubmit}>Add Task</button>
      </div>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={todo.completed ? 'completed-task' : 'task'}
            data-category={getWarningCategory(todo.deadline)}
          >
            <div onClick={() => handleToggleComplete(todo.id)}>
              <span
                style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              >
                {todo.task}
              </span>
              <br />
              <small>Created at: {new Date(todo.created_at).toLocaleString()}</small><br />
              <small>Deadline: {todo.deadline ? new Date(todo.deadline).toLocaleString() : 'No deadline'}</small><br />
              <span className={`category-text ${getWarningCategory(todo.deadline)}`}>
                {getWarningCategory(todo.deadline)}
              </span>
            </div>
            <button onClick={() => handleEdit(todo.id, todo.task, todo.deadline)} className="edit-button">
              <span role="img" aria-label="Edit" className="edit-icon">✏️</span>
            </button>
            <button onClick={() => handleDelete(todo.id)} className="delete-button">
              <span role="img" aria-label="Delete" className="delete-icon">❌</span>
            </button>
          </li>
        ))}
      </ul>

      {editingId !== null && (
        <div className="edit-container">
          <h2>Edit Task</h2>
          <input
            className="task-input"
            type="text"
            value={editedTask}
            onChange={(e) => setEditedTask(e.target.value)}
            placeholder="Edit task..."
          />
          <input
            className="deadline-input"
            type="datetime-local"
            value={editedDeadline}
            onChange={(e) => setEditedDeadline(e.target.value)}
            placeholder="Edit deadline..."
          />
          <button className="save-button" onClick={() => handleSaveEdit(editingId)}>Save</button>
        </div>
      )}
    </div>
  );
}

export default App;
