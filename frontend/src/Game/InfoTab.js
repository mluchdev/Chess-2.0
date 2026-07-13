import React from 'react';
import { useLogContext } from '../Contexts/LogContext';
import { useThemeContext } from '../Contexts/themeContext';
import { useGameContext } from '../Contexts/gameContext';

export let timeControl = null;

const InfoTab = ({height, timeFormat}) => {
    const {logState: {userInfo, opponent, isUserWhite}} = useLogContext();
    const {gameEvents, setGameEvents, moveHistory} = useGameContext();
    const theme = useThemeContext();
    
    // time related variables
    const minutesTime = Number(timeFormat.split(' ')[0]);
    const increment = Number(timeFormat.split(' ')[1]);

    // user times
    const [userTime, setUserTime] = React.useState(minutesTime * 60 * 1000);
    const [opponentTime, setOpponentTime] = React.useState(minutesTime * 60 * 1000);

    React.useEffect(() => { // called each move
        if( isUserWhite === gameEvents.isWhiteToMove ) {
            timeControl = (delay) => setUserTime(prev => prev - delay + increment);
        } else {
            timeControl = (delay) => setOpponentTime(prev => prev - delay + increment);
        }
    }, [setOpponentTime, setUserTime, isUserWhite, gameEvents.isWhiteToMove, increment]);

    React.useEffect(() => {
        if (moveHistory.current.length === 0) return;
    
        const isUserTurn = isUserWhite === gameEvents.isWhiteToMove;
        const currentTime = isUserTurn ? userTime : opponentTime;
        const setTime = isUserTurn ? setUserTime : setOpponentTime;
    
        if (currentTime <= 0) {
            setTime(0);
            setGameEvents({...gameEvents, endOfTime: true});
            return;
        }
    
        // Store initial values
        const startTime = performance.now();
        const initialTime = currentTime;
        let frameId;
    
        function animate() {
            const elapsed = performance.now() - startTime;
            const newTime = Math.max(0, initialTime - elapsed);
            
            // Update less frequently when time is > 20 seconds
            if ( newTime > 20_000 && isUserWhite === gameEvents.isWhiteToMove ) {
                setTime(newTime);
                frameId = setTimeout(() => {
                    requestAnimationFrame(animate);
                }, 1000);
            } else if( isUserWhite !== gameEvents.isWhiteToMove ) {
                // More precise updates for last 20 seconds
                setTime(newTime);
                frameId = requestAnimationFrame(animate);
            }
        }
    
        frameId = requestAnimationFrame(animate);
    
        return () => cancelAnimationFrame(frameId);
    }, [gameEvents.isWhiteToMove, isUserWhite, moveHistory]);

    const container = {
        display: 'flex',
        flexDirection: 'column',
        padding: '0 10px 0 10px',
        margin: '0 1% 0 1%',
        position: 'relative',
        width: '20%',
        maxWidth: '360px',
        minWidth: '200px',
        height: '100%',
        userSelect: 'none',
    };
    
    const tabStyle = {
        display: 'flex',
        position: 'absolute',
        flexDirection: 'column',
        border: `1px ${theme.isBright ? 'solid black' : 'dotted white'}`,
        borderRadius: '10px',
        left: '30px',
        right: '30px',
        padding: '10px',
        boxSizing: 'border-box'
    };
    
    const captionContainer = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        color: `${theme.isBright ? 'black' : 'white'}`,
        width: '100%',
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    };
    
    const playerStyle = {
        bottom: '0px',
    };
    
    const opponentStyle = {
        top: '0px',
    };
    
    const headingStyle = {
        margin: 0,
        padding: 0,
        flexShrink: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    };

    const clock = {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        borderRadius: '10px',
    }

    const number = {
        width: 'calc(25% - 1px)',
    }

    const TimeToComponent = (timeState) => {
        let timeOnLeft, timeOnRight, timeTrouble = false;

        if( timeState < 20*1000 ) {
            timeTrouble = true;
            timeOnLeft = Math.floor(timeState / 1000);  // seconds
            timeOnRight = Math.floor(timeState % 1000); // miliseconds
        } else {
            timeOnLeft = Math.floor(timeState / (60 * 1000)); // minutes
            timeOnRight = timeState - timeOnLeft * 60 * 1000; // seconds
        }

        return ( // tak długość na 4-ish
            <div style={{...clock, backgroundColor: `${timeTrouble ? 'red' : ''}`}}>
                <div style={number}>
                    {Math.floor(timeOnLeft / 10)}
                </div>
                <div style={number}>
                    {timeOnLeft % 10}
                </div>
                <div style={{...number, width: '4px'}}>
                    {timeTrouble ? '.' : ':'}
                </div>
                <div style={number}>
                    {timeTrouble ? Math.floor((timeOnRight % 1000) / 100) : Math.floor(timeOnRight / 10000)}
                </div>
                <div style={number}>
                    {timeTrouble ? Math.floor((timeOnRight % 100) / 10) : Math.floor(timeOnRight / 1000) % 10}
                </div>
            </div>
        )
    }

    return <div style={{...container, height: `${height}px`}}>
        <div style={{...tabStyle, ...playerStyle}}>
            <div style={captionContainer}>
                <h2 style={headingStyle}>{userInfo.user}</h2>
                <h2 style={headingStyle}>{userInfo.rating}</h2>
            </div>
            <div style={clock}>
                {TimeToComponent(opponentTime)}
            </div>
        </div>
        <div style={{...tabStyle, ...opponentStyle}}>
            <div style={clock}>
                {TimeToComponent(userTime)}
            </div>
            <div style={captionContainer}>
                <h2 style={headingStyle}>{opponent.user}</h2>
                <h2 style={headingStyle}>{opponent.rating}</h2>
            </div>    
        </div>
    </div>;
}

export default InfoTab;