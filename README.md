# UCSC CSE Association

### Overview 
- This repository contains a containerized N-tier web application
- This project seeks to be an early prototype for our organizational website

### Example

## Getting Started

### Requirements
- Git
- Docker


### Instructions
1. Clone the repository 
     
    ```Console
    git clone https://github.com/Shawn-Armstrong/UCSC-CSE-Association.git
    ```
2. Start the containers:
   
    ```
    docker-compose up
    ```
3. Interact with the containers:
   - Frontend is hosted at http://localhost:3000/
   - Backend is listening on http://localhost:5000/
   - Database is listening on port 5432 with credentials `username=user`, `password=password`

## Technical Details / Features

### Overview
- Frontend use JavaScript's Vuejs framework in conjunction with Vuetify 3.X UI framework hosted on port 3000
- Backend uses JavaScript's Nodejs runtime in conjunction with Expressjs web application framework listening on port 5000
- Database is a PostgreSQL instance listening in port 5432 with credentials `user=user`, `password=password`

### Register

```mermaid
sequenceDiagram
  Client->>Client: 1. Render Register component at /register route<br>2. Collect new user information
  Client->>Server: 1. Request, POST, /register, payload = user information
  Server->>Server: 1. Receive / extract user information from request object<br>2. Create query to check if username / email are free
  Server->>Database: Send query
  Database->>Database: Execute query
  Database->>Server: Send query results
  Server->>Server: Generate 
```


<!-- ```mermaid
sequenceDiagram
  Client->>Server: Hello John, how are you?
  alt Event2
      Server->>Server: Fight against hypochondria
  end
  Note right of Server: Rational thoughts!
  Server->>Client: Great!
  Server->>Database: How about you?
  alt Event3
      Server->>Server: fdd
  end
  Database->>Server: Jolly good!
```
 -->


<!-- 
### Register

### Verify e-mail

### Resend verification

### Login

### Reset password

### Logout

### Profile

### Transitions








<!-- 

### Features
- [X] Frontend container hot module reloading *(HMR)* support
- [X] Backend container nodemon support
- [X] Frontend transitions using animate.css
- [X] System register account capabilities
  ### Details
  - Frontend has a register component implementation rendered in register view
  - register component contains a forum for parameter collection
  - register component sends HTTP request message containing parameter payload to backend on submit event
  - Backend has a register route that'll handle HTTP request messages 
  - Route extracts registration parameters
  - Password is salted then hashed
  - Verification token is generated 
  - All Parameters are stored in database
  - Verification email containing token is sent to the end-user
- [X] System verify e-mail capabilities
  ### Detials
  - After registration, an email is sent to the end-user containing a hyperlink
  - Hyperlink redirects to frontend with verification token as a parameter
  - Frontend implements EmailVerification component rendered in the EmailVerification view
  - After navigating to EmailVerification, component will extract token
  - After extraction, EmailVerification component will initiate AJAX call to backend with token payload
  - Backend will receive request at endpoint `verify-email`
  - Backend will extract token from request object
  - Backend will query database for token; if found, it'll update validation field of related user to true
- [X] System login capabilities
  ### Details
  - Frontend implements Login component rendered in Login view
  - Login component contains a forum for parameter collection
  - Login component sends HTTP request message containing parameter payload to backend on submit event
  - Backend receives request message at login endpoint
  - Backend extracts parameters from request object
  - Backend queries database with parameters
  - If parameters exist and validation is true then generate JWT token and send response back to frontend
  - Frontend will receive response. 
  - If token then cache token and redirect to profile; otherwise, display error.
- [X] System authenticate routes capabilities
  ### Details
  - Routes stored in router contain meta data tagging them as sensitive
  - Sensitive routes require a JWT to be cache in browser
  - If JWT is cache, allow navigation; otherwise, redirect to login. 
- [X] Frontend responsive video
  ### Details
  - Old video has an encoding issue which was resolved --> -->