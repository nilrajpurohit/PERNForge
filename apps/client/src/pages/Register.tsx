import { FormEvent, useState } from 'react';
import { register } from '../api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const data = await register(name, email, password);
      setMessage(`Registered! Access token length ${data.accessToken.length}`);
    } catch (error) {
      setMessage('Unable to register.');
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: 4, marginBottom: 12 }}
          />
        </label>
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
          Register
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
