# Journey

### Overview
This document provides a high level summary of various features within this application. 

## `/register`

### Details
Diagram models technical details for creating an account implementation

### Daigram
```mermaid
sequenceDiagram
    client      ->> client  : 1. Navigate to http://localhost:3000/register <br> 2. Use form to collect register details
    client      ->> server  : POST, /register
    server      ->> server  : 1. Parse request object for register details <br> 2. Prepare read query
    server      ->> database: Send read query
    database    ->> database: Is username / email available?
    database    ->> server  : Available
    server      ->> server  : 1. Hash / salt password <br> 2. Generate verification token <br> 3. Prepare write query
    server      ->> database: Send write query
    database    ->> database: Add user details to Users table
    database    ->> server  : Acknowledge 
    server      ->> server  : Send verification email
    server      ->> client  : HTTP 201
    client      ->> client  : Redirect to /login
```

## `/login`

### Details
Diagram models technical details for login implementation

### Daigram

```mermaid
sequenceDiagram
    client      ->> client  : 1. Navigate to login <br> 2. Submit login details
    client      ->> server  : 1. HTTP POST, /login 
    server      ->> server  : 1. Parse request object for login details <br> 2. Prepare read query
    server      ->> database: 1. Send read query
    database    ->> database: User exists
    database    ->> server  : Send user details
    server      ->> server  : 1. Confirm user is verified <br> 2. Salt given password <br> 3. Confirm request password and stored password match <br> 4. Generate JWT
    server      ->> client  : HTTP 200, JWT cookie
    client      ->> client  : Redirect to /profile
```

## `/verify-email`

### Details
Diagram models technical details for email verification implementation

### Diagram

```mermaid
sequenceDiagram
    client      ->> client  : 1. Receives email <br> 2. Clicks embedded hyperlink <br> 3. Navigates to http://localhost:3000/verify-email?token=$<TOKEN> <br> 4. Call verifyEmail(TOKEN)
    client      ->> server  : HTTP GET, /verify-email
    server      ->> server  : 1. Parse request object for token <br> 2. Prepare write query
    server      ->> database: Send write query
    database    ->> database: Token exists, update user verification status
    database    ->> server  : Acknowledge, 1
    server      ->> client  : HTTP 200 
    client      ->> client  : Display success
```