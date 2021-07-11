import { Context } from '@remult/core';
import React, { useState } from 'react';
import { Task } from './Task';
import { set } from '@remult/core/set'
import { useEffect } from 'react';

const context = new Context();
function App() {
  const [state, setState] = useState({
    tasks: [] as Task[],
    hideCompleted: false,
    title: '',
    error: ''
  });
  useEffect(() => { loadTasks(); }, [state.hideCompleted]);

  const loadTasks = async () => {
    context.for(Task).find({
      where: task => state.hideCompleted ? task.completed.isDifferentFrom(true) : undefined,
      orderBy: task => task.completed
    }).then(tasks => setState(prev => ({ ...prev, loadData: false, tasks: [...tasks] })))
  }

  const createTask = () => {
    context.for(Task).create({ title: state.title }).save().then(
      () => setState(prev => ({ ...prev, title: '', error: '' })))
      .catch((e) => setState(prev => ({ ...prev, error: e.message })))
      .then(loadTasks);
  };



  const deleteTask = (t: Task) => {
    t.delete().then(loadTasks);
  }
  const setAll = (completed: boolean) => {
    (async () => {
      for await (const task of context.for(Task).iterate()) {
        task.completed = completed;
        await task.save();
      }
      setState(prev=>({...prev,tasks:[]}))// not sure y but it doesn't work without this.
      loadTasks();
    })();
  }

  return (
    <div className="App">
      <input value={state.title}
        onChange={(e) => setState(prev => ({
          ...prev,
          title: e.target.value
        }))} />
      <span style={{ color: 'red' }}>{state.error}</span>
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
      <p>
        <button onClick={() => setAll(true)}>Set all as completed</button>
        <button onClick={() => setAll(false)}>Set all as uncompleted</button>
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
      onChange={handleInputChange}
      style={{ textDecoration: state.completed ? 'line-through' : undefined }}
    />
    <button
      onClick={save}
      disabled={!task.wasChanged()}>Save</button>
  </span>
}