import { Context } from '@remult/core';
import React, { useState } from 'react';
import { Task } from './Task';
const context = new Context();
function App() {
  const [title, setTaskTitle] = useState("");
  const [state, setState] = useState<{
    loaded: boolean,
    tasks: Task[]
  }>({
    loaded: false,
    tasks: []
  });
  const createTask = () => {
    context.for(Task).create({ title }).save().then(() => setTaskTitle('')).then(loadTasks);
  };
  const loadTasks = () => {
    context.for(Task).find().then(tasks => setState(prev => ({ ...prev, loaded: true, tasks })))
  }
  const deleteTask = (t: Task) => {
    t.delete().then(loadTasks);
  }
  if (!state.loaded) {
    loadTasks();
  }
  return (
    <div className="App">
      <input value={title} onChange={(e) => setTaskTitle(e.target.value)} />
      <button onClick={createTask}>Create Task</button>
      <ul>
        {state.tasks.map(t => (<li>{t.title} <button onClick={() => deleteTask(t)}>Delete</button> </li>))}
      </ul>
    </div>
  );
}

export default App;
