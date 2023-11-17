import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [AdminLogged, AddAdminLogged] = useState(false);
  const [adminloginpass, AddAdminloginpass] = useState({
    login: 'a',
    password: 'a',
  });
  function AdminLogout() {
    AddAdminLogged(false);
  }
  const [newUser, AddNewUser] = useState({
    firstName: '',
    lastName: '',
    role: '',
    profession: '',
  });
  const [newTask, AddNewTask] = useState({
    userId: 0,
    projectId: 0,
    entryTime: 0,
    status: 'В ожидание',
  });
  const [newProject, AddNewProject] = useState({
    projectName: '',
  });

  const [users, AddUsers] = useState([]);
  const [tasks, AddTasks] = useState([]);
  const [projects, AddProjects] = useState([]);

  useEffect(() => {
    // Загрузка данных о пользователях
    fetch('https://localhost:7269/api/User')
      .then((response) => response.json())
      .then((data) => AddUsers(data));

    // Загрузка данных о задачах
    fetch('https://localhost:7269/api/Task')
      .then((response) => response.json())
      .then((data) => AddTasks(data));

    // Загрузка данных о проектах
    fetch('https://localhost:7269/api/Project')
      .then((response) => response.json())
      .then((data) => AddProjects(data));
  }, []);

  // Функции для добавления новых записей
  function addUser() {
    if (!AdminLogged) {
      alert('Admin login required');
      return;
    }
    if (!newUser.firstName || !newUser.lastName) {
      alert('Please enter both first name and last name.');
      return;
    }
    fetch('https://localhost:7269/api/User', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })
      .then((response) => response.json())
      .then((data) => {
        AddUsers([...users, data]);
        AddNewUser({
          firstName: '',
          lastName: '',
          role: 'Developer',
          profession: 'Software Engineer',
        });
      })
      .catch((error) => {
        console.error('Error adding user:', error);
      });
  }

  async function addTask() {
    if (!newTask.userId || !newTask.projectId || newTask.entryTime <= 0) {
      alert('Пожалуйста, выберите пользователя и проект, а также введите действительное положительное время.');
      return;
    }
    const selectedUser = users.find((user) => user.userId === parseInt(newTask.userId, 10));
    const taskData = {
      entryTime: newTask.entryTime,
      status: newTask.status,
      userId: selectedUser.userId,
      projectId: newTask.projectId,
    };
    try {
      const response = await fetch('https://localhost:7269/api/Task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      const data = await response.json();
      AddTasks([...tasks, data]);
      AddNewTask({
        userId: 0,
        projectId: 0,
        entryTime: 0,
        status: 'В ожидание',
      });
    } catch (error) {
      console.error('Error', error);
    }
  }

  function addProject() {
    if (!newProject.projectName) {
      alert('Пожалуйста, введите название проекта.');
      return;
    }
    fetch('https://localhost:7269/api/Project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProject),
    })
      .then((response) => response.json())
      .then((data) => {
        AddProjects([...projects, data]);
        AddNewProject({
          projectName: '',
        });
      });
  }

  function deleteUser(userId) {
    fetch('https://localhost:7269/api/User/' + userId, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) {
          AddUsers(users.filter((user) => user.userId !== userId));
        } else {
          console.error(`Error deleting user`);
        }
      })
      .catch((error) => {
        console.error('Error', error);
      });
  }

  function deleteTask(taskId) {
    fetch('https://localhost:7269/api/Task/' + taskId, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) {
          AddTasks(tasks.filter((task) => task.taskId !== taskId));
        } else {
          console.error(`Error deleting task.`);
        }
      })
      .catch((error) => {
        console.error('Error', error);
      });
  }

  function deleteProject(projectId) {
    fetch('https://localhost:7269/api/Project/' + projectId, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) {
          AddProjects(projects.filter((project) => project.projectId !== projectId));
        } else {
          console.error(`Error deleting project.`);
        }
      })
      .catch((error) => {
        console.error('Error', error);
      });
  }

  function confirmTask(taskId) {
    const taskToUpdate = tasks.find((task) => task.taskId === taskId);

    if (!taskToUpdate) {
        console.error(`Task with ID ${taskId} not found.`);
        return;
    }

    const { projectId, userId,entryTime } = taskToUpdate;

    const updatedTasks = tasks.map((task) =>
        task.taskId === taskId ? { ...task, status: 'подтвержден' } : task
    );

    fetch(`https://localhost:7269/api/Task/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            taskId: taskId,
            status: 'подтвержден',
            entryTime: entryTime,
            projectId: projectId,
            userId: userId,
        }),
    })
        .then(async (response) => {
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! Status: ${response.status}, Error: ${errorText}`);
                throw new Error(`HTTP error! Status: ${response.status}`);
            } else {
              AddTasks(updatedTasks);
            }
        })
        .catch((error) => {
            console.error('Error updating task status:', error);
        });
  }



  











  function AdminLogin() {
    const [login, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
      if (login === adminloginpass.login && password === adminloginpass.password) {
        AddAdminLogged(true);
      } else {
        alert('Invalid credentials');
      }
    };

    return (
      <div className='Admin'>
        <h2>Вход администатора</h2>
        <label>Логин:</label>
        <input type='text' value={login} onChange={(e) => setUsername(e.target.value)} />
        <label>Пароль:</label>
        <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Войти</button>
      </div>
    );
  }

  function UserDashboard() {
    return(
      <div>
        <AdminLogin />
      <h2>Добавить проект</h2>
      <div>
      <label>Название проекта:</label>
      <input type="text" placeholder="Название проекта" value={newProject.projectName} onChange={(e) => AddNewProject({ ...newProject, projectName: e.target.value })}/>
      <button onClick={() => addProject()}>Добавить проект</button>
      </div>
      <h2>Проекты</h2>
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>Название проекта</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project,index) => (
            <tr key={index}>
              <td style={{ textAlign: 'center' }}>{project.projectName}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Занимающиеся проектом</h2>
      <table>
        <thead>
          <tr>
          <th>Название проекта</th>
          <th>Пользователь</th>
          <th>Время</th>
          <th>Статус</th>
          <th>Роль</th>
          </tr>
        </thead>
        <tbody>
        {tasks.map((task, index) => {
              const user = users.find((user) => user.userId === task.userId);
              if (user && task.status === 'подтвержден') {
                return (
                  <tr key={index}>
                    <td>{projects.find((project) => project.projectId === task.projectId)?.projectName}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{task.entryTime} часов</td>
                    <td>{task.status}</td>
                    <td>{user.role}</td>
                  </tr>
                );
              }
              return null;
            })}
        </tbody>
      </table>
      </div>
    );}

    function AdminDashboard() {return(
      <div>
        <div className='input'>
      <h2>Добавить пользователя</h2>
      <label>Имя:</label>
      <input
        type="text"
        placeholder="Имя"
        value={newUser.firstName}
        onChange={(e) => AddNewUser({ ...newUser, firstName: e.target.value })}
      />
      <label>Фамилия:</label>
      <input
        type="text"
        placeholder="Фамилия"
        value={newUser.lastName}
        onChange={(e) => AddNewUser({ ...newUser, lastName: e.target.value })}
      />
     <label>Роль:</label>
      <select
        value={newUser.role}
        onChange={(e) => AddNewUser({ ...newUser, role: e.target.value })}
      >
        <option value="Developer">Developer</option>
        <option value="QA Engineer">QA Engineer</option>
        <option value="Project Manager">Project Manager</option>
        <option value="System Analyst">System Analyst</option>
        <option value="DevOps Engineer">DevOps Engineer</option>
        <option value="Network Engineer">Network Engineer</option>
        <option value="Security Analyst">Security Analyst</option>
        <option value="Database Administrator">Database Administrator</option>
        <option value="Technical Support Specialist">Technical Support Specialist</option>
        <option value="IT Consultant">IT Consultant</option>
        <option value="Software Architect">Software Architect</option>
        <option value="Business Analyst">Business Analyst</option>
        <option value="Scrum Master">Scrum Master</option>
        <option value="Product Owner">Product Owner</option>
        <option value="UI Developer">UI Developer</option>
        <option value="UX Designer">UX Designer</option>
        <option value="Mobile App Developer">Mobile App Developer</option>
        <option value="Data Engineer">Data Engineer</option>
        <option value="Cloud Solutions Architect">Cloud Solutions Architect</option>
      </select>

      <label>Профессия:</label>
      <select
        value={newUser.profession}
        onChange={(e) => AddNewUser({ ...newUser, profession: e.target.value })}
      >
        <option value="Software Engineer">Software Engineer</option>
        <option value="Data Scientist">Data Scientist</option>
        <option value="UI/UX Designer">UI/UX Designer</option>
        <option value="Network Engineer">Network Engineer</option>
        <option value="Database Administrator">Database Administrator</option>
        <option value="IT Security Specialist">IT Security Specialist</option>
        <option value="Machine Learning Engineer">Machine Learning Engineer</option>
        <option value="System Administrator">System Administrator</option>
        <option value="Business Intelligence Analyst">Business Intelligence Analyst</option>
        <option value="Full Stack Developer">Full Stack Developer</option>
        <option value="Frontend Developer">Frontend Developer</option>
        <option value="Backend Developer">Backend Developer</option>
        <option value="Quality Assurance Engineer">Quality Assurance Engineer</option>
        <option value="DevOps Engineer">DevOps Engineer</option>
        <option value="Project Manager">Project Manager</option>
        <option value="Scrum Master">Scrum Master</option>
        <option value="Product Manager">Product Manager</option>
        <option value="UI Designer">UI Designer</option>
        <option value="UX Researcher">UX Researcher</option>
      </select>

      <button onClick={() => addUser()}>Добавить пользователя</button>

      <h2>Добавить задачу</h2>
      <label>Пользователь:</label>
      <select
        value={newTask.userId}
        onChange={(e) => AddNewTask({ ...newTask, userId: e.target.value })}
      >
        <option value={0}>Выберите пользователя</option>
        {users.map((user) => (
          <option key={user.userId} value={user.userId}>
            {user.firstName} {user.lastName}
          </option>
        ))}
      </select>
      <label>Проект:</label>
      <select
        value={newTask.projectId}
        onChange={(e) => AddNewTask({ ...newTask, projectId: e.target.value })}
      >
        <option value={0}>Выберите проект</option>
        {projects.map((project) => (
          <option key={project.projectId} value={project.projectId}>
            {project.projectName}
          </option>
        ))}
      </select>
      <label>Затраченное время (часы):</label>
      <input
        type="text"
        placeholder="Затраченное время"
        value={newTask.entryTime}
        onChange={(e) => AddNewTask({ ...newTask, entryTime: e.target.value })}
      />
      <button onClick={() => addTask()}>Добавить задачу</button>
      </div>
      <h2>Проекты</h2>
      <table>
        <thead>
          <tr>
            <th>Проект ID</th>
            <th>Название проекта</th>
            {AdminLogged && <th>Действие</th>}
          </tr>
        </thead>
        <tbody>
          {projects.map((project,index) => (
            <tr key={index}>
              <td>{project.projectId}</td>
              <td>{project.projectName}</td>
              {AdminLogged && (
              <td>
              <button onClick={() => deleteProject(project.projectId)}>Удалить</button>
              </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {AdminLogged && (
      <div>
        <h2>Задачи</h2>
        <table>
          <thead>
            <tr>
              <th>Задачи ID</th>
              <th>Название проекта</th>
              <th>Пользователь</th>
              <th>Время</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => {
              const user = users.find((user) => user.userId === task.userId);

              return (
                <tr key={index}>
                  <td>{task.taskId}</td>
                  <td>{projects.find((project) => project.projectId === task.projectId)?.projectName}</td>
                  <td>{user && `${user.firstName} ${user.lastName}`}</td>
                  <td>{task.entryTime} часов</td>
                  <td>{task.status}</td>
                  <td>
                    <button onClick={() => deleteTask(task.taskId)}>Удалить</button>
                    {task.status !== 'подтвержден' && (
                    <button onClick={() => confirmTask(task.taskId)}style={{backgroundColor:'green'}}>Подтвердить</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}

{AdminLogged && (
        <div>
      <h2>Пользователи</h2>
      <table>
        <thead>
          <tr>
            <th>Пользователя ID</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Роль</th>
            <th>Профессия</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user,index) => (
            <tr key={index}>
              <td>{user.userId}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.role}</td>
              <td>{user.profession}</td>
              <td>
              <button onClick={() => deleteUser(user.userId)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      )}
      </div>
    );
    }

  
  return (
    <div className='App'>
      {AdminLogged ? (
        <div>
          <header>Панель администатора.</header>
          <button onClick={AdminLogout}>Выйти</button>
          <AdminDashboard />
          <footer>Artjom Volkov TARpv21</footer>
        </div>
      ) : (
        <div>
          <header>Приложение для определения сроков выполнения проектов.</header>
          <UserDashboard />
          <footer>Artjom Volkov TARpv21</footer>
        </div>
      )}
    </div>
  );
}
export default App;
