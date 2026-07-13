import React, {useState} from 'react'
import './logForm.css'


export const Login = ({theme, setLogState, user, password}) => {
    const userValidation = () => Boolean(user.value)
    const passValidation = () => Boolean(password.value)
    
    const [submitAnimate, setSubmitAnimate] = useState(0);
    const [userAnimation, setUserAnimation] = useState(true);
    const [passwordAnimation, setPasswordAnimation] = useState(true);
    const [wrongPass, setWrongPass] = useState(false);

    React.useEffect(() => {
        setUserAnimation( passValidation() )
        setPasswordAnimation( passValidation() )
    }, []);

    const submit = async (event) => { // checking if backend has that record
        event.preventDefault();        

        let response = null;
        if(user.value.includes('@')) { // email query
            response = await fetch(`http://localhost:5500/get-user?email=${encodeURIComponent(user.value)}&password=${encodeURIComponent(password.value)}`, {
                method: 'GET',
            });
        } else { // in production it's gonna be changed
            response = await fetch(`http://localhost:5500/get-user?user=${encodeURIComponent(user.value)}&password=${encodeURIComponent(password.value)}`, {
                method: 'GET',
            })
        }
        
        if(!response.ok) {
            console.error('Something went wrong with the response')
            return ;
        }

        const data = await response.json();

        if(data.message === 'User found') {
            setLogState({userInfo: data.userInfo, logInfo: data.message})
            setWrongPass(false);
        }
        else if(data.message === 'User not found or wrong password') {
            setLogState({logInfo: 'Wrong password or username'})
            setWrongPass(true);
        }
    }
    // if submit was successful then login context is changed and user goes to the 
    // landing site

    return (
        <form 
            style={{backgroundColor: theme.isBright ? "rgb(0, 115, 175)" : 'rgb(0, 55, 115)'}}
            className="form-class"
            onSubmit={(event) => submit(event)}
        >
            <div
                className='data-not-correct-communicate'
                style={{visibility: wrongPass ? 'visible' : 'hidden'}}
            >
                <h2> Gambit rejected! Try different login. </h2>
            </div>
            <div 
                className={`gradient ${!userAnimation ? 'gradient-animation-infinite' : 'gradient-animation-finite'}`}
                style={{margin: '0px 23px 23px 23px'}}
            >
                <input 
                    type="text"
                    id="login-name"
                    name="login-name"
                    className={`${theme.isBright ? 'login-white-theme-input' : 'login-black-theme-input'}`}
                    placeholder='Username or email'
                    onClick={() => setUserAnimation(false)}
                    onBlur={() => setUserAnimation( userValidation() )}
                    value={user.value}
                    onChange={(event) => user.set(event.target.value)}
                />
            </div>
            <br/>
            <div className={`gradient ${!passwordAnimation ? 'gradient-animation-infinite' : 'gradient-animation-finite'}`}>
                <input 
                    type="password"
                    id="login-password"
                    className={`${theme.isBright ? 'login-white-theme-input' : 'login-black-theme-input'}`}
                    placeholder='Password'
                    onClick={() => setPasswordAnimation(false)}
                    onBlur={() => setPasswordAnimation( passValidation() )}
                    value={password.value}
                    onChange={(event) => password.set(event.target.value)}
                /> 
            </div>
            <br/>
            <button
                onMouseEnter={() => setTimeout(setSubmitAnimate(prevValue => prevValue + 1), 200)}
                onMouseLeave={() => setSubmitAnimate(prevValue => prevValue + 1)}
                className={submitAnimate > 0 ? (submitAnimate%2 === 1 ? 'getBiggerAnimation' : 'getSmallerAnimation'): ''}
            > Submit </button> <br/>
        </form>
    );
}