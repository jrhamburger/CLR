import {useState} from "react";
import {supabase} from "../lib/supabase";

function SignIn () {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        const { error } = await supabase.auth.signInWithPassword(
            {email, password,}
        )

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Signed in."); //Delete once App.jsx connected after sign in
        }
    }

return (
    <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Sign in</h2>

        <input
            type = "email"
            placeholder = "Email"
            value = {email}
            onChange={(event) => setEmail(event.target.value)} 
            required
        />

        <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />

        <button type="submit">Sign In</button>

        {message && <p>{message}</p>}
    </form>
) 
}
export default SignIn;