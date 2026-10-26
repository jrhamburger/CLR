import { supabase } from 'supabase.js';
import catalogRoutes from "./routes/catalogRoutes.js";

app.get('/users', async (req, res) => {
    const { data, error } = await supabase.from(users).select('*');
    if (error) 
        return res.status(500).json({ error: error.message });
    res.json(data);
});

app.use("/api/catalog", catalogRoutes);
