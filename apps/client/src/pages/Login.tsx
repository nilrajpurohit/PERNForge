import { FormEvent, useState } from 'react';
import { login } from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const data = await login(email, password);
      setMessage(`Logged in! Access token length ${data.accessToken.length}`);
    } catch (error) {
      setMessage('Login failed.');
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: 4, marginBottom: 12 }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: 4, marginBottom: 12 }}
          />
        </label>
        <button type="submit" style={{ padding: '8px 16px' }}>
          Log In
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
