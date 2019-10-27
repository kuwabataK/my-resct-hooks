import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useState } from 'react-dom/node_modules/@types/react';
import { useWatch } from './hooks';

const App: React.FC = () => {

  const [a,setA] = useState(0)

  useWatch(()=>{
    console.log(a)
  },[a])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={()=>{setA(a + 1)}} >Aを追加する</button>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
