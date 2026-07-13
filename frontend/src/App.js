import './App.css';
import React from 'react'
import { Sidebar } from './sidebar/Sidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './Home-page/HomePage'
import { CustomGame } from './Room/CustomGame'
import { Game } from './Game/Game'
import { GameContextProvider } from './Contexts/gameContext';
import { PairingContextProvider } from './Contexts/pairingContext';
import { LoggingContainer } from './Login/LoggingContainer'

function App() {
  const flexStyle = {
    display: "flex",
    height: "100%",
  }
 
  const Layout = ({children}) => {
    return (
      <div style={{width:'100%', height:'100%'}}>
        <Sidebar/>
        <div style={{position: 'absolute', width: 'calc(100% - 100px)', height: '100%', right: '', left: '100px'}}>
          {children}
        </div>
      </div>
    )
  }

  const Logger = React.memo(() => (<LoggingContainer/>));

  return (
    <div
      className="App"
      id='hierarchy-top'
    >
      <Router>
        <PairingContextProvider>
          <Layout>
            <Routes>
              {/* jeszcze landing page tutaj pójdzie */}
              <Route path="/" style={flexStyle} Component={HomePage}/>
              <Route path="/Play-A" element={
                <CustomGame variant='A'/>
              }/>
              <Route path="/Play-B" element={
                <CustomGame variant='B'/>
              }/>
              <Route path="/Game" element={
                <GameContextProvider>
                  <Game/>
                </GameContextProvider>
              }/>
              <Route path="/logging" element={<Logger/>}/>
              {/* to do modyfikacji leci */}
            </Routes>
          </Layout>
        </PairingContextProvider>
      </Router>
    </div>
  );
}

export default App;