import { Context } from '@remult/core';
import React, { useState } from 'react';
import { Task } from './Task';
import { set } from '@remult/core/set'

const context = new Context();
function App() {
  const [state, setState] = useState({
    loadData: true,
    tasks: [] as Task[],
    hideCompleted: false,
    title: '',
    error: ''
  });
  const createTask = () => {
    context.for(Task).create({ title: state.title }).save().then(
      () => setState(prev => ({ ...prev, title: '' }))).then(loadTasks);
  };
  const loadTasks = () => {
    context.for(Task).find({
      where: task => state.hideCompleted ? task.completed.isDifferentFrom(true) : undefined,
      orderBy: task => task.completed
    }).then(tasks => setState(prev => ({ ...prev, loadData: false, tasks })))
  }
  const deleteTask = (t: Task) => {
    t.delete().then(loadTasks);
  }
  if (state.loadData) {
    loadTasks();
  }
  return (
    <div className="App">
      <input value={state.title}
        onChange={(e) => setState(prev => ({
          ...prev,
          title: e.target.value
        }))} />
      <button onClick={createTask}>Create Task</button>
      <p>
        <input
          id="hideCompleted"
          type="checkbox"
          checked={state.hideCompleted}
          onChange={e =>
            setState(prev => ({
              ...prev,
              hideCompleted: e.target.checked,
              loadData: true
            }))

          }
        />
        <label htmlFor="hideCompleted">Hide completed</label>
      </p>
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

  const save = () => task.save().then(task => setState({ ...task }));

  return <span>
    <input
      name="completed"
      checked={state.completed}
      type="checkbox"
      onChange={handleInputChange} />
    <input
      name="title"
      value={state.title}
      onChange={handleInputChange} />
    <button
      onClick={save}
      disabled={!task.wasChanged()}>Save</button>
  </span>
}