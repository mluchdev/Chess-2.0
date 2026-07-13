import React, {useState, useEffect, useRef} from 'react';
import './logForm.css';
import {Login} from './LogIn.js';
import {SignUp} from './Signup.js';
import { useNavigate } from 'react-router-dom';
import {useThemeContext} from '../Contexts/themeContext.js';
import { useLogContext } from '../Contexts/LogContext.js'
import {HomePage} from '../Home-page/HomePage.js'

const notFoundUserPrefix  = 'What'
const notFoundEmailPrefix = 'Your'

export const LoggingContainer = () => {
    const [user, setUser] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [created, setCreated] = useState(false);

    const navigate = useNavigate();

    const formRef = useRef(null);
    const signUpRef = useRef(null);

    const LogContext = useLogContext();
    const theme = useThemeContext();

    useEffect(() => {
        if(created) {
            setTimeout(() => {
                LogContext.setLogState({option: 'Log In'});
                setCreated(false);
            }, 2000);
        } else if(LogContext.logState.logInfo?.startsWith(notFoundUserPrefix) || LogContext.logState.logInfo?.startsWith(notFoundEmailPrefix)) {
            setTimeout(() => {
                LogContext.setLogState({logInfo: ''})
            }, 2000)
        } else if(LogContext.logState.logInfo === 'User found') {
            setTimeout(() => {
                navigate('/') 
            }, 1000);
        }
    }, [LogContext.logState.logInfo, created]);

    return (
        <>
            <div className={LogContext.logState.logInfo === 'User found' ? "home-container" : "Die-trash"}>
                <HomePage/>
            </div>
            <div className="login-container" style={{height: window.innerHeight, backgroundColor: theme.isBright ? 'rgb(160, 170, 160)' : '#0a0e27'}}>
                {(LogContext.logState.logInfo?.startsWith(notFoundUserPrefix) || LogContext.logState.logInfo?.startsWith(notFoundEmailPrefix)) && 
                    <div
                        className="existing-user-info"
                        style={{height: `${signUpRef.current?.clientHeight}px`, top: `${signUpRef.current?.getClientRects()[0].top}px`}}
                    >
                        <h3> {LogContext.logState.logInfo} </h3>
                    </div>
                }
                <div className="response-box">
                    <button
                        style={{backgroundColor: theme.isBright ? 'rgb(0, 115, 175)' : 'rgb(0, 55, 115)', color: theme.isBright ? 'black' : 'wheat', opacity: LogContext.logState.option === 'Log In' ? '1' : '0.5'}}
                        onClick={() => LogContext.setLogState({option: 'Log In'})}
                    >
                        Log in
                    </button>
                    <button
                        ref={signUpRef}
                        style={{backgroundColor: theme.isBright ? 'rgb(209, 165, 10)' : 'rgb(150, 110, 0)', color: 'black', opacity: LogContext.logState.option === 'Sign Up' ? '1' : '0.5'}}
                        onClick={() => LogContext.setLogState({option: 'Sign Up'})}
                    >
                        Sign up
                    </button>
                </div>
                <div className="form-wrapper" ref={formRef}>
                    {LogContext.logState.option === 'Sign Up' ?
                        <SignUp
                            theme={theme}
                            setLogState={LogContext.setLogState}
                            setCreated={setCreated}
                            user={{value: user, set: setUser}}
                            email={{value: email, set: setEmail}}
                            password={{value: password, set: setPassword}}
                            confirmation={{value: confirmPassword, set: setConfirmPassword}}
                        />
                        :
                        <Login
                            theme={theme}
                            setLogState={LogContext.setLogState}
                            user={{value: user, set: setUser}}
                            password={{value: password, set: setPassword}}
                        />
                    }
                </div>
            </div>
        </>
    );
}