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
        {state.tasks.map(t => (
          <li key={t.id}>
            <TaskEditor task={t} />
            <button onClick={() => deleteTask(t)}>Delete</button>
          </li>))}
      </ul>
    </div>
  );
}

export default App;

type Props = {
  task: Task
};

const TaskEditor: React.FC<Props> = ({ task }) => {
  const [state, setState] = useState({ ...task })



  //https://reactjs.org/docs/forms.html
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    set(task, { [name]: value });
    setState({ ...task });
  }

  const save = () => set(task, state).save().then(t => setState({ ...task }));

  return <span>
    <input name="completed" checked={state.completed} type="checkbox" onChange={handleInputChange} />
    <input name="title" value={state.title} onChange={handleInputChange} />
    <button onClick={save} disabled={!task.wasChanged()}>Save</button>
  </span>
}