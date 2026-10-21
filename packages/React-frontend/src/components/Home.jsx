import { supabase } from "../lib/supabase"
import { useState, useEffect } from "react";

function Home({ session }){
    const [username, setUsername] = useState("");

    //Fetching the Username from personal.users.username
    useEffect(() => {
        supabase
            .from("users")
            .select("user_name")
            .eq("user_id", session.user.id)
            .single()
            .then(({ data }) => setUsername(data?.user_name ?? ""));
        }, [session]);

    return (
        <div>
            <h2>Welcome, {username}</h2>
        </div>
    );
}


export default Home;