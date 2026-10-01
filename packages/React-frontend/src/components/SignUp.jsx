import { useState } from "react";
import { supabase } from "../lib/supabase";

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Check your email to confirm your account.");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create an account</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
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

            <button type="submit">Sign up</button>

            {message && <p>{message}</p>}
        </form>
    );
}

export default SignUp;