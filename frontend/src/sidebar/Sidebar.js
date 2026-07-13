import logoWithCaption from './../Assets/chess2.png'
import logo from './../Assets/logo.png'
import { useLogContext } from '../Contexts/LogContext'
import {useThemeContext} from '../Contexts/themeContext'
import {Link} from 'react-router-dom'
import {Box, Button, FormLabel, Switch} from '@chakra-ui/react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCog} from '@fortawesome/free-solid-svg-icons'
import styled, {keyframes} from 'styled-components'
import "./Sidebar.css"
import React from 'react'

const boxStyle = {
  width: '100% !important',
  marginBottom: "10px",
  marginTop: "10px",
}

const appear = keyframes` // fajnie byłoby dodać przyjmowanie argumentów
  0%{
    opacity: 0;
    max-height: 0px;
    transform: translateY(-100%) scale(0.45);
  }
  100%{
    opacity: 1;
    max-height: 300px;
    transform: translateY(0%) scale(1);
  }
`

const disappear = keyframes`
  from {
    opacity: 1;
    max-height: 300px;
    transform: translateY(0%) scale(1);
  }
  to {
    opacity: 0;
    max-height: 0px;
    transform: translateY(-100%) scale(0.45);
  }
  `

  const AppearingDiv = styled.div`
    width: 100%;
    animation: ${appear} .75s ease-in-out;
    animation-fill-mode: forwards;
  `

  const DisappearingDiv = styled.div`
    width: 100%;
    animation: ${disappear} .75s;
    animation-fill-mode: forwards;
  `
  
  const MovingComponent = ({timesHovered, children}) => {
    if(timesHovered === 0) {
      return ;
    } else if(timesHovered%2 === 1) {
      return <AppearingDiv>
          {children}
        </AppearingDiv>
    } else {
      return <DisappearingDiv>
        {children}
      </DisappearingDiv>
    }
  }

const logoStyle = {
  height: "128.2px"
}

export const Sidebar = () => {
  const theme = useThemeContext();
  const log = useLogContext();
  const [isHovered, setIsHovered] = React.useState(false); // can do context out of that
  
  // hover buttonow
  const [playHover, setPlayHover] = React.useState(0);
  const [rulesHover, setRulesHover] = React.useState(0);
  const [tacticsHover, setTacticsHover] = React.useState(0);
  const [toolsHover, setToolsHover] = React.useState(0);
  const [logOutHover, setLogOutHover] = React.useState(0);

  const instantHover = { // regular variable not as good as useRef
    play: React.useRef(0),
    rules: React.useRef(0),
    tactics: React.useRef(0),
    tools: React.useRef(0)
  }

  const setButtonHover = {
    play: setPlayHover,
    rules: setRulesHover,
    tactics: setTacticsHover,
    tools: setToolsHover
  }

  const timer = React.useRef(null); // timer for whole sidebar | what does it represent? timer of what?

  const logoComponent = isHovered ? 
    <img src={logoWithCaption} style={logoStyle} alt="logo"/> : 
    <img src={logo} style={logoStyle} alt="logo with caption"/>

  const handleSidebarMouseEnter = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setIsHovered(true)
    }, 150)
  }
  
  const handleSidebarMouseLeave = () => { // animacja zmniejszającej się wysokości
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setIsHovered(false)
    }, 150)
  }

  // this function gotta be modified, sometimes caption do not get unrolled
  // i.e. state is odd and ref is even
  const handleButtonMouseEvent = (key, timerKey) => {
    if((instantHover[key].current%2 === 0 && timerKey === 'in') || (timerKey === 'out' && instantHover[key].current%2 === 1)) {
      instantHover[key].current = instantHover[key].current  + 1
      setTimeout(() => setButtonHover[key](instantHover[key].current), 250);
    }
  }

  const SubCaption = ({children}) => {
    return <h3 className="subCaptionStyle">{children}</h3>
  }

  return (
    <Box
      bg={`linear-gradient(-160deg, black, ${theme.isBright ? 'rgb(0, 120, 10)' : 'rgb(0, 60, 30)'})`}
      width={isHovered ? "200px" : "100px"}
      height="100%"
      display="flex"
      flexDirection="column"
      position="fixed"
      alignItems="center"
      zIndex={10}
      transition="width 0.35s"
      onMouseEnter = {handleSidebarMouseEnter}
      onMouseLeave = {handleSidebarMouseLeave}
    >
      <Link to="/" >{logoComponent}</Link>
      <Box
        id="play"
        cursor="pointer"
        width="100%"
        style={boxStyle}
        onMouseEnter={() => handleButtonMouseEvent('play', 'in')}
        onMouseLeave={() => handleButtonMouseEvent('play', 'out')}
      >
        <h2 className="captionStyle"><em>Play</em></h2>
        <MovingComponent timesHovered={playHover}>
          <Link to="/Play-A"><SubCaption>Wariant A</SubCaption></Link>
          <Link to="/Play-B"><SubCaption>Wariant B</SubCaption></Link>
        </MovingComponent>
      </Box>
      <Box
        id="rules"
        cursor="pointer"
        width="100%"
        style={boxStyle}
        onMouseEnter={() => handleButtonMouseEvent('rules', 'in')}
        onMouseLeave={() => handleButtonMouseEvent('rules', 'out')}
      >
        <h2 className="captionStyle"><em>New rules</em></h2>
        <MovingComponent timesHovered={rulesHover}>
          <Link to="/technology-tree"><SubCaption>Technology tree</SubCaption></Link>
          <Link to="/special-tiles"><SubCaption>Special tiles</SubCaption></Link>
          <Link to="/fog-of-war"><SubCaption>Fog of War</SubCaption></Link>
        </MovingComponent>
      </Box>
      <Box
        id="tactics"
        cursor="pointer"
        width="100%"
        style={boxStyle}
        onMouseEnter={() => handleButtonMouseEvent('tactics', 'in')}
        onMouseLeave={() => handleButtonMouseEvent('tactics', 'out')}
      >
        <h2 className="captionStyle"><em>Tactics</em></h2>
        <MovingComponent timesHovered={tacticsHover}>
          <Link to="/puzzles"><SubCaption>Puzzles</SubCaption></Link>
          <Link to="/puzzle-storm"><SubCaption>Puzzle storm</SubCaption></Link>
          <Link to="/puzzle-dashboard"><SubCaption>Puzzle dashboard</SubCaption></Link>
        </MovingComponent>
      </Box>
      <Link style={{width: '100%'}} to="/new-patches"><h2 width="100%" className="captionStyle"><em>New Patches</em></h2></Link>
      <Box
        id="tools"
        cursor="pointer"
        width="100%"
        style={boxStyle}
        onMouseEnter={() => handleButtonMouseEvent('tools', 'in')}
        onMouseLeave={() => handleButtonMouseEvent('tools', 'out')}
      >
        <h2 className="captionStyle"><em>Tools</em></h2>
        <MovingComponent timesHovered={toolsHover}>
          <Link to="/computer-analysis"><SubCaption>Computer analysis</SubCaption></Link>
          <Link to="/board-editor"><SubCaption>Board editor</SubCaption></Link>
          <Link to="/import-game"><SubCaption>Import game</SubCaption></Link>
        </MovingComponent>
      </Box>
      <FormLabel 
        className='label' 
        htmlFor='mode-label'
        sx={{
          margin: 3,
          fontSize: '21px',
          color: theme.isBright ? 'white' : 'gray'
        }}
      >
          {isHovered ? (theme.isBright ? 'Light' : 'Dark') : ''}
      </FormLabel>
      <Switch 
        size='lg'
        isChecked={!theme.isBright}
        onChange={() => theme.toggleTheme(!theme.isBright)}
      />
      {log.logState.logInfo === "User found" ?
      <button
        style={{
          width: "80px",
          height: '40px',
          margin: '10px 10px 10px 10px',
          borderRadius: '99px',
          color: theme.isBright ? 'white' : '#EEEEEE',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1
        }}
        onMouseEnter={() => setTimeout(setLogOutHover(prevValue => prevValue + 1), 50)}
        onMouseLeave={() => setLogOutHover(prevValue => prevValue + 1)}
        onClick={() => {log.setDefault()}}
      >
        <div
          style={{
            position: 'absolute',
            zIndex: -1,
            top: '-20px',
            left: '-0px',
            width: '80px',
            height: '80px',
            borderRadius: '99px',
            backgroundImage: `linear-gradient(0deg, red, green, orange)`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            transform: `rotate(${(logOutHover - 1)*30}deg)`,
            transition: 'transform 1.5s ease-out',
            ...((logOutHover%2 === 1) && {
              transform: `rotate(${logOutHover*30}deg)`,
            }),
          }}
        />
        Log out
      </button> :
      <>
        <Link to="/Logging">
          <Button
            width="80px"
            marginTop='10px'
            bgGradient="linear(to-r, teal.400, blue.500)"
            color={theme.isBright ? 'white' : '#EEEEEE'}
            _hover={{ bgGradient: 'linear(to-r, teal.500, blue.600)', boxShadow: 'xl' }}
            onClick={() => log.setLogState({option: 'Log In'})}
            borderRadius="full"
          >
            Log in
          </Button>
        </Link>
        <Link to="/Logging">
          <Button
            width="80px"
            className='SidebarButton'
            margin='10px 0px 10px 0px'
            bgGradient="linear(to-l, #AA8A63, #CA74AA)"
            _hover={{ bgGradient: "linear(to-r, #9A7A53, #BA649A)", boxShadow: 'xl' }}
            onClick={() => log.setLogState({option: 'Sign Up'})}
            color={theme.isBright ? 'white' : '#EEEEEE'}
            borderRadius='full'
          >
            Sign up
          </Button>
        </Link>
      </>
      }
      <button>
        <FontAwesomeIcon icon={faCog} />
      </button> 
      {/* Settingi będą działać w taki sposób, że rozwijać się
      będą opcje podstawowe ale będzie też opcja more settings */}
    </Box>
  );
}