import { Context } from '@remult/core';
import React, { useCallback, useState } from 'react';
import { Task } from './Task';
import { useEffect } from 'react';

const context = new Context();



function App() {
  const [{ newTask }, setNewTask] = useState(() => ({ newTask: context.for(Task).create() }));
  const [tasks, setTasks] = useState([] as Task[]);
  const [hideCompleted, setHideCompleted] = useState(false);

  const loadTasks = useCallback(async () => {
    let tasks = await context.for(Task).find({
      where: task => hideCompleted ? task.completed.isDifferentFrom(true) : undefined,
      orderBy: task => task.completed
    })
    setTasks(tasks);
  }, [hideCompleted]);

  useEffect(() => {
    loadTasks();
  }, [ loadTasks]);

  const createTask = () => {
    newTask.save().then(
      () => {
        setNewTask({ newTask: context.for(Task).create() });
        loadTasks();
      })
      .catch(() => setNewTask({ newTask: newTask }))
  };

  const deleteTask = (t: Task) => {
    t.delete().then(() => loadTasks());
  }

  const setAll = (completed: boolean) => {
    (async () => {
      await Task.setAll(completed);
      loadTasks();
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



const TaskEditor: React.FC<{ task: Task }> = (props) => {
  const [{ task }, setTask] = useState(props)
  useEffect(() => {
    setTask(props);
  }, [props]);
  const save = () => task.save().then(() => setTask({ task }));

  return <span>
    <input
      checked={task.completed}
      type="checkbox"
      onChange={e => { task.completed = e.target.checked; setTask({ task }) }} />
    <input
      value={task.title}
      onChange={e => { task.title = e.target.value; setTask({ task }) }}
      style={{ textDecoration: task.completed ? 'line-through' : undefined }}
    />
    <button
      onClick={save}
      disabled={!task.wasChanged()}>Save</button>
  </span>
}


