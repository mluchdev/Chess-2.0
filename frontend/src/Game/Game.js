import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { ThemeContext } from '../Contexts/themeContext';
import brightBackground from './../Assets/mainPage/brightGeometry.png'; // background image
import darkBackground from './../Assets/mainPage/darkGeometry.png'; // background image
import { boardSize } from '../Contexts/LogContext';
import { beginPositions } from './rules/beginningPositions';
import { Box } from '@chakra-ui/react';
import { Tile } from './Tile';
import { Resizable } from 'react-resizable';
import PieceContainer from './PieceContainer';
import { useLogContext } from '../Contexts/LogContext'
import { MoveMarkersContextProvider } from '../Contexts/moveMarkersContext';
import InfoTab from './InfoTab';
import { WebSocketClient } from '../HandyComponents/wsFront';
import { useGameContext } from '../Contexts/gameContext';

class Chessboard extends React.PureComponent {
  constructor(props) { // tu musi pójść uogólnienie - zmiana wszystkiego tak naprawdę - ale jak na uogolnienie
    super(props);
    this.state = {
      windowDim: {
        height: window.innerHeight,
        width: window.innerWidth,
      },
      widthAndHeightValue: 0,
    };

    this.premove = props.premove;

    this.logState = props.logState;
    
    this.ws = new WebSocketClient(`ws://localhost:5500/Game?username=${this.logState.userInfo.user}&opponent=${this.logState.opponent.user}`, this.premove);
    
    this.state.widthAndHeightValue = this.state.windowDim.width > this.state.windowDim.height ? 0.75*this.state.windowDim.height : 0.75*this.state.windowDim.width;
    
    this.chessboardRef = React.createRef();
  }
  
  onResize = (_, {size}) => {
    this.setState({widthAndHeightValue: size.width});
  }
  
  componentDidUpdate() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.ws.disconnect();
    this.ws = null;
  }

  render() {
    const url = new URLSearchParams(window.location.search);
    const timeFormat = url.get('timeformat');
    const {widthAndHeightValue} = this.state;
    this.ws.connect();

    return (
      <MoveMarkersContextProvider>
        <ThemeContext.Consumer>
          {theme =>
            <Box
              width='100%'
              height='100%'
              display='flex'
              flexDirection='row'
              alignItems='center'
              justifyContent='center'
              backgroundImage={theme.isBright ? brightBackground : darkBackground}
              backgroundSize='100px'
              backgroundColor={theme.isBright ? '#BBBBBB' : '#223322'}
            >
              <Box
                display='flex'
                ref={this.chessboardRef}
                flexDirection='row'
              >
                <Box
                  position='relative'
                  width={widthAndHeightValue/boardSize}
                  height={widthAndHeightValue}
                  textAlign='right'
                  padding='0 10px 0 10px'
                >
                  {Array(boardSize).fill(null).map((_, i) => (
                    <h1 style={{height: `${100/boardSize}%`, top: '50%', color: theme.isBright ? 'black' : 'white', userSelect: 'none'}} key={`vertical-note-${i}`}>{this.logState.isUserWhite ? boardSize-i : i+1}</h1>
                  ))}
                </Box>
                <Resizable
                  onResize={this.onResize}
                  height={widthAndHeightValue}
                  width={widthAndHeightValue}
                  handle={
                    <div style={{display: 'flex'}}>
                      <FontAwesomeIcon icon={faUpRightFromSquare} style={{transform: 'translateY(-100%)', cursor: 'ne-resize', color: (theme.isBright ? 'black' : 'white')}}/>
                    </div>
                  }
                  minConstraints={[200, 200]}
                  maxConstraints={[
                    Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9),
                    Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9)
                  ]}
                >
                  <div
                    style={{
                      width: widthAndHeightValue,
                      height: widthAndHeightValue,
                      display: 'flex',
                      flexDirection: 'row',
                    }}
                  >
                    {Array(boardSize).fill(null).map((_, i) => (
                      <Box
                        width='100%'
                        height={`${100/boardSize}%`}
                        key={`${i}th column`}
                      >
                        {Array(boardSize).fill(null).map((_, j) => (
                          <React.Fragment key={`fragment-${j}`}>
                            <Tile
                              id={`square-container-${i}-${j}`}
                              key={`square-container-${i}-${j}`}
                              i={i}
                              j={j}
                            >
                              {beginPositions['variant a'][j][i]?.type && 
                                <PieceContainer
                                  key={`piece-${i}-${j}`}
                                  i={i}
                                  j={j}
                                  tileSize={widthAndHeightValue/boardSize}
                                  connection={this.ws}
                                />
                              }
                            </Tile>
                            {j === boardSize-1 && <h1 key={`horizontal-note-${i}`} style={{color: theme.isBright ? 'black' : 'white', userSelect: 'none'}}>{String.fromCharCode(i + 97)}</h1>}
                          </React.Fragment>
                        ))}
                      </Box>
                    ))}
                  </div>
                </Resizable>
              </Box>
              <InfoTab timeFormat={timeFormat} height={widthAndHeightValue}/>
            </Box> 
          }
        </ThemeContext.Consumer>
      </MoveMarkersContextProvider>
    );
  }
  
  handleResize = () => {
    this.setState({
      windowDim: {
        height: window.innerHeight,
        width: window.innerWidth
      }
    });
  }
}

export const Game = ({...props}) => {
  const {logState} = useLogContext();
  const premove = useGameContext();
  // potem się doda różne wersje gry które bd iść razem z propsami.
  return (
    <>
      <Chessboard logState={logState} premove={premove}/>
    </>
  );
}