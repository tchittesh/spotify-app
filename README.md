## Inspiration
We love music. But there's always that awkward moment when you can't decide what to play next for your group of friends with diverse tastes. Taste.blend() is built to solve that problem and help you make new, unexpected connections with your friends over mutually enjoyable music.

## What it does
Taste.blend() uses the spotify WebAPI to fetch users' song preferences, followed artists, and playlist history to generate a group playlist. It takes into account the affinity--how much a user likes a certain track--and the genres of music to make weighed, accurate decisions. When the app is run, hosts create rooms and share the corresponding room code, which other members of the group use to join and listen. Everybody in the room has their preferences taken into account in creating the playlist.

## How we built it
Taste.blend() is a web app supported by Node.js, Express.js, jQuery, Javascript, and the Spotify WebAPI.
Our back-end was built using Node.js and Express.js to manage a directory of files storing key information for each room. Our front-end was built using HTML5-CSS-Javascript, with references to jQuery to handle http requests to the Spotify WebAPI.

## Challenges we ran into
Spotify has a very secure API, so we had to run through extensive multi-step authorization processes in order to get our jQuery http requests up and running. We also ran into scenarios which required multiple asynchronous but interdependent http requests, which was difficult to manage sequentially.

## Accomplishments that we're proud of
Going from being a complete novice to finishing an app in Express.js and jQuery, two frameworks we had barely heard of in the past.
Getting the Spotify authentication process to actually work.
Despite being a small team, we managed to follow through with our idea.
And of course, pulling an all nighter to submit this 10 minutes before the deadline.

## What we learned
We learned that help can be found anywhere if you're willing to reach out! We got advice from experienced hackathon winners, MHacks mentors, and even some fellow hackers that sat next to us.

## What's next for Taste.blend()
In the future, we plan to implement more complex algorithms to comb the Spotify database along other dimensions to return more intelligent results. We also plan to use a web hosting service to make our application available for public use. One other issue is that the HTML rendering needs improvement for small screens such as smartphones.
