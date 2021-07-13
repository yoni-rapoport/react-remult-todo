import { Context } from '@remult/core';
import React, { useState } from 'react';
import { Task } from './Task';
import { useEffect } from 'react';

const context = new Context();



function App() {

  const [dataVersion, setDataVersion] = useState({});
  const [{ newTask }, setNewTask] = useState(() => ({ newTask: context.for(Task).create() }));
  const [tasks, setTasks] = useState([] as Task[]);
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {

    const load = async () => {
      let tasks = await context.for(Task).find({
        where: task => hideCompleted ? task.completed.isDifferentFrom(true) : undefined,
        orderBy: task => task.completed
      })
      setTasks(tasks);
    };
    load();
  }, [hideCompleted, dataVersion]);

  const createTask = () => {
    newTask.save().then(
      () => {
        setNewTask({ newTask: context.for(Task).create() });
        setDataVersion({});
      })
      .catch(() => setNewTask({ newTask: newTask }))
  };



  const deleteTask = (t: Task) => {
    t.delete().then(() => setDataVersion({}));
  }
  const setAll = (completed: boolean) => {
    (async () => {
      await Task.setAll(completed);
      setDataVersion({});
    })();
  }

  return (
    <div className="App">
      <input value={newTask.title}
        onChange={(e) => {
          newTask.title = e.target.value;
          setNewTask(({ newTask: newTask }))
        }} />
      <span style={{ color: 'red' }}>{newTask._.error}</span>
      <button onClick={createTask}>Create Task</button>
      <p>
        <input
          id="hideCompleted"
          type="checkbox"
          checked={hideCompleted}
          onChange={e =>
            setHideCompleted(e.target.checked)
          }
        />
        <label htmlFor="hideCompleted">Hide completed</label>
      </p>
      <p>
        <button onClick={() => setAll(true)}>Set all as completed</button>
        <button onClick={() => setAll(false)}>Set all as uncompleted</button>
      </p>
      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            <TaskEditor task={t} />
            <button onClick={() => deleteTask(t)}>Delete</button>
          </li>))}
      </ul>
    </div>
  );
}

export default App;



const TaskEditor: React.FC<{ task: Task }> = ({ task }) => {
  const [, render] = useState({});
  const save = () => task.save().then(() => render({}));
  return <span>
    <input
      checked={task.completed}
      type="checkbox"
      onChange={e => { task.completed = e.target.checked; render({}) }} />
    <input
      value={task.title}
      onChange={e => { task.title = e.target.value; render({}) }}
      style={{ textDecoration: task.completed ? 'line-through' : undefined }}
    />
    <button
      onClick={save}
      disabled={!task.wasChanged()}>Save</button>
  </span>
}


