import {Button, Box, Table, Tbody, Tr, Td} from '@chakra-ui/react'
import {useThemeContext} from '../Contexts/themeContext'
import React from 'react'
import {CenteredCell} from './../HandyComponents/HandyComponents'
import {CustomGame} from './../Room/CustomGame'
import {useLogContext} from '../Contexts/LogContext'
import {usePairingContext} from '../Contexts/pairingContext'
import { useNavigate } from 'react-router-dom';
import './HomePage.css'

import darkBackground from './../Assets/mainPage/darkBackground.jpg'
import brightBackground from './../Assets/mainPage/brightMode.jpg'

const toggleVariant = ['A', 'B', 'C']; // tu powinny być nazwy wariantów.

export const HomePage = () => {
  const [firstButtonOption, setFirstButtonOption] = React.useState('A')
  const [custom, setCustom] = React.useState(false);
  const logState = useLogContext();
  const theme = useThemeContext();
  const navigate = useNavigate();
  const pairing = usePairingContext();

  const ButtonWrapper = ({ children, id, color, timeFormat, hoverColor}) => {
    const [isLoading, setIsLoading] = React.useState(!pairing.isSearching(id));

    const clearCurrentInterval = () => {
        pairing.stopSearch(id);
    };

    const opponentFound = () => {
      clearCurrentInterval();
      setIsLoading(false);
      deleteRecord();
      navigate(`/Game?timeformat=${id}`);
    }

    const deleteRecord = () => {
      fetch(`http://localhost:5500/pairing?format=${id}`, { // CHECKED - being run every time after pairing
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          user: logState.logState.userInfo.user,
        })
      });
    }

    const handleButtonClick = async (_) => {
      setIsLoading(val => !val);

      if(!pairing.isSearching(id)) {
        const dataFrom = await fetch(`http://localhost:5500/pairing?format=${id}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            user: logState.logState.userInfo.user,
            rating: logState.logState.userInfo.rating.toString(),
          }),
        })
        .then(response => response.json())
        .catch(error => console.log(`Following error while POSTING pairing ${error}`));

        if(!dataFrom?.opponent) { // waiting to find the opponent
          const newIntervalID = setInterval(async () => {
            try {
              const opponentInfo = await fetch(
                `http://localhost:5500/pairing?format=${id}&user=${logState.logState.userInfo.user}`, {
                  method: 'GET',
                  headers: {'Content-Type': 'application/json'},
                }
              ).then(response => response.json());

              if (opponentInfo?.opponent?.user?.length > 0) {
                logState.setLogState({opponent: opponentInfo.opponent, isUserWhite: true, boardSize: 8});
                opponentFound();
              }
            } catch (error) {
              console.log(error);
              clearCurrentInterval();
            }
          }, 1000);
          pairing.startSearch(id, newIntervalID, deleteRecord);
        } else { // opponent fetched in 1st attempt
          logState.setLogState({opponent: dataFrom.opponent, isUserWhite: false, boardSize: 8});
          opponentFound();
        }
      } else {
        clearCurrentInterval();
        deleteRecord();
      }
    };

    return <Button
      color={color}
      _hover={{ bg: hoverColor }}
      id={id}
      variant="outline"
      fontSize="26px"
      fontFamily='Arial'
      fontWeight='900'
      width="100%"
      px="10"
      py="20"
      borderColor="teal.200"
      onClick={handleButtonClick}
    >
      {isLoading ?
        <>
          {children}
          <br/>
          {timeFormat}
        </> : 
        <div className="loader"/>
      }
    </Button>;
  };

  const BulletGameButton = ({children, id}) => {
    return <ButtonWrapper id={id} timeFormat='Bullet' color={theme.isBright ? 'gray.900' : 'white'} hoverColor={theme.isBright ? '#DF0000' : '#8A0000'}>{children}</ButtonWrapper>
  }
  
  const BlitzGameButton = ({children, id}) => {
    return <ButtonWrapper id={id} timeFormat='Blitz' color={theme.isBright ? 'gray.900' : 'white'} hoverColor={theme.isBright ? '#FFAA00' : '#AA6600'}>{children}</ButtonWrapper>
  }
  
  const RapidGameButton = ({children, id}) => {
    return <ButtonWrapper id={id} timeFormat='Rapid' color={theme.isBright ? 'gray.900' : 'white'} hoverColor={theme.isBright ? '#AAAAAA' : '#555555'}>{children}</ButtonWrapper>
  }

  // do TbodyContent dorzucić custom i drugą tabelę.
  const TbodyContent = () => {
    return <Tbody>
      <Tr id='bullet games' display='grid' gridTemplateColumns='1fr 1fr 1fr'>
        <CenteredCell><BulletGameButton id="2+0">2+0</BulletGameButton></CenteredCell>
        <CenteredCell><BulletGameButton id="3+0">3+0</BulletGameButton></CenteredCell>
        <CenteredCell><BulletGameButton id="3+1">3+1</BulletGameButton></CenteredCell>
      </Tr>
      <Tr id='blitz games' display='grid' gridTemplateColumns='1fr 1fr 1fr'>
        <CenteredCell><BlitzGameButton id="5+0">5+0</BlitzGameButton></CenteredCell>
        <CenteredCell><BlitzGameButton id="5+3">5+3</BlitzGameButton></CenteredCell>
        <CenteredCell><BlitzGameButton id="10+0">10+0</BlitzGameButton></CenteredCell>
      </Tr>
      <Tr id='rapid games' display='grid' gridTemplateColumns='1fr 1fr 1fr'>
        <CenteredCell><RapidGameButton id="15+0">15+0</RapidGameButton></CenteredCell>
        <CenteredCell><RapidGameButton id="15+5">15+5</RapidGameButton></CenteredCell>
        <CenteredCell><RapidGameButton id="30+15">30+15</RapidGameButton></CenteredCell>
      </Tr>
    </Tbody>
  }

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      backgroundImage={theme.isBright ? brightBackground : darkBackground}
      backgroundRepeat="Repeat"
      backgroundSize="100px"
      height="100%"
    >
      <Table
        opacity={0.9}
        position='relative'
        width='75%'
        border='5px solid gray.800'
        marginBottom='25px'
        backgroundColor={theme.isBright ? 'gray.300' : 'gray.600'}
      >
        <Tbody>
          <Tr>
            <Td colSpan={3} borderColor='transparent'>
              <Table>
                <Tbody>
                  <Tr borderColor='transparent'>
                    <CenteredCell width='50%'>
                      <Button 
                        variant={ !custom ? 'solid' : 'ghost' }
                        colorScheme={firstButtonOption === 'A' ? 'teal' : firstButtonOption === 'B' ? 'green' : 'red'}
                        color={ !custom || theme.isBright ? 'black' : 'white' }
                        fontSize='xl'
                        width='100%'
                        onClick={() => {
                          if(!custom)
                            setFirstButtonOption(toggleVariant[(toggleVariant.indexOf(firstButtonOption)+1)%toggleVariant.length])
                          setCustom(false)
                        }}
                        size='lg'
                        px='35%'
                        py='10%'                        
                      >
                        {firstButtonOption} variant
                      </Button>
                    </CenteredCell>
                    <CenteredCell width='50%'>
                      <Button
                        variant={ custom ? 'solid' : 'ghost' }
                        width='100%'
                        colorScheme='blue'
                        fontSize='xl'
                        color={ custom || theme.isBright ? 'black' : 'white' }
                        onClick={() => setCustom(true)}
                        px='35%'
                        py='10%'
                      >
                        Custom game
                      </Button>
                    </CenteredCell>
                  </Tr>
                </Tbody>
              </Table>
            </Td>
          </Tr>
        </Tbody>
        <TbodyContent/>
      </Table>
      {/* <Table
        id='Leaderboard and upcoming tournaments'
        position='relative'
        left='50%'
        transform='translate(-50%) translateX(100px)'
        width='75%'
      >
        <Thead>
          <Tr display='grid' gridTemplateColumns='1fr 1fr'>
            <CenteredCell border='5px solid gray' color={theme.isBright ? 'black' : 'rgb(210, 210, 210)'}>
              Leaderboard
            </CenteredCell>
            <CenteredCell border='5px solid gray' color={theme.isBright ? 'black' : 'rgb(210, 210, 210)'}>
              Upcoming tournaments
            </CenteredCell>
          </Tr>
        </Thead>
        <Tbody>
          <Tr display='grid' gridTemplateColumns='1fr 1fr'>
            // wyniki najlepszych graczy.
          </Tr>
        </Tbody>
      </Table> // jak będzie serwer to to się doda */}
      {custom && 
        // Tutaj box jak się kliknie to Box znika tj. setCustom(false)
        <Box
          top='0px'
          right='0px'
          left='0px'
          width='100%'
          height='100vh'
          display="flex"
          alignItems='center'
          justifyContent='center'
          position="absolute"
          background='rgba(0, 0, 0, 0.5)'
          onClick={() => {setCustom(false)}}
        >
          <Box
            left='50%'
            transform='translateX(-50%)'
            position='absolute'
            textAlign='center'
            top='20%'
            borderRadius='35px'
            backgroundColor='transparent'
            zIndex='1'
            width='80%'
            onClick={(event) => {event.stopPropagation();}}
          >
            <CustomGame top='0px' left='50%' transform='translateX(-50%)'/>
          </Box>
        </Box>
      }
    </Box>
    // jeśli jest zalogowany to na dole będzie profil z potencjalnym zapisem wszystkich gier które zagrał
  )
}