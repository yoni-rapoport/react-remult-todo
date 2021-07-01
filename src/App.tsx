import { Context } from '@remult/core';
import React, { useState } from 'react';
import { Task } from './Task';
import { set } from '@remult/core/set'

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
        {state.tasks.map(t => (<li><TaskEditor task={t} /> <button onClick={() => deleteTask(t)}>Delete</button> </li>))}
      </ul>
    </div>
  );
}

export default App;

type Props = {
  task: Task
};

const TaskEditor: React.FC<Props> = ({ task }) => {
  const [state, setState] = useState({ ...task, changed: false })

  const save = () => set(task, state).save().then(t => setState({ ...task, changed: false }));

  return <span>
    <input value={state.title} onChange={e => setState(prev => ({ ...prev, title: e.target.value, changed: true }))} />
    <button onClick={save} disabled={!state.changed}>Save</button>
  </span>
}