import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';

const Login = () => {

    const [info, setInfo] = useState(null);

    function onUserLogin(e) {
        e.preventDefault();

        const nameInput = document.getElementById('user') as HTMLInputElement;
        const pswdInput = document.getElementById('password') as HTMLInputElement;

        if (nameInput.value === '') return setInfo('Type in a username!');
        if (pswdInput.value === '') return setInfo('Type in a password!');

        console.log('Loggin in ', nameInput.value)

        fetch('/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'Application/JSON' },
            body: JSON.stringify({ username: nameInput.value, password: pswdInput.value })
        })
            .then(response => response.json())
            .then(data => {
                switch (data) {
                    case 'unkUser':
                        setInfo('User not found!');
                        nameInput.value = '';
                        pswdInput.value = '';
                        break;
                    case 'notMatching':
                        setInfo('Wrong password!');
                        pswdInput.value = '';
                        break;
                    case 'success':
                        <Redirect to='/user' />
                        break;
                    default:
                        throw new Error('Invalid Login: Server ERROR');
                }
            })
            .catch((error) => {
                console.error('Error when POST-fetching for login: ', error);
            })
    }

    return (
        <div className='login-wrapper'>
            <div className='logo'>(Logo image will go here)</div>
            {/* <div className='logo-caption'>A visualization tool for Kafka consumer metrics</div> */}

            <div className='login-container'>
                <h3>Log in to deKaf</h3>
                <hr />
                <div className='login-signup-form'>
                    <input id='user' name='user' placeholder='Username' type='text' />
                    <br />
                    <input id='password' name='password' placeholder='Password' type='password' />
                    <br />
                    <button id='login-submit' onClick={onUserLogin}>Log in</button>
                </div>
                <div className='info'>{info}</div>
            </div>

            <div className='new-user'>New to deKaf? <Link to='/about'>Learn more</Link> or <Link to='/signup'>create an account</Link>.</div>
        </div>
    )
}

export default Login;