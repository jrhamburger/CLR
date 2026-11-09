# CLR
Team project for CSC3100
Team Members: Andy Cai, Jonathan Resendiz

We're creating a customizable music-collection web app where users can explore approved music, organize songs into themed collections or playlists, tag and favorite songs, and personalize the look of their library. It will have a playful and interactive UI. Users will be able to upload their own music and the app will have the full capabilities of a music player.

## Access Control (TE6)
These diagrams show how CLR handles authentication and authorization. Supabase
Auth hashes passwords with bcrypt and issues a JWT on sign in; the frontend
stores that token and sends it with every API request. Authorization is enforced
by PostgreSQL Row Level Security rather than backend middleware. The database
checks `auth.uid()` against row ownership on each query, so a client calling the
API directly is filtered the same as one using our UI.

<img width="5985" height="1222" alt="Sequence diagrams for sign up, sign in, and protected endpoint access" src="https://github.com/user-attachments/assets/20fd050d-c0f5-4491-8819-611037dc720a" />
